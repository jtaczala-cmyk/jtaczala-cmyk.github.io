#!/usr/bin/env python3
"""Builds the Stop60 landing pages (NO at /, EN at /en/, PL at /pl/).
Edit BASE when moving to the stop60.no domain, then re-run: python3 src/build.py"""
import json, html, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = os.environ.get("STOP60_BASE", "https://stop60.no/")
GC   = "jtaczala-games"                             # GoatCounter code ("" = off)
# contact addresses: shown as "user&#64;stop60.no" (works without JS); assets/contact.js assembles the mailto: link at runtime (light anti-spam)
MAILDOM = "stop60.no"
# root-relative: games are project sites served under the user-site custom domain stop60.no
GAMES = {"no": "/strom/", "en": "/power/", "pl": "/prad/"}
DEMO = "/strom/demo/"
# Sponsor section (business pitch + link to the STRØM sponsor demo + sponsor@ address) is hidden from the
# public site for now. The STRØM demo itself is withdrawn (removed from the strom repo 2026-10-04, /strom/demo/ = 404;
# archived in git history and in _archiwum/strom_demo_20261004/). Restore the demo first, then set True + rebuild.
SHOW_SPONSOR = False
PRIV = {"no": "/strom/personvern/", "en": "/power/privacy/", "pl": "/prad/prywatnosc/"}
SL = json.load(open(os.path.join(ROOT, "src", "main_slogans.json")))
SLK = {"no": "strom", "en": "power", "pl": "prad"}
PICK = ["stop", "lock", "meter", "helmet", "ruh"]

