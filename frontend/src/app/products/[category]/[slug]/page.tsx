"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/useToast";

function DetailSkeleton() {
  return (
    <div className="container-system py-12">
      <div className="grid md:grid-cols-2 gap-12 animate-pulse">
        <div className="space-y-3">
          <div className="aspect-square bg-neutral-200 rounded-2xl" />
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-16 h-16 bg-neutral-200 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="space-y-4 pt-2">
          <div className="h-3 bg-neutral-200 rounded w-1/4" />
          <div className="h-8 bg-neutral-200 rounded w-3/4" />
          <div className="h-4 bg-neutral-200 rounded w-full" />
          <div className="h-4 bg-neutral-200 rounded w-5/6" />
          <div className="h-4 bg-neutral-200 rounded w-4/6" />
          <div className="flex gap-2 pt-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-10 w-24 bg-neutral-200 rounded-xl" />
            ))}
          </div>
          <div className="h-7 bg-neutral-200 rounded w-1/4 mt-2" />
          <div className="h-12 bg-neutral-200 rounded-xl w-full" />
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const { category, slug } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { openCart, refreshCart } = useCart();
  const toast = useToast();

  const [product, setProduct] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await apiFetch(`/products/${category}/${slug}`);
        setProduct(res.data);
        if (res.data.variants?.length > 0) {
          setSelectedVariant(res.data.variants[0]);
        }
      } catch {
        toast("Product not found", "error");
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [slug, category]);

  async function handleAddToCart() {
    if (!user) {
      router.push(`/login?redirect=/products/${category}/${slug}`);
      return;
    }

    setAdding(true);
    try {
      await apiFetch("/cart/add", {
        method: "POST",
        body: JSON.stringify({ variant_id: selectedVariant.id, qty: 1 }),
      });
      await refreshCart();
      toast("Added to cart!");
      openCart();
    } catch {
      toast("Failed to add to cart", "error");
    } finally {
      setAdding(false);
    }
  }

  if (loading) return <DetailSkeleton />;

  if (!product) {
    return (
      <div className="container-system py-20 text-center">
        <p className="text-2xl font-semibold">Product not found</p>
        <Link
          href="/"
          className="text-sm text-neutral-500 hover:underline mt-2 block"
        >
          ← Back to home
        </Link>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : ["/placeholder.jpg"];
  const categoryLabel =
    (category as string)?.charAt(0).toUpperCase() +
    (category as string)?.slice(1);

  function stockBadge(stock: number) {
    if (stock > 5) return { label: "In Stock", cls: "bg-green-50 text-green-700" };
    if (stock > 0) return { label: `Only ${stock} left`, cls: "bg-amber-50 text-amber-700" };
    return { label: "Out of Stock", cls: "bg-red-50 text-red-600" };
  }

  const badge = selectedVariant ? stockBadge(selectedVariant.stock) : null;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="border-b border-neutral-100">
        <div className="container-system py-3">
          <p className="text-sm text-neutral-400">
            <Link href="/" className="hover:underline">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link
              href={`/products/${category}`}
              className="hover:underline capitalize"
            >
              {category}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-neutral-800">{product.name}</span>
          </p>
        </div>
      </div>

      <div className="container-system py-12">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">

          {/* Left — Image Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-100">
              <Image
                src={images[activeImage]}
                alt={product.name}
                fill
                className="object-cover transition duration-300"
                priority
              />
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                      activeImage === i
                        ? "border-black"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right — Product Info */}
          <div className="space-y-6">

            {/* Category + Name */}
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]">
                {categoryLabel}
              </span>
              <h1 className="heading-lg mt-1">{product.name}</h1>
            </div>

            {/* Description */}
            <p className="text-[15px] text-neutral-600 leading-relaxed">
              {product.description}
            </p>

            {/* Variants */}
            {product.variants?.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2.5">Select Variant</p>
                <div className="flex gap-2 flex-wrap">
                  {product.variants.map((variant: any) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`px-4 py-2 rounded-xl border text-sm font-medium transition ${
                        selectedVariant?.id === variant.id
                          ? "bg-black text-white border-black"
                          : "border-neutral-300 hover:border-neutral-500 text-neutral-700"
                      }`}
                    >
                      {variant.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price + Stock Badge */}
            {selectedVariant && (
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold">
                  ₹{selectedVariant.price}
                </span>
                {badge && (
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badge.cls}`}
                  >
                    {badge.label}
                  </span>
                )}
              </div>
            )}

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={adding || !selectedVariant || selectedVariant?.stock === 0}
              className="w-full bg-black text-white py-4 rounded-xl font-semibold text-sm tracking-wide hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {adding ? "Adding..." : "Add to Cart"}
            </button>

          </div>
        </div>
      </div>

    </div>
  );
}
