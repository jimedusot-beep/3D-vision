# 3D Vision — browser 3D assembly workshop

**[OPEN 3D VISION WORKSHOP](https://jimmy-3d-vision.violethill64.chatgpt.site)**

A free static web application for loading, assembling, inspecting and exporting real mesh models. It includes the existing 18 H.E.R.B.I.E. STL parts, both GLB assemblies, editable CAD sources and engineering documents. H.E.R.B.I.E. V1 remains **provisional and physically untested**.

## Save your uploaded files and work

1. **Import files** from your device, or import a public URL/GitHub file link. Original files are retained in **My files**, with searchable folders and display names. Identical bytes are stored once.
2. Use the component tree and transform tools. **Save revision** keeps a named project; **My projects** reopens saved revisions. The last workspace is also autosaved.
3. **Export → complete project (.3dv)** creates a portable backup containing scene geometry, component placement and original files. Import the package to move between devices or hosts.

Files and projects are saved in **this browser on this device**. Clearing site data can remove them. The static application does not upload your personal models to a server or automatically write to GitHub. Authenticated cross-device/GitHub sync is pending a backend.

## Working capabilities

- Import STL, OBJ, GLB, self-contained/companion GLTF, 3MF, PLY and OFF meshes; load multiple components together.
- Orbit, zoom, pan, fit, camera presets, perspective/orthographic views, wireframe, materials, opacity and lighting.
- Move, rotate, scale, duplicate, rename, hide, isolate, lock, group, align and grid-snap components. Undo and redo.
- Separate tools for visual groups, joined triangles and a **real geometric Boolean union** in a bounded worker.
- Bounding dimensions, surface measurements, topology/normal reports, visual section planes and preliminary print checks.
- Build plates, overhang colors, exploded animations, turntable, annotations and PNG screenshots.
- IndexedDB project revisions and original files, folder metadata and portable packages.
- STL, OBJ, GLB and PLY exports with tested reimport dimensions/volume.

**[Full capability checklist](docs/CAPABILITIES.md)** distinguishes tested, implemented, partial and pending work. See **[QA evidence](docs/QA.md)**, **[architecture and auth design](docs/ARCHITECTURE.md)** and **[next priorities](docs/NEXT_PRIORITIES.md)**.

## Models and original documentation

- [18 STL parts](HERBIE_V1/STL) · [assembled/exploded GLBs](models) · [OpenSCAD sources](HERBIE_V1/CAD)
- [PDFs, PNGs and complete regenerated archive](HERBIE_V1/documents)
- [Complete direct viewing links](STL_VIEWING_LINKS.md), which work independently of either website host
- [Engineering references](HERBIE_V1/REFERENCES_R01-R16.md) · [BOM](HERBIE_V1/PARTS.csv) · [asset provenance](docs/HERBIE_ASSET_GUIDE.md)
- The previous viewer is preserved at [legacy.html](legacy.html); the original [18-part library](library.html) remains usable.

New project directories are discovered at build time; the Library's Refresh also checks the public repository tree for future McGruber and other projects.

## Hosting status

The workshop is deployed at the **Open Workshop** link above. The deployed static assets were retrieved over HTTPS and compared to the browser-tested production build.

The [GitHub Pages workflow](.github/workflows/pages.yml) builds and tests the full application, then publishes `dist/`. **Pages itself still requires one account setting:** [Settings → Pages](https://github.com/jimedusot-beep/3D-vision/settings/pages) → **Source: GitHub Actions**. The development connector cannot change that administration setting. The expected Pages address still returns 404 until activation. See [deployment instructions](docs/DEPLOYMENT.md).

## Development

Node 22.12+:

```sh
npm ci
npm test
npm run build
npm run dev
npx playwright install --with-deps chromium
npm run test:browser
```

The browser suite uses the production bundle and real model files; it loads, manipulates, saves, reopens, packages, exports and reimports geometry. A separate macOS WebKit job checks the iPhone-size workflow. This is emulation, not a physical iPhone certification.

Internal coordinates use millimeters with Z up. Standard GLTF import/export converts meters and Y up; original H.E.R.B.I.E. GLBs have a repository-specific coordinate path. See the architecture guide for import limits and storage behavior.

Parametric sketches/joints, exact solid collision detection, wall-thickness analysis, hole filling, STEP/IGES and authenticated cloud syncing are **not implemented**. Print quality, joint fit, fasteners, thermal/electrical requirements and structural loads remain unverified.

Open-source dependencies and distributed license texts: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Existing CAD/artifact provenance is preserved.
