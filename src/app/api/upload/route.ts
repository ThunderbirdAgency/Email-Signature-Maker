/**
 * Image uploads.
 *
 * Signature images must live at a public URL because the recipient's mail
 * client fetches them. Uploads are normalised through sharp: re-encoded to
 * strip metadata, capped in dimensions, and given a content type we chose
 * rather than one the client claimed.
 */

import { NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { saveUpload } from "@/lib/store";
import { originFromRequest } from "@/lib/origin";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024;
const MAX_DIMENSION = 1200;

export async function POST(request: Request) {
  const user = await currentUser();

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file supplied." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Images must be 5 MB or smaller." }, { status: 413 });
  }

  const input = Buffer.from(await file.arrayBuffer());
  const { default: sharp } = await import("sharp");

  try {
    const meta = await sharp(input, { animated: true }).metadata();
    const isAnimated = (meta.pages ?? 1) > 1;

    let output: Buffer;
    let contentType: string;
    let extension: string;

    if (isAnimated) {
      // Animated GIFs are a genuine signature feature, so keep the animation
      // rather than flattening it to a still frame.
      output = await sharp(input, { animated: true })
        .resize({ width: MAX_DIMENSION, withoutEnlargement: true })
        .gif()
        .toBuffer();
      contentType = "image/gif";
      extension = ".gif";
    } else {
      output = await sharp(input)
        .rotate()
        .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
        .png({ compressionLevel: 9 })
        .toBuffer();
      contentType = "image/png";
      extension = ".png";
    }

    const saved = await saveUpload(output, contentType, user?.id ?? null, extension);
    return NextResponse.json({
      id: saved.id,
      url: `${originFromRequest(request)}/i/${saved.id}`,
      bytes: saved.bytes,
    });
  } catch {
    return NextResponse.json(
      { error: "That file could not be read as an image." },
      { status: 400 },
    );
  }
}
