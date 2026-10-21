# Verification report

Development verification, October 21, 2026.

**Primary website:** https://jimedusot-beep.github.io/3D-vision/

## Current development checks

| Verification | Result | Evidence |
|---|---|---|
| Geometry, storage, cloud contracts and worker lifecycle | 30/30 Node tests passed locally | All 18 STL meshes; CSG volume, transforms/history, joints/chains/cycle rejection, attached measurements, cavities, clearance, known wall sizes, exact original-byte storage, package metadata and cancellation |
| Original Chromium workflows | 25/25 passed locally | Real assembled/exploded GLBs, STL input, transforms, Boolean worker, revisions, saved originals, file folders, all exports/reimports, packages, GLTF companions, 3MF units, mobile panels and original library |
| Graphics-free recovery | Passed locally | Files can be imported, saved, read and downloaded after WebGL fails; cloud link remains accessible |
| New assembly/analysis workflows | 13/13 passed locally in Chromium | Skeleton source units, repository coordinate defaults, hinge/slider/fixed joints, parent propagation, rollback, animation, save/reload/package reimport, attached notes, worker interference, 0.6 mm wall warning/report and idle rendering |
| GitHub-hosted workshop release | 30 Node tests, 39 Chromium checks and 19 WebKit checks passed | [Passing production build / browser run](https://github.com/jimedusot-beep/3D-vision/actions/runs/39585997857) at `100f7f6` |
| Public HTTPS release checks | Automatic after successful Pages publication | [Public Chromium / WebKit runs](https://github.com/jimedusot-beep/3D-vision/actions/workflows/live-site.yml); this suite includes graphics-free recovery against the actual deployed origin |

Local Chromium uses real production bundles with software WebGL. Standard Playwright browser downloads were unavailable in the execution environment, so local Chromium 141 was obtained from the MIT-licensed `@sparticuz/chromium` test runtime. It is not a website dependency. GitHub CI uses Playwright's regular Chromium and macOS WebKit.

## Numerical fixtures

- Real Boolean union: two 10 mm cubes overlapping by 5 mm produce **1500 mm³**, instead of the 2000 mm³ sum of overlapping meshes.
- Interference: intersecting triangles, contained solids, disconnected shells, a hollow cavity and separated rotated rails with overlapping bounding boxes.
- Wall sampling: a **0.6 mm** closed plate warns below 1.2 mm; a **10 mm** cube measures 10 mm normal-ray lengths. Open meshes are rejected for thickness evaluation.
- Joints: hinge rotation about an offset pivot, prismatic and fixed chain propagation, invalid drivers/cycles/frames, limits, save/history and package persistence.

## Boundaries

WebKit uses iPhone 13 viewport/touch emulation on macOS; physical iPhones, older Android hardware and long low-memory sessions remain unverified. Broad format fixtures do not cover every GLTF/3MF extension or material combination.

Interference is floating-point mesh surface/contact and closed-shell parity analysis, without exact overlap volume or self-intersection certification. Thickness is bounded normal-ray sampling and can miss small or tangential features. No slicer, structural, thermal, electrical or physical manufacturing validation is claimed. H.E.R.B.I.E. remains provisional.

The optional cloud adapter has contract tests in this repository; its separate deployed host is not updated or independently certified by this Pages release. Authenticated browser-to-GitHub write syncing remains pending. Static uploads stay in browser storage unless explicitly exported or sent to that separate cloud service.

## Reproduce

```sh
npm ci
npm test
npm run build
npx playwright install --with-deps chromium
npm run test:browser
node scripts/verify-deployment.mjs https://jimedusot-beep.github.io/3D-vision/
```

On macOS, install WebKit and run `node tests/webkit.mjs` and `BROWSER_ENGINE=webkit node tests/advanced-browser.mjs`. Set `BASE_URL=https://jimedusot-beep.github.io/3D-vision/` to exercise the actual public website; otherwise the tests fulfill synthetic HTTPS requests from `dist/` without a web server. CI uploads reports and screenshots from ignored `test-results/`.
