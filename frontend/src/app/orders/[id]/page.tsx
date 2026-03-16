"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/useToast";

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  pending:   { bg: "rgba(245,166,35,0.15)",  color: "#f5a623" },
  paid:      { bg: "rgba(96,165,250,0.15)",  color: "#60a5fa" },
  shipped:   { bg: "rgba(129,140,248,0.15)", color: "#818cf8" },
  delivered: { bg: "rgba(74,222,128,0.15)",  color: "#4ade80" },
  cancelled: { bg: "rgba(248,113,113,0.15)", color: "#f87171" },
  expired:   { bg: "rgba(100,90,80,0.2)",    color: "#8f8070" },
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
        <div className="h-5 rounded w-48" style={{ background: "var(--color-surface-2)" }} />
        <div className="h-8 rounded w-64" style={{ background: "var(--color-surface-2)" }} />
        <div className="h-24 rounded-2xl" style={{ background: "var(--color-surface-2)" }} />
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-16 rounded-xl" style={{ background: "var(--color-surface-2)" }} />
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
      <div className="border-b" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
        <div className="container-system py-3">
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            <Link href="/orders" className="hover:text-[var(--color-accent)] transition-colors">My Orders</Link>
            <span className="mx-2">/</span>
            <span className="font-mono" style={{ color: "var(--color-text-primary)" }}>
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
            className="text-sm font-semibold px-3 py-1.5 rounded-full capitalize"
            style={STATUS_STYLES[order.status] ?? { bg: "rgba(100,90,80,0.2)", color: "#8f8070" }}
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
                  className="text-xs font-medium capitalize"
                  style={{ color: i <= currentStep ? "var(--color-accent)" : "var(--color-text-muted)" }}
                >
                  {step}
                </span>
              ))}
            </div>
            <div className="w-full rounded-full h-1.5" style={{ background: "var(--color-surface-3)" }}>
              <div
                className="h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${((currentStep) / (STATUS_STEPS.length - 1)) * 100}%`, background: "var(--color-accent)" }}
              />
            </div>
          </div>
        )}

        {/* Shipping Address */}
        {order.shipping_address && (
          <div className="rounded-2xl p-5" style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}>
            <p className="text-sm font-semibold mb-1" style={{ color: "var(--color-text-primary)" }}>Shipping Address</p>
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{order.shipping_address}</p>
          </div>
        )}

        {/* Items */}
        <div>
          <p className="text-sm font-semibold mb-3" style={{ color: "var(--color-text-primary)" }}>Items</p>
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--color-border)" }}>
            {items.length === 0 ? (
              <p className="text-sm p-5" style={{ color: "var(--color-text-secondary)" }}>No items found.</p>
            ) : (
              items.map((item: any, i: number) => (
                <div key={item.id} className="flex items-center justify-between px-5 py-4" style={{ borderTop: i > 0 ? "1px solid var(--color-border)" : undefined, background: "var(--color-surface)" }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>{item.name ?? "Item"}</p>
                    <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>Qty: {item.qty}</p>
                  </div>
                  <p className="text-sm font-semibold" style={{ color: "var(--color-accent)" }}>₹{item.price * item.qty}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center pt-5" style={{ borderTop: "1px solid var(--color-border)" }}>
          <p className="font-semibold" style={{ color: "var(--color-text-primary)" }}>Total</p>
          <p className="text-2xl font-bold" style={{ color: "var(--color-accent)" }}>₹{order.total}</p>
        </div>

        {/* Pay now if still pending */}
        {order.status === "pending" && (
          <button
            onClick={handlePay}
            disabled={paying}
            className="w-full py-4 rounded-xl font-bold text-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "var(--color-accent)", color: "#111", boxShadow: "0 4px 20px rgba(245,166,35,0.25)" }}
          >
            {paying ? "Opening payment..." : "Complete Payment"}
          </button>
        )}

      </div>
    </div>
  );
}
