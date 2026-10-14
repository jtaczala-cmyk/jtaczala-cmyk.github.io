/* Lavakule / Lawowa kulka / Lava Marble — Stop60 (c) 2026. Three.js (MIT) vendored, see lisenser.html */
import * as THREE from './three.module.min.js';

const LANG = document.documentElement.dataset.lang || 'no';
const T = {
  no: { title:'Lavakule', tag:'Rull glasskula over lavaen. Ikke stopp – lavaen stiger!', start:'Start / Tillat tilt', startKb:'Start', calib:'Kalibrer', again:'Spill igjen', menu:'Meny',
    best:'Rekord', score:'Poeng', dist:'Distanse', coins:'Mynter', over:'Spillet er over', newbest:'Ny rekord!',
    howTilt:'Vipp telefonen: venstre/høyre styrer, fremover gir fart, bakover bremser. Svinger du for fort, ryker du av banen.',
    howKb:'PC: piltaster / WASD. Mobil uten tilt: dra fingeren eller bruk knappene.',
    pu:'Magnet trekker til seg mynter · Steinskall gjør kula tung og tåler ett støt',
    flash:'Advarsel: spillet har korte lysglimt og risting av skjermen.', noTilt:'Tilt ikke tilgjengelig – bruk dra/knapper.',
    denied:'Tilt ble ikke tillatt – bruk dra/knapper.', fell:'Du falt av banen', burnt:'Lavaen tok deg', shattered:'Kula knuste',
    magnet:'MAGNET', shell:'STEINSKALL', crack:'Sprekk!', heat:'Lava', calibrated:'Kalibrert', test:'TEST', lic:'Lisenser', local:'Rekorden lagres bare på denne enheten.' },
  pl: { title:'Lawowa kulka', tag:'Tocz szklaną kulkę nad lawą. Nie zatrzymuj się – lawa rośnie!', start:'Start / Zezwól na przechył', startKb:'Start', calib:'Kalibruj', again:'Zagraj ponownie', menu:'Menu',
    best:'Rekord', score:'Wynik', dist:'Dystans', coins:'Monety', over:'Koniec gry', newbest:'Nowy rekord!',
    howTilt:'Przechylaj telefon: lewo/prawo – skręt, do przodu – szybciej, do tyłu – hamowanie. Za szybko w zakręt = wypadasz z toru.',
    howKb:'PC: strzałki / WASD. Telefon bez przechyłu: przeciągaj palcem albo użyj przycisków.',
    pu:'Magnes przyciąga monety · Kamienna skorupa: kulka cięższa, wytrzyma jedno uderzenie',
    flash:'Uwaga: w grze występują krótkie błyski i drgania ekranu.', noTilt:'Przechył niedostępny – użyj przeciągania/przycisków.',
    denied:'Brak zgody na przechył – użyj przeciągania/przycisków.', fell:'Spadłeś z toru', burnt:'Lawa cię dopadła', shattered:'Kulka pękła',
    magnet:'MAGNES', shell:'SKORUPA', crack:'Pęknięcie!', heat:'Lawa', calibrated:'Skalibrowano', test:'TEST', lic:'Licencje', local:'Rekord zapisuje się tylko na tym urządzeniu.' },
  en: { title:'Lava Marble', tag:'Roll a glass marble over the lava. Don\u2019t stop – the lava is rising!', start:'Start / Allow tilt', startKb:'Start', calib:'Calibrate', again:'Play again', menu:'Menu',
    best:'Best', score:'Score', dist:'Distance', coins:'Coins', over:'Game over', newbest:'New best!',
    howTilt:'Tilt the phone: left/right steers, forward speeds up, back slows down. Take a corner too fast and you fly off.',
    howKb:'Desktop: arrow keys / WASD. Phone without tilt: drag your finger or use the buttons.',
    pu:'Magnet pulls coins in · Stone Shell makes the marble heavy and survives one hit',
    flash:'Warning: this game contains brief flashes and screen shake.', noTilt:'Tilt unavailable – use drag/buttons.',
    denied:'Tilt not allowed – use drag/buttons.', fell:'You fell off the track', burnt:'The lava got you', shattered:'The marble shattered',
    magnet:'MAGNET', shell:'STONE SHELL', crack:'Crack!', heat:'Lava', calibrated:'Calibrated', test:'TEST', lic:'Licences', local:'Best score is stored on this device only.' }
}[LANG];
const $ = id => document.getElementById(id);
document.querySelectorAll('[data-t]').forEach(e => { if (T[e.dataset.t]) e.textContent = T[e.dataset.t]; });
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const BEST_KEY = 'lavakule_best_v1';
let best = +(localStorage.getItem(BEST_KEY) || 0);
$('bestVal').textContent = best;

