# Verification report

Development verification, October 20, 2026 (America/New_York).

## Confirmed results

- **8/8 geometry test groups passed.** Includes load/finite-coordinate/topology checks for all 18 real STL meshes, scene undo/redo, grouping, duplication/locks, joining/separating, repair, invalid-input rejection and a real CSG union-volume check.
- **24/24 Chromium browser workflows passed locally** against the production `dist/` bundles with software WebGL. They load the actual GLBs/STL, import device files, transform/undo/redo, group/lock/ungroup, run the Boolean worker, save/reopen via IndexedDB, organize original files, reopen named revisions, export/reimport STL/OBJ/PLY/GLB, download/reopen complete project packages, parse OBJ/PLY/OFF/GLTF/3MF fixtures, apply 3MF inch conversion, reject corrupt GLB, inspect/clamp sections, use an iPhone-size touch viewport and preserve the original library search.
- **Boolean geometry evidence:** two 10 mm cubes overlapping by 5 mm produce 1500 mm³ union volume, instead of 2000 mm³ from simply stacking both meshes.
- **Live hosting:** Sites reports successful public publication at https://jimmy-3d-vision.violethill64.chatgpt.site . The page returns HTTP 200.
- **45 live static files** were retrieved over certificate-verified HTTPS and matched byte-for-byte (SHA-256) against the tested build. This includes all 18 STL files, both GLBs, published PDFs/images/archive, active JavaScript/CSS and runtime license notices.
- **GitHub Actions:** [Pages validation run](https://github.com/jimedusot-beep/3D-vision/actions/runs/39526620633) passed npm installation, 8 geometry groups, production build, all then-current 22 Chromium workflows and artifact upload. Its separate deployment job failed at Pages configuration because Pages remains disabled.

## Verification boundaries

The locally managed preview browser could not initialize WebGL. Automated Chromium uses explicit software rendering and successfully displays the real meshes. A direct Playwright request to the live domain was stopped by the execution environment's proxy certificate trust; TLS verification was not disabled. Live assets were instead verified using the environment's trusted HTTPS client and compared with the browser-tested production bytes. Thus live asset delivery is confirmed; a complete remote mobile-browser session is not claimed.

Linux WebKit dependencies could not be installed in the local container. The initial Linux CI WebKit attempt did not produce a timely result; the revised workflow runs a dedicated WebKit test on macOS and always closes browser processes on failure. Its final status should be read from [the workshop workflow](https://github.com/jimedusot-beep/3D-vision/actions/workflows/smoke-viewer.yml). Physical iPhone testing remains pending.

Surface measurements, material combinations, all possible file extensions/3MF features, CSG numerical edge cases and high-memory mobile workloads are not exhaustively verified. Bounds/edge checks are preliminary, not manufacturing certification.

## Reproduce

```sh
npm ci
npm test
npm run build
npx playwright install --with-deps chromium
npm run test:browser
node scripts/verify-deployment.mjs https://jimmy-3d-vision.violethill64.chatgpt.site/
```

On macOS, install WebKit and run `node tests/webkit.mjs`. Outputs go to ignored `test-results/`; CI uploads them as artifacts. `BASE_URL=https://host/path/ npm run test:browser` runs the same workflow against a deployed site where the browser has network access and trusts the connection.
