"use client"

import Image from "next/image"
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

  async function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = e.target.files
    if (!files) return

    const uploaded: string[] = []

    for (const file of Array.from(files)) {
      try {
        const file_url = await uploadProductImage(slug, file)
        uploaded.push(file_url)
      } catch (err) {
        console.error("Upload failed:", err)
      }
    }

    onChange([...images, ...uploaded])
  }

  return (
    <div className="space-y-4">

      <label className="block text-sm font-medium">
        Product Images
      </label>

      <input
        type="file"
        multiple
        onChange={handleFileChange}
        className="block text-sm"
      />

      {images.length > 0 && (
        <div className="flex gap-3 flex-wrap pt-2">
          {images.map((img) => (
            <div key={img} className="relative w-20 h-20 rounded border overflow-hidden">
              <Image src={img} alt="" fill className="object-cover" />
            </div>
          ))}
        </div>
      )}

    </div>
  )
}