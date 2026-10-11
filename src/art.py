"""Stop60 vector art in the games' own palettes (inline SVG, no external fonts needed except page fonts).
Palettes taken from the live games' CSS:
 Hefau  : gold #f2c14e/#ffe39a/#b8862b, turquoise #3fe0d0, lapis #1d47b8, temple dark #0a0805/#120e07, papyrus #e8d3a0
 STRØM  : electric teal #2dd4bf, concrete #1c1917, safety yellow #f5c542, rose #e11d48, cream #f5f1e8
 Robaki : ink #1c1518, wine #351b20, venom #8cff3a, eye red #ff1a1a, gold #ffc94a, pink #ed354b
 Logikk : bg #12110f, teal #2dd4bf, teal2 #99f6e4, red #e11d2a, ink #f5f1e8
 Angielski elektryk: navy #07111c/#0c1a2b/#0c2340, spark #5ad4ff, gold #f0d48a, red #c8102e, ink #e7eef6
© 2026 Stop60"""
import math, random

ACCENT = {"hefau": "#f2c14e", "strom": "#f5c542", "robaki": "#8cff3a", "logikk": "#2dd4bf", "angielski": "#5ad4ff"}

def f(v): return f"{v:.1f}".rstrip("0").rstrip(".")

def spiral(cx, cy, r0, r1, turns, start=0.0, n=220):
    pts = []
    for i in range(n + 1):
        t = i / n; th = start + t * turns * 2 * math.pi; r = r0 + (r1 - r0) * t
        pts.append((cx + r * math.cos(th), cy + r * math.sin(th)))
    return pts

def poly(pts): return "M" + " L".join(f"{f(x)},{f(y)}" for x, y in pts)

def bolt(x, y, length, ang, seed, seg=7, jag=16):
    rnd = random.Random(seed); pts = [(x, y)]
    dx, dy = math.cos(ang), math.sin(ang); px, py = -dy, dx
    for i in range(1, seg + 1):
        t = i / seg * length; o = 0 if i == seg else rnd.uniform(-jag, jag)
        pts.append((x + dx * t + px * o, y + dy * t + py * o))
    return poly(pts)

def eye_of_horus(x, y, s, col, w=4):
    return (f'<g transform="translate({f(x)},{f(y)}) scale({s})" fill="none" stroke="{col}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round">'
            '<path d="M4,8 Q50,-6 96,8"/><path d="M8,28 Q50,4 92,28 Q50,44 8,28Z"/>'
            f'<circle cx="50" cy="26" r="9" fill="{col}"/><path d="M42,40 L36,66"/><path d="M58,40 Q62,56 74,58 Q86,58 86,49 Q86,42 78,43"/></g>')

def bug(x, y, s, rot, eye="#ff1a1a", body="#0b0709", rim="#4a2a30"):
    legs = "".join(f'<path d="M{a},{b} Q{c},{d} {e_},{g}"/>' for a, b, c, d, e_, g in
                   [(-6, -4, -22, -14, -30, -6), (-6, 2, -26, 2, -34, 10), (-5, 8, -20, 18, -24, 28),
                    (6, -4, 22, -14, 30, -6), (6, 2, 26, 2, 34, 10), (5, 8, 20, 18, 24, 28)])
    return (f'<g transform="translate({f(x)},{f(y)}) rotate({rot}) scale({s})">'
            f'<g stroke="{body}" stroke-width="3" fill="none" stroke-linecap="round">{legs}</g>'
            f'<ellipse cx="0" cy="12" rx="12" ry="16" fill="{body}" stroke="{rim}" stroke-width="1.5"/>'
            f'<ellipse cx="0" cy="-6" rx="8" ry="7" fill="{body}" stroke="{rim}" stroke-width="1.5"/>'
            f'<circle cx="0" cy="-16" r="6" fill="{body}"/>'
            f'<circle cx="-3" cy="-18" r="2.4" fill="{eye}" filter="url(#glowR)"/><circle cx="3" cy="-18" r="2.4" fill="{eye}" filter="url(#glowR)"/></g>')


