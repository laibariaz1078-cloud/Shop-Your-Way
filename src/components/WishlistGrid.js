"use client";

import Image from "next/image";
import { Trash2, ShoppingCart } from "lucide-react";

export default function WishlistGrid({ products = [], onRemove, onAddToCart }) {
  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-medium text-gray-500">Your wishlist is empty.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <div key={product.id} className="group flex flex-col">
          {/* Card Top Container */}
          <div className="relative flex h-[250px] w-[260] items-center justify-center rounded-sm bg-[#F5F5F5] p-6">
            {/* Discount Badge */}
            {product.discountPercent > 0 && (
              <span className="absolute left-3 top-3 z-10 rounded bg-[#DB4444] px-3 py-1 text-xs text-white">
                -{product.discountPercent}%
              </span>
            )}

            {/* Trash Action Button */}
            <button
              type="button"
              onClick={() => onRemove && onRemove(product.id)}
              aria-label="Remove item"
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-black transition-colors hover:bg-black hover:text-white"
            >
              <Trash2 className="h-4 w-4" />
            </button>

            {/* Transparent PNG Image Container */}
            <div className="relative h-[150px] w-[180px] transition-transform duration-300 group-hover:scale-105">
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 250px"
                className="object-contain drop-shadow-[0_8px_15px_rgba(0,0,0,0.1)]"
                priority
              />
            </div>

            {/* Static Black Add To Cart Button */}
            <button
              type="button"
              onClick={() => onAddToCart && onAddToCart(product)}
              className="absolute inset-x-0 bottom-0 flex h-10 w-full items-center justify-center gap-2 bg-black text-xs font-medium text-white transition-opacity hover:opacity-90"
            >
              <ShoppingCart className="h-4 w-4" />
              Add To Cart
            </button>
          </div>

          {/* Product Details */}
          <div className="mt-4 flex flex-col gap-2">
            <h3 className="truncate text-base font-medium text-black">
              {product.name}
            </h3>
            <div className="flex items-center gap-3 text-base font-medium">
              <span className="text-[#DB4444]">${product.price}</span>
              {product.oldPrice > 0 && (
                <span className="text-gray-400 line-through">
                  ${product.oldPrice}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );///
}