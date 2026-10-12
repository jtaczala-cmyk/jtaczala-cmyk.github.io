#!/usr/bin/env python3
"""Stop60 home page generator (redesign 2026-10-11) (NO / EN / PL).
Adding a game = one entry in GAMES. Output: prototype/{index.html,en/,pl/,sitemap.xml}.
© 2026 Stop60"""
import json, html, os, datetime
BASE = os.environ.get("STOP60_BASE", "https://stop60.no/")
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.environ.get("STOP60_OUT") or (os.path.dirname(HERE) if os.path.basename(HERE) == "src" else os.path.join(HERE, "prototype"))
import sys; sys.path.insert(0, HERE); import art
TODAY = datetime.date(2026, 10, 11)
e = html.escape
LANGS = ["no", "en", "pl"]
PATH = {"no": "", "en": "en/", "pl": "pl/"}
HREFLANG = {"no": "nb", "en": "en", "pl": "pl"}
LOCALE = {"no": "nb_NO", "en": "en_GB", "pl": "pl_PL"}
LANGNAME = {"no": {"no": "norsk", "en": "engelsk", "pl": "polsk"},
            "en": {"no": "Norwegian", "en": "English", "pl": "Polish"},
            "pl": {"no": "norweski", "en": "angielski", "pl": "polski"}}

