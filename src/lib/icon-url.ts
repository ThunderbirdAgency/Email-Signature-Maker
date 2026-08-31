/**
 * Icon addressing, shared by the browser and the server.
 *
 * Kept apart from `icons.ts` on purpose: that module pulls in the full Simple
 * Icons set and `sharp`, neither of which belongs in a client bundle. The live
 * preview only ever needs to build URLs, which is all this file does.
 */

export type IconStyleName = "brand" | "dark" | "light" | "grey" | "custom";
export type IconShapeName = "plain" | "circle" | "rounded" | "square";

export interface IconSpec {
  slug: string;
  style: IconStyleName;
  shape: IconShapeName;
  size: number;
  /** Hex without '#', required when style is "custom". */
  hex?: string;
}

/** Icon keys offered for custom fields and contact rows, in picker order. */
export const FIELD_ICONS = [
  "briefcase", "building", "user", "envelope", "phone", "mobile", "print",
  "globe", "pin", "calendar", "link", "document", "star", "chat",
] as const;

export function normaliseHex(value: string | undefined, fallback: string): string {
  const v = (value || "").replace(/^#/, "").trim();
  if (/^[0-9a-f]{6}$/i.test(v)) return v.toLowerCase();
  if (/^[0-9a-f]{3}$/i.test(v)) {
    return v.toLowerCase().split("").map((c) => c + c).join("");
  }
  return fallback;
}

/** Build the public URL an email will hot-link for an icon. */
export function iconUrl(origin: string, spec: IconSpec): string {
  const parts: (string | number)[] = [spec.style, spec.shape, Math.round(spec.size)];
  if (spec.style === "custom") parts.push(normaliseHex(spec.hex, "334155"));
  return `${origin}/api/icon/${encodeURIComponent(spec.slug)}/${parts.join("-")}.png`;
}

/**
 * Parse `brand-circle-96.png` / `custom-circle-96-0a66c2.png` into a spec.
 * Returns null for anything malformed so the route can 404 rather than guess.
 */
export function parseIconVariant(slug: string, variant: string): IconSpec | null {
  const base = variant.replace(/\.png$/i, "");
  const parts = base.split("-");
  if (parts.length < 3) return null;

  const [style, shape, sizeRaw, hex] = parts;
  const styles: IconStyleName[] = ["brand", "dark", "light", "grey", "custom"];
  const shapes: IconShapeName[] = ["plain", "circle", "rounded", "square"];
  if (!styles.includes(style as IconStyleName)) return null;
  if (!shapes.includes(shape as IconShapeName)) return null;

  const size = Number(sizeRaw);
  if (!Number.isFinite(size) || size < 8 || size > 512) return null;
  if (style === "custom" && !/^[0-9a-f]{6}$/i.test(hex || "")) return null;

  return { slug, style: style as IconStyleName, shape: shape as IconShapeName, size, hex };
}
