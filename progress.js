/* Perfiles, progreso, puntos y medallas. Todo se guarda en localStorage del navegador. */
(function () {
  const KEY = 'qi.v1';
  const REQUIRED = ['teoria', 'simulacion', 'ejercicios', 'juego', 'autoevaluacion'];
  const COLORS = ['#1c58b8', '#0f766e', '#b4531c', '#7c3aed', '#be185d', '#4d6b12'];

  QI.DEFAULT_PREFS = {
    fs: 1, font: 'standard', spacing: 'normal', theme: 'auto', customOn: false, bg: '#ffffff', fg: '#12263f',
    tts: false, rate: 1, voice: '', hover: false, click: false, volume: 1,
    simple: false, steps: false, timer: false, breaks: 0, focus: false, highlight: false,
    anim: 'full', trans: 'smooth', autoDark: false, icons: 'normal'
  };

  QI.MEDALS = [
    { id: 'principiante', nombre: 'Principiante', desc: 'Completá un módulo.', icon: 'book', test: (s) => s.modsDone >= 1 },
    { id: 'explorador', nombre: 'Explorador', desc: 'Completá tres módulos.', icon: 'flask', test: (s) => s.modsDone >= 3 },
    { id: 'quimico', nombre: 'Químico', desc: 'Completá siete módulos.', icon: 'atom', test: (s) => s.modsDone >= 7 },
    { id: 'maestro', nombre: 'Maestro', desc: 'Completá los once módulos.', icon: 'trophy', test: (s) => s.modsDone >= 11 },
    { id: 'racha', nombre: 'Racha', desc: 'Estudiá tres días seguidos.', icon: 'flame', test: (s) => s.streak >= 3 },
    { id: 'rachamayor', nombre: 'Racha Mayor', desc: 'Estudiá siete días seguidos.', icon: 'flame', test: (s) => s.streak >= 7 },
    { id: 'precision', nombre: 'Precisión', desc: 'Sacá 100 % en una autoevaluación.', icon: 'check', test: (s) => s.quizBest >= 100 },
    { id: 'rompecabezas', nombre: 'Rompecabezas', desc: 'Resolvé cinco crucigramas.', icon: 'puzzle', test: (s) => s.crosswords >= 5 },
    { id: 'jugador', nombre: 'Jugador', desc: 'Ganá diez juegos distintos.', icon: 'game', test: (s) => s.gamesWon >= 10 },
    { id: 'oyente', nombre: 'Oyente', desc: 'Escuchá diez audios.', icon: 'audio', test: (s) => s.audios >= 10 },
    { id: 'cinefilo', nombre: 'Cinéfilo', desc: 'Marcá cinco videos como vistos.', icon: 'video', test: (s) => s.videos >= 5 }
  ];

  let memory = null;
  let persisted = true;
  function read() {
    try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : null; } catch (e) { persisted = false; return null; }
  }
  function write() {
    try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { persisted = false; }
  }
  const uid = () => 'p' + Date.now().toString(36) + Math.floor(Math.random() * 999);
  const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  function newProfile(nombre, color) {
    return { id: uid(), nombre, color: color || COLORS[0], prefs: Object.assign({}, QI.DEFAULT_PREFS), prog: { mods: {}, points: 0, minutes: 0, days: [], audios: 0, videos: 0, crosswords: 0, quizBest: 0, medals: {}, last: null } };
  }
  let st = read();
  if (!st || !st.profiles || !Object.keys(st.profiles).length) {
    const p = newProfile('Estudiante');
    st = { active: p.id, profiles: { [p.id]: p } };
  }
  if (!st.profiles[st.active]) st.active = Object.keys(st.profiles)[0];

  const S = (QI.store = {
    COLORS, REQUIRED,
    persisted: () => persisted,
    all: () => Object.values(st.profiles),
    profile: () => st.profiles[st.active],
    prefs: () => S.profile().prefs,
    prog: () => S.profile().prog,
    save() { write(); },
    setPref(patch) { Object.assign(S.prefs(), patch); write(); QI.emit('prefs'); },
    resetPrefs() { S.profile().prefs = Object.assign({}, QI.DEFAULT_PREFS); write(); QI.emit('prefs'); },
    switchProfile(id) { if (st.profiles[id]) { st.active = id; write(); S.touchDay(); QI.emit('profile'); QI.emit('prefs'); QI.emit('progress'); } },
    createProfile(nombre, color) { const p = newProfile(nombre.trim() || 'Estudiante', color); st.profiles[p.id] = p; st.active = p.id; write(); S.touchDay(); QI.emit('profile'); QI.emit('prefs'); QI.emit('progress'); return p; },
    renameProfile(id, nombre) { if (st.profiles[id]) { st.profiles[id].nombre = nombre.trim() || st.profiles[id].nombre; write(); QI.emit('profile'); } },
    deleteProfile(id) {
      if (Object.keys(st.profiles).length < 2) return false;
      delete st.profiles[id];
      if (st.active === id) st.active = Object.keys(st.profiles)[0];
      write(); QI.emit('profile'); QI.emit('prefs'); QI.emit('progress'); return true;
    },
    exportPrefs() { return JSON.stringify({ qiPrefs: 1, prefs: S.prefs() }, null, 2); },
    importPrefs(text) {
      const o = JSON.parse(text);
      if (!o || !o.prefs || typeof o.prefs !== 'object') throw new Error('formato');
      const clean = {};
      for (const k of Object.keys(QI.DEFAULT_PREFS)) if (k in o.prefs && typeof o.prefs[k] === typeof QI.DEFAULT_PREFS[k]) clean[k] = o.prefs[k];
      S.setPref(clean);
    },

    touchDay() {
      const p = S.prog(), t = today();
      if (!p.days.includes(t)) { p.days.push(t); p.days.sort(); write(); S.checkMedals(); }
    },
    addMinutes(m) { S.prog().minutes += m; write(); },
    addPoints(n) { S.prog().points += n; write(); QI.emit('progress'); },
    setLast(hash, label) { S.prog().last = { hash, label }; write(); },
    awardGame(key, pts, pct) { const p = S.prog(); p.won = p.won || {}; const first = !(key in p.won); p.won[key] = Math.max(p.won[key] || 0, pct || 0); if (first) p.points = (p.points || 0) + pts; write(); S.checkMedals(); QI.emit('progress'); return first; },
    gameWon(prefix) { return Object.keys(S.prog().won || {}).some((k) => k.startsWith(prefix)); },
    watchedVideo(id) { return (S.prog().vistos || []).includes(id); },
    markVideo(id) { const p = S.prog(); p.vistos = p.vistos || []; if (p.vistos.includes(id)) return false; p.vistos.push(id); p.videos = p.vistos.length; p.points = (p.points || 0) + 5; write(); S.checkMedals(); QI.emit('progress'); return true; },
    count(key) { S.prog()[key] = (S.prog()[key] || 0) + 1; write(); S.checkMedals(); QI.emit('progress'); },
    quiz(pct) { const p = S.prog(); if (pct > p.quizBest) { p.quizBest = pct; write(); } S.checkMedals(); },

    mod(id) { const m = S.prog().mods; if (!m[id]) m[id] = { sections: {}, nota: null }; return m[id]; },
    isDone(id, sec) { return !!(S.prog().mods[id] && S.prog().mods[id].sections[sec]); },
    modulePct(id) { return Math.round((REQUIRED.filter((s) => S.isDone(id, s)).length / REQUIRED.length) * 100); },
    moduleComplete(id) { return REQUIRED.every((s) => S.isDone(id, s)); },
    modsDone() { return Object.keys(S.prog().mods).filter((id) => S.moduleComplete(id)).length; },
    overallPct(total = 11) { let sum = 0; for (let i = 1; i <= total; i++) sum += S.modulePct(i); return Math.round(sum / total); },
    markSection(id, sec) {
      if (S.isDone(id, sec)) return false;
      S.mod(id).sections[sec] = true;
      S.prog().points += 20;
      QI.toast('Sección completada: +20 puntos');
      if (S.moduleComplete(id)) { S.prog().points += 50; QI.toast('¡Módulo ' + id + ' completo! +50 puntos'); QI.emit('celebrate'); }
      write(); S.checkMedals(); QI.emit('progress');
      return true;
    },
    streak() {
      const days = S.prog().days.slice().sort();
      let best = 0, run = 0, prev = null;
      for (const d of days) {
        const cur = new Date(d + 'T12:00:00');
        run = prev && Math.round((cur - prev) / 86400000) === 1 ? run + 1 : 1;
        best = Math.max(best, run); prev = cur;
      }
      return best;
    },
    stats() { const p = S.prog(); return { modsDone: S.modsDone(), streak: S.streak(), quizBest: p.quizBest, crosswords: p.crosswords, audios: p.audios, videos: p.videos, gamesWon: Object.keys(p.won || {}).length }; },
    checkMedals() {
      const s = S.stats(), p = S.prog();
      for (const m of QI.MEDALS) {
        if (!p.medals[m.id] && m.test(s)) { p.medals[m.id] = today(); QI.toast('Nueva medalla: ' + m.nombre); QI.emit('celebrate'); }
      }
      write();
    }
  });
  S.touchDay();
})();
