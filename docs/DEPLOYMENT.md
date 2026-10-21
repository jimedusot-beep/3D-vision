# Deployment

`npm ci && npm run build` produces `dist/`. The asset URLs use relative paths and work under `/3D-vision/`. Deploy the directory without serving repository source or `node_modules`.

## GitHub Pages

The Pages workflow now builds, runs geometry tests and browser workflows, uploads the complete `dist/` artifact, then deploys it. It includes bundled engine modules, worker, 18 STL files, both GLBs, documents and license notices.

One account-level prerequisite remains: open repository **Settings → Pages**, set **Source → GitHub Actions**. The GitHub connector used to develop this version cannot change repository administration settings. GitHub's `configure-pages` action explicitly requires a token other than `GITHUB_TOKEN` to activate a previously disabled site. No personal token is embedded or requested by this project.

Once enabled, rerun “Publish 3D Vision website” at https://github.com/jimedusot-beep/3D-vision/actions/workflows/pages.yml. Expected URL: https://jimedusot-beep.github.io/3D-vision/ . This expected address is not proof of a live deployment; consult the run and public response.

## Independent static hosting

The same built application can be hosted on Sites, Netlify, Cloudflare Pages or another static host. A Sites publication was prepared during development so that the workshop can be used without waiting for the Pages setting. The final development report records its actual successful URL and verification.

Projects are stored per origin: if switching from one host to another, export a `.3dv` package on the old host and import it on the new one.
