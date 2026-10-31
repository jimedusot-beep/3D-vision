# Candidate anatomical mesh sources — research only

**Status:** source/license desk audit. **No external meshes have been downloaded, converted, copied, published or clinically validated by this project.** This is not permission to use every file in any candidate project. The current viewer still renders ten unvalidated Three.js primitives.

## Evidence-backed candidates

| Candidate | Primary source and stated license | Why inspect | Blockers before any import |
| --- | --- | --- | --- |
| **BodyParts3D 4.0 (DBCLS)** | [Official source download](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html) and [official license](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html), updated 2025-02-27: **CC BY 4.0** | Prefer first for clear source attribution, machine-readable anatomical IDs, and potentially lower license complexity | Download official release, inventory actual laryngeal mesh IDs, laterality, resolution and format; verify tiny phonation structures are represented; record exact source bytes and version |
| **Z-Anatomy model subsets** | [Project model license](https://github.com/LluisV/Z-Anatomy/blob/PC-Version/Resources/Models/License.txt): BodyParts3D-derived CC BY-SA 2.1 Japan / Z-Anatomy CC BY-SA 4.0; separate included source models have **NC** restrictions | Can provide denser head-and-neck geometry and detailed structures | Model-level source/original license, CC BY-SA terms, no inadvertent NC-only inner-ear/kidney assets, no mixing conflicting licenses, correct source version and attribution |
| **SPL Open Anatomy — Head and Neck Atlas** | [Official atlas page](https://www.openanatomy.org/atlas-pages/atlas-spl-head-and-neck.html): **3D Slicer License, Section B** | CT-derived neck context and laryngeal cartilage models | Confirm actual scope and accuracy of each relevant label, atlas terms, CT provenance, model extraction and conversion limitations; research-only disclaimer; no clinical use |
| **Web reimplementations of atlases** | [nqwrc browser atlas](https://github.com/nqwrc/3d-anatomy) describes mixed source licenses including NC derivatives | UI and performance reference only | **Do not copy the bundled asset library wholesale.** Recover each underlying source and its obligations first |

## Verified official BodyParts3D 4.0 IS-A index crosswalk (no binary meshes imported)

The official [BodyParts3D IS-A organ model index](https://dbarchive.biosciencedbc.jp/data/bodyparts3d/LATEST/isa_parts_list_e.txt) identifies **8 of the 10** structures represented by our current illustrative placeholders. This is useful evidence that candidate entries exist, **not** that their mesh shape, attachments, dimensions, CT correspondence or availability in a particular archive have passed verification.

| Our structure ID | Original archive name | FMA concept ID | BP representation ID |
| --- | --- | --- | --- |
| `thyroid-cartilage` | thyroid cartilage | FMA55099 | BP7901 |
| `cricoid-cartilage` | cricoid cartilage | FMA9615 | BP9117 |
| `left-arytenoid` | left arytenoid cartilage | FMA55114 | BP8314 |
| `right-arytenoid` | right arytenoid cartilage | FMA55113 | BP9249 |
| `left-posterior-cricoarytenoid` | left posterior crico-arytenoid | FMA46578 | BP7822 |
| `right-posterior-cricoarytenoid` | right posterior crico-arytenoid | FMA46577 | BP8360 |
| `left-lateral-cricoarytenoid` | left lateral crico-arytenoid | FMA46581 | BP8828 |
| `right-lateral-cricoarytenoid` | right lateral crico-arytenoid | FMA46580 | BP8618 |

**Critical non-equivalence:** `left-vocal-fold` and `right-vocal-fold` have **no verified exact index mapping**. The archive lists `left vocal ligament` (FMA55246, BP8188) and `right vocal ligament` (FMA55245, BP9026), but ligament geometry does not represent the complete true vocal fold with its mucosa and muscle. Do **not** substitute the ligaments for whole vocal folds or assert complete phonatory anatomy.

Other model IDs visible in the same index, for future inventory: `epiglottis` FMA55130 / BP9263, `left thyro-arytenoid` FMA46590 / BP7801, and `right thyro-arytenoid` FMA46589 / BP7867. **They have not been imported or validated.** Hyphenated source names such as `crico-arytenoid` are genuine archive labels; searching for only `cricoarytenoid` misses entries.

The current `structures.json` stores this crosswalk with status `indexed_not_imported_unvalidated`. Follow the download/attribution and human-review gates before accepting any actual OBJ/GLB.

### Recommended practical order

1. **Inventory first, no download in CI.** Query BodyParts3D's official structure index for thyroid cartilage, cricoid cartilage, arytenoids, true vocal folds, posterior/lateral cricoarytenoid muscles and relevant orientation landmarks. Mark **present / absent / ambiguous** for every target.
2. If resolution/coverage is insufficient, inspect **specific** Z-Anatomy or SPL asset paths. Record whether each needed SLP structure exists, with a verifiable canonical name, side, original identifier, version and per-file license. Do not assume a generic “head and neck” dataset includes vocal ligament layers or intrinsic muscle detail.
3. Before copying a binary, obtain attribution/license verification, retain full original license notices, source URL, commit/release, SHA-256, conversion steps, coordinates/units and model-side conventions. Preserve asset license independent of the MIT/other license applying to the viewer's code.
4. Import an **isolated read-only candidate scene** on a separate working branch, not the mechanical robot CAD or clinical study mode. Keep the current illustrative ten-part scene available for A/B regression comparison.
5. Have a qualified anatomy/SLP reviewer verify from anterior, posterior and superior views: landmarks, bilateral orientation, approximate spatial relationships, muscle attachment sites and omissions. Reject “looks realistic” as a scientific acceptance test.
6. After source approval, run browser size/performance metrics on a low-end phone (WebGL failures, GPU memory, interactivity, screen readers), then consider citation-linked structure notes and study items. No phonation animation without separate motion-geometry review.

## Asset acceptance record (required for each actual file)

- Original author / institution and source URL
- Dataset version or source commit and retrieval date
- Unique source structure ID + anatomical terminology
- Exact file path, byte size and SHA-256
- License URL, copyright/attribution line, restrictions and derivative obligations
- Native units and coordinate frame; documented transformations
- Simplification/decimation and mesh quality checks
- Human reviewer, review date, accepted/rejected result, unresolved limitations
- Written notice that the 3D representation is educational and not patient-specific

**Do not replace the ten demo primitives until at least one permitted, traceable candidate set and all required labels have passed review.** No model candidate in this document constitutes a validated larynx.
