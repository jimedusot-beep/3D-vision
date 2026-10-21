# Joints and mesh analysis

## Create a moving assembly

1. Import two or more models, or add primitives. Select a component and use numeric transforms or the gizmo to establish its starting placement.
2. Open **Inspector → Assembly joints → Create joint**. Choose the parent and the driven component. The current placement is the zero reference. Checking two top-level components first preselects them in that order.
3. Choose **Fixed**, **Revolute / hinge** or **Prismatic / slider**. Axes and hinge pivots use the parent's local coordinates. Travel is degrees for hinges and parent-local millimeters for sliders. Limits must include zero.
4. Use the travel number or slider, or **Animate joint**. Moving the parent propagates through an acyclic joint chain. Pause animation to keep the displayed pose.
5. **Save revision** or export a complete `.3dv` project. Definitions, travel limits and current positions survive reopening. Mesh exports bake only the displayed geometry.

Each driven component has one driver. Endpoints must stay top-level components or top-level visual groups, with positive uniform scale. Remove a joint before grouping its endpoints. Removing a joint retains the current pose; deleting/replacing an endpoint drops its associated joints. A driven part uses joint travel rather than direct transform controls. These are kinematic mesh transforms, not a closed-loop mate solver or force simulation.

Distance/angle measurements and notes now attach to the clicked component. Their positions and measurement values follow transformations and joint motion. Hidden or deleted endpoints suppress their marks. Legacy world-coordinate notes remain readable.

## Interference and surface clearance

Select the meshes to inspect, or clear the selection to inspect all visible meshes. Set a clearance warning distance and choose **Mesh interference**. The worker reports:

| Classification | Meaning |
|---|---|
| Surface | Triangle surfaces intersect or touch; this does not prove positive overlap volume |
| Containment | A connected closed surface shell is inside the other mesh according to ray parity |
| Clearance | Nearest surface separation is within the requested threshold |
| Clear | A broad-phase candidate passed the numerical surface/containment checks |
| Uncertain | Open/inconsistent topology or disagreeing containment rays need manual inspection |

Bounding boxes only prune pairs. Cavity and disconnected-shell cases have regression fixtures. Floating-point checks do not certify mechanical contact tolerances or self-intersection freedom; exact overlap volume is not calculated.

## Preliminary wall sampling

Under **Print preparation**, choose a thin-wall warning threshold and 64–512 surface samples, then choose **Sample wall thickness**. Closed, consistently oriented nonzero-volume meshes receive inward rays from sampled triangle centroids. The report shows sampled minimum/median lengths, unresolved rays and the count below your threshold. Open/inconsistent meshes are explicitly skipped. **Download analysis JSON** includes up to 32 thin-ray witness segments per mesh.

These normal-ray lengths can miss small features, tangential walls and unsampled thin regions. They are not the true minimum wall thickness. A 0.6 mm plate and a 10 mm cube provide known-size fixtures. Slicer, fit, material and physical validation remain required. Print readiness stays unverified.

Both analysis tools use cancellable workers with a 20-second timeout, up to 40 meshes and 300,000 combined triangles. Select a smaller set if you exceed those limits. Editing the scene invalidates the downloadable report; rerun the analysis for the new pose.
