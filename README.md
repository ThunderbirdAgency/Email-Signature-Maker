# Signaturely

An email signature builder. Type in your details, pick a look, copy the result
into Gmail, Outlook, Apple Mail or anywhere else.

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
| `DATA_DIR` | no | Where accounts, signatures and uploads live. Defaults to `./.data`. |
| `BILLING_ENABLED` | no | `false` (default) makes every feature free for everyone. `true` turns the same feature list into a paywall. |

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
  store.ts             persistence (JSON document + blob directory)
  session.ts           cookie sessions
  guides.ts            per-client install instructions

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
than one the client claimed. Animated GIFs keep their animation. Each upload is
served from `/i/<id>` with a long immutable cache.

Because that URL has to be publicly fetchable for a signature to work, **anyone
holding the URL can view the image**. Uploads are unguessable but not private.

### Storage

`src/lib/store.ts` keeps everything in one JSON document plus a blob directory,
written atomically and serialised behind an in-process lock. That is a
deliberate choice for a service of this size: it makes the app runnable from a
fresh clone with no setup.

It assumes a single process with a persistent disk. Before running multiple
instances, or deploying somewhere with an ephemeral filesystem, reimplement that
one module against a real database and object store — every call site goes
through its interface, and nothing else needs to change.

---

## Deploying

The app builds and runs anywhere Next.js does. Two environment variables decide
how much of it works:

| Set this | To get |
| --- | --- |
| nothing | The marketing site, all templates, the full editor, live preview, copy/download and the install guides. Sign-up returns a clear "not available" message. |
| `AUTH_SECRET` | Accounts, saved signatures, share links and image uploads. |
| `DATA_DIR` | Durable storage. Without it on a serverless host, data goes to the temp directory and disappears — the dashboard says so. |

### Vercel

Import the repo, then add `AUTH_SECRET` (`openssl rand -hex 32`) under Settings →
Environment Variables and redeploy.

Vercel's filesystem is read-only apart from `/tmp`, so accounts and uploads work
but do not persist. For anything real, replace `src/lib/store.ts` with a database
and object-store implementation — every call site already goes through its
interface — or run the app on a host with a persistent disk and point `DATA_DIR`
at it.

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
