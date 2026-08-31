/**
 * Starting points: the blank signature, colour presets, and the sample data
 * used for template thumbnails and the marketing site.
 */

import type { Signature, SignatureDraft } from "./types";

export const DISCLAIMER_PRESETS: { id: string; label: string; text: string }[] = [
  {
    id: "confidentiality",
    label: "Confidentiality",
    text: "This email and any attachments are confidential and intended solely for the addressee. If you have received it in error, please notify the sender and delete it from your system. Any unauthorised use, disclosure or copying is prohibited.",
  },
  {
    id: "gdpr",
    label: "GDPR / privacy",
    text: "We process personal data in line with our privacy notice. You can ask us at any time to access, correct or erase the personal data we hold about you, or to stop sending you marketing.",
  },
  {
    id: "financial",
    label: "Financial advice",
    text: "Nothing in this email constitutes financial, investment or tax advice. Figures are indicative only and may change without notice. Past performance is not a guide to future results.",
  },
  {
    id: "healthcare",
    label: "Healthcare / HIPAA",
    text: "This message may contain protected health information covered by federal privacy law. It is intended only for the named recipient. If you are not that recipient, any disclosure, copying or distribution is strictly prohibited.",
  },
  {
    id: "legal",
    label: "Legal / privilege",
    text: "This communication may be subject to legal professional privilege. It does not create a solicitor-client relationship and should not be relied on as legal advice unless expressly confirmed in writing.",
  },
  {
    id: "short",
    label: "Short and simple",
    text: "This email is intended only for the person it is addressed to and may contain confidential information.",
  },
];

export const COLOR_PRESETS: {
  id: string;
  label: string;
  primary: string;
  accent: string;
  text: string;
  muted: string;
  link: string;
  background: string;
  divider: string;
}[] = [
  { id: "midnight", label: "Midnight", primary: "#0f172a", accent: "#2563eb", text: "#334155", muted: "#94a3b8", link: "#2563eb", background: "#f8fafc", divider: "#e2e8f0" },
  { id: "ocean", label: "Ocean", primary: "#0e7490", accent: "#0891b2", text: "#334155", muted: "#94a3b8", link: "#0891b2", background: "#f0fdfa", divider: "#cffafe" },
  { id: "forest", label: "Forest", primary: "#14532d", accent: "#16a34a", text: "#3f3f46", muted: "#a1a1aa", link: "#16a34a", background: "#f7fee7", divider: "#dcfce7" },
  { id: "ember", label: "Ember", primary: "#7c2d12", accent: "#ea580c", text: "#44403c", muted: "#a8a29e", link: "#ea580c", background: "#fff7ed", divider: "#fed7aa" },
  { id: "plum", label: "Plum", primary: "#581c87", accent: "#9333ea", text: "#3f3f46", muted: "#a1a1aa", link: "#9333ea", background: "#faf5ff", divider: "#e9d5ff" },
  { id: "rose", label: "Rose", primary: "#881337", accent: "#e11d48", text: "#3f3f46", muted: "#a1a1aa", link: "#e11d48", background: "#fff1f2", divider: "#fecdd3" },
  { id: "graphite", label: "Graphite", primary: "#18181b", accent: "#52525b", text: "#3f3f46", muted: "#a1a1aa", link: "#18181b", background: "#fafafa", divider: "#e4e4e7" },
  { id: "gold", label: "Gold", primary: "#78350f", accent: "#d97706", text: "#44403c", muted: "#a8a29e", link: "#b45309", background: "#fffbeb", divider: "#fde68a" },
  { id: "indigo", label: "Indigo", primary: "#312e81", accent: "#6366f1", text: "#3f3f46", muted: "#a1a1aa", link: "#4f46e5", background: "#eef2ff", divider: "#e0e7ff" },
  { id: "slate-mint", label: "Slate Mint", primary: "#1e293b", accent: "#10b981", text: "#475569", muted: "#94a3b8", link: "#059669", background: "#f8fafc", divider: "#e2e8f0" },
];