SUDOKU_P = "530070000600195000098000060800060003400803001700020006060000280000419005000080079"
SUDOKU_S = "534678912672195348198342567859761423426853791713924856961537284287419635345286179"

def defs():
    return ('<defs>'
            '<filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter><filter id="glowC" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
            '<filter id="glowR" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
            '<linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe39a"/><stop offset=".5" stop-color="#f2c14e"/><stop offset="1" stop-color="#b8862b"/></linearGradient>'
            '<pattern id="hz" width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="14" height="28" fill="#f5c542"/><rect x="14" width="14" height="28" fill="#1c1917"/></pattern>'
            '</defs>')

def svg(vb, body, cls="", label=""):
    a = f' role="img" aria-label="{label}"' if label else ' aria-hidden="true" focusable="false"'
    return f'<svg class="{cls}" xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" preserveAspectRatio="xMidYMid slice"{a}>{body}</svg>'

# ---------------- card art (800x420) ----------------



def grid_svg(x, y, size, rot=0, lines="#f5f1e8", cell="#1c1a17", hl=(20, 21, 22, 31, 40, 49), red=30, digits=True):
    c = size / 9; out = [f'<g transform="translate({f(x)},{f(y)}) rotate({rot})"><rect width="{f(size)}" height="{f(size)}" rx="8" fill="{cell}"/>']
    for i in range(81):
        r, k = divmod(i, 9); cx, cy = k * c, r * c
        if i in hl: out.append(f'<rect x="{f(cx)}" y="{f(cy)}" width="{f(c)}" height="{f(c)}" fill="#2dd4bf" opacity=".25"/>')
        if i == red: out.append(f'<rect x="{f(cx)}" y="{f(cy)}" width="{f(c)}" height="{f(c)}" fill="#e11d2a"/>')
        d = SUDOKU_P[i] if SUDOKU_P[i] != "0" else (SUDOKU_S[i] if i in hl or i == red else "")
        if d and digits:
            col = "#fff" if i == red else ("#2dd4bf" if i in hl else lines)
            out.append(f'<text x="{f(cx + c/2)}" y="{f(cy + c*0.72)}" font-size="{f(c*0.62)}" text-anchor="middle" fill="{col}">{d}</text>')
    for j in range(10):
        w = 4 if j % 3 == 0 else 1; o = ".95" if j % 3 == 0 else ".22"
        out.append(f'<path d="M{f(j*c)},0 V{f(size)} M0,{f(j*c)} H{f(size)}" stroke="{lines}" stroke-width="{w}" opacity="{o}"/>')
    out.append('</g>')
    return f'<g font-family="Oswald,sans-serif" font-weight="600">{"".join(out)}</g>'

def card_logikk(uid):
    return ('<rect width="800" height="420" fill="#12110f"/>'
            f'<radialGradient id="lg{uid}" cx=".7" cy=".45" r=".6"><stop offset="0" stop-color="#0f2e2a"/><stop offset="1" stop-color="#12110f"/></radialGradient><rect width="800" height="420" fill="url(#lg{uid})"/>'
            + grid_svg(415, 40, 340, -5) +
            '<g font-family="Oswald,sans-serif" font-weight="600"><text x="60" y="230" font-size="170" fill="#f5f1e8">1<tspan fill="#e11d2a">–</tspan>9</text></g>'
            '<g fill="#99f6e4" opacity=".8">' + "".join(f'<rect x="{60 + i*34}" y="280" width="24" height="24" rx="5" opacity="{.3 + .08*i}"/>' for i in range(9)) + '</g>')




# ---------------- hero (1200x440, logo overlaid in HTML at the centre) ----------------


def defs_svg(): return '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">' + defs() + "</svg>"


