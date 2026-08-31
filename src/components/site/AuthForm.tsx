"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * Shared sign-in / sign-up form.
 *
 * Both flows post to their own endpoint and then land on `next`, so someone
 * sent here mid-task returns to exactly where they were.
 */
export function AuthForm({ mode, next }: { mode: "login" | "signup"; next: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "signup" ? { email, password, name } : { email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  const isSignup = mode === "signup";

  return (
    <form onSubmit={submit} className="space-y-4">
      {isSignup ? (
        <div>
          <label htmlFor="name" className="mb-1.5 block text-xs font-medium text-ink-600">
            Name
          </label>
          <input
            id="name"
            value={name}
            autoComplete="name"
            onChange={(e) => setName(e.target.value)}
            placeholder="Avery Sinclair"
            className={FIELD}
          />
        </div>
      ) : null}

      <div>
        <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-ink-600">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          autoComplete="email"
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className={FIELD}
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-ink-600">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={isSignup ? 8 : undefined}
          value={password}
          autoComplete={isSignup ? "new-password" : "current-password"}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={isSignup ? "At least 8 characters" : "Your password"}
          className={FIELD}
        />
      </div>

      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2.5 text-xs text-red-700">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-lg bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:opacity-60"
      >
        {busy ? "One moment…" : isSignup ? "Create account" : "Sign in"}
      </button>

      <p className="text-center text-xs text-ink-500">
        {isSignup ? "Already have an account? " : "No account yet? "}
        <Link
          href={isSignup ? `/login?next=${encodeURIComponent(next)}` : `/signup?next=${encodeURIComponent(next)}`}
          className="font-medium text-brand-600 underline-offset-2 hover:underline"
        >
          {isSignup ? "Sign in" : "Create one"}
        </Link>
      </p>
    </form>
  );
}

const FIELD =
  "w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 " +
  "placeholder:text-ink-300 transition focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/15";
