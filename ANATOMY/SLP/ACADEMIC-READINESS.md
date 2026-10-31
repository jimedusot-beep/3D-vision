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

## Example lesson flow

1. Review outcome “Compare intrinsic laryngeal muscle actions”.
2. Read original, short and cited summaries for the paired posterior and lateral cricoarytenoid placeholders.
3. Recall **“How do the posterior and lateral cricoarytenoid muscles act differently on the true vocal folds?”** *without seeing the answer*.
4. Reveal: posterior abducts, lateral adducts. Compare the written rationale and open the NCBI source.
5. Choose “I recalled it” or “Review again later”; the latter adds it to the back of this session's queue.
6. Repeat. **No percentage mastery claim is made.** A trained reviewer must evaluate whether each objective and prompt is appropriate for an actual SLP syllabus.

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
