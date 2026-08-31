/**
 * Registry of every link type that can appear in a signature.
 *
 * `slug` is the stable key stored in a signature document and used in icon
 * URLs, so it must never change once shipped.
 */

export type NetworkCategory =
  | "social"
  | "messaging"
  | "professional"
  | "creative"
  | "developer"
  | "media"
  | "commerce"
  | "contact";

export interface Network {
  slug: string;
  title: string;
  category: NetworkCategory;
  /** Brand colour, without the leading '#'. */
  hex: string;
  /**
   * How a raw user input becomes an href. `{v}` is replaced with the trimmed
   * value; if the value already looks like a URL it is used verbatim.
   */
  template: string;
  placeholder: string;
  /** Simple Icons export name, when one exists. */
  simpleIcon?: string;
}

export const NETWORKS: Network[] = [
  // --- Core social -----------------------------------------------------------
  { slug: "linkedin", title: "LinkedIn", category: "professional", hex: "0A66C2", template: "https://linkedin.com/in/{v}", placeholder: "your-handle" },
  { slug: "x", title: "X", category: "social", hex: "000000", template: "https://x.com/{v}", placeholder: "handle", simpleIcon: "siX" },
  { slug: "facebook", title: "Facebook", category: "social", hex: "0866FF", template: "https://facebook.com/{v}", placeholder: "page-name", simpleIcon: "siFacebook" },
  { slug: "instagram", title: "Instagram", category: "social", hex: "E4405F", template: "https://instagram.com/{v}", placeholder: "handle", simpleIcon: "siInstagram" },
  { slug: "youtube", title: "YouTube", category: "media", hex: "FF0000", template: "https://youtube.com/@{v}", placeholder: "channel", simpleIcon: "siYoutube" },
  { slug: "tiktok", title: "TikTok", category: "social", hex: "000000", template: "https://tiktok.com/@{v}", placeholder: "handle", simpleIcon: "siTiktok" },
  { slug: "threads", title: "Threads", category: "social", hex: "000000", template: "https://threads.net/@{v}", placeholder: "handle", simpleIcon: "siThreads" },
  { slug: "bluesky", title: "Bluesky", category: "social", hex: "0285FF", template: "https://bsky.app/profile/{v}", placeholder: "you.bsky.social", simpleIcon: "siBluesky" },
  { slug: "mastodon", title: "Mastodon", category: "social", hex: "6364FF", template: "https://{v}", placeholder: "mastodon.social/@you", simpleIcon: "siMastodon" },
  { slug: "pinterest", title: "Pinterest", category: "social", hex: "BD081C", template: "https://pinterest.com/{v}", placeholder: "handle", simpleIcon: "siPinterest" },
  { slug: "snapchat", title: "Snapchat", category: "social", hex: "FFFC00", template: "https://snapchat.com/add/{v}", placeholder: "handle", simpleIcon: "siSnapchat" },
  { slug: "reddit", title: "Reddit", category: "social", hex: "FF4500", template: "https://reddit.com/user/{v}", placeholder: "username", simpleIcon: "siReddit" },
  { slug: "twitch", title: "Twitch", category: "media", hex: "9146FF", template: "https://twitch.tv/{v}", placeholder: "channel", simpleIcon: "siTwitch" },
  { slug: "vimeo", title: "Vimeo", category: "media", hex: "1AB7EA", template: "https://vimeo.com/{v}", placeholder: "username", simpleIcon: "siVimeo" },
  { slug: "xing", title: "Xing", category: "professional", hex: "006567", template: "https://xing.com/profile/{v}", placeholder: "profile", simpleIcon: "siXing" },

  // --- Messaging & meetings --------------------------------------------------
  { slug: "whatsapp", title: "WhatsApp", category: "messaging", hex: "25D366", template: "https://wa.me/{v}", placeholder: "15551234567", simpleIcon: "siWhatsapp" },
  { slug: "telegram", title: "Telegram", category: "messaging", hex: "26A5E4", template: "https://t.me/{v}", placeholder: "handle", simpleIcon: "siTelegram" },
  { slug: "signal", title: "Signal", category: "messaging", hex: "3A76F0", template: "https://signal.me/#p/{v}", placeholder: "+15551234567", simpleIcon: "siSignal" },
  { slug: "discord", title: "Discord", category: "messaging", hex: "5865F2", template: "https://discord.gg/{v}", placeholder: "invite-code", simpleIcon: "siDiscord" },
  { slug: "slack", title: "Slack", category: "messaging", hex: "4A154B", template: "https://{v}", placeholder: "team.slack.com" },
  { slug: "teams", title: "Microsoft Teams", category: "messaging", hex: "6264A7", template: "https://teams.microsoft.com/l/chat/0/0?users={v}", placeholder: "you@company.com" },
  { slug: "skype", title: "Skype", category: "messaging", hex: "00AFF0", template: "skype:{v}?chat", placeholder: "skype-name" },
  { slug: "zoom", title: "Zoom", category: "messaging", hex: "0B5CFF", template: "https://{v}", placeholder: "zoom.us/j/1234567890", simpleIcon: "siZoom" },
  { slug: "googlemeet", title: "Google Meet", category: "messaging", hex: "00897B", template: "https://{v}", placeholder: "meet.google.com/abc-defg", simpleIcon: "siGooglemeet" },
  { slug: "calendly", title: "Calendly", category: "professional", hex: "006BFF", template: "https://calendly.com/{v}", placeholder: "your-name", simpleIcon: "siCalendly" },
  { slug: "line", title: "LINE", category: "messaging", hex: "00C300", template: "https://line.me/ti/p/{v}", placeholder: "line-id", simpleIcon: "siLine" },
  { slug: "wechat", title: "WeChat", category: "messaging", hex: "07C160", template: "{v}", placeholder: "wechat-id", simpleIcon: "siWechat" },
  { slug: "viber", title: "Viber", category: "messaging", hex: "7360F2", template: "viber://chat?number={v}", placeholder: "+15551234567", simpleIcon: "siViber" },

  // --- Creative & developer --------------------------------------------------
  { slug: "behance", title: "Behance", category: "creative", hex: "1769FF", template: "https://behance.net/{v}", placeholder: "username", simpleIcon: "siBehance" },
  { slug: "dribbble", title: "Dribbble", category: "creative", hex: "EA4C89", template: "https://dribbble.com/{v}", placeholder: "username", simpleIcon: "siDribbble" },
  { slug: "figma", title: "Figma", category: "creative", hex: "F24E1E", template: "https://figma.com/@{v}", placeholder: "username", simpleIcon: "siFigma" },
  { slug: "flickr", title: "Flickr", category: "creative", hex: "0063DC", template: "https://flickr.com/photos/{v}", placeholder: "username", simpleIcon: "siFlickr" },
  { slug: "github", title: "GitHub", category: "developer", hex: "181717", template: "https://github.com/{v}", placeholder: "username", simpleIcon: "siGithub" },
  { slug: "gitlab", title: "GitLab", category: "developer", hex: "FC6D26", template: "https://gitlab.com/{v}", placeholder: "username", simpleIcon: "siGitlab" },
  { slug: "stackoverflow", title: "Stack Overflow", category: "developer", hex: "F58025", template: "https://stackoverflow.com/users/{v}", placeholder: "user-id", simpleIcon: "siStackoverflow" },
  { slug: "notion", title: "Notion", category: "professional", hex: "000000", template: "https://{v}", placeholder: "notion.site/page", simpleIcon: "siNotion" },

  // --- Publishing & audio ----------------------------------------------------
  { slug: "medium", title: "Medium", category: "media", hex: "000000", template: "https://medium.com/@{v}", placeholder: "handle", simpleIcon: "siMedium" },
  { slug: "substack", title: "Substack", category: "media", hex: "FF6719", template: "https://{v}.substack.com", placeholder: "publication", simpleIcon: "siSubstack" },
  { slug: "wordpress", title: "WordPress", category: "media", hex: "21759B", template: "https://{v}", placeholder: "yourblog.com", simpleIcon: "siWordpress" },
  { slug: "spotify", title: "Spotify", category: "media", hex: "1DB954", template: "https://open.spotify.com/{v}", placeholder: "artist/xyz", simpleIcon: "siSpotify" },
  { slug: "soundcloud", title: "SoundCloud", category: "media", hex: "FF5500", template: "https://soundcloud.com/{v}", placeholder: "username", simpleIcon: "siSoundcloud" },
  { slug: "applepodcasts", title: "Apple Podcasts", category: "media", hex: "9933CC", template: "https://{v}", placeholder: "podcasts.apple.com/...", simpleIcon: "siApplepodcasts" },
  { slug: "goodreads", title: "Goodreads", category: "media", hex: "372213", template: "https://goodreads.com/{v}", placeholder: "username", simpleIcon: "siGoodreads" },
  { slug: "strava", title: "Strava", category: "social", hex: "FC4C02", template: "https://strava.com/athletes/{v}", placeholder: "athlete-id", simpleIcon: "siStrava" },

  // --- Commerce & reviews ----------------------------------------------------
  { slug: "etsy", title: "Etsy", category: "commerce", hex: "F16521", template: "https://etsy.com/shop/{v}", placeholder: "shop-name", simpleIcon: "siEtsy" },
  { slug: "shopify", title: "Shopify", category: "commerce", hex: "7AB55C", template: "https://{v}", placeholder: "yourstore.com", simpleIcon: "siShopify" },
  { slug: "yelp", title: "Yelp", category: "commerce", hex: "FF1A1A", template: "https://yelp.com/biz/{v}", placeholder: "business-slug", simpleIcon: "siYelp" },
  { slug: "tripadvisor", title: "Tripadvisor", category: "commerce", hex: "34E0A1", template: "https://{v}", placeholder: "tripadvisor.com/...", simpleIcon: "siTripadvisor" },
  { slug: "patreon", title: "Patreon", category: "commerce", hex: "000000", template: "https://patreon.com/{v}", placeholder: "creator", simpleIcon: "siPatreon" },
  { slug: "paypal", title: "PayPal", category: "commerce", hex: "003087", template: "https://paypal.me/{v}", placeholder: "handle", simpleIcon: "siPaypal" },
  { slug: "venmo", title: "Venmo", category: "commerce", hex: "008CFF", template: "https://venmo.com/{v}", placeholder: "handle", simpleIcon: "siVenmo" },

  // --- Plain contact rows ----------------------------------------------------
  { slug: "website", title: "Website", category: "contact", hex: "334155", template: "https://{v}", placeholder: "yourcompany.com" },
  { slug: "email", title: "Email", category: "contact", hex: "334155", template: "mailto:{v}", placeholder: "you@company.com" },
  { slug: "phone", title: "Phone", category: "contact", hex: "334155", template: "tel:{v}", placeholder: "+1 555 123 4567" },
  { slug: "location", title: "Location", category: "contact", hex: "334155", template: "https://maps.google.com/?q={v}", placeholder: "City, Country" },
];