/* ---------- analytics (GoatCounter, count.js honours skipgc / #toggle-goatcounter) ---------- */
const base = location.pathname.replace(/index\.html$/, '').replace(/(pl|en)\/$/, '');
window.goatcounter = { path: base + (LANG === 'no' ? '' : LANG + '/') };
{ const s = document.createElement('script'); s.async = true; s.src = base + 'count.js'; s.dataset.goatcounter = 'https://jtaczala-games.goatcounter.com/count'; document.head.appendChild(s); }
function gc(n) { (window.__gcLog = window.__gcLog || []).push(n); setTimeout(() => { try { window.goatcounter.count && window.goatcounter.count({ path: 'lavakule-' + n, title: 'lavakule ' + n, event: true }); } catch (e) {} }, 300); }
let gcT0 = 0;
function gcTime() { if (!gcT0) return; const m = (Date.now() - gcT0) / 60000; gcT0 = 0;
  gc('time-' + (m < 1 ? '0-1m' : m < 3 ? '1-3m' : m < 5 ? '3-5m' : m < 10 ? '5-10m' : m < 20 ? '10-20m' : '20m+')); }
addEventListener('pagehide', gcTime); document.addEventListener('visibilitychange', () => { if (document.hidden) { gcTime(); if (state === 'play') pause(true); } });

/* ---------- audio (WebAudio, all generated) ---------- */
let ac = null, master, rollG, rollF, sizzleG;
function audioInit() {
  if (ac) { ac.resume(); return; }
  try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
  master = ac.createGain(); master.gain.value = 0.7; master.connect(ac.destination);
  const nb = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = nb.getChannelData(0);
  for (let i = 0, b = 0; i < d.length; i++) { b = 0.97 * b + 0.03 * (Math.random() * 2 - 1); d[i] = b * 4; }
  const n = ac.createBufferSource(); n.buffer = nb; n.loop = true;
  rollF = ac.createBiquadFilter(); rollF.type = 'lowpass'; rollF.frequency.value = 300;
  rollG = ac.createGain(); rollG.gain.value = 0; n.connect(rollF).connect(rollG).connect(master); n.start();
  const wb = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), w = wb.getChannelData(0);
  for (let i = 0; i < w.length; i++) w[i] = (Math.random() * 2 - 1) * (Math.random() < 0.02 ? 1 : 0.15);
  const s = ac.createBufferSource(); s.buffer = wb; s.loop = true; const hp = ac.createBiquadFilter(); hp.type = 'bandpass'; hp.frequency.value = 2500;
  sizzleG = ac.createGain(); sizzleG.gain.value = 0; s.connect(hp).connect(sizzleG).connect(master); s.start();
}
function tone(f, dur, type = 'sine', vol = 0.25, f2 = null, delay = 0) {
  if (!ac) return; const t0 = ac.currentTime + delay, o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t0); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
  g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + dur); o.connect(g).connect(master); o.start(t0); o.stop(t0 + dur + 0.05);
}
function noiseHit(dur, freq, vol) {
  if (!ac) return; const b = ac.createBuffer(1, ac.sampleRate * dur, ac.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2);
  const s = ac.createBufferSource(); s.buffer = b; const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = 0.8;
  const g = ac.createGain(); g.gain.value = vol; s.connect(f).connect(g).connect(master); s.start();
}
const sfx = {
  coin: () => { tone(1320, 0.12, 'triangle', 0.18); tone(1980, 0.18, 'triangle', 0.14, null, 0.05); },
  power: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.2, 'square', 0.08, null, i * 0.07)),
  crack: () => { noiseHit(0.25, 4000, 0.9); tone(2400, 0.15, 'sine', 0.1, 900); },
  shell: () => { noiseHit(0.35, 600, 1.2); tone(180, 0.3, 'sawtooth', 0.15, 60); },
  shatter: () => { noiseHit(0.8, 5000, 1.2); for (let i = 0; i < 8; i++) tone(2000 + Math.random() * 3000, 0.3, 'sine', 0.05, 800, i * 0.04); },
  fall: () => tone(600, 1.1, 'sine', 0.2, 80),
  burn: () => { noiseHit(1.2, 1200, 1); tone(120, 0.8, 'sawtooth', 0.15, 40); },
  calib: () => tone(880, 0.1, 'sine', 0.15),
};

/* ---------- haptics: vibrate on Android; iOS -> shake + sound ---------- */
const canVibrate = typeof navigator.vibrate === 'function';
let shake = 0;
function haptic(ms, strength) { if (canVibrate) { try { navigator.vibrate(ms); } catch (e) {} } if (!REDUCED) shake = Math.max(shake, strength * (canVibrate ? 0.4 : 1)); }
function flash(color, a) { if (REDUCED) a *= 0.3; const f = $('flash'); f.style.background = color; f.style.transition = 'none'; f.style.opacity = a;
  requestAnimationFrame(() => { f.style.transition = 'opacity .35s'; f.style.opacity = 0; }); }

/* ---------- renderer / scene ---------- */
const canvas = $('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
const scene = new THREE.Scene();
{ const cv = document.createElement('canvas'); cv.width = 2; cv.height = 256; const cx2 = cv.getContext('2d'), gr = cx2.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, '#07040a'); gr.addColorStop(0.55, '#2a0c06'); gr.addColorStop(0.85, '#8a2a08'); gr.addColorStop(1, '#ff6a18'); cx2.fillStyle = gr; cx2.fillRect(0, 0, 2, 256);
  const bt = new THREE.CanvasTexture(cv); bt.colorSpace = THREE.SRGBColorSpace; scene.background = bt; } scene.fog = new THREE.Fog(0x2a0a03, 30, 110);
