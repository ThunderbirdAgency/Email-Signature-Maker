/**
 * Generates the demo images used by the marketing site and template gallery.
 *
 * These are produced once and committed, rather than rendered at request time,
 * so the running service has no dependency on which fonts a host happens to
 * have installed. Re-run with `npm run demo-assets` after editing this file.
 *
 * Everything here depicts a fictional company (Northwind Studio) and a
 * monogram rather than a photograph of a real person.
 */

import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const OUT = path.join(process.cwd(), "public", "demo");
const FONT = "DejaVu Sans, Helvetica, Arial, sans-serif";

/** Rasterise an SVG string to a PNG at the given path. */
async function write(name, svg) {
  const file = path.join(OUT, name);
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(file);
  console.log("wrote", path.relative(process.cwd(), file));
}

await mkdir(OUT, { recursive: true });

// --- Company logo: a mark plus wordmark, sized for a 2x display at ~130px ----
await write(
  "logo.png",
  // Kept tight and single-line: a signature shows this at roughly 150px wide,
  // where a tracked-out second line becomes unreadable.
  `<svg xmlns="http://www.w3.org/2000/svg" width="424" height="88" viewBox="0 0 424 88">
    <g transform="translate(0 4)">
      <rect width="80" height="80" rx="21" fill="#0f172a"/>
      <path d="M21 59V21l38 38V21" fill="none" stroke="#ffffff" stroke-width="9"
            stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    <text x="98" y="59" font-family="${FONT}" font-size="42" font-weight="bold"
          fill="#0f172a" letter-spacing="0.5">NORTHWIND</text>
  </svg>`,
);

// --- Promo banner: the wide campaign image below a signature -----------------
await write(
  "banner.png",
  `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="300" viewBox="0 0 1200 300">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#1e1b4b"/>
        <stop offset="55%" stop-color="#4338ca"/>
        <stop offset="100%" stop-color="#0891b2"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="300" rx="16" fill="url(#bg)"/>
    <g opacity="0.14" fill="none" stroke="#ffffff" stroke-width="2">
      <circle cx="1035" cy="150" r="118"/>
      <circle cx="1035" cy="150" r="80"/>
      <circle cx="1035" cy="150" r="42"/>
    </g>
    <text x="64" y="118" font-family="${FONT}" font-size="30" font-weight="bold"
          fill="#a5b4fc" letter-spacing="3.5">NOW BOOKING · Q3</text>
    <text x="64" y="184" font-family="${FONT}" font-size="52" font-weight="bold"
          fill="#ffffff">Brand systems that ship</text>
    <text x="64" y="232" font-family="${FONT}" font-size="27" fill="#c7d2fe">
      Six-week engagements. Two slots left.
    </text>
  </svg>`,
);

// --- Monogram avatar: stands in for a headshot without inventing a face ------
await write(
  "avatar.png",
  `<svg xmlns="http://www.w3.org/2000/svg" width="288" height="288" viewBox="0 0 288 288">
    <defs>
      <linearGradient id="av" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#6366f1"/>
        <stop offset="100%" stop-color="#22d3ee"/>
      </linearGradient>
    </defs>
    <rect width="288" height="288" fill="url(#av)"/>
    <text x="144" y="182" text-anchor="middle" font-family="${FONT}" font-size="122"
          font-weight="bold" fill="#ffffff" opacity="0.94">AS</text>
  </svg>`,
);

console.log("demo assets built");
