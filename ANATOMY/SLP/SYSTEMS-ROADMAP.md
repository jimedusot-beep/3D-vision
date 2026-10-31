# H.E.R.B.I.E. SLP Systems Atlas — incremental curriculum plan

**Intent:** An interactive, beginner-friendly **digital study atlas** of the physical systems and foundational knowledge relevant to speech-language pathology, not a school display model, printable body, anatomical reference for clinical decisions, or a substitute for a degree program.

## Current public-preview coverage

| Area | Stage | Current implementation | Honest next development |
| --- | --- | --- | --- |
| Respiratory system | **Source-derived lung/airway 3D + study starter** | 20 verified source groups: 17 tissue segments, trachea, two bronchial trees. Separate viewer, lobe separation, 10 written concepts, SVG, inspiration/exhalation comparison, 6 recall questions, 5-stop 3D tour, and 6- or 20-question region-identification practice with source-group reveal | Separate source-derived 3D diaphragm lab added (BodyParts3D 3.0, 13 nodes). Next: licensed ribs/intercostals/alveoli; cross-version coordinate registration unresolved; expert review |
| Phonation / larynx | **Source-derived 3D** | 20 source-model groups; original study map; rigid exploded study; cited source notes; guided tour and 20-part quiz | Reviewed layered true-fold geometry, academic validation |
| Resonance / velopharynx | Outline | learning objectives, ASHA pointer | Licensed palate/pharynx/nasal cavity surfaces |
| Articulation / orofacial | **Partial licensed oral 3D** | 15 Z-Anatomy nodes shared with swallowing: tongue, mandible, hyoid, salivary glands/ducts; learning objectives | Lips, teeth, soft palate, true tongue muscle layers and validated articulatory motion |
| Neural control | Outline | learning objectives, ASHA pointer | Cranial nerves, brainstem, sensorimotor pathways |
| Hearing / auditory | Outline | learning objectives, ASHA pointer | Outer/middle/inner ear, central hearing pathways |
| Swallowing / feeding | **Partial licensed oral 3D** | Oral-phase tongue, jaw, hyoid and salivary anatomy; other lesson objectives remain outlines | Pharyngeal and esophageal surfaces, airway protection and clinically reviewed swallowing phases |
| Phonetics / acoustics | Outline | learning objectives, ASHA pointer | Accessible sound physics and source-filter demonstrations |
| Language / cognition / development | Outline | learning objectives, ASHA pointer | Study maps for non-anatomical concepts |
| Disorders and clinical connections | Outline | learning objectives, ASHA pointer | Qualified review of clinical images and evidence |

The grouping into ten areas is an **internal teaching/navigation design**, not a statement that ASHA mandates precisely ten body systems. SLP clinical knowledge additionally encompasses fluency, social communication, AAC, literacy, developmental and cultural/linguistic factors, which should be explicitly represented as this curriculum grows.

## Current respiratory study milestone — source-model active recall

- The lungs viewer now supports a **six-question warm-up**, choosing one BodyParts3D mesh group from each source-defined region, and a **full 20-question review**, one for each original pinned FMA group (17 lung tissue segments, trachea, two bronchial trees).
- Questions ask for the model group’s **region/lobe**, not unverified pathology, unseen alveoli, airflow measurements, or diaphragm biomechanics. Four distinct answers are derived from the existing six manifest regions, and the correct answer is revealed with a short source-linked note.
- The question does not disclose the selected source group in the model controls before the answer. After response, it selects and focuses the licensed source mesh (when WebGL is available); without graphics, original descriptions and all quiz controls remain available.
- No question scores, personally identifying data, account credentials, or analytics are persisted. The quiz is informal educational practice, **not** an exam, clinical anatomy validation, or a measure of learner competence.
- Automated unit checks verify full FMA identity/region coverage, distractors and answer positions. Chromium/WebKit emulated iPhone tests cover wrong/right feedback, both lengths, completion, text/3D parity and tour/practice coordination. Real hardware and educator review remain separate release gates.
- **Important limitation:** a region-recognition quiz is not a substitute for a multi-system 3D body atlas. Additional genuine geometries, beginning with separately provenance-verified diaphragm and thoracic structures, remain future work.

## Diaphragm 3D — separate source dataset, not overlaid

A standalone **Diaphragm 3D Lab** is now part of this PR, not a composite full-body model.

