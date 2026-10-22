/* Lavakule / Lawowa kulka / Lava Marble — Stop60 (c) 2026. Three.js (MIT) vendored, see lisenser.html */
import * as THREE from './three.module.min.js';

const LANG = document.documentElement.dataset.lang || 'no';
const T = {
  no: { title:'Lavakule', tag:'Rull glasskula over lavaen. Ikke stopp – lavaen stiger!', start:'Start / Tillat tilt', startKb:'Start', calib:'Kalibrer', again:'Spill igjen', menu:'Meny',
    best:'Rekord', score:'Poeng', dist:'Distanse', coins:'Mynter', over:'Spillet er over', newbest:'Ny rekord!',
    howTilt:'Vipp telefonen: venstre/høyre styrer, fremover gir fart, bakover bremser. Svinger du for fort, ryker du av banen.',
    howKb:'PC: piltaster / WASD. Mobil uten tilt: dra fingeren eller bruk knappene.',
    pu:'3 liv · sjekkpunkt hver 300 m · samle krafter: 🧲 magnet, 🪨 steinskall, 🫧 skjold, 🐢 sakte film, ✖2 doble mynter, 🎈 sveving, 🔹 minikule, ✚ reparasjon',
    flash:'Advarsel: spillet har korte lysglimt og risting av skjermen.', noTilt:'Tilt ikke tilgjengelig – bruk dra/knapper.',
    denied:'Tilt ble ikke tillatt – bruk dra/knapper.', fell:'Du falt av banen', burnt:'Lavaen tok deg', shattered:'Kula knuste',
    magnet:'MAGNET', shell:'STEINSKALL', crack:'Sprekk!', heat:'Lava', calibrated:'Kalibrert', test:'TEST', lic:'Lisenser', local:'Rekord, mynter og skins lagres bare på denne enheten.',
    cp:'Sjekkpunkt', repair:'Reparert', life:'Mistet et liv', healed:'Sprekken grodde', shield:'SKJOLD', slow:'SAKTE FILM', x2:'DOBLE MYNTER', hover:'SVEVING', mini:'MINIKULE', boost:'TURBO',
    near:'Nesten!', combo:'Kombo', daily:'Dagens løp', dailyBest:'Dagens rekord', shop:'Butikk', missions:'Oppdrag', bank:'Mynter i banken', buy:'Kjøp', use:'Bruk', inUse:'I bruk', rescue:'Reddet!',
    b0:'Vulkan', b1:'Isgrotte', b2:'Krystallgruve', b3:'Himmelruiner',
    t1:'Vipp til siden for å styre', t2:'Vipp fremover for fart – hopp trenger fart', t3:'Kjør gjennom portene: sjekkpunkt. Du har 3 liv',
    a_c50:'Samle 50 mynter i ett løp', a_d1000:'Kom 1000 m', a_nh:'1000 m uten treff', a_cb5:'Kombo ×5', a_nm10:'10 nesten-treff i ett løp', a_cp5:'5 sjekkpunkt i ett løp', a_d3000:'Kom 3000 m', a_pu6:'6 krafter i ett løp', achDone:'Oppdrag fullført! +100',
    s0:'Klassisk', s1:'Rubin', s2:'Smaragd', s3:'Gull', s4:'Obsidian', s5:'Regnbue' },
  pl: { title:'Lawowa kulka', tag:'Tocz szklaną kulkę nad lawą. Nie zatrzymuj się – lawa rośnie!', start:'Start / Zezwól na przechył', startKb:'Start', calib:'Kalibruj', again:'Zagraj ponownie', menu:'Menu',
    best:'Rekord', score:'Wynik', dist:'Dystans', coins:'Monety', over:'Koniec gry', newbest:'Nowy rekord!',
    howTilt:'Przechylaj telefon: lewo/prawo – skręt, do przodu – szybciej, do tyłu – hamowanie. Za szybko w zakręt = wypadasz z toru.',
    howKb:'PC: strzałki / WASD. Telefon bez przechyłu: przeciągaj palcem albo użyj przycisków.',
    pu:'3 życia · punkt kontrolny co 300 m · ulepszenia: 🧲 magnes, 🪨 skorupa, 🫧 tarcza, 🐢 spowolnienie, ✖2 podwójne monety, 🎈 lewitacja, 🔹 mini kulka, ✚ naprawa',
    flash:'Uwaga: w grze występują krótkie błyski i drgania ekranu.', noTilt:'Przechył niedostępny – użyj przeciągania/przycisków.',
    denied:'Brak zgody na przechył – użyj przeciągania/przycisków.', fell:'Spadłeś z toru', burnt:'Lawa cię dopadła', shattered:'Kulka pękła',
    magnet:'MAGNES', shell:'SKORUPA', crack:'Pęknięcie!', heat:'Lawa', calibrated:'Skalibrowano', test:'TEST', lic:'Licencje', local:'Rekord, monety i skórki zapisują się tylko na tym urządzeniu.',
    cp:'Punkt kontrolny', repair:'Naprawiono', life:'Stracone życie', healed:'Pęknięcie zagojone', shield:'TARCZA', slow:'SPOWOLNIENIE', x2:'PODWÓJNE MONETY', hover:'LEWITACJA', mini:'MINI KULKA', boost:'TURBO',
    near:'O włos!', combo:'Kombo', daily:'Bieg dnia', dailyBest:'Rekord dnia', shop:'Sklep', missions:'Misje', bank:'Monety w banku', buy:'Kup', use:'Użyj', inUse:'W użyciu', rescue:'Uratowany!',
    b0:'Wulkan', b1:'Lodowa jaskinia', b2:'Kryształowa kopalnia', b3:'Podniebne ruiny',
    t1:'Przechyl na boki, by skręcać', t2:'Przechyl do przodu – skoki wymagają prędkości', t3:'Przejedź przez bramy = punkt kontrolny. Masz 3 życia',
    a_c50:'Zbierz 50 monet w jednym biegu', a_d1000:'Dojedź 1000 m', a_nh:'1000 m bez uderzenia', a_cb5:'Kombo ×5', a_nm10:'10 razy „o włos” w biegu', a_cp5:'5 punktów kontrolnych w biegu', a_d3000:'Dojedź 3000 m', a_pu6:'6 ulepszeń w biegu', achDone:'Misja wykonana! +100',
    s0:'Klasyczna', s1:'Rubin', s2:'Szmaragd', s3:'Złota', s4:'Obsydian', s5:'Tęcza' },
  en: { title:'Lava Marble', tag:'Roll a glass marble over the lava. Don\u2019t stop – the lava is rising!', start:'Start / Allow tilt', startKb:'Start', calib:'Calibrate', again:'Play again', menu:'Menu',
    best:'Best', score:'Score', dist:'Distance', coins:'Coins', over:'Game over', newbest:'New best!',
    howTilt:'Tilt the phone: left/right steers, forward speeds up, back slows down. Take a corner too fast and you fly off.',
    howKb:'Desktop: arrow keys / WASD. Phone without tilt: drag your finger or use the buttons.',
    pu:'3 lives · checkpoint every 300 m · power-ups: 🧲 magnet, 🪨 stone shell, 🫧 shield, 🐢 slow-mo, ✖2 double coins, 🎈 hover, 🔹 mini marble, ✚ repair',
    flash:'Warning: this game contains brief flashes and screen shake.', noTilt:'Tilt unavailable – use drag/buttons.',
    denied:'Tilt not allowed – use drag/buttons.', fell:'You fell off the track', burnt:'The lava got you', shattered:'The marble shattered',
    magnet:'MAGNET', shell:'STONE SHELL', crack:'Crack!', heat:'Lava', calibrated:'Calibrated', test:'TEST', lic:'Licences', local:'Best score, coins and skins are stored on this device only.',
    cp:'Checkpoint', repair:'Repaired', life:'Life lost', healed:'Crack healed', shield:'SHIELD', slow:'SLOW-MO', x2:'DOUBLE COINS', hover:'HOVER', mini:'MINI MARBLE', boost:'BOOST',
    near:'Near miss!', combo:'Combo', daily:'Daily run', dailyBest:'Daily best', shop:'Shop', missions:'Missions', bank:'Coins in bank', buy:'Buy', use:'Use', inUse:'In use', rescue:'Rescued!',
    b0:'Volcano', b1:'Ice cave', b2:'Crystal mine', b3:'Sky ruins',
    t1:'Tilt sideways to steer', t2:'Tilt forward for speed – jumps need speed', t3:'Roll through gates = checkpoint. You have 3 lives',
    a_c50:'Collect 50 coins in one run', a_d1000:'Reach 1000 m', a_nh:'1000 m without a hit', a_cb5:'Combo ×5', a_nm10:'10 near misses in one run', a_cp5:'5 checkpoints in one run', a_d3000:'Reach 3000 m', a_pu6:'6 power-ups in one run', achDone:'Mission complete! +100',
    s0:'Classic', s1:'Ruby', s2:'Emerald', s3:'Gold', s4:'Obsidian', s5:'Rainbow' }
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
  cp: () => [660, 880, 1320].forEach((f, i) => tone(f, 0.18, 'triangle', 0.12, null, i * 0.08)),
  heal: () => [784, 988, 1175].forEach((f, i) => tone(f, 0.22, 'sine', 0.12, null, i * 0.06)),
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
  const bt = new THREE.CanvasTexture(cv); bt.colorSpace = THREE.SRGBColorSpace; scene.background = bt; window.__bgTex = bt; } scene.fog = new THREE.Fog(0x3a0828, 40, 140);
