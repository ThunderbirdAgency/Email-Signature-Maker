/**
 * Top-level signature rendering.
 *
 * `renderSignatureHtml` returns the fragment that gets copied to the clipboard
 * and pasted into a mail client. `renderStandaloneHtml` wraps that fragment in
 * a document for download or preview in an iframe.
 */

import type { RenderContext, Signature } from "./types";
import { fontStack } from "./fonts";
import { renderTemplate } from "./templates";
import { esc } from "./blocks";
import { resolveNetworkUrl, NETWORK_BY_SLUG } from "./networks";

export function renderSignatureHtml(sig: Signature, ctx: RenderContext): string {
  const s = sig.style;
  const inner = renderTemplate(sig, ctx);

  // The outer table caps the width and re-asserts the font, because several
  // clients (Outlook especially) inject their own defaults into the compose body.
  return (
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" ` +
    `style="border-collapse:collapse;max-width:${s.maxWidth}px;width:100%;` +
    `font-family:${fontStack(s.fontFamily)};color:${s.textColor};` +
    `mso-line-height-rule:exactly;">` +
    `<tbody><tr><td align="${s.align}" style="text-align:${s.align};padding:0;">` +
    inner +
    `</td></tr></tbody></table>`
  );
}

export function renderStandaloneHtml(sig: Signature, ctx: RenderContext): string {
  return [
    "<!DOCTYPE html>",
    '<html lang="en"><head><meta charset="utf-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1" />',
    `<title>${esc(sig.details.fullName || sig.name)} &#8212; email signature</title>`,
    "<style>body{margin:0;padding:24px;background:#ffffff;-webkit-text-size-adjust:100%;}</style>",
    "</head><body>",
    renderSignatureHtml(sig, ctx),
    "</body></html>",
  ].join("\n");
}

/** Plain-text alternative, offered alongside the rich copy. */
export function renderPlainText(sig: Signature): string {
  const d = sig.details;
  const lines: string[] = [];

  const nameBits = [d.fullName, d.credentials].filter(Boolean).join(", ");
  const withPronouns = d.pronouns ? `${nameBits} (${d.pronouns})` : nameBits;
  if (withPronouns) lines.push(withPronouns);

  const role = [d.jobTitle, d.department].filter(Boolean).join(" | ");
  if (role) lines.push(role);
  if (d.company) lines.push(d.company);
  if (d.tagline) lines.push(d.tagline);
  if (lines.length) lines.push("");

  if (d.phone) lines.push(`Phone: ${d.phone}`);
  if (d.mobile) lines.push(`Mobile: ${d.mobile}`);
  if (d.fax) lines.push(`Fax: ${d.fax}`);
  if (d.email) lines.push(`Email: ${d.email}`);
  if (d.website) lines.push(`Web: ${d.website}`);
  if (d.address) lines.push(d.address);

  for (const f of sig.customFields) {
    if (f.value) lines.push(f.label ? `${f.label}: ${f.value}` : f.value);
  }

  const socials = sig.socials.filter((x) => x.value.trim());
  if (socials.length) {
    lines.push("");
    for (const item of socials) {
      const title = NETWORK_BY_SLUG[item.network]?.title ?? item.network;
      lines.push(`${title}: ${resolveNetworkUrl(item.network, item.value)}`);
    }
  }

  if (sig.addons.meeting.enabled && sig.addons.meeting.url) {
    lines.push("", `${sig.addons.meeting.label || "Book a meeting"}: ${sig.addons.meeting.url}`);
  }
  for (const b of sig.buttons) {
    if (b.label && b.url) lines.push(`${b.label}: ${b.url}`);
  }
  if (sig.addons.quote.enabled && sig.addons.quote.text) {
    lines.push("", `"${sig.addons.quote.text}"${sig.addons.quote.author ? ` -- ${sig.addons.quote.author}` : ""}`);
  }
  if (sig.addons.green.enabled && sig.addons.green.text) lines.push("", sig.addons.green.text);
  if (sig.addons.disclaimer.enabled && sig.addons.disclaimer.text) {
    lines.push("", sig.addons.disclaimer.text);
  }

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

/** vCard 3.0 for the QR code and the "save contact" download. */
export function renderVCard(sig: Signature): string {
  const d = sig.details;
  const nameParts = d.fullName.trim().split(/\s+/);
  const last = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
  const first = nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : d.fullName;

  // vCard escaping: commas, semicolons, backslashes and newlines are special.
  const v = (value: string) =>
    String(value ?? "").replace(/\\/g, "\\\\").replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n");

  const lines = ["BEGIN:VCARD", "VERSION:3.0"];
  lines.push(`N:${v(last)};${v(first)};;;`);
  if (d.fullName) lines.push(`FN:${v(d.fullName)}`);
  if (d.company) lines.push(`ORG:${v(d.company)}${d.department ? `;${v(d.department)}` : ""}`);
  if (d.jobTitle) lines.push(`TITLE:${v(d.jobTitle)}`);
  if (d.email) lines.push(`EMAIL;type=INTERNET;type=WORK:${v(d.email)}`);
  if (d.phone) lines.push(`TEL;type=WORK;type=VOICE:${v(d.phone)}`);
  if (d.mobile) lines.push(`TEL;type=CELL:${v(d.mobile)}`);
  if (d.fax) lines.push(`TEL;type=FAX:${v(d.fax)}`);
  if (d.website) lines.push(`URL:${v(resolveNetworkUrl("website", d.website))}`);
  if (d.address) lines.push(`ADR;type=WORK:;;${v(d.address)};;;;`);
  for (const item of sig.socials.filter((x) => x.value.trim())) {
    lines.push(`URL;type=${v(NETWORK_BY_SLUG[item.network]?.title ?? item.network)}:${v(resolveNetworkUrl(item.network, item.value))}`);
  }
  lines.push("END:VCARD");

  // vCard requires CRLF line endings.
  return lines.join("\r\n");
}

/**
 * Rough byte weight of the signature markup. Gmail clips messages past ~102KB,
 * so the editor surfaces this number.
 */
export function estimateSize(html: string): number {
  return new TextEncoder().encode(html).length;
}
