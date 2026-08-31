import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { currentUser } from "@/lib/session";
import { CLIENT_BY_SLUG, MAIL_CLIENTS } from "@/lib/guides";

export function generateStaticParams() {
  return MAIL_CLIENTS.map((client) => ({ client: client.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ client: string }>;
}): Promise<Metadata> {
  const { client } = await params;
  const found = CLIENT_BY_SLUG[client];
  if (!found) return { title: "Install guide" };
  return {
    title: `Add an email signature in ${found.name}`,
    description: `Step-by-step instructions for setting up an HTML email signature in ${found.name}.`,
  };
}

export default async function GuidePage({ params }: { params: Promise<{ client: string }> }) {
  const { client: slug } = await params;
  const client = CLIENT_BY_SLUG[slug];
  if (!client) notFound();

  const user = await currentUser();
  const others = MAIL_CLIENTS.filter((c) => c.slug !== slug);

  return (
    <>
      <SiteHeader user={user} variant="light" />

      <main className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
        <Link href="/guides" className="text-sm font-medium text-brand-600 underline-offset-2 hover:underline">
          &larr; All install guides
        </Link>

        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-ink-900">
          Add an email signature in {client.name}
        </h1>
        <p className="mt-3 text-sm text-ink-400">{client.platform}</p>

        <ol className="mt-10 space-y-5">
          {client.steps.map((step, index) => (
            <li key={step} className="flex gap-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
                {index + 1}
              </span>
              <p className="pt-0.5 text-[15px] leading-relaxed text-ink-700">{step}</p>
            </li>
          ))}
        </ol>

        {client.notes?.length ? (
          <div className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <h2 className="text-sm font-semibold text-amber-900">Worth knowing</h2>
            <ul className="mt-3 space-y-2.5">
              {client.notes.map((note) => (
                <li key={note} className="text-sm leading-relaxed text-amber-900/90">
                  {note}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-10 rounded-2xl border border-ink-200 bg-ink-50/60 p-6">
          <h2 className="text-base font-semibold text-ink-900">Do not have a signature yet?</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-500">
            Build one in a few minutes — no account needed to copy it.
          </p>
          <Link
            href="/app/editor/new"
            className="mt-4 inline-block rounded-lg bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-500"
          >
            Open the editor
          </Link>
        </div>

        <div className="mt-12 border-t border-ink-100 pt-8">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-400">Other clients</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {others.map((other) => (
              <Link
                key={other.slug}
                href={`/guides/${other.slug}`}
                className="rounded-lg border border-ink-200 px-3 py-2 text-xs font-medium text-ink-600 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
              >
                {other.name}
              </Link>
            ))}
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
