"""Stop60 vector art in the games' own palettes (inline SVG, no external fonts needed except page fonts).
Palettes taken from the live games' CSS:
 Hefau  : gold #f2c14e/#ffe39a/#b8862b, turquoise #3fe0d0, lapis #1d47b8, temple dark #0a0805/#120e07, papyrus #e8d3a0
 STRØM  : electric teal #2dd4bf, concrete #1c1917, safety yellow #f5c542, rose #e11d48, cream #f5f1e8
 Robaki : ink #1c1518, wine #351b20, venom #8cff3a, eye red #ff1a1a, gold #ffc94a, pink #ed354b
 Logikk : bg #12110f, teal #2dd4bf, teal2 #99f6e4, red #e11d2a, ink #f5f1e8
 Angielski elektryk: navy #07111c/#0c1a2b/#0c2340, spark #5ad4ff, gold #f0d48a, red #c8102e, ink #e7eef6
© 2026 Stop60"""
import math, random

ACCENT = {"lavakule": "#fb923c", "redning": "#2dd4bf", "ufobang": "#4ade80", "hefau": "#f2c14e", "strom": "#f5c542", "robaki": "#8cff3a", "logikk": "#2dd4bf", "angielski": "#5ad4ff"}

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
    """Sneaky Bugs: friendly animated card (inline SVG + CSS, no image request). Yellow truck bouncing along the road,
    cheeky black red-eyed bugs sneaking and wiggling, one bug getting squished with a green 'SPLAT!' pop.
    prefers-reduced-motion -> static frame. Only transform/opacity animations."""
    import random as _r
    rnd = _r.Random(5)
    def bg(x, y, s, rot, cls="rbB", d=0):
        legs = "".join(f'<path d="M{a},{b} q{c},{e} {g},{h}"/>' for a, b, c, e, g, h in
                       [(-7, -2, -12, -8, -20, -2), (-8, 5, -14, 0, -22, 8), (-7, 12, -10, 6, -17, 17), (7, -2, 12, -8, 20, -2), (8, 5, 14, 0, 22, 8), (7, 12, 10, 6, 17, 17)])
        return (f'<g transform="translate({x},{y}) rotate({rot}) scale({s})"><g class="{cls}" style="animation-delay:{d}s">'
                f'<g class="rbL" stroke="#111" stroke-width="3" fill="none" stroke-linecap="round" style="animation-delay:{d}s">{legs}</g>'
                '<ellipse cx="0" cy="8" rx="11" ry="14" fill="#16121a" stroke="#4a2a30" stroke-width="1.5"/><path d="M0,-4 V21" stroke="#4a2a30" stroke-width="1.3"/>'
                '<ellipse cx="-4" cy="3" rx="2.5" ry="4" fill="#fff" opacity=".18"/><circle cx="0" cy="-9" r="8" fill="#16121a"/>'
                '<path d="M-3,-16 q-5,-9 -10,-8 M3,-16 q5,-9 10,-8" stroke="#16121a" stroke-width="2" fill="none" stroke-linecap="round"/>'
                '<circle cx="-3.2" cy="-10" r="3" fill="#ff2a2a"/><circle cx="3.2" cy="-10" r="3" fill="#ff2a2a"/><circle cx="-2.4" cy="-11" r="1" fill="#fff"/><circle cx="4" cy="-11" r="1" fill="#fff"/>'
                '<path d="M-3.5,-5 q3.5,3 7,0" stroke="#ff8a8a" stroke-width="1.3" fill="none" stroke-linecap="round"/></g></g>')
    css = ('<style>.rbA .rbB{animation:rbSn 1.6s ease-in-out infinite alternate}.rbA .rbL{animation:rbLg .18s linear infinite alternate;transform-origin:0 6px}'
           '.rbA .rbTr{animation:rbBo .5s ease-in-out infinite alternate}.rbA .rbLn{animation:rbRd .6s linear infinite}.rbA .rbSq{animation:rbSq 2.4s ease-in infinite;transform-origin:530px 330px}'
           '.rbA .rbPp{animation:rbPp 2.4s ease-out infinite;transform-origin:530px 300px}.rbA .rbBm{animation:rbBm 1s ease-in-out infinite alternate}'
           '@keyframes rbSn{0%{transform:translate(-6px,2px) rotate(-6deg)}100%{transform:translate(6px,-2px) rotate(6deg)}}@keyframes rbLg{0%{transform:scaleX(.85)}100%{transform:scaleX(1.12)}}'
           '@keyframes rbBo{0%{transform:translateY(0)}100%{transform:translateY(-4px)}}@keyframes rbRd{0%{transform:translateX(0)}100%{transform:translateX(-70px)}}'
           '@keyframes rbSq{0%,35%{transform:scale(1,1)}45%{transform:scale(1.5,.25)}100%{transform:scale(1.5,.25);opacity:0}}'
           '@keyframes rbPp{0%,38%{transform:scale(0);opacity:0}48%{transform:scale(1.15);opacity:1}75%{transform:scale(1);opacity:1}100%{transform:scale(1);opacity:0}}'
           '@keyframes rbBm{0%{opacity:.55}100%{opacity:.9}}@media (prefers-reduced-motion:reduce){.rbA *{animation:none!important}}</style>')
    truck = ('<g class="rbTr"><rect x="70" y="150" width="270" height="110" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="3"/>'
             '<path d="M78,235 H332" stroke="#f5b400" stroke-width="5"/><g fill="#16121a">' + "".join(f'<path d="M{316+i*0},{156+i*16} l20,-10 v10 l-20,10z" fill="{"#16121a" if i%2 else "#facc15"}"/>' for i in range(6)) + '</g>'
             '<path d="M345,262 V170 Q345,150 368,148 L420,146 Q440,146 452,172 L470,205 Q478,218 478,236 V262 Z" fill="#facc15" stroke="#ca8a04" stroke-width="3"/>'
             '<path d="M380,160 L425,158 Q434,158 442,176 L454,200 H380 Z" fill="#7dd3fc" stroke="#0369a1" stroke-width="2.5"/><path d="M392,166 l18,0" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/>'
             '<rect x="462" y="226" width="22" height="12" rx="3" fill="#fef3c7"/><rect x="338" y="252" width="150" height="14" rx="4" fill="#3f3f46"/>'
             '<path d="M402,214 q9,8 20,0" stroke="#92400e" stroke-width="3" fill="none" stroke-linecap="round"/></g>'
             + "".join(f'<g><circle cx="{x}" cy="270" r="20" fill="#1f1f23"/><circle cx="{x}" cy="270" r="8" fill="#a1a1aa"/></g>' for x in (120, 165, 290, 380, 450)))
    road = ('<rect y="282" width="800" height="138" fill="#2a2228"/><rect y="282" width="800" height="5" fill="#ffc94a" opacity=".7"/>'
            '<g class="rbLn"><path d="M0,350 H880" stroke="#f5f5f5" stroke-width="6" stroke-dasharray="40 30" opacity=".55"/></g>')
    splat = ('<g class="rbPp"><path d="M530,300 ' + " ".join(f"L{530+(40 if i%2==0 else 20)*__import__('math').cos(i*0.5236):.0f},{300+(30 if i%2==0 else 15)*__import__('math').sin(i*0.5236):.0f}" for i in range(12)) + 'Z" fill="#8cff3a"/>'
             '<rect x="478" y="222" width="104" height="38" rx="12" fill="#fff"/><path d="M520,260 l8,12 l8,-12z" fill="#fff"/>'
             '<text x="530" y="248" text-anchor="middle" font-family="Oswald,Arial Narrow,sans-serif" font-weight="700" font-size="21" fill="#16a34a">SPLAT!</text></g>')
    sky = (f'<radialGradient id="rbG{uid}" cx=".55" cy=".35" r=".75"><stop offset="0" stop-color="#4a2530"/><stop offset="1" stop-color="#1c1518"/></radialGradient>'
           f'<rect width="800" height="420" fill="url(#rbG{uid})"/>' + "".join(f'<circle cx="{rnd.randint(10,790)}" cy="{rnd.randint(10,200)}" r="{rnd.choice([1.2,1.8])}" fill="#ffd9a8" opacity=".5"/>' for _ in range(20)) +
           f'<linearGradient id="rbBe{uid}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffe9a0" stop-opacity=".75"/><stop offset="1" stop-color="#ffe9a0" stop-opacity="0"/></linearGradient>')
    beam = f'<path class="rbBm" d="M480,226 L800,170 L800,320 L480,240 Z" fill="url(#rbBe{uid})"/>'
    bugs = (bg(620, 210, 2.21, -70, d=0) + bg(720, 320, 2.6, -100, d=-.6) + bg(660, 395, 1.95, -80, d=-1.1) + bg(250, 330, 2.08, 95, d=-.3)
            + bg(560, 120, 1.69, -40, d=-.9) + bg(40, 380, 1.82, 80, d=-1.3) + bg(760, 90, 1.56, -120, d=-.4))
    return (css + '<g class="rbA">' + sky + road + beam + truck + bugs
            + '<g class="rbSq">' + bg(530, 318, 2.3, -90, cls="") + '</g>' + splat + '</g>')


