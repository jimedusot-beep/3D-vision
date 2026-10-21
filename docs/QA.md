# Verification report

Development verification, October 20, 2026 (America/New_York).

## Confirmed results

| Verification | Result | Evidence |
|---|---|---|
| Geometry and topology | 8/8 groups passed | Includes all 18 real STL meshes; finite coordinates, topology, undo/redo, groups, duplication/locks, join/separate, repair, input rejection and CSG volume |
| Chromium production build workflows | 24/24 passed | [Passing build/browser run](https://github.com/jimedusot-beep/3D-vision/actions/runs/39528331619) |
| WebKit iPhone emulation on macOS | 6/6 checks passed | Same passing run: actual assembled/exploded GLBs, touch transforms, saved positions after reload, STL import and GLB export |
| Actual public website in Chromium | 24/24 workflows passed | [Public deployment verification](https://github.com/jimedusot-beep/3D-vision/actions/runs/39528520903) |
| Actual public website in WebKit | 6/6 checks passed | Same public run, macOS WebKit with iPhone 13 viewport/touch settings |
| Live static delivery | 45/45 files matched SHA-256 | Certificate-verified HTTPS retrieval; all 18 STLs, both GLBs, published documents, active bundles/CSS and runtime license notices |
| Dependency audit | 0 known vulnerabilities reported | `npm audit` after fflate 0.8.3 and Vite 7.3.7 upgrades |
| GitHub Pages | Build/tests pass; publication blocked | Site remains disabled at repository settings; independent host is live |

**Working website:** https://jimmy-3d-vision.violethill64.chatgpt.site

The Chromium workflows use the real production bundles with software WebGL. They open both actual GLBs and an individual STL; import device files; transform/undo/redo; group/lock/ungroup; run the Boolean worker; save/reopen via IndexedDB; rename/file-folder originals; reopen named revisions; export and reimport STL/OBJ/PLY/GLB; download/reopen a complete project package; parse OBJ/PLY/OFF/GLTF/3MF fixtures; apply 3MF inch conversion; reject corrupt GLB; inspect statistics and sections; exercise iPhone-size panels/touch; and preserve original library search. Public runs execute the same actions over real HTTPS, without local request interception.

**Boolean evidence:** two 10 mm cubes overlapping by 5 mm produce 1500 mm³ union volume, instead of 2000 mm³ from simply stacking both meshes.

**Persistence fixes verified across engines:** original bytes are stored as ArrayBuffers to avoid WebKit Blob backing-file errors; explicit Save waits for the session write; switching mobile Library/Components keeps the target panel open.

## Boundaries and known limits

Physical iPhone/Android hardware and long-duration low-memory performance are not verified. WebKit emulation uses the macOS engine, not iOS hardware. Broad format support is backed by fixture coverage, not every possible GLTF/3MF extension, animation or material combination.

Surface measurements, dense-mesh CSG numerical edge cases, print overhang checks and material presets are not exhaustively tested. Edge/bounds checks do not prove wall thickness, self-intersection freedom, mechanical strength, clearances or manufacturing readiness. The capability checklist labels partial and pending tools explicitly.

The local preview browser could not initialize WebGL and local browser traffic did not trust the execution proxy's certificate. Those limitations were resolved for verification by using GitHub-hosted browsers against the deployed public site; TLS verification was not disabled.

## Reproduce

```sh
npm ci
npm test
npm run build
npx playwright install --with-deps chromium
npm run test:browser
node scripts/verify-deployment.mjs https://jimmy-3d-vision.violethill64.chatgpt.site/
```

On macOS, install WebKit and run `node tests/webkit.mjs`. Outputs go to ignored `test-results/`; CI uploads them as artifacts. `BASE_URL=https://host/path/ npm run test:browser` or `BASE_URL=https://host/path/ node tests/webkit.mjs` runs against a deployed site. The public verification workflow can be rerun from the Actions tab.