T = {
 "no": dict(
  tagline="laget med lidenskap",
  title="Stop60 – gratis spill i nettleseren, uten reklame og uten konto",
  desc="Små spill du starter rett i nettleseren: brettspill, logikk, action og læring. Laget med lidenskap og gratis for alle – ingen reklame, ingen konto, ingen app. På norsk, engelsk og polsk.",
  navlang="Språk", nav_games="Spill", nav_about="Om", menu="Hovedmeny",
  h1="Gratis spill rett i nettleseren",
  lead="Små spill laget med lidenskap – gratis for alle, på mobil og PC.",
  trust=["Gratis", "Ingen reklame", "Ingen konto", "Ingen app å installere"],
  k_games="Spillene", h_games="Velg et spill", filt="Filtrer etter kategori", all="Alle",
  cats={"board": "Brettspill", "logic": "Logikk", "action": "Action", "learning": "Læring"},
  new="Ny", langs="Språk", play="Spill", modes="Spillemåter",
  k_about="Om Stop60", h_about="Laget med lidenskap, gratis for alle",
  about=[("Gratis for alle", "Alle spillene er helt gratis. Ingen reklame, ingen kjøp i spillet og ingen konto."),
         ("Rett i nettleseren", "Åpne lenken og spill – på mobil, nettbrett eller PC. Vil du ha spillet som app, velg «Legg til på Hjem-skjerm»."),
         ("Tre språk", "Sidene og de fleste spillene finnes på norsk, engelsk og polsk.")],
  hms="STRØM, POWER og PRĄD viser korte HMS-huskeregler underveis, men erstatter ikke HMS-opplæring, FSE-kurs eller instrukser på arbeidsplassen.",
  privacy_h="Personvern",
  privacy="Denne siden bruker ingen informasjonskapsler (cookies). Besøk telles anonymt med GoatCounter (selvhostet skript): bare samlet statistikk lagres. IP-adresse og nettleser holdes kun i serverens minne i inntil 8 timer for å telle unike besøk, og lagres ikke. Spillene har egne personvernsider med behandlingsansvarlig, rettighetene dine og kontakt.",
  priv_links="Personvern i spillene:", contact="Kontakt:", count="{n} spill"),
 "en": dict(
  tagline="made with passion",
  title="Stop60 – free browser games, no ads and no account",
  desc="Small games you start right in your browser: board, logic, action and learning. Made with passion and free for everyone – no ads, no account, no app. In Norwegian, English and Polish.",
  navlang="Language", nav_games="Games", nav_about="About", menu="Main menu",
  h1="Free games, right in your browser",
  lead="Small games made with passion – free for everyone, on phone and computer.",
  trust=["Free", "No ads", "No account", "Nothing to install"],
  k_games="The games", h_games="Pick a game", filt="Filter by category", all="All",
  cats={"board": "Board", "logic": "Logic", "action": "Action", "learning": "Learning"},
  new="New", langs="Languages", play="Play", modes="Modes",
  k_about="About Stop60", h_about="Made with passion, free for everyone",
  about=[("Free for everyone", "Every game is completely free. No ads, no in-game purchases and no account."),
         ("Right in your browser", "Open the link and play – on a phone, tablet or computer. Want it as an app? Choose “Add to Home Screen”."),
         ("Three languages", "The site and most games are available in Norwegian, English and Polish.")],
  hms="STRØM, POWER and PRĄD show short health & safety reminders while you play, but they do not replace safety training or instructions at your workplace.",
  privacy_h="Privacy",
  privacy="This site uses no cookies. Visits are counted anonymously with GoatCounter (self-hosted script): only aggregate statistics are stored. IP address and browser are kept only in the server’s memory for up to 8 hours to count unique visits, and are not stored. The games have their own privacy pages with the data controller, your rights and contact details.",
  priv_links="Privacy in the games:", contact="Contact:", count="{n} games"),
 "pl": dict(
  tagline="stworzone z pasji",
  title="Stop60 – darmowe gry w przeglądarce, bez reklam i bez konta",
  desc="Małe gry, które uruchamiasz od razu w przeglądarce: planszowe, logiczne, zręcznościowe i do nauki. Robione z pasji i darmowe dla wszystkich – bez reklam, bez konta, bez aplikacji. Po norwesku, angielsku i polsku.",
  navlang="Język", nav_games="Gry", nav_about="O nas", menu="Menu główne",
  h1="Darmowe gry prosto w przeglądarce",
  lead="Małe gry robione z pasji – darmowe dla wszystkich, na telefonie i komputerze.",
  trust=["Za darmo", "Bez reklam", "Bez konta", "Bez instalacji"],
  k_games="Gry", h_games="Wybierz grę", filt="Filtruj według kategorii", all="Wszystkie",
  cats={"board": "Planszowe", "logic": "Logiczne", "action": "Akcja", "learning": "Nauka"},
  new="Nowość", langs="Języki", play="Graj", modes="Tryby",
  k_about="O Stop60", h_about="Robione z pasji, darmowe dla wszystkich",
  about=[("Za darmo dla wszystkich", "Wszystkie gry są całkowicie darmowe. Bez reklam, bez zakupów w grze i bez konta."),
         ("Prosto w przeglądarce", "Otwórz link i graj – na telefonie, tablecie lub komputerze. Chcesz mieć grę jak aplikację? Wybierz „Dodaj do ekranu początkowego”."),
         ("Trzy języki", "Strona i większość gier są po norwesku, angielsku i polsku.")],
  hms="STRØM, POWER i PRĄD pokazują w trakcie gry krótkie hasła BHP, ale nie zastępują szkolenia BHP ani instrukcji w miejscu pracy.",
  privacy_h="Prywatność",
  privacy="Ta strona nie używa plików cookie. Wizyty są liczone anonimowo przez GoatCounter (skrypt na własnym serwerze): zapisywane są tylko zbiorcze statystyki. Adres IP i przeglądarka są trzymane wyłącznie w pamięci serwera do 8 godzin, aby policzyć unikalne wizyty, i nie są zapisywane. Gry mają własne strony o prywatności z danymi administratora, Twoimi prawami i kontaktem.",
  priv_links="Prywatność w grach:", contact="Kontakt:", count="{n} gier"),
}

