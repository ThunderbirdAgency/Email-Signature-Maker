import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { AuthShell, safeNext } from "@/components/site/AuthShell";
import { currentUser } from "@/lib/session";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  if (await currentUser()) redirect(safeNext(next));

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your saved signatures."
      mode="login"
      next={safeNext(next)}
    />
  );
}
