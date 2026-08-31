/**
 * Coerce untrusted JSON into a valid signature draft.
 *
 * Signature documents arrive from the browser and are later rendered into HTML
 * that people paste into their mail client, so every field is clamped to a
 * known shape here rather than trusted. Escaping still happens at render time;
 * this layer stops malformed data from producing broken markup.
 */

import { emptyDraft } from "./defaults";
import { TEMPLATE_IDS } from "./templates";
import { FONT_BY_ID } from "./fonts";
import { NETWORK_BY_SLUG } from "./networks";
import type {
  Align, Density, DividerStyle, IconShape, IconStyle, ImageShape, ImageSpec,
  SignatureDraft,
} from "./types";

const MAX_TEXT = 400;
const MAX_LONG_TEXT = 4000;
const MAX_URL = 2048;

/** Control characters have no business in a signature field. */
const CONTROL_CHARS = /[\u0000-\u001F\u007F]/g;
const CONTROL_CHARS_KEEP_NEWLINE = /[\u0000-\u0009\u000B\u000C\u000E-\u001F\u007F]/g;

function str(value: unknown, max = MAX_TEXT): string {
  if (typeof value !== "string") return "";
  return value.slice(0, max).replace(CONTROL_CHARS, "").trim();
}

/** Multi-line fields keep their newlines. */
function text(value: unknown, max = MAX_LONG_TEXT): string {
  if (typeof value !== "string") return "";
  return value.slice(0, max).replace(CONTROL_CHARS_KEEP_NEWLINE, "");
}

function url(value: unknown): string {
  const v = str(value, MAX_URL);
  if (!v) return "";
  // Block script-bearing schemes at the door; relative and bare-domain values
  // are allowed through and resolved later.
  if (/^(javascript|data|vbscript|file):/i.test(v)) return "";
  return v;
}