# ---------- v2 (2026-10-11): each game's own main character ----------
# Hefau: the game's golden cobra emblem (rendered from the game's own drawing code, window.__cobra) -> assets/games/hefau-cobra.webp
# STRØM/POWER/PRĄD: the player "człowieczek" (drawn in-game with Phaser graphics: yellow helmet, orange vest with the game name),
#   redrawn here as a clean vector from the game's look
# Sneaky Bugs: the game's own bug.png and truck.png sprites -> assets/games/robaki-*.webp
# Angielski elektryk: the app's own icon (icons/icon-512.png) -> assets/games/angielski-icon.webp (no character in the app)

def img(rel, name, x, y, w, h, extra=""):
    return f'<image href="{rel}assets/games/{name}" x="{f(x)}" y="{f(y)}" width="{f(w)}" height="{f(h)}" preserveAspectRatio="xMidYMid meet"{extra}/>'

def worker(x, y, s, label="STRØM"):
    """The STRØM player figure; (x, y) = feet centre, ~150 units tall at s=1."""
    fs = 15 if len(label) <= 5 else 13
    return (f'<g transform="translate({f(x)},{f(y)}) scale({s})">'
            '<ellipse cx="0" cy="-2" rx="30" ry="8" fill="#000" opacity=".3"/>'
            '<rect x="-16" y="-48" width="13" height="42" rx="5" fill="#1e3a5f"/><rect x="3" y="-48" width="13" height="42" rx="5" fill="#1e3a5f"/>'
            '<ellipse cx="-10" cy="-6" rx="10" ry="6" fill="#3f2a1a"/><ellipse cx="10" cy="-6" rx="10" ry="6" fill="#3f2a1a"/>'
            '<rect x="-44" y="-100" width="14" height="40" rx="7" fill="#f5c542"/><rect x="30" y="-100" width="14" height="40" rx="7" fill="#f5c542"/>'
            '<circle cx="-37" cy="-58" r="7" fill="#f3c9a0"/><circle cx="37" cy="-58" r="7" fill="#f3c9a0"/>'
            '<rect x="-49" y="-66" width="10" height="20" rx="2" fill="#1c1917"/><rect x="-47" y="-72" width="6" height="8" rx="1" fill="#2dd4bf"/>'
            '<rect x="30" y="-96" width="22" height="34" rx="6" fill="#f5c542" stroke="#d9a520" stroke-width="2"/>'
            '<path d="M-32,-104 H32 Q36,-104 36,-98 V-50 H-36 V-98 Q-36,-104 -32,-104Z" fill="#f28c28"/>'
            '<rect x="-36" y="-62" width="72" height="5" fill="#fde68a"/>'
            '<rect x="-26" y="-96" width="52" height="22" rx="3" fill="#f5f1e8"/>'
            f'<text x="0" y="-79" text-anchor="middle" font-family="Oswald,sans-serif" font-weight="600" font-size="{fs}" fill="#1c1917">{label}</text>'
            '<circle cx="0" cy="-124" r="21" fill="#f3c9a0"/>'
            '<circle cx="-7" cy="-124" r="2.4" fill="#1c1917"/><circle cx="7" cy="-124" r="2.4" fill="#1c1917"/>'
            '<path d="M-8,-115 Q0,-108 8,-115" stroke="#7a3b1e" stroke-width="2.5" fill="none" stroke-linecap="round"/>'
            '<path d="M-25,-130 Q-25,-154 0,-155 Q25,-154 25,-130Z" fill="#f5c542"/>'
            '<rect x="-30" y="-133" width="60" height="7" rx="3.5" fill="#f5c542"/><path d="M-4,-154 H4 V-134 H-4Z" fill="#d9a520"/>'
            '<circle cx="0" cy="-141" r="4" fill="#1c1917"/></g>')

