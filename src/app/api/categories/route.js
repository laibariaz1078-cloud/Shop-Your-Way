import { NextResponse } from "next/server";
import dbConnect from "../../../lib/dbConnect";
import Category from "../../../models/Category";

export async function GET() {
  try {
    await dbConnect();
    const categories = await Category.find({ isActive: true })
      .select("name slug parentId level sortOrder")
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error("Public categories GET error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to load categories" },
      { status: 500 }
    );
  }
}