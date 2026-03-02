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

      {users.map((u) => (
        <div
          key={u.id}
          className="border p-4 mb-2 rounded flex justify-between"
        >
          <div>
            {u.email} — {u.role}
          </div>

          <select
            value={u.role}
            onChange={(e) =>
              updateRole(u.id, e.target.value)
            }
          >
            <option value="customer">customer</option>
            <option value="admin">admin</option>
          </select>
        </div>
      ))}
    </div>
  );
}