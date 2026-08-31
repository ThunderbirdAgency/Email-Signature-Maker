/**
 * Icon images for signatures.
 *
 * URL shape: /api/icon/<slug>/<style>-<shape>-<size>[-<hex>].png
 * Everything needed to draw the icon is in the path, so responses are
 * immutable and can be cached hard by Gmail's image proxy and every CDN in
 * between.
 */

import { NextResponse } from "next/server";
import { parseIconVariant, renderIconPng } from "@/lib/icons";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; variant: string }> },
) {
  const { slug, variant } = await params;
  const spec = parseIconVariant(decodeURIComponent(slug), variant);
  if (!spec) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const png = await renderIconPng(spec);
    return new NextResponse(new Uint8Array(png), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
        "Cross-Origin-Resource-Policy": "cross-origin",
      },
    });
  } catch {
    return new NextResponse("Could not render icon", { status: 500 });
  }
}
