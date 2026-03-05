export type Variant = {
  id?: string
  name: string
  price: number
  stock: number
  sku?: string
}

export type Product = {
  id?: string
  name: string
  slug: string
  description: string
  category: string
  images: string[]   // S3 object keys
  active: boolean
  variants: Variant[]
}