def card_angielski(uid, rel, label):
    return ('<rect width="800" height="420" fill="#07111c"/>'
            f'<linearGradient id="ag{uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0c2340"/><stop offset="1" stop-color="#07111c"/></linearGradient><rect width="800" height="420" fill="url(#ag{uid})"/>'
            + img(rel, "angielski-icon.webp", 520, 70, 280, 280, ' opacity=".95"') +
            '<g font-family="IBM Plex Sans,sans-serif" font-weight="600" font-size="30">'
            '<rect x="40" y="70" width="400" height="62" rx="26" fill="#f7f3ea"/><text x="66" y="111" fill="#122033">Where’s the fuse board?</text>'
            '<rect x="150" y="170" width="250" height="62" rx="26" fill="#5ad4ff"/><text x="178" y="211" fill="#07111c">Cheers, mate!</text>'
            '<rect x="50" y="270" width="290" height="62" rx="26" fill="#f7f3ea"/><text x="78" y="311" fill="#122033">Isolate it first.</text></g>')

def card_ufobang(uid, rel, label):
    """Ufobang: friendly animated card (inline SVG + CSS, no image request). Laser cannon over the glowing Earth,
    Blink (teal one-eyed robot), Brumm (orange horned grump) and Gloppo (green blob) bobbing in a loose playful scatter
    (no rows/grid), a laser shot popping Gloppo with a 'POP!', and the Red Manta zipping by. Reduced motion -> static frame."""
    import random as _r
    rnd = _r.Random(11)
    stars = "".join(f'<circle class="ubS" cx="{rnd.randint(5,795)}" cy="{rnd.randint(5,300)}" r="{rnd.choice([1,1.4,1.9,2.4])}" fill="{rnd.choice(["#fff","#bae6fd","#fde68a"])}" style="animation-delay:-{rnd.uniform(0,3):.2f}s"/>' for _ in range(46))
    def blink(x, y, s, d):
        return (f'<g transform="translate({x},{y}) scale({s})"><g class="ubBob" style="animation-delay:{d}s">'
                '<path d="M-10,-20 l-6,-12 M10,-20 l6,-12" stroke="#5eead4" stroke-width="3" stroke-linecap="round"/><circle cx="-16" cy="-33" r="3.5" fill="#f472b6"/><circle cx="16" cy="-33" r="3.5" fill="#f472b6"/>'
                '<path d="M-24,0 a24,24 0 0 1 48,0 v6 q0,10 -10,10 h-28 q-10,0 -10,-10z" fill="#14b8a6" stroke="#0f766e" stroke-width="2.5"/>'
                '<circle cx="0" cy="-3" r="12" fill="#fff"/><g class="ubEye"><circle cx="1.5" cy="-2" r="6.5" fill="#0e7490"/><circle cx="3.5" cy="-4" r="2.2" fill="#fff"/></g>'
                '<path d="M-6,10 q6,4 12,0" stroke="#064e3b" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M-14,16 v6 M14,16 v6" stroke="#0f766e" stroke-width="4" stroke-linecap="round"/></g></g>')
    def brumm(x, y, s, d):
        return (f'<g transform="translate({x},{y}) scale({s})"><g class="ubBob" style="animation-delay:{d}s">'
                '<path d="M-18,-12 q-12,-10 -8,-24 q6,10 14,14z M18,-12 q12,-10 8,-24 q-6,10 -14,14z" fill="#fde68a"/>'
                '<ellipse cx="0" cy="2" rx="25" ry="21" fill="#f97316" stroke="#c2410c" stroke-width="2.5"/><path d="M-25,4 l-8,6 M25,4 l8,6" stroke="#c2410c" stroke-width="4" stroke-linecap="round"/>'
                '<circle cx="-9" cy="-2" r="6.5" fill="#fff"/><circle cx="9" cy="-2" r="6.5" fill="#fff"/><circle cx="-8" cy="-1" r="3" fill="#431407"/><circle cx="10" cy="-1" r="3" fill="#431407"/>'
                '<path d="M-16,-11 l11,4 M16,-11 l-11,4" stroke="#7c2d12" stroke-width="3" stroke-linecap="round"/>'
                '<path d="M-9,12 q9,-5 18,0" stroke="#7c2d12" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M-4,10 l2,4 l2,-4" fill="#fff"/></g></g>')
    def gloppo(x, y, s, d, cls="ubBob"):
        return (f'<g transform="translate({x},{y}) scale({s})"><g class="{cls}" style="animation-delay:{d}s">'
                '<path d="M-8,-16 l-4,-10 M8,-16 l4,-10" stroke="#65a30d" stroke-width="3" stroke-linecap="round"/><circle cx="-12" cy="-27" r="4" fill="#bef264"/><circle cx="12" cy="-27" r="4" fill="#bef264"/>'
                '<path d="M-24,16 q-4,-34 24,-36 q28,2 24,36 q-6,4 -10,0 q-4,5 -8,0 q-6,5 -12,0 q-4,5 -8,0 q-6,4 -10,0z" fill="#84cc16" stroke="#4d7c0f" stroke-width="2.5"/>'
                '<ellipse cx="-12" cy="-6" rx="5" ry="7" fill="#d9f99d" opacity=".5"/>'
                '<circle cx="-8" cy="-2" r="5.5" fill="#fff"/><circle cx="8" cy="-2" r="5.5" fill="#fff"/><circle cx="-7" cy="-1" r="2.6" fill="#1a2e05"/><circle cx="9" cy="-1" r="2.6" fill="#1a2e05"/>'
                '<path d="M-7,7 q7,6 14,0" stroke="#1a2e05" stroke-width="2.2" fill="#3f6212" stroke-linecap="round"/></g></g>')
    css = ('<style>.ubA .ubS{animation:ubTw 3s ease-in-out infinite}.ubA .ubBob{animation:ubBo 1.6s ease-in-out infinite alternate}'
           '.ubA .ubEye{animation:ubEy 2.4s steps(1) infinite;transform-box:fill-box;transform-origin:center}.ubA .ubMan{animation:ubMa 4s linear infinite}.ubA .ubSh{animation:ubSh 2s ease-in infinite;transform-box:fill-box;transform-origin:center bottom}'
           '.ubA .ubPt{animation:ubPt 2s linear infinite;transform-origin:420px 150px}.ubA .ubPp{animation:ubPp 2s ease-out infinite;transform-origin:420px 150px}.ubA .ubCn{animation:ubCn 2s ease-out infinite}'
           '@keyframes ubTw{0%,100%{opacity:.3}50%{opacity:1}}@keyframes ubBo{0%{transform:translateY(-5px) rotate(-4deg)}100%{transform:translateY(5px) rotate(4deg)}}'
           '@keyframes ubEy{0%,90%{transform:none}92%{transform:scaleY(.1)}}'
           '@keyframes ubMa{0%{transform:translateX(-260px)}85%,100%{transform:translateX(1060px)}}'
           '@keyframes ubSh{0%,8%{transform:scaleY(0);opacity:0}12%{opacity:1}30%{transform:scaleY(1);opacity:1}42%,100%{transform:scaleY(1);opacity:0}}'
           '@keyframes ubPt{0%,30%{transform:scale(1);opacity:1}38%{transform:scale(1.25,.6);opacity:0}88%{transform:scale(0);opacity:0}100%{transform:scale(1);opacity:1}}'
           '@keyframes ubPp{0%,30%{transform:scale(0);opacity:0}38%{transform:scale(1.15);opacity:1}62%{transform:scale(1);opacity:1}75%,100%{opacity:0}}'
           '@keyframes ubCn{0%,8%{transform:translateY(0)}14%{transform:translateY(5px)}30%,100%{transform:translateY(0)}}'
           '@media (prefers-reduced-motion:reduce){.ubA *{animation:none!important}.ubA .ubPp{opacity:0}}</style>')
    earth = (f'<radialGradient id="ubE{uid}" cx=".5" cy="0" r="1"><stop offset="0" stop-color="#38bdf8"/><stop offset=".25" stop-color="#1e3a8a"/><stop offset="1" stop-color="#0b1220"/></radialGradient>'
             f'<ellipse cx="400" cy="900" rx="760" ry="560" fill="url(#ubE{uid})"/><ellipse cx="400" cy="900" rx="760" ry="560" fill="none" stroke="#67e8f9" stroke-width="5" opacity=".75"/>'
             '<path d="M120,380 q40,-14 90,-4 q30,8 60,-6 M520,372 q50,-16 110,0" stroke="#22c55e" stroke-width="10" fill="none" opacity=".35" stroke-linecap="round"/>')
    cannon = ('<g class="ubCn"><ellipse cx="420" cy="375" rx="34" ry="8" fill="#2dd4bf" opacity=".4"/><rect x="396" y="340" width="48" height="26" rx="10" fill="#475569" stroke="#94a3b8" stroke-width="2.5"/>'
              '<rect x="412" y="304" width="16" height="40" rx="5" fill="#64748b" stroke="#cbd5e1" stroke-width="2"/><rect x="408" y="330" width="24" height="7" rx="3" fill="#ef4444"/>'
              '<circle cx="404" cy="352" r="3" fill="#22d3ee"/><circle cx="436" cy="352" r="3" fill="#22d3ee"/></g>')
    shot = ('<rect class="ubSh" x="415" y="160" width="10" height="144" rx="5" fill="#67e8f9" opacity=".9"/>')
    pop = ('<g class="ubPp"><circle cx="420" cy="150" r="34" fill="#fef9c3" opacity=".9"/>' + "".join(f'<path d="M420,150 l{30*__import__("math").cos(a*0.785):.0f},{30*__import__("math").sin(a*0.785):.0f}" stroke="#facc15" stroke-width="6" stroke-linecap="round" transform="translate({18*__import__("math").cos(a*0.785):.0f},{18*__import__("math").sin(a*0.785):.0f})"/>' for a in range(8)) +
           '<text x="420" y="160" text-anchor="middle" font-family="Oswald,Arial Narrow,sans-serif" font-weight="700" font-size="26" fill="#a21caf">POP!</text></g>')
    manta = ('<g class="ubMan"><g transform="translate(0,78)"><ellipse cx="0" cy="10" rx="70" ry="10" fill="#f43f5e" opacity=".25"/>'
             '<path d="M-58,4 Q-30,-8 0,-8 Q30,-8 58,4 L44,16 Q20,10 0,22 Q-20,10 -44,16 Z" fill="#dc2626" stroke="#7f1d1d" stroke-width="2.5"/>'
             '<ellipse cx="0" cy="-8" rx="18" ry="13" fill="#facc15" stroke="#a16207" stroke-width="2"/><ellipse cx="-5" cy="-12" rx="6" ry="3.5" fill="#fff" opacity=".7"/>'
             '<path d="M-90,6 h-60 M-84,14 h-40" stroke="#fda4af" stroke-width="3" stroke-linecap="round" opacity=".7"/></g></g>')
    shields = "".join(f'<path d="M{x},300 v-20 a26,22 0 0 1 52,0 v20 h-14 v-8 a12,10 0 0 0 -24,0 v8z" fill="#22c55e" stroke="#15803d" stroke-width="2" opacity=".9"/>' for x in (140, 610))
    aliens = (blink(170, 130, 1.75, 0) + brumm(285, 200, 1.68, -.5) + blink(560, 205, 1.47, -1.1) + brumm(665, 120, 1.61, -.2)
              + gloppo(110, 238, 1.4, -.8) + gloppo(720, 240, 1.4, -1.3) + '<g class="ubPt">' + gloppo(420, 150, 1.82, 0, cls="") + '</g>')
    return (css + '<g class="ubA"><rect width="800" height="420" fill="#0a0a14"/>' + stars + earth + shields + aliens + manta + shot + pop + cannon + '</g>')

