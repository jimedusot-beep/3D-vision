# SLP anatomy source and geometry record

**Scientific status: simplified educational illustration, NOT medically validated.**

- The mesh is created in this project from Three.js primitives. There are no imported, licensed medical model files, scans, or student lecture slides.
- Geometry uses arbitrary display units. Proportions, muscle paths, cartilage surfaces, axes and distances are not suitable for diagnosis, surgery, phonation mechanics, measurement, printing or medical training assessment.
- The viewer currently names thyroid cartilage, cricoid cartilage, left/right arytenoids, left/right vocal folds, and left/right posterior/lateral cricoarytenoid muscles. These objects are schematic placeholders.
- Phonation animation is intentionally disabled until anatomical geometry and motion have been independently validated.
- Clinical and educational assertions need expert review before this becomes an authoritative teaching atlas.

## Reference context (not model provenance)

- OpenStax, Anatomy and Physiology 2e, section 22.1, Organs and Structures of the Respiratory System: https://openstax.org/books/anatomy-and-physiology-2e/pages/22-1-organs-and-structures-of-the-respiratory-system
- NCBI Bookshelf, Anatomy, Head and Neck: Larynx: https://www.ncbi.nlm.nih.gov/books/NBK538202/
- NCBI Bookshelf, Anatomy, Head and Neck: Laryngeal Muscles: https://www.ncbi.nlm.nih.gov/books/NBK545265/

Each entry in `structures.json` now records source IDs for its **written description**; these do not validate the corresponding 3D mesh. See the [evidence matrix and acceptance gates](VALIDATION.md). Terminology and muscle-action statements must still be reviewed by an SLP/anatomy-qualified reviewer.

No private coursework from HERBIE_SLP_Knowledge_2026-10-30.zip is redistributed. This is an interaction prototype, not medically precise geometry.

## H.E.R.B.I.E. iframe protocol

Viewer URL: ANATOMY/SLP/index.html?select=left-vocal-fold (selection is optional).
For a cross-origin embed, add embedOrigin parameter set to the expected HTTPS parent origin. Production integration must approve its embedding origin.

The parent sends an object using postMessage targeted at the exact viewer origin:

    {source:"herbie",version:1,action:"select",structureId:"left-vocal-fold",requestId:"example-1"}

Actions: open, select, isolate, transparency (boolean enabled), labels (boolean enabled), reset. Only known structure IDs are accepted. Messages from unexpected origins or sources are ignored. Replies have source 3d-vision-anatomy, version 1, ok, reason, selected, and isolated. No hardware commands, remote data access, personal data, or arbitrary script execution are supported.

**Unsupported:** phonate, arbitrary model imports, validated motion, and patient-specific educational claims. H.E.R.B.I.E. must treat all geometry as illustrative.

## Integration and acceptance gates

- Confirm anatomical labels and muscle actions through qualified review.
- Run npm test and npm run build, then browser tests on desktop and physical touch devices.
- Exercise all actions in same-origin and explicitly authorized cross-origin embeds.
- Verify no regression to the mechanical workshop, McGruber model catalogs, or CAD exports.
- Require approved license and provenance before replacing placeholders with third-party models.
