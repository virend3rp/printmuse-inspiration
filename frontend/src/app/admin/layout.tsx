"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

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
      ? "bg-[var(--color-accent)] text-[#111] font-semibold"
      : "text-[#c0b090] hover:text-[var(--color-accent)] hover:bg-[var(--color-surface-2)]"
  }`;
}

  return (
    <>

      <div className="min-h-screen flex" style={{ background: "var(--color-bg)" }}>
        {/* Sidebar */}
        <aside className="w-60 border-r p-6 flex flex-col justify-between" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
          <div className="space-y-8">
            <h2 className="font-bold text-lg forge-title">Admin Panel</h2>

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

              <Link
                href="/admin/users"
                className={linkClass("/admin/users")}
              >
                Users
              </Link>

              <Link
                href="/admin/analytics"
                className={linkClass("/admin/analytics")}
              >
                Analytics
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