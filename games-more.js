/* Juegos de todos los módulos: quiz, memoria, clasificar, fórmulas, balancear y calcular.
   Contenido en data/juegos.json (fuente: Módulo de Química 2023, UNSL). */
(function () {
  const h = QI.h, G = QI.games;
  const LEVELS = [['facil', 'Fácil'], ['medio', 'Medio'], ['dificil', 'Difícil']];
  const PTS = { facil: 10, medio: 20, dificil: 30 };
  G.META = {
    crucigrama: { nombre: 'Crucigrama', icon: 'puzzle', desc: 'Completá palabras clave a partir de pistas.' },
    quiz: { nombre: 'Quiz', icon: 'help', desc: 'Preguntas de opción múltiple con explicación.' },
    memoria: { nombre: 'Memoria', icon: 'atom', desc: 'Encontrá las parejas de cartas.' },
    clasificar: { nombre: 'Clasificar', icon: 'book', desc: 'Llevá cada elemento a su categoría.' },
    formulas: { nombre: 'Armar fórmulas', icon: 'flask', desc: 'Elegí los subíndices de cada compuesto.' },
    balancear: { nombre: 'Balancear', icon: 'scale', desc: 'Ajustá los coeficientes de cada reacción.' },
    calcular: { nombre: 'Calcular', icon: 'pin', desc: 'Resolvé problemas numéricos cortos.' }
  };
  G.ORDER = ['crucigrama', 'quiz', 'memoria', 'clasificar', 'formulas', 'balancear', 'calcular'];
  G.forModule = async function (mod) { const D = await QI.data('juegos'); return G.ORDER.filter((t) => D[mod] && D[mod][t]); };

  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  /* Fórmulas con subíndices y cargas */
  function chem(str) {
    const f = document.createDocumentFragment();
    String(str).split(/(\d+)/).forEach((p, i) => { if (!p) return; f.append(i % 2 ? h('sub', {}, p) : document.createTextNode(p)); });
    return f;
  }
  const ion = (s, c) => h('span', {}, chem(s), h('sup', {}, (Math.abs(c) === 1 ? '' : Math.abs(c)) + (c > 0 ? '+' : '−')));
  const plain = (s) => String(s);
  const uni = (s) => String(s).replace(/\d+/g, (d) => d.split('').map((x) => '₀₁₂₃₄₅₆₇₈₉'[x]).join(''));

  /* Marco común: nivel, instrucciones, resultado */
  async function frame(box, tipo, mod, opts, runner) {
    let level = opts.level || 'facil';
    const wrap = h('div', { class: 'stack' }), area = h('div', { class: 'stack' });
    box.innerHTML = ''; box.append(wrap);
    function start() {
      area.innerHTML = '';
      const how = h('div', { class: 'how-to' }, h('b', {}, 'Cómo se juega'), h('ol', {}, ...opts.how.map((t) => h('li', {}, t))));
      wrap.innerHTML = '';
      wrap.append(
        h('div', { class: 'row' }, h('span', { style: 'font-weight:700' }, 'Nivel:'),
          h('div', { class: 'seg', role: 'radiogroup', 'aria-label': 'Nivel de dificultad' }, LEVELS.map(([v, t]) => h('label', {}, h('input', { type: 'radio', name: 'lv-' + tipo, value: v, checked: v === level, onchange: () => { level = v; start(); } }), h('span', {}, t))))),
        h('p', { class: 'muted' }, opts.levelText[level]), how, area);
      runner(area, level, (pct, extra) => result(area, tipo, mod, level, pct, extra, start));
    }
    start();
  }
  function result(area, tipo, mod, level, pct, extra, again) {
    const won = pct >= 60;
    const key = tipo + '-' + mod + '-' + level;
    let first = false;
    const pts = PTS[level] + (pct === 100 ? 10 : 0);
    if (won) { first = QI.store.awardGame(key, pts, pct); if (mod === 1) QI.store.markSection(1, 'juego'); QI.emit('celebrate'); }
    const msg = won
      ? '¡Muy bien! Resultado: ' + pct + ' %. ' + (first ? 'Ganaste ' + pts + ' puntos.' : 'Ya habías ganado los puntos de este nivel.')
      : 'Resultado: ' + pct + ' %. Para ganar puntos hace falta llegar al 60 %. Podés volver a intentarlo.';
    area.append(h('div', { class: 'feedback ' + (won ? 'ok' : 'no'), role: 'status' }, h('div', { class: 'row' }, QI.art.mascot(won ? 'cheer' : 'think', 56), h('div', {}, msg, extra ? h('p', {}, extra) : null))),
      h('div', { class: 'row' }, h('button', { class: 'btn primary', type: 'button', onclick: again }, 'Jugar de nuevo'), h('a', { class: 'btn', href: '#jugar' }, 'Otros juegos')));
    const f = area.querySelector('.feedback'); if (f) { f.setAttribute('tabindex', '-1'); f.focus({ preventScroll: false }); }
  }

  /* ---------- Quiz ---------- */
  function quiz(area, level, done, D) {
    let qs = shuffle(D.quiz); if (level === 'facil') qs = qs.slice(0, 5);
    let i = 0, score = 0; const wrong = [];
    const imm = level !== 'dificil';
    function show() {
      area.innerHTML = '';
      const q = qs[i], opts = shuffle([q.ok, ...q.mal]);
      const radios = opts.map((t, k) => h('label', { class: 'opt' }, h('input', { type: 'radio', name: 'q' + i, value: t, onchange: () => { go.disabled = false; } }), h('span', {}, t)));
      const go = h('button', { class: 'btn primary', type: 'button', disabled: true }, 'Responder');
      const fb = h('div', { 'aria-live': 'polite' });
      const hint = level === 'facil' ? h('button', { class: 'btn', type: 'button' }, 'Pista: descartar dos opciones') : null;
      if (hint) hint.addEventListener('click', () => {
        const bad = radios.filter((l) => l.querySelector('input').value !== q.ok); shuffle(bad).slice(0, 2).forEach((l) => { const inp = l.querySelector('input'); inp.disabled = true; inp.checked = false; l.classList.add('off'); });
        hint.disabled = true; go.disabled = !radios.some((l) => l.querySelector('input').checked);
      });
      go.addEventListener('click', () => {
        const val = radios.map((l) => l.querySelector('input')).find((x) => x.checked).value, ok = val === q.ok;
        if (ok) score++; else wrong.push({ q, val });
        radios.forEach((l) => { l.querySelector('input').disabled = true; if (imm) { const t = l.querySelector('input').value; if (t === q.ok) l.classList.add('right'); else if (t === val) l.classList.add('wrong'); } });
        go.remove(); if (hint) hint.remove();
        const next = h('button', { class: 'btn primary', type: 'button', onclick: () => { i++; if (i < qs.length) show(); else end(); } }, i + 1 < qs.length ? 'Siguiente' : 'Ver resultado');
        if (imm) fb.append(h('div', { class: 'feedback ' + (ok ? 'ok' : 'no') }, ok ? '¡Correcto!' : 'No es esa. La respuesta es: ' + q.ok, h('p', {}, q.expl)));
        fb.append(next); next.focus();
      });
      area.append(h('div', { class: 'pbar' }, h('div', { class: 'pbar-top' }, h('span', {}, 'Pregunta ' + (i + 1) + ' de ' + qs.length), h('span', {}, score + ' correctas')), h('div', { class: 'progress', role: 'progressbar', 'aria-valuenow': i, 'aria-valuemin': 0, 'aria-valuemax': qs.length, 'aria-label': 'Avance del quiz' }, h('i', { style: 'width:' + Math.round(i / qs.length * 100) + '%' }))),
        h('fieldset', { class: 'card stack q' }, h('legend', {}, q.q), ...radios), h('div', { class: 'row' }, go, hint), fb);
    }
    function end() {
      area.innerHTML = '';
      const pct = Math.round(score / qs.length * 100);
      if (!imm && wrong.length) area.append(h('div', { class: 'card stack' }, h('h3', {}, 'Para repasar'), ...wrong.map((w) => h('div', { class: 'stack' }, h('b', {}, w.q.q), h('span', {}, 'Tu respuesta: ' + w.val), h('span', {}, 'Correcta: ' + w.q.ok), h('span', { class: 'muted' }, w.q.expl)))));
      done(pct, score + ' de ' + qs.length + ' correctas.');
    }
    show();
  }

  /* ---------- Memoria ---------- */
  function memoria(area, level, done, D) {
    const n = { facil: 4, medio: 6, dificil: 8 }[level];
    const pairs = shuffle(D.memoria).slice(0, n);
    const cards = shuffle(pairs.flatMap((p, k) => [{ k, t: p[0], side: 'a' }, { k, t: p[1], side: 'b' }]));
    let open = [], matched = 0, moves = 0, timer = null, lock = false;
    const status = h('p', { 'aria-live': 'polite', class: 'muted' }, 'Tocá una carta para darla vuelta.');
    const info = h('p', { class: 'muted' }, 'Intentos: 0 · Parejas: 0 de ' + n);
    const btns = cards.map((c, idx) => {
      const b = h('button', { type: 'button', class: 'mem', 'data-state': 'down', 'aria-label': 'Carta ' + (idx + 1) + ', boca abajo' }, h('span', { class: 'mem-face' }, '?'));
      b.addEventListener('click', () => flip(idx)); c.el = b; return b;
    });
    function show(c, idx, on) { c.el.dataset.state = on ? 'up' : 'down'; c.el.firstChild.textContent = on ? plain(c.t) : '?'; c.el.setAttribute('aria-label', 'Carta ' + (idx + 1) + (on ? ': ' + plain(c.t) : ', boca abajo')); }
    function hideOpen() { clearTimeout(timer); open.forEach((i) => show(cards[i], i, false)); open = []; lock = false; status.textContent = 'Seguí buscando.'; }
    function flip(idx) {
      const c = cards[idx];
      if (open.length === 2) { hideOpen(); }
      if (c.el.dataset.state !== 'down') return;
      show(c, idx, true); open.push(idx);
      if (open.length === 2) {
        moves++;
        const [a, b] = open.map((i) => cards[i]);
        if (a.k === b.k && a.side !== b.side) {
          open.forEach((i) => { cards[i].el.dataset.state = 'done'; cards[i].el.disabled = true; }); open = []; matched++;
          status.textContent = '¡Pareja! ' + plain(a.t) + ' va con ' + plain(b.t) + '.';
          if (matched === n) { const pct = moves <= n + 2 ? 100 : 80; done(pct, 'Lo resolviste en ' + moves + ' intentos.'); }
        } else { status.textContent = 'No coinciden. Tocá otra carta o esperá un momento para taparlas.'; timer = setTimeout(hideOpen, 2500); }
        info.textContent = 'Intentos: ' + moves + ' · Parejas: ' + matched + ' de ' + n;
      }
    }
    area.append(info, h('div', { class: 'mem-grid', style: '--cols:' + (n <= 4 ? 4 : 4) }, ...btns), status);
  }

  /* ---------- Clasificar ---------- */
  function clasificar(area, level, done, D) {
    const rounds = D.clasificar; let r = 0;
    function round() {
      area.innerHTML = '';
      const R = rounds[r];
      const items = shuffle(R.items.map(([t, c], id) => ({ id, t, c, at: null, first: null })));
      let sel = null, correctFirst = 0, placed = 0, checked = false;
      const msg = h('p', { 'aria-live': 'polite', class: 'muted' }, 'Elegí un elemento y después la categoría donde va.');
      const pool = h('div', { class: 'chips', role: 'group', 'aria-label': 'Elementos para clasificar' });
      const boxes = R.cats.map((name, ci) => {
        const list = h('div', { class: 'chips' });
        const place = h('button', { class: 'btn', type: 'button', onclick: () => put(ci) }, 'Poner acá');
        return { name, list, el: h('section', { class: 'card stack bucket', 'aria-label': 'Categoría ' + name }, h('h3', {}, name), list, place), place };
      });
      function draw() {
        pool.innerHTML = ''; boxes.forEach((b) => (b.list.innerHTML = ''));
        items.forEach((it) => {
          const b = h('button', { type: 'button', class: 'chip' + (sel === it ? ' sel' : '') + (it.mark ? ' ' + it.mark : ''), 'aria-pressed': String(sel === it) }, plain(it.t));
          b.addEventListener('click', () => { if (checked) return; if (it.at !== null && level === 'dificil') { it.at = null; placed--; sel = null; msg.textContent = 'Devolviste «' + plain(it.t) + '». Elegí otro lugar.'; } else if (it.at === null) { sel = sel === it ? null : it; } draw(); });
          if (it.at === null) pool.append(b); else boxes[it.at].list.append(b);
        });
        boxes.forEach((b) => (b.place.disabled = !sel || checked));
        check.hidden = level !== 'dificil'; check.disabled = placed < items.length || checked;
      }
      function put(ci) {
        if (!sel) return;
        const it = sel; const ok = it.c === ci;
        if (level === 'dificil') { it.at = ci; placed++; sel = null; msg.textContent = 'Colocado. Podés tocarlo para devolverlo antes de comprobar.'; draw(); return; }
        if (it.first === null) { it.first = ok; if (ok) correctFirst++; }
        if (ok) { it.at = ci; placed++; sel = null; it.mark = 'good'; msg.textContent = '¡Bien! «' + plain(it.t) + '» va en ' + R.cats[ci] + '.'; }
        else { msg.textContent = level === 'facil' ? '«' + plain(it.t) + '» no va en ' + R.cats[ci] + '. Probá con otra categoría.' : 'No es ahí. Probá de nuevo.'; }
        draw();
        if (placed === items.length) finish();
      }
      const check = h('button', { class: 'btn primary', type: 'button', onclick: () => {
        checked = true; items.forEach((it) => { const ok = it.c === it.at; it.mark = ok ? 'good' : 'bad'; if (ok) correctFirst++; });
        draw(); const wrong = items.filter((it) => it.c !== it.at);
        msg.textContent = wrong.length ? 'Para revisar: ' + wrong.map((it) => plain(it.t) + ' → ' + R.cats[it.c]).join('; ') + '.' : '¡Todo en su lugar!';
        finish();
      } }, 'Comprobar');
      function finish() {
        const pct = level === 'dificil' ? Math.round(correctFirst / items.length * 100) : 100;
        const extra = (level === 'dificil' ? correctFirst + ' de ' + items.length + ' bien.' : 'Acertaste a la primera ' + correctFirst + ' de ' + items.length + '.') + (R.nota ? ' ' + R.nota : '');
        if (r + 1 < rounds.length) { area.append(h('div', { class: 'feedback ok', role: 'status' }, 'Ronda completa. ' + extra), h('button', { class: 'btn primary', type: 'button', onclick: () => { r++; round(); } }, 'Ir a la ronda ' + (r + 2))); }
        else done(pct, extra);
      }
      area.append(h('h3', {}, (rounds.length > 1 ? 'Ronda ' + (r + 1) + ' de ' + rounds.length + ': ' : '') + R.titulo), msg, pool, h('div', { class: 'grid' }, ...boxes.map((b) => b.el)), check);
      draw();
    }
    round();
  }

  /* ---------- Armar fórmulas (módulo 9) ---------- */
  function formulas(area, level, done, D) {
    const F = D.formulas, list = F.items, idxs = shuffle(F.niveles[level]).map((k) => list[k]);
    let i = 0, ok1 = 0;
    function formulaNode(parts, vals) {
      const f = document.createDocumentFragment();
      parts.forEach((p, k) => { const n = vals[k]; const body = chem(p.s); if (p.p && n > 1) { f.append('(', body, ')'); } else f.append(body); if (n > 1) f.append(h('sub', {}, n)); });
      return h('span', { class: 'formula' }, f);
    }
    function show() {
      area.innerHTML = '';
      const it = idxs[i], vals = it.partes.map(() => 1); let tried = false;
      const preview = h('div', { class: 'formula-big', 'aria-live': 'polite' });
      const fb = h('div', { 'aria-live': 'polite' });
      const draw = () => { preview.innerHTML = ''; preview.append(formulaNode(it.partes, vals)); };
      const steppers = it.partes.map((p, k) => {
        const out = h('output', { class: 'n' }, '1');
        const set = (d) => { vals[k] = Math.min(5, Math.max(1, vals[k] + d)); out.textContent = vals[k]; draw(); };
        return h('div', { class: 'card stack part' }, h('div', { class: 'ion' }, level === 'dificil' ? chem(p.s) : ion(p.s, p.c)), h('div', { class: 'row', role: 'group', 'aria-label': 'Subíndice de ' + p.s }, h('button', { class: 'btn small', type: 'button', 'aria-label': 'Restar uno al subíndice de ' + p.s, onclick: () => set(-1) }, '−'), out, h('button', { class: 'btn small', type: 'button', 'aria-label': 'Sumar uno al subíndice de ' + p.s, onclick: () => set(1) }, '+')));
      });
      const go = h('button', { class: 'btn primary', type: 'button' }, 'Comprobar');
      go.addEventListener('click', () => {
        const ok = it.partes.every((p, k) => p.n === vals[k]);
        if (!tried) { tried = true; if (ok) ok1++; }
        fb.innerHTML = '';
        if (ok) {
          go.disabled = true; steppers.forEach((s) => s.querySelectorAll('button').forEach((b) => (b.disabled = true)));
          const nx = h('button', { class: 'btn primary', type: 'button', onclick: () => { i++; if (i < idxs.length) show(); else { area.innerHTML = ''; done(Math.round(ok1 / idxs.length * 100), ok1 + ' de ' + idxs.length + ' a la primera.'); } } }, i + 1 < idxs.length ? 'Siguiente' : 'Ver resultado');
          fb.append(h('div', { class: 'feedback ok' }, '¡Correcto! ', h('span', {}, it.nombre + ': '), formulaNode(it.partes, vals)), nx); nx.focus();
        } else fb.append(h('div', { class: 'feedback no' }, 'Todavía no. Revisá que la suma de cargas dé cero: ' + (level === 'dificil' ? 'pensá en las cargas habituales de cada ion.' : 'el subíndice de cada ion es la carga, sin signo, del otro (después se simplifica).')));
      });
      area.append(h('div', { class: 'pbar' }, h('div', { class: 'pbar-top' }, h('span', {}, 'Compuesto ' + (i + 1) + ' de ' + idxs.length), h('span', {}, ok1 + ' a la primera'))),
        h('h3', {}, 'Armá la fórmula de: ' + it.nombre), h('div', { class: 'row part-row' }, ...steppers), preview, go, fb);
      draw();
    }
    show();
  }

  /* ---------- Balancear (módulo 10) ---------- */
  function parse(f) {
    const st = [{}]; let k = 0;
    while (k < f.length) {
      const ch = f[k];
      if (ch === '(') { st.push({}); k++; }
      else if (ch === ')') { k++; const m = /^\d+/.exec(f.slice(k)); const n = m ? Number(m[0]) : 1; if (m) k += m[0].length; const top = st.pop(); for (const e in top) st[st.length - 1][e] = (st[st.length - 1][e] || 0) + top[e] * n; }
      else { const m = /^[A-Z][a-z]?/.exec(f.slice(k)); const el = m[0]; k += el.length; const m2 = /^\d+/.exec(f.slice(k)); const n = m2 ? Number(m2[0]) : 1; if (m2) k += m2[0].length; st[st.length - 1][el] = (st[st.length - 1][el] || 0) + n; }
    }
    return st[0];
  }
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  function balancear(area, level, done, D) {
    const B = D.balancear, eqs = shuffle(B.niveles[level]).map((k) => B.ecs[k]);
    let i = 0, ok1 = 0;
    function show() {
      area.innerHTML = '';
      const E = eqs[i], sp = [...E.rea, ...E.pro], co = sp.map(() => 1); let tried = false;
      const els = [...new Set(sp.flatMap((f) => Object.keys(parse(f))))];
      const counts = () => { const L = {}, R = {}; sp.forEach((f, k) => { const p = parse(f); for (const e in p) { const t = k < E.rea.length ? L : R; t[e] = (t[e] || 0) + p[e] * co[k]; } }); return [L, R]; };
      const table = h('div', { class: 'card', 'aria-live': 'polite' });
      const drawTable = (force) => {
        table.innerHTML = '';
        if (level !== 'facil' && !force) { table.append(h('p', { class: 'muted' }, 'En este nivel el conteo de átomos aparece al comprobar.')); return; }
        const [L, R] = counts();
        table.append(h('table', { class: 'atoms' }, h('caption', {}, 'Átomos de cada elemento'), h('thead', {}, h('tr', {}, h('th', {}, 'Elemento'), h('th', {}, 'Reactivos'), h('th', {}, 'Productos'), h('th', {}, ''))),
          h('tbody', {}, ...els.map((e) => h('tr', {}, h('td', {}, e), h('td', {}, L[e] || 0), h('td', {}, R[e] || 0), h('td', {}, (L[e] || 0) === (R[e] || 0) ? '✓ igual' : '✗ distinto'))))));
      };
      const outs = [];
      const cell = (f, k) => {
        const out = h('output', { class: 'n' }, '1'); outs.push(out);
        const set = (d) => { co[k] = Math.min(9, Math.max(1, co[k] + d)); out.textContent = co[k]; drawTable(false); };
        return h('div', { class: 'sp' }, h('div', { class: 'row', role: 'group', 'aria-label': 'Coeficiente de ' + uni(f) }, h('button', { class: 'btn small', type: 'button', 'aria-label': 'Restar uno al coeficiente de ' + uni(f), onclick: () => set(-1) }, '−'), out, h('button', { class: 'btn small', type: 'button', 'aria-label': 'Sumar uno al coeficiente de ' + uni(f), onclick: () => set(1) }, '+')), h('span', { class: 'formula' }, chem(f)));
      };
      const eq = h('div', { class: 'eq' }, ...E.rea.flatMap((f, k) => [k ? h('span', { class: 'op' }, '+') : null, cell(f, k)]), h('span', { class: 'op', 'aria-label': 'produce' }, '→'), ...E.pro.flatMap((f, k) => [k ? h('span', { class: 'op' }, '+') : null, cell(f, E.rea.length + k)]));
      const fb = h('div', { 'aria-live': 'polite' });
      const go = h('button', { class: 'btn primary', type: 'button' }, 'Comprobar');
      go.addEventListener('click', () => {
        const [L, R] = counts(); const bal = els.every((e) => (L[e] || 0) === (R[e] || 0)); const min = co.reduce(gcd) === 1;
        drawTable(true); fb.innerHTML = '';
        const good = bal && min; if (!tried) { tried = true; if (good) ok1++; }
        if (good) {
          go.disabled = true; area.querySelectorAll('.sp button').forEach((b) => (b.disabled = true));
          const nx = h('button', { class: 'btn primary', type: 'button', onclick: () => { i++; if (i < eqs.length) show(); else { area.innerHTML = ''; done(Math.round(ok1 / eqs.length * 100), ok1 + ' de ' + eqs.length + ' a la primera.'); } } }, i + 1 < eqs.length ? 'Siguiente' : 'Ver resultado');
          fb.append(h('div', { class: 'feedback ok' }, '¡Balanceada! Hay los mismos átomos de cada elemento a los dos lados.'), nx); nx.focus();
        } else fb.append(h('div', { class: 'feedback no' }, bal ? 'Está balanceada, pero se puede simplificar: usá los coeficientes enteros más chicos.' : 'Todavía no: revisá los elementos marcados con ✗. Recordá cambiar solo los coeficientes, nunca los subíndices.'));
      });
      area.append(h('div', { class: 'pbar' }, h('div', { class: 'pbar-top' }, h('span', {}, 'Ecuación ' + (i + 1) + ' de ' + eqs.length), h('span', {}, ok1 + ' a la primera'))), eq, table, go, fb);
      drawTable(false);
    }
    show();
  }

  /* ---------- Calcular (módulos 6, 7 y 11) ---------- */
  function calcular(area, level, done, D) {
    const target = { facil: 1, medio: 2, dificil: 3 }[level];
    const qs = shuffle(D.calcular).sort((a, b) => Math.abs(a.nivel - target) - Math.abs(b.nivel - target)).slice(0, 5);
    let i = 0, pts = 0;
    function show() {
      area.innerHTML = '';
      const q = qs[i]; let tries = 0;
      const inp = h('input', { type: 'text', inputmode: 'decimal', autocomplete: 'off', id: 'ans', 'aria-describedby': 'unit' });
      const fb = h('div', { 'aria-live': 'polite' });
      const hint = level !== 'dificil' ? h('p', { class: 'muted' }, 'Pista: ' + q.pista) : null;
      const go = h('button', { class: 'btn primary', type: 'button' }, 'Comprobar');
      function next() { i++; if (i < qs.length) show(); else { area.innerHTML = ''; done(Math.round(pts / qs.length * 100), 'Sumaste ' + pts + ' de ' + qs.length + ' puntos de acierto.'); } }
      go.addEventListener('click', () => {
        const x = Number(String(inp.value).trim().replace(',', '.'));
        fb.innerHTML = '';
        if (!isFinite(x) || inp.value.trim() === '') { fb.append(h('div', { class: 'feedback no' }, 'Escribí un número. Podés usar coma o punto.')); return; }
        tries++;
        const ok = Math.abs(x - q.a) <= Math.max(Math.abs(q.a) * q.tol, 1e-9);
        if (ok) { pts += tries === 1 ? 1 : 0.5; end(true); }
        else if (tries >= 2) end(false);
        else fb.append(h('div', { class: 'feedback no' }, 'No es ese valor. Probá una vez más.'));
      });
      function end(ok) {
        go.disabled = true; inp.disabled = true;
        fb.innerHTML = ''; fb.append(h('div', { class: 'feedback ' + (ok ? 'ok' : 'no') }, ok ? '¡Correcto!' : 'La respuesta es ' + String(q.a).replace('.', ',') + ' ' + q.u + '.', h('p', {}, 'Resolución: ' + q.res)));
        const nx = h('button', { class: 'btn primary', type: 'button', onclick: next }, i + 1 < qs.length ? 'Siguiente' : 'Ver resultado'); fb.append(nx); nx.focus();
      }
      inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') go.click(); });
      area.append(h('div', { class: 'pbar' }, h('div', { class: 'pbar-top' }, h('span', {}, 'Problema ' + (i + 1) + ' de ' + qs.length), h('span', {}, ''))),
        h('div', { class: 'card stack' }, h('label', { for: 'ans', style: 'font-weight:700' }, q.q), h('div', { class: 'row' }, inp, h('span', { id: 'unit' }, q.u))), hint, h('p', { class: 'muted' }, 'Tenés dos intentos. Podés escribir 2,5 o 2.5.'), go, fb);
    }
    show();
  }

  const RUN = {
    quiz: { fn: quiz, how: ['Leé la pregunta y elegí una opción.', 'Tocá Responder.', 'Leé la explicación y seguí con la próxima.'], levelText: { facil: '5 preguntas, con pista y explicación después de cada una.', medio: '8 preguntas con explicación después de cada una.', dificil: '8 preguntas. La corrección aparece al final.' } },
    memoria: { fn: memoria, how: ['Tocá una carta para darla vuelta y después otra.', 'Cada pareja une un término con su significado.', 'Si no coinciden, se vuelven a tapar.'], levelText: { facil: '4 parejas.', medio: '6 parejas.', dificil: '8 parejas.' } },
    clasificar: { fn: clasificar, how: ['Tocá un elemento para elegirlo.', 'Tocá «Poner acá» en la categoría que le corresponde.', 'Terminás cuando todos están en su lugar.'], levelText: { facil: 'Te avisa enseguida si acertaste y podés probar de nuevo.', medio: 'Te avisa enseguida si acertaste.', dificil: 'Se corrige al final con el botón Comprobar. Podés devolver un elemento antes.' } },
    formulas: { fn: formulas, how: ['Cada ion tiene una carga. La fórmula debe quedar neutra.', 'Elegí el subíndice de cada ion con + y −.', 'Tocá Comprobar.'], levelText: { facil: '4 compuestos sencillos, con las cargas a la vista.', medio: '5 compuestos con las cargas a la vista.', dificil: '5 compuestos sin las cargas: tenés que recordarlas.' } },
    balancear: { fn: balancear, how: ['Cambiá solo los coeficientes con + y −.', 'Tiene que haber los mismos átomos de cada elemento a los dos lados.', 'Usá los números enteros más chicos y tocá Comprobar.'], levelText: { facil: '5 ecuaciones sencillas, con el conteo de átomos en vivo.', medio: '5 ecuaciones. El conteo aparece al comprobar.', dificil: '5 ecuaciones más largas. El conteo aparece al comprobar.' } },
    calcular: { fn: calcular, how: ['Leé el problema y escribí el resultado.', 'Tenés dos intentos.', 'Al final de cada problema ves la resolución.'], levelText: { facil: '5 problemas cortos con pista.', medio: '5 problemas con pista.', dificil: '5 problemas más largos, sin pista.' } }
  };

  /* Punto de entrada */
  G.play = async function (box, tipo, mod, opts) {
    opts = opts || {};
    const D = (await QI.data('juegos'))[mod];
    if (!D || !D[tipo]) { box.innerHTML = ''; box.append(h('p', {}, 'Este juego todavía no existe para el módulo ' + mod + '.')); return; }
    if (tipo === 'crucigrama') return G.crossword(box, { mod, onSolved: () => { if (mod === 1) QI.store.markSection(1, 'juego'); } });
    const R = RUN[tipo];
    return frame(box, tipo, mod, { how: R.how, levelText: R.levelText, level: opts.level }, (area, level, fin) => R.fn(area, level, fin, D));
  };
})();
