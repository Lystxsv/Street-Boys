// STREET BOYS — Catálogo desde Google Sheets (opcional)
// Lee la pestaña "Camisas" (tarjetas del Bloque 3) y la pestaña "Precios" (personalizador).
// Si algo falla, la página sigue mostrando el contenido que ya trae escrito.
(() => {
  const cfg = window.STREETBOYS_CONFIG || {};
  const grid = document.getElementById('product-grid');
  const MODELS = ['clasica', 'oversize', 'manga-larga'];
  const COLORS = ['negro', 'blanco', 'gris'];

  // ---------- Utilidades ----------
  const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
  const key = (s) => norm(s).replace(/[\s_]+/g, '-');

  function parseCSV(text) {
    text = text.replace(/^﻿/, '');
    const rows = [];
    let row = [], cur = '', quoted = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (quoted) {
        if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else quoted = false; }
        else cur += c;
      } else if (c === '"') quoted = true;
      else if (c === ',') { row.push(cur); cur = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        row.push(cur); rows.push(row); row = []; cur = '';
      } else cur += c;
    }
    if (cur !== '' || row.length) { row.push(cur); rows.push(row); }
    return rows.filter((r) => r.some((v) => v.trim() !== ''));
  }

  function toObjects(rows) {
    if (!rows.length) return [];
    const head = rows[0].map(key);
    return rows.slice(1).map((r) => Object.fromEntries(head.map((h, i) => [h, (r[i] || '').trim()])));
  }

  const num = (v) => {
    const n = parseInt(String(v).replace(/[^\d]/g, ''), 10);
    return Number.isFinite(n) ? n : NaN;
  };
  const isActive = (v) => !['no', 'false', '0', 'n'].includes(norm(v));

  async function getCSV(url) {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return toObjects(parseCSV(await res.text()));
  }

  // Acepta enlaces https, rutas relativas a imágenes y enlaces de Google Drive. Todo lo demás se ignora.
  function imgUrl(u) {
    u = (u || '').trim();
    if (!u) return null;
    const d = u.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]+)/);
    if (d) return `https://drive.google.com/thumbnail?id=${d[1]}&sz=w1200`;
    if (/^https:\/\//i.test(u)) return u;
    if (/^(?!\/\/)[\w\-./]+\.(png|jpe?g|webp|avif|gif|svg)$/i.test(u)) return u;
    return null;
  }

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  // ---------- Tarjetas de producto ----------
  function buildCard(p, i) {
    const name = p.nombre;
    const id = p.id || norm(name).replace(/[^a-z0-9]+/g, '-');
    const front = imgUrl(p['imagen-frente']);
    const back = imgUrl(p['imagen-espalda']);
    const model = MODELS.includes(key(p.modelo)) ? key(p.modelo) : 'oversize';
    const color = COLORS.includes(norm(p.color)) ? norm(p.color) : 'negro';
    const price = num(p.precio);

    const li = el('li', 'reveal is-visible');
    const article = el('article', 'card');
    article.dataset.product = id;

    const media = el('div', 'card__media');
    if (p.etiqueta) {
      const outline = /limitad/i.test(p.etiqueta) ? ' card__tag--outline' : '';
      media.appendChild(el('span', 'card__tag' + outline, p.etiqueta));
    }
    if (front) {
      const img = el('img');
      img.src = front; img.alt = `${name} — frente`; img.loading = 'lazy';
      media.appendChild(img);
      if (back) {
        const img2 = el('img', 'card__img--alt');
        img2.src = back; img2.alt = ''; img2.loading = 'lazy';
        media.appendChild(img2);
      }
    } else {
      media.appendChild(el('div', 'placeholder', 'SIN IMAGEN'));
    }

    const body = el('div', 'card__body');
    body.appendChild(el('h3', 'card__title', name));
    body.appendChild(el('p', 'card__price', Number.isFinite(price) ? `$${price.toLocaleString('es-CO')} COP` : 'Consultar precio'));
    const btn = el('a', 'btn btn--sm btn--block', 'Personalizar');
    btn.href = '#personaliza';
    btn.dataset.model = model;
    btn.dataset.color = color;
    body.appendChild(btn);

    article.append(media, body);
    li.appendChild(article);
    return li;
  }

  async function loadProducts() {
    if (!cfg.camisasCsv || !grid) return;
    const rows = await getCSV(cfg.camisasCsv);
    const items = rows.filter((r) => r.nombre && isActive(r.activo)).map(buildCard);
    if (items.length) grid.replaceChildren(...items);
  }

  // ---------- Precios del personalizador ----------
  async function loadPrices() {
    if (!cfg.preciosCsv) return;
    const rows = await getCSV(cfg.preciosCsv);
    const prices = {};
    rows.forEach((r) => {
      const n = num(r.valor);
      if (r.clave && Number.isFinite(n)) prices[key(r.clave)] = n;
    });
    window.StreetBoys = window.StreetBoys || {};
    window.StreetBoys.prices = prices;
    window.dispatchEvent(new CustomEvent('streetboys:prices', { detail: prices }));
  }

  loadProducts().catch((e) => console.warn('Street Boys: no se pudo leer la hoja de camisas.', e));
  loadPrices().catch((e) => console.warn('Street Boys: no se pudo leer la hoja de precios.', e));
})();
