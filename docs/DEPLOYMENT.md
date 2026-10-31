# Deployment

**Primary website:** https://jimedusot-beep.github.io/3D-vision/

`npm ci && npm run build` produces `dist/`. Relative asset URLs work under `/3D-vision/`. Publish that directory; raw repository source imports are not a production build.

## GitHub Pages

Pages is enabled and the custom “Publish 3D Vision website” workflow publishes the tested `dist/` artifact. Each main-branch push runs Node and Chromium tests before uploading the site. It includes bundled engines and workers, discovered repository models/documents and license notices. New project folders also trigger publication.

Successful publication triggers “Verify public 3D Vision website”. It checks the deployed revision using real HTTPS in Chromium and macOS WebKit, including iPhone viewport/touch workflows and saved/reopened joints. These public tests use no local file interception or disabled TLS verification. The workflow has read-only repository permissions.

Repository Settings → Pages should use **GitHub Actions** as its publishing source. A separate branch/Jekyll deployment can overwrite the built artifact with unbundled source. The development connector cannot change that administration setting. The publication workflow logs the configured publishing mode and warns when branch publishing is still active. GitHub’s [Pages settings API](https://docs.github.com/en/rest/pages/pages#update-information-about-a-github-pages-site) requires Pages and Administration write access. Consult the custom publication run and public verification results, not just the presence of a green branch Pages run.

## SLP Anatomy Atlas launch

After the main-branch Pages workflow publishes successfully, open:
**https://jimedusot-beep.github.io/3D-vision/ANATOMY/SLP/systems.html**

The main workshop navigation also contains **SLP 3D Anatomy Atlas · 7 labs**. The Atlas launcher presents all seven separately sourced 3D models plus ten SLP curriculum modules. Each lab loads its own GLB and has model-specific controls and written notes; there is no medically registered single full-body mesh.

The `pages.yml` workflow first runs the unit suite and seven licensed-model Chromium browser tests. A subsequent `live-site.yml` workflow checks the **real deployed URL** in Chromium and WebKit, including the Atlas link and availability/GLB headers of the seven model binaries, neural source manifest and locally served Draco decoder. This is a site-delivery smoke test, not independent anatomy validation.

If the public link still shows an older version, inspect the [Pages publication Actions](https://github.com/jimedusot-beep/3D-vision/actions/workflows/pages.yml) and [live-site tests](https://github.com/jimedusot-beep/3D-vision/actions/workflows/live-site.yml). Confirm GitHub Settings → Pages → Build and deployment → Source = **GitHub Actions**. GitHub Pages may be configured for branch publishing, which can overwrite the production bundle; the workflow warns when it sees that state.

## Other hosts and storage

The same `dist/` can be hosted statically elsewhere. The older Sites mirror is a separate deployment and is not automatically updated from this repository. The private cloud workshop is also separate; see CLOUD_STORAGE.md. This release targets GitHub Pages.

Projects are stored per browser profile and site origin. Export a complete `.3dv` package on the old host and import it on the new host to transfer originals, geometry, joints, materials and annotations. Static hosting does not upload personal models to GitHub.
