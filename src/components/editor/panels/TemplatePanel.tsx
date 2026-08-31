"use client";

import { useMemo } from "react";
import { TEMPLATES } from "@/lib/signature/templates";
import { renderSignatureHtml } from "@/lib/signature/render";
import { toSignature } from "@/lib/signature/defaults";
import { SignatureFrame } from "@/components/SignatureFrame";
import type { SignatureDraft } from "@/lib/signature/types";
import type { DraftApi } from "../useSignatureDraft";

/**
 * Template gallery.
 *
 * Every card renders the user's own details rather than stock copy, so the
 * choice is made on what the signature will actually look like. Previews use a
 * trimmed copy of the draft — a couple of links, no add-ons — to keep seventeen
 * live frames light.
 */
export function TemplatePanel({
  api,
  origin,
  onSelect,
}: {
  api: DraftApi;
  origin: string;
  /** Lets the editor react to a choice, e.g. enabling a template's add-on. */
  onSelect?: (templateId: string) => void;
}) {
  const { draft, patchStyle } = api;

  const previewBase = useMemo<SignatureDraft>(() => {
    const hasContent = draft.details.fullName || draft.details.email;
    return {
      ...draft,
      details: hasContent
        ? draft.details
        : { ...draft.details, fullName: "Avery Sinclair", jobTitle: "Director of Partnerships", company: "Northwind Studio", email: "avery@northwind.studio", phone: "+1 (415) 555 0142" },
      socials: draft.socials.slice(0, 3),
      buttons: [],
      customFields: [],
      addons: {
        ...draft.addons,
        banner: { ...draft.addons.banner, enabled: false },
        video: { ...draft.addons.video, enabled: false },
        badges: { ...draft.addons.badges, enabled: false },
        disclaimer: { ...draft.addons.disclaimer, enabled: false },
        quote: { ...draft.addons.quote, enabled: false },
        green: { ...draft.addons.green, enabled: false },
        qr: { ...draft.addons.qr, enabled: draft.style.templateId === "qr-card" ? false : draft.addons.qr.enabled },
      },
    };
  }, [draft]);

  return (
    <div className="px-5 py-6">
      <h3 className="text-sm font-semibold text-ink-900">Templates</h3>
      <p className="mt-1 text-xs leading-relaxed text-ink-400">
        Switching template keeps every detail, colour and link you have already set.
      </p>

      <div className="mt-5 space-y-3">
        {TEMPLATES.map((template) => {
          const active = draft.style.templateId === template.id;
          const preview = toSignature(
            { ...previewBase, style: { ...previewBase.style, templateId: template.id } },
            { id: `preview-${template.id}`, ownerId: null, slug: "preview" },
          );

          return (
            <button
              key={template.id}
              type="button"
              onClick={() => {
                patchStyle({ templateId: template.id });
                onSelect?.(template.id);
              }}
              aria-pressed={active}
              className={`block w-full overflow-hidden rounded-xl border text-left transition ${
                active
                  ? "border-brand-500 ring-2 ring-brand-500/20"
                  : "border-ink-200 hover:border-ink-300"
              }`}
            >
              <div className="flex items-start justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-ink-900">{template.name}</span>
                    {active ? (
                      <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-700">
                        In use
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-ink-400">{template.description}</p>
                </div>
                <div className="flex shrink-0 flex-wrap justify-end gap-1">
                  {template.tags.map((tag) => (
                    <span key={tag} className="rounded bg-ink-100 px-1.5 py-0.5 text-[10px] font-medium text-ink-500">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="max-h-56 overflow-hidden border-t border-ink-100 bg-white">
                <SignatureFrame
                  html={renderSignatureHtml(preview, { origin })}
                  padding={16}
                  title={`${template.name} preview`}
                  interactive={false}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
