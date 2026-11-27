/* Mormors kafé / Kawiarnia Babci / Grandma's Café – Stop60 cozy café rush (preview) */
(function(){
"use strict";
var LANG = (document.documentElement.dataset.lang || "no");
var T = {
 no: {name:"Mormors kafé", sub:"Koselig kafé-kaos med Magic", love:"Spill laget med lidenskap",
  how1:"👵 Gjestene kommer til disken med en bestilling i snakkeboblen",
  how2:"👆 Trykk på kaffe, vaffel, bolle eller syltetøy for å legge dem på brettet – riktig brett serveres av seg selv",
  how3:"⚡ Server raskt på rad for kombo og fyll Kos-rush for dobbel poeng",
  how4:"🐱 Magic dytter av og til frem en gyllen godbit – trykk på den!",
  play:"START · 60 sek", endless:"Uendelig rush · 3 ❤", best:"Rekord", score:"Poeng", time:"Tid", lives:"Liv", combo:"Kombo",
  clear:"Tøm", paused:"Pause", resume:"Fortsett", menu:"Meny", retry:"Spill igjen", share:"🔗 Del resultatet", copied:"Kopiert!",
  over60:"Kafeen stenger!", overE:"Tom for hjerter!", served:"Servert", bestCombo:"Beste kombo", newbest:"Ny rekord!",
  sndOn:"🔊 Lyd på", sndOff:"🔇 Lyd av", rush:"KOS-RUSH", rushOn:"KOS-RUSH ×2!", gold:"Gyllen godbit!", wrong:"Ups – feil vare",
  full:"Brettet er fullt", go:"Kafeen er åpen!", purr:"Mrrr!", left:"Gjesten gikk …", items:["Kaffe","Vaffel","Kanelbolle","Syltetøy"],
  thanks:["Tusen takk!","Nydelig!","Så koselig!","Mmm!","Takk, mormor!"], shareName:"Mormors kafé", title:"Mormors kafé – koselig kafé-spill"},
 pl: {name:"Kawiarnia Babci", sub:"Przytulny kawiarniany pośpiech z Magic", love:"Gry stworzone z pasji",
  how1:"👵 Goście podchodzą do lady z zamówieniem w dymku",
  how2:"👆 Stuknij kawę, gofra, bułeczkę lub dżem, aby położyć je na tacy – pasująca taca wydaje się sama",
  how3:"⚡ Obsługuj szybko pod rząd dla combo i napełnij Przytulny szał, by zdobywać podwójne punkty",
  how4:"🐱 Magic czasem podsuwa złoty smakołyk – stuknij go!",
  play:"START · 60 s", endless:"Bez końca · 3 ❤", best:"Rekord", score:"Punkty", time:"Czas", lives:"Życia", combo:"Combo",
  clear:"Wyczyść", paused:"Pauza", resume:"Graj dalej", menu:"Menu", retry:"Zagraj jeszcze raz", share:"🔗 Udostępnij wynik", copied:"Skopiowano!",
  over60:"Kawiarnia zamknięta!", overE:"Koniec serduszek!", served:"Obsłużeni", bestCombo:"Najlepsze combo", newbest:"Nowy rekord!",
  sndOn:"🔊 Dźwięk wł.", sndOff:"🔇 Dźwięk wył.", rush:"PRZYTULNY SZAŁ", rushOn:"PRZYTULNY SZAŁ ×2!", gold:"Złoty smakołyk!", wrong:"Ups – nie to",
  full:"Taca jest pełna", go:"Kawiarnia otwarta!", purr:"Mrrr!", left:"Gość odszedł…", items:["Kawa","Gofr","Cynamonka","Dżem"],
  thanks:["Dziękuję!","Pyszne!","Ale przytulnie!","Mniam!","Dzięki, babciu!"], shareName:"Kawiarnia Babci", title:"Kawiarnia Babci – przytulna gra w kawiarnię"},
 en: {name:"Grandma's Café", sub:"A cozy café rush with Magic", love:"Games made with passion",
  how1:"👵 Guests come to the counter with an order in their speech bubble",
  how2:"👆 Tap coffee, waffle, bun or jam to put it on the tray – a matching tray serves itself",
  how3:"⚡ Serve fast in a row for a combo and fill the Cozy Rush bar for double points",
  how4:"🐱 Magic sometimes nudges out a golden treat – tap it!",
  play:"START · 60 sec", endless:"Endless Rush · 3 ❤", best:"Best", score:"Score", time:"Time", lives:"Lives", combo:"Combo",
  clear:"Clear", paused:"Paused", resume:"Resume", menu:"Menu", retry:"Play again", share:"🔗 Share result", copied:"Copied!",
  over60:"The café is closing!", overE:"Out of hearts!", served:"Served", bestCombo:"Best combo", newbest:"New best!",
  sndOn:"🔊 Sound on", sndOff:"🔇 Sound off", rush:"COZY RUSH", rushOn:"COZY RUSH ×2!", gold:"Golden treat!", wrong:"Oops – wrong item",
  full:"The tray is full", go:"The café is open!", purr:"Purr!", left:"A guest left…", items:["Coffee","Waffle","Cinnamon bun","Jam"],
  thanks:["Thank you!","Lovely!","So cozy!","Yum!","Thanks, Grandma!"], shareName:"Grandma's Café", title:"Grandma's Café – cozy café game"}
};
var L = T[LANG] || T.no;
function $(id){ return document.getElementById(id); }
function gc(p){ try { window.goatcounter && goatcounter.count && goatcounter.count({path: "kafe-preview-" + p, title: "Kafe preview " + p, event: true}); } catch(e){} }
document.querySelectorAll("[data-t]").forEach(function(el){ var k = el.dataset.t; if (L[k]) el.textContent = L[k]; });

/* ---------- storage ---------- */
function lsGet(k, d){ try { var v = localStorage.getItem("s60kafe_" + k); return v === null ? d : v; } catch(e){ return d; } }
function lsSet(k, v){ try { localStorage.setItem("s60kafe_" + k, v); } catch(e){} }
var best = {t60: +lsGet("best60", 0) || 0, endless: +lsGet("bestE", 0) || 0};
var muted = lsGet("mute", "0") === "1";

/* ---------- audio ---------- */
var AC = null;
function ac(){ if (!AC){ try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){ AC = null; } } if (AC && AC.state === "suspended") AC.resume(); return AC; }
function tone(f, d, type, vol, delay, f2){
  if (muted) return; var a = ac(); if (!a) return;
  var t0 = a.currentTime + (delay || 0), o = a.createOscillator(), g = a.createGain();
  o.type = type || "sine"; o.frequency.setValueAtTime(f, t0); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + d);
  g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol || .15, t0 + .012); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
  o.connect(g); g.connect(a.destination); o.start(t0); o.stop(t0 + d + .05);
}
var SFX = {
  add: function(i){ tone([523, 587, 659, 698][i] * 1.5, .12, "triangle", .12); },
  serve: function(c){ var b = 659 * Math.pow(1.06, Math.min(c, 8)); tone(b, .25, "sine", .16); tone(b * 1.26, .25, "sine", .13, .08); tone(b * 1.5, .35, "triangle", .1, .16); },
  wrong: function(){ tone(220, .18, "triangle", .12, 0, 170); },
  leave: function(){ tone(392, .2, "sine", .1); tone(330, .3, "sine", .09, .12); },
  rush: function(){ [784, 988, 1175, 1319, 1568].forEach(function(f, i){ tone(f, .3, "sine", .1, i * .06); }); },
  gold: function(){ tone(1568, .5, "sine", .12); tone(2093, .6, "sine", .08, .07); tone(2637, .5, "triangle", .05, .14); },
  purr: function(){ if (muted) return; var a = ac(); if (!a) return; var t0 = a.currentTime, o = a.createOscillator(), g = a.createGain(), lfo = a.createOscillator(), lg = a.createGain();
    o.type = "sawtooth"; o.frequency.value = 55; lfo.frequency.value = 24; lg.gain.value = .05; lfo.connect(lg); lg.connect(g.gain);
    var flt = a.createBiquadFilter(); flt.type = "lowpass"; flt.frequency.value = 300; g.gain.setValueAtTime(.06, t0); g.gain.linearRampToValueAtTime(0, t0 + .7);
    o.connect(flt); flt.connect(g); g.connect(a.destination); o.start(t0); lfo.start(t0); o.stop(t0 + .75); lfo.stop(t0 + .75); },
  tick: function(){ tone(1046, .05, "square", .04); },
  end: function(){ [523, 659, 784, 1046].forEach(function(f, i){ tone(f, .4, "triangle", .11, i * .12); }); }
};

