/* Navegación, encabezado y vistas generales. */
(function () {
  const h = QI.h;
  const NAV = [['inicio', 'Inicio', 'home'], ['aprender', 'Aprender', 'book'], ['jugar', 'Jugar', 'game'], ['videos', 'Videos', 'video'], ['logros', 'Mis Logros', 'trophy'], ['ayuda', 'Ayuda', 'help'], ['perfil', 'Perfil', 'user']];
  const view = () => document.getElementById('view');

  /* ---------- Diálogo genérico ---------- */
  let dlgOpener = null;
  function openDialog(title, children) {
    const scrim = document.getElementById('dialog');
    dlgOpener = document.activeElement;
    scrim.innerHTML = '';
    const box = h('div', { class: 'dialog', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'dlg-title' },
      h('button', { class: 'btn small close', type: 'button', onclick: closeDialog }, QI.icon('close'), 'Cerrar'), h('h2', { id: 'dlg-title' }, title), children);
    scrim.append(box); scrim.hidden = false;
    box.querySelector('.close').focus();
    scrim.onkeydown = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); closeDialog(); return; }
      if (e.key === 'Tab') { const f = [...box.querySelectorAll('button, a[href], input, select, textarea')].filter((x) => !x.disabled); if (!f.length) return; const a = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } }
    };
    scrim.onclick = (e) => { if (e.target === scrim) closeDialog(); };
  }
  function closeDialog() { const s = document.getElementById('dialog'); s.hidden = true; s.innerHTML = ''; dlgOpener && dlgOpener.focus && dlgOpener.focus(); }
  QI.openDialog = openDialog; QI.closeDialog = closeDialog;

  document.addEventListener('click', async (e) => {
    const t = e.target.closest && e.target.closest('.term');
    if (!t) return;
    const g = (await QI.data('glosario')).find((x) => x.id === t.dataset.term);
    if (g) openDialog(g.termino, [h('p', {}, g.def), h('a', { class: 'btn small', href: '#ayuda', onclick: closeDialog }, 'Ver todo el glosario')]);
  });

  function assistant() {
    openDialog('Asistente de química', [
      h('p', {}, 'Todavía no está conectado. La idea es que responda preguntas de química en lenguaje natural, con las mismas adaptaciones de accesibilidad del resto de la página.'),
      h('p', { class: 'muted' }, 'Para que funcione hace falta un servidor que guarde la clave del servicio de IA. Por seguridad no puede ir dentro de la página.'),
      h('label', { class: 'field', for: 'asist-in' }, h('span', { class: 'lbl' }, 'Tu pregunta'), h('input', { id: 'asist-in', type: 'text', disabled: true, placeholder: 'Disponible próximamente' })),
      h('p', { class: 'muted' }, 'Mientras tanto, el glosario de la sección Ayuda explica los términos del módulo.')
    ]);
  }

  /* ---------- Encabezado y menús ---------- */
  function drawChrome() {
    const p = QI.store.profile();
    const chip = document.getElementById('profile-slot'); chip.innerHTML = '';
    chip.append(h('button', { class: 'btn small profile-chip', type: 'button', 'aria-label': 'Perfil activo: ' + p.nombre + '. Cambiar de perfil', onclick: profileSwitch },
      h('span', { class: 'avatar', style: 'background:' + p.color, 'aria-hidden': 'true' }, p.nombre.charAt(0).toUpperCase()), h('span', { class: 'pname' }, p.nombre)));
  }
  function profileSwitch() {
    const cur = QI.store.profile();
    openDialog('Cambiar de perfil', [
      h('div', { class: 'stack' }, QI.store.all().map((x) => h('button', { class: 'btn', type: 'button', 'aria-pressed': x.id === cur.id ? 'true' : 'false', style: 'justify-content:flex-start', onclick: () => { QI.store.switchProfile(x.id); closeDialog(); } },
        h('span', { class: 'avatar', style: 'background:' + x.color, 'aria-hidden': 'true' }, x.nombre.charAt(0).toUpperCase()), x.nombre))),
      h('a', { class: 'btn primary', href: '#perfil', onclick: closeDialog }, 'Crear o administrar perfiles')]);
  }
  function drawNav() {
    const side = document.getElementById('sidenav'); side.innerHTML = '';
    NAV.forEach(([k, t, ic]) => side.append(h('a', { href: '#' + k, 'data-nav': k }, QI.icon(ic), t)));
    side.append(h('button', { class: 'navlink', type: 'button', onclick: (e) => QI.a11y.open(e.currentTarget) }, QI.icon('access'), 'Accesibilidad'));
    const bn = document.getElementById('bottomnav'); bn.innerHTML = '';
    NAV.slice(0, 5).forEach(([k, t, ic]) => bn.append(h('a', { href: '#' + k, 'data-nav': k }, QI.icon(ic), t)));
    bn.append(h('button', { class: 'more', type: 'button', onclick: moreMenu }, QI.icon('more'), 'Más'));
  }
  function moreMenu() {
    openDialog('Más secciones', h('div', { class: 'stack' },
      h('a', { class: 'btn', href: '#ayuda', onclick: closeDialog }, QI.icon('help'), 'Ayuda y glosario'),
      h('a', { class: 'btn', href: '#perfil', onclick: closeDialog }, QI.icon('user'), 'Perfil'),
      h('button', { class: 'btn', type: 'button', onclick: (e) => { closeDialog(); QI.a11y.open(document.getElementById('btn-a11y')); } }, QI.icon('access'), 'Accesibilidad')));
  }
  function markNav(route) {
    const base = route.startsWith('modulo') ? 'aprender' : route.startsWith('jugar') ? 'jugar' : route;
    document.querySelectorAll('[data-nav]').forEach((a) => (a.dataset.nav === base ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
  }

  /* ---------- Piezas reutilizables ---------- */
  const pbar = (pct, label) => h('div', { class: 'pbar' }, h('div', { class: 'pbar-top' }, h('span', {}, label), h('span', {}, pct + ' %')), h('div', { class: 'progress', role: 'progressbar', 'aria-valuenow': pct, 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-label': label }, h('i', { style: 'width:' + pct + '%' })));
  const tile = (href, icon, title, text, extra) => h('a', { class: 'card tile focusable', href, style: '--tc:' + (QI.art.TILE[href.slice(1).split('-')[0]] || '#1c58b8') }, h('span', { class: 'tag' }, QI.icon(icon)), h('h3', {}, title), h('p', {}, text), extra);

  /* ---------- Vistas ---------- */
  async function inicio(v) {
    const p = QI.store.profile(), prog = QI.store.prog(), last = prog.last;
    const mods = await QI.data('modulos');
    const firstOpen = QI.store.REQUIRED.find((s) => !QI.store.isDone(1, s));
    const labels = { teoria: 'la teoría', simulacion: 'la simulación', ejercicios: 'los ejercicios', juego: 'el crucigrama', autoevaluacion: 'la autoevaluación' };
    const hero = h('section', { class: 'hero', 'aria-labelledby': 'hero-t' }, QI.art.heroDecor(),
      h('div', { class: 'hero-text' }, h('h1', { id: 'hero-t' }, 'Hola, ' + p.nombre), h('p', { class: 'lead' }, 'Química, la puerta al mundo de la IA. Explorá, comprendé, transformá.'),
        h('p', {}, 'El mismo contenido, con distintas puertas de entrada. Elegí cómo estudiar y andá a tu ritmo.'),
        h('div', { class: 'hero-actions' }, h('a', { class: 'btn primary big', href: last ? last.hash : '#modulo-1' }, QI.icon('play'), last ? 'Continuar' : 'Empezar'), h('button', { class: 'btn big', type: 'button', style: 'background:transparent;color:#fff', onclick: (e) => QI.a11y.open(e.currentTarget) }, QI.icon('access'), 'Ajustar accesibilidad'))),
      h('div', { class: 'hero-art' }, QI.art.mascot('hi', 190)));
    const overall = QI.store.overallPct(mods.length);
    const resume = h('div', { class: 'card stack focusable' }, h('h2', {}, 'Continuar donde dejaste'),
      last ? [h('p', {}, last.label), h('a', { class: 'btn primary', href: last.hash }, 'Seguir')] : [h('p', {}, 'Todavía no empezaste. El Módulo 1 es el primer paso.'), h('a', { class: 'btn primary', href: '#modulo-1' }, 'Ir al Módulo 1')]);
    const sug = h('div', { class: 'card stack focusable' }, h('span', { class: 'badge' }, 'Sugerencia según tu progreso'), h('h2', {}, firstOpen ? 'Seguí con ' + labels[firstOpen] : 'Módulo 1 completo'),
      h('p', {}, firstOpen ? 'Es lo que sigue en el Módulo 1.' : 'Probá el crucigrama en nivel difícil o repetí la autoevaluación. El Módulo 2 llega en una próxima fase.'),
      h('a', { class: 'btn', href: firstOpen ? '#modulo-1' : '#jugar-crucigrama' }, firstOpen ? 'Ir al módulo' : 'Ir al crucigrama'));
    v.append(hero,
      h('div', { class: 'grid wide' }, h('div', { class: 'card stack focusable' }, h('h2', {}, 'Tu progreso'), pbar(overall, 'Progreso general (11 módulos)'), h('p', { class: 'muted' }, QI.store.modsDone() + ' de 11 módulos completos · ' + prog.points + ' puntos')), resume, sug),
      h('section', { class: 'stack', 'aria-labelledby': 'acc-t' }, h('h2', { id: 'acc-t' }, 'Ir a'),
        h('div', { class: 'grid' }, tile('#aprender', 'book', 'Aprender', 'Los 11 módulos de química, uno por uno.'), tile('#jugar', 'game', 'Jugar', 'Crucigramas y otros juegos para practicar.'), tile('#videos', 'video', 'Videos', 'Biblioteca de videos cortos por módulo.'), tile('#logros', 'trophy', 'Mis Logros', 'Medallas, puntos y avance.'))),
      h('div', { class: 'card row focusable', style: 'justify-content:space-between' }, h('div', { class: 'stack' }, h('h2', {}, 'Asistente de química'), h('p', {}, 'Respuestas en lenguaje natural. Todavía no está conectado.')), h('button', { class: 'btn', type: 'button', onclick: assistant }, QI.icon('spark'), 'Saber más')));
  }

  async function aprender(v) {
    const mods = await QI.data('modulos');
    v.append(h('div', { class: 'stack' }, h('h1', {}, 'Aprender'), h('p', { class: 'muted' }, 'Once módulos basados en el Módulo de Química 2023 de la UNSL. Cada uno lleva de 3 a 6 sesiones de 20 minutos.')),
      h('div', { class: 'grid wide' }, mods.map((m) => h('a', { class: 'card tile focusable', href: '#modulo-' + m.id, 'aria-label': 'Módulo ' + m.id + ': ' + m.titulo + (m.disponible ? '' : ', próximamente') },
        h('div', { class: 'mod-head' }, QI.art.moduleBadge(m.id), h('span', { class: 'modnum' }, 'Módulo ' + m.id)), h('h3', {}, m.titulo), h('p', {}, m.descripcion),
        m.disponible ? pbar(QI.store.modulePct(m.id), 'Progreso') : h('span', { class: 'badge soon' }, 'Próximamente')))));
  }

  async function jugar(v) {
    const mods = await QI.data('modulos'), D = await QI.data('juegos');
    const cards = [];
    for (const m of mods) {
      const tipos = await QI.games.forModule(m.id);
      const won = tipos.filter((t) => QI.store.gameWon(t + '-' + m.id + '-')).length;
      cards.push(h('section', { class: 'card stack', 'aria-labelledby': 'jm' + m.id },
        h('div', { class: 'mod-head' }, QI.art.moduleBadge(m.id), h('span', { class: 'modnum' }, 'Módulo ' + m.id)),
        h('h2', { id: 'jm' + m.id, style: 'font-size:1.15rem' }, m.titulo),
        h('p', { class: 'muted' }, won + ' de ' + tipos.length + ' juegos ganados'),
        h('div', { class: 'row' }, tipos.map((t) => h('a', { class: 'btn small', href: '#jugar-' + t + '-' + m.id }, QI.icon(QI.games.META[t].icon), QI.games.META[t].nombre, QI.store.gameWon(t + '-' + m.id + '-') ? h('span', { class: 'sr-only' }, ' (ganado)') : null, QI.store.gameWon(t + '-' + m.id + '-') ? ' ✓' : null)))));
    }
    v.append(h('div', { class: 'stack' }, h('h1', {}, 'Jugar'), h('p', { class: 'muted' }, 'Hay juegos para cada módulo. Todos tienen tres niveles: fácil con ayudas, medio con menos ayudas y difícil sin ayudas. Los puntos se ganan una vez por juego y nivel.')),
      h('div', { class: 'grid wide' }, cards),
      h('p', { class: 'muted' }, 'Juegos ganados: ' + Object.keys(QI.store.prog().won || {}).length + ' · Crucigramas resueltos: ' + QI.store.prog().crosswords));
  }
  async function juegoPage(v, tipo, mod) {
    const mods = await QI.data('modulos'), m = mods.find((x) => x.id === mod);
    const meta = QI.games.META[tipo], box = h('div', {});
    if (!m || !meta) { v.append(h('h1', {}, 'No encontramos ese juego'), h('a', { class: 'btn primary', href: '#jugar' }, 'Volver a los juegos')); return; }
    const otros = (await QI.games.forModule(mod)).filter((t) => t !== tipo);
    v.append(h('div', { class: 'crumbs' }, h('a', { class: 'btn small', href: '#jugar' }, QI.icon('left'), 'Volver a los juegos')),
      h('div', { class: 'card stack' }, h('div', { class: 'row', style: 'justify-content:space-between' }, h('h1', {}, meta.nombre + ': ' + m.titulo), h('span', { class: 'badge' }, 'Módulo ' + mod)), box),
      otros.length ? h('div', { class: 'card stack' }, h('h2', { style: 'font-size:1.05rem' }, 'Más juegos de este módulo'), h('div', { class: 'row' }, otros.map((t) => h('a', { class: 'btn small', href: '#jugar-' + t + '-' + mod }, QI.icon(QI.games.META[t].icon), QI.games.META[t].nombre)))) : null);
    QI.games.play(box, tipo, mod);
    QI.store.setLast('#jugar-' + tipo + '-' + mod, meta.nombre + ' · Módulo ' + mod);
  }
  const crucigrama = (v) => juegoPage(v, 'crucigrama', 1);

  async function videos(v) {
    const mods = await QI.data('modulos'), vids = await QI.data('videos');
    v.append(h('div', { class: 'stack' }, h('h1', {}, 'Videos'), h('p', { class: 'muted' }, vids.filter((x) => x.youtubeId).length + ' videos de otros autores, verificados, con su cita. Se abren en YouTube (nueva pestaña). Los marcados «Próximamente» todavía no tienen video elegido.')),
      ...mods.map((m) => { const l = vids.filter((x) => x.modulo === m.id); return l.length ? h('section', { class: 'card stack', 'aria-labelledby': 'vm' + m.id }, h('h2', { id: 'vm' + m.id }, 'Módulo ' + m.id + ': ' + m.titulo), h('ul', { class: 'vlist' }, l.map((x) => QI.videoItem(x, () => { v.innerHTML = ''; videos(v); })))) : null; }));
  }

  async function logros(v) {
    const mods = await QI.data('modulos'), p = QI.store.prog(), s = QI.store.stats();
    v.append(h('div', { class: 'hello' }, QI.art.mascot(Object.keys(p.medals).length ? 'cheer' : 'hi', 70), h('h1', {}, 'Mis Logros')),
      h('div', { class: 'stats' }, [['Puntos', p.points], ['Módulos completos', s.modsDone + ' / 11'], ['Mejor racha', s.streak + (s.streak === 1 ? ' día' : ' días')], ['Tiempo de estudio', Math.round(p.minutes) + ' min']].map(([k, val]) => h('div', { class: 'card stat' }, h('span', { class: 'muted' }, k), h('b', {}, String(val))))),
      h('section', { class: 'card stack', 'aria-labelledby': 'pm' }, h('h2', { id: 'pm' }, 'Progreso por módulo'), mods.map((m) => pbar(QI.store.modulePct(m.id), 'Módulo ' + m.id + ': ' + m.titulo))),
      h('section', { class: 'stack', 'aria-labelledby': 'md' }, h('h2', { id: 'md' }, 'Medallas (' + Object.keys(p.medals).length + ' de ' + QI.MEDALS.length + ')'),
        h('div', { class: 'grid' }, QI.MEDALS.map((m) => { const got = p.medals[m.id]; return h('div', { class: 'card medal ' + (got ? 'got' : 'locked') }, h('div', { class: 'disc' }, QI.icon(got ? m.icon : 'lock')), h('div', {}, h('h3', {}, m.nombre), h('p', { class: 'muted' }, m.desc), got ? h('span', { class: 'badge ok' }, 'Obtenida') : null)); }))));
  }

  async function ayuda(v) {
    const gl = await QI.data('glosario');
    const list = h('dl', { class: 'gloss' });
    const q = h('input', { type: 'search', id: 'gl-q', placeholder: 'Buscar un término', 'aria-label': 'Buscar en el glosario', oninput: () => draw() });
    const draw = () => { const n = QI.norm(q.value); list.innerHTML = ''; const f = gl.filter((g) => !n || QI.norm(g.termino).includes(n) || QI.norm(g.def).includes(n)); if (!f.length) list.append(h('p', {}, 'No hay términos que coincidan.')); f.forEach((g) => list.append(h('dt', {}, g.termino), h('dd', {}, g.def))); };
    const faq = [
      ['¿Cómo cambio el tamaño de la letra?', 'Tocá el botón Accesibilidad, abrí Visión y elegí A-, A, A+ o A++.'],
      ['¿Cómo hago para que lea en voz alta?', 'En la teoría de cada módulo elegí la versión Audio y tocá Escuchar. También podés activar la lectura por voz en Accesibilidad, sección Audio. Las voces dependen de tu dispositivo.'],
      ['¿Se guarda mi progreso?', 'Sí, en este navegador y por perfil. Si borrás los datos del navegador, se pierde.'],
      ['¿Podemos usar la misma computadora entre varios?', 'Sí. En Perfil creás un perfil por persona. Cada uno tiene su progreso y su configuración.'],
      ['El crucigrama me resulta difícil. ¿Qué hago?', 'Empezá en nivel fácil: tiene banco de palabras y primera letra. También podés usar el botón Pista.']
    ];
    v.append(h('div', { class: 'hello' }, QI.art.mascot('think', 70), h('h1', {}, 'Ayuda')),
      h('section', { class: 'stack faq', 'aria-labelledby': 'faq-t' }, h('h2', { id: 'faq-t' }, 'Preguntas frecuentes'), faq.map(([a, b]) => h('details', {}, h('summary', {}, a), h('p', {}, b)))),
      h('section', { class: 'card stack', 'aria-labelledby': 'gl-t' }, h('h2', { id: 'gl-t' }, 'Glosario del Módulo 1'), h('label', { for: 'gl-q', class: 'sr-only' }, 'Buscar un término'), q, list),
      h('div', { class: 'card stack' }, h('h2', {}, 'Asistente y contacto'), h('p', {}, 'El asistente de química y el formulario para escribirle a docentes o tutores todavía no están disponibles. Necesitan un servidor.'), h('button', { class: 'btn', type: 'button', onclick: assistant }, QI.icon('spark'), 'Sobre el asistente')));
    draw();
  }

  async function perfil(v) {
    const cur = QI.store.profile();
    let color = QI.store.COLORS[QI.store.all().length % QI.store.COLORS.length];
    const nameIn = h('input', { type: 'text', id: 'new-name', maxlength: 24, placeholder: 'Nombre' });
    const msg = h('p', { 'aria-live': 'polite', class: 'muted' });
    const confirm = {};
    const rows = h('div', { class: 'stack' });
    const draw = () => {
      rows.innerHTML = '';
      QI.store.all().forEach((x) => {
        const isCur = x.id === cur.id;
        const del = h('button', { class: 'btn small', type: 'button', disabled: QI.store.all().length < 2, onclick: () => { if (!confirm[x.id]) { confirm[x.id] = true; del.textContent = 'Confirmar: eliminar'; return; } QI.store.deleteProfile(x.id); } }, 'Eliminar');
        rows.append(h('div', { class: 'card profile-row' }, h('span', { class: 'avatar lg', style: 'background:' + x.color, 'aria-hidden': 'true' }, x.nombre.charAt(0).toUpperCase()),
          h('div', { class: 'grow' }, h('h3', {}, x.nombre), h('p', { class: 'muted' }, 'Progreso general: ' + pctFor(x) + ' %')),
          isCur ? h('span', { class: 'badge ok' }, 'En uso') : h('button', { class: 'btn small primary', type: 'button', onclick: () => QI.store.switchProfile(x.id) }, 'Usar'), del));
      });
    };
    function pctFor(x) { let sum = 0; for (let i = 1; i <= 11; i++) { const m = x.prog.mods[i]; sum += m ? Math.round((QI.store.REQUIRED.filter((s) => m.sections[s]).length / QI.store.REQUIRED.length) * 100) : 0; } return Math.round(sum / 11); }
    v.append(h('h1', {}, 'Perfil'), h('p', { class: 'muted' }, 'Cada perfil tiene su propio progreso, su configuración de accesibilidad y sus estadísticas.'), rows,
      h('form', { class: 'card stack', onsubmit: (e) => { e.preventDefault(); if (!nameIn.value.trim()) { msg.textContent = 'Escribí un nombre para crear el perfil.'; nameIn.focus(); return; } QI.store.createProfile(nameIn.value, color); } },
        h('h2', {}, 'Crear un perfil nuevo'), h('div', { class: 'field' }, h('label', { class: 'lbl', for: 'new-name' }, 'Nombre'), nameIn),
        h('fieldset', { class: 'field', style: 'border:0;padding:0;margin:0' }, h('legend', { class: 'lbl' }, 'Color del avatar'), h('div', { class: 'colorpick' }, QI.store.COLORS.map((c) => h('label', {}, h('input', { type: 'radio', name: 'col', value: c, checked: c === color, 'aria-label': 'Color ' + c, onchange: () => { color = c; } }), h('span', { style: 'background:' + c })))))
        , h('button', { class: 'btn primary', type: 'submit' }, 'Crear y usar'), msg));
    draw();
  }

  /* ---------- Router ---------- */
  const ROUTES = { inicio, aprender, jugar, 'jugar-crucigrama': crucigrama, videos, logros, ayuda, perfil };
  let rendering = 0;
  async function route(focus) {
    let r = (location.hash || '#inicio').slice(1) || 'inicio';
    if (r === 'main') { document.getElementById('main').focus(); return; }
    QI.tts.stop();
    const v = view(); const token = ++rendering;
    const holder = h('div', { class: 'view', id: 'view' });
    try {
      if (/^modulo-\d+$/.test(r)) { await QI.modules.render(holder, Number(r.split('-')[1])); }
      else if (/^jugar-[a-z]+-\d+$/.test(r)) { const [, t, n] = r.split('-'); await juegoPage(holder, t, Number(n)); }
      else if (ROUTES[r]) { await ROUTES[r](holder); }
      else { r = 'inicio'; await inicio(holder); }
    } catch (e) {
      holder.innerHTML = ''; holder.append(h('div', { class: 'card stack' }, h('h1', {}, 'No se pudo cargar esta sección'), h('p', {}, 'Revisá tu conexión y volvé a intentar.'), h('button', { class: 'btn primary', type: 'button', onclick: () => route(true) }, 'Reintentar')));
    }
    if (token !== rendering) return;
    v.replaceWith(holder);
    markNav(r);
    if (focus !== false) { window.scrollTo(0, 0); const t = holder.querySelector('h1'); if (t) { t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); } }
  }

  function init() {
    QI.a11y.init(); QI.art.init();
    const lg = document.querySelector('.logo'); if (lg) { lg.innerHTML = ''; lg.style.background = 'transparent'; lg.append(QI.art.mascot('hi', 34)); }
    drawNav(); drawChrome();
    document.getElementById('btn-pause').addEventListener('click', () => QI.pause.toggle());
    document.getElementById('btn-resume').addEventListener('click', () => QI.pause.toggle());
    document.querySelector('.skip').addEventListener('click', (e) => { e.preventDefault(); document.getElementById('main').focus(); });
    window.addEventListener('hashchange', () => route(true));
    QI.on('profile', () => { drawChrome(); route(false); });
    route(true);
  }
  init();
})();
