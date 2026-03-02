"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function HomePage() {
  const { user, logout } = useAuth();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-6">
      <h1 className="text-4xl font-bold">E-Commerce Store</h1>

      {!user ? (
        <div className="flex gap-4">
          <Link
            href="/products"
            className="px-4 py-2 bg-black text-red rounded"
          >
            Browse Products
          </Link>

          <Link
            href="/login"
            className="px-4 py-2 border border-black rounded"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="px-4 py-2 border border-black rounded"
          >
            Register
          </Link>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6">
          <p className="text-lg">
            Logged in as <strong>{user.email}</strong>
          </p>

          <div className="flex gap-4">
            <Link
              href="/products"
              className="px-4 py-2 bg-black text-red rounded"
            >
              Products
            </Link>

            <Link
              href="/cart"
              className="px-4 py-2 border border-black rounded"
            >
              Cart
            </Link>

            {user.role === "admin" && (
              <Link
                href="/admin"
                className="px-4 py-2 border border-red-600 text-red-600 rounded"
              >
                Admin Panel
              </Link>
            )}
          </div>

          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-red-200 rounded"
          >
            Logout
          </button>
        </div>
      )}
    </main>
  );
}