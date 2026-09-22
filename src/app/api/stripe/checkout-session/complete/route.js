import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getCurrentUser } from "../../../../../controllers/authController";
import { createOrderFromCart } from "../../../../../controllers/orderController";
import { connectToDatabase } from "../../../../../lib/mongodb";
import Order from "../../../../../models/Order";
import Payment from "../../../../../models/Payment";
import User from "../../../../../models/User";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json({ success: false, message: "Stripe is not configured on the server." }, { status: 500 });
    }

    const currentUser = await getCurrentUser().catch(() => null);
    const { sessionId } = await request.json();
    if (!sessionId) {
      return NextResponse.json({ success: false, message: "Stripe session is missing." }, { status: 400 });
    }

    const stripe = new Stripe(stripeKey);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.mode !== "payment") {
      return NextResponse.json({ success: false, message: "Invalid Stripe checkout session." }, { status: 400 });
    }

    const paymentCompleted = ["paid", "complete"].includes(session.payment_status) || session.status === "complete" || Number(session.amount_total || 0) > 0;
    if (!paymentCompleted) {
      return NextResponse.json({ success: false, message: "Payment has not been completed." }, { status: 400 });
    }

    const sessionUserId = session.metadata?.userId ? String(session.metadata.userId) : "";
    const sessionUserEmail = session.metadata?.userEmail || session.customer_email || session.customer_details?.email || "";

    if (currentUser && sessionUserId && String(currentUser._id) !== String(sessionUserId)) {
      return NextResponse.json({ success: false, message: "This payment does not belong to your account." }, { status: 403 });
    }

    await connectToDatabase();

    let user = currentUser;
    if (!user) {
      user = sessionUserId ? await User.findById(sessionUserId).lean() : await User.findOne({ email: sessionUserEmail }).lean();
    }

    if (!user) {
      return NextResponse.json({ success: false, message: "Unable to locate the user for this successful payment." }, { status: 404 });
    }

    if (session.metadata?.orderId) {
      const existingOrder = await Order.findById(session.metadata.orderId).lean();
      if (existingOrder) return NextResponse.json({ success: true, order: existingOrder });
    }

    const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
    if (paymentIntentId) {
      const existingPayment = await Payment.findOne({ paymentIntentId }).lean();
      if (existingPayment) {
        const existingOrder = await Order.findById(existingPayment.orderId).lean();
        if (existingOrder) return NextResponse.json({ success: true, order: existingOrder });
      }
    }

    const billingDetails = (() => {
      try {
        return JSON.parse(session.metadata?.billingDetails || "{}") || {};
      } catch (error) {
        return {};
      }
    })();
    const customerName = `${user.firstName} ${user.lastName || ""}`.trim();
    let order = null;

    const orderLookup = paymentIntentId ? await Order.findOne({ "payment.paymentIntentId": paymentIntentId }).lean() : null;
    if (orderLookup) {
      order = orderLookup;
    } else {
      order = await createOrderFromCart({
        userId: user._id,
        customerName,
        shippingAddress: billingDetails,
        billingAddress: billingDetails,
        payment: {
          method: "card",
          provider: "stripe",
          paymentIntentId,
          status: "captured",
          currency: session.currency,
          amount: (session.amount_total || 0) / 100,
        },
        status: "Paid",
      });
    }

    if (paymentIntentId) {
      await Payment.findOneAndUpdate(
        { paymentIntentId },
        {
          $setOnInsert: {
            orderId: order._id,
            userId: user._id,
            paymentIntentId,
            transactionId: session.id,
            method: "card",
            provider: "stripe",
            amount: (session.amount_total || 0) / 100,
            currency: session.currency || "usd",
            status: "captured",
            capturedAt: new Date(),
            providerResponse: { checkoutSessionId: session.id },
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    await stripe.checkout.sessions.update(sessionId, {
      metadata: { ...session.metadata, orderId: order._id.toString() },
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Stripe payment completion error:", error);
    return NextResponse.json({ success: false, message: error.message || "Unable to complete payment." }, { status: error.statusCode || 500 });
  }
}
