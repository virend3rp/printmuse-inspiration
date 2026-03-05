"use client"

import { useState } from "react"
import { uploadProductImage } from "@/services/uploadService"

export default function ProductImages({
  slug,
  images,
  onChange,
}: {
  slug: string
  images: string[]
  onChange: (imgs: string[]) => void
}) {
  const [uploading, setUploading] = useState(false)

  async function handleFiles(files: FileList | null) {
    if (!files) return

    setUploading(true)

    try {
      const uploaded: string[] = []

      for (const file of Array.from(files)) {
        const url = await uploadProductImage(slug, file)
        uploaded.push(url)
      }

      onChange([...images, ...uploaded])
    } finally {
      setUploading(false)
    }
  }

  function remove(index: number) {
    onChange(images.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      <label className="font-medium">Product Images</label>

      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
      />

      {uploading && (
        <p className="text-sm text-gray-500">Uploading images...</p>
      )}

      <div className="flex flex-wrap gap-4">
        {images.map((img, i) => (
          <div key={i} className="relative">
            <img
              src={img}
              className="w-24 h-24 object-cover border rounded"
            />

            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2 py-1"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}