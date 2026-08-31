import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SharedSignature } from "@/components/site/SharedSignature";
import { currentUser } from "@/lib/session";
import { resolveOrigin } from "@/lib/origin";
import { getSignatureBySlug } from "@/lib/store";
import { renderPlainText, renderSignatureHtml } from "@/lib/signature/render";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const signature = await getSignatureBySlug(slug);
  if (!signature) return { title: "Signature not found" };
  const who = signature.details.fullName || "This";
  return {
    title: `${who}'s email signature`,
    description: `Copy ${who}'s email signature and paste it into your mail client.`,
    // A share link is meant for one specific person, not for search results.
    robots: { index: false, follow: false },
  };
}

export default async function SharedSignaturePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [signature, user, origin] = await Promise.all([
    getSignatureBySlug(slug),
    currentUser(),
    resolveOrigin(),
  ]);
  if (!signature) notFound();

  const html = renderSignatureHtml(signature, { origin });
  const plain = renderPlainText(signature);
  const who = signature.details.fullName || "this";

  return (
    <>
      <SiteHeader user={user} variant="light" />

      <main className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">
          Shared signature
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink-900">
          {signature.details.fullName ? `${signature.details.fullName}'s email signature` : "An email signature for you"}
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-500">
          Copy it below, then follow the guide for your mail client. Nothing here changes
          anything on your computer until you paste it in.
        </p>

        <SharedSignature html={html} plain={plain} vcardId={signature.id} who={who} />

        <div className="mt-10 rounded-2xl border border-ink-200 bg-ink-50/60 p-6">
          <h2 className="text-base font-semibold text-ink-900">Want one of your own?</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-500">
            Build a signature like this in a few minutes. Free, and no account needed to
            copy it.
          </p>
          <Link
            href="/app/editor/new"
            className="mt-4 inline-block rounded-lg bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-500"
          >
            Build mine
          </Link>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
