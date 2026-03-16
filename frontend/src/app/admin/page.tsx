"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

interface Stat {
  label: string;
  value: string | number;
  sub?: string;
  href?: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          apiFetch("/admin/orders"),
          apiFetch("/admin/products"),
        ]);

        const orders: any[] = ordersRes.data || [];
        const products: any[] = productsRes.data || [];

        const paid = orders.filter((o) => o.status === "paid" || o.status === "delivered");
        const pending = orders.filter((o) => o.status === "pending");
        const revenue = paid.reduce((sum: number, o: any) => sum + (o.total ?? 0), 0);
        const activeProducts = products.filter((p) => p.active);

        setStats([
          {
            label: "Total Revenue",
            value: `₹${revenue.toLocaleString("en-IN")}`,
            sub: `from ${paid.length} paid orders`,
            href: "/admin/orders",
          },
          {
            label: "Total Orders",
            value: orders.length,
            sub: `${pending.length} pending`,
            href: "/admin/orders",
          },
          {
            label: "Active Products",
            value: activeProducts.length,
            sub: `${products.length} total`,
            href: "/admin/products",
          },
        ]);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-pulse">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 bg-neutral-100 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat) => {
            const card = (
              <div className="rounded-xl border border-neutral-200 bg-white p-5 hover:shadow-sm transition">
                <p className="text-xs text-neutral-500 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                {stat.sub && (
                  <p className="text-xs text-neutral-400 mt-1">{stat.sub}</p>
                )}
              </div>
            );

            return stat.href ? (
              <Link key={stat.label} href={stat.href}>
                {card}
              </Link>
            ) : (
              <div key={stat.label}>{card}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
