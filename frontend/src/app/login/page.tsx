"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

const redirect = searchParams.get("redirect") || "/"; 

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();

  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();

  if (!trimmedEmail || !trimmedPassword) {
    setError("Email and password are required.");
    return;
  }

  setError(null);
  setLoading(true);

  try {
    await login(trimmedEmail, trimmedPassword);
    router.push(redirect);
    router.refresh(); // refresh layout so navbar updates
  } catch {
    setError("Invalid email or password.");
  } finally {
    setLoading(false);
  }
}

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-neutral-50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-8 rounded-lg border border-neutral-200 flex flex-col gap-5"
      >
        <h1 className="text-2xl font-semibold text-center">Login</h1>

        {error && (
          <p className="text-red-600 text-sm text-center">{error}</p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border border-neutral-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border border-neutral-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
        />

        <button
          type="submit"
          disabled={loading || !email || !password}
          className="bg-black text-white py-3 rounded-md disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-sm text-center text-neutral-600">
          Don't have an account?{" "}
          <Link
            href={`/register?redirect=${redirect}`}
            className="text-black underline"
          >
            Register
          </Link>
        </p>
      </form>
    </main>
  );
}