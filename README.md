# Business Destiny

Homepage for Tejas Parikh, Industrial & Business Astrology Consultant. Built with React, CSS and a JavaScript backend. Includes a Node.js + SQLite deployment and a Sites-hosted deployment using Cloudflare Workers, D1 and R2.

## Run the Node.js website

Requires Node.js 24 or newer.

```sh
npm install
npm run setup:admin
npm run dev:node
```

Open http://127.0.0.1:3000. Admin: http://127.0.0.1:3000/admin.

The initial account details are in the private `.credentials.txt` file. Change your password in **Account settings**. Passwords are hashed; session cookies are HttpOnly, SameSite=Strict, and Secure on HTTPS. The environment files and credentials are excluded from Git.

For a production Node build:

```sh
npm run build:node
npm run start:node
```

The Node server binds to 127.0.0.1. Use an HTTPS reverse proxy for public hosting, and preserve the original request origin. Keep `.env` private. The Node app uses `data/business-destiny.sqlite` and `data/media/`; back up the data directory while the app is stopped. Hosted Sites and the Node app have separate databases: content changes are not synchronized between them.

## Update the homepage

1. Sign in at `/admin`.
2. Choose **Brand, colours & settings**, or a homepage section.
3. Edit text, images, service cards, prices, FAQs, navigation and form labels. Upload PNG/JPEG/WebP images up to 5 MB.
4. Use arrows to move sections and items. Turn **Visible** off to hide a section. The hero and contact section remain required so the main navigation and enquiry buttons work.
5. Use **Add custom section** for another content block. Hide a custom block to remove it from the live page.
6. **Save draft**, then **Preview saved draft**. **Publish changes** updates the live homepage.

Theme settings include black background, sky blue, orange, corner roundness and standard/compact section spacing. This is a focused homepage CMS, not a full WordPress installation or an unrestricted visual page builder.

Consultation enquiries appear under **Consultation enquiries**. No email notification, confirmed calendar booking, or online payment is configured. Add the real email, telephone and WhatsApp number under Contact settings to display those contact options.

## Content and assets

The supplied Business_Destiny_HD_Logo.pdf is the current brand reference; its embedded HD logo is preserved in public/media/business-destiny-hd.png.

Content is adapted from the supplied Industrial Astrology PDF. The latest logo update sets the local site palette to navy, gold and white. The homepage structure and indicative package starting points were informed by https://sohinisastri.com and https://vaselvedic.com. Competitor credentials, testimonials and claims were not copied. The ₹1,100 and ₹11,000 prices are draft examples for owner confirmation, explicitly labelled indicative on the page.

The hero now uses a live Three.js astrology chakra with gold zodiac rings, a central Sun, eight planetary markers, drag-to-rotate controls and a pause option. It respects reduced-motion preferences and falls back to the supplied logo if WebGL is unavailable.

## Verification

```sh
node --test server/api.test.mjs
npx tsc --noEmit
npm run build:node
npm run build
```

The shared API is tested for authentication, CSRF rejection, draft isolation, publishing, content validation, enquiry storage, image type validation, password rotation, session revocation and rate limits.

## Sites build

`npm run build` creates the hosted Worker build. The schema is defined in `db/schema.ts`; Drizzle migrations are stored in `drizzle`. Node applies these migrations on startup; Sites applies them at deployment. The generated runtime configuration uses `DB` and `MEDIA` bindings. Set `ADMIN_USERNAME`, `ADMIN_SALT`, and `ADMIN_PASSWORD_HASH` as private runtime secrets before deploying. The hosted site is private to its owner until access is explicitly changed.

Only the homepage and admin are implemented in this phase. Additional public pages can be added after homepage review.


The app lint overrides allow native links/images for the shared standalone React and hosted frontend, dynamic JSON types inside the schema-validated editor, and ARIA live-region status elements.

The latest logo and 3D chakra revision is available on localhost for review; the previously published private website has not been redeployed.

## GitHub and Render

`render.yaml` defines a Node web service and a persistent 1 GB disk. This is a **paid** Render configuration; review the Render checkout estimate before creating it. The disk is needed for CMS edits, admin credentials, enquiries and uploaded images to survive restarts and deployments. Use only one instance with this SQLite configuration.

1. Push the source to a GitHub repository. A private repository is recommended; never upload `.env`, `.dev.vars`, `.credentials.txt`, `.render.env` or the `data` directory. They are ignored by Git.
2. In Render, connect that GitHub repository through **New → Blueprint**. Render reads `render.yaml`.
3. Set `ADMIN_USERNAME`, `ADMIN_SALT` and `ADMIN_PASSWORD_HASH` from the private local `.render.env` file. Do not put these values in the repository. These initialise the account; later password changes persist on the disk.
4. Review the service/disk costs, then deploy. The live admin address is the assigned Render URL followed by `/admin`.

Render supplies `PORT` and `RENDER_EXTERNAL_URL`. The server binds to `0.0.0.0`, uses the external HTTPS origin for cookies and request validation, and stores data under `DATA_DIR`. For a custom domain, set `PUBLIC_ORIGIN` to its exact HTTPS origin. Enable `TRUST_PROXY=1` only behind a trusted reverse proxy, as in this Blueprint.

A GitHub Actions workflow runs type checks, API tests and the Node build for pushes and pull requests. The existing localhost database is not automatically copied to Render; a fresh Render service starts with the current default homepage content.
