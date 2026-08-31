import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { AuthForm } from "@/components/site/AuthForm";
import { Logo } from "@/components/site/Logo";
import { currentUser } from "@/lib/session";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  if (await currentUser()) redirect(safeNext(next));

  return <AuthShell title="Welcome back" subtitle="Sign in to your saved signatures." mode="login" next={safeNext(next)} />;
}

/** Only same-origin paths are honoured, so `next` cannot be used as an open redirect. */
export function safeNext(next: string | undefined): string {
  if (!next) return "/app";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/app";
}

export function AuthShell({
  title,
  subtitle,
  mode,
  next,
}: {
  title: string;
  subtitle: string;
  mode: "login" | "signup";
  next: string;
}) {
  return (
    <main className="flex min-h-screen">
      <div className="relative hidden w-1/2 overflow-hidden bg-ink-950 lg:block">
        <div className="aurora" aria-hidden="true" />
        <div className="grid-lines absolute inset-0" aria-hidden="true" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link href="/" className="flex items-center gap-2.5 text-white">
            <Logo className="h-8 w-8" />
            <span className="font-semibold tracking-tight">Signaturely</span>
          </Link>
          <div>
            <p className="max-w-md text-2xl font-semibold leading-snug text-white">
              Every email you send is a small piece of your brand. Make it a good one.
            </p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-400">
              Your saved signatures stay in your account, so updating a job title or a
              campaign banner takes about ten seconds.
            </p>
          </div>
        </div>
      </div>

      <div className="flex w-full items-center justify-center px-5 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
            <Logo className="h-8 w-8" />
            <span className="font-semibold tracking-tight">Signaturely</span>
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">{title}</h1>
          <p className="mt-2 text-sm text-ink-500">{subtitle}</p>
          <div className="mt-8">
            <AuthForm mode={mode} next={next} />
          </div>
        </div>
      </div>
    </main>
  );
}
