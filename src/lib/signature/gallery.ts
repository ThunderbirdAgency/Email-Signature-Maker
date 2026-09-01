/**
 * Showcase data for the template gallery.
 *
 * Rendering every template with the same person and the same palette made
 * seventeen distinct layouts read as one signature repeated. Each template now
 * gets its own persona, colour, typeface and set of switched-on extras — the
 * gallery becomes a portfolio of what the product can produce, and the
 * differences between layouts are actually visible.
 *
 * Every person and company here is invented.
 */

import { emptyDraft } from "./defaults";
import type { SignatureDraft } from "./types";

interface Persona {
  fullName: string;
  pronouns?: string;
  credentials?: string;
  jobTitle: string;
  department?: string;
  company: string;
  tagline?: string;
  email: string;
  phone: string;
  mobile?: string;
  website: string;
  address?: string;
  socials: { network: string; value: string }[];
}

const PERSONAS: Record<string, Persona> = {
  avery: {
    fullName: "Avery Sinclair", pronouns: "she/her", credentials: "MBA",
    jobTitle: "Director of Partnerships", department: "Revenue",
    company: "Northwind Studio", tagline: "Brand systems for companies that ship.",
    email: "avery@northwind.studio", phone: "+1 (415) 555 0142", mobile: "+1 (415) 555 0188",
    website: "northwind.studio", address: "540 Howard St, San Francisco, CA",
    socials: [{ network: "linkedin", value: "averysinclair" }, { network: "x", value: "averysinclair" }, { network: "instagram", value: "northwind.studio" }],
  },
  marcus: {
    fullName: "Marcus Bell", credentials: "KC",
    jobTitle: "Managing Partner", company: "Bell & Ward",
    email: "m.bell@bellward.co.uk", phone: "+44 20 7946 0812",
    website: "bellward.co.uk", address: "12 Gray's Inn Square, London WC1R",
    socials: [{ network: "linkedin", value: "marcusbellkc" }],
  },
  priya: {
    fullName: "Dr Priya Raman", credentials: "MD, FRCP",
    jobTitle: "Consultant Cardiologist", department: "Cardiology",
    company: "St Aubyn Clinic",
    email: "p.raman@staubyn.health", phone: "+44 161 555 0119",
    website: "staubyn.health", address: "9 Deansgate, Manchester M3",
    socials: [{ network: "linkedin", value: "priyaraman" }],
  },
  jonah: {
    fullName: "Jonah Weiss", pronouns: "he/him",
    jobTitle: "Staff Engineer", company: "Kernelworks",
    tagline: "Distributed systems, mostly on fire.",
    email: "jonah@kernelworks.dev", phone: "+1 (206) 555 0177",
    website: "kernelworks.dev",
    socials: [{ network: "github", value: "jweiss" }, { network: "x", value: "jweiss" }, { network: "stackoverflow", value: "184220" }],
  },
  lena: {
    fullName: "Lena Ortiz", pronouns: "she/her",
    jobTitle: "Founder & Creative Director", company: "Studio Ortiz",
    tagline: "Type, colour, and very strong opinions.",
    email: "lena@studioortiz.com", phone: "+34 911 555 042",
    website: "studioortiz.com", address: "Calle de Serrano 21, Madrid",
    socials: [{ network: "instagram", value: "studioortiz" }, { network: "behance", value: "lenaortiz" }, { network: "dribbble", value: "lenaortiz" }],
  },
  tom: {
    fullName: "Tom Fitzgerald",
    jobTitle: "Associate Broker", company: "Harbour & Co Realty",
    email: "tom@harbourco.com", phone: "+1 (617) 555 0164", mobile: "+1 (617) 555 0190",
    website: "harbourco.com", address: "88 Commercial Wharf, Boston, MA",
    socials: [{ network: "facebook", value: "harbourcorealty" }, { network: "linkedin", value: "tomfitzgerald" }, { network: "youtube", value: "harbourco" }],
  },
  sana: {
    fullName: "Sana Mahmood", pronouns: "she/her",
    jobTitle: "Head of Growth", company: "Loopfeed",
    tagline: "We make onboarding boring, on purpose.",
    email: "sana@loopfeed.io", phone: "+1 (312) 555 0133",
    website: "loopfeed.io",
    socials: [{ network: "linkedin", value: "sanamahmood" }, { network: "substack", value: "loopfeed" }, { network: "x", value: "loopfeed" }],
  },
  kofi: {
    fullName: "Kofi Mensah",
    jobTitle: "Executive Producer", company: "Longform Audio",
    tagline: "Narrative podcasts, made slowly.",
    email: "kofi@longform.audio", phone: "+1 (323) 555 0158",
    website: "longform.audio",
    socials: [{ network: "spotify", value: "show/longform" }, { network: "applepodcasts", value: "podcasts.apple.com/longform" }, { network: "instagram", value: "longformaudio" }],
  },
};

