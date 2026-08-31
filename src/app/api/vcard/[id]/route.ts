/** Downloadable .vcf for a signature, linked from the share page. */

import { NextResponse } from "next/server";
import { getSignature } from "@/lib/store";
import { renderVCard } from "@/lib/signature/render";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const signature = await getSignature(id);
  if (!signature) return new NextResponse("Not found", { status: 404 });

  const filename = (signature.details.fullName || "contact")
    .replace(/[^A-Za-z0-9 _-]/g, "")
    .trim()
    .replace(/\s+/g, "-") || "contact";

  return new NextResponse(renderVCard(signature), {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}.vcf"`,
    },
  });
}
