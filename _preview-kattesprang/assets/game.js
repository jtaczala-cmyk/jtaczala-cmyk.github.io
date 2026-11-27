/* Kattesprang / Koci Skok / Cat Leap – Stop60 preview. Endless rooftop leaping with Magic the cat. */
(function(){
"use strict";
var LANG = (document.documentElement.getAttribute("data-lang") || "no");
var T = {
  no: {name:"Kattesprang", score:"Poeng", best:"Rekord", rec:"Ny rekord!", over:"Magic tar en pause", again:"Spill igjen", share:"Kopier resultat", copied:"Kopiert! Lim inn hvor du vil 🐾", dist:"Avstand", items:"Fanget", combo:"Beste kombo", paused:"Pause", resume:"Fortsett"},
  pl: {name:"Koci Skok", score:"Punkty", best:"Rekord", rec:"Nowy rekord!", over:"Magic robi sobie przerwę", again:"Zagraj znowu", share:"Kopiuj wynik", copied:"Skopiowano! Wklej, gdzie chcesz 🐾", dist:"Dystans", items:"Złapane", combo:"Najlepsze kombo", paused:"Pauza", resume:"Wznów"},
  en: {name:"Cat Leap", score:"Score", best:"Best", rec:"New best!", over:"Magic takes a nap", again:"Play again", share:"Copy result", copied:"Copied! Paste it anywhere 🐾", dist:"Distance", items:"Caught", combo:"Best combo", paused:"Paused", resume:"Resume"}
}[LANG] || null;
if (!T) T = {};
var $ = function(id){ return document.getElementById(id); };
var cv = $("c"), ctx = cv.getContext("2d");
var W = 400, H = 600, K = 1, DPR = 1;
function resize(){
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  var cw = window.innerWidth, ch = window.innerHeight;
  cv.width = Math.round(cw * DPR); cv.height = Math.round(ch * DPR);
  K = Math.min(ch / 540, cw / 360); W = cw / K; H = ch / K;
}
window.addEventListener("resize", resize); resize();

/* ---------- storage ---------- */
var BKEY = "s60_kattesprang_best", MKEY = "s60_kattesprang_mute";
function lsGet(k){ try { return localStorage.getItem(k); } catch(e){ return null; } }
function lsSet(k, v){ try { localStorage.setItem(k, v); } catch(e){} }
var best = +lsGet(BKEY) || 0, mute = lsGet(MKEY) === "1";

/* ---------- audio (synthesized) ---------- */
var AC = null, master = null;
function audio(){
  if (AC) { if (AC.state === "suspended") AC.resume(); return AC; }
  try { AC = new (window.AudioContext || window.webkitAudioContext)(); master = AC.createGain(); master.gain.value = .5; master.connect(AC.destination); } catch(e){ AC = null; }
  return AC;
}
function tone(f, d, type, vol, slide, delay){
  if (mute || !AC) return;
  var t = AC.currentTime + (delay || 0), o = AC.createOscillator(), g = AC.createGain();
  o.type = type || "sine"; o.frequency.setValueAtTime(f, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + d);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || .25, t + .012); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + d + .05);
}
function noise(d, vol, fq){
  if (mute || !AC) return;
  var n = Math.floor(AC.sampleRate * d), b = AC.createBuffer(1, n, AC.sampleRate), a = b.getChannelData(0);
  for (var i = 0; i < n; i++) a[i] = (Math.random() * 2 - 1) * (1 - i / n);
  var s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain();
  s.buffer = b; f.type = "lowpass"; f.frequency.value = fq || 900; g.gain.value = vol || .3;
  s.connect(f); f.connect(g); g.connect(master); s.start();
}
var SFX = {
  jump: function(){ tone(380, .16, "sine", .22, 760); },
  dbl: function(){ tone(560, .14, "triangle", .2, 1180); tone(900, .1, "sine", .08, 1500, .05); },
  land: function(){ noise(.06, .12, 500); },
  yarn: function(c){ var f = 660 * Math.pow(1.06, Math.min(c, 12)); tone(f, .1, "triangle", .2); tone(f * 1.5, .12, "sine", .1, 0, .05); },
  fish: function(){ tone(523, .1, "square", .1); tone(784, .16, "square", .1, 0, .08); },
  bell: function(){ [1046, 1568, 2093, 2637].forEach(function(f, i){ tone(f, .7 - i * .1, "sine", .14 - i * .025, 0, i * .03); }); },
  bounce: function(){ tone(220, .2, "sine", .25, 520); },
  stomp: function(){ tone(300, .12, "square", .12, 140); tone(700, .12, "triangle", .14, 1100, .06); },
  hit: function(){ noise(.25, .35, 700); tone(200, .3, "sawtooth", .12, 70); },
  splash: function(){ noise(.35, .3, 2400); },
  over: function(){ [523, 440, 349, 262].forEach(function(f, i){ tone(f, .26, "triangle", .2, 0, i * .16); }); },
  start: function(){ [523, 659, 784, 1046].forEach(function(f, i){ tone(f, .16, "triangle", .18, 0, i * .08); }); }
};

/* ---------- Magic's bow tie: black on even / red on odd Europe/Oslo days ---------- */
function tzDay(){ try { return +new Intl.DateTimeFormat("en-GB", {timeZone: "Europe/Oslo", day: "numeric"}).format(new Date()); } catch(e){ return new Date().getDate(); } }
var BOWQ = (function(){ try { return new URLSearchParams(location.search).get("bow"); } catch(e){ return null; } })();
var BOWK = BOWQ === "black" || BOWQ === "red" ? BOWQ : (tzDay() % 2 === 0 ? "black" : "red");
var BOWC = BOWK === "black" ? ["#1C1A22", "#3A3542", "#0A090D"] : ["#D3263A", "#F04A5C", "#7E1020"];

/* ---------- drawing helpers ---------- */
function ell(c, x, y, rx, ry, col, rot){ c.fillStyle = col; c.beginPath(); c.ellipse(x, y, rx, ry, rot || 0, 0, 6.2832); c.fill(); }
function circ(c, x, y, r, col){ c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 6.2832); c.fill(); }
function line(c, p, col, w){ c.strokeStyle = col; c.lineWidth = w; c.lineCap = "round"; c.lineJoin = "round"; c.beginPath(); c.moveTo(p[0], p[1]); for (var i = 2; i < p.length; i += 2) c.lineTo(p[i], p[i + 1]); c.stroke(); }
function rr(c, x, y, w, h, r, col){ c.fillStyle = col; c.beginPath(); if (c.roundRect) c.roundRect(x, y, w, h, r); else c.rect(x, y, w, h); c.fill(); }

