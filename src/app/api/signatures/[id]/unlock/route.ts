/** Spends one credit to unlock a signature for export. */

import { NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { creditBalance, getSignature, unlockSignature } from "@/lib/store";
import { billingEnabled } from "@/lib/billing";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { id } = await params;
  const signature = await getSignature(id);
  if (!signature || signature.ownerId !== user.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  if (!billingEnabled() || signature.paid) {
    return NextResponse.json({ ok: true, paid: true });
  }

  const unlocked = await unlockSignature(id, user.id);
  if (!unlocked) {
    return NextResponse.json(
      { error: "No credits left.", balance: (await creditBalance(user.id)).balance },
      { status: 402 },
    );
  }
  return NextResponse.json({ ok: true, paid: true, balance: (await creditBalance(user.id)).balance });
}
