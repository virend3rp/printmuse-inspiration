"use client"

import { Variant } from "@/types/product"

export default function VariantEditor({
  variants,
  onChange,
}: {
  variants: Variant[]
  onChange: (v: Variant[]) => void
}) {
  function update(index: number, field: keyof Variant, value: any) {
    const updated = [...variants]
    updated[index] = { ...updated[index], [field]: value }
    onChange(updated)
  }

  function add() {
    onChange([
      ...variants,
      {
        name: "",
        price: 0,
        stock: 0,
        sku: "",
      },
    ])
  }

  function remove(index: number) {
    onChange(variants.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-medium">Variants</h2>

        <button
          type="button"
          onClick={add}
          className="bg-gray-800 text-white px-3 py-1 rounded"
        >
          Add Variant
        </button>
      </div>

      {variants.map((v, i) => (
        <div
          key={i}
          className="border p-4 rounded grid grid-cols-4 gap-3 items-center"
        >
          <input
            placeholder="Variant Name"
            value={v.name}
            onChange={(e) => update(i, "name", e.target.value)}
            className="border p-2"
          />

          <input
            type="number"
            placeholder="Price"
            value={v.price}
            onChange={(e) =>
              update(i, "price", Number(e.target.value))
            }
            className="border p-2"
          />

          <input
            type="number"
            placeholder="Stock"
            value={v.stock}
            onChange={(e) =>
              update(i, "stock", Number(e.target.value))
            }
            className="border p-2"
          />

          <div className="flex gap-2">
            <input
              placeholder="SKU"
              value={v.sku || ""}
              onChange={(e) => update(i, "sku", e.target.value)}
              className="border p-2 w-full"
            />

            <button
              type="button"
              onClick={() => remove(i)}
              className="bg-red-500 text-white px-2 rounded"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}