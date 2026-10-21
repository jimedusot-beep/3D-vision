# Persistent workshop storage

The private cloud workshop is https://mcgruber-print-lab.jimmysoto1994.chatgpt.site/ . GitHub Pages remains static and does not provide server persistence.

## Save and restore

Imported originals are saved locally first, then queued for account-scoped cloud backup. Save revision creates an immutable complete project backup. Cloud provides Open, Download and Retry. Local edits are not continuously synchronized; concurrent devices do not merge scenes. Raw originals alone do not retain import units: use a complete .3dv backup. Local folders and display names are not cloud-synced.

Previous-host storage cannot be read from another origin. Export one complete project on the old host and import it into the private workshop. Verify the backup before clearing old browser data.

## Backend contract

server/cloud-files.mjs exports handleFilesRequest(request,bucket). Sites Vinext routes import env from cloudflare:workers and invoke the handler with env.BUCKET. Map /api/files and /api/files/[id]; declare r2: "BUCKET" in .openai/hosting.json. Serve the built Vite client at the same origin. Preserve owner-private access.

The backend trusts only the platform-injected oai-authenticated-user-id. It hashes identity into an R2 namespace, hashes bytes for immutable deduplication, requires same-origin POSTs, bounds uploads at 50 MB, validates names/extensions, paginates listings and serves attachments. Missing identity/storage is an error. Do not mount this handler on an arbitrary public server where users can spoof that header. No browser tokens or GitHub/R2 secrets are embedded.

No deletion UI, retention cleanup, scene conflict resolution or antivirus scanning is provided. Designs remain provisional and physically untested.

## Verification

npm test covers byte-exact cloud uploads, deduplication, user isolation, rejected writes, legacy GLTF recovery, dependency aliases, exact names, units, atomic metadata patches and fresh/offline caches. npm run build validates bundling. Browser CI covers GLTF reopening, forced-WebGL-failure file recovery, Chromium workshop workflows and WebKit mobile. Backend unit tests use a fake bucket; the deployment checkout additionally tests actual Miniflare persistence across worker restart. Unit checks alone do not certify live account access or physical-device graphics.
