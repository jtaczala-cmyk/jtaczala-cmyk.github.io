/* Stop60 – "Visste du?" fun-facts bar. Same-origin only, no external requests. © 2026 Stop60 */
(function(){
  "use strict";
  if (window.__s60f) return; window.__s60f = 1;
  var CS = document.currentScript;
  var d = document, html = d.documentElement;
  var L = (html.lang || "nb").slice(0,2).toLowerCase(); L = L === "pl" ? "pl" : L === "en" ? "en" : "no";
  try { if (sessionStorage.getItem("s60f-off") === "1") return; } catch(e){}
  var RM = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)");
  var css = ".s60f{position:fixed;left:0;right:0;bottom:0;z-index:30;background:rgba(18,17,15,.95);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);border-top:1px solid rgba(242,193,78,.35);color:#f5f1e8;padding:0 max(12px,env(safe-area-inset-right,0px)) env(safe-area-inset-bottom,0px) max(12px,env(safe-area-inset-left,0px));font:400 13.5px/1.32 'IBM Plex Sans',system-ui,-apple-system,Segoe UI,Roboto,sans-serif}"+
  ".s60f-in{max-width:72rem;margin:0 auto;padding:5px 0 7px}"+
  ".s60f-r{display:flex;align-items:center;gap:6px;min-height:28px}"+
  ".s60f-h{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font:600 11px/1.2 'Oswald',sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#f2c14e}"+
  ".s60f-h i{font-style:normal;color:#a8a29e;letter-spacing:.06em}"+
  ".s60f-p{color:#a8a29e;letter-spacing:.04em;margin-left:4px}"+
  ".s60f-b{display:block;width:100%;text-align:left;background:none;border:0;color:inherit;font:inherit;padding:1px 0 0;cursor:pointer;-webkit-tap-highlight-color:transparent}"+
  ".s60f-t{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;transition:opacity .45s ease}"+
  ".s60f.pz .s60f-t{-webkit-line-clamp:8}"+
  ".s60f.fade .s60f-t,.s60f.fade .s60f-h i,.s60f.fade .s60f-g{opacity:0}"+
  ".s60f-s{display:none;font-size:11px;color:#a8a29e;margin-top:2px}.s60f.src .s60f-s{display:block}"+
  ".s60f-g{flex:none;color:#12110f;background:#2dd4bf;border-radius:999px;padding:6px 10px;font:600 12px/1 'IBM Plex Sans',system-ui,sans-serif;text-decoration:none;white-space:nowrap;transition:opacity .45s ease}"+
  ".s60f-g[hidden]{display:none}"+
  ".s60f-x,.s60f-n,.s60f-i{flex:none;width:28px;height:28px;border-radius:50%;border:1px solid rgba(255,255,255,.16);background:none;color:#a8a29e;font:600 15px/1 system-ui,sans-serif;cursor:pointer;padding:0}"+
  ".s60f-i{font:italic 600 13px/1 Georgia,serif}.s60f.src .s60f-i{color:#f2c14e;border-color:#f2c14e}"+
  "@media(min-width:760px){.s60f{font-size:15px}.s60f-t{-webkit-line-clamp:2}}"+
  "@media (prefers-reduced-motion:reduce){.s60f-t,.s60f-g{transition:none}}";
  function el(t,c,txt){var e=d.createElement(t); if(c) e.className=c; if(txt!=null) e.textContent=txt; return e;}
  function start(data){
    var F = data.facts, U = data.ui, G = data.groups; if (!F || !F.length) return;
    var st = el("style"); st.textContent = css; d.head.appendChild(st);
    var bar = el("aside","s60f"); bar.setAttribute("aria-label", U.label);
    var inn = el("div","s60f-in"), row = el("div","s60f-r");
    var h = el("span","s60f-h"); var lab = el("b",null,U.label); var grp = el("i"); var ps = el("span","s60f-p");
    h.appendChild(lab); h.appendChild(d.createTextNode(" ")); h.appendChild(grp); h.appendChild(ps);
    var btn = el("button","s60f-b"); btn.type = "button"; btn.setAttribute("aria-pressed","false");
    var tx = el("span","s60f-t");
    var sr = el("span","s60f-s");
    btn.appendChild(tx); btn.appendChild(sr);
    var info = el("button","s60f-i","i"); info.type="button"; info.setAttribute("aria-label", U.src); info.title = U.src;
    var go = el("a","s60f-g"); go.hidden = true;
    var nx = el("button","s60f-n","›"); nx.type="button"; nx.setAttribute("aria-label", L==="pl"?"Następna":L==="en"?"Next":"Neste");
    var x = el("button","s60f-x","×"); x.type="button"; x.setAttribute("aria-label", L==="pl"?"Zamknij":L==="en"?"Close":"Lukk");
    row.appendChild(h); row.appendChild(go); row.appendChild(info); row.appendChild(nx); row.appendChild(x);
    inn.appendChild(row); inn.appendChild(btn);
    bar.appendChild(inn); d.body.appendChild(bar);
    var pad0 = parseFloat(getComputedStyle(d.body).paddingBottom) || 0;
    function fit(){ d.body.style.paddingBottom = (pad0 + bar.offsetHeight) + "px"; }
    fit(); window.addEventListener("resize", fit);
    if (window.ResizeObserver) new ResizeObserver(fit).observe(bar);
    // shuffled order
    var ord = F.map(function(_,i){return i;});
    for (var i = ord.length-1; i > 0; i--) { var j = Math.floor(Math.random()*(i+1)); var t = ord[i]; ord[i] = ord[j]; ord[j] = t; }
    var k = 0, paused = false, timer = 0, reduced = !!(RM && RM.matches);
    function show(n){
      var f = F[ord[n % ord.length]];
      tx.textContent = f.t; grp.textContent = "· " + (G[f.g] || "");
      sr.textContent = U.src + ": " + f.s; tx.title = U.src + ": " + f.s;
      if (f.u) { go.href = f.u; go.textContent = "▶ " + U.play; go.title = U.play + ": " + f.n; go.setAttribute("aria-label", U.play + ": " + f.n); go.hidden = false; } else go.hidden = true;
      bar.setAttribute("data-i", ord[n % ord.length]);
      fit();
    }
    function dwell(){ var f = F[ord[k % ord.length]]; return Math.min(16000, 7000 + f.t.length * 45); }
    function sched(){ clearTimeout(timer); if (paused || reduced || d.hidden) return; timer = setTimeout(next, dwell()); }
    function next(){
      k++;
      if (reduced) { show(k); return; }
      bar.classList.add("fade");
      setTimeout(function(){ show(k); bar.classList.remove("fade"); sched(); }, 450);
    }
    function setPause(p){
      paused = p; bar.classList.toggle("pz", p && !reduced); btn.setAttribute("aria-pressed", p ? "true" : "false");
      ps.textContent = reduced ? "" : (p ? "· ⏸" : "");
      btn.title = reduced ? "" : (p ? U.resume : U.pause);
      sched();
    }
    btn.addEventListener("click", function(){ if (reduced) { next(); return; } setPause(!paused); });
    nx.addEventListener("click", function(){ clearTimeout(timer); next(); if (reduced) return; });
    info.addEventListener("click", function(){ bar.classList.toggle("src"); if (bar.classList.contains("src")) setPause(true); fit(); });
    x.addEventListener("click", function(){ clearTimeout(timer); bar.remove(); st.remove(); d.body.style.paddingBottom = pad0 ? pad0 + "px" : ""; try { sessionStorage.setItem("s60f-off","1"); } catch(e){} });
    d.addEventListener("visibilitychange", sched);
    if (RM && RM.addEventListener) RM.addEventListener("change", function(e){ reduced = e.matches; setPause(paused); });
    show(0); setPause(false);
    window.__s60fApi = { next: next, paused: function(){ return paused; }, count: F.length };
  }
  function load(){
    var src = (CS && CS.dataset.src) || ("/assets/facts/s60-facts-" + L + ".json?v=1");
    fetch(src, { credentials: "same-origin" }).then(function(r){ return r.ok ? r.json() : null; }).then(function(j){ if (j) start(j); }).catch(function(){});
  }
  if (d.readyState === "complete") load(); else window.addEventListener("load", load);
})();
