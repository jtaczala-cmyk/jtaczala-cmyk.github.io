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

def hardhat(x, y, s, col="#f5c542"):
    return (f'<g transform="translate({f(x)},{f(y)}) scale({s})"><path d="M-40,0 A40,38 0 0 1 40,0Z" fill="{col}"/>'
            f'<rect x="-54" y="-2" width="108" height="10" rx="5" fill="{col}"/><path d="M-12,-36 Q0,-40 12,-36 L10,-4 L-10,-4Z" fill="#000" opacity=".14"/></g>')

SUDOKU_P = "530070000600195000098000060800060003400803001700020006060000280000419005000080079"
SUDOKU_S = "534678912672195348198342567859761423426853791713924856961537284287419635345286179"

def defs():
    return ('<defs>'
            '<filter id="glowC" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
            '<filter id="glowR" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
            '<linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe39a"/><stop offset=".5" stop-color="#f2c14e"/><stop offset="1" stop-color="#b8862b"/></linearGradient>'
            '<pattern id="hz" width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="14" height="28" fill="#f5c542"/><rect x="14" width="14" height="28" fill="#1c1917"/></pattern>'
            '</defs>')

def svg(vb, body, cls="", label=""):
    a = f' role="img" aria-label="{label}"' if label else ' aria-hidden="true" focusable="false"'
    return f'<svg class="{cls}" xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" preserveAspectRatio="xMidYMid slice"{a}>{body}</svg>'

# ---------------- card art (800x420) ----------------
def card_hefau(uid):
    pts = spiral(560, 210, 22, 170, 2.6, start=1.2)
    gems = "".join(f'<circle cx="{f(x)}" cy="{f(y)}" r="{7 if i%3 else 9}" fill="{"#3fe0d0" if i%3 else "#ff4d6a"}" stroke="#0a0805" stroke-width="2"/>'
                   for i, (x, y) in enumerate(pts[25::14]))
    head = pts[-1]
    return (f'<rect width="800" height="420" fill="#0a0805"/>'
            f'<radialGradient id="hg{uid}" cx=".7" cy=".5" r=".6"><stop offset="0" stop-color="#3a2a0e"/><stop offset="1" stop-color="#0a0805"/></radialGradient><rect width="800" height="420" fill="url(#hg{uid})"/>'
            '<g opacity=".18" stroke="#d9bf86" stroke-width="1.5">' + "".join(f'<path d="M0,{y} H800"/>' for y in range(60, 420, 60)) +
            "".join(f'<path d="M{x + (60 if (y//60)%2 else 0)},{y} v60"/>' for y in range(0, 420, 60) for x in range(0, 800, 120)) + '</g>'
            f'<path d="{poly(pts)}" fill="none" stroke="#5c430f" stroke-width="40" stroke-linecap="round"/>'
            f'<path d="{poly(pts)}" fill="none" stroke="url(#gold)" stroke-width="30" stroke-linecap="round" stroke-dasharray="20 4"/>'
            f'{gems}<g transform="translate({f(head[0])},{f(head[1])})"><path d="M0,-34 C26,-30 34,-6 22,18 L8,30 H-8 L-22,18 C-34,-6 -26,-30 0,-34Z" fill="url(#gold)" stroke="#5c430f" stroke-width="4"/>'
            f'<path d="M0,-22 V20" stroke="#3fe0d0" stroke-width="5"/><circle cx="-10" cy="-8" r="4" fill="#ff4d6a"/><circle cx="10" cy="-8" r="4" fill="#ff4d6a"/></g>'
            + eye_of_horus(70, 90, 2.1, "#f2c14e", 3.5) +
            ''.join(f'<circle cx="{x}" cy="300" r="20" fill="url(#gold)" stroke="#0a0805" stroke-width="3"/><circle cx="{x}" cy="300" r="8" fill="#1d47b8"/>' for x in (90, 150, 210)) +
            '<path d="M60,350 H260" stroke="#3fe0d0" stroke-width="3" opacity=".7"/>')