def cone(x, y, s):
    return (f'<g transform="translate({f(x)},{f(y)}) scale({s})"><path d="M-8,-60 H8 L22,0 H-22Z" fill="#f97316"/>'
            '<path d="M-11.5,-45 H11.5 L14.5,-32 H-14.5Z M-17,-22 H17 L19.5,-11 H-19.5Z" fill="#fff"/><rect x="-30" y="-4" width="60" height="8" rx="3" fill="#ea580c"/></g>')

def worker_img(rel, x, y, w, h, label):
    """Rendered STRØM worker (hero-worker.webp, render 414x1051) with the per-language word on the blank label plate."""
    sx, sy = w / 414, h / 1051
    px0, px1, py0, py1 = x + 184*sx, x + 366*sx, y + 405*sy, y + 516*sy
    fs = (py1 - py0) * (.55 if len(label) <= 5 else .5)
    return (f'<ellipse cx="{f(x+w*.5)}" cy="{f(y+h-6)}" rx="{f(w*.5)}" ry="{f(h*.03)}" fill="#000" opacity=".45" filter="url(#soft)"/>' + img(rel, "hero-worker.webp", x, y, w, h) +
            f'<text x="{f((px0+px1)/2)}" y="{f((py0+py1)/2 + fs*.36)}" text-anchor="middle" font-family="Oswald,sans-serif" font-weight="600" font-size="{f(fs)}" fill="#1c1917">{label}</text>')

def card_hefau(uid, rel, label):
    pts = spiral(560, 210, 30, 190, 2.2, start=1.0)
    return (f'<rect width="800" height="420" fill="#0a0805"/>'
            '<radialGradient id="maskGlowC"><stop offset="0" stop-color="#f2c14e" stop-opacity=".35"/><stop offset="1" stop-color="#f2c14e" stop-opacity="0"/></radialGradient>'
            f'<radialGradient id="hg{uid}" cx=".55" cy=".5" r=".6"><stop offset="0" stop-color="#3a2a0e"/><stop offset="1" stop-color="#0a0805"/></radialGradient><rect width="800" height="420" fill="url(#hg{uid})"/>'
            '<g opacity=".16" stroke="#d9bf86" stroke-width="1.5">' + "".join(f'<path d="M0,{y} H800"/>' for y in range(60, 420, 60)) +
            "".join(f'<path d="M{x + (60 if (y//60)%2 else 0)},{y} v60"/>' for y in range(0, 420, 60) for x in range(0, 800, 120)) + '</g>'
            f'<path d="{poly(pts)}" fill="none" stroke="#5c430f" stroke-width="26" stroke-linecap="round" opacity=".8"/>'
            f'<path d="{poly(pts)}" fill="none" stroke="url(#gold)" stroke-width="18" stroke-linecap="round" stroke-dasharray="16 4" opacity=".75"/>'
            '<circle cx="560" cy="210" r="175" fill="#0a0805" opacity=".45"/>'
            + '<ellipse cx="560" cy="210" rx="150" ry="170" fill="url(#maskGlowC)"/>' + img(rel, "hero-pharaoh.webp", 431, 18, 258, 380) +
            eye_of_horus(60, 70, 1.9, "#f2c14e", 3.5) +
            ''.join(f'<circle cx="{x}" cy="300" r="20" fill="url(#gold)" stroke="#0a0805" stroke-width="3"/><circle cx="{x}" cy="300" r="8" fill="#3fe0d0"/>' for x in (80, 140, 200)) +
            '<path d="M50,350 H250" stroke="#3fe0d0" stroke-width="3" opacity=".7"/>')

