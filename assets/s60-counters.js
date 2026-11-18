/* Stop60 counter strip: real numbers from /counters.json (built from GoatCounter events by the Pages workflow).
   Small values show friendly copy instead of a sad 0. No cookies, no tracking of its own. */
(function(){
"use strict";
var T = {
 nb:{loc:"nb-NO",plays:["spill startet hittil"],daily:["har spilt dagens utfordring i dag"],shares:["resultater delt med venner"],
     f:{plays:"Gratis spill – start nå",daily:"Bli den første i dag!",shares:"Del resultatet med en venn"}},
 en:{loc:"en-GB",plays:["game played so far","games played so far"],daily:["person played today’s challenge","people played today’s challenge"],shares:["score shared with friends","scores shared with friends"],
     f:{plays:"Free games – start now",daily:"Be the first today!",shares:"Share your score with a friend"}},
 pl:{loc:"pl-PL",plays:["rozegrana gra","rozegrane gry","rozegranych gier"],daily:["osoba zagrała dziś w wyzwanie","osoby zagrały dziś w wyzwanie","osób zagrało dziś w wyzwanie"],shares:["udostępniony wynik","udostępnione wyniki","udostępnionych wyników"],
     f:{plays:"Darmowe gry – zagraj teraz",daily:"Bądź dziś pierwszy!",shares:"Podziel się wynikiem ze znajomym"}}
};
var MIN = {plays:10, daily:3, shares:3};
function form(lang, forms, n){
  if (forms.length === 1) return forms[0];
  if (lang === "pl"){ if (n === 1) return forms[0]; var a = n % 10, b = n % 100; return (a >= 2 && a <= 4 && (b < 12 || b > 14)) ? forms[1] : forms[2]; }
  return n === 1 ? forms[0] : forms[1];
}
function fill(el, d){
  var lang = T[el.getAttribute("data-s60c")] ? el.getAttribute("data-s60c") : "nb", t = T[lang];
  if (d && d.day){ var today = new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Oslo"}).format(new Date()); if (d.day !== today) d.daily_today = 0; }
  ["plays","daily","shares"].forEach(function(k){
    var tile = el.querySelector('[data-k="' + k + '"]'); if (!tile) return;
    var n = d ? Number(k === "daily" ? d.daily_today : d[k]) : NaN;
    var b = tile.querySelector("b"), s = tile.querySelector("span");
    if (isFinite(n) && n >= MIN[k]){ b.textContent = n.toLocaleString(t.loc); s.textContent = form(lang, t[k], n); tile.className = "s60c-t on"; }
    else { s.textContent = t.f[k]; tile.className = "s60c-t"; }
  });
  el.setAttribute("data-ready", "1");
}
function run(){
  var els = document.querySelectorAll("[data-s60c]"); if (!els.length) return;
  var done = function(d){ for (var i = 0; i < els.length; i++) fill(els[i], d); };
  if (!window.fetch){ done(null); return; }
  fetch("/counters.json", {cache: "no-cache"}).then(function(r){ return r.ok ? r.json() : null; }).then(done, function(){ done(null); });
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run); else run();
})();