function num(value: unknown, min: number, max: number, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

function bool(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function color(value: unknown, fallback: string): string {
  const v = typeof value === "string" ? value.trim() : "";
  return /^#[0-9a-f]{3}$|^#[0-9a-f]{6}$/i.test(v) ? v.toLowerCase() : fallback;
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function id(value: unknown, index: number): string {
  const v = str(value, 40).replace(/[^A-Za-z0-9_-]/g, "");
  return v || `item-${index}`;
}

function imageSpec(value: unknown, fallbackWidth: number): ImageSpec | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  const src = url(v.url);
  if (!src) return null;
  return {
    url: src,
    width: num(v.width, 24, 600, fallbackWidth),
    shape: oneOf<ImageShape>(v.shape, ["square", "rounded", "circle"], "circle"),
    link: url(v.link) || undefined,
    alt: str(v.alt, 200) || undefined,
    borderWidth: num(v.borderWidth, 0, 12, 0),
    borderColor: color(v.borderColor, "#e2e8f0"),
  };
}

export function normalizeDraft(input: unknown): SignatureDraft {
  const base = emptyDraft();
  const raw = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const d = (raw.details && typeof raw.details === "object" ? raw.details : {}) as Record<string, unknown>;
  const st = (raw.style && typeof raw.style === "object" ? raw.style : {}) as Record<string, unknown>;
  const ad = (raw.addons && typeof raw.addons === "object" ? raw.addons : {}) as Record<string, unknown>;
  const sub = (key: string) =>
    (ad[key] && typeof ad[key] === "object" ? ad[key] : {}) as Record<string, unknown>;

  const banner = sub("banner");
  const disclaimer = sub("disclaimer");
  const video = sub("video");
  const qr = sub("qr");
  const green = sub("green");
  const quote = sub("quote");
  const meeting = sub("meeting");
  const badges = sub("badges");
  const signoff = sub("signoff");

  return {
    name: str(raw.name, 120) || base.name,
    details: {
      fullName: str(d.fullName, 120),
      pronouns: str(d.pronouns, 40),
      credentials: str(d.credentials, 60),
      jobTitle: str(d.jobTitle, 120),
      department: str(d.department, 120),
      company: str(d.company, 120),
      tagline: str(d.tagline, 200),
      email: str(d.email, 200),
      phone: str(d.phone, 60),
      mobile: str(d.mobile, 60),
      fax: str(d.fax, 60),
      website: url(d.website),
      address: str(d.address, 300),
    },
    photo: imageSpec(raw.photo, 96),
    logo: imageSpec(raw.logo, 130),
    socials: (Array.isArray(raw.socials) ? raw.socials : [])
      .slice(0, 24)
      .map((item, i) => {
        const s = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
        const network = str(s.network, 40);
        return {
          id: id(s.id, i),
          network: NETWORK_BY_SLUG[network] ? network : "website",
          value: str(s.value, MAX_URL),
          label: str(s.label, 60) || undefined,
        };
      })
      .filter((s) => s.value),
    customFields: (Array.isArray(raw.customFields) ? raw.customFields : [])
      .slice(0, 12)
      .map((item, i) => {
        const f = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
        return {
          id: id(f.id, i),
          label: str(f.label, 60),
          value: str(f.value, 300),
          link: url(f.link) || undefined,
          icon: str(f.icon, 40) || undefined,
        };
      })
      .filter((f) => f.label || f.value),
    buttons: (Array.isArray(raw.buttons) ? raw.buttons : [])
      .slice(0, 4)
      .map((item, i) => {
        const b = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
        return {
          id: id(b.id, i),
          label: str(b.label, 60),
          url: url(b.url),
          background: color(b.background, "#2563eb"),
          color: color(b.color, "#ffffff"),
          radius: num(b.radius, 0, 40, 6),
          style: oneOf(b.style, ["solid", "outline"] as const, "solid"),
          size: oneOf(b.size, ["sm", "md", "lg"] as const, "md"),
        };
      })
      .filter((b) => b.label),
    addons: {
      banner: {
        enabled: bool(banner.enabled),
        imageUrl: url(banner.imageUrl),
        link: url(banner.link),
        width: num(banner.width, 100, 700, 500),
        alt: str(banner.alt, 200),
      },
      disclaimer: {
        enabled: bool(disclaimer.enabled),
        text: text(disclaimer.text, 3000),
        fontSize: num(disclaimer.fontSize, 8, 16, 10),
        color: color(disclaimer.color, "#94a3b8"),
      },
      video: {
        enabled: bool(video.enabled),
        thumbnailUrl: url(video.thumbnailUrl),
        link: url(video.link),
        width: num(video.width, 100, 600, 220),
        caption: str(video.caption, 120),
      },
      qr: {
        enabled: bool(qr.enabled),
        mode: oneOf(qr.mode, ["vcard", "url"] as const, "vcard"),
        value: url(qr.value),
        size: num(qr.size, 48, 200, 88),
        darkColor: color(qr.darkColor, "#0f172a"),
        caption: str(qr.caption, 60),
      },
      green: { enabled: bool(green.enabled), text: str(green.text, 300) },
      quote: {
        enabled: bool(quote.enabled),
        text: str(quote.text, 500),
        author: str(quote.author, 100),
      },
      meeting: {
        enabled: bool(meeting.enabled),
        label: str(meeting.label, 80),
        url: url(meeting.url),
      },
      badges: {
        enabled: bool(badges.enabled),
        items: (Array.isArray(badges.items) ? badges.items : [])
          .slice(0, 8)
          .map((item, i) => {
            const b = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
            return {
              id: id(b.id, i),
              imageUrl: url(b.imageUrl),
              link: url(b.link) || undefined,
              alt: str(b.alt, 120) || undefined,
              width: num(b.width, 20, 300, 90),
            };
          })
          .filter((b) => b.imageUrl),
      },
      signoff: {
        enabled: bool(signoff.enabled),
        text: str(signoff.text, 60),
        imageUrl: url(signoff.imageUrl) || undefined,
        color: color(signoff.color, "#0f172a"),
        width: num(signoff.width, 60, 400, 180),
      },
    },
    style: {
      templateId: oneOf(st.templateId, TEMPLATE_IDS, "classic"),
      fontFamily: FONT_BY_ID[str(st.fontFamily, 40)] ? str(st.fontFamily, 40) : "system",
      baseFontSize: num(st.baseFontSize, 9, 22, 13),
      nameFontSize: num(st.nameFontSize, 11, 40, 19),
      primaryColor: color(st.primaryColor, "#0f172a"),
      accentColor: color(st.accentColor, "#2563eb"),
      textColor: color(st.textColor, "#334155"),
      mutedColor: color(st.mutedColor, "#94a3b8"),
      linkColor: color(st.linkColor, "#2563eb"),
      backgroundColor: color(st.backgroundColor, "#f8fafc"),
      divider: oneOf<DividerStyle>(st.divider, ["none", "line", "bar", "dots"], "line"),
      dividerColor: color(st.dividerColor, "#e2e8f0"),
      dividerThickness: num(st.dividerThickness, 1, 8, 1),
      density: oneOf<Density>(st.density, ["compact", "cosy", "roomy"], "cosy"),
      align: oneOf<Align>(st.align, ["left", "center", "right"], "left"),
      maxWidth: num(st.maxWidth, 280, 800, 560),
      iconStyle: oneOf<IconStyle>(st.iconStyle, ["brand", "dark", "light", "grey"], "brand"),
      iconShape: oneOf<IconShape>(st.iconShape, ["plain", "circle", "rounded", "square"], "circle"),
      iconSize: num(st.iconSize, 14, 48, 26),
      iconColor: color(st.iconColor, "#64748b"),
      uppercaseName: bool(st.uppercaseName),
      boldLabels: bool(st.boldLabels, true),
    },
  };
}
