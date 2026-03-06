"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/useToast";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { openCart, items } = useCart();
  const toast = useToast();

  function handleLogout() {
    logout();
    toast("Logged out successfully", "info");
  }

  function linkClass(href: string) {
    const active =
      pathname === href || pathname.startsWith(href + "/");

    return `relative text-sm font-medium transition-colors duration-200 group ${
      active ? "text-black" : "text-neutral-500 hover:text-black"
    }`;
  }

  const underline = (href: string) => {
    const active = pathname === href || pathname.startsWith(href + "/");
    return (
      <span
        className={`absolute -bottom-1 left-0 h-[2px] bg-black rounded-full transition-all duration-200 ${
          active ? "w-full" : "w-0 group-hover:w-full"
        }`}
      />
    );
  };

  return (
    <header className="border-b border-neutral-200 bg-white sticky top-0 z-30">
      <div className="container-system flex items-center justify-between h-16">

        {/* Logo */}
        <Link
          href="/"
          className="text-lg font-extrabold tracking-tight hover:opacity-80 transition-opacity"
        >
          PrintingMuse
        </Link>

        {/* Category Links */}
        {!pathname.startsWith("/admin") && (
          <nav className="hidden md:flex gap-8 text-sm font-medium">

            <Link href="/products/keychains" className={linkClass("/products/keychains")}>
              Keychains
              {underline("/products/keychains")}
            </Link>

            <Link href="/products/figurines" className={linkClass("/products/figurines")}>
              Figurines
              {underline("/products/figurines")}
            </Link>

            <Link href="/products/utility" className={linkClass("/products/utility")}>
              Utility
              {underline("/products/utility")}
            </Link>

            {user?.role === "admin" && (
              <Link href="/admin" className={linkClass("/admin")}>
                Admin
                {underline("/admin")}
              </Link>
            )}

          </nav>
        )}

        {/* Right Side */}
        <div className="flex items-center gap-5 text-sm">

          {!user && (
            <Link
              href="/login"
              className="text-neutral-500 hover:text-black transition-colors duration-200 font-medium"
            >
              Login
            </Link>
          )}

          {user && (
            <>
              <Link href="/orders" className={linkClass("/orders")}>
                Orders
                {underline("/orders")}
              </Link>
              <button
                onClick={handleLogout}
                className="text-neutral-500 hover:text-black transition-colors duration-200 font-medium"
              >
                Logout
              </button>
            </>
          )}

          <button
            onClick={openCart}
            className="relative flex items-center gap-1.5 text-neutral-500 hover:text-black transition-colors duration-200 font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            Cart
            {items.length > 0 && (
              <span className="absolute -top-2 -right-3 bg-black text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {items.length}
              </span>
            )}
          </button>

        </div>

      </div>
    </header>
  );
}