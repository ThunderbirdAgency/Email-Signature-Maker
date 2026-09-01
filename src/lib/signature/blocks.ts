/**
 * Reusable HTML fragments for signature rendering.
 *
 * Everything here targets the lowest common denominator across mail clients:
 * nested tables, inline styles only, no CSS classes, no flexbox, explicit
 * width/height attributes on images. Templates compose these builders.
 */

import type { Align, RenderContext, Signature, ImageSpec } from "./types";
import { fontStack } from "./fonts";
import { resolveNetworkUrl, NETWORK_BY_SLUG } from "./networks";
import { iconUrl, type IconShapeName, type IconStyleName } from "../icon-url";

export function esc(value: string): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Escape a value destined for an href, rejecting script-bearing schemes. */
export function escUrl(value: string): string {
  const v = String(value ?? "").trim();
  if (!v) return "";
  if (/^(javascript|data|vbscript):/i.test(v)) return "";
  return esc(v);
}

export const TABLE_OPEN =
  '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">';

export interface Spacing {
  row: number;
  block: number;
  gutter: number;
}

export function spacing(sig: Signature): Spacing {
  switch (sig.style.density) {
    case "compact": return { row: 1, block: 8, gutter: 14 };
    case "roomy": return { row: 5, block: 18, gutter: 26 };
    default: return { row: 3, block: 12, gutter: 20 };
  }
}

export function baseTextStyle(sig: Signature, overrides = ""): string {
  const s = sig.style;
  return (
    `font-family:${fontStack(s.fontFamily)};` +
    `font-size:${s.baseFontSize}px;` +
    `line-height:${Math.round(s.baseFontSize * 1.45)}px;` +
    `color:${s.textColor};` +
    overrides
  );
}

export function link(href: string, label: string, sig: Signature, extra = ""): string {
  const url = escUrl(href);
  if (!url) return label;
  return `<a href="${url}" style="color:${sig.style.linkColor};text-decoration:none;${extra}" target="_blank">${label}</a>`;
}

/* -------------------------------------------------------------------------- */
/* Images                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Ask an uploaded image for a variant sized to how it will actually be shown.
 *
 * Only applies to images this service hosts; a URL the user pasted from
 * elsewhere is left exactly as they gave it.
 */
function sizedUrl(url: string, displayWidth: number): string {
  if (!/\/i\/[A-Za-z0-9]+\.[a-z0-9]+/i.test(url)) return url;
  if (url.includes("?")) return url;
  // Twice the display width keeps it sharp on a retina screen.
  return `${url}?w=${Math.min(1200, Math.max(16, Math.round(displayWidth * 2)))}`;
}

function radiusFor(spec: ImageSpec): string {
  if (spec.shape === "circle") return `border-radius:${Math.round(spec.width / 2)}px;`;
  if (spec.shape === "rounded") return "border-radius:10px;";
  return "";
}

export function image(spec: ImageSpec | null, sig: Signature): string {
  if (!spec?.url) return "";
  const border =
    spec.borderWidth && spec.borderWidth > 0
      ? `border:${spec.borderWidth}px solid ${spec.borderColor || sig.style.primaryColor};`
      : "border:0;";
  const img =
    `<img src="${escUrl(sizedUrl(spec.url, spec.width))}" width="${spec.width}" alt="${esc(spec.alt || "")}" ` +
    `style="display:block;width:${spec.width}px;max-width:${spec.width}px;height:auto;` +
    `outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;${border}${radiusFor(spec)}" />`;
  return spec.link ? `<a href="${escUrl(spec.link)}" target="_blank" style="text-decoration:none;">${img}</a>` : img;
}

/* -------------------------------------------------------------------------- */
/* Identity lines                                                              */
/* -------------------------------------------------------------------------- */

export function nameLine(sig: Signature): string {
  const d = sig.details;
  if (!d.fullName && !d.credentials && !d.pronouns) return "";
  const s = sig.style;
  const name = esc(s.uppercaseName ? d.fullName.toUpperCase() : d.fullName);
  const bits = [
    `<span style="font-size:${s.nameFontSize}px;line-height:${Math.round(s.nameFontSize * 1.25)}px;` +
      `font-weight:bold;color:${s.primaryColor};${s.uppercaseName ? "letter-spacing:.5px;" : ""}">${name}</span>`,
  ];
  if (d.credentials) {
    bits.push(
      `<span style="font-size:${Math.max(11, s.baseFontSize - 1)}px;color:${s.mutedColor};font-weight:normal;">, ${esc(d.credentials)}</span>`,
    );
  }
  if (d.pronouns) {
    bits.push(
      `<span style="font-size:${Math.max(10, s.baseFontSize - 2)}px;color:${s.mutedColor};font-weight:normal;"> (${esc(d.pronouns)})</span>`,
    );
  }
  return `<div style="${baseTextStyle(sig)}">${bits.join("")}</div>`;
}

