# Smart Stamp

An email signature builder at **getsmartstamp.com**. Type in your details, pick
a look, copy the result into Gmail, Outlook, Apple Mail or anywhere else.

A marketing site sits at `/`, and the product itself is at `/app`.

---

## Running it

```bash
npm install
cp .env.example .env.local     # then set AUTH_SECRET
npm run dev                    # http://localhost:3000
```

Nothing else is required — no database to provision, no external services. For
production:

```bash
npm run build
npm start
```

### Environment

| Variable | Required | What it does |
| --- | --- | --- |
| `AUTH_SECRET` | in production | Signs the session cookie. Must be 32+ characters: `openssl rand -hex 32`. Development falls back to an insecure constant. |
| `NEXT_PUBLIC_APP_URL` | in production | The public origin, e.g. `https://sig.example.com`. Every image inside a signature is hot-linked from here by the recipient's mail client, so it must be publicly reachable. Falls back to the request's own host. |
| `DATABASE_URL` | for durable data | Postgres connection string. Set it and the app stores everything in Postgres; leave it unset and it falls back to the filesystem. |
| `DATA_DIR` | no | Where the filesystem fallback keeps its data. Defaults to `./.data`. |
| `BILLING_ENABLED` | no | `false` (default) makes everything free. `true` engages the paywall — but only when the Stripe keys below are also set. |
| `STRIPE_SECRET_KEY` | for payments | Stripe secret key. |
| `STRIPE_WEBHOOK_SECRET` | for payments | Signing secret for `/api/webhooks/stripe`. |

---

## How it fits together

```
src/lib/signature/     the rendering engine — no React, no server dependencies
  types.ts             the shape of a signature document
  networks.ts          55 link types, their brand colours and URL patterns
  fonts.ts             email-safe font stacks
  blocks.ts            HTML fragment builders (contact rows, icons, buttons…)
  templates.ts         17 layouts composed from those blocks
  render.ts            top-level render, plain-text and vCard output
  normalize.ts         coerces untrusted JSON into a valid document
  defaults.ts          empty document, colour palettes, sample data

src/lib/
  icons.ts             server-only: brand marks → PNG via sharp
  icon-url.ts          icon URL building, safe for the client bundle
  session.ts           cookie sessions
  guides.ts            per-client install instructions
  store/
    shared.ts          the driver interface, ids and password hashing
    postgres.ts        Postgres driver (used when DATABASE_URL is set)
    file.ts            filesystem driver (the zero-config fallback)
    index.ts           picks one and re-exports it

src/app/               routes; src/components/  UI
```

The engine is deliberately free of framework code. Given a signature document
and an origin it returns a string, which is what makes the same renderer usable
for the live preview in the browser, the server-rendered template gallery, and
the share page.

### Why the output looks the way it does

Mail clients are a hostile rendering target, so the generated HTML is:

- **tables, not flexbox or grid** — classic Outlook for Windows renders mail
  through Microsoft Word, which supports neither;
- **inline styles only** — Gmail strips `<style>` blocks and class attributes;
- **raster images, never SVG** — no major client renders remote SVG in an
  `<img>`, so social icons are generated as PNGs by `/api/icon/…`;
- **absolute URLs** — the recipient's mail client fetches images from your
  server, so a relative path would never resolve.

Where a client cannot do something, the output degrades rather than breaks: a
circular photo becomes a square in Outlook, and everything stays readable.

### Images

Uploads go through `sharp`: re-encoded (which strips EXIF and any embedded
payload), capped at 1200px, and given a content type the server chose rather
than one the client claimed. Format is chosen by content — transparency means a
logo, so PNG; anything else is a photograph, so JPEG, because encoding a photo
as PNG can multiply its size several times over.

`/i/<id>` serves the original; `/i/<id>?w=N` serves a variant scaled to N
pixels, cached immutably. The renderer always asks for twice the display width.
This matters more than it sounds: a 1200px headshot shown at 90px was being
downloaded in full by every recipient of every email. Right-sizing takes that
from megabytes to a couple of kilobytes per open, and bandwidth is the only
cost in this service that scales with usage.

