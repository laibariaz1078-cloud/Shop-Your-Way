"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import TopBar from "../../components/TopBar";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Breadcrumb from "../../components/Breadcrumb";
import BillingForm from "../../components/BillingForm";
import OrderSummary from "../../components/OrderSummary";
import { getProductImage } from "../../lib/productImage";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [billingDetails, setBillingDetails] = useState({});

  useEffect(() => {
    const timer = setTimeout(async () => {
      const buyNowName = searchParams.get("name");
      const buyNowPrice = searchParams.get("price");

      if (buyNowName && buyNowPrice) {
        setOrderItems([{
          id: searchParams.get("productId") || buyNowName,
          name: buyNowName,
          image: getProductImage({ image: searchParams.get("image") }),
          price: Number(buyNowPrice) || 0,
          quantity: Number(searchParams.get("quantity")) || 1,
          color: searchParams.get("color") || undefined,
          size: searchParams.get("size") || undefined,
        }]);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/cart");
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Unable to load cart");
        setOrderItems((data.cart?.items || []).map((item) => ({
          id: item.productId?._id || item.productId,
          name: item.productId?.name || "Product",
          image: getProductImage(item.productId),
          price: Number(item.unitPrice?.$numberDecimal || item.unitPrice || item.productId?.basePrice || 0),
          quantity: item.quantity,
        })));
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-white font-sans text-black">
      <TopBar />
      <Navbar />

      <Breadcrumb
        items={[
          { label: "Account", href: "/account" },
          { label: "My Account", href: "/account" },
          { label: "Product", href: "/" },
          { label: "View Cart", href: "/cart" },
          { label: "CheckOut" },
        ]}
      />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-20">
        <div className="grid grid-cols-1 gap-16 pb-20 lg:grid-cols-2 lg:gap-28">
          <BillingForm values={billingDetails} onChange={(name, value) => setBillingDetails((previous) => ({ ...previous, [name]: value }))} />
          {loading ? <p>Loading order summary...</p> : error ? <p className="text-sm text-red-600">{error}</p> : <OrderSummary items={orderItems} billingDetails={billingDetails} />}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white p-10 text-black">Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}