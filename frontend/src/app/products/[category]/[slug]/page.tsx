"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import Toast from "@/components/Toast";

export default function ProductDetailPage() {
  const { category, slug } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { openCart } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] =
    useState<any>(null);
  const [toast, setToast] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await apiFetch(
          `/products/${slug}`
        );

        if (res.data.category !== category) {
          router.push(`/products/${res.data.category}/${slug}`);
          return;
        }

        setProduct(res.data);

        if (res.data.variants?.length > 0) {
          setSelectedVariant(res.data.variants[0]);
        }
      } catch {
        setToast({
          message: "Product not found",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [slug]);

  async function handleAddToCart() {
    if (!user) {
      router.push(`/login?redirect=/products/${category}/${slug}`);
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

      openCart();
    } catch {
      setToast({
        message: "Failed to add to cart",
        type: "error",
      });
    }
  }

  if (loading) {
    return (
      <div className="section py-20">
        Loading...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="section py-20">
        Product not found.
      </div>
    );
  }

  return (
    <div className="section py-20 grid md:grid-cols-2 gap-16">

      <div className="card overflow-hidden">
        <img
          src={product.images?.[0] || "/placeholder.jpg"}
          className="w-full h-[480px] object-cover"
        />
      </div>

      <div className="space-y-6">

        <h1 className="heading-lg">
          {product.name}
        </h1>

        <p className="text-muted">
          {product.description}
        </p>

        <div className="flex gap-3 flex-wrap">
          {product.variants.map((variant: any) => (
            <button
              key={variant.id}
              onClick={() => setSelectedVariant(variant)}
              className={`px-4 py-2 border rounded-lg ${
                selectedVariant?.id === variant.id
                  ? "bg-black text-white"
                  : "hover:bg-neutral-100"
              }`}
            >
              {variant.name}
            </button>
          ))}
        </div>

        {selectedVariant && (
          <>
            <div className="text-2xl font-semibold">
              ₹{selectedVariant.price}
            </div>

            <button
              onClick={handleAddToCart}
              className="btn-primary"
            >
              Add to Cart
            </button>
          </>
        )}

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