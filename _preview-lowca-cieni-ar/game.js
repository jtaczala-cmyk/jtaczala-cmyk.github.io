/* Łowca Cieni AR – prototyp gry AR w przeglądarce (kamera + żyroskop + Canvas + Web Audio).
   Zero zewnętrznych zasobów: cała grafika i dźwięk generowane proceduralnie. */
(() => {
  'use strict';

  // ---------- Narzędzia ----------
  const $ = (id) => document.getElementById(id);
  const DEG = Math.PI / 180;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const rand = (a, b) => a + Math.random() * (b - a);
  const wrap180 = (a) => { a = ((a + 180) % 360 + 360) % 360 - 180; return a; };
  const wrap360 = (a) => ((a % 360) + 360) % 360;
  const BEST_KEY = 'lowcaCieniAR_best';
  const loadBest = () => { try { return parseInt(localStorage.getItem(BEST_KEY) || '0', 10) || 0; } catch (e) { return 0; } };
  const saveBest = (v) => { try { localStorage.setItem(BEST_KEY, String(v)); } catch (e) {} };

  // ---------- Elementy DOM ----------
  const video = $('cam'), canvas = $('scene'), ctx = canvas.getContext('2d');
  const radar = $('radar'), rctx = radar.getContext('2d');
  const ui = {
    hud: $('hud'), start: $('startScreen'), over: $('overScreen'), pause: $('pauseScreen'),
    score: $('score'), wave: $('wave'), combo: $('combo'), comboBox: $('comboBox'),
    hpNum: $('hpNum'), hpBar: $('hpBar'), hpSegs: Array.from(document.querySelectorAll('#hpBar i')),
    banner: $('banner'), toast: $('toast'), cross: $('crosshair'), mode: $('modeTag'),
    edgeL: $('edgeL'), edgeR: $('edgeR'), edgeB: $('edgeB'), vignette: $('vignette'),
    msg: $('startMsg'), bestStart: $('bestStart'), bestOver: $('bestOver'),
    fScore: $('finalScore'), fWave: $('finalWave'), fKills: $('finalKills'), fCombo: $('finalCombo'), newRec: $('newRecord'),
    mute: $('muteBtn'), fire: $('fireBtn')
  };
  ui.bestStart.textContent = loadBest();

  // ---------- Ekran / projekcja ----------
  let W = 0, H = 0, DPR = 1, F = 500; // F = ogniskowa w pikselach CSS
  const CAM_FOV_LONG = 66; // przybliżone pole widzenia kamery telefonu po dłuższym boku (°)
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    F = (Math.max(W, H) / 2) / Math.tan(CAM_FOV_LONG / 2 * DEG);
  }
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', () => setTimeout(resize, 200));
  resize();
  const hfov = () => 2 * Math.atan((W / 2) / F) / DEG;

  // Rzutowanie kierunku świata (azymut, elewacja w °) na ekran
  function project(az, el) {
    const dAz = wrap180(az - view.yaw);
    if (Math.abs(dAz) > 85) return null;
    const dEl = el - view.pitch;
    if (Math.abs(dEl) > 85) return null;
    return { x: W / 2 + Math.tan(dAz * DEG) * F, y: H / 2 - Math.tan(dEl * DEG) * F / Math.cos(dAz * DEG), dAz };
  }

  // ---------- Widok i sterowanie ----------
  const view = { yaw: 0, pitch: 0, targetYaw: 0, targetPitch: 0 };
  const input = { keys: {}, gyro: false, gyroSeen: false, camera: false };

  // Orientacja urządzenia -> kierunek tylnej kamery (wektor -Z urządzenia w układzie świata)
  function onOrientation(e) {
    let yaw, pitch;
    if (e.alpha != null && e.beta != null && e.gamma != null) {
      const a = e.alpha * DEG, b = e.beta * DEG, g = e.gamma * DEG;
      const ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b), cg = Math.cos(g), sg = Math.sin(g);
      const vx = -ca * sg - sa * sb * cg;
      const vy = -sa * sg + ca * sb * cg;
      const vz = -cb * cg;
      const horiz = Math.hypot(vx, vy);
      pitch = Math.atan2(vz, horiz) / DEG;
      if (horiz > 0.12) yaw = Math.atan2(vx, vy) / DEG; // przy patrzeniu pionowo kierunek jest niestabilny
      else yaw = input.lastRawYaw;
      // iOS: jeśli dostępny kompas, wyrównaj do północy (stały offset, bez skoków)
      if (typeof e.webkitCompassHeading === 'number' && !isNaN(e.webkitCompassHeading) && horiz > 0.5) {
        const off = wrap180(e.webkitCompassHeading - yaw);
        input.compassOff = input.compassOff == null ? off : input.compassOff + wrap180(off - input.compassOff) * 0.02;
      }
    } else if (typeof e.webkitCompassHeading === 'number') {
      yaw = e.webkitCompassHeading; pitch = e.beta != null ? e.beta - 90 : 0;
    } else return;
    if (yaw == null) return;
    input.lastRawYaw = yaw;
    input.gyroSeen = true;
    if (!input.gyro) return;
    const off = input.compassOff || 0;
    // Rozwinięcie 0°/360°: cel trzymany jako kąt ciągły (bez skoku przy przejściu przez północ)
    view.targetYaw = view.targetYaw + wrap180((yaw + off) - view.targetYaw);
    view.targetPitch = clamp(pitch, -80, 80);
  }
  window.addEventListener('deviceorientation', onOrientation, true);

  // Przeciąganie (symulacja / brak żyroskopu) + stuknięcia
  const drag = { id: null, x: 0, y: 0, sx: 0, sy: 0, t: 0, moved: 0 };
  canvas.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    audio.unlock();
    if (!game.running || game.paused) return;
    drag.id = e.pointerId; drag.x = drag.sx = e.clientX; drag.y = drag.sy = e.clientY; drag.t = performance.now(); drag.moved = 0;
    try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
    if (input.gyro) { shootAt(e.clientX, e.clientY, true); drag.id = null; } // w AR strzał natychmiast
  });
  canvas.addEventListener('pointermove', (e) => {
    if (drag.id !== e.pointerId) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    drag.x = e.clientX; drag.y = e.clientY;
    drag.moved += Math.abs(dx) + Math.abs(dy);
    const sens = 0.28 * (66 / CAM_FOV_LONG);
    view.targetYaw -= dx * sens;
    view.targetPitch = clamp(view.targetPitch + dy * sens, -45, 45);
  });
  const endDrag = (e) => {
    if (drag.id !== e.pointerId) return;
    drag.id = null;
    if (drag.moved < 12 && performance.now() - drag.t < 350 && game.running && !game.paused) shootAt(drag.sx, drag.sy, true);
  };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', (e) => { if (drag.id === e.pointerId) drag.id = null; });

  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    input.keys[k] = true;
    if ((k === ' ' || k === 'enter') && game.running && !game.paused) { e.preventDefault(); fireCenter(); }
    if (k === 'p' || k === 'escape') togglePause();
    if (k.startsWith('arrow') || k === ' ') e.preventDefault();
  });
  window.addEventListener('keyup', (e) => { input.keys[e.key.toLowerCase()] = false; });

  // Blokady przeglądarki: zoom, pull-to-refresh, menu kontekstowe
  ['gesturestart', 'gesturechange', 'gestureend'].forEach((t) => document.addEventListener(t, (e) => e.preventDefault()));
  document.addEventListener('touchmove', (e) => { if (!e.target.closest('.screen')) e.preventDefault(); }, { passive: false });
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (e) => { const n = Date.now(); if (n - lastTouchEnd < 300 && !e.target.closest('button')) e.preventDefault(); lastTouchEnd = n; }, { passive: false });
  document.addEventListener('contextmenu', (e) => e.preventDefault());
  document.addEventListener('dblclick', (e) => e.preventDefault());

  // ---------- Dźwięk (Web Audio, proceduralny) ----------
  const audio = (() => {
    let ac = null, master = null, comp = null, noiseBuf = null, muted = false, htmlUnlocked = false, pendingChime = false;
    const MASTER_VOL = 1.0;
    // Cichy WAV (generowany w kodzie) – odtworzenie <audio> w geście przełącza sesję audio iOS
    // na „playback”, dzięki czemu Web Audio gra także przy włączonym przełączniku wyciszenia (iOS < 17).
    function silentWavUrl() {
      const n = 2205, b = new ArrayBuffer(44 + n * 2), v = new DataView(b);
      const w = (o, str) => { for (let i = 0; i < str.length; i++) v.setUint8(o + i, str.charCodeAt(i)); };
      w(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true);
      v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, 22050, true); v.setUint32(28, 44100, true);
      v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, n * 2, true);
      return URL.createObjectURL(new Blob([b], { type: 'audio/wav' }));
    }
    let silentEl = null;
    function unlockHtmlAudio() {
      if (htmlUnlocked || navigator.audioSession) return; // iOS 17+ ma audioSession – trik niepotrzebny
      try {
        if (!silentEl) { silentEl = document.createElement('audio'); silentEl.src = silentWavUrl(); silentEl.loop = true; silentEl.setAttribute('playsinline', ''); silentEl.preload = 'auto'; }
        const pr = silentEl.play();
        htmlUnlocked = true;
        if (pr && pr.catch) pr.catch(() => { htmlUnlocked = false; });
      } catch (e) {}
    }
    // Wywoływane SYNCHRONICZNIE na początku każdego gestu (przed jakimkolwiek await).
    function unlock() {
      // iOS 17+: sesja „playback” = dźwięk także przy przełączniku wyciszenia
      try { if (navigator.audioSession && navigator.audioSession.type !== 'playback') navigator.audioSession.type = 'playback'; } catch (e) {}
      if (!ac) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        try { ac = new AC({ latencyHint: 'interactive' }); } catch (e) { ac = new AC(); }
        comp = ac.createDynamicsCompressor();
        comp.threshold.value = -10; comp.knee.value = 8; comp.ratio.value = 4; comp.attack.value = 0.002; comp.release.value = 0.15;
        comp.connect(ac.destination);
        master = ac.createGain(); master.gain.value = muted ? 0 : MASTER_VOL; master.connect(comp);
        noiseBuf = ac.createBuffer(1, ac.sampleRate * 1, ac.sampleRate);
        const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        ac.addEventListener && ac.addEventListener('statechange', () => {
          if (ac.state === 'running' && pendingChime) { pendingChime = false; chime(); }
        });
      }
      // 'suspended' lub 'interrupted' (np. po oknie zgody na kamerę) -> wznów w ramach gestu
      if (ac.state !== 'running' && ac.state !== 'closed') { try { const r = ac.resume(); if (r && r.catch) r.catch(() => {}); } catch (e) {} }
      // klasyczne odblokowanie iOS: 1-próbkowy cichy bufor odtworzony w geście
      try { const sb = ac.createBufferSource(); sb.buffer = ac.createBuffer(1, 1, 22050); sb.connect(ac.destination); sb.start(0); } catch (e) {}
      unlockHtmlAudio();
    }
    function chime() {
      if (!ac || muted) return;
      if (ac.state !== 'running') { pendingChime = true; return; }
      osc('sine', 660, 650, 0.25, 0.35, master); osc('sine', 990, 980, 0.35, 0.28, master, 0.09); osc('triangle', 1320, 1310, 0.3, 0.12, master, 0.16);
    }
    // Globalne odblokowanie przy każdym dotknięciu/kliknięciu (faza capture, przed logiką gry)
    ['touchstart', 'touchend', 'pointerdown', 'pointerup', 'mousedown', 'click', 'keydown'].forEach((t) =>
      window.addEventListener(t, () => { if (!ac || ac.state !== 'running' || !htmlUnlocked) unlock(); }, { capture: true, passive: true }));
    document.addEventListener('visibilitychange', () => { if (!document.hidden && ac && ac.state !== 'running') { try { ac.resume().catch(() => {}); } catch (e) {} } });
    const ok = () => { if (!ac || !master || ac.state === 'closed') return false; if (ac.state !== 'running') { try { ac.resume().catch(() => {}); } catch (e) {} } return true; };
    function out(pan) {
      if (ac.createStereoPanner && pan) { const p = ac.createStereoPanner(); p.pan.value = clamp(pan, -1, 1); p.connect(master); return p; }
      return master;
    }
    function env(g, t, a, peak, dec) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec); }
    function osc(type, f0, f1, dur, vol, dest, delay = 0) {
      const t = ac.currentTime + delay, o = ac.createOscillator(), g = ac.createGain();
      o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), t + dur);
      env(g, t, 0.005, vol, dur); o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + 0.05);
    }
    function noise(dur, vol, type, f0, f1, dest, q = 1, delay = 0) {
      const t = ac.currentTime + delay, s = ac.createBufferSource(), fl = ac.createBiquadFilter(), g = ac.createGain();
      s.buffer = noiseBuf; fl.type = type; fl.Q.value = q; fl.frequency.setValueAtTime(f0, t); fl.frequency.exponentialRampToValueAtTime(Math.max(f1, 20), t + dur);
      env(g, t, Math.min(0.02, dur / 3), vol, dur); s.connect(fl); fl.connect(g); g.connect(dest); s.start(t); s.stop(t + dur + 0.05);
    }
    return {
      unlock, chime,
      get state() { return ac ? ac.state : 'none'; },
      get muted() { return muted; },
      toggle() { muted = !muted; if (master) master.gain.setTargetAtTime(muted ? 0 : MASTER_VOL, ac.currentTime, 0.02); if (!muted) chime(); return muted; },
      shot() { if (!ok()) return; osc('sawtooth', 1400, 180, 0.16, 0.32, master); osc('sine', 600, 90, 0.14, 0.5, master); noise(0.08, 0.25, 'highpass', 3000, 1200, master); },
      hit(pan) { if (!ok()) return; const d = out(pan); osc('square', 320, 160, 0.08, 0.25, d); noise(0.07, 0.35, 'bandpass', 1800, 800, d, 3); },
      banish(pan) { if (!ok()) return; const d = out(pan); osc('sine', 220, 1400, 0.2, 0.5, d); osc('triangle', 880, 2400, 0.14, 0.25, d, 0.05); noise(0.35, 0.4, 'lowpass', 4000, 200, d); },
      spawn(pan) { if (!ok()) return; const d = out(pan); noise(0.9, 0.35, 'bandpass', 220, 900, d, 4); osc('sine', 110, 70, 0.8, 0.18, d); },
      damage() { if (!ok()) return; osc('sine', 160, 40, 0.4, 0.9, master); osc('square', 90, 40, 0.2, 0.2, master); noise(0.25, 0.5, 'lowpass', 1200, 80, master); },
      wave() { if (!ok()) return; [220, 277, 330, 440].forEach((f, i) => osc('triangle', f, f * 0.98, 0.9, 0.2, master, i * 0.08)); },
      growl(pan) { if (!ok()) return; const d = out(pan); noise(0.55, 0.4, 'lowpass', 520, 110, d, 6); osc('sawtooth', 95, 52, 0.5, 0.22, d); osc('square', 140, 60, 0.3, 0.08, d, 0.05); },
      over() { if (!ok()) return; osc('sawtooth', 300, 40, 1.4, 0.35, master); noise(1.2, 0.35, 'lowpass', 1200, 60, master); }
    };
  })();
  ui.mute.addEventListener('click', (e) => { e.stopPropagation(); audio.unlock(); ui.mute.textContent = audio.toggle() ? '🔇' : '🔊'; });

  // ---------- Typy stworów ----------
  // h = wysokość środka nad ziemią (m), size = rozmiar (m), speed = m/s, dmg = obrażenia
  const TYPES = {
    cien:  { name: 'Cień',          hp: 2, size: 1.7, h: 1.0, speed: 1.5, dmg: 20, pts: 100, weight: 5 },
    oko:   { name: 'Oko Otchłani',  hp: 3, size: 0.9, h: 1.9, speed: 1.05, dmg: 15, pts: 150, weight: 3 },
    pelz:  { name: 'Pełzacz',       hp: 1, size: 0.8, h: 0.45, speed: 3.1, dmg: 12, pts: 120, weight: 3 }
  };
  const EYE_H = 1.45; // wysokość oczu gracza (m)
  const SPAWN_DIST = 20, ATTACK_DIST = 1.3;

  // ---------- Stan gry ----------
  const game = {
    running: false, paused: false, over: false, t: 0,
    score: 0, wave: 0, kills: 0, combo: 1, bestCombo: 1, comboTimer: 0,
    hp: 100, toSpawn: 0, spawnTimer: 0, waveBreak: 0, shake: 0, hurt: 0,
    monsters: [], particles: [], beams: [], floaters: [], fx: [], strike: null
  };
  let uid = 0;

  function pickType() {
    let total = 0; const pool = [];
    for (const k in TYPES) { let w = TYPES[k].weight; if (k === 'oko' && game.wave < 2) w = 1; total += w; pool.push([k, w]); }
    let r = Math.random() * total;
    for (const [k, w] of pool) { if ((r -= w) <= 0) return k; }
    return 'cien';
  }

  function spawnMonster() {
    const type = pickType(), T = TYPES[type];
    const side = Math.random() < 0.5 ? -1 : 1;
    // najczęściej poza polem widzenia – trzeba się rozglądać
    const offset = Math.random() < 0.25 ? rand(-25, 25) : side * rand(45, 175);
    const m = {
      id: ++uid, type, hp: T.hp + (game.wave >= 6 && type !== 'pelz' ? 1 : 0), maxHp: 0,
      az: view.yaw + offset, dist: SPAWN_DIST + rand(-1.5, 2), phase: rand(0, 6.28),
      speed: T.speed * (1 + (game.wave - 1) * 0.07) * rand(0.9, 1.12),
      drift: rand(-6, 6), flash: 0, born: game.t, screen: null, attackT: 0,
      recoil: 0, flare: 0, flared: false, emberT: 0, veins: type === 'cien' ? genVeins(7, 0.26) : null
    };
    m.maxHp = m.hp;
    game.monsters.push(m);
    audio.spawn(clamp(wrap180(m.az - view.yaw) / 90, -1, 1));
  }

  function monsterEl(m) {
    const T = TYPES[m.type];
    let h = T.h;
    if (m.type === 'oko') h += Math.sin(game.t * 1.7 + m.phase) * 0.55; // faluje w pionie
    if (m.type === 'cien') h += Math.sin(game.t * 1.1 + m.phase) * 0.08;
    return Math.atan2(h - EYE_H, Math.max(m.dist, 0.4)) / DEG;
  }

  // 0..1 – narastanie wypadu do ataku w ostatnich metrach
  function monsterLunge(m) { const k = clamp((2.9 - m.dist) / (2.9 - ATTACK_DIST), 0, 1); return k * k * (3 - 2 * k); }
  const angSize = (m) => TYPES[m.type].size / Math.max(m.dist, 0.5) / DEG;

  function startWave() {
    game.wave++;
    game.toSpawn = 4 + game.wave * 2;
    game.spawnTimer = 0.8;
    ui.wave.textContent = game.wave;
    showBanner(`Fala ${game.wave}`, game.wave === 1 ? 'Rozejrzyj się wokół siebie' : 'Nadchodzą kolejne');
    audio.wave();
  }

  let bannerTO = 0, toastTO = 0;
  function showBanner(txt, sub) {
    ui.banner.innerHTML = `${txt}${sub ? `<small>${sub}</small>` : ''}`;
    ui.banner.classList.add('on'); clearTimeout(bannerTO);
    bannerTO = setTimeout(() => ui.banner.classList.remove('on'), 1800);
  }
  function toast(txt, ms = 3500) {
    ui.toast.textContent = txt; ui.toast.classList.add('on'); clearTimeout(toastTO);
    toastTO = setTimeout(() => ui.toast.classList.remove('on'), ms);
  }

  // ---------- Strzelanie ----------
  function hitTest(x, y, tol) {
    let best = null;
    for (const m of game.monsters) {
      const s = m.screen; if (!s) continue;
      const r = s.r * 1.1 + tol;
      const dx = x - s.x, dy = y - s.y;
      if (dx * dx + dy * dy <= r * r && (!best || m.dist < best.dist)) best = m;
    }
    return best;
  }
  let lastShot = 0;
  function shootAt(x, y, direct) {
    const now = performance.now();
    if (now - lastShot < 140) return; // szybkostrzelność
    lastShot = now;
    audio.unlock(); audio.shot();
    const target = hitTest(x, y, direct ? 18 : 30);
    const tx = target ? target.screen.x : x, ty = target ? target.screen.y : y;
    game.beams.push({ x0: W / 2 + (direct ? 0 : 0), y0: H + 10, x1: tx, y1: ty, life: 0.14, max: 0.14 });
    ui.cross.classList.add('kick'); setTimeout(() => ui.cross.classList.remove('kick'), 80);
    game.shake = Math.max(game.shake, 0.08);
    if (target) damageMonster(target, tx, ty);
    else { burst(screenToWorld(tx, ty), '#9b5cff', 6, 18); }
  }
  function fireCenter() {
    ui.fire.classList.add('down'); setTimeout(() => ui.fire.classList.remove('down'), 90);
    shootAt(W / 2, H / 2, false);
  }
  ui.fire.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); audio.unlock(); if (game.running && !game.paused) fireCenter(); });

  function screenToWorld(x, y) {
    const dAz = Math.atan((x - W / 2) / F) / DEG;
    const dEl = Math.atan(-(y - H / 2) * Math.cos(dAz * DEG) / F) / DEG;
    return { az: view.yaw + dAz, el: view.pitch + dEl };
  }

  function damageMonster(m, x, y) {
    m.hp--; m.flash = 0.12;
    const pan = clamp(wrap180(m.az - view.yaw) / 60, -1, 1);
    const w = screenToWorld(x, y);
    const P = PAL[m.type], asz = angSize(m), rpx = Math.min(asz * F * DEG * 0.35, 260);
    if (m.hp > 0) {
      audio.hit(pan); m.dist += 0.8; m.recoil = 1;
      burst(w, '#ffffff', 6, 40, 'spark'); burst(w, colorOf(m), 14, 45, 'spark'); burst(w, colorOf(m), 8, 14, 'ember', P.core);
      game.fx.push({ kind: 'ring', az: w.az, el: w.el, r: Math.max(24, rpx * 0.6), rgb: P.rim, life: 0.35, max: 0.35 });
      return;
    }
    // wygnanie
    game.monsters.splice(game.monsters.indexOf(m), 1);
    game.kills++;
    if (game.comboTimer > 0) game.combo = Math.min(game.combo + 1, 10); else game.combo = 1;
    game.comboTimer = 2.6;
    game.bestCombo = Math.max(game.bestCombo, game.combo);
    const closeBonus = m.dist < 5 ? 1.5 : 1;
    const pts = Math.round(TYPES[m.type].pts * game.combo * closeBonus * (1 + (game.wave - 1) * 0.1));
    game.score += pts;
    game.floaters.push({ az: w.az, el: w.el, txt: `+${pts}`, life: 1.1 });
    const c = { az: m.az, el: monsterEl(m) };
    game.fx.push({ kind: 'implode', az: c.az, el: c.el, r: Math.max(40, rpx), rgb: P.rim, life: 0.75, max: 0.75 });
    burst(c, colorOf(m), 22, 70, 'spark'); burst(c, '#ffffff', 10, 55, 'spark');
    burst(c, colorOf(m), 14, 35, 'shard'); burst(c, '#000', 8, 10, 'smoke', null, asz * 0.15 * F * DEG);
    burst(c, colorOf(m), 26, 22, 'ember', P.core); burst(c, colorOf(m), 14, 30);
    game.shake = Math.max(game.shake, 0.25);
    audio.banish(pan);
    ui.score.textContent = game.score;
    ui.combo.textContent = game.combo;
    ui.comboBox.classList.toggle('on', game.combo > 1);
    ui.comboBox.classList.add('pop'); setTimeout(() => ui.comboBox.classList.remove('pop'), 120);
  }
  const colorOf = (m) => (m.type === 'cien' ? '#ff2d4a' : m.type === 'oko' ? '#c084ff' : '#7dff6a');

  // kind: 'dot' (domyślnie) | 'spark' (smugi) | 'ember' (unoszący się żar) | 'shard' (odłamki cienia) | 'smoke'
  function burst(w, color, n, spd, kind = 'dot', rgb = null, size = 0) {
    for (let i = 0; i < n; i++) {
      if (game.particles.length > 650) return;
      const a = rand(0, 6.28), s = rand(0.2, 1) * spd;
      const p = { az: w.az, el: w.el, vaz: Math.cos(a) * s * 0.25, vel: Math.sin(a) * s * 0.25, life: rand(0.4, 0.9), max: 0.9, color, size: rand(1.5, 4.5), kind, rot: rand(0, 6.28), vr: rand(-8, 8), g: 6, rgb };
      if (kind === 'spark') { p.life = rand(0.25, 0.55); p.max = 0.55; p.size = rand(1.5, 3); p.g = 9; }
      else if (kind === 'ember') { p.life = rand(0.8, 1.8); p.max = 1.8; p.size = rand(1.2, 2.8); p.g = -2.5; p.vaz *= 0.5; p.vel = Math.abs(p.vel) * 0.4; }
      else if (kind === 'shard') { p.life = rand(0.6, 1.2); p.max = 1.2; p.size = rand(3, 8); p.g = 2; }
      else if (kind === 'smoke') { p.life = rand(0.8, 1.4); p.max = 1.4; p.size = Math.max(14, size * rand(0.6, 1.2)); p.g = -1.5; }
      game.particles.push(p);
    }
  }

  function hurtPlayer(m) {
    const dmg = TYPES[m.type].dmg;
    game.hp = Math.max(0, game.hp - dmg);
    game.hurt = 1; game.shake = 0.5;
    game.strike = { type: m.type, life: 0.75, max: 0.75 };
    audio.damage();
    try { if (navigator.vibrate) navigator.vibrate([90, 40, 120]); } catch (_) {}
    game.combo = 1; game.comboTimer = 0; ui.comboBox.classList.remove('on');
    updateHP();
    if (game.hp <= 0) gameOver();
  }
  function updateHP() {
    ui.hpNum.textContent = game.hp;
    ui.hpSegs.forEach((s, i) => { s.style.width = clamp((game.hp - i * 20) / 20, 0, 1) * 100 + '%'; });
    ui.hpBar.classList.toggle('low', game.hp <= 40);
  }

  // ---------- Pętla gry ----------
  let lastT = 0;
  function frame(ts) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (ts - lastT) / 1000 || 0.016); lastT = ts;
    if (game.running && !game.paused) update(dt);
    render(dt);
  }

  function update(dt) {
    game.t += dt;
    // sterowanie klawiaturą (zawsze dostępne w symulacji)
    if (!input.gyro) {
      const k = input.keys, rs = 95 * dt;
      if (k['arrowleft'] || k['a']) view.targetYaw -= rs;
      if (k['arrowright'] || k['d']) view.targetYaw += rs;
      if (k['arrowup'] || k['w']) view.targetPitch = clamp(view.targetPitch + rs * 0.6, -45, 45);
      if (k['arrowdown'] || k['s']) view.targetPitch = clamp(view.targetPitch - rs * 0.6, -45, 45);
    }
    // wygładzanie (cel jest ciągły, więc brak skoku 359°->0°)
    const kf = 1 - Math.exp(-dt * (input.gyro ? 18 : 22));
    view.yaw += (view.targetYaw - view.yaw) * kf;
    view.pitch += (view.targetPitch - view.pitch) * kf;

    // fale
    if (game.waveBreak > 0) { game.waveBreak -= dt; if (game.waveBreak <= 0) startWave(); }
    else if (game.toSpawn > 0) {
      game.spawnTimer -= dt;
      const maxAlive = 3 + Math.floor(game.wave * 0.8);
      if (game.spawnTimer <= 0 && game.monsters.length < maxAlive) {
        spawnMonster(); game.toSpawn--;
        game.spawnTimer = Math.max(0.6, 2.6 - game.wave * 0.18) * rand(0.7, 1.3);
      }
    } else if (game.monsters.length === 0) {
      game.waveBreak = 2.2;
      game.score += game.wave * 250; ui.score.textContent = game.score;
      showBanner('Fala odparta!', `Premia +${game.wave * 250}`);
    }

    // combo
    if (game.comboTimer > 0) { game.comboTimer -= dt; if (game.comboTimer <= 0) { game.combo = 1; ui.comboBox.classList.remove('on'); } }

    // stwory
    for (let i = game.monsters.length - 1; i >= 0; i--) {
      const m = game.monsters[i];
      const sp = m.type === 'pelz' ? m.speed * (0.7 + 0.6 * Math.abs(Math.sin(game.t * 3 + m.phase))) : m.speed; // pełzacz – zrywami
      m.dist -= sp * dt;
      m.az += Math.sin(game.t * 0.6 + m.phase) * m.drift * dt * (m.dist / SPAWN_DIST);
      if (m.flash > 0) m.flash -= dt;
      if (m.recoil > 0) m.recoil = Math.max(0, m.recoil - dt * 5);
      if (m.flare > 0) m.flare = Math.max(0, m.flare - dt * 2.2);
      const lu = monsterLunge(m);
      if (lu > 0.25 && !m.flared) { m.flared = true; m.flare = 1; audio.growl(clamp(wrap180(m.az - view.yaw) / 60, -1, 1)); }
      if (lu > 0.5) game.shake = Math.max(game.shake, 0.04 * lu);
      // unoszące się iskry/popiół wokół zbliżających się stworów
      if (m.dist < 15 && (m.emberT -= dt) <= 0) {
        m.emberT = rand(0.12, 0.3);
        const as = angSize(m) * 0.35;
        burst({ az: m.az + rand(-as, as), el: monsterEl(m) + rand(-as, as * 0.5) }, colorOf(m), 1, 6, 'ember', PAL[m.type].core);
      }
      if (m.dist <= ATTACK_DIST) {
        const w = { az: m.az, el: monsterEl(m) };
        burst(w, colorOf(m), 16, 50, 'spark'); burst(w, '#000', 6, 8, 'smoke', null, 60);
        game.monsters.splice(i, 1);
        hurtPlayer(m);
        if (!game.running) return;
      }
    }
    // cząsteczki / efekty
    for (let i = game.particles.length - 1; i >= 0; i--) {
      const p = game.particles[i]; p.life -= dt; if (p.life <= 0) { game.particles.splice(i, 1); continue; }
      p.az += p.vaz * dt; p.el += p.vel * dt; p.vel -= p.g * dt; p.vaz *= 0.97; p.rot += p.vr * dt;
      if (p.kind === 'ember') p.vaz += Math.sin(game.t * 3 + p.rot) * dt * 2;
    }
    for (let i = game.fx.length - 1; i >= 0; i--) { if ((game.fx[i].life -= dt) <= 0) game.fx.splice(i, 1); }
    for (let i = game.beams.length - 1; i >= 0; i--) { if ((game.beams[i].life -= dt) <= 0) game.beams.splice(i, 1); }
    for (let i = game.floaters.length - 1; i >= 0; i--) { const f = game.floaters[i]; f.life -= dt; f.el += dt * 4; if (f.life <= 0) game.floaters.splice(i, 1); }
    game.shake = Math.max(0, game.shake - dt);
    game.hurt = Math.max(0, game.hurt - dt * 1.6);
  }

  // ---------- Tło symulacji (zakotwiczone w świecie) ----------
  const skyline = [], stars = [], trees = [], fogs = [];
  (function genWorld() {
    let h = 3;
    for (let i = 0; i < 120; i++) { h += rand(-1.2, 1.2); h = clamp(h, 1.2, 7); skyline.push(h); }
    for (let i = 0; i < 140; i++) stars.push({ az: rand(0, 360), el: rand(8, 70), s: rand(0.4, 1.6), tw: rand(0, 6) });
    for (let i = 0; i < 46; i++) trees.push({ az: rand(0, 360), d: rand(14, 34), h: rand(2.5, 5.5), lean: rand(-0.15, 0.15) });
    for (let i = 0; i < 18; i++) fogs.push({ az: rand(0, 360), el: rand(-6, 2), w: rand(25, 60), sp: rand(0.5, 2) });
  })();
  let simBg = true;

  function drawWorldBg() {
    const hy = H / 2 + Math.tan(view.pitch * DEG) * F; // linia horyzontu
    const sky = ctx.createLinearGradient(0, hy - H, 0, hy);
    sky.addColorStop(0, '#05020a'); sky.addColorStop(0.6, '#140821'); sky.addColorStop(1, '#2b0f33');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    // gwiazdy
    for (const s of stars) {
      const p = project(s.az, s.el); if (!p) continue;
      ctx.globalAlpha = 0.35 + 0.35 * Math.sin(game.t * 2 + s.tw);
      ctx.fillStyle = '#d9c9ff'; ctx.fillRect(p.x, p.y, s.s, s.s);
    }
    ctx.globalAlpha = 1;
    // księżyc
    const mp = project(40, 26);
    if (mp) {
      const g = ctx.createRadialGradient(mp.x, mp.y, 0, mp.x, mp.y, F * 0.18);
      g.addColorStop(0, 'rgba(255,90,110,.9)'); g.addColorStop(0.18, 'rgba(255,60,90,.6)'); g.addColorStop(0.2, 'rgba(255,60,90,.12)'); g.addColorStop(1, 'rgba(255,60,90,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(mp.x, mp.y, F * 0.18, 0, 6.28); ctx.fill();
    }
    // odległe wzgórza / ruiny
    ctx.fillStyle = '#0d0614';
    ctx.beginPath(); let started = false;
    const step = 3, n = skyline.length;
    for (let a = -84; a <= 84; a += step) {
      const az = view.yaw + a, idx = Math.floor(wrap360(az) / step) % n;
      const p = project(az, skyline[idx]); if (!p) continue;
      if (!started) { ctx.moveTo(p.x, H + 10); ctx.lineTo(p.x, p.y); started = true; } else ctx.lineTo(p.x, p.y);
    }
    ctx.lineTo(W + 50, H + 10); ctx.closePath(); ctx.fill();
    // ziemia
    const gr = ctx.createLinearGradient(0, hy, 0, H + Math.max(0, H - hy));
    gr.addColorStop(0, '#120818'); gr.addColorStop(1, '#030105');
    ctx.fillStyle = gr; ctx.fillRect(0, Math.max(0, hy), W, H);
    // promienista siatka na ziemi (pomaga czuć obrót)
    ctx.strokeStyle = 'rgba(155,92,255,.08)'; ctx.lineWidth = 1;
    for (let a = 0; a < 360; a += 15) {
      const p1 = project(a, -2), p2 = project(a, -50);
      if (p1 && p2) { ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke(); }
    }
    for (const r of [3, 6, 12]) {
      ctx.beginPath(); let st = false; const el = Math.atan2(-EYE_H, r) / DEG;
      for (let a = -80; a <= 80; a += 4) { const p = project(view.yaw + a, el); if (!p) continue; if (!st) { ctx.moveTo(p.x, p.y); st = true; } else ctx.lineTo(p.x, p.y); }
      ctx.stroke();
    }
    // martwe drzewa (dalekie -> bliskie)
    const vis = trees.map((t) => ({ t, p: project(t.az, Math.atan2(-EYE_H, t.d) / DEG) })).filter((o) => o.p).sort((a, b) => b.t.d - a.t.d);
    for (const { t, p } of vis) {
      const hpx = t.h / t.d * F, k = clamp(1 - t.d / 34, 0.15, 1);
      ctx.strokeStyle = `rgba(${10 + 20 * k},${4 + 6 * k},${16 + 20 * k},1)`;
      ctx.lineCap = 'round'; ctx.lineWidth = Math.max(1.5, hpx * 0.06);
      ctx.beginPath(); ctx.moveTo(p.x, p.y); const tx = p.x + t.lean * hpx, ty = p.y - hpx; ctx.lineTo(tx, ty); ctx.stroke();
      ctx.lineWidth = Math.max(1, hpx * 0.025);
      for (let j = 0; j < 4; j++) {
        const f = 0.45 + j * 0.13, bx = p.x + t.lean * hpx * f, by = p.y - hpx * f, dir = j % 2 ? 1 : -1;
        ctx.beginPath(); ctx.moveTo(bx, by); ctx.quadraticCurveTo(bx + dir * hpx * 0.15, by - hpx * 0.05, bx + dir * hpx * 0.25, by - hpx * 0.18); ctx.stroke();
      }
    }
    // mgła
    for (const f of fogs) {
      const p = project(f.az + game.t * f.sp, f.el); if (!p) continue;
      const r = f.w / 60 * F;
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
      g.addColorStop(0, 'rgba(120,70,160,.10)'); g.addColorStop(1, 'rgba(120,70,160,0)');
      ctx.fillStyle = g; ctx.fillRect(p.x - r, p.y - r, r * 2, r * 2);
    }
  }

  // ---------- Rysowanie stworów (kinowa grafika proceduralna) ----------
  const PAL = {
    cien: { rim: [255, 45, 74], alt: [170, 70, 255], core: [255, 120, 40], eye: [255, 40, 60], hot: [255, 236, 190] },
    oko:  { rim: [190, 110, 255], alt: [80, 220, 255], core: [255, 170, 40], eye: [255, 150, 30], hot: [255, 246, 210] },
    pelz: { rim: [125, 255, 106], alt: [60, 255, 220], core: [150, 255, 90], eye: [170, 255, 90], hot: [235, 255, 210] }
  };
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a < 0 ? 0 : a > 1 ? 1 : a})`;
  // miękka poświata (wywoływać w trybie 'lighter')
  function glow(x, y, r, c, a) {
    if (!(r > 0.5) || a <= 0.004) return;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, rgba(c, a)); g.addColorStop(0.3, rgba(c, a * 0.42)); g.addColorStop(1, rgba(c, 0));
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  function lighter(fn) { const o = ctx.globalCompositeOperation; ctx.globalCompositeOperation = 'lighter'; fn(); ctx.globalCompositeOperation = o; }
  // zwężająca się wstęga (macki, kończyny, szpony) – jedna ścieżka do wypełnienia
  function ribbon(pts, w0, w1) {
    const n = pts.length; if (n < 2) return;
    const L = [], R = [];
    for (let i = 0; i < n; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
      let dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
      const w = (w0 + (w1 - w0) * i / (n - 1)) / 2;
      L.push([pts[i][0] - dy * w, pts[i][1] + dx * w]); R.push([pts[i][0] + dy * w, pts[i][1] - dx * w]);
    }
    ctx.beginPath(); ctx.moveTo(L[0][0], L[0][1]);
    for (let i = 1; i < n; i++) ctx.lineTo(L[i][0], L[i][1]);
    for (let i = n - 1; i >= 0; i--) ctx.lineTo(R[i][0], R[i][1]);
    ctx.closePath();
  }
  function polyline(pts, ox = 0, oy = 0) { ctx.beginPath(); ctx.moveTo(pts[0][0] + ox, pts[0][1] + oy); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0] + ox, pts[i][1] + oy); }
  function tentacle(x0, y0, ang, len, t, ph, amp, n = 9) {
    const pts = [], ca = Math.cos(ang), sa = Math.sin(ang);
    for (let i = 0; i < n; i++) {
      const k = i / (n - 1), off = Math.sin(t * 3 + ph - k * 4) * amp * k * len;
      pts.push([x0 + ca * len * k - sa * off, y0 + sa * len * k + ca * off]);
    }
    return pts;
  }
  function genVeins(n, len) {
    const v = [];
    for (let i = 0; i < n; i++) {
      let a = (i / n) * 6.28 + rand(-0.4, 0.4), px = 0, py = 0; const pts = [[0, 0]];
      for (let j = 0; j < 4; j++) { a += rand(-0.7, 0.7); const l = len * rand(0.18, 0.3); px += Math.cos(a) * l; py += Math.sin(a) * l * 1.25; pts.push([px, py]); }
      v.push(pts);
    }
    return v;
  }
  // drapieżne oko: pionowa źrenica, świecąca tęczówka, flara obiektywu
  function predatorEye(x, y, rx, ry, rot, P, inten, open, lod) {
    ry *= open; if (ry < 0.4) ry = 0.4;
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    ctx.fillStyle = 'rgba(0,0,0,.9)'; ctx.beginPath(); ctx.ellipse(0, 0, rx * 1.35, ry * 1.7 + 1, 0, 0, 6.28); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, 6.28); ctx.save(); ctx.clip();
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
    g.addColorStop(0, rgba(P.hot, 1)); g.addColorStop(0.35, rgba(P.eye, 1)); g.addColorStop(1, 'rgba(60,0,10,1)');
    ctx.fillStyle = g; ctx.fillRect(-rx, -ry, rx * 2, ry * 2);
    const pw = Math.max(0.6, rx * (0.2 - Math.min(0.12, (inten - 1) * 0.06)));
    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(0, 0, pw, ry * 1.05, 0, 0, 6.28); ctx.fill();
    if (lod) { ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.beginPath(); ctx.arc(-rx * 0.35, -ry * 0.3, Math.max(0.5, rx * 0.12), 0, 6.28); ctx.fill(); }
    ctx.restore(); ctx.restore();
    lighter(() => {
      glow(x, y, rx * 3.2 * inten, P.eye, 0.5 * Math.min(inten, 2));
      glow(x, y, rx * 1.2, P.hot, 0.5);
      if (lod || inten > 1.3) { // poziomy „anamorficzny” błysk
        ctx.save(); ctx.translate(x, y); ctx.scale(1, 0.07);
        glow(0, 0, rx * 7 * inten, P.eye, 0.45 * Math.min(inten, 2.2)); ctx.restore();
      }
    });
  }
  // paszcza z warstwami poszarpanych kłów i nitkami śliny/plazmy
  function fangedMouth(x, y, w, open, P, t, ph, lod, strandCol) {
    const h = w * (0.1 + open * 0.95), hw = w / 2;
    const up = (u) => y - h * 0.3 * (1 - u * u), lo = (u) => y + h * (1 - u * u);
    ctx.beginPath(); ctx.moveTo(x - hw, y);
    ctx.quadraticCurveTo(x, y - h * 0.6, x + hw, y); ctx.quadraticCurveTo(x, y + h * 2, x - hw, y); ctx.closePath();
    const g = ctx.createRadialGradient(x, y + h * 0.35, 0, x, y + h * 0.35, hw * 1.1);
    g.addColorStop(0, rgba(P.core, 0.55 + open * 0.4)); g.addColorStop(0.35, 'rgba(90,0,20,1)'); g.addColorStop(1, 'rgba(8,0,4,1)');
    ctx.fillStyle = g; ctx.fill();
    if (open > 0.2) lighter(() => glow(x, y + h * 0.4, hw * (0.8 + open * 0.6), P.core, 0.35 * open));
    if (!lod && w < 18) return;
    const n = 7;
    const fg = ctx.createLinearGradient(x, y - h * 0.3, x, y + h);
    fg.addColorStop(0, '#fff6e0'); fg.addColorStop(0.5, '#e2cfa8'); fg.addColorStop(1, '#fff6e0');
    ctx.fillStyle = fg;
    for (let row = 0; row < 2; row++) {
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const u0 = -0.92 + (i / n) * 1.84, u1 = u0 + 1.84 / n, um = (u0 + u1) / 2;
        const canine = i === 1 || i === n - 2;
        const L = Math.min(h * 0.62, w * 0.2) * (canine ? 1.55 : 0.75 + 0.25 * Math.abs(Math.sin(i * 12.9 + ph)));
        if (row === 0) { ctx.moveTo(x + u0 * hw, up(u0)); ctx.lineTo(x + um * hw + Math.sin(i) * w * 0.01, up(um) + L); ctx.lineTo(x + u1 * hw, up(u1)); }
        else { ctx.moveTo(x + u0 * hw, lo(u0)); ctx.lineTo(x + um * hw, lo(um) - L * 0.85); ctx.lineTo(x + u1 * hw, lo(u1)); }
      }
      ctx.fill();
    }
    if (open > 0.3) { // nitki śliny / plazmy
      ctx.strokeStyle = strandCol; ctx.lineWidth = Math.max(0.6, w * 0.012);
      for (let i = 0; i < 3; i++) {
        const u = -0.5 + i * 0.5 + Math.sin(t * 1.7 + i + ph) * 0.08, sag = h * (0.25 + 0.15 * Math.sin(t * 3 + i * 2));
        ctx.beginPath(); ctx.moveTo(x + u * hw, up(u) + h * 0.12); ctx.quadraticCurveTo(x + u * hw + w * 0.03, (up(u) + lo(u)) / 2 + sag, x + u * hw * 0.9, lo(u) - h * 0.1); ctx.stroke();
      }
    }
  }
  // wspólna aura: mgła przy ziemi, kłęby dymu, fale „gorącego powietrza”, podświetlenie konturowe
  function drawAura(m, x, y, s, gp, P, fx) {
    const t = game.t;
    if (gp) {
      const gw = s * (m.type === 'pelz' ? 0.75 : 0.55);
      const g = ctx.createRadialGradient(gp.x, gp.y, 0, gp.x, gp.y, gw);
      g.addColorStop(0, 'rgba(0,0,0,.6)'); g.addColorStop(0.6, 'rgba(10,0,16,.3)'); g.addColorStop(1, 'rgba(10,0,16,0)');
      ctx.save(); ctx.translate(gp.x, gp.y); ctx.scale(1, 0.28); ctx.translate(-gp.x, -gp.y);
      ctx.fillStyle = g; ctx.fillRect(gp.x - gw, gp.y - gw, gw * 2, gw * 2); ctx.restore();
    }
    // kłęby ciemnego dymu
    for (let i = 0; i < (fx.lod ? 6 : 3); i++) {
      const a = t * 0.45 + i * 1.05 + m.phase, rr = s * (0.2 + 0.06 * Math.sin(t + i));
      const px = x + Math.cos(a) * s * 0.36, py = y + Math.sin(a) * s * 0.22 + s * 0.12;
      const g = ctx.createRadialGradient(px, py, 0, px, py, rr);
      g.addColorStop(0, 'rgba(8,0,14,.38)'); g.addColorStop(1, 'rgba(8,0,14,0)');
      ctx.fillStyle = g; ctx.fillRect(px - rr, py - rr, rr * 2, rr * 2);
    }
    lighter(() => {
      glow(x, y - s * (m.type === 'cien' ? 0.15 : 0), s * (0.85 + fx.near * 0.3), P.rim, 0.13 + fx.near * 0.12 + fx.lunge * 0.22);
      // fale zniekształceń energii
      ctx.lineWidth = Math.max(0.8, s * 0.006);
      for (let i = 0; i < 2; i++) {
        const k = (t * 0.55 + i * 0.5 + m.phase) % 1;
        ctx.strokeStyle = rgba(i ? P.alt : P.rim, (1 - k) * (0.16 + fx.lunge * 0.25));
        ctx.beginPath(); ctx.ellipse(x, y + s * 0.05, s * (0.32 + k * 0.5), s * (0.32 + k * 0.5) * 0.55, 0, 0, 6.28); ctx.stroke();
      }
    });
  }

  function drawCien(m, x, y, s, t, fx) {
    const P = PAL.cien, near = fx.near, lunge = fx.lunge, lod = fx.lod;
    const breathe = Math.sin(t * 2.2 + m.phase);
    const sway = Math.sin(t * 1.6 + m.phase) * s * 0.025;
    y -= lunge * s * 0.05;
    lighter(() => glow(x + sway, y - s * 0.38, s * 0.32, P.alt, 0.16 + lunge * 0.1));
    // poszarpane macki płaszcza
    const tg = ctx.createLinearGradient(0, y + s * 0.08, 0, y + s * 0.62);
    tg.addColorStop(0, '#1a0414'); tg.addColorStop(1, 'rgba(10,0,14,0)');
    ctx.fillStyle = tg;
    for (let i = 0; i < 9; i++) {
      const pts = tentacle(x + (i - 4) * s * 0.052, y + s * 0.1, Math.PI / 2 + (i - 4) * 0.13, s * (0.42 + 0.12 * Math.sin(i * 7.3)), t, i * 1.3 + m.phase, 0.13);
      ribbon(pts, s * 0.065, s * 0.004); ctx.fill();
    }
    // ramiona ze stawowymi szponami
    const reach = 0.3 + near * 0.1 + lunge * 0.24, raise = lunge * 0.28;
    for (const d of [-1, 1]) {
      const sh = [x + d * s * 0.17 + sway, y - s * 0.3];
      const el = [x + d * s * (0.33 + lunge * 0.06), y - s * (0.16 + raise * 0.6) + Math.sin(t * 3 + d) * s * 0.02];
      const wr = [x + d * s * reach * 1.18, y + s * (0.04 - raise) + Math.sin(t * 2.6 + d * 2) * s * 0.02];
      const ag = ctx.createLinearGradient(sh[0], sh[1], wr[0], wr[1]);
      ag.addColorStop(0, '#16051a'); ag.addColorStop(1, '#070009');
      ctx.fillStyle = ag;
      ribbon([sh, [(sh[0] + el[0]) / 2, (sh[1] + el[1]) / 2 - s * 0.02], el], s * 0.085, s * 0.05); ctx.fill();
      ribbon([el, [(el[0] + wr[0]) / 2, (el[1] + wr[1]) / 2 - s * 0.01], wr], s * 0.055, s * 0.032); ctx.fill();
      lighter(() => {
        ctx.strokeStyle = rgba(P.rim, 0.55 + lunge * 0.3); ctx.lineWidth = Math.max(0.7, s * 0.006);
        polyline([sh, el, wr], 0, -s * 0.022); ctx.stroke();
      });
      const spread = 0.35 + lunge * 0.5 + Math.sin(t * 7 + m.phase + d) * 0.06;
      for (let k = 0; k < 4; k++) {
        const a0 = (d > 0 ? 0.15 : Math.PI - 0.15) + d * (k - 1.5) * spread * 0.55 + d * 0.6;
        const L = s * (0.13 + (k === 1 || k === 2 ? 0.03 : 0)) * (1 + lunge * 0.25);
        const pts = [];
        for (let j = 0; j < 5; j++) { const q = j / 4, a = a0 + d * q * q * 1.1; pts.push([wr[0] + Math.cos(a) * L * q, wr[1] + Math.sin(a) * L * q]); }
        const cg = ctx.createLinearGradient(wr[0], wr[1], pts[4][0], pts[4][1]);
        cg.addColorStop(0, '#1b0b12'); cg.addColorStop(0.6, '#cdb8a0'); cg.addColorStop(1, '#fff3de');
        ctx.fillStyle = cg; ribbon(pts, s * 0.026, s * 0.002); ctx.fill();
      }
    }
    // korpus / płaszcz z kinowym światłem konturowym
    const bodyPath = () => {
      ctx.beginPath();
      ctx.moveTo(x + sway, y - s * 0.56);
      ctx.bezierCurveTo(x + s * 0.14 + sway, y - s * 0.54, x + s * 0.17 + sway, y - s * 0.43, x + s * 0.19, y - s * 0.36);
      ctx.bezierCurveTo(x + s * 0.31, y - s * 0.33, x + s * 0.27, y - s * 0.1, x + s * 0.24, y + s * 0.17);
      for (let j = 1; j < 8; j++) ctx.lineTo(x + s * 0.24 - j * s * 0.06, y + s * (0.17 + (j % 2 ? 0.08 + 0.02 * Math.sin(t * 4 + j) : 0.01)));
      ctx.bezierCurveTo(x - s * 0.27, y - s * 0.1, x - s * 0.31, y - s * 0.33, x - s * 0.19, y - s * 0.36);
      ctx.bezierCurveTo(x - s * 0.17 + sway, y - s * 0.43, x - s * 0.14 + sway, y - s * 0.54, x + sway, y - s * 0.56);
      ctx.closePath();
    };
    const rg = ctx.createLinearGradient(x - s * 0.3, 0, x + s * 0.3, 0);
    rg.addColorStop(0, rgba(P.rim, 0.95)); rg.addColorStop(0.3, '#2a0820'); rg.addColorStop(0.7, '#2a0820'); rg.addColorStop(1, rgba(P.alt, 0.95));
    ctx.fillStyle = rg; bodyPath(); ctx.fill();
    ctx.save(); ctx.translate(x, y - s * 0.18 + s * 0.016); ctx.scale(0.95, 0.965); ctx.translate(-x, -(y - s * 0.18));
    const bg = ctx.createRadialGradient(x, y - s * 0.22, s * 0.02, x, y - s * 0.1, s * 0.42);
    bg.addColorStop(0, '#2c0c2a'); bg.addColorStop(0.5, '#0d0212'); bg.addColorStop(1, '#030006');
    ctx.fillStyle = bg; bodyPath(); ctx.fill(); ctx.restore();
    // płyty pancerza / żebra (oddychanie)
    if (lod) {
      for (let i = 0; i < 4; i++) {
        const py = y - s * 0.16 + i * s * 0.062, pw = s * (0.17 - i * 0.022) * (1 + breathe * 0.03);
        ctx.strokeStyle = 'rgba(0,0,0,.85)'; ctx.lineWidth = Math.max(1, s * 0.016);
        ctx.beginPath(); ctx.moveTo(x - pw, py); ctx.quadraticCurveTo(x, py + s * 0.05, x + pw, py); ctx.stroke();
        lighter(() => { ctx.strokeStyle = rgba(P.rim, 0.3); ctx.lineWidth = Math.max(0.6, s * 0.004); ctx.beginPath(); ctx.moveTo(x - pw, py - s * 0.008); ctx.quadraticCurveTo(x, py + s * 0.042, x + pw, py - s * 0.008); ctx.stroke(); });
      }
    }
    // rdzeń energii i żyły magmy
    const pulse = 0.6 + 0.4 * Math.sin(t * 5 + m.phase) + lunge * 0.4;
    const cx = x + sway * 0.5, cy = y - s * 0.1;
    lighter(() => {
      if (m.veins) {
        ctx.lineCap = 'round';
        for (const [lw, al] of [[0.018, 0.18], [0.006, 0.7]]) {
          ctx.strokeStyle = rgba(P.core, al * pulse); ctx.lineWidth = Math.max(0.6, s * lw);
          for (const v of m.veins) { ctx.beginPath(); ctx.moveTo(cx, cy); for (let j = 1; j < v.length; j++) ctx.lineTo(cx + v[j][0] * s, cy + v[j][1] * s); ctx.stroke(); }
        }
      }
      glow(cx, cy, s * 0.17 * (1 + lunge * 0.6), P.core, 0.6 * pulse);
      glow(cx, cy, s * 0.04, P.hot, 0.9);
    });
    // głowa: kaptur, rogi, czaszkowata twarz
    for (const d of [-1, 1]) {
      const hp = [[x + d * s * 0.08 + sway, y - s * 0.46], [x + d * s * 0.16 + sway, y - s * 0.55], [x + d * s * 0.17 + sway, y - s * 0.63], [x + d * s * 0.13 + sway, y - s * 0.69]];
      ctx.fillStyle = '#0c020e'; ribbon(hp, s * 0.05, s * 0.002); ctx.fill();
      lighter(() => { ctx.strokeStyle = rgba(d < 0 ? P.rim : P.alt, 0.6); ctx.lineWidth = Math.max(0.6, s * 0.005); polyline(hp, -d * s * 0.008, 0); ctx.stroke(); });
    }
    const fxc = x + sway, fyc = y - s * 0.31;
    const fg = ctx.createRadialGradient(fxc, fyc - s * 0.03, 0, fxc, fyc, s * 0.13);
    fg.addColorStop(0, '#1d0614'); fg.addColorStop(0.7, '#050006'); fg.addColorStop(1, '#000');
    ctx.fillStyle = fg; ctx.beginPath(); ctx.ellipse(fxc, fyc, s * 0.105, s * 0.125, 0, 0, 6.28); ctx.fill();
    if (lod) lighter(() => {
      ctx.strokeStyle = rgba(P.rim, 0.35); ctx.lineWidth = Math.max(0.6, s * 0.004);
      for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(fxc + d * s * 0.03, fyc - s * 0.085); ctx.quadraticCurveTo(fxc + d * s * 0.1, fyc - s * 0.06, fxc + d * s * 0.085, fyc + s * 0.02); ctx.stroke(); }
    });
    const blink = (Math.sin(t * 0.9 + m.phase * 3) > 0.97 && lunge < 0.2) ? 0.15 : 1;
    const inten = 1 + lunge * 1.2 + m.flare * 2.5 + near * 0.3;
    for (const d of [-1, 1]) predatorEye(fxc + d * s * 0.048, fyc - s * 0.035, s * 0.034, s * 0.017 * (1 + near * 0.3), d * -0.35, P, inten, blink, lod);
    const snarl = Math.max(0, Math.sin(t * 1.3 + m.phase) - 0.75) * 2;
    fangedMouth(fxc, fyc + s * 0.045, s * 0.11, clamp(0.08 + near * 0.15 + lunge * 0.8 + snarl * 0.3, 0, 1), P, t, m.phase, lod, 'rgba(255,190,170,.55)');
  }

  function drawOko(m, x, y, s, t, fx) {
    const P = PAL.oko, r = s * 0.5, lunge = fx.lunge, lod = fx.lod;
    // macki z przyssawkami
    for (let i = 0; i < 8; i++) {
      const a = Math.PI * (0.18 + i * 0.09), bx = x + Math.cos(a) * r * 0.75, by = y + Math.sin(a) * r * 0.75;
      const pts = tentacle(bx, by, a + Math.sin(t + i) * 0.15, r * (1.4 + 0.3 * Math.sin(i * 3.1)), t, i * 1.7 + m.phase, 0.18 + lunge * 0.1);
      const g = ctx.createLinearGradient(bx, by, pts[8][0], pts[8][1]);
      g.addColorStop(0, '#2a0c3c'); g.addColorStop(1, 'rgba(20,4,30,.2)');
      ctx.fillStyle = g; ribbon(pts, r * 0.2, r * 0.015); ctx.fill();
      lighter(() => {
        ctx.strokeStyle = rgba(P.rim, 0.35); ctx.lineWidth = Math.max(0.6, r * 0.02); polyline(pts, -r * 0.03, -r * 0.02); ctx.stroke();
        if (lod) for (let j = 2; j < 8; j += 2) glow(pts[j][0], pts[j][1], r * 0.05, P.alt, 0.5);
        glow(pts[8][0], pts[8][1], r * 0.09, P.alt, 0.6);
      });
    }
    // chitynowe płyty pancerza otwierające się przed atakiem
    for (let i = 0; i < 9; i++) {
      const a = i / 9 * 6.28 + t * 0.25 + m.phase, open = 0.25 + lunge * 0.75 + 0.08 * Math.sin(t * 2 + i);
      const ri = r * 0.82, ro = r * (1.3 + open * 0.35), wa = 0.3;
      const p1 = [x + Math.cos(a - wa) * ri, y + Math.sin(a - wa) * ri], p2 = [x + Math.cos(a + wa) * ri, y + Math.sin(a + wa) * ri];
      const tip = [x + Math.cos(a) * ro, y + Math.sin(a) * ro];
      const b1 = [x + Math.cos(a - wa * 0.9) * ro * 0.9, y + Math.sin(a - wa * 0.9) * ro * 0.9], b2 = [x + Math.cos(a + wa * 0.9) * ro * 0.9, y + Math.sin(a + wa * 0.9) * ro * 0.9];
      const g = ctx.createLinearGradient(x, y, tip[0], tip[1]);
      g.addColorStop(0.5, '#22102f'); g.addColorStop(1, '#06020b');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(p1[0], p1[1]); ctx.quadraticCurveTo(b1[0], b1[1], tip[0], tip[1]); ctx.quadraticCurveTo(b2[0], b2[1], p2[0], p2[1]); ctx.closePath(); ctx.fill();
      lighter(() => {
        ctx.strokeStyle = rgba(i % 2 ? P.alt : P.rim, 0.55 + lunge * 0.3); ctx.lineWidth = Math.max(0.6, r * 0.025);
        ctx.beginPath(); ctx.moveTo(b1[0], b1[1]); ctx.quadraticCurveTo(b1[0] * 0.3 + tip[0] * 0.7, b1[1] * 0.3 + tip[1] * 0.7, tip[0], tip[1]); ctx.stroke();
        if (lod) { ctx.strokeStyle = rgba(P.core, 0.35 + 0.25 * Math.sin(t * 4 + i)); ctx.lineWidth = Math.max(0.5, r * 0.012); ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * ri, y + Math.sin(a) * ri); ctx.lineTo(tip[0] * 0.85 + x * 0.15, tip[1] * 0.85 + y * 0.15); ctx.stroke(); }
      });
    }
    ctx.fillStyle = '#040007'; ctx.beginPath(); ctx.arc(x, y, r * 1.04, 0, 6.28); ctx.fill();
    // gałka oczna z rozproszeniem podpowierzchniowym
    let g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.05, x, y, r);
    g.addColorStop(0, '#fff2f2'); g.addColorStop(0.5, '#e9b8c8'); g.addColorStop(0.85, '#7a2246'); g.addColorStop(1, '#2a0516');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.28); ctx.fill();
    if (lod) {
      ctx.strokeStyle = 'rgba(170,10,40,.55)'; ctx.lineWidth = Math.max(0.6, r * 0.022);
      for (let i = 0; i < 10; i++) {
        const a = i / 10 * 6.28 + m.phase; ctx.beginPath();
        ctx.moveTo(x + Math.cos(a) * r * 0.97, y + Math.sin(a) * r * 0.97);
        ctx.quadraticCurveTo(x + Math.cos(a + 0.35) * r * 0.75, y + Math.sin(a + 0.35) * r * 0.75, x + Math.cos(a + 0.1) * r * 0.55, y + Math.sin(a + 0.1) * r * 0.55);
        ctx.stroke();
      }
    }
    // tęczówka śledząca gracza
    const lx = clamp((W / 2 - x) / W, -0.5, 0.5) * r * 0.5, ly = clamp((H / 2 - y) / H, -0.5, 0.5) * r * 0.5;
    const ix = x + lx, iy = y + ly, ri = r * 0.5;
    g = ctx.createRadialGradient(ix, iy, 0, ix, iy, ri);
    g.addColorStop(0, '#fff6c8'); g.addColorStop(0.28, '#ffb020'); g.addColorStop(0.62, '#ff4a00'); g.addColorStop(0.9, '#5a0010'); g.addColorStop(1, '#1a0006');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ix, iy, ri, 0, 6.28); ctx.fill();
    if (lod) lighter(() => {
      ctx.strokeStyle = rgba(P.core, 0.3); ctx.lineWidth = Math.max(0.5, r * 0.012);
      ctx.beginPath(); for (let i = 0; i < 18; i++) { const a = i / 18 * 6.28 + t * 0.3; ctx.moveTo(ix + Math.cos(a) * ri * 0.22, iy + Math.sin(a) * ri * 0.22); ctx.lineTo(ix + Math.cos(a) * ri * 0.88, iy + Math.sin(a) * ri * 0.88); } ctx.stroke();
    });
    const dil = Math.max(0.025, 0.085 + 0.04 * Math.sin(t * 2.5 + m.phase) - lunge * 0.06);
    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(ix, iy, r * dil, ri * 0.8, 0, 0, 6.28); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.beginPath(); ctx.ellipse(x - r * 0.38, y - r * 0.42, r * 0.17, r * 0.09, -0.6, 0, 6.28); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.beginPath(); ctx.arc(x + r * 0.3, y + r * 0.35, r * 0.04, 0, 6.28); ctx.fill();
    const inten = 1 + lunge * 1.4 + m.flare * 2.5;
    lighter(() => {
      glow(ix, iy, r * 1.3 * inten, P.core, 0.3 + lunge * 0.35);
      ctx.save(); ctx.translate(ix, iy); ctx.scale(1, 0.05); glow(0, 0, r * 3.6 * inten, P.core, 0.5); ctx.restore();
      ctx.save(); ctx.translate(ix, iy); ctx.scale(0.05, 1); glow(0, 0, r * 1.6 * inten, P.alt, 0.25); ctx.restore();
      if (lod) for (let k = 1; k <= 3; k++) { // duchy flary w stronę środka kadru
        const gx = ix + (W / 2 - ix) * k * 0.35, gy = iy + (H / 2 - iy) * k * 0.35;
        glow(gx, gy, r * (0.12 + k * 0.06), k % 2 ? P.alt : P.core, 0.12 * inten);
      }
      for (let k = 0; k < 5; k++) { const a = t * 1.4 + k * 1.256 + m.phase; glow(x + Math.cos(a) * r * 1.65, y + Math.sin(a) * r * 1.1, r * 0.08, P.alt, 0.6); }
    });
    // powieka
    const bl = lunge > 0.2 ? 0 : Math.max(0, Math.sin(t * 0.7 + m.phase * 2) - 0.94) * 16;
    if (bl > 0) { ctx.fillStyle = '#2a0c3a'; ctx.beginPath(); ctx.ellipse(x, y - r * (1 - bl), r * 1.03, r * bl, 0, 0, 6.28); ctx.fill(); }
    // paszcza pod okiem – rozwiera się przed atakiem
    fangedMouth(x, y + r * 1.02, r * 0.8, clamp(0.1 + lunge * 0.9 + Math.max(0, Math.sin(t * 1.1 + m.phase) - 0.8) * 1.5, 0, 1), P, t, m.phase, lod, 'rgba(255,200,120,.5)');
  }

  function drawPelz(m, x, y, s, t, fx) {
    const P = PAL.pelz, lunge = fx.lunge, lod = fx.lod;
    const w = s * 0.55, h = s * 0.28, gait = t * 14 + m.phase;
    const rear = lunge * h * 0.9; y -= rear;
    // stawowe odnóża z kolcami
    ctx.lineCap = 'round';
    for (let i = 0; i < 4; i++) for (const d of [-1, 1]) {
      const ph = gait + i * 1.6 + (d > 0 ? 3.14 : 0), lift = Math.max(0, Math.sin(ph)) * h * 0.6;
      const front = i === 3 ? lunge : 0;
      const bx = x + d * w * 0.35, by = y + (i - 1.5) * h * 0.2;
      const kx = bx + d * w * (0.55 + i * 0.08), ky = by - h * (0.95 + front * 0.8) - lift;
      const fx2 = bx + d * w * (0.95 + i * 0.12 - front * 0.4) + Math.cos(ph) * w * 0.1, fy = y + rear + h * 0.85 - lift * 0.3 - front * h * 1.6;
      ctx.fillStyle = '#0b160a';
      ribbon([[bx, by], [(bx + kx) / 2, (by + ky) / 2 - h * 0.08], [kx, ky]], s * 0.05, s * 0.032); ctx.fill();
      ribbon([[kx, ky], [(kx + fx2) / 2 + d * w * 0.04, (ky + fy) / 2], [fx2, fy]], s * 0.032, s * 0.003); ctx.fill();
      lighter(() => { ctx.strokeStyle = rgba(i % 2 ? P.rim : P.alt, 0.5); ctx.lineWidth = Math.max(0.6, s * 0.006); polyline([[bx, by], [kx, ky], [fx2, fy]], 0, -s * 0.012); ctx.stroke(); });
      if (lod) { ctx.fillStyle = '#1a2a12'; ctx.beginPath(); ctx.moveTo(kx - s * 0.012, ky); ctx.lineTo(kx + d * s * 0.02, ky - s * 0.05); ctx.lineTo(kx + s * 0.012, ky); ctx.fill(); }
    }
    // pancerz z segmentów
    for (let i = 0; i < 4; i++) {
      const cy = y - h * 0.6 + i * h * 0.32, rx = w * (0.4 + i * 0.06), ry = h * (0.42 + i * 0.04) * (1 + Math.sin(t * 3 + i) * 0.02);
      const g = ctx.createRadialGradient(x - rx * 0.2, cy - ry * 0.5, ry * 0.1, x, cy, rx);
      g.addColorStop(0, '#3c5e2a'); g.addColorStop(0.55, '#12210c'); g.addColorStop(1, '#030702');
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, cy, rx, ry, 0, 0, 6.28); ctx.fill();
      lighter(() => { ctx.strokeStyle = rgba(P.rim, 0.55); ctx.lineWidth = Math.max(0.6, s * 0.01); ctx.beginPath(); ctx.ellipse(x, cy, rx * 0.97, ry * 0.94, 0, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke(); });
      if (lod) for (const k of [-1, 0, 1]) {
        const sx = x + k * rx * 0.45, sy = cy - ry * (0.85 - Math.abs(k) * 0.15);
        ctx.fillStyle = '#0a1407'; ctx.beginPath(); ctx.moveTo(sx - s * 0.018, sy + s * 0.01); ctx.lineTo(sx + k * s * 0.01, sy - s * 0.06); ctx.lineTo(sx + s * 0.018, sy + s * 0.01); ctx.fill();
      }
    }
    // świecące żyły bio-plazmy
    const pulse = 0.55 + 0.45 * Math.sin(t * 6 + m.phase) + lunge * 0.4;
    lighter(() => {
      ctx.strokeStyle = rgba(P.core, 0.55 * pulse); ctx.lineWidth = Math.max(0.6, s * 0.007);
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const sx = x + (i - 2) * w * 0.14; ctx.moveTo(sx, y - h * 0.8);
        for (let j = 1; j <= 4; j++) ctx.lineTo(sx + Math.sin(i * 3 + j * 1.7) * w * 0.06, y - h * 0.8 + j * h * 0.3);
      }
      ctx.stroke();
      glow(x, y - h * 0.1, w * 0.5, P.core, 0.18 * pulse);
    });
    // głowa
    const hy = y + h * 0.55;
    let g = ctx.createRadialGradient(x, hy - h * 0.2, 0, x, hy, w * 0.4);
    g.addColorStop(0, '#2e4a20'); g.addColorStop(1, '#040803');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, hy, w * 0.36, h * 0.45, 0, 0, 6.28); ctx.fill();
    // żuwaczki
    const snap = Math.abs(Math.sin(t * 8 + m.phase)) * 0.25, spread = 0.2 + snap + lunge * 0.55;
    for (const d of [-1, 1]) {
      const b = [x + d * w * 0.2, hy + h * 0.25];
      const pts = [b, [b[0] + d * w * (0.2 + spread * 0.3), b[1] + h * 0.35], [b[0] + d * w * (0.15 + spread * 0.25), b[1] + h * 0.8], [x + d * w * (0.04 + spread * 0.12), b[1] + h * (1.05 + lunge * 0.2)]];
      const mg = ctx.createLinearGradient(b[0], b[1], pts[3][0], pts[3][1]);
      mg.addColorStop(0, '#2a3e1a'); mg.addColorStop(0.6, '#cfe8a8'); mg.addColorStop(1, '#f4ffe4');
      ctx.fillStyle = mg; ribbon(pts, s * 0.06, s * 0.003); ctx.fill();
      lighter(() => { ctx.strokeStyle = rgba(P.alt, 0.45); ctx.lineWidth = Math.max(0.5, s * 0.005); polyline(pts, -d * s * 0.01, 0); ctx.stroke(); });
    }
    fangedMouth(x, hy + h * 0.45, w * 0.34, clamp(0.12 + lunge * 0.88 + snap * 0.5, 0, 1), P, t, m.phase, lod, 'rgba(170,255,120,.6)');
    // krople kwasu
    if (lod) lighter(() => { for (let k = 0; k < 2; k++) { const q = (t * 1.3 + k * 0.5 + m.phase) % 1; glow(x + (k - 0.5) * w * 0.12, hy + h * (0.7 + q * 1.2), s * 0.025, P.core, 0.7 * (1 - q)); } });
    // gromada oczu
    const eyes = [[-0.2, 0.05, 0.06], [0.2, 0.05, 0.06], [-0.08, -0.1, 0.045], [0.08, -0.1, 0.045], [-0.32, -0.05, 0.035], [0.32, -0.05, 0.035], [0, 0.18, 0.03]];
    const inten = 1 + lunge * 1.2 + m.flare * 2.5;
    for (const [ex, ey, er] of eyes) {
      const px = x + ex * w, py = hy - h * 0.25 + ey * h * 1.6, rr = s * er * 0.85;
      ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(px, py, rr * 1.25, 0, 6.28); ctx.fill();
      const eg = ctx.createRadialGradient(px - rr * 0.3, py - rr * 0.3, 0, px, py, rr);
      eg.addColorStop(0, rgba(P.hot, 1)); eg.addColorStop(0.45, rgba(P.eye, 1)); eg.addColorStop(1, '#0d3a08');
      ctx.fillStyle = eg; ctx.beginPath(); ctx.arc(px, py, rr, 0, 6.28); ctx.fill();
      if (lod) { ctx.fillStyle = 'rgba(0,0,0,.85)'; ctx.beginPath(); ctx.ellipse(px, py, rr * 0.18, rr * 0.75, 0, 0, 6.28); ctx.fill(); }
      lighter(() => glow(px, py, rr * 3 * inten, P.eye, 0.4 * Math.min(inten, 2)));
    }
    if (lod || lunge > 0.3) lighter(() => { ctx.save(); ctx.translate(x, hy - h * 0.2); ctx.scale(1, 0.06); glow(0, 0, w * 1.4 * inten, P.eye, 0.35); ctx.restore(); });
  }

  function drawMonster(m) {
    const T = TYPES[m.type];
    const el = monsterEl(m);
    const p = project(m.az, el);
    m.screen = null;
    if (!p) return;
    const d = Math.max(m.dist, 0.5);
    let s = (T.size / d) * F;
    const t = game.t;
    let jx = 0, jy = 0;
    if (m.dist < 3.5) { const k = (3.5 - m.dist) / 3.5; jx = rand(-1, 1) * s * 0.015 * k; jy = rand(-1, 1) * s * 0.015 * k; }
    let x = p.x + jx, y = p.y + jy;
    if (x < -s * 2 || x > W + s * 2 || y < -s * 2 || y > H + s * 2) return;
    const fadeIn = clamp((t - m.born) / 0.8, 0, 1);
    const fog = clamp(1 - (m.dist - 12) / 12, 0.35, 1);
    const fx = { near: clamp(1 - m.dist / 6, 0, 1), lunge: monsterLunge(m), lod: s > 70 };
    const P = PAL[m.type];
    const gp = project(m.az, Math.atan2(-EYE_H, d) / DEG);
    ctx.save(); ctx.globalAlpha = fadeIn * fog;
    drawAura(m, x, y, s, gp, P, fx);
    // odrzut po trafieniu
    if (m.recoil > 0) { const k = m.recoil; ctx.translate(x, y); ctx.scale(1 - k * 0.07, 1 - k * 0.07); ctx.translate(-x, -y - k * s * 0.04); }
    if (m.type === 'cien') drawCien(m, x, y, s, t, fx);
    else if (m.type === 'oko') drawOko(m, x, y, s, t, fx);
    else drawPelz(m, x, y, s, t, fx);
    // atmosfera dali: odległe stwory toną w zimnej mgle (głębia ostrości)
    if (m.dist > 9) lighter(() => glow(x, y, s * 0.7, [70, 40, 110], clamp((m.dist - 9) / 12, 0, 0.35)));
    ctx.restore();
    const r = m.type === 'cien' ? s * 0.32 : m.type === 'oko' ? s * 0.62 : s * 0.42;
    m.screen = { x, y, r: Math.max(r, 16) };
    // błysk trafienia (pancerz rozbłyskuje)
    if (m.flash > 0) lighter(() => { const k = m.flash / 0.12; glow(x, y, r * 1.6, [255, 255, 255], 0.9 * k); glow(x, y, r * 2.4, P.rim, 0.5 * k); });
    if (m.maxHp > 1) {
      const bw = clamp(r * 1.4, 34, 160), bh = clamp(r * 0.08, 4, 8), by = y - (m.type === 'cien' ? s * 0.74 : r * 1.65);
      ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(x - bw / 2 - 1, by - 1, bw + 2, bh + 2);
      ctx.fillStyle = m.type === 'oko' ? '#c084ff' : '#ff2d4a'; ctx.fillRect(x - bw / 2, by, bw * (m.hp / m.maxHp), bh);
    }
    if (m.dist < 8) {
      ctx.font = `700 ${clamp(r * 0.18, 11, 16)}px system-ui,sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255,90,110,.9)'; ctx.fillText(`${m.dist.toFixed(1)} m`, x, y + r * 1.25 + 12);
    }
  }

  // ---------- Efekty ekranowe ataku ----------
  function chromaEdge(k, c) {
    if (k <= 0.01) return;
    const R0 = Math.min(W, H) * 0.32, R1 = Math.hypot(W, H) * 0.56;
    lighter(() => {
      let g = ctx.createRadialGradient(W / 2, H / 2, R0, W / 2, H / 2, R1);
      g.addColorStop(0, rgba(c, 0)); g.addColorStop(1, rgba(c, 0.75 * k));
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      g = ctx.createRadialGradient(W / 2 + 6, H / 2, R0, W / 2 + 6, H / 2, R1 * 0.97);
      g.addColorStop(0, 'rgba(0,220,255,0)'); g.addColorStop(0.82, 'rgba(0,220,255,0)'); g.addColorStop(0.92, `rgba(0,220,255,${0.3 * k})`); g.addColorStop(1, 'rgba(0,220,255,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    });
  }
  function drawStrike(st) {
    const k = 1 - st.life / st.max, a = st.life / st.max, P = PAL[st.type];
    if (st.type === 'cien') { // ślady pazurów na „obiektywie”
      const sweep = clamp(k / 0.16, 0, 1);
      for (let i = 0; i < 4; i++) {
        const ox = (i - 1.5) * W * 0.14, x0 = W * 0.22 + ox, y0 = H * 0.2 + i * H * 0.02, x1 = W * 0.78 + ox, y1 = H * 0.76 + i * H * 0.02;
        const ex = x0 + (x1 - x0) * sweep, ey = y0 + (y1 - y0) * sweep, nx = -(ey - y0), ny = ex - x0, nl = Math.hypot(nx, ny) || 1;
        const shape = (wd) => { const cx = (x0 + ex) / 2, cy = (y0 + ey) / 2; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(cx + nx / nl * wd, cy + ny / nl * wd, ex, ey); ctx.quadraticCurveTo(cx - nx / nl * wd * 0.3, cy - ny / nl * wd * 0.3, x0, y0); ctx.fill(); };
        ctx.fillStyle = `rgba(50,0,8,${0.7 * a})`; shape(W * 0.04);
        lighter(() => { ctx.fillStyle = rgba(P.rim, a); shape(W * 0.028); if (k < 0.4) { ctx.fillStyle = `rgba(255,240,220,${(0.4 - k) * 2.5})`; shape(W * 0.01); } });
      }
      lighter(() => { ctx.fillStyle = rgba(P.rim, Math.pow(a, 3) * 0.35); ctx.fillRect(0, 0, W, H); });
    } else if (st.type === 'pelz') { // ugryzienie kłami
      const close = k < 0.18 ? k / 0.18 : 1, n = 9, fl = H * 0.2 * close;
      ctx.globalAlpha = a;
      const fg = ctx.createLinearGradient(0, 0, 0, fl);
      fg.addColorStop(0, '#1a2a10'); fg.addColorStop(0.4, '#cfe8b0'); fg.addColorStop(1, '#fbfff0');
      for (const top of [true, false]) {
        ctx.save(); if (!top) { ctx.translate(0, H); ctx.scale(1, -1); }
        ctx.fillStyle = 'rgba(8,16,4,.9)'; ctx.fillRect(0, 0, W, H * 0.05 * close);
        ctx.fillStyle = fg; ctx.beginPath();
        for (let i = 0; i < n; i++) {
          const x0 = i * W / n, x1 = x0 + W / n, L = fl * (0.7 + 0.3 * Math.abs(Math.sin(i * 5.3))) * (i === 1 || i === n - 2 ? 1.25 : 1);
          ctx.moveTo(x0, 0); ctx.lineTo((x0 + x1) / 2 + (top ? 0 : W / n * 0.25), L); ctx.lineTo(x1, 0);
        }
        ctx.fill(); ctx.restore();
      }
      ctx.globalAlpha = 1;
      lighter(() => { ctx.fillStyle = rgba(P.rim, Math.pow(a, 3) * 0.3); ctx.fillRect(0, 0, W, H); });
    } else { // wybuch plazmy
      const R = k * Math.hypot(W, H) * 0.7;
      lighter(() => {
        const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.7);
        g.addColorStop(0, `rgba(255,255,255,${Math.pow(a, 2) * 0.7})`); g.addColorStop(0.4, rgba(P.rim, Math.pow(a, 2) * 0.45)); g.addColorStop(1, rgba(P.rim, 0));
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        ctx.lineWidth = 10 * a + 2;
        [[255, 60, 90, -6], [80, 220, 255, 6], [190, 110, 255, 0]].forEach(([r0, g0, b0, o]) => {
          ctx.strokeStyle = `rgba(${r0},${g0},${b0},${0.6 * a})`; ctx.beginPath(); ctx.arc(W / 2 + o, H / 2, R, 0, 6.28); ctx.stroke();
        });
      });
    }
    chromaEdge(a, P.rim);
  }

  function render(dt) {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);
    if (!game.running && !game.over) {
      if (simBg) { game.t += dt; view.yaw += dt * 4; view.targetYaw = view.yaw; drawWorldBg(); }
      return;
    }
    ctx.save();
    if (game.shake > 0 && !game.paused) { const a = game.shake * 18; ctx.translate(rand(-a, a), rand(-a, a)); }
    if (simBg) drawWorldBg();
    else { // lekki filtr klimatu na obrazie z kamery
      const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.75);
      g.addColorStop(0, 'rgba(20,0,30,0)'); g.addColorStop(1, 'rgba(15,0,25,.55)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    // stwory – od najdalszych
    const sorted = game.monsters.slice().sort((a, b) => b.dist - a.dist);
    for (const m of sorted) drawMonster(m);
    // cząsteczki: dym i odłamki cienia (zwykłe mieszanie)
    for (const p of game.particles) {
      if (p.kind !== 'smoke' && p.kind !== 'shard') continue;
      const s = project(p.az, p.el); if (!s) continue;
      const k = clamp(p.life / p.max, 0, 1);
      if (p.kind === 'smoke') {
        const r = p.size * (1 + (1 - k) * 2.2);
        const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, r);
        g.addColorStop(0, `rgba(10,2,16,${0.5 * k})`); g.addColorStop(1, 'rgba(10,2,16,0)');
        ctx.fillStyle = g; ctx.fillRect(s.x - r, s.y - r, r * 2, r * 2);
      } else {
        ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(p.rot); ctx.globalAlpha = k;
        ctx.fillStyle = '#0a0210'; ctx.beginPath(); ctx.moveTo(0, -p.size); ctx.lineTo(p.size * 0.6, p.size * 0.7); ctx.lineTo(-p.size * 0.5, p.size * 0.4); ctx.closePath(); ctx.fill();
        ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = p.color; ctx.lineWidth = 1.2; ctx.stroke();
        ctx.restore();
      }
    }
    // cząsteczki świetlne
    ctx.globalCompositeOperation = 'lighter';
    const pxPerDeg = F * DEG;
    for (const p of game.particles) {
      if (p.kind === 'smoke' || p.kind === 'shard') continue;
      const s = project(p.az, p.el); if (!s) continue;
      const k = clamp(p.life / p.max, 0, 1);
      if (p.kind === 'spark') {
        ctx.globalAlpha = k; ctx.strokeStyle = p.color; ctx.lineWidth = p.size * 0.55; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(s.x - p.vaz * pxPerDeg * 0.05, s.y + p.vel * pxPerDeg * 0.05); ctx.lineTo(s.x, s.y); ctx.stroke();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = Math.max(0.6, p.size * 0.2); ctx.stroke();
      } else if (p.kind === 'ember') {
        const fl = 0.6 + 0.4 * Math.sin(game.t * 20 + p.rot * 7);
        ctx.globalAlpha = 1; glow(s.x, s.y, p.size * 3.2, p.rgb || [255, 140, 40], 0.45 * k * fl);
        ctx.globalAlpha = k * fl; ctx.fillStyle = '#fff1c8'; ctx.beginPath(); ctx.arc(s.x, s.y, Math.max(0.6, p.size * 0.45), 0, 6.28); ctx.fill();
      } else {
        ctx.globalAlpha = k; ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(s.x, s.y, p.size, 0, 6.28); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    // fale uderzeniowe i implozje
    for (const f of game.fx) {
      const s = project(f.az, f.el); if (!s) continue;
      const k = 1 - f.life / f.max;
      if (f.kind === 'implode') {
        if (k < 0.22) { const q = k / 0.22; glow(s.x, s.y, f.r * (1.2 - q), [255, 255, 255], 0.9); glow(s.x, s.y, f.r * (2 - q * 1.4), f.rgb, 0.8); }
        else {
          const q = (k - 0.22) / 0.78, a = 1 - q;
          glow(s.x, s.y, f.r * (0.6 + q * 1.2), f.rgb, 0.6 * a * a);
          ctx.strokeStyle = rgba(f.rgb, a); ctx.lineWidth = Math.max(1, f.r * 0.12 * a);
          ctx.beginPath(); ctx.arc(s.x, s.y, f.r * (0.3 + q * 3.2), 0, 6.28); ctx.stroke();
          ctx.strokeStyle = `rgba(255,255,255,${a * 0.8})`; ctx.lineWidth = Math.max(0.8, f.r * 0.04 * a); ctx.stroke();
          ctx.strokeStyle = rgba([80, 220, 255], a * 0.5); ctx.lineWidth = Math.max(0.8, f.r * 0.05 * a);
          ctx.beginPath(); ctx.arc(s.x + 3, s.y, f.r * (0.25 + q * 2.6), 0, 6.28); ctx.stroke();
        }
      } else { // pierścień trafienia
        const a = 1 - k;
        ctx.strokeStyle = rgba(f.rgb, a); ctx.lineWidth = Math.max(1, 5 * a);
        ctx.beginPath(); ctx.arc(s.x, s.y, f.r * (0.4 + k * 1.6), 0, 6.28); ctx.stroke();
        ctx.strokeStyle = `rgba(255,255,255,${a})`; ctx.lineWidth = Math.max(0.6, 1.6 * a); ctx.stroke();
      }
    }
    // promienie lasera
    for (const b of game.beams) {
      const k = b.life / b.max;
      ctx.globalAlpha = k;
      ctx.strokeStyle = 'rgba(255,60,100,.8)'; ctx.lineWidth = 10 * k + 2;
      ctx.beginPath(); ctx.moveTo(b.x0, b.y0); ctx.lineTo(b.x1, b.y1); ctx.stroke();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 3 * k + 1; ctx.stroke();
      const g = ctx.createRadialGradient(b.x1, b.y1, 0, b.x1, b.y1, 40);
      g.addColorStop(0, 'rgba(255,200,220,.9)'); g.addColorStop(1, 'rgba(255,60,100,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(b.x1, b.y1, 40, 0, 6.28); ctx.fill();
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    // zapowiedź ataku: pulsująca chromatyczna poświata krawędzi
    let tele = 0, teleC = PAL.cien.rim;
    for (const m of game.monsters) { const l = monsterLunge(m); if (l > tele) { tele = l; teleC = PAL[m.type].rim; } }
    if (tele > 0 && !game.strike) chromaEdge(tele * 0.55 * (0.7 + 0.3 * Math.sin(performance.now() / 55)), teleC);
    if (game.strike && !game.paused && (game.strike.life -= dt) <= 0) game.strike = null;
    if (game.strike) drawStrike(game.strike);
    // punkty
    ctx.textAlign = 'center';
    for (const f of game.floaters) {
      const s = project(f.az, f.el); if (!s) continue;
      ctx.globalAlpha = clamp(f.life, 0, 1); ctx.font = '900 22px system-ui,sans-serif';
      ctx.fillStyle = '#ffd34d'; ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 4;
      ctx.strokeText(f.txt, s.x, s.y); ctx.fillText(f.txt, s.x, s.y);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
    updateOverlays();
    drawRadar();
  }

  // Ostrzeżenia krawędziowe, celownik, winieta
  function updateOverlays() {
    let L = 0, R = 0, B = 0, lock = false;
    const half = hfov() / 2;
    for (const m of game.monsters) {
      const dAz = wrap180(m.az - view.yaw);
      const danger = clamp(1 - (m.dist - 1.3) / 8, 0, 1);
      if (Math.abs(dAz) > half - 3 && danger > 0) { if (dAz < 0) L = Math.max(L, danger); else R = Math.max(R, danger); }
      else if (m.screen && m.screen.y > H && danger > 0) B = Math.max(B, danger);
      if (m.screen) { const dx = m.screen.x - W / 2, dy = m.screen.y - H / 2, r = m.screen.r * 1.1 + 30; if (dx * dx + dy * dy < r * r) lock = true; }
    }
    const pulse = 0.75 + 0.25 * Math.sin(performance.now() / 110);
    ui.edgeL.style.opacity = (L * pulse).toFixed(3);
    ui.edgeR.style.opacity = (R * pulse).toFixed(3);
    ui.edgeB.style.opacity = (B * pulse).toFixed(3);
    ui.cross.classList.toggle('lock', lock);
    const low = game.hp <= 30 ? 0.25 + 0.15 * Math.sin(performance.now() / 200) : 0;
    ui.vignette.style.opacity = Math.max(game.hurt, low).toFixed(3);
  }

  function drawRadar() {
    const S = radar.width, c = S / 2, R = c - 6;
    rctx.clearRect(0, 0, S, S);
    // tło
    let g = rctx.createRadialGradient(c, c, 0, c, c, R);
    g.addColorStop(0, 'rgba(40,6,30,.85)'); g.addColorStop(1, 'rgba(10,2,16,.85)');
    rctx.fillStyle = g; rctx.beginPath(); rctx.arc(c, c, R, 0, 6.28); rctx.fill();
    rctx.strokeStyle = 'rgba(255,45,74,.55)'; rctx.lineWidth = 3; rctx.stroke();
    rctx.strokeStyle = 'rgba(255,45,74,.18)'; rctx.lineWidth = 1.5;
    for (const k of [0.33, 0.66]) { rctx.beginPath(); rctx.arc(c, c, R * k, 0, 6.28); rctx.stroke(); }
    rctx.beginPath(); rctx.moveTo(c - R, c); rctx.lineTo(c + R, c); rctx.moveTo(c, c - R); rctx.lineTo(c, c + R); rctx.stroke();
    // stożek widzenia (zawsze w górę – radar obraca się z graczem)
    const half = hfov() / 2 * DEG;
    g = rctx.createRadialGradient(c, c, 0, c, c, R);
    g.addColorStop(0, 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(255,255,255,.04)');
    rctx.fillStyle = g; rctx.beginPath(); rctx.moveTo(c, c); rctx.arc(c, c, R, -Math.PI / 2 - half, -Math.PI / 2 + half); rctx.closePath(); rctx.fill();
    // omiatanie
    const sw = (performance.now() / 1400) % 1 * 6.28;
    rctx.strokeStyle = 'rgba(255,45,74,.35)'; rctx.lineWidth = 2;
    rctx.beginPath(); rctx.moveTo(c, c); rctx.lineTo(c + Math.cos(sw) * R, c + Math.sin(sw) * R); rctx.stroke();
    // północ
    const nA = (-view.yaw - 90) * DEG;
    rctx.fillStyle = 'rgba(200,180,255,.8)'; rctx.font = 'bold 20px system-ui,sans-serif'; rctx.textAlign = 'center'; rctx.textBaseline = 'middle';
    rctx.fillText('N', c + Math.cos(nA) * (R - 14), c + Math.sin(nA) * (R - 14));
    // stwory
    const pulse = 0.6 + 0.4 * Math.sin(performance.now() / 160);
    for (const m of game.monsters) {
      const a = (wrap180(m.az - view.yaw) - 90) * DEG, rr = clamp(m.dist / SPAWN_DIST, 0.06, 1) * (R - 8);
      const x = c + Math.cos(a) * rr, y = c + Math.sin(a) * rr, close = m.dist < 6;
      rctx.fillStyle = `rgba(255,40,70,${0.25 * pulse})`; rctx.beginPath(); rctx.arc(x, y, (close ? 16 : 11) * pulse + 3, 0, 6.28); rctx.fill();
      rctx.fillStyle = m.type === 'oko' ? '#d29bff' : m.type === 'pelz' ? '#a8ff7a' : '#ff2d4a';
      rctx.beginPath(); rctx.arc(x, y, close ? 8 : 6, 0, 6.28); rctx.fill();
    }
    rctx.fillStyle = '#fff'; rctx.beginPath(); rctx.arc(c, c, 5, 0, 6.28); rctx.fill();
  }

  // ---------- Tryby / start ----------
  let stream = null;
  async function startAR() {
    audio.unlock();
    ui.msg.textContent = 'Proszę o dostęp do kamery i czujników ruchu…';
    // iOS: requestPermission musi być wywołane synchronicznie w obsłudze kliknięcia
    let oriP = Promise.resolve('granted');
    try {
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        oriP = DeviceOrientationEvent.requestPermission().catch(() => 'denied');
      }
    } catch (e) { oriP = Promise.resolve('denied'); }
    let camP = Promise.resolve(null);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.isSecureContext !== false) {
      camP = (stream && stream.active ? Promise.resolve(stream) :
        navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false }))
        .catch((e) => { console.warn('Kamera niedostępna:', e && e.name); return null; });
    }
    const [ori, cam] = await Promise.all([oriP, camP]);
    audio.unlock(); // okno zgody iOS mogło przerwać AudioContext – spróbuj wznowić (kolejne stuknięcie i tak to naprawi)
    // kamera
    input.camera = false;
    if (cam) {
      stream = cam; video.srcObject = cam;
      try { await video.play(); } catch (e) {}
      video.classList.add('on'); input.camera = true;
    }
    // żyroskop – sprawdź, czy naprawdę przychodzą dane
    input.gyro = false;
    if (ori === 'granted' && 'DeviceOrientationEvent' in window) {
      if (!input.gyroSeen) await new Promise((res) => { const t0 = Date.now(); const iv = setInterval(() => { if (input.gyroSeen || Date.now() - t0 > 1500) { clearInterval(iv); res(); } }, 50); });
      input.gyro = input.gyroSeen;
    }
    const notes = [];
    if (!input.camera) notes.push('brak dostępu do kamery – tło nocnego lasu');
    if (!input.gyro) notes.push('brak żyroskopu – rozglądaj się przeciągając palcem');
    beginGame(notes.length ? 'Tryb mieszany: ' + notes.join(', ') + '.' : null);
  }

  function startSim() {
    audio.unlock();
    input.gyro = false; input.camera = false;
    video.classList.remove('on');
    beginGame(null);
  }

  function beginGame(note) {
    simBg = !input.camera;
    ui.mode.textContent = input.camera && input.gyro ? 'AR • żyroskop' : input.gyro ? 'żyroskop' : input.camera ? 'AR • przeciąganie' : 'symulacja';
    if (input.gyro && input.lastRawYaw != null) { view.targetYaw = view.yaw = input.lastRawYaw + (input.compassOff || 0); }
    else { view.targetYaw = view.yaw; }
    view.targetPitch = view.pitch = 0;
    Object.assign(game, { running: true, paused: false, over: false, t: 0, score: 0, wave: 0, kills: 0, combo: 1, bestCombo: 1, comboTimer: 0, hp: 100, toSpawn: 0, spawnTimer: 0, waveBreak: 0.6, shake: 0, hurt: 0 });
    game.monsters.length = 0; game.particles.length = 0; game.beams.length = 0; game.floaters.length = 0; game.fx.length = 0; game.strike = null;
    ui.score.textContent = '0'; ui.wave.textContent = '1'; ui.comboBox.classList.remove('on');
    updateHP();
    ui.start.classList.add('hidden'); ui.over.classList.add('hidden'); ui.pause.classList.add('hidden'); ui.hud.classList.remove('hidden');
    ui.msg.textContent = '';
    if (note) toast(note, 5000);
    audio.chime(); // potwierdzenie, że dźwięk działa (lub zaraz po pierwszym stuknięciu)
  }

  function gameOver() {
    game.running = false; game.over = true;
    audio.over();
    try { if (navigator.vibrate) navigator.vibrate([200, 80, 300]); } catch (_) {}
    const best = loadBest(), rec = game.score > best;
    if (rec) saveBest(game.score);
    ui.fScore.textContent = game.score; ui.fWave.textContent = game.wave; ui.fKills.textContent = game.kills; ui.fCombo.textContent = 'x' + game.bestCombo;
    ui.newRec.classList.toggle('hidden', !rec);
    ui.bestOver.textContent = ui.bestStart.textContent = Math.max(best, game.score);
    ui.edgeL.style.opacity = ui.edgeR.style.opacity = ui.edgeB.style.opacity = 0;
    ui.vignette.style.opacity = 0.6;
    setTimeout(() => { ui.hud.classList.add('hidden'); ui.over.classList.remove('hidden'); }, 700);
  }

  function togglePause(force) {
    if (!game.running) return;
    game.paused = force != null ? force : !game.paused;
    ui.pause.classList.toggle('hidden', !game.paused);
  }
  function toMenu() {
    game.running = false; game.over = false; game.paused = false;
    ui.hud.classList.add('hidden'); ui.over.classList.add('hidden'); ui.pause.classList.add('hidden'); ui.start.classList.remove('hidden');
    ui.vignette.style.opacity = 0; ui.edgeL.style.opacity = ui.edgeR.style.opacity = ui.edgeB.style.opacity = 0;
    simBg = true; video.classList.remove('on');
  }

  // Osobny ekran ostrzeżenia – pokazywany bezpośrednio przed ekranem startowym
  $('safetyOk').addEventListener('click', () => {
    audio.unlock();
    $('safetyScreen').classList.add('hidden');
    ui.start.classList.remove('hidden');
    ui.start.scrollTop = 0;
  });
  $('startAR').addEventListener('click', startAR);
  $('startSim').addEventListener('click', startSim);
  $('againBtn').addEventListener('click', () => { audio.unlock(); if (input.camera && stream && stream.active) video.classList.add('on'); beginGame(null); });
  $('menuBtn').addEventListener('click', toMenu);
  $('pauseBtn').addEventListener('click', (e) => { e.stopPropagation(); togglePause(); });
  $('resumeBtn').addEventListener('click', () => togglePause(false));
  $('quitBtn').addEventListener('click', toMenu);
  document.addEventListener('visibilitychange', () => { if (document.hidden && game.running) togglePause(true); });

  if (!window.isSecureContext) ui.msg.textContent = 'Uwaga: kamera i żyroskop wymagają HTTPS. Użyj trybu symulacji lub otwórz grę przez https://';

  // uchwyt do testów automatycznych
  window.__lowca = { game, view, input, fireCenter, startSim, audio, spawnMonster, damageMonster, hurtPlayer };
  requestAnimationFrame(frame);
})();
