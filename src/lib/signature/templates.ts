/**
 * Signature layouts.
 *
 * Each template receives the full signature plus a render context and returns
 * the inner HTML. The outer wrapper, width cap and background are applied by
 * `render.ts`, so templates only decide arrangement.
 */

import type { RenderContext, Signature } from "./types";
import {
  TABLE_OPEN, baseTextStyle, badgeRow, bannerBlock, buttonRow, companyLine,
  contactBlock, disclaimerBlock, esc, greenBlock, horizontalDivider, image,
  meetingBlock, nameLine, qrBlock, quoteBlock, roleLine, signoffBlock,
  socialRow, socialTextRow, spacing, stack, taglineLine, verticalDividerCell,
  videoBlock,
} from "./blocks";

export interface TemplateMeta {
  id: string;
  name: string;
  description: string;
  tags: string[];
}

type Renderer = (sig: Signature, ctx: RenderContext) => string;

/**
 * Blocks that hang below the main identity area, shared by most templates.
 *
 * Templates that place one of these themselves — Banner Top leads with the
 * banner, QR Card sets the code beside the details — opt it out here so it does
 * not appear twice.
 */
function footerStack(
  sig: Signature,
  ctx: RenderContext,
  omit: { banner?: boolean; qr?: boolean } = {},
): string {
  const sp = spacing(sig);
  return stack(
    [
      omit.banner ? "" : bannerBlock(sig),
      videoBlock(sig, ctx),
      omit.qr ? "" : qrBlock(sig, ctx),
      badgeRow(sig),
      quoteBlock(sig),
      greenBlock(sig),
      disclaimerBlock(sig),
    ],
    sp.block,
  );
}

/** Identity + contact + social + CTA, the common core of a signature. */
function coreStack(
  sig: Signature,
  ctx: RenderContext,
  opts: {
    contactMode?: "icon" | "label" | "bare";
    align?: "left" | "center" | "right";
    socialAsText?: boolean;
    /** For templates that place the social links themselves. */
    omitSocials?: boolean;
  } = {},
): string {
  const sp = spacing(sig);
  const align = opts.align ?? "left";
  const socials = opts.omitSocials
    ? ""
    : opts.socialAsText
      ? socialTextRow(sig)
      : socialRow(sig, ctx, align);
  return stack(
    [
      nameLine(sig),
      roleLine(sig),
      companyLine(sig),
      taglineLine(sig),
      contactBlock(sig, ctx, opts.contactMode ?? "icon"),
      meetingBlock(sig, ctx),
      socials,
      buttonRow(sig, align),
      signoffBlock(sig),
    ],
    sp.row + 2,
  );
}

/** Two-column shell: media on one side, content on the other. */
function twoColumn(
  sig: Signature,
  media: string,
  content: string,
  mediaSide: "left" | "right",
  withDivider: boolean,
): string {
  const sp = spacing(sig);
  if (!media) {
    return `${TABLE_OPEN}<tbody><tr><td>${content}</td></tr></tbody></table>`;
  }
  const mediaCell = `<td style="vertical-align:top;padding:0;line-height:0;">${media}</td>`;
  const gapCell = withDivider
    ? verticalDividerCell(sig)
    : `<td width="${sp.gutter}" style="width:${sp.gutter}px;font-size:0;line-height:0;">&nbsp;</td>`;
  const contentCell = `<td style="vertical-align:top;">${content}</td>`;
  const cells = mediaSide === "left"
    ? [mediaCell, gapCell, contentCell]
    : [contentCell, gapCell, mediaCell];
  return `${TABLE_OPEN}<tbody><tr>${cells.join("")}</tr></tbody></table>`;
}

/* -------------------------------------------------------------------------- */

const classic: Renderer = (sig, ctx) => {
  const sp = spacing(sig);
  const media = stack([image(sig.photo, sig), image(sig.logo, sig)], sp.block);
  return stack(
    [twoColumn(sig, media, coreStack(sig, ctx), "left", true), horizontalDivider(sig), footerStack(sig, ctx)],
    sp.block,
  );
};

