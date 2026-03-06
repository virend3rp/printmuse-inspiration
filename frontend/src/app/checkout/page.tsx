"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";

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

export default function CheckoutPage() {
  const router = useRouter();

  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState<AddressForm>(EMPTY_ADDRESS);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState<"address" | "summary">("address");

  useEffect(() => {
    apiFetch("/cart")
      .then((res) => setCart(res.data))
      .finally(() => setLoading(false));
  }, []);

  function updateAddress(field: keyof AddressForm, value: string) {
    setAddress((prev) => ({ ...prev, [field]: value }));
  }

  async function handleCheckout() {
    if (!cart?.items?.length || !isAddressComplete(address)) return;

    setProcessing(true);

    try {
      // 1️⃣ Create Order with shipping address
      const orderRes = await apiFetch("/orders", {
        method: "POST",
        body: JSON.stringify({ shipping_address: formatAddress(address) }),
      });

      const order = orderRes.data;

      // 2️⃣ Create Razorpay Payment
      const paymentRes = await apiFetch(`/orders/${order.id}/pay`, {
        method: "POST",
      });

      const { razorpay_order_id } = paymentRes.data;

      // 3️⃣ Open Razorpay modal
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
      alert("Checkout failed. Please try again.");
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <div className="container-system py-20 animate-pulse">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="h-8 bg-neutral-200 rounded w-48" />
          <div className="h-48 bg-neutral-200 rounded-2xl" />
          <div className="h-12 bg-neutral-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!cart?.items?.length) {
    return (
      <div className="container-system py-20 text-center">
        <p className="text-xl font-semibold mb-2">Your cart is empty</p>
        <a href="/products/keychains" className="text-sm text-neutral-500 hover:underline">
          Continue shopping →
        </a>
      </div>
    );
  }

  return (
    <div className="container-system py-12">
      <div className="max-w-2xl mx-auto space-y-8">

        <h1 className="heading-lg">Checkout</h1>

        {/* Step tabs */}
        <div className="flex gap-1 bg-neutral-100 p-1 rounded-xl w-fit">
          {(["address", "summary"] as const).map((s) => (
            <button
              key={s}
              onClick={() => s === "summary" && isAddressComplete(address) ? setStep(s) : setStep("address")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize ${
                step === s ? "bg-white shadow-sm" : "text-neutral-500"
              }`}
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
                  <label className="block text-sm font-medium mb-1">{label}</label>
                  <input
                    value={address[field]}
                    onChange={(e) => updateAddress(field, e.target.value)}
                    placeholder={label}
                    className="w-full border border-neutral-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={() => isAddressComplete(address) && setStep("summary")}
              disabled={!isAddressComplete(address)}
              className="w-full bg-black text-white py-4 rounded-xl font-semibold text-sm hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue to Review
            </button>
          </div>
        )}

        {step === "summary" && (
          <div className="space-y-6">
            {/* Address summary */}
            <div className="bg-neutral-50 rounded-2xl p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold mb-1">Shipping to</p>
                  <p className="text-sm text-neutral-600">{address.name}</p>
                  <p className="text-sm text-neutral-600">{address.line1}, {address.city}, {address.state} {address.pincode}</p>
                  <p className="text-sm text-neutral-600">{address.phone}</p>
                </div>
                <button
                  onClick={() => setStep("address")}
                  className="text-xs text-neutral-500 hover:underline"
                >
                  Edit
                </button>
              </div>
            </div>

            {/* Items */}
            <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-2xl overflow-hidden">
              {cart.items.map((item: any) => (
                <div key={item.id} className="flex justify-between px-5 py-4">
                  <div>
                    <p className="text-sm font-medium">{item.variant_name ?? item.name}</p>
                    <p className="text-xs text-neutral-500">Qty: {item.qty}</p>
                  </div>
                  <p className="text-sm font-semibold">₹{item.price * item.qty}</p>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex justify-between items-center border-t border-neutral-200 pt-4">
              <p className="font-semibold">Total</p>
              <p className="text-2xl font-bold">₹{cart.total}</p>
            </div>

            <button
              onClick={handleCheckout}
              disabled={processing}
              className="w-full bg-black text-white py-4 rounded-xl font-semibold text-sm hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {processing ? "Processing..." : "Pay Now"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