interface Palette {
  primary: string; accent: string; text: string; muted: string;
  link: string; background: string; divider: string;
}

const PALETTES: Record<string, Palette> = {
  indigo: { primary: "#312e81", accent: "#6366f1", text: "#3f3f46", muted: "#a1a1aa", link: "#4f46e5", background: "#eef2ff", divider: "#e0e7ff" },
  ink: { primary: "#0f172a", accent: "#334155", text: "#334155", muted: "#94a3b8", link: "#0f172a", background: "#f8fafc", divider: "#e2e8f0" },
  claret: { primary: "#7f1d1d", accent: "#b91c1c", text: "#44403c", muted: "#a8a29e", link: "#b91c1c", background: "#fef2f2", divider: "#fecaca" },
  teal: { primary: "#134e4a", accent: "#0d9488", text: "#334155", muted: "#94a3b8", link: "#0f766e", background: "#f0fdfa", divider: "#ccfbf1" },
  amber: { primary: "#78350f", accent: "#d97706", text: "#44403c", muted: "#a8a29e", link: "#b45309", background: "#fffbeb", divider: "#fde68a" },
  emerald: { primary: "#064e3b", accent: "#059669", text: "#3f3f46", muted: "#a1a1aa", link: "#047857", background: "#ecfdf5", divider: "#d1fae5" },
  violet: { primary: "#4c1d95", accent: "#8b5cf6", text: "#3f3f46", muted: "#a1a1aa", link: "#7c3aed", background: "#faf5ff", divider: "#e9d5ff" },
  navy: { primary: "#172554", accent: "#2563eb", text: "#334155", muted: "#94a3b8", link: "#1d4ed8", background: "#eff6ff", divider: "#dbeafe" },
  rose: { primary: "#831843", accent: "#db2777", text: "#3f3f46", muted: "#a1a1aa", link: "#be185d", background: "#fdf2f8", divider: "#fbcfe8" },
  slate: { primary: "#1e293b", accent: "#64748b", text: "#475569", muted: "#94a3b8", link: "#334155", background: "#f8fafc", divider: "#e2e8f0" },
};

interface Showcase {
  persona: keyof typeof PERSONAS;
  palette: keyof typeof PALETTES;
  font?: string;
  iconStyle?: "brand" | "dark" | "light" | "grey";
  iconShape?: "plain" | "circle" | "rounded" | "square";
  photo?: boolean;
  logo?: boolean;
  banner?: boolean;
  qr?: boolean;
  button?: string;
  uppercaseName?: boolean;
  density?: "compact" | "cosy" | "roomy";
}