- Dataset: OrganUI `organui/organui` at immutable commit `21439ee45a2efb8cd9d970e9b56405b294e3744d`, file `apps/web/public/models/diaphragm.glb`, 3,649,120 bytes, Git blob `afbc6133a44f8f9408d8c49ceb7345c61f5f690f`. Build verifies Git content-object hash, GLB v2 header and SHA-256 `2a6c8608efe4dd33b24ffa6c9cd678c0230629de4b6340ffaa72932b63d6e5ed` before packaging.
- Model provenance: **BodyParts3D 3.0 (20110915)** © DBCLS, via OrganUI, **CC BY-SA 2.1 Japan**. Original source meshes were checked by OrganUI against a separately pinned mirror and prepared with mesh simplification, splitting and trimming; original model attribution appears on the page.
- Exact 13 named source-derived nodes: right and left hemidiaphragms plus the esophagus, inferior vena cava, descending aorta, heart wall, both lower lung lobes, liver, stomach, spleen, and both psoas major muscles. Only the first two are the diaphragm muscle; the others provide anatomical context.
- Viewer: rotate/pan/zoom, five named camera views, mesh selection, focus, isolate, show-all, region filters, written descriptions and WebGL-loss fallback. Source geometry remains unchanged; lighting/color are for study clarity.
- **No overlay:** this BodyParts3D 3.0 asset has its own model-relative recentering/scale; the separate lung viewer uses BodyParts3D 4.3. There is *no verified common coordinate transform, landmark fit or anatomical registration*. Do not merge the two raw scenes or present them as aligned.
- Evidence for introductory breathing notes: [NHLBI breathing muscles](https://www.nhlbi.nih.gov/health/lungs/body-controls-breathing) and [OpenStax A&P 2e §22.3](https://openstax.org/books/anatomy-and-physiology-2e/pages/22-3-the-process-of-breathing). Neither validates every 3D geometry detail.
- Safety and release: personal educational study only. No animated diaphragm contraction, diagnosis, clinical measurements, patient data or private course-slide replication. Physical iPhone/VoiceOver and qualified anatomy review remain outstanding.

## Oral structure expansion — Z-Anatomy, CC BY-SA 4.0 (2026-10-31)

**Current scope: licensed static 3D**, not full articulation/swallowing mechanics. The new [oral anatomy lab](./oral.html) shares the Atlas navigation but is an independent model with its own source, license, coordinate system, and unvalidated source geometry.

- Source: [OrganUI oral/salivary model attribution](https://github.com/organui/organui/blob/21439ee45a2efb8cd9d970e9b56405b294e3744d/apps/web/public/models/salivary-glands.ATTRIBUTION.md) at immutable upstream commit `21439ee45a2efb8cd9d970e9b56405b294e3744d`. Asset `apps/web/public/models/salivary-glands.glb`: **754,496 bytes**, Git blob SHA-1 `b1e943c7fab677bff21f74e16d86830cc516f3df`. SHA-256 `4bce66ed11d182e098dc8fecd60aa2011a0b44932a12a7ea8466059000964b92` also pinned after successful iPhone WebKit model verification. Source FBX from [Z-Anatomy](https://github.com/LluisV/Z-Anatomy) at pinned commit `6c7f9016bd5899ac8edafd31b9900c151df42ed6` with origin hashes in the upstream attribution.
- **15 exact source-derived groups**: right/left parotid glands, accessory parotid glands, and parotid ducts (6); right/left submandibular glands and ducts (4); right/left sublingual glands (2); tongue, mandible, hyoid (3). The viewer supports named selection, source-object notes, focused/isolate camera, category filters, reset, and native text study when 3D is unavailable.
- **Model data license: CC BY-SA 4.0** from Z-Anatomy (Gauthier Kervyn, Lluís Vinent Juanico and contributors), derived in part from BodyParts3D / Anatomography © DBCLS, adapted by OrganUI. OrganUI applied FBX transforms, welded vertices, recentred/scaled positions, recomputed normals, and colored source meshes. The model's CC license is distinct from the repository's MIT software license and other anatomy assets under CC BY-SA 2.1 Japan. Attribution and modification notice retained in-page and in [evidence notes](./about.html).
- Partial **articulation** and **swallowing** modules link to this lab and explicitly remain incomplete: missing soft palate, lips, teeth, pharynx, interior tongue muscles, cranial nerves, and dynamic speech or bolus mechanics. The material cannot diagnose dysphagia or evaluate speech production.
- Sources for *written* introductory functions: [NIH NIDCR salivary glands](https://www.nidcr.nih.gov/health-info/saliva-salivary-gland-disorders), [NCBI Bookshelf salivary anatomy](https://www.ncbi.nlm.nih.gov/books/NBK538325/) and [NIDCD dysphagia](https://www.nidcd.nih.gov/health/dysphagia). Written sources do **not** independently validate every 3D surface.
- Tests verify immutable Git blob and GLB header on each build, exactly 15 documented source names, correct labeling and explicit limitations, mobile Chromium/WebKit geometry controls, fallback, iPhone-sized canvas and no patient data collection. Physical device and educator review remain separate gates.
- **Next:** Find and audit a genuine pharynx/velopharynx model, or a more complete ear/hearing model, prior to adding static anatomy. Avoid merging unregistered anatomy datasets into a fake common body.

## Pharynx and soft-palate muscles — sourced 3D implementation

**Model:** [OrganUI pharynx-3d](https://github.com/organui/pharynx-3d) at immutable commit `c3759092b524ab4637d691168bdc08bbee1fcfbb`, `public/models/pharynx.glb`, **7,148,788 bytes**, Git blob SHA-1 `f4a638d64d86d43eefb3b3f0ca6450e9d4fda47e`, SHA-256 `70d3992cc103ab18f1e9598582cf84c21cc4cbc4d1e65f3853a78efc2961202d`. Binary header/version and both content hashes verified before reuse.

- Original **BodyParts3D / Anatomography 4.3 © The Database Center for Life Science (DBCLS)**, adapted by OrganUI under **CC BY-SA 2.1 Japan**; MIT application code does not relicense source model data. Per-element source ID, LFS SHA-256 and original transformation details are preserved in [OrganUI's pinned provenance record](https://github.com/organui/pharynx-3d/blob/c3759092b524ab4637d691168bdc08bbee1fcfbb/docs/MODEL_PROVENANCE.md).
- **20 source-defined groups** from 31 BodyParts3D 4.3 meshes: superior/middle/inferior constrictors, pharyngeal raphe, three pharyngeal elevator muscles, levator/tensor veli palatini, musculus uvulae, tongue, epiglottis, hyoid and laryngeal cartilage landmarks, right ascending pharyngeal artery, pharyngeal venous plexus, and selected nerves. Several left/right source objects are grouped, so pairs cannot be isolated separately. Selected nerves/vessels are incomplete.
- Fully separate 3D study viewer in `ANATOMY/SLP/pharynx.html`, source-named structure dropdown, region filters, focus/isolation, five camera views, keyboard rotation and text fallback on WebGL failure. File is ~7.1 MB and is loaded only on the dedicated page; memory and performance on physical older phones still need testing.
- Resonance/velopharynx module is now **partial licensed 3D study**, not complete: source lacks pharyngeal mucosa/lining, nasal or oral cavity surfaces, tonsils, and any representation of active closure or aerodynamic sound resonance. Do not present the model as swallowing, airflow, acoustic or velopharyngeal-motion simulation. Alignment with independently recentered larynx/oral models has not been verified; models remain separate.
- Introductory functional notes refer to [ASHA Resonance Disorders](https://www.asha.org/practice-portal/clinical-topics/resonance-disorders/) and [OpenStax respiratory anatomy](https://openstax.org/books/anatomy-and-physiology-2e/pages/22-1-organs-and-structures-of-the-respiratory-system); text links are educational references, **not** independent assessment of surface accuracy.
- Build and browser gates: immutable source byte count/hash, 20 original source-node names and IDs, text-only fallback and iPhone WebKit mobile selection and graphics-loss coverage. Manual physical iPhone/VoiceOver and qualified educator review remain pending.

## Right-ear, hearing and balance — pinned Z-Anatomy 3D study

- Source: [OrganUI ear-3d](https://github.com/organui/ear-3d) at immutable commit `40ace7ed45cdbf604adda889e5db720ee6b1ce98`, file `public/models/ear.glb`: **1,010,340 bytes**, Git blob SHA-1 `ca976a3a626517860a6f09673868f6a889e10f09`, SHA-256 `39437aeadce1c82d44efc7df1dbaedb872b2f7dd62d66537fc4d4178df0cede1`. Exact GLB header, content size and both hashes are checked before packaging; source node names verified separately.
- **16 original right-ear groups from 31 Z-Anatomy objects**: seven external-ear surface landmarks, eardrum, malleus, incus, stapes, auditory tube, chorda tympani, cochlea, vestibule and composite vestibulocochlear nerve. Includes right side only: **not left/bilateral**, and the external auditory canal, oval window as a separate mesh, cochlear hair cells, basilar membrane and central auditory pathways are missing.
- Origin and geometry copyright: Z-Anatomy by Gauthier Kervyn, Lluís Vinent Juanico and contributors, based in part on BodyParts3D / Anatomography © DBCLS; adapted by OrganUI. **Mesh model CC BY-SA 4.0** (not the MIT application license). OrganUI source object transformations include welding, recentering/scaling, smooth normals and colors; per-FBX source files and hashes are documented in the [pinned provenance](https://github.com/organui/ear-3d/blob/40ace7ed45cdbf604adda889e5db720ee6b1ce98/docs/MODEL_PROVENANCE.md).
- New separate `ANATOMY/SLP/ear.html` / `ear.js` with 16 real source-linked text descriptions, visibility filters, five views, isolate/focus, model picking and WebGL text fallback. **Seven-stop guided sound journey** is a sequence of pinned structures, explicitly skipping the non-modeled ear canal and oval window, rather than a dynamic acoustic/physiology simulation. Tour remains usable as text without 3D graphics; no scores or personal data collected.
- `hearing` module marked **partial 3D**, not a complete auditory system. The pinna/eardrum/ossicles/cochlea/CN VIII help orient, whereas the auditory tube is for pressure equalization, the vestibule for balance and the chorda tympani for other nerve functions. Neither should be falsely included in the sound-vibration pathway.
- Study science: [NIDCD — How Do We Hear?](https://www.nidcd.nih.gov/health/how-do-we-hear) and [ASHA Hearing Loss](https://www.asha.org/practice-portal/clinical-topics/hearing-loss/). Model surface validation remains outstanding, as does actual iPhone Safari/VoiceOver testing.
- Community inspiration: [PurdueEarLab/AUDIO-MAN](https://github.com/PurdueEarLab/AUDIO-MAN) is a separate open-source **physical ear simulator** project surfaced via r/audiology, useful to study future fabrication and accessible teaching. It has **not** been cloned into the software Atlas; licenses, physical dimensions and suitability would need verification before copying any assets. Similarly, large third-party anatomical sites can contain noncommercial model licenses; importing such assets wholesale without per-asset license audit is not approved.
- The separate ear and pharynx/oral/larynx models have different source recentering/scales. **No shared anatomical coordinates or physical contact are claimed**; never overlay their raw geometry as a complete head without registration evidence.

## Neural anatomy source integration — cranial nerves and brainstem

The new standalone [neural study lab](./neural.html) uses the open [Brain Project](https://github.com/itayinbarr/brainproject), pinned at immutable commit `2929e94f521a8ddceab26bc100a98dc06b0da060`. The original codebase is **Apache-2.0**; its Z-Anatomy/BodyParts3D-derived *3D model and source metadata* are **CC BY-SA 4.0** and retain their copyright and share-alike obligations. Only the model and its metadata are reused; the existing Atlas Three.js architecture is retained, not replaced with another app.

- Pinned model: `brain-atlas/models/brain.glb`, **4,650,816 bytes**, Git blob SHA-1 `c80dd62202b5cf8a2a43c7a019311781bd95457c`. Pinned original source JSON: `brain-atlas/models/manifest.json`, **232,455 bytes**, Git blob `ad25ab2d45b2d46a94f324143506f0fa3bc6906a`. Git blob hashes plus content size, GLB v2 header, record count/category/source are build-verified. Both source files are **double-pinned** to their Git identities and independently observed SHA-256 checksums: GLB `76a49ea4526a4880613aec7a02756bd7301b0b9d0680d7cae33e197b672c5453`; manifest `66c32355e02c3ba5fadf3b3bdb61b18c619162d6c5ee2083262e59bed4274d93`.
- The full compressed source binary has **437 catalogued objects**, but the new lab exposes only **44 source-labeled cranial-nerve/branch records and 30 brainstem/nucleus records**, all explicitly marked `Z-Anatomy / BodyParts3D`. All other brain surfaces and any registered/approximate derived nuclei are **hidden**, not incorrectly presented as validated clinical structures.
- **Important omissions:** the source does **not** contain a separate glossopharyngeal nerve (CN IX) group. Its vestibular nerve is **not** a complete cochlear branch or all of CN VIII. Brainstem coverage is not every nucleus, and only one side of the medulla surface is present. The seven-stop neural teaching sequence uses an explicit **CN IX text-only checkpoint** instead of invented anatomy. The course is conceptual, not a physical connected path.
- The original [registration methodology](https://github.com/itayinbarr/brainproject/blob/2929e94f521a8ddceab26bc100a98dc06b0da060/docs/registration.md) discloses approximate MNI-to-Z-Anatomy geometry in other portions of the source (~7 mm held-out error for one derived nucleus). **We intentionally exclude those registered nuclei**; even sourced surface meshes are educational, not patient-specific or millimeter-accurate clinical segmentation.
- Performance: the source GLB uses Draco compression; self-hosted decoder resources are copied from the pinned `three` npm dependency, with no third-party runtime CDN. Scene filters render only the 74 relevant source records; nevertheless, the full 4.65-MB source geometry is decompressed before filtering. Older mobile devices and VoiceOver still require real-device review, and an extracted 74-node GLB is a possible future optimization only after independent geometric and licensing verification.
- Study facts: [NCBI cranial nerve review](https://www.ncbi.nlm.nih.gov/books/NBK470353/), [NCBI anatomy of swallowing](https://www.ncbi.nlm.nih.gov/books/NBK554405/) and [ASHA Adult Dysphagia](https://www.asha.org/practice-portal/clinical-topics/adult-dysphagia/). Sources support written nerve-function explanations, **not** expert validation of every surface.
- Source IDs, native selector, focus, isolate, category filters, orientation presets, missing-CN-IX labeling, WebGL-loss textual fallback and seven-step SLP guide are covered by Node and emulated iPhone Chromium/WebKit browser tests. No patient data, diagnosis or fabricated nerve stimulation.

## Neural retrieval-practice milestone — original quiz, no imported AGPL code

The separate [neural 3D lab](./neural.html) now offers a **seven-item, low-stakes active-recall review** alongside its source-defined neural meshes and guided tour.

- Seven original, source-linked function prompts cover CN V (mastication), VII (facial expression/lip control), the available vestibular branch of VIII (balance, **not** full cochlear hearing), IX (pharyngeal sensation and **no model mesh**), X (laryngeal/pharyngeal function), XI (sternocleidomastoid and trapezius) and XII (most tongue muscles). Source IDs/labels are taken from the pinned neural manifest, not generated or guessed nerve positions.
- For each question, the corresponding mesh is hidden from selection until the learner chooses an option. Four distinct plausible choices are provided; feedback gives the correct nerve, an explanation and the available source mesh. **CN IX receives explanatory text only**, not an arbitrary substituted geometry. If WebGL fails, all questions and feedback remain readable.
- First-attempt scores remain separate from optional **review missed questions**. No spaced-repetition scheduling is claimed; users are advised to return another day. No answers, scores, accounts or analytics are saved, transmitted or uploaded.
- Evidence base: [D'Antoni et al. evidence-based clinical anatomy learning (2018)](https://pmc.ncbi.nlm.nih.gov/articles/PMC7379743/) and [distributed retrieval practice and anatomy recall](https://pubmed.ncbi.nlm.nih.gov/27860396/). These support retrieval and explanatory feedback as educational methods, **not** content accuracy or clinical grading.
- Open-source inspiration: the Anki [Image Occlusion Enhanced project](https://github.com/glutanimate/image-occlusion-enhanced) exemplifies hiding an answer until recall. Its **AGPLv3 and additional licensing terms** have not been imported; the new implementation uses original quiz logic within the existing Atlas codebase. Do not fork/copy that add-on directly without a compatibility/licensing decision.
- Tests: answer/category mapping, unique choices, single scoring on repeated taps, first/second-round separation, original CN IX mesh absence, full Chromium/iPhone WebKit interaction, quiz/tour coordination and availability without WebGL. No claims of exam validity or pedagogical accreditation.

## Uploaded course-material analysis and provenance

The user supplied **eight** educational files from the CDD 2260 study packet: several repeated/updated *Anatomy of Phonation* slides, *Muscles of Phonation* slides, *When Good Cords Go Bad* slides, and a one-page *Study Guide for Phonation*. The materials emphasize the connection between respiration and phonation, the trachea and larynx, intrinsic/extrinsic muscles, vocal folds, voiced/voiceless sounds, and voice disorders.

**We do not commit uploaded professor-authored slide/PPTX imagery or documents to this public repository**. The terms below are short, newly authored teaching notes grounded in course topics and the independent ASHA sources. Course materials may contain historical simplifications, typographical errors or clinical terminology requiring current verification; do not import recommendations or pathology diagnoses wholesale.

Course packet **topic coverage (not a verbatim transcription):**
- *Study Guide for Phonation*: role of respiration and laryngeal muscles; Bernoulli effect; trachea; vocal-fold attachment; glottis and subglottal area; voiced/voiceless; laryngeal cartilages; voice disorders.
- *Anatomy of Phonation*: source of voice in vocal-fold vibration; respiratory airflow provides energy; larynx, cartilage, glottis, trachea and airway protection.
- *Muscles of Phonation*: pharyngeal landmarks; intrinsic abductors, adductors, tensors/relaxers; extrinsic hyoid/laryngeal elevator/depressor groups.
- *When Good Cords Go Bad*: broad categories including inducible laryngeal obstruction/vocal cord dysfunction, nodules, polyps, paresis/paralysis, tumors, granuloma, laryngitis and spasmodic dysphonia; these need modern external clinical validation before being turned into decision tools.

## External curriculum/evidence reference sources

- [ASHA Scope of Practice in SLP](https://www.asha.org/policy/SP2016-00343/): communication, language, cognition, fluency, voice, resonance, feeding/swallowing, hearing, technology, AAC, clinical collaboration.
- [ASHA Voice Disorders](https://www.asha.org/practice-portal/clinical-topics/voice-disorders/): respiratory, phonatory and resonatory subsystems, their coordination, and assessment.
- [ASHA Adult Dysphagia](https://www.asha.org/practice-portal/clinical-topics/adult-dysphagia/): oral, pharyngeal and esophageal swallowing anatomy and roles.

**No citations to these sources certify our anatomy meshes, diaphragm illustration, clinical competencies, recorded lectures, or future dynamics.** Source-derived larynx mesh provenance and CC BY-SA 2.1 Japan obligations remain detailed in [about.html](./about.html).

## Design and scientific constraints

1. Preserve existing robotics workshop and current licensed larynx 3D work.
2. Do not call a curriculum **outline** an interactive 3D model. Do not substitute basic cones or generated fantasy anatomy for validated source meshes.
3. Source-check every licensed 3D asset, anatomically label it conservatively and respect source copyright and derivative licenses.
4. Source any detailed clinical-pathology content separately; no diagnosis or patient-specific advice.
5. Work offline with locally bundled assets once the website has loaded. No accounts, no patient data, no saved quiz responses.
6. Keep phone access (Safari/WebKit), keyboard access, screen-reader labels, no unwanted nested scroll, and source links.
7. Complete larynx + respiratory module QA before expanding 3D to swallowing, oral articulators or cranial nerves.
8. Physically test a real iPhone and obtain anatomy/SLP faculty review before calling the educational content validated.

## Delivery milestones

**M1 (implemented on draft)**: ten-area navigation; respiratory concept atlas + recall; larynx study preserved and directly linked both ways; tests and an opt-in preview.

**M2**: source-derived lung/airway model integrated, with a five-stop, native-button guided tour referencing five real FMA-labeled geometry groups. The tour selects and frames source meshes, supports text fallback, and hands off to the separate larynx 3D view. It is a study sequence, **not** modeled airflow or a breathing-motion simulation. Next add source-validated diaphragm/rib cage/intercostal meshes; verify coordinate systems, object groups, source licenses, size and mobile performance. Only label *lung/airway surfaces* as 3D available; do not label diaphragm or rib cage as imported.

**Candidate anatomical source for next expansion (not integrated):** [OrganUI diaphragm attribution](https://github.com/organui/organui/blob/master/apps/web/public/models/diaphragm.ATTRIBUTION.md) describes a derivative of **BodyParts3D 3.0** under **CC BY-SA 2.1 Japan**. The existing lung asset is **BodyParts3D 4.3**, and the two projects independently recenter, rescale, and rotate their meshes. Do not simply overlay these GLBs or claim physically accurate alignment. Before import, pin a source commit, verify exact GLB SHA-256/bytes/structure names, preserve attribution and share-alike, examine original coordinate systems and transforms, test geometry boundaries and WebGL memory on older phones, and obtain educational review. If alignment cannot be justified, use **separate labeled 3D viewports** rather than an unvalidated composite.

**M3**: add resonance and orofacial licensed models; integrate IPA sound production concepts with explanation of articulatory mechanisms. Do not simulate unvalidated tissue motion.

**M4**: cranial nerves, auditory anatomy, swallowing phases with additional source-scoped evidence, accessible guided lessons and clinician input.

**M5**: clinical voice conditions, phonetics/acoustics, broader language and cognition study curriculum, subject to review of historical clinical terminology.

PR #13 remains a draft and the Render preview is isolated with auto-deploy disabled until verification.
