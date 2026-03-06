"use client"

import { useState } from "react"
import { Product, PRODUCT_CATEGORIES } from "@/types/product"
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
      className="space-y-10"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(product)
      }}
    >
      {/* PRODUCT DETAILS */}
      <div className="space-y-6">
        <h2 className="text-lg font-semibold">Product Details</h2>

        <div className="space-y-4">

          {/* NAME */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Name
            </label>

            <input
              value={product.name}
              onChange={(e) => {
                const name = e.target.value
                setProduct((p) => ({
                  ...p,
                  name,
                  slug: generateSlug(name),
                }))
              }}
              placeholder="Product name"
              className="w-full border border-neutral-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* SLUG */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Slug
            </label>

            <input
              value={product.slug}
              onChange={(e) => update("slug", e.target.value)}
              placeholder="product-slug"
              className="w-full border border-neutral-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>

            <textarea
              value={product.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Product description"
              className="w-full border border-neutral-300 rounded-md px-3 py-2 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* CATEGORY */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Category
            </label>

            <select
              value={product.category}
              onChange={(e) => update("category", e.target.value)}
              className="border border-neutral-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            >
              {PRODUCT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* IMAGES */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          Images
        </h2>

        <div className="border border-dashed border-neutral-300 rounded-lg p-6">
          <ProductImages
            slug={product.slug}
            images={product.images}
            onChange={(imgs) => update("images", imgs)}
          />
        </div>
      </div>

      {/* VARIANTS */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            Variants
          </h2>
        </div>

        <VariantEditor
          variants={product.variants}
          onChange={(vars) => update("variants", vars)}
        />
      </div>

      {/* SAVE BUTTON */}
      <div className="flex justify-end pt-4">
        <button
          className="bg-black text-white px-6 py-3 rounded-md font-medium hover:opacity-90 transition"
        >
          Save Product
        </button>
      </div>

    </form>
  )
}