def card_strom(uid):
    bolts = "".join(f'<path d="{bolt(x, 0, 420, math.pi/2 + a, s, 9, 22)}" stroke="#2dd4bf" stroke-width="{w}" fill="none" filter="url(#glowC)" stroke-linejoin="round"/>'
                    for x, a, s, w in [(520, .12, 3, 5), (600, -.05, 7, 3.5), (690, .2, 11, 2.5)])
    return ('<rect width="800" height="420" fill="#1c1917"/>'
            f'<radialGradient id="sg{uid}" cx=".72" cy=".55" r=".55"><stop offset="0" stop-color="#134e48"/><stop offset="1" stop-color="#1c1917" stop-opacity="0"/></radialGradient><rect width="800" height="420" fill="url(#sg{uid})"/>'
            '<g stroke="#3a3530" stroke-width="6">' + "".join(f'<path d="M{x},40 V360"/>' for x in (40, 200, 360)) + "".join(f'<path d="M30,{y} H370"/>' for y in (60, 170, 280)) + '</g>'
            '<g stroke="#57524b" stroke-width="2">' + "".join(f'<path d="M{x},60 L{x+160},170 M{x+160},170 L{x},280"/>' for x in (40, 200)) + '</g>'
            + bolts + hardhat(250, 250, 1.7) +
            '<rect y="372" width="800" height="48" fill="url(#hz)"/>'
            '<g font-family="Oswald,sans-serif" font-weight="600"><text x="560" y="150" font-size="120" fill="#f5f1e8" opacity=".95">60</text><text x="690" y="150" font-size="44" fill="#2dd4bf">s</text></g>'
            '<circle cx="580" cy="300" r="5" fill="#e11d48"/><circle cx="600" cy="300" r="5" fill="#f5c542"/><circle cx="620" cy="300" r="5" fill="#2dd4bf"/>')

def card_robaki(uid):
    rnd = random.Random(4)
    splats = "".join(f'<circle cx="{rnd.randint(330,780)}" cy="{rnd.randint(30,400)}" r="{rnd.choice([4,6,9])}" fill="#8cff3a" opacity=".85" filter="url(#glowR)"/>' for _ in range(12))
    bugs = "".join(bug(x, y, s, r) for x, y, s, r in [(520, 120, 2.0, 20), (640, 250, 2.4, -30), (470, 300, 1.7, 160), (720, 110, 1.5, 70), (380, 180, 1.4, -80)])
    return ('<rect width="800" height="420" fill="#1c1518"/>'
            f'<radialGradient id="rg{uid}" cx=".6" cy=".5" r=".6"><stop offset="0" stop-color="#351b20"/><stop offset="1" stop-color="#1c1518"/></radialGradient><rect width="800" height="420" fill="url(#rg{uid})"/>'
            '<path d="M0,210 H800" stroke="#f5f5f5" stroke-width="6" stroke-dasharray="40 30" opacity=".35"/>'
            '<path d="M0,40 H800 M0,380 H800" stroke="#ffc94a" stroke-width="3" opacity=".35"/>'
            f'<linearGradient id="beam{uid}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffc94a" stop-opacity=".55"/><stop offset="1" stop-color="#ffc94a" stop-opacity="0"/></linearGradient>'
            f'<path d="M190,180 L560,60 L560,330 L190,240Z" fill="url(#beam{uid})"/>'
            '<g transform="translate(40,150)"><rect width="150" height="120" rx="10" fill="#c62d31"/><rect x="110" y="10" width="34" height="100" rx="6" fill="#ed354b"/>'
            '<rect x="-10" y="18" width="12" height="24" rx="3" fill="#111"/><rect x="-10" y="78" width="12" height="24" rx="3" fill="#111"/>'
            '<circle cx="150" cy="30" r="7" fill="#fff6d0" filter="url(#glowR)"/><circle cx="150" cy="90" r="7" fill="#fff6d0" filter="url(#glowR)"/></g>'
            + splats + bugs)

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

def card_angielski(uid):
    return ('<rect width="800" height="420" fill="#07111c"/>'
            f'<linearGradient id="ag{uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0c2340"/><stop offset="1" stop-color="#07111c"/></linearGradient><rect width="800" height="420" fill="url(#ag{uid})"/>'
            '<g opacity=".16"><path d="M520,0 L800,420 M800,0 L520,420" stroke="#e7eef6" stroke-width="60"/><path d="M660,0 V420 M520,210 H800" stroke="#e7eef6" stroke-width="80"/>'
            '<path d="M520,0 L800,420 M800,0 L520,420" stroke="#c8102e" stroke-width="20"/><path d="M660,0 V420 M520,210 H800" stroke="#c8102e" stroke-width="44"/></g>'
            '<circle cx="660" cy="210" r="110" fill="#0c2340" stroke="#f0d48a" stroke-width="10"/>'
            '<path d="M676,128 L620,222 L660,222 L640,296 L708,190 L666,190Z" fill="#f7f3ea"/>'
            '<g font-family="IBM Plex Sans,sans-serif" font-weight="600" font-size="30">'
            '<rect x="40" y="70" width="400" height="62" rx="26" fill="#f7f3ea"/><text x="66" y="111" fill="#122033">Where’s the fuse board?</text>'
            '<rect x="150" y="170" width="250" height="62" rx="26" fill="#5ad4ff"/><text x="178" y="211" fill="#07111c">Cheers, mate!</text>'
            '<rect x="50" y="270" width="290" height="62" rx="26" fill="#f7f3ea"/><text x="78" y="311" fill="#122033">Isolate it first.</text></g>'
            '<circle cx="420" cy="370" r="5" fill="#c8102e"/><circle cx="440" cy="370" r="5" fill="#f7f3ea"/><circle cx="460" cy="370" r="5" fill="#0c2340" stroke="#5ad4ff"/>')

