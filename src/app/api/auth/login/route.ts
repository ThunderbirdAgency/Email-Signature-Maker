import { NextResponse } from "next/server";
import { findUserByEmail, verifyPassword } from "@/lib/store";
import { createSession, authConfigured, AUTH_SETUP_MESSAGE } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!authConfigured()) {
    return NextResponse.json({ error: AUTH_SETUP_MESSAGE }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const email = String(body.email ?? "").trim();
  const password = String(body.password ?? "");

  const user = await findUserByEmail(email);
  // One message for both cases, so this cannot be used to enumerate accounts.
  const invalid = NextResponse.json(
    { error: "That email and password combination did not match." },
    { status: 401 },
  );
  if (!user) return invalid;
  if (!verifyPassword(password, user.passwordHash, user.salt)) return invalid;

  await createSession(user.id);
  return NextResponse.json({ ok: true });
}
