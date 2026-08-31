/**
 * QR codes.
 *
 * Two modes: `url` encodes an arbitrary link, `vcard` encodes the signature's
 * own contact card so scanning it saves the contact. Rendered as PNG because
 * mail clients will not display SVG.
 */

import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { getSignature } from "@/lib/store";
import { renderVCard } from "@/lib/signature/render";

export const runtime = "nodejs";

function clean(hex: string | null, fallback: string): string {
  const v = (hex || "").replace(/^#/, "");
  return /^[0-9a-f]{6}$/i.test(v) ? `#${v}` : fallback;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("mode") === "vcard" ? "vcard" : "url";
  const size = Math.min(600, Math.max(48, Number(url.searchParams.get("size")) || 264));
  const dark = clean(url.searchParams.get("color"), "#0f172a");

  let payload = "";
  if (mode === "vcard") {
    const id = url.searchParams.get("sig") || "";
    const signature = id ? await getSignature(id) : null;
    if (!signature) return new NextResponse("Unknown signature", { status: 404 });
    payload = renderVCard(signature);
  } else {
    payload = (url.searchParams.get("data") || "").slice(0, 1200);
    if (payload && !/^[a-z][a-z0-9+.-]*:/i.test(payload)) payload = `https://${payload}`;
  }

  if (!payload) return new NextResponse("Nothing to encode", { status: 400 });

  try {
    const png = await QRCode.toBuffer(payload, {
      type: "png",
      width: size,
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark, light: "#ffffff" },
    });
    return new NextResponse(new Uint8Array(png), {
      headers: {
        "Content-Type": "image/png",
        // vCard content changes when the signature is edited, so this is
        // cached for a day rather than forever.
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*",
        "Cross-Origin-Resource-Policy": "cross-origin",
      },
    });
  } catch {
    return new NextResponse("Could not render QR code", { status: 500 });
  }
}