const camera = new THREE.PerspectiveCamera(62, 1, 0.1, 300);
scene.add(new THREE.HemisphereLight(0xffd0f0, 0x6a1040, 1.3));
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
  uniforms: { t: { value: 0 }, off: { value: new THREE.Vector2() }, tint: { value: new THREE.Color(1,1,1) } },
  vertexShader: `varying vec2 vW; varying float vD; uniform vec2 off; void main(){ vec4 w = modelMatrix*vec4(position,1.); vW = w.xz; vec4 mv = viewMatrix*w; vD = -mv.z; gl_Position = projectionMatrix*mv; }`,
  fragmentShader: `varying vec2 vW; varying float vD; uniform float t; uniform vec3 tint;
    float h(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
    float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y); }
    float fbm(vec2 p){ float v=0., a=.5; for(int i=0;i<5;i++){ v+=a*n(p); p=p*2.03+vec2(1.7,9.2); a*=.5; } return v; }
    void main(){ vec2 p = vW*.08; vec2 q = vec2(fbm(p+vec2(0.,t*.05)), fbm(p+vec2(5.2,-t*.04)));
      float f = fbm(p*1.7 + 2.5*q + vec2(t*.03,0.));
      float crust = smoothstep(.45,.62,f);
      vec3 hot = mix(vec3(1.,.92,.35), vec3(1.,.42,.05), smoothstep(.1,.35,f)); hot = mix(hot, vec3(1.,.12,.45), smoothstep(.35,.5,f));
      vec3 crustC = mix(vec3(.28,.02,.16), vec3(.08,.0,.12), smoothstep(.55,.8,f));
      vec3 col = mix(hot*2.4, crustC, crust*.8);
      col += vec3(1.,.55,.1)*pow(1.-crust,6.)*1.2 + vec3(1.,.2,.6)*smoothstep(.5,.56,f)*(1.-smoothstep(.56,.62,f))*1.5;
      float fog = clamp((vD-30.)/90.,0.,1.); col = mix(col, vec3(.6,.12,.25)*tint, fog*.6);
      float l = min(1.1, dot(col, vec3(.3,.5,.2))); col = mix(col, l*normalize(tint)*1.25, step(.01, abs(tint.r-1.)+abs(tint.g-1.)+abs(tint.b-1.))*.8); gl_FragColor = vec4(col,1.); }`
});
const lava = new THREE.Mesh(new THREE.PlaneGeometry(400, 400, 1, 1), lavaMat); lava.rotation.x = -Math.PI / 2; scene.add(lava);
/* embers */
const EMB = 160, embGeo = new THREE.BufferGeometry(), embPos = new Float32Array(EMB * 3);
embGeo.setAttribute('position', new THREE.BufferAttribute(embPos, 3));
const embers = new THREE.Points(embGeo, new THREE.PointsMaterial({ color: 0xffa040, size: 0.18, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }));
scene.add(embers);

/* ---------- seeded RNG (random run or daily seed) ---------- */
let seedState = 1;
function rand() { seedState |= 0; seedState = seedState + 0x6D2B79F5 | 0; let t = Math.imul(seedState ^ seedState >>> 15, 1 | seedState); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }
const todayKey = () => { const d = new Date(); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); };
const rnd = (a, b) => a + rand() * (b - a);
const fx = (a, b) => a + Math.random() * (b - a);   // cosmetic randomness (not seeded)

/* ---------- biomes (every 500 m) ---------- */
const BIOME_LEN = 500;
const BIOMES = [
  { k: 'b0', a: 0x8a1c52, b: 0xb8306a, edge: 0xffa020, edge2: 0xff2bd6, fog: 0x3a0828, lava: [1, 1, 1], sky: [0x0c0020, 0x4a0a5a, 0xff2a6a, 0xffb020], aur: 0xff7a20 },
  { k: 'b1', a: 0x1c6aa8, b: 0x2fa8d8, edge: 0x5ff6ff, edge2: 0xa0ffcf, fog: 0x0a2a4a, lava: [0.35, 0.95, 1.8], sky: [0x010824, 0x0a3a8a, 0x20c0ff, 0xc0f8ff], aur: 0x40ff9a },
  { k: 'b2', a: 0x5a1c9a, b: 0x8a2ad0, edge: 0xff4af0, edge2: 0x5ff6ff, fog: 0x2a0a4a, lava: [1.5, 0.45, 1.8], sky: [0x08001e, 0x3a0a8a, 0xc02aff, 0xff9af0], aur: 0x40e8ff },
  { k: 'b3', a: 0xd08a20, b: 0xf0b840, edge: 0xffffff, edge2: 0xff7ac8, fog: 0x6a5aa0, lava: [1.6, 1.1, 0.45], sky: [0x0a1a6a, 0x2a6aff, 0xff8ad0, 0xffe08a], aur: 0xff7ad0 },
];
const biomeOf = s => Math.floor(Math.max(0, s) / BIOME_LEN) % BIOMES.length;
for (const b of BIOMES) { b.fogC = new THREE.Color(b.fog); b.lavaC = new THREE.Color(...b.lava); b.skyC = b.sky.map(c => new THREE.Color(c)); b.aurC = new THREE.Color(b.aur); b.cA = new THREE.Color(b.a); b.cB = new THREE.Color(b.b); }
/* sky dome: gradient + twinkling stars + aurora ribbons */
const skyMat = new THREE.ShaderMaterial({ depthWrite: false, fog: false, side: THREE.BackSide,
  uniforms: { c0: { value: new THREE.Color() }, c1: { value: new THREE.Color() }, c2: { value: new THREE.Color() }, c3: { value: new THREE.Color() }, aur: { value: new THREE.Color() }, t: { value: 0 } },
  vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `varying vec3 vP; uniform vec3 c0,c1,c2,c3,aur; uniform float t;
    float h(vec3 p){ return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453); }
    void main(){ float y = vP.y; vec3 col = mix(c3, c2, smoothstep(-.05,.12,y)); col = mix(col, c1, smoothstep(.1,.35,y)); col = mix(col, c0, smoothstep(.35,.8,y));
      vec3 g = floor(vP*220.); float st = step(.9965, h(g)) * smoothstep(.05,.3,y); col += st*(.6+.4*sin(t*3.+h(g+1.)*40.))*vec3(1.,.95,.9);
      float a = atan(vP.x, vP.z); float band = sin(a*3.+t*.15+sin(a*7.+t*.3)*.6)*.5+.5; float ay = smoothstep(.15,.35,y)*(1.-smoothstep(.45,.75,y));
      col += aur * pow(band, 3.) * ay * (.7+.3*sin(a*20.+t)) * .9;
      gl_FragColor = vec4(col,1.); }` });
const sky = new THREE.Mesh(new THREE.SphereGeometry(240, 32, 16), skyMat); sky.renderOrder = -1; sky.frustumCulled = false; scene.add(sky); scene.background = null;
/* ---------- track generation ---------- */
// surface features per sample: 0 normal, 1 ice, 2 mud, 3 gap, 4 boost pad, 5 crumbling tiles, 6 moving platform, 7 jump ramp, 8 tunnel, 9 narrow bridge
const DS = 0.5;
const TR = { x: [], z: [], y: [], h: [], k: [], w: [], f: [] };
let segLeft = 0, segK = 0, curK = 0, curW = 3.4, segW = 3.4, itemsUpTo = 0, fLeft = 40, fCur = 0; const fQueue = [];
function difficulty(s) { return Math.min(1, Math.max(0, s - 350) / 6500); }
const EASY_S = 500, CP = 300;   // ~60 s of easy, wide track; checkpoint spacing (m)
function ease(s) { return Math.max(0, 1 - s / EASY_S); }
function pickFeature(s, d) {
  const r = rand();
  if (r < 0.14) return [1, rnd(14, 26)];                       // ice
  if (r < 0.26) return [2, rnd(10, 18)];                       // mud
  if (r < 0.42) { fQueue.push([3, rnd(2.5, 3.2 + 1.5 * d)]); return [7, 3]; } // ramp + gap
  if (r < 0.56) return [4, 1.5];                               // boost pad
  if (r < 0.66 && s > 700) return [5, rnd(8, 12)];             // crumbling tiles
  if (r < 0.76 && s > 900) return [6, rnd(6, 9)];              // moving platform
  if (r < 0.80) return [8, rnd(20, 35)];                       // tunnel
  if (r < 0.88 && s > 600) return [10, rnd(25, 40)];           // narrowing funnel
  if (s > 800) return [9, rnd(18, 30)];                        // narrow bridge
  return [4, 1.5];
}
function genSample() {
  const i = TR.x.length, s = i * DS, d = difficulty(s), e = ease(s);
  if (fLeft <= 0) { if (fQueue.length) [fCur, fLeft] = fQueue.shift();
    else if (fCur !== 0) { fCur = 0; fLeft = rnd(30, 70) * (1.3 - 0.5 * d); }
    else [fCur, fLeft] = pickFeature(s, d); }
  fLeft -= DS; const f = s < 380 ? (fCur === 4 ? 4 : 0) : fCur;
  if (segLeft <= 0) { segLeft = rnd(12, 40);
    segK = s < 40 ? 0 : (rand() < 0.3 + 0.2 * e ? 0 : (rand() < .5 ? -1 : 1) * rnd(0.015, 0.03 + 0.045 * d) * (1 - 0.5 * e));
    segW = Math.max(1.3, rnd(2.1, 2.7) + 0.9 * e - 0.9 * d - (rand() < 0.12 * d ? 0.4 : 0)); }
  segLeft -= DS;
  const kT = (f === 3 || f === 7 || f === 6 || f === 5) ? 0 : segK, wT = f === 9 ? 1.3 : f === 10 ? 1.55 : f === 6 ? 2.6 : segW;
  curK += (kT - curK) * 0.06; curW += (wT - curW) * (f === 9 ? 0.12 : f === 10 ? 0.025 : 0.05);
  if (i === 0) { TR.x.push(0); TR.z.push(0); TR.h.push(0); }
  else { const hd = TR.h[i - 1] + curK * DS; TR.h.push(hd); TR.x.push(TR.x[i - 1] + Math.sin(hd) * DS); TR.z.push(TR.z[i - 1] - Math.cos(hd) * DS); }
  TR.y.push(-0.055 * s + 1.2 * Math.sin(s / 31) + 0.5 * Math.sin(s / 11.3) + (f === 7 ? 0 : 0)); TR.k.push(curK); TR.w.push(curW); TR.f.push(f);
}
function at(s) { const fi = Math.max(0, s / DS), i = Math.floor(fi), u = fi - i; while (TR.x.length < i + 3) genSample();
  const L = (a) => a[i] + (a[i + 1] - a[i]) * u; return { x: L(TR.x), z: L(TR.z), y: L(TR.y), h: L(TR.h), k: L(TR.k), w: L(TR.w), f: TR.f[i] }; }
const featAt = s => { const i = Math.floor(Math.max(0, s / DS)); while (TR.x.length < i + 3) genSample(); return TR.f[i]; };

const trackMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, metalness: 0.2, vertexColors: true, envMapIntensity: 0.35, side: THREE.BackSide });
const edgeMats = BIOMES.map(b => new THREE.MeshBasicMaterial({ color: b.edge, toneMapped: false }));
const glowMats = BIOMES.map(b => new THREE.MeshBasicMaterial({ color: b.edge2, toneMapped: false, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }));
const cpMat = new THREE.MeshBasicMaterial({ color: 0x5ff6ff, toneMapped: false });
const archMat = new THREE.MeshStandardMaterial({ color: 0x7a3aff, emissive: 0x3a10a0, roughness: 0.4, flatShading: true });
const archGeo = new THREE.TorusGeometry(1, 0.18, 5, 14, Math.PI);
const platMat = new THREE.MeshStandardMaterial({ color: 0x20e0c0, roughness: 0.3, emissive: 0x10a090, emissiveIntensity: 0.6 });
const FCOL = { 1: [1.4, 2.2, 2.6], 2: [0.9, 0.55, 0.25], 4: [0.4, 2.6, 2.4], 5: [2.0, 0.7, 0.4], 7: [2.6, 1.6, 0.3], 10: [1.6, 1.1, 0.5] };
const chunks = []; const CH = 60; const movers = [];
let chunkNext = 0;
function buildChunk(i0) {
  const n = CH + 1; while (TR.x.length < i0 + n + 2) genSample();
  const pos = [], col = [], idx = [], epos = [], eidx = [], gpos = [];
  const TH = 0.35, bi = biomeOf(i0 * DS), BB = BIOMES[bi], tc = new THREE.Color();
  for (let j = 0; j < n; j++) { const i = i0 + j, hd = TR.h[i], cx = Math.cos(hd), sz = Math.sin(hd), w = TR.w[i], x = TR.x[i], z = TR.z[i], y = TR.y[i], f = TR.f[i];
    const lx = x - cx * w, lz = z - sz * w, rx = x + cx * w, rz = z + sz * w;
    pos.push(lx, y, lz, rx, y, rz, lx, y - TH, lz, rx, y - TH, rz);
    const checker = (Math.floor(i * DS / 2) % 2) ? 0.85 : 1.0, fc = FCOL[f] || [1, 1, 1];
    let tile = 1; if (f === 5) tile = ((Math.floor(i * DS / 2) + j) % 2) ? 0.7 : 1.1; if (f === 4) tile = (Math.floor(i * DS * 2) % 2) ? 1.2 : 0.7;
    tc.copy(checker > 0.9 ? BB.cA : BB.cB); for (let q = 0; q < 2; q++) col.push(tc.r * fc[0] * tile, tc.g * fc[1] * tile, tc.b * fc[2] * tile); col.push(1.6, .35, .5, 1.6, .35, .5);
    for (const sgn of [-1, 1]) { const ex = x + cx * w * sgn, ez = z + sz * w * sgn; epos.push(ex - cx * 0.12 * sgn, y + 0.03, ez - sz * 0.12 * sgn, ex + cx * 0.04 * sgn, y + 0.03, ez + sz * 0.04 * sgn);
      gpos.push(ex - cx * 0.4 * sgn, y + 0.025, ez - sz * 0.4 * sgn, ex + cx * 0.35 * sgn, y - 0.05, ez + sz * 0.35 * sgn); }
    const hole = k => TR.f[k] === 3 || TR.f[k] === 6;
    if (j < n - 1 && !hole(i) && !hole(i + 1)) { const a = j * 4, b = a + 4; idx.push(a, b, a + 1, a + 1, b, b + 1, a + 2, a + 3, b + 2, a + 3, b + 3, b + 2, a, a + 2, b, a + 2, b + 2, b, a + 1, b + 1, a + 3, a + 3, b + 1, b + 3);
      const e = j * 4, g = e + 4; eidx.push(e, g, e + 1, e + 1, g, g + 1, e + 2, g + 2, e + 3, e + 3, g + 2, g + 3); } }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals();
  const eg = new THREE.BufferGeometry(); eg.setAttribute('position', new THREE.Float32BufferAttribute(epos, 3)); eg.setIndex(eidx);
  const grp = new THREE.Group(); grp.add(new THREE.Mesh(g, trackMat)); grp.add(new THREE.Mesh(eg, edgeMats[bi])); const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.Float32BufferAttribute(gpos, 3)); gg.setIndex(eidx); grp.add(new THREE.Mesh(gg, glowMats[bi]));
  for (let k = Math.ceil(i0 * DS / CP) * CP; k < (i0 + CH) * DS; k += CP) if (k > 0) { const p = at(k);
    const gate = new THREE.Mesh(new THREE.TorusGeometry(p.w + 0.3, 0.08, 6, 24, Math.PI), cpMat); gate.position.set(p.x, p.y, p.z); gate.rotation.y = -p.h; grp.add(gate); }
  for (let j = 0; j < CH; j += 6) { const i = i0 + j; if (TR.f[i] !== 8) continue; const p = at(i * DS);   // tunnel arches
    const a = new THREE.Mesh(archGeo, archMat); a.scale.set(p.w + 0.5, p.w * 0.9 + 0.6, 1); a.position.set(p.x, p.y, p.z); a.rotation.y = -p.h; grp.add(a); }
  for (let j = 0; j < CH; j++) { const i = i0 + j; if (TR.f[i] === 6 && TR.f[i - 1] !== 6) {     // moving platform
    let e = i; while (TR.f[e] === 6 && e < TR.f.length - 1) e++; const s0 = i * DS, s1 = e * DS, pm = at((s0 + s1) / 2);
    const m = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.3, s1 - s0 - 0.2), platMat); m.rotation.y = -pm.h; grp.add(m);
    const mv = { s0, s1, ph: rnd(0, 6), m, p: pm }; movers.push(mv); grp.userData.movers = (grp.userData.movers || []).concat(mv); } }
  scene.add(grp); chunks.push({ i0, grp }); if (i0 >= itemsUpTo) { spawnItems(i0, i0 + CH); itemsUpTo = i0 + CH; }
}
function dropChunk(c) { scene.remove(c.grp); c.grp.traverse(o => o.geometry && o.geometry !== archGeo && o.geometry.dispose());
  for (const mv of c.grp.userData.movers || []) movers.splice(movers.indexOf(mv), 1); }
const platOff = (mv, t) => 0.8 * Math.sin(t * 0.9 + mv.ph);

