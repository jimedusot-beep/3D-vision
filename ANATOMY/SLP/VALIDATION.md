# SLP larynx atlas — evidence and validation plan

**Status:** engineering prototype. The ten displayed meshes are original, intentionally schematic Three.js primitives. There has been **no anatomical landmark, dimensional, spatial, or expert validation** of the meshes. Do not print, diagnose from, or assess clinical competency using these shapes.

## What has actually been checked

| Claim or component | Evidence | Status |
| --- | --- | --- |
| Thyroid cartilage is the principal anterior protective cartilage | OpenStax A&P 2e §22.1; NCBI Larynx | Text reference supported; 3D shape unvalidated |
| Cricoid lies inferior to thyroid and forms a complete ring | OpenStax A&P 2e §22.1; NCBI Larynx | Text reference supported; geometry unvalidated |
| Arytenoids articulate on posterior cricoid, provide vocal processes | NCBI Laryngeal Muscles | Text reference supported; geometry unvalidated |
| Paired true vocal folds contribute to phonation | OpenStax A&P 2e §22.1 | Text reference supported; no validated vibration simulation |
| Posterior cricoarytenoid abducts vocal folds, opening the glottis | NCBI Laryngeal Muscles | Text reference supported; muscle path not anatomically modeled |
| Lateral cricoarytenoid adducts vocal folds, closing the glottis | NCBI Laryngeal Muscles | Text reference supported; muscle path not anatomically modeled |
| Perspective rotation, selection, isolate, transparency and labels | Browser automation | Software behavior tested; no claim about physical anatomy |
| H.E.R.B.I.E. host bridge | Same-origin request tests and disallowed-origin test | Message contract test only; no integration with the H.E.R.B.I.E. app |
| Offline document-study linking | None | Not implemented |
| Real phone usability, educational efficacy, accessibility with assistive tech | None | Not verified by automated device emulation |

