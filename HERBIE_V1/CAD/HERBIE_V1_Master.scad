// H.E.R.B.I.E. V1 skeleton-first concept CAD. Units: mm.
// ORIGINAL PROVISIONAL GEOMETRY. NOT STRUCTURALLY QUALIFIED.
// Individual STL: openscad -o HBR-001.stl -D 'part=1' HERBIE_V1_Master.scad
// Preview all: set part=0; exploded=true optional.
$fn=36;
part=0; exploded=false;
head_w=240; head_d=170; head_h=145;
torso_w=220; torso_d=190; torso_h=205;
base_w=280; base_d=240; base_h=115;
neck_h=35; wall=3; mounting_hole=3.4;
// Z bounds: base 0-115; torso 115-320; neck 320-355; head 355-500.
module rounded_box(size=[40,40,10],r=5){
    rr=min(r,size[0]/2-0.05,size[1]/2-0.05);
    hull() for(x=[-1,1],y=[-1,1]) translate([x*(size[0]/2-rr),y*(size[1]/2-rr),0]) cylinder(h=size[2],r=rr);
}
module mount_grid(w=80,d=60){ for(x=[-30,-20,-10,0,10,20,30],y=[-15,-5,5,15]) if(abs(x)<w/2-5 && abs(y)<d/2-5) translate([x,y,-1]) cylinder(h=8,d=mounting_hole); }
// Ellipsoid head divided along Y; each half is hollowed with open mating face.
module head_half(front=true){
  // Shell is closed around the cut plane by outer and inner surfaces meeting at a rim.
  difference(){
    intersection(){scale([head_w/2,head_d/2,head_h/2]) sphere(r=1);
      translate([-130,front?-90:0,-75]) cube([260,90,150]);}
    intersection(){scale([(head_w-2*wall)/2,(head_d-2*wall)/2,(head_h-2*wall)/2]) sphere(r=1);
      translate([-130,front?-93:3,-75]) cube([260,front?90:90,150]);}
  }
}
module faceplate(){ difference(){rounded_box([155,9,77],15); translate([0,0,-1]){} } }
module headframe(){
  difference(){
    union(){rounded_box([160,100,6],12); for(x=[-70,70])translate([x,0,4])cube([8,80,28],center=true);}
    for(x=[-60,60],y=[-35,35])translate([x,y,-1])cylinder(d=mounting_hole,h=9);
    translate([0,0,-1])rounded_box([95,60,9],8);
  }
}
module neck(){difference(){union(){rounded_box([75,75,7],7);translate([0,0,7])cylinder(d=38,h=21);translate([0,0,28])rounded_box([75,75,7],7);}
for(x=[-20,20],y=[-20,20]){translate([x,y,-1])cylinder(d=mounting_hole,h=10);translate([x,y,27])cylinder(d=mounting_hole,h=10);}translate([0,0,-1])cylinder(d=16,h=38);}}
module frameplate(upper=true){difference(){rounded_box([174,132,8],9);for(x=[-70,70],y=[-50,50])translate([x,y,-1])cylinder(d=mounting_hole,h=11);translate([0,0,-1])rounded_box([95,65,11],7);}}
module upright(){difference(){rounded_box([19,23,189],4);for(z=[14,94,175])translate([0,0,z])rotate([90,0,0])cylinder(d=mounting_hole,h=28,center=true);}}
module torso_panel(front=true){difference(){rounded_box([205,7,169],9);for(x=[-88,88],z=[16,153])translate([x,-1,z])rotate([-90,0,0])cylinder(d=mounting_hole,h=10); if(!front) for(x=[-55,-33,-11,11,33,55])translate([x,-1,105])cube([8,12,35]);}}
module shoulder(){difference(){rounded_box([55,42,13],7);for(x=[-15,15],y=[-15,15])translate([x,y,-1])cylinder(d=mounting_hole,h=16);translate([0,0,-1])cylinder(d=16,h=16);}}
module staticarm(){ // single neutral low-load cosmetic block, removable, no moving joints
union(){rounded_box([38,42,95],14);translate([0,0,95])rounded_box([50,45,14],9);}}
module tray(w=125,d=100,h=20){difference(){union(){rounded_box([w,d,4],7);translate([-w/2+3,-d/2+3,4])cube([w-6,4,h-4]);translate([-w/2+3,d/2-7,4])cube([w-6,4,h-4]);}for(x=[-30,-20,-10,0,10,20,30],y=[-15,-5,5,15])translate([x,y,-1])cylinder(d=mounting_hole,h=7);}}
module base(){difference(){rounded_box([base_w,base_d,base_h],30); translate([0,0,6])rounded_box([base_w-12,base_d-12,base_h+2],26); for(x=[-68,68],y=[-48,48])translate([x,y,-1])cylinder(d=mounting_hole,h=12);}}
// Local print-coordinate part geometry; assemblies use preview transforms only.
module model(n){
if(n==1)head_half(true);
if(n==2)head_half(false);
if(n==3)faceplate();
if(n==4)headframe();
if(n==5)neck();
if(n==6)frameplate(true);
if(n==7)frameplate(false);
if(n==8||n==9)upright();
if(n==10)torso_panel(true);
if(n==11)torso_panel(false);
if(n==12||n==13)shoulder();
if(n==14||n==15)staticarm();
if(n==16)tray(125,100,20);
if(n==17)tray(100,65,27);
if(n==18)base();
}
module assembly(){
translate([0,0,355+head_h/2+(exploded?55:0)])color("white")model(1);
translate([0,0,355+head_h/2+(exploded?85:0)])color("silver")model(2);
translate([0,-89,397+(exploded?85:0)])rotate([90,0,0])color("midnightblue")model(3);
translate([0,0,412+(exploded?45:0)])color("gray")model(4);
translate([0,0,320+(exploded?25:0)])color("lightgray")model(5);
translate([0,0,307+(exploded?12:0)])color("gray")model(6);
translate([0,0,121-(exploded?15:0)])color("gray")model(7);
for(x=[-70,70])translate([x,0,126])color("silver")model(x<0?8:9);
translate([0,-97-(exploded?35:0),132])rotate([90,0,0])color("white")model(10);
translate([0,97+(exploded?35:0),132])rotate([90,0,0])color("white")model(11);
for(x=[-117,117])translate([x,0,270])rotate([0,90,0])color("silver")model(x<0?12:13);
for(x=[-136,136])translate([x,0,160])color("white")model(x<0?14:15);
translate([0,0,210])color("skyblue")model(16);
translate([0,0,149])color("cornflowerblue")model(17);
translate([0,0,0])color("silver")model(18);
}
if(part==0)assembly(); else model(part);