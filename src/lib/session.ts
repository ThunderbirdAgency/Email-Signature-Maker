/**
 * Cookie-backed sessions.
 *
 * A signed JWT in an httpOnly cookie. No session table to keep in sync, and
 * the only server-side state is the signing secret.
 */

import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { findUserById, type User } from "./store";

const COOKIE_NAME = "sig_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

/**
 * Whether sessions can be issued at all.
 *
 * Signing with a guessable secret in production would let anyone forge a
 * session, so that is never allowed. Rather than crashing the whole site when
 * the secret is missing, the sign-in routes report it and anonymous browsing —
 * which is most of the product — carries on working.
 */
export function authConfigured(): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  const value = process.env.AUTH_SECRET;
  return Boolean(value && value.length >= 32);
}

export const AUTH_SETUP_MESSAGE =
  "Accounts are not available yet: this deployment has no AUTH_SECRET set. " +
  "You can still build a signature and copy it.";

function secret(): Uint8Array {
  const value = process.env.AUTH_SECRET;
  if (value && value.length >= 32) return new TextEncoder().encode(value);

  if (process.env.NODE_ENV === "production") {
    throw new Error(AUTH_SETUP_MESSAGE);
  }
  // Development convenience only: sessions reset whenever the server restarts.
  return new TextEncoder().encode("dev-only-insecure-secret-do-not-use-in-prod");
}

export async function createSession(userId: string): Promise<void> {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secret());

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/** The signed-in user, or null. Safe to call from any server component. */
export async function currentUser(): Promise<User | null> {
  if (!authConfigured()) return null;
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (typeof payload.sub !== "string") return null;
    return await findUserById(payload.sub);
  } catch {
    return null;
  }
}

/** Strip secrets before a user object crosses into a client component. */
export function publicUser(user: User): { id: string; email: string; name: string; plan: User["plan"] } {
  return { id: user.id, email: user.email, name: user.name, plan: user.plan };
}
