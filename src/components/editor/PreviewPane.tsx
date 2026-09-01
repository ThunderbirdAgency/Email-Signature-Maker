"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ScaledSignature } from "@/components/ScaledSignature";
import { MAIL_CLIENTS } from "@/lib/guides";
import { UnlockPanel } from "./UnlockPanel";
import { estimateSize, renderPlainText, renderStandaloneHtml } from "@/lib/signature/render";
import type { Signature } from "@/lib/signature/types";

type Device = "desktop" | "mobile" | "dark";

/**
 * The right-hand half of the editor: what the signature looks like, and every
 * way of getting it out of here.
 */
export function PreviewPane({
  signature,
  html,
  origin,
  shareSlug,
  savedId,
  isEmpty,
  onLoadExample,
  billing,
  onUnlocked,
}: {
  signature: Signature;
  html: string;
  origin: string;
  shareSlug: string | null;
  savedId: string | null;
  isEmpty: boolean;
  onLoadExample: () => void;
  billing: {
    enabled: boolean;
    paid: boolean;
    balance: number;
    price: string;
    packQuantity: number;
    bonusCredits: number;
  };
  onUnlocked: () => void;
}) {
  const [device, setDevice] = useState<Device>("desktop");
  const [showSource, setShowSource] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const holderRef = useRef<HTMLDivElement>(null);

  const plainText = useMemo(() => renderPlainText(signature), [signature]);
  const bytes = useMemo(() => estimateSize(html), [html]);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(null), 2200);
    return () => window.clearTimeout(timer);
  }, [copied]);

  /**
   * Copies the signature as rich text.
   *
   * The async Clipboard API with a text/html flavour is what preserves the
   * formatting on paste. Where it is unavailable or blocked, fall back to
   * selecting a live, off-screen copy of the markup and using execCommand —
   * which is deprecated but remains the only thing that works in older Safari
   * and in Firefox without a user permission prompt.
   */
  async function copyRich() {
    const richHtml = `<meta charset="utf-8">${html}`;

    try {
      if (navigator.clipboard && typeof ClipboardItem !== "undefined") {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/html": new Blob([richHtml], { type: "text/html" }),
            "text/plain": new Blob([plainText], { type: "text/plain" }),
          }),
        ]);
        setCopied("signature");
        return;
      }
    } catch {
      // Fall through to the selection-based path.
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
    setCopied(ok ? "signature" : "failed");
  }

  async function copyText(value: string, key: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
    } catch {
      setCopied("failed");
    }
  }

  function download() {
    const doc = renderStandaloneHtml(signature, { origin });
    const blob = new Blob([doc], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${(signature.details.fullName || "signature").replace(/[^A-Za-z0-9]+/g, "-").toLowerCase()}-signature.htm`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  const shareUrl = shareSlug ? `${origin}/s/${shareSlug}` : null;
  const frameBackground = device === "dark" ? "#1c1c1e" : "#ffffff";

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 bg-white px-5 py-3">
        <div className="flex gap-1 rounded-lg bg-ink-100 p-1">
          {(
            [
              { value: "desktop", label: "Desktop" },
              { value: "mobile", label: "Mobile" },
              { value: "dark", label: "Dark" },
            ] as const
          ).map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={device === option.value}
              onClick={() => setDevice(option.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                device === option.value ? "bg-white text-ink-900 shadow-sm" : "text-ink-500 hover:text-ink-700"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <SizeMeter bytes={bytes} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto thin-scroll bg-ink-100/70 p-5">
        <div
          className={`mx-auto overflow-hidden rounded-xl shadow-sm ring-1 ring-black/5 transition-all ${
            device === "mobile" ? "max-w-[380px]" : "max-w-full"
          }`}
          style={{ background: frameBackground }}
        >
          {isEmpty ? (
            <div className="px-6 py-14 text-center">
              <p className="text-sm font-medium text-ink-700">Your signature will appear here</p>
              <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-ink-400">
                Start by typing your name on the left. Everything updates as you type.
              </p>
              <button
                type="button"
                onClick={onLoadExample}
                className="mt-5 rounded-lg border border-ink-200 bg-white px-4 py-2 text-xs font-semibold text-ink-700 transition hover:bg-ink-50"
              >
                Fill it with an example instead
              </button>
            </div>
          ) : (
            <ScaledSignature
              html={html}
              naturalWidth={signature.style.maxWidth + 48}
              background={frameBackground}
              padding={24}
            />
          )}
        </div>

        {device === "dark" ? (
          <p className="mx-auto mt-3 max-w-lg text-center text-xs leading-relaxed text-ink-500">
            Dark mode is a preview of how your signature sits on a dark background. Mail
            clients differ: some invert light backgrounds automatically, others leave
            them alone. Dark text on a light card is the safest bet.
          </p>
        ) : null}

        <div className="mx-auto mt-6 max-w-2xl space-y-3">
          {billing.enabled && !billing.paid ? (
            <UnlockPanel
              signatureId={savedId}
              balance={billing.balance}
              price={billing.price}
              packQuantity={billing.packQuantity}
              bonusCredits={billing.bonusCredits}
              onUnlocked={onUnlocked}
            />
          ) : null}

          <div
            className={`rounded-xl border border-ink-200 bg-white p-4 ${
              billing.enabled && !billing.paid ? "pointer-events-none opacity-40" : ""
            }`}
            aria-hidden={billing.enabled && !billing.paid}
          >
            <h3 className="text-sm font-semibold text-ink-900">Get your signature</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copyRich}
                className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-500"
              >
                {copied === "signature" ? "Copied — now paste it in" : "Copy signature"}
              </button>
              <button
                type="button"
                onClick={download}
                className="rounded-lg border border-ink-200 px-4 py-2.5 text-sm font-semibold text-ink-700 transition hover:bg-ink-50"
              >
                Download .htm
              </button>
              <button
                type="button"
                onClick={() => copyText(html, "html")}
                className="rounded-lg border border-ink-200 px-4 py-2.5 text-sm font-semibold text-ink-700 transition hover:bg-ink-50"
              >
                {copied === "html" ? "HTML copied" : "Copy HTML source"}
              </button>
              <button
                type="button"
                onClick={() => copyText(plainText, "text")}
                className="rounded-lg border border-ink-200 px-4 py-2.5 text-sm font-semibold text-ink-700 transition hover:bg-ink-50"
              >
                {copied === "text" ? "Text copied" : "Copy plain text"}
              </button>
            </div>

            {copied === "failed" ? (
              <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Your browser blocked the clipboard. Use Copy HTML source, or open the
                share link and copy from there.
              </p>
            ) : null}

            {shareUrl ? (
              <div className="mt-4 border-t border-ink-100 pt-4">
                <p className="text-xs font-medium text-ink-600">Send it to someone else</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-400">
                  A page where they can copy the signature themselves — useful for
                  setting up a colleague.
                </p>
                <div className="mt-2 flex gap-2">
                  <input
                    readOnly
                    value={shareUrl}
                    aria-label="Share link"
                    onFocus={(e) => e.currentTarget.select()}
                    className="w-full rounded-lg border border-ink-200 bg-ink-50 px-3 py-2 font-mono text-xs text-ink-600"
                  />
                  <button
                    type="button"
                    onClick={() => copyText(shareUrl, "share")}
                    className="shrink-0 rounded-lg border border-ink-200 bg-white px-3 py-2 text-xs font-semibold text-ink-700 transition hover:bg-ink-50"
                  >
                    {copied === "share" ? "Copied" : "Copy link"}
                  </button>
                </div>
                {savedId ? (
                  <a
                    href={`/api/vcard/${savedId}`}
                    className="mt-2 inline-block text-xs font-medium text-brand-600 underline-offset-2 hover:underline"
                  >
                    Download contact card (.vcf)
                  </a>
                ) : null}
              </div>
            ) : (
              <p className="mt-4 border-t border-ink-100 pt-4 text-xs leading-relaxed text-ink-400">
                Save this signature to get a share link you can send to someone else.
              </p>
            )}
          </div>

          <div className="rounded-xl border border-ink-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-ink-900">Where are you pasting it?</h3>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {MAIL_CLIENTS.map((client) => (
                <Link
                  key={client.slug}
                  href={`/guides/${client.slug}`}
                  target="_blank"
                  className="rounded-lg border border-ink-200 px-2.5 py-1.5 text-xs font-medium text-ink-600 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                >
                  {client.short}
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-ink-200 bg-white">
            <button
              type="button"
              onClick={() => setShowSource((v) => !v)}
              aria-expanded={showSource}
              className="flex w-full items-center justify-between px-4 py-3 text-left"
            >
              <span className="text-sm font-semibold text-ink-900">HTML source</span>
              <span className="text-xs text-ink-400">{showSource ? "Hide" : "Show"}</span>
            </button>
            {showSource ? (
              <pre className="max-h-72 overflow-auto thin-scroll border-t border-ink-100 bg-ink-950 p-4 font-mono text-[11px] leading-relaxed text-ink-200">
                {html}
              </pre>
            ) : null}
          </div>
        </div>
      </div>

      {/* Off-screen holder for the execCommand copy fallback. It must be in the
          document and visible to the selection API, so it is positioned away
          rather than hidden with display:none. */}
      <div
        ref={holderRef}
        aria-hidden="true"
        style={{ position: "fixed", left: "-10000px", top: 0, width: "600px", opacity: 0 }}
      />
    </div>
  );
}

/**
 * Gmail clips messages beyond roughly 102 KB and its signature box caps out
 * around 10,000 characters, so the weight is worth showing rather than hiding.
 */
function SizeMeter({ bytes }: { bytes: number }) {
  const kb = bytes / 1024;
  const level = bytes < 8000 ? "good" : bytes < 20000 ? "ok" : "heavy";
  const copy =
    level === "good" ? "Light" : level === "ok" ? "Fine" : "Heavy — consider trimming";
  const tone =
    level === "good"
      ? "bg-emerald-50 text-emerald-700"
      : level === "ok"
        ? "bg-amber-50 text-amber-700"
        : "bg-red-50 text-red-700";

  return (
    <span
      title="Signature markup size. Gmail's signature box holds roughly 10,000 characters."
      className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${tone}`}
    >
      {kb < 10 ? kb.toFixed(1) : Math.round(kb)} KB · {copy}
    </span>
  );
}