/* ---------- sparkles (pooled additive points) ---------- */
const SPN = 260, spGeo = new THREE.BufferGeometry(), spPos = new Float32Array(SPN * 3), spCol = new Float32Array(SPN * 3), spV = new Float32Array(SPN * 3), spL = new Float32Array(SPN);
spGeo.setAttribute('position', new THREE.BufferAttribute(spPos, 3)); spGeo.setAttribute('color', new THREE.BufferAttribute(spCol, 3));
const spTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, '#fff'); g.addColorStop(0.25, 'rgba(255,255,255,.8)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  x.fillStyle = '#fff'; x.fillRect(30, 4, 4, 56); x.fillRect(4, 30, 56, 4); return new THREE.CanvasTexture(c); })();
const sparks = new THREE.Points(spGeo, new THREE.PointsMaterial({ size: 0.35, map: spTex, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
sparks.frustumCulled = false; scene.add(sparks); let spI = 0;
function burst(pos, color, n, speed = 4) { const c = new THREE.Color(color); for (let k = 0; k < n; k++) { const i = spI++ % SPN, d = new THREE.Vector3().randomDirection();
  spPos.set([pos.x, pos.y, pos.z], i * 3); spV.set([d.x * speed * fx(.4, 1), Math.abs(d.y) * speed * fx(.5, 1.2) + 1.5, d.z * speed * fx(.4, 1)], i * 3); spL[i] = fx(0.5, 1);
  const w = fx(0.7, 1.3); spCol.set([c.r * w, c.g * w, c.b * w], i * 3); } }
function updSparks(dt) { for (let i = 0; i < SPN; i++) { if (spL[i] <= 0) continue; spL[i] -= dt * 1.4; spV[i * 3 + 1] -= 6 * dt;
    for (let a = 0; a < 3; a++) { spPos[i * 3 + a] += spV[i * 3 + a] * dt; spCol[i * 3 + a] *= spL[i] > 0 ? 0.97 : 0; } }
  spGeo.attributes.position.needsUpdate = true; spGeo.attributes.color.needsUpdate = true; }
const glowSpriteMat = c => new THREE.SpriteMaterial({ map: spTex, color: c, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, opacity: 0.8 });

/* ---------- items & obstacles ---------- */
const coinGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.07, 16); coinGeo.rotateX(Math.PI / 2);
const coinMat = new THREE.MeshStandardMaterial({ color: 0xffd23a, metalness: 0.9, roughness: 0.18, emissive: 0xff9a00, emissiveIntensity: 0.55 });
const rockGeo = new THREE.DodecahedronGeometry(0.5, 0);
const rockMat = new THREE.MeshStandardMaterial({ color: 0x3a1a4a, roughness: 0.5, emissive: 0xff3a10, emissiveIntensity: 0.35, flatShading: true });
const spikeGeo = new THREE.ConeGeometry(0.32, 0.9, 6);
const metalMat = new THREE.MeshStandardMaterial({ color: 0xffc040, metalness: 0.85, roughness: 0.25, emissive: 0x803000, emissiveIntensity: 0.4 });
const hotMat = new THREE.MeshBasicMaterial({ color: 0xff7a1a, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false });
const bumpMat = new THREE.MeshStandardMaterial({ color: 0xff2bd6, emissive: 0x7a0060, roughness: 0.3 });
const barGeo = new THREE.BoxGeometry(1, 0.18, 0.18), postGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.5, 8);
const headGeo = new THREE.BoxGeometry(0.7, 0.6, 0.6), poleGeo = new THREE.CylinderGeometry(0.05, 0.05, 2.6, 6); poleGeo.translate(0, 1.3, 0);
const jetGeo = new THREE.CylinderGeometry(0.14, 0.32, 1, 8, 1, true), geyGeo = new THREE.CylinderGeometry(0.35, 0.5, 1, 10, 1, true); geyGeo.translate(0, 0.5, 0);
const bumpGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.5, 14), ventGeo = new THREE.CircleGeometry(0.45, 12);
const PU = {   // power-up types: geometry colour, emoji, string key
  magnet: { c: 0xe11d2a, e: '🧲', k: 'magnet', d: 10 }, shell: { c: 0x8a7f74, e: '🪨', k: 'shell', d: 12 }, shield: { c: 0x60a5fa, e: '🫧', k: 'shield', d: 8 },
  slow: { c: 0xa3e635, e: '🐢', k: 'slow', d: 6 }, x2: { c: 0xfacc15, e: '✖2', k: 'x2', d: 15 }, hover: { c: 0xf472b6, e: '🎈', k: 'hover', d: 8 },
  mini: { c: 0x38bdf8, e: '🔹', k: 'mini', d: 10 }, repair: { c: 0x22c55e, e: '✚', k: 'repair', d: 0 } };
const puGeo = new THREE.OctahedronGeometry(0.3, 0); for (const k in PU) PU[k].glow = glowSpriteMat(PU[k].c); for (const k in PU) PU[k].mat = new THREE.MeshStandardMaterial({ color: PU[k].c, emissive: PU[k].c, emissiveIntensity: 1.1, roughness: 0.25, flatShading: true, toneMapped: false });
const OBST = new Set(['rock', 'spike', 'bar', 'hammer', 'geyser', 'jet', 'bumper', 'post', 'wall', 'gate', 'boulder', 'slider', 'blade', 'divider', 'hole', 'arch', 'wave']);
/* chicane / obstacle-pack materials (neon, matching the vivid look) */
const neon = c => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.9, roughness: 0.3, toneMapped: false });
const postMat = neon(0x40f0ff), wallMat = neon(0xff3ad0), sliderMat = neon(0xff8a1a), divMat = neon(0x7aff6a), archBeamMat = neon(0xffd040);
const laserMat = new THREE.MeshBasicMaterial({ color: 0xff2050, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
const bladeMat = new THREE.MeshStandardMaterial({ color: 0xe0f0ff, metalness: 1, roughness: 0.15, emissive: 0xff2a8a, emissiveIntensity: 0.35 });
const holeMat = new THREE.MeshBasicMaterial({ color: 0x0a0010 }), rimMat = new THREE.MeshBasicMaterial({ color: 0xff2bd6, toneMapped: false });
const waveMat = new THREE.MeshBasicMaterial({ color: 0xffa020, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide });
const warnMat = new THREE.MeshBasicMaterial({ color: 0xff3020, transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
const pGeo = new THREE.CylinderGeometry(0.13, 0.16, 0.95, 10); pGeo.translate(0, 0.47, 0);
const boxGeo = new THREE.BoxGeometry(1, 1, 1), blGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.06, 24); blGeo.rotateZ(Math.PI / 2);
const boulGeo = new THREE.IcosahedronGeometry(0.62, 1), holeGeo = new THREE.CircleGeometry(0.5, 20), rimGeo = new THREE.RingGeometry(0.5, 0.62, 24);
const waveGeo = new THREE.CylinderGeometry(1, 1, 1.4, 16, 1, true, 0, Math.PI); waveGeo.rotateX(Math.PI / 2); waveGeo.rotateY(Math.PI / 2);
const warnGeo = new THREE.PlaneGeometry(1, 1); warnGeo.rotateX(-Math.PI / 2);
const items = [];
function addItem(type, s, x) { const p = at(s); let m, y = 0.55; const ex = {};
  if (type === 'coin') m = new THREE.Mesh(coinGeo, coinMat);
  else if (type === 'rock') { m = new THREE.Mesh(rockGeo, rockMat); y = 0.35; m.rotation.set(rand() * 3, rand() * 3, 0); }
  else if (type === 'spike') { m = new THREE.Mesh(spikeGeo, rockMat); y = 0.45; }
  else if (type === 'bar') { m = new THREE.Group(); const b = new THREE.Mesh(barGeo, metalMat); b.scale.x = p.w * 1.7; b.position.y = 0.25; m.add(b); m.add(new THREE.Mesh(postGeo, metalMat)); x = 0; y = 0.25; }
  else if (type === 'hammer') { m = new THREE.Group(); const pole = new THREE.Mesh(poleGeo, metalMat); const h = new THREE.Mesh(headGeo, rockMat); h.position.y = 0.3; pole.add(h); pole.rotation.z = Math.PI; pole.position.y = 2.9; m.add(pole); m.userData.pole = pole; x = 0; y = 0; }
  else if (type === 'geyser') { m = new THREE.Group(); const v = new THREE.Mesh(ventGeo, rockMat); v.rotation.x = -Math.PI / 2; v.position.y = 0.02; m.add(v); const c = new THREE.Mesh(geyGeo, hotMat); m.add(c); m.userData.col = c; y = 0; }
  else if (type === 'jet') { m = new THREE.Group(); const nz = new THREE.Mesh(postGeo, metalMat); nz.position.x = -p.w - 0.15; m.add(nz); const fl = new THREE.Mesh(jetGeo, hotMat); fl.rotation.z = Math.PI / 2; fl.position.y = 0.3; m.add(fl); m.userData.fl = fl; x = 0; y = 0; }
  else if (type === 'bumper') { m = new THREE.Mesh(bumpGeo, bumpMat); y = 0.25; }
  else if (type === 'post') { m = new THREE.Mesh(pGeo, postMat); const g = new THREE.Sprite(glowSpriteMat(0x40f0ff)); g.position.y = 1; g.scale.setScalar(0.7); m.add(g); y = 0; }
  else if (type === 'wall') { const side = x > 0 ? 1 : -1, a = side > 0 ? -0.15 : -(p.w + 0.2), b = side > 0 ? p.w + 0.2 : 0.15; x = (a + b) / 2; ex.hw = (b - a) / 2;
    m = new THREE.Mesh(boxGeo, wallMat); m.scale.set(b - a, 0.6, 0.25); y = 0.3; }
  else if (type === 'gate') { m = new THREE.Group(); for (const sg of [-1, 1]) { const pp = new THREE.Mesh(pGeo, metalMat); pp.position.x = sg * (p.w + 0.1); m.add(pp); }
    const beam = new THREE.Mesh(boxGeo, laserMat); beam.scale.set(p.w * 2 + 0.2, 0.08, 0.08); beam.position.y = 0.35; m.add(beam); const b2 = beam.clone(); b2.position.y = 0.7; m.add(b2); m.userData.beams = [beam, b2]; x = 0; y = 0; }
  else if (type === 'boulder') { m = new THREE.Mesh(boulGeo, rockMat); const g = new THREE.Sprite(glowSpriteMat(0xff5a10)); g.scale.setScalar(2); m.add(g); y = 0.62; }
  else if (type === 'slider') { m = new THREE.Mesh(boxGeo, sliderMat); m.scale.set(0.9, 0.7, 0.7); y = 0.35; x = 0; }
  else if (type === 'blade') { m = new THREE.Group(); const d = new THREE.Mesh(blGeo, bladeMat); d.position.y = 0.55; m.add(d); m.userData.d = d; y = 0; x = 0; }
  else if (type === 'divider') { m = new THREE.Mesh(boxGeo, divMat); m.scale.set(0.14, 0.45, 2); y = 0.22; x = 0; }
  else if (type === 'hole') { m = new THREE.Group(); const h = new THREE.Mesh(holeGeo, holeMat); h.rotation.x = -Math.PI / 2; m.add(h); const rr = new THREE.Mesh(rimGeo, rimMat); rr.rotation.x = -Math.PI / 2; rr.position.y = 0.005; m.add(rr); y = 0.015; }
  else if (type === 'arch') { m = new THREE.Group(); ex.gx = x; const L = p.w + 0.2;
    for (const [a, b] of [[-L, x - 0.7], [x + 0.7, L]]) if (b > a) { const bm = new THREE.Mesh(boxGeo, archBeamMat); bm.scale.set(b - a, 0.5, 0.3); bm.position.set((a + b) / 2, 0.25, 0); m.add(bm); }
    x = 0; y = 0; }
  else if (type === 'wave') { m = new THREE.Group(); const side = x > 0 ? 1 : -1; ex.side = side; const wv = new THREE.Mesh(waveGeo, waveMat); wv.scale.set(p.w * 0.6, p.w * 0.5, 1); wv.position.x = side * p.w * 0.5; m.add(wv);
    const wn = new THREE.Mesh(warnGeo, warnMat.clone()); wn.scale.set(p.w, 1, 1.6); wn.position.set(side * p.w * 0.5, 0.03, 0); m.add(wn); m.userData.wv = wv; m.userData.wn = wn; x = 0; y = 0; }
  else { m = new THREE.Mesh(puGeo, PU[type].mat); const g = new THREE.Sprite(PU[type].glow); g.scale.setScalar(1.6); m.add(g); }
  const cx = Math.cos(p.h), sz = Math.sin(p.h);
  m.position.set(p.x + cx * x, p.y + y, p.z + sz * x); if (type !== 'rock') m.rotation.y = -p.h;
  scene.add(m); items.push(Object.assign({ type, s, x, m, alive: true, w: p.w, ph: rnd(0, 6), near: 9, hit: false, y0: y }, ex));
}
function spawnItems(i0, i1) {
  for (let s = i0 * DS; s < i1 * DS; s += 1) {
    if (s < 25) continue; const p = at(s), d = difficulty(s), w = p.w - 0.4, e = ease(s), f = featAt(s);
    if (f === 3 || f === 6 || f === 7) continue;
    if (rand() < 0.075) { const n = 5 + (rand() * 7 | 0), x0 = rnd(-w, w), x1 = rnd(-w, w); for (let j = 0; j < n; j++) { if ([3, 6, 7].includes(featAt(s + j * 1.6))) break; addItem('coin', s + j * 1.6, x0 + (x1 - x0) * j / n); } s += n * 1.6; continue; }
    if (s > 80 && f !== 9 && rand() < (0.010 + 0.034 * d) * (1 - 0.6 * e)) {
      const r = rand(), adv = s > 450;
      const t = !adv ? (r < 0.5 ? 'rock' : r < 0.8 ? 'spike' : 'bumper')
        : r < 0.2 ? 'rock' : r < 0.32 ? 'spike' : r < 0.45 ? 'bumper' : r < 0.58 ? 'bar' : r < 0.71 ? 'hammer' : r < 0.85 ? 'geyser' : 'jet';
      const pr = rand();
      if (s > 150 && pr < (adv ? 0.45 : 0.25)) { s += spawnPattern(s, p, d, adv); continue; }
      addItem(t, s, rnd(-w, w) * 0.9); if (d > 0.5 && rand() < 0.25) addItem('rock', s + 1, rnd(-w, w) * 0.9); s += 6; continue; }
    if (rand() < 0.012) { const ks = Object.keys(PU); const t = s < 300 ? (rand() < 0.5 ? 'magnet' : 'shield') : ks[rand() * ks.length | 0]; addItem(t, s, rnd(-w, w) * 0.7); s += 5; }
  }
}
function spawnPattern(s, p, d, adv) {   // returns metres used
  const w = p.w - 0.4, ok = len => { for (let k = 0; k <= len; k += 1) if ([3, 6, 7, 9].includes(featAt(s + k))) return false; return true; };
  const opts = adv ? ['slalom', 'chicane', 'gate', 'boulder', 'slider', 'blade', 'fork', 'holes', 'arch', 'wave'] : ['slalom', 'slalom', 'slider'];
  const k = opts[rand() * opts.length | 0];
  if (k === 'slalom' && ok(22)) { const n = 4 + (d > 0.4 ? 2 : 0); for (let j = 0; j < n; j++) addItem('post', s + j * 4.5, (j % 2 ? 1 : -1) * w * 0.45); return n * 4.5 + 6; }
  if (k === 'chicane' && ok(24)) { for (let j = 0; j < 3; j++) addItem('wall', s + j * 8, j % 2 ? 1 : -1); return 30; }
  if (k === 'fork' && p.w > 2 && ok(26)) { const cs = rand() < 0.5 ? -1 : 1; for (let j = 0; j < 11; j++) addItem('divider', s + j * 2, 0);
    for (let j = 1; j < 10; j++) addItem('coin', s + j * 2.2, cs * p.w * 0.5); addItem('rock', s + 8, cs * p.w * 0.45); if (d > 0.3) addItem('spike', s + 16, cs * p.w * 0.6); return 30; }
  if (k === 'holes' && ok(12)) { const n = adv ? 3 : 2; for (let j = 0; j < n; j++) addItem('hole', s + j * 4, rnd(-w, w) * 0.8); return n * 4 + 6; }
  if (k === 'arch' && ok(4)) { addItem('arch', s, rnd(-w + 0.6, w - 0.6)); return 8; }
  if (k === 'wave' && ok(4)) { addItem('wave', s, rand() < 0.5 ? -1 : 1); return 8; }
  if (['gate', 'boulder', 'slider', 'blade'].includes(k) && ok(4)) { addItem(k, s, k === 'boulder' ? rnd(-w, w) * 0.7 : 0); return 8; }
  addItem('rock', s, rnd(-w, w) * 0.9); return 6;
}
function placeX(it, x) { const p = at(it.s); it.m.position.set(p.x + Math.cos(p.h) * x, p.y + it.y0, p.z + Math.sin(p.h) * x); }
/* obstacle dynamics: returns true when the obstacle currently threatens the marble at (ds, x) */
function obstHit(it, ds, x, r, t) {
  if (it.type === 'rock') return Math.abs(ds) < r + 0.42 && Math.abs(x - it.x) < r + 0.42;
  if (it.type === 'spike') return Math.abs(ds) < r + 0.25 && Math.abs(x - it.x) < r + 0.25;
  if (it.type === 'bumper') return Math.abs(ds) < r + 0.4 && Math.abs(x - it.x) < r + 0.4;
  if (it.type === 'bar') { const a = t * 1.0 + it.ph, L = it.w * 0.85; if (Math.hypot(ds, x) > L + r) return false; return Math.abs(x * Math.sin(a) - ds * Math.cos(a)) < r + 0.09; }
  if (it.type === 'hammer') { const hx = Math.sin(t * 1.7 + it.ph) * it.w * 0.85; return Math.abs(ds) < r + 0.3 && Math.abs(x - hx) < r + 0.35; }
  if (it.type === 'geyser') { const c = (t + it.ph) % 3.2; return c > 2.2 && c < 3.0 && Math.abs(ds) < r + 0.4 && Math.abs(x - it.x) < r + 0.45; }
  if (it.type === 'jet') { const c = (t + it.ph) % 2.6; return c > 1.6 && Math.abs(ds) < r + 0.3; }
  if (it.type === 'post') return Math.abs(ds) < r + 0.15 && Math.abs(x - it.x) < r + 0.15;
  if (it.type === 'wall') return Math.abs(ds) < r + 0.13 && Math.abs(x - it.x) < it.hw + r * 0.8;
  if (it.type === 'gate') { const c = (t + it.ph) % 3.4; return c > 2.2 && Math.abs(ds) < r + 0.08; }
  if (it.type === 'boulder') return Math.abs(ds) < r + 0.6 && Math.abs(x - it.x) < r + 0.55;
  if (it.type === 'slider') { const sx = Math.sin(t * 1.3 + it.ph) * (it.w - 0.5); return Math.abs(ds) < r + 0.35 && Math.abs(x - sx) < r + 0.45; }
  if (it.type === 'blade') { const bx = Math.sin(t * 1.1 + it.ph) * (it.w - 0.4); return Math.abs(ds) < 0.55 && Math.abs(x - bx) < r + 0.05; }
  if (it.type === 'divider') return Math.abs(ds) < 1 && Math.abs(x) < r + 0.07;
  if (it.type === 'hole') return Math.abs(ds) < 0.35 && Math.abs(x - it.x) < 0.4;
  if (it.type === 'arch') return Math.abs(ds) < r + 0.15 && Math.abs(x - it.gx) > 0.7 - r * 0.6;
  if (it.type === 'wave') { const c = (t + it.ph) % 4; return c > 3.1 && c < 3.8 && Math.abs(ds) < r + 0.7 && x * it.side > -0.25; }
  return false;
}
function animObst(it, t) {
  if (it.type === 'gate') { const c = (t + it.ph) % 3.4, on = c > 2.2, warn = c > 1.6 && !on;
    for (const b of it.m.userData.beams) { b.visible = on || (warn && Math.floor(t * 12) % 2 === 0); b.scale.y = b.scale.z = on ? 0.1 : 0.03; } return; }
  if (it.type === 'slider') { const sx = Math.sin(t * 1.3 + it.ph) * (it.w - 0.5); placeX(it, sx); return; }
  if (it.type === 'blade') { const bx = Math.sin(t * 1.1 + it.ph) * (it.w - 0.4); placeX(it, bx); it.m.userData.d.rotation.x = t * 14; return; }
  if (it.type === 'post' || it.type === 'divider') return;
  if (it.type === 'wave') { const c = (t + it.ph) % 4, ud = it.m.userData; ud.wn.material.opacity = c > 2.0 && c < 3.1 ? 0.25 + 0.25 * Math.sin(t * 20) : 0;
    ud.wv.visible = c > 2.9 && c < 3.9; ud.wv.scale.y = it.w * 0.5 * (c > 3.1 && c < 3.8 ? 1 : 0.3); return; }
  if (it.type === 'bar') it.m.children[0].rotation.y = t * 1.0 + it.ph;
  else if (it.type === 'hammer') it.m.userData.pole.rotation.z = Math.PI + Math.asin(Math.max(-1, Math.min(1, Math.sin(t * 1.7 + it.ph) * it.w * 0.85 / 2.6)));
  else if (it.type === 'geyser') { const c = (t + it.ph) % 3.2, col = it.m.userData.col; col.visible = c > 1.4;
    col.scale.set(1, c > 2.2 && c < 3.0 ? 3.5 : 0.25 + 0.1 * Math.sin(t * 20), 1); col.material.opacity = 0.85; }
  else if (it.type === 'jet') { const c = (t + it.ph) % 2.6, fl = it.m.userData.fl; fl.visible = c > 1.3;
    fl.scale.set(c > 1.6 ? 1 : 0.4, c > 1.6 ? it.w * 2 : 0.4, c > 1.6 ? 1 : 0.4); fl.position.x = c > 1.6 ? 0 : -it.w + 0.2; }
}

/* ---------- marble ---------- */
const R = 0.35;
const marble = new THREE.Group(); scene.add(marble);
const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.02, metalness: 0, transmission: 1, thickness: 0.8, ior: 1.75, dispersion: 4, iridescence: 1, iridescenceIOR: 1.4, iridescenceThicknessRange: [200, 700], clearcoat: 1, clearcoatRoughness: 0.01, specularIntensity: 1.5, attenuationColor: new THREE.Color(0x9fe8ff), attenuationDistance: 1.2, envMapIntensity: 1.5 });
const glass = new THREE.Mesh(new THREE.SphereGeometry(R, 40, 28), glassMat); marble.add(glass);
const coreMat = new THREE.MeshStandardMaterial({ color: 0x2dd4bf, emissive: 0x0e6b60, emissiveIntensity: 2, roughness: .2 });
const core = new THREE.Mesh(new THREE.TorusKnotGeometry(0.11, 0.03, 64, 8), coreMat); glass.add(core);
const crackMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
const cracks = new THREE.Group(); glass.add(cracks);
function addCracks() { for (let c = 0; c < 4; c++) { const pts = []; let v = new THREE.Vector3().randomDirection();
  for (let j = 0; j < 7; j++) { pts.push(v.clone().multiplyScalar(R * 1.01)); v.add(new THREE.Vector3().randomDirection().multiplyScalar(0.25)).normalize(); }
  cracks.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), crackMat)); } }
