#!/usr/bin/env python3
"""Generate shareable derivative docs and archive from checked-in model assets.
These are NEW renders and instructions; they are NOT copies of ChatGPT PDFs/images."""
from pathlib import Path
import csv, zipfile, json
import trimesh
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
ROOT=Path(__file__).resolve().parents[1]
DOC=ROOT/'HERBIE_V1'; OUT=DOC/'documents'; OUT.mkdir(exist_ok=True)
def pdf(path,title,lines):
    c=canvas.Canvas(str(path),pagesize=letter); width,height=letter
    c.setTitle(title); y=height-55
    c.setFont('Helvetica-Bold',15);c.drawString(40,y,title);y-=34
    c.setFont('Helvetica',9)
    for line in lines:
        if y<60:c.showPage();y=height-50;c.setFont('Helvetica',9)
        c.drawString(40,y,line[:105]);y-=15
    c.save()
with (DOC/'PARTS.csv').open(newline='', encoding='utf-8') as f:
    parts=list(csv.DictReader(f))
assert len(parts)==18 and all('part_number' in p and 'name' in p for p in parts), 'Parts CSV must contain 18 named rows'
parts_lines=['H.E.R.B.I.E. V1: PROVISIONAL / NOT PHYSICALLY TESTED','', 'Units: millimeters. Approximate: height 500; head 240 x 170 x 145;',
'torso 220 x 190 x 205; base 280 x 240 x 115. These are not validated.',
'','Suggested build order (subject to fit testing):',
'1. Check individual STL print bed sizes; segment oversized parts before printing.',
'2. Verify M3 hole fits with a small coupon; never assume all interfaces mate.',
'3. Test-fit stationary base, frame uprights and torso plates before loading.',
'4. Add fixed neck and hollow head frame only after stability verification.',
'5. Trial-fit static arms, compute and battery trays; no electrical system assumed.',
'6. Install cosmetic head and torso panels only after accessibility checks.',
'','18 Part inventory:']+[p['part_number']+'  '+p['name'].replace('_',' ') for p in parts]+[
'','Engineering references: consult ../REFERENCES_R01-R16.md',
'Fit, fastening, load resistance, stability and thermal performance: UNTESTED.']
pdf(OUT/'HERBIE_V1_Assembly_Instructions_REGENERATED.pdf','H.E.R.B.I.E. V1 Assembly and BOM (Regenerated)',parts_lines)
pdf(OUT/'HERBIE_V1_Engineering_Summary_REGENERATED.pdf','H.E.R.B.I.E. V1 Engineering Summary (Regenerated)',[
'Version 1: stationary skeleton-first concept; 18 prototype components.',
'Original historical PDF not included: this is a regenerated summary.',
'Dimensions are preliminary; nominal machine screw M3 holes need testing.',
'R01-R16 references and terminology are in this repository.',
'Recommended checks: 1. hole fit, 2. mating alignment, 3. shell segmentation,',
'4. static stability, 5. head load, 6. power and compute clearances.',
'Source: HERBIE_V1/CAD/HERBIE_V1_Master.scad','Meshes and 3D web models are regenerated via GitHub Actions.'])
# Produce a real mesh render from hosted mesh, not a stock illustration.
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d.art3d import Poly3DCollection
for mode in ('Assembled','Exploded'):
    file=ROOT/'models'/f'HERBIE_V1_{mode}_Interactive.glb'
    scene=trimesh.load(file,force='scene')
    fig=plt.figure(figsize=(8,8),dpi=110); ax=fig.add_subplot(111,projection='3d')
    for obj in scene.dump():
        if not isinstance(obj,trimesh.Trimesh):continue
        verts=obj.vertices; faces=obj.faces
        if len(faces)>750:
            take=faces[::max(1,len(faces)//750)]
        else:take=faces
        poly=Poly3DCollection(verts[take], alpha=.52, linewidths=.1, edgecolors='#7894a8',facecolor='#7db4d5')
        ax.add_collection3d(poly)
    bound=scene.bounds; center=(bound[0]+bound[1])/2; dim=max(bound[1]-bound[0]); 
    ax.set_xlim(center[0]-dim*.55,center[0]+dim*.55);ax.set_ylim(center[1]-dim*.55,center[1]+dim*.55);ax.set_zlim(center[2]-dim*.55,center[2]+dim*.55)
    ax.view_init(elev=17,azim=-55);ax.set_axis_off()
    ax.set_title(f'H.E.R.B.I.E. V1 | {mode} | PROVISIONAL',size=11)
    fig.savefig(OUT/f'HERBIE_V1_{mode}_REGENERATED.png',bbox_inches='tight');plt.close(fig)
# complete repository engineering bundle; no historical PDFs claimed
files=[*DOC.glob('*.md'),*DOC.glob('*.csv'),*DOC.glob('*.json'),*DOC.glob('CAD/*.scad'),*DOC.glob('STL/*.stl'),*OUT.glob('*.pdf'),*OUT.glob('*.png'),* (ROOT/'models').glob('HERBIE_V1_*.glb')]
with zipfile.ZipFile(OUT/'HERBIE_V1_Repository_Collection_REGENERATED.zip','w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
    for file in files: z.write(file,file.relative_to(ROOT))
print('Created repository PDF, renders and archive')