/* ---------- Magic's bow tie: black on even / red on odd days (Europe/Oslo) ---------- */
function tzDay(){ try { return +new Intl.DateTimeFormat("en-GB", {timeZone: "Europe/Oslo", day: "numeric"}).format(new Date()); } catch(e){ return new Date().getDate(); } }
var BOWQ = (function(){ try { return new URLSearchParams(location.search).get("bow"); } catch(e){ return null; } })();
var BOWK = BOWQ === "black" || BOWQ === "red" ? BOWQ : (tzDay() % 2 === 0 ? "black" : "red");
var BOWC = BOWK === "black" ? ["#1C1A22", "#3A3644", "#0A090D"] : ["#D3263A", "#F55A6C", "#7E1020"];

/* ---------- canvas helpers ---------- */
var cv = $("c"), ctx = cv.getContext("2d"), W = 0, H = 0, DPR = 1;
var TAU = Math.PI * 2;
function ell(c, x, y, rx, ry, col){ c.fillStyle = col; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, TAU); c.fill(); }
function circ(c, x, y, r, col){ c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }
function rr(c, x, y, w, h, r){ c.beginPath(); if (c.roundRect) c.roundRect(x, y, w, h, r); else c.rect(x, y, w, h); }
function heart(c, s){ c.beginPath(); c.moveTo(0, s * .35); c.bezierCurveTo(-s * 1.1, -s * .25, -s * .55, -s * 1.05, 0, -s * .45); c.bezierCurveTo(s * .55, -s * 1.05, s * 1.1, -s * .25, 0, s * .35); c.closePath(); }
function star(c, r, n){ c.beginPath(); for (var i = 0; i < n * 2; i++){ var a = i * Math.PI / n - Math.PI / 2, q = i % 2 ? r * .45 : r; c.lineTo(Math.cos(a) * q, Math.sin(a) * q); } c.closePath(); }

/* ---------- items: 0 coffee, 1 waffle, 2 cinnamon bun, 3 jam ---------- */
function drawItem(c, k, r, tm){
  tm = tm || 0; c.save(); c.scale(r / 20, r / 20);
  if (k === 0){
    ell(c, 0, 13, 17, 4.5, "#FFFFFF"); ell(c, 0, 12.5, 12, 2.6, "#E6E9F0");
    c.lineWidth = 3.2; c.strokeStyle = "#E23B4E"; c.beginPath(); c.arc(12, 2, 5, -1.3, 1.3); c.stroke();
    c.fillStyle = "#FF4D5E"; c.beginPath(); c.moveTo(-12, -6); c.lineTo(12, -6); c.lineTo(9, 11); c.quadraticCurveTo(0, 14, -9, 11); c.closePath(); c.fill();
    c.fillStyle = "#FFFFFF"; [[-6, 0], [0, 5], [5, -1], [-2, -3], [6, 6], [-6, 7]].forEach(function(q){ c.beginPath(); c.arc(q[0], q[1], 1.3, 0, TAU); c.fill(); });
    ell(c, 0, -6, 12, 3.2, "#7A3E1C"); ell(c, -2, -6.5, 6, 1.4, "#B06A38");
    c.strokeStyle = "rgba(255,255,255,.85)"; c.lineWidth = 2; c.lineCap = "round";
    for (var i = -1; i <= 1; i++){ var w = Math.sin(tm * 3 + i * 2) * 2.5; c.beginPath(); c.moveTo(i * 5, -10); c.quadraticCurveTo(i * 5 + w, -15, i * 5 - w * .5, -20); c.stroke(); }
  } else if (k === 1){
    c.save(); c.translate(0, 2); heart(c, 21); c.fillStyle = "#E89A2C"; c.fill(); c.lineWidth = 1.5; c.strokeStyle = "#A8601A"; c.stroke();
    c.clip(); c.strokeStyle = "rgba(160,90,20,.75)"; c.lineWidth = 1.6;
    for (var g = -24; g <= 24; g += 6){ c.beginPath(); c.moveTo(g, -24); c.lineTo(g + 20, 24); c.stroke(); c.beginPath(); c.moveTo(g, -24); c.lineTo(g - 20, 24); c.stroke(); }
    ell(c, -5, -7, 7, 3, "rgba(255,230,150,.55)"); c.restore();
    rr(c, -3.5, -5, 8, 6, 1.5); c.fillStyle = "#FFF2A8"; c.fill(); ell(c, 2, -12, 3, 1.2, "#fff");
    circ(c, 9, -9, 2.6, "#FF4D5E"); circ(c, 6, -11, 2.2, "#D62A5C");
  } else if (k === 2){
    ell(c, 0, 4, 17, 12, "#B8692E"); ell(c, 0, 1, 16, 11, "#D88A44");
    c.strokeStyle = "#8A4518"; c.lineWidth = 2.6; c.lineCap = "round"; c.beginPath();
    for (var a = 0; a < 15; a += .3){ var q = 1 + a * .95; c.lineTo(Math.cos(a) * q, 1 + Math.sin(a) * q * .7); } c.stroke();
    c.strokeStyle = "#FFFFFF"; c.lineWidth = 2; c.beginPath(); c.moveTo(-12, -2); c.quadraticCurveTo(-4, -9, 2, -3); c.quadraticCurveTo(8, 3, 13, -3); c.stroke();
    [[-8, 6], [6, 7], [10, -1], [-3, -6], [2, 9]].forEach(function(p){ circ(c, p[0], p[1], .9, "#FFF4D0"); });
    ell(c, -5, -5, 5, 2, "rgba(255,230,180,.5)");
  } else {
    rr(c, -11, -7, 22, 22, 6); c.fillStyle = "rgba(255,255,255,.55)"; c.fill();
    rr(c, -10, -3, 20, 17, 5); c.fillStyle = "#D61F45"; c.fill();
    ell(c, -5, 2, 2.5, 5, "rgba(255,180,190,.6)");
    c.fillStyle = "#FF4D5E"; c.beginPath(); c.moveTo(-14, -8); c.quadraticCurveTo(0, -17, 14, -8); c.lineTo(12, -5); c.quadraticCurveTo(0, -9, -12, -5); c.closePath(); c.fill();
    c.fillStyle = "#fff"; [-9, -3, 3, 9].forEach(function(x){ c.beginPath(); c.arc(x, -9.5 + Math.abs(x) * .12, 1.4, 0, TAU); c.fill(); });
    rr(c, -6, 4, 12, 6, 2); c.fillStyle = "#FFF6E8"; c.fill();
    c.fillStyle = "#D61F45"; c.save(); c.translate(0, 7); heart(c, 3.2); c.fill(); c.restore();
    circ(c, 11, -14, 3, "#FF4D5E"); ell(c, 12.5, -17, 2, 1, "#5FBF4A");
  }
  c.restore();
}
function drawGold(c, r, tm){
  c.save(); var g = c.createRadialGradient(0, 0, r * .2, 0, 0, r * 1.8); g.addColorStop(0, "rgba(255,240,150,.9)"); g.addColorStop(1, "rgba(255,200,60,0)");
  c.fillStyle = g; c.beginPath(); c.arc(0, 0, r * 1.8, 0, TAU); c.fill();
  c.rotate(Math.sin(tm * 3) * .2); star(c, r, 5); var g2 = c.createLinearGradient(0, -r, 0, r); g2.addColorStop(0, "#FFF3A0"); g2.addColorStop(.5, "#FFC94A"); g2.addColorStop(1, "#E08A10");
  c.fillStyle = g2; c.fill(); c.lineWidth = r * .08; c.strokeStyle = "#B8670A"; c.stroke();
  circ(c, -r * .25, -r * .3, r * .12, "#fff"); c.restore();
}
function iconCanvas(k, px){
  var c = document.createElement("canvas"), d = Math.min(3, window.devicePixelRatio || 1); c.width = c.height = Math.round(px * d);
  var g = c.getContext("2d"); g.scale(d, d); g.translate(px / 2, px / 2 + 1); drawItem(g, k, px * .42, 0); return c;
}

