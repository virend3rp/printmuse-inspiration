"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [uploadedImage, setUploadedImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProducts();
  }, [page]);

  async function fetchProducts() {
    const res = await apiFetch(
      `/admin/products?limit=10&offset=${(page - 1) * 10}`
    );
    setProducts(res.data || []);
  }

  async function handleImageUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    if (!e.target.files?.[0]) return;

    const formData = new FormData();
    formData.append("image", e.target.files[0]);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/upload`,
      {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem(
            "access_token"
          )}`,
        },
      }
    );

    const data = await res.json();
    setUploadedImage(data.data.url);
  }

  async function handleCreateProduct(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await apiFetch("/admin/products", {
        method: "POST",
        body: JSON.stringify({
          name,
          description,
          images: uploadedImage ? [uploadedImage] : [],
        }),
      });

      setName("");
      setDescription("");
      setUploadedImage("");
      await fetchProducts();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-neutral-100 p-8 flex flex-col gap-10">
      <h1 className="text-3xl font-bold text-neutral-900">
        Product Management
      </h1>

      {/* CREATE PRODUCT */}
      <section className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">
          Create Product
        </h2>

        {error && (
          <p className="text-red-600 text-sm mb-3">{error}</p>
        )}

        <form
          onSubmit={handleCreateProduct}
          className="flex flex-col gap-4"
        >
          <input
            placeholder="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="border border-neutral-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
            required
            className="border border-neutral-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />

          <input
            type="file"
            onChange={handleImageUpload}
            className="border border-neutral-300 p-2 rounded-lg"
          />

          {uploadedImage && (
            <img
              src={uploadedImage}
              alt="Preview"
              className="w-40 rounded-lg border"
            />
          )}

          <button
            disabled={loading}
            className="bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Product"}
          </button>
        </form>
      </section>

      {/* SEARCH */}
      <input
        placeholder="Search product..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border border-neutral-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-600"
      />

      {/* PRODUCT LIST */}
      <div className="flex flex-col gap-4">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="bg-white border border-neutral-200 p-4 rounded-xl shadow-sm flex justify-between items-center hover:shadow-md transition"
          >
            <div className="flex gap-4 items-center">
              {p.images?.[0] && (
                <img
                  src={p.images[0]}
                  className="w-16 h-16 object-cover rounded-lg border"
                />
              )}
              <div>
                <p className="text-lg font-semibold text-neutral-900">
                  {p.name}
                </p>
              </div>
            </div>

            <Link
              href={`/admin/products/${p.id}`}
              className="text-blue-600 font-medium hover:underline"
            >
              Edit
            </Link>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      <div className="flex gap-6 mt-6 text-blue-600 font-medium">
        <button
          onClick={() =>
            setPage((p) => Math.max(1, p - 1))
          }
          className="hover:underline"
        >
          Prev
        </button>
        <button
          onClick={() => setPage((p) => p + 1)}
          className="hover:underline"
        >
          Next
        </button>
      </div>
    </div>
  );
}