Because that URL has to be publicly fetchable for a signature to work, **anyone
holding the URL can view the image**. Uploads are unguessable but not private.

### Storage

Two drivers behind one interface, chosen at startup by whether `DATABASE_URL`
is set. Nothing outside `src/lib/store/` knows which is in use.

**Postgres** (`DATABASE_URL` set) is what production runs on. A signature is
stored as the same JSON document the renderer consumes, with only the queried
fields — owner, slug, name, timestamps — lifted into columns, so adding a field
to a signature never needs a migration. Image bytes live in `uploads.data` as
`bytea` rather than in an object store: they are small, capped at 1200px, and
always fetched one at a time by id, which keeps the whole service on a single
external dependency.

Every table has row level security enabled with no policies. All access goes
through this app's own API, which does its own authorization; RLS with no
policies means Supabase's anon and publishable keys can reach none of it.

**Filesystem** (no `DATABASE_URL`) keeps everything in one JSON document plus a
blob directory, written atomically and serialised behind an in-process lock.
It exists so the app runs from a fresh clone with nothing to provision. It
assumes a single process with a persistent disk, and reports itself as
ephemeral on serverless hosts so the dashboard can warn rather than quietly
lose someone's work.

---

## Deploying

The app builds and runs anywhere Next.js does. Two environment variables decide
how much of it works:

| Set this | To get |
| --- | --- |
| nothing | The marketing site, all templates, the full editor, live preview, copy/download and the install guides. Sign-up returns a clear "not available" message. |
| `AUTH_SECRET` | Accounts, saved signatures, share links and image uploads. |
| `DATABASE_URL` | Data that actually persists. |

### Vercel

Import the repo and set both variables under Settings → Environment Variables:

- `AUTH_SECRET` — `openssl rand -hex 32`
- `DATABASE_URL` — a Postgres connection string. On Supabase take the
  **transaction pooler** URI (port 6543), which is built for serverless; the
  driver disables prepared statements and holds one connection per instance to
  suit it. TLS is required automatically for any non-local host.

Then redeploy. Without `DATABASE_URL` the app still runs, but Vercel's
filesystem is read-only apart from `/tmp`, so saved data disappears and the
dashboard says so.

---

## Payments

$10 per signature, paid once. Building, previewing and switching templates is
free; a credit is spent to unlock export — copy, download, share link and
vCard. Buying 5 within a rolling 12 months adds 10 more free, so an office
costs $50 rather than $150. The bonus is evaluated across the window, so five
separate purchases earn it exactly like one purchase of five, and it is granted
once per window.

Credits are an append-only ledger (`smartstamp.credit_ledger`) rather than a
balance column: the balance is `sum(delta)`, which cannot be corrupted by two
writes racing, and every movement stays auditable. Spending locks the user row
first, so two tabs cannot both spend the last credit.

Credits are granted **only** by the Stripe webhook, never by the browser
returning from checkout — a success URL can be replayed or forged. The handler
verifies Stripe's signature over the raw body and is idempotent on the checkout
session id, so a retried webhook grants nothing twice.

### Setting Stripe up

1. Copy your secret key into `STRIPE_SECRET_KEY`.
2. Add a webhook endpoint pointing at `https://your-domain/api/webhooks/stripe`,
   subscribed to `checkout.session.completed`. Put its signing secret into
   `STRIPE_WEBHOOK_SECRET`.
3. Set `BILLING_ENABLED=true` and redeploy.

There is no Stripe Product or Price to create: the line item is built from
`PRICE_PER_SIGNATURE_CENTS` at checkout, so the price on the page and the price
charged cannot drift apart.

---

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and serve |
| `npm run demo-assets` | Regenerates the committed demo images in `public/demo/` |

---

## Notes

- The 17 templates all read from the same document, so switching between them
  never loses anything.
- The disclaimer presets are drafting aids, not legal advice.
- Brand marks come from [Simple Icons](https://simpleicons.org) (CC0). A handful
  the project removed over trademark policy — LinkedIn among them — are drawn in
  `src/lib/icons.ts`; anything without an accurate mark falls back to a neutral
  glyph rather than a wrong one. Marks are used only to label links to those
  services.
