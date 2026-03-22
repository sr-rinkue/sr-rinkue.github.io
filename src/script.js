document.addEventListener('DOMContentLoaded', () => {

  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!hamburger || !mobileMenu) return;

  // MENÚ EN MÓVIL
  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
  });

  document.addEventListener('click', (e) => {
    if (!mobileMenu.contains(e.target) && e.target !== hamburger) {
      closeMenu();
    }
  });

  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', closeMenu);
  });

  mobileMenu.querySelectorAll('.mobile-lang-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const lang = opt.dataset.lang;
      if (lang && typeof I18n !== 'undefined' && lang !== I18n.current()) {
        I18n.load(lang);
      }
      closeMenu();
    });
  });

  function closeMenu() {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }

});