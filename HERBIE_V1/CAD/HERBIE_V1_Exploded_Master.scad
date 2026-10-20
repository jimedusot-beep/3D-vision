/*
 H.E.R.B.I.E. / CONCEPT ASSEMBLY V0.1 - 2026-10-20
 --------------------------------------------------------------------------
 PURPOSE: proportion study and exploded-assembly reference ONLY.
 NOT print-ready, structural analysis, certified fit, manufacturability,
 or confirmation of compatibility with third-party CAD/STL parts.
 All dimensions in mm. Geometry is independently drafted from a provisional
 H.E.R.B.I.E.-inspired design specification (not copied from repositories).

 Inspired by technical ORGANIZATION and PARAMETRIC METHODS (not part imports):
 R01 https://github.com/ranboy12/robot_prototype_3D_sourcecode
 R02 https://github.com/liphistius/MaFaRo
 R03 https://github.com/Hyperspawn/dropbear_hardware
 R04 https://github.com/vector76/gridfinity_openscad
 Future mechanisms: https://github.com/cartheur/inmoov-stls
 Future eyes (UNBUILT): https://github.com/HeyPCB/iris
 Appearance reference (separate licensing):
 https://cults3d.com/en/3d-model/gadget/h-e-r-b-i-e-fantastic-four-first-steps-action-figure

 View assembled: assembled = true; View exploded: assembled = false;
 Change dimensions only with downstream clearances and mounting review.
*/
$fn=40;
assembled=false;   // change to true to see assembled reference
show_shells=true;  // false exposes the full internal frame
show_arms=true;
show_modules=true;
head_w=240; head_d=170; head_h=145;
neck_w=75; neck_d=75; neck_h=35;
torso_w=220; torso_d=190; torso_h=205;
base_w=280; base_d=240; base_h=115;
frame_x=90; frame_y=80; frame_bar=10;
computer_bay_w=150; computer_bay_d=140; computer_bay_h=65;
// Engineering datum: floor z=0; front direction -Y; right +X
// envelope z: base [0,115], torso [115,320], neck [320,355], head [355,500]

white=[.80,.85,.89]; whiteB=[.92,.95,.97]; blue=[.10,.42,.75];
gray=[.43,.49,.55]; dark=[.09,.13,.18]; orange=[.94,.63,.24];
metal=[.32,.38,.44]; ghost=[.82,.9,.95,.64];
function ex(v)=assembled?0:v;