export function roleLine(sig: Signature): string {
  const d = sig.details;
  const parts: string[] = [];
  if (d.jobTitle) parts.push(esc(d.jobTitle));
  if (d.department) parts.push(esc(d.department));
  if (!parts.length) return "";
  return `<div style="${baseTextStyle(sig, `color:${sig.style.textColor};`)}">${parts.join(
    ` <span style="color:${sig.style.mutedColor};">&#124;</span> `,
  )}</div>`;
}

export function companyLine(sig: Signature): string {
  const d = sig.details;
  if (!d.company) return "";
  const label = `<span style="font-weight:bold;color:${sig.style.accentColor};">${esc(d.company)}</span>`;
  const body = d.website ? link(resolveNetworkUrl("website", d.website), label, sig) : label;
  return `<div style="${baseTextStyle(sig)}">${body}</div>`;
}

export function taglineLine(sig: Signature): string {
  const t = sig.details.tagline;
  if (!t) return "";
  const s = sig.style;
  return `<div style="${baseTextStyle(
    sig,
    `font-size:${Math.max(10, s.baseFontSize - 1)}px;color:${s.mutedColor};font-style:italic;`,
  )}">${esc(t)}</div>`;
}

/* -------------------------------------------------------------------------- */
/* Contact rows                                                                */
/* -------------------------------------------------------------------------- */

interface ContactEntry {
  icon: string;
  label: string;
  value: string;
  href: string;
}

