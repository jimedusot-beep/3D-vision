# H.E.R.B.I.E. asset guide and provenance

H.E.R.B.I.E. V1 is a **provisional, untested** skeleton-first robot design. The public repository contains 18 STL parts, 2 GLB assemblies, editable CAD sources, PDF guides, technical references, and a ZIP archive.

## View the real 3D models — no download or upload

**[OPEN THE COMPLETE VIEWING LINK LIBRARY (all 18 STLs + both robot assemblies)](../STL_VIEWING_LINKS.md)**

Quick links that do not depend on GitHub Pages:

- [Assembled H.E.R.B.I.E. · Online 3D Viewer](https://3dviewer.net/index.html#https://raw.githubusercontent.com/jimedusot-beep/3D-vision/main/models/HERBIE_V1_Assembled_Interactive.glb)
- [Exploded H.E.R.B.I.E. · Online 3D Viewer](https://3dviewer.net/index.html#https://raw.githubusercontent.com/jimedusot-beep/3D-vision/main/models/HERBIE_V1_Exploded_Interactive.glb)
- [Head front shell HBR-001 · GitHub's STL viewer](../HERBIE_V1/STL/HBR-001.stl)
- [Head front shell HBR-001 · Online 3D Viewer](https://3dviewer.net/index.html#https://raw.githubusercontent.com/jimedusot-beep/3D-vision/main/HERBIE_V1/STL/HBR-001.stl)

GitHub natively previews valid STL meshes. Online 3D Viewer accepts a public remote file URL via the URL fragment. Both options bypass the incomplete GitHub Pages setup.

## Files you can open in this repository

| Category | Location |
|---|---|
| **18 separate STL parts** | [HERBIE_V1/STL](../HERBIE_V1/STL) |
| **Assembled and exploded GLBs** | [models](../models) |
| **Editable OpenSCAD master** | [HERBIE_V1/CAD](../HERBIE_V1/CAD) |
| **Bills of materials and dimensional notes** | [HERBIE_V1/PARTS.csv](../HERBIE_V1/PARTS.csv) |
| **Assembly instructions PDF** | [Regenerated assembly instructions](../HERBIE_V1/documents/HERBIE_V1_Assembly_Instructions_REGENERATED.pdf) |
| **Engineering summary PDF** | [Regenerated engineering summary](../HERBIE_V1/documents/HERBIE_V1_Engineering_Summary_REGENERATED.pdf) |
| **Assembled model image** | [Regenerated render](../HERBIE_V1/documents/HERBIE_V1_Assembled_REGENERATED.png) |
| **Exploded model image** | [Regenerated render](../HERBIE_V1/documents/HERBIE_V1_Exploded_REGENERATED.png) |
| **All files in one archive** | [Regenerated collection ZIP](../HERBIE_V1/documents/HERBIE_V1_Repository_Collection_REGENERATED.zip) |
| **Engineering research** | [R01–R16 references](../HERBIE_V1/REFERENCES_R01-R16.md) |
| **Technical terminology** | [Glossary](../HERBIE_V1/TERMINOLOGY.md) |
| **STL mesh validation records** | [Report](../HERBIE_V1/STL_MESH_VALIDATION.json) |

### Our custom 3D Vision website

Source: [index.html](../index.html) and [18-part library](../library.html).
Expected hosting URL after GitHub Pages is enabled: https://jimedusot-beep.github.io/3D-vision/

**Current website publishing blocker:** The [Pages workflow](../.github/workflows/pages.yml) runs its asset checks successfully but GitHub fails the **Configure Pages** step because Pages has not been enabled. To activate, use [GitHub Settings → Pages](https://github.com/jimedusot-beep/3D-vision/settings/pages) and set **Source → GitHub Actions** once. The GitHub connection available in this conversation cannot change that setting.

### Tested versus unverified

- **Confirmed on GitHub:** all 18 STL meshes, both GLBs, both PDF summaries, two PNG renders, ZIP, BOM, references, CAD masters.
- **Browser tested (GitHub Actions Chromium):** local static site loaded assembled GLB, exploded GLB, HBR-001 STL and part search. [Passing test](https://github.com/jimedusot-beep/3D-vision/actions/workflows/smoke-viewer.yml).
- **Not independently verified:** remote GitHub Pages hosting; physical print quality; fit of joints; fastener strength; structural loading; thermal and electrical requirements.
- **Provenance:** New STLs, GLBs, PDFs, previews and ZIP were regenerated from project sources by [this workflow](../.github/workflows/build-herbie.yml); they aren't necessarily byte-identical to the original artifacts created in ChatGPT. Original historical PDF/image assets were **not** directly imported.

### Future projects

3D Vision is intended to hold a model library for H.E.R.B.I.E., McGruber experiments and later original inventions. Add new projects in separate directories with their own source, references and revision history.