# One entry per game. url/img/name may be per language. new_until: 'New' badge shown until this date.
GAMES = [
 dict(id="ufobang", cats=["action"], new_until="2027-01-31", langs=["no", "en", "pl"],
      url={"no": "/ufobang/", "en": "/ufobang/en/", "pl": "/ufobang/pl/"},
      og={"no": "/ufobang/og-no.jpg", "en": "/ufobang/og-en.jpg", "pl": "/ufobang/og-pl.jpg"},
      img={l: "ufobang" for l in LANGS},
      name={"no": "Ufobang", "en": "Ufobang", "pl": "Ufobang"},
      sub={"no": "Forsvar jorden", "en": "Defend the Earth", "pl": "Obroń Ziemię"},
      desc={"no": "Arkadeklassiker i ny drakt: styr laserkanonen, skyt ned 55 marsjerende romvesener, gjem deg bak fire skjold og treff Rødmantaen for bonus.",
            "en": "An arcade classic in a new coat: steer the laser cannon, shoot down 55 marching aliens, hide behind four shields and hit the Red Manta for a bonus.",
            "pl": "Klasyka automatów w nowej odsłonie: steruj działem laserowym, zestrzel 55 maszerujących kosmitów, chowaj się za czterema tarczami i trafiaj Czerwoną Mantę."},
      versions=[("no", "Ufobang", "/ufobang/"), ("en", "Ufobang", "/ufobang/en/"), ("pl", "Ufobang", "/ufobang/pl/")],
      modes={"no": "Én spiller · bølge etter bølge", "en": "Single player · wave after wave", "pl": "Jeden gracz · fala za falą"}),
 dict(id="logikk", cats=["logic"], new_until="2026-12-31", langs=["no", "en", "pl"],
      url={"no": "/logikk/", "en": "/logikk/en/", "pl": "/logikk/pl/"},
      og={"no": "/logikk/og-no.jpg", "en": "/logikk/og-en.jpg", "pl": "/logikk/og-pl.jpg"},
      img={l: "logikk" for l in LANGS},
      name={"no": "Ren logikk", "en": "Pure Logic", "pl": "Czysta logika"},
      sub={"no": "Tallgåte 1–9", "en": "Number puzzle 1–9", "pl": "Łamigłówka liczbowa 1–9"},
      desc={"no": "Fyll inn tallene 1–9 slik at ingen gjentas i rad, kolonne eller boks. Tre nivåer, notater, hint og en daglig oppgave.",
            "en": "Fill in the digits 1–9 so none repeats in a row, column or box. Three levels, pencil notes, hints and a daily puzzle.",
            "pl": "Wpisz cyfry 1–9 tak, by żadna nie powtarzała się w wierszu, kolumnie ani kwadracie. Trzy poziomy, notatki, podpowiedzi i zagadka dnia."},
      versions=[("no", "Ren logikk", "/logikk/"), ("en", "Pure Logic", "/logikk/en/"), ("pl", "Czysta logika", "/logikk/pl/")],
      modes={"no": "Én spiller · daglig oppgave", "en": "Single player · daily puzzle", "pl": "Jeden gracz · zagadka dnia"}),
 dict(id="hefau", cats=["board"], new_until="2026-11-30", langs=["no", "en", "pl"],
      url={"no": "/hefau/", "en": "/hefau/en/", "pl": "/hefau/pl/"},
      og={"no": "/hefau/og-no.jpg", "en": "/hefau/og-en.jpg", "pl": "/hefau/og-pl.jpg"},
      img={"no": "hefau-no", "en": "hefau-en", "pl": "hefau-pl"},
      name={"no": "Hefau", "en": "Hefau", "pl": "Hefau"},
      sub={"no": "Slangespiralen", "en": "The Serpent Spiral", "pl": "Spirala Węża"},
      desc={"no": "Brettspill inspirert av oldtidens Egypt: før tre løver langs en kveilet gullkobra helt til hodet.",
            "en": "A board game inspired by ancient Egypt: race three lions along a coiled golden cobra all the way to its head.",
            "pl": "Gra planszowa inspirowana starożytnym Egiptem: poprowadź trzy lwy po zwiniętej złotej kobrze aż do głowy."},
      versions=[("no", "Hefau", "/hefau/"), ("en", "Hefau", "/hefau/en/"), ("pl", "Hefau", "/hefau/pl/")],
      modes={"no": "Mot datamaskinen · to på én telefon · online", "en": "Vs computer · two on one phone · online", "pl": "Z komputerem · we dwoje na telefonie · online"}),
 dict(id="strom", cats=["action", "learning"], brand_versions=True, langs=["no", "en", "pl"],
      url={"no": "/strom/", "en": "/power/", "pl": "/prad/"},
      og={"no": "/strom/og.jpg", "en": "/power/og.jpg", "pl": "/prad/og.jpg"},
      img={"no": "strom", "en": "power", "pl": "prad"},
      name={"no": "STRØM", "en": "POWER", "pl": "PRĄD"},
      sub={"no": "60 sekunder på byggeplassen", "en": "60 seconds on site", "pl": "60 sekund na budowie"},
      desc={"no": "Kort actionspill: kom deg gjennom en travel byggeplass på 60 sekunder og fang korte HMS-huskeregler underveis.",
            "en": "A short action game: get through a busy building site in 60 seconds and pick up quick safety reminders on the way.",
            "pl": "Krótka gra akcji: przejdź przez ruchliwą budowę w 60 sekund i łap po drodze krótkie hasła BHP."},
      modes={"no": "Én spiller · runder på 60 s", "en": "Single player · 60-second rounds", "pl": "Jeden gracz · rundy po 60 s"},
      versions=[("no", "STRØM", "/strom/"), ("en", "POWER", "/power/"), ("pl", "PRĄD", "/prad/")]),
 dict(id="robaki", cats=["action"], langs=["pl", "en"],
      url={"no": "/robaki/?lang=en", "en": "/robaki/?lang=en", "pl": "/robaki/"},
      og={l: "/robaki/intro.jpg" for l in LANGS},
      versions=[("pl", "Sneaky Bugs", "/robaki/"), ("en", "Sneaky Bugs", "/robaki/?lang=en")],
      img={l: "robaki" for l in LANGS},
      name={"no": "Sneaky Bugs", "en": "Sneaky Bugs", "pl": "Sneaky Bugs"},
      sub={"no": "Angrep av de svarte krypene", "en": "Attack of the Black Bugs", "pl": "Atak Czarnych Robaków"},
      desc={"no": "Kjør lastebilen over en nattlig parkeringsplass, knus svarte kryp med røde øyne og unngå giften. 60 sekunder per runde.",
            "en": "Drive a truck across a night-time truck park, squash black bugs with red eyes and dodge their venom. 60 seconds a round.",
            "pl": "Jedź ciężarówką po nocnym parkingu, rozgniataj czarne robaki o czerwonych oczach i unikaj jadu. 60 sekund na rundę."},
      modes={"no": "Én spiller · runder på 60 s", "en": "Single player · 60-second rounds", "pl": "Jeden gracz · rundy po 60 s"}),
 dict(id="angielski", hidden=True, cats=["learning"], langs=["pl"], aux="en",  # hidden 2026-10-11 (owner request): no card, not in sitemap; app still works at its URL
      url={l: "/angielski-elektryk/" for l in LANGS},
      og={l: "/angielski-elektryk/icons/icon-512.png" for l in LANGS},
      versions=[("pl", "Angielski elektryk", "/angielski-elektryk/")],
      img={l: "tutor" for l in LANGS},
      name={l: "Angielski elektryk" for l in LANGS},
      sub={"no": "Engelsk samtaleøving for elektrikere", "en": "English conversation practice for electricians", "pl": "Rozmowa po angielsku dla elektryka"},
      desc={"no": "Øv på britisk engelsk fra byggeplassen: samtaler, gloser og repetisjon på nivå A2–C1. Grensesnittet er på polsk.",
            "en": "Practise British English from the building site: conversations, vocabulary and reviews at levels A2–C1. The interface is in Polish.",
            "pl": "Ćwicz brytyjski angielski z budowy: rozmowy, słówka i powtórki na poziomach A2–C1."},
      warn={"no": "AI-samtalen bruker din egen API-nøkkel (betales hos leverandøren).",
            "en": "AI conversation uses your own API key (paid to the provider).",
            "pl": "Rozmowa z AI wymaga własnego klucza API (płatnego u dostawcy)."},
      modes={"no": "Læringsapp", "en": "Learning app", "pl": "Aplikacja do nauki"}),
]
# hidden=True keeps a game's entry here (easy to restore: delete the flag) but leaves it off the home pages, 404 and sitemap
GAMES_ALL = GAMES
GAMES = [g for g in GAMES_ALL if not g.get("hidden")]
# Privacy pages linked in the footer, in the page's language (2026-10-11: all games, not only STRØM/Hefau)
PRIV = {"no": [("STRØM", "/strom/personvern/"), ("Hefau", "/hefau/personvern/"), ("Ren logikk", "/logikk/personvern/"), ("Sneaky Bugs (engelsk)", "/robaki/en/privacy/"), ("Ufobang", "/ufobang/personvern/")],
        "en": [("POWER", "/power/privacy/"), ("Hefau", "/hefau/en/privacy/"), ("Pure Logic", "/logikk/en/privacy/"), ("Sneaky Bugs", "/robaki/en/privacy/"), ("Ufobang", "/ufobang/en/privacy/")],
        "pl": [("PRĄD", "/prad/prywatnosc/"), ("Hefau", "/hefau/prywatnosc/"), ("Czysta logika", "/logikk/prywatnosc/"), ("Sneaky Bugs", "/robaki/prywatnosc/"), ("Ufobang", "/ufobang/prywatnosc/")]}

