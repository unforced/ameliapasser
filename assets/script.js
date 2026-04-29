/* Amelia Passer — site interactivity */
(function () {
  'use strict';

  // Mark JS-enabled — gates the reveal-on-scroll initial-hide.
  document.body.classList.add('js');

  // -------- Mobile nav toggle --------
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
    nav.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      })
    );
  }

  // -------- Reveal on scroll --------
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('is-visible'));
  }

  // -------- Lightbox for gallery --------
  const lightbox = document.querySelector('.lightbox');
  if (lightbox) {
    const content = lightbox.querySelector('.lightbox__content');
    const caption = lightbox.querySelector('.lightbox__caption');
    const close = lightbox.querySelector('.lightbox__close');

    document.querySelectorAll('[data-lightbox]').forEach(trigger => {
      trigger.addEventListener('click', e => {
        e.preventDefault();
        // Source for the lightbox content: prefer the trigger's inner .card__media
        // (cards), otherwise use the trigger's own innerHTML (feature blocks).
        const inner = trigger.querySelector('.card__media') || trigger;
        content.innerHTML = inner.innerHTML;
        // If the trigger declares a higher-res variant, swap the cloned <img>'s
        // src to it so zooming-in shows full detail.
        const largeSrc = trigger.dataset.lightboxSrc;
        if (largeSrc) {
          const img = content.querySelector('img');
          if (img) img.src = largeSrc;
        }
        caption.textContent = trigger.dataset.caption || '';
        lightbox.classList.add('is-open');
        document.body.style.overflow = 'hidden';
      });
    });

    const closeLightbox = () => {
      lightbox.classList.remove('is-open');
      document.body.style.overflow = '';
      content.innerHTML = '';
    };
    close.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', e => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeLightbox();
    });
  }

  // -------- Active nav link --------
  const path = location.pathname.replace(/\/index\.html$/, '/');
  document.querySelectorAll('.nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (!href) return;
    const aPath = href.replace(/\/index\.html$/, '/');
    if (
      (aPath === '/' && (path === '/' || path.endsWith('/index.html'))) ||
      (aPath !== '/' && path.endsWith(aPath))
    ) {
      a.classList.add('is-active');
    }
  });
})();
