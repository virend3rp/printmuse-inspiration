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
          <div className="aspect-square rounded-2xl" style={{ background: "var(--color-surface-2)" }} />
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-16 h-16 rounded-lg" style={{ background: "var(--color-surface-2)" }} />
            ))}
          </div>
        </div>
        <div className="space-y-4 pt-2">
          <div className="h-3 rounded w-1/4" style={{ background: "var(--color-surface-2)" }} />
          <div className="h-8 rounded w-3/4" style={{ background: "var(--color-surface-2)" }} />
          <div className="h-4 rounded w-full" style={{ background: "var(--color-surface-2)" }} />
          <div className="h-4 rounded w-5/6" style={{ background: "var(--color-surface-2)" }} />
          <div className="h-4 rounded w-4/6" style={{ background: "var(--color-surface-2)" }} />
          <div className="flex gap-2 pt-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-10 w-24 rounded-xl" style={{ background: "var(--color-surface-2)" }} />
            ))}
          </div>
          <div className="h-7 rounded w-1/4 mt-2" style={{ background: "var(--color-surface-2)" }} />
          <div className="h-12 rounded-xl w-full" style={{ background: "var(--color-surface-2)" }} />
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
      <div className="border-b" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
        <div className="container-system py-3">
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            <Link href="/" className="hover:text-[var(--color-accent)] transition-colors">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link
              href={`/products/${category}`}
              className="hover:text-[var(--color-accent)] transition-colors capitalize"
            >
              {category}
            </Link>
            <span className="mx-2">/</span>
            <span style={{ color: "var(--color-text-primary)" }}>{product.name}</span>
          </p>
        </div>
      </div>

      <div className="container-system py-12">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">

          {/* Left — Image Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-square rounded-2xl overflow-hidden" style={{ background: "var(--color-surface-2)" }}>
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
                        ? "border-[var(--color-accent)]"
                        : "border-transparent opacity-50 hover:opacity-100"
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
            <p className="text-[15px] leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
              {product.description}
            </p>

            {/* Variants */}
            {product.variants?.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2.5" style={{ color: "var(--color-text-primary)" }}>Select Variant</p>
                <div className="flex gap-2 flex-wrap">
                  {product.variants.map((variant: any) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`px-4 py-2 rounded-xl border text-sm font-medium transition ${
                        selectedVariant?.id === variant.id
                          ? "border-[var(--color-accent)] text-[#111]"
                          : "text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                      }`}
                      style={
                        selectedVariant?.id === variant.id
                          ? { background: "var(--color-accent)", borderColor: "var(--color-accent)" }
                          : { borderColor: "var(--color-border)", background: "var(--color-surface-2)" }
                      }
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
              className="w-full py-4 rounded-xl font-bold text-sm tracking-wide transition disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: "var(--color-accent)",
                color: "#111",
                boxShadow: "0 4px 20px rgba(245,166,35,0.25)",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--color-accent-hover)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 32px rgba(245,166,35,0.4)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--color-accent)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 20px rgba(245,166,35,0.25)"; }}
            >
              {adding ? "Adding..." : "Add to Cart"}
            </button>

          </div>
        </div>
      </div>

    </div>
  );
}
