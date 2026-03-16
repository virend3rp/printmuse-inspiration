"use client";

import { Suspense, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
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
      router.refresh();
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    background: "var(--color-surface-2)",
    border: "1px solid var(--color-border)",
    color: "var(--color-text-primary)",
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--color-bg)" }}>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md p-8 rounded-2xl flex flex-col gap-5"
        style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
      >
        <h1 className="text-2xl font-bold text-center forge-title">Login</h1>

        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] placeholder:text-[var(--color-text-muted)]"
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] placeholder:text-[var(--color-text-muted)]"
          style={inputStyle}
        />

        <button
          type="submit"
          disabled={loading || !email || !password}
          className="py-3 rounded-xl font-bold disabled:opacity-40 transition"
          style={{ background: "var(--color-accent)", color: "#111", boxShadow: "0 4px 16px rgba(245,166,35,0.25)" }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-sm text-center" style={{ color: "var(--color-text-secondary)" }}>
          Don&apos;t have an account?{" "}
          <Link
            href={`/register?redirect=${redirect}`}
            className="font-semibold hover:opacity-80 transition"
            style={{ color: "var(--color-accent)" }}
          >
            Register
          </Link>
        </p>
      </form>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
