import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { currentUser } from "@/lib/session";
import { billingEnabled, FREE_SIGNATURE_LIMIT } from "@/lib/billing";
import { TEMPLATES } from "@/lib/signature/templates";
import { NETWORKS } from "@/lib/signature/networks";

export const metadata: Metadata = {
  title: "Pricing",
  description: "What Signaturely costs, and what you get.",
};

export default async function PricingPage() {
  const user = await currentUser();
  const gated = billingEnabled();

  return (
    <>
      <SiteHeader user={user} variant="light" />

      <main>
        <section className="px-5 py-16 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">Pricing</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink-900">
              {gated ? "Simple, and mostly free" : "Everything is free"}
            </h1>
            <p className="mt-4 text-[17px] leading-relaxed text-ink-500">
              {gated
                ? "Building and copying a signature costs nothing. Paid plans exist for people who want to save several and keep editing them."
                : "Every feature is switched on for everyone. Build as many signatures as you like, use every template and add-on, and copy them wherever you want."}
            </p>
          </div>

          <div className={`mx-auto mt-14 grid max-w-4xl gap-6 ${gated ? "md:grid-cols-2" : ""}`}>
            <PlanCard
              name={gated ? "Free" : "Everything"}
              price={gated ? "£0" : "Free"}
              cadence={gated ? "forever" : "for everyone"}
              highlight={!gated}
              cta={user ? "Go to my signatures" : "Start building"}
              href={user ? "/app" : "/app/editor/new"}
              features={
                gated
                  ? [
                      `All ${TEMPLATES.length} templates`,
                      `All ${NETWORKS.length} link types`,
                      "Photo, logo and colour controls",
                      "Copy, download and share",
                      `${FREE_SIGNATURE_LIMIT} saved signatures`,
                    ]
                  : [
                      `All ${TEMPLATES.length} templates`,
                      `All ${NETWORKS.length} link types`,
                      "Photo, logo, banners, buttons and QR codes",
                      "Legal disclaimers, video cards and badges",
                      "Unlimited saved signatures",
                      "Share links and vCard export",
                    ]
              }
            />

            {gated ? (
              <PlanCard
                name="Pro"
                price="£19"
                cadence="one-off"
                highlight
                cta="Upgrade"
                href="/app"
                features={[
                  "Everything in Free",
                  "Unlimited saved signatures",
                  "Promo banners and CTA buttons",
                  "QR codes and video cards",
                  "Legal disclaimers and badges",
                  "No Signaturely mention in your signature",
                ]}
              />
            ) : null}
          </div>

          {!gated ? (
            <p className="mx-auto mt-10 max-w-2xl text-center text-sm leading-relaxed text-ink-400">
              An email signature is something most people set up once. Charging a
              subscription for that never sat right, so for now the whole thing is free.
            </p>
          ) : null}
        </section>

        <section className="border-t border-ink-100 bg-ink-50/60 px-5 py-16 sm:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight text-ink-900">Common questions</h2>
            <dl className="mt-8 space-y-7">
              {FAQ.map((item) => (
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

function PlanCard({
  name, price, cadence, features, cta, href, highlight,
}: {
  name: string;
  price: string;
  cadence: string;
  features: string[];
  cta: string;
  href: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-8 ${
        highlight ? "border-brand-500 bg-white shadow-xl shadow-brand-500/10" : "border-ink-200 bg-white"
      }`}
    >
      <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-500">{name}</h2>
      <p className="mt-4 flex items-baseline gap-2">
        <span className="text-4xl font-semibold tracking-tight text-ink-900">{price}</span>
        <span className="text-sm text-ink-400">{cadence}</span>
      </p>
      <ul className="mt-7 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex gap-2.5 text-sm text-ink-600">
            <span className="mt-0.5 shrink-0 text-brand-600" aria-hidden="true">
              &#10003;
            </span>
            {feature}
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className={`mt-8 block rounded-lg px-5 py-3 text-center text-sm font-semibold transition ${
          highlight
            ? "bg-brand-600 text-white hover:bg-brand-500"
            : "border border-ink-200 text-ink-800 hover:bg-ink-50"
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}

const FAQ = [
  {
    q: "Do I need an account?",
    a: "Not to build a signature and copy it. An account only matters if you want to save it, come back and edit it later, or send a share link to a colleague.",
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
    q: "What happens if I change my signature later?",
    a: "Emails you already sent keep the signature as it was, apart from images, which are fetched fresh each time. Replace an uploaded banner and older emails will show the new one.",
  },
  {
    q: "Can I use my own brand fonts?",
    a: "Only fonts already installed on the recipient's computer can be used, so the editor offers the standard cross-platform set. A web font would silently fall back to something else in most clients, which usually looks worse than choosing a good standard face.",
  },
];
