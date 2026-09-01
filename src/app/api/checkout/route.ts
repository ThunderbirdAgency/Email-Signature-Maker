/**
 * Starts a Stripe Checkout session for a number of signature credits.
 *
 * The price is built here rather than read from a Stripe Price object, so
 * setting the service up needs only two API keys — no dashboard configuration
 * to keep in sync with the code.
 */

import { NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { originFromRequest } from "@/lib/origin";
import { stripe } from "@/lib/stripe";
import {
  CURRENCY, PRICE_PER_SIGNATURE_CENTS, creditsFor, paymentsConfigured,
} from "@/lib/billing";

export const runtime = "nodejs";

const MAX_QUANTITY = 100;

export async function POST(request: Request) {
  if (!paymentsConfigured()) {
    return NextResponse.json(
      { error: "Payments are not configured on this deployment." },
      { status: 503 },
    );
  }

  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to buy credits." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const quantity = Math.min(MAX_QUANTITY, Math.max(1, Math.floor(Number(body.quantity) || 1)));
  const origin = originFromRequest(request);
  const { bonus } = creditsFor(quantity);

  try {
    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      customer_email: user.email,
      line_items: [
        {
          quantity,
          price_data: {
            currency: CURRENCY,
            unit_amount: PRICE_PER_SIGNATURE_CENTS,
            product_data: {
              name: "Smart Stamp email signature",
              description:
                bonus > 0
                  ? `Includes ${bonus} bonus signatures for buying ${quantity}.`
                  : "One email signature, yours to edit forever.",
            },
          },
        },
      ],
      // The webhook is what actually grants credits, so it has to be able to
      // tell whose account to credit without trusting anything from the browser.
      metadata: { userId: user.id, quantity: String(quantity) },
      success_url: `${origin}/app?purchase=success`,
      cancel_url: `${origin}/app?purchase=cancelled`,
    });

    if (!session.url) {
      return NextResponse.json({ error: "Stripe did not return a checkout URL." }, { status: 502 });
    }
    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout could not be started.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