def card_redning(uid, rel, label):
    """Redning: friendly animated card (inline SVG + CSS, ~8 KB, no image request). Ship bobbing with a smiling pilot,
    a waving human floating up in the rescue beam, comical chef-hat grabbers wobbling, twinkling stars.
    prefers-reduced-motion -> static frame. Animations only use transform/opacity (GPU-friendly on iPhone)."""
    import random as _r
    rnd = _r.Random(7)
    stars = "".join(f'<circle class="rdS" cx="{rnd.randint(10,790)}" cy="{rnd.randint(8,250)}" r="{rnd.choice([1.4,1.8,2.2,2.8])}" fill="{rnd.choice(["#fff","#fef08a","#99f6e4","#f9a8d4"])}" style="animation-delay:-{rnd.uniform(0,2.4):.2f}s"/>' for _ in range(34))
    def human(x, y, s=1, wave=True, cls="", shirt="#ef4444"):
        arm = (f'<g class="rdWave" style="transform-origin:{f(x+5*s)}px {f(y-16*s)}px"><path d="M{f(x+5*s)},{f(y-16*s)} l{f(9*s)},{f(-11*s)}" stroke="#fde7d4" stroke-width="{f(3.4*s)}" stroke-linecap="round"/></g>' if wave else
               f'<path d="M{f(x+5*s)},{f(y-16*s)} l{f(7*s)},{f(7*s)}" stroke="#fde7d4" stroke-width="{f(3.4*s)}" stroke-linecap="round"/>')
        return (f'<g class="{cls}"><path d="M{f(x-3*s)},{f(y)} l{f(3*s)},{f(-10*s)} l{f(3*s)},{f(10*s)}" stroke="#1e293b" stroke-width="{f(3*s)}" fill="none" stroke-linecap="round"/>'
                f'<rect x="{f(x-6*s)}" y="{f(y-22*s)}" width="{f(12*s)}" height="{f(13*s)}" rx="{f(4*s)}" fill="{shirt}"/>'
                f'<path d="M{f(x-5*s)},{f(y-16*s)} l{f(-7*s)},{f(6*s)}" stroke="#fde7d4" stroke-width="{f(3.4*s)}" stroke-linecap="round"/>' + arm +
                f'<circle cx="{f(x)}" cy="{f(y-29*s)}" r="{f(7.5*s)}" fill="#fde7d4"/><path d="M{f(x-6.5*s)},{f(y-31*s)} q{f(6.5*s)},{f(-9*s)} {f(13*s)},0" fill="#7c4a1e"/>'
                f'<circle cx="{f(x-2.6*s)}" cy="{f(y-29*s)}" r="{f(1.1*s)}" fill="#1e293b"/><circle cx="{f(x+2.6*s)}" cy="{f(y-29*s)}" r="{f(1.1*s)}" fill="#1e293b"/>'
                f'<path d="M{f(x-3*s)},{f(y-25.5*s)} q{f(3*s)},{f(3*s)} {f(6*s)},0" stroke="#1e293b" stroke-width="{f(1.3*s)}" fill="none" stroke-linecap="round"/></g>')
    def grabber(x, y, s, d):
        return (f'<g class="rdGrab" style="animation-delay:{d}s;transform-origin:{f(x)}px {f(y+10*s)}px">'
                f'<path d="M{f(x-16*s)},{f(y+12*s)} l{f(-6*s)},{f(14*s)} M{f(x+16*s)},{f(y+12*s)} l{f(6*s)},{f(14*s)} M{f(x)},{f(y+14*s)} v{f(13*s)}" stroke="#65a30d" stroke-width="{f(3.2*s)}" stroke-linecap="round"/>'
                f'<ellipse cx="{f(x)}" cy="{f(y+8*s)}" rx="{f(26*s)}" ry="{f(10*s)}" fill="#84cc16"/><path d="M{f(x-19*s)},{f(y+4*s)} a{f(19*s)},{f(18*s)} 0 0 1 {f(38*s)},0 z" fill="#bef264"/>'
                f'<circle cx="{f(x-7*s)}" cy="{f(y-2*s)}" r="{f(6*s)}" fill="#fff"/><circle cx="{f(x+7*s)}" cy="{f(y-2*s)}" r="{f(6*s)}" fill="#fff"/>'
                f'<circle cx="{f(x-5.5*s)}" cy="{f(y-1*s)}" r="{f(2.8*s)}" fill="#1e293b"/><circle cx="{f(x+8.5*s)}" cy="{f(y-3*s)}" r="{f(2.8*s)}" fill="#1e293b"/>'
                f'<ellipse cx="{f(x)}" cy="{f(y+6*s)}" rx="{f(3.4*s)}" ry="{f(2.6*s)}" fill="#3f6212"/>'
                f'<rect x="{f(x-10*s)}" y="{f(y-24*s)}" width="{f(20*s)}" height="{f(9*s)}" fill="#fff"/><circle cx="{f(x-8*s)}" cy="{f(y-26*s)}" r="{f(7*s)}" fill="#fff"/><circle cx="{f(x)}" cy="{f(y-30*s)}" r="{f(8*s)}" fill="#fff"/><circle cx="{f(x+8*s)}" cy="{f(y-26*s)}" r="{f(7*s)}" fill="#fff"/></g>')
    css = ('<style>.rdA .rdS{animation:rdTw 2.4s ease-in-out infinite}.rdA .rdShip{animation:rdBob 2s ease-in-out infinite}'
           '.rdA .rdFl{animation:rdFl .25s steps(2) infinite;transform-box:fill-box;transform-origin:right center}.rdA .rdHum{animation:rdUp 2s ease-in-out infinite}'
           '.rdA .rdWave{animation:rdWv .5s ease-in-out infinite alternate}.rdA .rdGrab{animation:rdWb 1s ease-in-out infinite alternate}.rdA .rdBeam{animation:rdBm 1s ease-in-out infinite alternate}'
           '.rdA .rdPop{animation:rdPp 2s ease-in-out infinite}'
           '@keyframes rdTw{0%,100%{opacity:.25}50%{opacity:1}}@keyframes rdBob{0%,100%{transform:translateY(-5px)}50%{transform:translateY(5px)}}'
           '@keyframes rdFl{0%{transform:scaleX(.7)}100%{transform:scaleX(1.15)}}@keyframes rdUp{0%,100%{transform:translateY(8px)}50%{transform:translateY(-10px)}}'
           '@keyframes rdWv{0%{transform:rotate(-25deg)}100%{transform:rotate(30deg)}}@keyframes rdWb{0%{transform:rotate(-7deg) translateY(0)}100%{transform:rotate(7deg) translateY(-4px)}}'
           '@keyframes rdBm{0%{opacity:.45}100%{opacity:.8}}@keyframes rdPp{0%,100%{transform:scale(.92);opacity:.85}50%{transform:scale(1.06);opacity:1}}'
           '@media (prefers-reduced-motion:reduce){.rdA *{animation:none!important}}</style>')
    defs = ('<defs><linearGradient id="rdSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4c1d95"/><stop offset=".55" stop-color="#7c3aed"/><stop offset="1" stop-color="#f472b6"/></linearGradient>'
            '<linearGradient id="rdGnd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14b8a6"/><stop offset="1" stop-color="#0f766e"/></linearGradient>'
            '<linearGradient id="rdBeamG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fef08a" stop-opacity=".9"/><stop offset="1" stop-color="#fef08a" stop-opacity=".15"/></linearGradient>'
            '<radialGradient id="rdSun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fde68a"/><stop offset="1" stop-color="#fde68a" stop-opacity="0"/></radialGradient></defs>')
    ground = ('<path d="M0,330 C120,300 220,345 360,318 C500,292 600,340 800,310 L800,420 L0,420 Z" fill="#a78bfa" opacity=".55"/>'
              '<path d="M0,352 C140,330 260,372 400,350 C540,328 660,370 800,346 L800,420 L0,420 Z" fill="url(#rdGnd)"/>'
              '<path d="M0,352 C140,330 260,372 400,350 C540,328 660,370 800,346" fill="none" stroke="#5eead4" stroke-width="4"/>')
    ship = ('<g class="rdShip"><g class="rdFl"><path d="M150,152 l-42,-10 l12,10 l-12,10 z" fill="#fb923c"/><path d="M150,152 l-26,-6 l7,6 l-7,6 z" fill="#fef08a"/></g>'
            '<path d="M150,132 Q225,118 290,150 Q225,172 150,170 Q140,151 150,132 Z" fill="#f8fafc" stroke="#2dd4bf" stroke-width="3"/>'
            '<path d="M160,133 l-6,-26 l34,24 z" fill="#ef4444"/><path d="M165,168 l18,14 l22,-12 z" fill="#2dd4bf"/>'
            '<ellipse cx="222" cy="140" rx="26" ry="17" fill="#67e8f9" stroke="#0891b2" stroke-width="2.5"/>'
            '<circle cx="222" cy="142" r="9" fill="#fde7d4"/><path d="M213,139 q9,-10 18,0" fill="#f59e0b"/><circle cx="219" cy="142" r="1.4" fill="#1e293b"/><circle cx="225.5" cy="142" r="1.4" fill="#1e293b"/>'
            '<path d="M218,146 q4,3.5 8,0" stroke="#1e293b" stroke-width="1.4" fill="none" stroke-linecap="round"/><path d="M206,131 q8,-5 14,-2" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>'
            '<path class="rdBeam" d="M228,170 L258,170 L292,352 L196,352 Z" fill="url(#rdBeamG)"/></g>')
    body = (css + defs + '<g class="rdA"><rect width="800" height="420" fill="url(#rdSky)"/><circle cx="640" cy="90" r="80" fill="url(#rdSun)" opacity=".7"/><circle cx="640" cy="90" r="34" fill="#fde68a"/>' + stars + ground
            + human(70, 372, 1.15, True, shirt="#3b82f6") + human(120, 366, 1.05, False, shirt="#f59e0b") + human(400, 360, 1.1, True, shirt="#22c55e")
            + ship + human(244, 300, 1.35, True, "rdHum") +
            '<g class="rdPop" style="transform-origin:318px 228px"><rect x="282" y="210" width="76" height="34" rx="12" fill="#fff"/><path d="M296,244 l-8,12 l18,-12 z" fill="#fff"/>'
            '<text x="320" y="233" text-anchor="middle" font-family="Oswald,Arial Narrow,sans-serif" font-weight="600" font-size="19" fill="#7c3aed">+500!</text></g>'
            + grabber(560, 230, 1.5, 0) + grabber(690, 180, 1.2, -.5) + human(600, 352, 1.1, True, shirt="#ec4899") + human(730, 345, 1.05, False, shirt="#3b82f6") + '</g>')
    return body

