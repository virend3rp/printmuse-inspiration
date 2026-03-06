"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function OrderSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.push("/orders"), 4000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-2xl">
          ✓
        </div>
        <h1 className="text-2xl font-bold">Payment Successful!</h1>
        <p className="text-neutral-500 text-sm">
          Your order has been placed. Redirecting to your orders...
        </p>
        <Link
          href="/orders"
          className="inline-block text-sm underline text-neutral-600 hover:text-black"
        >
          View my orders →
        </Link>
      </div>
    </div>
  );
}
