/**
 * The complete description of an email signature.
 *
 * Everything the renderer needs lives in this one serialisable object, so a
 * signature can be stored as JSON, shared by link, duplicated, or handed to a
 * different template without any conversion step.
 */

export type ImageShape = "square" | "rounded" | "circle";
export type Align = "left" | "center" | "right";
export type IconStyle = "brand" | "dark" | "light" | "grey";
export type IconShape = "plain" | "circle" | "rounded" | "square";
export type DividerStyle = "none" | "line" | "bar" | "dots";
export type Density = "compact" | "cosy" | "roomy";

export interface ImageSpec {
  /** Absolute URL. Uploaded images resolve to `${APP_URL}/i/<id>`. */
  url: string;
  width: number;
  shape: ImageShape;
  /** Optional click-through target. */
  link?: string;
  alt?: string;
  borderWidth?: number;
  borderColor?: string;
}

export interface SocialLink {
  id: string;
  /** Key into the NETWORKS registry, e.g. "linkedin". */
  network: string;
  /** Profile URL, handle, or (for email/phone networks) the raw value. */
  value: string;
  /** Overrides the network's default label in text-mode rows. */
  label?: string;
}

export interface CustomField {
  id: string;
  label: string;
  value: string;
  link?: string;
  /** Icon key from the FIELD_ICONS registry. */
  icon?: string;
}

export interface CtaButton {
  id: string;
  label: string;
  url: string;
  background: string;
  color: string;
  /** Border radius in px. 0 = square, >=20 = pill. */
  radius: number;
  style: "solid" | "outline";
  size: "sm" | "md" | "lg";
}

export interface Banner {
  enabled: boolean;
  imageUrl: string;
  link?: string;
  width: number;
  alt?: string;
}

export interface Disclaimer {
  enabled: boolean;
  text: string;
  fontSize: number;
  color: string;
}

export interface VideoCard {
  enabled: boolean;
  /** Thumbnail image URL; a play badge is composited on top at render time. */
  thumbnailUrl: string;
  link: string;
  width: number;
  caption?: string;
}

export interface QrCode {
  enabled: boolean;
  /** "vcard" encodes the contact details; "url" encodes `value`. */
  mode: "vcard" | "url";
  value: string;
  size: number;
  darkColor: string;
  caption?: string;
}

export interface GreenFooter {
  enabled: boolean;
  text: string;
}

export interface Quote {
  enabled: boolean;
  text: string;
  author?: string;
}

export interface MeetingLink {
  enabled: boolean;
  label: string;
  url: string;
}

export interface BadgeRow {
  enabled: boolean;
  items: { id: string; imageUrl: string; link?: string; alt?: string; width: number }[];
}

export interface SignoffImage {
  enabled: boolean;
  /** Rendered server-side from `text` in a script face, or an uploaded image. */
  text: string;
  imageUrl?: string;
  color: string;
  width: number;
}

export interface Details {
  fullName: string;
  pronouns: string;
  credentials: string;
  jobTitle: string;
  department: string;
  company: string;
  tagline: string;
  email: string;
  phone: string;
  mobile: string;
  fax: string;
  website: string;
  address: string;
}

export interface Style {
  templateId: string;
  fontFamily: string;
  baseFontSize: number;
  nameFontSize: number;
  /** Brand colour: used for the name, links and accents. */
  primaryColor: string;
  accentColor: string;
  textColor: string;
  mutedColor: string;
  linkColor: string;
  backgroundColor: string;
  divider: DividerStyle;
  dividerColor: string;
  dividerThickness: number;
  density: Density;
  align: Align;
  /** Overall signature width cap in px. */
  maxWidth: number;
  iconStyle: IconStyle;
  iconShape: IconShape;
  iconSize: number;
  /** Solid-colour override for icons when iconStyle isn't "brand". */
  iconColor: string;
  uppercaseName: boolean;
  boldLabels: boolean;
}

export interface Addons {
  banner: Banner;
  disclaimer: Disclaimer;
  video: VideoCard;
  qr: QrCode;
  green: GreenFooter;
  quote: Quote;
  meeting: MeetingLink;
  badges: BadgeRow;
  signoff: SignoffImage;
}

export interface Signature {
  id: string;
  /** True once a credit has been spent to unlock export. */
  paid?: boolean;
  paidAt?: string | null;
  name: string;
  ownerId: string | null;
  /** Short public slug for the share page, e.g. /s/ab12cd. */
  slug: string;
  createdAt: string;
  updatedAt: string;
  details: Details;
  photo: ImageSpec | null;
  logo: ImageSpec | null;
  socials: SocialLink[];
  customFields: CustomField[];
  buttons: CtaButton[];
  addons: Addons;
  style: Style;
}

/** Everything the renderer needs, minus the storage envelope. */
export type SignatureDraft = Omit<
  Signature,
  "id" | "ownerId" | "slug" | "createdAt" | "updatedAt"
>;

export interface RenderContext {
  /** Absolute origin used to build image URLs. */
  origin: string;
  /** Dark-mode preview swaps the preview chrome, not the signature colours. */
  preview?: boolean;
}