const modernBar: Renderer = (sig, ctx) => {
  const sp = spacing(sig);
  const s = sig.style;
  const bar =
    `<td width="4" style="width:4px;background-color:${s.primaryColor};font-size:0;line-height:0;border-radius:2px;">&nbsp;</td>` +
    `<td width="${sp.gutter}" style="width:${sp.gutter}px;font-size:0;line-height:0;">&nbsp;</td>`;
  const media = image(sig.photo, sig);
  const inner = media
    ? twoColumn(sig, media, coreStack(sig, ctx), "left", false)
    : coreStack(sig, ctx);
  const framed = `${TABLE_OPEN}<tbody><tr>${bar}<td style="vertical-align:top;">${inner}</td></tr></tbody></table>`;
  return stack([framed, image(sig.logo, sig), footerStack(sig, ctx)], sp.block);
};

const minimal: Renderer = (sig, ctx) => {
  const sp = spacing(sig);
  return stack(
    [
      image(sig.photo, sig),
      coreStack(sig, ctx, { contactMode: "bare" }),
      horizontalDivider(sig),
      image(sig.logo, sig),
      footerStack(sig, ctx),
    ],
    sp.block,
  );
};

const executive: Renderer = (sig, ctx) => {
  const sp = spacing(sig);
  const s = sig.style;
  const identity = stack([nameLine(sig), roleLine(sig), companyLine(sig), taglineLine(sig)], sp.row + 1);
  const rest = stack(
    [contactBlock(sig, ctx, "label"), meetingBlock(sig, ctx), socialRow(sig, ctx), buttonRow(sig), signoffBlock(sig)],
    sp.row + 3,
  );
  const head = twoColumn(sig, image(sig.photo, sig), identity, "left", false);
  const logoRow = sig.logo?.url
    ? `${TABLE_OPEN}<tbody><tr><td style="padding-top:${sp.block}px;border-top:${s.dividerThickness}px solid ${s.dividerColor};">${image(sig.logo, sig)}</td></tr></tbody></table>`
    : "";
  return stack([head, horizontalDivider(sig), rest, logoRow, footerStack(sig, ctx)], sp.block);
};

const splitCard: Renderer = (sig, ctx) => {
  const sp = spacing(sig);
  const s = sig.style;
  const media = stack([image(sig.photo, sig), image(sig.logo, sig)], sp.row + 4);
  const body = twoColumn(sig, media, coreStack(sig, ctx), "right", true);
  const card =
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:${s.backgroundColor};border:1px solid ${s.dividerColor};border-radius:12px;">` +
    `<tbody><tr><td style="padding:${sp.block + 6}px ${sp.block + 8}px;">${body}</td></tr></tbody></table>`;
  return stack([card, footerStack(sig, ctx)], sp.block);
};

