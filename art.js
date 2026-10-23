/* Ilustraciones propias: mascota Quimi, escenas de cada tema, insignias, confeti y fondo animado. */
(function () {
  const h = QI.h;
  let n = 0;
  const uid = () => 'a' + ++n;
  const root = document.documentElement;
  const animOn = () => root.getAttribute('data-anim') === 'full' && root.getAttribute('data-simple') !== 'on';

  function sync() {
    const on = animOn();
    document.querySelectorAll('svg[data-smil]').forEach((s) => { try { on ? s.unpauseAnimations() : s.pauseAnimations(); } catch (e) {} });
  }
  const mk = (markup) => { const el = QI.svg(markup); setTimeout(sync, 0); return el; };

  /* ---------- Mascota ---------- */
  const FLASK = 'M48 14 H72 V48 L104 106 Q110 124 92 124 H28 Q10 124 16 106 L48 48 Z';
  function mascot(mood, size) {
    mood = mood || 'hi'; size = size || 120;
    const id = uid();
    const arms = {
      hi: '<path class="arm-r a-wave" d="M99 98 L113 76" /><path d="M21 100 L8 114" />',
      cheer: '<path class="a-cheer" d="M99 98 L114 74" /><path class="a-cheer" d="M21 98 L6 74" />',
      think: '<path d="M99 100 L110 114" /><path d="M21 100 L8 114" />',
      oops: '<path d="M99 100 L112 110" /><path d="M21 100 L8 110" />'
    }[mood] || '';
    const mouth = {
      hi: '<path class="s nf" d="M50 111 Q60 121 70 111"/>',
      cheer: '<path class="s" fill="var(--art-ink)" d="M48 108 Q60 130 72 108 Z"/><path d="M54 118 Q60 124 66 118 Q60 114 54 118Z" fill="#ec6a9a"/>',
      think: '<path class="s nf" d="M53 114 H67"/>',
      oops: '<path class="s nf" d="M50 118 Q60 108 70 118"/>'
    }[mood];
    const look = mood === 'think' ? 'cx="49" cy="95"' : 'cx="46" cy="97"';
    const extra = mood === 'think' ? '<g class="a-float"><circle class="f-w s" cx="96" cy="30" r="14"/><text x="96" y="36" style="font-size:18px">?</text></g>' : '';
    return mk('<svg class="art mascot" viewBox="0 0 120 150" width="' + size + '" height="' + Math.round(size * 1.25) + '" aria-hidden="true" focusable="false" data-smil xmlns="http://www.w3.org/2000/svg">' +
      '<defs><clipPath id="c' + id + '"><path d="' + FLASK + '"/></clipPath></defs>' +
      '<g class="a-bob">' +
      '<g class="s nf" style="stroke-width:6">' + arms + '</g><g style="stroke:var(--c-yellow);stroke-width:3;fill:none;stroke-linecap:round">' + arms.replace(/class="[^"]*"/g, '') + '</g>' +
      '<path class="s f-grey" d="M36 124 L32 138 M84 124 L88 138" style="stroke-width:5;fill:none"/><ellipse class="s f-orange" cx="29" cy="141" rx="9" ry="5"/><ellipse class="s f-orange" cx="91" cy="141" rx="9" ry="5"/>' +
      '<path class="f-glass" d="' + FLASK + '"/>' +
      '<g clip-path="url(#c' + id + ')"><path class="f-teal a-slosh" d="M-60 96 Q-45 88 -30 96 T0 96 T30 96 T60 96 T90 96 T120 96 T150 96 T180 96 V140 H-60 Z"/></g>' +
      '<path class="s nf" d="' + FLASK + '"/><rect class="f-glass s" x="44" y="6" width="32" height="10" rx="5"/>' +
      '<path d="M30 104 L40 86" style="stroke:#fff;stroke-width:3;stroke-linecap:round;opacity:.8;fill:none"/>' +
      '<circle class="f-teal a-rise" cx="56" cy="2" r="4"/><circle class="f-blue a-rise d2" cx="66" cy="0" r="3"/><circle class="f-yellow a-rise d3" cx="60" cy="-2" r="2.5"/>' +
      '<g class="a-blink"><circle class="f-w s" cx="46" cy="97" r="8" style="stroke-width:2.5"/><circle class="f-w s" cx="74" cy="97" r="8" style="stroke-width:2.5"/><circle class="f-ink" ' + look + ' r="4"/><circle class="f-ink" cx="' + (mood === 'think' ? 77 : 74) + '" cy="' + (mood === 'think' ? 95 : 97) + '" r="4"/></g>' +
      '<ellipse cx="33" cy="109" rx="5" ry="3" fill="#ec6a9a" opacity=".7"/><ellipse cx="87" cy="109" rx="5" ry="3" fill="#ec6a9a" opacity=".7"/>' + mouth + extra +
      '</g></svg>');
  }

  /* ---------- Escenas ---------- */
  const wrap = (label, inner, defs) => mk('<svg class="art scene" viewBox="0 0 320 200" role="img" aria-label="' + label + '" data-smil xmlns="http://www.w3.org/2000/svg">' + (defs ? '<defs>' + defs + '</defs>' : '') + inner + '</svg>');
  const astroDef = (id) => '<g id="' + id + '"><rect class="f-grey s" x="-25" y="-62" width="14" height="32" rx="4"/><rect class="f-w s" x="-12" y="-26" width="10" height="24" rx="4"/><rect class="f-w s" x="2" y="-26" width="10" height="24" rx="4"/><ellipse class="f-grey s" cx="-7" cy="0" rx="10" ry="5"/><ellipse class="f-grey s" cx="7" cy="0" rx="10" ry="5"/><rect class="f-w s" x="-16" y="-60" width="32" height="38" rx="11"/><rect class="f-orange s" x="-7" y="-48" width="14" height="8" rx="3"/><path d="M-14 -52 L-26 -36" style="stroke:var(--art-ink);stroke-width:12;stroke-linecap:round;fill:none"/><path d="M-14 -52 L-26 -36" style="stroke:#fff;stroke-width:6;stroke-linecap:round;fill:none"/><path d="M14 -52 L26 -38" style="stroke:var(--art-ink);stroke-width:12;stroke-linecap:round;fill:none"/><path d="M14 -52 L26 -38" style="stroke:#fff;stroke-width:6;stroke-linecap:round;fill:none"/><circle class="f-w s" cx="0" cy="-74" r="18"/><ellipse class="f-blue s" cx="4" cy="-74" rx="11" ry="9"/><circle class="f-w" cx="8" cy="-77" r="2.6"/></g>';
  const orbit = (rot) => '<g transform="rotate(' + rot + ')"><ellipse class="s nf" rx="30" ry="11" style="stroke-width:2"/><circle class="f-yellow s" r="5" style="stroke-width:2"><animateMotion dur="' + (3 + rot / 60) + 's" repeatCount="indefinite" path="M-30 0 a30 11 0 1 0 60 0 a30 11 0 1 0 -60 0"/></circle></g>';

  const SCENES = {
    quimica: () => wrap('Un frasco de laboratorio con burbujas, una molécula de agua y un átomo con electrones en órbita',
      '<rect class="f-ground s" x="14" y="164" width="292" height="10" rx="5"/>' +
      '<g transform="translate(112 30) scale(1.05)"><defs><clipPath id="qf"><path d="' + FLASK + '"/></clipPath></defs><path class="f-glass" d="' + FLASK + '"/><g clip-path="url(#qf)"><path class="f-teal a-slosh" d="M-60 84 Q-45 76 -30 84 T0 84 T30 84 T60 84 T90 84 T120 84 T150 84 T180 84 V140 H-60 Z"/></g><path class="s nf" d="' + FLASK + '"/><rect class="f-glass s" x="44" y="6" width="32" height="10" rx="5"/><circle class="f-w a-rise" cx="56" cy="100" r="5"/><circle class="f-w a-rise d2" cx="70" cy="104" r="4"/><circle class="f-w a-rise d3" cx="62" cy="96" r="3"/><circle class="f-yellow s a-rise d2" cx="60" cy="10" r="5" style="stroke-width:2"/></g>' +
      '<g transform="translate(262 72)">' + orbit(0) + orbit(60) + orbit(120) + '<circle class="f-orange s" r="7"/></g>' +
      '<g transform="translate(58 84)"><g class="a-float"><path class="s nf" d="M0 0 L-22 14 M0 0 L22 14"/><circle class="f-pink s" r="14"/><circle class="f-w s" cx="-24" cy="16" r="8" style="stroke-width:2"/><circle class="f-w s" cx="24" cy="16" r="8" style="stroke-width:2"/><text y="-22" style="font-size:12px">H₂O</text></g></g>' +
      '<text x="160" y="190">La química estudia la materia</text>'),

    materia: () => wrap('Tres ejemplos de materia: el aire, el agua y el vidrio de un vaso',
      '<text x="160" y="28">Todo esto es materia</text>' +
      '<g class="a-float"><g class="s f-w" style="stroke-width:4"><circle cx="46" cy="106" r="17"/><circle cx="70" cy="94" r="23"/><circle cx="96" cy="108" r="17"/><rect x="46" y="106" width="50" height="19" stroke="none"/></g><g class="f-w"><circle cx="46" cy="106" r="15"/><circle cx="70" cy="94" r="21"/><circle cx="96" cy="108" r="15"/><rect x="46" y="104" width="50" height="19"/></g><path class="s nf a-sway" d="M50 142 q12 -8 24 0 t24 0" style="stroke:var(--c-blue)"/></g>' +
      '<g class="a-bob"><path class="s f-blue" d="M160 62 C160 62 132 98 132 120 a28 28 0 0 0 56 0 C188 98 160 62 160 62 Z"/><path class="nf" d="M146 118 a14 14 0 0 0 8 16" style="stroke:#fff;stroke-width:4;stroke-linecap:round"/></g>' +
      '<g><path class="s f-glass" d="M238 74 H284 L278 142 Q277 150 269 150 H253 Q245 150 244 142 Z"/><path class="f-blue" d="M241 104 H281 L278 142 Q277 148 269 148 H253 Q246 148 245 142 Z" opacity=".55"/><path class="nf" d="M250 86 L252 124" style="stroke:#fff;stroke-width:3;stroke-linecap:round"/></g>' +
      '<text x="70" y="176">Aire</text><text x="160" y="176">Agua</text><text x="262" y="176">Vidrio</text>'),

    masa: () => wrap('Una balanza en equilibrio con dos cubos de igual masa',
      '<text x="160" y="26">La masa es la cantidad de materia</text>' +
      '<path class="f-ground s" d="M118 176 L132 156 H188 L202 176 Z"/><rect class="f-blue s" x="156" y="60" width="8" height="98" rx="3"/>' +
      '<g class="a-tilt"><path class="s nf" d="M62 60 H258" style="stroke-width:6"/><path class="s nf" d="M62 60 L38 108 M62 60 L88 108 M258 60 L232 108 M258 60 L282 108" style="stroke-width:2"/>' +
      '<path class="s f-orange" d="M30 108 H96 Q63 138 30 108 Z"/><path class="s f-orange" d="M224 108 H290 Q257 138 224 108 Z"/>' +
      '<rect class="s f-teal" x="46" y="82" width="34" height="26" rx="4"/><text x="63" y="100" style="font-size:11px;fill:#fff">1 kg</text>' +
      '<rect class="s f-teal" x="240" y="82" width="34" height="26" rx="4"/><text x="257" y="100" style="font-size:11px;fill:#fff">1 kg</text></g>' +
      '<circle class="f-yellow s" cx="160" cy="58" r="9"/>'),

    peso: () => {
      const a = uid();
      return wrap('Un astronauta en la Tierra pesa 78 kgr y en la Luna pesa 13 kgr',
        '<rect x="160" y="0" width="160" height="200" fill="#0b1730"/><circle class="a-twinkle" cx="190" cy="40" r="1.8" fill="#fff"/><circle class="a-twinkle d2" cx="226" cy="64" r="1.5" fill="#fff"/><circle class="a-twinkle d3" cx="296" cy="36" r="1.8" fill="#fff"/><circle class="a-twinkle" cx="270" cy="84" r="1.4" fill="#fff"/>' +
        '<rect x="0" y="168" width="160" height="32" fill="#3fb56b"/><rect x="160" y="168" width="160" height="32" fill="#7b879a"/><path d="M0 168 H160 M160 168 H320" style="stroke:var(--art-ink);stroke-width:3"/><path d="M160 0 V200" style="stroke:var(--art-ink);stroke-width:3;stroke-dasharray:6 6"/>' +
        '<ellipse cx="200" cy="184" rx="14" ry="4" fill="#5d6a7e"/><ellipse cx="290" cy="186" rx="10" ry="3" fill="#5d6a7e"/>' +
        '<text x="80" y="26">Tierra</text><text x="240" y="26" style="fill:#fff">Luna</text>' +
        '<g class="a-hop-e"><use href="#' + a + '" x="70" y="168"/></g><g class="a-hop-m"><use href="#' + a + '" x="240" y="168"/></g>' +
        '<path class="nf" d="M126 72 V138" style="stroke:var(--c-orange);stroke-width:9;stroke-linecap:round"/><path d="M114 134 L126 152 L138 134 Z" fill="var(--c-orange)"/><text x="126" y="60">78 kgr</text>' +
        '<path class="nf" d="M290 108 V138" style="stroke:var(--c-orange);stroke-width:3;stroke-linecap:round"/><path d="M284 134 L290 146 L296 134 Z" fill="var(--c-orange)"/><text x="290" y="98" style="fill:#fff">13 kgr</text>',
        astroDef(a));
    },

    inercia: () => wrap('Un auto arranca y el pasajero se inclina hacia atrás por inercia',
      '<text x="160" y="26">Al arrancar, el cuerpo sigue como estaba</text>' +
      '<rect class="f-ground s" x="0" y="150" width="320" height="40"/><path class="nf a-dash" d="M0 172 H320" style="stroke:#fff;stroke-width:4;stroke-dasharray:22 18"/>' +
      '<g class="a-rock"><path class="s f-orange" d="M96 144 V118 Q96 110 104 110 H128 L144 88 Q148 84 154 84 H198 Q204 84 208 88 L224 110 H244 Q252 110 252 118 V144 Z"/><path class="s f-glass" d="M146 92 H172 V110 H134 Z"/><path class="s f-glass" d="M178 92 H200 L214 110 H178 Z"/>' +
      '<g class="a-lean"><circle class="s f-pink" cx="190" cy="100" r="8" style="stroke-width:2.5"/></g>' +
      '<g class="a-spin"><circle class="s f-ink" cx="128" cy="146" r="17"/><path class="nf" d="M128 134 V158 M116 146 H140" style="stroke:#fff;stroke-width:3"/></g><g class="a-spin"><circle class="s f-ink" cx="222" cy="146" r="17"/><path class="nf" d="M222 134 V158 M210 146 H234" style="stroke:#fff;stroke-width:3"/></g></g>' +
      '<g class="nf a-speed" style="stroke:var(--art-ink);stroke-width:3;stroke-linecap:round"><path d="M30 96 H70"/><path d="M14 116 H64"/><path d="M38 134 H72"/></g>'),

    cuerpo: () => wrap('Cuerpos como un lápiz, un globo y una botella; sustancias como hierro, azúcar y agua',
      '<path d="M160 20 V190" class="nf" style="stroke:var(--art-ink);stroke-width:2;stroke-dasharray:5 6"/><text x="80" y="26">Cuerpos</text><text x="240" y="26">Sustancias</text>' +
      '<g class="a-float"><ellipse class="s f-pink" cx="104" cy="74" rx="20" ry="24"/><path class="s f-pink" d="M99 98 L104 104 L109 98 Z"/><path class="nf" d="M104 104 q-6 14 2 26" style="stroke:var(--art-ink);stroke-width:2"/><path class="nf" d="M94 62 q2 -8 10 -9" style="stroke:#fff;stroke-width:3;stroke-linecap:round"/></g>' +
      '<g transform="translate(24 150) rotate(-24)"><rect class="s f-pink" x="-8" y="0" width="10" height="13" rx="3"/><rect class="s f-yellow" x="2" y="0" width="56" height="13"/><path class="s" fill="#e5c08c" d="M58 0 L76 6.5 L58 13 Z"/><path d="M71 4.2 L76 6.5 L71 8.8Z" fill="var(--art-ink)"/></g>' +
      '<rect class="s f-glass" x="118" y="116" width="28" height="48" rx="5"/><rect class="f-blue" x="121" y="134" width="22" height="28" rx="3" opacity=".6"/><rect class="s f-grey" x="124" y="108" width="16" height="9" rx="2"/>' +
      '<path class="s f-grey" d="M186 152 L196 126 L222 118 L244 136 L238 156 Z"/><path class="nf" d="M200 130 L216 126" style="stroke:#fff;stroke-width:3;stroke-linecap:round;opacity:.7"/><text x="214" y="180" style="font-size:11px">Hierro</text>' +
      '<rect class="s f-w" x="256" y="140" width="22" height="22" rx="3"/><rect class="s f-w" x="276" y="124" width="22" height="22" rx="3"/><text x="276" y="180" style="font-size:11px">Azúcar</text>' +
      '<g class="a-bob"><path class="s f-blue" d="M214 56 C214 56 198 78 198 90 a16 16 0 0 0 32 0 C230 78 214 56 214 56 Z"/></g><text x="214" y="112" style="font-size:11px">Agua</text>'),

    propiedades: () => wrap('A la izquierda, un bloque de hierro sobre una balanza: propiedad física. A la derecha, un clavo en ácido que burbujea: propiedad química',
      '<path d="M160 20 V190" class="nf" style="stroke:var(--art-ink);stroke-width:2;stroke-dasharray:5 6"/><text x="80" y="26">Física</text><text x="240" y="26">Química</text>' +
      '<rect class="s f-ground" x="34" y="138" width="92" height="26" rx="6"/><rect class="s f-w" x="52" y="144" width="40" height="14" rx="3" style="stroke-width:2"/><path class="nf" d="M58 151 H86" style="stroke:var(--c-teal);stroke-width:3;stroke-linecap:round"/>' +
      '<rect class="s f-grey" x="56" y="96" width="48" height="42" rx="4"/><path class="nf" d="M64 106 H90" style="stroke:#fff;stroke-width:3;stroke-linecap:round;opacity:.7"/><text x="80" y="184" style="font-size:11px">La composición no cambia</text>' +
      '<path class="s f-glass" d="M204 70 H276 V142 Q276 160 258 160 H222 Q204 160 204 142 Z"/><path class="f-orange a-bubble-liq" d="M207 104 H273 V142 Q273 157 258 157 H222 Q207 157 207 142 Z" opacity=".6"/>' +
      '<path class="nf" d="M226 56 L252 120" style="stroke:var(--art-ink);stroke-width:9;stroke-linecap:round"/><path class="nf" d="M226 56 L252 120" style="stroke:#9aa7b8;stroke-width:5;stroke-linecap:round"/>' +
      '<circle class="f-w a-rise" cx="222" cy="140" r="5"/><circle class="f-w a-rise d2" cx="240" cy="142" r="4"/><circle class="f-w a-rise d3" cx="256" cy="138" r="5"/><circle class="f-w a-rise" cx="232" cy="132" r="3"/>' +
      '<text x="240" y="184" style="font-size:11px">La composición cambia</text>'),

    intensivas: () => wrap('Dos bloques de aluminio de distinto tamaño con la misma densidad, y una olla de agua que hierve a 100 grados con una atmósfera',
      '<path d="M160 20 V190" class="nf" style="stroke:var(--art-ink);stroke-width:2;stroke-dasharray:5 6"/><text x="80" y="26">Misma densidad</text><text x="240" y="26">Punto de ebullición</text>' +
      '<rect class="s" fill="#b9c7da" x="22" y="112" width="40" height="40" rx="4"/><rect class="s" fill="#b9c7da" x="76" y="84" width="68" height="68" rx="5"/><path class="nf" d="M30 120 H48 M84 92 H114" style="stroke:#fff;stroke-width:3;stroke-linecap:round"/>' +
      '<text x="42" y="172" style="font-size:10px">2,698</text><text x="110" y="172" style="font-size:10px">2,698</text><text x="80" y="188" style="font-size:10px">g/cm³ en los dos</text>' +
      '<g class="a-flicker"><path class="s f-orange" d="M206 176 q8 -18 14 0 q8 -22 14 0 q8 -18 14 0 q8 -20 14 0 Z" style="stroke-width:2"/></g>' +
      '<rect class="s f-blue" x="198" y="122" width="84" height="48" rx="8"/><path class="s nf" d="M198 134 H186 M282 134 H294" style="stroke-width:5"/><rect class="s f-glass" x="204" y="126" width="72" height="12" rx="5" style="stroke-width:2"/>' +
      '<path class="nf a-steam" d="M222 112 q-8 -10 0 -20 t0 -20" style="stroke:var(--art-ink);stroke-width:3;stroke-linecap:round;opacity:.5"/><path class="nf a-steam d2" d="M240 112 q-8 -10 0 -20 t0 -20" style="stroke:var(--art-ink);stroke-width:3;stroke-linecap:round;opacity:.5"/><path class="nf a-steam d3" d="M258 112 q-8 -10 0 -20 t0 -20" style="stroke:var(--art-ink);stroke-width:3;stroke-linecap:round;opacity:.5"/>' +
      '<text x="240" y="150" style="font-size:12px;fill:#fff">100 °C</text><text x="240" y="190" style="font-size:11px">a 1 atmósfera</text>')
  };

  /* Escena de la simulación */
  function astroPlace(place) {
    const a = uid();
    const stars = '<circle class="a-twinkle" cx="40" cy="36" r="1.8" fill="#fff"/><circle class="a-twinkle d2" cx="96" cy="64" r="1.5" fill="#fff"/><circle class="a-twinkle d3" cx="250" cy="30" r="1.8" fill="#fff"/><circle class="a-twinkle" cx="290" cy="80" r="1.4" fill="#fff"/><circle class="a-twinkle d2" cx="190" cy="46" r="1.4" fill="#fff"/><circle class="a-twinkle d3" cx="150" cy="22" r="1.6" fill="#fff"/>';
    const defs = astroDef(a);
    if (place === 'tierra') return wrap('Un astronauta salta poco en la Tierra: la gravedad es normal',
      '<circle class="f-yellow s" cx="292" cy="34" r="12"/><g class="a-float"><g class="f-w s" style="stroke-width:3"><circle cx="70" cy="50" r="10"/><circle cx="86" cy="44" r="14"/><circle cx="102" cy="52" r="10"/></g></g><rect x="0" y="168" width="320" height="32" fill="#3fb56b"/><path d="M0 168 H320" style="stroke:var(--art-ink);stroke-width:3"/>' +
      '<g class="a-hop-e"><use href="#' + a + '" x="160" y="168"/></g><path class="nf" d="M236 70 V142" style="stroke:var(--c-orange);stroke-width:10;stroke-linecap:round"/><path d="M222 138 L236 158 L250 138 Z" fill="var(--c-orange)"/><text x="226" y="60">g normal</text>', defs);
    if (place === 'luna') return wrap('Un astronauta salta alto en la Luna: la gravedad es un sexto de la terrestre',
      '<rect width="320" height="200" fill="#0b1730"/>' + stars + '<circle cx="270" cy="52" r="18" fill="#3b82d6"/><path d="M262 44 q8 -4 12 4 q-4 8 -12 4z" fill="#3fb56b"/><rect x="0" y="168" width="320" height="32" fill="#7b879a"/><path d="M0 168 H320" style="stroke:var(--art-ink);stroke-width:3"/><ellipse cx="60" cy="184" rx="18" ry="4" fill="#5d6a7e"/><ellipse cx="250" cy="186" rx="12" ry="3" fill="#5d6a7e"/>' +
      '<g class="a-hop-m"><use href="#' + a + '" x="160" y="168"/></g><path class="nf" d="M236 100 V138" style="stroke:var(--c-orange);stroke-width:3;stroke-linecap:round"/><path d="M230 134 L236 146 L242 134 Z" fill="var(--c-orange)"/><text x="236" y="90" style="fill:#fff">g = 1/6</text>', defs);
    return wrap('Un astronauta flota en el espacio exterior: no hay gravedad que lo atraiga',
      '<rect width="320" height="200" fill="#0b1730"/>' + stars + '<circle cx="60" cy="150" r="12" fill="#f08a24"/><ellipse cx="60" cy="150" rx="22" ry="4" fill="none" stroke="#f7c948" stroke-width="2"/><g class="a-space"><use href="#' + a + '" x="160" y="140"/></g><text x="236" y="150" style="fill:#fff">g = 0</text>', defs);
  }

  /* ---------- Insignias de módulo ---------- */
  const MOD = { 1: ['flask', '#1c58b8'], 2: ['bolt', '#c2410c'], 3: ['layers', '#0f766e'], 4: ['drops', '#0369a1'], 5: ['thermo', '#b91c1c'], 6: ['atom', '#6d28d9'], 7: ['scale', '#be185d'], 8: ['puzzle', '#4d7c0f'], 9: ['hex', '#0e7490'], 10: ['swap', '#a21caf'], 11: ['help', '#854d0e'] };
  const moduleBadge = (i) => { const [ic, c] = MOD[i] || MOD[1]; return h('span', { class: 'mbadge', style: 'background:' + c, 'aria-hidden': 'true' }, QI.icon(ic)); };
  const TILE = { aprender: '#1c58b8', jugar: '#c2410c', videos: '#6d28d9', logros: '#a16207' };

  /* ---------- Decoración del encabezado de inicio y del fondo ---------- */
  function heroDecor() {
    return mk('<svg class="hero-deco deco" viewBox="0 0 600 260" preserveAspectRatio="xMidYMid slice" aria-hidden="true" data-smil xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="#fff" stroke-width="2" opacity=".35">' +
      '<path class="a-float" d="M60 40 l22 12 v24 l-22 12 l-22 -12 v-24 z"/><path class="a-float d2" d="M470 190 l30 17 v34 l-30 17 l-30 -17 v-34 z"/><path class="a-float d3" d="M330 30 l16 9 v18 l-16 9 l-16 -9 v-18 z"/>' +
      '<g transform="translate(520 70)"><ellipse rx="40" ry="14"/><ellipse rx="40" ry="14" transform="rotate(60)"/><ellipse rx="40" ry="14" transform="rotate(120)"/></g></g>' +
      '<g transform="translate(520 70)"><circle r="6" fill="#f7c948"/><circle r="4" fill="#fff"><animateMotion dur="4s" repeatCount="indefinite" path="M-40 0 a40 14 0 1 0 80 0 a40 14 0 1 0 -80 0"/></circle></g>' +
      '<g class="a-float d2" opacity=".5" fill="#fff"><circle cx="150" cy="210" r="9"/><circle cx="180" cy="228" r="6"/><circle cx="126" cy="230" r="6"/></g><g class="a-float" opacity=".5" fill="#f7c948"><circle cx="400" cy="120" r="5"/><circle cx="560" cy="200" r="4"/></g></svg>');
  }
  function bg() {
    if (document.getElementById('bgart')) return;
    const d = h('div', { id: 'bgart', class: 'bgart deco', 'aria-hidden': 'true' });
    [[4, 14, 70, 0], [88, 6, 54, 3], [93, 46, 96, 6], [2, 58, 110, 9], [46, 82, 64, 2], [76, 88, 80, 5], [22, 30, 40, 7]].forEach(([x, y, s, dl], i) => {
      d.append(h('span', { class: 'bgshape', style: 'left:' + x + '%;top:' + y + '%;width:' + s + 'px;height:' + s + 'px;animation-delay:-' + dl + 's' }, mk('<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">' + (i % 3 === 0 ? '<circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" stroke-width="4"/>' : '<path d="M50 4 90 27v46L50 96 10 73V27z" fill="none" stroke="currentColor" stroke-width="4"/>') + '</svg>')));
    });
    document.body.prepend(d);
  }

  /* ---------- Confeti ---------- */
  function confetti() {
    if (!animOn()) return;
    const cv = h('canvas', { class: 'confetti', 'aria-hidden': 'true' });
    cv.width = window.innerWidth; cv.height = window.innerHeight; document.body.append(cv);
    const ctx = cv.getContext('2d'), cols = ['#2f7ad6', '#14a39a', '#f08a24', '#f7c948', '#ec6a9a', '#8b5cf6', '#3fb56b'];
    const ps = Array.from({ length: 110 }, () => ({ x: Math.random() * cv.width, y: -20 - Math.random() * cv.height * 0.4, vx: Math.random() * 4 - 2, vy: 2 + Math.random() * 4, s: 6 + Math.random() * 6, r: Math.random() * 6, vr: Math.random() * 0.3 - 0.15, c: cols[Math.floor(Math.random() * cols.length)] }));
    const t0 = performance.now();
    (function frame(t) {
      const k = (t - t0) / 2600;
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.globalAlpha = Math.max(0, 1 - Math.max(0, k - 0.6) / 0.4);
      ps.forEach((p) => { p.x += p.vx; p.y += p.vy; p.vy += 0.03; p.r += p.vr; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore(); });
      if (k < 1) requestAnimationFrame(frame); else cv.remove();
    })(t0);
  }

  QI.art = {
    mascot, scene: (name) => (SCENES[name] ? SCENES[name]() : null), astroPlace, moduleBadge, TILE, heroDecor, confetti, sync,
    init() { bg(); QI.on('celebrate', confetti); QI.on('prefs', sync); sync(); }
  };
})();