function setCracks(n) { while (cracks.children.length > n * 4) { const l = cracks.children[cracks.children.length - 1]; l.geometry.dispose(); cracks.remove(l); } while (cracks.children.length < n * 4) addCracks(); }
const shellMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(R * 1.18, 1), new THREE.MeshStandardMaterial({ color: 0x6b625a, roughness: 0.95, flatShading: true, transparent: true, opacity: 0.92 }));
shellMesh.visible = false; glass.add(shellMesh);
const bubble = new THREE.Mesh(new THREE.SphereGeometry(R * 1.45, 20, 14), new THREE.MeshBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false }));
bubble.visible = false; marble.add(bubble);
const halo = new THREE.Mesh(new THREE.RingGeometry(0.5, 2.6, 32), new THREE.MeshBasicMaterial({ color: 0xff3344, transparent: true, opacity: 0.12, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
const haloBase = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0), -Math.PI/2); halo.visible = false; marble.add(halo);
const shadow = new THREE.Mesh(new THREE.CircleGeometry(R * 1.1, 24), new THREE.MeshBasicMaterial({ color: 0, transparent: true, opacity: 0.35, depthWrite: false }));
shadow.rotation.x = -Math.PI / 2; scene.add(shadow);
const shards = [];
function shatterFx(pos) { for (let i = 0; i < 22; i++) { const m = new THREE.Mesh(new THREE.TetrahedronGeometry(fx(0.04, 0.1)), glassMat); m.position.copy(pos);
  scene.add(m); shards.push({ m, v: new THREE.Vector3().randomDirection().multiplyScalar(fx(2, 6)).add(new THREE.Vector3(0, 3, 0)), life: 2 }); } }

/* ---------- skins / shop / missions (localStorage) ---------- */
const SKINS = [{ c: 0x9fe8ff, k: 0x2dd4bf, p: 0 }, { c: 0xff4060, k: 0xffd0a0, p: 150 }, { c: 0x40ff90, k: 0x0f5132, p: 300 },
  { c: 0xffc830, k: 0xfff3b0, p: 600 }, { c: 0x302838, k: 0xff3a10, p: 1000 }, { c: 0xffffff, k: 0xff00ff, p: 2000, rainbow: true }];
const LS = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } }, SV = (k, v) => localStorage.setItem(k, JSON.stringify(v));
let bank = LS('lavakule_bank_v1', 0), owned = LS('lavakule_skins_v1', [0]), skin = LS('lavakule_skin_v1', 0), ach = LS('lavakule_ach_v1', {}), runs = LS('lavakule_runs_v1', 0);
function applySkin() { const sk = SKINS[skin] || SKINS[0]; glassMat.attenuationColor.set(sk.c); coreMat.color.set(sk.k); coreMat.emissive.set(sk.k).multiplyScalar(0.6); }
applySkin();
const ACH = [['a_c50', S => S.coins >= 50], ['a_d1000', S => S.s >= 1000], ['a_nh', S => S.s - S.lastHitS >= 1000], ['a_cb5', S => S.combo >= 5],
  ['a_nm10', S => S.nears >= 10], ['a_cp5', S => S.cps >= 5], ['a_d3000', S => S.s >= 3000], ['a_pu6', S => S.pus >= 6]];
