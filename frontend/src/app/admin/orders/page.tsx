"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

const STATUS_STYLES: Record<string, string> = {
  pending:   "bg-yellow-50 text-yellow-700",
  paid:      "bg-green-50 text-green-700",
  shipped:   "bg-blue-50 text-blue-700",
  delivered: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-red-50 text-red-600",
  expired:   "bg-neutral-100 text-neutral-500",
  confirmed: "bg-purple-50 text-purple-700",
};

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_STYLES[status] ?? "bg-neutral-100 text-neutral-500";
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${cls}`}>
      {status}
    </span>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/admin/orders")
      .then((res) => setOrders(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Orders</h1>
        <div className="animate-pulse space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-neutral-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Orders</h1>

      {orders.length === 0 ? (
        <p className="text-neutral-500 text-sm">No orders yet.</p>
      ) : (
        <div className="rounded-xl border border-neutral-200 overflow-hidden bg-white">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Order ID</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Total</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Date</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-neutral-50 transition">
                  <td className="px-4 py-3 font-mono text-xs text-neutral-500">
                    {o.id.slice(0, 8)}…
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="px-4 py-3 font-medium">₹{o.total}</td>
                  <td className="px-4 py-3 text-neutral-500">
                    {new Date(o.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="text-xs font-medium text-black hover:underline"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
