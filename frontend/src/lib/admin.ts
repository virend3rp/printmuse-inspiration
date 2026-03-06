import { apiFetch } from "./api"
import { Product } from "@/types/product"

type VariantPayload = {
  product_id: string
  sku?: string
  name: string
  price: number
  stock: number
}

export async function fetchProducts() {
  return apiFetch("/admin/products")
}

export async function fetchProduct(id: string) {
  return apiFetch(`/admin/products/${id}`)
}

export async function createProduct(product: Product) {
  const payload = {
    name: product.name,
    description: product.description,
    category: product.category,
    images: product.images,
  }

  return apiFetch("/admin/products", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function createVariant(variant: VariantPayload) {
  return apiFetch("/admin/variants", {
    method: "POST",
    body: JSON.stringify(variant),
  })
}

export async function createProductWithVariants(product: Product) {
  const res = await createProduct(product)

  const createdProduct = res.data ?? res
  const productId = createdProduct.id

  if (Array.isArray(product.variants) && product.variants.length > 0) {
    for (const v of product.variants) {
      await createVariant({
        product_id: productId,
        sku: v.sku ?? "",
        name: v.name,
        price: v.price,
        stock: v.stock,
      })
    }
  }

  return createdProduct
}

export async function updateProduct(id: string, product: Product) {
  const payload = {
    id,
    name: product.name,
    description: product.description,
    category: product.category,
    images: product.images,
    active: product.active,
  }

  return apiFetch(`/admin/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })
}

export async function deactivateProduct(id: string) {
  return apiFetch(`/admin/products/${id}`, {
    method: "DELETE",
  })
}