/**
 * i18n.js — lightweight translation loader
 * Uses data-i18n attributes and lang/xx.json files.
 * No external dependencies.
 */

const I18n = (() => {
  const SUPPORTED = ['en', 'es'];
  const FALLBACK   = 'en';
  const LS_KEY     = 'site_lang';

  let _strings = {};
  let _lang    = FALLBACK;

  /** Detect preferred language: localStorage > navigator > fallback */
  function detect() {
    const stored = localStorage.getItem(LS_KEY);
    if (stored && SUPPORTED.includes(stored)) return stored;

    const nav = (navigator.language || navigator.userLanguage || '').toLowerCase();
    for (const code of SUPPORTED) {
      if (nav === code || nav.startsWith(code + '-')) return code;
    }
    return FALLBACK;
  }

  /** Load JSON for given lang code, apply to DOM, update topbar button */
  async function load(lang) {
    if (!SUPPORTED.includes(lang)) lang = FALLBACK;
    _lang = lang;
    localStorage.setItem(LS_KEY, lang);

    try {
      const res = await fetch(`lang/${lang}.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      _strings = await res.json();
    } catch (e) {
      console.warn(`[i18n] Could not load lang/${lang}.json`, e);
      _strings = {};
    }

    applyToDOM();
    updateTopbar();
    updateDropdowns();
    document.documentElement.lang = lang;
  }

  /** Apply strings to every [data-i18n] element */
  function applyToDOM() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (_strings[key] === undefined) return;
      el.innerHTML = _strings[key];
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (_strings[key] !== undefined) el.title = _strings[key];
    });
  }

  /** Update the topbar LANGUAGE button text */
  function updateTopbar() {
    const btn = document.getElementById('lang-btn');
    if (btn && _strings['nav_language']) {
      // Preserve the inner span structure — just update the text node
      btn.childNodes.forEach(n => {
        if (n.nodeType === Node.TEXT_NODE) n.remove?.();
      });
      // Set as text content before the arrow span
      const arrow = btn.querySelector('.lang-arrow');
      btn.textContent = _strings['nav_language'];
      if (arrow) btn.appendChild(arrow);
    }
  }

  /** Sync active state on both desktop dropdown and mobile options */
  function updateDropdowns() {
    document.querySelectorAll('.lang-option, .mobile-lang-option').forEach(el => {
      el.classList.toggle('lang-active', el.dataset.lang === _lang);
    });
  }

  /** Public: get a string by key */
  function t(key) { return _strings[key] ?? key; }

  /** Public: current language code */
  function current() { return _lang; }

  /** Init: detect + load */
  async function init() { await load(detect()); }

  return { init, load, t, current, SUPPORTED };
})();

/* ── DESKTOP DROPDOWN LOGIC ── */
document.addEventListener('DOMContentLoaded', () => {
  I18n.init();

  const btn      = document.getElementById('lang-btn');
  const dropdown = document.getElementById('lang-dropdown');
  if (!btn || !dropdown) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = dropdown.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });

  document.addEventListener('click', () => {
    dropdown.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  });

  dropdown.addEventListener('click', (e) => {
    const option = e.target.closest('.lang-option');
    if (!option) return;
    const lang = option.dataset.lang;
    if (lang && lang !== I18n.current()) I18n.load(lang);
    dropdown.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  });
});