export const NETWORK_BY_SLUG: Record<string, Network> = Object.fromEntries(
  NETWORKS.map((n) => [n.slug, n]),
);

/** Group networks for the picker UI. */
export const CATEGORY_LABELS: Record<NetworkCategory, string> = {
  social: "Social",
  messaging: "Messaging & meetings",
  professional: "Professional",
  creative: "Creative",
  developer: "Developer",
  media: "Publishing & media",
  commerce: "Commerce & reviews",
  contact: "Contact",
};

/**
 * Turn whatever the user typed into a usable href.
 *
 * People paste full URLs as often as they type bare handles, so both are
 * accepted rather than forcing one convention.
 */
export function resolveNetworkUrl(slug: string, rawValue: string): string {
  const value = (rawValue || "").trim();
  if (!value) return "";
  const net = NETWORK_BY_SLUG[slug];
  if (!net) return value;

  if (/^(https?:|mailto:|tel:|skype:|viber:)/i.test(value)) return value;

  // A pasted domain-looking value for a URL-template network is already a URL.
  if (net.template === "https://{v}") return `https://${value.replace(/^\/+/, "")}`;

  if (net.slug === "phone" || net.slug === "whatsapp" || net.slug === "signal" || net.slug === "viber") {
    const digits = value.replace(/[^\d+]/g, "");
    return net.template.replace("{v}", digits);
  }

  // A full profile URL pasted into a handle field: keep it as-is.
  if (/^[\w-]+\.[a-z]{2,}\//i.test(value)) return `https://${value}`;

  return net.template.replace("{v}", encodeURIComponent(value).replace(/%2F/g, "/"));
}
