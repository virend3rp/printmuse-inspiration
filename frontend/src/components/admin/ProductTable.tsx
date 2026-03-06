"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { deactivateProduct } from "@/lib/admin"

export default function ProductTable({ products }: any) {
  const router = useRouter()

  async function handleDeactivate(id: string) {
    const ok = confirm("Deactivate this product?")
    if (!ok) return

    await deactivateProduct(id)
    router.refresh()
  }

  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="border-b text-left">
          <th className="py-3 w-20">Image</th>
          <th className="py-3">Name</th>
          <th className="py-3 w-40">Category</th>
          <th className="py-3 w-32">Status</th>
          <th className="py-3 w-40">Actions</th>
        </tr>
      </thead>

      <tbody>
        {products.map((p: any) => (
          <tr key={p.id} className="border-b hover:bg-neutral-50">
            <td className="py-3">
              <div className="relative w-12 h-12 rounded overflow-hidden bg-neutral-100">
                <Image src={p.images?.[0] || "/placeholder.jpg"} alt={p.name} fill className="object-cover" />
              </div>
            </td>

            <td className="font-medium">{p.name}</td>

            <td className="text-neutral-600 capitalize">
              {p.category}
            </td>

            <td>
              {p.active ? (
                <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">
                  Active
                </span>
              ) : (
                <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-700">
                  Inactive
                </span>
              )}
            </td>

            <td className="flex gap-4">
              <Link
                href={`/admin/products/${p.id}`}
                className="text-blue-600 hover:underline"
              >
                Edit
              </Link>

              {p.active && (
                <button
                  onClick={() => handleDeactivate(p.id)}
                  className="text-red-600 hover:underline"
                >
                  Deactivate
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}