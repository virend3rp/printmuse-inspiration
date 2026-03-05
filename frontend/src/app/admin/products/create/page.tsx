"use client"

import { useRouter } from "next/navigation"
import ProductForm from "@/components/admin/ProductForm"
import { createProduct } from "@/services/productService"

export default function CreateProductPage() {
  const router = useRouter()

  async function handleCreate(product: any) {
    await createProduct(product)
    router.push("/admin/products")
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold mb-6">
        Create Product
      </h1>

      <ProductForm onSubmit={handleCreate} />
    </div>
  )
}