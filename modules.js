/* Vista de módulo: teoría en tres versiones, video, simulación, ejercicios, juego y autoevaluación. */
(function () {
  const h = QI.h;
  const SECS = [['teoria', 'Teoría', 'book'], ['video', 'Video', 'video'], ['simulacion', 'Simulación', 'atom'], ['ejercicios', 'Ejercicios', 'check'], ['juego', 'Juego', 'puzzle'], ['autoevaluacion', 'Autoevaluación', 'trophy']];
  const UI = {};
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const html = (tag, props, s) => h(tag, Object.assign({}, props, { html: QI.terms(s) }));
  const letter = (i) => String.fromCharCode(65 + i);

  async function render(view, id) {
    const mods = await QI.data('modulos');
    const m = mods.find((x) => x.id === id);
    view.innerHTML = '';
    if (!m) { view.append(h('h1', {}, 'No encontramos ese módulo'), h('a', { class: 'btn primary', href: '#aprender' }, 'Volver a los módulos')); return; }
    if (!m.disponible) {
      view.append(h('div', { class: 'crumbs' }, h('a', { class: 'btn small', href: '#aprender' }, QI.icon('left'), 'Volver a los módulos')),
        h('div', { class: 'card stack' }, h('div', { class: 'mod-head' }, QI.art.moduleBadge(m.id), h('span', { class: 'modnum' }, 'Módulo ' + m.id)), h('h1', {}, m.titulo), h('span', { class: 'badge soon' }, 'Próximamente'), h('p', {}, m.descripcion),
          h('h2', {}, 'Temas que va a incluir'), h('ul', {}, m.temas.map((t) => h('li', {}, t))), h('p', { class: 'muted' }, 'La teoría de este módulo todavía no está. Mientras tanto ya podés jugar con sus contenidos.'),
          h('h2', {}, 'Juegos de este módulo'), h('div', { class: 'row' }, (await QI.games.forModule(m.id)).map((t) => h('a', { class: 'btn small', href: '#jugar-' + t + '-' + m.id }, QI.icon(QI.games.META[t].icon), QI.games.META[t].nombre)))));
      return;
    }
    const C = await QI.data('modulo-0' + id);
    const Q = await QI.data('preguntas');
    const ui = (UI[id] = UI[id] || { sec: null, ver: 'visual', block: 0, seen: new Set(), sim: new Set(), mass: 78, place: 'tierra', ex: {}, quiz: null });
    if (!ui.sec) ui.sec = SECS.map((s) => s[0]).find((s) => s !== 'video' && !QI.store.isDone(id, s)) || 'teoria';

    const pbar = h('div', { class: 'pbar' }), stepper = h('ol', { class: 'stepper', 'aria-label': 'Secciones del módulo' }), sectionBox = h('section', { 'aria-live': 'off' });
    function drawTop() {
      const pct = QI.store.modulePct(id);
      pbar.innerHTML = ''; pbar.append(h('div', { class: 'pbar-top' }, h('span', {}, 'Progreso del módulo'), h('span', {}, pct + ' %')), h('div', { class: 'progress', role: 'progressbar', 'aria-valuenow': pct, 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-label': 'Progreso del módulo' }, h('i', { style: 'width:' + pct + '%' })));
      stepper.innerHTML = '';
      SECS.forEach(([k, t, ic], i) => {
        const done = QI.store.isDone(id, k), cur = ui.sec === k;
        stepper.append(h('li', { class: (done ? 'done ' : '') + (k === 'video' ? 'na' : '') }, h('button', { type: 'button', 'aria-current': cur ? 'step' : null, onclick: () => go(k) },
          h('span', { class: 'dot' }, done ? QI.icon('check') : String(i + 1)), h('span', {}, t, done ? h('span', { class: 'sr-only' }, ' (completada)') : null))));
      });
    }
    function go(sec) { QI.tts.stop(); ui.sec = sec; drawTop(); drawSection(); QI.store.setLast('#modulo-' + id, 'Módulo ' + id + ': ' + SECS.find((s) => s[0] === sec)[1]); sectionBox.scrollIntoView && stepper.scrollIntoView({ block: 'nearest' }); }
    const next = (sec) => { const i = SECS.findIndex((s) => s[0] === sec); return i < SECS.length - 1 ? SECS[i + 1][0] : null; };
    const pager = (sec) => {
      const i = SECS.findIndex((s) => s[0] === sec), prev = i > 0 ? SECS[i - 1] : null, nx = i < SECS.length - 1 ? SECS[i + 1] : null;
      return h('div', { class: 'pager' }, prev ? h('button', { class: 'btn', type: 'button', onclick: () => go(prev[0]) }, QI.icon('left'), prev[1]) : h('span', {}),
        nx ? h('button', { class: 'btn primary', type: 'button', onclick: () => go(nx[0]) }, 'Siguiente: ' + nx[1], QI.icon('right')) : h('a', { class: 'btn primary', href: '#logros' }, 'Ver mis logros', QI.icon('trophy')));
    };

    /* ----- Teoría ----- */
    function visual(b) {
      const v = b.visual, box = h('div', { class: 'concept' });
      box.append(h('h3', {}, v.termino));
      if (v.definicion) box.append(html('p', { class: 'def' }, v.definicion));
      if (v.formula) box.append(h('div', { class: 'formula', 'aria-label': 'Fórmula: peso igual a masa por gravedad' }, v.formula));
      if (v.comparar) box.append(h('div', { class: 'versus' }, v.comparar.map(([t, d, e]) => h('div', {}, h('h4', {}, t), html('p', {}, d), h('small', {}, 'Ejemplos: ' + e)))));
      if (v.mapa) box.append(h('ul', { class: 'mapa', 'aria-label': 'Ramas de la química' }, v.mapa.map(([t, d]) => h('li', {}, h('b', {}, t), d))));
      if (v.ejemplo) box.append(h('div', { class: 'example' }, h('b', {}, 'Ejemplo'), html('p', {}, v.ejemplo)));
      if (v.nota) box.append(h('div', { class: 'nota' }, h('b', {}, 'Dato clave'), h('p', {}, v.nota)));
      return box;
    }
    function drawTeoria() {
      const b = C.bloques[ui.block];
      ui.seen.add(ui.block);
      const content = h('div', { class: 'stack' });
      if (ui.ver === 'visual') content.append(visual(b));
      else if (ui.ver === 'pasos') content.append(h('div', { class: 'concept' }, h('h3', {}, b.titulo), h('ol', { class: 'steps-list' }, b.pasos.map((p) => html('li', {}, '<span>' + p + '</span>')))));
      else {
        const state = h('span', { class: 'muted', 'aria-live': 'polite' });
        let paused = false;
        const playBtn = h('button', { class: 'btn primary', type: 'button', onclick: () => { paused = false; pauseBtn.textContent = 'Pausar'; const ok = QI.tts.speak(b.texto, { onstart: () => { state.textContent = 'Leyendo…'; }, onend: () => { state.textContent = 'Terminó la lectura.'; } }); if (ok) QI.store.count('audios'); } }, QI.icon('play'), 'Escuchar');
        const pauseBtn = h('button', { class: 'btn', type: 'button', onclick: () => { paused = !paused; paused ? QI.tts.pause() : QI.tts.resume(); pauseBtn.textContent = paused ? 'Seguir' : 'Pausar'; } }, 'Pausar');
        const stopBtn = h('button', { class: 'btn', type: 'button', onclick: () => { QI.tts.stop(); state.textContent = 'Lectura detenida.'; } }, QI.icon('stop'), 'Detener');
        content.append(h('h3', {}, b.titulo), h('div', { class: 'row' }, playBtn, pauseBtn, stopBtn, state),
          QI.tts.supported ? null : h('p', { class: 'nota' }, 'Este navegador no ofrece lectura por voz. Podés leer el texto de abajo.'),
          h('div', { class: 'audio-text' }, b.texto.split(/(?<=\.)\s+/).map((s) => h('p', {}, s))));
      }
      const sc = QI.art.scene(b.id);
      return h('div', { class: 'theory-grid focusable' }, h('div', { class: 'scene-wrap' }, sc), content);
    }
    function theory() {
      const wrap = h('div', { class: 'stack' });
      const blocksNav = h('div', { class: 'blocknav', role: 'group', 'aria-label': 'Temas de la teoría' });
      const area = h('div', { class: 'card pad-lg stack', 'aria-live': 'polite' });
      const draw = () => {
        blocksNav.innerHTML = '';
        C.bloques.forEach((b, i) => blocksNav.append(h('button', { type: 'button', class: ui.seen.has(i) ? 'seen' : '', 'aria-current': i === ui.block ? 'true' : null, 'aria-label': 'Tema ' + (i + 1) + ': ' + b.titulo, onclick: () => { QI.tts.stop(); ui.block = i; draw(); } }, String(i + 1))));
        area.innerHTML = '';
        area.append(h('div', { class: 'section-title' }, h('h2', {}, ui.block + 1 + '. ' + C.bloques[ui.block].titulo), h('span', { class: 'muted' }, 'Tema ' + (ui.block + 1) + ' de ' + C.bloques.length)), drawTeoria(),
          h('div', { class: 'pager' },
            h('button', { class: 'btn', type: 'button', disabled: ui.block === 0, onclick: () => { QI.tts.stop(); ui.block--; draw(); } }, QI.icon('left'), 'Anterior'),
            h('button', { class: 'btn primary', type: 'button', disabled: ui.block === C.bloques.length - 1, onclick: () => { QI.tts.stop(); ui.block++; draw(); } }, 'Siguiente', QI.icon('right'))));
        if (ui.seen.size === C.bloques.length && QI.store.markSection(id, 'teoria')) drawTop();
        if (ui.seen.size < C.bloques.length) area.append(h('p', { class: 'muted' }, 'Viste ' + ui.seen.size + ' de ' + C.bloques.length + ' temas. Al ver todos se completa la teoría.'));
      };
      wrap.append(
        h('div', { class: 'card stack' }, h('h2', {}, 'Elegí cómo querés estudiar'), h('div', { class: 'seg', role: 'radiogroup', 'aria-label': 'Versión de la teoría' }, [['visual', 'Visual'], ['pasos', 'Paso a paso'], ['audio', 'Audio']].map(([v, t]) => h('label', {}, h('input', { type: 'radio', name: 'ver', value: v, checked: ui.ver === v, onchange: () => { QI.tts.stop(); ui.ver = v; draw(); } }), h('span', {}, t)))),
          h('p', { class: 'muted' }, 'Es el mismo contenido en tres formatos. Podés cambiar cuando quieras.')),
        blocksNav, area, h('p', { class: 'muted' }, 'Fuente: ' + C.fuente));
      draw();
      return wrap;
    }

    /* ----- Video ----- */
    async function video() {
      const vids = (await QI.data('videos')).filter((v) => v.modulo === id);
      return h('div', { class: 'stack' }, h('div', { class: 'card stack' }, h('h2', {}, 'Videos del módulo'),
        h('div', { class: 'video-box' }, h('div', { class: 'stack', style: 'justify-items:center' }, QI.art.mascot('think', 80), h('b', {}, 'Videos recomendados'), h('p', { class: 'muted' }, 'Se abren en YouTube en una pestaña nueva. YouTube ofrece subtítulos y velocidad ajustable en su reproductor.'))),
        h('ul', { class: 'vlist' }, vids.map((v) => QI.videoItem(v))),
        h('p', { class: 'muted' }, 'Los videos son de otros autores y se abren en YouTube. Esta sección no cuenta para completar el módulo.')), pager('video'));
    }

    /* ----- Simulación ----- */
    function sim() {
      const PLACES = { tierra: ['Tierra', 1, 'g normal'], luna: ['Luna', 1 / 6, 'g = 1/6 de la terrestre'], espacio: ['Espacio exterior', 0, 'g = 0'] };
      const out = h('div', { class: 'sim-stage', 'aria-live': 'polite' }), scene = h('div', { class: 'sim-scene' }), checks = h('ul', { class: 'vlist' });
      const draw = () => {
        ui.sim.add(ui.place);
        const [name, f, gtxt] = PLACES[ui.place], w = ui.mass * f, wr = Math.round(w * 10) / 10;
        out.innerHTML = ''; scene.innerHTML = ''; scene.append(QI.art.astroPlace(ui.place));
        out.append(QI.svg('<svg viewBox="0 0 240 120" role="img" aria-label="Barras: masa ' + ui.mass + ' kg y peso ' + QI.fmtNum(wr, 1) + ' kgr en ' + name + '" xmlns="http://www.w3.org/2000/svg"><text x="0" y="14" font-size="12" fill="currentColor" font-weight="700">Masa</text><rect x="0" y="20" width="' + (ui.mass / 150) * 240 + '" height="22" rx="6" fill="var(--accent)"/><text x="0" y="68" font-size="12" fill="currentColor" font-weight="700">Peso</text><rect x="0" y="74" width="' + Math.max(0, (w / 150) * 240) + '" height="22" rx="6" fill="var(--ok)"/><rect x="0.75" y="74.75" width="238.5" height="22" rx="6" fill="none" stroke="var(--border)" stroke-width="1.5"/></svg>'),
          h('div', { class: 'readout' }, h('div', {}, 'Masa', h('b', {}, ui.mass + ' kg')), h('div', {}, 'Peso', h('b', {}, QI.fmtNum(wr, 1) + ' kgr'))),
          h('p', {}, name + ' (' + gtxt + '). ' + (f === 0 ? 'No hay atracción: el peso es cero, pero la masa sigue igual.' : f === 1 ? 'En la Tierra, masa y peso coinciden numéricamente.' : 'El peso baja a la sexta parte. La masa no cambió.')));
        checks.innerHTML = '';
        Object.entries(PLACES).forEach(([k, v]) => checks.append(h('li', {}, h('span', {}, v[0]), ui.sim.has(k) ? h('span', { class: 'badge ok' }, 'Probado') : h('span', { class: 'badge soon' }, 'Falta'))));
        if (ui.sim.size === 3 && QI.store.markSection(id, 'simulacion')) drawTop();
      };
      const wrap = h('div', { class: 'stack' }, h('div', { class: 'card stack' }, h('h2', {}, 'Masa y peso en distintos lugares'),
        h('p', {}, 'Elegí un lugar y cambiá la masa. Mirá qué cambia y qué no. Para completar la simulación, probá los tres lugares.'),
        h('div', { class: 'how-to' }, h('b', {}, 'Paso a paso'), h('ol', {}, h('li', {}, 'Elegí un lugar.'), h('li', {}, 'Mové el control de masa.'), h('li', {}, 'Comparé la barra de masa con la de peso.'), h('li', {}, 'Repetí en los otros dos lugares.'))),
        h('div', { class: 'sim' },
          h('div', { class: 'stack' },
            h('div', { class: 'seg', role: 'radiogroup', 'aria-label': 'Lugar' }, Object.entries(PLACES).map(([k, v]) => h('label', {}, h('input', { type: 'radio', name: 'place', value: k, checked: ui.place === k, onchange: () => { ui.place = k; draw(); } }), h('span', {}, v[0])))),
            h('div', { class: 'field', style: 'display:grid;gap:.4rem' }, h('label', { for: 'mass', style: 'font-weight:700' }, 'Masa del astronauta: ', h('output', { id: 'mass-o' }, ui.mass + ' kg')), h('input', { id: 'mass', type: 'range', min: 10, max: 150, step: 1, value: ui.mass, oninput: (e) => { ui.mass = Number(e.target.value); document.getElementById('mass-o').textContent = ui.mass + ' kg'; draw(); } })),
            h('div', { class: 'example' }, h('b', {}, 'Fórmula'), h('p', {}, 'Peso = masa · gravedad (P = m · g)')), checks),
          h('div', { class: 'stack' }, scene, out))), pager('simulacion'));
      draw();
      return wrap;
    }

    /* ----- Ejercicios ----- */
    function awardEx(qid) { const mm = QI.store.mod(id); mm.exAwarded = mm.exAwarded || {}; if (!mm.exAwarded[qid]) { mm.exAwarded[qid] = true; QI.store.save(); QI.store.addPoints(10); QI.toast('Respuesta correcta: +10 puntos'); } }
    function finishEx(qid, ok) { ui.ex[qid] = ok; if (ok) awardEx(qid); if (Object.keys(ui.ex).length === Q.ejercicios.length && QI.store.markSection(id, 'ejercicios')) drawTop(); }
    const fb = (ok, text) => h('div', { class: 'feedback ' + (ok ? 'ok' : 'no'), role: 'status' }, QI.art.mascot(ok ? 'cheer' : 'think', 56), h('div', {}, ok ? '¡Muy bien!' : 'Casi. Revisá la explicación.', h('p', {}, text)));

    function exOpcion(q, n) {
      const card = h('article', { class: 'card q focusable' }), res = h('div');
      const name = 'q' + q.id; let done = false;
      const opts = q.opciones.map((o, i) => h('label', { class: 'opt' }, h('input', { type: 'radio', name, value: i }), h('span', {}, o)));
      const btn = h('button', { class: 'btn primary', type: 'button', onclick: () => {
        const sel = card.querySelector('input:checked'); if (!sel) { res.innerHTML = ''; res.append(h('p', { class: 'feedback no', role: 'alert' }, 'Elegí una opción antes de comprobar.')); return; }
        const i = Number(sel.value), ok = i === q.correcta; done = true;
        opts.forEach((l, k) => { l.classList.remove('right', 'wrong'); if (k === q.correcta) l.classList.add('right'); else if (k === i) l.classList.add('wrong'); });
        res.innerHTML = ''; res.append(fb(ok, q.explicacion)); finishEx(q.id, ok);
      } }, 'Comprobar');
      card.append(h('span', { class: 'badge' }, 'Opción múltiple'), h('h3', {}, n + '. ' + q.enunciado), h('div', { class: 'how-to' }, h('b', {}, 'Paso a paso'), h('ol', {}, h('li', {}, 'Leé la pregunta.'), h('li', {}, 'Marcá una opción.'), h('li', {}, 'Tocá Comprobar.'))), h('div', { class: 'opts', role: 'radiogroup', 'aria-label': q.enunciado }, opts), btn, res);
      return card;
    }
    function exClasificar(q, n) {
      const card = h('article', { class: 'card q focusable' }), area = h('div', { class: 'stack' }), res = h('div');
      const assign = q.items.map(() => -1); let sel = null, checked = false;
      const draw = () => {
        area.innerHTML = '';
        const chip = (i) => { const cls = checked ? (assign[i] === q.items[i][1] ? 'right' : 'wrong') : ''; return h('button', { type: 'button', class: 'chipbtn ' + cls, 'aria-pressed': sel === i ? 'true' : 'false', onclick: () => { if (checked) return; sel = sel === i ? null : i; draw(); } }, q.items[i][0]); };
        const place = (b) => { if (sel === null || checked) return; assign[sel] = b; sel = null; draw(); };
        area.append(h('div', {}, h('p', { class: 'muted' }, 'Sin clasificar. Tocá un elemento y después su categoría.'), h('div', { class: 'bank', onclick: (e) => { if (e.target.classList.contains('bank')) place(-1); } }, q.items.map((_, i) => assign[i] === -1 ? chip(i) : null))),
          h('div', { class: 'buckets' }, q.categorias.map((c, b) => h('div', { class: 'bucket' }, h('button', { type: 'button', class: 'drop', onclick: () => place(b), 'aria-label': 'Poner el elemento elegido en ' + c }, c + ' (tocá para poner acá)'), h('div', { class: 'in' }, q.items.map((_, i) => assign[i] === b ? chip(i) : null))))));
      };
      const btn = h('button', { class: 'btn primary', type: 'button', onclick: () => {
        res.innerHTML = '';
        if (assign.some((a) => a === -1)) { res.append(h('p', { class: 'feedback no', role: 'alert' }, 'Todavía quedan elementos sin clasificar.')); return; }
        checked = true; const ok = assign.every((a, i) => a === q.items[i][1]); draw(); res.append(fb(ok, q.explicacion)); finishEx(q.id, ok);
      } }, 'Comprobar');
      const retry = h('button', { class: 'btn', type: 'button', onclick: () => { assign.fill(-1); checked = false; sel = null; res.innerHTML = ''; draw(); } }, 'Empezar de nuevo');
      card.append(h('span', { class: 'badge' }, 'Clasificar'), h('h3', {}, n + '. ' + q.enunciado), h('div', { class: 'how-to' }, h('b', {}, 'Paso a paso'), h('ol', {}, h('li', {}, 'Tocá un elemento.'), h('li', {}, 'Tocá el botón de la categoría donde va.'), h('li', {}, 'Repetí con todos y tocá Comprobar.'))), area, h('div', { class: 'row' }, btn, retry), res);
      draw(); return card;
    }
    function exEmparejar(q, n) {
      const card = h('article', { class: 'card q focusable' }), res = h('div');
      const defs = shuffle(q.pares.map((p) => p[1]));
      const sels = q.pares.map(([t], i) => h('select', { id: 'em' + i, 'aria-label': 'Definición de ' + t }, h('option', { value: '' }, 'Elegí una definición'), defs.map((d) => h('option', { value: d }, d))));
      const btn = h('button', { class: 'btn primary', type: 'button', onclick: () => {
        res.innerHTML = '';
        if (sels.some((s) => !s.value)) { res.append(h('p', { class: 'feedback no', role: 'alert' }, 'Falta elegir una definición en algún concepto.')); return; }
        let ok = true; sels.forEach((s, i) => { const good = s.value === q.pares[i][1]; if (!good) ok = false; s.style.borderColor = good ? 'var(--ok)' : 'var(--err)'; });
        res.append(fb(ok, q.explicacion)); finishEx(q.id, ok);
      } }, 'Comprobar');
      card.append(h('span', { class: 'badge' }, 'Emparejar'), h('h3', {}, n + '. ' + q.enunciado), h('div', { class: 'how-to' }, h('b', {}, 'Paso a paso'), h('ol', {}, h('li', {}, 'Para cada concepto, abrí la lista.'), h('li', {}, 'Elegí su definición.'), h('li', {}, 'Tocá Comprobar.'))),
        h('div', { class: 'pairs' }, q.pares.map(([t], i) => h('div', { class: 'pair' }, h('label', { for: 'em' + i, style: 'font-weight:700' }, t), sels[i]))), btn, res);
      return card;
    }
    function exAbierta(q, n) {
      const card = h('article', { class: 'card q focusable' }), res = h('div');
      const inp = h('input', { type: 'text', id: 'ab-' + q.id, autocomplete: 'off', 'aria-label': q.enunciado });
      const btn = h('button', { class: 'btn primary', type: 'button', onclick: () => {
        const v = QI.norm(inp.value); res.innerHTML = '';
        if (!v) { res.append(h('p', { class: 'feedback no', role: 'alert' }, 'Escribí tu respuesta antes de comprobar.')); return; }
        const ok = q.acepta.some((a) => v.includes(a)) && !q.rechaza.some((r) => v.includes(r));
        res.append(fb(ok, q.explicacion)); finishEx(q.id, ok);
      } }, 'Comprobar');
      card.append(h('span', { class: 'badge' }, 'Respuesta abierta'), h('h3', {}, n + '. ' + q.enunciado), h('div', { class: 'how-to' }, h('b', {}, 'Paso a paso'), h('ol', {}, h('li', {}, 'Escribí una sola palabra.'), h('li', {}, 'Tocá Comprobar.'))), inp, btn, res);
      return card;
    }
    function ejercicios() {
      const f = { opcion: exOpcion, clasificar: exClasificar, emparejar: exEmparejar, abierta: exAbierta };
      return h('div', { class: 'stack' }, h('div', { class: 'card' }, h('h2', {}, 'Ejercicios'), h('p', { class: 'muted' }, 'Son ' + Q.ejercicios.length + ' actividades de distintos tipos. Al comprobar todas se completa la sección. Cada respuesta correcta suma 10 puntos.')),
        Q.ejercicios.map((q, i) => f[q.tipo](q, i + 1)), pager('ejercicios'));
    }

    /* ----- Juego ----- */
    function juego() {
      const box = h('div', {});
      QI.games.crossword(box, { onSolved: () => { if (QI.store.markSection(id, 'juego')) drawTop(); } });
      return h('div', { class: 'stack' }, h('div', { class: 'card stack' }, h('h2', {}, 'Crucigrama del módulo'), h('p', { class: 'muted' }, 'Las palabras son las del módulo. Completarlo suma puntos y cierra esta sección.'), box), h('div', { class: 'card stack' }, h('h2', { style: 'font-size:1.05rem' }, 'Más juegos de este módulo'), h('p', { class: 'muted' }, 'Ganar cualquiera de ellos también cierra esta sección.'), h('div', { class: 'row' }, ['quiz', 'memoria', 'clasificar'].map((t) => h('a', { class: 'btn small', href: '#jugar-' + t + '-' + id }, QI.icon(QI.games.META[t].icon), QI.games.META[t].nombre)))), pager('juego'));
    }

    /* ----- Autoevaluación ----- */
    function autoeval() {
      const qs = Q.autoevaluacion, card = h('div', { class: 'card stack' }), wrap = h('div', { class: 'stack' }, card, pager('autoevaluacion'));
      const draw = () => {
        card.innerHTML = '';
        if (ui.quiz) {
          const r = ui.quiz, pct = Math.round((r.ok / qs.length) * 100);
          card.append(h('h2', {}, 'Tu resultado'), h('div', { class: 'scorebar' }, QI.art.mascot(r.ok >= 4 ? 'cheer' : 'think', 96), h('div', {}, h('div', { class: 'bigscore' }, QI.fmtNum((r.ok / qs.length) * 10, 1) + ' / 10'), h('p', {}, r.ok + ' de ' + qs.length + ' respuestas correctas')), h('button', { class: 'btn', type: 'button', onclick: () => { ui.quiz = null; draw(); } }, 'Repetir')),
            ...qs.map((q, i) => { const ok = r.ans[i] === q.correcta; return h('div', { class: 'q' }, h('h3', {}, (i + 1) + '. ' + q.enunciado), h('p', {}, 'Tu respuesta: ' + q.opciones[r.ans[i]]), fb(ok, ok ? q.explicacion : 'La correcta era: ' + q.opciones[q.correcta] + '. ' + q.explicacion)); }));
          return;
        }
        const msg = h('div', { 'aria-live': 'assertive' });
        card.append(h('h2', {}, 'Autoevaluación'), h('p', { class: 'muted' }, 'Son ' + qs.length + ' preguntas. Al entregar ves tu nota y una explicación de cada una.'),
          h('div', { class: 'how-to' }, h('b', {}, 'Paso a paso'), h('ol', {}, h('li', {}, 'Respondé las 5 preguntas.'), h('li', {}, 'Tocá Entregar.'), h('li', {}, 'Mirá tu nota y las explicaciones.'))),
          ...qs.map((q, i) => h('fieldset', { class: 'q focusable', style: 'border:0;padding:0;margin:0;min-width:0' }, h('legend', { style: 'font-family:var(--font-display);font-weight:600;font-size:1.1rem;margin-bottom:.5rem' }, (i + 1) + '. ' + q.enunciado), h('div', { class: 'opts' }, q.opciones.map((o, k) => h('label', { class: 'opt' }, h('input', { type: 'radio', name: 'ae' + i, value: k }), h('span', {}, o)))))),
          h('button', { class: 'btn primary big', type: 'button', onclick: () => {
            const ans = qs.map((_, i) => { const s = card.querySelector('input[name="ae' + i + '"]:checked'); return s ? Number(s.value) : -1; });
            const miss = ans.map((a, i) => (a < 0 ? i + 1 : null)).filter(Boolean);
            if (miss.length) { msg.innerHTML = ''; msg.append(h('p', { class: 'feedback no', role: 'alert' }, 'Falta responder: ' + miss.join(', ') + '.')); return; }
            const ok = ans.filter((a, i) => a === qs[i].correcta).length;
            ui.quiz = { ans, ok }; QI.store.quiz(Math.round((ok / qs.length) * 100)); QI.store.addPoints(ok * 5);
            if (QI.store.markSection(id, 'autoevaluacion')) drawTop();
            if (ok === qs.length) QI.emit('celebrate');
            draw(); card.scrollIntoView({ block: 'start' });
          } }, 'Entregar'), msg);
      };
      draw(); return wrap;
    }

    async function drawSection() {
      sectionBox.innerHTML = '';
      const map = { teoria: theory, video, simulacion: sim, ejercicios, juego, autoevaluacion: autoeval };
      const el = await map[ui.sec]();
      if (ui.sec === 'teoria') el.append(pager('teoria'));
      sectionBox.append(el);
    }

    const nextMod = mods.find((x) => x.id === id + 1), prevMod = mods.find((x) => x.id === id - 1);
    view.append(
      h('div', { class: 'crumbs' }, h('a', { class: 'btn small', href: '#aprender' }, QI.icon('left'), 'Volver a los módulos')),
      h('div', { class: 'card stack' }, h('div', { class: 'mod-head' }, QI.art.moduleBadge(m.id), h('span', { class: 'modnum' }, 'Módulo ' + m.id)), h('h1', {}, m.titulo), pbar),
      h('nav', { 'aria-label': 'Secciones del módulo' }, stepper), sectionBox,
      h('nav', { class: 'pager', 'aria-label': 'Navegación entre módulos' },
        prevMod ? h('a', { class: 'btn', href: '#modulo-' + prevMod.id }, QI.icon('left'), 'Módulo anterior') : h('button', { class: 'btn', type: 'button', disabled: true }, QI.icon('left'), 'Módulo anterior'),
        h('a', { class: 'btn', href: '#inicio' }, QI.icon('home'), 'Inicio'),
        nextMod && nextMod.disponible ? h('a', { class: 'btn', href: '#modulo-' + nextMod.id }, 'Módulo siguiente', QI.icon('right')) : h('button', { class: 'btn', type: 'button', disabled: true, title: 'Próximamente' }, 'Módulo siguiente (próximamente)', QI.icon('right'))));
    drawTop(); drawSection();
    QI.store.setLast('#modulo-' + id, 'Módulo ' + id + ': ' + m.titulo);
  }
  QI.modules = { render, SECS };
})();
