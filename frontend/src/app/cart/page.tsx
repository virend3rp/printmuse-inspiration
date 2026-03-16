"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CartPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

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

  async function removeItem(itemId: string) {
    setRemoving(itemId);
    try {
      await apiFetch(`/cart/${itemId}`, { method: "DELETE" });
      await fetchCart();
    } finally {
      setRemoving(null);
    }
  }

  if (!user) {
    return (
      <div className="container-system py-24 text-center">
        <p className="text-lg font-medium mb-4">Please log in to view your cart.</p>
        <Link href="/login?redirect=/cart" className="btn-primary">
          Log In
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container-system py-24">
        <div className="animate-pulse space-y-4 max-w-2xl mx-auto">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 rounded-xl" style={{ background: "var(--color-surface-2)" }} />
          ))}
        </div>
      </div>
    );
  }

  if (!cart?.items?.length) {
    return (
      <div className="container-system py-24 text-center">
        <p className="text-2xl font-semibold mb-2">Your cart is empty</p>
        <p className="text-neutral-500 text-sm mb-8">
          Browse our collection and add something you love.
        </p>
        <Link href="/products/keychains" className="btn-primary">
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="section-system">
      <div className="container-system">
        <div className="border-b pb-6 mb-8" style={{ borderColor: "var(--color-border)" }}>
          <h1 className="heading-lg">Your Cart</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
            {cart.items.length} {cart.items.length === 1 ? "item" : "items"}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Items list */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item: any) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 p-4 rounded-2xl border"
                style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm leading-snug" style={{ color: "var(--color-text-primary)" }}>
                    {item.product_name}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
                    {item.variant_name} &times; {item.qty}
                  </p>
                </div>

                <p className="font-semibold text-sm shrink-0" style={{ color: "var(--color-accent)" }}>
                  ₹{item.price * item.qty}
                </p>

                <button
                  onClick={() => removeItem(item.id)}
                  disabled={removing === item.id}
                  className="text-xs shrink-0 disabled:opacity-40 transition-colors"
                  style={{ color: "var(--color-text-muted)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
                >
                  {removing === item.id ? "..." : "Remove"}
                </button>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border p-6 sticky top-6" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
              <h2 className="font-semibold text-base mb-4" style={{ color: "var(--color-text-primary)" }}>Order Summary</h2>

              <div className="flex justify-between text-sm mb-2" style={{ color: "var(--color-text-secondary)" }}>
                <span>Subtotal</span>
                <span>₹{cart.total}</span>
              </div>
              <div className="flex justify-between text-sm mb-4" style={{ color: "var(--color-text-secondary)" }}>
                <span>Shipping</span>
                <span style={{ color: "#4ade80" }}>Free</span>
              </div>

              <div className="border-t pt-4 flex justify-between font-semibold text-base mb-6" style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}>
                <span>Total</span>
                <span style={{ color: "var(--color-accent)" }}>₹{cart.total}</span>
              </div>

              <button
                onClick={() => router.push("/checkout")}
                className="btn-primary w-full text-center"
              >
                Proceed to Checkout
              </button>

              <Link
                href="/products/keychains"
                className="block text-center text-sm mt-4 transition-colors hover:text-[var(--color-accent)]"
                style={{ color: "var(--color-text-secondary)" }}
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
