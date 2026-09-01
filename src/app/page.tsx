import Link from "next/link";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ScaledSignature } from "@/components/ScaledSignature";
import { currentUser } from "@/lib/session";
import { resolveOrigin } from "@/lib/origin";
import { sampleDraft, toSignature } from "@/lib/signature/defaults";
import { showcaseDraft } from "@/lib/signature/gallery";
import { renderSignatureHtml } from "@/lib/signature/render";
import { MAIL_CLIENTS } from "@/lib/guides";
import { TEMPLATES } from "@/lib/signature/templates";
import { NETWORKS } from "@/lib/signature/networks";
import { billingEnabled, formatPrice } from "@/lib/billing";

export default async function HomePage() {
  const [user, origin] = await Promise.all([currentUser(), resolveOrigin()]);

  const hero = toSignature(sampleDraft(origin), { id: "demo-hero", ownerId: null, slug: "demo" });
  const heroHtml = renderSignatureHtml(hero, { origin });

  const showcase = ["elegant", "mono-tech", "split-card"].map((templateId) => {
    const meta = TEMPLATES.find((t) => t.id === templateId)!;
    const sig = toSignature(showcaseDraft(templateId, origin), {
      id: `demo-${templateId}`,
      ownerId: null,
      slug: `demo-${templateId}`,
    });
    return { meta, html: renderSignatureHtml(sig, { origin }) };
  });

  return (
    <>
      <div className="relative overflow-hidden bg-ink-950">
        <div className="aurora" aria-hidden="true" />
        <div className="grid-lines absolute inset-0" aria-hidden="true" />

        <SiteHeader user={user} variant="dark" />

        <section className="relative mx-auto max-w-7xl px-5 pb-24 pt-14 sm:px-8 lg:pb-32 lg:pt-20">
          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-ink-200 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-glow-400" />
                {NETWORKS.length} link types · {TEMPLATES.length} templates · works in every inbox
              </span>

              <h1 className="mt-6 text-4xl font-semibold leading-[1.06] tracking-tight text-white sm:text-5xl lg:text-6xl">
                The email signature
                <br />
                <span className="text-gradient">people actually click.</span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-300">
                Type in your details, pick a look, and get a signature with your photo,
                logo, social icons, a call-to-action button and a scannable QR code.
                Copy it once and paste it into Gmail, Outlook, Apple Mail — anywhere.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link
                  href="/app/editor/new"
                  className="rounded-xl bg-white px-6 py-3.5 text-[15px] font-semibold text-ink-950 shadow-xl shadow-black/30 transition hover:bg-ink-50"
                >
                  Build my signature
                </Link>
                <Link
                  href="/templates"
                  className="rounded-xl border border-white/20 px-6 py-3.5 text-[15px] font-semibold text-white transition hover:bg-white/10"
                >
                  Browse templates
                </Link>
              </div>

              <p className="mt-5 text-sm text-ink-400">
                {billingEnabled()
                  ? `${formatPrice()} per signature, paid once. Free to build and preview — you only pay to take it away.`
                  : "Free while we are in preview. No account needed to build and copy one."}
              </p>
            </div>

            <div className="relative isolate overflow-hidden">
              <div
                className="absolute -inset-6 rounded-[2rem] bg-gradient-to-tr from-brand-500/25 via-transparent to-glow-500/25 blur-2xl"
                aria-hidden="true"
              />
              <div className="relative overflow-hidden rounded-2xl bg-white shadow-2xl shadow-black/50 ring-1 ring-white/10">
                <div className="flex items-center gap-2 border-b border-ink-100 bg-ink-50 px-4 py-3">
                  <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                  <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                  <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                  <span className="ml-3 text-xs font-medium text-ink-400">New message</span>
                </div>
                <div className="px-6 pt-5 text-sm">
                  <FauxField label="To" value="team@northwind.studio" />
                  <FauxField label="Subject" value="Partnership deck + next steps" />
                  <p className="mt-5 leading-relaxed text-ink-700">
                    Hi team — deck attached. Happy to walk through it live if that is easier.
                  </p>
                  <p className="mt-3 leading-relaxed text-ink-700">Best,</p>
                </div>
                <ScaledSignature html={heroHtml} naturalWidth={560} padding={22} title="Example signature" />
              </div>
            </div>
          </div>
        </section>

        <section className="relative border-t border-white/10 py-10">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">
              Renders correctly in
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {MAIL_CLIENTS.map((client) => (
                <span key={client.slug} className="text-sm font-medium text-ink-300">
                  {client.name}
                </span>
              ))}
            </div>
          </div>
        </section>
      </div>

      <main>
        <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <SectionHeading
            eyebrow="Everything you can add"
            title="Far more than a name and a phone number"
            body="Every element below is optional, drag-free and switched on with a toggle. Turn on what earns its place and leave the rest off."
          />

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <article
                key={feature.title}
                className="group rounded-2xl border border-ink-100 bg-white p-6 transition hover:border-brand-200 hover:shadow-lg hover:shadow-brand-500/5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
                  <FeatureIcon name={feature.icon} />
                </div>
                <h3 className="mt-4 text-[15px] font-semibold text-ink-900">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{feature.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-ink-100 bg-ink-50/60 py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <SectionHeading
              eyebrow="Templates"
              title={`${TEMPLATES.length} layouts, one set of details`}
              body="Switch template at any time — your details, colours and links carry straight over. Nothing to re-type."
            />

            <div className="mt-14 grid gap-6 lg:grid-cols-3">
              {showcase.map((item) => (
                <div key={item.meta.id} className="min-w-0">
                  <div
                    className="stamp shadow-[0_2px_14px_rgba(15,23,42,0.09)]"
                    style={{ ["--perf" as string]: "#f4f6fb" }}
                  >
                    <span className="stamp-sides" aria-hidden="true" />
                    <div className="overflow-hidden px-3 py-3">
                      <ScaledSignature
                        html={item.html}
                        naturalWidth={560}
                        maxHeight={215}
                        padding={10}
                        title={`${item.meta.name} template`}
                      />
                    </div>
                  </div>
                  <div className="mt-4 px-1">
                    <h3 className="text-[15px] font-semibold text-ink-900">{item.meta.name}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-500">{item.meta.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/templates"
                className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-5 py-3 text-sm font-semibold text-ink-800 transition hover:border-ink-300 hover:bg-ink-50"
              >
                See all {TEMPLATES.length} templates
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <SectionHeading
            eyebrow="How it works"
            title="Three steps, about four minutes"
            body="No extension to install, no DNS records, nothing to configure on your mail server."
          />
          <ol className="mt-14 grid gap-6 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={step.title} className="relative rounded-2xl border border-ink-100 p-7">
                <span className="text-5xl font-semibold tracking-tight text-ink-100">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-lg font-semibold text-ink-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="relative overflow-hidden bg-ink-950 py-24">
          <div className="aurora" aria-hidden="true" />
          <div className="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Your next email can look like it came from a company with a design team.
            </h2>
            <p className="mt-5 text-lg text-ink-300">
              Build it now — you can copy the result without creating an account.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link
                href="/app/editor/new"
                className="rounded-xl bg-white px-7 py-3.5 text-[15px] font-semibold text-ink-950 transition hover:bg-ink-50"
              >
                Build my signature
              </Link>
              <Link
                href="/guides"
                className="rounded-xl border border-white/20 px-7 py-3.5 text-[15px] font-semibold text-white transition hover:bg-white/10"
              >
                Read the install guides
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

function FauxField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 border-b border-ink-100 py-2.5">
      <span className="w-14 shrink-0 text-ink-400">{label}</span>
      <span className="truncate text-ink-700">{value}</span>
    </div>
  );
}

function SectionHeading({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">{title}</h2>
      <p className="mt-4 text-[17px] leading-relaxed text-ink-500">{body}</p>
    </div>
  );
}

const FEATURES = [
  { icon: "user", title: "Photo and logo", body: "Upload a headshot and a company logo. Square, rounded or circular, any size, with an optional border and click-through link. Animated GIFs are kept animated." },
  { icon: "share", title: `${NETWORKS.length} link types`, body: "LinkedIn, X, Instagram, GitHub, WhatsApp, Calendly, Spotify and dozens more — as brand-coloured, mono or custom-coloured icons in four shapes." },
  { icon: "cursor", title: "Call-to-action buttons", body: "Up to four buttons with your own label, link, colours, corner radius and size. Solid or outline, small through large." },
  { icon: "image", title: "Promo banners", body: "Drop in a full-width image that links anywhere — a launch, an event, a booking page. Update it once and every future email carries it." },
  { icon: "qr", title: "QR codes", body: "A scannable code that saves your full contact card to a phone, or points anywhere you like. Generated at the colour you choose." },
  { icon: "video", title: "Video thumbnails", body: "A thumbnail with a play badge that links to your demo, showreel or welcome video. Mail clients cannot play video; this is the next best thing." },
  { icon: "shield", title: "Legal disclaimers", body: "Six ready-written disclaimers covering confidentiality, GDPR, financial, healthcare and legal — or write your own." },
  { icon: "palette", title: "Colours and type", body: "Ten curated palettes or full manual control over six colours, fifteen email-safe fonts, sizes, dividers and spacing density." },
  { icon: "calendar", title: "Scheduling links", body: "A calendar row that links straight to Calendly, Cal.com or whatever you use, so people can book without a reply." },
  { icon: "quote", title: "Quotes and sign-offs", body: "A pull quote with attribution, a handwritten-style sign-off, and a green footer asking people not to print." },
  { icon: "badge", title: "Award and app badges", body: "A row of certification, award or app-store badges, each independently sized and linked." },
  { icon: "plus", title: "Unlimited custom fields", body: "Any label, any value, any icon, any link. Licence numbers, office hours, pronouns, desk location — whatever your role needs." },
];

const STEPS = [
  { title: "Fill in your details", body: "Name, role, company, contact details and links. Everything updates in the preview as you type." },
  { title: "Make it yours", body: "Pick a template, set your brand colours and fonts, and switch on the extras that matter to you." },
  { title: "Copy and paste", body: "One button copies the signature with formatting intact. Follow the guide for your mail client and you are done." },
];

function FeatureIcon({ name }: { name: string }) {
  const common = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "currentColor" as const, "aria-hidden": true };
  switch (name) {
    case "user":
      return <svg {...common}><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.4 0-8 2.5-8 5.5V22h16v-2.5c0-3-3.6-5.5-8-5.5Z" /></svg>;
    case "share":
      return <svg {...common}><path d="M18 8a3 3 0 1 0-2.8-4H15L8.9 9.6A3 3 0 1 0 8.9 14.4L15 20h.2A3 3 0 1 0 16.6 18.6L10.5 13a3 3 0 0 0 0-2l6.1-5.6c.4.4 1 .6 1.4.6Z" /></svg>;
    case "cursor":
      return <svg {...common}><path d="M5 3l14 6.5-6 1.8-1.8 6L5 3Z" /><path d="M13.5 13.5 20 20l-1.5 1.5L12 15l1.5-1.5Z" /></svg>;
    case "image":
      return <svg {...common}><path d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5Zm3.5 3a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6ZM5 19h14v-3.5l-4-4-5 5-2-2L5 17v2Z" /></svg>;
    case "qr":
      return <svg {...common}><path d="M3 3h8v8H3V3Zm2 2v4h4V5H5Zm8-2h8v8h-8V3Zm2 2v4h4V5h-4ZM3 13h8v8H3v-8Zm2 2v4h4v-4H5Zm8-2h3v3h-3v-3Zm5 0h3v3h-3v-3Zm-5 5h3v3h-3v-3Zm5 0h3v3h-3v-3Z" /></svg>;
    case "video":
      return <svg {...common}><path d="M3 6a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Zm15 2.8 4-2.3v11l-4-2.3V8.8Z" /></svg>;
    case "shield":
      return <svg {...common}><path d="M12 2 4 5.2v6c0 5 3.4 9.6 8 10.8 4.6-1.2 8-5.8 8-10.8v-6L12 2Zm-1 13-3-3 1.4-1.4L11 12.2l4.6-4.6L17 9l-6 6Z" /></svg>;
    case "palette":
      return <svg {...common}><path d="M12 3a9 9 0 0 0 0 18c1.4 0 2.2-.9 2.2-2 0-.6-.2-1-.6-1.4-.3-.4-.5-.7-.5-1.2 0-.8.7-1.4 1.5-1.4H16a5 5 0 0 0 5-5c0-3.9-4-7-9-7Zm-4.5 9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm3-4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z" /></svg>;
    case "calendar":
      return <svg {...common}><path d="M8 2a1 1 0 0 1 1 1v1h6V3a1 1 0 1 1 2 0v1h1.5A2.5 2.5 0 0 1 21 6.5v12a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 18.5v-12A2.5 2.5 0 0 1 5.5 4H7V3a1 1 0 0 1 1-1ZM5 9v9.5c0 .3.2.5.5.5h13c.3 0 .5-.2.5-.5V9H5Z" /></svg>;
    case "quote":
      return <svg {...common}><path d="M9 5c-3.3 0-6 2.7-6 6v8h8v-8H6c0-1.7 1.3-3 3-3V5Zm12 0c-3.3 0-6 2.7-6 6v8h8v-8h-5c0-1.7 1.3-3 3-3V5Z" /></svg>;
    case "badge":
      return <svg {...common}><path d="M12 2.5 15 8l6 .9-4.4 4.3 1 6L12 16.4 6.4 19.2l1-6L3 8.9 9 8l3-5.5Z" /></svg>;
    default:
      return <svg {...common}><path d="M11 4h2v7h7v2h-7v7h-2v-7H4v-2h7V4Z" /></svg>;
  }
}
