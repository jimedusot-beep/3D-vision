# H.E.R.B.I.E. SLP Atlas — runtime, performance, reliability audit

**Date:** 2026-10-31. **Production version tested:** `b6ebd1560ff77dc9c57f9db5d4c48462a40ce790` on GitHub Pages.
**Evidence:** [production publishing / regression checks](https://github.com/jimedusot-beep/3D-vision/actions/runs/41223511089), [public website smoke checks](https://github.com/jimedusot-beep/3D-vision/actions/runs/41223731024), and [seven-lab real-render and load audit](https://github.com/jimedusot-beep/3D-vision/actions/runs/41224668860).

## What passed

The seven public anatomy pages **each successfully loaded and displayed original licensed GLB source geometry** in both a simulated iPhone-13 Chromium environment (Linux GitHub runner) and a simulated iPhone-13 WebKit environment (macOS GitHub runner). Both jobs completed successfully, with a visible canvas, an actual GLB network request, no uncaught page errors, and usable canvas dimensions. Their JSON reports are preserved as GitHub Actions artifacts.

### Elapsed navigation → ready-to-study canvas (milliseconds)

| Lab | Chromium/Linux | WebKit/macOS | Pinned GLB bytes |
|---|---:|---:|---:|
| Larynx / phonation | 1,050 | 3,103 | 5,257,920 |
| Lungs / airways | 576 | 2,003 | 3,901,260 |
| Diaphragm | 502 | 1,910 | 3,649,120 |
| Oral structures | 1,357 | 3,310 | 754,496 |
| Pharynx / soft palate | 820 | 2,346 | 7,148,788 |
| Right ear | 1,226 | 1,745 | 1,010,340 |
| Cranial nerves / brainstem | 1,299 | 3,354 | 4,650,816 |

**Interpretation:** These timings are empirical **on GitHub-hosted runners with unthrottled network connections**; they are **not representative real-device iPhone benchmarks**, cellular 3G/4G tests, battery measurements, sustained frame rates, or peak GPU/JS memory. A single run provides no variance or percentile estimate. The seven GLBs together total **26,372,740 bytes (~26.4 MB)**, but they are fetched **on separate study pages**, not simultaneously on opening the hub. Model download size alone does not predict post-Draco memory use.

## Findings, risks and suggested actions

| Priority | Status | Finding | Recommended next action |
|---|---|---|---|
| P1 | **FIXED on audit branch** | Public smoke tests checked GLB downloads but not actual 3D rendering. An HTML page and HTTP-200 mesh file alone could pass despite WebGL or parser failure. | New `tests/slp-runtime-audit.mjs` tests all seven real public render paths and emits load metrics / diagnostics in both browser engines. Add it to post-deployment verification and maintain reports. |
| P1 usability | **FIXED on audit branch** | The Atlas's “Open a 3D model” larynx link lands on a **concept map**, requiring a second click for the real larynx GLB. | Launch larynx using `?view=three`, while preserving the concept map as the default for other links and a fallback when WebGL is unavailable. Regression-test the deep link. |
| P1 science | Open | Seven source models are recentered/transformed separately, and **not anatomically registered**; the 3D topic graph is not a fused body. | Do not merge them into a single body until coordinate registration and structures are validated. Continue individual views and transparent disclaimers. |
| P2 performance | Open, **risk rather than demonstrated defect** | Pharynx GLB is 7.15 MB; larynx 5.26 MB; neural 4.65 MB. The neural source has 437 catalogued records, while the study exposes only 74. Its unshown source geometry can add parsing/decompression and memory pressure. | Benchmark on an actual older iPhone and CPU-throttled browser; compare full-neural GLB to a **source-preserving 74-record extract** with original IDs, checksum, license and anatomy unchanged. Do not guess memory savings. |
| P2 mobile | Open | There is no measured low-bandwidth download performance, touch responsiveness under GPU pressure, memory peak, thermal throttling or battery usage. | Add controlled slow-network and FPS/long-task profiling, then a physical iPhone 13/older-device Safari and VoiceOver session (#14). |
| P2 UI | Open | Slow downloads show a loading status, but no verified incremental download percentage or progress bar. | Consider an accessible progress/status indicator for the three largest assets after performance/bandwidth measurement. |
| P2 release | **IMPROVED on audit branch** | A successful local/predeploy build alone cannot establish the public site works. | Post-publish runtime audit verifies live model readiness, displays 3D and keeps JSON reports with evidence and thresholds as **warnings**, not misleading claims of universal speed. |
| P1 evidence | Open | Anatomy provenance/checksums are documented, but qualified expert content and external surface review are pending (#15). | Preserve attribution; do not imply clinical accuracy or complete nerve coverage until independently reviewed. |

## Scope boundaries

The live smoke tests and runtime audit confirm that a model is reachable, parsed and displayed; they do **not** validate anatomical correctness, mobile assistive technology, physical compatibility, or reliable operation offline. Visual geometry is static, without validated physiology or movement simulation. The models remain separately licensed CC BY-SA 2.1 Japan / CC BY-SA 4.0 assets, not automatically relicensed under the app code license.

## Future measurements for a real performance budget

Collect several repeated trials per model across cold/warm caches, fast Wi-Fi, throttled cellular, and a physical older iPhone. Record 50th/95th-percentile time to ready, network transfer, decompressed geometry, total draw calls and vertex/triangle counts, frame stability under manipulation, long tasks, peak memory and crashes. Declare budgets **only after baselining**; runner-based results above are initial reference values.

**Release policy:** audit changes belong in a reviewable pull request. The live production site remains the last verified published version until those changes are explicitly approved and merged.
