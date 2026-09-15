"use client";

import { useRouter } from "next/navigation";

export default function CartTotal({
  subtotal,
  shipping = "Free",
  ctaLabel,
  href = "/checkout",
}) {
  const total = typeof shipping === "number" ? subtotal + shipping : subtotal;
  const router = useRouter();

  return (
    <div className="w-full rounded-sm border border-black px-6 py-8">
      <h3 className="mb-6 text-xl font-medium">Cart Total</h3>

      <div className="flex items-center justify-between border-b border-black/20 pb-4 text-base">
        <span>Subtotal:</span>
        <span>${subtotal}</span>
      </div>

      <div className="flex items-center justify-between border-b border-black/20 py-4 text-base">
        <span>Shipping:</span>
        <span>{shipping === "Free" ? "Free" : `$${shipping}`}</span>
      </div>

      <div className="flex items-center justify-between py-4 text-base">
        <span>Total:</span>
        <span>${total}</span>
      </div>

      <div className="mt-4 flex justify-center">
        <button
          type="button"
          onClick={() => router.push(href)}
          className="rounded-sm bg-[#DB4444] px-12 py-4 text-base font-medium text-white transition-opacity hover:opacity-90"
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}