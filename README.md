# EKPO

The website for EKPO, a magazine about Nigerian fashion, art and culture.

- **`web/`** is the public website, built with [Astro](https://astro.build) and hosted on Netlify. Every story, section, writer, video and product is pre-built as a real page, so link previews and search engines see the full content.
- **`studio/`** is the editing dashboard (Sanity Studio), hosted by Sanity at `https://<name>.sanity.studio`. This is where editors write and publish.
- **`seed/ekpo.ndjson`** holds the launch content (60 articles, sections, writers, videos, products, jobs, legal pages and settings), ready to import into Sanity.

When an editor publishes in the Studio, Sanity tells Netlify to rebuild the site. The change is live in about a minute.

## Running it locally

Needs Node 22.22 or newer.

```sh
cd web
npm install
npm run dev          # http://localhost:4321
```

Without a Sanity project ID, the site builds from `seed/ekpo.ndjson`, so it works before any accounts are set up. Forms are simulated on localhost; submissions are logged to the browser console.

```sh
cd studio
npm install
npm run dev          # http://localhost:3333 (needs a Sanity project, see below)
```

## First-time setup

### 1. Create the Sanity project

1. Sign in at [sanity.io/manage](https://www.sanity.io/manage) and create a project called **EKPO**. Copy its **project ID**.
2. Copy `studio/.env.example` to `studio/.env` and set `SANITY_STUDIO_PROJECT_ID`.
3. From `studio/`:
   ```sh
   npx sanity login
   npx sanity dataset create production --visibility public   # skip if the project already has it
   npm run import-seed                                        # loads all the launch content
   npm run deploy                                             # hosts the Studio; pick a name like "ekpo"
   ```
   `deploy` prints an app ID. Add it to `studio/sanity.cli.ts` as `deployment: {appId: '…', autoUpdates: true}` so future deploys go to the same address.
4. In sanity.io/manage → **API → CORS origins**, add `http://localhost:3333` (allow credentials) if you want to run the Studio locally.

`import-seed` only adds documents that don't exist yet, so running it again never overwrites editors' work.

### 2. Create the Netlify site

1. Push this repo to GitHub, then in Netlify choose **Add new site → Import an existing project** and pick the repo. `netlify.toml` already sets the build.
2. In **Site configuration → Environment variables**, add:
   - `SANITY_PROJECT_ID`: the project ID
   - `SANITY_DATASET`: `production`
   - `SITE_URL`: the public address, e.g. `https://ekpo.com.ng` (until a domain is connected, Netlify's own URL is used)
3. In **Forms**, turn on form detection, then redeploy. Netlify finds five forms: `newsletter`, `contact`, `careers`, `advertise` and `order`. Under **Forms → Notifications**, add email notifications so new orders and messages reach the team.

### 3. Publish = rebuild

1. In Netlify: **Site configuration → Build & deploy → Build hooks → Add build hook** (name it "Sanity"). Copy the URL.
2. In sanity.io/manage → **API → Webhooks → Create webhook**: paste the URL, dataset `production`, trigger on create, update and delete, method `POST`.

## Editing content

In the Studio:

| To change… | Go to |
| --- | --- |
| The homepage slider | **Homepage** |
| Emails, address, social links, delivery prices, footer and newsletter text | **Site settings** |
| About, Services, Advertise, Contact and Careers pages (including the contact topics and advertising form choices) | **Site pages** |
| Privacy policy, terms of use | **Site pages → Privacy, terms and other text pages** |
| Stories | **Articles** (browse all, by section or by writer) |
| Sections and their topics (sub-sections) | **Sections**, **Topics** |
| Writer bios and photos | **Writers** |
| Videos (add a YouTube ID or .mp4 link) | **Videos** |
| Shop items, prices, sizes, stock | **Shop products** |
| Job listings (switch off "Accepting applications" to hide one) | **Jobs** |

Anything without a photo shows EKPO's placeholder artwork, so the site never has empty boxes. Page layouts, form field labels and button wording on forms live in the code (`web/src/`); all other words come from Sanity.

## What isn't automated yet

- **Payments.** Checkout records the order (Netlify Forms → `order`). The team then emails bank details or collects payment on delivery. Card payments need a provider such as Paystack.
- **Newsletter sending.** Sign-ups are collected in Netlify Forms (`newsletter`). Export them to an email service (Mailchimp, Kit, etc.) or connect one directly.
- **Draft previews.** Editors see changes after publishing. Live preview of drafts can be added with Sanity's Presentation tool.

## Handing over to the client

1. **Sanity:** in sanity.io/manage → project → **Settings**, transfer the project to the client's organisation. Invite their editors under **Members**. The hosted Studio moves with the project.
2. **Netlify:** transfer the site to the client's team (**Site configuration → General → Transfer site**), or rebuild it in their account from step 2 above.
3. **GitHub:** transfer the repository to the client's account or organisation and reconnect it in Netlify if needed.
4. **Domain:** add the domain in Netlify (**Domain management**), then update `SITE_URL`.
5. Check the build hook and webhook still point at the right site after the transfers.

## Project layout

```
web/
  src/lib/data.ts          the one Sanity query for the whole site, plus URL helpers
  src/lib/sanity.ts        Sanity client (falls back to the seed file without a project ID)
  src/lib/portableText.ts  renders rich text from Sanity
  src/pages/               one file per route; [section]/[slug].astro is the article page
  src/scripts/             browser code: menus, search, cart, forms
  src/styles/site.css      all styles
studio/
  schemaTypes/             content types (articles, sections, writers, shop, jobs, site pages, settings, homepage)
  sanity.config.ts         Studio layout and singleton rules
seed/ekpo.ndjson           launch content for `npm run import-seed`
```
