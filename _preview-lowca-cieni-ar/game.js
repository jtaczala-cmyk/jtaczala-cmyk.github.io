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
  document.addEventListener('touchend', (e) => { const n = Date.now(); if (n - lastTouchEnd < 300) e.preventDefault(); lastTouchEnd = n; }, { passive: false });
  document.addEventListener('contextmenu', (e) => e.preventDefault());
  document.addEventListener('dblclick', (e) => e.preventDefault());

  // ---------- Dźwięk (Web Audio, proceduralny) ----------
  const audio = (() => {
    let ac = null, master = null, noiseBuf = null, muted = false;
    function unlock() {
      if (!ac) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        ac = new AC();
        master = ac.createGain(); master.gain.value = muted ? 0 : 0.7; master.connect(ac.destination);
        noiseBuf = ac.createBuffer(1, ac.sampleRate * 1, ac.sampleRate);
        const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        // krótki cichy dźwięk odblokowujący iOS
        const o = ac.createOscillator(), g = ac.createGain(); g.gain.value = 0.0001; o.connect(g); g.connect(master); o.start(); o.stop(ac.currentTime + 0.02);
      }
      if (ac.state === 'suspended') ac.resume();
    }
    const ok = () => ac && master && ac.state !== 'closed';
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
      unlock,
      get muted() { return muted; },
      toggle() { muted = !muted; if (master) master.gain.setTargetAtTime(muted ? 0 : 0.7, ac.currentTime, 0.02); return muted; },
      shot() { if (!ok()) return; osc('sawtooth', 1400, 180, 0.16, 0.18, master); osc('sine', 600, 90, 0.12, 0.25, master); noise(0.08, 0.12, 'highpass', 3000, 1200, master); },
      hit(pan) { if (!ok()) return; const d = out(pan); osc('square', 320, 160, 0.07, 0.12, d); noise(0.06, 0.15, 'bandpass', 1800, 800, d, 3); },
      banish(pan) { if (!ok()) return; const d = out(pan); osc('sine', 220, 1400, 0.18, 0.28, d); osc('triangle', 880, 2400, 0.12, 0.12, d, 0.05); noise(0.35, 0.22, 'lowpass', 4000, 200, d); },
      spawn(pan) { if (!ok()) return; const d = out(pan); noise(0.9, 0.07, 'bandpass', 200, 900, d, 6); osc('sine', 70, 55, 0.8, 0.06, d); },
      damage() { if (!ok()) return; osc('sine', 140, 38, 0.35, 0.6, master); noise(0.25, 0.3, 'lowpass', 900, 80, master); },
      wave() { if (!ok()) return; [220, 277, 330].forEach((f, i) => osc('triangle', f, f * 0.98, 0.9, 0.08, master, i * 0.08)); },
      over() { if (!ok()) return; osc('sawtooth', 300, 40, 1.4, 0.18, master); noise(1.2, 0.15, 'lowpass', 1200, 60, master); }
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
    monsters: [], particles: [], beams: [], floaters: []
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
      drift: rand(-6, 6), flash: 0, born: game.t, screen: null, attackT: 0
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
    if (m.hp > 0) { audio.hit(pan); burst(w, colorOf(m), 10, 30); m.dist += 0.8; return; }
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
    burst(w, colorOf(m), 34, 70); burst(w, '#ffffff', 10, 40);
    game.shake = Math.max(game.shake, 0.25);
    audio.banish(pan);
    ui.score.textContent = game.score;
    ui.combo.textContent = game.combo;
    ui.comboBox.classList.toggle('on', game.combo > 1);
    ui.comboBox.classList.add('pop'); setTimeout(() => ui.comboBox.classList.remove('pop'), 120);
  }
  const colorOf = (m) => (m.type === 'cien' ? '#ff2d4a' : m.type === 'oko' ? '#c084ff' : '#7dff6a');

  function burst(w, color, n, spd) {
    for (let i = 0; i < n; i++) {
      const a = rand(0, 6.28), s = rand(0.2, 1) * spd;
      game.particles.push({ az: w.az, el: w.el, vaz: Math.cos(a) * s * 0.25, vel: Math.sin(a) * s * 0.25, life: rand(0.4, 0.9), max: 0.9, color, size: rand(1.5, 4.5) });
    }
  }

  function hurtPlayer(m) {
    const dmg = TYPES[m.type].dmg;
    game.hp = Math.max(0, game.hp - dmg);
    game.hurt = 1; game.shake = 0.5;
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
      if (m.dist <= ATTACK_DIST) {
        const w = { az: m.az, el: monsterEl(m) };
        burst(w, colorOf(m), 20, 50);
        game.monsters.splice(i, 1);
        hurtPlayer(m);
        if (!game.running) return;
      }
    }
    // cząsteczki / efekty
    for (let i = game.particles.length - 1; i >= 0; i--) {
      const p = game.particles[i]; p.life -= dt; if (p.life <= 0) { game.particles.splice(i, 1); continue; }
      p.az += p.vaz * dt; p.el += p.vel * dt; p.vel -= 6 * dt; p.vaz *= 0.97;
    }
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

  // ---------- Rysowanie stworów ----------
  function drawCien(m, x, y, s, t) {
    // s = wysokość postaci w px
    const sway = Math.sin(t * 2 + m.phase) * s * 0.03;
    const near = clamp(1 - m.dist / 6, 0, 1);
    // aura
    let g = ctx.createRadialGradient(x, y, s * 0.05, x, y, s * 0.75);
    g.addColorStop(0, 'rgba(120,0,40,.45)'); g.addColorStop(1, 'rgba(60,0,40,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, s * 0.75, 0, 6.28); ctx.fill();
    // macki
    ctx.lineCap = 'round';
    for (let i = 0; i < 7; i++) {
      const bx = x + (i - 3) * s * 0.07, by = y + s * 0.1;
      const w1 = Math.sin(t * 3 + i * 1.3 + m.phase) * s * 0.12, w2 = Math.cos(t * 2.4 + i) * s * 0.1;
      ctx.strokeStyle = `rgba(12,0,18,${0.85 - Math.abs(i - 3) * 0.08})`;
      ctx.lineWidth = Math.max(1, s * (0.06 - Math.abs(i - 3) * 0.006));
      ctx.beginPath(); ctx.moveTo(bx, by);
      ctx.bezierCurveTo(bx + w1, by + s * 0.2, bx - w2 + (i - 3) * s * 0.06, by + s * 0.35, bx + w1 * 1.4 + (i - 3) * s * 0.1, by + s * 0.5);
      ctx.stroke();
    }
    // ramiona-szpony (przy zbliżeniu)
    for (const dir of [-1, 1]) {
      const reach = 0.25 + near * 0.2 + Math.sin(t * 4 + dir) * 0.03;
      ctx.strokeStyle = 'rgba(8,0,14,.9)'; ctx.lineWidth = Math.max(1, s * 0.035);
      ctx.beginPath(); ctx.moveTo(x + dir * s * 0.12, y - s * 0.12);
      ctx.quadraticCurveTo(x + dir * s * 0.35, y - s * 0.2, x + dir * s * reach * 1.3, y + s * 0.05);
      ctx.stroke();
      for (let k = -1; k <= 1; k++) {
        const fx = x + dir * s * reach * 1.3, fy = y + s * 0.05;
        ctx.lineWidth = Math.max(1, s * 0.012);
        ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(fx + dir * s * 0.06, fy + s * (0.05 + k * 0.035)); ctx.stroke();
      }
    }
    // ciało
    ctx.fillStyle = '#07000c';
    ctx.beginPath();
    ctx.moveTo(x + sway, y - s * 0.5);
    ctx.bezierCurveTo(x + s * 0.26 + sway, y - s * 0.48, x + s * 0.22, y - s * 0.05, x + s * 0.2, y + s * 0.15);
    ctx.lineTo(x - s * 0.2, y + s * 0.15);
    ctx.bezierCurveTo(x - s * 0.22, y - s * 0.05, x - s * 0.26 + sway, y - s * 0.48, x + sway, y - s * 0.5);
    ctx.fill();
    // kaptur-krawędź
    ctx.strokeStyle = 'rgba(150,40,90,.35)'; ctx.lineWidth = Math.max(1, s * 0.01); ctx.stroke();
    // oczy
    const blink = (Math.sin(t * 0.9 + m.phase * 3) > 0.97) ? 0.15 : 1;
    const ey = y - s * 0.33, ex = s * 0.065;
    ctx.save();
    ctx.shadowColor = '#ff1030'; ctx.shadowBlur = Math.max(6, s * 0.12);
    ctx.fillStyle = '#ff2d4a';
    for (const d of [-1, 1]) {
      ctx.beginPath(); ctx.ellipse(x + sway + d * ex, ey, s * 0.04, s * 0.022 * blink * (1 + near * 0.4), d * -0.35, 0, 6.28); ctx.fill();
    }
    ctx.fillStyle = '#fff2c4';
    for (const d of [-1, 1]) { ctx.beginPath(); ctx.arc(x + sway + d * ex, ey, s * 0.008, 0, 6.28); ctx.fill(); }
    ctx.restore();
    if (near > 0.3) { // paszcza
      ctx.fillStyle = `rgba(255,40,60,${near * 0.7})`;
      ctx.beginPath(); ctx.ellipse(x + sway, y - s * 0.22, s * 0.05, s * 0.025 * near + 0.5, 0, 0, 6.28); ctx.fill();
    }
  }

  function drawOko(m, x, y, s, t) {
    const r = s * 0.5;
    // poświata
    let g = ctx.createRadialGradient(x, y, r * 0.5, x, y, r * 2.1);
    g.addColorStop(0, 'rgba(170,80,255,.45)'); g.addColorStop(1, 'rgba(120,40,200,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 2.1, 0, 6.28); ctx.fill();
    // macki pod okiem
    ctx.lineCap = 'round';
    for (let i = 0; i < 6; i++) {
      const a = Math.PI * (0.2 + i * 0.12), bx = x + Math.cos(a) * r * 0.8, by = y + Math.sin(a) * r * 0.8;
      const w = Math.sin(t * 3 + i * 1.7 + m.phase) * r * 0.4;
      ctx.strokeStyle = 'rgba(90,20,120,.9)'; ctx.lineWidth = Math.max(1, r * 0.12);
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.quadraticCurveTo(bx + w, by + r * 0.7, bx - w * 0.6, by + r * 1.4); ctx.stroke();
    }
    // kolce wokół
    ctx.fillStyle = '#2a0a3a';
    for (let i = 0; i < 10; i++) {
      const a = i / 10 * 6.28 + t * 0.4, a1 = a - 0.18, a2 = a + 0.18, rr = r * (1.35 + 0.1 * Math.sin(t * 3 + i));
      ctx.beginPath(); ctx.moveTo(x + Math.cos(a1) * r * 0.9, y + Math.sin(a1) * r * 0.9); ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); ctx.lineTo(x + Math.cos(a2) * r * 0.9, y + Math.sin(a2) * r * 0.9); ctx.fill();
    }
    // gałka
    g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
    g.addColorStop(0, '#fff3e8'); g.addColorStop(0.6, '#e8c9c9'); g.addColorStop(1, '#7a2a4a');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.28); ctx.fill();
    // żyłki
    ctx.strokeStyle = 'rgba(200,20,40,.55)'; ctx.lineWidth = Math.max(0.6, r * 0.025);
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * 6.28 + m.phase; ctx.beginPath();
      ctx.moveTo(x + Math.cos(a) * r * 0.95, y + Math.sin(a) * r * 0.95);
      ctx.quadraticCurveTo(x + Math.cos(a + 0.3) * r * 0.7, y + Math.sin(a + 0.3) * r * 0.7, x + Math.cos(a) * r * 0.5, y + Math.sin(a) * r * 0.5);
      ctx.stroke();
    }
    // tęczówka śledząca gracza (środek ekranu)
    const lx = clamp((W / 2 - x) / W, -0.5, 0.5) * r * 0.5, ly = clamp((H / 2 - y) / H, -0.5, 0.5) * r * 0.5;
    ctx.save(); ctx.shadowColor = '#ff6a00'; ctx.shadowBlur = Math.max(4, r * 0.4);
    g = ctx.createRadialGradient(x + lx, y + ly, 0, x + lx, y + ly, r * 0.5);
    g.addColorStop(0, '#ffe066'); g.addColorStop(0.5, '#ff6a00'); g.addColorStop(1, '#8a0000');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x + lx, y + ly, r * 0.48, 0, 6.28); ctx.fill(); ctx.restore();
    const dil = 0.08 + 0.05 * Math.sin(t * 2.5 + m.phase);
    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(x + lx, y + ly, r * dil, r * 0.36, 0, 0, 6.28); ctx.fill();
    // powieka (mruganie)
    const bl = Math.max(0, Math.sin(t * 0.7 + m.phase * 2) - 0.94) * 16;
    if (bl > 0) { ctx.fillStyle = '#4a1240'; ctx.beginPath(); ctx.ellipse(x, y - r * (1 - bl), r * 1.02, r * bl, 0, 0, 6.28); ctx.fill(); }
  }

  function drawPelz(m, x, y, s, t) {
    // s = szerokość korpusu w px
    const w = s * 0.55, h = s * 0.28, gait = t * 14 + m.phase;
    // cień na ziemi
    ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.beginPath(); ctx.ellipse(x, y + h * 0.9, w * 1.3, h * 0.35, 0, 0, 6.28); ctx.fill();
    // nogi
    ctx.lineCap = 'round'; ctx.strokeStyle = '#0f1a0c';
    for (let i = 0; i < 4; i++) for (const d of [-1, 1]) {
      const ph = gait + i * 1.6 + (d > 0 ? 3.14 : 0), lift = Math.max(0, Math.sin(ph)) * h * 0.6;
      const bx = x + d * w * 0.4, by = y + (i - 1.5) * h * 0.15;
      const kx = bx + d * w * (0.55 + i * 0.08), ky = by - h * 0.9 - lift;
      const fx = bx + d * w * (0.95 + i * 0.12) + Math.cos(ph) * w * 0.12, fy = y + h * 0.85 - lift * 0.3;
      ctx.lineWidth = Math.max(1, s * 0.035);
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(kx, ky); ctx.lineTo(fx, fy); ctx.stroke();
    }
    // korpus
    let g = ctx.createRadialGradient(x, y - h * 0.4, h * 0.1, x, y, w);
    g.addColorStop(0, '#3e5a2a'); g.addColorStop(0.7, '#162410'); g.addColorStop(1, '#070d05');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, w * 0.62, h, 0, 0, 6.28); ctx.fill();
    // segmenty grzbietu
    ctx.strokeStyle = 'rgba(125,255,106,.25)'; ctx.lineWidth = Math.max(0.8, s * 0.01);
    for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.ellipse(x, y + h * 0.1, w * 0.62 * (1 - i * 0.2), h * (1 - i * 0.22), 0, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); }
    // żuwaczki
    const snap = Math.abs(Math.sin(t * 8 + m.phase)) * 0.3;
    ctx.strokeStyle = '#d8ffb0'; ctx.lineWidth = Math.max(1, s * 0.025);
    for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x + d * w * 0.15, y + h * 0.6); ctx.quadraticCurveTo(x + d * w * (0.35 + snap), y + h * 1.0, x + d * w * 0.05, y + h * 1.25); ctx.stroke(); }
    // gromada zielonych oczu
    ctx.save(); ctx.shadowColor = '#7dff6a'; ctx.shadowBlur = Math.max(4, s * 0.08); ctx.fillStyle = '#b6ff7a';
    const eyes = [[-0.2, 0.05, 0.06], [0.2, 0.05, 0.06], [-0.08, -0.1, 0.045], [0.08, -0.1, 0.045], [-0.32, -0.05, 0.035], [0.32, -0.05, 0.035], [0, 0.18, 0.03]];
    for (const [ex, ey, er] of eyes) { ctx.beginPath(); ctx.arc(x + ex * w, y + ey * h * 2, s * er, 0, 6.28); ctx.fill(); }
    ctx.restore();
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
    // „rzut” w ostatnich metrach
    let jx = 0, jy = 0;
    if (m.dist < 3.5) { const k = (3.5 - m.dist) / 3.5; jx = rand(-1, 1) * s * 0.02 * k; jy = rand(-1, 1) * s * 0.02 * k; }
    const x = p.x + jx, y = p.y + jy;
    if (x < -s * 2 || x > W + s * 2 || y < -s * 2 || y > H + s * 2) return;
    // pojawienie się – zanikanie z mgły
    const fadeIn = clamp((t - m.born) / 0.8, 0, 1);
    const fog = clamp(1 - (m.dist - 12) / 12, 0.35, 1);
    ctx.save(); ctx.globalAlpha = fadeIn * fog;
    if (m.type === 'cien') drawCien(m, x, y, s, t);
    else if (m.type === 'oko') drawOko(m, x, y, s, t);
    else drawPelz(m, x, y, s, t);
    ctx.restore();
    const r = m.type === 'cien' ? s * 0.32 : m.type === 'oko' ? s * 0.62 : s * 0.42;
    m.screen = { x, y, r: Math.max(r, 16) };
    // błysk trafienia
    if (m.flash > 0) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(x, y, 0, x, y, r * 1.4);
      g.addColorStop(0, `rgba(255,255,255,${m.flash / 0.12})`); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 1.4, 0, 6.28); ctx.fill(); ctx.restore();
    }
    // pasek HP dla twardszych
    if (m.maxHp > 1) {
      const bw = clamp(r * 1.4, 34, 160), bh = clamp(r * 0.08, 4, 8), by = y - (m.type === 'cien' ? s * 0.58 : r * 1.55);
      ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(x - bw / 2 - 1, by - 1, bw + 2, bh + 2);
      ctx.fillStyle = m.type === 'oko' ? '#c084ff' : '#ff2d4a'; ctx.fillRect(x - bw / 2, by, bw * (m.hp / m.maxHp), bh);
    }
    // znacznik odległości
    if (m.dist < 8) {
      ctx.font = `700 ${clamp(r * 0.18, 11, 16)}px system-ui,sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255,90,110,.9)'; ctx.fillText(`${m.dist.toFixed(1)} m`, x, y + r * 1.25 + 12);
    }
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
    // cząsteczki
    ctx.globalCompositeOperation = 'lighter';
    for (const p of game.particles) {
      const s = project(p.az, p.el); if (!s) continue;
      ctx.globalAlpha = clamp(p.life / p.max, 0, 1); ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(s.x, s.y, p.size, 0, 6.28); ctx.fill();
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
    game.monsters.length = 0; game.particles.length = 0; game.beams.length = 0; game.floaters.length = 0;
    ui.score.textContent = '0'; ui.wave.textContent = '1'; ui.comboBox.classList.remove('on');
    updateHP();
    ui.start.classList.add('hidden'); ui.over.classList.add('hidden'); ui.pause.classList.add('hidden'); ui.hud.classList.remove('hidden');
    ui.msg.textContent = '';
    if (note) toast(note, 5000);
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
  window.__lowca = { game, view, input, fireCenter, startSim };
  requestAnimationFrame(frame);
})();
