# Third-party software

The workshop uses original application code with the following open-source dependencies. It does not incorporate proprietary Autodesk, Onshape, Sketchfab, Blender or slicer application code.

| Package | Pinned version | License | Purpose | Upstream |
|---|---|---|---|---|
| three | 0.180.0 | MIT | Rendering, loaders, exporters, orbit/transform controls | https://github.com/mrdoob/three.js |
| three-bvh-csg | 0.0.17 | MIT | Actual mesh Boolean operations in a worker | https://github.com/gkjohnson/three-bvh-csg |
| three-mesh-bvh | 0.9.1 | MIT | Geometry acceleration used by CSG | https://github.com/gkjohnson/three-mesh-bvh |
| fflate | 0.8.3 | MIT | Project packages and 3MF archive support | https://github.com/101arrowz/fflate |
| Vite | 7.3.7 | MIT | Development and static bundling | https://github.com/vitejs/vite |
| Playwright | 1.56.1 | Apache-2.0 | Automated browser QA; development only | https://github.com/microsoft/playwright |

Full runtime dependency license texts are distributed in `public/licenses/` and the published `licenses/` directory. `package-lock.json` records the resolved dependency graph. Existing H.E.R.B.I.E. CAD, generated artifacts and research references retain their original provenance and are not relicensed by this notice.
