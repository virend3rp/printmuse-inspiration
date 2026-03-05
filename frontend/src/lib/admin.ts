import { apiFetch } from "./api"
import { Product } from "@/types/product"

export async function fetchProducts() {
  return apiFetch("/admin/products")
}

export async function fetchProduct(id: string) {
  return apiFetch(`/admin/products/${id}`)
}

export async function createProduct(product: Product) {
  return apiFetch("/admin/products", {
    method: "POST",
    body: JSON.stringify(product),
  })
}

export async function updateProduct(id: string, product: Product) {
  return apiFetch(`/admin/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(product),
  })
}