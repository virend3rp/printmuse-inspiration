"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

export default function CategoryPage() {
  const { category } = useParams();
  const normalizedCategory = (category as string)?.toLowerCase();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!normalizedCategory) return;

    async function fetchProducts() {
      try {
        const res = await apiFetch(
          `/products?category=${normalizedCategory}`
        );

        const data = Array.isArray(res) ? res : res.data || [];

        setProducts(data);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [normalizedCategory]);

  if (loading) {
    return (
      <div className="section py-20">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="section py-20">
      <h1 className="heading-lg mb-12 capitalize">
        {normalizedCategory}
      </h1>

      {products.length === 0 && (
        <p className="text-muted">No products found.</p>
      )}

      <div className="grid md:grid-cols-3 gap-10">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${normalizedCategory}/${product.slug}`}
            className="card overflow-hidden group"
          >
            <img
              src={product.images?.[0] || "/placeholder.jpg"}
              className="w-full h-[320px] object-cover group-hover:scale-105 transition duration-500"
            />

            <div className="p-4">
              <h3 className="font-semibold text-lg">
                {product.name}
              </h3>

              {product.variants?.[0] && (
                <p className="text-muted text-sm">
                  ₹{product.variants[0].price}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}