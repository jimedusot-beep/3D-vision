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


## Third-party anatomy data (separate from software licenses)

**Important:** The educational 3D anatomy models are not MIT-licensed merely because Three.js and this workshop's own code are. Each GLB retains its own copyright, attribution, share-alike license and modifications. The published anatomical viewers provide the more detailed individual mesh identifiers, pinned source commits, transformation notices, and limitations in [SLP evidence and license notes](ANATOMY/SLP/about.html).

| Anatomy model | Original / adapted source | Source data license | In Atlas |
| --- | --- | --- | --- |
| Larynx | [BodyParts3D 4.3 / DBCLS, via OrganUI](https://github.com/organui/larynx-3d) | [CC BY-SA 2.1 Japan](https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en) | 20 groups |
| Lungs and bronchial trees | [BodyParts3D 4.3 / DBCLS, via OrganUI](https://github.com/organui/lungs-3d) | CC BY-SA 2.1 Japan | 20 groups |
| Diaphragm and landmarks | [BodyParts3D 3.0 / DBCLS, via OrganUI](https://github.com/organui/organui) | CC BY-SA 2.1 Japan | 13 groups |
| Oral structures and salivary glands | [Z-Anatomy and BodyParts3D / DBCLS, via OrganUI](https://github.com/LluisV/Z-Anatomy) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 15 groups |
| Pharyngeal / velopharyngeal muscles | [BodyParts3D 4.3 / DBCLS, via OrganUI](https://github.com/organui/pharynx-3d) | CC BY-SA 2.1 Japan | 20 groups |
| Right ear and hearing | [Z-Anatomy via OrganUI](https://github.com/organui/ear-3d) | CC BY-SA 4.0 | 16 groups |
| Cranial nerves / brainstem subset | [Brain Project](https://github.com/itayinbarr/brainproject), Z-Anatomy / BodyParts3D-derived mesh | CC BY-SA 4.0; upstream app code Apache-2.0 | 74 records from a larger model |

BodyParts3D / Anatomography is © The Database Center for Life Science (DBCLS). Z-Anatomy contributors include Gauthier Kervyn, Lluís Vinent Juanico, and others. OrganUI and Brain Project adapted source geometry; neither the original licensors nor the adaptors endorse this Atlas. Source-specific changes, including mesh grouping, surface normals, source coordinate transforms, centering and scaling, are described in the original linked records and in-page credits.

The **seven source-model coordinate spaces have not been registered to each other**. The ten-area Atlas topic map is a curriculum navigation graph, not a physical merged human body. Clinical accuracy and diagnostic use are not certified. Reusers should consult the exact license terms, attribution and share-alike obligations applicable to each model rather than treating this table as a replacement license notice.
