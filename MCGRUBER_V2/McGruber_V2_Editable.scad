// McGruber V2. Units: mm. Physical fit and load capacity unverified.
// Choose "base", "test", or "foot"; F6 then export STL.
part = "base";
diameters = [3.0,3.2,3.4,3.6,3.8,4.0];
slots = [[1,1],[13,1],[1,8],[13,8],[7,0],[7,9],[0,4],[14,4]];
function is_slot(i,j) = len([for(p=slots) if(p==[i,j]) 1])>0;
corners=[[-5,-5],[5,-5],[5,5],[-5,5]];
function opening(d=3.6,slot=false) = [for(k=[0:3],t=[0:7])
 let(q=corners[k]+(corners[(k+1)%4]-corners[k])*t/8,
 scale=slot ? max(abs(q[0])/3,abs(q[1])/1.75) : norm(q)/(d/2)) q/scale];
module plate(nx,ny,h,test=false) {
 linear_extrude(height=h) difference() {
  square([nx*10,ny*10]);
  for(i=[0:nx-1],j=[0:ny-1]) translate([(i+.5)*10,(j+.5)*10])
   polygon(opening(test?diameters[i]:3.6,!test && nx==15 && is_slot(i,j)));
 }
}
if(part=="base") plate(15,10,4);
if(part=="test") plate(6,1,4,true);
if(part=="foot") plate(1,1,8);