function drawBow(c, x, y, k){
  c.save(); c.translate(x, y); c.scale(k, k);
  var col = BOWC[0], hi = BOWC[1], ink = BOWC[2];
  [-1, 1].forEach(function(d){
    c.beginPath(); c.moveTo(d * 1.4, -1.1);
    c.quadraticCurveTo(d * 4.2, -4.4, d * 7.2, -3.4); c.quadraticCurveTo(d * 8.4, 0, d * 7.2, 3.4);
    c.quadraticCurveTo(d * 4.2, 4.4, d * 1.4, 1.1); c.closePath();
    c.fillStyle = col; c.fill(); c.lineWidth = .7; c.strokeStyle = ink; c.stroke();
    c.save(); c.clip();
    c.fillStyle = hi; c.beginPath(); c.ellipse(d * 4.6, -2.2, 2.6, .9, d * .25, 0, 6.2832); c.fill();
    c.fillStyle = "#FFFFFF"; [[3.2, -1.6], [5.9, -.6], [4.4, 1.7], [6.8, 2.2], [2.4, 1.0], [6.4, -2.6]].forEach(function(q){ c.beginPath(); c.arc(d * q[0], q[1], .62, 0, 6.2832); c.fill(); });
    c.restore();
  });
  rr(c, -1.9, -2, 3.8, 4, 1.3, col); c.lineWidth = .7; c.strokeStyle = ink; c.stroke();
  circ(c, -.3, -.4, .55, "#FFFFFF");
  c.restore();
}

/* Magic: warm brown striped tabby, soft rounded smile, no scarf, polka-dot bow tie */
function drawMagic(c, x, y, s, st){
  // x,y = feet centre; st: {run, air, vy, squash, blink}
  c.save(); c.translate(x, y); c.scale(s, s);
  var sq = st.squash || 0; c.scale(1 + sq * .18, 1 - sq * .18);
  var fur = "#A8703C", dark = "#5E3618", light = "#E6C394", tm = st.t;
  var tilt = st.air ? Math.max(-.35, Math.min(.35, st.vy / 2200)) : 0;
  c.rotate(tilt);
  // shadow-glow
  // tail
  var tw = Math.sin(tm * 9) * 5;
  line(c, [-16, -16, -28, -24 + tw * .4, -34, -38 + tw], dark, 7.4);
  line(c, [-16, -16, -28, -24 + tw * .4, -34, -38 + tw], fur, 6);
  line(c, [-31, -30 + tw * .8, -34, -38 + tw], dark, 6);
  // legs
  var ph = st.air ? 0 : tm * 16, a1 = Math.sin(ph) * 6, a2 = Math.sin(ph + Math.PI) * 6;
  var legY = st.air ? -6 : 0;
  function leg(lx, off, col){ line(c, [lx, -12, lx + off, legY - 2], col, 5.6); ell(c, lx + off, legY - 1.5, 3.8, 2.6, light); }
  leg(-10, st.air ? -6 : a2, dark); leg(10, st.air ? 6 : a1, dark);
  // body
  ell(c, 0, -17, 19, 11, fur);
  line(c, [-9, -27, -11, -19], dark, 2.6); line(c, [-2, -28, -3, -19], dark, 2.6); line(c, [5, -28, 5, -19], dark, 2.6);
  ell(c, 2, -11, 12, 4.5, light);
  leg(-6, st.air ? -4 : a1, fur); leg(13, st.air ? 8 : a2, fur);
  // head (front-facing, slightly turned)
  c.save(); c.translate(18, -32);
  c.fillStyle = fur;
  c.beginPath(); c.moveTo(-11, -4); c.lineTo(-9, -17); c.lineTo(-2, -9); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(11, -4); c.lineTo(9, -17); c.lineTo(2, -9); c.closePath(); c.fill();
  c.fillStyle = "#F2A0A8";
  c.beginPath(); c.moveTo(-8.5, -7); c.lineTo(-8, -13); c.lineTo(-4.5, -9); c.fill();
  c.beginPath(); c.moveTo(8.5, -7); c.lineTo(8, -13); c.lineTo(4.5, -9); c.fill();
  ell(c, 0, 0, 12.5, 10.5, fur);
  line(c, [-3, -9, -2, -5], dark, 1.6); line(c, [0, -10, 0, -5], dark, 1.6); line(c, [3, -9, 2, -5], dark, 1.6);
  line(c, [-12, -1, -8, 0], dark, 1.4); line(c, [12, -1, 8, 0], dark, 1.4);
  ell(c, 0, 4, 6.5, 4.5, light);
  var ex = 1.2, bl = st.blink;
  if (bl){ line(c, [-6.8, -1, -2.6, -1], "#2a1a10", 1.3); line(c, [2.6, -1, 6.8, -1], "#2a1a10", 1.3); }
  else {
    ell(c, -4.6, -1, 2.6, 3, "#5FBF4A"); ell(c, 4.6, -1, 2.6, 3, "#5FBF4A");
    ell(c, -4.6 + ex, -1, 1, 2.4, "#1a1a1a"); ell(c, 4.6 + ex, -1, 1, 2.4, "#1a1a1a");
    circ(c, -5.2 + ex, -2.2, .7, "#fff"); circ(c, 4 + ex, -2.2, .7, "#fff");
    [-4.6, 4.6].forEach(function(qx){ c.save(); c.beginPath(); c.ellipse(qx, -1, 2.7, 3.1, 0, 0, 6.2832); c.clip(); ell(c, qx, 3.1, 3.6, 2.2, fur); c.restore(); });
  }
  c.fillStyle = "#E87A8A"; c.beginPath(); c.moveTo(-1.6, 2.4); c.lineTo(1.6, 2.4); c.lineTo(0, 4); c.fill();
  circ(c, -7.6, 3.4, 2.3, "rgba(255,120,140,.5)"); circ(c, 7.6, 3.4, 2.3, "rgba(255,120,140,.5)");
  c.strokeStyle = "#5a2a2a"; c.lineCap = "round"; c.lineWidth = .8; c.beginPath(); c.moveTo(0, 3.9); c.lineTo(0, 4.9); c.stroke();
  c.lineWidth = 1.05; c.beginPath(); c.moveTo(-3.8, 4.4); c.bezierCurveTo(-2.9, 7.6, 2.9, 7.6, 3.8, 4.4); c.stroke();
  line(c, [-6, 3, -15, 1], "rgba(255,255,255,.75)", .7); line(c, [-6, 4.5, -15, 5], "rgba(255,255,255,.75)", .7);
  line(c, [6, 3, 15, 1], "rgba(255,255,255,.75)", .7); line(c, [6, 4.5, 15, 5], "rgba(255,255,255,.75)", .7);
  drawBow(c, 0, 11.4, 1.05);
  c.restore();
  c.restore();
}
window.S60DrawMagic = drawMagic;