function renderShop() { const el = $('shopList'); el.innerHTML = ''; $('bankVal').textContent = bank;
  SKINS.forEach((sk, i) => { const d = document.createElement('div'); d.className = 'skin' + (i === skin ? ' cur' : '');
    const dot = `<i style="background:radial-gradient(circle at 35% 30%,#fff,#${sk.c.toString(16).padStart(6, '0')} 45%,#${sk.k.toString(16).padStart(6, '0')})"></i>`;
    const has = owned.includes(i), b = document.createElement('button');
    b.textContent = i === skin ? T.inUse : has ? T.use : T.buy + ' · ' + sk.p + ' 🪙'; b.disabled = i === skin || (!has && bank < sk.p);
    b.onclick = () => { if (!has) { bank -= sk.p; owned.push(i); SV('lavakule_bank_v1', bank); SV('lavakule_skins_v1', owned); sfx.power(); } skin = i; SV('lavakule_skin_v1', skin); applySkin(); renderShop(); };
    d.innerHTML = dot + '<span>' + T['s' + i] + '</span>'; d.appendChild(b); el.appendChild(d); }); }
function renderMissions() { $('missList').innerHTML = ACH.map(([k]) => `<li class="${ach[k] ? 'done' : ''}">${ach[k] ? '✅' : '⬜'} ${T[k]}</li>`).join(''); }

/* ---------- input ---------- */
const inp = { steer: 0, gas: 0, tilt: false, b0: null, g0: null, beta: 0, gamma: 0, kbS: 0, kbG: 0, touchS: 0, touchG: 0, btnS: 0, btnG: 0 };
const DEAD = 2.5, FULL = 30;   // slightly lower tilt sensitivity
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
let state = 'menu', S = {}, daily = false;
const MAXHP = 3, HEAL_T = 25;
function clearWorld() {
  for (const it of items) scene.remove(it.m); items.length = 0; for (const c of chunks) dropChunk(c); chunks.length = 0; movers.length = 0;
  for (const k in TR) TR[k].length = 0; segLeft = 0; segK = 0; curK = 0; curW = 3.4; segW = 3.4; chunkNext = 0; itemsUpTo = 0; fLeft = 40; fCur = 0; fQueue.length = 0;
}
function reset() {
  seedState = daily ? todayKey() * 2654435761 : (Math.random() * 4294967296) | 0;
  clearWorld();
  for (const sh of shards) scene.remove(sh.m); shards.length = 0;
  setCracks(0); shellMesh.visible = false; halo.visible = false; bubble.visible = false; glass.visible = true; marble.visible = true; marble.scale.setScalar(1);
  S = { s: 2, x: 0, v: 5, vx: 0, t: 0, coins: 0, pts: 0, hp: MAXHP, lastCp: 0, cps: 0, inv: 0, healT: 0, edgeT: 0, rescue: 1, respawnT: 0, air: null, tile: -1, tileT: 0, boost: 0,
    pu: {}, cap: MAXHP, combo: 0, comboT: 0, nears: 0, pus: 0, lastHitS: 0, biome: 0, tip: 0,
    fall: null, dead: false, sway: 0, q: new THREE.Quaternion(), heatW: 0, lava: -9, gap: 9 };
  marble.quaternion.identity(); applyBiome(0, true);
  while (chunkNext * CH * DS < 140) buildChunk(chunkNext++ * CH);
}
function applyBiome(b, instant) { S.biome = b; if (instant) { scene.fog.color.copy(BIOMES[b].fogC); lavaMat.uniforms.tint.value.copy(BIOMES[b].lavaC); skyLerp(1); } }
function skyLerp(k) { const B = BIOMES[S.biome || 0], u = skyMat.uniforms; ['c0', 'c1', 'c2', 'c3'].forEach((n, i) => u[n].value.lerp(B.skyC[i], k)); u.aur.value.lerp(B.aurC, k); }
function toast(msg, ms = 1600) { const t = $('toast'); t.textContent = msg; t.classList.remove('show'); void t.offsetWidth; t.classList.add('show'); clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.remove('show'), ms); }
function show(id, on) { $(id).hidden = !on; }
async function start(fromTap, isDaily = daily) {
  window.StopWisdom && StopWisdom.hide(); audioInit(); if (fromTap) await askTilt();
  daily = isDaily; reset(); state = 'play'; show('menu', false); show('over', false); show('hud', true); show('pauseBox', false);
  runs++; SV('lavakule_runs_v1', runs);
  setTimeout(calibrate, 150); gcT0 = Date.now(); gc(daily ? 'game-start-daily' : 'game-start');
}
function pause(on) { state = on ? 'pause' : 'play'; show('pauseBox', on); if (!on) { last = performance.now(); calibrate(); } }
function gameOver(reason) {
  if (state !== 'play') return; state = 'over';
  const sc = score(); const nb = sc > best; if (nb) { best = sc; localStorage.setItem(BEST_KEY, best); }
  bank += S.coins; SV('lavakule_bank_v1', bank);
  let dTxt = ''; if (daily) { const k = 'lavakule_daily_' + todayKey(), db = Math.max(sc, +(localStorage.getItem(k) || 0)); localStorage.setItem(k, db); dTxt = T.dailyBest + ': ' + db; }
  $('ovReason').textContent = T[reason]; $('ovScore').textContent = sc; $('ovDist').textContent = Math.floor(S.s) + ' m'; $('ovCoins').textContent = S.coins;
  $('ovBest').textContent = best; $('newBest').hidden = !nb; $('bestVal').textContent = best; $('ovExtra').textContent = (dTxt ? dTxt + ' · ' : '') + T.bank + ': ' + bank + ' 🪙';
  setTimeout(() => { show('over', true); show('hud', false); }, 1100);
  gc('game-finish'); gcTime();
}
const score = () => Math.floor(S.s) + S.pts;
$('startBtn').onclick = () => start(true, false);
$('dailyBtn').onclick = () => start(true, true);
$('againBtn').onclick = () => start(true);
$('menuBtn').onclick = () => { show('over', false); show('menu', true); state = 'menu'; renderMissions(); };
$('pauseBtn').onclick = () => pause(true); $('resumeBtn').onclick = () => pause(false);
$('shopBtn').onclick = () => { const o = $('shop').hidden; $('shop').hidden = !o; $('miss').hidden = true; renderShop(); };
$('missBtn').onclick = () => { const o = $('miss').hidden; $('miss').hidden = !o; $('shop').hidden = true; renderMissions(); };
$('bankVal').textContent = bank;

/* life handling: falls / lava cost a life and respawn at the last checkpoint; obstacle hits crack the marble */
function loseLife(reason) {
  if (S.dead) return; (S.log = S.log || []).push(reason + '@' + (S.s | 0) + ':f' + featAt(S.s - 2)); S.dead = true; marble.visible = false; S.hp--; S.cap = Math.min(S.cap, S.hp); S.lastHitS = S.s; S.combo = 0;
  if (S.hp <= 0) { gameOver(reason); return; }
  toast(T.life); S.respawnT = 1.2; S.deathReason = reason;
}
function respawn() {
  const s0 = Math.max(2, S.lastCp + 2);
  for (const c of chunks) dropChunk(c); chunks.length = 0; chunkNext = Math.floor(Math.max(0, s0 / DS - 40) / CH);
  while (chunkNext * CH < s0 / DS + 260) buildChunk(chunkNext++ * CH);
  Object.assign(S, { s: s0, x: 0, vx: 0, v: 6, fall: null, air: null, dead: false, inv: 2.5, edgeT: 0, tile: -1, boost: 0 });
  S.gap = 9; S.lava = at(s0).y - 9; marble.visible = true; glass.visible = true; setCracks(MAXHP - S.hp); sfx.cp();
}
function hurt() {   // obstacle collision
  if (S.inv > 0 || S.pu.shield > 0) { if (S.pu.shield > 0) { sfx.shell(); S.pu.shield = 0; S.inv = 1; } return; }
  if (S.pu.shell > 0) { S.pu.shell = 0; S.inv = 1; sfx.shell(); haptic(120, 0.5); return; }
  (S.log = S.log || []).push('hit@' + (S.s | 0)); S.hp--; S.lastHitS = S.s; S.healT = 0; S.combo = 0; S.inv = 1.5;
  if (S.hp <= 0) { S.dead = true; shatterFx(marble.position); glass.visible = false; sfx.shatter(); haptic(500, 1.2); flash('#ffffff', 0.5); gameOver('shattered'); }
  else { setCracks(MAXHP - S.hp); burst(marble.position, 0xffffff, 24, 5); sfx.crack(); haptic(150, 0.7); toast(T.crack); flash('#ffffff', 0.25); }
}
function grabPU(type) { S.pus++; sfx.power(); haptic(40, 0.15);
  if (type === 'repair') { S.hp = Math.min(MAXHP, S.hp + 1); S.cap = Math.max(S.cap, S.hp); setCracks(MAXHP - S.hp); sfx.heal(); toast(T.repair); return; }
  S.pu[type] = PU[type].d; toast(T[PU[type].k]); }

