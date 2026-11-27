/* Stop60 – Dagens Ord / Słowo Dnia / Daily Word (shared game logic) */
(function(){
"use strict";
var LANG = window.ORD_LANG || "no";
var WORDS = (window.ORD_WORDS || {})[LANG] || [];
var TZ = "Europe/Oslo";
var ALPHA = {
  no: "abcdefghijklmnopqrstuvwxyzæøå",
  pl: "abcdefghijklmnopqrstuvwxyząćęłńóśźż",
  en: "abcdefghijklmnopqrstuvwxyz"
}[LANG];
var ROWS = {
  no: ["qwertyuiopå", "asdfghjkløæ", "<zxcvbnm>"],
  pl: ["ąćęłńóśźż", "qwertyuiop", "asdfghjkl", "<zxcvbnm>"],
  en: ["qwertyuiop", "asdfghjkl", "<zxcvbnm>"]
}[LANG];
var T = {
  no: {name: "Dagens Ord", daily: "Dagens ord", practice: "Øvelse", enter: "ENTER", tooShort: "For få bokstaver", win: ["Genialt!", "Imponerende!", "Supert!", "Flott!", "Bra jobbet!", "Puh, i siste liten!"], lose: "Ordet var", next: "Nytt ord om", share: "Del resultatet", copied: "Kopiert! Lim inn hvor du vil", newWord: "Nytt øveord", playPractice: "Spill øvelse", backDaily: "Til dagens ord", streak: "Serie", played: "Spilt", winPct: "Vunnet %", best: "Beste serie", dist: "Fordeling", help: "Slik spiller du", helpP: ["Gjett ordet på 6 forsøk. Hvert forsøk er et ord på 5 bokstaver – trykk ENTER for å sjekke.", "Fargene viser hvor nær du er:"], hc: "riktig bokstav på riktig plass", hp: "finnes i ordet, men på feil plass", ha: "finnes ikke i ordet", helpD: "📅 Dagens ord er likt for alle og byttes ved midnatt. 🔁 I øvelse kan du spille så mye du vil.", ok: "Spill!", practiceTag: "Øvelse", dailyTag: "Dagens ord", sound: "Lyd", done: "✓ Dagens ord er løst", tries: "Forsøk", meow: "Magic heier på deg!", ex: ["sterk", "piano", "fjord"]},
  pl: {name: "Słowo Dnia", daily: "Słowo dnia", practice: "Trening", enter: "ENTER", tooShort: "Za mało liter", win: ["Genialnie!", "Wspaniale!", "Super!", "Świetnie!", "Dobra robota!", "Uff, w ostatniej chwili!"], lose: "Hasło to", next: "Nowe słowo za", share: "Udostępnij wynik", copied: "Skopiowano! Wklej, gdzie chcesz", newWord: "Nowe słowo treningowe", playPractice: "Graj w trening", backDaily: "Do słowa dnia", streak: "Seria", played: "Gry", winPct: "Wygrane %", best: "Najlepsza seria", dist: "Rozkład", help: "Jak grać", helpP: ["Odgadnij słowo w 6 próbach. Każda próba to słowo z 5 liter – naciśnij ENTER, aby sprawdzić.", "Kolory pokazują, jak blisko jesteś:"], hc: "dobra litera na dobrym miejscu", hp: "litera jest w słowie, ale gdzie indziej", ha: "litery nie ma w słowie", helpD: "📅 Słowo dnia jest takie samo dla wszystkich i zmienia się o północy. 🔁 W treningu grasz ile chcesz.", ok: "Gramy!", practiceTag: "Trening", dailyTag: "Słowo dnia", sound: "Dźwięk", done: "✓ Słowo dnia odgadnięte", tries: "Próby", meow: "Magic trzyma kciuki!", ex: ["serce", "kotek", "łódka"]},
  en: {name: "Daily Word", daily: "Daily word", practice: "Practice", enter: "ENTER", tooShort: "Not enough letters", win: ["Genius!", "Magnificent!", "Splendid!", "Great!", "Nice one!", "Phew, just in time!"], lose: "The word was", next: "New word in", share: "Share result", copied: "Copied! Paste it anywhere", newWord: "New practice word", playPractice: "Play practice", backDaily: "Back to daily word", streak: "Streak", played: "Played", winPct: "Win %", best: "Best streak", dist: "Guess distribution", help: "How to play", helpP: ["Guess the word in 6 tries. Each guess is a 5-letter word – press ENTER to check it.", "The colours show how close you are:"], hc: "right letter in the right spot", hp: "in the word, but in another spot", ha: "not in the word", helpD: "📅 The daily word is the same for everyone and changes at midnight. 🔁 Practice lets you play as much as you like.", ok: "Let's play!", practiceTag: "Practice", dailyTag: "Daily word", sound: "Sound", done: "✓ Today's word solved", tries: "Tries", meow: "Magic is cheering for you!", ex: ["smile", "piano", "cloud"]}
}[LANG];

/* ---------- helpers ---------- */
function $(id){ return document.getElementById(id); }
function gc(path, title){ try { if (window.goatcounter && goatcounter.count) goatcounter.count({path: path, title: title, event: true}); } catch(e){} }
function ld(k, d){ try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch(e){ return d; } }
function sv(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} }
function tzParts(){
  var o = {};
  try { new Intl.DateTimeFormat("en-GB", {timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23"}).formatToParts(new Date()).forEach(function(p){ o[p.type] = p.value; }); }
  catch(e){ var d = new Date(); o = {year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate(), hour: d.getHours(), minute: d.getMinutes(), second: d.getSeconds()}; }
  return {y: +o.year, m: +o.month, d: +o.day, h: +o.hour % 24, mi: +o.minute, s: +o.second};
}
function todayKey(){ var p = tzParts(); return p.y + "-" + String(p.m).padStart(2, "0") + "-" + String(p.d).padStart(2, "0"); }
function dayNum(key){ var a = key.split("-"); return Math.round(Date.UTC(+a[0], a[1] - 1, +a[2]) / 864e5); }
var START = dayNum("2026-11-27");
function mulberry(a){ return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
var ORDER = (function(){ var r = mulberry({no: 60601, pl: 60602, en: 60603}[LANG]), a = WORDS.map(function(_, i){ return i; }); for (var i = a.length - 1; i > 0; i--){ var j = Math.floor(r() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; })();
function dailyWord(key){ var n = dayNum(key); return WORDS[ORDER[((n % WORDS.length) + WORDS.length) % WORDS.length]]; }
function puzzleNo(key){ return dayNum(key) - START + 1; }
function score(guess, ans){
  var g = Array.from(guess), a = Array.from(ans), res = ["a", "a", "a", "a", "a"], left = {};
  for (var i = 0; i < 5; i++){ if (g[i] === a[i]) res[i] = "c"; else left[a[i]] = (left[a[i]] || 0) + 1; }
  for (i = 0; i < 5; i++){ if (res[i] !== "c" && left[g[i]]){ res[i] = "p"; left[g[i]]--; } }
  return res;
}

/* ---------- Magic the cat (SVG) – white polka-dot bow tie: black on even, red on odd days ---------- */
function bowColor(){
  var q = null; try { q = new URLSearchParams(location.search).get("bow"); } catch(e){}
  if (q === "black" || q === "red") return q;
  return tzParts().d % 2 === 0 ? "black" : "red";
}
var BOW = bowColor() === "black" ? ["#1C1A22", "#3A3542"] : ["#D3263A", "#F04A5C"];
function magicSVG(happy){
  var fur = "#A0703F", dark = "#5E3C1E", light = "#E2C08F";
  var eyes = happy
    ? '<path d="M33 47q5-6 10 0M57 47q5-6 10 0" stroke="#2a1a10" stroke-width="3" fill="none" stroke-linecap="round"/>'
    : '<ellipse cx="38" cy="47" rx="5" ry="6" fill="#5FBF4A"/><ellipse cx="62" cy="47" rx="5" ry="6" fill="#5FBF4A"/><ellipse cx="38.5" cy="47.5" rx="2" ry="4.4" fill="#1a1a1a"/><ellipse cx="62.5" cy="47.5" rx="2" ry="4.4" fill="#1a1a1a"/><circle cx="37" cy="45" r="1.4" fill="#fff"/><circle cx="61" cy="45" r="1.4" fill="#fff"/>';
  var dots = [[30, 80], [24, 86], [33, 88], [26, 79], [70, 80], [76, 86], [67, 88], [74, 79]].map(function(p){ return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="1.5" fill="#fff"/>'; }).join("");
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Magic">' +
    '<path d="M18 30 L24 4 L44 22 Z" fill="' + fur + '"/><path d="M82 30 L76 4 L56 22 Z" fill="' + fur + '"/>' +
    '<path d="M23 25 L26 11 L37 21 Z" fill="#F2A0A8"/><path d="M77 25 L74 11 L63 21 Z" fill="#F2A0A8"/>' +
    '<ellipse cx="50" cy="50" rx="36" ry="31" fill="' + fur + '"/>' +
    '<path d="M42 21 l2 11 M50 19 v12 M58 21 l-2 11" stroke="' + dark + '" stroke-width="3.4" stroke-linecap="round"/>' +
    '<path d="M15 44 h9 M15 52 h8 M85 44 h-9 M85 52 h-8" stroke="' + dark + '" stroke-width="3" stroke-linecap="round"/>' +
    '<ellipse cx="50" cy="62" rx="17" ry="12" fill="' + light + '"/>' + eyes +
    '<path d="M46 56 h8 l-4 4 z" fill="#E87A8A"/>' +
    '<path d="M50 60 v3 M42 63 q8 8 16 0" stroke="#5a2a2a" stroke-width="2.2" fill="none" stroke-linecap="round"/>' +
    '<circle cx="28" cy="60" r="5" fill="rgba(255,120,140,.45)"/><circle cx="72" cy="60" r="5" fill="rgba(255,120,140,.45)"/>' +
    '<path d="M33 59 l-16 -3 M33 62 l-16 2 M67 59 l16 -3 M67 62 l16 2" stroke="rgba(255,255,255,.8)" stroke-width="1.1"/>' +
    '<path d="M46 83 Q34 72 20 76 Q16 84 20 92 Q34 96 46 85 Z" fill="' + BOW[0] + '"/><path d="M54 83 Q66 72 80 76 Q84 84 80 92 Q66 96 54 85 Z" fill="' + BOW[0] + '"/>' +
    '<ellipse cx="30" cy="79" rx="6" ry="2" fill="' + BOW[1] + '" opacity=".7"/><ellipse cx="70" cy="79" rx="6" ry="2" fill="' + BOW[1] + '" opacity=".7"/>' + dots +
    '<rect x="44" y="78" width="12" height="12" rx="4" fill="' + BOW[0] + '"/><circle cx="48" cy="82" r="1.5" fill="#fff"/><circle cx="53" cy="86" r="1.3" fill="#fff"/>' +
    '</svg>';
}

/* ---------- sound ---------- */
var muted = ld("ord_mute", false), AC = null;
function ac(){ if (!AC){ try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){} } if (AC && AC.state === "suspended") AC.resume(); return AC; }
function tone(f, d, type, vol, when){
  if (muted) return; var c = ac(); if (!c) return;
  var t = c.currentTime + (when || 0), o = c.createOscillator(), g = c.createGain();
  o.type = type || "sine"; o.frequency.setValueAtTime(f, t);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.12, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + d + 0.02);
}
var SND = {
  key: function(){ tone(880 + Math.random() * 120, 0.06, "triangle", 0.07); },
  del: function(){ tone(420, 0.07, "triangle", 0.06); },
  bad: function(){ tone(200, 0.12, "square", 0.05); tone(160, 0.15, "square", 0.05, 0.1); },
  flip: function(i, s){ var f = s === "c" ? 784 : s === "p" ? 659 : 392; tone(f, 0.14, "sine", 0.1, i * 0.25 + 0.2); },
  win: function(){ [523, 659, 784, 1047, 1319].forEach(function(f, i){ tone(f, 0.25, "triangle", 0.12, 1.4 + i * 0.11); }); },
  lose: function(){ [392, 349, 311].forEach(function(f, i){ tone(f, 0.3, "sine", 0.1, 1.4 + i * 0.18); }); }
};

/* ---------- state ---------- */
var TK = todayKey();
var DKEY = "ord_daily_" + LANG, SKEY = "ord_stats_" + LANG, PKEY = "ord_prac_" + LANG;
var stats = ld(SKEY, {played: 0, wins: 0, streak: 0, best: 0, last: null, dist: [0, 0, 0, 0, 0, 0]});
var daily = ld(DKEY, null);
if (!daily || daily.date !== TK) daily = {date: TK, guesses: [], done: false, won: false};
var prac = ld(PKEY, null);
function newPractice(){ var w, dw = dailyWord(TK); do { w = WORDS[Math.floor(Math.random() * WORDS.length)]; } while (w === dw && WORDS.length > 1); prac = {word: w, guesses: [], done: false, won: false}; sv(PKEY, prac); }
if (!prac || !prac.word) newPractice();
var mode = "daily";
var cur = "", busy = false, keyEls = {};
function S(){ return mode === "daily" ? daily : prac; }
function answer(){ return mode === "daily" ? dailyWord(TK) : prac.word; }
// streak sanity (missed a day → reset display)
(function(){ if (stats.last && stats.last !== TK && dayNum(TK) - dayNum(stats.last) > 1){ stats.streak = 0; sv(SKEY, stats); } })();

/* ---------- build UI ---------- */
function buildBoard(){
  var b = $("board"); b.innerHTML = "";
  for (var r = 0; r < 6; r++){ var row = document.createElement("div"); row.className = "row"; for (var c = 0; c < 5; c++){ var t = document.createElement("div"); t.className = "tile"; row.appendChild(t); } b.appendChild(row); }
}
function buildKeys(){
  var kb = $("kb"); kb.innerHTML = ""; keyEls = {};
  ROWS.forEach(function(r, ri){
    var row = document.createElement("div"); row.className = "kr" + (Array.from(r).length >= 11 ? " n11" : "");
    Array.from(r).forEach(function(ch){
      var k = document.createElement("button"); k.type = "button"; k.className = "key";
      if (ch === "<"){ k.className += " wide"; k.textContent = T.enter; k.dataset.k = "Enter"; k.setAttribute("aria-label", "Enter"); }
      else if (ch === ">"){ k.className += " wide"; k.textContent = "⌫"; k.dataset.k = "Backspace"; k.setAttribute("aria-label", "Backspace"); }
      else { k.textContent = ch; k.dataset.k = ch; keyEls[ch] = k; if (LANG === "pl" && ri === 0) k.className += " dia"; }
      k.addEventListener("click", function(e){ e.preventDefault(); press(k.dataset.k); k.blur(); });
      row.appendChild(k);
    });
    kb.appendChild(row);
  });
}
function rowEl(i){ return $("board").children[i]; }
function paintRow(i, word, res, animate){
  var tiles = rowEl(i).children, ch = Array.from(word);
  for (var c = 0; c < 5; c++){
    (function(t, l, s, c){
      t.textContent = l || ""; t.className = "tile" + (l ? " fill" : "");
      if (!res) return;
      if (animate){
        setTimeout(function(){ t.classList.add("flip"); setTimeout(function(){ t.classList.add(s); }, 250); }, c * 250);
      } else t.classList.add(s);
    })(tiles[c], ch[c], res && res[c], c);
  }
}
var RANK = {a: 1, p: 2, c: 3};
function paintKeys(){
  Object.keys(keyEls).forEach(function(k){ keyEls[k].classList.remove("c", "p", "a"); });
  var best = {}, ans = answer();
  S().guesses.forEach(function(g){ var r = score(g, ans); Array.from(g).forEach(function(l, i){ if (!best[l] || RANK[r[i]] > RANK[best[l]]) best[l] = r[i]; }); });
  Object.keys(best).forEach(function(l){ if (keyEls[l]) keyEls[l].classList.add(best[l]); });
}
function render(){
  buildBoard();
  var st = S(), ans = answer();
  st.guesses.forEach(function(g, i){ paintRow(i, g, score(g, ans), false); });
  if (!st.done && st.guesses.length < 6) paintRow(st.guesses.length, cur, null, false);
  paintKeys();
  document.querySelectorAll(".modes button").forEach(function(b){ b.classList.toggle("cur", b.dataset.m === mode); });
  var info = $("info"); info.innerHTML = "";
  function chip(t){ var s = document.createElement("span"); s.className = "chip"; s.textContent = t; info.appendChild(s); }
  if (mode === "daily"){ chip("#" + puzzleNo(TK)); chip("🔥 " + T.streak + ": " + stats.streak); if (daily.done) chip(T.done); }
  else chip("🔁 " + T.practice);
}
function toast(msg, ms){ var t = $("toast"); t.textContent = msg; t.classList.add("on"); clearTimeout(toast.t); toast.t = setTimeout(function(){ t.classList.remove("on"); }, ms || 1400); }

/* ---------- input ---------- */
function press(k){
  if (busy || $("endOv").hidden === false || $("helpOv").hidden === false) return;
  var st = S(); if (st.done) return;
  ac();
  if (k === "Enter") return submit();
  if (k === "Backspace"){ if (cur){ cur = Array.from(cur).slice(0, -1).join(""); paintRow(st.guesses.length, cur); SND.del(); } return; }
  if (ALPHA.indexOf(k) >= 0 && Array.from(cur).length < 5){ cur += k; paintRow(st.guesses.length, cur); SND.key(); }
}
function submit(){
  var st = S(), i = st.guesses.length;
  if (Array.from(cur).length < 5){ var r = rowEl(i); r.classList.remove("shake"); void r.offsetWidth; r.classList.add("shake"); SND.bad(); toast(T.tooShort); return; }
  var g = cur, ans = answer(), res = score(g, ans);
  if (!st.guesses.length) gc("ord-start-" + LANG + "-" + mode, "ord start " + LANG + " " + mode);
  st.guesses.push(g); cur = ""; busy = true;
  paintRow(i, g, res, true); res.forEach(function(s, j){ SND.flip(j, s); });
  var won = g === ans, over = won || st.guesses.length >= 6;
  if (over){ st.done = true; st.won = won; }
  sv(mode === "daily" ? DKEY : PKEY, st);
  if (over && mode === "daily") recordDaily(won, st.guesses.length);
  setTimeout(function(){
    busy = false; paintKeys();
    if (won){ Array.from(rowEl(i).children).forEach(function(t, j){ setTimeout(function(){ t.classList.add("win"); }, j * 90); }); SND.win(); confetti(); toast(T.win[i], 1600); }
    else if (over){ SND.lose(); }
    if (over){ gc("ord-" + (won ? "win" : "lose") + "-" + LANG + "-" + mode, "ord " + (won ? "win" : "lose") + " " + LANG + " " + mode); setTimeout(showEnd, won ? 1500 : 900); render(); }
  }, 5 * 250 + 200);
}
function recordDaily(won, n){
  stats.played++;
  if (won){
    stats.wins++; stats.dist[n - 1]++;
    stats.streak = (stats.last && dayNum(TK) - dayNum(stats.last) === 1) ? stats.streak + 1 : (stats.last === TK ? stats.streak : 1);
    stats.best = Math.max(stats.best, stats.streak); stats.last = TK;
  } else { stats.streak = 0; stats.last = null; }
  sv(SKEY, stats);
}
document.addEventListener("keydown", function(e){
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  var k = e.key;
  if (k === "Enter" || k === "Backspace"){ e.preventDefault(); press(k); return; }
  if (k && Array.from(k).length === 1){ var l = k.toLowerCase(); if (ALPHA.indexOf(l) >= 0){ e.preventDefault(); press(l); } }
});

/* ---------- end screen + share ---------- */
function fmt(sec){ var h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60; return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0"); }
function secsLeft(){ var p = tzParts(); return Math.max(0, 86400 - (p.h * 3600 + p.mi * 60 + p.s)); }
function tick(){
  var el = $("cd"); if (el) el.textContent = fmt(secsLeft());
  if (todayKey() !== TK) location.reload();
}
function showEnd(){
  var st = S(), ans = answer(), won = st.won;
  $("endMagic").innerHTML = magicSVG(true);
  $("endTitle").textContent = won ? T.win[st.guesses.length - 1] : T.lose;
  var rv = $("reveal"); rv.className = "reveal" + (won ? "" : " lose"); rv.innerHTML = "";
  Array.from(ans).forEach(function(l){ var b = document.createElement("b"); b.textContent = l; rv.appendChild(b); });
  var isD = mode === "daily";
  $("statsBox").hidden = !isD; $("nextBox").hidden = !isD;
  if (isD){
    $("stats").innerHTML = "";
    [[T.played, stats.played], [T.winPct, stats.played ? Math.round(stats.wins * 100 / stats.played) : 0], [T.streak, stats.streak], [T.best, stats.best]].forEach(function(x){ var d = document.createElement("div"); d.innerHTML = "<b></b>"; d.firstChild.textContent = x[1]; d.appendChild(document.createTextNode(x[0])); $("stats").appendChild(d); });
    var dist = $("dist"); dist.innerHTML = ""; var mx = Math.max.apply(null, stats.dist.concat([1]));
    stats.dist.forEach(function(v, i){ var d = document.createElement("div"), s = document.createElement("span"); d.textContent = (i + 1) + " "; s.textContent = v; s.style.width = (8 + 82 * v / mx) + "%"; if (won && st.guesses.length === i + 1) s.className = "me"; d.appendChild(s); dist.appendChild(d); });
  }
  $("pracBtn").textContent = isD ? T.playPractice : T.newWord;
  $("dailyBtn").hidden = isD;
  $("endOv").hidden = false; tick();
}
function shareText(){
  var st = S(), ans = answer();
  var head = T.name + " " + (mode === "daily" ? "#" + puzzleNo(TK) : "· " + T.practiceTag) + " " + (st.won ? st.guesses.length : "X") + "/6";
  var grid = st.guesses.map(function(g){ return score(g, ans).map(function(s){ return s === "c" ? "🟩" : s === "p" ? "🟨" : "⬜"; }).join(""); }).join("\n");
  return head + "\n\n" + grid + "\n\nstop60.no";
}
function copy(txt){
  function fb(){ var ta = document.createElement("textarea"); ta.value = txt; ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); } catch(e){} document.body.removeChild(ta); toast(T.copied); }
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(function(){ toast(T.copied); }, fb); else fb();
}

/* ---------- confetti ---------- */
function confetti(){
  var c = $("confetti"), x = c.getContext("2d"), W = c.width = innerWidth, H = c.height = innerHeight, P = [], cols = ["#22C55E", "#FFB627", "#F43F5E", "#38BDF8", "#A855F7", "#FFE066", "#FFFFFF"];
  for (var i = 0; i < 160; i++) P.push({x: W / 2 + (Math.random() - .5) * 80, y: H * .45, vx: (Math.random() - .5) * 14, vy: -Math.random() * 15 - 4, r: Math.random() * 6.28, vr: (Math.random() - .5) * .3, w: 6 + Math.random() * 6, h: 8 + Math.random() * 8, c: cols[i % cols.length]});
  var t0 = performance.now();
  (function f(now){
    x.clearRect(0, 0, W, H);
    P.forEach(function(p){ p.vy += .35; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += p.vr; x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.fillStyle = p.c; x.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); x.restore(); });
    if (now - t0 < 3200) requestAnimationFrame(f); else x.clearRect(0, 0, W, H);
  })(t0);
}

/* ---------- wiring ---------- */
function setMode(m){ mode = m; cur = ""; render(); if (S().done) setTimeout(showEnd, 200); }
function init(){
  $("magic").innerHTML = magicSVG(false);
  $("helpMagic").innerHTML = magicSVG(true);
  document.title = T.name + " – Stop60";
  // help examples
  var ex = [[T.ex[0], 0, "c", T.hc], [T.ex[1], 1, "p", T.hp], [T.ex[2], 3, "a", T.ha]];
  var hb = $("helpEx"); hb.innerHTML = "";
  ex.forEach(function(e){ var row = document.createElement("div"), p = document.createElement("p"); row.className = "ex"; Array.from(e[0]).forEach(function(l, i){ var t = document.createElement("div"); t.className = "tile" + (i === e[1] ? " " + e[2] : ""); t.textContent = l; row.appendChild(t); }); hb.appendChild(row); p.innerHTML = "<b></b> "; p.firstChild.textContent = Array.from(e[0])[e[1]].toUpperCase(); p.appendChild(document.createTextNode("– " + e[3])); hb.appendChild(p); });
  buildKeys();
  document.querySelectorAll(".modes button").forEach(function(b){ b.onclick = function(){ setMode(b.dataset.m); }; });
  $("helpBtn").onclick = function(){ $("helpOv").hidden = false; };
  $("helpOk").onclick = function(){ $("helpOv").hidden = true; sv("ord_seen", 1); ac(); };
  var mb = $("muteBtn"); function mt(){ mb.textContent = muted ? "🔇" : "🔊"; mb.setAttribute("aria-label", T.sound); } mt();
  mb.onclick = function(){ muted = !muted; sv("ord_mute", muted); mt(); if (!muted) SND.key(); };
  $("shareBtn").onclick = function(){ copy(shareText()); gc("ord-share-" + LANG, "ord share " + LANG); };
  $("pracBtn").onclick = function(){ $("endOv").hidden = true; if (mode === "practice" || prac.done) newPractice(); setMode("practice"); };
  $("dailyBtn").onclick = function(){ $("endOv").hidden = true; setMode("daily"); };
  $("closeEnd").onclick = function(){ $("endOv").hidden = true; };
  render();
  if (!ld("ord_seen", 0)) $("helpOv").hidden = false;
  else if (daily.done) setTimeout(showEnd, 300);
  setInterval(tick, 1000);
  // background bubbles
  var bb = $("bubbles"); for (var i = 0; i < 14; i++){ var b = document.createElement("i"), s = 10 + Math.random() * 40; b.style.cssText = "left:" + (Math.random() * 100) + "%;width:" + s + "px;height:" + s + "px;animation-duration:" + (9 + Math.random() * 12) + "s;animation-delay:-" + (Math.random() * 15) + "s"; bb.appendChild(b); }
}
window.__ord = {score: score, dailyWord: dailyWord, todayKey: todayKey};
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
