/* Stop60 share-result helper – dependency-free, ~3 KB. © 2026 Stop60
   <script src="/home-v2/share.js" defer></script>
   StopShare.share({game:"Ufobang", score:1234, lang:"no", url:"https://stop60.no/ufobang/", id:"ufobang"})
     -> Promise<"shared"|"copied"|"cancelled"|"failed">
   Options: game (display name), score (number or string), lang ("no"|"pl"|"en", default <html lang>),
            url (default location without query/hash), id (utm_campaign, default from game),
            text (full custom text, overrides template), toast (false = no "copied" toast)
   StopShare.text(o) / StopShare.link(o, medium) return the text / tagged link without sharing. */
(function () {
  var T = {
    no: { t: "Jeg fikk {n} poeng i {g} på stop60.no – klarer du å slå meg?", c: "Lenke og tekst kopiert", f: "Kunne ikke dele – kopier lenken: " },
    pl: { t: "Mam {n} pkt w {g} na stop60.no – dasz radę mnie pobić?", c: "Skopiowano link i tekst", f: "Nie udało się udostępnić – skopiuj link: " },
    en: { t: "I scored {n} in {g} on stop60.no – can you beat me?", c: "Link and text copied", f: "Could not share – copy the link: " }
  };
  function lang(o) {
    var l = (o && o.lang) || (document.documentElement.lang || "en").slice(0, 2);
    if (l === "nb" || l === "nn") l = "no";
    return T[l] ? l : "en";
  }
  function fmt(n, l) {
    if (typeof n !== "number") return String(n);
    try { return n.toLocaleString(l === "no" ? "nb-NO" : l === "pl" ? "pl-PL" : "en-GB"); } catch (e) { return String(n); }
  }
  function slug(s) { return String(s || "stop60").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ø/g, "o").replace(/ł/g, "l").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
  function link(o, medium) {
    o = o || {};
    var u = o.url || (location.origin + location.pathname), h = "";
    var i = u.indexOf("#"); if (i >= 0) { h = u.slice(i); u = u.slice(0, i); }
    u = u.replace(/([?&])utm_[a-z]+=[^&]*/g, "$1").replace(/[?&]+$/, "").replace(/\?&+/, "?");
    var q = "utm_source=share&utm_medium=" + encodeURIComponent(medium || "web-share") + "&utm_campaign=" + encodeURIComponent(o.id || slug(o.game));
    return u + (u.indexOf("?") >= 0 ? "&" : "?") + q + h;
  }
  function text(o) {
    o = o || {}; var l = lang(o);
    return o.text || T[l].t.replace("{n}", fmt(o.score, l)).replace("{g}", o.game || "Stop60");
  }
  function toast(msg) {
    var el = document.createElement("div");
    el.setAttribute("role", "status");
    el.style.cssText = "position:fixed;left:50%;bottom:max(20px,env(safe-area-inset-bottom));transform:translateX(-50%);z-index:9999;max-width:90vw;padding:10px 16px;border-radius:10px;background:#1c1b19;color:#f5f5f4;border:1px solid rgba(255,255,255,.25);font:15px/1.3 system-ui,sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.4);word-break:break-word";
    el.textContent = msg; document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 2600);
  }
  function legacyCopy(s) {
    var ta = document.createElement("textarea"); ta.value = s; ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;top:-1000px;opacity:0"; document.body.appendChild(ta); ta.select();
    var ok = false; try { ok = document.execCommand("copy"); } catch (e) {}
    ta.remove(); return ok;
  }
  function copy(s) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(s).then(function () { return true; }, function () { return legacyCopy(s); });
    return Promise.resolve(legacyCopy(s));
  }
  function share(o) {
    o = o || {}; var l = lang(o), t = text(o);
    if (navigator.share) {
      var d = { title: o.game ? o.game + " – Stop60" : "Stop60", text: t, url: link(o, "web-share") };
      if (!navigator.canShare || navigator.canShare(d)) {
        return navigator.share(d).then(function () { return "shared"; }, function (e) {
          if (e && e.name === "AbortError") return "cancelled";
          return fallback(o, l, t);
        });
      }
    }
    return fallback(o, l, t);
  }
  function fallback(o, l, t) {
    var u = link(o, "copy"), s = t + " " + u;
    return copy(s).then(function (ok) {
      if (ok) { if (o.toast !== false) toast(T[l].c); return "copied"; }
      try { window.prompt(T[l].f, s); } catch (e) {}
      return "failed";
    });
  }
  window.StopShare = { share: share, text: text, link: link, copy: copy };
})();
