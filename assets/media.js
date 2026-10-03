/* Stop60: lazy-load gameplay clips; muted autoplay only while visible and only without prefers-reduced-motion
   (with reduced motion: poster + controls, nothing is downloaded until the visitor presses play). */
(function () {
  var vids = [].slice.call(document.querySelectorAll("video.lazyv"));
  if (!vids.length) return;
  var mq = window.matchMedia ? matchMedia("(prefers-reduced-motion: reduce)") : null;
  function reduced() { return !!(mq && mq.matches); }
  function load(v) {
    if (v.dataset.loaded) return; v.dataset.loaded = "1";
    if (v.dataset.poster) v.poster = v.dataset.poster;
    if (reduced()) { offer(v); return; }  /* poster only; nothing downloaded until the visitor asks */
    attach(v);
  }
  function attach(v) {
    if (v.dataset.att) return; v.dataset.att = "1";
    [].forEach.call(v.querySelectorAll("source[data-src]"), function (s) { s.src = s.dataset.src; });
    v.load();
  }
  function offer(v) {
    if (v.parentNode.querySelector(".pbtn")) return;
    var b = document.createElement("button"); b.type = "button"; b.className = "pbtn";
    b.setAttribute("aria-label", v.getAttribute("aria-label") || "Play"); b.textContent = "\u25B6";
    b.addEventListener("click", function () { b.remove(); attach(v); v.controls = true; v.play().catch(function () {}); });
    v.parentNode.insertBefore(b, v.nextSibling);
  }
  function play(v) {
    if (reduced()) return; load(v); attach(v); v.muted = true; v.autoplay = true;
    var p = v.play(); if (p && p.catch) p.catch(function () { v.controls = true; });
  }
  if (!("IntersectionObserver" in window)) { vids.forEach(function (v) { load(v); play(v); }); return; }
  var near = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { load(e.target); near.unobserve(e.target); } });
  }, { rootMargin: "300px 300px" });
  var vis = new IntersectionObserver(function (es) {
    es.forEach(function (e) { var v = e.target; if (e.isIntersecting && e.intersectionRatio >= 0.5) play(v); else if (!v.paused) v.pause(); });
  }, { threshold: [0, 0.5] });
  vids.forEach(function (v) { near.observe(v); vis.observe(v); });
  if (mq && mq.addEventListener) mq.addEventListener("change", function () { if (reduced()) vids.forEach(function (v) { v.pause(); v.autoplay = false; v.controls = true; }); });
})();
