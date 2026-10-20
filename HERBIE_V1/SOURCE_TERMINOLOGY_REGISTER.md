# H.E.R.B.I.E. - Living Source, Terminology, and Assumption Register

**Document ID:** HBR-REG-001  
**Current release:** v0.1  
**Updated:** 2026-10-20  
**Purpose:** Ground CAD choices in traceable references, keep third-party licenses clear, and mark design proposals before they become assumed facts. Update this file for every new verified source, test, or CAD revision.

## Evidence categories and rule

- **V - Verified documentary fact:** supported by a linked official document or source-repository content; this does **not** mean its actual hardware has been independently tested here.
- **M - Measured / tested:** observation or measurement on *our* actual manufactured part with test date, tools, and photos or logs.
- **P - Proposed design choice:** dimensions and interfaces selected for H.E.R.B.I.E.; not an externally validated engineering standard.
- **U - Unknown / unverified:** evidence missing. Do not market as safe, printable, compatible, or structurally sound.

**Current mechanical testing:** No printed H.E.R.B.I.E. parts have been measured or strength-tested in this package. The included OpenSCAD file was compiled to concept PNG views, but that proves neither printable meshes nor assembled mechanical fit.

## Source list - append-only IDs

| ID | Primary source | Documented contribution | License / reuse caution | Accessed | Status |
|---|---|---|---|---|---|
| R01 | [ranboy12/robot_prototype_3D_sourcecode](https://github.com/ranboy12/robot_prototype_3D_sourcecode) | OpenSCAD parametric full robot, modular sections, exploded-view variable, source and 3MF files | MIT stated by repository; preserve attribution/license if adapting source | 2026-10-20 | V |
| R02 | [liphistius/MaFaRo](https://github.com/liphistius/MaFaRo) | Modular head, FreeCAD native files and STEP, swap-able sensor concepts | BSD-3-Clause, observe license terms if reusing source | 2026-10-20 | V |
| R03 | [Hyperspawn/dropbear_hardware](https://github.com/Hyperspawn/dropbear_hardware) | Complete assembly hierarchy, subassemblies and STEP/Fusion files | MIT; not mechanically compatible by default | 2026-10-20 | V |
| R04 | [vector76/gridfinity_openscad](https://github.com/vector76/gridfinity_openscad) | Parametric storage/tray practices | MIT; storage design is not a robot mounting safety standard | 2026-10-20 | V |
| R05 | [NuadaToys H.E.R.B.I.E. action figure](https://cults3d.com/en/3d-model/gadget/h-e-r-b-i-e-fantastic-four-first-steps-action-figure) | Free STL listing for exterior styling; named head, body/front/back, arms/base files | **Free download does not necessarily grant adaptation or redistribution rights.** Read terms and seek permission where necessary; no figure files have been imported into our CAD | 2026-10-20 | V for listing only / U for reuse terms |
| R06 | [cartheur/inmoov-stls](https://github.com/cartheur/inmoov-stls) | STL collections for head, neck, torso, shoulders, servo beds | Repository lists GPL-3.0; source may mirror another project's designs. Check original terms before reuse | 2026-10-20 | V |
| R07 | [HeyPCB/iris](https://github.com/HeyPCB/iris) | Mechanisms for camera eyes, lids and brow expression; parametric CadQuery files | CERN-OHL-S-2.0; repository **explicitly states not yet physically built or tested** | 2026-10-20 | V for documentation, U for real-world function |
| R08 | [Prusa - modeling for 3D printing](https://help.prusa3d.com/article/modeling-with-3d-printing-in-mind_164135) | Printable-feature and wall-thickness guidance | General slicer/printer constraints, not guaranteed tolerances for our donated printer | 2026-10-20 | V |
| R09 | [Raspberry Pi 4 Model B product portal](https://pip.raspberrypi.com/categories/545-raspberry-pi-4-model-b) | Official mechanical drawing and datasheet for a future model-specific board adapter | Do not infer the condition, included standoffs, or confirmed variant of a proposed donation | 2026-10-20 | V |
| R10 | [OpenSCAD official documentation](https://openscad.org/documentation.html) | Reference for parametric CAD, the Customizer, transformations and export workflows | Source syntax reference; model geometry still requires tests | 2026-10-20 | V |

### New-source entry template

```
ID: R11  (increment without renumbering earlier entries)
Date checked: YYYY-MM-DD
Title / author / URL:
Specific page, file or drawing inspected:
Claim(s) substantiated:
Design impact / affected part ID:
License and attribution obligations:
Confidence: V / M / P / U
Open problems or conflicting evidence:
```

## H.E.R.B.I.E. proposed dimensions and decision ledger

| ID | Variable / decision | Current draft | Class | Evidence required to promote |
|---|---|---|---|---|
| D01 | Overall height | 500 mm | P | Final ergonomic/stability study |
| D02 | Head envelope | 240 W x 170 D x 145 H mm | P | Appearance study, component and shell clearance |
| D03 | Neck envelope | 75 W x 75 D x 35 H mm | P | Mechanical neck integration and fastener access |
| D04 | Torso envelope | 220 W x 190 D x 205 H mm | P | Structural and equipment packaging |
| D05 | Base envelope | 280 W x 240 D x 115 H mm | P | Load, center-of-mass and anti-tip test |
| D06 | Overall width with static arms | ~351 mm (from conceptual arm locations) | P | Exact assembly CAD projection |
| D07 | Frame upright location | X = +/-90; Y = +/-80 mm | P | Joint, side-panel and tray interference test |
| D08 | Frame bar section | 10 x 10 mm candidate | P | Material choice, bending, load-path and fastener design |
| D09 | Reserved compute bay | 150 W x 140 D x 65 H mm | P | Actual donated device + connectors/cooling clearance |
| D10 | Neck interface | 40 x 40 mm 4-hole M3 grid | P | Physical test coupon + neck load evaluation |
| D11 | Shoulder interface | 30 x 30 mm 4-hole M3 grid | P | Printed joint strength test |
| D12 | Universal test plate P-001 | 100 x 70 x 4 mm; R5; 28 x 3.4 mm holes | P | Printed coupon dimensional and screw testing |
| D13 | P-001 hole coordinates | X {-30,-20,-10,0,10,20,30}, Y {-15,-5,5,15} | P | Caliper measurement after printing |
| D14 | Computer location | Torso-mounted or external | P | Actual Acer size, donor Pi/mini-PC dimensions |
| D15 | Battery chemistry and power wiring | NOT SELECTED | U | Actual electrical load/protections/testing |
| D16 | Source-file geometry reuse | NONE in v0.1 | V for our model file | Compare imported content before revisions |

**Axis convention:** +X to robot right, +Y toward rear, +Z upward; ground surface is Z=0. Dimensions are mm. Axonometric exploded offsets are for visualization only, not assembly gaps.

## Part/assembly nomenclature

| ID | Name | Description |
|---|---|---|
| A1 | HEAD-SHELL | Two exterior halves and interchangeable faceplate |
| A2 | HEAD-FRAME | Internal mounting cage for future audio, vision and display equipment |
| A3 | NECK-STATIC | Detachable top/bottom plates and a fixed spacer |
| A4 | TORSO-FRAME | Four uprights, crossmembers and a load path into base |
| A5 | TORSO-PANELS | Serviceable nonstructural outer enclosure |
| A6 | COMPUTE-ADAPTER | Generic carrier plus device-specific replaceable adapters |
| A7 | POWER-ADAPTER | Reserved compartment, no electric system selected |
| A8 | ARM-L / ARM-R | Independently removable static arms, future actuator upgrades |
| A9 | BASE | Bottom/top covers, structural risers and future ballast |
| P-001 | DIMENSIONAL TEST COUPON | First printed test of a proposed grid and M3 clearance holes |

## Controlled engineering terms (add new words at each revision)

- **Assembly:** multiple parts intended to connect in a functional unit.
- **Subassembly:** independently serviceable part group.
- **Exploded view:** parts displayed with *diagrammatic* separation to show relationships, not true installed spacing.
- **Datum:** agreed geometric reference axis, plane or point from which measurements are taken.
- **Envelope:** reserved physical bounding volume, not a promise of useful internal free space.
- **Mounting pattern:** measurable hole locations shared by parts that mate.
- **ICD (interface control drawing):** specification of features mating assemblies must share.
- **Nominal dimension:** target measurement without stating measured variation.
- **Tolerance:** allowable manufacturing variation from nominal, established with evidence or design requirements.
- **Clearance:** free room required to fit, move, assemble or cool a part.
- **Parametric CAD:** geometry driven by editable dimensions/variables.
- **M3:** nominal 3 mm diameter metric threaded hardware; hole geometry is a separate design choice.
- **BOM:** bill of materials, tracking item IDs, descriptions, quantities and sourcing.
- **Manifold mesh:** surface geometry consistently enclosing a solid; check for printability.
- **Center of mass:** location of combined mass that informs stability and motion loads.
- **DOF:** degree of freedom, one independent axis of movement.
- **Load path:** mechanical route transferring weight and forces into structural supports.
- **Revision:** recorded change in geometry, evidence or requirements.

## Next validation tasks

1. Inspect the selected repositories at the **individual-file level**, and record the relevant file/revision before deriving any further design feature.
2. Measure the **actual** donated printer build envelope and confirm print material/settings with a donor.
3. Export a standalone **P-001 test coupon** as STL from a separate print-optimized design, slice and print it; the current exploded model should not be sliced as an assembly.
4. Measure P-001 hole diameters and pitches with calipers; test real fasteners five installation cycles.
5. Acquire device dimensions, weight, connector service space and heat/vent requirements before building device-specific trays.
6. Test real frame joint and anti-tip behavior before treating V1 as structurally buildable.

## Change log

- **2026-10-20 / v0.1:** Initial skeleton-first nominal envelopes, independent visual OpenSCAD concept, eight-page engineering drawing package, ten external references, evidence/terminology definitions. **No tested STL parts released.**