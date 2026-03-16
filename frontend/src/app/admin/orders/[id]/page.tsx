"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import Link from "next/link";

const STATUSES = ["pending", "confirmed", "paid", "shipped", "delivered", "cancelled"];

const STATUS_STYLES: Record<string, string> = {
  pending:   "bg-yellow-50 text-yellow-700",
  paid:      "bg-green-50 text-green-700",
  shipped:   "bg-blue-50 text-blue-700",
  delivered: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-red-50 text-red-600",
  expired:   "bg-neutral-100 text-neutral-500",
  confirmed: "bg-purple-50 text-purple-700",
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
        <div className="h-8 bg-neutral-100 rounded w-1/3" />
        <div className="h-40 bg-neutral-100 rounded-xl" />
        <div className="h-32 bg-neutral-100 rounded-xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div>
        <p className="text-neutral-500">Order not found.</p>
        <Link href="/admin/orders" className="text-sm hover:underline mt-2 block">
          ← Back to orders
        </Link>
      </div>
    );
  }

  const badgeCls = STATUS_STYLES[order.status] ?? "bg-neutral-100 text-neutral-500";

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/orders"
            className="text-xs text-neutral-400 hover:text-black transition mb-1 block"
          >
            ← Orders
          </Link>
          <h1 className="text-2xl font-bold">Order Detail</h1>
          <p className="text-xs font-mono text-neutral-400 mt-0.5">{order.id}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${badgeCls}`}>
          {order.status}
        </span>
      </div>

      {/* Summary card */}
      <div className="rounded-xl border border-neutral-200 bg-white p-5 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-neutral-500">Total</span>
          <span className="font-semibold">₹{order.total}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-neutral-500">Placed on</span>
          <span>
            {new Date(order.created_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
        {order.shipping_address && (
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500">Ship to</span>
            <span className="text-right max-w-xs">{order.shipping_address}</span>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
        <div className="px-5 py-3 border-b border-neutral-100 text-sm font-medium">
          Items
        </div>
        <div className="divide-y divide-neutral-100">
          {order.items?.map((item: any) => (
            <div key={item.id} className="flex justify-between px-5 py-3 text-sm">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-neutral-400 text-xs">Qty: {item.qty}</p>
              </div>
              <p className="font-medium">₹{item.price * item.qty}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Status update */}
      <div className="rounded-xl border border-neutral-200 bg-white p-5">
        <p className="text-sm font-medium mb-3">Update Status</p>
        <div className="flex gap-3">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="flex-1 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
          <button
            onClick={handleStatusUpdate}
            disabled={updating || selectedStatus === order.status}
            className="px-4 py-2 bg-black text-white text-sm rounded-lg font-medium hover:opacity-80 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {updating ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
