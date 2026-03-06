"use client";

import Image from "next/image";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/useToast";
import { useRouter } from "next/navigation";

export default function CartDrawer() {
  const { isOpen, closeCart, items, total, removeItem } = useCart();
  const toast = useToast();
  const router = useRouter();

  async function handleRemove(id: string, name: string) {
    await removeItem(id);
    toast(`Removed from cart`, "info");
  }

  return (
    <>
      {/* Overlay */}
      <div
        onClick={closeCart}
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 z-40 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[420px] bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            Your Cart
            {items.length > 0 && (
              <span className="ml-2 text-sm font-normal text-neutral-500">
                ({items.length} {items.length === 1 ? "item" : "items"})
              </span>
            )}
          </h2>
          <button onClick={closeCart} className="text-xl hover:opacity-60">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <p className="text-xl font-semibold">Your cart is empty</p>
              <p className="text-sm text-neutral-500">
                Add some products to get started.
              </p>
              <button
                onClick={closeCart}
                className="bg-black text-white px-6 py-3 rounded-xl hover:opacity-90 transition text-sm font-medium"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 items-start">
                  {/* Product image */}
                  {item.images?.[0] && (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0">
                      <Image
                        src={item.images[0]}
                        alt={item.product_name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {item.product_name}
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {item.variant_name} · Qty {item.qty}
                    </p>
                    <p className="text-sm font-semibold mt-1">
                      ₹{item.price * item.qty}
                    </p>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => handleRemove(item.id, item.product_name)}
                    className="text-neutral-400 hover:text-red-500 transition text-lg leading-none flex-shrink-0 mt-0.5"
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
          <div className="border-t p-6 space-y-4">
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
            <button
              onClick={() => {
                closeCart();
                router.push("/checkout");
              }}
              className="w-full bg-black text-white py-3.5 rounded-xl hover:opacity-90 transition font-semibold text-sm"
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
