"use client";

import Link from "next/link";

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100">
      <div className="bg-white p-10 rounded-xl shadow text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-4">
          Payment Successful
        </h1>
        <p className="text-neutral-700 mb-6">
          Your order has been placed successfully.
        </p>

        <Link
          href="/products"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}