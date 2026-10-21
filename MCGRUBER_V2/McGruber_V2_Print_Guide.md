# McGruber mounting base V2

This prototype revises the original plate. It is an electronics mounting platform, not a load-rated robot chassis. The parts do not include battery contacts, board-specific adapters, servo brackets or electrical wiring.

## What changed

- Base remains 150 × 100 mm; thickness increases from 3 to 4 mm. This adds material; stiffness has not been tested.
- 142 nominal 3.6 mm round openings replace most square holes. Hole centers remain on a 10 mm grid, starting 5 mm from the edges. These are clearance openings, not threads.
- Eight 6 × 3.5 mm rectangular openings accept appropriately narrow straps or cable ties. Their centers are (15,15), (135,15), (15,85), (135,85), (75,5), (75,95), (5,45), (145,45), measured from the lower-left corner in top view.
- Separate 10 × 10 × 8 mm feet provide space for fastener hardware beneath the base. Print four and place beneath the corner holes at (5,5), (145,5), (5,95), (145,95). They are screw-on spacers; they do not snap into place.
- A 60 × 10 × 4 mm test strip has six nominal round hole diameters: 3.0, 3.2, 3.4, 3.6, 3.8 and 4.0 mm, increasing left to right when oriented as in the preview. No labels are embossed: keep the preview for orientation, or flip end for end to compare.
- The OpenSCAD source provides selectable base, test and foot models. Outer corners remain square, matching the delivered STL; the earlier generated illustration showed rounded corners and accessory mounts that were not delivered CAD geometry.

## Print and fit procedure

1. Import the test STL in millimeters and keep its scale at 100%. Confirm 60 × 10 × 4 mm in your slicer.
2. Print it flat, using the same material and settings planned for the base. Start with 0.2 mm layers if appropriate for your printer. These are starting settings, not a verified printer profile.
3. Try your intended screw or tie in the holes. Check clearance by hand; do not force a screw into an undersized opening. Round holes are polygon approximations; printer shrinkage and extrusion affect fit.
4. If 3.6 mm is unsuitable, adjust the base's opening diameter in the editable source before exporting a new STL. Strap openings may also need adjustment for your actual ties.
5. Print the base flat, 150 × 100 × 4 mm at 100% scale, with no support expected for this orientation. Inspect the slicer preview. Confirm the printer bed accommodates the part and any brim.
6. Print four feet if underside clearance is needed. Use screws long enough for the actual stack of base, foot, washers and nut. Hardware is separate; verify length against your assembly.
7. Mount boards using separate insulating standoffs or trays. Do not put exposed board solder joints directly against screw heads. Keep battery contacts in their proper battery holder.

## Verification and limits

Each delivered STL was checked for closed mesh edges, consistent face orientation, connected geometry, nonzero triangles, positive volume, expected outer dimensions and binary STL size. All three part selections were also exported successfully using OpenSCAD. Their exported bounding dimensions and volumes matched the delivered meshes within 0.2 cubic millimeters. These checks verify geometry; they do not verify physical printing, strength, component fit or electrical function. The source uses the same opening polygons as the exported mesh.

No specific servo, battery holder, microcontroller or Raspberry Pi fit is claimed. This V2 preserves the original as a separate design. Dimensions and changes are from the generated geometry and accompanying verification report, not manufacturer specifications.
