# McGruber Lab — H.E.R.B.I.E. Experiment 001

**Scope:** a repo-first, repeatable starter exercise using the 18 existing H.E.R.B.I.E. V1 STLs. No print has been tested. No hardware dimensions have been confirmed.

## Open

- [Live workshop](https://jimmy-3d-vision.violethill64.chatgpt.site)
- [All repository models](../../HERBIE_V1/STL)
- [Experiment build workflow](../../.github/workflows/experiment-001.yml)
- [Generated results](./) — the build writes GLBs, CSV, JSON and ZIP here

## Eight practical activities

| Objective | Do it in the workshop | What to save |
|---|---|---|
| 1. Assemble | Open `Skeleton_Assembly.glb`; inspect stationary base, two uprights, lower/upper plates. For modifications, import the five individual STL files instead. | Revision: `Skeleton 001 — Assembly` and portable `.3dv` |
| 2. Explode | Open `Skeleton_Exploded.glb`; compare with assembly. In a separate editable STL scene, use Explode/Reset and adjust component positions. | Before/after PNG screenshots |
| 3. Inspect dimensions | Inspect each mesh, use measurement and wireframe, cross-check `part_print_precheck.csv`. | Inspection notes and dimensions |
| 4. Print preparation | Set 180×180 or your real printer bed, inspect overhangs, orientation and topology. Do not assume the first dimension arrangement is optimal. | Per-part screen captures; exported trial STL |
| 5. Combine | Try Group, Join, and Boolean union with copies of two small closed test pieces; compare volume/geometry. Do not merge your only originals. | Separate merged STL and project backup |
| 6. Electronics layouts | Open `Electronics_Space_Study.glb` for example space reservations. The blocks represent **hypothetical volumes**; import measured board/servo models when available. | Electronics study revision, parts clearance notes |
| 7. Presentation | Apply materials/light, use turntable, take screenshots, annotate visible components. | Assembled and exploded PNGs |
| 8. Library | Import new files, rename, classify into folders, save a revision and export a `.3dv` backup. | Portable project archive |

## Reproducible geometry

`scripts/build_experiment_001.py` generates:

- `Skeleton_Assembly.glb` — five source parts positioned using preliminary CAD assembly transforms
- `Skeleton_Exploded.glb` — separated positional preview
- `Electronics_Space_Study.glb` — same skeleton plus obviously labeled conceptual compute, battery and servo space blocks
- `part_print_precheck.csv` — per-part STL bounds, triangle count, mesh flags, simple 180 and 220 mm XY bed screens
- `assembly_manifest.json` — the five source identifiers and translations
- `Skeleton_Experiment_001.zip` — those outputs together

All positions and space-block sizes are **assumptions, not fitted components**. A mesh export is not a structural or mechanical test. The checks do not cover fasteners, prints, overlaps, true wall thickness, power safety or assembly load.

## Persistence limits

Browser revisions and imported originals use that browser's IndexedDB, **not GitHub**. To preserve interactive edits in the repository without repeated manual upload, a future authenticated cloud sync is required. For now, files produced by automated scripts are committed by Actions; locally edited scenes require a deliberate `.3dv` export and upload. Never expose a personal GitHub token in a public website.

## Next physical check

Before printing the full robot, make a small fastening coupon based on the actual chosen screws and printer material and verify fit with calipers. This experiment alone does not establish any ready-to-print assembly.
