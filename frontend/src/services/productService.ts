import { Product } from "@/types/product"
import { apiFetch } from "@/lib/api"

export async function createProduct(product: Product) {
  return apiFetch("/admin/products", {
    method: "POST",
    body: JSON.stringify(product),
  })
}

export async function updateProduct(product: Product & { id: string }) {
  return apiFetch("/admin/products", {
    method: "PUT",
    body: JSON.stringify(product),
  })
}

export async function deleteProduct(id: string) {
  return apiFetch(`/admin/products/${id}`, {
    method: "DELETE",
  })
}

export async function getProducts(): Promise<Product[]> {
  return apiFetch("/products")
}

export async function getProduct(slug: string): Promise<Product> {
  return apiFetch(`/products/${slug}`)
}