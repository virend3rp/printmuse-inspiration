"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { fetchProducts } from "@/lib/admin"
import ProductTable from "@/components/admin/ProductTable"

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
      .then((res) => setProducts(res.data || []))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading...</p>

  return (
    <div className="space-y-6">

      <div className="flex justify-between">
        <h1 className="text-xl font-semibold">Products</h1>

        <Link
          href="/admin/products/create"
          className="bg-black text-white px-4 py-2 rounded"
        >
          Create Product
        </Link>
      </div>

      <ProductTable products={products} />

    </div>
  )
}
