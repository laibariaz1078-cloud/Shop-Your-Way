"use client";

import TopBar from "../../components/TopBar";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import WishlistGrid from "../../components/WishlistGrid";
import ProductCard from "../../components/ProductCard";
import { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { getBuyerOnlyMessage, isBuyerRole } from "../../lib/permissions";
import { showModal } from "../../lib/modal";

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [justForYouProducts, setJustForYouProducts] = useState([]);
  const [toastMessage, setToastMessage] = useState("");
  const [pendingAddToCartId, setPendingAddToCartId] = useState(null);
  const [addedProductIds, setAddedProductIds] = useState([]);
  const { refreshWishlistItems, user } = useAppContext();
  const isRestrictedBuyerRole = !!user && !isBuyerRole(user.role);

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

      setWishlistItems((prevItems) => prevItems.filter((item) => String(item.id) !== String(productId)));
      await refreshWishlistItems();
      window.dispatchEvent(new CustomEvent("wishlist:updated"));
    } catch (error) {
      console.error("Remove wishlist item failed", error);
    }
  };

  const handleAddToCartFromWishlist = async (product) => {
    const productId = product?.id || product?._id || product?.productId;
    if (!productId) return;

    if (user && !isBuyerRole(user.role)) {
      await showModal({
        title: "Buyer access required",
        message: getBuyerOnlyMessage(user.role),
      });
      return;
    }

    const normalizedProductId = String(productId);
    setPendingAddToCartId(normalizedProductId);
    setAddedProductIds((prev) => (prev.includes(normalizedProductId) ? prev : [...prev, normalizedProductId]));

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          productId,
          quantity: 1,
          unitPrice: Number(product.basePrice ?? product.price ?? 0),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to add to cart");

      await refreshWishlistItems();
      setToastMessage("Added to cart");
      window.dispatchEvent(new CustomEvent("cart:updated"));
      window.dispatchEvent(new CustomEvent("wishlist:updated"));

      window.setTimeout(() => {
        setToastMessage("");
        setAddedProductIds((prev) => prev.filter((id) => String(id) !== normalizedProductId));
      }, 1700);
    } catch (error) {
      console.error("Add wishlist item to cart failed", error);
      setAddedProductIds((prev) => prev.filter((id) => String(id) !== normalizedProductId));
    } finally {
      window.setTimeout(() => {
        setPendingAddToCartId((currentId) => (String(currentId) === normalizedProductId ? null : currentId));
      }, 300);
    }
  };

  useEffect(() => {
    const syncWishlist = () => {
      void loadWishlistItems();
    };

    const timer = window.setTimeout(() => {
      void loadWishlistItems();
    }, 0);

    window.addEventListener("wishlist:updated", syncWishlist);

    fetch("/api/products?limit=4")
      .then((response) => response.json())
      .then((data) => setJustForYouProducts(data.success ? data.products : []))
      .catch(() => setJustForYouProducts([]));

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("wishlist:updated", syncWishlist);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-black">
      <TopBar />
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-5">
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 rounded-lg bg-[#DB4444] px-4 py-2 text-sm font-medium text-white shadow-lg">
            {toastMessage}
          </div>
        )}

        <div className="mb-10 flex items-center justify-between">
          <h1 className="text-xl font-normal">
            Wishlist ({wishlistItems.length})
          </h1>
          <button className="rounded-sm border border-black/30 px-10 py-3 text-base font-medium transition-colors hover:bg-black hover:text-white">
            Move All To Bag
          </button>
        </div>

        <WishlistGrid
          products={wishlistItems}
          onRemove={handleRemoveWishlistItem}
          onAddToCart={handleAddToCartFromWishlist}
          addedProductIds={addedProductIds}
          pendingProductId={pendingAddToCartId}
          isRestrictedBuyerRole={isRestrictedBuyerRole}
        />

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