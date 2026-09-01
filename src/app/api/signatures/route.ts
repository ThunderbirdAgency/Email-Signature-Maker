import { NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { countSignatures, createSignature, listSignatures } from "@/lib/store";
import { normalizeDraft } from "@/lib/signature/normalize";
import { signatureLimit } from "@/lib/billing";

export const runtime = "nodejs";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  return NextResponse.json({ signatures: await listSignatures(user.id) });
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  if ((await countSignatures(user.id)) >= signatureLimit()) {
    return NextResponse.json({ error: "Signature limit reached." }, { status: 402 });
  }

  const body = await request.json().catch(() => ({}));
  const signature = await createSignature(normalizeDraft(body), user.id);
  return NextResponse.json({ signature });
}
