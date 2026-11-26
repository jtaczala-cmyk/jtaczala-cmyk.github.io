/* Stop60 · Bestefar Jørgen / Dziadek Jørgen / Grandpa Jørgen (clumsy, warm) – shared cozy-series character (canvas, no images).
   Usage in a game:
     S60Bestefar.init({xmas: XMAS, game: "<id>", mode: function(){ return mode; }});
     S60Bestefar.draw(ctx, x, y, s)          // in render(); x,y = same anchor as drawGrandma (feet at y+72*s)
     S60Bestefar.bubble(ctx)                 // after everything else in render() (speech bubble on top)
     S60Bestefar.react("start"|"combo"|"level"|"win"|"over"|"stuck"|"oops"|"hurry"|"code")
     S60Bestefar.overLine(el)                // fills a <p> on the end screen with his line
     S60Bestefar.mountMenu(menuSection)      // small waving grandpa in the menu card corner (phones only)
*/
(function(){
  "use strict";
  var O = {xmas: false, game: "", hat: "", mode: function(){ return "play"; }};
  /* Seasonal hat (STANDARDS: Jørgen's look): Santa hat in the Christmas season (the game's XMAS flag, until 26.12),
     ushanka (ear-flap fur hat) from 27.12 to the end of February, otherwise his red wool cap.
     Test overrides: ?hat=santa|ushanka|cap, or ?date=YYYY-MM-DD (date only changes the ushanka/cap choice). */
  var QS0 = (function(){ try { return new URLSearchParams(location.search); } catch(e){ return {get: function(){ return null; }}; } })();
  function dayNow(){ var q = QS0.get("date"), d = new Date(); if (/^\d{4}-\d\d-\d\d$/.test(q || "")){ var p = q.split("-"); d = new Date(+p[0], +p[1] - 1, +p[2], 12); } return d; }
  function isUshankaDay(d){ var m = d.getMonth(), day = d.getDate(); return (m === 11 && day >= 27) || m === 0 || m === 1; }
  function hatKind(){ var q = QS0.get("hat"); if (q === "santa" || q === "ushanka" || q === "cap") return q; if (O.hat) return O.hat; if (O.xmas) return "santa"; return isUshankaDay(dayNow()) ? "ushanka" : "cap"; }
  var L = {
    no: {
      start: ["Kaffen er klar – nå kjører vi!", "Jørgen er klar! Hvor er brillene mine?", "Jeg skal bare hjelpe litt…"],
      startX: ["God jul! Jørgen er klar.", "Nissen er sen – Jørgen hjelper til så lenge!", "Hvor la jeg nisselua? Å, den sitter på hodet."],
      combo: ["Oi oi oi!", "Fy flate, så flott!", "Det klarte ikke jeg i min ungdom!", "Bravo! Jeg klapper… au, kaffen!"],
      level: ["«Jørgen, ikke spis alle kjeksene!» – «Bare én…»", "Den smaker jeg på senere…", "{G}, se her! …{G}?", "Psst… ikke si det til {g}."],
      win: ["Bravo! Det fortjener en kopp kaffe!", "Hurra! Jeg danser… nei, ryggen.", "Mesterlig! Jørgen er stolt av deg."],
      over: ["Godt jobba! En runde til?", "Ikke verst! Jeg hadde mistet brillene for lenge siden.", "Selv Jørgen bommer av og til. Ofte, faktisk."],
      stuck: ["Hmm… hva var det jeg skulle? Å ja, hjelpe deg!", "Ta det med ro – en slurk kaffe hjelper."],
      oops: ["Oj! Det var nok min skyld.", "Det skjer de beste – og Jørgen hver dag!"],
      hurry: ["Raskt nå, før kaffen blir kald!", "Litt fart på! Jeg kommer… straks… uff."],
      code: ["Ekstra liv? Det trenger jeg også!", "Hemmelig kode? Jeg har glemt min."],
      wake: ["Hm? Jeg sov ikke, jeg tenkte!", "Hæ? Jeg bare hvilte øynene."],
      tap: ["Hei! Jeg er Jørgen. Trykk START!", "Kaffe? Alltid.", "Har noen sett brillene mine?"],
      trip: ["Huff! Hvem la garnnøstet her?", "Oppsann! Magic, garnet ditt igjen!", "Jeg sto stødig… nesten."],
      drop_cookie: ["Kjeksen! Nei, Magic, den er min!", "Oi, glapp! Magic var raskere.", "Femsekundersregelen… Magic tok den på to."],
      drop_sock: ["Strømpa! Magic, gi den tilbake!", "Oi, glapp! Nå leker Magic med den."],
      drop_jar: ["Glasset! …Puh, det holdt.", "Oi, glapp! Heldigvis var lokket på."],
      drop_can: ["Kanna! Nå vannet jeg tøflene.", "Oi, glapp! Magic ble litt våt."],
      glasses: ["Hvor ER brillene mine? …Å. På panna.", "Har noen sett brillene? Ingen?", "Brillene! Der var de jo."],
      spill: ["Oi, kaffen! Ingen så det, ok?", "Ups… termosen ville visst ligge.", "Det er ikke søl, det er pynt."],
      groan: ["Uff… knærne mine sier hei.", "Opp fra stolen… et øyeblikk… nå!", "Æsj, jeg satt på fjernkontrollen!"],
      who: "Bestefar Jørgen"
    },
    pl: {
      start: ["Kawa gotowa – do dzieła!", "Jørgen gotowy! Gdzie moje okulary?", "Ja tylko trochę pomogę…"],
      startX: ["Wesołych Świąt! Jørgen gotowy.", "Mikołaj się spóźnia – Jørgen go zastąpi!", "Gdzie moja czapka? A, mam ją na głowie."],
      combo: ["Ojojoj!", "Ale numer!", "Tego nawet ja za młodu nie umiałem!", "Brawo! Klaszczę… ojej, kawa!"],
      level: ["«Jørgen, nie zjadaj wszystkich ciastek!» – «Tylko jedno…»", "Tego spróbuję później…", "Babciu, patrz! …Babciu?", "Ćśś… tylko nie mów babci."],
      win: ["Brawo! To zasługuje na kawę!", "Hurra! Zatańczę… nie, krzyż.", "Mistrzostwo! Jørgen jest dumny."],
      over: ["Dobra robota! Jeszcze runda?", "Nieźle! Ja bym już dawno zgubił okulary.", "Nawet Jørgenowi czasem nie wychodzi. Często, prawdę mówiąc."],
      stuck: ["Hmm… po co ja tu przyszedłem? A, żeby pomóc!", "Spokojnie – łyk kawy pomaga."],
      oops: ["Ojej! To chyba moja wina.", "Najlepszym się zdarza – a Jørgenowi codziennie!"],
      hurry: ["Szybko, zanim kawa wystygnie!", "Żwawiej! Już idę… zaraz… uff."],
      code: ["Dodatkowe życie? Też bym chciał!", "Tajny kod? Ja swój zapomniałem."],
      wake: ["Hę? Nie spałem, myślałem!", "Co? Tylko oczy odpoczywały."],
      tap: ["Cześć! Jestem Jørgen. Naciśnij START!", "Kawa? Zawsze.", "Ktoś widział moje okulary?"],
      trip: ["Ojej! Kto tu zostawił kłębek?", "Hop! Magic, znowu twoja włóczka!", "Stałem pewnie… prawie."],
      drop_cookie: ["Ciastko! Nie, Magic, to moje!", "Ups, wypadło! Magic był szybszy.", "Zasada pięciu sekund… Magic zdążył w dwie."],
      drop_sock: ["Skarpetka! Magic, oddawaj!", "Ups, wypadła! Teraz Magic się nią bawi."],
      drop_jar: ["Słoik! …Uff, cały.", "Ups, wypadł! Na szczęście był zakręcony."],
      drop_can: ["Konewka! Podlałem sobie kapcie.", "Ups, wypadła! Magic trochę zmókł."],
      glasses: ["Gdzie są moje okulary? …A. Na czole.", "Ktoś widział okulary? Nikt?", "Okulary! No przecież tu są."],
      spill: ["Ojej, kawa! Nikt nie widział, dobra?", "Ups… termos chciał się położyć.", "To nie plama, to ozdoba."],
      groan: ["Uff… kolana mówią dzień dobry.", "Wstaję z fotela… chwileczkę… już!", "Ojej, usiadłem na pilocie!"],
      who: "Dziadek Jørgen"
    },
    en: {
      start: ["Coffee's ready – off you go!", "Jørgen's ready! Where are my glasses?", "I'll just help a little…"],
      startX: ["Merry Christmas! Jørgen's ready.", "Santa's late – Jørgen will fill in!", "Where's my Santa hat? Oh, it's on my head."],
      combo: ["Oh my!", "Well, would you look at that!", "Couldn't do that in my younger days!", "Bravo! I'm clapping… oops, the coffee!"],
      level: ["“Jørgen, don't eat all the cookies!” – “Just one…”", "I'll taste-test that later…", "Look, dear, look! …Dear?", "Shh… don't tell Grandma."],
      win: ["Bravo! That deserves a cup of coffee!", "Hooray! I'd dance… but my back.", "Masterful! Jørgen is proud of you."],
      over: ["Well done! One more round?", "Not bad! I'd have lost my glasses by now.", "Even Jørgen slips up sometimes. Often, actually."],
      stuck: ["Hmm… what did I come here for? Oh yes, to help!", "Easy now – a sip of coffee helps."],
      oops: ["Oops! That was probably me.", "Happens to the best of us – and to Jørgen daily!"],
      hurry: ["Quick, before the coffee gets cold!", "Hurry! I'm coming… just… oof."],
      code: ["An extra life? I could use one too!", "A secret code? I forgot mine."],
      wake: ["Hm? I wasn't asleep, I was thinking!", "Eh? Just resting my eyes."],
      tap: ["Hello! I'm Jørgen. Press START!", "Coffee? Always.", "Has anyone seen my glasses?"],
      trip: ["Whoops! Who left the yarn here?", "Oopsy-daisy! Magic, your yarn again!", "I was perfectly steady… almost."],
      drop_cookie: ["My cookie! No, Magic, that's mine!", "Oops, dropped it! Magic was quicker.", "Five-second rule… Magic did it in two."],
      drop_sock: ["My sock! Magic, give it back!", "Oops, dropped it! Now Magic's playing with it."],
      drop_jar: ["The jar! …Phew, it's fine.", "Oops, dropped it! Good thing the lid was on."],
      drop_can: ["The watering can! I watered my slippers.", "Oops, dropped it! Magic got a bit wet."],
      glasses: ["Where ARE my glasses? …Oh. On my forehead.", "Anyone seen my glasses? No one?", "My glasses! There they are."],
      spill: ["Oops, the coffee! Nobody saw that, OK?", "Uh-oh… the thermos wanted a lie-down.", "It's not a spill, it's decoration."],
      groan: ["Oof… my knees say hello.", "Up from the chair… one moment… there!", "Oh dear, I sat on the remote!"],
      who: "Grandpa Jørgen"
    }
  };
  var POSE = {start: "wave", combo: "cheer", level: "cookie", win: "cheer", over: "sip", stuck: "sip", oops: "idle", hurry: "cheer", code: "cheer", wake: "idle", tap: "wave"};
  var ITEM = {kakeboksen: "cookie", sokkeskuffen: "sock", syltetoyhylla: "jar", "mormors-hage": "can"};
  var DUR = {trip: 2.2, drop: 2.6, glasses: 2.8, spill: 2.6, groan: 2.2}, CLUMSY = ["trip", "drop", "glasses", "spill", "groan"];
  var HX = {glassUp: false, lookDown: false, oMouth: false, squint: false, mark: ""};
  var st = {pose: "idle", poseT: 0, poseDur: 2, lastClumsy: -99, lastKind: "", dt: 0, msg: null, msgT: 0, lastSpeak: -99, lastAct: 0, dozing: false, hop: 0, head: [0, 0, 1], seq: 0};
  function now(){ return performance.now()/1000; }
  function lang(){ var l = document.documentElement.dataset.lang || "no"; return L[l] ? l : "no"; }
  function pick(a){ st.seq++; return a[(Math.floor(Math.random()*a.length) + st.seq) % a.length]; }
  function fill(m){ var no = O.game === "syltetoyhylla" ? "bestemor" : "mormor"; return m.replace(/\{g\}/g, no).replace(/\{G\}/g, no.charAt(0).toUpperCase() + no.slice(1)); }
  function line(k){ var T = L[lang()]; if (k === "start" && O.xmas) k = "startX"; if (k === "drop") k = "drop_" + (ITEM[O.game] || "cookie"); return T[k] ? fill(pick(T[k])) : ""; }
  function clumsy(kind){
    var t = now(); if (!kind){ var a = CLUMSY.filter(function(k){ return k !== st.lastKind; }); kind = a[Math.floor(Math.random()*a.length)]; }
    st.pose = kind; st.poseT = st.poseDur = DUR[kind] || 2.4; st.lastKind = kind; st.lastClumsy = t; st.dozing = false;
    st.msg = line(kind); st.msgT = 2.8; st.lastSpeak = t;
  }

  function react(kind, opt){
    opt = opt || {}; var t = now(), wasDozing = st.dozing;
    st.lastAct = t; st.dozing = false;
    var big = kind === "start" || kind === "win" || kind === "over" || kind === "code" || opt.force;
    var free = t - st.lastSpeak >= 5;
    // clumsy moments (only when he has not spoken for ~5 s, never more often)
    if (free && !wasDozing && !opt.force){
      var r = Math.random(), ck = null;
      if (kind === "combo" && r < .45) ck = r < .22 ? "trip" : "spill";
      else if (kind === "level" && r < .5) ck = r < .1 ? "groan" : "drop";
      else if (kind === "stuck") ck = "glasses";
      else if (kind === "oops") ck = "trip";
      else if (kind === "hurry" && r < .5) ck = "groan";
      if (ck){ clumsy(ck); return; }
    }
    if (opt.clumsy){ clumsy(opt.clumsy); return; }
    st.pose = POSE[kind] || "idle"; st.poseT = st.poseDur = kind === "level" ? 2.6 : 2.0; if (st.pose === "cheer") st.hop = 1;
    if (!big && !free) return;
    if (!big && (kind === "combo" || kind === "level") && Math.random() < .3) return;
    var k = wasDozing && !big && Math.random() < .6 ? "wake" : kind;
    st.msg = line(k); st.msgT = k === "start" ? 2.8 : 2.6; st.lastSpeak = t;
  }

  /* ---------- drawing helpers ---------- */
  function circ(c, x, y, r, f){ c.fillStyle = f; c.beginPath(); c.arc(x, y, r, 0, 6.2832); c.fill(); }
  function ell(c, x, y, rx, ry, f, rot){ c.fillStyle = f; c.beginPath(); c.ellipse(x, y, rx, ry, rot || 0, 0, 6.2832); c.fill(); }
  function rr(c, x, y, w, h, r, f){ c.fillStyle = f; c.beginPath(); if (c.roundRect) c.roundRect(x, y, w, h, r); else c.rect(x, y, w, h); c.fill(); }
  function ln(c, p, s, w){ c.strokeStyle = s; c.lineWidth = w; c.lineCap = "round"; c.lineJoin = "round"; c.beginPath(); c.moveTo(p[0], p[1]); for (var i = 2; i < p.length; i += 2) c.lineTo(p[i], p[i + 1]); c.stroke(); }
  var NAVY = "#22335E", NAVY2 = "#1A2749", WOOL = "#F4EFE4", RED = "#C8283A", SKIN = "#F2C3A0", GREY = "#DADBE2", GREY2 = "#B9BAC4";

  function thermos(c, x, y, k){ // bottom-centre at x,y
    c.save(); c.translate(x, y); c.scale(k || 1, k || 1);
    rr(c, -7, -34, 14, 34, 5, "#2F6B4B"); rr(c, -7, -34, 4, 34, 3, "#4C8C68"); rr(c, -4.5, -24, 9, 8, 2, "#E8E4D8"); rr(c, -7, -6, 14, 3, 1, "#24553B");
    rr(c, -8, -42, 16, 9, 3, "#B9BFC6"); rr(c, -8, -42, 16, 3, 2, "#D8DDE2");
    c.restore();
  }
  function cup(c, x, y, tm){
    rr(c, x - 6, y - 7, 12, 9, 3, RED); ell(c, x, y - 7, 6, 2, "#5A3420");
    c.globalAlpha = .55; for (var i = 0; i < 2; i++){ var o = Math.sin(tm*3 + i*2)*2; ln(c, [x - 2 + i*4, y - 10, x - 3 + i*4 + o, y - 16, x - 1 + i*4 - o, y - 22], "#FFFFFF", 1.4); } c.globalAlpha = 1;
  }
  function cookie(c, x, y, r){ circ(c, x, y, r, "#D9A35B"); circ(c, x - r*.3, y - r*.2, r*.18, "#5A3420"); circ(c, x + r*.35, y + r*.1, r*.16, "#5A3420"); circ(c, x - r*.05, y + r*.4, r*.15, "#5A3420"); }
  function hand(c, x, y){ circ(c, x, y, 6, SKIN); }
  function yarn(c, x, y, rot){ c.save(); c.translate(x, y); c.rotate(rot); c.scale(1.2, 1.2); circ(c, 0, 0, 8, "#B85CC4"); c.strokeStyle = "#8E3E9C"; c.lineWidth = 1.3; c.beginPath(); c.arc(0, 0, 5, .3, 2.6); c.stroke(); c.beginPath(); c.arc(0, 0, 8, 3.6, 5.2); c.stroke(); ln(c, [-6, -3, 6, 3], "#8E3E9C", 1.2); c.restore(); }
  function item(c, kind, x, y, rot){
    c.save(); c.translate(x, y); c.rotate(rot || 0);
    if (kind === "sock"){ ln(c, [0, -9, 0, 3, 7, 6], "#E9E2D6", 7); ln(c, [-3.5, -5, 3.5, -5], RED, 2); ln(c, [-3.5, -1, 3.5, -1], RED, 2); circ(c, 8, 6, 3.5, RED); }
    else if (kind === "jar"){ rr(c, -6, -8, 12, 15, 3, "rgba(230,240,250,.85)"); rr(c, -5, -3, 10, 9, 2, "#C8283A"); rr(c, -6.5, -11, 13, 4, 1.5, RED); ell(c, 0, -11, 6.5, 1.5, "#F4EFE4"); }
    else if (kind === "can"){ rr(c, -7, -6, 14, 12, 3, "#3E9A6A"); ln(c, [7, -2, 14, -9], "#3E9A6A", 3); ln(c, [-7, -4, -11, 0, -7, 4], "#2E7A52", 2); circ(c, 14, -9, 2.4, "#2E7A52"); }
    else cookie(c, 0, 0, 7.5);
    c.restore();
  }
  function paw(c, x, y){ ln(c, [x - 44, y + 1, x - 6, y], "#9A6A3E", 11); for (var i = 0; i < 3; i++) ln(c, [x - 34 + i*9, y - 4.5, x - 32 + i*9, y + 4.5], "#5E3C1E", 2.2); ell(c, x, y, 7, 5.5, "#D7B48A"); circ(c, x + 5, y - 4, 2, "#D7B48A"); circ(c, x + 7, y, 2, "#D7B48A"); circ(c, x + 5, y + 4, 2, "#D7B48A"); }
  function arm(c, sx, sy, ex, ey, bx, by){ // sleeve with bend, white cuff
    var mx = bx === undefined ? (sx + ex)/2 : bx, my = by === undefined ? (sy + ey)/2 : by;
    ln(c, [sx, sy, mx, my, ex, ey], NAVY, 15);
    var dx = ex - mx, dy = ey - my, d = Math.hypot(dx, dy) || 1, cx = ex - dx/d*7, cy = ey - dy/d*7;
    ln(c, [cx - dx/d*3, cy - dy/d*3, cx + dx/d*1.5, cy + dy/d*1.5], WOOL, 15);
    circ(c, cx - dx/d*.8, cy - dy/d*.8, 1.4, RED);
  }

  /* the lusekofte: navy body, white yoke with red/navy pattern, white "lice" dots, patterned hem */
  function sweater(c){
    c.save();
    c.beginPath(); if (c.roundRect) c.roundRect(-36, -30, 72, 76, 24); else c.rect(-36, -30, 72, 76); c.fillStyle = NAVY; c.fill(); c.clip();
    for (var yy = 6, row = 0; yy < 36; yy += 8, row++) for (var xx = -32 + (row % 2)*5; xx < 34; xx += 10){ ln(c, [xx - 1.6, yy - 1.2, xx, yy + .8, xx + 1.6, yy - 1.2], WOOL, 1.3); }
    ell(c, 0, -30, 44, 25, WOOL);                         // yoke
    for (var i = -4; i <= 4; i++){ var x = i*8.5, y = -15 + Math.abs(i)*.9; c.fillStyle = RED; c.beginPath(); c.moveTo(x, y - 4.5); c.lineTo(x + 3.6, y); c.lineTo(x, y + 4.5); c.lineTo(x - 3.6, y); c.closePath(); c.fill(); circ(c, x, y, 1.1, WOOL); }
    for (i = -5; i <= 5; i++){ var x2 = i*7.5, y2 = -24 + Math.abs(i)*.5; ln(c, [x2 - 2, y2, x2 + 2, y2], NAVY, 1.4); ln(c, [x2, y2 - 2, x2, y2 + 2], NAVY, 1.4); }
    c.fillStyle = NAVY; for (i = -6; i <= 6; i++){ var x3 = i*7, y3 = -6.5 + Math.abs(i)*.75; c.beginPath(); c.moveTo(x3 - 3.5, y3 + 1.5); c.lineTo(x3, y3 - 3); c.lineTo(x3 + 3.5, y3 + 1.5); c.closePath(); c.fill(); }
    rr(c, -40, 36, 80, 10, 0, WOOL); for (i = -4; i <= 4; i++) circ(c, i*8.5, 41, 1.8, RED);   // hem band
    rr(c, -40, 34, 80, 1.6, 0, RED);
    c.restore();
    rr(c, -9, -33, 18, 7, 3, WOOL); ln(c, [-7, -30, 7, -30], RED, 1.2);                       // collar
    // pewter clasps (the classic lusekofte buttons)
    circ(c, -3.5, -24, 1.8, "#9AA3AE"); circ(c, 3.5, -24, 1.8, "#9AA3AE");
  }

  /* ushanka: brown crown, cream fur brim turned up, fur ear flaps down over the ears, little red tie pompoms */
  var FUR = "#EADBC2", FUR2 = "#CDB592", HATB = "#6E4A33", HATB2 = "#86593C";
  function furTex(c, x0, x1, y0, y1, n){ for (var i = 0; i < n; i++){ var fx = x0 + (x1 - x0)*((i*37) % 97)/97, fy = y0 + (y1 - y0)*((i*53) % 89)/89; ln(c, [fx - 1.6, fy + 1.2, fx, fy - 1, fx + 1.6, fy + 1.2], FUR2, 1.1); } }
  function ushanka(c){
    // ear flaps (fur), hanging over the ears
    for (var sd = -1; sd <= 1; sd += 2){
      c.fillStyle = FUR; c.beginPath(); c.moveTo(sd*16, -66); c.quadraticCurveTo(sd*30, -64, sd*29, -46); c.quadraticCurveTo(sd*28, -34, sd*21, -33); c.quadraticCurveTo(sd*15, -34, sd*15, -44); c.closePath(); c.fill();
      c.save(); c.clip(); furTex(c, sd > 0 ? 15 : -30, sd > 0 ? 30 : -15, -64, -35, 14); c.restore();
      ln(c, [sd*22, -34, sd*23, -26], "#7a2a2a", 1.3); circ(c, sd*23, -24, 3, RED); circ(c, sd*22.2, -25, 1, "rgba(255,255,255,.5)");
    }
    // crown
    c.fillStyle = HATB; c.beginPath(); c.moveTo(-24, -66); c.quadraticCurveTo(-25, -92, 0, -93); c.quadraticCurveTo(25, -92, 24, -66); c.closePath(); c.fill();
    ln(c, [0, -92, 0, -72], HATB2, 2); ell(c, -10, -85, 6, 3, "rgba(255,255,255,.14)", -.5);
    // front fur brim (turned up)
    c.fillStyle = FUR; c.beginPath(); if (c.roundRect) c.roundRect(-28, -79, 56, 16, 8); else c.rect(-28, -79, 56, 16); c.fill();
    c.save(); c.beginPath(); if (c.roundRect) c.roundRect(-28, -79, 56, 16, 8); else c.rect(-28, -79, 56, 16); c.clip(); furTex(c, -27, 27, -77, -65, 22); c.restore();
    ell(c, 0, -63.5, 26, 2.2, "rgba(120,90,60,.25)");
  }

  function headDraw(c, tm, pose){
    var blink = (tm % 3.7) < .13, doze = pose === "doze", eyesY = -54;
    ell(c, -21, -51, 4.5, 6, SKIN); ell(c, 21, -51, 4.5, 6, SKIN);
    circ(c, 0, -52, 22, SKIN);
    ell(c, -18, -46, 6, 9, GREY); ell(c, 18, -46, 6, 9, GREY);                           // side hair
    // cap
    var hk = hatKind();
    if (hk === "ushanka") ushanka(c);
    else if (hk === "santa"){
      c.fillStyle = RED; c.beginPath(); c.moveTo(-24, -62); c.quadraticCurveTo(-18, -96, 10, -98); c.quadraticCurveTo(34, -96, 40, -74); c.lineTo(32, -70); c.quadraticCurveTo(24, -86, 14, -82); c.lineTo(24, -62); c.closePath(); c.fill();
      rr(c, -26, -68, 52, 11, 5.5, "#FFFFFF"); circ(c, 38, -70, 6.5, "#FFFFFF");
    } else {
      c.fillStyle = RED; c.beginPath(); c.arc(0, -64, 23.5, Math.PI, 0); c.closePath(); c.fill();          // red wool cap (same as the reels)
      ell(c, -8, -78, 6, 3, "rgba(255,255,255,.12)", -.4);
      rr(c, -25, -69, 50, 10, 5, WOOL); for (var i = -4; i <= 4; i++){ c.fillStyle = RED; c.beginPath(); c.moveTo(i*5.5, -67.5); c.lineTo(i*5.5 + 2.4, -64); c.lineTo(i*5.5, -60.5); c.lineTo(i*5.5 - 2.4, -64); c.fill(); }
      circ(c, 0, -89, 6.5, WOOL); circ(c, -2, -91, 2.5, "#FFFFFF");
    }
    // brows
    ell(c, -9, -61, 6.5, 2.6, GREY, -.12); ell(c, 9, -61, 6.5, 2.6, GREY, .12);
    // eyes + glasses
    if (HX.squint && !doze){ ln(c, [-12, eyesY - 1, -6, eyesY + 1], "#3a2a2a", 1.7); ln(c, [6, eyesY + 1, 12, eyesY - 1], "#3a2a2a", 1.7); }
    else if (pose === "pet"){ ln(c, [-12, eyesY + 1, -9, eyesY - 1.8, -6, eyesY + 1], "#3a2a2a", 1.7); ln(c, [6, eyesY + 1, 9, eyesY - 1.8, 12, eyesY + 1], "#3a2a2a", 1.7); }
    else if (doze || blink){ ln(c, [-12, eyesY, -9, eyesY + 1.6, -6, eyesY], "#3a2a2a", 1.6); ln(c, [6, eyesY, 9, eyesY + 1.6, 12, eyesY], "#3a2a2a", 1.6); }
    else { var lk = pose === "cookie" ? 1.6 : 0, ld = HX.lookDown ? 1.8 : 0; circ(c, -9 + lk, eyesY + ld, 2.1, "#2a1c1c"); circ(c, 9 + lk, eyesY + ld, 2.1, "#2a1c1c"); circ(c, -8.3 + lk, eyesY - .8 + ld, .7, "#fff"); circ(c, 9.7 + lk, eyesY - .8 + ld, .7, "#fff"); }
    var gy = HX.glassUp ? eyesY - 12 : eyesY;
    c.strokeStyle = "#5A4434"; c.lineWidth = 1.8; c.beginPath(); if (c.roundRect){ c.roundRect(-16, gy - 5, 13, 10, 4); c.roundRect(3, gy - 5, 13, 10, 4); } c.stroke(); ln(c, [-3, gy - 1, 3, gy - 1], "#5A4434", 1.6);
    circ(c, -15, -44, 4, "rgba(255,110,120,.4)"); circ(c, 15, -44, 4, "rgba(255,110,120,.4)");
    ell(c, 0, -46, 5, 4.5, "#E8A086");                                                         // nose
    // mouth (under the moustache)
    if (pose === "cheer" || pose === "wave" || HX.oMouth) ell(c, 0, -35, 4.5, HX.oMouth ? 4.8 : 4, "#7a2a2a");
    else if (pose === "pet"){ c.strokeStyle = "#7a2a2a"; c.lineWidth = 1.8; c.beginPath(); c.arc(0, -38, 5.5, .15*Math.PI, .85*Math.PI); c.stroke(); }
    else if (pose === "cookie"){ var ch = Math.sin(tm*14)*1.2; ell(c, 0, -35.5, 3.5, 2 + Math.abs(ch), "#7a2a2a"); circ(c, 13, -40, 4.5, SKIN); }
    else { c.strokeStyle = "#7a2a2a"; c.lineWidth = 1.5; c.beginPath(); c.arc(0, -37, 4, .25*Math.PI, .75*Math.PI); c.stroke(); }
    // walrus moustache
    var mw = pose === "cookie" ? Math.sin(tm*14)*.08 : 0;
    ell(c, -7, -40.5, 9.5, 4.6, GREY, -.22 + mw); ell(c, 7, -40.5, 9.5, 4.6, GREY, .22 - mw); ell(c, -13, -38.5, 4, 3, GREY, -.6); ell(c, 13, -38.5, 4, 3, GREY, .6);
    ln(c, [-3, -42, 0, -40.5, 3, -42], GREY2, 1);
    // unlit pipe (no smoke)
    if (pose !== "cookie" && pose !== "sip" && pose !== "pet" && pose !== "cheer" && pose !== "wave" && !HX.oMouth && !(pose === "drop" && HX.p < .25)){
      var dr = doze ? 4 : 0;
      ln(c, [5, -37, 13, -35 + dr*.5, 18, -36 + dr], "#3A2418", 2.4);
      rr(c, 15, -45 + dr, 8, 10, 3, "#6B3E22"); ell(c, 19, -45 + dr, 4, 1.6, "#2A1810");
    }
    if (doze){ c.fillStyle = "#EAF2FF"; c.font = "800 11px system-ui, sans-serif"; c.textAlign = "center"; c.textBaseline = "middle"; var z = (tm*.8) % 1; c.globalAlpha = 1 - z; c.fillText("z", 24 + z*10, -70 - z*16); c.globalAlpha = Math.max(0, 1 - ((z + .5) % 1)); c.font = "800 14px system-ui, sans-serif"; c.fillText("Z", 24 + ((z + .5) % 1)*12, -70 - ((z + .5) % 1)*18); c.globalAlpha = 1; }
  }

  function figure(c, tm, pose, hop, p){
    var P = p === undefined ? (tm*.4) % 1 : p, it = ITEM[O.game] || "cookie", rot = 0, piv = 72, pre = null, post = null, mark = "";
    HX.p = P; HX.glassUp = false; HX.lookDown = false; HX.oMouth = false; HX.squint = false;
    if (pose === "trip"){
      var k = P < .25 ? 0 : P < .8 ? (P - .25)/.55 : 1, yx = P < .25 ? -70 + P/.25*58 : -12 + (P - .25)*160;
      rot = k > 0 && k < 1 ? Math.sin(k*Math.PI*3)*.2*(1 - k*.5) : 0; HX.oMouth = k > 0 && k < 1;
      post = function(){ if (P > .25) ln(c, [-14, 70, (yx - 14)/2, 72, yx - 6, 68], "#B85CC4", 1.4); yarn(c, yx, 66, yx/8); };
    } else if (pose === "drop"){
      HX.lookDown = P > .22; HX.oMouth = P > .22 && P < .65;
      var f = Math.max(0, Math.min(1, (P - .22)/.22)), ix = -17 - f*14, iy = Math.min(66, -37 + 103*f*f), bo = P > .44 && P < .56 ? -Math.sin((P - .44)/.12*Math.PI)*6 : 0;
      var grab = it === "cookie" || it === "sock", px = P < .6 ? -160 : P < .75 ? -160 + (P - .6)/.15*(ix + 160) : ix - (P - .75)/.25*130;
      if (grab && P > .75) ix = px;
      post = function(){
        if (P >= .22) item(c, it, ix, iy + bo, f*2.4 + (it === "jar" && P > .56 ? Math.sin(tm*18)*.2*(1 - P) : 0));
        if (grab && P > .6) paw(c, px + 5, 66);
        if (it === "can" && P > .44 && P < .85){ var q = (P - .44)/.41; for (var i = 0; i < 5; i++) circ(c, ix + (i - 2)*9*q, 64 - Math.sin(q*Math.PI)*16 + Math.abs(i - 2)*2, 1.9, "rgba(120,190,255,.85)"); }
      };
    } else if (pose === "glasses"){
      HX.glassUp = P < .8; HX.squint = P < .8; mark = P < .8 ? "?" : "!";
    } else if (pose === "spill"){
      HX.oMouth = P > .12;
      var a = Math.min(1, P/.18)*1.5708, pw = Math.max(0, Math.min(1, (P - .15)/.4))*24;
      pre = function(){ if (pw > 0) ell(c, 98, 73, pw, pw*.25, "rgba(107,66,38,.85)"); };
      post = function(){ c.save(); c.translate(52, 72); c.rotate(a); thermos(c, 0, 0, 1); c.restore(); if (pw > 4) ell(c, 98, 73, pw*.5, pw*.1, "rgba(160,110,70,.6)"); };
    } else if (pose === "groan"){
      rot = -.06 - Math.sin(P*Math.PI)*.08; piv = 40; HX.squint = true;
    }
    c.save(); c.translate(0, -hop);
    if (pre) pre();
    if (rot){ c.translate(0, piv); c.rotate(rot); c.translate(0, -piv); }
    // legs + slippers
    rr(c, -24, 38, 48, 30, 8, "#5A4232"); ln(c, [0, 46, 0, 66], "#45322545", 1.6);
    ell(c, -13, 70, 12.5, 6, "#9E2A2E"); ell(c, 13, 70, 12.5, 6, "#9E2A2E"); ln(c, [-23, 73, -3, 73], "#F1E6D2", 1.6); ln(c, [3, 73, 23, 73], "#F1E6D2", 1.6);
    sweater(c);
    var sw = Math.sin(tm*(pose === "cheer" ? 14 : 3)), fg = null;
    if (pose === "trip"){
      var fl = Math.sin(tm*22)*5; arm(c, -30, -18, -50, -50 + fl, -50, -26); hand(c, -50, -52 + fl); arm(c, 30, -18, 52, -54 - fl, 52, -28); hand(c, 52, -56 - fl);
    } else if (pose === "drop"){
      arm(c, 30, -18, 38, 22, 42, 2); thermos(c, 38, 52, .95); hand(c, 38, 22);
      if (P < .22){ arm(c, -30, -18, -20, -30, -40, 2); fg = function(){ item(c, it, -17, -37, 0); hand(c, -22, -31); }; }
      else { arm(c, -30, -18, -36, 14, -46, -4); hand(c, -36, 16); }
    } else if (pose === "glasses"){
      var pat = Math.sin(tm*10)*4; arm(c, -30, -18, -10 + pat, 12, -36, 8); hand(c, -10 + pat, 12);
      if (P < .8){ var sc = Math.sin(tm*4)*3; arm(c, 30, -18, 20 + sc, -58, 44, -32); fg = function(){ hand(c, 20 + sc, -59); }; }
      else { arm(c, 30, -18, 10, -66, 40, -38); fg = function(){ hand(c, 10, -67); }; }
    } else if (pose === "spill"){
      if (P < .3){ arm(c, -30, -18, -6, 16, -36, 6); hand(c, -6, 16); arm(c, 30, -18, 50, 30, 46, 4); hand(c, 50, 32); }
      else { arm(c, -30, -18, -15, -40, -42, -12); arm(c, 30, -18, 15, -40, 42, -12); fg = function(){ hand(c, -16, -41); hand(c, 16, -41); }; }
    } else if (pose === "groan"){
      arm(c, -30, -18, -32, 22, -44, 4); hand(c, -32, 24); arm(c, 30, -18, 22, 36, 40, 10); hand(c, 22, 38); thermos(c, 48, 72 - (rot ? 0 : 0), 1);
    } else if (pose === "cheer"){
      arm(c, -30, -18, -42 + sw*2, -70, -44, -42); hand(c, -42 + sw*2, -72);
      arm(c, 30, -18, 42 - sw*2, -70, 44, -42); thermos(c, 42 - sw*2, -64, .8); hand(c, 42 - sw*2, -70);
    } else if (pose === "wave"){
      arm(c, -30, -18, -36, 22, -40, 0); hand(c, -36, 24);
      var wv = Math.sin(tm*9)*8; arm(c, 30, -18, 44 + wv*.4, -66, 46, -40); hand(c, 44 + wv*.4, -68);
      ln(c, [40 + wv*.4, -74, 38 + wv*.4, -80], SKIN, 3); ln(c, [44 + wv*.4, -76, 44 + wv*.4, -82], SKIN, 3); ln(c, [48 + wv*.4, -74, 50 + wv*.4, -80], SKIN, 3);
    } else if (pose === "cookie"){
      thermos(c, 40, 44, .9); arm(c, 30, -18, 36, 30, 42, 6); hand(c, 36, 30);
      var bob = Math.sin(tm*7)*2; arm(c, -30, -18, -20, -30 + bob, -40, 2); fg = function(){ item(c, it === "cookie" ? "cookie" : "cookie", -17, -37 + bob, 0); hand(c, -22, -31 + bob); };
    } else if (pose === "sip"){
      arm(c, -30, -18, -36, 22, -40, 0); hand(c, -36, 24); thermos(c, -42, 70, 1);
      var lift = Math.max(0, Math.sin(tm*1.4))*4; arm(c, 30, -18, 20, -28 - lift, 40, 4); fg = function(){ cup(c, 15, -31 - lift, tm); hand(c, 21, -28 - lift); };
    } else if (pose === "pet"){ // gentle stroke (reels: Magic sits at his right on a pouf, hand strokes his head at ~x 60..84, y -10..-6)
      arm(c, -30, -18, -6, 16, -36, 6); hand(c, -6, 16);
      var strk = Math.sin(tm*3.2), hx = 72 + strk*12, hy = -6 - Math.abs(Math.cos(tm*3.2))*4;
      arm(c, 30, -18, hx, hy, 50, 8); hand(c, hx, hy); ln(c, [hx - 4, hy + 3, hx + 6, hy + 4], "#E3AE8A", 1.2);
    } else if (pose === "doze"){
      arm(c, -30, -18, -6, 14, -34, 8); arm(c, 30, -18, 6, 18, 34, 8); hand(c, -6, 14); hand(c, 6, 18); thermos(c, 46, 72, 1);
    } else { // idle: thermos in one hand, other hand on the belly
      arm(c, -30, -18, -6, 16, -36, 6); hand(c, -6, 16);
      arm(c, 30, -18, 38, 22, 42, 2); thermos(c, 38, 52, .95); hand(c, 38, 22);
    }
    c.save(); if (pose === "doze"){ c.translate(0, -30); c.rotate(-.14 + Math.sin(tm*1.2)*.03); c.translate(0, 30); }
    headDraw(c, tm, pose);
    c.restore();
    if (fg) fg();
    if (mark){ c.fillStyle = "#FFE9A8"; c.strokeStyle = "rgba(60,25,40,.7)"; c.lineWidth = 3; c.font = "900 18px system-ui, sans-serif"; c.textAlign = "center"; c.textBaseline = "middle"; var my = -104 + Math.sin(tm*6)*3; c.strokeText(mark, 30, my); c.fillText(mark, 30, my); if (mark === "?"){ c.strokeText("?", 42, my + 8); c.fillText("?", 42, my + 8); } }
    c.restore();
    if (post){ c.save(); c.translate(0, -hop); post(); c.restore(); }
  }

  function curPose(){
    var t = now(), md = O.mode ? O.mode() : "play";
    if (st.poseT > 0) return st.pose;
    if (md === "play" && t - st.lastAct > 14){ st.dozing = true; return "doze"; }
    if (md === "menu") return (t % 9) < 3 ? "sip" : "idle";
    return (t % 11) < 2.5 ? "sip" : "idle";
  }
  var lastT = 0;
  function tick(){ var t = now(), dt = Math.min(.1, t - (lastT || t)); lastT = t; st.dt = dt; if (st.poseT > 0) st.poseT -= dt; if (st.msgT > 0) st.msgT -= dt; st.hop = Math.max(0, st.hop - dt*2.2); }

  function draw(c, x, y, s){
    tick(); var tm = now(), md = O.mode ? O.mode() : "play";
    // an occasional clumsy moment while playing (never within ~7 s of his last line, at most every ~12 s)
    if (md === "play" && st.poseT <= 0 && !st.dozing && tm - st.lastSpeak > 7 && tm - st.lastClumsy > 12 && Math.random() < st.dt*.12) clumsy();
    var pose = curPose(), hop = Math.sin(Math.min(1, st.hop)*Math.PI)*8, pp = Math.max(0, Math.min(1, 1 - st.poseT/(st.poseDur || 2)));
    c.save(); c.translate(x, y); c.scale(s, s);
    ell(c, 0, 74, 34, 6, "rgba(0,0,0,.18)");
    figure(c, tm, pose, hop, pp);
    c.restore();
    var hk2 = hatKind(); st.head = [x, y - (hk2 === "santa" ? 100 : hk2 === "ushanka" ? 95 : 96)*s - hop*s, s];
    if (pose === "trip" || pose === "groan") st.head[1] -= 6*s;
  }

  function bubble(c){
    if (!st.msg || st.msgT <= 0) return;
    var md = O.mode ? O.mode() : "play"; if (md !== "play") return;
    var W = c.canvas.width/(c.getTransform ? c.getTransform().a : 1) || innerWidth, hx = st.head[0], hy = st.head[1];
    var fs = Math.round(Math.max(12, Math.min(15, W*.034)));
    c.save(); c.font = "700 " + fs + "px system-ui, sans-serif"; c.textAlign = "left"; c.textBaseline = "middle";
    var maxW = Math.min(220, W*.5), words = st.msg.split(" "), lines = [], cur = "";
    for (var i = 0; i < words.length; i++){ var tst = cur ? cur + " " + words[i] : words[i]; if (c.measureText(tst).width > maxW && cur){ lines.push(cur); cur = words[i]; } else cur = tst; }
    if (cur) lines.push(cur);
    var tw = 0; for (i = 0; i < lines.length; i++) tw = Math.max(tw, c.measureText(lines[i]).width);
    var lh = fs*1.25, bw = tw + 20, bh = lines.length*lh + 12, bx = Math.max(6, Math.min(W - bw - 6, hx - bw*.3)), by = Math.max(54, hy - bh - 12);
    var a = Math.min(1, st.msgT*2.5, (2.9 - st.msgT)*6 + .2); c.globalAlpha = Math.max(0, Math.min(1, a));
    c.fillStyle = "rgba(60,25,40,.25)"; c.beginPath(); c.roundRect ? c.roundRect(bx + 2, by + 3, bw, bh, 12) : c.rect(bx + 2, by + 3, bw, bh); c.fill();
    c.fillStyle = "#FFF8EC"; c.beginPath(); c.roundRect ? c.roundRect(bx, by, bw, bh, 12) : c.rect(bx, by, bw, bh); c.fill();
    var tx = Math.max(bx + 12, Math.min(bx + bw - 12, hx)); if (by + bh < hy){ c.beginPath(); c.moveTo(tx - 7, by + bh - 1); c.lineTo(tx + 7, by + bh - 1); c.lineTo(tx + 2, Math.min(hy - 2, by + bh + 10)); c.closePath(); c.fill(); }
    c.fillStyle = "#3A2030"; for (i = 0; i < lines.length; i++) c.fillText(lines[i], bx + 10, by + 6 + lh*(i + .5));
    c.restore();
  }

  function overLine(el, kind, seed){
    if (!el) return; var T = L[lang()], a = T[kind || "over"] || T.over;
    var m = seed === undefined ? pick(a) : a[Math.abs(Math.round(seed)) % a.length]; el.textContent = "👴 " + T.who + ": «" + m + "»"; el.hidden = false;
  }

  /* small grandpa avatar in the menu card corner (phones; on wide screens he is in the scene) */
  var mini = null;
  function mountMenu(sec){
    if (!sec || mini) return;
    var st0 = document.createElement("style");
    st0.textContent = ".s60bf{position:absolute!important;top:6px;right:8px;width:72px!important;height:86px!important;min-width:0!important;min-height:0!important;margin:0!important;z-index:2;border:0!important;background:none!important;box-shadow:none!important;padding:0!important;cursor:pointer;-webkit-tap-highlight-color:transparent;transform:none!important}.s60bf canvas{width:72px;height:86px;display:block}.s60bf-b{position:absolute;top:90px;right:6px;max-width:190px;background:#FFF8EC;color:#3A2030;font:700 .8rem/1.25 system-ui,sans-serif;border-radius:10px;padding:6px 9px;z-index:3;text-align:left;box-shadow:0 3px 8px rgba(0,0,0,.25);pointer-events:none}.s60bf-b[hidden]{display:none}@media (min-width:760px){.s60bf,.s60bf-b{display:none!important}}";
    document.head.appendChild(st0);
    if (getComputedStyle(sec).position === "static") sec.style.position = "relative";
    var b = document.createElement("button"); b.type = "button"; b.className = "s60bf"; b.setAttribute("aria-label", L[lang()].who);
    var cv = document.createElement("canvas"), D = Math.min(2, window.devicePixelRatio || 1); cv.width = 72*D; cv.height = 86*D; b.appendChild(cv);
    var tip = document.createElement("div"); tip.className = "s60bf-b"; tip.hidden = true;
    sec.appendChild(b); sec.appendChild(tip); mini = {cv: cv, D: D, tip: tip, wave: 2.5, tipT: 0};
    b.onclick = function(){ mini.wave = 2.5; tip.textContent = line("tap"); tip.hidden = false; clearTimeout(mini.tipT); mini.tipT = setTimeout(function(){ tip.hidden = true; }, 3200); };
    (function loop(){
      requestAnimationFrame(loop);
      if (sec.hidden || !b.offsetParent) return;
      var c = cv.getContext("2d"), tm = now();
      c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height);
      c.setTransform(mini.D*.66, 0, 0, mini.D*.66, 36*mini.D, 72*mini.D);
      mini.wave -= 1/60; var pose = mini.wave > 0 ? "wave" : ((tm % 8) < 2.5 ? "sip" : "idle");
      figure(c, tm, pose, 0);
    })();
  }

  window.S60Bestefar = {
    init: function(o){ for (var k in o) O[k] = o[k]; st.lastAct = now(); return this; },
    draw: draw, bubble: bubble, react: react, clumsy: clumsy, overLine: overLine, mountMenu: mountMenu,
    get pose(){ return curPose(); }, get msg(){ return st.msgT > 0 ? st.msg : null; },
    _lines: L, _figure: figure, _setXmas: function(v){ O.xmas = !!v; }, _setHat: function(h){ O.hat = h || ""; }, hat: hatKind, _setGame: function(g){ O.game = g; }
  };
})();
