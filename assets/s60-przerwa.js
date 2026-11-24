/* Stop60 – "Przerwa" break screens (live in Mormors hage only). Mid-game breaks between moves:
   1) coffee break, 2) rest your eyes + listen, 3) new colour world (palette change after the break).
   Each break has a separate partner/sponsor slot; for now it shows a card for another Stop60 game.
   No ads, no ad SDK, no external requests. ?breaktest=1 → first break after 1 move; &brk=coffee|eyes|color forces a type. */
(function(){
"use strict";
if (typeof mode === "undefined" || typeof mkBG !== "function") return;
var Q = new URLSearchParams(location.search), TEST = Q.get("breaktest") === "1", FORCE = Q.get("brk");
var EVERY = TEST ? 3 : 14, first = true, MIN_GAP = TEST ? 0 : 150, MAX_GAP = 240; // moves / seconds
var KEY = "s60-przerwa.v1", S = {}; try { S = JSON.parse(localStorage.getItem(KEY)) || {}; } catch(e){}
S.i = S.i || 0; S.th = S.th || 0;
function keep(){ try { localStorage.setItem(KEY, JSON.stringify(S)); } catch(e){} }
var GAME = "mormors-hage";
function ev(n){ try { if (typeof gc === "function") gc(GAME + "-" + n, GAME + " " + n); } catch(e){} }
var TYPES = ["color", "coffee", "color", "eyes"], COLORTEST = Q.get("colortest") === "1";
var L = {
 pl:{coffee:"Przerwa na kawę ☕", coffeeSub:"Babcia nastawia czajnik, a Magic mruczy przy filiżance.",
   coffeeTips:["Wstań na chwilę i przeciągnij ramiona.","Napij się wody albo ciepłej herbaty.","Rozluźnij dłonie – pokręć nadgarstkami.","Weź trzy spokojne, głębokie oddechy."],
   eyes:"Daj odpocząć oczom 👀", eyesSub:"Oderwij wzrok od ekranu i posłuchaj spokojnej melodii.", eyesTips:["Pozwól oczom odpocząć – popatrz na coś zielonego 🌿","Popatrz w dal przez 20 sekund – na drzewo, chmurę albo daleki dach.","Mrugnij powoli kilka razy – oczy się nawilżą.","Zamknij na chwilę oczy i weź spokojny oddech."],
   eyesTip:"Patrz w dal przez 20 sekund – oczy odpoczywają, gdy patrzą daleko.", eyesDone:"Gotowe! Oczy odpoczęły 🌿", muted:"Dźwięk jest wyłączony – włącz go, żeby posłuchać melodii.",
   color:"Nowy świat kolorów 🎨", colorSub:"Oczy przywykły już do tych barw. Wybierz nowe – świeże kolory to pożywka dla mózgu!",
   pick:"Wybierz:", invite:"Nie pasują Ci kolory? Zmień świat 🎨", pal:"Zmień kolory", picker:"Wybierz swój świat kolorów 🎨", pickerSub:"Dotknij zestawu – ogródek zmieni się od razu.", later:"Później", cont:"Graj dalej", sec:"s", partner:"Partner przerwy", promo:"Zagraj też w", open:"Otwórz grę ↗",
   themes:{sunset:"Zachód słońca",lavender:"Lawendowy wieczór",sea:"Morska bryza",autumn:"Jesienny sad",classic:"Klasyczny"}},
 no:{coffee:"Kaffepause ☕", coffeeSub:"Mormor setter på kjelen, og Magic maler ved koppen.",
   coffeeTips:["Reis deg litt og strekk på armene.","Drikk et glass vann eller en kopp te.","Løs opp hendene – rull med håndleddene.","Ta tre rolige, dype pust."],
   eyes:"La øynene hvile 👀", eyesSub:"Ta blikket bort fra skjermen og lytt til en rolig melodi.", eyesTips:["La øynene hvile – se på noe grønt 🌿","Se langt bort i 20 sekunder – på et tre, en sky eller et tak i det fjerne.","Blunk sakte noen ganger – det fukter øynene.","Lukk øynene en liten stund og pust rolig."],
   eyesTip:"Se langt bort i 20 sekunder – øynene hviler når de ser i det fjerne.", eyesDone:"Ferdig! Øynene har hvilt 🌿", muted:"Lyden er av – slå den på for å høre melodien.",
   color:"En ny fargeverden 🎨", colorSub:"Øynene har vent seg til disse fargene. Velg nye – friske farger er næring for hjernen!",
   pick:"Velg:", invite:"Liker du ikke fargene? Bytt verden 🎨", pal:"Bytt farger", picker:"Velg din fargeverden 🎨", pickerSub:"Trykk på et sett – hagen endres med en gang.", later:"Senere", cont:"Fortsett", sec:"s", partner:"Pausepartner", promo:"Spill også", open:"Åpne spillet ↗",
   themes:{sunset:"Solnedgang",lavender:"Lavendelkveld",sea:"Havbris",autumn:"Høsthage",classic:"Klassisk"}},
 en:{coffee:"Coffee break ☕", coffeeSub:"Grandma puts the kettle on, and Magic purrs by the cup.",
   coffeeTips:["Stand up for a moment and stretch your arms.","Have a glass of water or a cup of tea.","Loosen your hands – roll your wrists.","Take three slow, deep breaths."],
   eyes:"Rest your eyes 👀", eyesSub:"Take your eyes off the screen and listen to a calm melody.", eyesTips:["Rest your eyes – look at something green 🌿","Look far away for 20 seconds – at a tree, a cloud or a distant roof.","Blink slowly a few times – it keeps your eyes moist.","Close your eyes for a moment and breathe calmly."],
   eyesTip:"Look into the distance for 20 seconds – your eyes rest when they look far away.", eyesDone:"Done! Your eyes have rested 🌿", muted:"Sound is off – turn it on to hear the melody.",
   color:"A new world of colours 🎨", colorSub:"Your eyes are used to these colours. Pick new ones – fresh colours are food for the brain!",
   pick:"Choose:", invite:"Not feeling these colours? Switch worlds 🎨", pal:"Change colours", picker:"Pick your world of colours 🎨", pickerSub:"Tap a set – the garden changes right away.", later:"Later", cont:"Resume", sec:"s", partner:"Break partner", promo:"Also try", open:"Open the game ↗",
   themes:{sunset:"Sunset",lavender:"Lavender evening",sea:"Sea breeze",autumn:"Autumn orchard",classic:"Classic"}}
};
var PROMOS = [
 {path:"/nostekurv/", pl:"/nostekurv/pl/", en:"/nostekurv/en/", img:"/nostekurv/icon-192.png", n:{no:"Nøstekurv",pl:"Motki kotki",en:"Kitty Yarn"},
  d:{no:"Slipp nøster i mormors kurv – to like blir til én større.",pl:"Wrzucaj kłębki do koszyka babci – dwa takie same łączą się w większy.",en:"Drop yarn into grandma's basket – two matching items merge into a bigger one."}},
 {path:"/sokkeskuffen/", pl:"/sokkeskuffen/pl/", en:"/sokkeskuffen/en/", img:"/sokkeskuffen/icon-192.png", n:{no:"Sokkeskuffen",pl:"Skarpetkowa szuflada",en:"Sock Drawer"},
  d:{no:"Finn sokkeparene i mormors skuff.",pl:"Dobieraj pary skarpetek w szufladzie babci.",en:"Match the sock pairs in grandma's drawer."}},
 {path:"/syltetoyhylla/", pl:"/syltetoyhylla/pl/", en:"/syltetoyhylla/en/", img:"/syltetoyhylla/icon-192.png", n:{no:"Syltetøyhylla",pl:"Babcine przetwory",en:"Jam Shelf"},
  d:{no:"Sorter mormors syltetøyglass på hylla.",pl:"Układaj słoiki z przetworami na półce babci.",en:"Sort grandma's jam jars on the shelf."}}
];
/* colour worlds: tint applied to the cached garden background only (plants stay readable) */
var THEMES = {
 classic:null,
 sunset:  {top:"#FF9A6B", mid:"#FFC2A0", tint:"#FF7A3A", a:.30, sw:["#FF9A6B","#FFD08A","#C8566E"]},
 lavender:{top:"#8E7CC3", mid:"#C9B8F0", tint:"#9C7BE0", a:.32, sw:["#8E7CC3","#C9B8F0","#5E4A9A"]},
 sea:     {top:"#3FA7B5", mid:"#9ADBD6", tint:"#2BA8C0", a:.30, sw:["#3FA7B5","#9ADBD6","#2F6E8A"]},
 autumn:  {top:"#D98B3A", mid:"#F2C46D", tint:"#C8702A", a:.30, sw:["#D98B3A","#F2C46D","#8A4A2A"]}
};
var THEME_ORDER = ["sunset","lavender","sea","autumn"];
var cur = S.theme && THEMES[S.theme] !== undefined ? S.theme : "classic";
var _mkBG = mkBG;
mkBG = function(){ _mkBG(); try { var th = THEMES[cur]; if (!th || !BG) return; var c = BG.getContext("2d");
  c.save(); c.setTransform(1,0,0,1,0,0); c.globalCompositeOperation = "color"; c.globalAlpha = th.a; c.fillStyle = th.tint; c.fillRect(0,0,BG.width,BG.height);
  c.globalCompositeOperation = "multiply"; c.globalAlpha = .22; c.fillStyle = th.mid; c.fillRect(0,0,BG.width,BG.height);
  c.globalCompositeOperation = "soft-light"; c.globalAlpha = .35; var g = c.createLinearGradient(0,0,0,BG.height); g.addColorStop(0, th.top); g.addColorStop(1, th.mid); c.fillStyle = g; c.fillRect(0,0,BG.width,BG.height); c.restore(); } catch(e){} };
function setTheme(k){ cur = k; S.theme = k; keep(); try { if (cv.width) mkBG(); } catch(e){} }
if (cur !== "classic") setTheme(cur);

/* ---------- styles + DOM ---------- */
var css = document.createElement("style");
css.textContent = "#brk{position:fixed;inset:0;z-index:2147483200;display:flex;align-items:center;justify-content:center;padding:14px;background:rgba(20,40,28,.55);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif}"+
"#brk[hidden]{display:none}#brk .bx{width:min(94vw,430px);max-height:94vh;max-height:94dvh;overflow:auto;border-radius:22px;padding:18px 18px 14px;text-align:center;background:linear-gradient(180deg,#FFF8EC,#F6E7CF);color:#3A2A1A;box-shadow:0 12px 40px rgba(0,0,0,.35);border:2px solid #E8C99A}"+
"#brk.eyes{background:rgba(8,24,16,.9)}#brk.eyes .bx{background:linear-gradient(180deg,#173A28,#0F2A1C 70%,#0C2217);color:#E2F2E6;border-color:#3E7A52}"+
"#brk h2{margin:2px 0 6px;font-size:1.45rem;color:#8A4A1E!important;text-shadow:none}#brk p{margin:6px 0;line-height:1.45;color:inherit}#brk .sub{font-size:1rem;color:#5A4030!important;font-weight:500}#brk.eyes h2{color:#CDEBB0!important}#brk.eyes .sub{color:#BFDCC8!important}#brk.eyes .tip{min-height:3em;transition:opacity .6s}#brk.eyes .tip.fd{opacity:0}#brk .tip{color:inherit}#brk .tip{font-weight:700;font-size:1.02rem;margin:10px 0}"+
"#brk .go{display:block;width:100%;margin:12px 0 4px;padding:14px;border:0;border-radius:16px;font:800 1.15rem system-ui,sans-serif;background:linear-gradient(180deg,#7BC86C,#4E9A46);color:#fff;box-shadow:0 3px 0 #2F6A2A;cursor:pointer}"+
"#brk .go:active{transform:translateY(2px);box-shadow:0 1px 0 #2F6A2A}"+
"#brk .slot{margin-top:12px;border:2px dashed rgba(140,100,60,.45);border-radius:16px;padding:8px 10px 10px;text-align:left;background:rgba(255,255,255,.45)}#brk.eyes .slot{border-color:rgba(160,220,180,.3);background:rgba(255,255,255,.04)}"+
"#brk .slot .lb{font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;opacity:.65;margin:0 0 6px;text-align:center}"+
"#brk .pc{display:flex;gap:10px;align-items:center;text-decoration:none;color:inherit}#brk .pc img{width:56px;height:56px;border-radius:14px;flex:none;background:#fff}"+
"#brk .pc b{display:block;font-size:1rem}#brk .pc span{display:block;font-size:.85rem;opacity:.85}#brk .pc em{display:inline-block;margin-top:3px;font-style:normal;font-weight:700;font-size:.85rem;color:#2F7A3A}#brk.eyes .pc em{color:#9FD8A8}"+
"#brk .cup{position:relative;width:110px;height:96px;margin:6px auto 2px}#brk .cup .c{position:absolute;left:18px;top:36px;width:64px;height:48px;background:#fff;border:3px solid #C98A5A;border-radius:0 0 26px 26px}"+
"#brk .cup .c:after{content:'';position:absolute;right:-20px;top:8px;width:16px;height:20px;border:3px solid #C98A5A;border-left:0;border-radius:0 12px 12px 0}"+
"#brk .cup .c:before{content:'';position:absolute;left:4px;right:4px;top:4px;height:8px;border-radius:50%;background:#7A4A2A}"+
"#brk .cup .pl{position:absolute;left:4px;top:82px;width:100px;height:10px;border-radius:50%;background:#E2B98E}"+
"#brk .cup i{position:absolute;bottom:62px;width:6px;height:26px;border-radius:6px;background:rgba(160,140,130,.5);animation:stm 2.6s ease-in-out infinite}#brk .cup i:nth-child(1){left:34px}#brk .cup i:nth-child(2){left:48px;animation-delay:.8s}#brk .cup i:nth-child(3){left:62px;animation-delay:1.6s}"+
"#brk .cup .cat{position:absolute;right:-6px;top:52px;font-size:30px;animation:pur 3s ease-in-out infinite}"+
"@keyframes stm{0%{opacity:0;transform:translateY(8px) scaleX(1)}40%{opacity:.9}100%{opacity:0;transform:translateY(-22px) scaleX(1.6)}}@keyframes pur{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}"+
"#brk .orb{width:110px;height:110px;margin:10px auto;border-radius:50%;background:radial-gradient(circle at 40% 38%,#A8E0A0,#3E8A55 55%,#1C4A2E 80%);box-shadow:0 0 44px rgba(140,220,150,.35);animation:brt 8s ease-in-out infinite}"+
"@keyframes brt{0%,100%{transform:scale(.82);opacity:.7}50%{transform:scale(1.08);opacity:1}}#brk .cd{font:800 2rem system-ui,sans-serif;margin:4px 0;font-variant-numeric:tabular-nums}"+
"#brk .ths{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 0}#brk .th{border:3px solid transparent;border-radius:14px;padding:8px 6px;background:#fff;cursor:pointer;font:700 .9rem system-ui,sans-serif;color:#3A2A1A}"+
"#brk .th.on{border-color:#4E9A46;box-shadow:0 0 0 2px rgba(78,154,70,.25)}#brk .th .s{display:flex;height:22px;border-radius:8px;overflow:hidden;margin-bottom:6px}#brk .th .s u{flex:1}"+
"#palBtn{position:relative;pointer-events:auto}#palBtn:before{content:'';position:absolute;inset:-3px;border-radius:inherit;padding:3px;background:conic-gradient(#FF7A9A,#FFD23F,#7CD67A,#5AB8F0,#B48CF0,#FF7A9A);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none}#palBtn.glow{animation:pglow 1.6s ease-in-out infinite}"+
"@keyframes pglow{0%,100%{transform:scale(1)}50%{transform:scale(1.12)}}"+
"#brkInv{position:fixed;left:50%;top:calc(122px + env(safe-area-inset-top));z-index:13;display:flex;align-items:center;gap:4px;transform:translateX(-50%);max-width:94vw;width:max-content;padding:3px;border-radius:999px;background:conic-gradient(from var(--a,0deg),#FF7A9A,#FFD23F,#7CD67A,#5AB8F0,#B48CF0,#FF7A9A);box-shadow:0 8px 24px rgba(0,0,0,.35);animation:invIn .5s cubic-bezier(.2,1.4,.4,1) both,invBob 2.4s ease-in-out .5s 2;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif}"+
"#brkInv[hidden]{display:none}#brkInv .ib{border:0;border-radius:999px;padding:10px 16px;background:#FFF8EC;color:#3A2A1A;font:800 1rem system-ui,sans-serif;cursor:pointer;white-space:normal;line-height:1.25;text-align:center;max-width:76vw}#brkInv .ix{border:0;width:34px;height:34px;border-radius:50%;background:#FFF8EC;color:#6A4A3A;font:700 1rem system-ui,sans-serif;cursor:pointer;flex:none}"+
"#brkInv.out{animation:invOut .4s ease-in both}@keyframes invIn{from{opacity:0;transform:translate(-50%,-14px) scale(.85)}to{opacity:1;transform:translate(-50%,0) scale(1)}}@keyframes invBob{0%,100%{transform:translate(-50%,0) rotate(0)}25%{transform:translate(-50%,-2px) rotate(-1.2deg)}75%{transform:translate(-50%,-2px) rotate(1.2deg)}}@keyframes invOut{to{opacity:0;transform:translate(-50%,-10px) scale(.9)}}"+
"@media (prefers-reduced-motion:reduce){#brk .cup i,#brk .cup .cat,#brk .orb,#brkInv,#palBtn.glow{animation:none}}";
document.head.appendChild(css);
var root = document.createElement("div"); root.id = "brk"; root.hidden = true; root.setAttribute("role", "dialog"); root.setAttribute("aria-modal", "true");
document.body.appendChild(root);
function tx(){ return L[lang] || L.no; }
function esc(s){ return String(s).replace(/[&<>"]/g, function(ch){ return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[ch]; }); }
function promoHTML(){
  var p = PROMOS[(S.p || 0) % PROMOS.length], href = lang === "pl" ? p.pl : lang === "en" ? p.en : p.path;
  return '<div class="slot" data-slot="partner"><p class="lb">' + esc(tx().partner) + '</p><a class="pc" data-g="' + p.path.replace(/\//g, "") + '" href="' + href + '" target="_blank" rel="noopener"><img src="' + p.img + '" alt="" width="56" height="56" loading="lazy"><div><span>' + esc(tx().promo) + '</span><b>' + esc(p.n[lang] || p.n.no) + '</b><span>' + esc(p.d[lang] || p.d.no) + '</span><em>' + esc(tx().open) + '</em></div></a></div>';
}

/* ---------- calm ambient for the eyes break (Web Audio, local only) ---------- */
var amb = null;
function ambStart(){
  if (mute || !window.AC || !AC || AC.state !== "running" || !master) return;
  try { if (musBus) musBus.gain.setTargetAtTime(0, AC.currentTime, .3); } catch(e){}
  var g = AC.createGain(); g.gain.value = .0001; g.connect(master); g.gain.linearRampToValueAtTime(.5, AC.currentTime + 2.5);
  var pads = [], i; [48, 55, 60, 64].forEach(function(n, k){ var o = AC.createOscillator(), og = AC.createGain(); o.type = "sine"; o.frequency.value = 440*Math.pow(2, (n - 69)/12); o.detune.value = (k - 1.5)*4; og.gain.value = .035; o.connect(og); og.connect(g); o.start(); pads.push(o); });
  var notes = [72, 74, 76, 79, 81, 84, 79, 76], step = 0, t0 = AC.currentTime + 1.2;
  var tm = setInterval(function(){ if (!AC || AC.state !== "running") return; while (t0 < AC.currentTime + .6){ var o = AC.createOscillator(), og = AC.createGain(), n = notes[(step*5 + (step >> 2)) % notes.length];
      o.type = "triangle"; o.frequency.value = 440*Math.pow(2, (n - 69)/12); og.gain.setValueAtTime(.0001, t0); og.gain.linearRampToValueAtTime(.05, t0 + .05); og.gain.exponentialRampToValueAtTime(.0001, t0 + 2.4);
      o.connect(og); og.connect(g); o.start(t0); o.stop(t0 + 2.5); t0 += step % 3 === 2 ? 1.8 : 1.2; step++; } }, 200);
  amb = {g: g, pads: pads, tm: tm};
}
function ambStop(){
  if (!amb) return; var a = amb; amb = null; clearInterval(a.tm);
  try { a.g.gain.setTargetAtTime(.0001, AC.currentTime, .4); setTimeout(function(){ a.pads.forEach(function(o){ try { o.stop(); } catch(e){} }); try { a.g.disconnect(); } catch(e){} }, 1600); } catch(e){}
  try { if (musBus) musBus.gain.setTargetAtTime(.14, AC.currentTime, .6); } catch(e){}
}

/* ---------- show / hide ---------- */
var open = false, openAt = 0, openType = null, prevTheme = null, timer = null, lastT = performance.now(), lastMoves = 0, runId = 0;
function show(type){
  open = true; openType = type; openAt = performance.now(); hideInv(); if (type !== "picker") ev("brk-show-" + type); var X = tx(), h = "", th = THEME_ORDER[S.th % THEME_ORDER.length];
  root.className = type;
  if (type === "coffee"){
    var tip = X.coffeeTips[(S.i >> 0) % X.coffeeTips.length];
    h = '<div class="cup" aria-hidden="true"><i></i><i></i><i></i><div class="c"></div><div class="pl"></div><div class="cat">🐈</div></div><h2>' + esc(X.coffee) + '</h2><p class="sub">' + esc(X.coffeeSub) + '</p><p class="tip">💡 ' + esc(tip) + '</p>';
  } else if (type === "eyes"){
    h = '<h2>' + esc(X.eyes) + '</h2><p class="sub">' + esc(X.eyesSub) + '</p><div class="orb" aria-hidden="true"></div><p class="cd" id="brkCd">25 ' + X.sec + '</p><p class="tip" id="brkTip">' + esc(X.eyesTips[0]) + '</p>' + (mute ? '<p class="sub">🔇 ' + esc(X.muted) + '</p>' : '');
  } else {
    var pk = type === "picker"; th = pk ? cur : th;
    h = '<h2>' + esc(pk ? X.picker : X.color) + '</h2><p class="sub">' + esc(pk ? X.pickerSub : X.colorSub) + '</p>' + (pk ? '' : '<p class="sub"><b>' + esc(X.pick) + '</b></p>') + '<div class="ths">';
    THEME_ORDER.concat(["classic"]).forEach(function(k){ var t2 = THEMES[k], sw = t2 ? t2.sw : ["#7CCBF2","#A6D884","#4A9446"];
      h += '<button class="th' + (k === th ? ' on' : '') + '" data-th="' + k + '"><span class="s"><u style="background:' + sw[0] + '"></u><u style="background:' + sw[1] + '"></u><u style="background:' + sw[2] + '"></u></span>' + esc(X.themes[k]) + '</button>'; });
    h += '</div>';
  }
  h += '<button class="go" id="brkGo">▶ ' + esc(X.cont) + '</button>' + (type === "picker" ? '' : promoHTML());
  root.innerHTML = '<div class="bx">' + h + '</div>'; root.hidden = false; root.dataset.type = type;
  setMode("brk");
  var pick = th; prevTheme = cur; if (type === "color" || type === "picker") setTheme(pick);
  root.querySelectorAll(".th").forEach(function(b){ b.onclick = function(){ pick = b.dataset.th; setTheme(pick); root.querySelectorAll(".th").forEach(function(x){ x.classList.toggle("on", x === b); }); try { SFX.tap(); } catch(e){} }; });
  var pc = root.querySelector(".pc"); if (pc) pc.addEventListener("click", function(){ ev("partner-" + pc.dataset.g + "-from-" + type); });
  $("brkGo").onclick = function(){ close(type === "color" || type === "picker" ? pick : null); };
  if (type === "eyes"){ var left = 25, ti = 0; ambStart();
    timer = setInterval(function(){ left--; if (left > 0 && left % 6 === 1){ var tp0 = $("brkTip"); if (tp0){ tp0.classList.add("fd"); setTimeout(function(){ if (tp0.isConnected){ ti = (ti + 1) % tx().eyesTips.length; tp0.textContent = tx().eyesTips[ti]; tp0.classList.remove("fd"); } }, 600); } } var e = $("brkCd"); if (e) e.textContent = Math.max(0, left) + " " + tx().sec; if (left <= 0){ clearInterval(timer); timer = null; ambStop(); var tp = $("brkTip"); if (tp) tp.textContent = tx().eyesDone; } }, 1000); }
  setTimeout(function(){ var g = $("brkGo"); if (g) try { g.focus({preventScroll: true}); } catch(e){} }, 50);
}
function close(theme){
  if (!open) return; open = false; if (timer){ clearInterval(timer); timer = null; } ambStop();
  var dur = (performance.now() - openAt)/1000; if (openType && openType !== "picker" && dur < (openType === "eyes" ? 24 : 8)) ev("brk-skip-" + openType);
  if (theme && (openType === "picker" || openType === "color") && theme !== prevTheme) ev("theme-" + theme);
  root.hidden = true; root.innerHTML = ""; var wasPicker = openType === "picker"; openType = null;
  if (theme) setTheme(theme);
  if (!wasPicker){ S.i++; S.p = (S.p || 0) + 1; if (theme) S.th++; keep(); lastT = performance.now(); lastMoves = moves; first = false; }
  else { keep(); invT = performance.now(); }
  if (mode === "brk") setMode("play");
}
addEventListener("keydown", function(ev){ if (open && (ev.key === "Escape" || ev.key === "Enter")){ ev.preventDefault(); ev.stopPropagation(); var g = $("brkGo"); if (g) g.click(); } }, true);
document.addEventListener("visibilitychange", function(){ if (document.hidden && amb) ambStop(); });

/* ---------- when: only between moves, when everything has settled ---------- */
function due(){
  var dm = moves - lastMoves, dt = (performance.now() - lastT)/1000;
  if (dm < 1) return false;
  if (TEST) return first ? dm >= 1 : dm >= EVERY;
  return (dm >= EVERY && dt >= MIN_GAP) || (dt >= MAX_GAP && dm >= 4);
}
var lastMode = mode;
setInterval(function(){
  if (open) return;
  if (mode === "play" && (lastMode === "menu" || lastMode === "over")){ lastT = performance.now(); lastMoves = 0; first = true; invT = performance.now(); invMoves = 0; invNo = 0; } // new run
  lastMode = mode;
  if (mode !== "play" || finished || drag || canMode || needCheck) return;
  try { if (busy()) return; } catch(e){ return; }
  if (moves >= limit() - 1) return; // never right before the end
  if (!due()){ maybeInvite(); return; }
  var type = FORCE && TYPES.indexOf(FORCE) >= 0 ? FORCE : TYPES[S.i % TYPES.length];
  show(type);
}, 250);
/* ---------- colour-world invite (non-blocking) + palette button ---------- */
var invT = performance.now(), invMoves = 0, invShown = false, invHideT = null, invNo = 0, INV_GAP = COLORTEST ? 15 : 180;
var inv = document.createElement("div"); inv.id = "brkInv"; inv.hidden = true; inv.setAttribute("role", "status");
inv.innerHTML = '<button class="ib" type="button"></button><button class="ix" type="button" aria-label="✕">✕</button>'; document.body.appendChild(inv);
inv.querySelector(".ib").onclick = function(e){ e.stopPropagation(); ev("color-invite-click"); hideInv(); openPicker(); };
inv.querySelector(".ix").onclick = function(e){ e.stopPropagation(); invNo++; hideInv(); };
["pointerdown", "mousedown", "touchstart"].forEach(function(e){ inv.addEventListener(e, function(x){ x.stopPropagation(); }, {passive: true}); });
function hideInv(){ if (invHideT){ clearTimeout(invHideT); invHideT = null; } if (!invShown) return; invShown = false; invT = performance.now(); invMoves = moves; inv.classList.add("out"); var pb = $("palBtn"); if (pb) pb.classList.remove("glow"); setTimeout(function(){ if (!invShown){ inv.hidden = true; inv.classList.remove("out"); } }, 400); }
function maybeInvite(){
  if (invShown || open || invNo >= 2) return;
  var since = (performance.now() - invT)/1000, dm = moves - invMoves;
  if (COLORTEST ? !(dm >= 1 && (invMoves === 0 || since >= INV_GAP)) : !(since >= INV_GAP && dm >= 3)) return;
  if (!COLORTEST && (performance.now() - lastT)/1000 < 40) return; // not right after a break
  inv.querySelector(".ib").textContent = tx().invite; inv.classList.remove("out"); inv.hidden = false; invShown = true;
  var pb = $("palBtn"); if (pb) pb.classList.add("glow");
  invHideT = setTimeout(hideInv, 8000); ev("color-invite-show");
}
function canOpen(){ try { return mode === "play" && !finished && !drag && !canMode && !needCheck && !busy() && !open; } catch(e){ return false; } }
function openPicker(n){ if (canOpen()){ show("picker"); return; } if (mode === "play" && (n || 0) < 12) setTimeout(function(){ openPicker((n || 0) + 1); }, 200); }
(function(){ var mb = $("muteBtn"); if (!mb) return; var b = document.createElement("button"); b.id = "palBtn"; b.type = "button"; b.textContent = "🎨";
  b.setAttribute("aria-label", tx().pal); b.title = tx().pal; mb.parentNode.insertBefore(b, mb);
  b.onclick = function(e){ e.stopPropagation(); ev("palette-click"); hideInv(); openPicker(); };
  ["pointerdown", "mousedown", "touchstart"].forEach(function(e){ b.addEventListener(e, function(x){ x.stopPropagation(); }, {passive: true}); });
  document.querySelectorAll(".langs button").forEach(function(lb){ lb.addEventListener("click", function(){ b.setAttribute("aria-label", tx().pal); b.title = tx().pal; }); }); })();
/* game's own setMode hides cards only for menu/pause/over; make sure HUD + can stay hidden during the break */
var _setMode = setMode; setMode = function(m){ _setMode(m); if (m !== "play") hideInv(); if (m === "brk"){ $("hud").hidden = true; $("canBtn").hidden = true; } else if (open && m !== "brk"){ open = false; root.hidden = true; root.innerHTML = ""; if (timer){ clearInterval(timer); timer = null; } ambStop(); } };
window.__brk = {get inv(){ return invShown; }, picker: openPicker, show: show, close: close, get open(){ return open; }, get theme(){ return cur; }, setTheme: setTheme, state: function(){ return JSON.parse(JSON.stringify(S)); }};
})();
