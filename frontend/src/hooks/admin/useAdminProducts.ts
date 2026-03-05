import { useEffect, useState } from "react"
import { fetchProducts } from "@/lib/admin"

export function useAdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
      .then((res) => setProducts(res.data || []))
      .finally(() => setLoading(false))
  }, [])

  return { products, loading }
}