const camera = new THREE.PerspectiveCamera(62, 1, 0.1, 300);
scene.add(new THREE.HemisphereLight(0xffc49a, 0x3a0800, 0.9));
const sun = new THREE.DirectionalLight(0xfff0e0, 1.6); sun.position.set(-6, 14, 4); scene.add(sun); scene.add(sun.target);
const lavaLight = new THREE.PointLight(0xff5a10, 60, 30, 1.6); scene.add(lavaLight);

/* environment for glass reflections: generated gradient room */
{ const envScene = new THREE.Scene();
  const g = new THREE.SphereGeometry(10, 32, 16), cols = [], top = new THREE.Color(0x40180c), bot = new THREE.Color(0xff6a10), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const y = p.getY(i) / 10; const c = bot.clone().lerp(top, (y + 1) / 2); if (y > 0.7) c.lerp(new THREE.Color(0xffffff), (y - 0.7) * 3); cols.push(c.r * 2, c.g * 2, c.b * 2); }
  g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  envScene.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(envScene, 0.02).texture; scene.environmentIntensity = 0.8; }

/* lava: animated shader plane following the camera */
const lavaMat = new THREE.ShaderMaterial({
  uniforms: { t: { value: 0 }, off: { value: new THREE.Vector2() } },
  vertexShader: `varying vec2 vW; varying float vD; uniform vec2 off; void main(){ vec4 w = modelMatrix*vec4(position,1.); vW = w.xz; vec4 mv = viewMatrix*w; vD = -mv.z; gl_Position = projectionMatrix*mv; }`,
  fragmentShader: `varying vec2 vW; varying float vD; uniform float t;
    float h(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
    float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y); }
    float fbm(vec2 p){ float v=0., a=.5; for(int i=0;i<5;i++){ v+=a*n(p); p=p*2.03+vec2(1.7,9.2); a*=.5; } return v; }
    void main(){ vec2 p = vW*.08; vec2 q = vec2(fbm(p+vec2(0.,t*.05)), fbm(p+vec2(5.2,-t*.04)));
      float f = fbm(p*1.7 + 2.5*q + vec2(t*.03,0.));
      float crust = smoothstep(.45,.62,f);
      vec3 hot = mix(vec3(1.,.95,.45), vec3(1.,.35,.03), smoothstep(.15,.45,f));
      vec3 col = mix(hot*2.2, vec3(.12,.03,.02), crust*.85);
      col += vec3(1.,.4,.05)*pow(1.-crust,6.)*.8;
      float fog = clamp((vD-30.)/90.,0.,1.); col = mix(col, vec3(.35,.08,.02), fog*.7);
      gl_FragColor = vec4(col,1.); }`
});
const lava = new THREE.Mesh(new THREE.PlaneGeometry(400, 400, 1, 1), lavaMat); lava.rotation.x = -Math.PI / 2; scene.add(lava);
/* embers */
const EMB = 160, embGeo = new THREE.BufferGeometry(), embPos = new Float32Array(EMB * 3);
embGeo.setAttribute('position', new THREE.BufferAttribute(embPos, 3));
const embers = new THREE.Points(embGeo, new THREE.PointsMaterial({ color: 0xffa040, size: 0.18, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }));
scene.add(embers);

/* ---------- track generation ---------- */
const DS = 0.5;               // sample spacing
const TR = { x: [], z: [], y: [], h: [], k: [], w: [] };   // centre, height, heading, curvature, half-width
let genS = 0, segLeft = 0, segK = 0, curK = 0, curW = 2.4, segW = 2.4;
const rnd = (a, b) => a + Math.random() * (b - a);
function difficulty(s) { return Math.min(1, s / 2500); }
function genSample() {
  const i = TR.x.length, s = i * DS;
  if (segLeft <= 0) { const d = difficulty(s); segLeft = rnd(12, 40);
    segK = s < 40 ? 0 : (Math.random() < 0.3 ? 0 : (Math.random() < .5 ? -1 : 1) * rnd(0.02, 0.035 + 0.05 * d));
    segW = Math.max(1.05, rnd(2.0, 2.6) - 1.0 * d - (Math.random() < 0.15 * d ? 0.5 : 0)); }
  segLeft -= DS; curK += (segK - curK) * 0.06; curW += (segW - curW) * 0.05;
  if (i === 0) { TR.x.push(0); TR.z.push(0); TR.h.push(0); }
  else { const hd = TR.h[i - 1] + curK * DS; TR.h.push(hd); TR.x.push(TR.x[i - 1] + Math.sin(hd) * DS); TR.z.push(TR.z[i - 1] - Math.cos(hd) * DS); }
  TR.y.push(-0.055 * s + 1.2 * Math.sin(s / 31) + 0.5 * Math.sin(s / 11.3)); TR.k.push(curK); TR.w.push(curW);
}
function at(s) { const f = Math.max(0, s / DS), i = Math.floor(f), u = f - i; while (TR.x.length < i + 3) genSample();
  const L = (a) => a[i] + (a[i + 1] - a[i]) * u; return { x: L(TR.x), z: L(TR.z), y: L(TR.y), h: L(TR.h), k: L(TR.k), w: L(TR.w) }; }

