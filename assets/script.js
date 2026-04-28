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

  // -------- Contact form (no backend — client-side acknowledgement) --------
  const contactForm = document.querySelector('[data-form="contact"]');
  if (contactForm) {
    const status = contactForm.querySelector('.form-status');
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      const data = new FormData(contactForm);
      const name = (data.get('name') || '').toString().trim();
      const email = (data.get('email') || '').toString().trim();
      const message = (data.get('message') || '').toString().trim();
      if (!name || !email || !message) {
        status.textContent = 'Please fill in name, email, and message.';
        status.style.color = 'var(--rose)';
        return;
      }
      // Open user's email client with prefilled message — works without a backend.
      const subject = encodeURIComponent((data.get('subject') || 'Hello from your site').toString());
      const body = encodeURIComponent(`From: ${name} <${email}>\n\n${message}`);
      window.location.href = `mailto:ameliapasser@gmail.com?subject=${subject}&body=${body}`;
      status.textContent = 'Opening your email — thanks for reaching out.';
      status.style.color = 'var(--gold)';
      contactForm.reset();
    });
  }

  // -------- Subscribe form — MailerLite (with placeholder fallback) --------
  const subForm = document.querySelector('[data-form="subscribe"]');
  if (subForm) {
    const status = subForm.querySelector('.form-status');
    subForm.addEventListener('submit', async e => {
      e.preventDefault();
      const fd = new FormData(subForm);
      const email = (fd.get('fields[email]') || fd.get('email') || '').toString().trim();
      if (!/.+@.+\..+/.test(email)) {
        status.textContent = 'Please enter a valid email.';
        status.style.color = 'var(--rose)';
        return;
      }
      const action = subForm.getAttribute('action') || '';
      // If the real MailerLite endpoint hasn't been wired yet, just acknowledge.
      if (!action || action.includes('MAILERLITE-')) {
        status.textContent = 'Thank you — you\'ll hear from the studio soon.';
        status.style.color = 'var(--gold)';
        subForm.reset();
        return;
      }
      // Real MailerLite endpoint — submit via fetch, no-cors to avoid CORS preflight.
      try {
        await fetch(action, { method: 'POST', mode: 'no-cors', body: fd });
        status.textContent = 'You\'re on the list — confirmation sent.';
        status.style.color = 'var(--gold)';
        subForm.reset();
      } catch (err) {
        status.textContent = 'Hmm — something went wrong. Try again, or email directly.';
        status.style.color = 'var(--rose)';
      }
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