/** One deliberate look per template, so no two cards read the same. */
const SHOWCASE: Record<string, Showcase> = {
  classic: { persona: "avery", palette: "navy", photo: true, logo: true, button: "Book a call", iconShape: "circle" },
  "modern-bar": { persona: "sana", palette: "indigo", iconShape: "rounded", button: "See the demo" },
  minimal: { persona: "jonah", palette: "ink", iconStyle: "dark", iconShape: "plain", density: "compact" },
  executive: { persona: "marcus", palette: "claret", font: "georgia", logo: true, iconStyle: "dark", iconShape: "plain", uppercaseName: true },
  "split-card": { persona: "lena", palette: "rose", photo: true, iconShape: "circle", button: "View portfolio" },
  centered: { persona: "priya", palette: "teal", photo: true, iconShape: "circle", density: "roomy" },
  compact: { persona: "jonah", palette: "slate", iconShape: "plain", iconStyle: "grey", density: "compact" },
  "banner-top": { persona: "tom", palette: "amber", banner: true, photo: true, button: "See listings" },
  "logo-top": { persona: "sana", palette: "emerald", logo: true, iconShape: "square" },
  "photo-right": { persona: "avery", palette: "violet", photo: true, iconShape: "circle" },
  elegant: { persona: "lena", palette: "amber", font: "garamond", iconStyle: "dark", iconShape: "plain", density: "roomy" },
  "mono-tech": { persona: "jonah", palette: "emerald", font: "consolas", iconStyle: "dark", iconShape: "square" },
  creative: { persona: "kofi", palette: "violet", photo: true, iconShape: "circle", button: "Listen now" },
  corporate: { persona: "marcus", palette: "ink", font: "georgia", logo: true, iconStyle: "dark", iconShape: "plain" },
  "stacked-icons": { persona: "kofi", palette: "rose", photo: true, iconShape: "circle" },
  "accent-edge": { persona: "sana", palette: "indigo", photo: true, iconShape: "rounded", button: "Start free" },
  "qr-card": { persona: "tom", palette: "navy", qr: true, photo: true, iconShape: "circle" },
};

/**
 * Build the signature shown on a template's gallery card.
 *
 * `origin` makes the demo image URLs absolute, the same as a real signature.
 */
export function showcaseDraft(templateId: string, origin: string): SignatureDraft {
  const config = SHOWCASE[templateId] ?? SHOWCASE.classic;
  const person = PERSONAS[config.persona];
  const palette = PALETTES[config.palette];
  const base = emptyDraft();
  const asset = (name: string) => `${origin.replace(/\/+$/, "")}/demo/${name}`;

  return {
    ...base,
    name: person.fullName,
    details: {
      ...base.details,
      fullName: person.fullName,
      pronouns: person.pronouns ?? "",
      credentials: person.credentials ?? "",
      jobTitle: person.jobTitle,
      department: person.department ?? "",
      company: person.company,
      tagline: person.tagline ?? "",
      email: person.email,
      phone: person.phone,
      mobile: person.mobile ?? "",
      website: person.website,
      address: person.address ?? "",
    },
    photo: config.photo
      ? { url: asset("avatar.png"), width: 88, shape: "circle", alt: person.fullName, borderWidth: 0, borderColor: palette.divider }
      : null,
    logo: config.logo
      ? { url: asset("logo.png"), width: 140, shape: "square", alt: person.company, borderWidth: 0, borderColor: palette.divider }
      : null,
    socials: person.socials.map((s, i) => ({ id: `g${i}`, network: s.network, value: s.value })),
    buttons: config.button
      ? [{ id: "g-cta", label: config.button, url: `https://${person.website}`, background: palette.accent, color: "#ffffff", radius: 6, style: "solid" as const, size: "sm" as const }]
      : [],
    addons: {
      ...base.addons,
      banner: { enabled: Boolean(config.banner), imageUrl: asset("banner.png"), link: `https://${person.website}`, width: 460, alt: "Campaign banner" },
      qr: { ...base.addons.qr, enabled: Boolean(config.qr), mode: "url", value: `https://${person.website}`, size: 84, darkColor: palette.primary, caption: "Save my contact" },
    },
    style: {
      ...base.style,
      templateId,
      fontFamily: config.font ?? base.style.fontFamily,
      primaryColor: palette.primary,
      accentColor: palette.accent,
      textColor: palette.text,
      mutedColor: palette.muted,
      linkColor: palette.link,
      backgroundColor: palette.background,
      dividerColor: palette.divider,
      iconStyle: config.iconStyle ?? "brand",
      iconShape: config.iconShape ?? "circle",
      iconColor: palette.muted,
      iconSize: 24,
      density: config.density ?? "cosy",
      uppercaseName: Boolean(config.uppercaseName),
      maxWidth: 520,
    },
  };
}
