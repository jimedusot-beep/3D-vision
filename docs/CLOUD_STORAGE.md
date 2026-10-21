# Private cross-device saving

**Use https://jimmy-3d-vision-cloud.violethill64.chatgpt.site/ for account-backed saving.** It is an owner-private deployment: sign in with the same ChatGPT account on each device. GitHub Pages remains the public browser-local workshop and links to this private service through Cloud.

## Use it

1. Open the private workshop and sign in. Import a file; original bytes, display names, file folders, source units/up-axis and GLTF companions are backed up automatically.
2. Choose **Save revision** to back up the complete assembly, including geometry, placement, joints, annotations and originals. The save indicator confirms account backup or reports a failure while retaining the local revision.
3. On another device, open the same private URL and sign in with the same account. Choose **Cloud → Projects & revisions → Open revision**, or **Cloud → Saved files → Open**. Search file/project names and folders.
4. Keep a complete `.3dv` export as an independent backup. Cloud download verifies the SHA-256 checksum before opening any bytes.

To migrate existing work from GitHub Pages or an older host: export a complete project there once, import it into this private workshop, then Save revision and verify the cloud entry. Browser storage cannot be read across origins. The older `mcgruber-print-lab.jimmysoto1994.chatgpt.site` deployment is outside the Sites available in this connection; it was not modified or migrated automatically.

## Security and persistence

The platform owns sign-in and injects `oai-authenticated-user-id`. Every API operation rejects missing identity and derives an account namespace from its hash. API callers with platform service access still cannot read/write user files without a visitor identity. Never deploy these handlers on an arbitrary server where clients can spoof this header.

Files live in durable R2 storage, independently of browser cache. The private Site's access policy permits only its owner. There are no browser-stored GitHub tokens, shared API keys or embedded R2 credentials. Every write requires matching Origin; metadata also requires JSON. Responses use private/no-store caching, nosniff, bounded filenames/metadata and attachment downloads. File contents are SHA-256 addressed; repeated original bytes are reused.

A file manifest binds the exact original and each GLTF companion hash, together with import settings and labels. Project IDs survive package restore. Each cloud project revision has a separate immutable UUID key and references its complete package; concurrent device revisions cannot overwrite one another. Reusing a revision ID with different contents is rejected. File labels/settings use last-write-wins semantics.

## Backend and deployment contract

- `server/cloud-files.mjs`: `/api/files` and `/api/files/:sha256` list, upload and download account-owned immutable bytes.
- `server/cloud-library.mjs`: `/api/library`, `/api/library/assets/:id`, and `/api/library/projects/:projectId/revisions/:revisionId` maintain file metadata and immutable project revision records.
- `src/cloud-api.js`: account-aware pagination, original-byte deduplication, checksum-verified download and metadata/revision requests.
- `src/cloud.js`: file backup queue, retries, searchable cloud files/projects and revision restore.

The private Sites source uses the supplied Vinext Worker integration, API route adapters and `.openai/hosting.json` with `r2: "BUCKET"`; it remains owner-private. Its `/workshop/index.html` and related static assets are the production Vite build of this repository. Update the client build and backend handlers together, build/test the Worker, then publish via the Sites source workflow. Do not expose a public raw Worker origin that bypasses platform identity enforcement.

Private deployment version 2: source commit `cba90e73d01e8196d8bc32298aca3753b7c26bfe`; deployment `appgdep_6ad90ceca7d8819198dcefde9b334f61` succeeded October 21, 2026. The update preserves the existing R2 bucket and adds a clear retry indicator plus stable project IDs in graphics-free recovery. The Sites source is separately versioned; updating GitHub alone does not deploy the private Worker.

## Verification

- 35 Node tests: existing geometry/storage behavior plus independent cloud clients, exact metadata/companion references, isolation, immutable concurrent revisions, invalid requests and checksum rejection.
- Seven cross-device browser flows use independent contexts (desktop A, iPhone-emulated B, another account C), real workshop bundles and actual server handlers with a deterministic bucket. They cover upload/labels/units, jointed assembly restore, stable project identity, account isolation, failed backup and recovery.
- The private deployment source additionally tests the real R2 emulator across Worker disposal/restart, and the compiled production Worker’s identity enforcement and APIs.
- Hosted deployment is confirmed by Sites. Live access checks distinguish private static access from user-owned APIs; a service credential is not a visitor identity. Real-device hardware and a human sign-in/upload session remain separate verification steps.

## Limits

50 MB per file/package; metadata capped at 64 KB; browser and provider storage limits still apply. Cloud backups are snapshots: original-file backups are automatic, while scene edits need Save revision. Concurrent scenes are retained separately and are not merged. No deletion/retention UI, virus scanning, billing/quota dashboard or offline multi-device merge is provided. Complete revision packages include original bytes and can use more storage than incremental scene-only sync. Preserve independent exports. H.E.R.B.I.E. remains physically untested.