/* ---------- world ---------- */
var G = 2300, JV = 800, DJV = 700;
var ROOF = ["#E2553F", "#1EAE9A", "#F2A72E", "#8E4BC4", "#E44D86", "#3C8DE0"];
var WALL = ["#FFD7A8", "#FFE9B8", "#F9C6D3", "#CDEBDD", "#FFE0C2", "#D9DDF7", "#FFCFA0"];
var FLOW = ["#FF4F7B", "#FFD23F", "#FF8A3D", "#B45CFF", "#FF6FB5", "#4FD3FF"];
var cat, plats, items, foes, parts, floats, camX, speed, score, dist, combo, comboT, mult, bestCombo, caught, hearts, inv, magnet, mode = "menu", tt = 0, shake = 0, lastPlat, nextBalloon;
var CATX = 110;
function rnd(a, b){ return a + Math.random() * (b - a); }
function pick(a){ return a[Math.floor(Math.random() * a.length)]; }
function base(){ return H - 70; }

function addPlat(x, top, w, kind){
  var p = {x: x, y: top, w: w, kind: kind, roof: pick(ROOF), wall: pick(WALL), flow: pick(FLOW), seed: Math.random() * 1000};
  plats.push(p); lastPlat = p; return p;
}
function genNext(){
  var lp = lastPlat, lv = Math.min(1, dist / 9000);
  var gap = rnd(50, 110 + lv * 90) * (speed / 300);
  var r = Math.random();
  var top = lp.y + rnd(-95, 85);
  top = Math.max(base() - 230, Math.min(base(), top));
  if (lp.kind !== "line" && r < .16 && dist > 600){
    // clothesline across a gap, then a building
    var lw = rnd(150, 230), ly = Math.min(lp.y, top) - rnd(20, 50);
    var ln = addPlat(lp.x + lp.w + 20, Math.max(base() - 250, ly), lw, "line");
    ln.cloth = []; for (var i = 0; i < 4; i++) ln.cloth.push({u: .15 + i * .22, c: pick(FLOW), k: Math.floor(Math.random() * 3)});
    for (var j = 0; j < 4; j++) items.push(mkItem(ln.x + lw * (.2 + j * .2), ln.y - 70 - Math.sin(j / 3 * Math.PI) * 30));
    var b = addPlat(ln.x + lw + 20, top, rnd(200, 420), "roof"); decorate(b); return;
  }
  var kind = r < .62 ? "roof" : (r < .82 ? "balcony" : "sill");
  var w = kind === "roof" ? rnd(220, 480) : kind === "balcony" ? rnd(130, 200) : rnd(110, 160);
  var p = addPlat(lp.x + lp.w + gap, top, w, kind);
  // yarn arc over the gap
  var n = Math.max(2, Math.floor(gap / 40));
  for (var k = 0; k < n; k++){ var u = (k + 1) / (n + 1); items.push(mkItem(lp.x + lp.w + gap * u, Math.min(lp.y, top) - 60 - Math.sin(u * Math.PI) * 50)); }
  decorate(p);
}
function mkItem(x, y, t){
  if (!t){ var r = Math.random(); t = r < .035 ? "bell" : (r < .2 ? "fish" : "yarn"); }
  return {x: x, y: y, t: t, c: pick(FLOW), ph: Math.random() * 6, got: 0};
}
function decorate(p){
  var lv = Math.min(1, dist / 9000);
  if (p.kind === "roof" && p.w > 240){
    var r = Math.random();
    if (r < .38 + lv * .2) foes.push({t: "chim", x: p.x + rnd(110, p.w - 70), y: p.y, w: 30, h: rnd(36, 52), p: p});
    else if (r < .62 + lv * .1) foes.push({t: "pud", x: p.x + rnd(110, p.w - 90), y: p.y, w: rnd(40, 56), h: 6, p: p});
    else if (r < .82) foes.push({t: "pig", x: p.x + rnd(120, p.w - 60), y: p.y, w: 26, h: 22, p: p, z: Math.random() * 6});
  } else if (p.kind === "balcony" && Math.random() < .25 + lv * .2){
    foes.push({t: "pig", x: p.x + p.w * .6, y: p.y, w: 26, h: 22, p: p, z: Math.random() * 6});
  }
  var cnt = Math.floor(p.w / 70);
  for (var i = 0; i < cnt; i++) if (Math.random() < .55) items.push(mkItem(p.x + 40 + i * 70, p.y - rnd(30, 120)));
  if (dist > 1500 && Math.random() < .12 + lv * .12){ // a drowsy pigeon gliding in
    foes.push({t: "fly", x: p.x + p.w + rnd(100, 300), y: p.y - rnd(70, 140), w: 28, h: 20, vx: -rnd(40, 90), z: Math.random() * 6});
  }
}

function reset(){
  plats = []; items = []; foes = []; parts = []; floats = [];
  camX = 0; speed = 300; score = 0; dist = 0; combo = 0; comboT = 0; mult = 1; bestCombo = 0; caught = 0; hearts = 3; inv = 0; magnet = 0;
  addPlat(-200, base() - 20, 760, "roof");
  for (var i = 0; i < 8; i++) genNext();
  cat = {x: CATX, y: base() - 20, vy: 0, ground: true, jumps: 0, coyote: 0, buf: 0, squash: 0, blink: 0, onLine: null};
}

