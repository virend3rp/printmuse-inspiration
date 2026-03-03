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
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [toast, setToast] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
        message: "Failed to add",
        type: "error",
      });
    }
  }

  if (loading) return <p className="p-10">Loading...</p>;
  if (!product) return <p className="p-10">Not found</p>;

  return (
    <div className="bg-neutral-50 min-h-screen py-16 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16">

        {/* LEFT SIDE - IMAGE */}
        <div>
          {product.images?.[0] && (
            <img
              src={product.images[0]}
              className="w-full rounded-xl bg-white"
            />
          )}

          {/* Thumbnails */}
          <div className="flex gap-4 mt-6">
            {product.images?.map((img: string, i: number) => (
              <img
                key={i}
                src={img}
                className="w-20 h-20 object-cover rounded border cursor-pointer"
              />
            ))}
          </div>
        </div>

        {/* RIGHT SIDE - INFO */}
        <div className="space-y-6">

          <h1 className="text-3xl font-semibold">
            {product.name}
          </h1>

          <div className="text-4xl font-bold">
            ₹{selectedVariant?.price}
          </div>

          <p className="text-neutral-600 leading-relaxed">
            {product.description}
          </p>

          {/* VARIANTS GRID */}
          <div>
            <p className="font-medium mb-3">
              Select Variant
            </p>

            <div className="grid grid-cols-3 gap-3">
              {product.variants.map((variant: any) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant)}
                  className={`border rounded-lg py-3 text-sm transition ${
                    selectedVariant?.id === variant.id
                      ? "bg-black text-white"
                      : "bg-white hover:bg-neutral-100"
                  }`}
                >
                  {variant.name}
                </button>
              ))}
            </div>
          </div>

          {/* ADD TO CART */}
          <button
            onClick={handleAddToCart}
            className="w-full bg-black text-white py-4 rounded-xl text-lg hover:opacity-90 transition"
          >
            Add to Cart
          </button>

          <div className="text-sm text-neutral-500">
            Free delivery on orders over ₹3000
          </div>
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