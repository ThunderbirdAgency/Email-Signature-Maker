import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { currentUser } from "@/lib/session";
import { billingEnabled, formatPrice } from "@/lib/billing";
import { TEMPLATES } from "@/lib/signature/templates";
import { NETWORKS } from "@/lib/signature/networks";

export const metadata: Metadata = {
  title: "Pricing",
  description: `One signature, ${formatPrice()}. No subscription — you pay once for the signature you actually use.`,
};

export default async function PricingPage() {
  const user = await currentUser();
  const gated = billingEnabled();
  const price = formatPrice();

  return (
    <>
      <SiteHeader user={user} variant="light" />

      <main>
        <section className="px-5 py-16 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">
              Pricing
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
              {gated ? `One signature, ${price}.` : "Free while we are in preview"}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-ink-500 sm:text-[17px]">
              {gated
                ? "No subscription. Build it, see exactly what you are getting, and pay once for the signature you decide to use. Come back and edit it whenever you like — the same signature stays yours."
                : `Everything is switched on for everyone while we are in preview. The plan is ${price} per signature once that changes.`}
            </p>
          </div>

          {/* The stamp is the unit of purchase, so the price sits on one. */}
          <div className="mx-auto mt-14 max-w-md">
            <div className="stamp shadow-[0_4px_24px_rgba(15,23,42,0.10)]" style={{ ["--perf" as string]: "#ffffff" }}>
              <span className="stamp-sides" aria-hidden="true" />
              <div className="relative px-8 py-10 text-center">
                <span
                  className="postmark pointer-events-none absolute right-5 top-5 flex h-16 w-16 items-center justify-center text-[8px] font-bold uppercase leading-tight tracking-wider text-ink-500"
                  aria-hidden="true"
                >
                  Paid
                  <br />
                  Once
                </span>

                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-400">
                  Per signature
                </p>
                <p className="mt-3 flex items-baseline justify-center gap-1.5">
                  <span className="text-6xl font-semibold tracking-tight text-ink-900">
                    {gated ? price : "Free"}
                  </span>
                  {gated ? <span className="text-sm text-ink-400">once</span> : null}
                </p>

                <ul className="mt-8 space-y-3 text-left">
                  {[
                    `All ${TEMPLATES.length} templates, switch any time`,
                    `All ${NETWORKS.length} link types and icon styles`,
                    "Photo, logo, banner, buttons and QR code",
                    "Copy, download, share link and vCard",
                    "Edit it forever — no re-purchase",
                    "Install guides for 12 mail clients",
                  ].map((feature) => (
                    <li key={feature} className="flex gap-2.5 text-sm text-ink-600">
                      <span className="mt-0.5 shrink-0 text-brand-600" aria-hidden="true">
                        &#10003;
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href={user ? "/app/editor/new" : "/app/editor/new"}
                  className="mt-9 block rounded-lg bg-brand-600 px-5 py-3.5 text-center text-sm font-semibold text-white transition hover:bg-brand-500"
                >
                  Build one — free until you export
                </Link>
                <p className="mt-3 text-xs text-ink-400">
                  No account needed to start. Nothing to cancel.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-ink-100 bg-[#f4f6fb] px-5 py-16 sm:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight text-ink-900">
              Common questions
            </h2>
            <dl className="mt-8 space-y-7">
              {faq(price, gated).map((item) => (
                <div key={item.q}>
                  <dt className="text-[15px] font-semibold text-ink-900">{item.q}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-ink-500">{item.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

function faq(price: string, gated: boolean) {
  return [
    {
      q: "What exactly am I paying for?",
      a: gated
        ? `One signature, ${price}, once. Building it, previewing it and trying all the templates costs nothing — you pay when you want to copy, download or share it. Need a second signature for another role or brand? That is another ${price}.`
        : `Nothing, currently. The intended model is ${price} per signature: free to build and preview, paid when you export it.`,
    },
    {
      q: "Do I have to pay again to change it?",
      a: "No. Once a signature is paid for it stays yours to edit — change a job title, swap the campaign banner, pick a different template — as often as you like, at no extra cost.",
    },
    {
      q: "Do I need an account?",
      a: "Not to build one and see it. An account is what lets you come back and edit it later, and keeps your purchased signatures together.",
    },
    {
      q: "Will it look right in Outlook?",
      a: "Yes, with one caveat. Classic Outlook for Windows renders email through Microsoft Word, which ignores rounded corners and some spacing. Signatures here are built as tables with inline styles so they degrade cleanly: a circular photo becomes a square, and everything stays readable.",
    },
    {
      q: "Where are my images hosted?",
      a: "Here. When you upload a photo or logo it is re-encoded, stripped of metadata and given a permanent public URL, because the recipient's mail client has to be able to fetch it. That does mean anyone with the URL can view the image.",
    },
    {
      q: "Can I use my own brand fonts?",
      a: "Only fonts already installed on the recipient's computer can be used, so the editor offers the standard cross-platform set. A web font would silently fall back to something else in most clients, which usually looks worse than choosing a good standard face.",
    },
  ];
}
