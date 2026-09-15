import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/dbConnect";
import User from "../../../../models/User";
import { hashPassword, signToken, setAuthCookie } from "../../../../lib/auth";
import { verifyRecaptchaToken } from "../../../../lib/recaptcha";

export async function POST(request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, password, role, captchaToken } = body;

    if (!firstName || !email || !password) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    if (!captchaToken) {
      return NextResponse.json({ success: false, error: "Please complete the captcha" }, { status: 400 });
    }

    await verifyRecaptchaToken(captchaToken);

    await dbConnect();

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ success: false, error: "Email already registered" }, { status: 409 });
    }

    const allowedRoles = ["seller", "customer"];
    const finalRole = allowedRoles.includes(role) ? role : "customer";

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      firstName,
      lastName: lastName || "",
      email: email.toLowerCase(),
      password: hashedPassword,
      role: finalRole,
    });

    const token = signToken({ id: user._id.toString(), role: user.role });

    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );

    return setAuthCookie(response, token);
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Something went wrong" },
      { status: error.statusCode || 500 }
    );
  }
}