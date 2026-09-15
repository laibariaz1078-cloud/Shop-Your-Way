"use client";

import TopBar from "../../components/TopBar";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import WishlistGrid from "../../components/WishlistGrid";
import ProductCard from "../../components/ProductCard";
import { useEffect, useState } from "react";

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [justForYouProducts, setJustForYouProducts] = useState([]);

  const loadWishlistItems = async () => {
    try {
      const response = await fetch("/api/wishlist", { credentials: "include" });
      const data = await response.json();
      setWishlistItems(data.success ? data.wishlist : []);
    } catch (error) {
      setWishlistItems([]);
    }
  };

  const handleRemoveWishlistItem = async (productId) => {
    try {
      const response = await fetch(`/api/wishlist?productId=${productId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to remove item from wishlist");
      }

      setWishlistItems((prevItems) => prevItems.filter((item) => item.id !== productId));
    } catch (error) {
      console.error("Remove wishlist item failed", error);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadWishlistItems();
    fetch("/api/products?limit=4")
      .then((response) => response.json())
      .then((data) => setJustForYouProducts(data.success ? data.products : []))
      .catch(() => setJustForYouProducts([]));
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-black">
      <TopBar />
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-5">
        <div className="mb-10 flex items-center justify-between">
          <h1 className="text-xl font-normal">
            Wishlist ({wishlistItems.length})
          </h1>
          <button className="rounded-sm border border-black/30 px-10 py-3 text-base font-medium transition-colors hover:bg-black hover:text-white">
            Move All To Bag
          </button>
        </div>

        <WishlistGrid products={wishlistItems} onRemove={handleRemoveWishlistItem} />

        <div className="mb-10 mt-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="h-10 w-5 rounded-sm bg-[#DB4444]" />
            <h2 className="text-xl font-normal">Just For You</h2>
          </div>
          <button className="rounded-sm border border-black/30 px-10 py-3 text-base font-medium transition-colors hover:bg-black hover:text-white">
            See All
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {justForYouProducts.map((product) => (
            <ProductCard
              key={product._id || product.id}
              product={product}
              onWishlistChange={loadWishlistItems}
            />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}