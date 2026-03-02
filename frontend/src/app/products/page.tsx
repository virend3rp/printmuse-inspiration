"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import Toast from "@/components/Toast";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const { user } = useAuth();
  const router = useRouter();
  const { openCart } = useCart();

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const res = await apiFetch("/products");
      setProducts(res.data || []);
    } catch {
      setToast({
        message: "Failed to load products",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleAddToCart(
    e: React.MouseEvent,
    variantId: string
  ) {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push("/login?redirect=/products");
      return;
    }

    try {
      await apiFetch("/cart/add", {
        method: "POST",
        body: JSON.stringify({
          variant_id: variantId,
          qty: 1,
        }),
      });

      setToast({
        message: "Added to cart",
        type: "success",
      });

      openCart(); // smooth UX
    } catch {
      setToast({
        message: "Failed to add to cart",
        type: "error",
      });
    }
  }

  if (loading)
    return <p className="p-10">Loading...</p>;

  return (
    <div className="bg-[#f8f8f6] min-h-screen">

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-16 text-center">
        <p className="uppercase tracking-widest text-sm text-neutral-500 mb-4">
          Printing Muse
        </p>

        <h1 className="text-5xl md:text-6xl font-semibold leading-tight mb-6">
          Designed for everyday
          <br />
          minimal living.
        </h1>

        <p className="text-neutral-600 max-w-xl mx-auto text-lg">
          Premium functional objects crafted with
          attention to detail and purpose.
        </p>
      </section>

      {/* PRODUCT GRID */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-16">
          {products.map((product) => {
            const defaultVariant = product.variants?.[0];

            return (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group"
              >
                {/* IMAGE CONTAINER */}
                <div className="relative aspect-square bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition">

                  {product.images?.[0] && (
                    <img
                      src={product.images[0]}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  )}

                  {/* ADD TO CART ICON */}
                  {defaultVariant && (
                    <button
                      onClick={(e) =>
                        handleAddToCart(e, defaultVariant.id)
                      }
                      className="absolute top-4 right-4 bg-white shadow-md rounded-full w-10 h-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    >
                      🛍
                    </button>
                  )}
                </div>

                {/* DETAILS */}
                <div className="mt-5 space-y-1">
                  <h3 className="text-lg font-medium group-hover:underline">
                    {product.name}
                  </h3>

                  <p className="text-neutral-500 text-sm">
                    {defaultVariant?.name}
                  </p>

                  <p className="font-semibold text-base">
                    ₹{defaultVariant?.price}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}