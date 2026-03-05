"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import ProductForm from "@/components/admin/ProductForm"
import { getProduct, updateProduct } from "@/services/productService"
import { Product } from "@/types/product"

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()

  const id = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await getProduct(id)

        // support both raw response and { data: ... } response
        const data = (res as any).data ?? res

        setProduct({
          ...data,
          variants: Array.isArray(data.variants) ? data.variants : [],
          images: Array.isArray(data.images) ? data.images : [],
        })
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadProduct()
    }
  }, [id])

async function handleUpdate(updated: Product) {
  await updateProduct({
    ...updated,
    id,
    active: updated.active ?? true,
  })
  router.push("/admin/products")
}

  if (loading) {
    return <p>Loading product...</p>
  }

  if (!product) {
    return <p>Product not found</p>
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold">
        Edit Product
      </h1>

      <ProductForm
        initial={product}
        onSubmit={handleUpdate}
      />
    </div>
  )
}