# 3D Vision — browser 3D assembly workshop

## Connected H.E.R.B.I.E. engineering workshops

- **Body (this repo):** CAD, printable parts, GLB assemblies and interactive 3D viewing, including projects beyond H.E.R.B.I.E.
- **Brain:** [Herbie](https://github.com/jimedusot-beep/Herbie) — software and simulated behaviors.
- **Electronics:** [Herbie-cyborg-hardware](https://github.com/jimedusot-beep/Herbie-cyborg-hardware) — preliminary circuitry and physical integration plans.
- [Mechanical handoff guide](docs/HERBIE_CROSS_REPO_INTEGRATION.md) · [Mechanical part IDs](HERBIE_V1/PARTS.csv)

All 18 H.E.R.B.I.E. CAD parts remain provisional; no physical fit is certified.

**[OPEN 3D VISION ON GITHUB PAGES](https://jimedusot-beep.github.io/3D-vision/)** · [Optional private cloud workshop](https://mcgruber-print-lab.jimmysoto1994.chatgpt.site/) · [Previous static workshop](https://jimmy-3d-vision.violethill64.chatgpt.site)

A free static web application for loading, assembling, inspecting and exporting real mesh models. It includes the existing 18 H.E.R.B.I.E. STL parts, both GLB assemblies, editable CAD sources and engineering documents. H.E.R.B.I.E. V1 remains **provisional and physically untested**.

## McGruber Lab — repository-driven experiments

**[Experiment 001: H.E.R.B.I.E. Skeleton Workshop](EXPERIMENTS/001_HERBIE_SKELETON/README.md)** · [Generated models and files](EXPERIMENTS/001_HERBIE_SKELETON/) · [Automated generation](.github/workflows/experiment-001.yml)

This reproducible repo experiment includes **five-part skeleton assembled/exploded GLBs**, a separate **electronics space-reservation GLB**, **18-part printer size screening CSV**, assembly transforms in JSON, and a ZIP. The experiment guide covers all eight workflows: assemble, explode, measure, printing checks, join/Boolean editing, electronics study, presentation, and library backups.

**Important:** GitHub automates source-derived files; interactive edits made in a browser are still saved locally unless you export and explicitly commit them. Automatic authenticated browser-to-repository syncing is not implemented. All models remain preliminary and untested.

## Save your uploaded files and work

1. **Import files** from your device, or import a public URL/GitHub file link. Original files are retained in **My files**, with searchable folders and display names. Identical bytes are stored once.
2. Use the component tree and transform tools. **Save revision** keeps a named project; **My projects** reopens saved revisions. The last workspace is also autosaved.
3. **Export → complete project (.3dv)** creates a portable backup containing scene geometry, component placement and original files. Import the package to move between devices or hosts.

On the **private cloud workshop**, imported originals are automatically backed up to your signed-in account using durable server storage. **Save revision** backs up a complete `.3dv` project, including geometry, companion files, units and placement. Open **Cloud** on another device to restore it. Upload failures are shown explicitly; local copies remain available. Maximum file/package size: 50 MB. Raw originals open with default units; restore a complete project to retain import settings.

Static/GitHub Pages hosts remain **browser-local** and link to the cloud workshop. Clearing site data can remove local-only copies. Existing files on the previous static host are not transferred automatically: export a complete project once and import it into the cloud workshop. No browser-to-GitHub write access or personal tokens are used.

## Working capabilities

- Import STL, OBJ, GLB, self-contained/companion GLTF, 3MF, PLY and OFF meshes; load multiple components together.
- Orbit, zoom, pan, fit, camera presets, perspective/orthographic views, wireframe, materials, opacity and lighting.
- Move, rotate, scale, duplicate, rename, hide, isolate, lock, group, align and grid-snap components. Undo and redo.
- Separate tools for visual groups, joined triangles and a **real geometric Boolean union** in a bounded worker.
- Fixed, revolute and prismatic assembly joints with pivots, travel limits, animation and saved poses.
- Component-attached distance/angle measurements and annotations; bounding dimensions, topology/normal reports and visual section planes.
- Worker-based triangle interference, closed-shell containment and clearance checks; preliminary inward-ray wall-thickness sampling.
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

New project directories are discovered and deployed at build time; nonstandard source coordinates are declared in `model-import-settings.json`. The Library's Refresh also checks the public repository tree for future McGruber and other projects.

## Hosting status

The private workshop uses a Sites Worker with per-user R2 file storage. The previous public/static host is a separate deployment and is not updated automatically by this repository. See [storage deployment and verification](docs/CLOUD_STORAGE.md). Historical public-site QA results are not evidence for the new cloud deployment.

The **[GitHub Pages website](https://jimedusot-beep.github.io/3D-vision/)** is live. The [publication workflow](.github/workflows/pages.yml) tests and publishes the bundled `dist/` artifact. Successful releases automatically trigger [public Chromium and WebKit verification](.github/workflows/live-site.yml). See [deployment instructions](docs/DEPLOYMENT.md).

Pages retains uploads in your browser's IndexedDB. It does not publish your imported files to this public repository. Export a `.3dv` backup to move work between devices or origins; the separately hosted cloud adapter is documented in [CLOUD_STORAGE.md](docs/CLOUD_STORAGE.md).

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

Parametric sketches/joints, exact solid collision detection, wall-thickness analysis, hole filling, STEP/IGES and automatic browser-to-GitHub syncing are **not implemented**. Print quality, joint fit, fasteners, thermal/electrical requirements and structural loads remain unverified.

Open-source dependencies and distributed license texts: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Existing CAD/artifact provenance is preserved.
