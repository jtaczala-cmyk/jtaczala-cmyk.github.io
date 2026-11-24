/* Stop60 · Bestefar / Dziadek / Grandpa – shared cozy-series character (canvas, no images).
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
  var O = {xmas: false, game: "", mode: function(){ return "play"; }};
  var L = {
    no: {
      start: ["Kaffen er klar – kjør på!", "Bestefar heier på deg!", "Jeg passer på Magic, jeg."],
      startX: ["God jul! Kaffen er klar.", "Bestefar heier på deg!", "Nissen er sen i år – vi starter uten ham!"],
      combo: ["Oi oi oi!", "Fy flate, så flott!", "Det klarte ikke jeg i min ungdom!", "Nå snakker vi!"],
      level: ["Psst… ikke si det til mormor.", "Den smaker jeg på senere…", "Mormor, se her!", "Én til meg, én til deg…"],
      win: ["Bravo! Det fortjener en kopp kaffe!", "Hurra! Nå tar vi en kake!", "Mesterlig! Jeg er stolt av deg."],
      over: ["Godt jobba! En runde til?", "Ikke verst i det hele tatt!", "Selv bestefar bommer av og til."],
      stuck: ["Ta det med ro – en slurk kaffe hjelper.", "Hmm… jeg tenker. Eller sover jeg?"],
      oops: ["Oj! Rolig nå.", "Det skjer de beste!"],
      hurry: ["Raskt nå, før kaffen blir kald!", "Litt fart på, vennen!"],
      code: ["Ekstra liv? Det kaller jeg flaks!", "Hemmelig kode? Jeg sier ingenting."],
      wake: ["Hm? Jeg sov ikke, jeg tenkte!", "Hæ? Jeg bare hvilte øynene."],
      tap: ["Hei hei! Trykk START, så kommer jeg.", "Kaffe? Alltid.", "Magic stjal tøflene mine igjen."],
      who: "Bestefar"
    },
    pl: {
      start: ["Kawa gotowa – do dzieła!", "Dziadek trzyma kciuki!", "Ja tu pilnuję Magica."],
      startX: ["Wesołych Świąt! Kawa gotowa.", "Dziadek trzyma kciuki!", "Mikołaj się spóźnia – zaczynamy bez niego!"],
      combo: ["Ojojoj!", "Ale numer!", "Tego nawet ja za młodu nie umiałem!", "No to rozumiem!"],
      level: ["Ćśś… tylko nie mów babci.", "Tego spróbuję później…", "Babciu, patrz!", "Jedno dla mnie, jedno dla ciebie…"],
      win: ["Brawo! To zasługuje na kawę!", "Hurra! Teraz po ciastku!", "Mistrzostwo! Jestem dumny."],
      over: ["Dobra robota! Jeszcze runda?", "Wcale nieźle!", "Nawet dziadkowi czasem nie wychodzi."],
      stuck: ["Spokojnie – łyk kawy pomaga.", "Hmm… myślę. A może śpię?"],
      oops: ["Ups! Spokojnie.", "Najlepszym się zdarza!"],
      hurry: ["Szybko, zanim kawa wystygnie!", "Troszkę żwawiej, kochanie!"],
      code: ["Dodatkowe życie? To się nazywa szczęście!", "Tajny kod? Ja nic nie wiem."],
      wake: ["Hę? Nie spałem, myślałem!", "Co? Tylko oczy odpoczywały."],
      tap: ["Cześć! Naciśnij START, to przyjdę.", "Kawa? Zawsze.", "Magic znowu schował moje kapcie."],
      who: "Dziadek"
    },
    en: {
      start: ["Coffee's ready – off you go!", "Grandpa's cheering for you!", "I'll keep an eye on Magic."],
      startX: ["Merry Christmas! Coffee's ready.", "Grandpa's cheering for you!", "Santa's late – we'll start without him!"],
      combo: ["Oh my!", "Well, would you look at that!", "Couldn't do that in my younger days!", "Now we're talking!"],
      level: ["Shh… don't tell Grandma.", "I'll taste-test that later…", "Look, dear, look!", "One for me, one for you…"],
      win: ["Bravo! That deserves a cup of coffee!", "Hooray! Cake time!", "Masterful! I'm proud of you."],
      over: ["Well done! One more round?", "Not bad at all!", "Even Grandpa slips up sometimes."],
      stuck: ["Easy now – a sip of coffee helps.", "Hmm… I'm thinking. Or am I napping?"],
      oops: ["Oops! Easy now.", "Happens to the best of us!"],
      hurry: ["Quick, before the coffee gets cold!", "A bit faster, dear!"],
      code: ["An extra life? Now that's luck!", "A secret code? My lips are sealed."],
      wake: ["Hm? I wasn't asleep, I was thinking!", "Eh? Just resting my eyes."],
      tap: ["Hello! Press START and I'll join you.", "Coffee? Always.", "Magic hid my slippers again."],
      who: "Grandpa"
    }
  };
  var POSE = {start: "wave", combo: "cheer", level: "cookie", win: "cheer", over: "sip", stuck: "sip", oops: "idle", hurry: "cheer", code: "cheer", wake: "idle", tap: "wave"};
  var st = {pose: "idle", poseT: 0, msg: null, msgT: 0, lastSpeak: -99, lastAct: 0, dozing: false, hop: 0, head: [0, 0, 1], seq: 0};
  function now(){ return performance.now()/1000; }
  function lang(){ var l = document.documentElement.dataset.lang || "no"; return L[l] ? l : "no"; }
  function pick(a){ st.seq++; return a[(Math.floor(Math.random()*a.length) + st.seq) % a.length]; }
  function line(k){ var T = L[lang()]; if (k === "start" && O.xmas) k = "startX"; return T[k] ? pick(T[k]) : ""; }

  function react(kind, opt){
    opt = opt || {}; var t = now(), wasDozing = st.dozing;
    st.lastAct = t; st.dozing = false;
    st.pose = POSE[kind] || "idle"; st.poseT = kind === "level" ? 2.6 : 2.0; if (st.pose === "cheer") st.hop = 1;
    var big = kind === "start" || kind === "win" || kind === "over" || kind === "code" || opt.force;
    if (!big && t - st.lastSpeak < 5) return;
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

  function headDraw(c, tm, pose){
    var blink = (tm % 3.7) < .13, doze = pose === "doze", eyesY = -54;
    ell(c, -21, -51, 4.5, 6, SKIN); ell(c, 21, -51, 4.5, 6, SKIN);
    circ(c, 0, -52, 22, SKIN);
    ell(c, -18, -46, 6, 9, GREY); ell(c, 18, -46, 6, 9, GREY);                           // side hair
    // cap
    if (O.xmas){
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
    if (doze || blink){ ln(c, [-12, eyesY, -9, eyesY + 1.6, -6, eyesY], "#3a2a2a", 1.6); ln(c, [6, eyesY, 9, eyesY + 1.6, 12, eyesY], "#3a2a2a", 1.6); }
    else { var lk = pose === "cookie" ? 1.6 : 0; circ(c, -9 + lk, eyesY, 2.1, "#2a1c1c"); circ(c, 9 + lk, eyesY, 2.1, "#2a1c1c"); circ(c, -8.3 + lk, eyesY - .8, .7, "#fff"); circ(c, 9.7 + lk, eyesY - .8, .7, "#fff"); }
    c.strokeStyle = "#5A4434"; c.lineWidth = 1.8; c.beginPath(); if (c.roundRect){ c.roundRect(-16, eyesY - 5, 13, 10, 4); c.roundRect(3, eyesY - 5, 13, 10, 4); } c.stroke(); ln(c, [-3, eyesY - 1, 3, eyesY - 1], "#5A4434", 1.6);
    circ(c, -15, -44, 4, "rgba(255,110,120,.4)"); circ(c, 15, -44, 4, "rgba(255,110,120,.4)");
    ell(c, 0, -46, 5, 4.5, "#E8A086");                                                         // nose
    // mouth (under the moustache)
    if (pose === "cheer" || pose === "wave") ell(c, 0, -35, 4.5, 4, "#7a2a2a");
    else if (pose === "cookie"){ var ch = Math.sin(tm*14)*1.2; ell(c, 0, -35.5, 3.5, 2 + Math.abs(ch), "#7a2a2a"); circ(c, 13, -40, 4.5, SKIN); }
    else { c.strokeStyle = "#7a2a2a"; c.lineWidth = 1.5; c.beginPath(); c.arc(0, -37, 4, .25*Math.PI, .75*Math.PI); c.stroke(); }
    // walrus moustache
    var mw = pose === "cookie" ? Math.sin(tm*14)*.08 : 0;
    ell(c, -7, -40.5, 9.5, 4.6, GREY, -.22 + mw); ell(c, 7, -40.5, 9.5, 4.6, GREY, .22 - mw); ell(c, -13, -38.5, 4, 3, GREY, -.6); ell(c, 13, -38.5, 4, 3, GREY, .6);
    ln(c, [-3, -42, 0, -40.5, 3, -42], GREY2, 1);
    // unlit pipe (no smoke)
    if (pose !== "cookie" && pose !== "sip" && pose !== "cheer" && pose !== "wave"){
      var dr = doze ? 4 : 0;
      ln(c, [5, -37, 13, -35 + dr*.5, 18, -36 + dr], "#3A2418", 2.4);
      rr(c, 15, -45 + dr, 8, 10, 3, "#6B3E22"); ell(c, 19, -45 + dr, 4, 1.6, "#2A1810");
    }
    if (doze){ c.fillStyle = "#EAF2FF"; c.font = "800 11px system-ui, sans-serif"; c.textAlign = "center"; c.textBaseline = "middle"; var z = (tm*.8) % 1; c.globalAlpha = 1 - z; c.fillText("z", 24 + z*10, -70 - z*16); c.globalAlpha = Math.max(0, 1 - ((z + .5) % 1)); c.font = "800 14px system-ui, sans-serif"; c.fillText("Z", 24 + ((z + .5) % 1)*12, -70 - ((z + .5) % 1)*18); c.globalAlpha = 1; }
  }

  function figure(c, tm, pose, hop){
    c.save(); c.translate(0, -hop);
    // legs + shoes
    rr(c, -24, 38, 48, 30, 8, "#5A4232"); ln(c, [0, 46, 0, 66], "#45322545", 1.6);
    ell(c, -13, 70, 12.5, 6, "#9E2A2E"); ell(c, 13, 70, 12.5, 6, "#9E2A2E"); ln(c, [-23, 73, -3, 73], "#F1E6D2", 1.6); ln(c, [3, 73, 23, 73], "#F1E6D2", 1.6);
    // arms behind the body (thermos side) are drawn after the sweater
    sweater(c);
    var sw = Math.sin(tm*(pose === "cheer" ? 14 : 3)), fg = null;
    if (pose === "cheer"){
      arm(c, -30, -18, -42 + sw*2, -70, -44, -42); hand(c, -42 + sw*2, -72);
      arm(c, 30, -18, 42 - sw*2, -70, 44, -42); thermos(c, 42 - sw*2, -64, .8); hand(c, 42 - sw*2, -70);
    } else if (pose === "wave"){
      arm(c, -30, -18, -36, 22, -40, 0); hand(c, -36, 24);
      var wv = Math.sin(tm*9)*8; arm(c, 30, -18, 44 + wv*.4, -66, 46, -40); hand(c, 44 + wv*.4, -68);
      ln(c, [40 + wv*.4, -74, 38 + wv*.4, -80], SKIN, 3); ln(c, [44 + wv*.4, -76, 44 + wv*.4, -82], SKIN, 3); ln(c, [48 + wv*.4, -74, 50 + wv*.4, -80], SKIN, 3);
    } else if (pose === "cookie"){
      thermos(c, 40, 44, .9); arm(c, 30, -18, 36, 30, 42, 6); hand(c, 36, 30);
      var bob = Math.sin(tm*7)*2; arm(c, -30, -18, -20, -30 + bob, -40, 2); fg = function(){ cookie(c, -17, -37 + bob, 7.5); hand(c, -22, -31 + bob); };
    } else if (pose === "sip"){
      arm(c, -30, -18, -36, 22, -40, 0); hand(c, -36, 24); thermos(c, -42, 70, 1);
      var lift = Math.max(0, Math.sin(tm*1.4))*4; arm(c, 30, -18, 20, -28 - lift, 40, 4); fg = function(){ cup(c, 15, -31 - lift, tm); hand(c, 21, -28 - lift); };
    } else if (pose === "doze"){
      arm(c, -30, -18, -6, 14, -34, 8); arm(c, 30, -18, 6, 18, 34, 8); hand(c, -6, 14); hand(c, 6, 18); thermos(c, 46, 72, 1);
    } else { // idle: thermos in one hand, other hand on the belly
      arm(c, -30, -18, -6, 16, -36, 6); hand(c, -6, 16);
      arm(c, 30, -18, 38, 22, 42, 2); thermos(c, 38, 52, .95); hand(c, 38, 22);
    }
    // head (tilts when dozing)
    c.save(); if (pose === "doze"){ c.translate(0, -30); c.rotate(-.14 + Math.sin(tm*1.2)*.03); c.translate(0, 30); }
    headDraw(c, tm, pose);
    c.restore();
    if (fg) fg();
    c.restore();
  }

  function curPose(){
    var t = now(), md = O.mode ? O.mode() : "play";
    if (st.poseT > 0) return st.pose;
    if (md === "play" && t - st.lastAct > 14){ st.dozing = true; return "doze"; }
    if (md === "menu") return (t % 9) < 3 ? "sip" : "idle";
    return (t % 11) < 2.5 ? "sip" : "idle";
  }
  var lastT = 0;
  function tick(){ var t = now(), dt = Math.min(.1, t - (lastT || t)); lastT = t; if (st.poseT > 0) st.poseT -= dt; if (st.msgT > 0) st.msgT -= dt; st.hop = Math.max(0, st.hop - dt*2.2); }

  function draw(c, x, y, s){
    tick(); var tm = now(), pose = curPose(), hop = Math.sin(Math.min(1, st.hop)*Math.PI)*8;
    c.save(); c.translate(x, y); c.scale(s, s);
    ell(c, 0, 74, 34, 6, "rgba(0,0,0,.18)");
    figure(c, tm, pose, hop);
    c.restore();
    st.head = [x, y - (O.xmas ? 100 : 96)*s - hop*s, s];
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
    draw: draw, bubble: bubble, react: react, overLine: overLine, mountMenu: mountMenu,
    get pose(){ return curPose(); }, get msg(){ return st.msgT > 0 ? st.msg : null; },
    _lines: L, _figure: figure, _setXmas: function(v){ O.xmas = !!v; }
  };
})();
