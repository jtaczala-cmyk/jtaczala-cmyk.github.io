/* Stop60 – "Fact of the day" TV-style news crawl. Same-origin only, no external requests. © 2026 Stop60 */
(function(){
  "use strict";
  if (window.__s60f) return; window.__s60f = 1;
  var CS = document.currentScript, d = document, html = d.documentElement;
  var L = (html.lang || "nb").slice(0,2).toLowerCase(); L = L === "pl" ? "pl" : L === "en" ? "en" : "no";
  try { if (sessionStorage.getItem("s60f-off") === "1") return; } catch(e){}
  var LABEL = { no:["DAGENS","FAKTA"], en:["FACT OF","THE DAY"], pl:["CIEKAWOSTKA","DNIA"] }[L];
  var CLOSE = { no:"Lukk", en:"Close", pl:"Zamknij" }[L], NEXT = { no:"Neste", en:"Next", pl:"Następna" }[L];
  var RM = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)");
  var FINE = window.matchMedia && matchMedia("(hover:hover) and (pointer:fine)").matches;
  var SPEED = 80; /* px per second */
  var css = ".s60f{position:fixed;left:0;right:0;bottom:0;z-index:30;background:#0b0a09;border-top:3px solid #e11d2a;box-shadow:0 -6px 24px rgba(0,0,0,.55);color:#fff;padding:0 env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px);font:700 22px/1.2 'IBM Plex Sans',system-ui,-apple-system,Segoe UI,Roboto,sans-serif}"+
  ".s60f-in{display:flex;align-items:stretch;height:64px}"+
  ".s60f-l{flex:none;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;gap:1px;padding:0 12px 0 max(12px,env(safe-area-inset-left,0px));background:linear-gradient(180deg,#f2c14e,#e8a23c);color:#12110f;font:700 13px/1.05 'Oswald',sans-serif;letter-spacing:.06em;position:relative}"+
  ".s60f-l:after{content:'';position:absolute;right:-12px;top:0;bottom:0;width:12px;background:linear-gradient(90deg,rgba(11,10,9,.9),rgba(11,10,9,0));z-index:2}"+
  ".s60f-l small{font:600 10px/1 'Oswald',sans-serif;letter-spacing:.08em;opacity:.75;margin-top:3px;min-height:10px}"+
  ".s60f-tr{flex:1;min-width:0;position:relative;overflow:hidden;cursor:pointer;-webkit-tap-highlight-color:transparent}"+
  ".s60f-it{position:absolute;left:0;top:0;bottom:0;display:flex;align-items:center;gap:14px;white-space:nowrap;will-change:transform}"+
  ".s60f-gr{font:600 13px/1 'Oswald',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#f2c14e;border:1px solid rgba(242,193,78,.6);border-radius:4px;padding:4px 6px}"+
  ".s60f-t{text-shadow:0 1px 2px rgba(0,0,0,.6)}"+
  ".s60f-g{color:#12110f;background:#2dd4bf;border-radius:999px;padding:7px 14px;font:700 15px/1 'IBM Plex Sans',system-ui,sans-serif;text-decoration:none}"+
  ".s60f-x,.s60f-n{flex:none;align-self:center;width:36px;height:36px;margin:0 8px 0 4px;border-radius:50%;border:1px solid rgba(255,255,255,.25);background:#1c1a17;color:#d6d3d1;font:600 20px/1 system-ui,sans-serif;cursor:pointer;padding:0}"+
  ".s60f-n{display:none;margin-right:0}"+
  ".s60f.rm .s60f-n{display:block}.s60f.rm .s60f-in{height:auto;flex-wrap:wrap;align-items:center}"+
  ".s60f.rm .s60f-l{flex:1;flex-direction:row;align-items:center;justify-content:flex-start;gap:6px;align-self:stretch;min-height:44px}.s60f.rm .s60f-l:after,.s60f.rm .s60f-l small{display:none}"+
  ".s60f.rm .s60f-tr{flex:1 0 100%;order:5}.s60f.rm .s60f-it{position:static;white-space:normal;flex-wrap:wrap;gap:6px 10px;padding:8px 12px 10px;font-size:17px;line-height:1.3}.s60f.rm .s60f-gr{display:none}"+
  "@media(min-width:760px){.s60f{font-size:30px}.s60f-in{height:76px}.s60f-l{font-size:16px;padding:0 20px}.s60f-gr{font-size:15px}.s60f-g{font-size:17px}}";
  function el(t,c,txt){var e=d.createElement(t); if(c) e.className=c; if(txt!=null) e.textContent=txt; return e;}
  function start(data){
    var F = data.facts, U = data.ui, G = data.groups; if (!F || !F.length) return;
    var st = el("style"); st.textContent = css; d.head.appendChild(st);
    var bar = el("aside","s60f"); bar.setAttribute("aria-label", LABEL.join(" "));
    var inn = el("div","s60f-in");
    var lab = el("div","s60f-l"); lab.appendChild(el("span",null,LABEL[0])); lab.appendChild(el("span",null,LABEL[1])); var ps = el("small"); lab.appendChild(ps);
    var tr = el("div","s60f-tr"); tr.setAttribute("role","button"); tr.tabIndex = 0; tr.setAttribute("aria-pressed","false");
    var it = el("div","s60f-it"); tr.appendChild(it);
    var nx = el("button","s60f-n","›"); nx.type = "button"; nx.setAttribute("aria-label", NEXT);
    var x = el("button","s60f-x","×"); x.type = "button"; x.setAttribute("aria-label", CLOSE);
    inn.appendChild(lab); inn.appendChild(tr); inn.appendChild(nx); inn.appendChild(x); bar.appendChild(inn); d.body.appendChild(bar);
    var pad0 = parseFloat(getComputedStyle(d.body).paddingBottom) || 0;
    function fit(){ d.body.style.paddingBottom = (pad0 + bar.offsetHeight + 8) + "px"; }
    fit(); window.addEventListener("resize", fit); if (window.ResizeObserver) new ResizeObserver(fit).observe(bar);
    var ord = F.map(function(_,i){return i;});
    for (var i = ord.length-1; i > 0; i--) { var j = Math.floor(Math.random()*(i+1)); var t = ord[i]; ord[i] = ord[j]; ord[j] = t; }
    var k = -1, paused = false, hover = false, reduced = !!(RM && RM.matches), xpos = 0, w = 0, last = 0, raf = 0;
    function fill(){
      k++; var idx = ord[k % ord.length], f = F[idx];
      it.textContent = "";
      it.appendChild(el("span","s60f-gr", G[f.g] || ""));
      var tx = el("span","s60f-t", f.t); tx.title = U.src + ": " + f.s; it.appendChild(tx);
      if (f.u) { var a = el("a","s60f-g","▶ " + U.play + ": " + f.n); a.href = f.u; it.appendChild(a); }
      bar.setAttribute("data-i", idx); bar.setAttribute("data-k", k);
      tr.setAttribute("aria-label", f.t);
      if (!reduced) { w = it.scrollWidth; xpos = tr.clientWidth; place(); }
      fit();
    }
    function place(){ it.style.transform = "translate3d(" + xpos.toFixed(1) + "px,0,0)"; }
    function frame(ts){
      raf = requestAnimationFrame(frame);
      var dt = last ? Math.min(0.05, (ts - last) / 1000) : 0; last = ts;
      if (reduced || paused || hover) return;
      xpos -= SPEED * dt; place();
      if (xpos < -w - 24) fill();
    }
    function setPause(p){ paused = p; tr.setAttribute("aria-pressed", p ? "true" : "false"); ps.textContent = p ? "⏸" : ""; }
    function mode(){
      reduced = !!(RM && RM.matches); bar.classList.toggle("rm", reduced);
      if (reduced) { it.style.transform = ""; ps.textContent = ""; } else { w = it.scrollWidth; if (xpos > tr.clientWidth) xpos = tr.clientWidth; place(); }
      fit();
    }
    tr.addEventListener("click", function(e){ if (e.target.closest && e.target.closest("a")) return; if (reduced) { fill(); return; } setPause(!paused); });
    tr.addEventListener("keydown", function(e){ if (e.key === " " || e.key === "Enter") { e.preventDefault(); if (reduced) fill(); else setPause(!paused); } });
    if (FINE) { tr.addEventListener("mouseenter", function(){ hover = true; }); tr.addEventListener("mouseleave", function(){ hover = false; }); }
    nx.addEventListener("click", function(){ fill(); });
    x.addEventListener("click", function(){ cancelAnimationFrame(raf); bar.remove(); st.remove(); d.body.style.paddingBottom = pad0 ? pad0 + "px" : ""; try { sessionStorage.setItem("s60f-off","1"); } catch(e){} });
    if (RM && RM.addEventListener) RM.addEventListener("change", mode);
    mode(); fill();
    if (!reduced) { xpos = Math.round(tr.clientWidth * 0.35); place(); }
    raf = requestAnimationFrame(frame);
    window.__s60fApi = { paused: function(){ return paused; }, x: function(){ return xpos; }, w: function(){ return w; }, k: function(){ return k; }, count: F.length, next: fill };
  }
  function load(){
    var src = (CS && CS.dataset.src) || ("/assets/facts/s60-facts-" + L + ".json?v=1");
    fetch(src, { credentials: "same-origin" }).then(function(r){ return r.ok ? r.json() : null; }).then(function(j){ if (j) start(j); }).catch(function(){});
  }
  if (d.readyState === "complete") load(); else window.addEventListener("load", load);
})();