T = {
"no": dict(htmllang="nb", ogloc="nb_NO", path="",
  title="Stop60 – et spill som støtter HMS på byggeplassen",
  desc="Stop60 er et kort nettleserspill som støtter HMS på byggeplassen: 60 sekunder per runde med korte huskeregler om sikkerhet, for alle fag. Norsk, engelsk og polsk.",
  tag="Stopp. Tenk. Jobb trygt – 60 sekunder.",
  lead="Et spill som støtter HMS på byggeplassen.",
  ogsub="Et spill som støtter HMS på byggeplassen",
  btns=[("no","Spill","STRØM · norsk · HMS / FSE"),("en","Play","POWER · English · Health & Safety / EWR"),("pl","Graj","PRĄD · polski · BHP")],
  playlabel="Velg språkversjon",
  km="Oppdrag", mh="Et kort spill om trygt arbeid",
  mp=["Stop60 er en serie korte mobilspill om arbeid der HMS-regler er en viktig del av å jobbe trygt.",
      "Spillet har som mål å minne spillerne på disse reglene gjennom korte slagord og informasjon underveis i spillet.",
      "Det kan bidra til å øke bevisstheten om risiko på jobben, men erstatter ikke HMS-opplæring eller instrukser på arbeidsplassen."],
  smis="Spillet har som mål å minne om HMS-regler gjennom korte slagord og informasjon underveis – det erstatter ikke opplæring.", sponsorline="Sponsorer og bedrifter:", contactline="Kontakt:",
  k1="Hva er det", h1="Slik støtter spillet HMS",
  cards=[("Korte huskeregler","Hver runde på 60 sekunder viser 3–4 korte sikkerhetsbudskap."),
         ("For alle fag","Tømrer, elektriker, rørlegger, maskinfører eller lærling – huskereglene gjelder alle på byggeplassen."),
         ("Rask repetisjon","Ett minutt før eller etter jobb, eller i pausen."),
         ("Samtalestarter","Spill en runde på morgenmøtet eller i en sikkerhetsprat, og snakk om huskereglene.")],
  chipsh="Eksempler fra spillet:",
  note="Stop60 erstatter ikke FSE-kurs, HMS-opplæring eller bedriftens egne rutiner.",
  k3="Se hvordan det ser ut", h3="Ekte opptak fra spillet",
  vlead="Korte opptak fra ekte runder på mobil: bevegelse på byggeplassen, travle kollegaer, en huskeregel som dukker opp – og sluttkortet etter 60 sekunder. Uten lyd.",
  stillh="Huskeregler slik de vises i spillet", swipe="Sveip for flere →", vplay="Spill", valt="Opptak fra spillet {g} (uten lyd)",
  k2="For bedrifter og sponsorer", h2="Sikkerhetskampanje på byggeplassen",
  biz=["Bruk Stop60 i HMS-arbeidet: en enkel kampanje for egne ansatte og underentreprenører på byggeplassen.",
       "Egen versjon med bedriftens navn, logo, farger og egne huskeregler.",
       "Del lenken på oppslagstavla, i brakkeriggen eller på morgenmøtet."],
  demo="Se sponsordemo", contact="Ta kontakt", demonote="Eksempelsponsoren i demoen er oppdiktet.",
  mailsubj="Stop60 – sikkerhetskampanje", mailline="Kontakt:",
  ph="Personvern",
  priv="Denne siden bruker ingen informasjonskapsler (cookies). Besøk telles anonymt med GoatCounter (selvhostet skript): bare samlet statistikk lagres. IP-adresse og nettleser holdes kun i serverens minne i inntil 8 timer for å telle unike besøk, og lagres ikke. Spillene har egne personvernsider.",
  privlink="Personvern i spillet (STRØM)",
  langs="Språk"),
"en": dict(htmllang="en", ogloc="en_GB", path="en/",
  title="Stop60 – a game that supports health and safety on construction sites",
  desc="Stop60 is a short browser game that supports health and safety on construction sites: 60-second rounds with short safety reminders, for every trade. In Norwegian, English and Polish.",
  tag="Stop. Think. Work safe – in 60 seconds.",
  lead="A game that supports health and safety on construction sites.",
  ogsub="A game that supports health and safety on construction sites",
  btns=[("en","Play","POWER · English · Health & Safety / EWR"),("no","Spill","STRØM · norsk · HMS / FSE"),("pl","Graj","PRĄD · polski · BHP")],
  playlabel="Choose a language version",
  km="Mission", mh="A short game about working safely",
  mp=["Stop60 is a series of short mobile games about work where health and safety rules are a key part of working safely.",
      "The game aims to remind players of these rules through short slogans and information shown during play.",
      "It can help raise awareness of risks at work, but it does not replace health and safety training or workplace instructions."],
  smis="The game aims to remind players of health and safety rules through short slogans and in-game information – it does not replace training.", sponsorline="Sponsors and companies:", contactline="Contact:",
  k1="What it is", h1="How it supports health and safety",
  cards=[("Short safety reminders","Each 60-second round shows 3–4 short safety slogans."),
         ("For every trade","Carpenters, electricians, plumbers, plant operators, apprentices – the reminders apply to everyone on site."),
         ("A quick refresher","One minute before or after work, or during a break."),
         ("A conversation starter","Play a round at a toolbox talk or morning meeting, then talk about the reminders.")],
  chipsh="Examples from the game:",
  note="Stop60 does not replace EWR training, Health & Safety induction or your company's own procedures.",
  k3="See it in action", h3="Real footage from the game",
  vlead="Short clips from real rounds on a phone: moving around the site, busy co-workers, a safety slogan popping up – and the end card after 60 seconds. No sound.",
  stillh="Safety slogans as they appear in the game", swipe="Swipe for more →", vplay="Play", valt="Gameplay clip from {g} (no sound)",
  k2="For companies and sponsors", h2="A site safety campaign",
  biz=["Use Stop60 in your health and safety work: a simple campaign for your own staff and subcontractors on site.",
       "Your own version with your company name, logo, colours and your own safety reminders.",
       "Share the link on the notice board, in the welfare cabin or at the morning briefing."],
  demo="View sponsor demo", contact="Get in touch", demonote="The demo is in Norwegian; the example sponsor is fictional.",
  mailsubj="Stop60 – site safety campaign", mailline="Contact:",
  ph="Privacy",
  priv="This page sets no cookies. Visits are counted anonymously with GoatCounter (self-hosted script): only aggregate statistics are stored. IP address and browser are kept only in the server's memory for up to 8 hours to count unique visits, and are not stored. The games have their own privacy pages.",
  privlink="Privacy in the game (POWER)",
  langs="Language"),
"pl": dict(htmllang="pl", ogloc="pl_PL", path="pl/",
  title="Stop60 – gra wspierająca bezpieczeństwo i higienę pracy na budowie",
  desc="Stop60 to krótka gra w przeglądarce wspierająca bezpieczeństwo i higienę pracy na budowie: 60-sekundowe rundy z krótkimi hasłami BHP, dla każdej branży. Po polsku, norwesku i angielsku.",
  tag="Stop. Pomyśl. Pracuj bezpiecznie – 60 sekund.",
  lead="Gra wspierająca bezpieczeństwo i higienę pracy na budowie.",
  ogsub="Gra wspierająca bezpieczeństwo i higienę pracy na budowie",
  btns=[("pl","Graj","PRĄD · polski · BHP"),("no","Spill","STRØM · norsk · HMS / FSE"),("en","Play","POWER · English · Health & Safety / EWR")],
  playlabel="Wybierz wersję językową",
  km="Misja", mh="Krótka gra o bezpiecznej pracy",
  mp=["Stop60 to seria krótkich gier na telefon o pracy w miejscach, gdzie zasady BHP są ważną częścią bezpiecznej pracy.",
      "Gra ma na celu przypominać o tych zasadach przez krótkie hasła i informacje pokazywane w trakcie gry.",
      "Może pomóc podnieść świadomość zagrożeń w pracy, ale nie zastępuje szkolenia BHP ani instrukcji na stanowisku pracy."],
  smis="Gra ma na celu przypominać o zasadach BHP przez krótkie hasła i informacje w trakcie gry – nie zastępuje szkolenia.", sponsorline="Sponsorzy i firmy:", contactline="Kontakt:",
  k1="Co to jest", h1="Jak gra wspiera BHP",
  cards=[("Krótkie przypomnienia","Każda 60-sekundowa runda pokazuje 3–4 krótkie hasła BHP."),
         ("Dla każdej branży","Cieśla, elektryk, hydraulik, operator maszyn, praktykant – hasła dotyczą wszystkich na budowie."),
         ("Szybka powtórka","Minuta przed pracą lub po niej, albo w przerwie."),
         ("Początek rozmowy","Zagrajcie rundę na odprawie lub porannym spotkaniu i porozmawiajcie o hasłach.")],
  chipsh="Przykłady z gry:",
  note="Stop60 nie zastępuje szkolenia BHP ani procedur Twojej firmy.",
  k3="Zobacz, jak to wygląda", h3="Prawdziwe nagrania z gry",
  vlead="Krótkie nagrania z prawdziwych rund na telefonie: ruch na budowie, zabiegani koledzy, hasło BHP, które się pojawia – i karta końcowa po 60 sekundach. Bez dźwięku.",
  stillh="Hasła BHP tak, jak pojawiają się w grze", swipe="Przesuń, aby zobaczyć więcej →", vplay="Graj", valt="Nagranie z gry {g} (bez dźwięku)",
  k2="Dla firm i sponsorów", h2="Kampania bezpieczeństwa na budowie",
  biz=["Wykorzystaj Stop60 w działaniach BHP: prosta kampania dla własnych pracowników i podwykonawców na budowie.",
       "Własna wersja z nazwą, logo, kolorami firmy i własnymi hasłami BHP.",
       "Udostępnij link na tablicy ogłoszeń, w kontenerze socjalnym lub na porannej odprawie."],
  demo="Zobacz demo sponsorskie", contact="Napisz do nas", demonote="Demo jest po norwesku; przykładowy sponsor jest fikcyjny.",
  mailsubj="Stop60 – kampania BHP", mailline="Kontakt:",
  ph="Prywatność",
  priv="Ta strona nie używa plików cookie. Wizyty są liczone anonimowo przez GoatCounter (skrypt hostowany lokalnie): zapisywane są tylko zbiorcze statystyki. Adres IP i przeglądarka są trzymane wyłącznie w pamięci serwera do 8 godzin, aby policzyć unikalne wizyty, i nie są zapisywane. Gry mają własne strony o prywatności.",
  privlink="Prywatność w grze (PRĄD)",
  langs="Język"),
}
ORDER = ["no", "en", "pl"]
CLIP = {"no": ("strom", "STRØM", "norsk"), "en": ("power", "POWER", "English"), "pl": ("prad", "PRĄD", "polski")}
STILLS = [("no", "still-no-113-ambulanse", "113 – ambulanse", "STRØM"), ("no", "still-no-las-og-merk", "Lås og merk", "STRØM"),
          ("en", "still-en-ra-risk-assessment", "RA – risk assessment", "POWER"), ("pl", "still-pl-bhp-ocena-ryzyka", "BHP – ocena ryzyka", "PRĄD")]
