# 3D Vision V2 capability checklist

The workshop is a functional static mesh editor and assembly viewer. It is not a complete replacement for a parametric CAD system. H.E.R.B.I.E. source geometry remains provisional and physically untested.

**Evidence labels:** Tested = exercised by automated geometry/browser checks. Implemented = available in the UI, with targeted checks or code inspection, but not exhaustively tested. Partial = a bounded subset with the limits below. Pending = not implemented.

| Capability | Status | Scope / limits |
|---|---|---|
| Actual H.E.R.B.I.E. models | Tested | 18 individual STL parts, assembled and exploded GLBs; existing meshes are preserved |
| STL, OBJ, GLB, GLTF, PLY, OFF import | Tested | Static triangle meshes; GLTF embedded data or explicitly selected companion files |
| 3MF import | Tested / partial | Core mesh resources and unit conversion; extensions depend on Three.js support; mixed-unit archives rejected |
| Device and public URL/GitHub import | Implemented | Raw URLs, CORS and public GitHub API limits apply; downloaded files cached by source and content |
| Orbit, pan, zoom and camera views | Tested / implemented | Touch controls, fit, seven presets and perspective/orthographic projection |
| Lighting, materials, opacity, wireframe, background | Implemented | Original/polymer/steel/clay, intensity and opacity controls |
| Simultaneous multi-part assembly | Tested | Up to 200 components / 500,000 triangles; component tree with multi-select |
| Move, rotate, scale | Tested | Numeric local transforms and Three.js world gizmos; positive scales; grid/angle snapping |
| Duplicate, rename, hide, isolate, lock | Implemented | Group locks affect descendants; visibility is separately controllable |
| Align and drop to bed | Implemented | Bounding-box centers aligned on a selected axis; lower selection to Z=0 |
| Visual grouping / ungrouping | Tested | Preserves child world placement; this does not merge geometry |
| Join meshes / separate shells | Tested | Triangle concatenation and connectivity-based shell separation; join is not union |
| Real geometric Boolean union | Tested / partial | Exactly two closed mesh operands, 80,000 combined triangle limit, worker timeout; numerical/manifold edge cases remain |
| Undo / redo | Tested | Up to 15 geometry/transform snapshots, within 32 MB serialized budget |
| Dimensions and mesh statistics | Tested | World-space bounding dimensions, triangles, welded vertices, area and signed-volume magnitude |
| Distance and angle measurements | Implemented | Clicked surface points; optional nearest-face-vertex snapping; no CAD feature/tolerance inference |
| Visual section cuts | Tested / partial | One movable X/Y/Z clipping plane, with no end-cap generation or solid cutting |
| Bounding boxes and face normals | Implemented | Selection bounds; normal-line rendering capped at 12,000 faces |
| Mesh topology checks | Tested / partial | Quantized edge counts, winding conflicts and degenerate faces; not a self-intersection proof |
| Interference detection | Partial | AABB overlap candidates only, clearly labeled; no exact solid contact solver |
| Basic mesh repair | Tested / partial | Weld coincident vertices, remove degenerate triangles, recalculate / flip normals; no hole filling |
| Build plate and print checks | Implemented / partial | Five bed presets, bounds/topology checks and face-normal overhang colors; no slicing or print certification |
| Wall thickness, stress, tolerances | Pending | Not inferred from appearance or nominal dimensions |
| Save uploaded original files | Tested | IndexedDB original bytes, SHA-256 deduplication, original downloads; source/name aliases retained |
| Project and file folders | Tested / implemented | Searchable folder metadata, display names, move saved projects |
| Save/reopen revisions | Tested | Up to ten named scene revisions plus session autosave; no network required to reopen |
| Portable complete project package | Tested | Download/reimport `.3dv` ZIP with scene geometry and original files |
| STL, OBJ, GLB, PLY export | Tested | Round-trip dimensions/volume checked; OBJ geometry without MTL; GLB standard meters/Y up |
| Exploded preview and animation | Implemented | Non-destructive radial preview of top-level unlocked components; original exploded GLB also retained |
| Turntable, PNG screenshots, labels | Implemented | Screenshot overlays labels; labels capped at 60 visible components, 100 stored annotations |
| Mobile layout | Tested | iPhone 13 viewport/touch emulation in Chromium and macOS WebKit, including the live public site; physical device performance remains unverified |
| Repository discovery | Tested / implemented | Build-generated catalog and manual public GitHub Refresh; future project directories are supported |
| Authenticated GitHub write sync | Pending backend | No tokens are accepted, stored or published in the frontend; design in ARCHITECTURE.md |
| Sketch constraints / assembly joints | Pending | No parametric/BREP engine, kinematic solver, STEP/IGES or feature history |
| Manufacturing readiness | Unverified | No model is labeled print-ready; use a slicer and physical fit/strength validation |

## Practical use

1. Import files or open an actual model from Library. Uploaded originals are retained in My files.
2. Select components from the tree; use checkboxes for multi-select. Edit with numeric transforms or gizmos.
3. Save a named revision. Export a `.3dv` package for a portable backup; browser storage can be cleared by the browser or user.
4. Inspect geometry, prepare orientation and export visible meshes. Run an appropriate slicer before printing.

Static features are free of account requirements and paid runtime APIs. Hosting, storage retention, CORS and optional future backend services follow their providers' limits.
