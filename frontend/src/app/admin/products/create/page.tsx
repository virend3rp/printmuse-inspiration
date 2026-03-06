"use client"

import { useRouter } from "next/navigation"
import ProductForm from "@/components/admin/ProductForm"
import { createProductWithVariants } from "@/lib/admin"
import { Product } from "@/types/product"

export default function CreateProductPage() {
  const router = useRouter()

  async function handleCreate(product: Product) {
    await createProductWithVariants(product)
    router.push("/admin/products")
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="text-2xl font-semibold">
        Create Product
      </h1>

      <div className="bg-white border border-neutral-200 rounded-lg p-8 shadow-sm">
        <ProductForm onSubmit={handleCreate} />
      </div>
    </div>
  )
}