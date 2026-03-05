import { apiFetch } from "@/lib/api"

export async function uploadProductImage(
  slug: string,
  file: File
): Promise<string> {
  const data = await apiFetch("/admin/upload-url", {
    method: "POST",
    body: JSON.stringify({
      filename: file.name,
      product_slug: slug,
    }),
  })

  await fetch(data.data.upload_url, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  })

  return data.data.file_url
}