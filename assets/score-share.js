/* Stop60 "share your score" – native share on phones, otherwise Facebook, WhatsApp and copy.
   The shared URL is the clean game address (language path allowed). No UTM, no query string.
   Fires GoatCounter "<game>-share" when the counter is already on the page. */
(function () {
  "use strict";
  var TXT = {
    no: "Jeg fikk {n} poeng i {g} – klarer du mer? stop60.no",
    pl: "Zdobyłem {n} punktów w {g} – pobijesz mnie? stop60.no",
    en: "I scored {n} points in {g} – can you beat me? stop60.no"
  };
  var UI = {
    no: { fb: "Facebook", wa: "WhatsApp", copy: "Kopier tekst", copied: "Teksten er kopiert" },
    pl: { fb: "Facebook", wa: "WhatsApp", copy: "Kopiuj tekst", copied: "Tekst skopiowany" },
    en: { fb: "Facebook", wa: "WhatsApp", copy: "Copy text", copied: "Text copied" }
  };
  var CSS = ".s60sl{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:8px auto 0;max-width:420px}" +
    ".s60sl a,.s60sl button{flex:1 1 96px;min-height:40px;margin:0;padding:8px 8px;border-radius:12px;border:1px solid rgba(255,255,255,.4);" +
    "background:rgba(0,0,0,.38);color:#fff;font:700 13px/1.2 system-ui,-apple-system,sans-serif;text-decoration:none;text-align:center;cursor:pointer}" +
    ".s60sl a:active,.s60sl button:active{transform:scale(.97)}" +
    ".s60st{position:fixed;left:50%;bottom:calc(18px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:10001;" +
    "background:#1c1612;color:#fff8ee;padding:10px 14px;border-radius:12px;font:600 14px/1.3 system-ui,sans-serif;" +
    "box-shadow:0 8px 24px rgba(0,0,0,.35);max-width:88vw;text-align:center}";

  function langOf(l) {
    l = String(l || (document.documentElement.lang || "en")).slice(0, 2).toLowerCase();
    if (l === "nb" || l === "nn") l = "no";
    return TXT[l] ? l : "en";
  }
  function cleanURL(game, lang) {
    var slug = String(game || "").replace(/^\/+|\/+$/g, "");
    var path = "/" + slug + "/";
    if (lang === "en" || lang === "pl") path += lang + "/";
    return "https://stop60.no" + path;
  }
  function sentence(o) {
    o = o || {};
    var l = langOf(o.lang);
    return TXT[l].replace("{n}", o.score).replace("{g}", o.gameName || "Stop60");
  }
  function isMobile() {
    try {
      if (matchMedia("(pointer: coarse)").matches || matchMedia("(hover: none)").matches) return true;
    } catch (e) {}
    return false;
  }
  function track(game) {
    try {
      if (window.goatcounter && goatcounter.count) goatcounter.count({ path: game + "-share", title: game + " share", event: true });
    } catch (e) {}
  }
  function legacyCopy(s) {
    var ta = document.createElement("textarea");
    ta.value = s; ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;top:0;left:0;opacity:0";
    document.body.appendChild(ta); ta.focus(); ta.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) {}
    ta.remove();
    return ok;
  }
  function copyText(s) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(s).then(function () { return true; }, function () { return legacyCopy(s); });
    }
    return Promise.resolve(legacyCopy(s));
  }
  var toastEl, toastT;
  function toast(msg) {
    if (!toastEl) { toastEl = document.createElement("div"); toastEl.className = "s60st"; toastEl.setAttribute("role", "status"); document.body.appendChild(toastEl); }
    toastEl.textContent = msg;
    clearTimeout(toastT);
    toastT = setTimeout(function () { if (toastEl) toastEl.remove(); toastEl = null; }, 1800);
  }
  function ensureCSS() {
    if (document.getElementById("s60sl-css")) return;
    var st = document.createElement("style"); st.id = "s60sl-css"; st.textContent = CSS; document.head.appendChild(st);
  }
  function showLinks(box, text, url, l) {
    if (!box) return;
    ensureCSS();
    var ui = UI[l] || UI.en;
    box.classList.add("s60sl");
    box.replaceChildren();
    var fb = document.createElement("a");
    fb.href = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url);
    fb.target = "_blank"; fb.rel = "noopener"; fb.textContent = ui.fb;
    var wa = document.createElement("a");
    wa.href = "https://wa.me/?text=" + encodeURIComponent(text + " " + url);
    wa.target = "_blank"; wa.rel = "noopener"; wa.textContent = ui.wa;
    var cp = document.createElement("button");
    cp.type = "button"; cp.textContent = ui.copy;
    cp.onclick = function (e) {
      e.preventDefault(); e.stopPropagation();
      copyText(text + "\n" + url).then(function () { toast(ui.copied); });
    };
    [fb, wa, cp].forEach(function (el) {
      el.addEventListener("pointerdown", function (e) { e.stopPropagation(); });
    });
    box.append(fb, wa, cp);
    box.hidden = false;
  }
  function payload(opts) {
    var l = langOf(typeof opts.lang === "function" ? opts.lang() : opts.lang);
    var name = typeof opts.gameName === "function" ? opts.gameName() : opts.gameName;
    var sc = typeof opts.score === "function" ? opts.score() : opts.score;
    var url = opts.url ? (typeof opts.url === "function" ? opts.url() : opts.url) : cleanURL(opts.game, l);
    url = String(url).split("#")[0].split("?")[0];
    return { l: l, name: name, text: sentence({ lang: l, score: sc, gameName: name }), url: url };
  }
  function bind(button, opts) {
    if (!button || !opts) return;
    ensureCSS();
    button.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      var p = payload(opts);
      track(opts.game);
      if (navigator.share && isMobile()) {
        navigator.share({ title: p.name, text: p.text, url: p.url }).catch(function (err) {
          if (!err || err.name !== "AbortError") showLinks(opts.links, p.text, p.url, p.l);
        });
        return;
      }
      showLinks(opts.links, p.text, p.url, p.l);
    });
  }
  window.S60ScoreShare = { bind: bind, text: sentence, url: cleanURL, isMobile: isMobile };
})();
