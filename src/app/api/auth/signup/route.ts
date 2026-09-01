import { NextResponse } from "next/server";
import { createUser, findUserByEmail } from "@/lib/store";
import { createSession, authConfigured, AUTH_SETUP_MESSAGE } from "@/lib/session";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  if (!authConfigured()) {
    return NextResponse.json({ error: AUTH_SETUP_MESSAGE }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const email = String(body.email ?? "").trim();
  const password = String(body.password ?? "");
  const name = String(body.name ?? "").trim();

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Passwords must be at least 8 characters." }, { status: 400 });
  }

  const result = await createUser({ email, password, name });
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }

  await createSession(result.user.id);
  return NextResponse.json({ ok: true });
}

export async function GET(request: Request) {
  // Used by the signup form to warn about a taken address before submitting.
  const email = new URL(request.url).searchParams.get("email") ?? "";
  if (!EMAIL_RE.test(email)) return NextResponse.json({ taken: false });
  return NextResponse.json({ taken: Boolean(await findUserByEmail(email)) });
}
