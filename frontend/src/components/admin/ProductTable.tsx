import Link from "next/link"

export default function ProductTable({ products }: any) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b">
          <th className="text-left py-3">Image</th>
          <th className="text-left">Name</th>
          <th>Category</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>

      <tbody>
        {products.map((p: any) => (
          <tr key={p.id} className="border-b">
            <td className="py-3">
              <img
                src={p.images?.[0]}
                className="w-12 h-12 object-cover rounded"
              />
            </td>

            <td>{p.name}</td>
            <td>{p.category}</td>
            <td>{p.active ? "Active" : "Inactive"}</td>

            <td>
              <Link
                href={`/admin/products/${p.id}`}
                className="text-blue-600"
              >
                Edit
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}