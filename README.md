# 3D Vision

**Public browser-based 3D viewer for H.E.R.B.I.E. and future electronics projects.**

## Current status

- Interactive mobile-friendly Three.js viewport and assembled/exploded switches: **implemented**.
- Built-in parametric-style **illustrative preview** of a skeleton-first robot: **implemented**. This is deliberately NOT advertised as the original CAD geometry.
- Original H.E.R.B.I.E. STL-derived assembled/exploded GLBs: **not hosted yet**. The viewer will load them when they are placed into the `models/` folder using the exact filenames below.
- GitHub Pages: **requires enabling in repository Settings → Pages** unless already enabled.

## Upload original meshes

Add these two files to `models/` on the repository's main branch:

1. `HERBIE_V1_Assembled_Interactive.glb`
2. `HERBIE_V1_Exploded_Interactive.glb`

The GLB files were generated previously for the H.E.R.B.I.E. project but are not yet stored in this repo. The ChatGPT GitHub connector can currently create UTF-8 text files, not binary GLBs. Do not convert binary GLB bytes to text by changing the extension.

## Publish the free site

In **Settings → Pages**, select **Deploy from a branch**, branch **main**, folder **/(root)** and save. Then wait for deployment. The expected Pages site is:

https://jimedusot-beep.github.io/3D-vision/

Do not treat the expected URL as verified until GitHub Pages is enabled and a browser check succeeds.

## Engineering caveat

The built-in preview uses approximate primitive geometry intended for general visual exploration, not actual dimension-controlled STL surfaces. The V1 source geometry is not fit-tested, load-tested or validated for assembly.

## Future work

Add part selection, model library, dimension annotations, cross-sections, and citations to the H.E.R.B.I.E. R01–R16 design register.


## H.E.R.B.I.E. V1 engineering collection (2026-10-20)

Imported text files under [HERBIE_V1/](HERBIE_V1):
- [Parametric master CAD](HERBIE_V1/CAD/HERBIE_V1_Master.scad)
- [Original exploded CAD reference](HERBIE_V1/CAD/HERBIE_V1_Exploded_Master.scad)
- [18-part BOM](HERBIE_V1/PARTS.csv)
- [Mesh validation report](HERBIE_V1/STL_MESH_VALIDATION.json)
- [R01–R16 engineering references](HERBIE_V1/REFERENCES_R01-R16.md)
- [Terminology glossary](HERBIE_V1/TERMINOLOGY.md)
- [Source and terminology register](HERBIE_V1/SOURCE_TERMINOLOGY_REGISTER.md)
- [File index](HERBIE_V1/LATEST_FILES_INDEX.md)

**Binary asset status:** The original PDF, ZIP, PNG, STL and GLB files from the ChatGPT session have not been directly transferred into GitHub. A [GitHub Action](.github/workflows/build-herbie.yml) generates fresh STL/GLB exports from the OpenSCAD source, then commits them if the action succeeds. Check [Actions](https://github.com/jimedusot-beep/3D-vision/actions) for progress and errors. The regenerated exports are not necessarily byte-identical to the original conversation artifacts, and are provisional/unvalidated mechanically.
