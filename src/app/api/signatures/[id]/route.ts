import { NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { deleteSignature, getSignature, updateSignature } from "@/lib/store";
import { normalizeDraft } from "@/lib/signature/normalize";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await currentUser();
  const { id } = await params;
  const signature = await getSignature(id);
  if (!signature || signature.ownerId !== user?.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return NextResponse.json({ signature });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const updated = await updateSignature(id, user.id, normalizeDraft(body));
  if (!updated) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ signature: updated });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { id } = await params;
  const ok = await deleteSignature(id, user.id);
  if (!ok) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