FLAG = {
 "no": '<svg class="flag" viewBox="0 0 22 16" aria-hidden="true" focusable="false"><rect width="22" height="16" fill="#ba0c2f"/><path d="M0,8H22M8,0V16" stroke="#fff" stroke-width="4"/><path d="M0,8H22M8,0V16" stroke="#00205b" stroke-width="2"/></svg>',
 "en": '<svg class="flag" viewBox="0 0 60 30" preserveAspectRatio="none" aria-hidden="true" focusable="false"><rect width="60" height="30" fill="#012169"/><path d="M0,0L60,30M60,0L0,30" stroke="#fff" stroke-width="6"/><path d="M0,0L60,30M60,0L0,30" stroke="#c8102e" stroke-width="2.4"/><path d="M30,0V30M0,15H60" stroke="#fff" stroke-width="10"/><path d="M30,0V30M0,15H60" stroke="#c8102e" stroke-width="6"/></svg>',
 "pl": '<svg class="flag" viewBox="0 0 16 10" aria-hidden="true" focusable="false"><rect width="16" height="10" fill="#fff"/><rect y="5" width="16" height="5" fill="#dc143c"/></svg>',
}
CODE = {"no": "NO", "en": "EN", "pl": "PL"}
VEST = {"no": "STRØM", "en": "POWER", "pl": "PRĄD"}  # label on the STRØM player's vest in each language version