/* ---------- input ---------- */
function press(){
  audio();
  if (mode === "play") cat.buf = .13;
}
function tryJump(){
  if (cat.buf <= 0) return;
  if (cat.ground || cat.coyote > 0){
    cat.vy = -JV; cat.ground = false; cat.coyote = 0; cat.jumps = 1; cat.buf = 0; cat.squash = -.6; SFX.jump(); puff(cat.x, cat.y, 6, "#fff");
  } else if (cat.jumps < 2){
    cat.vy = -DJV; cat.jumps = 2; cat.buf = 0; cat.squash = -.5; SFX.dbl(); sparkle(cat.x, cat.y - 20, 10, "#FFE36B");
  }
}
window.addEventListener("keydown", function(e){
  if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW"){
    e.preventDefault(); if (e.repeat) return;
    if (mode === "menu" || mode === "over"){ if (document.activeElement && document.activeElement.tagName === "A") return; start(); return; }
    if (mode === "pause"){ resume(); return; }
    press();
  } else if (e.code === "KeyP" || e.code === "Escape"){ if (mode === "play") pause(); else if (mode === "pause") resume(); }
});
cv.addEventListener("pointerdown", function(e){ e.preventDefault(); if (mode === "play") press(); }, {passive: false});

/* ---------- particles ---------- */
function puff(x, y, n, col){ for (var i = 0; i < n; i++) parts.push({x: x + rnd(-10, 10), y: y, vx: rnd(-80, 80), vy: rnd(-90, -10), l: rnd(.3, .6), m: .6, r: rnd(3, 6), c: col, g: 0}); }
function sparkle(x, y, n, col){ for (var i = 0; i < n; i++){ var a = rnd(0, 6.28), s = rnd(80, 260); parts.push({x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, l: rnd(.4, .8), m: .8, r: rnd(2, 4.5), c: col, g: 300, star: Math.random() < .5}); } }
function floatTxt(x, y, s, col){ floats.push({x: x, y: y, s: s, c: col, l: 1}); }

/* ---------- loop ---------- */
var last = performance.now();
function loop(now){
  var dt = Math.min(.033, (now - last) / 1000); last = now; tt += dt;
  if (mode === "play") update(dt);
  else if (mode === "menu"){ if (!plats) reset(); camX += 90 * dt; cat.x = CATX; idleCat(dt); }
  render();
  requestAnimationFrame(loop);
}
function idleCat(dt){
  while (lastPlat.x < camX + W + 400) genNext();
  var p = platAt(camX + cat.x);
  if (p && p.kind !== "line"){ cat.y += (p.y - cat.y) * Math.min(1, dt * 10); }
  if (!p || p.kind === "line"){ var n = nextPlat(camX + cat.x); if (n) cat.y += (n.y - 40 - cat.y) * Math.min(1, dt * 8); }
  cat.blink = (tt % 3.2) < .12;
}
function platAt(wx){ for (var i = 0; i < plats.length; i++){ var p = plats[i]; if (wx >= p.x && wx <= p.x + p.w) return p; } return null; }
function nextPlat(wx){ for (var i = 0; i < plats.length; i++){ var p = plats[i]; if (p.x > wx && p.kind !== "line") return p; } return null; }

function update(dt){
  speed = Math.min(620, 300 + dist / 45);
  var dx = speed * dt; camX += dx; dist += dx;
  score += dx / 10 * mult * .1;
  while (lastPlat.x < camX + W + 500) genNext();
  // prune
  if (plats.length > 30) plats = plats.filter(function(p){ return p.x + p.w > camX - 200; });
  items = items.filter(function(i){ return i.x > camX - 100 && !(i.got > 1); });
  foes = foes.filter(function(f){ return f.x > camX - 150 && !(f.gone > 1.2); });

  cat.buf -= dt; if (cat.coyote > 0) cat.coyote -= dt;
  tryJump();
  var wx = camX + cat.x, prevY = cat.y;
  cat.vy += G * dt; if (cat.vy > 1300) cat.vy = 1300;
  cat.y += cat.vy * dt;
  var wasGround = cat.ground; cat.ground = false;
  for (var i = 0; i < plats.length; i++){
    var p = plats[i];
    if (wx + 10 < p.x || wx - 14 > p.x + p.w) continue;
    if (cat.vy >= 0 && prevY <= p.y + 2 && cat.y >= p.y){
      if (p.kind === "line"){
        cat.y = p.y; cat.vy = -JV * .82; cat.jumps = 1; p.bounce = 1; SFX.bounce(); sparkle(wx - camX, p.y, 8, p.cloth[0].c); cat.squash = .5; break;
      }
      cat.y = p.y; cat.vy = 0; cat.ground = true; cat.jumps = 0;
      if (!wasGround){ cat.squash = .55; SFX.land(); puff(cat.x, cat.y, 5, "rgba(255,255,255,.85)"); cat.buf > 0 && tryJump(); }
      break;
    }
    // side bonk into a taller building
    if (p.kind !== "line" && cat.y > p.y + 10 && wx + 10 >= p.x && wx + 10 - dx - 2 < p.x){
      hurt("bonk"); cat.y = p.y; cat.vy = -500; cat.ground = false; cat.jumps = 1; break;
    }
  }
  if (!cat.ground && wasGround && cat.vy >= 0) cat.coyote = .09;
  if (cat.squash) { cat.squash *= Math.pow(.0005, dt); if (Math.abs(cat.squash) < .01) cat.squash = 0; }
  cat.blink = (tt % 3.4) < .1;

  // fell into a gap: an awning catches Magic
  if (cat.y > H + 60){
    hurt("fall");
    if (mode !== "play") return;
    var n = nextPlat(wx) || platAt(wx);
    if (n){ camX = n.x + 30 - cat.x; cat.y = n.y - 120; cat.vy = 0; cat.jumps = 1; }
  }
  if (inv > 0) inv -= dt;
  if (magnet > 0) magnet -= dt;
  if (comboT > 0){ comboT -= dt; if (comboT <= 0){ combo = 0; mult = 1; } }

  // items
  var cx = camX + cat.x + 4, cy = cat.y - 24;
  for (var j = 0; j < items.length; j++){
    var it = items[j]; if (it.got) { it.got += dt * 4; continue; }
    var ddx = it.x - cx, ddy = it.y - cy, d2 = ddx * ddx + ddy * ddy;
    if (magnet > 0 && d2 < 230 * 230){ var dd = Math.sqrt(d2) || 1; it.x -= ddx / dd * 520 * dt; it.y -= ddy / dd * 520 * dt; }
    if (d2 < 34 * 34) collect(it);
  }
  // foes
  for (var f = 0; f < foes.length; f++){
    var o = foes[f];
    if (o.t === "fly"){ o.x += o.vx * dt; o.y += Math.sin(tt * 3 + o.z) * 12 * dt; }
    if (o.gone){ o.gone += dt; o.y -= 140 * dt; o.x += 120 * dt; continue; }
    var ox = o.x - camX, top = (o.t === "fly" ? o.y - o.h / 2 : o.y - o.h), bot = (o.t === "fly" ? o.y + o.h / 2 : o.y);
    var cl = cat.x - 12, cr = cat.x + 22, ct = cat.y - 34, cb = cat.y;
    if (cr < ox - o.w / 2 || cl > ox + o.w / 2 || cb < top || ct > bot) continue;
    if (o.t === "pud"){ if (cat.ground && inv <= 0){ hurt("splash"); for (var s = 0; s < 14; s++) parts.push({x: cat.x, y: cat.y, vx: rnd(-160, 160), vy: rnd(-320, -120), l: .6, m: .6, r: rnd(2, 4), c: "#7FD8FF", g: 900}); } continue; }
    if ((o.t === "pig" || o.t === "fly") && cat.vy > 120 && prevY - 4 <= top){
      o.gone = .01; cat.vy = -JV * .78; cat.jumps = 1; SFX.stomp(); gain(15, ox, top, "#FFFFFF"); sparkle(ox, top, 12, "#fff"); continue;
    }
    if (inv <= 0) hurt(o.t === "chim" ? "chim" : "pig");
  }
  // particles
  updParts(dt);
}
function updParts(dt){
  for (var i = parts.length - 1; i >= 0; i--){ var q = parts[i]; q.l -= dt; if (q.l <= 0){ parts.splice(i, 1); continue; } q.vy += q.g * dt; q.x += q.vx * dt; q.y += q.vy * dt; }
  for (var k = floats.length - 1; k >= 0; k--){ var fl = floats[k]; fl.l -= dt * 1.2; fl.y -= 50 * dt; if (fl.l <= 0) floats.splice(k, 1); }
  if (shake > 0) shake = Math.max(0, shake - dt * 30);
}
function gain(v, x, y, col){
  combo++; comboT = 2.2; mult = Math.min(5, 1 + Math.floor(combo / 5)); if (combo > bestCombo) bestCombo = combo;
  var pts = v * mult; score += pts; floatTxt(x, y, "+" + pts + (mult > 1 ? " ×" + mult : ""), col);
}
function collect(it){
  it.got = .01; caught++;
  var sx = it.x - camX;
  if (it.t === "yarn"){ gain(10, sx, it.y, it.c); SFX.yarn(combo); sparkle(sx, it.y, 7, it.c); }
  else if (it.t === "fish"){ gain(25, sx, it.y, "#7FE0FF"); SFX.fish(); sparkle(sx, it.y, 10, "#7FE0FF"); }
  else { gain(50, sx, it.y, "#FFD23F"); SFX.bell(); magnet = 6; sparkle(sx, it.y, 26, "#FFD23F"); }
}
function hurt(why){
  if (inv > 0 && why !== "fall") return;
  hearts--; inv = 1.6; combo = 0; mult = 1; comboT = 0; shake = 8;
  if (why === "splash") SFX.splash(); else SFX.hit();
  if (navigator.vibrate) try { navigator.vibrate(60); } catch(e){}
  if (hearts <= 0) gameOver(why);
}

