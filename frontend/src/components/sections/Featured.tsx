"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

const CATEGORIES = ["keychains", "figurines", "utility", "custom"];

export default function Featured() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const results = await Promise.allSettled(
        CATEGORIES.map((cat) =>
          apiFetch(`/products?category=${cat}&limit=1`)
        )
      );

      const items = results
        .map((r) => (r.status === "fulfilled" ? r.value?.data?.[0] : null))
        .filter(Boolean);

      setProducts(items);
    }

    load();
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="section-system" style={{ background: "var(--color-surface)" }}>
      <div className="container-system">
        <h2 className="heading-lg mb-8" style={{ color: "var(--color-text-primary)" }}>Featured</h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const lowestPrice = product.variants?.length
              ? Math.min(...product.variants.map((v: any) => v.price))
              : null;

            return (
              <Link
                key={product.id}
                href={`/products/${product.category}/${product.slug}`}
                className="group block rounded-2xl overflow-hidden forge-card transition"
              >
                <div className="relative h-[220px] bg-neutral-100">
                  {product.images?.[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-200" />
                  )}
                </div>
                <div className="p-4" style={{ background: "var(--color-surface-2)" }}>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-1 capitalize" style={{ color: "var(--color-accent)" }}>
                    {product.category}
                  </p>
                  <h3 className="font-medium text-sm leading-snug line-clamp-1" style={{ color: "var(--color-text-primary)" }}>
                    {product.name}
                  </h3>
                  {lowestPrice !== null && (
                    <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                      From ₹{lowestPrice}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
