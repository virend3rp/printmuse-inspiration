"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  function linkClass(href: string) {
    const active =
      pathname === href || pathname.startsWith(href + "/");

    return `transition hover:opacity-70 ${
      active ? "text-black font-semibold" : "text-neutral-600"
    }`;
  }

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="container-system flex items-center justify-between h-16">

        {/* Logo */}
        <Link
          href="/"
          className="text-lg font-extrabold tracking-tight"
        >
          PrintingMuse
        </Link>

        {/* Category Links */}
        {!pathname.startsWith("/admin") && (
          <nav className="hidden md:flex gap-6 text-sm font-medium">

            <Link
              href="/products/keychains"
              className={linkClass("/products/keychains")}
            >
              Keychains
            </Link>

            <Link
              href="/products/figurines"
              className={linkClass("/products/figurines")}
            >
              Figurines
            </Link>

            <Link
              href="/products/utility"
              className={linkClass("/products/utility")}
            >
              Utility
            </Link>

            {user?.role === "admin" && (
              <Link
                href="/admin"
                className={linkClass("/admin")}
              >
                Admin
              </Link>
            )}

          </nav>
        )}

        {/* Right Side */}
        <div className="flex gap-6 text-sm">

          {!user && (
            <Link href="/login" className="hover:opacity-70">
              Login
            </Link>
          )}

          {user && (
            <button
              onClick={logout}
              className="hover:opacity-70"
            >
              Logout
            </button>
          )}

          <Link href="/cart" className="hover:opacity-70">
            Cart
          </Link>

        </div>

      </div>
    </header>
  );
}