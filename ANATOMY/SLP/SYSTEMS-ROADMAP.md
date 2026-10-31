# H.E.R.B.I.E. SLP Systems Atlas — incremental curriculum plan

**Intent:** An interactive, beginner-friendly **digital study atlas** of the physical systems and foundational knowledge relevant to speech-language pathology, not a school display model, printable body, anatomical reference for clinical decisions, or a substitute for a degree program.

## Current public-preview coverage

| Area | Stage | Current implementation | Honest next development |
| --- | --- | --- | --- |
| Respiratory system | **Source-derived lung/airway 3D + study starter** | 20 verified source groups: 17 tissue segments, trachea, two bronchial trees. Separate viewer, lobe separation, 10 written concepts, SVG, inspiration/exhalation comparison, 6 recall questions, 5-stop 3D tour, and 6- or 20-question region-identification practice with source-group reveal | Licensed rib cage, intercostals, diaphragm, alveoli/microstructure and spatial/curriculum review |
| Phonation / larynx | **Source-derived 3D** | 20 source-model groups; original study map; rigid exploded study; cited source notes; guided tour and 20-part quiz | Reviewed layered true-fold geometry, academic validation |
| Resonance / velopharynx | Outline | learning objectives, ASHA pointer | Licensed palate/pharynx/nasal cavity surfaces |
| Articulation / orofacial | Outline | learning objectives, ASHA pointer | Tongue, oral cavity, jaw and lip 3D; phonetics |
| Neural control | Outline | learning objectives, ASHA pointer | Cranial nerves, brainstem, sensorimotor pathways |
| Hearing / auditory | Outline | learning objectives, ASHA pointer | Outer/middle/inner ear, central hearing pathways |
| Swallowing / feeding | Outline | learning objectives, ASHA pointer | Oral-pharyngeal-esophageal anatomy; airway protection |
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