/* ---------- Magic: warm brown striped tabby, soft smile, polka-dot bow tie, no scarf ---------- */
function drawBow(c, x, y, k){
  c.save(); c.translate(x, y); c.scale(k, k); var col = BOWC[0], hi = BOWC[1], ink = BOWC[2];
  [-1, 1].forEach(function(d){
    c.beginPath(); c.moveTo(d * 1.4, -1.1); c.quadraticCurveTo(d * 4.2, -4.4, d * 7.2, -3.4); c.quadraticCurveTo(d * 8.4, 0, d * 7.2, 3.4); c.quadraticCurveTo(d * 4.2, 4.4, d * 1.4, 1.1); c.closePath();
    c.fillStyle = col; c.fill(); c.lineWidth = .7; c.strokeStyle = ink; c.stroke();
    c.save(); c.clip(); c.fillStyle = hi; c.beginPath(); c.ellipse(d * 4.6, -2.2, 2.6, .9, d * .25, 0, TAU); c.fill();
    c.fillStyle = "#FFFFFF"; [[3.2, -1.6], [5.9, -.6], [4.4, 1.7], [6.8, 2.2], [2.4, 1.0], [6.4, -2.6]].forEach(function(q){ c.beginPath(); c.arc(d * q[0], q[1], .62, 0, TAU); c.fill(); });
    c.restore();
  });
  rr(c, -1.9, -2, 3.8, 4, 1.3); c.fillStyle = col; c.fill(); c.lineWidth = .7; c.strokeStyle = ink; c.stroke();
  c.fillStyle = "#FFFFFF"; c.beginPath(); c.arc(-.3, -.4, .55, 0, TAU); c.fill(); c.restore();
}
function line(c, pts, col, w){ c.strokeStyle = col; c.lineWidth = w; c.lineCap = "round"; c.lineJoin = "round"; c.beginPath(); c.moveTo(pts[0], pts[1]); for (var i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.stroke(); }
var magic = {x: 0, y: 0, s: 1, hop: 0, paw: 0, cheer: 0, say: "", sayT: 0, blink: 0};
function drawMagic(c, x, y, s, tm){
  c.save(); c.translate(x, y - magic.hop * 14 * s); c.scale(s, s);
  var fur = "#A8703E", dark = "#6A3F1C", light = "#E8C49A", tw = Math.sin(tm * 3.2) * 7;
  line(c, [14, 10, 28, 4, 30 + tw, -14], dark, 7.5); line(c, [14, 10, 28, 4, 30 + tw, -14], fur, 6);
  line(c, [27, 2, 29, 0], dark, 6); line(c, [29.5 + tw * .7, -7, 30 + tw * .8, -9], dark, 6);
  ell(c, 0, 8, 19, 15, fur);
  line(c, [-9, -2, -7, 7], dark, 2.6); line(c, [0, -4, 1, 6], dark, 2.6); line(c, [9, -2, 9, 7], dark, 2.6); line(c, [14, 3, 16, 10], dark, 2.4);
  ell(c, -1, 14, 9, 8, light);
  var pw = magic.paw;
  ell(c, -9, 21 - pw * 6, 5.5, 4, light); ell(c, 8, 21, 5.5, 4, light);
  if (pw > 0){ circ(c, -9, 22 - pw * 6, 1, "#E8919B"); }
  c.save(); c.translate(0, -12);
  c.fillStyle = fur; c.beginPath(); c.moveTo(-12, -3); c.lineTo(-10, -18); c.lineTo(-2, -9); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(12, -3); c.lineTo(10, -18); c.lineTo(2, -9); c.closePath(); c.fill();
  c.fillStyle = "#F4A4B0"; c.beginPath(); c.moveTo(-9.5, -6); c.lineTo(-9, -14); c.lineTo(-5, -9); c.fill(); c.beginPath(); c.moveTo(9.5, -6); c.lineTo(9, -14); c.lineTo(5, -9); c.fill();
  ell(c, 0, 0, 13.5, 11.5, fur);
  line(c, [-4, -10, -3, -5], dark, 1.8); line(c, [0, -11, 0, -5], dark, 1.8); line(c, [4, -10, 3, -5], dark, 1.8);
  line(c, [-13, 1, -9, 2], dark, 1.5); line(c, [13, 1, 9, 2], dark, 1.5);
  ell(c, 0, 4.5, 7, 5, light);
  var happy = magic.cheer > 0, bl = magic.blink > 0;
  if (happy || bl){ line(c, [-7, -1, -4.8, -3, -2.6, -1], "#2A1A10", 1.6); line(c, [2.6, -1, 4.8, -3, 7, -1], "#2A1A10", 1.6); }
  else { ell(c, -4.8, -1.4, 2.7, 3.1, "#5FBF4A"); ell(c, 4.8, -1.4, 2.7, 3.1, "#5FBF4A"); ell(c, -4.6, -1.2, 1.1, 2.5, "#1a1a1a"); ell(c, 5, -1.2, 1.1, 2.5, "#1a1a1a"); circ(c, -5.4, -2.6, .8, "#fff"); circ(c, 4.2, -2.6, .8, "#fff"); }
  ell(c, -8.5, 3.5, 2.6, 1.6, "rgba(255,130,150,.45)"); ell(c, 8.5, 3.5, 2.6, 1.6, "rgba(255,130,150,.45)");
  c.fillStyle = "#E87A8A"; c.beginPath(); c.moveTo(-1.7, 2.4); c.lineTo(1.7, 2.4); c.lineTo(0, 4.1); c.fill();
  c.strokeStyle = "#5A3418"; c.lineWidth = 1.1; c.lineCap = "round"; c.beginPath(); c.moveTo(0, 4.1); c.lineTo(0, 5.2);
  c.moveTo(-3.4, 5); c.quadraticCurveTo(-1.7, 7.4, 0, 5.2); c.quadraticCurveTo(1.7, 7.4, 3.4, 5); c.stroke();
  if (happy){ c.fillStyle = "#C2344A"; c.beginPath(); c.moveTo(-2.2, 5.8); c.quadraticCurveTo(0, 9.5, 2.2, 5.8); c.fill(); }
  c.strokeStyle = "rgba(255,255,255,.75)"; c.lineWidth = .6; [-1, 1].forEach(function(d){ c.beginPath(); c.moveTo(d * 6, 4); c.lineTo(d * 15, 2.5); c.moveTo(d * 6, 5.2); c.lineTo(d * 15, 6); c.stroke(); });
  c.restore();
  drawBow(c, 0, 1.5, 1.15);
  c.restore();
  if (magic.sayT > 0){
    var a = Math.min(1, magic.sayT * 3); c.save(); c.globalAlpha = a; c.font = "900 " + Math.round(15 * s) + "px system-ui,sans-serif"; c.textAlign = "center";
    var tw2 = c.measureText(magic.say).width + 16 * s, bx = x - tw2 / 2 - 8 * s, by = y - 66 * s;
    rr(c, bx, by, tw2, 24 * s, 12 * s); c.fillStyle = "#FFF6E8"; c.fill(); c.lineWidth = 2; c.strokeStyle = "#FF8FB1"; c.stroke();
    c.fillStyle = "#D62A5C"; c.fillText(magic.say, bx + tw2 / 2, by + 17 * s); c.restore();
  }
}

/* ---------- customers ---------- */
var SKIN = ["#FFD9B8", "#F2C49B", "#D9A06E", "#B5784A", "#8A5530", "#FFE3CC"];
var HAIR = ["#3A2414", "#6A3F1C", "#C9853A", "#E8C46A", "#E8E4DC", "#A8A8B0", "#B5322A", "#1C1A22"];
var TOP = ["#FF6B6B", "#4DABF7", "#69DB7C", "#FFD43B", "#B197FC", "#FF8FB1", "#38D9A9", "#FFA94D"];
function pick(a){ return a[(Math.random() * a.length) | 0]; }
function drawCustomer(c, cu, tm){
  var s = cu.s, x = cu.x, y = cu.y;
  c.save(); c.translate(x + (cu.shake > 0 ? Math.sin(cu.shake * 60) * 5 * cu.shake : 0), y + Math.sin(cu.bob) * 2 * s); c.scale(s, s);
  c.globalAlpha = cu.alpha;
  if (cu.sel){ c.save(); c.shadowColor = "#FFC94A"; c.shadowBlur = 24; ell(c, 0, -40, 40, 58, "rgba(255,201,74,.28)"); c.restore(); }
  rr(c, -30, -52, 60, 60, 22); c.fillStyle = cu.top; c.fill();
  c.fillStyle = "rgba(255,255,255,.18)"; rr(c, -24, -48, 18, 50, 9); c.fill();
  if (cu.style === 1){ c.fillStyle = "#fff"; c.beginPath(); c.moveTo(-10, -52); c.lineTo(0, -40); c.lineTo(10, -52); c.fill(); }
  else { c.fillStyle = "rgba(255,255,255,.6)"; [-14, 0, 14].forEach(function(px){ c.beginPath(); c.arc(px, -30, 2.4, 0, TAU); c.fill(); c.beginPath(); c.arc(px + 7, -18, 2.4, 0, TAU); c.fill(); }); }
  ell(c, 0, -54, 8, 5, cu.skin);
  var hy = -80;
  if (cu.hair === 2){ ell(c, -19, hy + 6, 9, 20, cu.hc); ell(c, 19, hy + 6, 9, 20, cu.hc); }
  ell(c, 0, hy, 22, 23, cu.skin);
  c.fillStyle = cu.hc;
  if (cu.hair === 0){ c.beginPath(); c.ellipse(0, hy - 8, 23, 17, 0, Math.PI, TAU); c.fill(); ell(c, -14, hy - 4, 8, 9, cu.hc); }
  else if (cu.hair === 1){ c.beginPath(); c.ellipse(0, hy - 7, 23, 17, 0, Math.PI, TAU); c.fill(); circ(c, 0, hy - 28, 11, cu.hc); circ(c, -4, hy - 31, 3, "rgba(255,255,255,.25)"); }
  else if (cu.hair === 2){ c.beginPath(); c.ellipse(0, hy - 8, 24, 18, 0, Math.PI, TAU); c.fill(); }
  else if (cu.hair === 3){ c.fillStyle = cu.hat; c.beginPath(); c.ellipse(0, hy - 10, 24, 20, 0, Math.PI, TAU); c.fill(); rr(c, -26, hy - 12, 52, 7, 3); c.fill(); circ(c, 0, hy - 32, 6, "#fff"); }
  else { c.fillStyle = cu.hat; c.beginPath(); c.ellipse(0, hy - 10, 30, 6, 0, 0, TAU); c.fill(); rr(c, -16, hy - 34, 32, 24, 8); c.fill(); c.fillStyle = "#FF4D5E"; c.fillRect(-16, hy - 16, 32, 5); }
  var md = cu.mood;
  ell(c, -11, hy + 7, 5, 3, "rgba(255,120,130,.4)"); ell(c, 11, hy + 7, 5, 3, "rgba(255,120,130,.4)");
  if (md > 1){ line(c, [-11, hy + 1, -8, hy - 2, -5, hy + 1], "#2A1A10", 2); line(c, [5, hy + 1, 8, hy - 2, 11, hy + 1], "#2A1A10", 2); }
  else { circ(c, -8, hy, 2.8, "#2A1A10"); circ(c, 8, hy, 2.8, "#2A1A10"); circ(c, -7, hy - 1, 1, "#fff"); circ(c, 9, hy - 1, 1, "#fff"); }
  if (md < 0){ line(c, [-12, hy - 9, -5, hy - 7], "#2A1A10", 1.8); line(c, [12, hy - 9, 5, hy - 7], "#2A1A10", 1.8); }
  if (cu.glasses){ c.strokeStyle = "#5A3418"; c.lineWidth = 1.8; c.beginPath(); c.arc(-8, hy, 6, 0, TAU); c.moveTo(14, hy); c.arc(8, hy, 6, 0, TAU); c.moveTo(-2, hy); c.lineTo(2, hy); c.stroke(); }
  c.strokeStyle = "#8A3A2A"; c.lineWidth = 2.2; c.lineCap = "round"; c.beginPath();
  if (md >= 1){ c.arc(0, hy + 8, 6, .2, Math.PI - .2); } else if (md === 0){ c.moveTo(-5, hy + 11); c.lineTo(5, hy + 11); } else { c.arc(0, hy + 15, 5, Math.PI + .4, TAU - .4); }
  c.stroke();
  if (md > 1){ c.save(); c.translate(26, hy - 26 - cu.leaveT * 30); c.fillStyle = "#FF4D7A"; heart(c, 7); c.fill(); c.restore(); }
  c.restore();
  if (cu.state === "wait" || cu.state === "walk"){
    var n = cu.order.length, is = (n === 3 ? 25 : 30) * s, bw = n * is + 14 * s, bh = is + 22 * s, bx = x - bw / 2, by = y - 150 * s;
    c.save(); c.globalAlpha = cu.alpha;
    c.shadowColor = "rgba(0,0,0,.25)"; c.shadowBlur = 8; c.shadowOffsetY = 3;
    rr(c, bx, by, bw, bh, 14 * s); c.fillStyle = "#FFFDF7"; c.fill(); c.shadowColor = "transparent";
    c.beginPath(); c.moveTo(x - 7 * s, by + bh - 1); c.lineTo(x, by + bh + 9 * s); c.lineTo(x + 7 * s, by + bh - 1); c.fill();
    if (cu.sel){ rr(c, bx, by, bw, bh, 14 * s); c.lineWidth = 3; c.strokeStyle = "#FFC94A"; c.stroke(); }
    for (var i = 0; i < n; i++){ c.save(); c.translate(bx + 7 * s + is * (i + .5), by + 5 * s + is / 2); drawItem(c, cu.order[i], is * .42, tm); c.restore(); }
    var p = Math.max(0, cu.pat / cu.patMax), px = bx + 8 * s, pw2 = bw - 16 * s, py = by + bh - 12 * s;
    rr(c, px, py, pw2, 6 * s, 3 * s); c.fillStyle = "#EADFD2"; c.fill();
    rr(c, px, py, Math.max(6 * s, pw2 * p), 6 * s, 3 * s); c.fillStyle = p > .5 ? "#5FE0A8" : p > .25 ? "#FFC94A" : "#FF4D5E"; c.fill();
    c.restore();
  }
}

/* ---------- game state ---------- */
var mode = "menu", gm = "t60", score = 0, timeLeft = 60, hearts = 3, streak = 0, bestStreak = 0, comboT = 0, rush = 0, rushT = 0, served = 0;
var elapsed = 0, spawnT = 0, goldT = 8, gold = null, tray = [], slots = [null, null, null], parts = [], texts = [], selIdx = -1, lastTick = 0;
var SX = 0, SW = 0, CY = 0, CS = 1, sceneB = 0;
function layout(){
  DPR = Math.min(2, window.devicePixelRatio || 1); W = innerWidth; H = innerHeight;
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  var ctrl = $("ctrl"), ch = ctrl.hidden ? Math.min(200, H * .28) : ctrl.offsetHeight;
  sceneB = H - ch; SW = Math.min(W, 640); SX = (W - SW) / 2;
  CY = sceneB - Math.max(40, (sceneB) * .13);
  CS = Math.max(.55, Math.min(SW / 600 * 1.6, (CY - 74) / 190, 1.9));
  magic.s = CS * 1.35; magic.x = SX + SW - 34 * magic.s; magic.y = CY - 22 * magic.s;
  slots.forEach(function(cu, i){ if (cu){ cu.s = CS; cu.tx = slotX(i); if (cu.state === "wait") cu.x = cu.tx; cu.y = CY; } });
}
function slotX(i){ return SX + SW * [.17, .42, .67][i]; }
function difficulty(){ return gm === "t60" ? Math.min(1, elapsed / 55) : Math.min(1.3, elapsed / 110); }
function spawn(i){
  var d = difficulty(), r = Math.random(), n = r < .55 - d * .4 ? 1 : r < .9 - d * .25 ? 2 : 3, order = [];
  for (var k = 0; k < n; k++) order.push((Math.random() * 4) | 0);
  order.sort();
  var pm = (gm === "t60" ? 15 : 17) - d * 6.5 + n * 2.2;
  var fromL = i === 0 || (i === 1 && Math.random() < .5);
  slots[i] = {order: order, pat: pm, patMax: pm, x: fromL ? SX - 60 : SX + SW + 60, tx: slotX(i), y: CY, s: CS, state: "walk", alpha: 1, bob: Math.random() * 6, shake: 0, mood: 1, leaveT: 0,
    skin: pick(SKIN), hc: pick(HAIR), top: pick(TOP), hat: pick(["#4DABF7", "#FF6B6B", "#69DB7C", "#B197FC", "#FFD43B"]), hair: (Math.random() * 5) | 0, style: (Math.random() * 2) | 0, glasses: Math.random() < .3, sel: false};
}
function burst(x, y, col, n, sp){ for (var i = 0; i < n; i++){ var a = Math.random() * TAU, v = (sp || 1) * (60 + Math.random() * 180); parts.push({x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, l: .6 + Math.random() * .6, m: 1.2, c: Array.isArray(col) ? pick(col) : col, r: 2 + Math.random() * 4, st: Math.random() < .5}); } }
function floatText(x, y, s, col){ texts.push({x: x, y: y, s: s, c: col || "#FFF6E8", l: 1.1}); }
var toastT = 0;
function toast(s){ var t = $("toast"); t.textContent = s; t.classList.remove("on"); void t.offsetWidth; t.classList.add("on"); toastT = 1.3; }
function mult(){ return 1 + Math.min(6, Math.floor(streak / 2)) * .5; }

/* ---------- tray & matching ---------- */
function key(a){ return a.slice().sort().join(","); }
function isSub(tr, order){ var o = order.slice(); for (var i = 0; i < tr.length; i++){ var j = o.indexOf(tr[i]); if (j < 0) return false; o.splice(j, 1); } return true; }
var trayEl = $("tray");
function renderTray(bad){
  trayEl.innerHTML = "";
  for (var i = 0; i < 3; i++){ var d = document.createElement("div"); d.className = "slot"; if (i < tray.length){ d.appendChild(iconCanvas(tray[i], 46)); if (bad && i === tray.length - 1) d.classList.add("bad"); } trayEl.appendChild(d); }
}
function shakeTray(){ trayEl.classList.remove("shake"); void trayEl.offsetWidth; trayEl.classList.add("shake"); var cb = $("clearBtn"); cb.classList.remove("hint"); void cb.offsetWidth; cb.classList.add("hint"); setTimeout(function(){ cb.classList.remove("hint"); }, 1600); }
function waiting(){ var a = []; slots.forEach(function(cu, i){ if (cu && cu.state === "wait") a.push(i); }); return a; }
function addItem(k){
  if (mode !== "play") return;
  if (tray.length >= 3){ SFX.wrong(); shakeTray(); toast(L.full); return; }
  tray.push(k); SFX.add(k);
  var w = waiting(), targets = (selIdx >= 0 && slots[selIdx] && slots[selIdx].state === "wait") ? [selIdx] : w;
  var ok = targets.some(function(i){ return isSub(tray, slots[i].order); }) || w.some(function(i){ return isSub(tray, slots[i].order); });
  renderTray(!ok);
  if (!ok){ SFX.wrong(); shakeTray(); streak = 0; comboT = 0; floatText(W / 2, sceneB - 10, L.wrong, "#FFB3B3"); updHud(); return; }
  var tk = key(tray), cand = -1;
  if (selIdx >= 0 && slots[selIdx] && slots[selIdx].state === "wait" && key(slots[selIdx].order) === tk) cand = selIdx;
  else w.forEach(function(i){ if (key(slots[i].order) === tk && (cand < 0 || slots[i].pat < slots[cand].pat)) cand = i; });
  if (cand >= 0) serve(cand);
}
function serve(i){
  var cu = slots[i], n = cu.order.length, pf = Math.max(0, cu.pat / cu.patMax);
  streak = comboT > 0 ? streak + 1 : 1; comboT = 6; bestStreak = Math.max(bestStreak, streak);
  var pts = Math.round((10 * n + 8 * (n - 1) + pf * 20) * mult() * (rushT > 0 ? 2 : 1)); score += pts; served++;
  cu.state = "leave"; cu.mood = 2; cu.sel = false; if (selIdx === i) selIdx = -1;
  tray = []; renderTray(false); SFX.serve(streak);
  var bx = cu.x, by = cu.y - 120 * CS;
  burst(bx, by, ["#FFC94A", "#FF8FB1", "#5FE0A8", "#5AC8FA", "#fff"], 18 + n * 6);
  floatText(bx, by - 20 * CS, "+" + pts, rushT > 0 ? "#C7F9FF" : "#FFE38A"); floatText(bx, by + 10 * CS, pick(L.thanks), "#fff");
  if (rushT <= 0){ rush = Math.min(1, rush + .1 + .04 * n + Math.min(.08, streak * .01)); if (rush >= 1){ rushT = 8; rush = 1; SFX.rush(); toast(L.rushOn); burst(W / 2, CY - 60, ["#5FE0A8", "#5AC8FA", "#C77DFF", "#FF8FB1"], 60, 1.6); gc("rush"); } }
  if (streak >= 3 && streak % 3 === 0){ magic.cheer = 1.6; magic.hop = 1; magic.say = L.purr + " ×" + mult().toFixed(1); magic.sayT = 1.6; SFX.purr(); }
  else { magic.cheer = Math.max(magic.cheer, .6); }
  spawnT = Math.min(spawnT, .9);
  updHud();
}
function custLeaveSad(i){
  var cu = slots[i]; cu.state = "leave"; cu.mood = -1; cu.sel = false; if (selIdx === i) selIdx = -1;
  SFX.leave(); streak = 0; comboT = 0; floatText(cu.x, cu.y - 130 * CS, L.left, "#FFD0D0");
  if (gm === "endless"){ hearts--; burst(cu.x, cu.y - 100 * CS, "#FF4D5E", 14); if (hearts <= 0) endGame(); }
  updHud();
}

/* ---------- input on canvas ---------- */
cv.addEventListener("pointerdown", function(e){
  if (mode !== "play") return; ac();
  var x = e.clientX, y = e.clientY;
  if (gold && Math.hypot(x - gold.x, y - gold.y) < 34 * CS + 10){
    var gp = Math.round(60 * (rushT > 0 ? 2 : 1)); score += gp; SFX.gold(); burst(gold.x, gold.y, ["#FFE38A", "#FFC94A", "#fff"], 40, 1.3); floatText(gold.x, gold.y - 30, "+" + gp + " ✨", "#FFE38A"); toast(L.gold);
    rush = Math.min(1, rush + .15); gold = null; magic.cheer = 1.2; magic.hop = 1; SFX.purr(); gc("gold"); updHud(); return;
  }
  for (var i = 0; i < 3; i++){ var cu = slots[i]; if (!cu || cu.state !== "wait") continue;
    if (Math.abs(x - cu.x) < 52 * CS && y > cu.y - 160 * CS && y < cu.y + 10){
      if (tray.length && key(tray) === key(cu.order)){ serve(i); return; }
      slots.forEach(function(o){ if (o) o.sel = false; }); cu.sel = true; selIdx = i; SFX.tick();
      if (tray.length && !isSub(tray, cu.order)){ shakeTray(); cu.shake = .5; SFX.wrong(); }
      return; }
  }
});
function clearTray(){ if (!tray.length) return; tray = []; renderTray(false); SFX.tick(); }

/* ---------- loop ---------- */
var lastT = performance.now(), TM = 0;
function step(dt){
  TM += dt;
  magic.hop = Math.max(0, magic.hop - dt * 3); magic.cheer = Math.max(0, magic.cheer - dt); magic.sayT = Math.max(0, magic.sayT - dt); magic.paw = Math.max(0, magic.paw - dt * 2);
  magic.blink -= dt; if (magic.blink < -3 - Math.random() * 3) magic.blink = .14;
  if (toastT > 0){ toastT -= dt; if (toastT <= 0) $("toast").classList.remove("on"); }
  if (mode === "play"){
    elapsed += dt;
    if (gm === "t60"){ var prev = Math.ceil(timeLeft); timeLeft -= dt; if (Math.ceil(timeLeft) !== prev && timeLeft <= 5 && timeLeft > 0) SFX.tick(); if (timeLeft <= 0){ timeLeft = 0; endGame(); } }
    if (comboT > 0){ comboT -= dt; if (comboT <= 0) streak = 0; }
    if (rushT > 0){ rushT -= dt; rush = Math.max(0, rushT / 8); if (rushT <= 0){ rush = 0; } }
    spawnT -= dt;
    if (spawnT <= 0){ var free = []; slots.forEach(function(cu, i){ if (!cu) free.push(i); }); if (free.length){ spawn(pick(free)); } spawnT = Math.max(.9, 2.6 - difficulty() * 1.4) + Math.random() * .8; }
    goldT -= dt;
    if (goldT <= 0 && !gold){ magic.paw = 1; magic.say = "✨"; magic.sayT = 1; gold = {x: magic.x - 20 * CS, y: CY + 10 * CS, tx: SX + SW * (.25 + Math.random() * .45), l: 5}; goldT = 10 + Math.random() * 8; }
    if (gold){ gold.x += (gold.tx - gold.x) * Math.min(1, dt * 3); gold.l -= dt; if (gold.l <= 0) gold = null; }
    updHudFast();
  }
  for (var i = 0; i < 3; i++){ var cu = slots[i]; if (!cu) continue;
    cu.bob += dt * (cu.state === "walk" || cu.state === "leave" ? 12 : 2); cu.shake = Math.max(0, cu.shake - dt);
    if (cu.state === "walk"){ var dx = cu.tx - cu.x; cu.x += Math.sign(dx) * Math.min(Math.abs(dx), dt * 420 * CS); if (Math.abs(dx) < 1){ cu.x = cu.tx; cu.state = "wait"; } }
    else if (cu.state === "wait" && mode === "play"){ cu.pat -= dt * (rushT > 0 ? .75 : 1); var p = cu.pat / cu.patMax; cu.mood = p > .5 ? 1 : p > .22 ? 0 : -1; if (cu.pat <= 0) custLeaveSad(i); }
    else if (cu.state === "leave"){ cu.leaveT += dt; cu.y = CY + Math.min(1, cu.leaveT * 1.5) * 10; cu.alpha = Math.max(0, 1 - cu.leaveT * 1.6); if (cu.alpha <= 0) slots[i] = null; }
  }
  for (var j = parts.length - 1; j >= 0; j--){ var q = parts[j]; q.l -= dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 260 * dt; q.vx *= .98; if (q.l <= 0) parts.splice(j, 1); }
  for (var k = texts.length - 1; k >= 0; k--){ var t = texts[k]; t.l -= dt; t.y -= 40 * dt; if (t.l <= 0) texts.splice(k, 1); }
}
function drawScene(){
  var c = ctx, g;
  g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#FFB86B"); g.addColorStop(.45, "#FF8A5C"); g.addColorStop(1, "#C9463A"); c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.fillStyle = "rgba(255,255,255,.07)"; for (var sx = 0; sx < W; sx += 44) c.fillRect(sx, 0, 22, CY);
  var wx = SX + SW * .5, ww = SW * .62, wh = (CY - 70) * .55, wy = 62;
  if (wh > 40){
    rr(c, wx - ww / 2 - 8, wy - 8, ww + 16, wh + 16, 18); c.fillStyle = "#FFF1DC"; c.fill();
    rr(c, wx - ww / 2, wy, ww, wh, 12); g = c.createLinearGradient(0, wy, 0, wy + wh); g.addColorStop(0, "#7FD3FF"); g.addColorStop(1, "#FFE3A3"); c.fillStyle = g; c.fill();
    c.save(); rr(c, wx - ww / 2, wy, ww, wh, 12); c.clip();
    var sunx = wx + ww * .25, suny = wy + wh * .35; g = c.createRadialGradient(sunx, suny, 4, sunx, suny, wh * .9); g.addColorStop(0, "rgba(255,250,200,1)"); g.addColorStop(.25, "rgba(255,230,120,.8)"); g.addColorStop(1, "rgba(255,230,120,0)"); c.fillStyle = g; c.fillRect(wx - ww / 2, wy, ww, wh);
    circ(c, sunx, suny, wh * .14, "#FFF6B0");
    ell(c, wx - ww * .25, wy + wh * .3, wh * .2, wh * .09, "rgba(255,255,255,.9)"); ell(c, wx - ww * .17, wy + wh * .27, wh * .14, wh * .1, "rgba(255,255,255,.9)");
    ell(c, wx, wy + wh * 1.05, ww * .7, wh * .35, "#7BD389"); ell(c, wx - ww * .35, wy + wh * 1.0, ww * .3, wh * .28, "#5FBF6A");
    c.restore();
    c.fillStyle = "#FFF1DC"; c.fillRect(wx - 4, wy, 8, wh); c.fillRect(wx - ww / 2, wy + wh / 2 - 4, ww, 8);
    c.fillStyle = "#FF6B8A"; c.beginPath(); c.moveTo(wx - ww / 2 - 12, wy - 10); c.quadraticCurveTo(wx - ww * .3, wy + wh * .5, wx - ww / 2 - 4, wy + wh + 8); c.lineTo(wx - ww / 2 - 18, wy + wh + 8); c.lineTo(wx - ww / 2 - 18, wy - 10); c.fill();
    c.beginPath(); c.moveTo(wx + ww / 2 + 12, wy - 10); c.quadraticCurveTo(wx + ww * .3, wy + wh * .5, wx + ww / 2 + 4, wy + wh + 8); c.lineTo(wx + ww / 2 + 18, wy + wh + 8); c.lineTo(wx + ww / 2 + 18, wy - 10); c.fill();
    var fc = ["#FFD43B", "#4DABF7", "#69DB7C", "#FF6B6B", "#B197FC"];
    for (var f = 0; f < 9; f++){ var fx = wx - ww / 2 + ww * (f + .5) / 9, fy = wy - 4 + Math.sin(f / 8 * Math.PI) * 10; c.fillStyle = fc[f % 5]; c.beginPath(); c.moveTo(fx - 9, fy); c.lineTo(fx + 9, fy); c.lineTo(fx, fy + 16); c.fill(); }
    [SX + SW * .1, SX + SW * .9].forEach(function(lx, li){ var ly = wy + 10 + Math.sin(TM * 1.5 + li) * 2; line(c, [lx, 0, lx, ly], "#5A3418", 2);
      g = c.createRadialGradient(lx, ly + 10, 2, lx, ly + 10, 60 * CS); g.addColorStop(0, "rgba(255,240,170,.6)"); g.addColorStop(1, "rgba(255,240,170,0)"); c.fillStyle = g; c.beginPath(); c.arc(lx, ly + 10, 60 * CS, 0, TAU); c.fill();
      c.fillStyle = "#FFC94A"; c.beginPath(); c.moveTo(lx - 14 * CS, ly + 12 * CS); c.quadraticCurveTo(lx, ly - 8 * CS, lx + 14 * CS, ly + 12 * CS); c.fill(); circ(c, lx, ly + 13 * CS, 5 * CS, "#FFF6B0"); });
  }
  for (var i = 0; i < 3; i++) if (slots[i]) drawCustomer(c, slots[i], TM);
  g = c.createLinearGradient(0, CY - 12 * CS, 0, CY + 8 * CS); g.addColorStop(0, "#F2B66E"); g.addColorStop(1, "#B8692E");
  c.fillStyle = g; rr(c, SX - 10, CY - 12 * CS, SW + 20, 22 * CS, 8); c.fill();
  c.fillStyle = "rgba(255,255,255,.35)"; c.fillRect(SX, CY - 10 * CS, SW, 3 * CS);
  g = c.createLinearGradient(0, CY, 0, H); g.addColorStop(0, "#9A4E22"); g.addColorStop(1, "#5A2810"); c.fillStyle = g; c.fillRect(SX - 6, CY + 8 * CS, SW + 12, H);
  c.strokeStyle = "rgba(60,20,6,.35)"; c.lineWidth = 2; for (var pl = SX + 30; pl < SX + SW; pl += 46){ c.beginPath(); c.moveTo(pl, CY + 10 * CS); c.lineTo(pl, H); c.stroke(); }
  c.fillStyle = "#FF6B8A"; for (var sc = SX; sc < SX + SW; sc += 28){ c.beginPath(); c.arc(sc + 14, CY + 10 * CS, 14, 0, Math.PI); c.fill(); }
  c.fillStyle = "#FFF6E8"; for (var sc2 = SX; sc2 < SX + SW; sc2 += 28) circ(c, sc2 + 14, CY + 16 * CS, 2.4, "#FFF6E8");
  c.save(); c.translate(SX + 18 * CS, CY - 21 * CS); c.scale(CS * .8, CS * .8);
  rr(c, -16, -10, 32, 26, 6); c.fillStyle = "#5AC8FA"; c.fill(); c.fillStyle = "#fff"; [[-8, -2], [0, 6], [8, -2], [-8, 10], [8, 10]].forEach(function(p){ c.beginPath(); c.arc(p[0], p[1], 2, 0, TAU); c.fill(); });
  [[-6, -20, "#FF4D7A"], [4, -24, "#FFC94A"], [10, -16, "#B197FC"], [-12, -14, "#FF8FB1"]].forEach(function(f){ line(c, [0, -10, f[0], f[1]], "#3FA34D", 2); circ(c, f[0], f[1], 5, f[2]); circ(c, f[0], f[1], 2, "#FFF6B0"); });
  c.restore();
  if (gold){ c.save(); c.translate(gold.x, gold.y - 10 * CS); c.globalAlpha = gold.l < 1 ? (Math.sin(TM * 20) > 0 ? 1 : .4) : 1; drawGold(c, 17 * CS, TM); c.restore(); }
  drawMagic(c, magic.x, magic.y, magic.s, TM);
  if (rushT > 0){ c.save(); c.globalAlpha = .18 + Math.sin(TM * 6) * .06; g = c.createRadialGradient(W / 2, CY, 20, W / 2, CY, Math.max(W, H)); g.addColorStop(0, "rgba(120,240,255,0)"); g.addColorStop(1, "rgba(199,125,255,.9)"); c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore();
    if (Math.random() < .3) parts.push({x: Math.random() * W, y: H * .2 + Math.random() * CY * .7, vx: 0, vy: -40, l: .8, m: .8, c: pick(["#fff", "#C7F9FF", "#FFE38A"]), r: 2 + Math.random() * 3, st: true}); }
  parts.forEach(function(q){ c.save(); c.globalAlpha = Math.max(0, Math.min(1, q.l / .4)); c.translate(q.x, q.y); c.fillStyle = q.c; if (q.st){ c.rotate(q.l * 5); star(c, q.r * 1.6, 4); c.fill(); } else { c.beginPath(); c.arc(0, 0, q.r, 0, TAU); c.fill(); } c.restore(); });
  texts.forEach(function(t){ c.save(); c.globalAlpha = Math.min(1, t.l * 2); c.font = "900 " + Math.round(18 * Math.max(.8, CS)) + "px system-ui,sans-serif"; c.textAlign = "center"; c.lineWidth = 4; c.strokeStyle = "rgba(90,30,10,.8)"; c.strokeText(t.s, t.x, t.y); c.fillStyle = t.c; c.fillText(t.s, t.x, t.y); c.restore(); });
}
function frame(now){
  var dt = Math.min(.05, (now - lastT) / 1000); lastT = now;
  if (mode !== "pause") step(dt);
  drawScene(); requestAnimationFrame(frame);
}

/* ---------- HUD ---------- */
function updHud(){
  $("scoreV").textContent = score;
  var cb = $("combo"); cb.classList.toggle("off", streak < 2); $("comboV").textContent = "×" + mult().toFixed(1);
  $("rushBar").style.width = Math.round(rush * 100) + "%"; $("rushWrap").classList.toggle("on", rushT > 0); $("rushLbl").textContent = rushT > 0 ? L.rushOn : L.rush;
  updHudFast();
}
function updHudFast(){
  if (gm === "t60"){ $("tLbl").textContent = L.time; $("tV").textContent = Math.ceil(timeLeft) + "s"; }
  else { $("tLbl").textContent = L.lives; $("tV").textContent = "❤".repeat(Math.max(0, hearts)) + "♡".repeat(Math.max(0, 3 - hearts)); }
  if (rushT > 0) $("rushBar").style.width = Math.round(rush * 100) + "%";
}

/* ---------- flow ---------- */
function show(id, on){ $(id).hidden = !on; }
function startGame(m){
  ac(); gm = m; mode = "play"; score = 0; timeLeft = 60; hearts = 3; streak = 0; bestStreak = 0; comboT = 0; rush = 0; rushT = 0; served = 0; elapsed = 0; spawnT = .4; goldT = 9 + Math.random() * 5; gold = null;
  tray = []; slots = [null, null, null]; selIdx = -1; parts = []; texts = [];
  show("menu", false); show("over", false); show("pause", false); show("hud", true); show("ctrl", true); show("rushWrap", true); $("langs").hidden = true;
  renderTray(false); layout(); updHud(); toast(L.go); magic.say = L.purr; magic.sayT = 1.2; magic.hop = 1;
  setTimeout(function(){ if (mode === "play" && !slots[1]){ spawn(1); } }, 900);
  gc("start-" + m);
}
function endGame(){
  if (mode !== "play") return; mode = "over"; SFX.end();
  var k = gm === "t60" ? "t60" : "endless", nb = score > best[k];
  if (nb){ best[k] = score; lsSet(k === "t60" ? "best60" : "bestE", score); }
  $("overT").textContent = gm === "t60" ? L.over60 : L.overE; $("overS").textContent = score;
  $("overStats").innerHTML = "<span>" + L.served + ": " + served + "</span><span>" + L.bestCombo + ": " + bestStreak + "</span><span>" + L.best + ": " + best[k] + "</span>";
  $("newBest").hidden = !nb; $("shareBtn").textContent = L.share;
  setTimeout(function(){ show("hud", false); show("ctrl", false); show("rushWrap", false); show("over", true); layout(); }, 450);
  gc("over-" + gm);
}
function toMenu(){ mode = "menu"; slots = [null, null, null]; gold = null; show("over", false); show("pause", false); show("hud", false); show("ctrl", false); show("rushWrap", false); show("menu", true); $("langs").hidden = false; updBest(); layout(); }
function updBest(){ $("bestL").textContent = "🏆 " + L.best + ": 60s " + best.t60 + " · ∞ " + best.endless; }
function setMute(m){ muted = m; lsSet("mute", m ? "1" : "0"); document.querySelectorAll(".sndBtn").forEach(function(b){ b.textContent = muted ? L.sndOff : L.sndOn; }); }
function share(){
  var txt = L.shareName + "\n☕🧇 " + score + (gm === "endless" ? " ∞" : "") + "\nstop60.no";
  var done = function(){ $("shareBtn").textContent = "✓ " + L.copied; gc("share"); };
  try { if (navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(txt).then(done, function(){ fallback(txt); done(); }); return; } } catch(e){}
  fallback(txt); done();
}
function fallback(txt){ var ta = document.createElement("textarea"); ta.value = txt; ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); } catch(e){} ta.remove(); }

