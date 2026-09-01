import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { TemplateGallery, type GalleryItem } from "@/components/site/TemplateGallery";
import { currentUser } from "@/lib/session";
import { resolveOrigin } from "@/lib/origin";
import { TEMPLATES } from "@/lib/signature/templates";
import { renderSignatureHtml } from "@/lib/signature/render";
import { showcaseDraft } from "@/lib/signature/gallery";
import { toSignature } from "@/lib/signature/defaults";

export const metadata: Metadata = {
  title: "Email signature templates",
  description: `${TEMPLATES.length} professional email signature templates. Pick one, add your details, and copy it into Gmail, Outlook or Apple Mail.`,
};

export default async function TemplatesPage() {
  const [user, origin] = await Promise.all([currentUser(), resolveOrigin()]);

  const items: GalleryItem[] = TEMPLATES.map((template) => {
    const signature = toSignature(showcaseDraft(template.id, origin), {
      id: `tpl-${template.id}`,
      ownerId: null,
      slug: `tpl-${template.id}`,
    });
    return {
      id: template.id,
      name: template.name,
      description: template.description,
      tags: template.tags,
      html: renderSignatureHtml(signature, { origin }),
    };
  });

  return (
    <>
      <SiteHeader user={user} variant="light" />

      <main>
        <section className="border-b border-ink-100 bg-[#f4f6fb] px-5 py-14 sm:px-8 sm:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">
              The collection
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
              {TEMPLATES.length} templates, no two alike
            </h1>
            <p className="mt-4 text-base leading-relaxed text-ink-500 sm:text-[17px]">
              Every stamp below is a different person, palette and typeface — because
              that is the range you get. Swap template any time and your details,
              colours and links come with you.
            </p>
            <Link
              href="/app/editor/new"
              className="mt-7 inline-block rounded-xl bg-brand-600 px-6 py-3.5 text-[15px] font-semibold text-white transition hover:bg-brand-500"
            >
              Start with a blank one
            </Link>
          </div>
        </section>

        <section className="bg-[#f4f6fb] px-5 pb-20 pt-10 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <TemplateGallery items={items} />
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