LBL = {"no": ("NO", "Norsk"), "en": ("EN", "English"), "pl": ("PL", "Polski")}
e = lambda s: html.escape(s, quote=True)
from urllib.parse import quote


# ---- Hefau tile (added at the Hefau launch; free game made with passion – no business wording) ----
HEFAU_TILE = {
 "no": dict(k="Flere spill fra Stop60", h="Hefau – Slangespiralen", href="/hefau/",
   p="Et brettspill inspirert av oldtidens Egypt: brettet er en kveilet gullkobra, og du fører tre løver fra halen til hodet. Spill mot datamaskinen, to på én telefon eller online med en venn.",
   p2="Laget med lidenskap og helt gratis for alle – rett i nettleseren, uten app og uten konto.", b="Spill Hefau", s="Brettspill · norsk, polsk, engelsk",
   alt="Hefau – spillbrettet er en kveilet gullkobra"),
 "pl": dict(k="Więcej gier od Stop60", h="Hefau – Spirala Węża", href="/hefau/pl/",
   p="Gra planszowa inspirowana starożytnym Egiptem: plansza to zwinięta złota kobra, a Ty prowadzisz trzy lwy od ogona do głowy. Graj z komputerem, we dwoje na jednym telefonie lub online ze znajomym.",
   p2="Powstała z pasji i jest całkowicie darmowa dla wszystkich – od razu w przeglądarce, bez aplikacji i bez konta.", b="Zagraj w Hefau", s="Gra planszowa · polski, norweski, angielski",
   alt="Hefau – plansza to zwinięta złota kobra"),
 "en": dict(k="More games from Stop60", h="Hefau – The Serpent Spiral", href="/hefau/en/",
   p="A board game inspired by ancient Egypt: the board is a coiled golden cobra, and you lead three lions from its tail to its head. Play the computer, two on one phone, or online with a friend.",
   p2="Made with passion and completely free for everyone – right in your browser, no app and no account.", b="Play Hefau", s="Board game · English, Norwegian, Polish",
   alt="Hefau – the board is a coiled golden cobra"),
}
def hefau_tile(L, up):
    h = HEFAU_TILE[L]
    return (f'<section class="s hefau" id="hefau"><div class="wrap">'
            f'<style>.hefau .hf{{display:grid;gap:22px;align-items:center}}@media(min-width:760px){{.hefau .hf{{grid-template-columns:minmax(0,420px) 1fr}}}}'
            f'.hefau .hf a.im{{display:block;border-radius:18px;overflow:hidden;box-shadow:0 0 0 1px rgba(242,193,78,.45),0 12px 40px rgba(0,0,0,.55),0 0 46px rgba(242,193,78,.18)}}'
            f'.hefau .hf img{{display:block;width:100%;height:auto}}.hefau .hf p{{margin:0 0 12px}}.hefau .hf .free{{color:#f2c14e}}.hefau .hf .btn{{max-width:340px;margin-top:6px}}</style>'
            f'<p class="k">{e(h["k"])}</p><h2>{e(h["h"])}</h2><div class="hf">'
            f'<a class="im" href="{h["href"]}" tabindex="-1" aria-hidden="true"><img src="{up}assets/hefau-tile-{L}-800.webp" srcset="{up}assets/hefau-tile-{L}-480.webp 480w, {up}assets/hefau-tile-{L}-800.webp 800w" sizes="(min-width:760px) 420px, 92vw" width="800" height="800" loading="lazy" decoding="async" alt="{e(h["alt"])}"/></a>'
            f'<div><p>{e(h["p"])}</p><p class="free">{e(h["p2"])}</p>'
            f'<a class="btn main" href="{h["href"]}" data-goatcounter-click="home-click-hefau-{L}"><b>{e(h["b"])}</b><span>{e(h["s"])}</span></a></div></div></div></section>\n')

