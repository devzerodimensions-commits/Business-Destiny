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

The brand display name is provisionally “Business Destiny”, based on the workspace name; the supplied logo filename says “Business Density”. The name is editable in the admin.

Content is adapted from the supplied Industrial Astrology PDF. Black, sky-blue and orange follow the user's request over the PDF's gold recommendation. The homepage structure and indicative package starting points were informed by https://sohinisastri.com and https://vaselvedic.com. Competitor credentials, testimonials and claims were not copied. The ₹1,100 and ₹11,000 prices are draft examples for owner confirmation, explicitly labelled indicative on the page.

The hero is original AI-generated, 3D-rendered sculpture artwork with subtle animation; it is not a live WebGL/GLB model or a photograph of Tejas Parikh. Replace it through the editor if desired. A founder portrait, verified biography/credentials, final prices and real contact details remain owner inputs. No unverified testimonials are published.

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
