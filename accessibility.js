/* Panel de accesibilidad: aplica preferencias, lectura por voz, temporizador y pausas. */
(function () {
  const h = QI.h;
  const root = document.documentElement;
  const reduceMQ = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };

  /* ---------- Aplicar preferencias ---------- */
  function setAttr(name, on, val) { if (on) root.setAttribute(name, val || 'on'); else root.removeAttribute(name); }
  function lum(hex) {
    const c = hex.replace('#', '').match(/.{2}/g).map((x) => parseInt(x, 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

  function apply() {
    const p = QI.store.prefs();
    root.style.setProperty('--fs-scale', p.fs);
    root.setAttribute('data-font', p.font);
    setAttr('data-spacing', p.spacing !== 'normal', p.spacing);
    let theme = p.theme;
    if (p.autoDark) { const hr = new Date().getHours(); theme = hr >= 19 || hr < 7 ? 'dark' : 'light'; }
    setAttr('data-pref', theme !== 'auto', theme);
    const custom = ['--bg', '--surface', '--surface-2', '--fg', '--muted'];
    if (p.customOn) {
      root.style.setProperty('--bg', p.bg); root.style.setProperty('--surface', p.bg);
      root.style.setProperty('--surface-2', 'color-mix(in srgb, ' + p.bg + ' 90%, ' + p.fg + ')');
      root.style.setProperty('--fg', p.fg); root.style.setProperty('--muted', p.fg);
    } else custom.forEach((k) => root.style.removeProperty(k));
    setAttr('data-simple', p.simple); setAttr('data-steps', p.steps); setAttr('data-focus', p.focus); setAttr('data-highlight', p.highlight);
    root.setAttribute('data-anim', p.anim === 'full' && reduceMQ.matches ? 'reduced' : p.anim);
    root.setAttribute('data-trans', p.trans === 'smooth' ? 'smooth' : 'instant');
    setAttr('data-icons', p.icons !== 'normal', p.icons);
    const t = document.getElementById('timer'); if (t) t.hidden = !p.timer;
    breakAt = Date.now();
  }

  /* ---------- Lectura por voz ---------- */
  const synth = 'speechSynthesis' in window ? window.speechSynthesis : null;
  let voices = [];
  function loadVoices() { if (synth) voices = synth.getVoices(); }
  if (synth) { loadVoices(); synth.addEventListener && synth.addEventListener('voiceschanged', loadVoices); }
  QI.tts = {
    supported: !!synth,
    voices: () => { const es = voices.filter((v) => /^es/i.test(v.lang)); return es.length ? es : voices; },
    speak(text, cb) {
      if (!synth) { QI.toast('Este navegador no ofrece lectura por voz.'); return false; }
      synth.cancel();
      const p = QI.store.prefs();
      const u = new SpeechSynthesisUtterance(QI.stripHtml(text));
      u.lang = 'es-AR'; u.rate = p.rate; u.volume = p.volume;
      const v = voices.find((x) => x.name === p.voice) || QI.tts.voices()[0];
      if (v) { u.voice = v; u.lang = v.lang; }
      if (cb && cb.onstart) u.onstart = cb.onstart;
      if (cb && cb.onend) u.onend = cb.onend;
      synth.speak(u);
      return true;
    },
    pause() { synth && synth.pause(); },
    resume() { synth && synth.resume(); },
    stop() { synth && synth.cancel(); }
  };
  let hoverT = null;
  const READABLE = 'p, li, h1, h2, h3, h4, button, label, dt, dd, summary, .opt';
  function readable(e) { const el = e.target.closest ? e.target.closest(READABLE) : null; if (!el) return null; const t = (el.getAttribute('aria-label') || el.textContent || '').trim(); return t && t.length < 500 ? t : null; }
  document.addEventListener('mouseover', (e) => {
    const p = QI.store.prefs(); if (!p.tts || !p.hover) return;
    const t = readable(e); if (!t) return;
    clearTimeout(hoverT); hoverT = setTimeout(() => QI.tts.speak(t), 450);
  });
  document.addEventListener('mouseout', () => clearTimeout(hoverT));
  document.addEventListener('click', (e) => { const p = QI.store.prefs(); if (!p.tts || !p.click) return; const t = readable(e); if (t) QI.tts.speak(t); });

  /* ---------- Temporizador, pausas y minutos de estudio ---------- */
  let started = Date.now(), pausedAt = 0, pausedTotal = 0, breakAt = Date.now(), paused = false, lastMin = Date.now();
  function fmt(ms) { const s = Math.floor(ms / 1000); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }
  function setPaused(v) {
    paused = v;
    const scr = document.getElementById('pause'); if (scr) scr.hidden = !v;
    if (v) { pausedAt = Date.now(); QI.tts.stop(); const b = scr && scr.querySelector('button'); b && b.focus(); }
    else { pausedTotal += Date.now() - pausedAt; breakAt = Date.now(); lastMin = Date.now(); }
  }
  QI.pause = { toggle: () => setPaused(!paused), isPaused: () => paused };
  setInterval(() => {
    if (paused) return;
    const p = QI.store.prefs();
    const t = document.getElementById('timer');
    if (t && p.timer) t.textContent = fmt(Date.now() - started - pausedTotal);
    if (document.visibilityState === 'visible' && Date.now() - lastMin >= 30000) { lastMin = Date.now(); QI.store.addMinutes(0.5); }
    if (p.breaks > 0 && Date.now() - breakAt >= p.breaks * 60000) {
      breakAt = Date.now();
      QI.pause.toggle();
      const m = document.getElementById('pause-msg'); if (m) m.textContent = 'Llevás ' + p.breaks + ' minutos de estudio. Tomate un descanso y volvé cuando quieras.';
    }
  }, 1000);

  /* ---------- Controles del panel ---------- */
  let uidn = 0;
  function seg(legend, name, options, current, onchange) {
    const g = ++uidn;
    return h('fieldset', { class: 'field', style: 'border:0;padding:0;margin:0;min-width:0' },
      h('legend', { class: 'lbl', style: 'padding:0;margin-bottom:.4rem' }, legend),
      h('div', { class: 'seg' }, options.map(([val, text]) => h('label', {},
        h('input', { type: 'radio', name: name + g, value: val, checked: String(current) === String(val), onchange: () => onchange(val) }),
        h('span', {}, text)))));
  }
  function sw(text, checked, onchange, hint) {
    const id = 'sw' + (++uidn);
    return h('label', { class: 'switch', for: id }, h('span', {}, text, hint ? h('small', { class: 'muted', style: 'display:block;font-weight:400' }, hint) : null),
      h('input', { type: 'checkbox', role: 'switch', id, checked, onchange: (e) => onchange(e.target.checked) }));
  }
  function group(title, icon, children, open) {
    return h('details', { open }, h('summary', {}, QI.icon(icon), title), h('div', { class: 'opt-group' }, children));
  }

  let panel, opener;
  function render() {
    const p = QI.store.prefs(), set = (o) => QI.store.setPref(o);
    const body = panel.querySelector('.body'); body.innerHTML = '';
    const ratioOut = h('p', { class: 'muted', 'aria-live': 'polite' });
    const upd = () => { const r = ratio(QI.store.prefs().bg, QI.store.prefs().fg); ratioOut.textContent = 'Contraste actual: ' + QI.fmtNum(r, 1) + ' a 1. ' + (r >= 4.5 ? 'Cumple el mínimo de 4,5 a 1.' : 'Está por debajo del mínimo recomendado de 4,5 a 1.'); ratioOut.style.color = r >= 4.5 ? 'var(--ok)' : 'var(--err)'; };
    upd();
    const voiceSel = h('select', { id: 'voice-sel', 'aria-label': 'Voz', onchange: (e) => set({ voice: e.target.value }) }, h('option', { value: '' }, 'Predeterminada'));
    const fillVoices = () => { voiceSel.length = 1; QI.tts.voices().forEach((v) => voiceSel.append(h('option', { value: v.name, selected: v.name === p.voice }, v.name + ' (' + v.lang + ')'))); };
    fillVoices(); if (synth) setTimeout(fillVoices, 600);

    const exportBox = h('textarea', { id: 'exp', rows: 4, readonly: true, 'aria-label': 'Configuración exportada' }); exportBox.value = QI.store.exportPrefs();
    const importBox = h('textarea', { id: 'imp', rows: 3, placeholder: 'Pegá acá la configuración exportada', 'aria-label': 'Configuración a importar' });
    const msg = h('p', { 'aria-live': 'polite', class: 'muted' });
    const doImport = (text) => { try { QI.store.importPrefs(text); render(); msg.textContent = 'Configuración importada.'; } catch (e) { msg.textContent = 'No se pudo importar. Revisá que sea una configuración exportada desde esta página.'; } };

    body.append(
      group('Visión', 'access', [
        seg('Tamaño de letra', 'fs', [[0.9, 'A-'], [1, 'A'], [1.2, 'A+'], [1.45, 'A++']], p.fs, (v) => set({ fs: Number(v) })),
        seg('Tipografía', 'font', [['standard', 'Estándar'], ['opendyslexic', 'OpenDyslexic'], ['lexend', 'Lexend'], ['sans', 'Sans-serif'], ['serif', 'Serif']], p.font, (v) => set({ font: v })),
        seg('Espaciado entre letras y líneas', 'sp', [['normal', 'Normal'], ['wide', 'Amplio'], ['wider', 'Muy amplio']], p.spacing, (v) => set({ spacing: v })),
        seg('Contraste', 'th', [['auto', 'Automático'], ['light', 'Claro'], ['dark', 'Oscuro'], ['high', 'Alto contraste'], ['cream', 'Fondo crema']], p.theme, (v) => set({ theme: v })),
        h('div', { class: 'field' },
          sw('Colores personalizados', p.customOn, (v) => { set({ customOn: v }); upd(); }),
          h('div', { class: 'colors' },
            h('label', { class: 'field' }, h('span', { class: 'lbl' }, 'Fondo'), h('input', { type: 'color', value: p.bg, oninput: (e) => { set({ bg: e.target.value }); upd(); } })),
            h('label', { class: 'field' }, h('span', { class: 'lbl' }, 'Texto'), h('input', { type: 'color', value: p.fg, oninput: (e) => { set({ fg: e.target.value }); upd(); } }))),
          ratioOut)
      ], true),
      group('Audio', 'audio', [
        QI.tts.supported ? null : h('p', { class: 'nota' }, 'Este navegador no ofrece lectura por voz. El resto de las opciones sigue funcionando.'),
        sw('Lectura por voz', p.tts, (v) => { set({ tts: v }); if (!v) QI.tts.stop(); }, 'Activa la lectura al pasar el mouse o al hacer clic.'),
        seg('Velocidad', 'rate', [[0.5, '0,5x'], [0.75, '0,75x'], [1, '1x'], [1.25, '1,25x'], [1.5, '1,5x']], p.rate, (v) => set({ rate: Number(v) })),
        h('div', { class: 'field' }, h('label', { class: 'lbl', for: 'voice-sel' }, 'Voz'), voiceSel, h('small', { class: 'muted' }, 'La lista depende de las voces instaladas en tu dispositivo.')),
        sw('Leer al pasar el mouse', p.hover, (v) => set({ hover: v })),
        sw('Leer al hacer clic', p.click, (v) => set({ click: v })),
        h('div', { class: 'field' }, h('label', { class: 'lbl', for: 'vol' }, 'Volumen'), h('input', { id: 'vol', type: 'range', min: 0, max: 1, step: 0.1, value: p.volume, oninput: (e) => set({ volume: Number(e.target.value) }) })),
        h('button', { class: 'btn small', type: 'button', onclick: () => QI.tts.speak('Así suena la voz con tu configuración actual.') }, QI.icon('audio'), 'Probar voz')
      ]),
      group('Cognitivo', 'spark', [
        sw('Modo simplificado', p.simple, (v) => set({ simple: v }), 'Oculta decoraciones y sombras.'),
        sw('Instrucciones paso a paso', p.steps, (v) => set({ steps: v }), 'Muestra cómo resolver cada actividad.'),
        sw('Temporizador visible', p.timer, (v) => set({ timer: v })),
        seg('Recordatorio de pausa', 'br', [[0, 'Sin aviso'], [5, '5 min'], [10, '10 min'], [15, '15 min'], [20, '20 min']], p.breaks, (v) => set({ breaks: Number(v) })),
        sw('Modo enfoque', p.focus, (v) => set({ focus: v }), 'Atenúa lo que no estás tocando.'),
        sw('Resaltar texto importante', p.highlight, (v) => set({ highlight: v }))
      ]),
      group('Visual', 'clock', [
        seg('Animaciones', 'an', [['full', 'Completas'], ['reduced', 'Reducidas'], ['none', 'Ninguna']], p.anim, (v) => set({ anim: v })),
        seg('Transiciones', 'tr', [['smooth', 'Suaves'], ['instant', 'Instantáneas']], p.trans, (v) => set({ trans: v })),
        sw('Modo oscuro según la hora', p.autoDark, (v) => set({ autoDark: v }), 'Oscuro de 19 a 7 h.'),
        seg('Tamaño de íconos', 'ic', [['normal', 'Normal'], ['large', 'Grande'], ['xlarge', 'Muy grande']], p.icons, (v) => set({ icons: v }))
      ]),
      group('Guardar', 'book', [
        h('p', {}, QI.store.persisted() ? 'Tus preferencias se guardan solas en este navegador, para el perfil «' + QI.store.profile().nombre + '».' : 'Este navegador no permite guardar datos. Los cambios valen hasta cerrar la página.'),
        h('div', { class: 'field' }, h('label', { class: 'lbl', for: 'prof-sel' }, 'Perfil activo'),
          h('select', { id: 'prof-sel', onchange: (e) => { QI.store.switchProfile(e.target.value); render(); } }, QI.store.all().map((x) => h('option', { value: x.id, selected: x.id === QI.store.profile().id }, x.nombre))),
          h('a', { class: 'btn small', href: '#perfil', onclick: () => close() }, 'Administrar perfiles')),
        h('div', { class: 'field' }, h('label', { class: 'lbl', for: 'exp' }, 'Exportar configuración'), exportBox,
          h('button', { class: 'btn small', type: 'button', onclick: () => { exportBox.value = QI.store.exportPrefs(); exportBox.select(); const ok = () => (msg.textContent = 'Copiado.'); try { navigator.clipboard.writeText(exportBox.value).then(ok, () => (msg.textContent = 'Seleccioná el texto y copialo.')); } catch (e) { msg.textContent = 'Seleccioná el texto y copialo.'; } } }, 'Copiar')),
        h('div', { class: 'field' }, h('label', { class: 'lbl', for: 'imp' }, 'Importar configuración'), importBox,
          h('div', { class: 'row' }, h('button', { class: 'btn small', type: 'button', onclick: () => doImport(importBox.value) }, 'Importar texto'),
            h('label', { class: 'btn small' }, 'Elegir archivo', h('input', { type: 'file', accept: '.json,.txt,application/json', class: 'sr-only', onchange: (e) => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => doImport(String(r.result)); r.readAsText(f); } })))),
        msg
      ])
    );
  }

  function open(btn) { opener = btn || document.activeElement; render(); panel.hidden = false; panel.querySelector('.close').focus(); document.getElementById('btn-a11y').setAttribute('aria-expanded', 'true'); }
  function close() { panel.hidden = true; document.getElementById('btn-a11y').setAttribute('aria-expanded', 'false'); opener && opener.focus && opener.focus(); }

  QI.a11y = {
    init() {
      panel = document.getElementById('a11y-panel');
      panel.innerHTML = '';
      panel.append(
        h('header', {}, h('h2', { id: 'a11y-title' }, 'Accesibilidad'), h('button', { class: 'btn iconbtn close', type: 'button', 'aria-label': 'Cerrar panel de accesibilidad', onclick: close }, QI.icon('close'))),
        h('div', { class: 'body' }),
        h('footer', {}, h('button', { class: 'btn', type: 'button', onclick: () => { QI.store.resetPrefs(); render(); } }, 'Restablecer todo'), h('button', { class: 'btn primary', type: 'button', onclick: close }, 'Listo'))
      );
      panel.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { e.preventDefault(); close(); return; }
        if (e.key !== 'Tab') return;
        const f = [...panel.querySelectorAll('button, input, select, textarea, summary, a[href]')].filter((x) => !x.disabled && x.offsetParent !== null);
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      });
      document.getElementById('btn-a11y').addEventListener('click', (e) => (panel.hidden ? open(e.currentTarget) : close()));
      QI.on('prefs', apply);
      reduceMQ.addEventListener && reduceMQ.addEventListener('change', apply);
      setInterval(() => { if (QI.store.prefs().autoDark) apply(); }, 600000);
      apply();
    },
    open, close, apply
  };
})();
