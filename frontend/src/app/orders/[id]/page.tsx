"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/useToast";

const STATUS_STYLES: Record<string, string> = {
  pending:   "bg-amber-50 text-amber-700",
  paid:      "bg-blue-50 text-blue-700",
  shipped:   "bg-indigo-50 text-indigo-700",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-600",
  expired:   "bg-neutral-100 text-neutral-500",
};

const STATUS_STEPS = ["pending", "paid", "shipped", "delivered"];

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { refreshCart } = useCart();
  const toast = useToast();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (!authLoading && user) {
      apiFetch(`/orders/${id}`)
        .then((res) => setOrder(res.data))
        .finally(() => setLoading(false));
    }
  }, [id, user, authLoading]);

  async function handlePay() {
    setPaying(true);
    try {
      const paymentRes = await apiFetch(`/orders/${id}/pay`, { method: "POST" });
      const { razorpay_order_id } = paymentRes.data;

      const rzp = new (window as any).Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.total * 100,
        currency: "INR",
        order_id: razorpay_order_id,
        handler: async function () {
          await refreshCart();
          router.push(`/orders/${id}?success=1`);
        },
        modal: {
          ondismiss: () => setPaying(false),
        },
      });
      rzp.open();
    } catch {
      toast("Payment initiation failed. Please try again.", "error");
      setPaying(false);
    }
  }

  if (loading) {
    return (
      <div className="container-system py-12 max-w-3xl animate-pulse space-y-6">
        <div className="h-5 bg-neutral-200 rounded w-48" />
        <div className="h-8 bg-neutral-200 rounded w-64" />
        <div className="h-24 bg-neutral-200 rounded-2xl" />
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-16 bg-neutral-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-system py-20 text-center">
        <p className="text-xl font-semibold">Order not found</p>
        <Link href="/orders" className="text-sm text-neutral-500 hover:underline mt-2 block">
          ← Back to orders
        </Link>
      </div>
    );
  }

  const items: any[] = Array.isArray(order.items) ? order.items : [];
  const currentStep = STATUS_STEPS.indexOf(order.status);

  return (
    <div>
      {/* Breadcrumb */}
      <div className="border-b border-neutral-100">
        <div className="container-system py-3">
          <p className="text-sm text-neutral-400">
            <Link href="/orders" className="hover:underline">My Orders</Link>
            <span className="mx-2">/</span>
            <span className="text-neutral-800 font-mono">
              #{order.id.slice(0, 8).toUpperCase()}
            </span>
          </p>
        </div>
      </div>

      <div className="container-system py-10 max-w-3xl space-y-8">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="heading-lg">Order Details</h1>
            <p className="text-sm text-neutral-500 mt-1">
              Placed on{" "}
              {new Date(order.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <span
            className={`text-sm font-semibold px-3 py-1.5 rounded-full capitalize ${
              STATUS_STYLES[order.status] ?? "bg-neutral-100 text-neutral-600"
            }`}
          >
            {order.status}
          </span>
        </div>

        {/* Progress bar */}
        {currentStep >= 0 && order.status !== "cancelled" && order.status !== "expired" && (
          <div>
            <div className="flex justify-between mb-2">
              {STATUS_STEPS.map((step, i) => (
                <span
                  key={step}
                  className={`text-xs font-medium capitalize ${
                    i <= currentStep ? "text-black" : "text-neutral-400"
                  }`}
                >
                  {step}
                </span>
              ))}
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-1.5">
              <div
                className="bg-black h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${((currentStep) / (STATUS_STEPS.length - 1)) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Shipping Address */}
        {order.shipping_address && (
          <div className="bg-neutral-50 rounded-2xl p-5">
            <p className="text-sm font-semibold mb-1">Shipping Address</p>
            <p className="text-sm text-neutral-600">{order.shipping_address}</p>
          </div>
        )}

        {/* Items */}
        <div>
          <p className="text-sm font-semibold mb-3">Items</p>
          <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-2xl overflow-hidden">
            {items.length === 0 ? (
              <p className="text-sm text-neutral-500 p-5">No items found.</p>
            ) : (
              items.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="text-sm font-medium">{item.name ?? "Item"}</p>
                    <p className="text-xs text-neutral-500">Qty: {item.qty}</p>
                  </div>
                  <p className="text-sm font-semibold">₹{item.price * item.qty}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center border-t border-neutral-200 pt-5">
          <p className="font-semibold">Total</p>
          <p className="text-2xl font-bold">₹{order.total}</p>
        </div>

        {/* Pay now if still pending */}
        {order.status === "pending" && (
          <button
            onClick={handlePay}
            disabled={paying}
            className="w-full bg-black text-white py-4 rounded-xl font-semibold text-sm hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {paying ? "Opening payment..." : "Complete Payment"}
          </button>
        )}

      </div>
    </div>
  );
}
