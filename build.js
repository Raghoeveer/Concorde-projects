#!/usr/bin/env node
// Static site generator for Concorde Projects.
// Usage:  node build.js        → writes the site into ./dist
const fs = require('fs');
const path = require('path');
const site = require('./src/site.config');
const projects = require('./src/projects');

const OUT = path.join(__dirname, 'dist');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const write = (rel, content) => {
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
};
const copyDir = (src, dst) => {
  fs.mkdirSync(dst, { recursive: true });
  for (const f of fs.readdirSync(src)) {
    const s = path.join(src, f), d = path.join(dst, f);
    fs.statSync(s).isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
};

fs.rmSync(OUT, { recursive: true, force: true });
copyDir(path.join(__dirname, 'src/assets'), path.join(OUT, 'assets'));

// Inject runtime config for the browser script
write('assets/js/config.js', `window.SITE=${JSON.stringify({
  phone: site.phone, whatsapp: site.whatsapp, formEndpoint: site.formEndpoint, siteName: site.siteName,
})};`);
const thankYouUrl = (depth) => `${'../'.repeat(depth)}thank-you/`;

// ───────────────────────── Imagery ─────────────────────────
// Real images live in src/assets/img/<dir>/ and are referenced from projects.js → images.
const imgDir = (p) => p.slug.replace('concorde-', '');
const img = (p, file, depth) => `${'../'.repeat(depth)}assets/img/${imgDir(p)}/${file}`;
for (const p of projects) {
  const all = [p.images.hero[0], p.images.overview[0], ...p.images.gallery.map((g) => g[0]), ...p.images.plans, p.images.master, p.images.map];
  for (const f of all) if (!fs.existsSync(path.join(__dirname, 'src/assets/img', imgDir(p), f))) throw new Error(`Missing image ${imgDir(p)}/${f}`);
}
// ───────────────────────── Icons ─────────────────────────
const I = {
  pool: '<path d="M2 18c2 0 2-1.5 4-1.5S8 18 10 18s2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5M8 15V5a2 2 0 0 1 4 0M16 15V5a2 2 0 0 0-4 0M8 9h8M8 12h8"/>',
  gym: '<path d="M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12"/>',
  party: '<path d="M8 22h8M12 15v7M5 3h14l-7 12z"/>',
  yoga: '<circle cx="12" cy="4" r="2"/><path d="M12 6v7M5 10l7 3 7-3M8 21l4-8 4 8"/>',
  lawn: '<path d="M3 21h18M6 21v-5M10 21v-8M14 21v-6M18 21v-9"/>',
  cafe: '<path d="M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM17 10h2a2 2 0 0 1 0 4h-2M8 2v3M12 2v3"/>',
  work: '<rect x="3" y="5" width="18" height="12" rx="1"/><path d="M2 20h20M9 17v3M15 17v3"/>',
  ball: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  kids: '<circle cx="12" cy="5" r="2"/><path d="M5 21l3-9h8l3 9M12 7v5M8 12l-3-3M16 12l3-3"/>',
  theatre: '<path d="M2 20h20M4 20V10l8-6 8 6v10M9 20v-5h6v5"/>',
  bbq: '<path d="M4 10h16a8 8 0 0 1-16 0zM8 22l2-4M16 22l-2-4M9 3c0 2 2 2 2 4M14 3c0 2 2 2 2 4"/>',
  walk: '<circle cx="13" cy="4" r="2"/><path d="M10 22l2-7-3-3 1-5 4 3 3 1M12 15l3 7"/>',
  ev: '<path d="M13 2L5 14h6l-1 8 8-12h-6z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
  shield: '<path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z"/><path d="M9 12l2 2 4-4"/>',
  pet: '<circle cx="5" cy="10" r="2"/><circle cx="9" cy="5" r="2"/><circle cx="15" cy="5" r="2"/><circle cx="19" cy="10" r="2"/><path d="M8 18a4 4 0 0 1 8 0c0 2-2 3-4 3s-4-1-4-3z"/>',
  garden: '<path d="M12 22V10M12 10c-4 0-6-3-6-7 4 0 6 3 6 7zM12 14c4 0 6-3 6-7-4 0-6 3-6 7z"/>',
  car: '<path d="M3 13l2-6h14l2 6v5H3zM3 13h18"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
  senior: '<circle cx="10" cy="4" r="2"/><path d="M10 6v8l-3 7M10 14l3 7M7 9l3 1 3-1M17 10v11"/>',
  spa: '<path d="M12 22c-5 0-8-4-8-8 3 0 6 2 8 5 2-3 5-5 8-5 0 4-3 8-8 8zM12 19c-2-3-2-9 0-15 2 6 2 12 0 15z"/>',
  climb: '<path d="M3 21L12 3l9 18zM9 15h.01M13 11h.01M14 17h.01"/>',
  cycle: '<circle cx="6" cy="16" r="4"/><circle cx="18" cy="16" r="4"/><path d="M6 16l4-8h5l3 8M10 8l2 8"/>',
  games: '<rect x="2" y="7" width="20" height="10" rx="5"/><path d="M7 10v4M5 12h4M15 11h.01M18 13h.01"/>',
};
const iconMap = { football: 'ball', basketball: 'ball', tennis: 'ball', golf: 'ball', cricket: 'ball', badminton: 'ball', skate: 'walk', seat: 'lawn' };
const icon = (k) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[iconMap[k] || k] || I.shield}</svg>`;

// ───────────────────────── Shared layout ─────────────────────────
const asset = (depth, p) => `${'../'.repeat(depth)}assets/${p}`;
const link = (depth, slug) => `${'../'.repeat(depth)}${slug ? slug + '/' : ''}` || './';

function head({ title, desc, canonical, depth, image, jsonld = [] }) {
  return `<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canonical}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(site.siteName)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${site.domain}/assets/${image}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#14213d">
