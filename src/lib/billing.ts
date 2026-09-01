/**
 * Pricing.
 *
 * Smart Stamp is priced per signature, not per month: an email signature is
 * something most people set up once, and a subscription for that is a bad deal
 * dressed up as a plan. Building, previewing and switching templates is free —
 * you pay to take a finished signature away.
 *
 * Buying five within a rolling twelve months adds ten more at no charge, so a
 * whole small office costs $50 rather than $150. The bonus is granted once per
 * window so it rewards the decision to kit out a team, not repeated top-ups.
 */

export const PRICE_PER_SIGNATURE_CENTS = 1000;
export const CURRENCY = "usd";

/** Buy this many inside the window and the bonus lands. */
export const BONUS_THRESHOLD = 5;
export const BONUS_CREDITS = 10;
export const BONUS_WINDOW_MONTHS = 12;

/** Quantities offered on the pricing page and in the buy dialog. */
export const PACKS = [
  { quantity: 1, label: "One signature" },
  { quantity: 3, label: "Three" },
  { quantity: BONUS_THRESHOLD, label: "Office pack", highlight: true },
] as const;

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}

export function priceFor(quantity: number): number {
  return Math.max(1, Math.floor(quantity)) * PRICE_PER_SIGNATURE_CENTS;
}

/**
 * What a purchase of this size actually lands in the account, assuming no
 * earlier purchases in the window. Used for the pricing copy, so the promise
 * on the page and the credits granted by the webhook come from one place.
 */
export function creditsFor(quantity: number): { paid: number; bonus: number; total: number } {
  const paid = Math.max(1, Math.floor(quantity));
  const bonus = paid >= BONUS_THRESHOLD ? BONUS_CREDITS : 0;
  return { paid, bonus, total: paid + bonus };
}

/** Whether Stripe is wired up. Without it nothing can be charged. */
export function paymentsConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
}

/**
 * The paywall.
 *
 * Deliberately requires payments to be configured as well as switched on:
 * turning the flag on without Stripe would block every export with no way to
 * pay, which is worse for everyone than leaving it free.
 */
export function billingEnabled(): boolean {
  return process.env.BILLING_ENABLED === "true" && paymentsConfigured();
}

/** Whether a signature can be copied, downloaded or shared. */
export function canExport(signature: { paid?: boolean } | null | undefined): boolean {
  if (!billingEnabled()) return true;
  return Boolean(signature?.paid);
}

/** Saved signatures are unlimited: the charge is per signature, not per seat. */
export function signatureLimit(): number {
  return Number.POSITIVE_INFINITY;
}
