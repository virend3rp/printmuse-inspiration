"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/layout/Navbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login?redirect=/admin");
      return;
    }

    if (user.role !== "admin") {
      router.replace("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return null;
  }

  if (!user || user.role !== "admin") {
    return null;
  }

function linkClass(href: string) {
  let active = false;

  if (href === "/admin") {
    active = pathname === "/admin";
  } else {
    active =
      pathname === href ||
      pathname.startsWith(href + "/");
  }

  return `px-3 py-2 rounded-md text-sm transition ${
    active
      ? "bg-black text-white"
      : "text-neutral-700 hover:bg-neutral-100"
  }`;
}

  return (
    <>

      <div className="min-h-screen bg-neutral-50 flex">
        {/* Sidebar */}
        <aside className="w-60 bg-white border-r p-6 flex flex-col justify-between">
          <div className="space-y-8">
            <h2 className="font-bold text-lg">Admin Panel</h2>

            <nav className="flex flex-col gap-2">
              <Link href="/admin" className={linkClass("/admin")}>
                Dashboard
              </Link>

              <Link
                href="/admin/products"
                className={linkClass("/admin/products")}
              >
                Products
              </Link>

              <Link
                href="/admin/orders"
                className={linkClass("/admin/orders")}
              >
                Orders
              </Link>
            </nav>
          </div>

          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="text-sm text-neutral-600 hover:text-black"
          >
            Logout
          </button>
        </aside>

        {/* Content */}
        <main className="flex-1 p-10">{children}</main>
      </div>
    </>
  );
}