export function emptyDraft(): SignatureDraft {
  return {
    name: "Untitled signature",
    details: {
      fullName: "", pronouns: "", credentials: "", jobTitle: "", department: "",
      company: "", tagline: "", email: "", phone: "", mobile: "", fax: "",
      website: "", address: "",
    },
    photo: null,
    logo: null,
    socials: [],
    customFields: [],
    buttons: [],
    addons: {
      banner: { enabled: false, imageUrl: "", link: "", width: 500, alt: "" },
      disclaimer: { enabled: false, text: DISCLAIMER_PRESETS[0].text, fontSize: 10, color: "#94a3b8" },
      video: { enabled: false, thumbnailUrl: "", link: "", width: 220, caption: "Watch the video" },
      qr: { enabled: false, mode: "vcard", value: "", size: 88, darkColor: "#0f172a", caption: "Save my contact" },
      green: { enabled: false, text: "Please consider the environment before printing this email." },
      quote: { enabled: false, text: "", author: "" },
      meeting: { enabled: false, label: "Book a 30-minute call", url: "" },
      badges: { enabled: false, items: [] },
      signoff: { enabled: false, text: "", imageUrl: "", color: "#0f172a", width: 180 },
    },
    style: {
      templateId: "classic",
      fontFamily: "system",
      baseFontSize: 13,
      nameFontSize: 19,
      primaryColor: "#0f172a",
      accentColor: "#2563eb",
      textColor: "#334155",
      mutedColor: "#94a3b8",
      linkColor: "#2563eb",
      backgroundColor: "#f8fafc",
      divider: "line",
      dividerColor: "#e2e8f0",
      dividerThickness: 1,
      density: "cosy",
      align: "left",
      maxWidth: 560,
      iconStyle: "brand",
      iconShape: "circle",
      iconSize: 26,
      iconColor: "#64748b",
      uppercaseName: false,
      boldLabels: true,
    },
  };
}

/**
 * Fully-populated example, used for template previews, the landing page and the
 * editor's "fill it with an example" shortcut.
 *
 * `origin` makes the demo image URLs absolute. Signature images are fetched by
 * the recipient's mail client, so a relative path would never resolve — the
 * example is built the same way a real signature is.
 */
export function sampleDraft(origin = ""): SignatureDraft {
  const base = emptyDraft();
  const asset = (name: string) => `${origin.replace(/\/+$/, "")}/demo/${name}`;
  return {
    ...base,
    name: "Sample",
    photo: {
      url: asset("avatar.png"),
      width: 92,
      shape: "circle",
      alt: "Avery Sinclair",
      borderWidth: 0,
      borderColor: "#e2e8f0",
    },
    logo: {
      url: asset("logo.png"),
      width: 150,
      shape: "square",
      link: "https://northwind.studio",
      alt: "Northwind Studio",
      borderWidth: 0,
      borderColor: "#e2e8f0",
    },
    details: {
      fullName: "Avery Sinclair",
      pronouns: "she/her",
      credentials: "MBA",
      jobTitle: "Director of Partnerships",
      department: "Revenue",
      company: "Northwind Studio",
      tagline: "Brand systems for companies that ship.",
      email: "avery@northwind.studio",
      phone: "+1 (415) 555 0142",
      mobile: "+1 (415) 555 0188",
      fax: "",
      website: "northwind.studio",
      address: "540 Howard St, San Francisco, CA",
    },
    socials: [
      { id: "s1", network: "linkedin", value: "averysinclair" },
      { id: "s2", network: "x", value: "averysinclair" },
      { id: "s3", network: "instagram", value: "northwind.studio" },
      { id: "s4", network: "github", value: "northwind" },
    ],
    buttons: [
      { id: "b1", label: "Book a call", url: "https://calendly.com/avery", background: "#2563eb", color: "#ffffff", radius: 6, style: "solid", size: "md" },
    ],
    addons: {
      ...base.addons,
      banner: { enabled: false, imageUrl: asset("banner.png"), link: "https://northwind.studio", width: 500, alt: "Now booking Q3 — brand systems that ship" },
      meeting: { enabled: true, label: "Book a 30-minute call", url: "https://calendly.com/avery" },
      green: { enabled: true, text: "Please consider the environment before printing this email." },
    },
  };
}

/** Attach the storage envelope so a draft can be rendered or persisted. */
export function toSignature(
  draft: SignatureDraft,
  envelope: { id: string; ownerId: string | null; slug: string; createdAt?: string; updatedAt?: string },
): Signature {
  const now = new Date().toISOString();
  return {
    ...draft,
    id: envelope.id,
    ownerId: envelope.ownerId,
    slug: envelope.slug,
    createdAt: envelope.createdAt ?? now,
    updatedAt: envelope.updatedAt ?? now,
  };
}
