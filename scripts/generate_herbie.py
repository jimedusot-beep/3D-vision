#!/usr/bin/env python3
"""Generate H.E.R.B.I.E. V1 STLs + browser GLBs from the OpenSCAD master.
PROVISIONAL geometry. Re-generated models, NOT byte-identical to chat artifacts."""
from pathlib import Path
import subprocess, numpy as np, trimesh
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'HERBIE_V1/CAD/HERBIE_V1_Master.scad'
OUT=ROOT/'HERBIE_V1/STL'
WEB=ROOT/'models'
OUT.mkdir(parents=True, exist_ok=True)
WEB.mkdir(parents=True, exist_ok=True)
for i in range(1,19):
    file=OUT/f'HBR-{i:03}.stl'
    subprocess.run(['openscad','-o',str(file),'-D',f'part={i}',str(SOURCE)],check=True,timeout=180)
    m=trimesh.load(file,force='mesh')
    if not m.is_watertight or m.volume<=0: raise RuntimeError(f'Bad mesh {file}: watertight={m.is_watertight} volume={m.volume}')
    print(file.name,round(m.volume,2),flush=True)
# transforms transcribe the provisional CAD's "assembly" module.
placements=[
(0,0,427.5),(0,0,427.5),(0,-89,397),(0,0,412),(0,0,320),
(0,0,307),(0,0,121),(-70,0,126),(70,0,126),
(0,-97,132),(0,97,132),(-117,0,270),(117,0,270),
(-136,0,160),(136,0,160),(0,0,210),(0,0,149),(0,0,0)]
rotations={3:(90,0,0),10:(90,0,0),11:(90,0,0),12:(0,90,0),13:(0,90,0)}
palette=['#e6edf4','#cedae4','#102a48','#91a7b8','#8495a6','#738496',
'#738496','#8495a6','#8495a6','#e6edf4','#e6edf4','#8b9aa9',
'#8b9aa9','#e6edf4','#e6edf4','#4eaadb','#548cc8','#a7b7c5']
def rgb(s):return tuple(int(s[j:j+2],16) for j in (1,3,5))+ (255,)
for mode in ['Assembled','Exploded']:
    exploded=mode=='Exploded';sc=trimesh.Scene()
    for i,p in enumerate(placements,1):
        m=trimesh.load(OUT/f'HBR-{i:03}.stl',force='mesh')
        m.visual.vertex_colors=rgb(palette[i-1])
        x,y,z=p
        if exploded:
            if i==1:z+=55
            if i==2:z+=85
            if i==3:z+=85
            if i==4:z+=45
            if i==5:z+=25
            if i==6:z+=12
            if i==7:z-=15
            if i==10:y-=35
            if i==11:y+=35
        tf=np.eye(4)
        rx,ry,rz=rotations.get(i,(0,0,0))
        for axis,deg in [(0,rx),(1,ry),(2,rz)]:
            if deg:tf=tf @ trimesh.transformations.rotation_matrix(np.deg2rad(deg),[int(axis==j) for j in range(3)])
        tf[:3,3]=[x,y,z]
        sc.add_geometry(m,node_name=f'HBR-{i:03}',geom_name=f'HBR-{i:03}',transform=tf)
    dest=WEB/f'HERBIE_V1_{mode}_Interactive.glb'
    dest.write_bytes(sc.export(file_type='glb'))
    print('Wrote',dest,flush=True)
