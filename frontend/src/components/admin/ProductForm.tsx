"use client"

import { useState } from "react"
import { Product } from "@/types/product"
import ProductImages from "./ProductImages"
import VariantEditor from "./VariantEditor"

function generateSlug(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export default function ProductForm({
  initial,
  onSubmit,
}: {
  initial?: Product
  onSubmit: (p: Product) => Promise<void>
}) {
    const [product, setProduct] = useState<Product>({
    name: initial?.name ?? "",
    slug: initial?.slug ?? "",
    description: initial?.description ?? "",
    category: initial?.category ?? "figurines",
    images: initial?.images ?? [],
    active: initial?.active ?? true,
    variants: Array.isArray(initial?.variants) ? initial!.variants : [],
    })

  function update(field: keyof Product, value: any) {
    setProduct((p) => ({ ...p, [field]: value }))
  }

  return (
    <form
      className="space-y-8"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(product)
      }}
    >
      <input
        placeholder="Name"
        value={product.name}
        onChange={(e) => {
          const name = e.target.value
          setProduct((p) => ({
            ...p,
            name,
            slug: generateSlug(name),
          }))
        }}
        className="border p-2 w-full"
      />

      <input
        placeholder="Slug"
        value={product.slug}
        onChange={(e) => update("slug", e.target.value)}
        className="border p-2 w-full"
      />

      <textarea
        placeholder="Description"
        value={product.description}
        onChange={(e) => update("description", e.target.value)}
        className="border p-2 w-full"
      />

      <select
        value={product.category}
        onChange={(e) => update("category", e.target.value)}
        className="border p-2"
      >
        <option value="keychains">Keychains</option>
        <option value="figurines">Figurines</option>
        <option value="utility">Utility</option>
        <option value="custom">Custom</option>
      </select>

      <ProductImages
        slug={product.slug}
        images={product.images}
        onChange={(imgs) => update("images", imgs)}
      />

      <VariantEditor
        variants={product.variants}
        onChange={(vars) => update("variants", vars)}
      />

      <button className="bg-black text-white px-6 py-2 rounded">
        Save Product
      </button>
    </form>
  )
}