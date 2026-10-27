// STREET BOYS — Personalizador (Bloque 4)
(() => {
  const form = document.getElementById('cfg');
  if (!form) return;
  const $ = (s) => form.querySelector(s);

  // ---- Datos del producto (precios de ejemplo en COP; editar aquí) ----
  const MODELS = {
    'clasica': {
      label: 'Clásica', price: 79000,
      body: 'M140 40 L100 55 L40 100 L70 150 L105 130 L105 400 L295 400 L295 130 L330 150 L360 100 L300 55 L260 40 Z',
      slots: { pecho: { x: 63, y: 24, w: 15, r: 0 }, manga: { x: 19, y: 20, w: 10, r: -35 }, espalda: { x: 50, y: 22, w: 44, r: 0 } }
    },
    'oversize': {
      label: 'Oversize', price: 89000,
      body: 'M130 40 L80 55 L10 110 L35 175 L80 150 L80 410 L320 410 L320 150 L365 175 L390 110 L320 55 L270 40 Z',
      slots: { pecho: { x: 64, y: 25, w: 17, r: 0 }, manga: { x: 12, y: 21, w: 11, r: -30 }, espalda: { x: 50, y: 22, w: 46, r: 0 } }
    },
    'manga-larga': {
      label: 'Manga larga', price: 99000,
      body: 'M140 40 L100 55 L45 110 L20 330 L60 335 L95 175 L105 160 L105 400 L295 400 L295 160 L305 175 L340 335 L380 330 L355 110 L300 55 L260 40 Z',
      slots: { pecho: { x: 63, y: 24, w: 15, r: 0 }, manga: { x: 16, y: 36, w: 7, r: -10 }, espalda: { x: 50, y: 22, w: 44, r: 0 } }
    }
  };
  const EXTRA = { text: 8000, image: 12000 };
  const COLORS = { negro: 'Negro', blanco: 'Blanco', gris: 'Gris' };
  const POSITIONS = { pecho: 'Pecho', espalda: 'Espalda', manga: 'Manga' };
  const NECK = { front: 'M140 40 Q200 88 260 40', back: 'M140 40 Q200 56 260 40' };
  const MAX_BYTES = 5 * 1024 * 1024;
  const OK_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];

  const fmt = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

  // ---- Elementos ----
  const stage = $('#stage'), body = $('#shirt-body'), neck = $('#shirt-neck');
  const print = $('#print'), printImg = $('#print-img'), printText = $('#print-text');
  const note = $('#preview-note'), priceEl = $('#cfg-price'), breakdownEl = $('#cfg-breakdown');
  const status = $('#cfg-status'), addBtn = $('#cfg-add');
  const textInput = $('#cfg-text'), textCount = $('#text-count');
  const fileInput = $('#cfg-file'), drop = $('#drop'), dropFile = $('#drop-file'), dropName = $('#drop-name');
  const fileError = $('#file-error');
  const viewBtns = form.querySelectorAll('.view-toggle__btn');

  const state = { view: 'front', imgURL: null, imgName: '' };
  const val = (name) => form.querySelector(`input[name="${name}"]:checked`).value;
  const setRadio = (name, value) => {
    const el = form.querySelector(`input[name="${name}"][value="${value}"]`);
    if (el) el.checked = true;
  };

  function setView(v) {
    state.view = v;
    viewBtns.forEach((b) => {
      const on = b.dataset.view === v;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });
  }

  function render() {
    const model = val('model'), color = val('color'), size = val('size'), pos = val('position');
    const text = textInput.value.trim();
    const hasImg = !!state.imgURL, hasText = text.length > 0;
    const m = MODELS[model];

    // Camisa
    body.setAttribute('d', m.body);
    neck.setAttribute('d', NECK[state.view]);
    stage.dataset.color = color;

    // Diseño en la camisa
    const designView = pos === 'espalda' ? 'back' : 'front';
    const slot = m.slots[pos];
    const visible = (hasImg || hasText) && state.view === designView;
    print.hidden = !visible;
    if (visible) {
      print.style.left = slot.x + '%';
      print.style.top = slot.y + '%';
      print.style.width = slot.w + '%';
      print.style.setProperty('--rot', slot.r + 'deg');
      printImg.hidden = !hasImg;
      if (hasImg) printImg.src = state.imgURL;
      printText.hidden = !hasText;
      printText.textContent = text;
      const fs = Math.min(22, 150 / Math.max(text.length, 6));
      printText.style.fontSize = fs + 'cqw';
    }

    // Mensaje de ayuda
    if (!hasImg && !hasText) note.textContent = 'Agrega un texto o sube un diseño para verlo aquí.';
    else if (state.view !== designView) note.textContent = `Tu diseño está en ${designView === 'back' ? 'la espalda' : 'el frente'}. Cambia de vista para verlo.`;
    else note.textContent = '';

    textCount.textContent = `${textInput.value.length}/20`;

    // Precio dinámico
    const parts = [`Base ${fmt.format(m.price)}`];
    let total = m.price;
    if (hasText) { total += EXTRA.text; parts.push(`texto +${fmt.format(EXTRA.text)}`); }
    if (hasImg) { total += EXTRA.image; parts.push(`diseño +${fmt.format(EXTRA.image)}`); }
    priceEl.textContent = fmt.format(total);
    breakdownEl.textContent = `${m.label} · ${COLORS[color]} · ${size} · ${POSITIONS[pos]}${parts.length > 1 ? ' — ' + parts.join(' ') : ''}`;

    return { model, color, size, pos, text, hasImg, total };
  }

  // ---- Subida de archivo ----
  function clearFile() {
    if (state.imgURL) URL.revokeObjectURL(state.imgURL);
    state.imgURL = null; state.imgName = '';
    fileInput.value = '';
    dropFile.hidden = true;
    drop.classList.remove('has-file');
  }
  function setFile(file) {
    fileError.textContent = '';
    if (!file) return;
    if (!OK_TYPES.includes(file.type)) { fileError.textContent = 'Formato no válido. Usa PNG, JPG, WEBP o SVG.'; fileInput.value = ''; return; }
    if (file.size > MAX_BYTES) { fileError.textContent = 'El archivo supera los 5 MB.'; fileInput.value = ''; return; }
    if (state.imgURL) URL.revokeObjectURL(state.imgURL);
    state.imgURL = URL.createObjectURL(file);
    state.imgName = file.name;
    dropName.textContent = file.name;
    dropFile.hidden = false;
    drop.classList.add('has-file');
    render();
  }
  fileInput.addEventListener('change', () => setFile(fileInput.files[0]));
  $('#drop-remove').addEventListener('click', () => { clearFile(); fileError.textContent = ''; render(); });
  ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('is-over'); }));
  ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('is-over'); }));
  drop.addEventListener('drop', (e) => setFile(e.dataTransfer.files[0]));

  // ---- Eventos ----
  form.addEventListener('change', (e) => {
    if (e.target.name === 'position') setView(e.target.value === 'espalda' ? 'back' : 'front');
    render();
  });
  textInput.addEventListener('input', render);
  viewBtns.forEach((b) => b.addEventListener('click', () => { setView(b.dataset.view); render(); }));

  // Preselección desde las tarjetas del Bloque 3
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-model]');
    if (!a) return;
    setRadio('model', a.dataset.model);
    if (a.dataset.color) setRadio('color', a.dataset.color);
    render();
  });

  // ---- Agregar al carrito ----
  window.StreetBoys = window.StreetBoys || {};
  const cart = (window.StreetBoys.cart = window.StreetBoys.cart || []);
  let resetTimer;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const s = render();
    cart.push({
      model: s.model, color: s.color, size: s.size, position: s.pos,
      text: s.text, designFile: state.imgName || null, price: s.total
    });
    if (window.StreetBoys.setCartCount) window.StreetBoys.setCartCount(cart.length);
    status.textContent = `Camisa ${MODELS[s.model].label.toLowerCase()} ${COLORS[s.color].toLowerCase()} talla ${s.size} agregada al carrito.`;
    addBtn.textContent = '¡Agregada!';
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => { addBtn.textContent = 'Agregar al carrito'; }, 1800);
  });

  // Estado inicial
  setView('front');
  render();

  // ---- Precios desde Google Sheets (opcional; ver catalog.js) ----
  function applyPrices(p) {
    if (!p) return;
    Object.keys(MODELS).forEach((k) => { if (p[k] > 0) MODELS[k].price = p[k]; });
    if (p.texto >= 0) EXTRA.text = p.texto;
    if (p.diseno >= 0) EXTRA.image = p.diseno;
    render();
  }
  window.addEventListener('streetboys:prices', (e) => applyPrices(e.detail));
  applyPrices(window.StreetBoys && window.StreetBoys.prices);
})();