**References used for text (not source meshes):**
- OpenStax, [A&P 2e, §22.1: Organs and Structures of the Respiratory System](https://openstax.org/books/anatomy-and-physiology-2e/pages/22-1-organs-and-structures-of-the-respiratory-system)
- NCBI Bookshelf, [Anatomy, Head and Neck: Larynx](https://www.ncbi.nlm.nih.gov/books/NBK538202/)
- NCBI Bookshelf, [Anatomy, Head and Neck: Laryngeal Muscles](https://www.ncbi.nlm.nih.gov/books/NBK545265/)

These references do not validate the author's simplified geometry. Source IDs in `structures.json` link each teaching note to its supporting reading.

## Audit pass 1 — evidence coverage and recall (2026-10-30)

- Cross-checked OpenStax §22.1, NCBI Bookshelf *Anatomy, Head and Neck: Larynx* (NBK538202), and *Laryngeal Muscles* (NBK545265) for the six elementary text-only review questions. This is a desk-based source comparison, **not** an independent clinician review or anatomical mesh validation.
- Added an evidence-linked recall panel. Learners reveal a short answer and then see its source links. The software deliberately does not score clinical proficiency, retain individual answers, or infer anything about physiology from the meshes.
- Added a visible list of structures **not modeled**: epiglottis, vestibular folds, cricothyroid, thyroarytenoid/vocalis and interarytenoid muscles, hyoid, relevant laryngeal nerves, vocal ligament layers and detailed glottis. Their absence from the scene is **not** anatomical absence.
- Educational prompts and descriptions contain original short summaries; no chapter text or proprietary lectures were imported.
- **Evidence hierarchy:** publicly cited anatomy prose and short recall answers have source support, model geometry is unvalidated, and educational effectiveness has not been evaluated.
- Target validation: test source links, review-answer hiding, review progression, omitted-structure list, and mobile layout in automated browser runs. A teacher/SLP reviewer must still validate all ten notes and the pedagogical questions before release.

## Audit pass 2 — reliability, older devices and accessibility (2026-10-30)

- Identified a **hard startup failure** when the browser has no working WebGL context: the old viewer constructed a renderer unconditionally, preventing access to otherwise usable text notes.
- Added a WebGL-failure path that retains named structures, referenced descriptions, and text-only recall. The 3D stage announces unavailable graphics; its misleading keyboard focus is removed. No 3D interactivity is claimed when the browser lacks hardware support.
- Added camera keyboard zoom bounds consistent with the orbit controls (2.5–16 scene units). This only improves navigation; these arbitrary display units **are not anatomical dimensions**.
- Added desktop-browser automation that deliberately disables WebGL and verifies text, citations, recall, and reset. Existing Chromium/iPhone-WebKit render tests still need to pass on the final branch.
- Added live announcements for reveal answers. Screen-reader and actual-device manual testing still remain open acceptance gates.
- **Release status:** code and browser tests on the draft branch do not make the atlas clinically validated. Keep both anatomy and Herbie document search integration unmerged until review.

## Audit pass 3 — published evidence, patient-side orientation, and graphics continuity (2026-10-30)

- **Anatomical laterality correction:** In a subject-facing anterior view, anatomical left appears on the observer's right. Earlier schematic geometry used a viewer-side mapping. Paired objects now use a shared `sideX` convention and the catalog explicitly declares `+X` as subject-left, `-X` as subject-right, `+Z` anterior and `+Y` superior. This corrects the **label convention**, not the clinical accuracy of the 3D meshes.
- **Broken release-resource risk:** The live viewer previously linked to `SOURCES.md`, which the Vite multi-page build does not explicitly publish. Added a dedicated `about.html` Vite entry with evidence and limitations, and tests loading that page from the production `dist/` output. Scientific reference links are external and may require Internet; short study notes remain accessible without opening them.
- **Accessibility:** Repeated isolate buttons now have distinct accessible names. A mid-session WebGL context-loss event exposes a text-first status; notes, reference links, and recall remain usable. Renderer recovery is browser/driver dependent; no physical-device recovery certification is claimed.
- **Reference check:** Verified titles and links for OpenStax *Anatomy and Physiology 2e* §22.1 and NCBI Bookshelf `NBK538202` and `NBK545265`. These support contextual written descriptions, not the geometry; StatPearls text is paraphrased, not redistributed as an article. Source and provenance review for actual 3D meshes remains unfinished.
- **Automated acceptance:** Unit tests assert the coordinate convention and published source-page configuration; browser tests open the compiled evidence page and exercise mid-session context loss. Release requires green **final-commit** CI, real phone/assistive-technology checks and independent anatomy review.

Reference context for anatomical sidedness: [DICOM human orientation](https://dicom.nema.org/medical/dicom/current/output/chtml/part03/sect_C.7.6.2.html) and [anatomical position explanation](https://med.libretexts.org/Bookshelves/Anatomy_and_Physiology/Human_Anatomy_Laboratory_Manual/01%3A_Overview_and_the_Microscope/1.02%3A_Anatomical_Position_and_Planes).

## iPhone screen capture investigation — high-DPI canvas clipping (2026-10-31)

A real Safari screenshot showed the unvalidated 3D sketch clipped in the **lower-right** with several projected labels overlapping near the center. This was not merely a subjective preference: the viewer called `renderer.setPixelRatio(Math.min(devicePixelRatio,2))` and `renderer.setSize(stageWidth,stageHeight,false)`, but the CSS provided no definite canvas width/height. Consequently its high-resolution **drawing buffer pixel dimensions became its CSS layout dimensions** on Retina devices, while the stage clipped its contents. The scene and labels used different visual coordinate systems.

Correction:
- Explicitly size the canvas to exactly 100% of the stage in **CSS pixels**, use absolute positioning and keep the device-resolution backing buffer for clarity. No medical geometry changes.
- Center the optional sketch with a modestly closer front/back camera preset; hide floating overview labels on narrow screens, leaving one only when a structure is selected.
- Reduce the mobile header and warning footprint while preserving explicit warnings about schematic/unvalidated geometry.
- Add a high-density iPhone browser regression asserting the canvas *rendered bounding rect* exactly matches its parent even when `canvas.width` is significantly larger in device pixels. The test also checks no overlapping default labels and camera-preset controls.

**Release gate:** maintain separate draft PR and manually deployed Render preview; do not treat desktop rendering alone as proof of phone correctness. Actual on-device Safari and VoiceOver reviews remain required.

## Visual safety audit — structure/function map (2026-10-31)

**Observed usability problem:** the first-release canvas drew an assembly of arbitrary cylinders, cones and rods, using ten projected labels. That appearance was difficult to interpret and could incorrectly imply a realistic laryngeal reconstruction. Changing lighting or sculpting novel anatomy without validated source meshes would worsen scientific misrepresentation.

**Remediation:** the default view is now a clearly titled, interactive **functional concept map**. Four groups use the existing ten entries and their already referenced descriptions: supporting cartilages, true vocal folds, posterior cricoarytenoids (abduction), and lateral cricoarytenoids (adduction). A conspicuous explanation says this map is **not spatial anatomy**. Selecting an item highlights the corresponding sidebar entry and opens its cited note. Existing H.E.R.B.I.E. selection messages continue to work.

**3D retained by consent:** a distinct *3D sketch* toggle retains the earlier simplified model for exploring mouse/touch rotation. The sketch explicitly says it is not an anatomical reconstruction, clinical resource, or measuring tool. The original CAD workshop is separate and unmodified. Only four overview labels are shown until an item is selected; its single label remains legible. Camera front/back presets are navigational controls only, not anatomical validation.

**Device and accessibility:** map buttons use native buttons and pressed state, and remain usable when WebGL initialization fails or an older browser cannot render 3D. The sketch animation loop is inactive in map mode. Browser automation checks map grouping, selection synchronization, optional 3D access, and fallback on desktop and emulated iPhone WebKit. Manual screen-reader and physical-device checks remain required.

**Unresolved academic gate:** this is a structure-and-function concept **map**, not an anatomical atlas. A truly university-quality 3D larynx requires source-licensed meshes with provenance, spatial registration, landmark validation, educator review and acceptance testing. No outside assets, private lectures or diagnostic functions were imported.

## Findings and risk controls

1. **High scientific risk:** the current meshes are placeholders with arbitrary units; users could mistake them for accurate representations. Keep a prominently visible caution, disabled phonation button, and note next to every referenced explanation.
2. **High downstream risk:** animation of phonation before validating attachments, axes, folds, muscle actions and geometry would teach misleading mechanics. Keep it disabled.
3. **Medium provenance risk:** open anatomy viewers sometimes combine data from sources under different Creative Commons terms. **Do not copy models based solely on a viewer's code license.** Track each candidate model's source repository, author, exact file, version/hash, format, modification, attribution, license and restrictions. Do not import content with non-commercial terms into a potentially commercial/redistributed package without review.
4. **Medium interaction risk:** an orbit drag may emit a click event; the viewer now filters movement before mesh selection.
5. **Medium host-boundary risk:** the iframe message contract must not gain unrestricted import, hardware, file, microphone or patient-data actions; use exact origin matching and source checks.
6. **Low-to-medium mobile/accessibility risk:** automation covers viewport and interaction; not a substitute for actual touch, screen-reader and keyboard usability checks.

## Proposed evidence gates before release

**Gate A — Educational text:** an SLP/anatomy-qualified reviewer checks terminology, laterality, function and reference accuracy for each source-linked entry and records their decision.

**Gate B — Dataset provenance:** for each replacement GLB/mesh, preserve original source URL, attribution, license, version/commit, checksum, transformations, and permitted use. Review source-specific terms; do not assume Z-Anatomy or a derivative atlas is wholly permissive.

**Gate C — Spatial verification:** compare each replaced structure with a recognized anatomy reference from anterior/posterior/superior perspectives. Verify size relations, laterality, origin/insertions, and orientation; document any discrepancies. No clinical claims based on visual similarity alone.

**Gate D — Software QA:** run `npm test`, `npm run build`, desktop Chromium and iPhone WebKit browser suites, ensure exact-origin contract behavior, check no workshop regressions, and perform accessibility/real-device spot checks.

**Gate E — H.E.R.B.I.E. integration:** connect a versioned, minimal, source-aware selection API to the existing H.E.R.B.I.E. app only after its branch integration and failing CI checks are understood. Never combine personal memory and private coursework indices; avoid copying private SLP files to the public viewer.

**Gate F — Educational study:** only after scientific review, run a small usability study with SLP learners using predefined tasks (find, isolate, explain, and cite structures). Record errors and changes. Do not claim the application improves learning without actual learner results.

## Future modeling candidates — research, not incorporated

- [Z-Anatomy community](https://github.com/LluisV/Z-Anatomy) — inspect exact model assets and source-specific licensing.
- [3D Anatomy / nqwrc](https://github.com/nqwrc/3d-anatomy) — browser viewer of Z-Anatomy-derived material, with mixed licensing, including non-commercial assets; do not copy wholesale.
- [OpenStax](https://openstax.org/) and NCBI Bookshelf — independent textual references, **not** automatically a license to redistribute anatomical 3D meshes.

Until these gates pass, keep this branch draft and keep the anatomy objects outside the robot's print-ready CAD and export workflow.