<link rel="icon" href="${asset(depth, 'img/favicon.svg')}" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${asset(depth, 'css/style.css')}">
${site.gaId ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${site.gaId}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${site.gaId}');</script>` : ''}
${jsonld.map((j) => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join('\n')}
</head>
<body>`;
}

function header(depth, subnav = '', onProjectPage = false) {
  return `<header class="site-header">
  <div class="wrap header-row">
    <a class="logo" href="${onProjectPage ? '#top' : link(depth)}"${onProjectPage ? ' data-scroll-top' : ''} aria-label="${onProjectPage ? 'Back to top' : `${esc(site.siteName)} home`}">
      <img class="logo-img" src="${asset(depth, 'img/concorde-logo.svg')}" alt="Concorde" width="198" height="24"><span class="logo-sep" aria-hidden="true"></span><span class="logo-text">Projects</span>
    </a>
    <a class="btn btn-gold btn-call" href="tel:${site.phone}">${icon('phone')}<span>Call for Assistance</span></a>
  </div>
  ${subnav}
</header>`;
}

function enquiryForm(id, p, depth, cta = 'Submit Enquiry') {
  const name = p ? p.name : 'Concorde Projects (General)';
  const key = (p && site.formKeys[p.slug]) || site.formKeys.default;
  const opts = p ? [...new Set(p.configs.map((c) => c.type.split(' (')[0]))] : ['2 BHK', '3 BHK'];
  return `<form class="lead-form" action="${site.formEndpoint}" method="POST" data-thanks="${thankYouUrl(depth)}">
    <input type="hidden" name="access_key" value="${key}">
    <input type="hidden" name="subject" value="New Lead: ${esc(name)} – Concorde Projects site">
    <input type="hidden" name="from_name" value="${esc(site.siteName)}">
    <input type="hidden" name="redirect" value="${site.domain}/thank-you/">
    <input type="hidden" name="project" value="${esc(name)}">
    <input type="hidden" name="intent" value="">
    <input type="checkbox" name="botcheck" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
    <label class="sr" for="${id}-n">Name</label><input id="${id}-n" name="name" placeholder="Your Name*" required autocomplete="name">
    <label class="sr" for="${id}-e">Email</label><input id="${id}-e" name="email" type="email" placeholder="Email Address*" required autocomplete="email">
    <label class="sr" for="${id}-p">Phone</label><input id="${id}-p" name="phone" type="tel" placeholder="+91 XXXXX XXXXX*" required autocomplete="tel">
    <label class="sr" for="${id}-r">Preferred configuration</label>
    <select id="${id}-r" name="configuration"><option value="">Preferred configuration</option>${opts.map((o) => `<option>${esc(o)}</option>`).join('')}<option>Site Visit</option></select>
    <label class="consent"><input type="checkbox" name="consent" value="yes" checked required> I authorise ${esc(site.siteName)} representatives to Call, WhatsApp or Email me about this project and offers.</label>
    <button class="btn btn-gold btn-block" type="submit">${cta}</button>
    <p class="form-msg" role="status" aria-live="polite"></p>
  </form>`;
}

function footer(depth, p = null) {
  return `<footer class="site-footer">
  <div class="wrap footer-grid">
    <div>
      <a class="logo logo-light" href="${p ? '#top' : link(depth)}"${p ? ' data-scroll-top' : ''} aria-label="${p ? 'Back to top' : `${esc(site.siteName)} home`}"><img class="logo-img" src="${asset(depth, 'img/concorde-logo.svg')}" alt="Concorde" width="198" height="24" loading="lazy"><span class="logo-sep" aria-hidden="true"></span><span class="logo-text">Projects</span></a>
      <p>Your single window for every Concorde Group residence in Bengaluru — verified project facts, live inventory, site visits and home-loan support, free of charge.</p>
    </div>
    <div><h3>Projects</h3><ul>${projects.map((p) => `<li><a href="${link(depth, p.slug)}">${esc(p.name)}, ${esc(p.locality)}</a></li>`).join('')}</ul></div>
    <div><h3>Contact</h3><ul>
      <li><a href="tel:${site.phone}">${esc(site.phoneDisplay)}</a></li>
      <li><a href="mailto:${site.email}">${esc(site.email)}</a></li>
      <li><a href="https://wa.me/${site.whatsapp}" target="_blank" rel="noopener">WhatsApp: chat with us</a></li>
      <li>${esc(site.officeAddress)}</li>
      <li><a href="${link(depth, 'privacy-policy')}">Privacy Policy</a></li>
    </ul></div>
  </div>
  <div class="wrap disclaimer">
    <p><strong>Disclaimer &amp; Channel Partner Disclosure:</strong> This website is maintained by an Authorised Channel Partner / RERA Authorised Advertiser (${esc(site.partnerName)} | Tamil Nadu: ${esc(site.agentReraTN)} | Karnataka: ${esc(site.agentReraKA)}) for marketing and lead-generation purposes. It is <strong>NOT the official website of the developer</strong>. Content is for information only and does not constitute an offer or guarantee. Prices are subject to change without notice and properties are subject to availability. Images are artist’s impressions for representation only. Please verify all details with the developer and on rera.karnataka.gov.in before making a purchase decision.</p>
    ${p ? `<p>This project is registered under the Real Estate (Regulation and Development) Act, 2016 · RERA Project Registration No: ${esc(p.rera)} · Site: ${esc(p.locality)}, ${esc(p.city)}</p>` : ''}
    <p>${site.brandLine ? `${esc(site.brandLine)} · ` : ''}© ${site.year} ${esc(site.siteName)}. All rights reserved.</p>
  </div>
</footer>

<div class="mobile-bar" aria-label="Quick actions">
  <a href="tel:${site.phone}">Call</a>
  <a href="https://wa.me/${site.whatsapp}" target="_blank" rel="noopener">WhatsApp</a>
  <button type="button" data-modal="Get Best Price">Enquire</button>
</div>
<a class="wa-float" href="https://wa.me/${site.whatsapp}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.6 14.1c-.2.7-1.4 1.3-2 1.4-.5.1-1.2.1-1.9-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5.1-4.5-.1-.2-1.2-1.6-1.2-3.1s.8-2.2 1-2.5c.3-.3.6-.4.8-.4h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.3 0 .5l-.3.5-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l2 1c.3.1.5.2.5.3.1.1.1.7-.1 1.3z"/></svg></a>

<div class="modal" id="lead-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" hidden>
  <div class="modal-box">
    <button class="modal-close" type="button" aria-label="Close">×</button>
    <p class="modal-kicker">100% Free Assistance</p>
    <h2 id="modal-title">Get Best Price</h2>
    <p class="modal-sub">Share your details — our relationship manager will call you back within 30 minutes.</p>
    ${enquiryForm('m', p, depth)}
    <ul class="modal-usps"><li>Best price guarantee</li><li>Free site-visit pickup</li><li>Home-loan assistance</li></ul>
  </div>
</div>
<script src="${asset(depth, 'js/config.js')}"></script>
${site.zendeskKey ? `<!-- Zendesk Widget -->
<script>
window.zESettings={webWidget:{offset:{mobile:{vertical:'70px'}},launcher:{chatLabel:{'*':'Chat Now'},label:{'*':'Chat Now'}}}};
window.addEventListener('load',function(){var s=document.createElement('script');s.id='ze-snippet';s.async=true;s.src='https://static.zdassets.com/ekr/snippet.js?key=${site.zendeskKey}';document.body.appendChild(s);});
</script>` : ''}
<script src="${asset(depth, 'js/main.js')}" defer></script>
</body></html>`;
}

const projStat = (p, key) => (p.keyFacts.find((k) => k[0] === key) || [, ''])[1];

// ───────────────────────── Project cards (data-driven) ─────────────────────────
// Every object in src/projects.js becomes a card; filters are built from the data,
// so adding a project needs no template changes.
const uniq = (arr) => [...new Set(arr.filter(Boolean))];
function projectCard(p) {
  const units = projStat(p, 'Total Homes');
  const wa = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(`Hello, I'm interested in ${p.name}. Please share more details.`)}`;
  const search = [p.name, p.locality, p.city, p.status, ...(p.tags || [])].join(' ').toLowerCase();
  return `
    <article class="pc" data-status="${esc(p.status)}" data-region="${esc(p.city)}" data-search="${esc(search)}">
      <div class="pc-img">
        <img src="${img(p, p.images.hero[0], 0)}" alt="${esc(p.images.hero[1])}" loading="lazy" width="520" height="440">
        <span class="pc-badge">${esc(p.badge)}</span>
        <span class="pc-status">${esc(p.status)}</span>
      </div>
      <div class="pc-body">
        <div>
          <p class="pc-dev">Concorde Group</p>
          <h3 class="pc-title"><a href="${p.slug}/" class="pc-link">${esc(p.name)}</a></h3>
          <p class="pc-loc">${icon('walk')}${esc(p.locality)}, ${esc(p.city)}</p>
        </div>
        <div class="pc-specs">
          <div class="spec"><b>${esc(projStat(p, 'Configurations'))}</b><span>Config</span></div>
          <div class="spec"><b>${esc(p.priceFrom.replace('*', ''))}*</b><span>${esc(p.priceNote)}</span></div>
          ${units ? `<div class="spec"><b>${esc(units)} Units</b><span>Total</span></div>` : ''}
        </div>
        ${(p.tags || []).length ? `<div class="pc-tags">${p.tags.map((t) => `<span>${esc(t)}</span>`).join('')}</div>` : ''}
        <div class="pc-actions">
          <a class="btn btn-dark" href="${p.slug}/">View Details</a>
          <a class="btn btn-wa" href="${wa}" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.6 14.1c-.2.7-1.4 1.3-2 1.4-.5.1-1.2.1-1.9-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5.1-4.5-.1-.2-1.2-1.6-1.2-3.1s.8-2.2 1-2.5c.3-.3.6-.4.8-.4h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.3 0 .5l-.3.5-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l2 1c.3.1.5.2.5.3.1.1.1.7-.1 1.3z"/></svg>Enquire</a>
        </div>
      </div>
    </article>`;
}
function filterBar() {
  const count = (key, v) => projects.filter((p) => (key === 'status' ? p.status : p.city) === v).length;
  const row = (key, label, values) => values.length < 2 ? '' : `
      <div class="f-row"><span class="f-label">${label}</span><div class="chips" data-filter-group="${key}">
        <button class="chip is-on" data-value="all" type="button">All <small>${projects.length}</small></button>
        ${values.map((v) => `<button class="chip" data-value="${esc(v)}" type="button">${esc(v)} <small>${count(key, v)}</small></button>`).join('')}
      </div></div>`;
  return `<div class="f-panel">
      <label class="f-search">${icon('search')}<span class="sr">Search projects</span>
        <input type="search" id="p-search" placeholder="Search by project, location or feature" autocomplete="off"></label>
      ${row('region', 'Location', uniq(projects.map((p) => p.city)))}${row('status', 'Status', uniq(projects.map((p) => p.status)))}
    </div>`;
}

// ───────────────────────── Homepage (general Concorde) ─────────────────────────
const home = require('./src/home');
function homePage() {
  const pageFor = (name) => projects.find((p) => p.name.toLowerCase() === name.toLowerCase());
  const projLink = (name) => { const p = pageFor(name); return p ? `<a href="${p.slug}/">${esc(name)}</a>` : `<span>${esc(name)}</span>`; };
  const jsonld = [
    { '@context': 'https://schema.org', '@type': 'RealEstateAgent', name: site.siteName, url: `${site.domain}/`, telephone: site.phone, email: site.email,
      address: { '@type': 'PostalAddress', addressLocality: 'Bengaluru', addressRegion: 'KA', addressCountry: 'IN' }, areaServed: 'Bengaluru' },
    { '@context': 'https://schema.org', '@type': 'Organization', name: 'Concorde Group', foundingDate: '1998',
      founder: home.leaders.filter((l) => l[1] === 'Founder').map(([n]) => ({ '@type': 'Person', name: n })),
      address: { '@type': 'PostalAddress', addressLocality: 'Bengaluru', addressRegion: 'KA', addressCountry: 'IN' } },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: home.faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
  ];
  const body = `${header(0)}
<main>
  <section class="home-hero">
    <div class="wrap hero-grid">
      <div class="hero-copy">
        <p class="kicker">Concorde Group · Bengaluru</p>
        <h1>${esc(home.h1)}</h1>
        <p class="lead">${esc(home.lead)}</p>
        <ul class="hero-stats">${home.stats.map(([b, t]) => `<li><b>${esc(b)}</b><span>${esc(t)}</span></li>`).join('')}</ul>
      </div>
      <div class="hero-form card">
        <h2>Find Your Concorde Home</h2>
        <p>Tell us what you’re looking for — we’ll share matching Concorde options and offers.</p>
        ${enquiryForm('h', null, 0, 'Get a Call Back')}
      </div>
    </div>
  </section>

  <section class="section alt" id="projects">
    <div class="wrap pc-wrap">
      <p class="kicker">Concorde Portfolio</p>
      <h2>Explore Concorde Projects</h2>
      ${filterBar()}
      <p class="pc-count" aria-live="polite">Showing all <b>${projects.length}</b> projects</p>
      <div class="pc-list">${projects.map(projectCard).join('')}</div>
      <p class="no-match" hidden>No projects match your search right now. <button class="link-btn" type="button" data-modal="Notify Me of New Concorde Launches">Get notified of new launches</button></p>
    </div>
  </section>

  <section class="section" id="about">
    <div class="wrap two-col">
      <div>
        <p class="kicker">About Concorde</p>
        <h2>A Bengaluru Developer Built on “Experiences for Life”</h2>
        ${home.about.map((t) => `<p>${esc(t)}</p>`).join('')}
      </div>
      <div class="mv">
        <div class="mv-card"><span>Mission</span><p>${esc(home.mission)}</p></div>
        <div class="mv-card"><span>Vision</span><p>${esc(home.vision)}</p></div>
        <p class="kicker mt">Legacy communities</p>
        <ul class="pill-list">${home.legacy.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>
      </div>
    </div>
  </section>

  <section class="section alt">
    <div class="wrap">
      <h2>The Values Behind Every Concorde Home</h2>
      <ul class="usp-grid usp-4">${home.values.map(([t, d], i) => `<li>${icon(['senior', 'shield', 'ev', 'garden'][i])}<b>${esc(t)}</b><span>${esc(d)}</span></li>`).join('')}</ul>
    </div>
  </section>

  <section class="section" id="portfolio">
    <div class="wrap">
      <h2>What Concorde Builds</h2>
      <div class="type-grid">${home.types.map(([ic, t, d, list]) => `<article class="type-card">${icon(ic)}<h3>${esc(t)}</h3><p>${esc(d)}</p><ul class="pill-list">${list.map((n) => `<li>${projLink(n)}</li>`).join('')}</ul></article>`).join('')}</div>
      <p class="footnote">Project availability changes often. Enquire for the latest launches, prices and RERA details.</p>
    </div>
  </section>

  <section class="section alt" id="locations">
    <div class="wrap">
      <h2>Where You’ll Find Concorde Projects</h2>
      <div class="region-grid">${home.regions.map(([r, list]) => `<div class="region"><h3>${esc(r)}</h3><ul class="pill-list">${list.map((n) => `<li>${esc(n)}</li>`).join('')}</ul></div>`).join('')}</div>
    </div>
  </section>

  <section class="section" id="awards">
    <div class="wrap">
      <h2>Recognition &amp; Awards</h2>
      <ul class="award-list">${home.awards.map(([y, t, d]) => `<li><span class="yr">${esc(y)}</span><div><b>${esc(t)}</b><small>${esc(d)}</small></div></li>`).join('')}</ul>
    </div>
  </section>

  <section class="section alt">
    <div class="wrap two-col">
      <div>
        <p class="kicker">Why Concorde Projects</p>
        <h2>Buy Your Concorde Home with an Expert Beside You</h2>
        <p>We track every Concorde launch so you don’t have to: current price sheets, unit availability, RERA status and the offers running this month — explained plainly, with no charge to you.</p>
        <button class="btn btn-gold" type="button" data-modal="Talk to a Concorde Expert">Talk to an Expert</button>
      </div>
      <ul class="usp-grid">
        <li>${icon('shield')}<b>RERA-verified listings</b><span>Every project with its registration number</span></li>
        <li>${icon('car')}<b>Free site visits</b><span>Pick-up &amp; drop on your schedule</span></li>
        <li>${icon('work')}<b>Loan assistance</b><span>Pre-approved offers from top lenders</span></li>
        <li>${icon('party')}<b>Best price</b><span>Launch &amp; early-bird offers first</span></li>
      </ul>
    </div>
  </section>

  <section class="section" id="faq">
    <div class="wrap narrow">
      <h2>About Concorde — Frequently Asked Questions</h2>
      <div class="faq">${home.faqs.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>
    </div>
  </section>
</main>
${footer(0)}`;
  write('index.html', head({
    title: home.seoTitle, desc: home.metaDesc, canonical: `${site.domain}/`, depth: 0,
    image: `img/${imgDir(projects[0])}/${projects[0].images.hero[0]}`, jsonld,
  }) + body);
}

// ───────────────────────── Project page ─────────────────────────
function projectPage(p) {
  const url = `${site.domain}/${p.slug}/`;
  const others = projects.filter((o) => o.slug !== p.slug);
  const jsonld = [
    { '@context': 'https://schema.org', '@type': 'ApartmentComplex', name: p.name, description: p.metaDesc, url,
      image: [p.images.hero[0], p.images.overview[0], ...p.images.gallery.map((g) => g[0])].map((f) => `${site.domain}/assets/img/${imgDir(p)}/${f}`),
      address: { '@type': 'PostalAddress', streetAddress: p.locality, addressLocality: 'Bengaluru', postalCode: p.pin, addressRegion: 'KA', addressCountry: 'IN' },
      numberOfAccommodationUnits: parseInt(projStat(p, 'Total Homes').replace(/\D/g, ''), 10),
      amenityFeature: p.amenities.map(([, n]) => ({ '@type': 'LocationFeatureSpecification', name: n, value: true })) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Concorde Projects', item: `${site.domain}/` },
      { '@type': 'ListItem', position: 2, name: p.name, item: url }] },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: p.faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
  ];
  const subnav = `<nav class="subnav" aria-label="On this page"><div class="wrap subnav-row">
    ${[['overview', 'Overview'], ['highlights', 'Highlights'], ['price', 'Price'], ['floor-plan', 'Floor Plan'], ['amenities', 'Amenities'], ['location', 'Location'], ['gallery', 'Gallery'], ['faq', 'FAQ']].map(([id, t]) => `<a href="#${id}">${t}</a>`).join('')}
    <button class="btn btn-gold btn-sm" type="button" data-modal="Download Brochure" data-project="${esc(p.name)}">Download Brochure</button>
  </div></nav>`;
  const body = `${header(1, subnav, true)}
<main>
  <section class="p-hero" style="background-image:url('${img(p, p.images.hero[0], 1)}')">
    <div class="wrap p-hero-grid">
      <div class="p-hero-copy">
        <nav class="crumbs" aria-label="Breadcrumb"><a href="../">Concorde Projects</a> › <span>${esc(p.name)}</span></nav>
        <span class="tag tag-inline">${esc(p.badge)} · ${esc(p.status)}</span>
        <h1>${esc(p.h1)}</h1>
        <p class="p-hero-loc">${icon('walk')}${esc(p.locality)}, ${esc(p.city)} – ${esc(p.pin)}</p>
        <p class="p-hero-price">${esc(p.configs.map((c) => c.type.split(' ·')[0]).filter((v, i, a) => a.indexOf(v) === i).join(' & '))} Apartments · from <b>${esc(p.priceFrom)}</b></p>
        <p class="offer-strip">${esc(p.offer)}</p>
        <div class="p-hero-cta">
          <button class="btn btn-gold" type="button" data-modal="Get Pricing & Offers" data-project="${esc(p.name)}">Get Pricing &amp; Offers</button>
          <button class="btn btn-ghost" type="button" data-modal="Download Brochure" data-project="${esc(p.name)}">Download Brochure</button>
        </div>
      </div>
      <div class="hero-form card">
        <h2>Enquire about ${esc(p.name)}</h2>
        <p>Instant call-back with latest price sheet.</p>
        ${enquiryForm('h', p, 1, 'Get Details Now')}
      </div>
    </div>
  </section>

  <section class="section" id="overview">
    <div class="wrap two-col">
      <div>
        <p class="kicker">Project Overview</p>
        <h2>About ${esc(p.name)}</h2>
        ${p.overview.map((t) => `<p>${esc(t)}</p>`).join('')}
        <p class="rera-box"><b>K-RERA:</b> ${esc(p.rera)}<br><small>${esc(p.reraNote)}. Verify at rera.karnataka.gov.in</small></p>
      </div>
      <figure class="overview-img"><img src="${img(p, p.images.overview[0], 1)}" alt="${esc(p.images.overview[1])}" loading="lazy" width="1200" height="750"><figcaption>Artistic impression</figcaption></figure>
    </div>
  </section>

  <section class="section alt" id="highlights">
    <div class="wrap">
      <h2>${esc(p.name)} at a Glance</h2>
      <ul class="facts">${p.keyFacts.map(([k, v]) => `<li><span>${esc(k)}</span><b>${esc(v)}</b></li>`).join('')}
        <li><span>Clubhouse</span><b>${esc(p.clubhouse.name)}</b></li><li><span>Club Size</span><b>${esc(p.clubhouse.size)}</b></li></ul>
    </div>
  </section>

  <section class="section" id="price">
    <div class="wrap">
      <h2>${esc(p.name)} Price List &amp; Configurations</h2>
      <div class="table-scroll"><table class="price-table">
        <thead><tr><th>Unit Type</th><th>Super Built-Up</th><th>Carpet</th>${p.configs[0].homes ? '<th>Homes</th>' : ''}${p.configs[0].rate ? '<th>Rate / sq ft (SBA / carpet)</th>' : ''}<th>Price*</th><th></th></tr></thead>
        <tbody>${p.configs.map((c) => `<tr><td><b>${esc(c.type)}</b></td><td>${esc(c.sba)}</td><td>${esc(c.carpet)}</td>${c.homes ? `<td>${esc(c.homes)}</td>` : ''}${c.rate ? `<td>${esc(c.rate)}</td>` : ''}<td class="price">${esc(c.price)}</td><td><button class="btn btn-gold btn-sm" type="button" data-modal="Price Breakup – ${esc(c.type)}" data-project="${esc(p.name)}">Enquire Now</button></td></tr>`).join('')}</tbody>
      </table></div>
      <p class="footnote">* ${esc(p.priceFootnote)}</p>
      <button class="btn btn-dark" type="button" data-modal="Complete Costing Details" data-project="${esc(p.name)}">Get Complete Costing Sheet</button>
    </div>
  </section>

  <section class="section alt" id="floor-plan">
    <div class="wrap">
      <h2>${esc(p.name)} Floor Plans &amp; Master Plan</h2>
      <div class="plan-grid">
        ${p.floorPlans.map((fp, i) => `<button class="plan" type="button" data-modal="Floor Plan – ${esc(fp.label)}" data-project="${esc(p.name)}">
          <img src="${img(p, p.images.plans[i], 1)}" alt="${esc(p.name)} ${esc(fp.label)} floor plan" loading="lazy" width="600" height="470">
          <span class="plan-lock">View Floor Plan</span>
          <span class="plan-cap"><b>${esc(fp.label)}</b><small>${esc(fp.note)}</small></span></button>`).join('')}
        <button class="plan plan-wide" type="button" data-modal="Master Plan" data-project="${esc(p.name)}">
          <img src="${img(p, p.images.master, 1)}" alt="${esc(p.name)} master plan" loading="lazy" width="1200" height="750">
          <span class="plan-lock">View Master Plan</span><span class="plan-cap"><b>Master Plan</b><small>Site layout &amp; tower placement</small></span></button>
      </div>
      <button class="btn btn-dark" type="button" data-modal="Download All Floor Plans" data-project="${esc(p.name)}">Download All Floor Plans</button>
    </div>
  </section>

  <section class="section" id="amenities">
    <div class="wrap">
      <h2>Amenities at ${esc(p.name)}</h2>
      <p class="lead-sm"><b>${esc(p.clubhouse.name)}</b> — ${esc(p.clubhouse.size)}, ${esc(p.clubhouse.where)}.</p>
      <ul class="amen-grid">${p.amenities.map(([k, n]) => `<li>${icon(k)}<span>${esc(n)}</span></li>`).join('')}</ul>
      <h3 class="mt">Specifications</h3>
      <div class="faq specs">${p.specs.map(([k, v]) => `<details><summary>${esc(k)}</summary><p>${esc(v)}</p></details>`).join('')}</div>
    </div>
  </section>

  <section class="section alt" id="location">
    <div class="wrap">
      <h2>${esc(p.name)} Location Advantages</h2>
      <div class="loc-grid">
        <figure class="map"><img src="${img(p, p.images.map, 1)}" alt="${esc(p.name)} location map, ${esc(p.locality)}" loading="lazy" width="1200" height="800">
          <figcaption><a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.location.mapQuery)}" target="_blank" rel="noopener">Open in Google Maps ↗</a></figcaption></figure>
        <div class="loc-tabs">
          <div class="tabs" role="tablist">${p.location.groups.map((g, i) => `<button role="tab" type="button" class="tab${i ? '' : ' is-on'}" data-tab="${i}" aria-selected="${!i}">${esc(g.title)}</button>`).join('')}</div>
          ${p.location.groups.map((g, i) => `<ul class="tab-panel"${i ? ' hidden' : ''} data-panel="${i}">${g.items.map(([n, d]) => `<li><span>${esc(n)}</span><b>${esc(d)}</b></li>`).join('')}</ul>`).join('')}
          <button class="btn btn-outline" type="button" data-modal="Location Map" data-project="${esc(p.name)}">Know Your Neighbourhood</button>
        </div>
      </div>
      <p class="footnote">Distances and travel times are approximate and depend on route and traffic.</p>
    </div>
  </section>

  <section class="section" id="gallery">
    <div class="wrap">
      <h2>${esc(p.name)} Gallery</h2>
      <div class="gallery">${((g) => g.slice(0, Math.floor(g.length / 3) * 3))([p.images.hero, p.images.overview, ...p.images.gallery]).map(([f, alt]) => `<a href="${img(p, f, 1)}" class="g-item" data-lightbox><img src="${img(p, f, 1)}" alt="${esc(alt)}" loading="lazy" width="1200" height="750"></a>`).join('')}</div>
      <p class="footnote">Images are artistic impressions for representation only.</p>
    </div>
  </section>

  <section class="vt-band">
    <div class="wrap vt-row">
      <div><h2>Can’t visit right now?</h2><p>Book a live virtual site visit of ${esc(p.name)} with our expert — from anywhere in the world.</p></div>
      <button class="btn btn-gold" type="button" data-modal="Virtual Site Visit" data-project="${esc(p.name)}">Request Virtual Tour</button>
    </div>
  </section>

  <section class="section" id="faq">
    <div class="wrap narrow">
      <h2>${esc(p.name)} — Buyer FAQs</h2>
      <div class="faq">${p.faqs.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>
    </div>
  </section>

  <section class="section alt">
    <div class="wrap">
      <h2>Other Concorde Projects You May Like</h2>
      <div class="p-grid p-grid-sm">${others.map((o) => `<a class="mini-card" href="../${o.slug}/"><img src="${img(o, o.images.hero[0], 1)}" alt="${esc(o.name)} ${esc(o.locality)}" loading="lazy" width="1200" height="750"><span><b>${esc(o.name)}</b>${esc(o.locality)} · from ${esc(o.priceFrom)}</span></a>`).join('')}</div>
    </div>
  </section>
</main>
${footer(1, p)}`;
  write(`${p.slug}/index.html`, head({ title: p.seoTitle, desc: p.metaDesc, canonical: url, depth: 1, image: `img/${imgDir(p)}/${p.images.hero[0]}`, jsonld }) + body);
}