/* ---------- update ---------- */
const tmpV = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0), camPos = new THREE.Vector3(0, 3, 6), camLook = new THREE.Vector3();
function update(dtReal) {
  readInput(dtReal); S.t += dtReal;
  const slow = S.pu.slow > 0, dt = dtReal * (slow ? 0.65 : 1);   // slow-mo slows the world (and the marble)
  for (const k in S.pu) if (S.pu[k] > 0) S.pu[k] -= dtReal;
  S.inv = Math.max(0, S.inv - dtReal); S.boost = Math.max(0, S.boost - dt);
  const mini = S.pu.mini > 0, hover = S.pu.hover > 0, r = mini ? R * 0.6 : R;
  marble.scale.setScalar(marble.scale.x + ((mini ? 0.6 : 1) - marble.scale.x) * Math.min(1, dtReal * 8));
  const heavy = S.pu.shell > 0; shellMesh.visible = heavy; bubble.visible = S.pu.shield > 0; halo.visible = S.pu.magnet > 0;
  if (!S.dead) glass.visible = S.inv <= 0 || Math.floor(S.t * 10) % 2 === 0;
  if (S.respawnT > 0) { S.respawnT -= dtReal; if (S.respawnT <= 0) respawn(); }
  // heal cracks over time
  if (!S.dead && S.hp < S.cap) { S.healT += dtReal; if (S.healT > HEAL_T) { S.healT = 0; S.hp++; setCracks(MAXHP - S.hp); sfx.heal(); toast(T.healed); } } else S.healT = 0;
  const p = at(S.s), f = p.f;
  if (!S.fall && !S.dead) {
    const d = difficulty(S.s);
    const vmax = 12 + 7 * d + (S.boost > 0 ? 7 : 0), vmin = 2.5;
    let target = vmin + (vmax - vmin) * (0.42 + 0.58 * inp.gas) * (inp.gas < 0 ? (1 + inp.gas) : 1);
    if (f === 2) target *= 0.5;                            // sticky mud
    if (f === 7) target = Math.max(target, 10);            // ramp pulls you up to jump speed
    if (S.boost > 0) target = vmax;
    S.v += (Math.max(vmin, target) - S.v) * (1 - Math.exp(-dt * (f === 2 ? 3 : f === 7 ? 4 : heavy ? 0.9 : 1.4)));
    if (f === 4 && !S.air && S.boost <= 0) { S.boost = 1.6; S.v += 4; burst(marble.position, 0x5ff6ff, 30, 5); flash('#40f0ff', 0.15); sfx.power(); toast(T.boost, 700); }
    S.sway = 0.05 * Math.sin(S.t * 0.7) + 0.03 * Math.sin(S.t * 1.9 + 1);
    const ice = f === 1 && !S.air, early = S.s < EASY_S;
    const steerA = (heavy ? 7.5 : 11.5) * inp.steer * (ice ? 0.55 : 1);
    const centri = S.v * S.v * p.k * (heavy ? 0.8 : 1) * (early ? 0.7 : 1);
    S.vx += (steerA - centri + 9.8 * Math.sin(S.sway) * 0.5) * dt;
    S.vx *= Math.exp(-dt * (ice ? 0.35 : heavy ? 2.4 : 1.8));
    S.x += S.vx * dt; S.s += S.v * dt;
    // jump ramp -> air
    const nf = featAt(S.s);
    if (f === 7 && nf !== 7 && !S.air) S.air = { y: 0.1, vy: 2.8 + S.v * 0.33 };
    if (S.air) { S.air.vy -= 18 * dt; S.air.y += S.air.vy * dt; if (S.air.y <= 0) { if (nf === 3 && !hover) S.air.y = 0.001; else { S.air = null; haptic(30, 0.15); } } }
    // moving platform: safe only on the platform
    let onPlat = true, platX = 0;
    if (nf === 6) { const mv = movers.find(m => S.s >= m.s0 && S.s <= m.s1); if (mv) { platX = platOff(mv, S.t); onPlat = Math.abs(S.x - platX) < 1.4 + r * 0.3; } }
    // crumbling tiles: don't linger
    if (nf === 5 && !S.air) { const ti = Math.floor(S.s / 2) * 10 + Math.floor((S.x + 4) / 1.2); if (ti !== S.tile) { S.tile = ti; S.tileT = 0; } S.tileT += dt; } else S.tileT = 0;
    const halfW = p.w + r * 0.3 + (mini ? 0.2 : 0);
    let off = !S.air && (Math.abs(S.x) > halfW || (nf === 3) || !onPlat || S.tileT > 0.55);
    if (S.tileT > 0.55) S.tileT = 0;
    if (Math.abs(S.x) > halfW && (early || hover)) { S.x = Math.sign(S.x) * (halfW - 0.05); S.vx = -S.vx * 0.5; off = nf === 3 && !hover; if (early) haptic(20, 0.1); }  // edge bumpers / hover
    if (hover && off) off = false;
    if (off && Math.abs(S.x) > halfW && !(nf === 3)) {   // grace: a moment on the edge before falling, pushes back in
      S.edgeT += dt; S.vx -= Math.sign(S.x) * 14 * dt; if (S.edgeT < 0.3) off = false;
    } else if (!off) S.edgeT = 0;
    if (off && S.rescue > 0 && nf !== 3 && onPlat) {   // one free auto-recover per run
      S.rescue = 0; S.x = Math.sign(S.x) * (p.w - 0.6); S.vx = -Math.sign(S.x) * 3; S.inv = 1.5; S.edgeT = 0; off = false; toast(T.rescue); sfx.calib(); }
    if (off) { S.fall = { vy: 0, y: 0, vside: S.vx }; sfx.fall(); haptic(200, 0.6); S.combo = 0; }
    // checkpoints
    const cp = Math.floor(S.s / CP) * CP; if (cp > S.lastCp) { S.lastCp = cp; S.cps++; sfx.cp(); burst(marble.position, 0x5ff6ff, 50, 6); flash('#5ff6ff', 0.18); toast(T.cp + ' · ' + cp + ' m', 1000); }
    // biome change
    const b = biomeOf(S.s); if (b !== S.biome) { applyBiome(b); toast(T[BIOMES[b].k], 1400); }
  }
  scene.fog.color.lerp(BIOMES[S.biome].fogC, Math.min(1, dtReal * 0.8)); skyLerp(Math.min(1, dtReal * 0.8)); lavaMat.uniforms.tint.value.lerp(BIOMES[S.biome].lavaC, Math.min(1, dtReal * 0.8));
  const q = at(S.s), cx = Math.cos(q.h), sz = Math.sin(q.h);
  let my = q.y + R * marble.scale.x + (S.air ? S.air.y : 0) + (S.pu.hover > 0 ? 0.25 + 0.05 * Math.sin(S.t * 6) : 0);
  if (S.fall) { S.fall.vy -= 18 * dt; S.fall.y += S.fall.vy * dt; S.x += S.fall.vside * dt; S.s += S.v * 0.6 * dt; my += S.fall.y;
    if (my - R < S.lava + 0.2 && !S.dead) { sfx.burn(); haptic(300, 1); flash('#ff7020', 0.45); loseLife('fell'); } }
  marble.position.set(q.x + cx * S.x, my, q.z + sz * S.x);
  const fwd = new THREE.Vector3(Math.sin(q.h), 0, -Math.cos(q.h)), side = new THREE.Vector3(cx, 0, sz);
  const vel = fwd.clone().multiplyScalar(S.v).addScaledVector(side, S.vx), sp = vel.length();
  if (sp > 0.01) { const axisR = new THREE.Vector3().crossVectors(up, vel).normalize(); marble.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(axisR, sp * dt / R)); }
  halo.quaternion.copy(marble.quaternion).invert().multiply(haloBase);
  shadow.position.set(marble.position.x, q.y + 0.01, marble.position.z); shadow.visible = !S.fall && featAt(S.s) !== 3;
  if (SKINS[skin] && SKINS[skin].rainbow) coreMat.color.setHSL((S.t * 0.2) % 1, 1, 0.55);
  // lava: slow, capped rise + gentle catch-up when far behind; slows down when it is close (forgiving)
  // S.gap = lava distance below the track; it closes slowly over time and opens again when you roll fast
  if (!S.dead && !S.fall) { let rate = Math.min(0.3, 0.1 + 0.0008 * S.t); if (S.gap < 3) rate *= 0.5; if (slow) rate = 0;
    S.gap = Math.min(9, S.gap + (0.035 * Math.max(0, S.v - 4) - rate) * dt); }
  S.lava = Math.min(S.lava + 3 * dt, q.y - S.gap); const gap = S.fall ? q.y - S.lava : S.gap;
  if (!S.fall && !S.dead && gap < 0.4) { sfx.burn(); haptic(400, 1); flash('#ff7020', 0.45); loseLife('burnt'); }
  S.heatW = Math.max(0, Math.min(1, 1 - (gap - 0.4) / 8));
  // moving platforms
  for (const mv of movers) { const o = platOff(mv, S.t), pm = mv.p; mv.m.position.set(pm.x + Math.cos(pm.h) * o, pm.y - 0.15, pm.z + Math.sin(pm.h) * o); }
  // items
  if (S.comboT > 0) { S.comboT -= dt; if (S.comboT <= 0) S.combo = 0; }
  const magR = S.pu.magnet > 0 ? 3.2 : 0;
  for (const it of items) {
    if (!it.alive) continue; const ds = it.s - S.s;
    if (ds < -8) { it.alive = false; scene.remove(it.m); continue; }
    if (ds > 70) continue;
    const isO = OBST.has(it.type);
    if (isO) animObst(it, S.t); else it.m.rotation.y += dt * 3;
    if (it.type === 'boulder' && ds < 38 && ds > -3 && state === 'play') { it.s -= 4.5 * dt; placeX(it, it.x); it.m.rotation.x -= dt * 7; if (ds < 20 && Math.random() < dt * 3) haptic(10, 0.08); }
    if (it.type === 'coin' && magR && Math.abs(ds) < magR && Math.abs(it.x - S.x) < magR + 1) { it.s += (S.s - it.s) * Math.min(1, dt * 8); it.x += (S.x - it.x) * Math.min(1, dt * 8);
      const ip = at(it.s); it.m.position.set(ip.x + Math.cos(ip.h) * it.x, ip.y + 0.55, ip.z + Math.sin(ip.h) * it.x); }
    if (S.fall || S.dead) continue;
    const high = S.air && S.air.y > 0.7;
    if (isO) {
      if (!high && obstHit(it, it.s - S.s, S.x, r, S.t)) {
        if (it.type === 'hole') { if (!hover) { S.fall = { vy: 0, y: 0, vside: S.vx * 0.3 }; sfx.fall(); haptic(200, 0.6); S.combo = 0; } continue; }
        if (it.type === 'bumper') { S.vx = (S.x > it.x ? 1 : -1) * 7; S.s = Math.min(S.s, it.s - 0.9); S.v *= 0.7; noiseHit(0.15, 900, 0.6); tone(520, 0.12, 'square', 0.1, 900); haptic(40, 0.3); continue; }
        S.v *= 0.4; S.vx = (S.x > it.x ? 1 : -1) * 4; it.hit = true; hurt(); it.alive = false; scene.remove(it.m); continue; }
      if (Math.abs(ds) < 1.2) it.near = Math.min(it.near, Math.abs(S.x - it.x));
      if (ds < -1.2 && !it.hit && !it.nearDone) { it.nearDone = true;
        if (!['bumper', 'divider', 'hole'].includes(it.type) && (it.near < r + 1.05 || ['bar', 'hammer', 'jet', 'gate', 'blade', 'slider', 'wave', 'boulder'].includes(it.type))) { S.nears++; S.pts += 25; toast(T.near + ' +25', 700); } }
      continue;
    }
    const hitR = it.type === 'coin' ? 0.6 : 0.65;
    if (Math.abs(it.s - S.s) < hitR && Math.abs(it.x - S.x) < hitR + (mini ? 0 : 0)) {
      if (it.type === 'coin') { S.combo = Math.min(S.combo + 1, 99); S.comboT = 1.6; const mult = Math.min(5, 1 + Math.floor(S.combo / 5)), v = (S.pu.x2 > 0 ? 2 : 1);
        S.coins += v; S.pts += 10 * mult * v; burst(it.m.position, mult > 2 ? 0xff7ad0 : 0xffd040, 7, 3); tone(1320 + Math.min(mult, 5) * 120, 0.12, 'triangle', 0.18); tone(1980, 0.18, 'triangle', 0.14, null, 0.05); }
      else { burst(it.m.position, PU[it.type].c, 34, 5); flash('#' + new THREE.Color(PU[it.type].c).getHexString(), 0.22); grabPU(it.type); }
      it.alive = false; scene.remove(it.m);
    }
  }
  // achievements
  if (state === 'play') for (const [k, fn] of ACH) if (!ach[k] && fn(S)) { ach[k] = 1; SV('lavakule_ach_v1', ach); bank += 100; SV('lavakule_bank_v1', bank); setTimeout(() => toast('🏆 ' + T.achDone + '\n' + T[k], 2200), 400); sfx.power(); }
  // onboarding tips (first 3 runs)
  if (runs <= 3 && state === 'play') { const tips = [[1.5, 't1'], [9, 't2'], [17, 't3']]; if (S.tip < 3 && S.t > tips[S.tip][0]) { toast(T[tips[S.tip][1]], 2600); S.tip++; } }
  // chunks
  const si = S.s / DS;
  while (chunkNext * CH < si + 260) buildChunk(chunkNext++ * CH);
  while (chunks.length && chunks[0].i0 + CH < si - 40) dropChunk(chunks.shift());
  if (items.length > 400) for (let i = items.length - 1; i >= 0; i--) if (!items[i].alive) items.splice(i, 1);
  for (let i = shards.length - 1; i >= 0; i--) { const sh = shards[i]; sh.v.y -= 12 * dt; sh.m.position.addScaledVector(sh.v, dt); sh.m.rotation.x += dt * 8; sh.life -= dt; if (sh.life < 0) { scene.remove(sh.m); shards.splice(i, 1); } }
  if (ac) { const playing = state === 'play' && !S.fall && !S.air && !S.dead; rollG.gain.setTargetAtTime(playing ? Math.min(0.5, S.v / 30) : 0, ac.currentTime, 0.05); rollF.frequency.setTargetAtTime(150 + S.v * 40, ac.currentTime, 0.1);
    sizzleG.gain.setTargetAtTime(state === 'play' ? 0.02 + S.heatW * 0.12 : 0, ac.currentTime, 0.2); }
  // HUD
  $('hScore').textContent = score(); $('hCoins').textContent = S.coins; $('hDist').textContent = Math.floor(S.s) + ' m';
  $('heatBar').style.transform = `scaleX(${S.heatW.toFixed(3)})`; $('heat').classList.toggle('hot', S.heatW > 0.7);
  let pus = ''; for (const k in S.pu) if (S.pu[k] > 0) pus += `<span>${PU[k].e} ${Math.ceil(S.pu[k])}</span>`;
  const mult = Math.min(5, 1 + Math.floor(S.combo / 5)); if (mult > 1) pus += `<span class="combo">${T.combo} ×${mult}</span>`;
  if (pus !== update.lastPus) { $('pus').innerHTML = pus; update.lastPus = pus; }
  $('hp').textContent = '●'.repeat(Math.max(0, S.hp)) + '○'.repeat(Math.max(0, MAXHP - S.hp));
}