module rounded_xy(w,d,h,r) {
  linear_extrude(height=h) offset(r=r) square([w-2*r,d-2*r],center=true);
}
module plate(w,d,h,r=6) { rounded_xy(w,d,h,r); }
module frame_box(w,d,h,t=3,r=18) {
  difference(){rounded_xy(w,d,h,r);
    translate([0,0,-1]) rounded_xy(w-2*t,d-2*t,h+2,max(2,r-t));}
}
module base_bottom(){
  color(whiteB) translate([0,0,0]) rounded_xy(base_w,base_d,12,27);
}
module base_riser(){
 color(gray) for(x=[-108,108],y=[-87,87])
   translate([x,y,56.5]) cube([12,12,89],center=true);
 color(blue) translate([0,0,60]) plate(208,170,5,12);
}
module base_top(){
 color(white) translate([0,0,101]) plate(base_w,base_d,14,27);
 color(dark) translate([0,0,114.7]) plate(200,147,1.2,19);
}
module frame_rails(){
 color(metal) for(x=[-frame_x,frame_x],y=[-frame_y,frame_y])
   translate([x,y,120]) cube([frame_bar,frame_bar,196]);
 color(metal) for(z=[125,304]) {
   for(y=[-frame_y,frame_y]) translate([-frame_x,y-5,z]) cube([2*frame_x,10,10]);
   for(x=[-frame_x,frame_x]) translate([x-5,-frame_y,z]) cube([10,2*frame_y,10]);
 }
}
module shoulder_plate(sign=1){
 color(blue) translate([sign*109,-2,262]) rotate([0,90,0]) plate(47,47,8,8);
}
module neck_parts(){
 color(metal) translate([0,0,319]) plate(neck_w,neck_d,6,8);
 color(gray) translate([0,0,325]) plate(52,52,23,6);
 color(metal) translate([0,0,348]) plate(neck_w,neck_d,7,8);
}
module head_core(){
 color(gray) translate([0,0,383]) plate(185,119,7,12);
 color(gray) translate([0,0,452]) plate(185,119,7,12);
 color(gray) for(x=[-75,75],y=[-43,43]) translate([x,y,389]) cube([7,7,62]);
}
module head_shell_front(){
 color(whiteB) intersection() {
   difference(){translate([0,0,355]) rounded_xy(head_w,head_d,head_h,33);
     translate([0,0,358]) rounded_xy(head_w-7,head_d-7,head_h-6,30);}
   translate([-200,-200,345]) cube([400,200,170]);
 }
}
module head_shell_rear(){
 color(white) intersection() {
   difference(){translate([0,0,355]) rounded_xy(head_w,head_d,head_h,33);
     translate([0,0,358]) rounded_xy(head_w-7,head_d-7,head_h-6,30);}
   translate([-200,0,345]) cube([400,200,170]);
 }
}
module faceplate(){
 color(dark) translate([0,-86,386]) rotate([90,0,0]) rounded_xy(182,79,6,21);
 color(blue) for(x=[-54,54])
   translate([x,-93,426]) rotate([90,0,0]) difference(){
     cylinder(h=2,r=21,center=true);
     cylinder(h=3,r=15,center=true);}
}
module torso_front(){
 color(white) intersection(){
   difference(){translate([0,0,115]) rounded_xy(torso_w,torso_d,torso_h,23);
     translate([0,0,112]) rounded_xy(torso_w-7,torso_d-7,torso_h+6,20);}
   translate([-150,-145,110]) cube([300,103,220]);
 }
}
module torso_rear(){
 color(white) intersection(){
   difference(){translate([0,0,115]) rounded_xy(torso_w,torso_d,torso_h,23);
     translate([0,0,112]) rounded_xy(torso_w-7,torso_d-7,torso_h+6,20);}
   translate([-150,41,110]) cube([300,104,220]);
 }
}
module computer_tray(){
 color(blue) translate([0,0,201]) plate(156,146,4,8);
 color(gray) for(x=[-58,58],y=[-51,51])
  translate([x,y,205]) cylinder(r=5,h=7);
}
module power_tray(){
 color(orange) translate([0,0,141]) plate(108,79,5,7);
 color(orange) for(x=[-52,52]) translate([x,0,145]) cube([4,74,28],center=true);
}
module arm(sign=1){
 // static display shapes; no load-bearing joint geometries in concept
 color(blue) translate([sign*116,0,262]) rotate([0,90,0]) cylinder(h=15,r=22,center=true);
 color(whiteB) translate([sign*151,0,207]) rounded_xy(49,45,70,13);
 color(gray) translate([sign*151,0,193]) cylinder(h=7,r=16,center=true);
 color(white) translate([sign*151,0,134]) rounded_xy(41,42,57,12);
 color(dark) translate([sign*151,0,112]) rounded_xy(37,38,13,11);
}
// Assemble from physical z reference positions. Exploded offsets used only
// for inspection; distances are diagrammatic and must not be manufactured.
translate([0,0,ex(-85)]) base_bottom();
translate([0,0,ex(-35)]) base_riser();
translate([0,0,ex(0)]) base_top();
translate([0,0,ex(42)]) frame_rails();
if(show_modules) {
  translate([-ex(31),-ex(37),ex(65)]) computer_tray();
  translate([ex(32),-ex(55),ex(83)]) power_tray();
}
if(show_shells){
  translate([0,-ex(116),ex(16)]) torso_front();
  translate([0, ex(113),ex(16)]) torso_rear();
}
if(show_arms) for(s=[-1,1]) translate([s*ex(81),0,ex(28)]) arm(s);
translate([0,0,ex(100)]) neck_parts();
translate([0,0,ex(158)]) head_core();
if(show_shells){
  translate([0,-ex(70),ex(186)]) head_shell_front();
  translate([0, ex(83),ex(186)]) head_shell_rear();
}
translate([0,-ex(119),ex(199)]) faceplate();