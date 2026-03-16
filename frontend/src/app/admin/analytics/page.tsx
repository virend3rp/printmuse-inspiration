"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    const res = await apiFetch("/admin/orders");
    const orders = res.data || [];

    const paidOrders = orders.filter(
      (o: any) => ["paid", "shipped", "delivered"].includes(o.status)
    );

    const chartData = paidOrders.map((o: any) => ({
      date: new Date(o.created_at).toLocaleDateString("en-IN"),
      revenue: Math.round(o.total / 100),
    }));

    setData(chartData);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--color-text-primary)" }}>Revenue</h1>

      {data.length === 0 ? (
        <p style={{ color: "var(--color-text-secondary)" }}>No paid orders yet — chart will appear once orders come in.</p>
      ) : (
        <LineChart width={700} height={400} data={data} style={{ background: "var(--color-surface)", borderRadius: 12, padding: 16 }}>
          <CartesianGrid stroke="#2e2820" />
          <XAxis dataKey="date" stroke="#8f8070" tick={{ fill: "#8f8070", fontSize: 12 }} />
          <YAxis stroke="#8f8070" tick={{ fill: "#8f8070", fontSize: 12 }} />
          <Tooltip contentStyle={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text-primary)" }} />
          <Line type="monotone" dataKey="revenue" stroke="#f5a623" strokeWidth={2} dot={{ fill: "#f5a623" }} />
        </LineChart>
      )}
    </div>
  );
}