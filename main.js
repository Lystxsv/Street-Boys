// STREET BOYS — JS base (Bloque 1)
(() => {
  const header = document.getElementById('header');
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');

  // Navbar: borde al hacer scroll
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Menú móvil
  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    links.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  links.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  window.matchMedia('(min-width: 901px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  // Contador del carrito (API mínima para el Bloque 4)
  const cartBtn = document.getElementById('cart-btn');
  const cartCount = document.getElementById('cart-count');
  window.StreetBoys = window.StreetBoys || {};
  window.StreetBoys.setCartCount = (n) => {
    cartCount.textContent = n;
    cartBtn.setAttribute('aria-label', `Cart, ${n} ${n === 1 ? 'item' : 'items'}`);
    cartCount.classList.add('is-bump');
    setTimeout(() => cartCount.classList.remove('is-bump'), 200);
  };

  // Newsletter (simulado: conectar con tu servicio de correo)
  const nl = document.getElementById('newsletter');
  if (nl) {
    nl.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = nl.querySelector('input[type="email"]');
      const msg = document.getElementById('nl-msg');
      if (!input.checkValidity()) {
        msg.textContent = 'Enter a valid email.';
        input.focus();
        return;
      }
      // TODO: enviar input.value al servicio de correo (Mailchimp, Klaviyo, etc.)
      msg.textContent = 'Done! We will let you know about upcoming releases.';
      nl.reset();
    });
  }

  // Aparición al hacer scroll
  const items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.15 });
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add('is-visible'));
  }
})();
