"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    fetchCart();
  }, [user]);

  async function fetchCart() {
    try {
      const res = await apiFetch("/cart");
      setCart(res.data);
    } catch {
      router.push("/login?redirect=/cart");
    } finally {
      setLoading(false);
    }
  }

  if (!user)
    return (
      <div className="p-10">
        Please login to view cart.
      </div>
    );

  if (loading)
    return <p className="p-10">Loading...</p>;

  if (!cart?.items?.length)
    return (
      <div className="p-10">
        Your cart is empty.
      </div>
    );

  return (
    <div className="min-h-screen bg-neutral-100 p-10">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-6">
          Your Cart
        </h1>

        {cart.items.map((item: any) => (
          <div
            key={item.id}
            className="flex justify-between border-b py-3"
          >
            <span>
              {item.variant_name} × {item.qty}
            </span>
            <span>₹{item.price * item.qty}</span>
          </div>
        ))}

        <div className="flex justify-between mt-6 text-xl font-semibold">
          <span>Total</span>
          <span>₹{cart.total}</span>
        </div>

        <button
          onClick={() => router.push("/checkout")}
          className="w-full mt-8 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}