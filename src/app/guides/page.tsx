import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { currentUser } from "@/lib/session";
import { MAIL_CLIENTS } from "@/lib/guides";

export const metadata: Metadata = {
  title: "Install guides",
  description:
    "Step-by-step instructions for adding an email signature to Gmail, Outlook, Apple Mail, Yahoo, Thunderbird and more.",
};

export default async function GuidesIndexPage() {
  const user = await currentUser();

  return (
    <>
      <SiteHeader user={user} variant="light" />

      <main className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">Install guides</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink-900">
          Getting your signature into your mail client
        </h1>
        <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-ink-500">
          Every client hides its signature settings somewhere slightly different, and a
          couple of them have a trick you need to know. Pick yours below.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {MAIL_CLIENTS.map((client) => (
            <Link
              key={client.slug}
              href={`/guides/${client.slug}`}
              className="group rounded-2xl border border-ink-200 bg-white p-6 transition hover:border-brand-300 hover:shadow-lg hover:shadow-brand-500/5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-ink-900 group-hover:text-brand-700">
                    {client.name}
                  </h2>
                  <p className="mt-1 text-xs text-ink-400">{client.platform}</p>
                </div>
                <span className="text-ink-300 transition group-hover:translate-x-0.5 group-hover:text-brand-500" aria-hidden="true">
                  &rarr;
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-500">
                {client.steps.length} steps
                {client.method === "html-file"
                  ? " · uses a downloaded file"
                  : client.method === "paste-limited"
                    ? " · has a quirk worth knowing"
                    : " · straight copy and paste"}
              </p>
            </Link>
          ))}
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
