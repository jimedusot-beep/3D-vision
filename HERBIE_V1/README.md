# H.E.R.B.I.E. V1 Skeleton-First CAD — PROVISIONAL

18 individual `.stl` meshes in `STL/`, a single parametric `HERBIE_V1_Master.scad`, BOM, mesh validation JSON, references and terminology. All sizes in mm.

To open the assembly: use OpenSCAD on `HERBIE_V1_Master.scad`, F5 preview. For exploded preview, change `exploded=false` to `exploded=true`. To export a part: `openscad -o HBR-001.stl -D "part=1" HERBIE_V1_Master.scad`.

**IMPORTANT:** 18 watertight meshes != 18 verified mating parts. Component joints, tolerances, fasteners, structural stability, thermal design and print-bed segmentation are **not** validated. In particular large base/head pieces will require segmentation for a small printer. This is a digital concept model, not a proven physical build kit.

All design geometry was authored for this package, not imported from third-party repos. See REFERENCES_R01-R16.md.