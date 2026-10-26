/* Stop60 social: local QR code, "share score", online top 10 (Supabase public.scores via checked RPC), daily fortune.
   Needs /assets/vendor/qrcode/qrcode.min.js (MIT, Kazuhiko Arase) loaded first. No cookies; nickname + opt-in kept in localStorage. */
(function(){
"use strict";
var SB = "https://oqvqvpvlmmyxivqpaifl.supabase.co", KEY = "sb_publishable_qnC7OiwBa1HV7H9oBk4I9A_KUUHTOFG"; // publishable key: public by design (security = RLS + checks in the database)
var L = {
 no:{qr:"Skann og spill",shareScore:"Del resultatet med venner",top:"Toppliste",top10:"Topp 10",nick:"Kallenavn",nickPh:"2–16 tegn",send:"Send til topplisten",optin:"Vis kallenavnet og resultatet mitt på den offentlige topplisten",close:"Lukk",copy:"Kopier lenke",copied:"Kopiert – lim inn hos en venn",empty:"Ingen resultater ennå – bli den første!",offline:"Topplisten er ikke tilgjengelig akkurat nå",loading:"Laster …",sending:"Sender …",sent:"Lagt inn! Plass {r}",sentOk:"Lagt inn!",queued:"Lagret – sendes når topplisten er tilgjengelig",rejected:"Resultatet ble ikke godtatt",rate:"Vent litt før du sender igjen",nickShort:"Kallenavnet må ha minst 2 tegn",nickChars:"Bruk bokstaver, tall, mellomrom og . _ ' -",nickBad:"Velg et annet kallenavn",needOpt:"Kryss av for å vises på topplisten",noScore:"Spill først for å få et resultat",you:"deg",shareVia:"Del via"},
 pl:{qr:"Zeskanuj i graj",shareScore:"Udostępnij wynik znajomym",top:"Ranking",top10:"Top 10",nick:"Pseudonim",nickPh:"2–16 znaków",send:"Wyślij do rankingu",optin:"Pokaż mój pseudonim i wynik w publicznym rankingu",close:"Zamknij",copy:"Kopiuj link",copied:"Skopiowano – wklej znajomemu",empty:"Brak wyników – bądź pierwszy!",offline:"Ranking jest teraz niedostępny",loading:"Wczytywanie…",sending:"Wysyłanie…",sent:"Dodano! Miejsce {r}",sentOk:"Dodano!",queued:"Zapisano – wyślemy, gdy ranking będzie dostępny",rejected:"Wynik nie został przyjęty",rate:"Odczekaj chwilę przed kolejną wysyłką",nickShort:"Pseudonim musi mieć co najmniej 2 znaki",nickChars:"Użyj liter, cyfr, spacji i . _ ' -",nickBad:"Wybierz inny pseudonim",needOpt:"Zaznacz zgodę, aby pojawić się w rankingu",noScore:"Najpierw zagraj, żeby mieć wynik",you:"ty",shareVia:"Udostępnij przez"},
 en:{qr:"Scan and play",shareScore:"Share score with friends",top:"Leaderboard",top10:"Top 10",nick:"Nickname",nickPh:"2–16 characters",send:"Submit to leaderboard",optin:"Show my nickname and score on the public leaderboard",close:"Close",copy:"Copy link",copied:"Copied – paste it to a friend",empty:"No scores yet – be the first!",offline:"The leaderboard is not available right now",loading:"Loading…",sending:"Sending…",sent:"Added! Rank {r}",sentOk:"Added!",queued:"Saved – it will be sent when the leaderboard is available",rejected:"The score was not accepted",rate:"Please wait a moment before sending again",nickShort:"Nickname needs at least 2 characters",nickChars:"Use letters, digits, spaces and . _ ' -",nickBad:"Please choose another nickname",needOpt:"Tick the box to appear on the leaderboard",noScore:"Play first to get a score",you:"you",shareVia:"Share via"}
};
var NAME_RE = /^[0-9A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźżÆØÅæøåÄÖÜäöüÉÈÁéèáß][0-9A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźżÆØÅæøåÄÖÜäöüÉÈÁéèáß _.'-]*$/;
var BAD_SUB = ['kurw','chuj','pierdol','pierdal','jeban','jebac','jebie','zajeb','wyjeb','pizd','dziwk','szmat','kutas','cwel','ruchac','skurwiel','faen','fitte','fitta','hestkuk','jaevel','jaevla','fanden','rasshol','rasshul','drittsekk','neger','fuck','shit','cunt','bitch','pussy','whore','nigg','faggot','asshole','bastard','retard','hitler','penis','vagina','porn','twat','dildo','wanker','boob'];
var BAD_WORD = ['huj','cipa','fiut','pedal','debil','dupa','dupek','ciota','murzyn','kuk','kukk','pikk','hore','javel','javla','soper','fuk','fck','dick','cock','fag','rape','rapist','ass','sex','cum','tits','slut','nazi','wank','kkk','heil'];
function normName(x){ x = String(x).toLowerCase().replace(/æ/g,'ae').replace(/ß/g,'ss'); var F='ąćęłńóśźżøåäöüéèêáàâíìîúùûýçñ0134578@$!|', T2='acelnoszzoaaoueeeaaaiiiuuuycnoieastbasii', o=''; for (var i=0;i<x.length;i++){ var j=F.indexOf(x[i]); o += j<0 ? x[i] : T2[j]; } return o; }
function dd(x){ return x.replace(/(.)\1+/g,'$1'); }
function blocked(n){ var x=normName(n), c=x.replace(/[^a-z]/g,''), cd=dd(c), w=x.split(/[^a-z]+/).filter(Boolean), wd=w.map(dd);
  return BAD_SUB.some(function(b){ return c.indexOf(b)>=0 || cd.indexOf(dd(b))>=0; }) || BAD_WORD.some(function(b){ return w.indexOf(b)>=0 || wd.indexOf(dd(b))>=0 || c===b || cd===dd(b); }); }
function cleanNick(n){ return String(n||'').replace(/<[^>]*>/g,'').replace(/[\u0000-\u001f\u007f<>&"`\\]/g,'').replace(/\s+/g,' ').trim().slice(0,16); }
function nickErr(n){ if (n.length<2) return 'nickShort'; if (!NAME_RE.test(n)) return 'nickChars'; if (blocked(n)) return 'nickBad'; return ''; }
function esc(s){ return String(s).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function lsJ(k,d){ try { var v = JSON.parse(localStorage.getItem(k)||'null'); return v==null ? d : v; } catch(e){ return d; } }
function lsP(k,v){ try { if (v==null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch(e){} }
function sb(path, body){
  var h = {apikey: KEY}; if (body) h['Content-Type'] = 'application/json';
  var ctl = typeof AbortController!=='undefined' ? new AbortController() : null, tm = ctl ? setTimeout(function(){ ctl.abort(); }, 7000) : 0;
  return fetch(SB + '/rest/v1/' + path, {method: body ? 'POST' : 'GET', headers: h, body: body ? JSON.stringify(body) : undefined, signal: ctl ? ctl.signal : undefined, credentials: 'omit', referrerPolicy: 'no-referrer', cache: 'no-store'})
    .then(function(r){ clearTimeout(tm); return r.text().then(function(tx){ var j=null; try { j = tx ? JSON.parse(tx) : null; } catch(e){} if (!r.ok) throw {status: r.status, msg: (j && (j.message||j.code)) || tx || ''}; return j; }); },
          function(e){ clearTimeout(tm); throw {status: 0, msg: String(e && e.name || e)}; });
}
function qrSVG(text){ var q = qrcode(0,'M'); q.addData(text); q.make(); var n = q.getModuleCount(), m = 2, p = '';
  for (var y=0;y<n;y++) for (var x=0;x<n;x++) if (q.isDark(y,x)) p += 'M'+(x+m)+' '+(y+m)+'h1v1h-1z';
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+(n+2*m)+' '+(n+2*m)+'" shape-rendering="crispEdges" role="img" aria-label="QR"><rect width="100%" height="100%" fill="#fff"/><path d="'+p+'" fill="#111"/></svg>'; }
var CSS = '.s6s{display:flex;gap:12px;align-items:center;justify-content:center;margin:12px auto 0;max-width:340px;width:100%}'+
 '.s6s-qr{flex:none;width:84px;text-align:center;font:700 .66rem/1.15 system-ui,sans-serif;color:inherit;opacity:.92}.s6s-qr span{display:block;background:#fff;border-radius:10px;padding:4px;margin-bottom:4px;box-shadow:0 4px 14px rgba(0,0,0,.35)}.s6s-qr svg{display:block;width:100%!important;height:auto!important;stroke:none!important}.s6s-qr svg path{fill:#111!important;stroke:none!important}.s6s-qr svg rect{fill:#fff!important;stroke:none!important}'+
 '.s6s-b{flex:1;min-width:0;display:flex;flex-direction:column;gap:8px}.s6s-b button{width:100%;min-height:40px;padding:8px 10px;border-radius:14px;font:700 .86rem/1.15 system-ui,sans-serif;cursor:pointer;color:#fff;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.22);white-space:normal;overflow-wrap:anywhere}.s6s-b button:active{transform:scale(.97)}'+
 '.s6s-m{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(6,3,10,.72);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);padding:16px;font-family:system-ui,sans-serif}.s6s-m[hidden]{display:none}'+
 '.s6s-p{width:min(92vw,380px);max-height:88vh;overflow:auto;background:linear-gradient(180deg,#2b1220,#170914);color:#F6EEDC;border:1px solid rgba(232,179,60,.35);border-radius:22px;padding:18px 16px;box-shadow:0 24px 70px rgba(0,0,0,.6);text-align:center;position:relative}'+
 '.s6s-p h3{margin:0 0 10px;font-size:1.25rem;color:#FFD36B}.s6s-x{position:absolute;top:8px;right:10px;background:none;border:0;color:#F6EEDC;font-size:1.6rem;cursor:pointer;line-height:1}'+
 '.s6s-p ol{list-style:none;margin:0 0 10px;padding:0;text-align:left}.s6s-p li{display:flex;gap:8px;padding:6px 8px;border-radius:10px;font-size:.92rem}.s6s-p li:nth-child(odd){background:rgba(255,255,255,.06)}.s6s-p li.me{background:rgba(232,179,60,.22)}.s6s-p li i{font-style:normal;width:1.6em;color:#FFD36B;font-weight:800}.s6s-p li b{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.s6s-p li em{font-style:normal;font-variant-numeric:tabular-nums;font-weight:700}'+
 '.s6s-f{border-top:1px solid rgba(255,255,255,.14);padding-top:10px;text-align:left;font-size:.85rem}.s6s-f input[type=text]{width:100%;box-sizing:border-box;padding:10px 12px;border-radius:12px;border:1px solid rgba(255,255,255,.25);background:rgba(0,0,0,.3);color:#fff;font-size:16px;margin:4px 0 8px}.s6s-f label.c{display:flex;gap:8px;align-items:flex-start;margin-bottom:8px}'+
 '.s6s-go{width:100%;padding:12px;border-radius:14px;border:0;font-weight:800;font-size:1rem;background:linear-gradient(180deg,#FFD36B,#E8B33C);color:#3a1208;cursor:pointer}.s6s-go:disabled{opacity:.5}.s6s-msg{min-height:1.2em;margin:8px 0 0;font-size:.85rem;text-align:center}.s6s-msg.err{color:#ff9a9a}.s6s-mine{margin:0 0 8px;font-weight:700}'+
 '.s6s-links{display:flex;flex-direction:column;gap:8px}.s6s-links a,.s6s-links button{display:block;padding:11px;border-radius:12px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);color:#fff;text-decoration:none;font-weight:700;font-size:.95rem;cursor:pointer}'+
 '.s6s-t{position:fixed;left:50%;bottom:calc(24px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:10000;background:rgba(20,8,26,.92);color:#fff;padding:10px 16px;border-radius:14px;font:600 .9rem system-ui,sans-serif;opacity:0;transition:opacity .25s;pointer-events:none;max-width:88vw;text-align:center}.s6s-t.on{opacity:1}';

function create(cfg){
  // cfg: game, url, lang(), gameName(), shareText(result|null), fmt(row)->string, rpc {start?, submit}, args(result,token)->object, sfx?()
  var PK = cfg.game + '.lb.v1', QK = cfg.game + '.lbq.v1';
  var pref = lsJ(PK, {nick: '', on: false}); pref.nick = cleanNick(pref.nick); pref.on = !!pref.on;
  var result = null, token = null, sent = null, blocks = [];
  function lg(){ var l = cfg.lang(); return L[l] ? l : 'en'; } function t(k, o){ var s = L[lg()][k]; if (o) for (var a in o) s = s.replace('{' + a + '}', o[a]); return s; }
  if (!document.getElementById('s6s-css')){ var st = document.createElement('style'); st.id = 's6s-css'; st.textContent = CSS; document.head.appendChild(st); }
  var toastEl = document.createElement('div'); toastEl.className = 's6s-t'; document.body.appendChild(toastEl);
  function toast(s){ if (cfg.toast) return cfg.toast(s); toastEl.textContent = s; toastEl.classList.add('on'); clearTimeout(toast.h); toast.h = setTimeout(function(){ toastEl.classList.remove('on'); }, 2200); }
  var modal = document.createElement('div'); modal.className = 's6s-m'; modal.hidden = true; modal.innerHTML = '<div class="s6s-p"><button class="s6s-x" type="button">×</button><div class="s6s-c"></div></div>'; document.body.appendChild(modal);
  var box = modal.querySelector('.s6s-c');
  ['pointerdown','touchstart','mousedown','click','keydown'].forEach(function(ev){ modal.addEventListener(ev, function(e){ e.stopPropagation(); }, false); });
  modal.addEventListener('click', function(e){ if (e.target === modal) closeM(); });
  modal.querySelector('.s6s-x').onclick = closeM;
  function closeM(){ modal.hidden = true; mode = null; }
  var mode = null;
  function block(){
    var el = document.createElement('div'); el.className = 's6s';
    el.innerHTML = '<div class="s6s-qr"><span>' + qrSVG(cfg.url) + '</span><small></small></div><div class="s6s-b"><button type="button" class="s6s-sh"></button><button type="button" class="s6s-tp"></button></div>';
    el.querySelector('.s6s-sh').onclick = function(e){ e.stopPropagation(); if (cfg.sfx) cfg.sfx(); share(); };
    el.querySelector('.s6s-tp').onclick = function(e){ e.stopPropagation(); if (cfg.sfx) cfg.sfx(); board(); };
    ['pointerdown','touchstart'].forEach(function(ev){ el.addEventListener(ev, function(e){ e.stopPropagation(); }, {passive: true}); });
    blocks.push(el); relabel(); return el;
  }
  function relabel(){ blocks.forEach(function(el){ el.querySelector('small').textContent = t('qr'); el.querySelector('.s6s-sh').textContent = '📣 ' + t('shareScore'); el.querySelector('.s6s-tp').textContent = '🏆 ' + t('top10'); });
    modal.querySelector('.s6s-x').setAttribute('aria-label', t('close')); if (!modal.hidden && mode === 'board') board(true); if (!modal.hidden && mode === 'share') shareLinks(); }
  /* share */
  function shareMsg(){ return cfg.shareText(result); }
  function share(){
    var txt = shareMsg(), u = cfg.url, coarse = window.matchMedia && matchMedia('(pointer: coarse)').matches;
    try { window.goatcounter && goatcounter.count && goatcounter.count({path: cfg.game + '-share-score', title: cfg.game + ' share score', event: true}); } catch(e){}
    if (navigator.share && coarse){ navigator.share({title: cfg.gameName(), text: txt, url: u}).catch(function(e){ if (e && e.name !== 'AbortError') copy(); }); return; }
    copy(); shareLinks();
  }
  function copy(){ var s = shareMsg() + ' ' + cfg.url, ok = function(){ toast(t('copied')); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(s).then(ok, fb); else fb();
    function fb(){ try { var ta = document.createElement('textarea'); ta.value = s; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); ok(); } catch(e){} } }
  function shareLinks(){ mode = 'share'; var s = shareMsg(), u = cfg.url, e = encodeURIComponent;
    box.innerHTML = '<h3>' + esc(t('shareVia')) + '</h3><p class="s6s-mine">' + esc(s) + '</p><div class="s6s-links">' +
      '<a target="_blank" rel="noopener" href="https://wa.me/?text=' + e(s + ' ' + u) + '">WhatsApp</a>' +
      '<a target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=' + e(u) + '">Messenger / Facebook</a>' +
      '<a target="_blank" rel="noopener" href="https://x.com/intent/post?text=' + e(s) + '&url=' + e(u) + '">X</a>' +
      '<button type="button" class="s6s-cp">🔗 ' + esc(t('copy')) + '</button></div>';
    box.querySelector('.s6s-cp').onclick = copy; modal.hidden = false; }
  /* leaderboard */
  function top10(rows){ var seen = {}, out = []; rows.forEach(function(r){ var k = String(r.name).toLowerCase(); if (seen[k]) return; seen[k] = 1; out.push(r); }); return out.slice(0, 10); }
  function list(){ return sb('scores?select=name,score,ko,wave&game=eq.' + cfg.game + '&order=score.desc,created_at.asc&limit=300').then(function(r){ return top10(r || []); }); }
  function msg(k, o, err){ var m = box.querySelector('.s6s-msg'); if (!m) return; m.textContent = k ? t(k, o) : ''; m.classList.toggle('err', !!err); }
  function board(keep){
    mode = 'board'; var lastMsg = keep && box.querySelector('.s6s-msg') ? [box.querySelector('.s6s-msg').textContent, box.querySelector('.s6s-msg').className] : null;
    var mine = result ? '<p class="s6s-mine">' + esc(cfg.fmt({score: result.score, ko: result.ko, wave: result.wave})) + '</p>' : '';
    box.innerHTML = '<h3>🏆 ' + esc(t('top10')) + ' · ' + esc(cfg.gameName()) + '</h3><ol><li>' + esc(t('loading')) + '</li></ol>' +
      '<div class="s6s-f">' + mine + '<label>' + esc(t('nick')) + '<input type="text" maxlength="16" autocomplete="nickname" autocapitalize="off" spellcheck="false" placeholder="' + esc(t('nickPh')) + '"></label>' +
      '<label class="c"><input type="checkbox"> <span>' + esc(t('optin')) + '</span></label><button type="button" class="s6s-go">' + esc(t('send')) + '</button><p class="s6s-msg"></p></div>';
    var inp = box.querySelector('input[type=text]'), chk = box.querySelector('input[type=checkbox]'), go = box.querySelector('.s6s-go');
    inp.value = pref.nick; chk.checked = pref.on; go.disabled = !result || sent === result; go.onclick = submit;
    if (lastMsg){ var m = box.querySelector('.s6s-msg'); m.textContent = lastMsg[0]; m.className = lastMsg[1]; }
    modal.hidden = false;
    list().then(function(rows){ if (mode !== 'board') return; var ol = box.querySelector('ol');
      ol.innerHTML = rows.length ? rows.map(function(r, i){ return '<li' + (pref.nick && r.name.toLowerCase() === pref.nick.toLowerCase() ? ' class="me"' : '') + '><i>' + (i + 1) + '</i><b>' + esc(r.name) + '</b><em>' + esc(cfg.fmt(r)) + '</em></li>'; }).join('') : '<li>' + esc(t('empty')) + '</li>'; },
      function(){ if (mode === 'board') box.querySelector('ol').innerHTML = '<li>' + esc(t('offline')) + '</li>'; });
  }
  function classify(e){ var m = String(e && e.msg || '').toLowerCase();
    if (/name not allowed/.test(m)) return 'nickBad'; if (/rate limit/.test(m) || e.status === 429) return 'rate';
    if (e.status === 400 || e.status === 409 || /implausible|violates/.test(m)) return 'rejected'; return 'queued'; }
  function post(row){ return sb('rpc/' + cfg.rpc.submit, cfg.args(row, row.tok)).then(function(j){ return {st: 'sent', rank: j && j.rank}; }, function(e){ return {st: classify(e)}; }); }
  function queue(row){ var q = lsJ(QK, []).filter(function(x){ return !(x.name === row.name && x.score === row.score); }); q.push(row); lsP(QK, q.slice(-5)); }
  var flushing = false;
  function flush(){ if (flushing || !pref.on) return; var q = lsJ(QK, []).filter(function(x){ return Date.now() - x.t < 7 * 864e5 && (x.n || 0) < 12; }); if (!q.length){ lsP(QK, null); return; }
    flushing = true; var left = []; q.reduce(function(p, x){ return p.then(function(){ return post(x).then(function(r){ if (r.st === 'queued'){ x.n = (x.n || 0) + 1; left.push(x); } }); }); }, Promise.resolve()).then(function(){ lsP(QK, left.length ? left : null); flushing = false; }); }
  addEventListener('online', flush); setTimeout(flush, 3000);
  function submit(){
    var inp = box.querySelector('input[type=text]'), chk = box.querySelector('input[type=checkbox]'), go = box.querySelector('.s6s-go');
    if (!result){ msg('noScore', null, true); return; }
    var n = cleanNick(inp.value); inp.value = n;
    if (!chk.checked){ msg('needOpt', null, true); return; }
    var er = nickErr(n); if (er){ msg(er, null, true); inp.focus(); return; }
    pref.nick = n; pref.on = true; lsP(PK, pref);
    var row = {name: n, score: result.score, ko: result.ko, wave: result.wave, secs: result.secs, tok: result.tok || null, t: Date.now()}, r0 = result;
    sent = r0; go.disabled = true; msg('sending');
    post(row).then(function(r){
      if (r.st === 'sent'){ msg(r.rank ? 'sent' : 'sentOk', {r: r.rank}); flush(); if (mode === 'board') board(true); }
      else if (r.st === 'queued'){ queue(row); msg('queued'); }
      else { if (r.st !== 'rejected'){ sent = null; go.disabled = false; } msg(r.st, null, true); }
    });
  }
  return {
    block: block, relabel: relabel, share: share, board: board, close: closeM,
    // a new run starts (server-side play time, only when the player opted in)
    start: function(){ token = null; if (!cfg.rpc.start || !pref.on) return; var my = {}; token = my; sb('rpc/' + cfg.rpc.start, {}).then(function(v){ if (token === my && typeof v === 'string') my.tok = v; }, function(){}); },
    // a run / progress result is ready; auto-submits when the player already opted in with a nickname
    result: function(r, quiet){ r.tok = token && token.tok || null; token = null; if (result && sent === result && result.score === r.score) return; result = r; sent = null;
      if (!quiet && pref.on && pref.nick && !nickErr(pref.nick) && r.score > 0){ var row = {name: pref.nick, score: r.score, ko: r.ko, wave: r.wave, secs: r.secs, tok: r.tok, t: Date.now()}; sent = r;
        post(row).then(function(x){ if (x.st === 'queued') queue(row); else if (x.st !== 'sent') sent = null; }); } },
    hasResult: function(){ return !!result; },
    fortune: function(before, force){ if (!window.StopWisdom || !before) return; try { StopWisdom.show({lang: cfg.lang(), before: before, force: !!force}); } catch(e){} }
  };
}
window.S60Social = {create: create, qrSVG: qrSVG};
})();