def is_new(g): return "new_until" in g and TODAY <= datetime.date.fromisoformat(g["new_until"])

def lockup(t, rel, cls):
    return (f'<span class="lockup {cls}"><img src="{rel}assets/logo-round.svg" alt="" width="40" height="40"/>'
            f'<span class="wm"><b>STOP60</b><i lang="{HREFLANG[t["_l"]]}">{e(t["tagline"])}</i></span></span>')

def card(g, l, t, rel):
    cats = " ".join(g["cats"])
    nm, url = g["name"][l], g["url"][l]
    badges = f'<span class="badge new">{e(t["new"])}</span>' if is_new(g) else ""
    langs = ", ".join(LANGNAME[l][x] for x in g["langs"])
    catlbl = " · ".join(t["cats"][c] for c in g["cats"])
    vs = sorted(g["versions"], key=lambda v: (v[0] != l, v[0] != "en"))
    prim = vs[0]
    btns = (f'<a class="p" href="{prim[2]}" lang="{HREFLANG[prim[0]]}" data-goatcounter-click="home2-{g["id"]}-{prim[0]}">'
            f'{e(t["play"])} →<span class="lc">{FLAG[prim[0]]}{CODE[prim[0]]}</span></a>')
    same_name = not g.get("brand_versions")
    for v in vs[1:]:
        label = "" if same_name else f'{e(v[1])} '
        btns += (f'<a class="o" href="{v[2]}" lang="{HREFLANG[v[0]]}" title="{e(v[1])} · {e(LANGNAME[l][v[0]])}" data-goatcounter-click="home2-{g["id"]}-{v[0]}">'
                 f'{label}<span class="lc">{FLAG[v[0]]}{CODE[v[0]]}</span></a>')
    warn = f'<p class="warn">{e(g["warn"][l])}</p>' if "warn" in g else ""
    return (f'<li class="card" data-cat="{cats}" style="--acc:{art.ACCENT[g["id"]]}">'
            f'<a class="im" href="{url}" tabindex="-1" aria-hidden="true">{art.card_svg(g["id"], rel, VEST[l])}</a>'
            f'<div class="badges">{badges}</div>'
            f'<div class="body"><p class="cat">{e(catlbl)}</p><h3><a href="{url}">{e(nm)}</a><span class="sub">{e(g["sub"][l])}</span></h3>'
            f'<p class="d">{e(g["desc"][l])}</p>{warn}'
            f'<p class="meta"><b>{e(t["langs"])}:</b> {e(langs)}<span class="mo"><br/><b>{e(t["modes"])}:</b> {e(g["modes"][l])}</span></p>'
            f'<div class="play">{btns}</div></div></li>')

