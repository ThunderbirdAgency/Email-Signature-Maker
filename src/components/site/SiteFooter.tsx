import Link from "next/link";
import { Logo } from "./Logo";
import { MAIL_CLIENTS } from "@/lib/guides";

export function SiteFooter() {
  return (
    <footer className="border-t border-ink-100 bg-ink-50/50">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <Logo className="h-7 w-7" />
            <span className="font-semibold tracking-tight">Signaturely</span>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-500">
            A modern email signature generator. Build it once, paste it anywhere, look
            sharp in every inbox.
          </p>
        </div>

        <FooterColumn title="Product">
          <FooterLink href="/app/editor/new">Signature editor</FooterLink>
          <FooterLink href="/templates">Templates</FooterLink>
          <FooterLink href="/pricing">Pricing</FooterLink>
          <FooterLink href="/app">My signatures</FooterLink>
        </FooterColumn>

        <FooterColumn title="Install guides">
          {MAIL_CLIENTS.slice(0, 5).map((client) => (
            <FooterLink key={client.slug} href={`/guides/${client.slug}`}>
              {client.name}
            </FooterLink>
          ))}
          <FooterLink href="/guides">All clients</FooterLink>
        </FooterColumn>

        <FooterColumn title="Account">
          <FooterLink href="/login">Sign in</FooterLink>
          <FooterLink href="/signup">Create an account</FooterLink>
        </FooterColumn>
      </div>

      <div className="border-t border-ink-100 px-5 py-6 sm:px-8">
        <p className="mx-auto max-w-7xl text-xs text-ink-400">
          Brand marks belong to their respective owners and are used here only to label
          links to those services.
        </p>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-400">{title}</h3>
      <ul className="mt-4 space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-sm text-ink-600 transition hover:text-brand-600">
        {children}
      </Link>
    </li>
  );
}
