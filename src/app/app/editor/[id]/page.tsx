import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { SignatureEditor } from "@/components/editor/SignatureEditor";
import { currentUser } from "@/lib/session";
import { resolveOrigin } from "@/lib/origin";
import { creditBalance, getSignature } from "@/lib/store";
import { emptyDraft } from "@/lib/signature/defaults";
import {
  BONUS_CREDITS, BONUS_THRESHOLD, PRICE_PER_SIGNATURE_CENTS, billingEnabled, formatPrice,
} from "@/lib/billing";
import type { SignatureDraft } from "@/lib/signature/types";

export const metadata: Metadata = { title: "Signature editor" };

export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [user, origin] = await Promise.all([currentUser(), resolveOrigin()]);

  const balance = user && billingEnabled() ? (await creditBalance(user.id)).balance : 0;
  const billingBase = {
    enabled: billingEnabled(),
    balance,
    price: formatPrice(PRICE_PER_SIGNATURE_CENTS),
    packQuantity: BONUS_THRESHOLD,
    bonusCredits: BONUS_CREDITS,
  };

  // "new" is the anonymous entry point — no account needed to build and copy one.
  if (id === "new") {
    return (
      <SignatureEditor
        initialDraft={emptyDraft()}
        signatureId={null}
        shareSlug={null}
        origin={origin}
        signedIn={Boolean(user)}
        billing={{ ...billingBase, paid: false }}
      />
    );
  }

  if (!user) redirect(`/login?next=/app/editor/${id}`);

  const signature = await getSignature(id);
  if (!signature || signature.ownerId !== user.id) notFound();

  const { id: _id, ownerId: _ownerId, slug: _slug, createdAt: _c, updatedAt: _u, ...draft } = signature;

  return (
    <SignatureEditor
      initialDraft={draft as SignatureDraft}
      signatureId={signature.id}
      shareSlug={signature.slug}
      origin={origin}
      signedIn
      billing={{ ...billingBase, paid: Boolean(signature.paid) }}
    />
  );
}
