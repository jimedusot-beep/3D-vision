// H.E.R.B.I.E. EXPERIMENT 002 — moving-neck KINEMATIC ENVELOPE STUDY.
// All values millimetres. NOT a printable servo mount, fit proof, load rating,
// collision proof, validated joint, electronics, or motor-control plan.
// No new HBR numbered production part is created.
// World: Z up, -Y front, X left/right. Pan around vertical Z; tilt around lateral X.
// Head proxy dimensions come from HERBIE_V1/CAD/HERBIE_V1_Master.scad.
// The reference HBR-005 is a Fixed_Neck, not this moving joint.
//
// Usage: openscad -o /tmp/herbie_neck_study.csg this_file.scad
// Try -D 'pan_preview_deg=20' -D 'tilt_preview_deg=15' to visually inspect.
// These values are *preview angles*, NOT mechanically safe limits.
$fn = 40;
pan_preview_deg = 0;
tilt_preview_deg = 0;
show_fixed_neck_reference = true;
show_torso_envelope = true;
show_sample_ghosts = true;

// Source-level CAD nominal envelope, not a physically measured moving assembly.
head_w_mm = 240;
head_d_mm = 170;
head_h_mm = 145;
head_center_z_mm = 355 + head_h_mm/2;  // nominal body preview convention
torso_w_mm = 220;
torso_d_mm = 190;
torso_top_z_mm = 320;
fixed_neck_h_mm = 35;

// All following moving-joint positions are proposed ONLY for this experiment.
// No surveyed mounting holes, bearings, selected actuator or inertia values.
pan_stage_z_mm = 354;
tilt_axis_z_mm = 385;
yoke_x_mm = 132;
sample_pan_deg = 20;
sample_tilt_deg = 15;

assert(head_w_mm > 0 && head_d_mm > 0 && head_h_mm > 0);
assert(tilt_axis_z_mm > pan_stage_z_mm);
assert(yoke_x_mm > head_w_mm/2);

module stationary_reference() {
  if(show_torso_envelope)
    color([0.37, 0.42, 0.5, 0.16])
      translate([-torso_w_mm/2, -torso_d_mm/2, 115])
        cube([torso_w_mm, torso_d_mm, torso_top_z_mm-115]);
  // Fixed-neck proxy is intentionally stationary and cannot drive a pan/tilt joint.
  if(show_fixed_neck_reference)
    color([0.70, 0.31, 0.16, 0.22])
      translate([0, 0, torso_top_z_mm])
        cylinder(d=75, h=fixed_neck_h_mm);
}

module head_proxy(alpha=0.36) {
  color([0.15, 0.53, 0.82, alpha])
    scale([head_w_mm/2, head_d_mm/2, head_h_mm/2])
      sphere(r=1);
}

// A **diagrammatic** rotating pan carrier + tilt-axis bearings/guide geometry.
// Rectangles/rods are indicators only; not designed parts or structural mounts.
module preview_pan_tilt(pan_angle, tilt_angle, opacity=1) {
  rotate([0, 0, pan_angle]) {
    color([1, 0.62, 0.12, 0.22*opacity])
      translate([-85, -40, pan_stage_z_mm])
        cube([170, 80, 6]);
    color([1, 0.62, 0.12, 0.46*opacity])
      for (x=[-yoke_x_mm, yoke_x_mm])
        translate([x-4, -4, pan_stage_z_mm])
          cube([8, 8, tilt_axis_z_mm-pan_stage_z_mm+4]);

    // Horizontal X tilt axis marker — **not a real axle specification**.
    color([0.82, 0.27, 0.11, 0.48*opacity])
      translate([-yoke_x_mm-7, 0, tilt_axis_z_mm])
        rotate([0, 90, 0]) cylinder(d=5, h=2*yoke_x_mm+14);

    // Rotating head proxy, translated so the tilt pivot remains stationary.
    translate([0, 0, tilt_axis_z_mm])
      rotate([tilt_angle, 0, 0])
        translate([0, 0, head_center_z_mm-tilt_axis_z_mm])
          head_proxy(0.36*opacity);
  }
}

// The ghost poses are visualization examples, not permitted motion bounds.
// A collision-free visual doesn't mean physically safe: actual shell interiors,
// servo mounts, wiring, connector strain, torque and mass remain unknown.
if(show_sample_ghosts) {
  preview_pan_tilt(-sample_pan_deg, 0, 0.24);
  preview_pan_tilt( sample_pan_deg, 0, 0.24);
  preview_pan_tilt(0, -sample_tilt_deg, 0.24);
  preview_pan_tilt(0,  sample_tilt_deg, 0.24);
}

stationary_reference();
preview_pan_tilt(pan_preview_deg, tilt_preview_deg);

echo("EXPERIMENT 002: VISUAL KINEMATICS ONLY; NOT VERIFIED PHYSICAL FIT.");
echo("Moving joint preview angles are not approved mechanical or software limits.");
