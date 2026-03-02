"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    const res = await apiFetch("/admin/orders");
    setOrders(res.data || []);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Orders</h1>

      {orders.map((o) => (
        <Link
          key={o.id}
          href={`/admin/orders/${o.id}`}
          className="block border p-4 rounded mb-2"
        >
          Order #{o.id} — {o.status}
        </Link>
      ))}
    </div>
  );
}