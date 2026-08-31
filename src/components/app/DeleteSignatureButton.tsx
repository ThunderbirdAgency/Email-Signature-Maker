"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteSignatureButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  async function remove() {
    setBusy(true);
    await fetch(`/api/signatures/${id}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-lg px-2.5 py-2 text-xs font-medium text-ink-400 transition hover:bg-red-50 hover:text-red-600"
      >
        Delete
      </button>
    );
  }

  return (
    <span className="flex items-center gap-1">
      <span className="sr-only">Delete {name}?</span>
      <button
        type="button"
        onClick={remove}
        disabled={busy}
        className="rounded-lg bg-red-600 px-2.5 py-2 text-xs font-semibold text-white transition hover:bg-red-500 disabled:opacity-60"
      >
        {busy ? "Deleting…" : "Confirm"}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="rounded-lg px-2 py-2 text-xs font-medium text-ink-500 hover:text-ink-700"
      >
        Cancel
      </button>
    </span>
  );
}
