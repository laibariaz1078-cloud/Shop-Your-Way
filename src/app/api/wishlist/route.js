import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../controllers/authController";
import { getWishlist, addToWishlist, removeFromWishlist } from "../../../controllers/wishlistController";

export async function GET() {
  try {
    const user = await getCurrentUser();
    const wishlist = await getWishlist(user._id);
    const products = (wishlist?.items || []).map(({ productId }) => ({
      ...productId,
      id: String(productId._id),
      image: productId.images?.[0]?.url || "",
      price: productId.basePrice,
    }));
    return NextResponse.json({ success: true, wishlist: products });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Unable to load wishlist." },
      { status: error.statusCode || 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { productId } = await request.json();
    const user = await getCurrentUser();
    const wishlist = await addToWishlist({ userId: user._id, productId });
    return NextResponse.json({ success: true, wishlist }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Unable to add item to wishlist." },
      { status: error.statusCode || 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const user = await getCurrentUser();
    const wishlist = await removeFromWishlist({ userId: user._id, productId });
    return NextResponse.json({ success: true, wishlist });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Unable to remove item from wishlist." },
      { status: error.statusCode || 500 }
    );
  }
}
