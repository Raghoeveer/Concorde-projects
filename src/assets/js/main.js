(function () {
  'use strict';
  var CFG = window.SITE || {};
  var modal = document.getElementById('lead-modal');
  var modalTitle = document.getElementById('modal-title');
  var modalForm = modal && modal.querySelector('.lead-form');
  var lastFocus = null;
  var store = {
    get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} },
  };
  var pageProject = modal ? modal.querySelector('[name=project]').value : 'General';

  // ── Modal ──────────────────────────────────────────
  function openModal(title, project) {
    if (!modal) return;
    lastFocus = document.activeElement;
    modalTitle.textContent = title || 'Get Best Price';
    var proj = project || pageProject;
    modalForm.querySelector('[name=project]').value = proj;
    modalForm.querySelector('[name=intent]').value = title || '';
    modalForm.querySelector('[name=subject]').value = 'New Lead: ' + proj + ' – ' + (title || 'Enquiry') + ' (Concorde Projects site)';
    modalForm.querySelector('.form-msg').textContent = '';
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    setTimeout(function () { modalForm.querySelector('[name=name]').focus(); }, 50);
  }
  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-modal]');
    if (t) { e.preventDefault(); openModal(t.getAttribute('data-modal'), t.getAttribute('data-project')); return; }
    if (e.target === modal || e.target.closest('.modal-close')) closeModal();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeModal(); closeLightbox(); } });

  // Auto popup after 20s + exit-intent (once per session)
  function autoPopup(title) {
    if (store.get('cp_popup') || store.get('cp_lead') || !modal || !modal.hidden) return;
    store.set('cp_popup', '1');
    openModal(title);
  }
  setTimeout(function () { autoPopup('Wait… Download the Brochure'); }, 20000);
  document.addEventListener('mouseout', function (e) {
    if (!e.relatedTarget && e.clientY <= 0) autoPopup('Wait… Download the Brochure');
  });

  // ── Lead forms ────────────────────────────────────
  function validate(form) {
    var ok = true;
    ['name', 'email', 'phone'].forEach(function (n) {
      var el = form.querySelector('[name=' + n + ']');
      var v = el.value.trim();
      var bad = !v || (n === 'phone' && v.replace(/\D/g, '').length < 10) || (n === 'email' && !/^\S+@\S+\.\S+$/.test(v));
      el.classList.toggle('invalid', bad);
      if (bad) ok = false;
    });
    if (!form.querySelector('[name=consent]').checked) ok = false;
    return ok;
  }
  document.querySelectorAll('.lead-form').forEach(function (form) {
    form.setAttribute('novalidate', '');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = form.querySelector('.form-msg');
      msg.className = 'form-msg';
      if (!validate(form)) { msg.textContent = 'Please enter your name, a valid email and a 10-digit mobile number.'; msg.classList.add('err'); return; }
      var d = {};
      new FormData(form).forEach(function (v, k) { d[k] = v; });
      if (d.botcheck) return;
      delete d.botcheck;
      delete d.redirect;
      d.page = location.href;
      if (location.search) d.utm = location.search.slice(1);
      var btn = form.querySelector('button[type=submit]');
      btn.disabled = true;
      msg.textContent = 'Sending…';
      fetch(form.action, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(d) })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (!res.success) throw new Error(res.message || 'failed');
          store.set('cp_lead', '1');
          if (typeof window.gtag === 'function') window.gtag('event', 'generate_lead', { project: d.project, intent: d.intent });
          location.href = form.getAttribute('data-thanks');
        })
        .catch(function () {
          // Fallback: native POST (Web3Forms then redirects to /thank-you/)
          HTMLFormElement.prototype.submit.call(form);
        });
    });
  });

  // ── Project list (home): search + any number of chip groups, combined with AND ──
  var groups = document.querySelectorAll('[data-filter-group]');
  var searchBox = document.getElementById('p-search');
  var cards = document.querySelectorAll('.pc');
  function applyFilters() {
    var active = {};
    groups.forEach(function (g) { active[g.getAttribute('data-filter-group')] = g.querySelector('.chip.is-on').getAttribute('data-value'); });
    var q = searchBox ? searchBox.value.trim().toLowerCase() : '';
    var shown = 0;
    cards.forEach(function (card) {
      var ok = Object.keys(active).every(function (k) { return active[k] === 'all' || card.getAttribute('data-' + k) === active[k]; }) &&
        (!q || q.split(/\s+/).every(function (w) { return card.getAttribute('data-search').indexOf(w) > -1; }));
      card.hidden = !ok;
      if (ok) shown++;
    });
    var count = document.querySelector('.pc-count');
    if (count) count.innerHTML = shown === cards.length ? 'Showing all <b>' + shown + '</b> projects' : 'Showing <b>' + shown + '</b> of ' + cards.length + ' projects';
    var none = document.querySelector('.no-match');
    if (none) none.hidden = shown > 0;
  }
  groups.forEach(function (g) {
    g.addEventListener('click', function (e) {
      var chip = e.target.closest('.chip');
      if (!chip) return;
      g.querySelectorAll('.chip').forEach(function (c) { c.classList.toggle('is-on', c === chip); });
      applyFilters();
    });
  });
  if (searchBox) searchBox.addEventListener('input', applyFilters);

  // ── Location tabs ─────────────────────────────────
  document.querySelectorAll('.tab[data-tab]').forEach(function (tab) {
    tab.addEventListener('click', function () {
      var i = tab.getAttribute('data-tab');
      document.querySelectorAll('.tab[data-tab]').forEach(function (t) { var on = t === tab; t.classList.toggle('is-on', on); t.setAttribute('aria-selected', on); });
      document.querySelectorAll('.tab-panel').forEach(function (p) { p.hidden = p.getAttribute('data-panel') !== i; });
    });
  });

  // ── Logo on project pages: smooth-scroll to top instead of leaving the page ──
  document.querySelectorAll('[data-scroll-top]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      if (history.replaceState) history.replaceState(null, '', location.pathname + location.search);
    });
  });

  // ── Lightbox ──────────────────────────────────────
  var lb = null;
  function closeLightbox() { if (lb) { lb.remove(); lb = null; } }
  document.querySelectorAll('[data-lightbox]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      lb = document.createElement('div');
      lb.className = 'lightbox';
      lb.innerHTML = '<img alt="">';
      lb.firstChild.src = a.getAttribute('href');
      lb.firstChild.alt = a.querySelector('img').alt;
      lb.addEventListener('click', closeLightbox);
      document.body.appendChild(lb);
    });
  });

  // ── Sub-nav active state ──────────────────────────
  var links = document.querySelectorAll('.subnav a[href^="#"]');
  if (links.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) links.forEach(function (l) { l.classList.toggle('is-active', l.getAttribute('href') === '#' + en.target.id); });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    links.forEach(function (l) { var s = document.querySelector(l.getAttribute('href')); if (s) io.observe(s); });
  }
})();
