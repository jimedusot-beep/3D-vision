# Anatomy Lab — undergraduate course alignment and open-source architecture

Status: **draft prototype**, not an accredited syllabus, university equivalence, faculty-endorsed atlas, clinical assessment, or validated anatomical model. Academic objectives and prompt answers require human review.

## Open resources inspected (not copied into this repository)

| Resource | What to learn or integrate | Source and licensing boundary |
| --- | --- | --- |
| [OpenStax Anatomy & Physiology 2e, §22.1](https://openstax.org/books/anatomy-and-physiology-2e/pages/22-1-organs-and-structures-of-the-respiratory-system) | University-textbook learning objectives, respiratory/phonatory structure context | Cite the source for original short explanations; no OpenStax images or full passages copied |
| [NCBI Bookshelf — Larynx (NBK538202)](https://www.ncbi.nlm.nih.gov/books/NBK538202/) | Cartilages, true/false vocal folds, laryngeal innervation | Original summaries only; this StatPearls chapter is not an open model license and has CC BY-NC-ND restrictions |
| [NCBI Bookshelf — Laryngeal Muscles (NBK545265)](https://www.ncbi.nlm.nih.gov/books/NBK545265/) | PCA/LCA action, cricothyroid innervation exception, muscle comparison | Original question wording, source links, no chapter copying |
| [Cognition Lab, Shiv Nadar University Chennai — Open Anatomy Atlas](https://github.com/CognitionLabSNUC/open-anatomy-atlas) | Open-source 3D explorer with anatomical region navigation, quiz and section-view design ideas | Public application MIT; **anatomical models retain their own dataset licenses**. No source code or 3D geometry copied here |
| [Open Anatomy Project — SPL Head/Neck](https://www.openanatomy.org/atlas-pages/atlas-spl-head-and-neck.html) | Atlas hierarchy, named neck structures and source/provenance display, research-derived CT reference | 3D Slicer License Section B; do not import without model-specific terms and scope review |
| [BodyParts3D official archive](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html) | FMA-style identifiers, part-of relationships and high-coverage mesh data | Data CC BY 4.0; official names/IDs index and exact mesh license must be tracked. No import has occurred |
| [Human Atlas, open-source browser reference](https://github.com/slorksmo/Human-Atlas) | Search, selection, isolation, language switching and accessible narrow layouts | Application MIT and anatomy data CC BY 4.0 are **different** licensing layers; no assets copied |
| [Trumble et al., systematic review (2024)](https://pmc.ncbi.nlm.nih.gov/articles/PMC11078833/) | Source for practice testing and distributed/retrieval study design; cited as evidence, not code | 56 studies, 63 experiments; 43 with significant benefit. Effects are population-specific and not proof this application improves learning |

## Implemented foundation

- **Learning outcome alignment:** Four outcomes recorded in `structures.json` with descriptive statements and references.
- **Assessments:** Twelve source-linked, original short-answer items, each mapped to one objective and a recall/compare/application tier. Each item supplies an answer and rationale. This is **formative self-study**, not a graded clinical examination.
- **Session-only practice:** The viewer displays a prompt, hides its answer, reveals the short rationale and citation links, and asks the learner to self-rate. “Review again later” requeues the same item **within the session** after other items; it does not schedule spaced repetition across days. No localStorage, IndexedDB, account, analytics, scores, text-input history or network submissions are introduced.
- **Accessibility and device resilience:** Keyboard, HTML study panel, titled isolate buttons, WebGL fallback and loss handling, responsive iPhone-size tests. A qualified accessibility audit and real-device test remain open.
- **Model integrity:** Existing mesh geometry is schematic; never derive examination correct answers from where the user clicked in that scene. No phonation simulation or clinical model assessment is available.

## Mobile usability iteration — 2026-10-31

A live iPhone user confirmed the separate Render preview runs but finds the experience incomplete. This round addresses navigability **rather than claiming the larynx shapes became anatomically accurate**:

- The concept map now grows with the document on narrow screens; there is **one normal browser scroll** rather than an inner scrolling box nested inside a longer page.
- Three native-button sections separate **Parts**, **Notes**, and **Practice** on iPhone-sized screens; the desktop reference layout retains all sections. Pressed states reflect the visible section.
- Selecting a structure shows a sticky, named **Read structure notes** action while exploring the mobile map. The notes link to primary educational sources and include a button to launch its already-authored related self-study questions.
- Tests cover the entire map → note → practice → reset journey in emulated iPhone WebKit and Chromium, empty search and no-WebGL fallback. Nothing records student actions.
- Remaining blockers: production-grade medically validated 3D meshes, human-source review, VoiceOver testing, real physical iPhone layout and thermal/battery tests. Automated browser checks are necessary, **not** proof of real-device usability or teaching efficacy.

## Example lesson flow

1. Review outcome “Compare intrinsic laryngeal muscle actions”.
2. Read original, short and cited summaries for the paired posterior and lateral cricoarytenoid placeholders.
3. Recall **“How do the posterior and lateral cricoarytenoid muscles act differently on the true vocal folds?”** *without seeing the answer*.
4. Reveal: posterior abducts, lateral adducts. Compare the written rationale and open the NCBI source.
5. Choose “I recalled it” or “Review again later”; the latter adds it to the back of this session's queue.
6. Repeat. **No percentage mastery claim is made.** A trained reviewer must evaluate whether each objective and prompt is appropriate for an actual SLP syllabus.

## Follow-up usability and resilience pass — 2026-10-30

- **Search the actual catalog.** A keyboard-accessible input filters the existing ten structure buttons by name/ID. A live count reports matched items; zero matches explain how to restore the complete list. The filtering is local: queries are not sent to a server or persisted. This becomes more useful as validated structures are added.
- **Practice this anatomical concept.** After selecting a structure, the learner can start just its related source-linked questions. For left/right homologous structures, the same functional teaching concept is shared *without copying or inventing extra prompts*. "Restart all questions" reinitializes the twelve-item session; no personal record is created, retained or exported. The main model's selection and the study-question scope are independent until the learner explicitly changes the scope.
- **No false anatomical validation.** Filtering structure names and pairing teaching questions does not validate mesh shape, biomechanics or lateralized injury findings. The source files remain the authority for written explanations only.
- **Older-device protection.** Rendering is suspended when the page is hidden and resumed on visibility change; an unavailable `ResizeObserver` uses a standard window resize listener. The no-WebGL/text study fallback is also tested with `ResizeObserver` disabled.
- **New acceptance tests.** Unit assertions cover bilateral filtering and privacy, while desktop Chromium and iPhone WebKit browser automation cover visible/hidden search results, empty-state text, selected-part practice, complete-session restart and narrow-screen search. Real screen-reader testing and physical devices remain required.

## University-parity gap register (not built or validated)

| Priority | Requirement | Acceptance evidence |
| --- | --- | --- |
| P0 | Faculty/SLP anatomist reviews all objectives, prompts, terminology, laterality and source assignments | Named reviewer, dated per-item decisions, corrections and signed-off coverage |
| P0 | Anatomically accurate laryngeal meshes with file-level FMA/TA identifiers | Exact source IDs, SHA-256, original license texts, named labels, laterality and expert spatial check |
| P0 | Accessible real-device usability | Physical iPhone/Android test; screen reader, keyboard/touch/focus behavior, reduced motion, 200% zoom; documented defects |
| P1 | Additional omitted structures: epiglottis, false folds, cricothyroid, thyroarytenoid, interarytenoids and nerve supply | Data coverage audit; independent verification and teaching notes |
| P1 | Physiological phonation/respiration models | Peer-reviewed model/parameter provenance, constraints, faculty review; do **not** animate placeholders |
| P1 | Voice/speech acoustics study linked to trustworthy diagrams and audio | Course learning outcomes and calibrated acoustic examples with verified rights; no diagnostic inference |
| P1 | Versioned integration with H.E.R.B.I.E. private document citations | Minimal permission boundary, no private files to public origin, working real H.E.R.B.I.E. CI |
| P2 | Full timed spaced-repetition schedule and private progress across devices | Consent-led storage policy, data export/delete, testing, no clinical or learning efficacy claims |
| P2 | Formal instructor-authored examinations and outcome analytics | Rubric, item reliability/validity, pilot study, measurement transparency and privacy review |

### Scientific status
University-*style* outcomes and formative practice are now present. **University equivalence, validated simulation, clinical proficiency and educational improvement have not been demonstrated.** Do not use the prototype to grade clinical learners or replace faculty teaching.

### Test gate
Run `npm test`, `npm run build`, desktop Chromium and iPhone WebKit browser interaction suites, plus manual review on a physical device before merging or deploying. Keep private SLP lecture files out of the public repository.
