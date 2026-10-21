# Architecture and development

This is a static, client-side mesh workshop, designed for a GitHub Pages subdirectory or any static host. All runtime dependencies are bundled; the new workshop does not depend on a JavaScript CDN. The preserved legacy viewer still uses its original CDN.

- `src/core.js`: scene operations, validation, topology inspection, grouping, joining, repair and undo/redo.
- `src/main.js`: renderer, UI, transform gizmos, library, measurements, saved projects, presentation and orchestration.
- `src/io.js`: model loaders/exporters, URL import, bounded archive handling and `.3dv` packages.
- `src/storage.js`: IndexedDB originals, named revisions and autosaved session.
- `src/joints.js` and `src/joint-panel.js`: acyclic fixed/revolute/prismatic transforms and controls; scene-owned saved definitions.
- `src/annotations.js`: component-local anchors and live distance/angle values.
- `src/analysis.js`, `src/analysis.worker.js` and `src/tasks.js`: bounded BVH interference and normal-ray wall sampling, progress, cancellation and worker termination.
- `src/boot.js` and `src/file-mode.js`: graphics-independent file recovery when WebGL cannot start.
- `src/cloud.js` and `server/cloud-files.mjs`: optional authenticated private storage adapter, separately deployed (CLOUD_STORAGE.md).
- `src/boolean.js` and `src/boolean.worker.js`: BVH CSG; 20-second worker timeout.
- `scripts/discover.mjs`: generates the catalog from repository files at build time. New project directories are included. Live Refresh additionally reads the public GitHub tree.
- `scripts/copy-assets.mjs`: copies discovered model/document assets after Vite builds, preserving relative paths.

## Run

Use Node 22.12+ (or a supported newer Node).

```sh
npm ci
npm test
npm run build
npm run dev
npx playwright install --with-deps chromium
npm run test:browser
```

Browser tests intercept a synthetic HTTPS origin and fulfill requests directly from `dist/`, so they exercise the production bundles, real WebGL and browser APIs without external CDN access or a separate web server. Set `BASE_URL` to an actual deployed site to test over real HTTP instead. Run `node tests/webkit.mjs` after installing WebKit for the dedicated iPhone-viewport workflow; the CI runner uses macOS. Chromium uses software WebGL in headless CI.

## Data and coordinate contracts

Internal mesh units are millimeters, with Z up. Unitless STL/OBJ/PLY/OFF defaults to mm; device/URL import offers explicit mm/cm/m/in overrides. Standard GLTF/GLB uses meters and Y up, converted on import and reversed on export. The existing generated H.E.R.B.I.E. GLBs have nonstandard CAD coordinates and declare `units:mm` and `up:z` in `model-import-settings.json`. Skeleton experiment GLBs use the same explicit metadata. Device and URL imports offer independent source up-axis overrides; original import options persist in saved asset bundles. 3MF units are applied; mixed-unit model archives are rejected.

Imports bake static world transforms into independent components, retaining mesh materials. Native hierarchy is flattened; the workshop can create new visual groups. Animations and skinned meshes are not supported. GLTF companions must be selected together; missing/external companion URIs are rejected rather than fetched implicitly. GLBs should be self-contained. OBJ MTL sidecars are not currently loaded.

Original file bytes are SHA-256 keyed in IndexedDB as ArrayBuffers for WebKit compatibility, with legacy Blob records still readable; identical bytes are stored once with source and filename aliases. Reopening a saved project needs no network. Named projects retain up to ten complete scene revisions. Autosave retains the current workspace. Folder metadata exists for projects and saved originals. A `.3dv` ZIP contains `project.json` and content-hashed original files. Browser data is scoped to a device, browser profile and site origin; export/import packages to migrate between hosts.

Undo keeps at most 15 snapshots within a 32 MB serialized budget. Imports are limited to 50 MB per file, 500,000 triangles and 200 components per workspace. Boolean input is limited to 80,000 combined triangles; annotations and labels are capped. Lower limits may still be appropriate on older phones. Expanded archives are capped before extraction. Storage quota failures are shown instead of claiming success.

## Security and optional authenticated GitHub sync

The deployed static workshop does **not** write to GitHub, accept access tokens, or pretend that the ChatGPT connector is available to website visitors. Public raw URL imports and public tree discovery are supported without auth, subject to CORS/rate limits.

Authenticated syncing needs a separate backend and is pending. Recommended design:

1. A GitHub App installed for explicitly selected repositories; OAuth or GitHub App sign-in with state/PKCE, plus a secure HttpOnly SameSite session cookie.
2. Server-side encrypted installation/user tokens, narrow repository contents permissions, refresh/revocation, CSRF protection and explicit user-selected sync paths.
3. A backend endpoint accepts project packages, writes a branch, and opens a reviewable PR. Use blob hashes and optimistic commit leases to avoid repeated transfer and overwrites.
4. Validate package size/shape server-side; never log credentials or place client secrets in Pages assets. Make public-repository visibility explicit before uploading personal models.

The browser library remains usable without that GitHub backend. The optional private cloud adapter uses authenticated ownership and durable object storage on a separate host; Pages remains local (CLOUD_STORAGE.md).

## Joint and analysis contracts

Joint definitions live in `scene.object.userData.joints`; base matrices record the parent-relative zero pose. Revolute pivots and slider axes are parent-local. Dependencies are applied in topological order; cycles, multiple drivers, nonuniform/sheared frames and out-of-range travel are rejected. Endpoints stay top-level; grouping them fails atomically. Deleting or replacing an endpoint removes its associated joints. Imported originals and exported meshes remain independent of joint definitions; complete project packages retain them.

Analysis bakes current world-space geometry into a worker. Bounding boxes prune pairs; triangle contact and ray-parity shell containment determine the reported classification. Clearance checks measure nearest surface separation. Thickness reports sample evenly spaced triangle centroids and inward normals on closed, consistently oriented meshes. These are numerical mesh aids with explicit limits, not an exact CAD/contact or manufacturing solver. Analysis results become stale after scene edits and must be rerun.

The viewport renders on demand. Orbit damping, turntable, exploded previews and joint animation request further frames; hidden tabs stop motion. Scene edits refresh component-attached measurements and labels.
