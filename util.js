/* Utilidades compartidas: creación de elementos, íconos, texto y avisos. */
window.QI = window.QI || {};
(function () {
  QI.bus = new EventTarget();
  QI.emit = (n, d) => QI.bus.dispatchEvent(new CustomEvent(n, { detail: d }));
  QI.on = (n, f) => QI.bus.addEventListener(n, f);

  QI.h = function (tag, props, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else if (['value', 'checked', 'disabled', 'hidden', 'selected'].includes(k)) el[k] = v;
      else el.setAttribute(k, v === true ? '' : v);
    }
    const add = (c) => {
      if (c == null || c === false) return;
      if (Array.isArray(c)) c.forEach(add);
      else el.append(c.nodeType ? c : document.createTextNode(String(c)));
    };
    kids.forEach(add);
    return el;
  };

  const ICONS = {
    bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5zM3 13l9 5 9-5"/>',
    drops: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
    thermo: '<path d="M10 14.5V5a2 2 0 0 1 4 0v9.5a4 4 0 1 1-4 0z"/>',
    hex: '<path d="M12 3l7 4v8l-7 4-7-4V7zM12 11v8"/>',
    swap: '<path d="M4 8h14l-4-4M20 16H6l4 4"/>',
    home: '<path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 5v16M8 7h7"/>',
    game: '<path d="M6 9h12a4 4 0 0 1 4 4v1a3 3 0 0 1-5.3 1.9L15 14H9l-1.7 1.9A3 3 0 0 1 2 14v-1a4 4 0 0 1 4-4zM8 11v4M6 13h4M16 12h.01M18 14h.01"/>',
    video: '<path d="M3 6h13v12H3zM16 10l5-3v10l-5-3"/>',
    trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4v1a4 4 0 0 0 4 4M16 6h4v1a4 4 0 0 1-4 4M12 13v4M8 21h8M10 17h4"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17h.01"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    access: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="7.2" r="1" fill="currentColor"/><path d="M7.5 10.2l4.5.8 4.5-.8M12 11v3.5M12 14.5l-2.2 3.3M12 14.5l2.2 3.3"/>',
    more: '<path d="M5 12h.01M12 12h.01M19 12h.01" stroke-width="3.5"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
    lock: '<path d="M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3"/>',
    play: '<path d="M7 5l12 7-12 7z"/>',
    pause: '<path d="M8 5v14M16 5v14"/>',
    stop: '<path d="M6 6h12v12H6z"/>',
    left: '<path d="M15 5l-7 7 7 7"/>',
    right: '<path d="M9 5l7 7-7 7"/>',
    audio: '<path d="M4 10v4h4l5 4V6L8 10zM16.5 9a4 4 0 0 1 0 6M19 6.5a8 8 0 0 1 0 11"/>',
    atom: '<ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/>',
    flask: '<path d="M9 3h6M10 3v6L4.5 19a1.6 1.6 0 0 0 1.4 2.4h12.2a1.6 1.6 0 0 0 1.4-2.4L14 9V3M7.5 15h9"/>',
    puzzle: '<path d="M4 4h16v16H4zM4 10h16M4 15h16M10 4v16M15 4v16"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    flame: '<path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3 0-6 1-9z"/>',
    medal: '<circle cx="12" cy="9" r="5"/><path d="M8.5 13.5l-2 7.5 5.5-3 5.5 3-2-7.5"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/>',
    spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
    scale: '<path d="M12 4v16M6 20h12M5 8h14M5 8l-3 7a3.5 3.5 0 0 0 6 0zM19 8l-3 7a3.5 3.5 0 0 0 6 0z"/>',
    pin: '<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.800 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    pausebig: '<path d="M9 5v14M15 5v14"/>'
  };
  QI.icon = function (name) {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 24 24');
    s.setAttribute('class', 'ico');
    s.setAttribute('fill', 'none');
    s.setAttribute('stroke', 'currentColor');
    s.setAttribute('stroke-width', '2');
    s.setAttribute('stroke-linecap', 'round');
    s.setAttribute('stroke-linejoin', 'round');
    s.setAttribute('aria-hidden', 'true');
    s.setAttribute('focusable', 'false');
    s.innerHTML = ICONS[name] || '';
    return s;
  };

  QI.svg = function (markup) {
    const t = document.createElement('template');
    t.innerHTML = markup.trim();
    return t.content.firstChild;
  };

  QI.norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ñ ]/g, ' ').replace(/\s+/g, ' ').trim();
  QI.fmtNum = (n, d = 0) => Number(n).toLocaleString('es-AR', { minimumFractionDigits: d, maximumFractionDigits: d });
  QI.stripHtml = (s) => String(s).replace(/\{\{[^|]+\|([^}]+)\}\}/g, '$1').replace(/<[^>]+>/g, '');

  /* Convierte {{id|texto}} en botones de glosario. */
  QI.terms = function (str) {
    return String(str).replace(/\{\{([^|}]+)\|([^}]+)\}\}/g, (m, id, t) => '<button type="button" class="term" data-term="' + id + '" aria-haspopup="dialog">' + t + '</button>');
  };

  QI.toast = function (msg) {
    const box = document.getElementById('toasts');
    if (!box) return;
    const t = QI.h('div', { class: 'toast', role: 'status' }, msg);
    box.append(t);
    while (box.children.length > 3) box.firstChild.remove();
    setTimeout(() => t.remove(), 4200);
  };

  const cache = {};
  QI.videoItem = function (v, rerender) {
    const h = QI.h;
    if (!v.youtubeId) return h('li', {}, h('span', {}, v.titulo), h('span', { class: 'badge soon' }, 'Próximamente'));
    const seen = QI.store.watchedVideo(v.id);
    const cita = v.canal + '. (s. f.). ' + v.tituloOriginal + ' [Video]. YouTube. ' + v.url;
    return h('li', { class: 'vitem' },
      h('div', { class: 'stack', style: 'gap:.35rem;flex:1;min-width:14rem' },
        h('b', {}, v.titulo),
        h('small', { class: 'muted' }, 'Canal: ' + v.canal),
        h('small', { class: 'cita' }, h('span', { class: 'sr-only' }, 'Cita: '), cita + ' (consultado el 23/10/2026)')),
      h('div', { class: 'row' },
        h('a', { class: 'btn small', href: v.url, target: '_blank', rel: 'noopener noreferrer' }, 'Ver en YouTube', h('span', { class: 'sr-only' }, ' (abre una pestaña nueva)')),
        h('button', { class: 'btn small ' + (seen ? 'ghost' : ''), type: 'button', 'aria-pressed': String(seen), onclick: () => { if (QI.store.markVideo(v.id)) { QI.toast('Video marcado como visto: +5 puntos'); } if (rerender) rerender(); } }, seen ? 'Visto ✓' : 'Ya lo vi')));
  };
  QI.data = function (name) {
    if (!cache[name]) {
      cache[name] = fetch('data/' + name + '.json').then((r) => {
        if (!r.ok) throw new Error('No se pudo cargar ' + name);
        return r.json();
      });
    }
    return cache[name];
  };
})();