const centered: Renderer = (sig, ctx) => {
  const sp = spacing(sig);
  const inner = stack(
    [
      image(sig.photo, sig),
      nameLine(sig),
      roleLine(sig),
      companyLine(sig),
      taglineLine(sig),
      horizontalDivider(sig),
      contactBlock(sig, ctx, "bare"),
      meetingBlock(sig, ctx),
      socialRow(sig, ctx, "center"),
      buttonRow(sig, "center"),
      image(sig.logo, sig),
      signoffBlock(sig),
    ],
    sp.row + 3,
  );
  return (
    `<div style="text-align:center;">` +
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="border-collapse:collapse;text-align:center;">` +
    `<tbody><tr><td align="center" style="text-align:center;">${inner}</td></tr>` +
    `<tr><td align="center" style="padding-top:${sp.block}px;text-align:center;">${footerStack(sig, ctx)}</td></tr>` +
    `</tbody></table></div>`
  );
};

const compact: Renderer = (sig, ctx) => {
  const sp = spacing(sig);
  const s = sig.style;
  const d = sig.details;
  const sep = ` <span style="color:${s.dividerColor};">&#124;</span> `;

  const headParts = [
    d.fullName
      ? `<span style="font-weight:bold;color:${s.primaryColor};font-size:${s.baseFontSize + 2}px;">${esc(d.fullName)}</span>`
      : "",
    d.jobTitle ? esc(d.jobTitle) : "",
    d.company ? `<span style="font-weight:bold;color:${s.accentColor};">${esc(d.company)}</span>` : "",
  ].filter(Boolean);

  const contactParts = [
    d.phone ? `<a href="tel:${esc(d.phone.replace(/[^\d+]/g, ""))}" style="color:${s.linkColor};text-decoration:none;">${esc(d.phone)}</a>` : "",
    d.email ? `<a href="mailto:${esc(d.email)}" style="color:${s.linkColor};text-decoration:none;">${esc(d.email)}</a>` : "",
    d.website ? `<a href="${esc(/^https?:/i.test(d.website) ? d.website : `https://${d.website}`)}" style="color:${s.linkColor};text-decoration:none;">${esc(d.website.replace(/^https?:\/\//i, ""))}</a>` : "",
  ].filter(Boolean);

  const lines = stack(
    [
      headParts.length ? `<div style="${baseTextStyle(sig)}">${headParts.join(sep)}</div>` : "",
      contactParts.length ? `<div style="${baseTextStyle(sig, `font-size:${Math.max(11, s.baseFontSize - 1)}px;`)}">${contactParts.join(sep)}</div>` : "",
      socialRow(sig, ctx),
      buttonRow(sig),
    ],
    sp.row + 2,
  );

  const media = image(sig.logo, sig) || image(sig.photo, sig);
  return stack([twoColumn(sig, media, lines, "left", false), footerStack(sig, ctx)], sp.block);
};

const bannerTop: Renderer = (sig, ctx) => {
  const sp = spacing(sig);
  const media = stack([image(sig.photo, sig), image(sig.logo, sig)], sp.row + 4);
  return stack(
    [
      bannerBlock(sig),
      twoColumn(sig, media, coreStack(sig, ctx), "left", true),
      horizontalDivider(sig),
      footerStack(sig, ctx, { banner: true }),
    ],
    sp.block,
  );
};

const logoTop: Renderer = (sig, ctx) => {
  const sp = spacing(sig);
  return stack(
    [
      image(sig.logo, sig),
      horizontalDivider(sig),
      twoColumn(sig, image(sig.photo, sig), coreStack(sig, ctx), "left", false),
      footerStack(sig, ctx),
    ],
    sp.block,
  );
};

const photoRight: Renderer = (sig, ctx) => {
  const sp = spacing(sig);
  const media = stack([image(sig.photo, sig), image(sig.logo, sig)], sp.row + 4);
  return stack(
    [twoColumn(sig, media, coreStack(sig, ctx), "right", true), horizontalDivider(sig), footerStack(sig, ctx)],
    sp.block,
  );
};

const elegant: Renderer = (sig, ctx) => {
  const sp = spacing(sig);
  const s = sig.style;
  const name = sig.details.fullName
    ? `<div style="${baseTextStyle(
        sig,
        `font-size:${s.nameFontSize}px;line-height:${Math.round(s.nameFontSize * 1.3)}px;` +
          `letter-spacing:2.5px;text-transform:uppercase;color:${s.primaryColor};font-weight:normal;`,
      )}">${esc(sig.details.fullName)}</div>`
    : "";
  const rule = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tbody><tr><td style="width:44px;height:2px;font-size:0;line-height:0;background-color:${s.accentColor};">&nbsp;</td></tr></tbody></table>`;
  const identity = stack(
    [
      name,
      rule,
      roleLine(sig),
      companyLine(sig),
      taglineLine(sig),
      contactBlock(sig, ctx, "bare"),
      meetingBlock(sig, ctx),
      socialRow(sig, ctx),
      buttonRow(sig),
      signoffBlock(sig),
    ],
    sp.row + 4,
  );
  const media = stack([image(sig.photo, sig), image(sig.logo, sig)], sp.row + 4);
  return stack([twoColumn(sig, media, identity, "left", false), horizontalDivider(sig), footerStack(sig, ctx)], sp.block);
};

const monoTech: Renderer = (sig, ctx) => {
  const sp = spacing(sig);
  const s = sig.style;
  const mono = "font-family:Consolas,'Courier New',Courier,monospace;";
  const name = sig.details.fullName
    ? `<div style="${mono}font-size:${s.nameFontSize}px;line-height:${Math.round(s.nameFontSize * 1.3)}px;font-weight:bold;color:${s.primaryColor};">` +
      `<span style="color:${s.accentColor};">&gt;</span> ${esc(sig.details.fullName)}</div>`
    : "";
  const role = [sig.details.jobTitle, sig.details.company].filter(Boolean).map(esc).join(" @ ");
  const roleEl = role
    ? `<div style="${mono}font-size:${s.baseFontSize}px;line-height:${Math.round(s.baseFontSize * 1.5)}px;color:${s.textColor};">${role}</div>`
    : "";
  const identity = stack(
    [name, roleEl, taglineLine(sig), contactBlock(sig, ctx, "label"), meetingBlock(sig, ctx), socialRow(sig, ctx), buttonRow(sig)],
    sp.row + 2,
  );
  const framed =
    `${TABLE_OPEN}<tbody><tr>` +
    `<td style="border-left:2px solid ${s.accentColor};padding-left:${sp.gutter}px;">${identity}</td>` +
    `</tr></tbody></table>`;
  return stack([twoColumn(sig, image(sig.photo, sig), framed, "left", false), image(sig.logo, sig), footerStack(sig, ctx)], sp.block);
};

const creative: Renderer = (sig, ctx) => {
  const sp = spacing(sig);
  const s = sig.style;
  const header = sig.details.fullName
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tbody><tr>` +
      `<td style="background-color:${s.primaryColor};border-radius:8px;padding:8px 16px;">` +
      `<span style="${baseTextStyle(sig, `font-size:${s.nameFontSize}px;line-height:${Math.round(s.nameFontSize * 1.25)}px;font-weight:bold;color:#ffffff;`)}">${esc(sig.details.fullName)}</span>` +
      `</td></tr></tbody></table>`
    : "";
  const identity = stack(
    [
      header,
      roleLine(sig),
      companyLine(sig),
      taglineLine(sig),
      contactBlock(sig, ctx, "icon"),
      meetingBlock(sig, ctx),
      socialRow(sig, ctx),
      buttonRow(sig),
      signoffBlock(sig),
    ],
    sp.row + 3,
  );
  const media = stack([image(sig.photo, sig), image(sig.logo, sig)], sp.row + 4);
  return stack([twoColumn(sig, media, identity, "left", false), footerStack(sig, ctx)], sp.block);
};

const corporate: Renderer = (sig, ctx) => {
  const sp = spacing(sig);
  const s = sig.style;
  const identity = stack([nameLine(sig), roleLine(sig), companyLine(sig)], sp.row);
  // Logo above photo in one column beside the name, rather than leaving the
  // photo to dangle beneath the footer.
  const media = stack([image(sig.logo, sig), image(sig.photo, sig)], sp.row + 4);
  const head = twoColumn(sig, media, identity, "left", true);
  const body = stack(
    [contactBlock(sig, ctx, "label"), meetingBlock(sig, ctx), socialRow(sig, ctx), buttonRow(sig)],
    sp.row + 3,
  );
  const boxed =
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;border-top:3px solid ${s.primaryColor};">` +
    `<tbody><tr><td style="padding-top:${sp.block}px;">${body}</td></tr></tbody></table>`;
  return stack([head, boxed, horizontalDivider(sig), footerStack(sig, ctx)], sp.block);
};

const stackedIcons: Renderer = (sig, ctx) => {
  const sp = spacing(sig);
  const content = coreStack(sig, ctx, { omitSocials: true });
  const rail = sig.socials.length
    ? `${TABLE_OPEN}<tbody>${sig.socials
        .filter((x) => x.value.trim())
        .map((x) => `<tr><td style="padding-bottom:${Math.round(sig.style.iconSize * 0.3)}px;line-height:0;">${socialRow(
          { ...sig, socials: [x] } as Signature, ctx,
        )}</td></tr>`)
        .join("")}</tbody></table>`
    : "";
  const left = twoColumn(sig, image(sig.photo, sig), content, "left", false);
  const withRail = rail
    ? `${TABLE_OPEN}<tbody><tr><td style="vertical-align:top;">${left}</td>` +
      `<td width="${sp.gutter}" style="width:${sp.gutter}px;font-size:0;">&nbsp;</td>` +
      `<td style="vertical-align:top;">${rail}</td></tr></tbody></table>`
    : left;
  return stack([withRail, image(sig.logo, sig), footerStack(sig, ctx)], sp.block);
};

const accentEdge: Renderer = (sig, ctx) => {
  const sp = spacing(sig);
  const s = sig.style;
  const media = stack([image(sig.photo, sig), image(sig.logo, sig)], sp.row + 4);
  const body = twoColumn(sig, media, coreStack(sig, ctx), "left", false);
  const card =
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:${s.backgroundColor};border-radius:10px;">` +
    `<tbody><tr>` +
    `<td width="6" style="width:6px;background-color:${s.primaryColor};font-size:0;line-height:0;border-radius:10px 0 0 10px;">&nbsp;</td>` +
    `<td style="padding:${sp.block + 4}px ${sp.block + 8}px;">${body}</td>` +
    `</tr></tbody></table>`;
  return stack([card, footerStack(sig, ctx)], sp.block);
};

const qrCard: Renderer = (sig, ctx) => {
  const sp = spacing(sig);
  const left = coreStack(sig, ctx);
  const right = stack([qrBlock(sig, ctx), image(sig.logo, sig)], sp.row + 4);
  const withPhoto = twoColumn(sig, image(sig.photo, sig), left, "left", false);
  const body = right
    ? `${TABLE_OPEN}<tbody><tr><td style="vertical-align:top;">${withPhoto}</td>` +
      verticalDividerCell(sig) +
      `<td style="vertical-align:top;">${right}</td></tr></tbody></table>`
    : withPhoto;
  return stack([body, horizontalDivider(sig), footerStack(sig, ctx, { qr: true })], sp.block);
};

/* -------------------------------------------------------------------------- */

const RENDERERS: Record<string, Renderer> = {
  classic, "modern-bar": modernBar, minimal, executive, "split-card": splitCard,
  centered, compact, "banner-top": bannerTop, "logo-top": logoTop,
  "photo-right": photoRight, elegant, "mono-tech": monoTech, creative,
  corporate, "stacked-icons": stackedIcons, "accent-edge": accentEdge,
  "qr-card": qrCard,
};

export const TEMPLATES: TemplateMeta[] = [
  { id: "classic", name: "Classic", description: "Photo on the left, details on the right, separated by a rule. The layout most people picture when they think 'email signature'.", tags: ["Popular", "Photo"] },
  { id: "modern-bar", name: "Modern Bar", description: "A coloured accent bar anchors the details. Clean, contemporary, works without a photo.", tags: ["Popular", "No photo"] },
  { id: "minimal", name: "Minimal", description: "Pure typography in a single stack. Nothing but the essentials.", tags: ["Minimal", "Text only"] },
  { id: "executive", name: "Executive", description: "Identity up top, labelled contact table below, company logo on its own line.", tags: ["Corporate", "Formal"] },
  { id: "split-card", name: "Split Card", description: "A bordered card with the photo on the right. Reads like a business card.", tags: ["Card", "Photo"] },
  { id: "centered", name: "Centered", description: "Everything centre-aligned under a round photo. Warm and personal.", tags: ["Centered", "Personal"] },
  { id: "compact", name: "Compact", description: "One or two dense lines. Ideal for replies and high-volume senders.", tags: ["Compact", "Minimal"] },
  { id: "banner-top", name: "Banner Top", description: "A full-width promo banner leads, details follow. Built for campaigns.", tags: ["Marketing", "Banner"] },
  { id: "logo-top", name: "Logo Top", description: "Company logo first, then the person. Puts the brand ahead of the individual.", tags: ["Brand-first"] },
  { id: "photo-right", name: "Photo Right", description: "Details first, portrait on the right. Reads naturally left to right.", tags: ["Photo"] },
  { id: "elegant", name: "Elegant", description: "Letterspaced uppercase name over a short accent rule. Refined and quiet.", tags: ["Elegant", "Serif"] },
  { id: "mono-tech", name: "Mono Tech", description: "Monospaced with a terminal-style prompt and an accent border.", tags: ["Developer", "Bold"] },
  { id: "creative", name: "Creative", description: "The name sits in a filled colour chip. High contrast and memorable.", tags: ["Bold", "Creative"] },
  { id: "corporate", name: "Corporate", description: "Logo beside the name, labelled contact rows under a solid brand rule.", tags: ["Corporate", "Formal"] },
  { id: "stacked-icons", name: "Icon Rail", description: "Social icons run down a vertical rail beside the details.", tags: ["Social", "Unusual"] },
  { id: "accent-edge", name: "Accent Edge", description: "A soft card with a thick coloured edge. Modern and friendly.", tags: ["Card", "Modern"] },
  { id: "qr-card", name: "QR Card", description: "Contact details beside a scannable QR code that saves your vCard.", tags: ["QR", "Networking"] },
];

export const TEMPLATE_IDS = TEMPLATES.map((t) => t.id);

export function renderTemplate(sig: Signature, ctx: RenderContext): string {
  const renderer = RENDERERS[sig.style.templateId] ?? classic;
  return renderer(sig, ctx);
}
