/* Stop60 cameos: now and then a friendly face peeks in at the screen edge during play
   (Magic the cat, Grandma knitting, the UFO crew and, at Christmas, Santa, a reindeer and Santa's sleigh).
   Include: <script src="/assets/s60-cameo.js?v=1" data-game="redning" data-need="#hud" data-block=".ov" defer></script>
   Play state (pick one):
     data-play="JS expression"  - truthy while a round is being played (globals / stores)
     data-need="SEL,SEL"        - all of these must be visible
     data-block="SEL,SEL"       - none of these may be visible
   Sound (pick one; sound is off when nothing is given):
     data-sound="JS expression" - truthy when the game's sound is on
     data-ls="key:prop"         - sound is on unless JSON localStorage[key][prop] is true (e.g. a mute flag)
     data-ls="key=0"            - sound is off when localStorage[key] === "0"
     data-snd="1"               - the game has no sound toggle, sound is always on
   data-top="px": keep the sleigh at least this far from the top (past the HUD).
   Christmas cast runs 15.11-26.12 (override with ?xmas=1 / ?xmas=0). Purely visual: pointer-events:none,
   never touches game state, draws only while a cameo is on screen. */
(function () {
  'use strict';
  if (window.__s60cameo) return; window.__s60cameo = 1;
  var sc = document.currentScript || document.querySelector('script[src*="s60-cameo.js"]');
  var ds = (sc && sc.dataset) || {};
  var W = window, D = document;
  var qs = (function () { try { return new URLSearchParams(location.search); } catch (e) { return { get: function () { return null; } }; } })();

  /* ---------- season ---------- */
  function isXmas(d) { var m = d.getMonth(), day = d.getDate(); return (m === 10 && day >= 15) || (m === 11 && day <= 26); }
  var XMAS = qs.get('xmas') === '1' ? true : qs.get('xmas') === '0' ? false : isXmas(new Date());
  W.S60_XMAS = XMAS;

  /* ---------- language ---------- */
  function lang() {
    var l = (D.documentElement.getAttribute('data-lang') || D.documentElement.lang || '').toLowerCase();
    if (/^pl/.test(l)) return 'pl';
    if (/^en/.test(l)) return 'en';
    if (/^(nb|nn|no)/.test(l)) return 'no';
    var p = location.pathname;
    if (/\/pl\//.test(p) || /^\/prad\//.test(p)) return 'pl';
    if (/\/en\//.test(p) || /^\/power\//.test(p)) return 'en';
    return 'no';
  }
  var TXT = {
    magic: { no: ['Mjau!', 'Mjau, mjau!'], en: ['Meow!', 'Meow, meow!'], pl: ['Miau!', 'Miau, miau!'] },
    grandma: { no: ['Strikk, strikk\u2026'], en: ['Knit, knit\u2026'], pl: ['Dziergam, dziergam\u2026'] },
    grandmaX: { no: ['Strikk, strikk\u2026', 'God jul, vennen!'], en: ['Knit, knit\u2026', 'Merry Christmas, dear!'], pl: ['Dziergam, dziergam\u2026', 'Weso\u0142ych \u015awi\u0105t, kochanie!'] },
    santa: { no: ['Ho ho ho!', 'God jul!'], en: ['Ho ho ho!', 'Merry Christmas!'], pl: ['Ho ho ho!', 'Weso\u0142ych \u015awi\u0105t!'] },
    reindeer: { no: ['Hei! God jul!'], en: ['Hi! Merry Christmas!'], pl: ['Cze\u015b\u0107! Weso\u0142ych \u015awi\u0105t!'] },
    ufo: { no: ['Hei, jordboere!'], en: ['Hi, earthlings!'], pl: ['Cze\u015b\u0107, Ziemianie!'] },
    sleigh: { no: ['Ho ho ho! God jul!'], en: ['Ho ho ho! Merry Christmas!'], pl: ['Ho ho ho! Weso\u0142ych \u015awi\u0105t!'] }
  };
  function say(k) { var a = (TXT[k] || TXT.magic)[lang()]; return a[(Math.random() * a.length) | 0]; }

  /* ---------- play + sound state (read only) ---------- */
  function fn(expr) { if (!expr) return null; try { return new Function('try{return !!(' + expr + ')}catch(e){return false}'); } catch (e) { return function () { return false; }; } }
  var playFn = fn(ds.play), soundFn = fn(ds.sound);
  var need = (ds.need || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean);
  var block = (ds.block || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean);
  function vis(el) {
    if (!el || el.hidden) return false;
    if (!el.getClientRects().length) return false;
    var cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity < 0.05) return false;
    var r = el.getBoundingClientRect(); return r.width > 2 && r.height > 2;
  }
  function anyVis(sel) { var l; try { l = D.querySelectorAll(sel); } catch (e) { return false; } for (var i = 0; i < l.length; i++) if (vis(l[i])) return true; return false; }
  function playing() {
    if (D.hidden) return false;
    if (playFn && !playFn()) return false;
    for (var i = 0; i < need.length; i++) if (!anyVis(need[i])) return false;
    for (var j = 0; j < block.length; j++) if (anyVis(block[j])) return false;
    return !!(playFn || need.length || block.length);
  }
  function soundOn() {
    if (soundFn) return soundFn();
    if (ds.ls) {
      try {
        var m = /^([^:=]+)([:=])(.+)$/.exec(ds.ls); if (!m) return false;
        var v = localStorage.getItem(m[1]);
        if (m[2] === '=') return v !== m[3];
        if (v == null) return true;
        var o = JSON.parse(v); return !(o && o[m[3]]);
      } catch (e) { return false; }
    }
    return ds.snd === '1';
  }

  /* ---------- reduced motion ---------- */
  var RM = false; try { var mq = W.matchMedia('(prefers-reduced-motion: reduce)'); RM = mq.matches; (mq.addEventListener || function () {}).call(mq, 'change', function (e) { RM = e.matches; }); } catch (e) {}

  /* ---------- canvas layer ---------- */
  var cv = null, cx = null, cw = 0, ch = 0, dpr = 1;
  function layer() {
    if (!cv) {
      cv = D.createElement('canvas');
      cv.setAttribute('aria-hidden', 'true');
      cv.style.cssText = 'position:fixed;left:0;top:0;width:100vw;height:100vh;pointer-events:none;z-index:2147482000;display:none;contain:strict';
      D.body.appendChild(cv); cx = cv.getContext('2d');
    }
    var w = W.innerWidth, h = W.innerHeight, r = Math.min(2, W.devicePixelRatio || 1);
    if (w !== cw || h !== ch || r !== dpr) { cw = w; ch = h; dpr = r; cv.width = Math.round(w * r); cv.height = Math.round(h * r); cv.style.width = w + 'px'; cv.style.height = h + 'px'; }
    return cx;
  }

  /* ---------- drawing helpers ---------- */
  function circ(c, x, y, r, f) { c.beginPath(); c.arc(x, y, r, 0, 6.2832); c.fillStyle = f; c.fill(); }
  function ell(c, x, y, rx, ry, f, rot) { c.beginPath(); c.ellipse(x, y, rx, ry, rot || 0, 0, 6.2832); c.fillStyle = f; c.fill(); }
  function line(c, pts, col, w) { c.beginPath(); c.moveTo(pts[0], pts[1]); for (var i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke(); }
  function smile(c, x, y, r, col, w, open) {
    if (open) { c.beginPath(); c.arc(x, y, r, 0.1 * Math.PI, 0.9 * Math.PI); c.closePath(); c.fillStyle = '#5a1e1e'; c.fill(); c.save(); c.clip(); circ(c, x, y + r * 0.95, r * 0.55, '#ff8a95'); c.restore(); }
    c.beginPath(); c.arc(x, y, r, 0.12 * Math.PI, 0.88 * Math.PI); c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.stroke();
  }
  function happyEye(c, x, y, r, col, w) { c.beginPath(); c.arc(x, y + r * 0.5, r, 1.15 * Math.PI, 1.85 * Math.PI); c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.stroke(); }
  function eye(c, x, y, r, iris) { circ(c, x, y, r, '#fff'); circ(c, x, y + r * 0.1, r * 0.68, iris || '#2b2b2b'); circ(c, x, y + r * 0.1, r * 0.36, '#111'); circ(c, x - r * 0.28, y - r * 0.22, r * 0.24, '#fff'); }
  function flake(c, x, y, r, col) { c.save(); c.translate(x, y); c.strokeStyle = col; c.lineWidth = Math.max(1, r * 0.28); c.lineCap = 'round'; for (var i = 0; i < 3; i++) { c.rotate(Math.PI / 3); c.beginPath(); c.moveTo(-r, 0); c.lineTo(r, 0); c.stroke(); } c.restore(); }
  function hat(c, x, y, w, tilt) { // red Santa hat, base centre at x,y, base width w
    c.save(); c.translate(x, y); c.rotate(tilt || 0);
    var g = c.createLinearGradient(-w / 2, 0, w / 2, 0); g.addColorStop(0, '#b3131f'); g.addColorStop(0.5, '#e8283a'); g.addColorStop(1, '#a10f1a');
    c.beginPath(); c.moveTo(-w * 0.48, 0); c.quadraticCurveTo(-w * 0.3, -w * 0.75, w * 0.1, -w * 0.95); c.quadraticCurveTo(w * 0.5, -w * 1.0, w * 0.62, -w * 0.55); c.quadraticCurveTo(w * 0.38, -w * 0.55, w * 0.48, 0); c.closePath(); c.fillStyle = g; c.fill();
    circ(c, w * 0.62, -w * 0.52, w * 0.15, '#fff');
    c.beginPath(); c.moveTo(-w * 0.56, 0); c.quadraticCurveTo(0, -w * 0.12, w * 0.56, 0); c.lineTo(w * 0.56, w * 0.14); c.quadraticCurveTo(0, w * 0.02, -w * 0.56, w * 0.14); c.closePath(); c.fillStyle = '#fff'; c.fill();
    c.restore();
  }
  W.S60SantaHat = hat; // shared with games that put a hat on their own sprites
  function bubble(c, x, y, text, side, u) { // side: +1 bubble to the right of x, -1 to the left
    var fs = Math.max(12, Math.min(16, u * 15));
    c.save(); c.font = '700 ' + fs + 'px system-ui,-apple-system,"Segoe UI",Roboto,sans-serif';
    var tw = c.measureText(text).width, pw = tw + fs * 1.2, ph = fs * 1.9;
    var bx = side > 0 ? x : x - pw, by = y - ph;
    bx = Math.max(4, Math.min(cw - pw - 4, bx)); by = Math.max(4, by);
    c.shadowColor = 'rgba(0,0,0,.35)'; c.shadowBlur = 6; c.shadowOffsetY = 2;
    c.beginPath(); if (c.roundRect) c.roundRect(bx, by, pw, ph, ph / 2); else c.rect(bx, by, pw, ph);
    c.fillStyle = '#fff'; c.fill(); c.shadowColor = 'transparent';
    var tx = side > 0 ? bx + fs * 0.9 : bx + pw - fs * 0.9;
    c.beginPath(); c.moveTo(tx - fs * 0.4, by + ph - 1); c.lineTo(tx + fs * 0.4, by + ph - 1); c.lineTo(tx - side * fs * 0.5, by + ph + fs * 0.6); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(20,20,30,.85)'; c.lineWidth = 1.5; c.beginPath(); if (c.roundRect) c.roundRect(bx, by, pw, ph, ph / 2); else c.rect(bx, by, pw, ph); c.stroke();
    c.fillStyle = '#16161e'; c.textBaseline = 'middle'; c.textAlign = 'left'; c.fillText(text, bx + fs * 0.6, by + ph / 2 + 1);
    c.restore();
  }

  /* ---------- Magic's look (Stop60 standard): polka-dot bow tie, black on even / red on odd Europe/Oslo days ---------- */
  function osloDay(){ try { return +new Intl.DateTimeFormat("en-GB", {timeZone: "Europe/Oslo", day: "numeric"}).format(new Date()); } catch(e){ return new Date().getDate(); } }
  var BOWQ = (function(){ try { return new URLSearchParams(location.search).get("bow"); } catch(e){ return null; } })();
  var BOWK = BOWQ === "black" || BOWQ === "red" ? BOWQ : (osloDay() % 2 === 0 ? "black" : "red");
  var BOWC = BOWK === "black" ? ["#1C1A22", "#34303C", "#0A090D"] : ["#D3263A", "#F04A5C", "#7E1020"];
  function drawBow(c, x, y, k){
    c.save(); c.translate(x, y); c.scale(k, k);
    var col = BOWC[0], hi = BOWC[1], ink = BOWC[2];
    [-1, 1].forEach(function(d){
      c.beginPath(); c.moveTo(d*1.4, -1.1);
      c.quadraticCurveTo(d*4.2, -4.4, d*7.2, -3.4); c.quadraticCurveTo(d*8.4, 0, d*7.2, 3.4);
      c.quadraticCurveTo(d*4.2, 4.4, d*1.4, 1.1); c.closePath();
      c.fillStyle = col; c.fill(); c.lineWidth = .7; c.strokeStyle = ink; c.stroke();
      c.save(); c.clip();
      c.fillStyle = hi; c.beginPath(); c.ellipse(d*4.6, -2.2, 2.6, .9, d*.25, 0, 6.2832); c.fill();
      c.fillStyle = "#FFFFFF"; [[3.2, -1.6], [5.9, -.6], [4.4, 1.7], [6.8, 2.2], [2.4, 1.0], [6.4, -2.6]].forEach(function(q){ c.beginPath(); c.arc(d*q[0], q[1], .62, 0, 6.2832); c.fill(); });
      c.restore();
      c.beginPath(); c.moveTo(d*2.2, -.6); c.quadraticCurveTo(d*3.6, 0, d*2.2, .6); c.lineWidth = .45; c.strokeStyle = ink; c.stroke();
    });
    c.beginPath(); if (c.roundRect) c.roundRect(-1.9, -2, 3.8, 4, 1.3); else c.rect(-1.9, -2, 3.8, 4); c.fillStyle = col; c.fill(); c.lineWidth = .7; c.strokeStyle = ink; c.stroke();
    c.fillStyle = "#FFFFFF"; c.beginPath(); c.arc(-.3, -.4, .55, 0, 6.2832); c.fill();
    c.restore();
  }

  /* ---------- characters (unit box ~ 100 x 140, origin at the face centre, everyone looks at the viewer and smiles) ---------- */
  function drawMagic(c, t) {
    var wave = RM ? 0 : Math.sin(t * 9) * 0.35;
    // body
    ell(c, 0, 62, 34, 30, '#8f5f36'); ell(c, 0, 66, 18, 22, '#c9a27a');
    // waving paw
    c.save(); c.translate(34, 42); c.rotate(0.45 + wave); ell(c, 0, -16, 11, 18, '#9A6A3E'); ell(c, 0, -33, 11.5, 10, '#a87547'); circ(c, -5, -37, 2.6, '#f0b9a0'); circ(c, 0, -39, 2.6, '#f0b9a0'); circ(c, 5, -37, 2.6, '#f0b9a0'); ell(c, 0, -31, 4.2, 3.2, '#f0b9a0'); c.restore();
    // ears
    [-1, 1].forEach(function (d) { c.beginPath(); c.moveTo(d * 34, -14); c.lineTo(d * 36, -54); c.lineTo(d * 8, -34); c.closePath(); c.fillStyle = '#9A6A3E'; c.fill(); c.beginPath(); c.moveTo(d * 29, -20); c.lineTo(d * 31, -44); c.lineTo(d * 14, -32); c.closePath(); c.fillStyle = '#F0B9A0'; c.fill(); });
    // head
    ell(c, 0, 0, 42, 36, '#9A6A3E');
    line(c, [0, -34, 0, -20], '#4A2E16', 4); line(c, [-11, -33, -8, -21], '#4A2E16', 3.5); line(c, [11, -33, 8, -21], '#4A2E16', 3.5);
    [-1, 1].forEach(function (d) { line(c, [d * 41, -4, d * 30, -2], '#4A2E16', 3.5); line(c, [d * 40, 8, d * 30, 7], '#4A2E16', 3.5); });
    ell(c, 0, 16, 20, 14, '#c9a27a');
    // eyes
    [-1, 1].forEach(function (d) { ell(c, d * 16, -6, 8, 9, '#C8F28A'); ell(c, d * 16, -5, 2.6, 7, '#1f2a10'); circ(c, d * 16 - 2.5, -9, 2.2, '#fff'); });
    circ(c, -26, 10, 5, 'rgba(255,140,150,.45)'); circ(c, 26, 10, 5, 'rgba(255,140,150,.45)');
    // nose + happy cat mouth
    c.beginPath(); c.moveTo(-5, 6); c.lineTo(5, 6); c.lineTo(0, 11); c.closePath(); c.fillStyle = '#e88a9a'; c.fill();
    // soft rounded smile (Stop60 standard)
    c.beginPath(); c.moveTo(-10, 13.5); c.bezierCurveTo(-7, 23.5, 7, 23.5, 10, 13.5); c.quadraticCurveTo(0, 16.5, -10, 13.5); c.closePath(); c.fillStyle = '#6a2430'; c.fill();
    ell(c, 0, 18.6, 4.2, 2.6, '#F28C9A');
    c.strokeStyle = '#3a2212'; c.lineWidth = 2.2; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 11); c.lineTo(0, 14); c.stroke();
    // whiskers
    [-1, 1].forEach(function (d) { line(c, [d * 14, 12, d * 38, 8], 'rgba(255,255,255,.8)', 1.2); line(c, [d * 14, 15, d * 38, 16], 'rgba(255,255,255,.8)', 1.2); });
    drawBow(c, 0, 39.5, 2.6); // polka-dot bow tie (black even / red odd Oslo day)
    if (XMAS) hat(c, -14, -30, 34, -0.35);
  }
  function drawGrandma(c, t) {
    var k = RM ? 0 : Math.sin(t * 12) * 0.12;
    // sweater
    var sw = XMAS ? '#c8283a' : '#4f7fc4';
    c.beginPath(); c.moveTo(-44, 92); c.quadraticCurveTo(-46, 36, -18, 26); c.lineTo(18, 26); c.quadraticCurveTo(46, 36, 44, 92); c.closePath(); c.fillStyle = sw; c.fill();
    c.beginPath(); c.moveTo(-14, 26); c.quadraticCurveTo(0, 36, 14, 26); c.lineTo(10, 24); c.quadraticCurveTo(0, 30, -10, 24); c.closePath(); c.fillStyle = XMAS ? '#1f7a3c' : '#2f5c99'; c.fill();
    if (XMAS) {
      // knit band with zigzag, snowflakes and two little reindeer
      c.fillStyle = '#fff'; for (var i = -40; i < 40; i += 8) { c.beginPath(); c.moveTo(i, 50); c.lineTo(i + 4, 45); c.lineTo(i + 8, 50); c.lineTo(i + 4, 47.5); c.closePath(); c.fill(); }
      flake(c, -28, 38, 3.4, '#fff'); flake(c, 28, 38, 3.4, '#fff'); flake(c, 0, 82, 3.4, '#fff'); flake(c, -32, 82, 3, '#fff'); flake(c, 32, 82, 3, '#fff');
      [-17, 17].forEach(function (x) {
        c.fillStyle = '#fff'; ell(c, x, 66, 7, 4); line(c, [x - 5, 68, x - 5, 75], '#fff', 1.6); line(c, [x + 5, 68, x + 5, 75], '#fff', 1.6);
        circ(c, x + 7, 60, 3.2, '#fff'); line(c, [x + 6, 57, x + 4, 52, x + 2, 52], '#fff', 1.2); line(c, [x + 9, 57, x + 11, 52, x + 13, 52], '#fff', 1.2); circ(c, x + 7, 61.5, 1.1, '#ff3b3b');
      });
    }
    // knitting in front: needles, scarf piece, yarn ball
    c.save(); c.translate(0, 58); c.rotate(k);
    c.fillStyle = XMAS ? '#2e9e56' : '#e0b04c'; c.fillRect(-12, -2, 24, 16);
    c.strokeStyle = 'rgba(0,0,0,.2)'; c.lineWidth = 1; for (var r = 1; r < 16; r += 4) { c.beginPath(); c.moveTo(-12, r); c.lineTo(12, r); c.stroke(); }
    line(c, [-30, 10, 16, -14], '#d9c79a', 2.6); line(c, [30, 10, -16, -14], '#d9c79a', 2.6); circ(c, 16, -14, 2.4, '#b07a3a'); circ(c, -16, -14, 2.4, '#b07a3a');
    c.restore();
    circ(c, 34, 86, 9, XMAS ? '#2e9e56' : '#e0b04c'); line(c, [28, 82, 38, 90], 'rgba(0,0,0,.25)', 1.2); line(c, [30, 92, 40, 84], 'rgba(0,0,0,.25)', 1.2);
    c.beginPath(); c.moveTo(26, 84); c.quadraticCurveTo(14, 78, 8, 70); c.strokeStyle = XMAS ? '#2e9e56' : '#e0b04c'; c.lineWidth = 1.4; c.stroke();
    // hands
    circ(c, -24, 60 + k * 20, 6, '#f2c9a5'); circ(c, 24, 60 - k * 20, 6, '#f2c9a5');
    // head + hair
    circ(c, 0, -14, 32, '#d8d8e0'); circ(c, 0, -50, 13, '#d8d8e0');
    circ(c, 0, -6, 27, '#f2c9a5');
    c.beginPath(); c.arc(0, -14, 29, Math.PI * 1.05, Math.PI * 1.95); c.quadraticCurveTo(0, -22, -27, -24); c.fillStyle = '#e4e4ea'; c.fill();
    // glasses + happy eyes
    happyEye(c, -11, -8, 5, '#3b2a1a', 2.4); happyEye(c, 11, -8, 5, '#3b2a1a', 2.4);
    c.strokeStyle = '#7a4f2a'; c.lineWidth = 2; c.beginPath(); c.arc(-11, -6, 8.5, 0, 6.3); c.stroke(); c.beginPath(); c.arc(11, -6, 8.5, 0, 6.3); c.stroke(); line(c, [-3, -7, 3, -7], '#7a4f2a', 2);
    circ(c, -18, 6, 5, 'rgba(240,110,120,.45)'); circ(c, 18, 6, 5, 'rgba(240,110,120,.45)');
    ell(c, 0, 3, 3.5, 3, '#e4a888');
    smile(c, 0, 6, 10, '#7a2a2a', 2.6, true);
  }
  function drawSanta(c, t) {
    var wave = RM ? 0 : Math.sin(t * 8) * 0.4;
    // coat
    c.beginPath(); c.moveTo(-46, 96); c.quadraticCurveTo(-48, 34, -16, 24); c.lineTo(16, 24); c.quadraticCurveTo(48, 34, 46, 96); c.closePath(); c.fillStyle = '#d42232'; c.fill();
    c.fillStyle = '#fff'; c.fillRect(-5, 30, 10, 66); c.fillStyle = '#1c1c1c'; c.fillRect(-46, 72, 92, 10); c.strokeStyle = '#f2c14e'; c.lineWidth = 3; c.strokeRect(-8, 71, 16, 12);
    // waving arm
    c.save(); c.translate(-36, 38); c.rotate(2.75 + wave); c.fillStyle = '#d42232'; c.fillRect(-7, 0, 14, 36); c.fillStyle = '#fff'; c.fillRect(-8, 30, 16, 7); circ(c, 0, 44, 9, '#f5f5f5'); c.restore();
    // face
    circ(c, 0, -10, 25, '#f6c8a8');
    // beard
    c.fillStyle = '#fff'; [[-22, 6, 12], [22, 6, 12], [-14, 20, 14], [14, 20, 14], [0, 26, 15], [0, 12, 14]].forEach(function (b) { circ(c, b[0], b[1], b[2], '#fff'); });
    // open smile inside the beard
    c.beginPath(); c.arc(0, 6, 9, 0.05 * Math.PI, 0.95 * Math.PI); c.closePath(); c.fillStyle = '#6a1f1f'; c.fill(); c.save(); c.clip(); circ(c, 0, 14, 5, '#ff7f8c'); c.restore();
    // moustache
    ell(c, -9, 2, 10, 5, '#fff', 0.25); ell(c, 9, 2, 10, 5, '#fff', -0.25);
    ell(c, 0, -3, 5, 4.4, '#ee9c8a');
    happyEye(c, -10, -13, 5, '#2b1a10', 2.6); happyEye(c, 10, -13, 5, '#2b1a10', 2.6);
    line(c, [-15, -22, -5, -23], '#fff', 3.4); line(c, [5, -23, 15, -22], '#fff', 3.4);
    circ(c, -16, -4, 4.5, 'rgba(240,90,100,.5)'); circ(c, 16, -4, 4.5, 'rgba(240,90,100,.5)');
    hat(c, 0, -28, 54, 0.05);
  }
  function deerHead(c, x, y, s, rudolph, blink) {
    c.save(); c.translate(x, y); c.scale(s, s);
    // antlers
    [-1, 1].forEach(function (d) { line(c, [d * 10, -18, d * 18, -36, d * 28, -44], '#D8B98A', 4); line(c, [d * 16, -31, d * 26, -30], '#D8B98A', 3.4); line(c, [d * 20, -39, d * 18, -50], '#D8B98A', 3.4); });
    // ears
    ell(c, -22, -10, 10, 5, '#7a4c2a', -0.5); ell(c, 22, -10, 10, 5, '#7a4c2a', 0.5);
    ell(c, 0, 0, 20, 22, '#8B5A33');
    ell(c, 0, 12, 14, 11, '#c49a6c');
    eye(c, -8, -6, 5, '#4a2a14'); eye(c, 8, -6, 5, '#4a2a14');
    circ(c, -14, 6, 3.4, 'rgba(240,110,120,.45)'); circ(c, 14, 6, 3.4, 'rgba(240,110,120,.45)');
    if (rudolph) { c.save(); c.shadowColor = '#ff3b3b'; c.shadowBlur = 10 * (blink ? 1.4 : 1); circ(c, 0, 6, 5.5, '#FF3B3B'); c.restore(); circ(c, -1.6, 4.4, 1.6, '#ffc0c0'); }
    else ell(c, 0, 6, 5, 3.6, '#3a2210');
    smile(c, 0, 11, 6.5, '#3a2210', 2, true);
    c.restore();
  }
  function drawReindeer(c, t) {
    ell(c, 0, 62, 30, 30, '#7d4f2c'); ell(c, 0, 66, 15, 22, '#c49a6c');
    c.fillStyle = '#d42232'; c.fillRect(-24, 30, 48, 9); c.fillStyle = '#fff'; for (var i = -22; i < 24; i += 8) c.fillRect(i, 31, 4, 7);
    c.fillStyle = '#d42232'; c.fillRect(10, 36, 9, 24);
    deerHead(c, 0, 0, 1.45, true, !RM && Math.sin(t * 7) > 0);
  }
  function saucer(c, t, scale, hatOn) {
    c.save(); c.scale(scale, scale);
    // aliens in the dome
    var wave = RM ? 0 : Math.sin(t * 8) * 0.5;
    c.save(); c.beginPath(); c.ellipse(0, -8, 34, 32, 0, Math.PI, 0); c.closePath(); c.clip();
    [[-14, 0], [14, 1]].forEach(function (a) {
      var x = a[0];
      line(c, [x - 5, -26, x - 9, -36], '#2fae73', 2); circ(c, x - 9, -36, 2.6, '#ffe36a'); line(c, [x + 5, -26, x + 9, -36], '#2fae73', 2); circ(c, x + 9, -36, 2.6, '#ffe36a');
      ell(c, x, -14, 12, 13, '#59E3A0');
      ell(c, x - 5, -16, 4, 5, '#111'); ell(c, x + 5, -16, 4, 5, '#111'); circ(c, x - 6, -18, 1.4, '#fff'); circ(c, x + 4, -18, 1.4, '#fff');
      smile(c, x, -10, 5, '#1d6b45', 1.8, true);
      if (a[1]) { c.save(); c.translate(x + 12, -6); c.rotate(-0.6 + wave); line(c, [0, 0, 0, -12], '#59E3A0', 4); circ(c, 0, -13, 3.4, '#59E3A0'); c.restore(); }
    });
    c.restore();
    c.beginPath(); c.ellipse(0, -8, 34, 32, 0, Math.PI, 0); c.closePath(); c.fillStyle = 'rgba(170,225,255,.28)'; c.fill(); c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 1.6; c.stroke();
    c.beginPath(); c.ellipse(-12, -26, 8, 4, -0.5, 0, 6.3); c.fillStyle = 'rgba(255,255,255,.45)'; c.fill();
    var g = c.createLinearGradient(0, -12, 0, 14); g.addColorStop(0, '#C9D3E8'); g.addColorStop(1, '#5D6A8A');
    ell(c, 0, 2, 58, 15, g); ell(c, 0, -3, 46, 6, 'rgba(255,255,255,.35)');
    for (var i = 0; i < 6; i++) { var on = RM ? i % 2 : ((t * 6 + i) | 0) % 2; circ(c, -40 + i * 16, 6, 3.4, on ? '#ffd84a' : '#ff5a6a'); }
    if (hatOn) hat(c, 4, -38, 34, 0.2);
    c.restore();
  }
  function drawUfo(c, t) { c.translate(0, RM ? 0 : Math.sin(t * 4) * 3); saucer(c, t, 1, XMAS); }
  var CHAR = { magic: drawMagic, grandma: drawGrandma, santa: drawSanta, reindeer: drawReindeer, ufo: drawUfo };

  /* sleigh: Santa waving from his sleigh, a team of four reindeer led by the red nose, flying across the top */
  function drawTeam(c, t, u) {
    var gal = RM ? 0 : t * 11;
    // trail of sparkles
    if (!RM) for (var s = 0; s < 8; s++) { var a = 1 - s / 8; c.globalAlpha = a * 0.8; flake(c, -170 - s * 16, -6 + Math.sin(t * 5 + s) * 8, 3 + a * 2, '#fff7c2'); }
    c.globalAlpha = 1;
    var deer = [[150, 0, true], [100, 4, false], [50, 0, false], [0, 4, false]];
    // harness
    line(c, [-92, 2, 0, 6, 50, 2, 100, 6, 150, 2], '#c9a227', 2.2);
    deer.forEach(function (d, i) {
      var x = d[0], y = d[1] + (RM ? 0 : Math.sin(gal + i * 1.3) * 3), ph = gal + i * 1.3;
      // legs (galloping)
      [[-12, 0], [-6, 1], [10, 2], [16, 3]].forEach(function (L) { var sw = Math.sin(ph + L[1] * 1.6) * 0.6; line(c, [x + L[0], y + 6, x + L[0] + Math.sin(sw) * 12, y + 20], '#5e3a1f', 3); });
      ell(c, x, y, 22, 10, '#8B5A33'); ell(c, x - 18, y - 3, 4, 3, '#f3e6d2');
      c.fillStyle = '#d42232'; c.fillRect(x - 6, y - 10, 4, 20);
      line(c, [x + 14, y - 4, x + 20, y - 16], '#8B5A33', 8);
      deerHead(c, x + 22, y - 22, 0.62, d[2], !RM && Math.sin(t * 7) > 0);
    });
    // sleigh
    c.save(); c.translate(-130, 0);
    line(c, [-44, 26, 40, 26], '#f2c14e', 3.4); c.beginPath(); c.arc(44, 18, 8, -1.2, 1.57); c.strokeStyle = '#f2c14e'; c.lineWidth = 3.4; c.stroke(); line(c, [-26, 18, -26, 26], '#f2c14e', 2.4); line(c, [24, 18, 24, 26], '#f2c14e', 2.4);
    // sack with presents
    ell(c, -26, -14, 18, 16, '#8a5a2b'); c.fillStyle = '#2e9e56'; c.fillRect(-38, -30, 12, 12); c.fillStyle = '#2f6fd1'; c.fillRect(-24, -34, 12, 14); line(c, [-18, -34, -18, -20], '#ffd84a', 2);
    // Santa (facing us, waving)
    var wave = RM ? 0 : Math.sin(t * 8) * 0.45;
    ell(c, 6, -12, 20, 18, '#d42232');
    c.save(); c.translate(18, -18); c.rotate(-0.4 + wave); c.fillStyle = '#d42232'; c.fillRect(-4, -22, 8, 22); circ(c, 0, -24, 5.5, '#f5f5f5'); c.restore();
    circ(c, 6, -36, 13, '#f6c8a8');
    [[-6, -28, 7], [18, -28, 7], [0, -22, 8], [12, -22, 8], [6, -19, 8]].forEach(function (b) { circ(c, b[0], b[1], b[2], '#fff'); });
    c.beginPath(); c.arc(6, -28, 5, 0.05 * Math.PI, 0.95 * Math.PI); c.closePath(); c.fillStyle = '#6a1f1f'; c.fill();
    ell(c, 1, -31, 5, 2.6, '#fff', 0.25); ell(c, 11, -31, 5, 2.6, '#fff', -0.25);
    happyEye(c, 1, -39, 2.8, '#2b1a10', 1.8); happyEye(c, 11, -39, 2.8, '#2b1a10', 1.8);
    hat(c, 6, -47, 28, 0.1);
    // sleigh body
    var g = c.createLinearGradient(0, -4, 0, 22); g.addColorStop(0, '#e0303f'); g.addColorStop(1, '#8e0f19');
    c.beginPath(); c.moveTo(-46, -6); c.lineTo(30, -6); c.quadraticCurveTo(52, -6, 50, -22); c.quadraticCurveTo(62, -4, 40, 18); c.lineTo(-40, 18); c.quadraticCurveTo(-50, 8, -46, -6); c.closePath(); c.fillStyle = g; c.fill();
    c.strokeStyle = '#f2c14e'; c.lineWidth = 2.4; c.stroke(); flake(c, -8, 6, 5, '#f2c14e');
    c.restore();
  }

  /* ---------- sound: synthesised, no samples ---------- */
  var AC = null, master = null;
  function unlock() {
    try {
      if (!AC) { var C = W.AudioContext || W.webkitAudioContext; if (!C) return; AC = new C(); master = AC.createGain(); master.gain.value = 0.22; master.connect(AC.destination); }
      if (AC.state === 'suspended') AC.resume();
    } catch (e) {}
  }
  ['pointerdown', 'touchstart', 'keydown'].forEach(function (ev) { W.addEventListener(ev, unlock, { capture: true, passive: true }); });
  function audioOK() { return AC && AC.state === 'running' && soundOn() && !D.hidden; }
  function hoho(at, n) { // a warm, deep, cheerful "ho" n times
    var t0 = AC.currentTime + (at || 0);
    for (var i = 0; i < n; i++) {
      var t = t0 + i * 0.3, f = 150 - i * 14 + (i === n - 1 ? -8 : 0), dur = i === n - 1 ? 0.42 : 0.24;
      var o = AC.createOscillator(), o2 = AC.createOscillator(), g = AC.createGain(), f1 = AC.createBiquadFilter(), f2 = AC.createBiquadFilter(), mix = AC.createGain();
      o.type = 'sawtooth'; o2.type = 'triangle';
      o.frequency.setValueAtTime(f * 1.12, t); o.frequency.exponentialRampToValueAtTime(f * 0.86, t + dur);
      o2.frequency.setValueAtTime(f * 1.12, t); o2.frequency.exponentialRampToValueAtTime(f * 0.86, t + dur);
      f1.type = 'bandpass'; f1.frequency.value = 480; f1.Q.value = 5; f2.type = 'bandpass'; f2.frequency.value = 820; f2.Q.value = 7;
      mix.gain.value = 1;
      o.connect(f1); o.connect(f2); o2.connect(mix); f1.connect(g); f2.connect(g); mix.connect(g);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.9, t + 0.04); g.gain.setValueAtTime(0.9, t + dur * 0.55); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      g.connect(master);
      o.start(t); o2.start(t); o.stop(t + dur + 0.05); o2.stop(t + dur + 0.05);
      // breathy "h"
      var nb = AC.createBuffer(1, Math.floor(AC.sampleRate * 0.08), AC.sampleRate), dd = nb.getChannelData(0); for (var k = 0; k < dd.length; k++) dd[k] = (Math.random() * 2 - 1) * (1 - k / dd.length);
      var ns = AC.createBufferSource(), nf = AC.createBiquadFilter(), ng = AC.createGain(); ns.buffer = nb; nf.type = 'bandpass'; nf.frequency.value = 1200; nf.Q.value = 0.8; ng.gain.value = 0.25;
      ns.connect(nf); nf.connect(ng); ng.connect(master); ns.start(t - 0.03);
    }
  }
  function bells(at, len) { // light sleigh bells
    var t0 = AC.currentTime + (at || 0), parts = [2637, 3951, 5274, 6645];
    for (var t = 0; t < len; t += 0.09 + Math.random() * 0.06) {
      var tt = t0 + t, v = 0.05 + Math.random() * 0.05, base = 0.92 + Math.random() * 0.16;
      parts.forEach(function (p, i) {
        var o = AC.createOscillator(), g = AC.createGain(); o.type = 'sine'; o.frequency.value = p * base;
        g.gain.setValueAtTime(0.0001, tt); g.gain.exponentialRampToValueAtTime(v / (i + 1), tt + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, tt + 0.16 - i * 0.025);
        o.connect(g); g.connect(master); o.start(tt); o.stop(tt + 0.2);
      });
    }
  }
  function playSleighSound() { if (!audioOK()) return; try { bells(0, 2.6); hoho(0.7, 3); } catch (e) {} }
  function playSantaSound() { if (!audioOK()) return; try { hoho(0.15, 3); bells(0, 0.8); } catch (e) {} }
  function soundGuard() { if (master && AC) { var on = soundOn() && !D.hidden; master.gain.setTargetAtTime(on ? 0.22 : 0, AC.currentTime, 0.02); } }

  /* ---------- cameo life cycle ---------- */
  var cur = null; // {kind, side, y, t, dur, text}
  function size() { return Math.max(46, Math.min(88, Math.min(cw || W.innerWidth, ch || W.innerHeight) * 0.13)); }
  function start(kind) {
    layer();
    var u = size() / 100;
    if (kind === 'sleigh') {
      var top = Math.max(+ds.top || 0, 64 + 0.04 * ch);
      cur = { kind: 'sleigh', dir: Math.random() < 0.5 ? 1 : -1, y: Math.min(top + 46 * u * 0.9, ch * 0.3), t: 0, dur: RM ? 2.6 : 4.2, text: say('sleigh'), u: u * 1.05 };
      playSleighSound();
    } else {
      cur = { kind: kind, side: Math.random() < 0.5 ? -1 : 1, y: ch * (0.3 + Math.random() * 0.3), t: 0, dur: 2.7, text: say(kind === 'grandma' && XMAS ? 'grandmaX' : kind), u: u };
      if (kind === 'santa') playSantaSound();
    }
    cv.style.display = 'block'; frame.last = 0; requestAnimationFrame(frame);
  }
  function stop() { cur = null; if (cv) { cx.setTransform(1, 0, 0, 1, 0, 0); cx.clearRect(0, 0, cv.width, cv.height); cv.style.display = 'none'; } }
  function frame(ts) {
    if (!cur) return;
    if (!playing()) { cv.style.display = 'none'; frame.last = 0; return; } // frozen; resumed by tick()
    cv.style.display = 'block';
    var dt = frame.last ? Math.min(0.05, (ts - frame.last) / 1000) : 0; frame.last = ts; cur.t += dt;
    if (cur.t >= cur.dur) { stop(); return; }
    layer(); soundGuard();
    var c = cx, u = cur.u, t = cur.t;
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height); c.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (cur.kind === 'sleigh') {
      var span = cw + 520 * u, p = RM ? 0.5 : t / cur.dur, x = cur.dir > 0 ? -260 * u + p * span : cw + 260 * u - p * span;
      var y = cur.y + (RM ? 0 : Math.sin(t * 3) * 6 * u);
      if (RM) { c.globalAlpha = 1; x = cw / 2; }
      c.save(); c.translate(x, y); c.scale(u * cur.dir, u); drawTeam(c, t, u); c.restore();
      if (t > 0.5 && t < cur.dur - 0.4) bubble(c, x - cur.dir * 120 * u, y - 52 * u, cur.text, cur.dir > 0 ? 1 : -1, u);
    } else {
      var inT = 0.45, outT = 0.45, d = cur.dur, e;
      if (RM) e = 1; else if (t < inT) e = 1 - Math.pow(1 - t / inT, 3); else if (t > d - outT) e = Math.pow(1 - (t - (d - outT)) / outT, 2); else e = 1;
      var halfW = (cur.kind === 'ufo' ? 60 : 48) * u, pad = 8;
      var px = cur.side < 0 ? -halfW + e * (halfW * 2 + pad) : cw + halfW - e * (halfW * 2 + pad);
      var bob = RM ? 0 : Math.sin(t * 5) * 2 * u;
      c.save(); c.translate(px, cur.y + bob); c.scale(u, u); c.rotate(RM ? 0 : cur.side * -0.05 * Math.sin(t * 3)); (CHAR[cur.kind] || drawMagic)(c, t); c.restore();
      if (e > 0.9) bubble(c, px - cur.side * 30 * u, cur.y - 62 * u, cur.text, -cur.side, u);
    }
    requestAnimationFrame(frame);
  }

  /* ---------- scheduler (counts play time only) ---------- */
  var play = 0, idle = 99, sleighAt = 0, sleighDone = false, nextAt = 0, hist = [], wasPlaying = false, lastTick = 0, lastKind = '';
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function newRound() { play = 0; sleighDone = !XMAS; sleighAt = rnd(8, 22); nextAt = rnd(25, 45); hist = []; }
  function budgetOK() { var n = 0; for (var i = 0; i < hist.length; i++) if (play - hist[i] < 60) n++; return n < 2 && (!hist.length || play - hist[hist.length - 1] > 12); }
  function pick() {
    var pool = XMAS ? ['magic', 'grandma', 'santa', 'reindeer', 'ufo', 'magic', 'grandma'] : ['magic', 'grandma', 'ufo', 'magic', 'grandma'];
    var k; do { k = pool[(Math.random() * pool.length) | 0]; } while (k === lastKind && Math.random() < 0.8);
    lastKind = k; return k;
  }
  function tick() {
    var now = performance.now(), dt = lastTick ? Math.min(1, (now - lastTick) / 1000) : 0; lastTick = now;
    var p = false; try { p = playing(); } catch (e) {}
    if (p) {
      if (!wasPlaying && idle >= 8) newRound();
      idle = 0; play += dt;
      if (cur) { if (cv.style.display === 'none') { frame.last = 0; requestAnimationFrame(frame); } }
      else if (play >= 5) {
        if (!sleighDone && play >= sleighAt && budgetOK()) { sleighDone = true; hist.push(play); start('sleigh'); }
        else if (play >= nextAt && budgetOK() && (sleighDone || sleighAt - play > 8)) { hist.push(play); nextAt = play + rnd(25, 45); start(pick()); }
        else if (play >= nextAt) nextAt = play + 3;
      }
    } else {
      idle += dt;
      if (cur && idle >= 8) stop();
    }
    wasPlaying = p;
  }
  function boot() { setInterval(tick, 250); D.addEventListener('visibilitychange', function () { if (AC) { if (D.hidden) AC.suspend && AC.suspend(); else if (wasPlaying) AC.resume && AC.resume(); } tick(); }); }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', boot); else boot();

  /* read-only hooks for testing */
  W.S60Cameo = { show: function (k) { start(k || pick()); }, sleigh: function () { start('sleigh'); }, state: function () { return { playing: playing(), sound: soundOn(), play: play, next: nextAt, sleighAt: sleighAt, sleighDone: sleighDone, cur: cur && cur.kind, xmas: XMAS, hist: hist.slice() }; } };
})();
