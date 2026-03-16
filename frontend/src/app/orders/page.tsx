"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  pending:   { bg: "rgba(245,166,35,0.15)",  color: "#f5a623" },
  paid:      { bg: "rgba(96,165,250,0.15)",  color: "#60a5fa" },
  shipped:   { bg: "rgba(129,140,248,0.15)", color: "#818cf8" },
  delivered: { bg: "rgba(74,222,128,0.15)",  color: "#4ade80" },
  cancelled: { bg: "rgba(248,113,113,0.15)", color: "#f87171" },
  expired:   { bg: "rgba(100,90,80,0.2)",    color: "#8f8070" },
};

function OrderSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl p-5 space-y-3" style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
      <div className="flex justify-between">
        <div className="h-4 rounded w-40" style={{ background: "var(--color-surface-2)" }} />
        <div className="h-5 rounded w-20" style={{ background: "var(--color-surface-2)" }} />
      </div>
      <div className="h-3 rounded w-24" style={{ background: "var(--color-surface-2)" }} />
      <div className="h-4 rounded w-16" style={{ background: "var(--color-surface-2)" }} />
    </div>
  );
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/orders");
      return;
    }

    if (!authLoading && user) {
      apiFetch("/orders")
        .then((res) => setOrders(res.data ?? []))
        .finally(() => setLoading(false));
    }
  }, [user, authLoading]);

  return (
    <div className="container-system py-12 max-w-3xl">
      <h1 className="heading-lg mb-8">My Orders</h1>

      {loading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => <OrderSkeleton key={i} />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg font-semibold mb-2">No orders yet</p>
          <p className="text-neutral-500 text-sm mb-6">
            Looks like you haven't placed any orders.
          </p>
          <Link href="/products/keychains" className="btn-primary">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const badge = STATUS_STYLES[order.status] ?? { bg: "rgba(100,90,80,0.2)", color: "#8f8070" };
            return (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block rounded-2xl p-5 transition"
              style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)" }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-mono" style={{ color: "var(--color-text-secondary)" }}>
                  #{order.id.slice(0, 8).toUpperCase()}
                </p>
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize"
                  style={{ background: badge.bg, color: badge.color }}
                >
                  {order.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  {new Date(order.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                <p className="font-semibold" style={{ color: "var(--color-text-primary)" }}>₹{order.total}</p>
              </div>
              {order.shipping_address && (
                <p className="text-xs mt-1 truncate" style={{ color: "var(--color-text-muted)" }}>
                  {order.shipping_address}
                </p>
              )}
            </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
