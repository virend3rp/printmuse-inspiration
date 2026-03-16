"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";

type AddressForm = {
  name: string;
  phone: string;
  line1: string;
  city: string;
  state: string;
  pincode: string;
};

const EMPTY_ADDRESS: AddressForm = {
  name: "",
  phone: "",
  line1: "",
  city: "",
  state: "",
  pincode: "",
};

function formatAddress(a: AddressForm) {
  return `${a.name}, ${a.phone} — ${a.line1}, ${a.city}, ${a.state} ${a.pincode}`;
}

function isAddressComplete(a: AddressForm) {
  return Object.values(a).every((v) => v.trim() !== "");
}

const inputStyle = {
  background: "var(--color-surface-2)",
  border: "1px solid var(--color-border)",
  color: "var(--color-text-primary)",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const toast = useToast();

  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState<AddressForm>(EMPTY_ADDRESS);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState<"address" | "summary">("address");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/checkout");
      return;
    }
    if (!authLoading && user) {
      apiFetch("/cart")
        .then((res) => setCart(res.data))
        .finally(() => setLoading(false));
    }
  }, [user, authLoading]);

  function updateAddress(field: keyof AddressForm, value: string) {
    setAddress((prev) => ({ ...prev, [field]: value }));
  }

  async function handleCheckout() {
    if (!cart?.items?.length || !isAddressComplete(address)) return;

    setProcessing(true);

    try {
      const orderRes = await apiFetch("/orders", {
        method: "POST",
        body: JSON.stringify({ shipping_address: formatAddress(address) }),
      });

      const order = orderRes.data;

      const paymentRes = await apiFetch(`/orders/${order.id}/pay`, {
        method: "POST",
      });

      const { razorpay_order_id } = paymentRes.data;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.total * 100,
        currency: "INR",
        order_id: razorpay_order_id,
        handler: function () {
          router.push(`/orders/${order.id}?success=1`);
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch {
      toast("Checkout failed. Please try again.", "error");
      setProcessing(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="container-system py-20 animate-pulse">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="h-8 rounded w-48" style={{ background: "var(--color-surface-2)" }} />
          <div className="h-48 rounded-2xl" style={{ background: "var(--color-surface-2)" }} />
          <div className="h-12 rounded-xl" style={{ background: "var(--color-surface-2)" }} />
        </div>
      </div>
    );
  }

  if (!cart?.items?.length) {
    return (
      <div className="container-system py-20 text-center">
        <p className="text-xl font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>Your cart is empty</p>
        <Link href="/products/keychains" className="text-sm hover:text-[var(--color-accent)] transition-colors" style={{ color: "var(--color-text-secondary)" }}>
          Continue shopping →
        </Link>
      </div>
    );
  }

  return (
    <div className="container-system py-12">
      <div className="max-w-2xl mx-auto space-y-8">

        <h1 className="heading-lg" style={{ color: "var(--color-text-primary)" }}>Checkout</h1>

        {/* Step tabs */}
        <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: "var(--color-surface-2)" }}>
          {(["address", "summary"] as const).map((s) => (
            <button
              key={s}
              onClick={() => s === "summary" && isAddressComplete(address) ? setStep(s) : setStep("address")}
              className="px-4 py-2 rounded-lg text-sm font-medium transition capitalize"
              style={
                step === s
                  ? { background: "var(--color-accent)", color: "#111", fontWeight: 700 }
                  : { color: "var(--color-text-secondary)" }
              }
            >
              {s === "address" ? "1. Address" : "2. Review & Pay"}
            </button>
          ))}
        </div>

        {step === "address" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {(
                [
                  { field: "name", label: "Full Name", cols: 2 },
                  { field: "phone", label: "Phone Number", cols: 2 },
                  { field: "line1", label: "Address Line", cols: 2 },
                  { field: "city", label: "City", cols: 1 },
                  { field: "state", label: "State", cols: 1 },
                  { field: "pincode", label: "Pincode", cols: 1 },
                ] as const
              ).map(({ field, label, cols }) => (
                <div key={field} className={cols === 2 ? "col-span-2" : ""}>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--color-text-secondary)" }}>{label}</label>
                  <input
                    value={address[field]}
                    onChange={(e) => updateAddress(field, e.target.value)}
                    placeholder={label}
                    className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] placeholder:text-[var(--color-text-muted)]"
                    style={inputStyle}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={() => isAddressComplete(address) && setStep("summary")}
              disabled={!isAddressComplete(address)}
              className="w-full py-4 rounded-xl font-bold text-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "var(--color-accent)", color: "#111", boxShadow: "0 4px 20px rgba(245,166,35,0.25)" }}
            >
              Continue to Review
            </button>
          </div>
        )}

        {step === "summary" && (
          <div className="space-y-6">
            {/* Address summary */}
            <div className="rounded-2xl p-5" style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: "var(--color-text-primary)" }}>Shipping to</p>
                  <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{address.name}</p>
                  <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{address.line1}, {address.city}, {address.state} {address.pincode}</p>
                  <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{address.phone}</p>
                </div>
                <button
                  onClick={() => setStep("address")}
                  className="text-xs hover:text-[var(--color-accent)] transition-colors"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Edit
                </button>
              </div>
            </div>

            {/* Items */}
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--color-border)" }}>
              {cart.items.map((item: any, i: number) => (
                <div
                  key={item.id}
                  className="flex justify-between px-5 py-4"
                  style={{
                    borderTop: i > 0 ? "1px solid var(--color-border)" : undefined,
                    background: "var(--color-surface)",
                  }}
                >
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>{item.variant_name ?? item.name}</p>
                    <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>Qty: {item.qty}</p>
                  </div>
                  <p className="text-sm font-semibold" style={{ color: "var(--color-accent)" }}>₹{item.price * item.qty}</p>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex justify-between items-center pt-4" style={{ borderTop: "1px solid var(--color-border)" }}>
              <p className="font-semibold" style={{ color: "var(--color-text-primary)" }}>Total</p>
              <p className="text-2xl font-bold" style={{ color: "var(--color-accent)" }}>₹{cart.total}</p>
            </div>

            <button
              onClick={handleCheckout}
              disabled={processing}
              className="w-full py-4 rounded-xl font-bold text-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "var(--color-accent)", color: "#111", boxShadow: "0 4px 20px rgba(245,166,35,0.25)" }}
            >
              {processing ? "Processing..." : "Pay Now"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