def em(u, t, cls="em", label=None):
    return (f'<a class="{cls}" href="#" data-u="{u}" data-d="{MAILDOM}" rel="nofollow">'
            f'{e(label) if label else u + "&#64;" + MAILDOM}</a>')

def page(L):
    t = T[L]; up = "../" if t["path"] else ""
    url = BASE + t["path"]
    alts = "\n".join(f'<link rel="alternate" hreflang="{T[x]["htmllang"]}" href="{BASE+T[x]["path"]}"/>' for x in ORDER)
    alts += f'\n<link rel="alternate" hreflang="x-default" href="{BASE}"/>'
    ogalt = "\n".join(f'<meta property="og:locale:alternate" content="{T[x]["ogloc"]}"/>' for x in ORDER if x != L)
    lang = "".join(
        f'<li><a href="{up}{T[x]["path"] or "./"}" hreflang="{T[x]["htmllang"]}" lang="{T[x]["htmllang"]}" title="{LBL[x][1]}"'
        + (' aria-current="page"' if x == L else '') + f'>{LBL[x][0]}</a></li>' for x in ORDER)
    btns = "\n".join(
        f'<a class="btn{" main" if i==0 else ""}" href="{GAMES[g]}" lang="{T[g]["htmllang"]}"><b>{e(w)}</b><span>{e(s)}</span></a>'
        for i, (g, w, s) in enumerate(t["btns"]))
    cards = "\n".join(f'<div class="card"><p class="n" aria-hidden="true">{i+1:02d}</p><h3>{e(h)}</h3><p>{e(p)}</p></div>' for i, (h, p) in enumerate(t["cards"]))
    sl = {s["k"]: s["t"] for s in SL[SLK[L]]["slogans"]}
    chips = "".join(f"<li>{e(sl[k])}</li>" for k in PICK if k in sl)
    vorder = [L] + [x for x in ORDER if x != L]
    vids = "\n".join(
        f'<figure class="clip"><video class="lazyv" muted loop playsinline preload="metadata" width="390" height="664" '
        f'data-poster="{up}media/stop60-{CLIP[x][0]}-poster.webp" aria-label="{e(t["valt"].format(g=CLIP[x][1]))}">'
        f'<source data-src="{up}media/stop60-{CLIP[x][0]}.webm" type="video/webm"/>'
        f'<source data-src="{up}media/stop60-{CLIP[x][0]}.mp4" type="video/mp4"/></video>'
        f'<figcaption><span lang="{T[x]["htmllang"]}"><b>{CLIP[x][1]}</b> · {CLIP[x][2]}</span>'
        f'<a href="{GAMES[x]}" lang="{T[x]["htmllang"]}">{e([b for b in T[x]["btns"] if b[0]==x][0][1])} →</a></figcaption></figure>'
        for x in vorder)
    sorder = [st for st in STILLS if st[0] == L] + [st for st in STILLS if st[0] != L]
    stills = "".join(
        f'<figure class="still"><img src="{up}media/{f}.webp" width="640" height="480" loading="lazy" decoding="async" alt="{e(cap)} – {g}"/>'
        f'<figcaption lang="{T[x]["htmllang"]}"><b>{e(cap)}</b> · {g}</figcaption></figure>' for x, f, cap, g in sorder)
    biz = "".join(f"<li>{e(x)}</li>" for x in t["biz"])
    gc = (f'<script data-goatcounter="https://{GC}.goatcounter.com/count" async src="{up}count.js"></script>' if GC else "")
    ogimg = f"{BASE}assets/og-{L}.jpg"
    sponsor = (f'''<section class="s biz" id="sponsor"><div class="wrap">
<p class="k">{e(t["k2"])}</p>
<h2>{e(t["h2"])}</h2>
<ul class="ticks">{biz}</ul>
<p class="mtext">{e(t["smis"])}</p>
<div class="cta">{em("sponsor", t, "em p", t["contact"])}<a class="o" href="{DEMO}" lang="nb">{e(t["demo"])} →</a></div>
<p class="mail">{e(t["demonote"])}<br/>{e(t["sponsorline"])} {em("sponsor", t)}</p>
</div></section>
''') if SHOW_SPONSOR else ""
    hefau = hefau_tile(L, up)
    return f'''<!DOCTYPE html>
<!-- Copyright (c) 2026 Stop60. All rights reserved. See LICENSE. -->
<html lang="{t["htmllang"]}">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/>
<title>{e(t["title"])}</title>
<meta name="description" content="{e(t["desc"])}"/>
<meta name="theme-color" content="#12110f"/>
<meta name="color-scheme" content="dark"/>
<link rel="canonical" href="{url}"/>
{alts}
<link rel="icon" type="image/svg+xml" href="{up}assets/favicon.svg"/>
<link rel="apple-touch-icon" href="{up}assets/apple-touch-icon.png"/>
<link rel="preload" href="{up}fonts/oswald-latin.woff2" as="font" type="font/woff2" crossorigin/>
<link rel="preload" as="image" href="{up}assets/hero-800.webp" imagesrcset="{up}assets/hero-800.webp 800w, {up}assets/hero-1280.webp 1280w, {up}assets/hero-1792.webp 1792w" imagesizes="100vw"/>
<link rel="stylesheet" href="{up}fonts/fonts.css"/>
<link rel="stylesheet" href="{up}assets/style.css"/>
<meta property="og:type" content="website"/>
<meta property="og:site_name" content="Stop60"/>
<meta property="og:title" content="{e(t["title"])}"/>
<meta property="og:description" content="{e(t["desc"])}"/>
<meta property="og:url" content="{url}"/>
<meta property="og:locale" content="{t["ogloc"]}"/>
{ogalt}
<meta property="og:image" content="{ogimg}"/>
<meta property="og:image:type" content="image/jpeg"/>
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="630"/>
<meta property="og:image:alt" content="Stop60 – {e(t["tag"])}"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="{e(t["title"])}"/>
<meta name="twitter:description" content="{e(t["desc"])}"/>
<meta name="twitter:image" content="{ogimg}"/>
{gc}
<script defer src="{up}assets/media.js"></script>
<script defer src="{up}assets/contact.js?v=2"></script>
</head>
<body>
<a class="skip" href="#main">↓</a>
<header class="top"><div class="wrap">
<a class="brand" href="./" aria-label="Stop60"><img src="{up}assets/favicon.svg" alt="Stop60" width="36" height="36"/></a>
<nav aria-label="{e(t["langs"])}"><ul class="lang">{lang}</ul></nav>
</div></header>
<main id="main">
<section class="hero">
<picture><img src="{up}assets/hero-800.webp" srcset="{up}assets/hero-800.webp 800w, {up}assets/hero-1280.webp 1280w, {up}assets/hero-1792.webp 1792w" sizes="100vw" alt="" width="1792" height="1008" fetchpriority="high" decoding="async"/></picture>
<div class="wrap">
<h1><img src="{up}assets/logo.svg" alt="Stop60" width="281" height="100"/></h1>
<p class="tag">{e(t["tag"])}</p>
<p class="lead">{e(t["lead"])}</p>
<nav class="play" aria-label="{e(t["playlabel"])}">
{btns}
</nav>
</div>
</section>
<section class="s mission" id="mission"><div class="wrap">
<p class="k">{e(t["km"])}</p>
<h2>{e(t["mh"])}</h2>
<p class="mtext">{" ".join(e(x) for x in t["mp"])}</p>
</div></section>
<section class="s" id="what"><div class="wrap">
<p class="k">{e(t["k1"])}</p>
<h2>{e(t["h1"])}</h2>
<div class="grid">
{cards}
</div>
<p class="note" style="margin-top:22px;color:#d6d3d1">{e(t["chipsh"])}</p>
<ul class="chips">{chips}</ul>
<p class="note">{e(t["note"])}</p>
</div></section>
<section class="s act" id="action"><div class="wrap">
<p class="k">{e(t["k3"])}</p>
<h2>{e(t["h3"])}</h2>
<p class="vlead">{e(t["vlead"])}</p>
<div class="row clips" tabindex="0" aria-label="{e(t["k3"])}">
{vids}
</div>
<p class="swipe" aria-hidden="true">{e(t["swipe"])}</p>
<h3 class="sth">{e(t["stillh"])}</h3>
<div class="row stills" tabindex="0" aria-label="{e(t["stillh"])}">{stills}</div>
</div></section>
{hefau}{sponsor}</main>
<footer><div class="wrap">
<h2>{e(t["ph"])}</h2>
<p>{e(t["priv"])}</p>
<p><a href="{PRIV[L]}">{e(t["privlink"])}</a></p>
<div class="row"><span>© 2026 Stop60</span><span>{e(t["contactline"])} {em("kontakt", t)}</span><span>Created with Grok</span></div>
</div></footer>
</body>
</html>
'''

