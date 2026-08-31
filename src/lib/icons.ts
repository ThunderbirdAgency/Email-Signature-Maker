/**
 * Icon rendering for signatures.
 *
 * Mail clients are the constraint here: Gmail and every Outlook build refuse
 * inline SVG and remote SVG in <img>, so every icon a signature references has
 * to be a real raster image served from a stable URL. This module builds the
 * SVG and `renderIconPng` rasterises it.
 */

import * as simpleIcons from "simple-icons";
import { NETWORK_BY_SLUG } from "./signature/networks";
import { normaliseHex, type IconSpec, type IconStyleName } from "./icon-url";

export type { IconSpec, IconShapeName, IconStyleName } from "./icon-url";
export { FIELD_ICONS, iconUrl, parseIconVariant } from "./icon-url";

type SimpleIcon = { path: string; hex: string; title: string };

/**
 * Marks that Simple Icons removed over trademark policy, plus the non-brand
 * glyphs used by contact rows and custom fields. All are 24x24, solid-filled,
 * to sit consistently alongside the Simple Icons set.
 */
const AUTHORED_PATHS: Record<string, string> = {
  linkedin:
    "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  chat: "M12 3c-5 0-9 3.4-9 7.6 0 2.4 1.3 4.5 3.4 5.9L5.6 20a.6.6 0 0 0 .9.7l4-2.2c.5.1 1 .1 1.5.1 5 0 9-3.4 9-7.6S17 3 12 3Z",
  globe:
    "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm6.9 6h-2.6a15.6 15.6 0 0 0-1.6-3.8A8 8 0 0 1 18.9 8ZM12 4.1c.8 1.1 1.5 2.5 1.9 3.9h-3.8c.4-1.4 1.1-2.8 1.9-3.9ZM4.3 14a8 8 0 0 1 0-4h3a17.6 17.6 0 0 0 0 4h-3Zm.8 2h2.6c.4 1.4.9 2.7 1.6 3.8A8 8 0 0 1 5.1 16Zm2.6-8H5.1a8 8 0 0 1 4.2-3.8A15.6 15.6 0 0 0 7.7 8ZM12 19.9c-.8-1.1-1.5-2.5-1.9-3.9h3.8c-.4 1.4-1.1 2.8-1.9 3.9ZM14.2 14H9.8a15.6 15.6 0 0 1 0-4h4.4a15.6 15.6 0 0 1 0 4Zm.5 5.8c.7-1.1 1.2-2.4 1.6-3.8h2.6a8 8 0 0 1-4.2 3.8Zm2.1-5.8a17.6 17.6 0 0 0 0-4h3a8 8 0 0 1 0 4h-3Z",
  envelope:
    "M2 5.5A2.5 2.5 0 0 1 4.5 3h15A2.5 2.5 0 0 1 22 5.5v13a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 2 18.5v-13Zm2.2.2 7.8 5.85 7.8-5.85a.5.5 0 0 0-.3-.2h-15a.5.5 0 0 0-.3.2ZM20 8.2l-7.4 5.55a1 1 0 0 1-1.2 0L4 8.2v10.3a.5.5 0 0 0 .5.5h15a.5.5 0 0 0 .5-.5V8.2Z",
  phone:
    "M6.6 2.5a1.8 1.8 0 0 0-2.4.5L3 4.8c-.9 1.3-.9 3 0 4.6a28 28 0 0 0 11.6 11.6c1.6.9 3.3.9 4.6 0l1.8-1.2a1.8 1.8 0 0 0 .5-2.4l-1.9-3a1.8 1.8 0 0 0-2.2-.7l-2.5 1a1 1 0 0 1-1.1-.2 20 20 0 0 1-3.7-3.7 1 1 0 0 1-.2-1.1l1-2.5a1.8 1.8 0 0 0-.7-2.2l-3-1.9Z",
  mobile:
    "M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm3 17h4v1.4h-4V19Z",
  pin: "M12 2a7.5 7.5 0 0 0-7.5 7.5c0 5.4 6.6 11.8 6.9 12.1a.9.9 0 0 0 1.2 0c.3-.3 6.9-6.7 6.9-12.1A7.5 7.5 0 0 0 12 2Zm0 10.2a2.7 2.7 0 1 1 0-5.4 2.7 2.7 0 0 1 0 5.4Z",
  calendar:
    "M8 2a1 1 0 0 1 1 1v1h6V3a1 1 0 1 1 2 0v1h1.5A2.5 2.5 0 0 1 21 6.5v12a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 18.5v-12A2.5 2.5 0 0 1 5.5 4H7V3a1 1 0 0 1 1-1ZM5 9v9.5c0 .3.2.5.5.5h13c.3 0 .5-.2.5-.5V9H5Zm3 2.5h2.5V14H8v-2.5Zm5.5 0H16V14h-2.5v-2.5Z",
  link: "M14 3a1 1 0 0 0 0 2h3.6l-7.3 7.3a1 1 0 1 0 1.4 1.4L19 6.4V10a1 1 0 1 0 2 0V4a1 1 0 0 0-1-1h-6ZM5 5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5a1 1 0 1 0-2 0v5H5V7h5a1 1 0 1 0 0-2H5Z",
  document:
    "M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.4L13.6 2H6Zm7 1.9L18.1 9H14a1 1 0 0 1-1-1V3.9ZM8 12h8v2H8v-2Zm0 4h8v2H8v-2Z",
  print:
    "M7 2h10v4H7V2ZM5 8h14a3 3 0 0 1 3 3v5a2 2 0 0 1-2 2h-2v3H6v-3H4a2 2 0 0 1-2-2v-5a3 3 0 0 1 3-3Zm3 8h8v5H8v-5Zm9-4.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z",
  briefcase:
    "M9 4a2 2 0 0 0-2 2v1H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3V6a2 2 0 0 0-2-2H9Zm0 3V6h6v1H9Z",
  building:
    "M4 21V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v3h3a2 2 0 0 1 2 2v11h-6v-4h-4v4H4Zm3-13h3v2H7V8Zm0 4h3v2H7v-2Zm4-4h3v2h-3V8Zm0 4h3v2h-3v-2Zm6 0h2v2h-2v-2Zm0 4h2v2h-2v-2Z",
  user: "M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.4 0-8 2.5-8 5.5V22h16v-2.5c0-3-3.6-5.5-8-5.5Z",
  star: "M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.11 6.47L12 17.35l-5.81 3.05 1.11-6.47-4.7-4.58 6.5-.95L12 2.5Z",
  play: "M8 5.14v13.72a1 1 0 0 0 1.52.86l11.14-6.86a1 1 0 0 0 0-1.72L9.52 4.28A1 1 0 0 0 8 5.14Z",
};

