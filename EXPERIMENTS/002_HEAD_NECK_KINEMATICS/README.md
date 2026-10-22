# H.E.R.B.I.E. Experiment 002 — two-axis head/neck study

**Status: VISUAL KINEMATIC STUDY — UNVERIFIED.** This experiment sketches *how a moving neck might be organized* without modifying the existing 18 STL parts or claiming any actuator, joint, bearing, mount, clearance or physical system has been selected or tested.

## Critical existing limitation

The current [HBR-005 part](../../HERBIE_V1/PARTS.csv) is **Fixed_Neck**. It is not a demonstrated pan/tilt joint. The current [main CAD source](../../HERBIE_V1/CAD/HERBIE_V1_Master.scad) defines head envelope **240 × 170 × 145 mm** and a nominal neck envelope at Z=320–355 mm. The independently created pan/tilt pivot positions in this experiment are *illustrative guesses, NOT measured hardware geometry*.

This study **does not** allocate HBR-019 or overwrite HBR-005, manufacturing STLs, assembly transforms, or production build scripts. No physical components were acquired or tested.

## Open a preview

Open [`Head_Neck_Kinematics.scad`](Head_Neck_Kinematics.scad) in [OpenSCAD](https://openscad.org/), press F5, and explore `pan_preview_deg` and `tilt_preview_deg`. Or run:

```sh
openscad -o /tmp/herbie-neck-preview.csg Head_Neck_Kinematics.scad
openscad -o /tmp/herbie-neck-pose.csg -D 'pan_preview_deg=20' -D 'tilt_preview_deg=15' Head_Neck_Kinematics.scad
```

**Exported CSG is for parser/geometry preview testing only.** Do not 3D-print a preview or interpret orange rods as shaft/bearing designs. The faint blue ghost poses (±20° pan, ±15° tilt) are arbitrary teaching poses, **not mechanical travel specifications, speed limits or an approved actuation range**.

The model illustrates separate rotations: pan about world **Z**, tilt about the pan stage's local **X**. A transparent box is the proposed torso envelope; an orange stationary neck proxy depicts the *current fixed* concept. Nothing here establishes clearance within the real shell or over cables.

## What needs measured evidence next?

| Engineering question | Authority | Current state |
|---|---|---|
| Actual moving head mass, CG offsets, inertia and duty cycle | Physical assembly + [Cyborg Hardware](https://github.com/jimedusot-beep/Herbie-cyborg-hardware/blob/main/docs/MECHANICAL_LOAD_MEASUREMENT.md) | Unknown |
| Actual head/internal-frame dimensions and space reserved for axes | 3D Vision measured CAD + physical checks | Concept-only |
| New bearing and moving-neck geometry, attachment method, tolerances | 3D Vision; reviewed independently | Not designed |
| Cable routing, twist, pinch points, stops and collision review | 3D Vision + electrical review | Not evaluated |
| Servo or smart-actuator model, voltage, torque, power, controller protocol | [Cyborg Hardware](https://github.com/jimedusot-beep/Herbie-cyborg-hardware) | Unselected |
| Safe command bounds, watchdog, STOP/RESET and physical motor power interruption | Herbie + Cyborg Hardware; supervised physical verification | Not implemented or tested |

**Do not use H.E.R.B.I.E.'s existing simulated motion degree limits for physical hardware.** A display pose is not a proof of clearance, continuous torque or stop efficacy. The project remains simulation-first, and actual physical motion is prohibited until appropriate reviews and measurements.

## Regression/consistency checks

The [metadata](study-manifest.json) marks every physical verification field `false` and references the existing body dimensions. The focused [Node test](../../tests/head-neck-concept.test.mjs) verifies those metadata gates, that HBR-005 still means Fixed_Neck, and that core preview parameters exist in OpenSCAD. This test does **not** evaluate physical clearances or certify a mechanical design. The [focused pull-request workflow](../../.github/workflows/head-neck-study.yml) also compiles two non-printable CSG preview poses in OpenSCAD. These parser checks do **not** establish collision-free travel, physical fit or joint strength.

The authoritative [H.E.R.B.I.E. hardware compatibility mapping draft](https://github.com/jimedusot-beep/Herbie-cyborg-hardware/pull/7) should be reviewed independently. The software/brain repository is unchanged by this experiment.
