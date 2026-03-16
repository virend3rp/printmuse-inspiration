"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
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

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending:   ["cancelled"],
  paid:      ["shipped", "cancelled"],
  shipped:   ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
  expired:   [],
};

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const toast = useToast();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    apiFetch(`/admin/orders/${id}`)
      .then((res) => {
        setOrder(res.data);
        setSelectedStatus(res.data?.status ?? "");
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleStatusUpdate() {
    if (!selectedStatus || selectedStatus === order?.status) return;
    setUpdating(true);
    try {
      await apiFetch("/admin/orders/status", {
        method: "PUT",
        body: JSON.stringify({ order_id: order.id, status: selectedStatus }),
      });
      setOrder((prev: any) => ({ ...prev, status: selectedStatus }));
      toast("Order status updated", "success");
    } catch {
      toast("Failed to update status", "error");
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4 max-w-2xl">
        <div className="h-8 rounded w-1/3" style={{ background: "var(--color-surface-2)" }} />
        <div className="h-40 rounded-xl" style={{ background: "var(--color-surface-2)" }} />
        <div className="h-32 rounded-xl" style={{ background: "var(--color-surface-2)" }} />
      </div>
    );
  }

  if (!order) {
    return (
      <div>
        <p style={{ color: "var(--color-text-secondary)" }}>Order not found.</p>
        <Link href="/admin/orders" className="text-sm hover:underline mt-2 block" style={{ color: "var(--color-accent)" }}>
          ← Back to orders
        </Link>
      </div>
    );
  }

  const badge = STATUS_STYLES[order.status] ?? { bg: "rgba(100,90,80,0.2)", color: "#8f8070" };
  const nextStatuses = VALID_TRANSITIONS[order.status] ?? [];

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/orders"
            className="text-xs transition mb-1 block hover:underline"
            style={{ color: "var(--color-text-muted)" }}
          >
            ← Orders
          </Link>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>Order Detail</h1>
          <p className="text-xs font-mono mt-0.5" style={{ color: "var(--color-text-muted)" }}>{order.id}</p>
        </div>
        <span
          className="px-3 py-1 rounded-full text-xs font-semibold capitalize"
          style={{ background: badge.bg, color: badge.color }}
        >
          {order.status}
        </span>
      </div>

      {/* Summary */}
      <div className="rounded-xl p-5 space-y-3" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <div className="flex justify-between text-sm">
          <span style={{ color: "var(--color-text-secondary)" }}>Total</span>
          <span className="font-semibold" style={{ color: "var(--color-accent)" }}>₹{order.total}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span style={{ color: "var(--color-text-secondary)" }}>Placed on</span>
          <span style={{ color: "var(--color-text-primary)" }}>
            {new Date(order.created_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
        {order.shipping_address && (
          <div className="flex justify-between text-sm gap-4">
            <span style={{ color: "var(--color-text-secondary)" }}>Ship to</span>
            <span className="text-right" style={{ color: "var(--color-text-primary)" }}>{order.shipping_address}</span>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--color-border)" }}>
        <div className="px-5 py-3 text-sm font-medium" style={{ background: "var(--color-surface-2)", color: "var(--color-text-primary)", borderBottom: "1px solid var(--color-border)" }}>
          Items
        </div>
        <div>
          {order.items?.map((item: any, i: number) => (
            <div
              key={item.id}
              className="flex justify-between px-5 py-3 text-sm"
              style={{ background: "var(--color-surface)", borderTop: i > 0 ? "1px solid var(--color-border)" : undefined }}
            >
              <div>
                <p className="font-medium" style={{ color: "var(--color-text-primary)" }}>{item.name ?? "Item"}</p>
                <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>Qty: {item.qty}</p>
              </div>
              <p className="font-medium" style={{ color: "var(--color-accent)" }}>₹{item.price * item.qty}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Status update */}
      <div className="rounded-xl p-5" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <p className="text-sm font-medium mb-3" style={{ color: "var(--color-text-primary)" }}>Update Status</p>
        {nextStatuses.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No further status transitions available.</p>
        ) : (
          <div className="flex gap-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="flex-1 rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text-primary)" }}
            >
              <option value={order.status}>{order.status.charAt(0).toUpperCase() + order.status.slice(1)} (current)</option>
              {nextStatuses.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
            <button
              onClick={handleStatusUpdate}
              disabled={updating || selectedStatus === order.status}
              className="px-4 py-2 text-sm rounded-lg font-medium transition disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "var(--color-accent)", color: "#111" }}
            >
              {updating ? "Saving…" : "Save"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