function contactEntries(sig: Signature): ContactEntry[] {
  const d = sig.details;
  const out: ContactEntry[] = [];
  if (d.phone) out.push({ icon: "phone", label: "Phone", value: d.phone, href: `tel:${d.phone.replace(/[^\d+]/g, "")}` });
  if (d.mobile) out.push({ icon: "mobile", label: "Mobile", value: d.mobile, href: `tel:${d.mobile.replace(/[^\d+]/g, "")}` });
  if (d.fax) out.push({ icon: "print", label: "Fax", value: d.fax, href: "" });
  if (d.email) out.push({ icon: "envelope", label: "Email", value: d.email, href: `mailto:${d.email}` });
  if (d.website) {
    out.push({
      icon: "globe",
      label: "Web",
      value: d.website.replace(/^https?:\/\//i, "").replace(/\/$/, ""),
      href: resolveNetworkUrl("website", d.website),
    });
  }
  if (d.address) {
    out.push({
      icon: "pin",
      label: "Address",
      value: d.address,
      href: resolveNetworkUrl("location", d.address),
    });
  }
  for (const f of sig.customFields) {
    if (!f.value && !f.label) continue;
    out.push({ icon: f.icon || "link", label: f.label, value: f.value, href: f.link || "" });
  }
  return out;
}

/**
 * Contact block. `mode` picks between a leading icon per row and a bold text
 * label, since both conventions are common and users have strong preferences.
 */
export function contactBlock(
  sig: Signature,
  ctx: RenderContext,
  mode: "icon" | "label" | "bare" = "icon",
): string {
  const entries = contactEntries(sig);
  if (!entries.length) return "";
  const sp = spacing(sig);
  const s = sig.style;
  const iconPx = Math.max(12, Math.min(20, s.baseFontSize + 2));

  const rows = entries.map((e) => {
    const text = e.href ? link(e.href, esc(e.value), sig) : esc(e.value);

    if (mode === "bare") {
      const label = s.boldLabels && e.label
        ? `<span style="font-weight:bold;color:${s.mutedColor};">${esc(e.label)}: </span>`
        : "";
      return `<tr><td style="${baseTextStyle(sig, `padding:${sp.row}px 0;`)}">${label}${text}</td></tr>`;
    }

    if (mode === "label") {
      return (
        `<tr>` +
        `<td style="${baseTextStyle(sig, `padding:${sp.row}px 10px ${sp.row}px 0;color:${s.mutedColor};font-weight:bold;white-space:nowrap;`)}">${esc(e.label)}</td>` +
        `<td style="${baseTextStyle(sig, `padding:${sp.row}px 0;`)}">${text}</td>` +
        `</tr>`
      );
    }

    const url = iconUrl(ctx.origin, {
      slug: e.icon,
      style: "custom",
      shape: "plain",
      size: iconPx * 3,
      hex: s.iconColor.replace("#", ""),
    });
    return (
      `<tr>` +
      `<td width="${iconPx + 8}" style="padding:${sp.row}px 8px ${sp.row}px 0;vertical-align:middle;line-height:0;">` +
      `<img src="${url}" width="${iconPx}" height="${iconPx}" alt="${esc(e.label)}" style="display:block;border:0;width:${iconPx}px;height:${iconPx}px;" />` +
      `</td>` +
      `<td style="${baseTextStyle(sig, `padding:${sp.row}px 0;vertical-align:middle;`)}">${text}</td>` +
      `</tr>`
    );
  });

  return `${TABLE_OPEN}<tbody>${rows.join("")}</tbody></table>`;
}

/* -------------------------------------------------------------------------- */
/* Social icons                                                                */
/* -------------------------------------------------------------------------- */

export function socialRow(sig: Signature, ctx: RenderContext, align: Align = "left"): string {
  const links = sig.socials.filter((s) => s.value.trim());
  if (!links.length) return "";
  const s = sig.style;
  const size = s.iconSize;
  const gap = Math.max(4, Math.round(size * 0.28));

  const cells = links.map((item, i) => {
    const net = NETWORK_BY_SLUG[item.network];
    const href = resolveNetworkUrl(item.network, item.value);
    const url = iconUrl(ctx.origin, {
      slug: item.network,
      style: (s.iconStyle === "brand" ? "brand" : s.iconStyle) as IconStyleName,
      shape: s.iconShape as IconShapeName,
      size: size * 3,
      hex: s.iconColor.replace("#", ""),
    });
    const alt = esc(item.label || net?.title || item.network);
    const img =
      `<img src="${url}" width="${size}" height="${size}" alt="${alt}" title="${alt}" ` +
      `style="display:block;border:0;width:${size}px;height:${size}px;outline:none;text-decoration:none;" />`;
    const pad = i === links.length - 1 ? "0" : `${gap}px`;
    return (
      `<td style="padding:0 ${pad} 0 0;line-height:0;vertical-align:middle;">` +
      (href ? `<a href="${escUrl(href)}" target="_blank" style="text-decoration:none;">${img}</a>` : img) +
      `</td>`
    );
  });

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="${align}" style="border-collapse:collapse;"><tbody><tr>${cells.join("")}</tr></tbody></table>`;
}

/**
 * Text-mode social links, for signatures that want names rather than icons.
 */
export function socialTextRow(sig: Signature, separator = "&nbsp;&#183;&nbsp;"): string {
  const links = sig.socials.filter((s) => s.value.trim());
  if (!links.length) return "";
  const parts = links.map((item) => {
    const net = NETWORK_BY_SLUG[item.network];
    return link(resolveNetworkUrl(item.network, item.value), esc(item.label || net?.title || item.network), sig);
  });
  return `<div style="${baseTextStyle(sig, `font-size:${Math.max(10, sig.style.baseFontSize - 1)}px;`)}">${parts.join(separator)}</div>`;
}

/* -------------------------------------------------------------------------- */
/* Call to action                                                              */
/* -------------------------------------------------------------------------- */

export function buttonRow(sig: Signature, align: Align = "left"): string {
  const buttons = sig.buttons.filter((b) => b.label.trim());
  if (!buttons.length) return "";

  const cells = buttons.map((b, i) => {
    const pad =
      b.size === "sm" ? "7px 14px" : b.size === "lg" ? "14px 28px" : "10px 20px";
    const fontSize = b.size === "sm" ? 12 : b.size === "lg" ? 16 : 14;
    const outline = b.style === "outline";
    const bg = outline ? "transparent" : b.background;
    const fg = outline ? b.background : b.color;
    const border = `${outline ? 2 : 1}px solid ${b.background}`;
    const inner =
      `<a href="${escUrl(b.url)}" target="_blank" style="display:inline-block;` +
      `font-family:${fontStack(sig.style.fontFamily)};font-size:${fontSize}px;line-height:${fontSize + 4}px;` +
      `font-weight:bold;color:${fg};text-decoration:none;padding:${pad};` +
      `background-color:${bg};border:${border};border-radius:${b.radius}px;` +
      `mso-padding-alt:0;">${esc(b.label)}</a>`;
    return `<td style="padding:0 ${i === buttons.length - 1 ? 0 : 8}px 0 0;">${inner}</td>`;
  });

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="${align}" style="border-collapse:collapse;"><tbody><tr>${cells.join("")}</tr></tbody></table>`;
}

/* -------------------------------------------------------------------------- */
/* Add-ons                                                                     */
/* -------------------------------------------------------------------------- */

export function bannerBlock(sig: Signature): string {
  const b = sig.addons.banner;
  if (!b.enabled || !b.imageUrl) return "";
  const img =
    `<img src="${escUrl(sizedUrl(b.imageUrl, b.width))}" width="${b.width}" alt="${esc(b.alt || "")}" ` +
    `style="display:block;width:${b.width}px;max-width:100%;height:auto;border:0;border-radius:8px;outline:none;" />`;
  return b.link ? `<a href="${escUrl(b.link)}" target="_blank" style="text-decoration:none;">${img}</a>` : img;
}

export function videoBlock(sig: Signature, ctx: RenderContext): string {
  const v = sig.addons.video;
  if (!v.enabled || !v.thumbnailUrl) return "";
  const s = sig.style;
  // Mail clients cannot play video, so this is a thumbnail with a play badge
  // that links out — the same approach every major provider uses.
  const badge = iconUrl(ctx.origin, { slug: "play", style: "light", shape: "circle", size: 144 });
  const thumb =
    `<img src="${escUrl(v.thumbnailUrl)}" width="${v.width}" alt="${esc(v.caption || "Watch the video")}" ` +
    `style="display:block;width:${v.width}px;max-width:100%;height:auto;border:0;border-radius:8px;" />`;
  const play =
    `<img src="${badge}" width="44" height="44" alt="Play" style="display:block;border:0;width:44px;height:44px;" />`;
  return (
    `<a href="${escUrl(v.link)}" target="_blank" style="text-decoration:none;">` +
    `${TABLE_OPEN}<tbody>` +
    `<tr><td style="line-height:0;">${thumb}</td></tr>` +
    `<tr><td style="padding-top:6px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tbody><tr>` +
    `<td style="line-height:0;padding-right:8px;">${play}</td>` +
    `<td style="${baseTextStyle(sig, `font-weight:bold;color:${s.linkColor};`)}">${esc(v.caption || "Watch the video")}</td>` +
    `</tr></tbody></table></td></tr>` +
    `</tbody></table></a>`
  );
}