for L in ORDER:
    d = os.path.join(ROOT, T[L]["path"]); os.makedirs(d, exist_ok=True)
    open(os.path.join(d, "index.html"), "w").write(page(L))
# sitemap + robots
sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
for L in ORDER:
    sm += f'<url><loc>{BASE+T[L]["path"]}</loc>' + "".join(f'<xhtml:link rel="alternate" hreflang="{T[x]["htmllang"]}" href="{BASE+T[x]["path"]}"/>' for x in ORDER) + '</url>\n'
_HF = [("nb", "https://stop60.no/hefau/"), ("pl", "https://stop60.no/hefau/pl/"), ("en", "https://stop60.no/hefau/en/")]
for _, u in _HF:
    sm += f'<url><loc>{u}</loc>' + "".join(f'<xhtml:link rel="alternate" hreflang="{h}" href="{v}"/>' for h, v in _HF) + '<xhtml:link rel="alternate" hreflang="x-default" href="https://stop60.no/hefau/"/></url>\n'
open(os.path.join(ROOT, "sitemap.xml"), "w").write(sm + "</urlset>\n")
open(os.path.join(ROOT, "robots.txt"), "w").write(f"User-agent: *\nAllow: /\nSitemap: {BASE}sitemap.xml\n")
json.dump({L:[T[L]["tag"],T[L]["ogsub"]] for L in ORDER}, open(os.path.join(ROOT,"src","og.json"),"w"), ensure_ascii=False)
print("built", BASE)