/** Networks with no accurate brand mark available fall back to a neutral glyph. */
const NETWORK_GLYPH_FALLBACK: Record<string, string> = {
  slack: "chat",
  teams: "chat",
  skype: "chat",
  website: "globe",
  email: "envelope",
  phone: "phone",
  location: "pin",
};


/** Relative luminance, used to pick a readable glyph colour over a fill. */
function isLight(hex: string): boolean {
  const n = parseInt(hex, 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.45;
}

function lookupGlyph(slug: string): { path: string; hex: string } {
  const network = NETWORK_BY_SLUG[slug];

  // Non-brand and field glyphs are addressed by their own key.
  if (!network && AUTHORED_PATHS[slug]) {
    return { path: AUTHORED_PATHS[slug], hex: "334155" };
  }

  if (network?.simpleIcon) {
    const icon = (simpleIcons as unknown as Record<string, SimpleIcon>)[network.simpleIcon];
    if (icon) return { path: icon.path, hex: network.hex || icon.hex };
  }

  if (AUTHORED_PATHS[slug]) {
    return { path: AUTHORED_PATHS[slug], hex: network?.hex ?? "334155" };
  }

  const fallbackKey = NETWORK_GLYPH_FALLBACK[slug] ?? "link";
  return { path: AUTHORED_PATHS[fallbackKey], hex: network?.hex ?? "334155" };
}

/** Resolve the fill used for the shape (or the glyph itself, when plain). */
function resolveFill(style: IconStyleName, brandHex: string, customHex?: string): string {
  switch (style) {
    case "brand": return brandHex;
    case "dark": return "1f2937";
    case "light": return "ffffff";
    case "grey": return "6b7280";
    case "custom": return normaliseHex(customHex, brandHex);
  }
}

export function buildIconSvg(spec: IconSpec): string {
  const size = Math.max(8, Math.min(512, Math.round(spec.size) || 96));
  const { path, hex } = lookupGlyph(spec.slug);
  const brandHex = normaliseHex(hex, "334155");
  const fill = resolveFill(spec.style, brandHex, spec.hex);

  if (spec.shape === "plain") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24"><path d="${path}" fill="#${fill}"/></svg>`;
  }

  // On a filled tile the glyph takes the contrasting colour. "light" tiles are
  // white, so the glyph keeps the brand colour and stays recognisable.
  const glyphFill =
    spec.style === "light" ? brandHex : isLight(fill) ? "1f2937" : "ffffff";

  const radius = spec.shape === "circle" ? 12 : spec.shape === "rounded" ? 5.5 : 0;
  // Inset the glyph so it breathes inside the tile.
  const inset = spec.shape === "circle" ? 5.2 : 5;
  const scale = (24 - inset * 2) / 24;

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24">`,
    `<rect x="0" y="0" width="24" height="24" rx="${radius}" ry="${radius}" fill="#${fill}"/>`,
    `<g transform="translate(${inset} ${inset}) scale(${scale.toFixed(4)})">`,
    `<path d="${path}" fill="#${glyphFill}"/>`,
    `</g></svg>`,
  ].join("");
}

/** Rasterise an icon. Kept server-only: `sharp` is a native module. */
export async function renderIconPng(spec: IconSpec): Promise<Buffer> {
  const { default: sharp } = await import("sharp");
  const svg = buildIconSvg(spec);
  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
}
