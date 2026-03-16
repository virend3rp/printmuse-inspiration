"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  pending:   { bg: "rgba(245,166,35,0.15)",  color: "#f5a623" },
  paid:      { bg: "rgba(96,165,250,0.15)",  color: "#60a5fa" },
  shipped:   { bg: "rgba(129,140,248,0.15)", color: "#818cf8" },
  delivered: { bg: "rgba(74,222,128,0.15)",  color: "#4ade80" },
  cancelled: { bg: "rgba(248,113,113,0.15)", color: "#f87171" },
  expired:   { bg: "rgba(100,90,80,0.2)",    color: "#8f8070" },
  confirmed: { bg: "rgba(167,139,250,0.15)", color: "#a78bfa" },
};

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? { bg: "rgba(100,90,80,0.2)", color: "#8f8070" };
  return (
    <span
      className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
      style={{ background: style.bg, color: style.color }}
    >
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
        <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--color-text-primary)" }}>Orders</h1>
        <div className="animate-pulse space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 rounded-xl" style={{ background: "var(--color-surface-2)" }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--color-text-primary)" }}>Orders</h1>

      {orders.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>No orders yet.</p>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--color-border)" }}>
          <table className="w-full text-sm">
            <thead style={{ background: "var(--color-surface-2)", borderBottom: "1px solid var(--color-border)" }}>
              <tr>
                <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--color-text-secondary)" }}>Order ID</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--color-text-secondary)" }}>Status</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--color-text-secondary)" }}>Total</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--color-text-secondary)" }}>Date</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {orders.map((o, i) => (
                <tr
                  key={o.id}
                  style={{
                    background: "var(--color-surface)",
                    borderTop: i > 0 ? "1px solid var(--color-border)" : undefined,
                  }}
                >
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--color-text-secondary)" }}>
                    {o.id.slice(0, 8)}…
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--color-text-primary)" }}>₹{o.total}</td>
                  <td className="px-4 py-3" style={{ color: "var(--color-text-secondary)" }}>
                    {new Date(o.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="text-xs font-medium hover:underline"
                      style={{ color: "var(--color-accent)" }}
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
