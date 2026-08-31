/**
 * Per-client installation instructions.
 *
 * Getting a signature into a mail client is where most people give up, so the
 * steps are written per client rather than as one generic "paste it in".
 */

export interface MailClient {
  slug: string;
  name: string;
  /** Short label for chips and tabs. */
  short: string;
  platform: string;
  /** The method that actually works for this client. */
  method: "paste" | "html-file" | "paste-limited";
  steps: string[];
  notes?: string[];
}

export const MAIL_CLIENTS: MailClient[] = [
  {
    slug: "gmail",
    name: "Gmail",
    short: "Gmail",
    platform: "Web",
    method: "paste",
    steps: [
      "Copy your signature with the Copy signature button.",
      "In Gmail, open Settings (the gear icon) and choose See all settings.",
      "On the General tab, scroll down to the Signature section.",
      "Click Create new, give the signature a name, then click into the editing box.",
      "Paste with Ctrl+V (Cmd+V on a Mac). The formatting, images and links all come across.",
      "Under Signature defaults, pick your new signature for both For new emails and On reply/forward.",
      "Scroll to the bottom and click Save changes.",
    ],
    notes: [
      "Gmail's signature box has a size limit of roughly 10,000 characters. The editor shows your signature's weight so you can keep it comfortably under.",
      "If images do not appear, make sure you pasted rather than typed, and that you are not in plain-text mode.",
    ],
  },
  {
    slug: "outlook-web",
    name: "Outlook on the web",
    short: "Outlook web",
    platform: "Web / Microsoft 365",
    method: "paste",
    steps: [
      "Copy your signature with the Copy signature button.",
      "In Outlook on the web, open Settings (the gear icon), then Mail, then Compose and reply.",
      "Under Email signature, click into the editing box.",
      "Paste with Ctrl+V (Cmd+V on a Mac).",
      "Choose your signature under Select default signatures for both new messages and replies.",
      "Click Save.",
    ],
    notes: [
      "Outlook on the web renders signatures far more faithfully than the classic desktop app.",
    ],
  },
  {
    slug: "outlook-windows",
    name: "Outlook for Windows",
    short: "Outlook (Win)",
    platform: "Desktop",
    method: "paste-limited",
    steps: [
      "Copy your signature with the Copy signature button.",
      "In Outlook, go to File, then Options, then Mail, then Signatures.",
      "Click New, name the signature, and click into the Edit signature box.",
      "Paste with Ctrl+V.",
      "Set the signature for New messages and Replies/forwards using the dropdowns on the right.",
      "Click OK.",
    ],
    notes: [
      "Classic Outlook for Windows renders mail with Microsoft Word, which ignores rounded corners and some spacing. Your signature is built to degrade gracefully: circles become squares, everything stays readable.",
      "If pasting loses the layout, download the .htm file instead and place it in %APPDATA%\\Microsoft\\Signatures, then pick it from the Signatures dialog.",
    ],
  },
  {
    slug: "outlook-mac",
    name: "Outlook for Mac",
    short: "Outlook (Mac)",
    platform: "Desktop",
    method: "paste",
    steps: [
      "Copy your signature with the Copy signature button.",
      "In Outlook, open Settings from the Outlook menu, then choose Signatures.",
      "Click the + button to add a signature and name it.",
      "Click into the editing area and paste with Cmd+V.",
      "Close the window, then use the dropdowns to set the default signature per account.",
    ],
  },
  {
    slug: "apple-mail",
    name: "Apple Mail",
    short: "Apple Mail",
    platform: "macOS",
    method: "paste",
    steps: [
      "Copy your signature with the Copy signature button.",
      "In Mail, open Settings from the Mail menu, then choose the Signatures tab.",
      "Pick the account on the left, then click + to create a signature.",
      "Untick Always match my default message font — this step matters, or Mail will strip your formatting.",
      "Select everything in the signature box and paste with Cmd+V.",
      "Choose the signature from the Choose Signature dropdown for that account.",
    ],
    notes: [
      "Unticking the default-font option is the single most common reason an Apple Mail signature looks wrong.",
    ],
  },
  {
    slug: "ios-mail",
    name: "Mail on iPhone and iPad",
    short: "iOS Mail",
    platform: "iOS",
    method: "paste-limited",
    steps: [
      "Open your signature's share link on the device, or email it to yourself.",
      "Select the whole signature and copy it.",
      "Open Settings, then Apps, then Mail, then Signature.",
      "Clear the existing text and paste.",
      "If the formatting is lost, shake the device and choose Undo Attribute Change to restore it.",
    ],
    notes: [
      "iOS strips rich formatting on paste unless you use the Undo Attribute Change trick. It works, but it is fiddly — most people set the signature on desktop and let it sync.",
    ],
  },
  {
    slug: "yahoo",
    name: "Yahoo Mail",
    short: "Yahoo",
    platform: "Web",
    method: "paste",
    steps: [
      "Copy your signature with the Copy signature button.",
      "Open Settings, then More Settings, then Mailboxes.",
      "Select your email address, then scroll to Signature and turn it on.",
      "Click into the box and paste with Ctrl+V (Cmd+V on a Mac).",
      "The change saves automatically.",
    ],
  },
  {
    slug: "thunderbird",
    name: "Thunderbird",
    short: "Thunderbird",
    platform: "Desktop",
    method: "html-file",
    steps: [
      "Download the .htm file from the export panel.",
      "In Thunderbird, right-click your account and choose Settings.",
      "Tick Attach the signature from a file instead.",
      "Click Choose and select the .htm file you downloaded.",
      "Click OK.",
    ],
    notes: [
      "Because Thunderbird reads the file from disk, editing and re-downloading the file updates your signature without touching the settings again.",
    ],
  },
  {
    slug: "zoho",
    name: "Zoho Mail",
    short: "Zoho",
    platform: "Web",
    method: "paste",
    steps: [
      "Copy your signature with the Copy signature button.",
      "Open Settings, then Mail, then Signatures.",
      "Click New Signature and name it.",
      "Click into the rich-text box and paste.",
      "Associate the signature with your account and save.",
    ],
  },
  {
    slug: "proton",
    name: "Proton Mail",
    short: "Proton",
    platform: "Web",
    method: "paste",
    steps: [
      "Copy your signature with the Copy signature button.",
      "Open Settings, then All settings, then Identity and addresses.",
      "Turn on the signature toggle and click into the editor.",
      "Paste with Ctrl+V (Cmd+V on a Mac), then click Save.",
    ],
    notes: [
      "Proton blocks remote images by default for recipients, so icons may appear only after a recipient chooses to load images.",
    ],
  },
  {
    slug: "hey",
    name: "HEY",
    short: "HEY",
    platform: "Web",
    method: "paste",
    steps: [
      "Copy your signature with the Copy signature button.",
      "Open your account menu, then Settings, then Signature.",
      "Paste into the box and save.",
    ],
  },
  {
    slug: "superhuman",
    name: "Superhuman",
    short: "Superhuman",
    platform: "Desktop / Web",
    method: "paste",
    steps: [
      "Copy your signature with the Copy signature button.",
      "Press Cmd+K (Ctrl+K on Windows) and search for Signature.",
      "Paste into the signature editor and save.",
    ],
  },
];

export const CLIENT_BY_SLUG: Record<string, MailClient> = Object.fromEntries(
  MAIL_CLIENTS.map((c) => [c.slug, c]),
);
