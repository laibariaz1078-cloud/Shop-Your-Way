"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);

  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", { credentials: "include" });
      const data = await response.json();

      if (response.ok && data?.success && data.user) {
        const fullName = [data.user.firstName, data.user.lastName].filter(Boolean).join(" ") || data.user.name || "User";
        setIsAuthenticated(true);
        setUser({ ...data.user, fullName });
        return true;
      }

      return false;
    } catch (error) {
      return false;
    }
  }, []);

  const refreshCartCount = useCallback(async () => {
    try {
      const response = await fetch("/api/cart", { credentials: "include" });
      const data = await response.json();

      if (!response.ok) {
        setCartCount(0);
        return 0;
      }

      const items = data?.cart?.items || [];
      const totalItems = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
      setCartCount(totalItems);
      return totalItems;
    } catch (error) {
      setCartCount(0);
      return 0;
    }
  }, []);

  const refreshWishlistItems = useCallback(async () => {
    try {
      const response = await fetch("/api/wishlist", { credentials: "include" });
      const data = await response.json();

      if (!response.ok) {
        setWishlistIds([]);
        setWishlistCount(0);
        return [];
      }

      const ids = (Array.isArray(data?.wishlist) ? data.wishlist : [])
        .map((item) => String(item?.id || item?._id || item?.productId?._id || item?.productId || ""))
        .filter(Boolean);

      setWishlistIds(ids);
      setWishlistCount(ids.length);
      return ids;
    } catch (error) {
      setWishlistIds([]);
      setWishlistCount(0);
      return [];
    }
  }, []);

  const refreshWishlistCount = useCallback(async () => {
    const ids = await refreshWishlistItems();
    return ids.length;
  }, [refreshWishlistItems]);

  const toggleWishlistItem = useCallback(async ({ productId, isCurrentlyWishlisted }) => {
    const normalizedId = String(productId || "");

    if (!normalizedId) {
      return false;
    }

    try {
      const response = await fetch("/api/wishlist", {
        method: isCurrentlyWishlisted ? "DELETE" : "POST",
        credentials: "include",
        headers: !isCurrentlyWishlisted ? { "Content-Type": "application/json" } : undefined,
        body: !isCurrentlyWishlisted ? JSON.stringify({ productId: normalizedId }) : undefined,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Unable to update wishlist");
      }

      const ids = await refreshWishlistItems();
      window.dispatchEvent(new CustomEvent("wishlist:updated"));
      return ids.includes(normalizedId);
    } catch (error) {
      console.error("Wishlist toggle failed", error);
      return isCurrentlyWishlisted;
    }
  }, [refreshWishlistItems]);

  const refreshAll = useCallback(async () => {
    await Promise.all([refreshSession(), refreshCartCount(), refreshWishlistItems()]);
  }, [refreshSession, refreshCartCount, refreshWishlistItems]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      setCartCount(0);
      setWishlistIds([]);
      setWishlistCount(0);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refreshAll();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [refreshAll]);

  useEffect(() => {
    const handleCartUpdated = () => refreshCartCount();
    const handleWishlistUpdated = () => refreshWishlistItems();
    const handleAuthUpdated = () => refreshSession();

    window.addEventListener("cart:updated", handleCartUpdated);
    window.addEventListener("wishlist:updated", handleWishlistUpdated);
    window.addEventListener("auth:updated", handleAuthUpdated);

    return () => {
      window.removeEventListener("cart:updated", handleCartUpdated);
      window.removeEventListener("wishlist:updated", handleWishlistUpdated);
      window.removeEventListener("auth:updated", handleAuthUpdated);
    };
  }, [refreshCartCount, refreshSession, refreshWishlistItems]);

  const value = useMemo(
    () => ({
      isAuthenticated,
      user,
      cartCount,
      wishlistIds,
      wishlistCount,
      refreshSession,
      refreshCartCount,
      refreshWishlistItems,
      refreshWishlistCount,
      toggleWishlistItem,
      refreshAll,
      logout,
      setIsAuthenticated,
      setUser,
    }),
    [isAuthenticated, user, cartCount, wishlistIds, wishlistCount, refreshSession, refreshCartCount, refreshWishlistItems, refreshWishlistCount, toggleWishlistItem, refreshAll, logout]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }

  return context;
}
