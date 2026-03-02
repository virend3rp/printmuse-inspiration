"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  async function fetchCart() {
    try {
      const res = await apiFetch("/cart");
      setCart(res.data);
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckout() {
    if (!cart?.items?.length) return;

    setProcessing(true);

    try {
      // 1️⃣ Create Order
      const orderRes = await apiFetch("/orders", {
        method: "POST",
      });

      const order = orderRes.data;

      // 2️⃣ Create Razorpay Payment
      const paymentRes = await apiFetch(
        `/orders/${order.id}/pay`,
        { method: "POST" }
      );

      const { razorpay_order_id } = paymentRes.data;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: order.total,
        currency: "INR",
        order_id: razorpay_order_id,
        handler: function () {
          router.push("/orders/success");
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      alert("Checkout failed");
    } finally {
      setProcessing(false);
    }
  }

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="min-h-screen bg-neutral-100 p-10">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-6">
          Order Summary
        </h1>

        {cart?.items?.map((item: any) => (
          <div
            key={item.id}
            className="flex justify-between border-b py-3"
          >
            <span>
              {item.variant_name} × {item.qty}
            </span>
            <span>₹{item.price * item.qty}</span>
          </div>
        ))}

        <div className="flex justify-between text-xl font-semibold mt-6">
          <span>Total</span>
          <span>₹{cart?.total}</span>
        </div>

        <button
          onClick={handleCheckout}
          disabled={processing}
          className="w-full mt-8 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {processing ? "Processing..." : "Pay Now"}
        </button>
      </div>
    </div>
  );
}