def card_lavakule(uid, rel, label):
    """Lavakule: animated card (inline SVG + CSS). Glowing glass marble bobbing over a neon track above bubbling lava,
    pulsing glow, rising embers, shimmering lava waves. prefers-reduced-motion -> static. transform/opacity only."""
    import random as _r
    rnd = _r.Random(11)
    emb = "".join(f'<circle class="lkE" cx="{rnd.randint(20,780)}" cy="{rnd.randint(260,400)}" r="{rnd.choice([2,2.6,3.2,4])}" fill="{rnd.choice(["#fde047","#fb923c","#f472b6","#fff7ae"])}" style="animation-delay:-{rnd.uniform(0,3):.2f}s;animation-duration:{rnd.uniform(2.2,3.8):.2f}s"/>' for _ in range(26))
    stars = "".join(f'<circle class="lkS" cx="{rnd.randint(10,790)}" cy="{rnd.randint(8,130)}" r="{rnd.choice([1.2,1.6,2.2])}" fill="#fff" style="animation-delay:-{rnd.uniform(0,2.4):.2f}s"/>' for _ in range(22))
    css = ('<style>.lkA .lkS{animation:lkTw 2.4s ease-in-out infinite}.lkA .lkM{animation:lkBob 1.8s ease-in-out infinite}'
           '.lkA .lkG{animation:lkPu 1.8s ease-in-out infinite;transform-box:fill-box;transform-origin:center}.lkA .lkE{animation:lkUp 3s linear infinite}'
           '.lkA .lkW1{animation:lkWv 3s ease-in-out infinite alternate}.lkA .lkW2{animation:lkWv 2.3s ease-in-out infinite alternate-reverse}'
           '.lkA .lkT{animation:lkSl 1s linear infinite}.lkA .lkC{animation:lkSp 1.2s ease-in-out infinite;transform-box:fill-box;transform-origin:center}'
           '@keyframes lkTw{0%,100%{opacity:.2}50%{opacity:1}}@keyframes lkBob{0%,100%{transform:translate(-14px,0)}50%{transform:translate(14px,-12px)}}'
           '@keyframes lkPu{0%,100%{transform:scale(.9);opacity:.7}50%{transform:scale(1.12);opacity:1}}@keyframes lkUp{0%{transform:translateY(0);opacity:0}15%{opacity:1}100%{transform:translateY(-170px);opacity:0}}'
           '@keyframes lkWv{0%{transform:translateX(-30px)}100%{transform:translateX(30px)}}@keyframes lkSl{0%{transform:translateY(0)}100%{transform:translateY(40px)}}'
           '@keyframes lkSp{0%,100%{transform:scaleX(1)}50%{transform:scaleX(.2)}}'
           '@media (prefers-reduced-motion:reduce){.lkA *{animation:none!important}}</style>')
    defs = ('<defs><linearGradient id="lkSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e0a3c"/><stop offset=".55" stop-color="#be123c"/><stop offset="1" stop-color="#fb923c"/></linearGradient>'
            '<linearGradient id="lkLava" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fde047"/><stop offset=".4" stop-color="#f97316"/><stop offset="1" stop-color="#be185d"/></linearGradient>'
            '<linearGradient id="lkTr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9d174d"/><stop offset="1" stop-color="#ec4899"/></linearGradient>'
            '<radialGradient id="lkGl" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff7ae" stop-opacity=".95"/><stop offset=".45" stop-color="#fb923c" stop-opacity=".55"/><stop offset="1" stop-color="#f43f5e" stop-opacity="0"/></radialGradient>'
            '<radialGradient id="lkBall" cx=".34" cy=".3" r=".75"><stop offset="0" stop-color="#ffffff"/><stop offset=".18" stop-color="#cffafe" stop-opacity=".9"/><stop offset=".5" stop-color="#38bdf8" stop-opacity=".75"/><stop offset=".85" stop-color="#7c3aed" stop-opacity=".8"/><stop offset="1" stop-color="#fb923c"/></radialGradient>'
            '<clipPath id="lkTc"><path d="M370,190 L430,190 L640,420 L160,420 Z"/></clipPath></defs>')
    lava = ('<rect y="190" width="800" height="230" fill="url(#lkLava)"/>'
            '<path class="lkW1" d="M-40,250 C60,230 140,270 240,248 C340,226 420,272 520,250 C620,228 700,268 840,246 L840,300 L-40,300 Z" fill="#fde047" opacity=".55"/>'
            '<path class="lkW2" d="M-40,330 C80,305 170,350 290,326 C410,302 500,352 620,328 C720,308 780,340 840,326 L840,380 L-40,380 Z" fill="#f472b6" opacity=".5"/>'
            '<path class="lkW1" d="M-40,385 C90,370 200,400 330,382 C460,364 560,404 700,384 C760,376 800,390 840,384 L840,420 L-40,420 Z" fill="#9d174d" opacity=".55"/>')
    track = ('<path d="M370,190 L430,190 L640,420 L160,420 Z" fill="url(#lkTr)"/>'
             '<g clip-path="url(#lkTc)"><g class="lkT">' + "".join(f'<rect x="150" y="{y}" width="500" height="10" fill="#fff" opacity=".12"/>' for y in range(150, 430, 40)) + '</g></g>'
             '<path d="M370,190 L160,420 M430,190 L640,420" stroke="#22d3ee" stroke-width="5" filter="drop-shadow(0 0 6px #22d3ee)"/>')
    coins = "".join(f'<g class="lkC" style="animation-delay:-{d}s"><ellipse cx="{x}" cy="{y}" rx="{r}" ry="{r}" fill="#facc15" stroke="#a16207" stroke-width="2"/></g>' for x, y, r, d in ((400, 212, 6, 0), (406, 240, 8, .3), (414, 276, 10, .6)))
    marble = ('<g class="lkM"><ellipse cx="400" cy="372" rx="48" ry="11" fill="#7c2d12" opacity=".55"/>'
              '<circle class="lkG" cx="400" cy="326" r="92" fill="url(#lkGl)"/>'
              '<circle cx="400" cy="326" r="44" fill="url(#lkBall)" stroke="#fff" stroke-opacity=".6" stroke-width="2"/>'
              '<ellipse cx="386" cy="308" rx="14" ry="9" fill="#fff" opacity=".9"/><path d="M372,346 q28,16 56,-4" stroke="#fde047" stroke-width="4" fill="none" opacity=".75" stroke-linecap="round"/></g>')
    body = (css + defs + '<g class="lkA"><rect width="800" height="420" fill="url(#lkSky)"/>' + stars +
            '<circle cx="640" cy="120" r="70" fill="url(#lkGl)" opacity=".6"/>' + lava + track + coins + emb + marble + '</g>')
    return body

CARDS = {"lavakule": card_lavakule, "redning": card_redning, "ufobang": card_ufobang, "hefau": card_hefau, "strom": card_strom, "robaki": card_robaki, "logikk": lambda uid, rel, label: card_logikk(uid), "angielski": card_angielski}

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
