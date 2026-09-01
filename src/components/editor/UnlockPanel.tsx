"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * The paywall, shown in place of the export buttons.
 *
 * Everything above this — the editor, the live preview, every template — stays
 * free, so by the time anyone sees this they already know exactly what they are
 * buying. Spending an existing credit is one click; buying is a trip to Stripe.
 */
export function UnlockPanel({
  signatureId,
  balance,
  price,
  packQuantity,
  bonusCredits,
  onUnlocked,
}: {
  signatureId: string | null;
  balance: number;
  price: string;
  packQuantity: number;
  bonusCredits: number;
  onUnlocked: () => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function unlock() {
    if (!signatureId) return;
    setBusy("unlock");
    setError(null);
    try {
      const response = await fetch(`/api/signatures/${signatureId}/unlock`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Could not unlock this signature.");
        return;
      }
      onUnlocked();
    } catch {
      setError("Could not reach the server.");
    } finally {
      setBusy(null);
    }
  }

  async function buy(quantity: number) {
    setBusy(`buy-${quantity}`);
    setError(null);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      const data = await response.json();
      if (!response.ok || !data.url) {
        setError(data.error ?? "Could not start checkout.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Could not reach the server.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="rounded-xl border border-ink-200 bg-white p-5">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 ring-1 ring-brand-100">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5Zm-3 8V7a3 3 0 1 1 6 0v3H9Z" />
          </svg>
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-ink-900">Ready to use it?</h3>
          <p className="mt-1 text-sm leading-relaxed text-ink-500">
            {balance > 0
              ? `You have ${balance} credit${balance === 1 ? "" : "s"}. Use one to unlock this signature — then copy, download and share it, and edit it forever.`
              : `Copying, downloading and sharing costs ${price}, once. Edit it as often as you like afterwards at no extra cost.`}
          </p>
        </div>
      </div>

      {!signatureId ? (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-800">
          Save this signature first — a credit is spent against a saved signature so
          it stays unlocked when you come back.
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {balance > 0 ? (
          <button
            type="button"
            onClick={unlock}
            disabled={!signatureId || busy !== null}
            className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:opacity-60"
          >
            {busy === "unlock" ? "Unlocking…" : "Use 1 credit to unlock"}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => buy(1)}
              disabled={busy !== null}
              className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:opacity-60"
            >
              {busy === "buy-1" ? "Opening checkout…" : `Unlock for ${price}`}
            </button>
            <button
              type="button"
              onClick={() => buy(packQuantity)}
              disabled={busy !== null}
              className="rounded-lg border border-ink-200 px-4 py-2.5 text-sm font-semibold text-ink-700 transition hover:bg-ink-50 disabled:opacity-60"
            >
              {busy === `buy-${packQuantity}`
                ? "Opening checkout…"
                : `Office pack — ${packQuantity} + ${bonusCredits} free`}
            </button>
          </>
        )}
      </div>

      {error ? (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2.5 text-xs text-red-700">{error}</p>
      ) : null}

      <p className="mt-3 text-xs text-ink-400">
        Buy {packQuantity} in a year and {bonusCredits} more are added free.{" "}
        <Link href="/pricing" className="font-medium text-brand-600 underline-offset-2 hover:underline">
          How pricing works
        </Link>
      </p>
    </div>
  );
}
