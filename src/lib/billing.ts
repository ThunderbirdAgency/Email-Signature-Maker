/**
 * Feature gating.
 *
 * Billing is off by default: with BILLING_ENABLED unset, every Pro capability
 * is available to everyone and the pricing page says so. Flipping the flag on
 * turns the same list into an upgrade prompt, so the paywall can be switched on
 * later without touching the editor.
 */

import type { User } from "./store";

export const PRO_FEATURES = [
  "unlimited-signatures",
  "banner",
  "video",
  "qr",
  "badges",
  "buttons",
  "custom-fields",
  "disclaimer",
  "remove-branding",
] as const;

export type ProFeature = (typeof PRO_FEATURES)[number];

export const FREE_SIGNATURE_LIMIT = 3;

export function billingEnabled(): boolean {
  return process.env.BILLING_ENABLED === "true";
}

export function isPro(user: Pick<User, "plan"> | null): boolean {
  if (!billingEnabled()) return true;
  return user?.plan === "pro";
}

export function canUse(user: Pick<User, "plan"> | null, _feature: ProFeature): boolean {
  return isPro(user);
}

export function signatureLimit(user: Pick<User, "plan"> | null): number {
  return isPro(user) ? Number.POSITIVE_INFINITY : FREE_SIGNATURE_LIMIT;
}