export function qrBlock(sig: Signature, ctx: RenderContext): string {
  const q = sig.addons.qr;
  if (!q.enabled) return "";
  const params = new URLSearchParams({
    size: String(q.size * 3),
    color: q.darkColor.replace("#", ""),
  });
  if (q.mode === "vcard") {
    params.set("mode", "vcard");
    params.set("sig", sig.id);
  } else {
    params.set("mode", "url");
    params.set("data", q.value || sig.details.website || "");
  }
  const src = `${ctx.origin}/api/qr?${params.toString()}`;
  const img =
    `<img src="${src}" width="${q.size}" height="${q.size}" alt="Scan to save contact" ` +
    `style="display:block;border:0;width:${q.size}px;height:${q.size}px;" />`;
  if (!q.caption) return img;
  return (
    `${TABLE_OPEN}<tbody><tr><td style="line-height:0;">${img}</td></tr>` +
    `<tr><td style="${baseTextStyle(sig, `font-size:10px;color:${sig.style.mutedColor};padding-top:4px;text-align:center;`)}">${esc(q.caption)}</td></tr>` +
    `</tbody></table>`
  );
}

export function badgeRow(sig: Signature): string {
  const b = sig.addons.badges;
  if (!b.enabled || !b.items.length) return "";
  const cells = b.items
    .filter((i) => i.imageUrl)
    .map((item, i, arr) => {
      const img =
        `<img src="${escUrl(item.imageUrl)}" width="${item.width}" alt="${esc(item.alt || "")}" ` +
        `style="display:block;border:0;width:${item.width}px;height:auto;" />`;
      const body = item.link ? `<a href="${escUrl(item.link)}" target="_blank" style="text-decoration:none;">${img}</a>` : img;
      return `<td style="padding:0 ${i === arr.length - 1 ? 0 : 10}px 0 0;line-height:0;vertical-align:middle;">${body}</td>`;
    });
  if (!cells.length) return "";
  return `${TABLE_OPEN}<tbody><tr>${cells.join("")}</tr></tbody></table>`;
}

