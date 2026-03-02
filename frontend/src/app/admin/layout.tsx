"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=/admin");
      return;
    }
    if (user.role !== "admin") {
      router.push("/");
    }
  }, [user]);

  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-60 bg-black text-white p-6 flex flex-col gap-4">
        <h2 className="text-xl font-bold">Admin</h2>

        <Link href="/admin">Dashboard</Link>
        <Link href="/admin/products">Products</Link>
        <Link href="/admin/orders">Orders</Link>
        <Link href="/admin/analytics">Analytics</Link>
      </aside>

      {/* Content */}
      <main className="flex-1 p-8 bg-gray-50">{children}</main>
    </div>
  );
}