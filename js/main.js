
(function(){
  'use strict';

  document.documentElement.style.overflowY = 'auto';
  document.body.style.overflowY = 'auto';

  function postBridge(payload) {
    if (window.dripzoneBridge) {
      window.dripzoneBridge(JSON.stringify(payload));
    } else if (window.chrome && window.chrome.webview) {
      window.chrome.webview.postMessage(JSON.stringify(payload));
    }
  }

  function dzInitEdit() {
    document.querySelectorAll('[data-dz-editable]').forEach(el => {
      el.contentEditable = 'true';
      el.classList.add('dz-editable');
      el.addEventListener('blur', () => {
        postBridge({ type: 'content', id: el.dataset.dzId || el.dataset.dzEditable, content: el.innerText });
      });
    });

    document.querySelectorAll('.dz-draggable, [data-dz-id]').forEach(el => {
      el.draggable = true;
      el.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', el.dataset.dzId || 'section');
        el.style.opacity = '0.5';
      });
      el.addEventListener('dragend', () => { el.style.opacity = '1'; });
      el.addEventListener('dragover', e => e.preventDefault());
      el.addEventListener('drop', e => {
        e.preventDefault();
        const rect = el.getBoundingClientRect();
        postBridge({
          type: 'move',
          id: e.dataTransfer.getData('text/plain'),
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          width: rect.width,
          height: rect.height
        });
      });
    });

    document.addEventListener('click', e => {
      const target = e.target.closest('[data-dz-id]');
      if (target) postBridge({ type: 'select', id: target.dataset.dzId });
    });
  }

  window.__dzInitEdit = dzInitEdit;
  if (window.__DRIPZONE_EDIT_MODE__ === true) {
    dzInitEdit();
  }

  function applyLocale(lang) {
    const pack = window.__DZ_I18N__;
    if (!pack || !pack[lang]) return;
    const L = pack[lang];
    const set = (sel, val) => { const el = document.querySelector(sel); if (el && val) el.textContent = val; };
    if (L.hero) {
      set('[data-i18n="hero.title"]', L.hero.title);
      set('[data-i18n="hero.subtitle"]', L.hero.subtitle);
      set('[data-i18n="hero.slogan"]', L.hero.slogan);
      set('[data-i18n="hero.cta"]', L.hero.cta);
      set('[data-i18n="hero.about"]', L.hero.about);
      set('[data-i18n="headings.about"]', L.headings?.about);
      set('[data-i18n="headings.aboutTag"]', L.headings?.aboutTag);
      set('[data-i18n="headings.services"]', L.headings?.services);
      set('[data-i18n="headings.reviews"]', L.headings?.reviews);
      set('[data-i18n="headings.contact"]', L.headings?.contact);
      set('[data-i18n="headings.gallery"]', L.headings?.gallery);
      set('[data-i18n="headings.pricing"]', L.headings?.pricing);
      set('[data-i18n="nav.about"]', L.nav?.about);
      set('[data-i18n="nav.services"]', L.nav?.services);
      set('[data-i18n="nav.reviews"]', L.nav?.reviews);
      set('[data-i18n="nav.contact"]', L.nav?.contact);
      const cta = document.querySelector('nav a[href="#contact"]:not(.nav-link)');
      if (cta && L.hero.cta) cta.textContent = L.hero.cta;
      const heroCta = document.querySelector('#hero a[href*="wa.me"]');
      if (heroCta && L.hero.cta) heroCta.textContent = L.hero.cta;
    }
    if (L.client) {
      set('[data-i18n="client.greeting"]', L.client.greeting);
      set('[data-i18n="client.welcome"]', L.client.welcome);
      set('[data-i18n="client.whyHeading"]', L.client.whyHeading);
      set('[data-i18n-text="client.why1"]', L.client.why1);
      set('[data-i18n-text="client.why2"]', L.client.why2);
      set('[data-i18n-text="client.why3"]', L.client.why3);
      set('[data-i18n="client.invite"]', L.client.invite);
      document.querySelectorAll('#invite a[data-i18n="hero.cta"]').forEach(el => {
        if (L.hero?.cta) el.textContent = L.hero.cta;
      });
    }
    if (L.labels) {
      set('[data-i18n="labels.phone"]', L.labels.phone);
      set('[data-i18n="labels.email"]', L.labels.email);
      set('[data-i18n="labels.location"]', L.labels.location);
      set('[data-i18n="labels.googleRating"]', L.labels.googleRating);
      set('[data-i18n="labels.openMaps"]', L.labels.openMaps);
      set('[data-i18n="labels.seeAllReviews"]', L.labels.seeAllReviews);
      set('[data-i18n="labels.mapsRating"]', L.labels.mapsRating);
      set('[data-i18n="labels.googleMaps"]', L.labels.googleMaps);
    }
    if (L.pro) {
      Object.keys(L.pro).forEach(function(k) {
        set('[data-i18n="pro.' + k + '"]', L.pro[k]);
      });
    }
    if (pack.reviews) {
      document.querySelectorAll('[data-review-idx]').forEach(el => {
        const idx = parseInt(el.dataset.reviewIdx, 10);
        const r = pack.reviews[idx];
        if (!r) return;
        const text = r[lang] || r.fr || r.en || r.ar || '';
        const p = el.querySelector('[data-review-text]');
        if (p && text) p.textContent = '\u201C' + text + '\u201D';
      });
    }
    document.documentElement.lang = lang === 'ar' ? 'ar' : lang;
    document.body.dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('dz_lang', lang);
    document.querySelectorAll('.dz-lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
  }

  document.querySelectorAll('.dz-lang-btn').forEach(btn => {
    btn.addEventListener('click', () => applyLocale(btn.dataset.lang));
  });

  const saved = localStorage.getItem('dz_lang');
  const initial = saved || (window.__DZ_I18N__ && window.__DZ_I18N__.defaultLang) || 'ar';
  applyLocale(initial);

  document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp.com"]').forEach(a => {
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
  });
})();
