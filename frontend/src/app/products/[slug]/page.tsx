"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import Toast from "@/components/Toast";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [product, setProduct] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] =
    useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  async function fetchProduct() {
    try {
      const res = await apiFetch(`/products/${slug}`);
      setProduct(res.data);

      if (res.data?.variants?.length > 0) {
        setSelectedVariant(res.data.variants[0]);
      }
    } catch {
      setToast({
        message: "Failed to load product",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleAddToCart() {
  if (!user) {
    router.push(`/login?redirect=/products/${slug}`);
    return;
  }

  if (!selectedVariant) return;

  try {
    await apiFetch("/cart/add", {
      method: "POST",
      body: JSON.stringify({
        variant_id: selectedVariant.id,
        qty: 1,
      }),
    });

    setToast({
      message: "Added to cart",
      type: "success",
    });

  } catch {
    setToast({
      message: "Failed to add to cart",
      type: "error",
    });
  }
}

  if (loading)
    return <p className="p-10">Loading...</p>;

  if (!product)
    return <p className="p-10">Product not found</p>;

  return (
    <div className="min-h-screen bg-neutral-100 p-10">
      <div className="max-w-5xl mx-auto bg-white p-8 rounded-xl shadow flex gap-10">

        {/* Image */}
        <div className="flex-1">
          {product.images?.[0] && (
            <img
              src={product.images[0]}
              className="w-full rounded-xl"
            />
          )}
        </div>

        {/* Details */}
        <div className="flex-1 flex flex-col gap-6">
          <h1 className="text-4xl font-bold text-neutral-900">
            {product.name}
          </h1>

          <p className="text-neutral-600 leading-relaxed">
            {product.description}
          </p>

          {/* Variant Selector */}
          <div>
            <p className="font-semibold mb-2">
              Select Variant:
            </p>
            <div className="flex gap-3">
              {product.variants.map(
                (variant: any) => (
                  <button
                    key={variant.id}
                    onClick={() =>
                      setSelectedVariant(variant)
                    }
                    className={`px-4 py-2 rounded border transition ${
                      selectedVariant?.id ===
                      variant.id
                        ? "bg-black text-white"
                        : "bg-white hover:bg-neutral-100"
                    }`}
                  >
                    {variant.name}
                  </button>
                )
              )}
            </div>
          </div>

          {selectedVariant && (
            <>
              <div className="text-3xl font-semibold text-blue-600">
                ₹{selectedVariant.price}
              </div>

              <p
                className={`text-sm ${
                  selectedVariant.stock > 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {selectedVariant.stock > 0
                  ? "In Stock"
                  : "Out of Stock"}
              </p>
            </>
          )}

          <button
            onClick={handleAddToCart}
            disabled={
              !selectedVariant ||
              selectedVariant.stock === 0
            }
            className="bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Add to Cart
          </button>
        </div>
      </div>

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