import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getCurrentUser } from "../../../../../controllers/authController";
import { createOrderFromCart } from "../../../../../controllers/orderController";
import { connectToDatabase } from "../../../../../lib/mongodb";
import Order from "../../../../../models/Order";
import Payment from "../../../../../models/Payment";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json({ success: false, message: "Stripe is not configured on the server." }, { status: 500 });
    }

    const user = await getCurrentUser();
    const { sessionId } = await request.json();
    if (!sessionId) {
      return NextResponse.json({ success: false, message: "Stripe session is missing." }, { status: 400 });
    }

    const stripe = new Stripe(stripeKey);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.mode !== "payment") {
      return NextResponse.json({ success: false, message: "Invalid Stripe checkout session." }, { status: 400 });
    }
    if (session.metadata?.userId !== user._id.toString()) {
      return NextResponse.json({ success: false, message: "This payment does not belong to your account." }, { status: 403 });
    }
    if (session.payment_status !== "paid") {
      return NextResponse.json({ success: false, message: "Payment has not been completed." }, { status: 400 });
    }

    await connectToDatabase();

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

    const billingDetails = JSON.parse(session.metadata?.billingDetails || "{}");
    const customerName = `${user.firstName} ${user.lastName || ""}`.trim();
    const order = await createOrderFromCart({
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

    await Payment.create({
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
    });

    await stripe.checkout.sessions.update(sessionId, {
      metadata: { ...session.metadata, orderId: order._id.toString() },
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Stripe payment completion error:", error);
    return NextResponse.json({ success: false, message: error.message || "Unable to complete payment." }, { status: error.statusCode || 500 });
  }
}
