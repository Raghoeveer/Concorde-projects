# Concorde Projects – channel-partner microsite

Static site (no framework). Layout modelled on sattvaprojects.in; facts from public Concorde/RERA disclosures, copy rewritten.

## Build
    node build.js          # outputs ./dist  (deploy this folder to Netlify / Vercel / any static host)
    cd dist && python3 -m http.server 8000   # local preview

## Edit
- `src/site.config.js` – domain, phone, WhatsApp, email, agent RERA no., form endpoint  (**fill the TODOs before launch**)
- `src/projects.js`   – all project content (add a new object = new page + card + sitemap entry)
- `src/assets/`       – CSS, JS, favicon. Placeholder SVG renders/floor plans are generated into `dist/assets/img/<slug>/`;
  to use real images, put them in `src/assets/img/<slug>/` with the same names (hero.svg → change extension in build.js if using .jpg/.webp).

## Leads
Forms post to Web3Forms using the same access keys as the Luxura Habitat project pages (`formKeys` in `src/site.config.js`),
so leads land in the same inbox. Subject line is tagged "Concorde Projects site" to tell them apart. On success the visitor
goes to `/thank-you/`; if JS fails the form falls back to a native POST with Web3Forms' redirect.

## Images
Real renders/floor plans are in `src/assets/img/{mayfair,neo,sienna}/` (a renamed subset of Luxura's images) and are wired up in
`projects.js → images`. The build fails loudly if a referenced image is missing.

## Adding a new project
1. Copy any project object in `src/projects.js` and edit it. `slug` must be `concorde-<name>` (it becomes the URL).
   `tags` (2–3 short highlights) appear as pills on the homepage card.
   `status` and `city` drive the homepage filter chips — reuse an existing value or add a new one (a new chip appears automatically).
2. Put its images in `src/assets/img/<name>/` (folder = slug without `concorde-`) and list them under `images`.
3. Optional: add `'concorde-<name>': '<web3forms key>'` to `formKeys` in `src/site.config.js` (otherwise the default key is used).
4. Run `node build.js`.

The new project then appears automatically in: the homepage "Explore Concorde Projects" list (card, search, filter counts), its own detail page,
"Other Concorde Projects" on every project page, the footer, the sitemap, and as a clickable name in "What Concorde Builds"
(if listed there in `src/home.js`). Order of cards = order in `projects.js`.