function privacyPage() {
  const body = `${header(1)}<main class="section"><div class="wrap narrow prose">
  <h1>Privacy Policy</h1>
  <p>${esc(site.partnerName)} (“we”) collects the name, phone number, email and requirement you submit through forms on this website solely to respond to your property enquiry, share project information and arrange site visits.</p>
  <p>We may share your details with the relevant developer for the purpose of servicing your enquiry. We do not sell your personal information. You can ask us to delete your data at any time by writing to <a href="mailto:${site.email}">${esc(site.email)}</a>.</p>
  <p>This site may use cookies and analytics to understand traffic and improve content. You can disable cookies in your browser settings.</p>
</div></main>${footer(1)}`;
  write('privacy-policy/index.html', head({ title: `Privacy Policy | ${site.siteName}`, desc: `How ${site.siteName} handles enquiry data.`, canonical: `${site.domain}/privacy-policy/`, depth: 1, image: `img/${imgDir(projects[0])}/${projects[0].images.hero[0]}` }).replace('index, follow', 'noindex, follow') + body);
}

function thankYouPage() {
  const body = `${header(1)}<main class="section"><div class="wrap narrow prose ty">
  <p class="kicker">Enquiry received</p>
  <h1>Thank you! We’ll be in touch shortly.</h1>
  <p>A Concorde Projects advisor will call you back with the latest price sheet, availability and site-visit slots. Need it faster?</p>
  <p class="ty-cta"><a class="btn btn-gold" href="tel:${site.phone}">Call ${esc(site.phoneDisplay)}</a> <a class="btn btn-dark" href="https://wa.me/${site.whatsapp}" target="_blank" rel="noopener">WhatsApp us</a></p>
  <h2>Keep exploring</h2>
  <ul>${projects.map((p) => `<li><a href="../${p.slug}/">${esc(p.name)} – ${esc(p.locality)}</a></li>`).join('')}</ul>
</div></main>${footer(1)}`;
  write('thank-you/index.html', head({ title: `Thank You | ${site.siteName}`, desc: 'Your enquiry has been received.', canonical: `${site.domain}/thank-you/`, depth: 1, image: `img/${imgDir(projects[0])}/${projects[0].images.hero[0]}` }).replace('index, follow', 'noindex, follow') + body);
}

homePage();
thankYouPage();
projects.forEach(projectPage);
privacyPage();

const today = new Date().toISOString().slice(0, 10);
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${site.domain}/</loc><lastmod>${today}</lastmod><priority>1.0</priority></url>
${projects.map((p) => `  <url><loc>${site.domain}/${p.slug}/</loc><lastmod>${today}</lastmod><priority>0.9</priority></url>`).join('\n')}
</urlset>`);
write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${site.domain}/sitemap.xml\n`);
console.log(`Built ${projects.length + 2} pages → ${OUT}`);
