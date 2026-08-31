import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SignatureFrame } from "@/components/SignatureFrame";
import { currentUser } from "@/lib/session";
import { resolveOrigin } from "@/lib/origin";
import { TEMPLATES } from "@/lib/signature/templates";
import { renderSignatureHtml } from "@/lib/signature/render";
import { sampleDraft, toSignature, COLOR_PRESETS } from "@/lib/signature/defaults";

export const metadata: Metadata = {
  title: "Email signature templates",
  description: `${TEMPLATES.length} professional email signature templates. Pick one, add your details, and copy it into Gmail, Outlook or Apple Mail.`,
};

export default async function TemplatesPage() {
  const [user, origin] = await Promise.all([currentUser(), resolveOrigin()]);

  return (
    <>
      <SiteHeader user={user} variant="light" />

      <main>
        <section className="border-b border-ink-100 bg-ink-50/60 px-5 py-16 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">Templates</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink-900">
              {TEMPLATES.length} layouts, every one of them yours to change
            </h1>
            <p className="mt-4 text-[17px] leading-relaxed text-ink-500">
              Each preview below uses the same example person so you can compare them
              fairly. Colours, fonts, spacing and every element are adjustable once you
              are in the editor.
            </p>
            <Link
              href="/app/editor/new"
              className="mt-8 inline-block rounded-xl bg-brand-600 px-6 py-3.5 text-[15px] font-semibold text-white transition hover:bg-brand-500"
            >
              Open the editor
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          <div className="grid gap-6 lg:grid-cols-2">
            {TEMPLATES.map((template, index) => {
              // Rotate the palette so the gallery does not read as one colour.
              const palette = COLOR_PRESETS[index % COLOR_PRESETS.length];
              const draft = sampleDraft(origin);
              const signature = toSignature(
                {
                  ...draft,
                  style: {
                    ...draft.style,
                    templateId: template.id,
                    primaryColor: palette.primary,
                    accentColor: palette.accent,
                    textColor: palette.text,
                    mutedColor: palette.muted,
                    linkColor: palette.link,
                    backgroundColor: palette.background,
                    dividerColor: palette.divider,
                  },
                  // Show each template doing the thing it is named for.
                  buttons: draft.buttons.map((b) => ({ ...b, background: palette.accent })),
                  addons: {
                    ...draft.addons,
                    meeting: { ...draft.addons.meeting, enabled: false },
                    banner: { ...draft.addons.banner, enabled: template.id === "banner-top" },
                    qr: {
                      ...draft.addons.qr,
                      enabled: template.id === "qr-card",
                      mode: "url",
                      value: "https://northwind.studio",
                      darkColor: palette.primary,
                    },
                  },
                },
                { id: `tpl-${template.id}`, ownerId: null, slug: `tpl-${template.id}` },
              );

              return (
                <article
                  key={template.id}
                  className="overflow-hidden rounded-2xl border border-ink-200 bg-white transition hover:border-ink-300 hover:shadow-lg hover:shadow-ink-900/5"
                >
                  <div className="flex items-start justify-between gap-4 border-b border-ink-100 px-6 py-4">
                    <div>
                      <h2 className="text-base font-semibold text-ink-900">{template.name}</h2>
                      <p className="mt-1 max-w-md text-sm leading-relaxed text-ink-500">
                        {template.description}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap justify-end gap-1">
                      {template.tags.map((tag) => (
                        <span key={tag} className="rounded bg-ink-100 px-2 py-0.5 text-[10px] font-medium text-ink-500">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white">
                    <SignatureFrame
                      html={renderSignatureHtml(signature, { origin })}
                      padding={26}
                      title={`${template.name} template preview`}
                    />
                  </div>

                  <div className="border-t border-ink-100 px-6 py-4">
                    <Link
                      href="/app/editor/new"
                      className="text-sm font-semibold text-brand-600 underline-offset-2 hover:underline"
                    >
                      Use this template &rarr;
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
