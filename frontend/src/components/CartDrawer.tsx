"use client";

import { useCart } from "@/hooks/useCart";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function CartDrawer() {
  const { isOpen, closeCart } = useCart();
  const [cart, setCart] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) fetchCart();
  }, [isOpen]);

  async function fetchCart() {
    try {
      const res = await apiFetch("/cart");
      setCart(res.data);
    } catch {
      setCart(null);
    }
  }

  return (
    <>
      {/* Overlay */}
      <div
        onClick={closeCart}
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 z-40 ${
          isOpen
            ? "opacity-100"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[420px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen
            ? "translate-x-0"
            : "translate-x-full"
        }`}
      >
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            Your Cart
          </h2>
          <button
            onClick={closeCart}
            className="text-xl"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col">
          {!cart?.items?.length ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-6">
              <p className="text-2xl font-semibold">
                Your cart is empty
              </p>

              <button
                onClick={closeCart}
                className="bg-black text-white px-6 py-3 rounded-lg hover:opacity-90 transition"
              >
                Continue shopping
              </button>
            </div>
          ) : (
            <>
              <div className="flex-1">
                {cart.items.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex justify-between mb-6"
                  >
                    <div>
                      <p className="font-medium">
                        {item.variant_name}
                      </p>
                      <p className="text-sm text-neutral-500">
                        Qty: {item.qty}
                      </p>
                    </div>
                    <p className="font-medium">
                      ₹{item.price * item.qty}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-6 space-y-4">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>₹{cart.total}</span>
                </div>

                <button
                  onClick={() => {
                    closeCart();
                    router.push("/checkout");
                  }}
                  className="w-full bg-black text-white py-3 rounded-lg hover:opacity-90 transition"
                >
                  Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}