import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { AuthShell, safeNext } from "../login/page";
import { currentUser } from "@/lib/session";

export const metadata: Metadata = { title: "Create an account" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  if (await currentUser()) redirect(safeNext(next));

  return (
    <AuthShell
      title="Create your account"
      subtitle="Save your signatures, share them with colleagues, and edit them any time."
      mode="signup"
      next={safeNext(next)}
    />
  );
}
