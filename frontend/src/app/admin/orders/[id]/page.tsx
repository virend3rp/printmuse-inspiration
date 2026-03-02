"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    fetchOrder();
  }, []);

  async function fetchOrder() {
    const res = await apiFetch(`/admin/orders/${id}`);
    setOrder(res.data);
  }

  if (!order) return <p>Loading order...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        Order #{order.id}
      </h1>

      <p>Status: {order.status}</p>
      <p>Total: ₹{order.total}</p>

      <h2 className="mt-6 font-semibold">Items</h2>
      {order.items.map((item: any) => (
        <div key={item.id} className="border p-3 mt-2 rounded">
          {item.name} — Qty: {item.qty}
        </div>
      ))}
    </div>
  );
}