"use client";

import Image from "next/image";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/useToast";
import { useRouter } from "next/navigation";

export default function CartDrawer() {
  const { isOpen, closeCart, items, total, removeItem } = useCart();
  const toast = useToast();
  const router = useRouter();

  async function handleRemove(id: string) {
    await removeItem(id);
    toast(`Removed from cart`, "info");
  }

  return (
    <>
      {/* Overlay */}
      <div
        onClick={closeCart}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 z-40 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[420px] shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ background: "var(--color-surface)", borderLeft: "1px solid var(--color-border)" }}
      >
        {/* Header */}
        <div className="p-6 flex justify-between items-center" style={{ borderBottom: "1px solid var(--color-border)" }}>
          <h2 className="text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>
            Your Cart
            {items.length > 0 && (
              <span className="ml-2 text-sm font-normal" style={{ color: "var(--color-text-secondary)" }}>
                ({items.length} {items.length === 1 ? "item" : "items"})
              </span>
            )}
          </h2>
          <button onClick={closeCart} className="text-xl hover:text-[var(--color-accent)] transition-colors" style={{ color: "var(--color-text-secondary)" }}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <p className="text-xl font-semibold" style={{ color: "var(--color-text-primary)" }}>Your cart is empty</p>
              <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                Add some products to get started.
              </p>
              <button
                onClick={closeCart}
                className="px-6 py-3 rounded-xl transition text-sm font-bold"
                style={{ background: "var(--color-accent)", color: "#111", boxShadow: "0 4px 16px rgba(245,166,35,0.25)" }}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 items-start">
                  {item.images?.[0] && (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0" style={{ background: "var(--color-surface-2)" }}>
                      <Image
                        src={item.images[0]}
                        alt={item.product_name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate" style={{ color: "var(--color-text-primary)" }}>
                      {item.product_name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
                      {item.variant_name} · Qty {item.qty}
                    </p>
                    <p className="text-sm font-semibold mt-1" style={{ color: "var(--color-accent)" }}>
                      ₹{item.price * item.qty}
                    </p>
                  </div>

                  <button
                    onClick={() => handleRemove(item.id)}
                    className="text-lg leading-none flex-shrink-0 mt-0.5 transition-colors hover:text-red-400"
                    style={{ color: "var(--color-text-muted)" }}
                    aria-label="Remove item"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 space-y-4" style={{ borderTop: "1px solid var(--color-border)" }}>
            <div className="flex justify-between font-semibold text-lg" style={{ color: "var(--color-text-primary)" }}>
              <span>Total</span>
              <span style={{ color: "var(--color-accent)" }}>₹{total}</span>
            </div>
            <button
              onClick={() => { closeCart(); router.push("/checkout"); }}
              className="w-full py-3.5 rounded-xl font-bold text-sm transition"
              style={{ background: "var(--color-accent)", color: "#111", boxShadow: "0 4px 20px rgba(245,166,35,0.25)" }}
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
