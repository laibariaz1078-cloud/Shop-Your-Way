import { NextResponse } from "next/server";
import dbConnect from "../../../../../lib/dbConnect";
import User from "../../../../../models/User";
import { getAuthUser } from "../../../../../lib/auth";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();

    await User.updateMany(
      { status: "suspended", suspensionType: "temporary", suspendedUntil: { $lte: new Date() } },
      { $set: { status: "active", suspensionType: "none", suspendedUntil: null, suspensionReason: "" } }
    );

    const customers = await User.find({ role: "customer" }).sort({ createdAt: -1 }).lean();
    const sellers = await User.find({ role: "seller" }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, customers, sellers });
  } catch (error) {
    console.error("Admin users GET error:", error);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}
