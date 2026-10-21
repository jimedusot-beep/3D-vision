#!/usr/bin/env python3
"""Build reproducible V1 experiments using already-checked-in STL geometry.
Visual prototypes only: no mating clearance, weight, circuitry, or fastener validation."""
from pathlib import Path
import csv, json, zipfile
import numpy as np
import trimesh

ROOT=Path(__file__).resolve().parents[1]
STL=ROOT/'HERBIE_V1/STL'
OUT=ROOT/'EXPERIMENTS/001_HERBIE_SKELETON'
OUT.mkdir(parents=True,exist_ok=True)
PARTS=[('HBR-018',0,0,0),('HBR-007',0,0,121),('HBR-008',-70,0,126),('HBR-009',70,0,126),('HBR-006',0,0,307)]
colors=['#7b95b2','#3d759f','#c1e1f0','#c1e1f0','#3d759f']
def rgba(s):return [int(s[i:i+2],16) for i in (1,3,5)]+[255]
def mesh(part):
    path=STL/f'{part}.stl'
    obj=trimesh.load(path,force='mesh')
    if obj.is_empty:raise ValueError(f'Empty part: {path}')
    return obj
def generate(explode=False, electronics=False):
    scene=trimesh.Scene()
    for ix,(part,x,y,z) in enumerate(PARTS):
        model=mesh(part)
        model.visual.vertex_colors=rgba(colors[ix])
        if explode:
            z+= [-48,-15,0,0,35][ix]
            x+= [0,0,-55,55,0][ix]
        tf=np.eye(4); tf[:3,3]=[x,y,z]
        scene.add_geometry(model,node_name=part,geom_name=part,transform=tf)
    if electronics:
        # These are labeled EMPTY SPACE RESERVATIONS, not real component CAD.
        for name,size,loc,color in [
            ('COMPUTE_SPACE_PLACEHOLDER',[110,85,20],[0,0,210],'#3da0ff'),
            ('BATTERY_SPACE_PLACEHOLDER',[95,60,30],[0,0,150],'#ffbc55'),
            ('SERVO_SPACE_PLACEHOLDER',[25,15,25],[105,0,262],'#cf8aff')]:
            model=trimesh.creation.box(extents=size)
            model.visual.vertex_colors=rgba(color)
            tf=np.eye(4);tf[:3,3]=loc
            scene.add_geometry(model,node_name=name,geom_name=name,transform=tf)
    return scene
models={'Skeleton_Assembly.glb':generate(),
        'Skeleton_Exploded.glb':generate(explode=True),
        'Electronics_Space_Study.glb':generate(electronics=True)}
for filename,scene in models.items():
    path=OUT/filename
    path.write_bytes(scene.export(file_type='glb'))
    assert path.read_bytes()[:4]==b'glTF'
    print(filename,path.stat().st_size)
with (OUT/'part_print_precheck.csv').open('w',newline='') as f:
    writer=csv.writer(f)
    writer.writerow(['part_id','x_mm','y_mm','z_mm','triangles','watertight','positive_volume','fits_180x180_xy_as_exported','fits_220x220_xy_as_exported','interpretation'])
    for i in range(1,19):
        key=f'HBR-{i:03}';m=mesh(key); dims=m.extents
        writer.writerow([key,*map(lambda v:round(float(v),2),dims),len(m.faces),m.is_watertight,m.volume>0,
            max(dims[0],dims[1])<=180,max(dims[0],dims[1])<=220,'Bounding-box screening only; orientation/support/clearance unverified'])
meta={'title':'H.E.R.B.I.E. Skeleton Experiment 001','status':'DIGITAL_CONCEPT_UNTESTED','units':'mm','coordinate_system':'Z up',
    'source':'HERBIE_V1/CAD/HERBIE_V1_Master.scad','parts':[{'id':pid,'translation_mm':[x,y,z]} for pid,x,y,z in PARTS],
    'electronics_placeholders_not_measured':True,
    'validation':['all 18 STLs inspected for bounding box and mesh flags','assembly fit, screws and structural safety NOT tested']}
(OUT/'assembly_manifest.json').write_text(json.dumps(meta,indent=2)+'\n')
with zipfile.ZipFile(OUT/'Skeleton_Experiment_001.zip','w',zipfile.ZIP_DEFLATED) as z:
    for p in [*OUT.glob('*.glb'),OUT/'part_print_precheck.csv',OUT/'assembly_manifest.json']:
        z.write(p,p.name)
print('Generated skeleton experiments and print precheck')
