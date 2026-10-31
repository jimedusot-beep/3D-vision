# Physical iPhone and anatomical validation checklist

**Status: not yet run on a physical phone.** Passing Playwright/WebKit simulations does not certify Safari VoiceOver, actual GPU memory, Wi-Fi/cellular behavior or clinical accuracy.

## 1. Physical iPhone smoke review (15–25 minutes)

Open the currently published [SLP study hub](https://jimedusot-beep.github.io/3D-vision/ANATOMY/SLP/systems.html) in **Safari**. Record iPhone model, iOS version, connection type (Wi-Fi/cellular), and the approximate date. **Do not record patient data, private addresses or Apple IDs.**

- [ ] From the main 3D Vision workshop, the **SLP 3D Anatomy Atlas** link opens the seven-card study hub.
- [ ] Each card opens its own source-derived 3D viewer: Larynx, Lungs, Diaphragm, Oral, Pharynx, Right Ear and Neural. A loading message eventually becomes a rendered model; check no blank/stuck canvas.
- [ ] For each viewer, rotate with one finger, pinch to zoom, use the native structure list, select and focus a structure, isolate/restore it, and return to the hub. Check no accidental page scrolling on the 3D canvas.
- [ ] Test browser orientation change and confirm no horizontal clipping or overlapping buttons.
- [ ] Larynx: the **3D anatomy launch button** should open source geometry directly after the fix in PR #18 is published, while the concept-map view remains an option.
- [ ] If a model fails, note the page name, connection and exact visible error, and retry **once**. Do not report an isolated slow connection as proven anatomical corruption.

## 2. VoiceOver manual screen-reader review (10–20 minutes)

On iPhone, open **Settings → Accessibility → VoiceOver**, enable it, then return to Safari. Be prepared for changed gestures (single tap selects/focuses; double-tap activates; three-finger swipe scrolls).

- [ ] Explore each of seven launcher links in reading order, verify its name is understandable, then activate by double-tapping.
- [ ] Navigate headings with the VoiceOver rotor; labels for select dropdowns, filter checkboxes and buttons must be announced meaningfully.
- [ ] Select a labeled anatomical structure *without 3D gestures*; the written anatomy explanation should remain discoverable.
- [ ] In Neural, test search, left/right/midline filters and the **text-only CN IX** checkpoint. Check quiz question, options, corrective feedback and final summary are announced.
- [ ] In Ear, test the seven-step sound journey and the explicit warning about missing microanatomy.
- [ ] In Larynx, verify you can choose source notes without manipulating the canvas; VoiceOver should not trap keyboard/screen-reader focus in the 3D region.
- [ ] Disable VoiceOver using Settings afterward.

**Accessibility pass requires real human review.** Automated role/status checks do not confirm VoiceOver reading order, gestures or actual usability.

## 3. Real network and performance evaluation

Run with (A) normal Wi-Fi, then (B) ordinary cellular service if available. Avoid driving or unsafe testing locations. Without a repeatable controlled radio connection, this is a **subjective experience check** and not a standardized bandwidth benchmark.

- [ ] Open each model with a cold Safari session and estimate time until 3D appears.
- [ ] Repeat model openings to see whether cached loads noticeably improve.
- [ ] Rotate each model for 30 seconds: check smoothness, input lag, frozen frames, forced reloads, battery drain or unusual device heating.
- [ ] On slower connection, note whether loading reaches a visible model or shows a meaningful fallback, without a permanently spinning page.
- [ ] Optionally compare on an older iPhone to find actual device-specific issues. Never claim CPU/GPU memory from the subjective tests.

## 4. What to report (copy into issue #14)

```text
Physical device: [iPhone model, iOS/Safari version]
Connection(s): [Wi-Fi, cellular, other]
VoiceOver reviewed: [yes/no]
All seven models displayed: [yes/no, failures]
Rotation/zoom/structure selection: [pass / issues]
Guided lessons and quizzes: [pass / issues]
Notable delay, crash, heating or screen-reader obstacle:
URL and exact visible error (if any):
Screenshot / short recording (optional; remove personal info):
Overall physical-device readiness: [pass / needs fixes / not yet tested]
```

Issue link: https://github.com/jimedusot-beep/3D-vision/issues/14

## 5. Anatomical and alignment review gate

The **seven source models have independently transformed axes, scales, meshes and cropping**. Their glTF `POSITION` accessor bounds, node matrices and sizes are not evidence that structures anatomically align. Do not mix them into one purported patient-like body without independent registration.

- [ ] Record original model commits, checksums, authors, license terms and per-model transformations from the model source manifests.
- [ ] Verify anatomical labels and gross structure orientation against independently reviewed anatomical references with a subject-matter expert. Document omissions (e.g., absent standalone CN IX, vestibular branch != full auditory nerve).
- [ ] If building a composite, define explicit coordinate conventions and registration landmarks, and measure distances and topology against independent sources. Do not infer transformations from independently recentered mesh centers.
- [ ] Prove alignment with multiple landmarks and held-out landmarks, not just visual appearance. Keep an on-screen **not validated / educational** badge until reviewed.
- [ ] Maintain original source assets and attribution and track every processed derivative under its source CC BY-SA license.

Review issue: https://github.com/jimedusot-beep/3D-vision/issues/15

### Current automated evidence

The project has [public runtime audit tests](../../tests/slp-runtime-audit.mjs) and [synthetic slower-network profiling](../../tests/slp-slow-mobile.mjs). Neither is a substitute for the physical-telephone and expert reviews above.
