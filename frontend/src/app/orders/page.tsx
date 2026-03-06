"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

const STATUS_STYLES: Record<string, string> = {
  pending:   "bg-amber-50 text-amber-700",
  paid:      "bg-blue-50 text-blue-700",
  shipped:   "bg-indigo-50 text-indigo-700",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-600",
  expired:   "bg-neutral-100 text-neutral-500",
};

function OrderSkeleton() {
  return (
    <div className="animate-pulse border border-neutral-200 rounded-2xl p-5 space-y-3">
      <div className="flex justify-between">
        <div className="h-4 bg-neutral-200 rounded w-40" />
        <div className="h-5 bg-neutral-200 rounded w-20" />
      </div>
      <div className="h-3 bg-neutral-200 rounded w-24" />
      <div className="h-4 bg-neutral-200 rounded w-16" />
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
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block border border-neutral-200 rounded-2xl p-5 hover:border-neutral-400 transition group"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-neutral-500 font-mono">
                  #{order.id.slice(0, 8).toUpperCase()}
                </p>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                    STATUS_STYLES[order.status] ?? "bg-neutral-100 text-neutral-600"
                  }`}
                >
                  {order.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-neutral-500">
                  {new Date(order.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                <p className="font-semibold">₹{order.total}</p>
              </div>
              {order.shipping_address && (
                <p className="text-xs text-neutral-400 mt-1 truncate">
                  {order.shipping_address}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
