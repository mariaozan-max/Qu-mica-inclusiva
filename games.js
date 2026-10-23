/* Juegos. Fase 1: crucigrama con tres niveles de dificultad. */
(function () {
  const h = QI.h;

  QI.games = {
    CATALOGO: [
      { id: 'crucigrama', nombre: 'Crucigrama', icon: 'puzzle', desc: 'Completá palabras clave a partir de pistas.', modulos: 'Todos los módulos', disponible: true },
      { id: 'quiz', nombre: 'Quiz', icon: 'help', desc: 'Preguntas de opción múltiple con respuesta inmediata.', modulos: 'Todos los módulos', disponible: false },
      { id: 'memoria', nombre: 'Memoria', icon: 'atom', desc: 'Emparejá cada símbolo con su nombre.', modulos: 'Módulos 6 y 7', disponible: false },
      { id: 'arrastrar', nombre: 'Arrastrar y soltar', icon: 'flask', desc: 'Armá fórmulas químicas.', modulos: 'Módulos 9 y 10', disponible: false },
      { id: 'balancear', nombre: 'Balancear ecuaciones', icon: 'scale', desc: 'Ajustá los coeficientes de cada reacción.', modulos: 'Módulo 10', disponible: false },
      { id: 'clasificar', nombre: 'Clasificar sustancias', icon: 'book', desc: 'Llevá cada sustancia a su categoría.', modulos: 'Módulos 3, 4 y 9', disponible: false }
    ],

    async crossword(box, opts) {
      opts = opts || {};
      const mod = opts.mod || 1;
      const D = (await QI.data('juegos'))[mod].crucigrama;
      const LEVELS = [['facil', 'Fácil'], ['medio', 'Medio'], ['dificil', 'Difícil']];
      let level = opts.level || 'facil';
      const mount = h('div', { class: 'stack' });
      box.innerHTML = ''; box.append(mount);

      function build() {
        mount.innerHTML = '';
        const cells = new Map(); // "r,c" -> {r,c,ch,input,words:[],n}
        const key = (r, c) => r + ',' + c;
        D.words.forEach((w) => {
          for (let i = 0; i < w.answer.length; i++) {
            const r = w.r + (w.dir === 'v' ? i : 0), c = w.c + (w.dir === 'h' ? i : 0), k = key(r, c);
            if (!cells.has(k)) cells.set(k, { r, c, ch: w.answer[i], words: [], n: 0, input: null });
            cells.get(k).words.push({ w, i });
          }
          cells.get(key(w.r, w.c)).n = w.n;
        });
        let curWord = D.words[0], curCell = null, hints = 0, revealed = false, solved = false;
        const wordCells = (w) => w.answer.split('').map((_, i) => cells.get(key(w.r + (w.dir === 'v' ? i : 0), w.c + (w.dir === 'h' ? i : 0))));

        const status = h('div', { class: 'card', 'aria-live': 'polite', style: 'display:grid;gap:.25rem' });
        const banner = h('div', { 'aria-live': 'polite' });
        const grid = h('div', { class: 'cw', role: 'group', 'aria-label': 'Crucigrama de química, ' + D.rows + ' filas y ' + D.cols + ' columnas', style: 'grid-template-columns:repeat(' + D.cols + ',var(--cell))' });
        const clueBtns = new Map();

        for (let r = 0; r < D.rows; r++) for (let c = 0; c < D.cols; c++) {
          const cell = cells.get(key(r, c));
          if (!cell) { grid.append(h('div', { class: 'cw-cell void', 'aria-hidden': 'true' })); continue; }
          const names = cell.words.map((x) => x.w.n + ' ' + (x.w.dir === 'h' ? 'horizontal' : 'vertical')).join(' y ');
          const input = h('input', { type: 'text', maxlength: 2, autocomplete: 'off', autocapitalize: 'characters', spellcheck: 'false', tabindex: '-1', 'aria-label': 'Fila ' + (r + 1) + ', columna ' + (c + 1) + '. Palabra ' + names });
          cell.input = input;
          input.addEventListener('focus', () => select(cell, false));
          input.addEventListener('click', () => { if (curCell === cell && cell.words.length > 1) select(cell, true); });
          input.addEventListener('input', () => {
            const v = input.value.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z]/g, '');
            input.value = v.slice(-1);
            input.classList.remove('bad', 'good');
            if (input.value) step(cell, 1);
            after();
          });
          input.addEventListener('keydown', (e) => {
            const mv = { ArrowRight: [0, 1, 'h'], ArrowLeft: [0, -1, 'h'], ArrowDown: [1, 0, 'v'], ArrowUp: [-1, 0, 'v'] }[e.key];
            if (mv) { e.preventDefault(); const nx = cells.get(key(cell.r + mv[0], cell.c + mv[1])); if (nx) { const dirOk = nx.words.find((x) => x.w.dir === mv[2]); if (dirOk) curWord = dirOk.w; nx.input.focus(); } return; }
            if (e.key === 'Backspace') { e.preventDefault(); if (input.readOnly) { step(cell, -1); return; } if (input.value) { input.value = ''; input.classList.remove('bad', 'good'); after(); } else { step(cell, -1, true); } return; }
            if (e.key === 'Delete') { e.preventDefault(); if (!input.readOnly) { input.value = ''; after(); } }
          });
          cell.input = input;
          grid.append(h('div', { class: 'cw-cell' }, input, cell.n ? h('span', { class: 'n', 'aria-hidden': 'true' }, cell.n) : null));
        }

        function step(cell, d, clear) {
          const idx = cell.words.find((x) => x.w === curWord) || cell.words[0];
          const list = wordCells(idx.w), i = list.indexOf(cell) + d;
          if (i >= 0 && i < list.length) { curWord = idx.w; list[i].input.focus(); if (clear && !list[i].input.readOnly) { list[i].input.value = ''; list[i].input.classList.remove('bad', 'good'); after(); } }
        }
        function select(cell, toggle) {
          curCell = cell;
          const inDir = cell.words.find((x) => x.w === curWord);
          if (toggle || !inDir) { const other = cell.words.find((x) => x.w !== curWord); curWord = (other || cell.words[0]).w; }
          cells.forEach((cc) => { cc.input.tabIndex = cc === cell ? 0 : -1; cc.input.classList.remove('hl', 'cur'); });
          wordCells(curWord).forEach((cc) => cc.input.classList.add('hl'));
          cell.input.classList.add('cur'); cell.input.classList.remove('hl');
          status.innerHTML = '';
          status.append(h('b', {}, curWord.n + ' ' + (curWord.dir === 'h' ? 'Horizontal' : 'Vertical') + ' · ' + curWord.answer.length + ' letras'), h('span', {}, curWord.clue));
          clueBtns.forEach((b, w) => (w === curWord ? b.setAttribute('aria-current', 'true') : b.removeAttribute('aria-current')));
        }
        function wordOk(w) { return wordCells(w).every((cc) => cc.input.value === cc.ch); }
        function after() {
          D.words.forEach((w) => { const li = clueBtns.get(w).parentElement; li.classList.toggle('solved', wordOk(w)); });
          bankEls.forEach((el, w) => el.classList.toggle('used', wordOk(w)));
          const all = [...cells.values()].every((cc) => cc.input.value === cc.ch);
          if (all && !solved && !revealed) {
            solved = true;
            banner.innerHTML = '';
            const pts = { facil: 10, medio: 20, dificil: 30 }[level] + 20;
            const first = QI.store.awardGame('crucigrama-' + mod + '-' + level, pts, 100);
            banner.append(h('div', { class: 'feedback ok' }, QI.art.mascot('cheer', 56), h('div', {}, '¡Crucigrama completo! ' + (first ? 'Ganaste ' + pts + ' puntos.' : 'Ya habías ganado los puntos de este nivel.'), h('p', {}, hints ? 'Usaste ' + hints + (hints === 1 ? ' pista.' : ' pistas.') : 'Sin pistas.')))); QI.emit('celebrate');
            if (first) QI.store.count('crosswords');
            if (opts.onSolved) opts.onSolved(level);
          }
        }

        /* Pistas y banco de palabras */
        const clues = (dir, title) => h('div', {}, h('h3', {}, title), h('ol', {}, D.words.filter((w) => w.dir === dir).map((w) => {
          const b = h('button', { type: 'button', onclick: () => { curWord = w; wordCells(w)[0].input.focus(); select(wordCells(w)[0], false); } }, h('b', {}, w.n + '.'), h('span', {}, w.clue));
          clueBtns.set(w, b); return h('li', {}, b);
        })));
        const bankEls = new Map();
        const bank = level === 'facil' ? h('div', {}, h('h3', {}, 'Banco de palabras'), h('div', { class: 'wordbank', 'aria-label': 'Palabras para usar' }, [...D.words].map((w) => w.answer).sort().map((a) => { const el = h('span', {}, a); bankEls.set(D.words.find((w) => w.answer === a), el); return el; }))) : null;

        /* Ayudas por nivel */
        if (level !== 'dificil') D.words.forEach((w) => { const cc = wordCells(w)[0]; cc.input.value = cc.ch; cc.input.readOnly = true; cc.input.classList.add('hint'); });

        const msg = h('p', { 'aria-live': 'polite', class: 'muted' });
        let confirmReveal = false;
        const revealBtn = h('button', { class: 'btn', type: 'button' }, 'Ver soluciones');
        revealBtn.addEventListener('click', () => {
          if (!confirmReveal) { confirmReveal = true; revealBtn.textContent = 'Confirmar: ver soluciones'; msg.textContent = 'Si ves las soluciones, esta partida no suma puntos.'; return; }
          revealed = true; cells.forEach((cc) => { cc.input.value = cc.ch; cc.input.classList.remove('bad'); }); confirmReveal = false; revealBtn.textContent = 'Ver soluciones'; msg.textContent = 'Soluciones a la vista. Podés limpiar y volver a intentar.'; after();
        });
        const hintBtn = h('button', { class: 'btn', type: 'button', disabled: level === 'dificil', title: level === 'dificil' ? 'En nivel difícil no hay pistas' : null }, 'Pista');
        hintBtn.addEventListener('click', () => {
          const t = wordCells(curWord).find((cc) => cc.input.value !== cc.ch);
          if (!t) { msg.textContent = 'Esta palabra ya está completa.'; return; }
          t.input.value = t.ch; t.input.classList.remove('bad'); t.input.classList.add('good'); hints++; msg.textContent = 'Te mostré una letra.'; after();
        });
        const checkBtn = h('button', { class: 'btn primary', type: 'button' }, 'Comprobar');
        checkBtn.addEventListener('click', () => {
          let ok = 0, bad = 0, empty = 0;
          cells.forEach((cc) => { const v = cc.input.value; cc.input.classList.remove('bad', 'good'); if (!v) empty++; else if (v === cc.ch) { ok++; if (!cc.input.readOnly) cc.input.classList.add('good'); } else { bad++; cc.input.classList.add('bad'); } });
          msg.textContent = ok + ' letras bien, ' + bad + ' para revisar y ' + empty + ' vacías.';
        });
        const clearBtn = h('button', { class: 'btn', type: 'button' }, 'Limpiar');
        clearBtn.addEventListener('click', () => { build(); });

        mount.append(
          h('div', { class: 'row' }, h('span', { class: 'lbl', style: 'font-weight:700' }, 'Nivel:'),
            h('div', { class: 'seg', role: 'radiogroup', 'aria-label': 'Nivel de dificultad' }, LEVELS.map(([v, t]) => h('label', {}, h('input', { type: 'radio', name: 'cwlevel', value: v, checked: v === level, onchange: () => { level = v; build(); } }), h('span', {}, t))))),
          h('p', { class: 'muted' }, level === 'facil' ? 'Con banco de palabras, primera letra y pistas.' : level === 'medio' ? 'Con primera letra y pistas, sin banco de palabras.' : 'Sin ayudas. Solo las definiciones.'),
          h('div', { class: 'how-to' }, h('b', {}, 'Cómo se juega'), h('ol', {}, h('li', {}, 'Tocá un casillero. Se marca la palabra y aparece su pista.'), h('li', {}, 'Escribí las letras sin tilde. El cursor avanza solo.'), h('li', {}, 'Tocá otra vez el mismo casillero para cambiar entre horizontal y vertical.'), h('li', {}, 'Cuando termines, tocá Comprobar.'))),
          h('div', { class: 'cw-wrap' },
            h('div', { class: 'stack' }, status, h('div', { class: 'cw-scroll' }, grid)),
            h('div', { class: 'clues' }, bank, clues('h', 'Horizontales'), clues('v', 'Verticales'))),
          h('div', { class: 'row' }, checkBtn, hintBtn, clearBtn, revealBtn), msg, banner
        );
        const first = wordCells(D.words[0])[0]; select(first, false); curWord = D.words[0]; select(first, false);
        after();
      }
      build();
    }
  };
})();