def jsonld(l, t):
    items = []
    for i, g in enumerate(GAMES, 1):
        items.append({"@type": "ListItem", "position": i, "item": {
            "@type": "VideoGame", "name": g["name"][l], "url": BASE.rstrip("/") + g["url"][l],
            "description": g["desc"][l], "inLanguage": [HREFLANG[x] for x in g["langs"]],
            "image": BASE.rstrip("/") + g["og"][l], "genre": [T["en"]["cats"][c] for c in g["cats"]],
            "gamePlatform": "Web browser", "operatingSystem": "Any", "applicationCategory": "GameApplication",
            "isAccessibleForFree": "warn" not in g, "publisher": {"@id": BASE + "#org"}}})
        if "warn" not in g: items[-1]["item"]["offers"] = {"@type": "Offer", "price": "0", "priceCurrency": "NOK"}
    d = {"@context": "https://schema.org", "@graph": [
        {"@type": "Organization", "@id": BASE + "#org", "name": "Stop60", "url": BASE, "logo": BASE + "assets/apple-touch-icon.png"},
        {"@type": "WebSite", "@id": BASE + "#site", "name": "Stop60", "url": BASE, "inLanguage": ["nb", "en", "pl"]},
        {"@type": "ItemList", "name": t["title"], "url": BASE + PATH[l], "itemListElement": items}]}
    return json.dumps(d, ensure_ascii=False, separators=(",", ":"))

def head_common(l, t, rel, title, desc, canonical=True):
    alt = "".join(f'<link rel="alternate" hreflang="{HREFLANG[x]}" href="{BASE}{PATH[x]}"/>' for x in LANGS)
    return f'''<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/>
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}"/>
<meta name="theme-color" content="#12110f"/>
<meta name="color-scheme" content="dark"/>
''' + (f'''<link rel="canonical" href="{BASE}{PATH[l]}"/>
{alt}<link rel="alternate" hreflang="x-default" href="{BASE}"/>
''' if canonical else '<meta name="robots" content="noindex"/>\n') + f'''<link rel="icon" href="{rel}favicon.ico" sizes="48x48"/>
<link rel="icon" type="image/svg+xml" href="{rel}assets/favicon.svg?v=3"/>
<link rel="apple-touch-icon" href="{rel}assets/apple-touch-icon.png?v=3"/>
<link rel="preload" href="{rel}fonts/oswald-latin.woff2" as="font" type="font/woff2" crossorigin/>
<link rel="stylesheet" href="{rel}fonts/fonts.css"/>
<link rel="stylesheet" href="{rel}assets/home.css?v=4"/>
'''

