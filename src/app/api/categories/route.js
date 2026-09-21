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

    return NextResponse.json(
      { success: true, categories },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    return NextResponse.json(
      { success: true, categories: [] },
      { status: 200, headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }
}