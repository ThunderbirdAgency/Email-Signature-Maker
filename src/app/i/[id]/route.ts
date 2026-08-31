/**
 * Serves uploaded signature images.
 *
 * Deliberately a short, clean path: this URL is embedded in every email the
 * user sends, so it is worth keeping readable.
 */

import { NextResponse } from "next/server";
import { readUpload } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const found = await readUpload(id);
  if (!found) return new NextResponse("Not found", { status: 404 });

  return new NextResponse(new Uint8Array(found.data), {
    headers: {
      "Content-Type": found.meta.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "Access-Control-Allow-Origin": "*",
      "Cross-Origin-Resource-Policy": "cross-origin",
    },
  });
}
