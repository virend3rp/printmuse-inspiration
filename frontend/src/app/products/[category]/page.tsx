"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { apiFetch } from "@/lib/api";

function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-square rounded-2xl w-full" style={{ background: "var(--color-surface-2)" }} />
      <div className="pt-3 space-y-2">
        <div className="h-4 rounded w-3/4" style={{ background: "var(--color-surface-3)" }} />
        <div className="h-3 rounded w-1/3" style={{ background: "var(--color-surface-3)" }} />
      </div>
    </div>
  );
}

export default function CategoryPage() {
  const { category } = useParams();
  const normalizedCategory = (category as string)?.toLowerCase();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!normalizedCategory) return;

    async function fetchProducts() {
      try {
        const res = await apiFetch(`/products?category=${normalizedCategory}`);
        const data = Array.isArray(res) ? res : res.data || [];
        setProducts(data);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [normalizedCategory]);

  const label = normalizedCategory
    ? normalizedCategory.charAt(0).toUpperCase() + normalizedCategory.slice(1)
    : "";

  return (
    <div>
      {/* Category Header */}
      <div className="border-b" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
        <div className="container-system py-10">
          <p className="text-sm mb-2" style={{ color: "var(--color-text-secondary)" }}>
            <Link href="/" className="hover:text-[var(--color-accent)] transition-colors">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="capitalize" style={{ color: "var(--color-text-primary)" }}>
              {normalizedCategory}
            </span>
          </p>
          <h1 className="heading-lg capitalize">{label}</h1>
          {!loading && (
            <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
              {products.length}{" "}
              {products.length === 1 ? "product" : "products"}
            </p>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="container-system py-12">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-2xl font-semibold mb-2">No products yet</p>
            <p className="text-neutral-500 text-sm">Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
            {products.map((product) => {
              const lowestPrice = product.variants?.length
                ? Math.min(...product.variants.map((v: any) => v.price))
                : null;

              return (
                <Link
                  key={product.id}
                  href={`/products/${normalizedCategory}/${product.slug}`}
                  className="group block"
                >
                  {/* Image */}
                  <div className="relative aspect-square rounded-2xl overflow-hidden" style={{ background: "var(--color-surface-2)" }}>
                    {product.images?.[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full" style={{ background: "var(--color-surface-3)" }} />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition duration-300 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
                      <span className="text-xs font-bold px-4 py-2 rounded-full" style={{ background: "var(--color-accent)", color: "#111" }}>
                        View →
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="pt-3 space-y-0.5">
                    <h3 className="font-semibold text-sm leading-snug group-hover:text-[var(--color-accent)] transition-colors line-clamp-2" style={{ color: "var(--color-text-primary)" }}>
                      {product.name}
                    </h3>
                    {lowestPrice !== null && (
                      <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                        From ₹{lowestPrice}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
