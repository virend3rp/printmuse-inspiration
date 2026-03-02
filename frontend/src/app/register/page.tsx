"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirect = searchParams.get("redirect") || "/products";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(email, password);
      router.push(redirect);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-6 rounded shadow flex flex-col gap-4"
      >
        <h1 className="text-2xl font-bold text-center text-red-800">Register</h1>

        {error && (
          <p className="text-red-500 text-sm text-center text-black">{error}</p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border p-2 rounded text-green-900"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border p-2 rounded text-green-900"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-black text-red-100 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Register"}
        </button>

        <p className="text-sm text-center text-black">
          Already have an account?{" "}
          <Link
            href={`/login?redirect=${redirect}`}
            className="text-blue-600 underline"
          >
            Login
          </Link>
        </p>
      </form>
    </main>
  );
}