/* ---------- camera / render ---------- */
let last = performance.now(), fpsAcc = 0, fpsN = 0; window.__lkFps = 0;
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  fpsAcc += dt; fpsN++; if (fpsAcc > 1) { window.__lkFps = Math.round(fpsN / fpsAcc); fpsAcc = 0; fpsN = 0; }
  if (state === 'play' || state === 'over') update(state === 'over' ? dt * 0.5 : dt);
  else if (state === 'menu') { menuT += dt; if (!S.q) reset(); S.s += dt * 6; const q = at(S.s); marble.position.set(q.x + Math.cos(q.h) * Math.sin(menuT * .6) * 0.8, q.y + R, q.z + Math.sin(q.h) * Math.sin(menuT * .6) * 0.8);
    marble.rotateX(-dt * 6 / R); while (chunkNext * CH < S.s / DS + 260) buildChunk(chunkNext++ * CH); while (chunks.length && chunks[0].i0 + CH < S.s / DS - 40) dropChunk(chunks.shift());
    S.lava = q.y - 7; for (const it of items) if (OBST.has(it.type) && Math.abs(it.s - S.s) < 70) animObst(it, menuT);
    const b = biomeOf(S.s); if (b !== S.biome) applyBiome(b); scene.fog.color.lerp(BIOMES[S.biome].fogC, dt); skyLerp(Math.min(1, dt)); lavaMat.uniforms.tint.value.lerp(BIOMES[S.biome].lavaC, dt); }
  const q = at(S.s + 0.0), ahead = at(S.s + 7), hd = q.h;
  const portrait = innerHeight > innerWidth;
  const back = portrait ? 6.2 : 5.2, hgt = portrait ? 3.4 : 2.6;
  const target = tmpV.set(q.x - Math.sin(hd) * back + Math.cos(hd) * (S.x || 0) * 0.5, q.y + hgt, q.z + Math.cos(hd) * back + Math.sin(hd) * (S.x || 0) * 0.5);
  if (state === 'play' && S.inv > 2.4 && S.respawnT <= 0) camPos.copy(target);
  camPos.lerp(target, 1 - Math.exp(-dt * 6));
  camLook.lerp(new THREE.Vector3(ahead.x, ahead.y + 0.3, ahead.z), 1 - Math.exp(-dt * 8));
  camera.position.copy(camPos);
  if (shake > 0) { camera.position.x += (Math.random() - .5) * shake * 0.4; camera.position.y += (Math.random() - .5) * shake * 0.4; shake = Math.max(0, shake - dt * 2.5); }
  camera.up.set(Math.sin(-(S.sway || 0) * 1.2) * Math.cos(hd), 1, Math.sin(-(S.sway || 0) * 1.2) * Math.sin(hd)).normalize();
  camera.lookAt(camLook);
  sky.position.copy(camera.position); skyMat.uniforms.t.value = now / 1000; updSparks(dt);
  lava.position.set(camPos.x, S.lava, camPos.z); lavaMat.uniforms.t.value = now / 1000;
  lavaLight.position.set(marble.position.x, S.lava + 2.5, marble.position.z); lavaLight.intensity = 6 + 14 * (S.heatW || 0) + Math.sin(now / 130) * 1.5;
  sun.position.set(marble.position.x - 6, marble.position.y + 14, marble.position.z + 4); sun.target.position.copy(marble.position);
  for (let i = 0; i < EMB; i++) { let y = embPos[i * 3 + 1] + dt * (1 + (i % 5) * 0.4);
    if (y > S.lava + 12 || Math.abs(embPos[i * 3] - camPos.x) > 30 || Math.abs(embPos[i * 3 + 2] - camPos.z) > 30) { embPos[i * 3] = camPos.x + fx(-25, 25); embPos[i * 3 + 2] = camPos.z + fx(-25, 25); y = S.lava + fx(0, 2); }
    embPos[i * 3 + 1] = y; }
  embGeo.attributes.position.needsUpdate = true;
  renderer.render(scene, camera);
}
let menuT = 0;
function resize() { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.fov = innerHeight > innerWidth ? 70 : 58; camera.updateProjectionMatrix(); }
addEventListener('resize', resize); resize(); reset(); state = 'menu'; renderMissions();
requestAnimationFrame(frame);
