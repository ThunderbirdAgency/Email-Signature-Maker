import Link from "next/link";
import { Logo } from "./Logo";

const NAV = [
  { href: "/templates", label: "Templates" },
  { href: "/guides", label: "Install guides" },
  { href: "/pricing", label: "Pricing" },
];

export function SiteHeader({
  user,
  variant = "dark",
}: {
  user: { name: string } | null;
  variant?: "dark" | "light";
}) {
  const dark = variant === "dark";
  return (
    <header
      className={`relative z-20 ${
        dark ? "text-white" : "border-b border-ink-100 bg-white/80 text-ink-900 backdrop-blur"
      }`}
    >
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo className="h-8 w-8" />
          <span className="text-[17px] font-semibold tracking-tight">Signaturely</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                dark ? "text-ink-200 hover:bg-white/10 hover:text-white" : "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <Link
              href="/app"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-500"
            >
              My signatures
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                  dark ? "text-ink-200 hover:bg-white/10 hover:text-white" : "text-ink-600 hover:bg-ink-50"
                }`}
              >
                Sign in
              </Link>
              <Link
                href="/app/editor/new"
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-500"
              >
                Build mine
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