def card_strom(uid, rel, label):
    bolt1 = bolt(560, 216, 230, -0.35, 3, 8, 14); bolt2 = bolt(560, 216, 180, 0.15, 8, 7, 12)
    return ('<rect width="800" height="420" fill="#2a2119"/>'
            f'<radialGradient id="sg{uid}" cx=".55" cy=".55" r=".6"><stop offset="0" stop-color="#5a4632"/><stop offset="1" stop-color="#1c1917"/></radialGradient><rect width="800" height="420" fill="url(#sg{uid})"/>'
            '<g stroke="#000" stroke-opacity=".14" stroke-width="10" fill="none"><path d="M0,120 Q200,90 400,130 T800,110"/><path d="M0,300 Q220,270 420,310 T800,290"/></g>'
            + cone(150, 360, 1.5) + cone(700, 120, 1.0) + cone(240, 150, 0.9) +
            f'<g filter="url(#glowC)" stroke-linejoin="round" fill="none"><path d="{bolt1}" stroke="#2dd4bf" stroke-width="5"/><path d="{bolt2}" stroke="#99f6e4" stroke-width="3"/></g>'
            '<circle cx="770" cy="150" r="10" fill="#5eead4" opacity=".8" filter="url(#glowC)"/>'
            + worker_img(rel, 432, 34, 142, 361, label) +
            '<rect y="392" width="800" height="28" fill="url(#hz)"/>'
            '<g font-family="Oswald,sans-serif" font-weight="600"><text x="40" y="96" font-size="74" fill="#f5f1e8" opacity=".95">0:60</text></g>')

def card_robaki(uid, rel, label):
    rnd = random.Random(4)
    splats = "".join(f'<circle cx="{rnd.randint(330,780)}" cy="{rnd.randint(30,400)}" r="{rnd.choice([4,6,8])}" fill="#8cff3a" opacity=".85" filter="url(#glowR)"/>' for _ in range(10))
    bugs = "".join(f'<g transform="translate({x},{y}) rotate({r})">' + img(rel, "robaki-bug.webp", -w/2, -w*164/176/2, w, w*164/176) + '</g>'
                   for x, y, w, r in [(560, 130, 130, 20), (680, 280, 160, -35), (450, 300, 100, 160), (730, 100, 90, 70), (370, 170, 80, -80)])
    return ('<rect width="800" height="420" fill="#1c1518"/>'
            f'<radialGradient id="rg{uid}" cx=".6" cy=".5" r=".6"><stop offset="0" stop-color="#351b20"/><stop offset="1" stop-color="#1c1518"/></radialGradient><rect width="800" height="420" fill="url(#rg{uid})"/>'
            '<path d="M0,210 H800" stroke="#f5f5f5" stroke-width="6" stroke-dasharray="40 30" opacity=".3"/>'
            '<path d="M0,40 H800 M0,380 H800" stroke="#ffc94a" stroke-width="3" opacity=".35"/>'
            f'<linearGradient id="beam{uid}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffc94a" stop-opacity=".5"/><stop offset="1" stop-color="#ffc94a" stop-opacity="0"/></linearGradient>'
            f'<path d="M300,170 L620,70 L620,330 L300,230Z" fill="url(#beam{uid})"/>'
            + img(rel, "robaki-truck.webp", -10, 172, 320, 75) + splats + bugs)

def card_angielski(uid, rel, label):
    return ('<rect width="800" height="420" fill="#07111c"/>'
            f'<linearGradient id="ag{uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0c2340"/><stop offset="1" stop-color="#07111c"/></linearGradient><rect width="800" height="420" fill="url(#ag{uid})"/>'
            + img(rel, "angielski-icon.webp", 520, 70, 280, 280, ' opacity=".95"') +
            '<g font-family="IBM Plex Sans,sans-serif" font-weight="600" font-size="30">'
            '<rect x="40" y="70" width="400" height="62" rx="26" fill="#f7f3ea"/><text x="66" y="111" fill="#122033">Where’s the fuse board?</text>'
            '<rect x="150" y="170" width="250" height="62" rx="26" fill="#5ad4ff"/><text x="178" y="211" fill="#07111c">Cheers, mate!</text>'
            '<rect x="50" y="270" width="290" height="62" rx="26" fill="#f7f3ea"/><text x="78" y="311" fill="#122033">Isolate it first.</text></g>')

