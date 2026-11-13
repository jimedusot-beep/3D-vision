# Opt-in physical-iPhone diagnostic evidence for Issue #31

Applies only to the **larynx, oral, pharynx and right-ear** source-backed SLP labs.

**Feature status:** proposed in a draft PR; not available on the published site until a reviewed release. Do not mistake the currently published Atlas for this PR preview.

On a reviewed preview or after an approved release, add **?debug=1** to a lab URL (or **&debug=1** after an existing query):

- Larynx: ANATOMY/SLP/index.html?view=three&debug=1
- Oral: ANATOMY/SLP/oral.html?debug=1
- Pharynx: ANATOMY/SLP/pharynx.html?debug=1
- Right ear: ANATOMY/SLP/ear.html?debug=1

A collapsed, fixed **Diagnostics · [lab] (local)** panel appears. Without the exact debug=1 query value, no panel or diagnostic listeners are installed; normal anatomy study controls are unchanged. The pages load only a tiny loader, which dynamically imports the actual diagnostics and redaction modules **only after debug=1**. No diagnostic module network request occurs on a normal page.

1. Open a 3D lab and wait for the model to load or fail. Larynx must use the 3D view.
2. Open Diagnostics to see observed start/end times and any load error, canvas CSS/device-pixel sizes, device pixel ratio, masked WebGL vendor/renderer/version information, canvas touch/pointer count, WebGL context events, JavaScript errors and memory information where available.
3. Try one action that failed on the real phone: select, explode or reassemble. The report records the *last* matching action with its UTC timestamp.
4. Tap **Copy report**. If Safari prevents clipboard access, a selectable text field appears for manual copying.
5. All included text passes through a **best-effort sensitive-data redactor** (emails, bearer/API tokens, long hex/base64-like identifiers, URL queries/fragments). It is not guaranteed to catch every secret. **Review the report for remaining private details before sharing** and paste only what is needed into Issue #31. No report is automatically uploaded or stored by this panel.

**Interpretation:**
- Observed model timing is measured from the diagnostic observer (not GPU profiling or exact network timing).
- performance.memory is not exposed by many iPhone browsers; **unavailable does not mean low memory usage**. Memory-pressure events are nonstandard and may not fire even if the browser runs out of memory.
- A lost WebGL context is a real event, but does not by itself prove the cause was RAM exhaustion.
- Touch/pointer counts establish delivery to the canvas, **not** correct anatomical ray picking.
- Browser-masked renderer strings are not definitive GPU identity; no unmasked identification or device serial number is gathered.
- WebKit iPhone emulation in CI is **not a physical-iPhone verification**. The WebKit/Chromium tests deliberately deny clipboard access and verify that the selectable manual-copy report contains synthetic redacted errors. Keep Issues #14 and #31 open until device observations identify the failing action and its visible error.

This feature must remain review-only until the stacked PR passes exact-commit CI and is explicitly approved. It does not change 3D model geometry, licenses, study content, public cloud storage or camera/microphone permissions.