/* ---------- rendering ---------- */
var clouds = []; for (var ci = 0; ci < 7; ci++) clouds.push({x: Math.random() * 1400, y: Math.random() * .45, s: rnd(.6, 1.3)});
function render(){
  ctx.setTransform(DPR * K, 0, 0, DPR * K, 0, 0);
  var sx = shake ? rnd(-shake, shake) : 0, sy = shake ? rnd(-shake, shake) : 0;
  // sky
  var g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#4FB8FF"); g.addColorStop(.45, "#9ED8FF"); g.addColorStop(.72, "#FFD39A"); g.addColorStop(1, "#FF9E6B");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // sun with glow
  var sunX = W * .78, sunY = H * .2;
  var sg = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 160);
  sg.addColorStop(0, "rgba(255,250,200,1)"); sg.addColorStop(.25, "rgba(255,220,110,.9)"); sg.addColorStop(1, "rgba(255,200,100,0)");
  ctx.fillStyle = sg; ctx.fillRect(sunX - 160, sunY - 160, 320, 320);
  circ(ctx, sunX, sunY, 34, "#FFF4B8");
  ctx.save(); ctx.translate(sunX, sunY); ctx.rotate(tt * .15); ctx.fillStyle = "rgba(255,240,170,.35)";
  for (var r = 0; r < 12; r++){ ctx.rotate(Math.PI / 6); ctx.beginPath(); ctx.moveTo(40, -5); ctx.lineTo(90, 0); ctx.lineTo(40, 5); ctx.fill(); }
  ctx.restore();
  // clouds
  clouds.forEach(function(c){
    var x = ((c.x - camX * .08) % (W + 300) + W + 300) % (W + 300) - 150, y = c.y * H;
    ctx.save(); ctx.translate(x, y); ctx.scale(c.s, c.s);
    ell(ctx, 0, 0, 46, 18, "rgba(255,255,255,.9)"); ell(ctx, -26, 6, 28, 14, "rgba(255,255,255,.9)"); ell(ctx, 24, 4, 32, 15, "rgba(255,255,255,.9)"); ell(ctx, 4, -12, 26, 16, "#fff");
    ctx.restore();
  });
  // far skyline layers
  skyline(.18, H - 250, "#F7A6C2", 90, 0);
  skyline(.35, H - 180, "#E98AB6", 70, 1);
  ctx.save(); ctx.translate(sx, sy);
  // platforms
  for (var i = 0; i < plats.length; i++) drawPlat(plats[i]);
  // foes
  for (var f = 0; f < foes.length; f++) drawFoe(foes[f]);
  // items
  for (var j = 0; j < items.length; j++) drawItem(items[j]);
  // magnet aura
  if (mode === "play" && magnet > 0){
    var ag = ctx.createRadialGradient(cat.x + 4, cat.y - 22, 10, cat.x + 4, cat.y - 22, 70);
    ag.addColorStop(0, "rgba(255,230,90,.45)"); ag.addColorStop(1, "rgba(255,200,60,0)");
    ctx.fillStyle = ag; ctx.beginPath(); ctx.arc(cat.x + 4, cat.y - 22, 70, 0, 6.28); ctx.fill();
    if (Math.random() < .5) parts.push({x: cat.x + rnd(-30, 30), y: cat.y - rnd(0, 50), vx: 0, vy: -60, l: .5, m: .5, r: 2.5, c: "#FFE36B", g: 0, star: true});
  }
  // cat
  if (cat && !(inv > 0 && mode === "play" && Math.floor(tt * 14) % 2)){
    drawMagic(ctx, cat.x, cat.y, 1.05, {t: tt, air: mode === "play" ? !cat.ground : false, vy: cat.vy, squash: cat.squash, blink: cat.blink});
  }
  // particles
  for (var k = 0; k < parts.length; k++){
    var q = parts[k]; ctx.globalAlpha = Math.max(0, q.l / q.m);
    if (q.star){ star(q.x, q.y, q.r * 1.6, q.c); } else circ(ctx, q.x, q.y, q.r, q.c);
  }
  ctx.globalAlpha = 1;
  for (var n = 0; n < floats.length; n++){
    var fl = floats[n]; ctx.globalAlpha = Math.max(0, Math.min(1, fl.l * 1.5));
    ctx.font = "700 18px Oswald, sans-serif"; ctx.textAlign = "center"; ctx.lineWidth = 4; ctx.strokeStyle = "rgba(70,10,50,.8)";
    ctx.strokeText(fl.s, fl.x, fl.y); ctx.fillStyle = fl.c; ctx.fillText(fl.s, fl.x, fl.y);
  }
  ctx.globalAlpha = 1;
  ctx.restore();
  if (mode === "play" || mode === "pause") hud();
}
function skyline(par, y0, col, step, k){
  ctx.fillStyle = col;
  var off = (camX * par) % step, i0 = Math.floor(camX * par / step);
  for (var x = -off - step, i = i0 - 1; x < W + step; x += step, i++){
    var h = 40 + ((i * 73 + k * 31) % 7) * 18, w = step - 8;
    ctx.fillRect(x, y0 - h, w, H);
    if ((i + k) % 3 === 0){ ctx.beginPath(); ctx.moveTo(x - 4, y0 - h); ctx.lineTo(x + w / 2, y0 - h - 26); ctx.lineTo(x + w + 4, y0 - h); ctx.fill(); }
    ctx.fillStyle = "rgba(255,240,200,.55)";
    for (var wy = y0 - h + 16; wy < y0 + 40; wy += 26) for (var wx = x + 10; wx < x + w - 14; wx += 22) if ((wx * 7 + wy * 3 + i) % 5 < 2) ctx.fillRect(wx, wy, 8, 11);
    ctx.fillStyle = col;
  }
}
function star(x, y, r, col){ ctx.fillStyle = col; ctx.beginPath(); for (var i = 0; i < 10; i++){ var a = i * Math.PI / 5 - Math.PI / 2, rr2 = i % 2 ? r * .45 : r; ctx.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2); } ctx.fill(); }
function drawPlat(p){
  var x = p.x - camX; if (x > W + 20 || x + p.w < -40) return;
  if (p.kind === "line"){
    var sag = 16 + (p.bounce || 0) * 14; if (p.bounce) p.bounce = Math.max(0, p.bounce - .05);
    // posts
    rr(ctx, x - 6, p.y - 10, 8, H, 2, "#8A5A3A"); rr(ctx, x + p.w - 2, p.y - 10, 8, H, 2, "#8A5A3A");
    ctx.strokeStyle = "#FFFFFF"; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(x - 2, p.y - 6); ctx.quadraticCurveTo(x + p.w / 2, p.y + sag, x + p.w + 2, p.y - 6); ctx.stroke();
    p.cloth.forEach(function(cl, i){
      var u = cl.u, cx = x + p.w * u, cy = p.y - 6 + 4 * u * (1 - u) * (sag + 6) * 1 + Math.sin(tt * 3 + i) * 1.5;
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(Math.sin(tt * 2.5 + i) * .08);
      if (cl.k === 0){ rr(ctx, -12, 0, 24, 26, 4, cl.c); rr(ctx, -16, 0, 8, 10, 3, cl.c); rr(ctx, 8, 0, 8, 10, 3, cl.c); circ(ctx, 0, 12, 3, "rgba(255,255,255,.7)"); }
      else if (cl.k === 1){ rr(ctx, -6, 0, 12, 24, 3, cl.c); rr(ctx, -6, 18, 18, 8, 4, cl.c); ctx.fillStyle = "rgba(255,255,255,.6)"; ctx.fillRect(-6, 6, 12, 3); }
      else { rr(ctx, -14, 0, 28, 20, 3, cl.c); ctx.fillStyle = "rgba(255,255,255,.5)"; for (var d = -10; d < 14; d += 7) ctx.fillRect(d, 0, 3, 20); }
      rr(ctx, -2, -4, 4, 7, 1, "#C98A4A");
      ctx.restore();
    });
    return;
  }
  // facade
  rr(ctx, x, p.y, p.w, H - p.y + 40, 4, p.wall);
  ctx.fillStyle = "rgba(0,0,0,.06)"; ctx.fillRect(x + p.w - 10, p.y, 10, H);
  // windows with flower boxes
  var cols = Math.max(1, Math.floor((p.w - 30) / 70));
  for (var c = 0; c < cols; c++){
    for (var rI = 0; rI < 4; rI++){
      var wx = x + 22 + c * ((p.w - 44) / cols) + ((p.w - 44) / cols - 34) / 2, wy = p.y + 34 + rI * 92;
      if (wy > H) break;
      rr(ctx, wx - 3, wy - 3, 40, 52, 8, "#FFFFFF");
      var lit = ((p.seed + c * 3 + rI) | 0) % 3 === 0;
      rr(ctx, wx, wy, 34, 46, 6, lit ? "#FFE28A" : "#7CC8F0");
      ctx.fillStyle = "rgba(255,255,255,.55)"; ctx.fillRect(wx + 4, wy + 4, 6, 18);
      ctx.fillStyle = "#FFFFFF"; ctx.fillRect(wx + 15.5, wy, 3, 46); ctx.fillRect(wx, wy + 21, 34, 3);
      // flower box
      rr(ctx, wx - 5, wy + 46, 44, 9, 3, "#A85A34");
      for (var fI = 0; fI < 5; fI++){ var fx = wx - 1 + fI * 9; circ(ctx, fx, wy + 45, 3.2, "#3DAE4E"); circ(ctx, fx, wy + 41, 3.6, fI % 2 ? p.flow : "#FFD23F"); circ(ctx, fx, wy + 41, 1.3, "#fff"); }
    }
  }
  if (p.kind === "roof"){
    // tiled roof edge
    rr(ctx, x - 8, p.y - 4, p.w + 16, 18, 6, p.roof);
    ctx.fillStyle = "rgba(255,255,255,.25)"; ctx.fillRect(x - 6, p.y - 3, p.w + 12, 4);
    ctx.fillStyle = "rgba(0,0,0,.15)"; for (var t = x; t < x + p.w; t += 18){ ctx.beginPath(); ctx.arc(t + 9, p.y + 14, 9, 0, Math.PI); ctx.fill(); }
    // glow line on top
    ctx.fillStyle = "rgba(255,250,210,.7)"; ctx.fillRect(x - 6, p.y - 4, p.w + 12, 2);
  } else if (p.kind === "balcony"){
    rr(ctx, x - 10, p.y - 2, p.w + 20, 10, 4, "#FFFFFF");
    ctx.strokeStyle = "#6B3E8A"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 8, p.y + 8);
    for (var b = x - 8; b <= x + p.w + 8; b += 12){ ctx.moveTo(b, p.y + 8); ctx.lineTo(b, p.y + 34); } ctx.moveTo(x - 8, p.y + 34); ctx.lineTo(x + p.w + 8, p.y + 34); ctx.stroke();
    for (var po = 0; po < 2; po++){ var px = x + 14 + po * (p.w - 40); rr(ctx, px, p.y - 14, 14, 13, 3, "#E2553F"); circ(ctx, px + 7, p.y - 20, 7, "#3DAE4E"); circ(ctx, px + 3, p.y - 23, 3.5, p.flow); circ(ctx, px + 11, p.y - 22, 3.5, "#FFD23F"); }
  } else {
    // windowsill with a long flower box
    rr(ctx, x - 12, p.y - 2, p.w + 24, 12, 4, "#FFFFFF");
    rr(ctx, x - 4, p.y + 10, p.w + 8, 16, 4, "#B4643A");
    for (var fl = x; fl < x + p.w; fl += 12){ circ(ctx, fl + 6, p.y - 6, 4, (fl / 12 | 0) % 2 ? p.flow : "#FF8A3D"); circ(ctx, fl + 6, p.y - 6, 1.4, "#FFF6C0"); }
  }
}
function drawFoe(o){
  var x = o.x - camX; if (x < -60 || x > W + 60) return;
  if (o.t === "chim"){
    rr(ctx, x - o.w / 2, o.y - o.h, o.w, o.h, 3, "#C8473A");
    ctx.fillStyle = "rgba(0,0,0,.15)"; for (var by = o.y - o.h + 8; by < o.y; by += 9) ctx.fillRect(x - o.w / 2, by, o.w, 2);
    rr(ctx, x - o.w / 2 - 4, o.y - o.h - 6, o.w + 8, 9, 3, "#8E2E28");
    for (var s = 0; s < 3; s++){ var ph = (tt * .7 + s / 3) % 1; ctx.globalAlpha = .55 * (1 - ph); circ(ctx, x + Math.sin(ph * 6 + s) * 6, o.y - o.h - 12 - ph * 50, 6 + ph * 10, "#FFFFFF"); }
    ctx.globalAlpha = 1;
  } else if (o.t === "pud"){
    ell(ctx, x, o.y - 2, o.w / 2, 5, "#58B8F0"); ell(ctx, x - 6, o.y - 3, o.w / 4, 2, "rgba(255,255,255,.7)");
    var rp = (tt * 1.2) % 1; ctx.strokeStyle = "rgba(255,255,255," + (.6 * (1 - rp)) + ")"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(x + 6, o.y - 2, 4 + rp * 10, 1.5 + rp * 3, 0, 0, 6.28); ctx.stroke();
  } else {
    var y = o.t === "fly" ? o.y + 10 : o.y, flap = o.t === "fly" || o.gone ? Math.sin(tt * 20) * 8 : 0;
    ctx.save(); ctx.translate(x, y);
    ell(ctx, 0, -10, 15, 10, "#9AA6C8"); ell(ctx, 3, -8, 9, 6, "#C9D2EC");
    ell(ctx, -4, -12 - flap * .5, 9, 5 + Math.abs(flap) * .3, "#7E8AB0", -.3);
    circ(ctx, -12, -18, 7, "#8C98BE"); ell(ctx, -12, -13, 5, 3, "#6FC9A8");
    ctx.fillStyle = "#FFB43D"; ctx.beginPath(); ctx.moveTo(-18, -18); ctx.lineTo(-23, -16); ctx.lineTo(-18, -15); ctx.fill();
    if (o.gone){ circ(ctx, -14, -19, 1.6, "#222"); }
    else { line(ctx, [-16, -19, -12, -19], "#333", 1.2); }
    ctx.fillStyle = "#FF8A9A"; ctx.fillRect(-4, -1, 2, 2); ctx.fillRect(3, -1, 2, 2);
    if (!o.gone){ ctx.font = "700 11px Oswald, sans-serif"; ctx.fillStyle = "rgba(255,255,255,.95)"; ctx.textAlign = "center"; var zz = (tt + o.z) % 2; ctx.globalAlpha = 1 - zz / 2; ctx.fillText("z", -6 + zz * 6, -30 - zz * 10); ctx.fillText("z", 2 + zz * 4, -38 - zz * 8); ctx.globalAlpha = 1; }
    ctx.restore();
  }
}
function drawItem(it){
  var x = it.x - camX; if (x < -30 || x > W + 30) return;
  var y = it.y + Math.sin(tt * 4 + it.ph) * 4, s = it.got ? 1 + it.got : 1;
  ctx.save(); ctx.translate(x, it.got ? y - it.got * 30 : y); ctx.scale(s, s); if (it.got) ctx.globalAlpha = Math.max(0, 1 - it.got);
  var gl = ctx.createRadialGradient(0, 0, 2, 0, 0, 20); gl.addColorStop(0, "rgba(255,255,255,.55)"); gl.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gl; ctx.fillRect(-20, -20, 40, 40);
  if (it.t === "yarn"){
    circ(ctx, 0, 0, 10, it.c);
    ctx.strokeStyle = "rgba(255,255,255,.55)"; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(-3, -2, 8, -.6, 1.4); ctx.stroke(); ctx.beginPath(); ctx.arc(3, 3, 7, 2.4, 4.4); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-8, 4); ctx.quadraticCurveTo(0, -2, 8, -5); ctx.stroke();
    line(ctx, [8, 6, 14, 10, 12, 15], it.c, 1.6);
  } else if (it.t === "fish"){
    ctx.rotate(Math.sin(tt * 5 + it.ph) * .2);
    ell(ctx, 0, 0, 12, 7, "#59C8F5"); ctx.fillStyle = "#2E9FD8"; ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(19, -7); ctx.lineTo(19, 7); ctx.fill();
    ell(ctx, -2, 2, 7, 3, "#BFEFFF"); circ(ctx, -6, -2, 2, "#fff"); circ(ctx, -6.4, -2, 1, "#123");
    ctx.strokeStyle = "rgba(255,255,255,.6)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(2, 0, 4, -1, 1); ctx.stroke();
  } else {
    ctx.rotate(Math.sin(tt * 6) * .25);
    ctx.fillStyle = "#FFC21F"; ctx.beginPath(); ctx.moveTo(-10, 7); ctx.quadraticCurveTo(-10, -11, 0, -11); ctx.quadraticCurveTo(10, -11, 10, 7); ctx.closePath(); ctx.fill();
    rr(ctx, -12, 5, 24, 4, 2, "#E59A0C"); circ(ctx, 0, 11, 3, "#B86A00"); circ(ctx, 0, -13, 3, "#E59A0C");
    ell(ctx, -4, -4, 2.5, 5, "rgba(255,255,255,.6)");
    star(14, -12, 4, "#FFFFFF");
  }
  ctx.restore();
}
function hud(){
  var sc = $("scoreV"); var v = Math.floor(score); if (sc._v !== v){ sc._v = v; sc.textContent = v; }
  ctx.font = "16px system-ui, sans-serif"; ctx.textAlign = "left";
  var top = 58;
  for (var i = 0; i < 3; i++){ ctx.globalAlpha = i < hearts ? 1 : .25; ctx.fillText("❤️", 12 + i * 22, top + 6); }
  ctx.globalAlpha = 1;
  if (mult > 1){
    ctx.font = "700 20px Oswald, sans-serif"; ctx.textAlign = "center"; ctx.lineWidth = 5; ctx.strokeStyle = "rgba(90,10,60,.8)";
    var t = "×" + mult + "  ·  " + combo, pul = 1 + Math.sin(tt * 10) * .06;
    ctx.save(); ctx.translate(W / 2, 92); ctx.scale(pul, pul); ctx.strokeText(t, 0, 0); ctx.fillStyle = "#FFE36B"; ctx.fillText(t, 0, 0); ctx.restore();
    ctx.fillStyle = "rgba(255,255,255,.35)"; ctx.fillRect(W / 2 - 40, 100, 80, 4); ctx.fillStyle = "#FF5C8A"; ctx.fillRect(W / 2 - 40, 100, 80 * Math.max(0, comboT / 2.2), 4);
  }
  if (magnet > 0){ ctx.textAlign = "left"; ctx.font = "18px system-ui"; ctx.fillText("🔔", 12, top + 32); ctx.fillStyle = "rgba(255,255,255,.35)"; ctx.fillRect(36, top + 22, 50, 6); ctx.fillStyle = "#FFD23F"; ctx.fillRect(36, top + 22, 50 * magnet / 6, 6); }
}