CARDS = {"hefau": card_hefau, "strom": card_strom, "robaki": card_robaki, "logikk": lambda uid, rel, label: card_logikk(uid), "angielski": card_angielski}

def card_svg(gid, rel="", label="STRØM"):
    return svg("0 0 800 420", CARDS[gid](gid, rel, label), "art")

def hero_body(rel="", label="STRØM"):
    """Hero banner (1200x440, sliced). v3 2026-10-11: rendered characters (original pharaoh mask with uraeus = Hefau,
    semi-3D STRØM worker, glossy bug = Sneaky Bugs) arranged symmetrically around the logo; .hl/.hr groups are pushed
    outwards on wide screens by home.css so phones (narrow crop) and desktop both look balanced."""
    rnd = random.Random(9)
    stars = "".join(f'<circle cx="{rnd.randint(0,1200)}" cy="{rnd.randint(0,440)}" r="{rnd.choice([1,1,1.5,2])}" fill="{rnd.choice(["#f2c14e","#2dd4bf","#8cff3a","#5ad4ff","#f5f1e8"])}" opacity="{rnd.uniform(.2,.6):.2f}"/>' for _ in range(80))
    arc = spiral(600, 220, 150, 205, 0.42, start=math.radians(150), n=60)
    scales = (f'<path d="{poly(arc)}" fill="none" stroke="#3d2c0a" stroke-width="34" stroke-linecap="round" opacity=".7" transform="translate(3,5)"/>'
              f'<path d="{poly(arc)}" fill="none" stroke="#5c430f" stroke-width="30" stroke-linecap="round"/>'
              f'<path d="{poly(arc)}" fill="none" stroke="url(#gold)" stroke-width="22" stroke-linecap="round" stroke-dasharray="16 4"/>'
              f'<path d="{poly(arc)}" fill="none" stroke="#fff6d6" stroke-width="3" stroke-linecap="round" opacity=".45" transform="translate(-3,-4)"/>')
    gems = "".join(f'<circle cx="{f(x)}" cy="{f(y)}" r="7" fill="url(#gem)" stroke="#0a0805" stroke-width="2"/>' for x, y in arc[6::9])
    L = lambda body: f'<g class="hl">{body}</g>'
    R = lambda body: f'<g class="hr">{body}</g>'
    # STRØM worker: image 244x620 shown at 116x295; blank label plate at x 184-366 / y 405-516 of the 414x1051 render
    wx, wy, ww, wh = 768, 36, 114, 290
    sx = ww / 414; sy = wh / 1051
    px0, px1, py0, py1 = wx + 184*sx, wx + 366*sx, wy + 405*sy, wy + 516*sy
    fs = 15 if len(label) <= 5 else 14
    worker = (f'<ellipse cx="{f(wx+ww*.5)}" cy="{f(wy+wh-6)}" rx="58" ry="10" fill="#000" opacity=".45" filter="url(#soft)"/>'
              + img(rel, "hero-worker.webp", wx, wy, ww, wh) +
              f'<text x="{f((px0+px1)/2)}" y="{f((py0+py1)/2 + fs*.36)}" text-anchor="middle" font-family="Oswald,sans-serif" font-weight="600" font-size="{fs}" letter-spacing=".5" fill="#1c1917">{label}</text>')
    sparks = ('<g fill="none" stroke-linecap="round" stroke-linejoin="round" filter="url(#glowC)">'
              f'<path d="M{wx+ww-8},{wy+128} C{wx+150},{wy+110} {wx+170},{wy+170} {wx+210},{wy+150} S{wx+250},{wy+120} {wx+300},{wy+132}" stroke="#2dd4bf" stroke-width="3.5"/>'
              f'<path d="{bolt(wx+ww-6, wy+140, 120, 0.35, 5, 7, 11)}" stroke="#99f6e4" stroke-width="2.2"/>'
              f'<path d="{bolt(wx+12, wy+150, 70, 3.4, 11, 6, 9)}" stroke="#5eead4" stroke-width="2"/></g>'
              f'<circle cx="{wx+ww-4}" cy="{wy+134}" r="5" fill="#ccfbf1" filter="url(#glowC)"/>')
    bx, by, bw = 786, 316, 120; bh = bw * 218 / 260
    bug = ('<radialGradient id="bugGlow"><stop offset="0" stop-color="#ff2a3a" stop-opacity=".5"/><stop offset=".5" stop-color="#ff2a3a" stop-opacity=".14"/><stop offset="1" stop-color="#ff2a3a" stop-opacity="0"/></radialGradient>'
           f'<ellipse cx="{f(bx+bw*.55)}" cy="{f(by+bh*.6)}" rx="78" ry="50" fill="url(#bugGlow)"/>'
           f'<ellipse cx="{f(bx+bw*.55)}" cy="{f(by+bh*.8)}" rx="50" ry="9" fill="#000" opacity=".5" filter="url(#soft)"/>'
           + img(rel, "hero-bug.webp", bx, by, bw, bh))
    mask = ('<radialGradient id="maskGlow"><stop offset="0" stop-color="#f2c14e" stop-opacity=".35"/><stop offset="1" stop-color="#f2c14e" stop-opacity="0"/></radialGradient>'
            '<ellipse cx="364" cy="142" rx="120" ry="132" fill="url(#maskGlow)"/>'
            + img(rel, "hero-pharaoh.webp", 293, 36, 142, 210))
    return (            '<radialGradient id="gem" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#d9fffb"/><stop offset=".35" stop-color="#3fe0d0"/><stop offset="1" stop-color="#0b6f68"/></radialGradient>'
            '<radialGradient id="hgA" cx=".28" cy=".3" r=".42"><stop offset="0" stop-color="#f2c14e" stop-opacity=".2"/><stop offset="1" stop-color="#f2c14e" stop-opacity="0"/></radialGradient>'
            '<radialGradient id="hgB" cx=".72" cy=".3" r=".42"><stop offset="0" stop-color="#2dd4bf" stop-opacity=".22"/><stop offset="1" stop-color="#2dd4bf" stop-opacity="0"/></radialGradient>'
            '<radialGradient id="hgC" cx=".74" cy=".9" r=".35"><stop offset="0" stop-color="#e11d2a" stop-opacity=".14"/><stop offset="1" stop-color="#e11d2a" stop-opacity="0"/></radialGradient>'
            '<radialGradient id="hgD" cx=".5" cy=".5" r=".3"><stop offset="0" stop-color="#e11d2a" stop-opacity=".3"/><stop offset="1" stop-color="#e11d2a" stop-opacity="0"/></radialGradient>'
            '<rect width="1200" height="440" fill="#12110f"/><rect width="1200" height="440" fill="url(#hgA)"/><rect width="1200" height="440" fill="url(#hgB)"/><rect width="1200" height="440" fill="url(#hgC)"/><rect width="1200" height="440" fill="url(#hgD)"/>'
            + stars +
            '<circle cx="600" cy="220" r="175" fill="none" stroke="#f5f1e8" stroke-opacity=".08" stroke-width="2"/><circle cx="600" cy="220" r="232" fill="none" stroke="#f5f1e8" stroke-opacity=".05" stroke-width="2" stroke-dasharray="4 10"/>'
            + scales + gems +
            L('<g class="mot">' + mask + '</g>' +
              '<g class="mot">' + grid_svg(310, 286, 108, -8, hl=(20, 21, 22, 31, 40, 49)) + '</g>') +
            R(sparks + '<g class="mot">' + worker + '</g>' + '<g class="mot">' + bug + '</g>'))

def hero_svg(rel="", label="STRØM"): return svg("0 0 1200 440", hero_body(rel, label), "hart")