const trackMat = new THREE.MeshStandardMaterial({ color: 0x2a2220, roughness: 0.55, metalness: 0.2, vertexColors: true });
const edgeMat = new THREE.MeshBasicMaterial({ color: 0xffb040 });
const chunks = []; const CH = 60; // samples per chunk
let chunkNext = 0;
function buildChunk(i0) {
  const n = CH + 1; while (TR.x.length < i0 + n + 2) genSample();
  const pos = [], col = [], idx = [], epos = [], eidx = [];
  const TH = 0.35;
  for (let j = 0; j < n; j++) { const i = i0 + j, hd = TR.h[i], cx = Math.cos(hd), sz = Math.sin(hd), w = TR.w[i], x = TR.x[i], z = TR.z[i], y = TR.y[i];
    const lx = x - cx * w, lz = z - sz * w, rx = x + cx * w, rz = z + sz * w;
    pos.push(lx, y, lz, rx, y, rz, lx, y - TH, lz, rx, y - TH, rz);
    const checker = (Math.floor(i * DS / 2) % 2) ? 0.85 : 1.0; for (let q = 0; q < 2; q++) col.push(checker, checker * 0.95, checker * 0.9); col.push(1.4, .5, .2, 1.4, .5, .2);
    for (const sgn of [-1, 1]) { const ex = x + cx * w * sgn, ez = z + sz * w * sgn; epos.push(ex - cx * 0.06 * sgn, y + 0.02, ez - sz * 0.06 * sgn, ex + cx * 0.02 * sgn, y + 0.02, ez + sz * 0.02 * sgn); }
    if (j < n - 1) { const a = j * 4, b = a + 4; idx.push(a, b, a + 1, a + 1, b, b + 1, a + 2, a + 3, b + 2, a + 3, b + 3, b + 2, a, a + 2, b, a + 2, b + 2, b, a + 1, b + 1, a + 3, a + 3, b + 1, b + 3);
      const e = j * 4, f = e + 4; eidx.push(e, f, e + 1, e + 1, f, f + 1, e + 2, f + 2, e + 3, e + 3, f + 2, f + 3); } }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals();
  const eg = new THREE.BufferGeometry(); eg.setAttribute('position', new THREE.Float32BufferAttribute(epos, 3)); eg.setIndex(eidx);
  const grp = new THREE.Group(); grp.add(new THREE.Mesh(g, trackMat)); grp.add(new THREE.Mesh(eg, edgeMat)); scene.add(grp);
  chunks.push({ i0, grp }); spawnItems(i0, i0 + CH);
}

/* ---------- items ---------- */
const coinGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.07, 20); coinGeo.rotateX(Math.PI / 2);
const coinMat = new THREE.MeshStandardMaterial({ color: 0xffcc33, metalness: 1, roughness: 0.25, emissive: 0x553300 });
const rockGeo = new THREE.DodecahedronGeometry(0.5, 0);
const rockMat = new THREE.MeshStandardMaterial({ color: 0x1b1614, roughness: 0.9, emissive: 0x3a0a00, flatShading: true });
const spikeGeo = new THREE.ConeGeometry(0.32, 0.9, 6);
const magGeo = new THREE.TorusGeometry(0.28, 0.09, 8, 16, Math.PI * 1.3);
const magMat = new THREE.MeshStandardMaterial({ color: 0xe11d2a, emissive: 0x500000, metalness: .4, roughness: .3 });
const shGeo = new THREE.IcosahedronGeometry(0.33, 0);
const shMat = new THREE.MeshStandardMaterial({ color: 0x8a7f74, emissive: 0x2dd4bf, emissiveIntensity: 0.25, roughness: 0.8, flatShading: true });
const items = [];
function addItem(type, s, x) { const p = at(s); let m;
  if (type === 'coin') m = new THREE.Mesh(coinGeo, coinMat);
  else if (type === 'rock') m = new THREE.Mesh(rockGeo, rockMat);
  else if (type === 'spike') m = new THREE.Mesh(spikeGeo, rockMat);
  else if (type === 'magnet') m = new THREE.Mesh(magGeo, magMat);
  else m = new THREE.Mesh(shGeo, shMat);
  const cx = Math.cos(p.h), sz = Math.sin(p.h);
  m.position.set(p.x + cx * x, p.y + (type === 'rock' ? 0.35 : type === 'spike' ? 0.45 : 0.55), p.z + sz * x); m.rotation.y = -p.h;
  if (type === 'rock') m.rotation.set(Math.random() * 3, Math.random() * 3, 0);
  scene.add(m); items.push({ type, s, x, m, alive: true, y0: m.position.y });
}
function spawnItems(i0, i1) {
  for (let s = i0 * DS; s < i1 * DS; s += 1) {
    if (s < 25) continue; const p = at(s), d = difficulty(s), w = p.w - 0.4;
    if (Math.random() < 0.05) { const n = 5 + (Math.random() * 6 | 0), x0 = rnd(-w, w), x1 = rnd(-w, w); for (let j = 0; j < n; j++) addItem('coin', s + j * 1.6, x0 + (x1 - x0) * j / n); s += n * 1.6; continue; }
    if (Math.random() < 0.03 + 0.06 * d) { addItem(Math.random() < 0.5 ? 'rock' : 'spike', s, rnd(-w, w) * 0.9); if (d > 0.4 && Math.random() < 0.4) addItem('rock', s, rnd(-w, w) * 0.9); s += 4; continue; }
    if (Math.random() < 0.004) { addItem(Math.random() < 0.5 ? 'magnet' : 'shell', s, rnd(-w, w) * 0.7); s += 5; }
  }
}

