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
      (o: any) => o.status === "paid"
    );

    const chartData = paidOrders.map((o: any) => ({
      date: new Date(o.created_at).toLocaleDateString(),
      revenue: o.total,
    }));

    setData(chartData);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Revenue</h1>

      <LineChart width={700} height={400} data={data}>
        <CartesianGrid stroke="#ccc" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="revenue" stroke="#000" />
      </LineChart>
    </div>
  );
}