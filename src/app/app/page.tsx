import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SignatureFrame } from "@/components/SignatureFrame";
import { DeleteSignatureButton } from "@/components/app/DeleteSignatureButton";
import { currentUser } from "@/lib/session";
import { resolveOrigin } from "@/lib/origin";
import { listSignatures } from "@/lib/store";
import { renderSignatureHtml } from "@/lib/signature/render";
import { billingEnabled, isPro, FREE_SIGNATURE_LIMIT } from "@/lib/billing";
import { TEMPLATES } from "@/lib/signature/templates";

export const metadata: Metadata = { title: "My signatures" };

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) redirect("/login?next=/app");

  const [origin, signatures] = await Promise.all([resolveOrigin(), listSignatures(user.id)]);
  const atLimit = !isPro(user) && signatures.length >= FREE_SIGNATURE_LIMIT;

  return (
    <>
      <SiteHeader user={user} variant="light" />

      <main className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-ink-900">
              {greeting()}, {user.name.split(" ")[0]}
            </h1>
            <p className="mt-2 text-sm text-ink-500">
              {signatures.length === 0
                ? "You have not saved a signature yet."
                : `${signatures.length} saved signature${signatures.length === 1 ? "" : "s"}.`}
              {billingEnabled() && !isPro(user)
                ? ` Free plan — ${FREE_SIGNATURE_LIMIT} saved signatures included.`
                : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                formAction="/api/auth/logout"
                className="rounded-lg border border-ink-200 px-4 py-2.5 text-sm font-medium text-ink-600 transition hover:bg-ink-50"
              >
                Sign out
              </button>
            </form>
            {atLimit ? (
              <Link
                href="/pricing"
                className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-500"
              >
                Upgrade for more
              </Link>
            ) : (
              <Link
                href="/app/editor/new"
                className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-500"
              >
                New signature
              </Link>
            )}
          </div>
        </div>

        {signatures.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-ink-200 bg-ink-50/50 px-6 py-16 text-center">
            <h2 className="text-lg font-semibold text-ink-900">Build your first signature</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-500">
              Add your details, pick one of the {TEMPLATES.length} templates, and copy the
              result straight into your mail client.
            </p>
            <Link
              href="/app/editor/new"
              className="mt-6 inline-block rounded-lg bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-500"
            >
              Start building
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {signatures.map((signature) => (
              <article
                key={signature.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-ink-200 bg-white transition hover:border-ink-300 hover:shadow-lg hover:shadow-ink-900/5"
              >
                <div className="flex items-start justify-between gap-3 border-b border-ink-100 px-5 py-3.5">
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold text-ink-900">{signature.name}</h2>
                    <p className="mt-0.5 text-xs text-ink-400">
                      Updated {new Date(signature.updatedAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <span className="shrink-0 rounded bg-ink-100 px-2 py-0.5 text-[10px] font-medium text-ink-500">
                    {TEMPLATES.find((t) => t.id === signature.style.templateId)?.name ?? "Custom"}
                  </span>
                </div>

                <div className="max-h-52 flex-1 overflow-hidden bg-white">
                  <SignatureFrame
                    html={renderSignatureHtml(signature, { origin })}
                    padding={18}
                    title={`${signature.name} preview`}
                  />
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-ink-100 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/app/editor/${signature.id}`}
                      className="rounded-lg bg-ink-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-ink-800"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/s/${signature.slug}`}
                      target="_blank"
                      className="rounded-lg border border-ink-200 px-3 py-2 text-xs font-semibold text-ink-700 transition hover:bg-ink-50"
                    >
                      Share link
                    </Link>
                  </div>
                  <DeleteSignatureButton id={signature.id} name={signature.name} />
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
