"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState<any>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetchProduct();
  }, []);

  async function fetchProduct() {
    const res = await apiFetch(`/admin/products/${id}`);
    setProduct(res.data);
    setName(res.data.name);
    setDescription(res.data.description);
  }

  async function updateProduct(e: React.FormEvent) {
    e.preventDefault();

    await apiFetch("/admin/products", {
      method: "PUT",
      body: JSON.stringify({
        id,
        name,
        description,
      }),
    });

    router.push("/admin/products");
  }

  if (!product) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        Edit Product
      </h1>

      <form onSubmit={updateProduct} className="flex flex-col gap-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 rounded"
        />

        <button className="bg-black text-white py-2 rounded">
          Save Changes
        </button>
      </form>
    </div>
  );
}