def header(l, t, rel, langlinks=True):
    lang = "".join(f'<li><a href="{rel}{PATH[x] or ("" if rel == "/" else "./")}" hreflang="{HREFLANG[x]}" lang="{HREFLANG[x]}" title="{e(LANGNAME[x][x].capitalize())}"{" aria-current=\"page\"" if x==l else ""}>{FLAG[x]}<span>{CODE[x]}</span></a></li>' for x in LANGS)
    return (f'<header class="top"><div class="wrap">'
            f'<a class="brand" href="{rel or "./"}" aria-label="Stop60 – {e(t["tagline"])}">{lockup(t, rel, "sm")}</a>'
            f'<nav class="mnav" aria-label="{e(t["menu"])}"><a href="{rel}#spill">{e(t["nav_games"])}</a><a href="{rel}#om">{e(t["nav_about"])}</a></nav>'
            f'<nav aria-label="{e(t["navlang"])}"><ul class="lang">{lang}</ul></nav></div></header>')

def footer(t):
    priv = " · ".join(f'<a href="{u}">{e(n)}</a>' for n, u in PRIV[t["_l"]])
    return f'''<footer><div class="wrap">
<h2>{e(t["privacy_h"])}</h2>
<p>{e(t["privacy"])}</p>
<p>{e(t["priv_links"])} {priv}</p>
<div class="row"><span>© 2026 Stop60</span><span>{e(t["contact"])} <a class="em" href="#" data-u="kontakt" data-d="stop60.no" rel="nofollow">kontakt&#64;stop60.no</a></span></div>
</div></footer>'''

def hero_art(t, rel):
    return (f'<div class="hero-art">{art.hero_svg(rel, VEST[t["_l"]])}'
            f'<div class="hero-logo">{lockup(t, rel, "lg")}</div></div>')

def page(l):
    t = dict(T[l], _l=l); rel = "" if l == "no" else "../"
    used = [c for c in ["board", "logic", "action", "learning"] if any(c in g["cats"] for g in GAMES)]
    filt = f'<button type="button" data-c="all" aria-pressed="true">{e(t["all"])}<span>{len(GAMES)}</span></button>' + "".join(
        f'<button type="button" data-c="{c}" aria-pressed="false">{e(t["cats"][c])}<span>{sum(c in g["cats"] for g in GAMES)}</span></button>' for c in used)
    games = sorted(GAMES, key=lambda g: not is_new(g))
    cards = "".join(card(g, l, t, rel) for g in games)
    trust = "".join(f"<li>{e(x)}</li>" for x in t["trust"])
    about = "".join(f'<div class="box"><h3>{e(h)}</h3><p>{e(p)}</p></div>' for h, p in t["about"])
    return f'''<!DOCTYPE html>
<!-- Copyright (c) 2026 Stop60. All rights reserved. See LICENSE. Generated by src/build.py – do not edit by hand. -->
<html lang="{HREFLANG[l]}">
<head>
{head_common(l, t, rel, t["title"], t["desc"])}<meta property="og:type" content="website"/>
<meta property="og:site_name" content="Stop60"/>
<meta property="og:title" content="{e(t["title"])}"/>
<meta property="og:description" content="{e(t["desc"])}"/>
<meta property="og:url" content="{BASE}{PATH[l]}"/>
<meta property="og:locale" content="{LOCALE[l]}"/>
{"".join(f'<meta property="og:locale:alternate" content="{LOCALE[x]}"/>' for x in LANGS if x != l)}
<meta property="og:image" content="{BASE}assets/og-home-{l}.jpg?v=5"/>
<meta property="og:image:type" content="image/jpeg"/>
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="630"/>
<meta property="og:image:alt" content="Stop60 – {e(t["tagline"])}"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:image" content="{BASE}assets/og-home-{l}.jpg?v=5"/>
<script type="application/ld+json">{jsonld(l, t)}</script>
<script data-goatcounter="https://jtaczala-games.goatcounter.com/count" async src="{rel}count.js"></script>
<script defer src="{rel}assets/contact.js?v=2"></script>
<script defer src="{rel}assets/filter.js?v=1"></script>
</head>
<body>
{art.defs_svg()}
<a class="skip" href="#spill">↓</a>
{header(l, t, rel)}
<main>
<section class="hero"><div class="wrap">
{hero_art(t, rel)}
<div class="in"><div>
<h1>{e(t["h1"])}</h1>
<p class="lead">{e(t["lead"])}</p>
</div><ul class="trust">{trust}</ul></div>
</div></section>
<section class="s" id="spill"><div class="wrap">
<p class="k">{e(t["k_games"])} · {e(t["count"].format(n=len(GAMES)))}</p>
<h2>{e(t["h_games"])}</h2>
<div class="filters" role="group" aria-label="{e(t["filt"])}" hidden>{filt}</div>
<ul class="cards">{cards}</ul>
</div></section>
<section class="s about" id="om"><div class="wrap">
<p class="k">{e(t["k_about"])}</p>
<h2>{e(t["h_about"])}</h2>
<div class="cols">{about}</div>
<p class="note">{e(t["hms"])}</p>
</div></section>
</main>
{footer(t)}
</body>
</html>
'''