/* ---------- marble ---------- */
const R = 0.35;
const marble = new THREE.Group(); scene.add(marble);
const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.03, metalness: 0, transmission: 1, thickness: 0.6, ior: 1.5, clearcoat: 1, clearcoatRoughness: 0.02, attenuationColor: new THREE.Color(0x9fe8ff), attenuationDistance: 1.2, envMapIntensity: 1.5 });
const glass = new THREE.Mesh(new THREE.SphereGeometry(R, 48, 32), glassMat); marble.add(glass);
const core = new THREE.Mesh(new THREE.TorusKnotGeometry(0.11, 0.03, 64, 8), new THREE.MeshStandardMaterial({ color: 0x2dd4bf, emissive: 0x0e6b60, roughness: .2 })); glass.add(core);
const crackMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
const cracks = new THREE.Group(); glass.add(cracks);
function addCracks() { for (let c = 0; c < 4; c++) { const pts = []; let v = new THREE.Vector3().randomDirection();
  for (let j = 0; j < 7; j++) { pts.push(v.clone().multiplyScalar(R * 1.01)); v.add(new THREE.Vector3().randomDirection().multiplyScalar(0.25)).normalize(); }
  cracks.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), crackMat)); } }
const shellMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(R * 1.18, 1), new THREE.MeshStandardMaterial({ color: 0x6b625a, roughness: 0.95, flatShading: true, transparent: true, opacity: 0.92 }));
shellMesh.visible = false; glass.add(shellMesh);
const halo = new THREE.Mesh(new THREE.RingGeometry(0.5, 2.6, 32), new THREE.MeshBasicMaterial({ color: 0xff3344, transparent: true, opacity: 0.12, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
const haloBase = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0), -Math.PI/2); halo.visible = false; marble.add(halo);
const shadow = new THREE.Mesh(new THREE.CircleGeometry(R * 1.1, 24), new THREE.MeshBasicMaterial({ color: 0, transparent: true, opacity: 0.35, depthWrite: false }));
shadow.rotation.x = -Math.PI / 2; scene.add(shadow);
/* shards */
const shards = [];
function shatterFx(pos) { for (let i = 0; i < 26; i++) { const m = new THREE.Mesh(new THREE.TetrahedronGeometry(rnd(0.04, 0.1)), glassMat); m.position.copy(pos);
  scene.add(m); shards.push({ m, v: new THREE.Vector3().randomDirection().multiplyScalar(rnd(2, 6)).add(new THREE.Vector3(0, 3, 0)), life: 2 }); } }

/* ---------- input ---------- */
const inp = { steer: 0, gas: 0, tilt: false, b0: null, g0: null, beta: 0, gamma: 0, kbS: 0, kbG: 0, touchS: 0, touchG: 0, btnS: 0, btnG: 0 };
const DEAD = 2.5, FULL = 24;
function axis(v) { const a = Math.abs(v); if (a < DEAD) return 0; return Math.sign(v) * Math.min(1, Math.pow((a - DEAD) / (FULL - DEAD), 1.15)); }
function orientAngle() { return (screen.orientation && screen.orientation.angle) ?? (window.orientation || 0); }
function rawTilt() { const a = ((orientAngle() % 360) + 360) % 360, b = inp.beta, g = inp.gamma;
  if (a === 90) return { s: b, p: g };  if (a === 270) return { s: -b, p: -g }; if (a === 180) return { s: -g, p: -b }; return { s: g, p: b }; }
let calRaw = null;
function calibrate() { calRaw = rawTilt(); }
window.addEventListener('deviceorientation', e => { if (e.beta == null) return; inp.beta = e.beta; inp.gamma = e.gamma; if (!inp.tilt) { inp.tilt = true; calibrate(); document.body.classList.add('tilt'); } });
screen.orientation && screen.orientation.addEventListener('change', () => setTimeout(calibrate, 300));
async function askTilt() {
  const D = window.DeviceOrientationEvent;
  if (!D) { toast(T.noTilt); return; }
  if (typeof D.requestPermission === 'function') { try { const r = await D.requestPermission(); if (r !== 'granted') toast(T.denied); } catch (e) { toast(T.denied); } }
}
const keys = {};
addEventListener('keydown', e => { keys[e.code] = 1; if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault(); if (e.code === 'KeyC') doCalib(); if (e.code === 'Escape' || e.code === 'KeyP') { if (state === 'play') pause(true); else if (state === 'pause') pause(false); } });
addEventListener('keyup', e => { keys[e.code] = 0; });
let tStart = null;
canvas.addEventListener('pointerdown', e => { tStart = { x: e.clientX, y: e.clientY, id: e.pointerId }; });
canvas.addEventListener('pointermove', e => { if (!tStart || e.pointerId !== tStart.id) return; const k = Math.min(innerWidth, innerHeight) * 0.25;
  inp.touchS = Math.max(-1, Math.min(1, (e.clientX - tStart.x) / k)); inp.touchG = Math.max(-1, Math.min(1, -(e.clientY - tStart.y) / k)); });
const endT = () => { tStart = null; inp.touchS = 0; inp.touchG = 0; };
canvas.addEventListener('pointerup', endT); canvas.addEventListener('pointercancel', endT);
document.querySelectorAll('[data-b]').forEach(b => { const [ax, v] = b.dataset.b.split(':');
  const on = e => { e.preventDefault(); inp[ax] = +v; b.classList.add('on'); }, off = () => { inp[ax] = 0; b.classList.remove('on'); };
  b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointerleave', off); b.addEventListener('pointercancel', off); });
let smS = 0, smG = 0;
function readInput(dt) {
  let s = 0, g = 0;
  if (inp.tilt && calRaw) { const r = rawTilt(); s = axis(r.s - calRaw.s); g = axis(-(r.p - calRaw.p)); }
  const kS = (keys.ArrowRight || keys.KeyD ? 1 : 0) - (keys.ArrowLeft || keys.KeyA ? 1 : 0), kG = (keys.ArrowUp || keys.KeyW ? 1 : 0) - (keys.ArrowDown || keys.KeyS ? 1 : 0);
  const os = kS || inp.touchS || inp.btnS, og = kG || inp.touchG || inp.btnG;
  if (os) s = os; if (og) g = og;
  const a = 1 - Math.exp(-dt * 12); smS += (s - smS) * a; smG += (g - smG) * a;
  inp.steer = smS; inp.gas = smG;
}
function doCalib() { if (inp.tilt) { calibrate(); toast(T.calibrated); sfx.calib(); } }
$('calBtn').onclick = doCalib;

/* ---------- game state ---------- */
let state = 'menu', S = {};
function reset() {
  for (const it of items) scene.remove(it.m); items.length = 0; for (const c of chunks) { scene.remove(c.grp); c.grp.traverse(o => o.geometry && o.geometry.dispose()); } chunks.length = 0;
  for (const k in TR) TR[k].length = 0; genS = 0; segLeft = 0; segK = 0; curK = 0; curW = 2.4; chunkNext = 0;
  for (const sh of shards) scene.remove(sh.m); shards.length = 0;
  cracks.clear(); shellMesh.visible = false; halo.visible = false; glass.visible = true; marble.visible = true;
  S = { s: 2, x: 0, v: 5, vx: 0, t: 0, coins: 0, hp: 2, shell: 0, magnet: 0, lava: -9, fall: null, dead: false, sway: 0, q: new THREE.Quaternion(), heatW: 0 };
  marble.quaternion.identity();
  while (chunkNext * CH * DS < 140) buildChunk(chunkNext++ * CH);
}
function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.remove('show'), 1600); }
function show(id, on) { $(id).hidden = !on; }
async function start(fromTap) {
  audioInit(); if (fromTap) await askTilt();
  reset(); state = 'play'; show('menu', false); show('over', false); show('hud', true); show('pauseBox', false);
  setTimeout(calibrate, 150); gcT0 = Date.now(); gc('game-start');
}
function pause(on) { state = on ? 'pause' : 'play'; show('pauseBox', on); if (!on) { last = performance.now(); calibrate(); } }
function gameOver(reason) {
  if (state !== 'play') return; state = 'over';
  const sc = score(); const nb = sc > best; if (nb) { best = sc; localStorage.setItem(BEST_KEY, best); }
  $('ovReason').textContent = T[reason]; $('ovScore').textContent = sc; $('ovDist').textContent = Math.floor(S.s) + ' m'; $('ovCoins').textContent = S.coins;
  $('ovBest').textContent = best; $('newBest').hidden = !nb; $('bestVal').textContent = best;
  setTimeout(() => { show('over', true); show('hud', false); }, 1100);
  gc('game-finish'); gcTime();
}
const score = () => Math.floor(S.s) + S.coins * 10;
$('startBtn').onclick = () => start(true);
$('againBtn').onclick = () => start(true);
$('menuBtn').onclick = () => { show('over', false); show('menu', true); state = 'menu'; };
$('pauseBtn').onclick = () => pause(true); $('resumeBtn').onclick = () => pause(false);

/* ---------- update ---------- */
const tmpV = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0), camPos = new THREE.Vector3(0, 3, 6), camLook = new THREE.Vector3();
function update(dt) {
  readInput(dt); S.t += dt;
  const p = at(S.s);
  const heavy = S.shell > 0;
  if (!S.fall) {
    // forward speed: tilt forward = accelerate, back = brake; stronger tilt = faster
    const vmax = 9 + 9 * difficulty(S.s) + 4, vmin = 2.5;
    const target = vmin + (vmax - vmin) * (0.42 + 0.58 * inp.gas) * (inp.gas < 0 ? (1 + inp.gas) : 1);
    S.v += (Math.max(vmin, target) - S.v) * (1 - Math.exp(-dt * (heavy ? 0.9 : 1.4)));
    // sway: track rolls gently -> gravity pulls sideways
    S.sway = 0.05 * Math.sin(S.t * 0.7) + 0.03 * Math.sin(S.t * 1.9 + 1) ;
    const steerA = (heavy ? 7.5 : 13) * inp.steer;
    const centri = S.v * S.v * p.k * (heavy ? 0.8 : 1);
    S.vx += (steerA - centri + 9.8 * Math.sin(S.sway) * 0.6) * dt;
    S.vx *= Math.exp(-dt * (heavy ? 2.4 : 1.6));
    S.x += S.vx * dt; S.s += S.v * dt;
    if (Math.abs(S.x) > p.w + R * 0.3) { S.fall = { vy: 0, y: 0, vside: S.vx }; sfx.fall(); haptic(200, 0.6); }
  }
  const q = at(S.s), cx = Math.cos(q.h), sz = Math.sin(q.h);
  let my = q.y + R;
  if (S.fall) { S.fall.vy -= 18 * dt; S.fall.y += S.fall.vy * dt; S.x += S.fall.vside * dt; S.s += S.v * 0.6 * dt; my += S.fall.y;
    if (my - R < S.lava + 0.2) { if (!S.dead) { S.dead = true; marble.visible = false; sfx.burn(); haptic(300, 1); flash('#ff7020', 0.45); gameOver('fell'); } } }
  marble.position.set(q.x + cx * S.x, my, q.z + sz * S.x);
  // rolling
  const fwd = new THREE.Vector3(Math.sin(q.h), 0, -Math.cos(q.h)), side = new THREE.Vector3(cx, 0, sz);
  const vel = fwd.clone().multiplyScalar(S.v).addScaledVector(side, S.vx), sp = vel.length();
  if (sp > 0.01) { const axisR = new THREE.Vector3().crossVectors(up, vel).normalize(); marble.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(axisR, sp * dt / R)); }
  halo.quaternion.copy(marble.quaternion).invert().multiply(haloBase); // keep halo flat
  shadow.position.set(marble.position.x, q.y + 0.01, marble.position.z); shadow.visible = !S.fall;
  // lava rises constantly
  if (!S.dead) S.lava += (0.32 + 0.0045 * S.t) * dt;
  const gap = q.y - S.lava;
  if (!S.fall && !S.dead && gap < 0.4) { S.dead = true; marble.visible = false; sfx.burn(); haptic(400, 1); flash('#ff7020', 0.45); gameOver('burnt'); }
  S.heatW = Math.max(0, Math.min(1, 1 - (gap - 0.4) / 8));
  // power-up timers
  if (S.magnet > 0) { S.magnet -= dt; halo.visible = S.magnet > 0; }
  if (S.shell > 0) { S.shell -= dt; if (S.shell <= 0) shellMesh.visible = false; }
  // items
  const magR = S.magnet > 0 ? 3.2 : 0;
  for (const it of items) {
    if (!it.alive) continue; const ds = it.s - S.s;
    if (ds < -8) { it.alive = false; scene.remove(it.m); continue; }
    if (ds > 70) continue;
    if (it.type === 'coin' || it.type === 'magnet' || it.type === 'shell') it.m.rotation.y += dt * 3;
    if (it.type === 'coin' && magR && Math.abs(ds) < magR && Math.abs(it.x - S.x) < magR + 1) { it.s += (S.s - it.s) * Math.min(1, dt * 8); it.x += (S.x - it.x) * Math.min(1, dt * 8);
      const ip = at(it.s); it.m.position.set(ip.x + Math.cos(ip.h) * it.x, ip.y + 0.55, ip.z + Math.sin(ip.h) * it.x); }
    if (S.fall || S.dead) continue;
    const hitR = it.type === 'coin' ? 0.6 : it.type === 'rock' ? R + 0.42 : it.type === 'spike' ? R + 0.25 : 0.65;
    if (Math.abs(it.s - S.s) < hitR && Math.abs(it.x - S.x) < hitR) {
      if (it.type === 'coin') { S.coins++; sfx.coin(); }
      else if (it.type === 'magnet') { S.magnet = 10; sfx.power(); toast(T.magnet); haptic(40, 0.15); }
      else if (it.type === 'shell') { S.shell = 12; shellMesh.visible = true; sfx.power(); toast(T.shell); haptic(40, 0.15); }
      else { // obstacle
        S.v *= 0.35; S.vx = (S.x > it.x ? 1 : -1) * 4;
        if (S.shell > 0) { S.shell = 0; shellMesh.visible = false; sfx.shell(); haptic(120, 0.5); }
        else { S.hp--; if (S.hp <= 0) { S.dead = true; shatterFx(marble.position); glass.visible = false; sfx.shatter(); haptic(500, 1.2); flash('#ffffff', 0.5); gameOver('shattered'); }
               else { addCracks(); sfx.crack(); haptic(150, 0.7); toast(T.crack); flash('#ffffff', 0.25); } }
      }
      it.alive = false; scene.remove(it.m);
    }
  }
  // chunks: build ahead, drop behind
  const si = S.s / DS;
  while (chunkNext * CH < si + 260) buildChunk(chunkNext++ * CH);
  while (chunks.length && chunks[0].i0 + CH < si - 40) { const c = chunks.shift(); scene.remove(c.grp); c.grp.traverse(o => o.geometry && o.geometry.dispose()); }
  if (items.length > 400) for (let i = items.length - 1; i >= 0; i--) if (!items[i].alive) items.splice(i, 1);
  // shards
  for (let i = shards.length - 1; i >= 0; i--) { const sh = shards[i]; sh.v.y -= 12 * dt; sh.m.position.addScaledVector(sh.v, dt); sh.m.rotation.x += dt * 8; sh.life -= dt; if (sh.life < 0) { scene.remove(sh.m); shards.splice(i, 1); } }
  // audio
  if (ac) { const playing = state === 'play' && !S.fall; rollG.gain.setTargetAtTime(playing ? Math.min(0.5, S.v / 30) : 0, ac.currentTime, 0.05); rollF.frequency.setTargetAtTime(150 + S.v * 40, ac.currentTime, 0.1);
    sizzleG.gain.setTargetAtTime(state === 'play' ? 0.02 + S.heatW * 0.12 : 0, ac.currentTime, 0.2); }
  // HUD
  $('hScore').textContent = score(); $('hCoins').textContent = S.coins; $('hDist').textContent = Math.floor(S.s) + ' m';
  $('heatBar').style.transform = `scaleX(${S.heatW.toFixed(3)})`; $('heat').classList.toggle('hot', S.heatW > 0.7);
  $('puMag').hidden = !(S.magnet > 0); $('puShell').hidden = !(S.shell > 0);
  if (S.magnet > 0) $('puMag').textContent = '🧲 ' + Math.ceil(S.magnet); if (S.shell > 0) $('puShell').textContent = '🪨 ' + Math.ceil(S.shell);
  $('hp').textContent = S.hp >= 2 ? '●●' : '●○';
}

