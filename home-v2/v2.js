/* Stop60 home-v2 prototype: card video previews, random game, daily challenge. © 2026 Stop60 */
(function () {
  var C = window.S60V2 || { lang: "en", games: [] }, L = C.lang;
  var qs = new URLSearchParams(location.search);
  function games(id) { for (var i = 0; i < C.games.length; i++) if (C.games[i].id === id) return C.games[i]; return null; }

  /* ---- video previews: only when visible, never with reduced motion / data saver ---- */
  var rm = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var sd = navigator.connection && navigator.connection.saveData;
  var vids = [].slice.call(document.querySelectorAll("video.pv"));
  if (!rm && !sd && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting && e.intersectionRatio >= 0.5) {
          if (!v.dataset.ld) {
            v.dataset.ld = 1;
            [["webm", "video/webm"], ["mp4", "video/mp4"]].forEach(function (s) {
              var so = document.createElement("source"); so.src = v.dataset[s[0]]; so.type = s[1]; v.appendChild(so);
            });
            v.addEventListener("playing", function () { v.classList.add("on"); });
            v.addEventListener("error", function () { v.classList.remove("on"); }, true);
            v.load();
          }
          var p = v.play(); if (p && p.catch) p.catch(function () {});
        } else if (v.dataset.ld) v.pause();
      });
    }, { threshold: [0, 0.5], rootMargin: "0px" });
    vids.forEach(function (v) { v.muted = true; io.observe(v); });
    document.addEventListener("visibilitychange", function () { if (document.hidden) vids.forEach(function (v) { v.pause(); }); });
  }

  /* ---- random game ---- */
  var rb = document.getElementById("v2rand");
  if (rb) rb.addEventListener("click", function (ev) {
    if (!C.games.length) return;
    ev.preventDefault();
    var g = C.games[Math.floor(Math.random() * C.games.length)];
    location.href = g.url;
  });

  /* ---- daily challenge (deterministic per local date; ?date=YYYY-MM-DD to preview) ---- */
  var G = [
    ["ufobang", "Nå bølge 3", "Dojdź do fali 3", "Reach wave 3"],
    ["ufobang", "Få 1 000 poeng", "Zdobądź 1000 punktów", "Score 1,000 points"],
    ["ufobang", "Skyt ned Rødmantaen én gang", "Zestrzel Mantę", "Shoot down the Red Manta once"],
    ["ufobang", "Klar bølge 1 uten å miste et liv", "Przejdź falę 1 bez utraty życia", "Clear wave 1 without losing a life"],
    ["redning", "Nå bølge 3", "Dojdź do fali 3", "Reach wave 3"],
    ["redning", "Fang og sett ned 3 mennesker i ett spill", "Złap i odstaw 3 ludzi w jednej grze", "Catch and set down 3 humans in one game"],
    ["redning", "Få 2 000 poeng", "Zdobądź 2000 punktów", "Score 2,000 points"],
    ["redning", "Klar bølge 1 uten at noen blir mutant", "Przejdź falę 1 tak, by nikt nie został mutantem", "Clear wave 1 without anyone turning mutant"],
    ["lavakule", "Kom 300 m", "Dojedź 300 m", "Reach 300 m"],
    ["lavakule", "Samle 20 mynter i ett løp", "Zbierz 20 monet w jednym biegu", "Collect 20 coins in one run"],
    ["lavakule", "Spill Dagens løp og sett dagens rekord", "Zagraj Bieg dnia i ustaw rekord dnia", "Play the Daily run and set a daily best"],
    ["lavakule", "Nå Kombo ×3", "Zrób Kombo ×3", "Reach Combo ×3"],
    ["aspheris", "Samle alle 7 hjertefragmentene i sone 1", "Zbierz wszystkie 7 fragmentów serca w strefie 1", "Collect all 7 heart fragments in zone 1"],
    ["aspheris", "Fly gjennom portalen og fullfør sone 1", "Przeleć przez portal i ukończ strefę 1", "Fly through the portal and finish zone 1"],
    ["aspheris", "Fullfør alle tre sonene og bygg opp hjertet igjen", "Ukończ wszystkie trzy strefy i odbuduj Serce", "Finish all three zones and rebuild the Heart"],
    ["aspheris", "Nå sone 2", "Dotrzyj do strefy 2", "Reach zone 2"],
    ["logikk", "Løs Dagens brett", "Rozwiąż Planszę dnia", "Solve today's Daily puzzle"],
    ["logikk", "Løs et lett brett uten hint", "Rozwiąż łatwą planszę bez podpowiedzi", "Solve an Easy puzzle without hints"],
    ["logikk", "Slå på Tidsmodus og løs et middels brett på under 15 minutter", "Włącz Tryb czasowy i rozwiąż średnią planszę w mniej niż 15 minut", "Turn on Timed mode and solve a Medium puzzle in under 15 minutes"],
    ["logikk", "Løs et brett med 0 feil", "Rozwiąż planszę z 0 błędów", "Solve a puzzle with 0 mistakes"],
    ["hefau", "Slå datamaskinen på lett", "Pokonaj komputer na poziomie łatwym", "Beat the computer on easy"],
    ["hefau", "Få alle tre løvene helt til kobraens hode", "Doprowadź wszystkie trzy lwy do głowy kobry", "Get all three lions to the cobra's head"],
    ["hefau", "Slå datamaskinen på vanskelig", "Pokonaj komputer na poziomie trudnym", "Beat the computer on hard"],
    ["strom", "Hold ut hele minuttet uten å falle", "Wytrzymaj całą minutę i nie upadnij", "Last the whole minute without falling"],
    ["strom", "Få 5 KO i én runde", "Zrób 5 KO w jednej rundzie", "Get 5 KOs in one round"],
    ["strom", "Sett ny rekord", "Pobij swój rekord", "Beat your personal best"],
    ["robaki", "Knus 20 kryp i én runde", "Rozgnieć 20 robaków w jednej rundzie", "Squash 20 bugs in one round"],
    ["robaki", "Nå bølge 5", "Dojdź do fali 5", "Reach wave 5"],
    ["robaki", "Fullfør en runde uten å bli truffet av gift", "Ukończ rundę bez trafienia jadem", "Finish a round without being hit by venom"],
    ["robaki", "Få 1 000 poeng i én runde", "Zdobądź 1000 punktów w jednej rundzie", "Score 1,000 points in one round"]
  ];
  var LI = { no: 1, pl: 2, en: 3 }, IN = { no: " i ", pl: " w grze ", en: " in " };
  function key(d) { return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function dayNum(s) { var p = s.split("-"); return Math.floor(Date.UTC(+p[0], p[1] - 1, +p[2]) / 864e5); }
  var ds = /^\d{4}-\d\d-\d\d$/.test(qs.get("date") || "") ? qs.get("date") : key(new Date());
  var n = G.length, i = ((dayNum(ds) * 13 + 5) % n + n) % n, ch = G[i], g = games(ch[0]);
  var box = document.getElementById("v2day");
  if (box && g) {
    box.querySelector("[data-goal]").textContent = ch[LI[L]] + IN[L] + g.name;
    box.querySelector("[data-game]").textContent = g.name;
    var a = box.querySelector("[data-go]"); a.href = g.url;
    var img = box.querySelector("[data-img]"); if (img) { img.src = "/home-v2/media/poster/" + g.id + "_" + L + ".webp"; img.hidden = false; }
    try {
      box.querySelector("[data-date]").textContent = new Date(dayNum(ds) * 864e5).toLocaleDateString(L === "no" ? "nb-NO" : L === "pl" ? "pl-PL" : "en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
    } catch (e) {}
    if (window.StopWisdom) {
      var w = StopWisdom.pick(L, ds), q = { no: ["«", "»"], pl: ["„", "”"], en: ["“", "”"] }[L];
      box.querySelector("[data-wl]").textContent = w.label;
      box.querySelector("[data-wt]").textContent = q[0] + w.text + q[1];
      box.querySelector("[data-wo]").textContent = w.origin ? "— " + w.origin : "";
      box.querySelector(".wis").hidden = false;
    }
    box.hidden = false;
  }
})();
