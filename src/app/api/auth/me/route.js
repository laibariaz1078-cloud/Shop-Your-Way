import { NextResponse } from "next/server";
import { getAuthUser } from "../../../../lib/auth";

export async function GET() {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl || "",
      },
    });
  } catch (error) {
    console.error("Me route error:", error);
    return NextResponse.json({ success: false, user: null }, { status: 500 });
  }
}
