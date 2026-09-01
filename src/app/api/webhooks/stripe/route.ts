/**
 * Stripe webhook.
 *
 * Credits are granted here and nowhere else. The browser is never trusted to
 * report a successful payment — it can be closed, replayed or forged — so the
 * success page only reads state that this handler has already written.
 */

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { recordPurchase } from "@/lib/store";
import { paymentsConfigured } from "@/lib/billing";
import type Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!paymentsConfigured()) {
    return NextResponse.json({ error: "Payments are not configured." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  // The raw body is required: the signature is computed over the exact bytes
  // Stripe sent, so parsing first would break verification.
  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string,
    );
  } catch {
    // An unverified payload is indistinguishable from an attacker's.
    return NextResponse.json({ error: "Signature verification failed." }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true, ignored: event.type });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  if (session.payment_status !== "paid") {
    return NextResponse.json({ received: true, ignored: "unpaid" });
  }

  const userId = session.metadata?.userId;
  const quantity = Number(session.metadata?.quantity ?? 0);
  if (!userId || !Number.isFinite(quantity) || quantity < 1) {
    // Nothing actionable, but returning 200 stops Stripe retrying forever.
    return NextResponse.json({ received: true, ignored: "missing metadata" });
  }

  try {
    const result = await recordPurchase({
      userId,
      stripeSessionId: session.id,
      credits: quantity,
      amountCents: session.amount_total ?? quantity * 1000,
      currency: session.currency ?? "usd",
    });
    // null means this session was already recorded — a retry, not a problem.
    return NextResponse.json({ received: true, granted: result?.granted ?? 0, bonus: result?.bonus ?? 0 });
  } catch {
    // A 500 asks Stripe to retry, which is what we want if the database blipped.
    return NextResponse.json({ error: "Could not record purchase." }, { status: 500 });
  }
}
