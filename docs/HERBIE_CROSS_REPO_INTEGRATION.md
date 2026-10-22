# H.E.R.B.I.E. cross-repository mechanical integration

This repository owns CAD models, printable parts, GLB assemblies, and mechanical inspection tools for H.E.R.B.I.E. **and other projects**.

- [Brain / software: Herbie](https://github.com/jimedusot-beep/Herbie)
- [Electrical engineering: Herbie-cyborg-hardware](https://github.com/jimedusot-beep/Herbie-cyborg-hardware) — repository created; hardware documentation remains draft.
- [Overall project map](https://github.com/jimedusot-beep/Herbie/blob/main/docs/ENGINEERING_PROJECT_MAP.md) — documentation merged.

## Engineering handoff
For each physical electronics part, record a stable component ID, manufacturer part number, mounting interface, cable route, and clearance evidence when available. Link the electrical BOM rather than maintaining a competing copy. The current models and assembly arrangements are provisional, not measured physical fit confirmations.

Do not move existing STL, CAD or GLB assets into the hardware repository. This viewer remains shared with McGruber and other projects.

Mechanical part IDs HBR-001 through HBR-018 are defined by [`HERBIE_V1/PARTS.csv`](../HERBIE_V1/PARTS.csv). Electronic device IDs and provisional mapping live in the [hardware integration manifest](https://github.com/jimedusot-beep/Herbie-cyborg-hardware/blob/main/integration/system-manifest.json). The foundation is merged; physical integration remains unverified. No servo mount has been physically validated.
