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
    ["ufobang", "Skyt ned Rødmantaen én gang", "Zestrzel Czerwoną Mantę", "Shoot down the Red Manta once"],
    ["ufobang", "Klar bølge 1 uten å miste et liv", "Przejdź falę 1 bez utraty życia", "Clear wave 1 without losing a life"],
    ["redning", "Nå bølge 3", "Dojdź do fali 3", "Reach wave 3"],
    ["redning", "Redd 5 mennesker i én runde", "Uratuj 5 ludzi w jednej rundzie", "Save 5 humans in one round"],
    ["redning", "Få 2 000 poeng", "Zdobądź 2000 punktów", "Score 2,000 points"],
    ["redning", "Klar bølge 1 uten at noen blir mutant", "Przejdź falę 1 tak, by nikt nie został mutantem", "Clear wave 1 without anyone turning mutant"],
    ["lavakule", "Rull 300 meter", "Przetocz się 300 metrów", "Roll 300 metres"],
    ["lavakule", "Samle 20 mynter på én tur", "Zbierz 20 monet w jednym biegu", "Collect 20 coins in one run"],
    ["lavakule", "Fullfør dagens løp (Daily run)", "Ukończ bieg dnia (Daily run)", "Finish today's Daily run"],
    ["lavakule", "Få en myntkombo på ×3", "Zrób combo monet ×3", "Get a ×3 coin combo"],
    ["aspheris", "Samle alle 7 hjertefragmentene i sone 1", "Zbierz wszystkie 7 fragmentów serca w strefie 1", "Collect all 7 heart fragments in zone 1"],
    ["aspheris", "Fly gjennom portalen og fullfør sone 1", "Przeleć przez portal i ukończ strefę 1", "Fly through the portal and finish zone 1"],
    ["aspheris", "Samle 3 fragmenter uten å treffe Driften", "Zbierz 3 fragmenty, nie dotykając Dryfu", "Collect 3 fragments without touching the Drift"],
    ["aspheris", "Nå sone 2", "Dotrzyj do strefy 2", "Reach zone 2"],
    ["logikk", "Løs dagens oppgave", "Rozwiąż zagadkę dnia", "Solve today's daily puzzle"],
    ["logikk", "Løs en lett oppgave uten hint", "Rozwiąż łatwą łamigłówkę bez podpowiedzi", "Solve an easy puzzle without hints"],
    ["logikk", "Løs en middels oppgave på under 15 minutter", "Rozwiąż średnią łamigłówkę w mniej niż 15 minut", "Solve a medium puzzle in under 15 minutes"],
    ["logikk", "Løs en oppgave uten en eneste feil", "Rozwiąż łamigłówkę bez ani jednego błędu", "Solve a puzzle without a single mistake"],
    ["hefau", "Slå datamaskinen", "Pokonaj komputer", "Beat the computer"],
    ["hefau", "Få alle tre løvene helt til kobraens hode", "Doprowadź wszystkie trzy lwy do głowy kobry", "Get all three lions to the cobra's head"],
    ["hefau", "Utfordre en venn – to på én telefon", "Wyzwij znajomego – we dwoje na jednym telefonie", "Challenge a friend – two on one phone"],
    ["strom", "Kom deg gjennom en hel runde på 60 sekunder", "Przetrwaj całą 60-sekundową rundę", "Make it through a full 60-second round"],
    ["strom", "Fang 3 HMS-huskeregler i én runde", "Złap 3 hasła BHP w jednej rundzie", "Pick up 3 safety reminders in one round"],
    ["strom", "Kom gjennom byggeplassen uten å bli truffet", "Przejdź budowę bez ani jednego trafienia", "Cross the site without getting hit"],
    ["robaki", "Knus 20 kryp i én runde", "Rozgnieć 20 robaków w jednej rundzie", "Squash 20 bugs in one round"],
    ["robaki", "Nå bølge 2", "Dojdź do fali 2", "Reach wave 2"],
    ["robaki", "Fullfør en runde uten å bli truffet av gift", "Ukończ rundę bez trafienia jadem", "Finish a round without being hit by venom"],
    ["robaki", "Få 500 poeng i én runde", "Zdobądź 500 punktów w jednej rundzie", "Score 500 points in one round"]
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
