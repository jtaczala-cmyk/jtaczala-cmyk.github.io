/* Stop60 "All games" control: a small corner button during play and a big button on end screens.
   Include: <script src="/assets/s60-back.js" data-game="redning" data-pos="bl" data-end="after:#oAgain" defer></script>
   data-pos: tl | tr | bl | br (corner), data-dx / data-dy: extra offset in px, data-compact="1": icon only,
   data-end: end-screen anchors separated by "|": "after:SEL", "before:SEL" or "in:SEL" (append). */
(function () {
  'use strict';
  if (window.__s60back) return; window.__s60back = 1;
  var s = document.currentScript || document.querySelector('script[src*="s60-back.js"]');
  var ds = (s && s.dataset) || {};
  var game = ds.game || (location.pathname.split('/')[1] || 'game');
  var pos = ds.pos || 'tl', dx = +ds.dx || 0, dy = +ds.dy || 0, compact = ds.compact === '1';
  var ends = (ds.end || '').split('|').map(function (x) { return x.trim(); }).filter(Boolean);
  var TXT = { no: 'Alle spill', en: 'All games', pl: 'Wszystkie gry' };
  var HOME = { no: '/', en: '/en/', pl: '/pl/' };
  function lang() {
    var l = (document.documentElement.getAttribute('data-lang') || document.documentElement.lang || '').toLowerCase();
    if (/^pl/.test(l)) return 'pl';
    if (/^en/.test(l)) return 'en';
    if (/^(nb|nn|no)/.test(l)) return 'no';
    var p = location.pathname;
    if (/\/(pl|prywatnosc)\//.test(p) || /^\/prad\//.test(p)) return 'pl';
    if (/\/en\//.test(p) || /^\/power\//.test(p)) return 'en';
    return 'no';
  }
  var ICON = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 11.5 12 4l9 7.5M5.5 9.5V20h5v-6h3v6h5V9.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var css = '' +
    '.s60b{position:fixed;z-index:2147483000;display:inline-flex;align-items:center;gap:6px;height:40px;min-width:40px;padding:0 13px 0 10px;border-radius:20px;' +
    'background:rgba(12,16,26,.72);color:#fff;border:1.5px solid rgba(255,255,255,.55);font:600 13px/1 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;letter-spacing:.01em;' +
    'text-decoration:none;-webkit-tap-highlight-color:transparent;touch-action:manipulation;user-select:none;-webkit-user-select:none;box-shadow:0 2px 8px rgba(0,0,0,.35);' +
    '-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);opacity:.9;cursor:pointer}' +
    '.s60b:hover,.s60b:focus-visible{opacity:1;background:rgba(12,16,26,.9)}.s60b:active{transform:scale(.96)}' +
    '.s60b svg,.s60B svg{width:18px;height:18px;flex:none}' +
    '.s60b.s60c{width:40px;padding:0;justify-content:center;border-radius:50%}.s60b.s60c span{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}.s60b.s60c svg{width:20px;height:20px}' +
    '.s60B{display:flex!important;align-items:center;justify-content:center;gap:8px;box-sizing:border-box;width:100%;max-width:340px;min-height:48px;margin:10px auto 4px!important;padding:10px 16px;' +
    'border-radius:12px;background:#fff;color:#111;border:2px solid #111;font:700 16px/1.2 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;text-decoration:none;' +
    'box-shadow:0 2px 0 rgba(0,0,0,.25);-webkit-tap-highlight-color:transparent;touch-action:manipulation;cursor:pointer;position:relative;z-index:2}' +
    '.s60B:active{transform:translateY(1px)}' +
    '@media print{.s60b{display:none}}';
  function off(v, side) { return 'calc(env(safe-area-inset-' + side + ', 0px) + ' + (8 + v) + 'px)'; }
  function go(ev) {
    if (ev) { ev.preventDefault(); ev.stopPropagation(); }
    if (go.busy) return; go.busy = 1; setTimeout(function () { go.busy = 0; }, 1500);
    var url = HOME[lang()];
    try { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: 'back-to-games-' + game, title: 'Back to games', event: true }); } catch (e) {}
    var nav = function () { location.href = url; };
    var d = document;
    try {
      if (d.fullscreenElement && d.exitFullscreen) { d.exitFullscreen().then(nav, nav); setTimeout(nav, 600); return; }
      if (d.webkitFullscreenElement && d.webkitExitFullscreen) { d.webkitExitFullscreen(); setTimeout(nav, 150); return; }
    } catch (e) {}
    nav();
  }
  function wire(a) {
    var down = false;
    var stop = function (e) { e.stopPropagation(); };
    a.addEventListener('pointerdown', function (e) { down = true; e.stopPropagation(); });
    a.addEventListener('pointerup', function (e) { if (down) { down = false; go(e); } });
    a.addEventListener('pointercancel', function () { down = false; });
    a.addEventListener('touchstart', stop, { passive: true });
    a.addEventListener('touchend', stop);
    a.addEventListener('mousedown', stop);
    a.addEventListener('click', go);
    a.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') go(e); });
  }
  function make(cls) {
    var a = document.createElement('a');
    a.className = cls; a.setAttribute('role', 'link'); a.setAttribute('data-s60back', '1');
    a.setAttribute('translate', 'no');
    fill(a); wire(a); return a;
  }
  function fill(a) {
    var l = lang(), t = TXT[l];
    a.href = HOME[l]; a.setAttribute('aria-label', t + ' – stop60.no'); a.title = t;
    a.innerHTML = ICON + '<span>' + t + '</span>';
  }
  var corner, bigs = [];
  function relabel() { if (corner) fill(corner); bigs.forEach(fill); }
  function injectEnds() {
    ends.forEach(function (spec) {
      var m = /^(after|before|in):(.+)$/.exec(spec), how = m ? m[1] : 'in', sel = m ? m[2] : spec;
      var els; try { els = document.querySelectorAll(sel); } catch (e) { return; }
      for (var i = 0; i < els.length; i++) {
        var el = els[i];
        if (el.__s60b && el.__s60b.isConnected) continue;
        var b = make('s60B');
        if (how === 'after') el.parentNode.insertBefore(b, el.nextSibling);
        else if (how === 'before') el.parentNode.insertBefore(b, el);
        else el.appendChild(b);
        el.__s60b = b; bigs.push(b);
      }
    });
    bigs = bigs.filter(function (b) { return b.isConnected; });
  }
  function init() {
    if (!document.body || document.getElementById('s60back')) return;
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    corner = make(compact ? 's60b s60c' : 's60b'); corner.id = 's60back';
    var v = pos.charAt(0) === 'b' ? 'bottom' : 'top', h = pos.charAt(1) === 'r' ? 'right' : 'left';
    corner.style[v] = off(dy, v); corner.style[h] = off(dx, h);
    document.body.appendChild(corner);
    injectEnds();
    var q = 0;
    new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) if (muts[i].type === 'attributes') { relabel(); break; }
      if (ends.length && !q) { q = 1; requestAnimationFrame(function () { q = 0; injectEnds(); }); }
      if (corner && !corner.isConnected) document.body.appendChild(corner);
    }).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['lang', 'data-lang'] });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
