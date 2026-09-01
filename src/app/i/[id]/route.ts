/**
 * Serves uploaded signature images.
 *
 * Deliberately a short, clean path: this URL is embedded in every email the
 * user sends, so it is worth keeping readable.
 *
 * `?w=` returns a variant scaled to that width. Without it a 1200px upload
 * would be downloaded in full to be displayed at 90px — on every open, by
 * every recipient — which is both slow and the single largest source of
 * bandwidth this service has. The renderer asks for twice the display width so
 * the image still looks sharp on a retina screen.
 */

import { NextResponse } from "next/server";
import { readUpload } from "@/lib/store";

export const runtime = "nodejs";

const MIN_WIDTH = 16;
const MAX_WIDTH = 1200;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const found = await readUpload(id);
  if (!found) return new NextResponse("Not found", { status: 404 });

  const requested = Number(new URL(request.url).searchParams.get("w"));
  const width =
    Number.isFinite(requested) && requested >= MIN_WIDTH
      ? Math.min(MAX_WIDTH, Math.round(requested))
      : null;

  let body = found.data;
  let contentType = found.meta.contentType;

  if (width) {
    try {
      const { default: sharp } = await import("sharp");
      const animated = contentType === "image/gif";
      const pipeline = sharp(found.data, { animated }).resize({
        width,
        // Never scale up: a variant larger than the original is pure waste.
        withoutEnlargement: true,
      });
      // Keep the stored format. Re-encoding a photograph as PNG here would
      // undo the whole point of serving a smaller variant.
      if (animated) {
        body = await pipeline.gif().toBuffer();
      } else if (contentType === "image/jpeg") {
        body = await pipeline.jpeg({ quality: 82, mozjpeg: true }).toBuffer();
      } else {
        body = await pipeline.png({ compressionLevel: 9 }).toBuffer();
      }
    } catch {
      // A resize failure should never cost the recipient the image itself.
      body = found.data;
      contentType = found.meta.contentType;
    }
  }

  return new NextResponse(new Uint8Array(body), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "Access-Control-Allow-Origin": "*",
      "Cross-Origin-Resource-Policy": "cross-origin",
    },
  });
}