NF = {"no": ("Fant ikke siden", "Siden finnes ikke (lenger). Kanskje du leter etter et av spillene?", "Til forsiden"),
      "en": ("Page not found", "This page doesn’t exist (any more). Maybe you’re looking for one of the games?", "Go to the home page"),
      "pl": ("Nie znaleziono strony", "Ta strona nie istnieje (już). Może szukasz którejś z gier?", "Na stronę główną")}

def page404():
    t = dict(T["no"], _l="no")
    blocks = "".join(f'<div class="box" lang="{HREFLANG[l]}"><h3>{FLAG[l]} {e(NF[l][0])}</h3><p>{e(NF[l][1])}</p><p class="play"><a class="p" href="/{PATH[l]}">{e(NF[l][2])} →</a></p></div>' for l in LANGS)
    links = "".join(f'<li><a href="{g["url"]["no"]}">{e(g["name"]["no"])}</a></li>' for g in GAMES)
    return f'''<!DOCTYPE html>
<!-- Copyright (c) 2026 Stop60. Generated by src/build.py. Absolute paths: served for any missing URL. -->
<html lang="nb">
<head>
{head_common("no", t, "/", "404 – Stop60", NF["no"][1], canonical=False)}<script data-goatcounter="https://jtaczala-games.goatcounter.com/count" async src="/count.js"></script>
</head>
<body>
{header("no", t, "/")}
<main><section class="s nf"><div class="wrap">
<p class="k">404</p><h1 class="nfh">{e(NF["no"][0])} · {e(NF["en"][0])} · {e(NF["pl"][0])}</h1>
<div class="cols">{blocks}</div>
<ul class="nfl">{links}</ul>
</div></section></main>
{footer(t)}
<script defer src="/assets/contact.js?v=2"></script>
</body>
</html>
'''

def sitemap():
    def alts(paths): return "".join(f'<xhtml:link rel="alternate" hreflang="{h}" href="{BASE}{p}"/>' for h, p in paths)
    home = [(HREFLANG[x], PATH[x]) for x in LANGS] + [("x-default", "")]
    hef = [("nb", "hefau/"), ("pl", "hefau/pl/"), ("en", "hefau/en/"), ("x-default", "hefau/")]
    lk = [("nb", "logikk/"), ("pl", "logikk/pl/"), ("en", "logikk/en/"), ("x-default", "logikk/")]
    sk = [("nb", "ufobang/"), ("pl", "ufobang/pl/"), ("en", "ufobang/en/"), ("x-default", "ufobang/")]
    urls = [(PATH[x], home) for x in LANGS] + [(p, hef) for _, p in hef[:3]] + [(p, lk) for _, p in lk[:3]] + [(p, sk) for _, p in sk[:3]]
    urls += [("strom/", []), ("power/", []), ("prad/", []), ("robaki/", [])]
    body = "".join(f"<url><loc>{BASE}{u}</loc>{alts(a)}</url>\n" for u, a in urls)
    return f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n{body}</urlset>\n'

if __name__ == "__main__":
    for l in LANGS:
        d = os.path.join(OUT, PATH[l]); os.makedirs(d, exist_ok=True)
        open(os.path.join(d, "index.html"), "w").write(page(l))
    open(os.path.join(OUT, "404.html"), "w").write(page404())
    open(os.path.join(OUT, "sitemap.xml"), "w").write(sitemap())
    print("built", OUT)
