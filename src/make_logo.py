# Generates Stop60 SVG logo (text converted to paths, Oswald 700, SIL OFL 1.1)
import math, io
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
F="/usr/share/fonts/truetype/sand-box/google/Oswald/Oswald-VariableFont_wght.ttf"
font=instantiateVariableFont(TTFont(F),{"wght":700})
gs=font.getGlyphSet(); cmap=font.getBestCmap(); upm=font['head'].unitsPerEm
cap=font['OS/2'].sCapHeight
def text_path(s, x0, base, h, track=0.0):
    sc=h/cap; d=[]; x=x0
    for ch in s:
        g=cmap[ord(ch)]; pen=SVGPathPen(gs)
        gs[g].draw(TransformPen(pen,(sc,0,0,-sc,x,base)))
        d.append(pen.getCommands()); x+=gs[g].width*sc+track
    return " ".join(d), x-track
def width(s,h,track=0.0):
    return text_path(s,0,0,h,track)[1]
H=100  # canvas height
# octagon
R=50; cx=None
def octagon(cx,cy,r):
    pts=[(cx+r*math.cos(math.radians(22.5+45*i)), cy+r*math.sin(math.radians(22.5+45*i))) for i in range(8)]
    return "M"+" L".join(f"{x:.2f},{y:.2f}" for x,y in pts)+"Z"
capH=64; base=(H+capH)/2
stop_d, xend = text_path("STOP", 0, base, capH, track=2)
gap=8; cx=xend+gap+R; cy=H/2
w60=width("60",44,1); d60,_=text_path("60", cx-w60/2, cy+22, 44, 1)
W=cx+R
def svg(stop_col, extra=""):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W:.1f} {H}" width="{W*2:.0f}" height="{H*2}" role="img" aria-label="Stop60">
<title>Stop60</title>
<path fill="{stop_col}" d="{stop_d}"/>
<path fill="#e11d2a" d="{octagon(cx,cy,R)}"/>
<path fill="none" stroke="#fff" stroke-width="3.5" d="{octagon(cx,cy,R-5.5)}"/>
<path fill="#fff" d="{d60}"/>
</svg>
'''
import sys
out=sys.argv[1]
open(out+"/logo.svg","w").write(svg("#f5f1e8"))
open(out+"/logo-dark.svg","w").write(svg("#12110f"))
# favicon: octagon with 60 only
fd60,_=text_path("60", 50-w60/2, 50+22, 44, 1)
open(out+"/favicon.svg","w").write(f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="#e11d2a" d="{octagon(50,50,50)}"/><path fill="none" stroke="#fff" stroke-width="3.5" d="{octagon(50,50,44.5)}"/><path fill="#fff" d="{fd60}"/></svg>
''')
print("W",W)
