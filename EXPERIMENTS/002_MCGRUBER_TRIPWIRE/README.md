# Experiment 002 — McGruber light-beam tripwire in 3D Vision

**Digital concept, not measured fabrication CAD.** This example is a teaching and inspection copy of the [McGruber light-beam tripwire](https://github.com/jimedusot-beep/project-mcgruber/tree/main/projects/01-light-beam-tripwire), whose 13-part exploded assembly is also documented in [H.E.R.B.I.E. Cyborg Hardware](https://github.com/jimedusot-beep/Herbie-cyborg-hardware/tree/main/examples/mcgruber-light-beam-tripwire).

## Open directly in 3D Vision

- **[Open exploded assembly in the live 3D workshop](https://jimedusot-beep.github.io/3D-vision/?example=mcgruber-tripwire-exploded)** — 13 named components; orbit, zoom, select, hide, measure visually, and export.
- **[Open assembled concept in the live 3D workshop](https://jimedusot-beep.github.io/3D-vision/?example=mcgruber-tripwire-assembled)** — same 13 parts positioned without exploded offsets.

The links above work **after this change has passed CI, merged and deployed to GitHub Pages**. Until then use the files in this PR or manually import the originals.

## What was added

| File | Contents |
| --- | --- |
| [assembled.obj](assembled.obj) | 13 OBJ component groups in approximate assembled positions |
| [exploded.obj](exploded.obj) | The same named triangle meshes displaced by the Cyborg/McGruber proposed explosion offsets |

Models are stored in the repository catalog automatically. A small strict [example route registry](../../src/example-models.js) maps the two URL identifiers to these specific public files; URL parameters cannot choose an arbitrary remote fetch.

**Coordinate and unit rule:** Original illustrative OBJ coordinates use Y as up and approximate millimeters. 3D Vision normally uses Z-up internally and the OBJ import options explicitly convert Y-up to Z-up while maintaining the numerical scale. **Illustrative millimeters are not real measurements** and must never be treated as checked mount geometry.

## Controls and handoff

1. Drag on the model to rotate; scroll/pinch to zoom.
2. In the component tree, choose an emitter, receiver, or controller part. Hide, isolate or transform it; this is only a digital arrangement.
3. The exploded OBJ **begins already separated**, unlike an animated constraint-aware explosion. Use 3D Vision's own explode preview if you want a further visual separation.
4. Export a complete `.3dv` project to retain the original asset and your own changes, then save the file somewhere you control. GitHub Pages saves its project revisions locally in the browser profile.
5. Keep actual hardware discoveries, component specs, electrical ratings and assembly measurements in [Cyborg's learning-case manifest](https://github.com/jimedusot-beep/Herbie-cyborg-hardware/blob/main/examples/mcgruber-light-beam-tripwire/assembly_manifest.json) and [McGruber's project records](https://github.com/jimedusot-beep/project-mcgruber/tree/main/projects/01-light-beam-tripwire) rather than editing these placeholder meshes as if they were physical evidence.

## Engineering status and constraints

These files were copied, without dimensional alteration, from **Cyborg Hardware's assembled/exploded OBJ snapshot**. The Cyborg models themselves were originally generated from McGruber's educational 13-part part-ID/position manifest and simple primitive mesh approximations. This experiment contains **no claimed physical scan, manufacturing tolerance, validated electrical pinout, tested ESP32 integration, or proven LED/sensor performance**.

The receiver and emitter are separate low-voltage assemblies; the depicted optical beam should be a low-brightness diffused visible LED below eye level, not a laser. A voltage-divider or other sensor interface must be designed for the actual sensor and verified against the ESP32-C3's GPIO voltage limits. The robot's motor and power system remain independent and unverified.
