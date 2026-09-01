/**
 * Pricing.
 *
 * Smart Stamp is priced per signature, not per month: an email signature is
 * something most people set up once, and a subscription for that is a bad deal
 * dressed up as a plan. Building, previewing and switching templates is free —
 * you pay to take a finished signature away.
 *
 * `BILLING_ENABLED` is the master switch. Left off (the default) everything is
 * free for everyone and the pricing page says so, so the paywall can be turned
 * on later without touching the editor.
 */

import type { User } from "./store";

/** Price in the smallest currency unit, so there is no floating point money. */
export const PRICE_PER_SIGNATURE_CENTS = 1000;
export const CURRENCY = "USD";

export function formatPrice(cents: number = PRICE_PER_SIGNATURE_CENTS): string {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}

export function billingEnabled(): boolean {
  return process.env.BILLING_ENABLED === "true";
}

/**
 * Whether a signature can be exported — copied, downloaded or shared.
 *
 * Everything up to this point is free, which is what lets someone see exactly
 * what they are buying before they pay for it.
 */
export function canExport(signature: { paid?: boolean } | null): boolean {
  if (!billingEnabled()) return true;
  return Boolean(signature?.paid);
}

/** Saved signatures are unlimited: the charge is per signature, not per seat. */
export function signatureLimit(_user: Pick<User, "plan"> | null): number {
  return Number.POSITIVE_INFINITY;
}