export function meetingBlock(sig: Signature, ctx: RenderContext): string {
  const m = sig.addons.meeting;
  if (!m.enabled || !m.url) return "";
  const s = sig.style;
  const icon = iconUrl(ctx.origin, {
    slug: "calendar", style: "custom", shape: "plain", size: 48, hex: s.primaryColor.replace("#", ""),
  });
  return (
    `${TABLE_OPEN}<tbody><tr>` +
    `<td style="padding-right:7px;line-height:0;vertical-align:middle;"><img src="${icon}" width="15" height="15" alt="" style="display:block;border:0;width:15px;height:15px;" /></td>` +
    `<td style="${baseTextStyle(sig, "vertical-align:middle;")}">${link(m.url, esc(m.label || "Book a meeting"), sig, "font-weight:bold;")}</td>` +
    `</tr></tbody></table>`
  );
}

export function quoteBlock(sig: Signature): string {
  const q = sig.addons.quote;
  if (!q.enabled || !q.text) return "";
  const s = sig.style;
  const author = q.author
    ? `<span style="color:${s.mutedColor};font-style:normal;"> &#8212; ${esc(q.author)}</span>`
    : "";
  return (
    `<div style="${baseTextStyle(
      sig,
      `font-size:${Math.max(10, s.baseFontSize - 1)}px;font-style:italic;color:${s.textColor};` +
        `border-left:3px solid ${s.accentColor};padding-left:10px;`,
    )}">&#8220;${esc(q.text)}&#8221;${author}</div>`
  );
}

export function signoffBlock(sig: Signature): string {
  const so = sig.addons.signoff;
  if (!so.enabled) return "";
  if (so.imageUrl) {
    return `<img src="${escUrl(so.imageUrl)}" width="${so.width}" alt="${esc(so.text || "Signature")}" style="display:block;border:0;width:${so.width}px;height:auto;" />`;
  }
  if (!so.text) return "";
  // A script face is only a hint: clients without it fall back to cursive.
  return `<div style="font-family:'Brush Script MT','Segoe Script','Snell Roundhand',cursive;font-size:${Math.round(
    so.width / 7,
  )}px;line-height:1.2;color:${so.color};">${esc(so.text)}</div>`;
}

export function greenBlock(sig: Signature): string {
  const g = sig.addons.green;
  if (!g.enabled || !g.text) return "";
  return `<div style="${baseTextStyle(sig, "font-size:10px;line-height:14px;color:#4d7c0f;")}">&#127793; ${esc(g.text)}</div>`;
}

export function disclaimerBlock(sig: Signature): string {
  const d = sig.addons.disclaimer;
  if (!d.enabled || !d.text) return "";
  return `<div style="font-family:${fontStack(sig.style.fontFamily)};font-size:${d.fontSize}px;line-height:${Math.round(
    d.fontSize * 1.5,
  )}px;color:${d.color};">${esc(d.text).replace(/\n/g, "<br />")}</div>`;
}

/* -------------------------------------------------------------------------- */
/* Dividers & layout helpers                                                   */
/* -------------------------------------------------------------------------- */

export function horizontalDivider(sig: Signature, width?: number): string {
  const s = sig.style;
  if (s.divider === "none") return "";
  if (s.divider === "dots") {
    return `<div style="font-size:12px;line-height:12px;color:${s.dividerColor};letter-spacing:3px;">&#183;&#183;&#183;&#183;&#183;&#183;&#183;&#183;&#183;&#183;</div>`;
  }
  const w = width ? `width:${width}px;` : "width:100%;";
  return (
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;${w}"><tbody><tr>` +
    `<td style="${w}height:${s.dividerThickness}px;line-height:${s.dividerThickness}px;font-size:0;background-color:${s.dividerColor};">&nbsp;</td>` +
    `</tr></tbody></table>`
  );
}

/** Vertical rule used by side-by-side templates. */
export function verticalDividerCell(sig: Signature): string {
  const s = sig.style;
  if (s.divider === "none") return "";
  const sp = spacing(sig);
  return (
    `<td width="${sp.gutter}" style="width:${sp.gutter}px;padding:0 ${Math.round(sp.gutter / 2)}px;">` +
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;height:100%;"><tbody><tr>` +
    `<td style="width:${s.dividerThickness}px;background-color:${s.dividerColor};font-size:0;line-height:0;">&nbsp;</td>` +
    `</tr></tbody></table></td>`
  );
}

/** Stack fragments into rows, dropping empties and spacing what remains. */
export function stack(fragments: string[], gap: number): string {
  const present = fragments.filter((f) => f && f.trim());
  if (!present.length) return "";
  const rows = present.map(
    (f, i) => `<tr><td style="padding:${i === 0 ? 0 : gap}px 0 0 0;">${f}</td></tr>`,
  );
  return `${TABLE_OPEN}<tbody>${rows.join("")}</tbody></table>`;
}
