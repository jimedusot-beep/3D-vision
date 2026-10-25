# Experiment 003 — silent tripwire B/C · interactive 3D assemblies

**Digital concept only · no sound · no real sensor connection · dimensions illustrative, not measured.**

## Open the project

**[Open the beginner-friendly B/C 3D gallery](https://jimedusot-beep.github.io/3D-vision/optical-tripwires.html)**

| Model | Open in 3D Vision | What you see |
| --- | --- | --- |
| B — Assembled | [Blue-to-red LED 3D layout](https://jimedusot-beep.github.io/3D-vision/?example=mcgruber-visible-b-assembled) | 16 independently inspectable modeled parts |
| B — Exploded | [Exploded blue/red sensor setup](https://jimedusot-beep.github.io/3D-vision/?example=mcgruber-visible-b-exploded) | Displaced mounting boards, emitter circuit, sensor, missing amplifier and output |
| C — Assembled | [Silent IR detector 3D layout](https://jimedusot-beep.github.io/3D-vision/?example=mcgruber-infrared-c-assembled) | 15 modeled part groups including two supplies, IR pair, pull-up, warning LED |
| C — Exploded | [Exploded infrared model](https://jimedusot-beep.github.io/3D-vision/?example=mcgruber-infrared-c-exploded) | Components separated for explanation |

Each viewport also has a **Block beam / Restore beam** link. For a simulated interruption, the C warning LED glows in the 3D display; the B warning LED deliberately **does not turn on** because its real sensor amplifier/threshold design has not been established. The glowing IR beam used as a *guide* in the viewer is **not visible to the naked eye** in a real room. The blue beam is also a graphical guide; ordinary LEDs cannot make a continuous visible shaft through normal air.

The model is produced by the same in-browser Three.js engine as the rest of 3D Vision; it is **not** a picture posing as an interactive assembly, and does not rely on guessed downloadable binary STL files. The scene can be orbited, zoomed, measured illustratively, edited, and exported as a file or `.3dv` package.

## Guided 3D Assembly Lessons — new beginner mode

Both interactive models now open with an **on-screen 3D build instructor**, using the same actual 16 B and 15 C selectable THREE.js component groups. The instructor doesn't merely replay an illustration:

- **Where to place parts:** each stage highlights its matching 3D pieces. Tap a part name to select only that part or choose **Focus camera on parts**.
- **Exactly which connections are intended:** a wire-by-wire text path shows source, destination and purpose. In B, the unverified amplifier paths are explicitly **UNDESIGNED — DO NOT WIRE**, not invented hookups.
- **The real test at that stage:** each step names a Fluke or physical check, the expected *future* observation and where to record measurements. The viewer cannot automatically verify any of them.
- **Controls:** **Previous / Next**, one-tap **Collapse lesson** for a full view of the 3D model (useful on an iPhone), tap **Mark lesson as read** for browser-local reading progress, and **Reset reading progress**.
- **Bookmarkable steps:** add `&step=1` through `&step=6` to a B URL, or `&step=1` through `&step=7` for C. Steps persist across assembled/exploded and beam-state navigation.
- **Limits:** every actual physical checkpoint stays labeled **NOT recorded / UNVERIFIED**. Marking an instructional page as read is not a build completion, does not create a hardware test log, and does not unlock the missing B amplifier.

**Start the guided lessons:**
- **[B · Stage 1: arrange blue transmitter and red receiver](https://jimedusot-beep.github.io/3D-vision/?example=mcgruber-visible-b-assembled&step=1)** — 6 stages.
- **[C · Stage 1: identify the matched IR transmitter/receiver](https://jimedusot-beep.github.io/3D-vision/?example=mcgruber-infrared-c-assembled&step=1)** — 7 stages.
- **[B · Stage 5: see the unresolved amplifier interface](https://jimedusot-beep.github.io/3D-vision/?example=mcgruber-visible-b-exploded&step=5)** — deliberately blocked.
- **[C · Stage 6: inspect the silent indicator and wiring path](https://jimedusot-beep.github.io/3D-vision/?example=mcgruber-infrared-c-exploded&step=6)** — requires output polarity measurements first.

Code traceability: [step manifests](../../src/tripwire-build-guides.js), [guided viewport UI](../../src/tripwire-guide-ui.js), [validation tests](../../tests/tripwire-build-guides.test.mjs). Physical evidence belongs in McGruber's own measurement logs, **not** in the browser's local reading-progress field.

## Experiment B — blue LED emitter, red LED detector

**B part IDs: 16 conceptual groups** (all IDs `TW-B-`):

| Groups | Role |
| --- | --- |
| 01–02 | Two separate mounting boards |
| 03–06 | 9 V battery/snap, measured emitter current-limiting resistor, blue LED and its conceptual wiring |
| 07–08 | **UNPOWERED** red LED photodetector and optional side-light shield |
| 09 | **UNKNOWN/MISSING** high-impedance amplifier and light-loss threshold — orange placeholder, deliberately not a chosen IC or completed circuit |
| 10–12 | 2N4401 switching stage (**actual manufacturer's pinout not verified**), separate red warning LED and current-limiting resistor |
| 13–16 | Isolated detector leads, *symbolic* beam, unconnected amplifier-to-switch interface marker and indicator mount |

**Unresolved:** the red detector LED's actual photocurrent/sensitivity and the high-gain analog amplifier/threshold. Passing an electronic simulator or 3D viewer cannot prove sensitivity, transistor polarity or range. A proposed 1 kΩ transmitter resistor is conditional on a measured ordinary blue indicator LED, its supply and safe forward-current rating. Do not connect LEDs directly to a battery.

**Underlying hardware guide:** [P01 blue-to-red experiment, McGruber](https://github.com/jimedusot-beep/project-mcgruber/blob/main/projects/01-light-beam-tripwire/EXPERIMENT_B_LED_AS_SENSOR.md). If this is unavailable on `main` pending merge, consult [McGruber PR #32](https://github.com/jimedusot-beep/project-mcgruber/pull/32).

## Experiment C — matched infrared pair

**C part IDs: 15 conceptual groups** (all IDs `TW-C-`):

| Groups | Role |
| --- | --- |
| 01–02 | Separate demonstration mounts |
| 03–05 | Rated regulated 5 V emitter power, matched module transmitter and emitter wiring |
| 06–07 | 3-wire matched IR receiver and its own rated 5 V supply |
| 08–09 | **10 kΩ pull-up** resistor and **1 kΩ red LED current-limit** resistor |
| 10–11 | Silent warning LED and indicator plate |
| 12–14 | Conceptual receiver OUT, power and warning-LED current paths |
| 15 | Invisible IR ray visual aid — beam absent / blocked state is a simulated story illustration |

The module-based C circuit corresponds specifically to **Adafruit 2167/2168 type** active-LOW-on-break open-collector output documented by the manufacturer. **Do not apply those output/pin wiring assumptions to an unidentified IR sensor**, the 4 m DFRobot model, or a salvaged television remote. Both independent supplies are nominal regulated 5 V here; the geometry is **not** an actual battery power supply or enclosure design. Vendor-rated C1 range is only roughly 10–20 inches, not a tested 6–15 foot doorway.

**Underlying hardware guide:** [P08 silent infrared experiment, McGruber](https://github.com/jimedusot-beep/project-mcgruber/blob/main/projects/08-infrared-tripwire/EXPERIMENT_C_SILENT_IR.md). The schematic [on the McGruber PR #32](https://github.com/jimedusot-beep/project-mcgruber/pull/32) includes the real model-specific series resistor / pull-up wiring; the 3D assembly is *not* a definitive pin-level schematic.

## How to navigate (phone or computer)

1. Open [the gallery](https://jimedusot-beep.github.io/3D-vision/optical-tripwires.html), choose B or C, and press **Open 3D model**.
2. Swipe/drag to orbit, pinch/scroll to zoom, and tap **Show exploded** to separate emitter, receiver and warning-light sections.
3. Tap **Block beam** or **Restore beam** in the viewport for a symbolic demonstration. **Only the display changes**; no actual photodiode, transistor or IR receiver is read.
4. Open **Components** (on phones, use the mobile panel button). Select, hide or isolate an individually named part.
5. Select **Save revision** for a browser-local saved version and use **Export → complete project (.3dv)** to back up a revision and its geometric objects. Downloaded exports still have *illustrative* dimensions.
6. At any stage, choose **Switch to B/C** to compare the two designs without needing to navigate back.

## Geometry provenance and versioning

- Original generator code: [`src/optical-tripwire-models.js`](../../src/optical-tripwire-models.js), pure procedural THREE.js geometry with primitive cylinders, discs, colored wires, mounting plates and LEDs.
- Valid route inputs: four allowlisted `?example=` IDs in [`src/example-models.js`](../../src/example-models.js). Optional `&beam=blocked` changes only the **rendered optical state**.
- CI: [`tests/optical-tripwire.test.mjs`](../../tests/optical-tripwire.test.mjs), [`tests/workshop.mjs`](../../tests/workshop.mjs) and [`tests/webkit.mjs`](../../tests/webkit.mjs) check 3D component identities, geometry validation, switching and simulated beam feedback.
- Units: **approximate millimeter-numbered**, Z-up workspace, with no dimension measurements, manufacturing tolerances, verified GPIO or current-flow simulation.
- Ownership: McGruber remains the build/test evidence source; Cyborg Hardware remains the hardware measurement and fabrication study; 3D Vision provides editable educational models. There is **no auto-sync of hardware test results**.

## Actual release gates

Software completion means: browser loads all 16/15 parts and the 3D geometry, label, clear/blocked and export behavior passes automated tests and is deployed to 3D Vision Pages. **It does not mean the physical tripwire is assembled**.

Hardware B next: owner measures real red LED light-present/blocked/restored millivolts with Fluke over ten repeats, then verifies suitable amplifier/threshold design and independently tests 2N4401 output wiring. Hardware C next: obtain and identify an actual **matched** low-voltage IR emitter/receiver, then verify supply and HIGH/LOW output using Fluke before connecting the current-limited visible warning LED. No lasers, sound, buzzers or mains salvage.

[3D Vision home](../../README.md) · [Cyborg case-study assembly](https://github.com/jimedusot-beep/Herbie-cyborg-hardware/tree/main/examples/mcgruber-light-beam-tripwire)
