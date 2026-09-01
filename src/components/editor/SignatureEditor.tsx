"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/site/Logo";
import { useSignatureDraft } from "./useSignatureDraft";
import { DetailsPanel } from "./panels/DetailsPanel";
import { ImagesPanel } from "./panels/ImagesPanel";
import { SocialPanel } from "./panels/SocialPanel";
import { CtaPanel } from "./panels/CtaPanel";
import { AddonsPanel } from "./panels/AddonsPanel";
import { DesignPanel } from "./panels/DesignPanel";
import { TemplatePanel } from "./panels/TemplatePanel";
import { PreviewPane } from "./PreviewPane";
import { renderSignatureHtml } from "@/lib/signature/render";
import { sampleDraft, toSignature } from "@/lib/signature/defaults";
import type { SignatureDraft } from "@/lib/signature/types";

const TABS = [
  { id: "details", label: "Details" },
  { id: "images", label: "Images" },
  { id: "social", label: "Links" },
  { id: "cta", label: "Buttons" },
  { id: "addons", label: "Add-ons" },
  { id: "design", label: "Design" },
  { id: "templates", label: "Templates" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const LOCAL_KEY = "smartstamp:draft";

export function SignatureEditor({
  initialDraft,
  signatureId,
  shareSlug,
  origin,
  signedIn,
  billing,
}: {
  initialDraft: SignatureDraft;
  signatureId: string | null;
  shareSlug: string | null;
  origin: string;
  signedIn: boolean;
  billing: {
    enabled: boolean;
    paid: boolean;
    balance: number;
    price: string;
    packQuantity: number;
    bonusCredits: number;
  };
}) {
  const router = useRouter();
  const api = useSignatureDraft(initialDraft);
  const { draft, patch, patchAddon, dirty, markClean } = api;

  const [tab, setTab] = useState<TabId>("details");
  const [savedId, setSavedId] = useState<string | null>(signatureId);
  const [slug, setSlug] = useState<string | null>(shareSlug);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");
  // Unlocking happens without a reload, so the export panel opens immediately.
  const [paid, setPaid] = useState(billing.paid);
  const restoredRef = useRef(false);

  /**
   * Anonymous work is kept in localStorage so a refresh, or a detour through
   * sign-up, does not throw away what someone just built.
   */
  useEffect(() => {
    if (signatureId || restoredRef.current) return;
    restoredRef.current = true;
    try {
      const stored = window.localStorage.getItem(LOCAL_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as SignatureDraft;
      if (parsed?.details) patch(parsed);
    } catch {
      // A corrupt draft is not worth surfacing; start fresh instead.
    }
  }, [signatureId, patch]);

  useEffect(() => {
    if (signatureId || !dirty) return;
    try {
      window.localStorage.setItem(LOCAL_KEY, JSON.stringify(draft));
    } catch {
      // Storage can be full or blocked; the editor still works without it.
    }
  }, [draft, dirty, signatureId]);

  const signature = useMemo(
    () =>
      toSignature(draft, {
        id: savedId ?? "unsaved",
        ownerId: null,
        slug: slug ?? "unsaved",
      }),
    [draft, savedId, slug],
  );

  const html = useMemo(() => renderSignatureHtml(signature, { origin }), [signature, origin]);

  // "Empty" means nothing would render, so the preview can offer a way in
  // rather than showing a blank card.
  const isEmpty = useMemo(() => {
    const hasDetail = Object.values(draft.details).some((value) => value.trim());
    return !hasDetail && !draft.photo && !draft.logo && draft.socials.length === 0 && draft.buttons.length === 0;
  }, [draft]);

  const loadExample = useCallback(() => {
    const example = sampleDraft(origin);
    // Keep whatever look the user has already chosen; only fill the content.
    patch({
      name: "My signature",
      details: example.details,
      photo: example.photo,
      logo: example.logo,
      socials: example.socials,
      buttons: example.buttons,
      addons: { ...draft.addons, meeting: example.addons.meeting, green: example.addons.green },
    });
  }, [patch, draft.addons, origin]);

  /** The QR Card template is only itself with the QR add-on switched on. */
  const onTemplateSelected = useCallback(
    (templateId: string) => {
      if (templateId === "qr-card" && !draft.addons.qr.enabled) {
        patchAddon("qr", { enabled: true });
      }
    },
    [draft.addons.qr.enabled, patchAddon],
  );

  const save = useCallback(async () => {
    if (!signedIn) {
      router.push("/signup?next=/app");
      return;
    }
    setStatus("saving");
    setMessage(null);
    try {
      const response = await fetch(savedId ? `/api/signatures/${savedId}` : "/api/signatures", {
        method: savedId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = await response.json();
      if (!response.ok) {
        setStatus("error");
        setMessage(data.error ?? "That did not save.");
        return;
      }
      setSavedId(data.signature.id);
      setSlug(data.signature.slug);
      setStatus("saved");
      markClean();
      if (!savedId) {
        window.localStorage.removeItem(LOCAL_KEY);
        router.replace(`/app/editor/${data.signature.id}`);
      }
      router.refresh();
    } catch {
      setStatus("error");
      setMessage("Could not reach the server. Check your connection and try again.");
    }
  }, [draft, savedId, signedIn, router, markClean]);

  // Cmd/Ctrl+S saves, because people will try it.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void save();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [save]);

  useEffect(() => {
    if (status !== "saved") return;
    const timer = window.setTimeout(() => setStatus("idle"), 2500);
    return () => window.clearTimeout(timer);
  }, [status]);

  return (
    <div className="flex h-screen flex-col bg-white">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-ink-100 px-4 py-2.5 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <Logo className="h-7 w-7" />
            <span className="hidden text-sm font-semibold tracking-tight sm:inline">Smart Stamp</span>
          </Link>
          <span className="hidden h-5 w-px bg-ink-200 sm:block" />
          <input
            value={draft.name}
            aria-label="Signature name"
            onChange={(e) => patch({ name: e.target.value })}
            className="min-w-0 max-w-56 truncate rounded-lg border border-transparent px-2 py-1.5 text-sm font-medium text-ink-800 transition hover:border-ink-200 focus:border-brand-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {message ? (
            <span className="hidden max-w-64 truncate text-xs text-red-600 sm:inline">{message}</span>
          ) : null}
          <span className="hidden text-xs text-ink-400 sm:inline">
            {status === "saving" ? "Saving…" : status === "saved" ? "Saved" : dirty ? "Unsaved changes" : ""}
          </span>
          {savedId ? (
            <Link
              href="/app"
              className="hidden rounded-lg border border-ink-200 px-3 py-2 text-xs font-semibold text-ink-700 transition hover:bg-ink-50 sm:inline-block"
            >
              All signatures
            </Link>
          ) : null}
          <button
            type="button"
            onClick={save}
            disabled={status === "saving"}
            className="rounded-lg bg-ink-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-ink-800 disabled:opacity-60"
          >
            {signedIn ? (savedId ? "Save" : "Save signature") : "Sign up to save"}
          </button>
        </div>
      </header>

      {/* On narrow screens the two halves become tabs rather than columns. */}
      <div className="flex shrink-0 gap-1 border-b border-ink-100 p-2 lg:hidden">
        {(["edit", "preview"] as const).map((view) => (
          <button
            key={view}
            type="button"
            aria-pressed={mobileView === view}
            onClick={() => setMobileView(view)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
              mobileView === view ? "bg-ink-900 text-white" : "bg-ink-50 text-ink-600"
            }`}
          >
            {view === "edit" ? "Edit" : "Preview"}
          </button>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(360px,420px)_1fr]">
        <div
          className={`flex min-h-0 flex-col border-r border-ink-100 ${
            mobileView === "edit" ? "flex" : "hidden lg:flex"
          }`}
        >
          <nav className="flex shrink-0 flex-wrap gap-1 border-b border-ink-100 px-3 py-2">
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-current={tab === item.id}
                onClick={() => setTab(item.id)}
                className={`shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                  tab === item.id ? "bg-brand-50 text-brand-700" : "text-ink-500 hover:bg-ink-50 hover:text-ink-800"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="min-h-0 flex-1 overflow-y-auto thin-scroll">
            {tab === "details" ? <DetailsPanel api={api} /> : null}
            {tab === "images" ? <ImagesPanel api={api} /> : null}
            {tab === "social" ? <SocialPanel api={api} origin={origin} /> : null}
            {tab === "cta" ? <CtaPanel api={api} /> : null}
            {tab === "addons" ? <AddonsPanel api={api} canSaveQr={Boolean(savedId)} /> : null}
            {tab === "design" ? <DesignPanel api={api} /> : null}
            {tab === "templates" ? <TemplatePanel api={api} origin={origin} onSelect={onTemplateSelected} /> : null}
          </div>
        </div>

        <div className={`min-h-0 ${mobileView === "preview" ? "block" : "hidden lg:block"}`}>
          <PreviewPane
            signature={signature}
            html={html}
            origin={origin}
            shareSlug={slug}
            savedId={savedId}
            isEmpty={isEmpty}
            onLoadExample={loadExample}
            billing={{ ...billing, paid }}
            onUnlocked={() => {
              setPaid(true);
              router.refresh();
            }}
          />
        </div>
      </div>
    </div>
  );
}
