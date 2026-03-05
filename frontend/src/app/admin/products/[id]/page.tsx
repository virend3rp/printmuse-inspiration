"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import ProductForm from "@/components/admin/ProductForm"
import { fetchProduct, updateProduct } from "@/lib/admin"
import { Product } from "@/types/product"

export default function EditProductPage() {
  const { id } = useParams()
  const router = useRouter()

  const [product, setProduct] = useState<Product | null>(null)

  useEffect(() => {
    async function load() {
      const res = await fetchProduct(id as string)

      const data = res.data

      setProduct({
        ...data,
        variants: Array.isArray(data.variants) ? data.variants : [],
        images: Array.isArray(data.images) ? data.images : [],
      })
    }

    load()
  }, [id])

  if (!product) return <p>Loading...</p>

  async function handleUpdate(updated: Product) {
    await updateProduct(id as string, updated)
    router.push("/admin/products")
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold mb-6">
        Edit Product
      </h1>

      <ProductForm
        initial={product}
        onSubmit={handleUpdate}
      />
    </div>
  )
}