/* ---------- camera / render ---------- */
let last = performance.now(), fpsAcc = 0, fpsN = 0; window.__lkFps = 0;
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  fpsAcc += dt; fpsN++; if (fpsAcc > 1) { window.__lkFps = Math.round(fpsN / fpsAcc); fpsAcc = 0; fpsN = 0; }
  if (state === 'play' || state === 'over') update(state === 'over' ? dt * 0.5 : dt);
  else if (state === 'menu') { menuT += dt; if (!S.q) reset(); S.s += dt * 6; const q = at(S.s); marble.position.set(q.x + Math.cos(q.h) * Math.sin(menuT * .6) * 0.8, q.y + R, q.z + Math.sin(q.h) * Math.sin(menuT * .6) * 0.8);
    marble.rotateX(-dt * 6 / R); while (chunkNext * CH < S.s / DS + 260) buildChunk(chunkNext++ * CH); S.lava = q.y - 7; }
  const q = at(S.s + 0.0), ahead = at(S.s + 7), hd = q.h;
  const portrait = innerHeight > innerWidth;
  const back = portrait ? 6.2 : 5.2, hgt = portrait ? 3.4 : 2.6;
  const target = tmpV.set(q.x - Math.sin(hd) * back + Math.cos(hd) * (S.x || 0) * 0.5, q.y + hgt, q.z + Math.cos(hd) * back + Math.sin(hd) * (S.x || 0) * 0.5);
  camPos.lerp(target, 1 - Math.exp(-dt * 6));
  camLook.lerp(new THREE.Vector3(ahead.x, ahead.y + 0.3, ahead.z), 1 - Math.exp(-dt * 8));
  camera.position.copy(camPos);
  if (shake > 0) { camera.position.x += (Math.random() - .5) * shake * 0.4; camera.position.y += (Math.random() - .5) * shake * 0.4; shake = Math.max(0, shake - dt * 2.5); }
  camera.up.set(Math.sin(-(S.sway || 0) * 1.2) * Math.cos(hd), 1, Math.sin(-(S.sway || 0) * 1.2) * Math.sin(hd)).normalize();
  camera.lookAt(camLook);
  lava.position.set(camPos.x, S.lava, camPos.z); lavaMat.uniforms.t.value = now / 1000;
  lavaLight.position.set(marble.position.x, S.lava + 2.5, marble.position.z); lavaLight.intensity = 40 + 60 * (S.heatW || 0) + Math.sin(now / 130) * 6;
  sun.position.set(marble.position.x - 6, marble.position.y + 14, marble.position.z + 4); sun.target.position.copy(marble.position);
  for (let i = 0; i < EMB; i++) { let y = embPos[i * 3 + 1] + dt * (1 + (i % 5) * 0.4);
    if (y > S.lava + 12 || Math.abs(embPos[i * 3] - camPos.x) > 30 || Math.abs(embPos[i * 3 + 2] - camPos.z) > 30) { embPos[i * 3] = camPos.x + rnd(-25, 25); embPos[i * 3 + 2] = camPos.z + rnd(-25, 25); y = S.lava + rnd(0, 2); }
    embPos[i * 3 + 1] = y; }
  embGeo.attributes.position.needsUpdate = true;
  renderer.render(scene, camera);
}
let menuT = 0;
function resize() { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.fov = innerHeight > innerWidth ? 70 : 58; camera.updateProjectionMatrix(); }
addEventListener('resize', resize); resize(); reset(); state = 'menu';
requestAnimationFrame(frame);
/* test hook */
window.__lk = { get state() { return state; }, get S() { return S; }, get inp() { return inp; }, start: () => start(false), get best() { return best; } };
