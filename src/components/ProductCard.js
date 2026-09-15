"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Heart, Eye, Star } from "lucide-react";
import { getProductImage } from "../lib/productImage";

const makeSlug = (value) =>
  String(value || "product")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "product";

export default function ProductCard({ product, onWishlistChange }) {
  const {
    name,
    image: productImage,
    images,
    slug,
    price,
    oldPrice,
    discountPercent,
    rating = 5,
    reviewCount = 0,
    isNew,
    colors,
    addToCartVisible = true,
    isWishlisted = false,
  } = product;

  const productId = product._id || product.id;

  const [isLiked, setIsLiked] = useState(isWishlisted);
  const [isHeartHovered, setIsHeartHovered] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const [wishlistMessage, setWishlistMessage] = useState("");
  const [wishlistPending, setWishlistPending] = useState(false);

  const productSlug = slug || makeSlug(name);
  const image = getProductImage({ ...product, image: productImage, images });
  const validImageSrc =
    image &&
    (image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("/"))
      ? image
      : "/product1.png";

  const handleActionClick = (e, callback) => {
    e.preventDefault();
    e.stopPropagation();
    if (callback) callback();
  };

  const handleWishlistToggle = async () => {
    if (!productId || wishlistPending) return;

    setWishlistPending(true);
    try {
      if (isLiked) {
        const response = await fetch(`/api/wishlist?productId=${productId}`, {
          method: "DELETE",
          credentials: "include",
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Unable to remove from wishlist");
        setIsLiked(false);
        setWishlistMessage("Removed");
        onWishlistChange?.(productId, false);
      } else {
        const response = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ productId }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Unable to add to wishlist");
        setIsLiked(true);
        setWishlistMessage("Saved");
        onWishlistChange?.(productId, true);
      }
      setTimeout(() => setWishlistMessage(""), 1600);
    } catch (error) {
      setWishlistMessage(error.message || "Unable to update wishlist");
      setTimeout(() => setWishlistMessage(""), 2200);
    } finally {
      setWishlistPending(false);
    }
  };

  const addProductToCart = async () => {
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1, unitPrice: product.basePrice ?? price }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to add to cart");
      window.dispatchEvent(new CustomEvent("cart:updated"));
      setCartMessage("Added");
      setTimeout(() => setCartMessage(""), 1800);
    } catch (error) {
      setCartMessage(error.message);
      setTimeout(() => setCartMessage(""), 2500);
    }
  };

  return (
    <div className="group w-full">
      <Link href={`/product/${productSlug}`} className="block">
        <div className="relative flex h-[230px] w-[250px] items-center justify-center overflow-hidden  bg-[#F5F5F5] p-3">
          <div className="absolute left-3 top-3 z-10 flex flex-col gap-1">
            {discountPercent > 0 && (
              <span className="rounded bg-[#DB4444] px-2.5 py-1 text-[12px] font-normal text-white">
                -{discountPercent}%
              </span>
            )}
            {isNew && (
              <span className="rounded bg-[#00FF66] px-2.5 py-1 text-[12px] font-medium text-black">
                NEW
              </span>
            )}
          </div>

          <div className="absolute right-3 top-3 z-10 flex flex-col gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <button
              type="button"
              aria-label="Add to wishlist"
              disabled={wishlistPending}
              onClick={(e) => handleActionClick(e, handleWishlistToggle)}
              onMouseEnter={() => setIsHeartHovered(true)}
              onMouseLeave={() => setIsHeartHovered(false)}
              className={`flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white transition-all duration-200 hover:bg-[#DB4444] disabled:opacity-60 ${
                isLiked ? "text-[#DB4444]" : "text-black"
              }`}
            >
              <Heart
                className={`h-4 w-4 ${
                  isHeartHovered
                    ? "fill-current text-white"
                    : isLiked
                    ? "fill-[#DB4444] text-[#DB4444]"
                    : "text-black"
                }`}
              />
            </button>

            <button
              type="button"
              aria-label="Quick view"
              onClick={(e) => handleActionClick(e)}
              className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white text-black transition-all duration-200 hover:bg-[#DB4444] hover:text-white"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>

          <div className="relative h-[150px] w-full">
            <Image
              src={validImageSrc}
              alt={name}
              fill
              sizes="(max-width: 640px) 50vw, 250px"
              className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          {addToCartVisible && (
            <button
              type="button"
              onClick={(e) => handleActionClick(e, addProductToCart)}
              className="absolute inset-x-0 bottom-0 z-20 flex h-9 w-full items-center justify-center bg-black text-xs font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            >
              {cartMessage || "Add To Cart"}
            </button>
          )}

          {wishlistMessage && (
            <div className="absolute inset-x-0 bottom-10 z-20 flex justify-center">
              <span className="rounded bg-black/80 px-2 py-1 text-[10px] font-medium text-white">
                {wishlistMessage}
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="mt-3 flex flex-col gap-1">
        <Link
          href={`/product/${productSlug}`}
          className="line-clamp-1 text-sm font-medium text-black hover:text-[#DB4444]"
        >
          {name}
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#DB4444]">${price}</span>
          {Number(oldPrice) > 0 && (
            <span className="text-sm font-medium text-gray-500 line-through">
              ${oldPrice}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className="h-3.5 w-3.5"
                fill={i < rating ? "#FFAD33" : "#D1D5DB"}
                stroke="none"
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-gray-500">
            ({reviewCount})
          </span>
        </div>

        {colors && colors.length > 0 && (
          <div className="flex items-center gap-1.5 pt-1">
            {colors.map((color, idx) => (
              <span
                key={idx}
                className="h-4 w-4 rounded-full border border-black p-[2px] cursor-pointer"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}