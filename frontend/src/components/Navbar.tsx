"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { openCart } = useCart();

  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (user) fetchCartCount();
  }, [user]);

  async function fetchCartCount() {
    try {
      const res = await apiFetch("/cart");
      const count =
        res.data?.items?.reduce(
          (acc: number, item: any) => acc + item.qty,
          0
        ) || 0;

      setCartCount(count);
    } catch {
      setCartCount(0);
    }
  }

  return (
    <nav className="bg-white sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
        
        {/* Logo */}
        <Link
          href="/products"
          className="text-xl font-semibold tracking-tight"
        >
          Printing Muse
        </Link>

        {/* Right Side */}
        <div className="flex items-center gap-10 text-sm font-medium">

          <Link
            href="/products"
            className="hover:text-neutral-600 transition"
          >
            Catalog
          </Link>

          {/* Cart Icon */}
          <button
            onClick={openCart}
            className="relative hover:text-neutral-600 transition"
          >
            🛍

            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-black text-white text-xs px-2 py-[2px] rounded-full">
                {cartCount}
              </span>
            )}
          </button>

          {!user ? (
            <Link
              href="/login"
              className="hover:text-neutral-600 transition"
            >
              Login
            </Link>
          ) : (
            <button
              onClick={logout}
              className="text-neutral-500 hover:text-black transition"
            >
              Logout
            </button>
          )}
        </div>
      </div>

      {/* Subtle Divider */}
      <div className="border-b border-neutral-200"></div>
    </nav>
  );
}