CARDS = {"hefau": card_hefau, "strom": card_strom, "robaki": card_robaki, "logikk": card_logikk, "angielski": card_angielski}

def card_svg(gid):
    return svg("0 0 800 420", CARDS[gid](gid), "art")

# ---------------- hero (1200x440, logo overlaid in HTML at the centre) ----------------
def hero_body():
    rnd = random.Random(9)
    stars = "".join(f'<circle cx="{rnd.randint(0,1200)}" cy="{rnd.randint(0,440)}" r="{rnd.choice([1,1,1.5,2])}" fill="{rnd.choice(["#f2c14e","#2dd4bf","#8cff3a","#5ad4ff","#f5f1e8"])}" opacity="{rnd.uniform(.25,.7):.2f}"/>' for _ in range(70))
    arc = spiral(600, 220, 150, 205, 0.42, start=math.radians(150), n=60)  # cobra-scale arc on the left/top
    scales = f'<path d="{poly(arc)}" fill="none" stroke="#5c430f" stroke-width="30" stroke-linecap="round"/><path d="{poly(arc)}" fill="none" stroke="url(#gold)" stroke-width="22" stroke-linecap="round" stroke-dasharray="16 4"/>'
    gems = "".join(f'<circle cx="{f(x)}" cy="{f(y)}" r="6" fill="#3fe0d0" stroke="#0a0805" stroke-width="2"/>' for x, y in arc[6::9])
    bolts = "".join(f'<path d="{bolt(x, y, l, a, s, 7, 14)}" stroke="#2dd4bf" stroke-width="{w}" fill="none" filter="url(#glowC)" stroke-linejoin="round"/>'
                    for x, y, l, a, s, w in [(770, 60, 170, 1.15, 1, 4), (830, 40, 220, 1.35, 2, 3), (900, 90, 150, 1.6, 5, 2.5)])
    return (
            '<radialGradient id="hgA" cx=".22" cy=".3" r=".45"><stop offset="0" stop-color="#f2c14e" stop-opacity=".22"/><stop offset="1" stop-color="#f2c14e" stop-opacity="0"/></radialGradient>'
            '<radialGradient id="hgB" cx=".78" cy=".25" r=".45"><stop offset="0" stop-color="#2dd4bf" stop-opacity=".22"/><stop offset="1" stop-color="#2dd4bf" stop-opacity="0"/></radialGradient>'
            '<radialGradient id="hgC" cx=".8" cy=".85" r=".4"><stop offset="0" stop-color="#8cff3a" stop-opacity=".14"/><stop offset="1" stop-color="#8cff3a" stop-opacity="0"/></radialGradient>'
            '<radialGradient id="hgD" cx=".5" cy=".5" r=".3"><stop offset="0" stop-color="#e11d2a" stop-opacity=".28"/><stop offset="1" stop-color="#e11d2a" stop-opacity="0"/></radialGradient>'
            '<rect width="1200" height="440" fill="#12110f"/><rect width="1200" height="440" fill="url(#hgA)"/><rect width="1200" height="440" fill="url(#hgB)"/><rect width="1200" height="440" fill="url(#hgC)"/><rect width="1200" height="440" fill="url(#hgD)"/>'
            + stars +
            '<circle cx="600" cy="220" r="175" fill="none" stroke="#f5f1e8" stroke-opacity=".08" stroke-width="2"/><circle cx="600" cy="220" r="225" fill="none" stroke="#f5f1e8" stroke-opacity=".05" stroke-width="2" stroke-dasharray="4 10"/>'
            + scales + gems + eye_of_horus(300, 80, 1.15, "#f2c14e", 3.5) +
            bolts + hardhat(850, 255, .62) +
            grid_svg(300, 292, 116, -8, hl=(20, 21, 22, 31, 40, 49)) +
            bug(790, 360, 1.25, -25) + bug(880, 330, .9, 40) +
            '<g fill="#8cff3a" filter="url(#glowR)"><circle cx="745" cy="388" r="4"/><circle cx="830" cy="395" r="3"/><circle cx="915" cy="372" r="4"/></g>'
            '<g transform="translate(905,140)"><rect width="104" height="50" rx="22" fill="#5ad4ff"/><path d="M18,48 L10,66 L36,48Z" fill="#5ad4ff"/>'
            '<text x="52" y="34" font-family="IBM Plex Sans,sans-serif" font-weight="600" font-size="24" text-anchor="middle" fill="#07111c">Hi!</text></g>'
            '<path d="M1010,140 l-10,22 h10 l-6,18 l18,-26 h-10 l8,-14z" fill="#f0d48a"/>')

def hero_svg(): return svg("0 0 1200 440", hero_body(), "hart")

def defs_svg(): return '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">' + defs() + "</svg>"