/* ---------- flow ---------- */
function show(id, on){ $(id).hidden = !on; }
function start(){
  audio(); reset(); mode = "play"; SFX.start();
  show("menu", false); show("over", false); show("pauseOv", false); show("hud", true); $("pauseBtn").hidden = false;
  try { window.goatcounter && goatcounter.count && goatcounter.count({path: "kattesprang-preview-start-" + LANG, title: "kattesprang preview start", event: true}); } catch(e){}
}
function pause(){ if (mode !== "play") return; mode = "pause"; show("pauseOv", true); }
function resume(){ if (mode !== "pause") return; mode = "play"; show("pauseOv", false); last = performance.now(); }
function gameOver(why){
  mode = "over"; SFX.over();
  var s = Math.floor(score), rec = s > best; if (rec){ best = s; lsSet(BKEY, String(best)); }
  $("finalV").textContent = s; $("bestO").textContent = best; $("recB").hidden = !rec;
  $("distV").textContent = Math.floor(dist / 10) + " m"; $("itemsV").textContent = caught; $("comboV").textContent = bestCombo;
  $("copied").textContent = ""; $("bestM").textContent = best;
  show("hud", false); $("pauseBtn").hidden = true;
  setTimeout(function(){ show("over", true); }, 650);
  try { window.goatcounter && goatcounter.count && goatcounter.count({path: "kattesprang-preview-over-" + LANG, title: "kattesprang preview over " + why, event: true}); } catch(e){}
}
function shareText(){ return T.name + "\n🐱\n" + Math.floor(score) + "\nstop60.no"; }
$("shareBtn").onclick = function(){
  var txt = shareText(), done = function(){ $("copied").textContent = T.copied; };
  try { window.goatcounter && goatcounter.count && goatcounter.count({path: "kattesprang-preview-share", title: "kattesprang preview share", event: true}); } catch(e){}
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, function(){ fallback(txt); done(); });
  else { fallback(txt); done(); }
};
function fallback(txt){ var ta = document.createElement("textarea"); ta.value = txt; ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); } catch(e){} document.body.removeChild(ta); }
$("playBtn").onclick = start; $("againBtn").onclick = start;
$("pauseBtn").onclick = function(){ if (mode === "play") pause(); };
$("resumeBtn").onclick = resume;
function setMute(m){ mute = m; lsSet(MKEY, m ? "1" : "0"); $("muteBtn").textContent = m ? "🔇" : "🔊"; }
$("muteBtn").onclick = function(){ audio(); setMute(!mute); };
setMute(mute);
$("bestM").textContent = best;
document.addEventListener("visibilitychange", function(){ if (document.hidden) pause(); });
// hero cat on the menu card
(function(){ var hc = $("hero"); if (!hc) return; var hx = hc.getContext("2d"), d = Math.min(window.devicePixelRatio || 1, 2); hc.width = 150 * d; hc.height = 110 * d;
  function h(){ hx.setTransform(d, 0, 0, d, 0, 0); hx.clearRect(0, 0, 150, 110); var b = Math.abs(Math.sin(performance.now() / 380)) * 14;
    ell(hx, 70, 102, 34 - b, 5, "rgba(0,0,0,.25)"); drawMagic(hx, 66, 100 - b, 1.55, {t: performance.now() / 1000, air: b > 3, vy: -200, squash: 0, blink: false});
    if (!$("menu").hidden || !$("over").hidden) requestAnimationFrame(h); else setTimeout(function(){ requestAnimationFrame(h); }, 400); }
  h(); })();
reset();
requestAnimationFrame(loop);
})();