/* ---------- build stations ---------- */
var st = $("stations");
[0, 1, 2, 3].forEach(function(k){ var b = document.createElement("button"); b.type = "button"; b.setAttribute("aria-label", L.items[k]); var ic = iconCanvas(k, 64); b.appendChild(ic); var sp = document.createElement("span"); sp.textContent = L.items[k]; b.appendChild(sp);
  b.addEventListener("pointerdown", function(e){ e.preventDefault(); addItem(k); }); st.appendChild(b); });
document.addEventListener("keydown", function(e){
  if (mode === "play"){ var m = {"1": 0, "2": 1, "3": 2, "4": 3, q: 0, w: 1, e: 2, r: 3}[e.key]; if (m !== undefined){ addItem(m); return; }
    if (e.key === "Backspace" || e.key === "x" || e.key === "0"){ clearTray(); return; } if (e.key === "Escape" || e.key === "p"){ pause(); return; } }
  else if (mode === "pause" && (e.key === "Escape" || e.key === "p")) resume();
});
function pause(){ if (mode !== "play") return; mode = "pause"; show("pause", true); }
function resume(){ show("pause", false); mode = "play"; lastT = performance.now(); }
$("clearBtn").onclick = clearTray; $("playBtn").onclick = function(){ startGame("t60"); }; $("endlessBtn").onclick = function(){ startGame("endless"); };
$("retryBtn").onclick = function(){ startGame(gm); }; $("menuBtn").onclick = toMenu; $("pauseMenuBtn").onclick = function(){ show("pause", false); toMenu(); };
$("pauseBtn").onclick = pause; $("resumeBtn").onclick = resume; $("shareBtn").onclick = share;
document.querySelectorAll(".sndBtn").forEach(function(b){ b.onclick = function(){ setMute(!muted); if (!muted){ ac(); SFX.serve(1); } }; });
document.addEventListener("visibilitychange", function(){ if (document.hidden) pause(); });
addEventListener("resize", layout);
document.title = L.title; setMute(muted); updBest(); renderTray(false);
layout(); requestAnimationFrame(function(t){ lastT = t; frame(t); });
window.__kafe = {state: function(){ return {mode: mode, score: score, slots: slots.map(function(c){ return c && {order: c.order, state: c.state}; }), tray: tray.slice(), bow: BOWK, rushT: rushT, streak: streak}; }, add: addItem, start: startGame, end: endGame};
})();
