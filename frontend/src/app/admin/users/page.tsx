"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const res = await apiFetch("/admin/users");
    setUsers(res.data || []);
  }

  async function updateRole(userId: string, role: string) {
    await apiFetch("/admin/users/role", {
      method: "PUT",
      body: JSON.stringify({
        user_id: userId,
        role,
      }),
    });

    fetchUsers();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Users</h1>

      {users.length === 0 && (
        <p style={{ color: "var(--color-text-secondary)" }}>No users found.</p>
      )}
      {users.map((u) => (
        <div
          key={u.id}
          className="p-4 mb-2 rounded-xl flex justify-between items-center"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
        >
          <div style={{ color: "var(--color-text-primary)" }}>
            <span>{u.email}</span>
            <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--color-surface-2)", color: "var(--color-accent)" }}>{u.role}</span>
          </div>

          <select
            value={u.role}
            onChange={(e) => updateRole(u.id, e.target.value)}
            className="rounded-lg px-3 py-1.5 text-sm"
            style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text-primary)" }}
          >
            <option value="customer">customer</option>
            <option value="admin">admin</option>
          </select>
        </div>
      ))}
    </div>
  );
}