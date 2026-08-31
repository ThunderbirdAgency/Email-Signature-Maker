"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SignatureFrame } from "@/components/SignatureFrame";
import { MAIL_CLIENTS } from "@/lib/guides";

/**
 * The recipient-facing half of a share link.
 *
 * Someone landing here is usually a colleague being set up by a teammate, so
 * the job is narrow: show the signature, copy it with formatting intact, and
 * point at the right install guide.
 */
export function SharedSignature({
  html,
  plain,
  vcardId,
  who,
}: {
  html: string;
  plain: string;
  vcardId: string;
  who: string;
}) {
  const [copied, setCopied] = useState<string | null>(null);
  const holderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(null), 2200);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function copyRich() {
    try {
      if (navigator.clipboard && typeof ClipboardItem !== "undefined") {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/html": new Blob([`<meta charset="utf-8">${html}`], { type: "text/html" }),
            "text/plain": new Blob([plain], { type: "text/plain" }),
          }),
        ]);
        setCopied("rich");
        return;
      }
    } catch {
      // Fall through to the selection-based path below.
    }

    const holder = holderRef.current;
    if (!holder) {
      setCopied("failed");
      return;
    }
    holder.innerHTML = html;
    const range = document.createRange();
    range.selectNodeContents(holder);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    const ok = document.execCommand("copy");
    selection?.removeAllRanges();
    holder.innerHTML = "";
    setCopied(ok ? "rich" : "failed");
  }

  return (
    <>
      <div className="mt-8 overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-sm">
        <SignatureFrame html={html} padding={26} title={`${who}'s signature`} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copyRich}
          className="rounded-lg bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-500"
        >
          {copied === "rich" ? "Copied — now paste it in" : "Copy signature"}
        </button>
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(html);
              setCopied("html");
            } catch {
              setCopied("failed");
            }
          }}
          className="rounded-lg border border-ink-200 px-5 py-3 text-sm font-semibold text-ink-700 transition hover:bg-ink-50"
        >
          {copied === "html" ? "HTML copied" : "Copy HTML source"}
        </button>
        <a
          href={`/api/vcard/${vcardId}`}
          className="rounded-lg border border-ink-200 px-5 py-3 text-sm font-semibold text-ink-700 transition hover:bg-ink-50"
        >
          Save contact (.vcf)
        </a>
      </div>

      {copied === "failed" ? (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
          Your browser blocked the clipboard. Select the signature above by hand and copy
          it, or use Copy HTML source.
        </p>
      ) : null}

      <div className="mt-8">
        <h2 className="text-sm font-semibold text-ink-900">Where are you pasting it?</h2>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {MAIL_CLIENTS.map((client) => (
            <Link
              key={client.slug}
              href={`/guides/${client.slug}`}
              className="rounded-lg border border-ink-200 px-3 py-2 text-xs font-medium text-ink-600 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
            >
              {client.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Off-screen holder for the execCommand copy fallback; it has to be in
          the document and selectable, so it is moved away rather than hidden. */}
      <div
        ref={holderRef}
        aria-hidden="true"
        style={{ position: "fixed", left: "-10000px", top: 0, width: "600px", opacity: 0 }}
      />
    </>
  );
}
