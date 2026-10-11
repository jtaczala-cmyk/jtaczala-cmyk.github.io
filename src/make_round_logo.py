"""Outline the Facebook round STOP 60 logo (profile_round_v2) to pure SVG paths (no font dependency).
Text boxes fitted to the master raster profile_round_v2_720.png: STOP x125-595 y197-349, 60 x225-494 y365-517."""
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.transformPen import TransformPen
f=TTFont('/usr/share/fonts/truetype/sand-box/google/Archivo Black/ArchivoBlack-Regular.ttf')
gs=f.getGlyphSet(); cmap=f.getBestCmap()
def text_path(s, box):
    x0,y0,x1,y1=box
    # layout in font units
    glyphs=[];x=0
    for ch in s:
        g=cmap[ord(ch)]; glyphs.append((g,x)); x+=f['hmtx'][g][0]
    bp=BoundsPen(gs)
    for g,ox in glyphs: gs[g].draw(TransformPen(bp,(1,0,0,1,ox,0)))
    bx0,by0,bx1,by1=bp.bounds
    sx=(x1-x0)/(bx1-bx0); sy=(y1-y0)/(by1-by0)
    sp=SVGPathPen(gs, ntos=lambda v: f"{v:.1f}".rstrip('0').rstrip('.'))
    for g,ox in glyphs:
        # map font units -> svg: X = x0 + (u+ox-bx0)*sx ; Y = y1 - (v-by0)*sy
        gs[g].draw(TransformPen(sp,(sx,0,0,-sy,x0+(ox-bx0)*sx,y1+by0*sy)))
    return sp.getCommands()
stop=text_path('STOP',(125,197,596,350)); sixty=text_path('60',(225,365,495,518))
def svg(bg=False, title=True):
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" role="img" aria-label="Stop60">'
            + ('<title>Stop60</title>' if title else '') + ('<rect width="720" height="720" fill="#12110f"/>' if bg else '')
            + '<circle cx="360" cy="360" r="350" fill="#fff"/><circle cx="360" cy="360" r="302" fill="#e11d2a"/>'
            + f'<path fill="#fff" d="{stop}{sixty}"/></svg>')
import sys
out=sys.argv[1]
open(out+'/logo-round.svg','w').write(svg())
open(out+'/favicon.svg','w').write(svg(title=False))
print(len(svg()))
