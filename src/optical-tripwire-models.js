// McGruber B/C: genuinely editable, procedural THREE.js 3D teaching assemblies.
// All coordinates are illustrative millimeters, Z up. This is NOT fitted CAD,
// a proven electrical schematic, a simulation of detector sensitivity, or hardware.
import * as THREE from 'three';
import {mark, components, meshes} from './core.js';

const PALETTE=Object.freeze({
  base:'#19283d',board:'#21506a',frame:'#4a627a',dark:'#172333',
  plastic:'#363a47',pin:'#becbd3',copper:'#e6a964',red:'#f04c60',
  blue:'#479cf7',blueWire:'#299af0',yellow:'#ffd078',orange:'#f2a449',
  green:'#56d8a1',ground:'#36465b',white:'#e5eaf0',gold:'#d9bc68',
  cyan:'#49d1df',purple:'#806fd4',
});

export const OPTICAL_EXAMPLES=Object.freeze({
  'mcgruber-visible-b-assembled':Object.freeze({experiment:'B',exploded:false,expectedParts:16,
    title:'B · Blue LED → red sensor · assembly concept'}),
  'mcgruber-visible-b-exploded':Object.freeze({experiment:'B',exploded:true,expectedParts:16,
    title:'B · Blue LED → red sensor · exploded concept'}),
  'mcgruber-infrared-c-assembled':Object.freeze({experiment:'C',exploded:false,expectedParts:15,
    title:'C · Infrared beam → silent LED · assembly concept'}),
  'mcgruber-infrared-c-exploded':Object.freeze({experiment:'C',exploded:true,expectedParts:15,
    title:'C · Infrared beam → silent LED · exploded concept'}),
});

const mat=(color,{opacity=1,emissive=null,emissiveIntensity=0,metalness=.12}={})=>
 new THREE.MeshStandardMaterial({color:PALETTE[color]||color,roughness:.48,metalness,transparent:opacity<1,
  opacity,depthWrite:opacity===1,side:THREE.DoubleSide,
  emissive:emissive||'#000000',emissiveIntensity});
const matte=Object.fromEntries(Object.entries(PALETTE).map(([k,v])=>[k,mat(v)]));
function mesh(group,geo,color,position=[0,0,0],angles=null,options=null){
 const m=new THREE.Mesh(geo,options?mat(color,options):matte[color]||mat(color));
 m.position.set(...position);if(angles)m.rotation.set(...angles);
 group.add(m);return m;
}
function block(group,x,y,z,w,d,h,color){return mesh(group,new THREE.BoxGeometry(w,d,h),color,[x,y,z]);}
function sphere(group,x,y,z,r,color,opts=null){return mesh(group,new THREE.SphereGeometry(r,14,9),color,[x,y,z],null,opts);}
function cyl(group,x,y,z,r,h,color,axis='z',options=null){
 const rot=axis==='x'?[0,0,Math.PI/2]:axis==='y'?[0,0,0]:[Math.PI/2,0,0];
 // CylinderGeometry is Y-up. Rotate around X for Z-up.
 return mesh(group,new THREE.CylinderGeometry(r,r,h,12),color,[x,y,z],rot,options);
}
function tube(group,pts,color,r=.8){
 const points=pts.map(p=>new THREE.Vector3(...p));
 if(points.length<2)throw Error('Wire path needs at least two endpoints');
 // Three.js CatmullRomCurve3 is undefined for a two-point lead; use a true
 // straight 3D segment for LEDs/resistors and smooth curves for routed wires.
 const curve=points.length===2?new THREE.LineCurve3(points[0],points[1]):
  new THREE.CatmullRomCurve3(points,false,'centripetal');
 return mesh(group,new THREE.TubeGeometry(curve,Math.max(12,pts.length*6),r,5,false),color);
}
function lead(group,from,to,color='pin',r=.85){
 // Real straight lead: stable two-point cylinder in the Y-up THREE primitive
 // coordinate system, avoiding degenerate Frenet frames and NaN vertices.
 const a=new THREE.Vector3(...from),b=new THREE.Vector3(...to);
 const axis=new THREE.Vector3().subVectors(b,a);
 const length=axis.length();
 if(!(length>1e-6))throw Error('Zero-length electrical lead');
 const m=mesh(group,new THREE.CylinderGeometry(r,r,length,8),color);
 m.position.copy(a).add(b).multiplyScalar(.5);
 m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),axis.normalize());
 return m;
}
function part(id,label,side,stage){
 const group=mark(new THREE.Group(),id+' · '+label);
 group.userData={...group.userData,experiment:stage,side,
  verifiedFit:false,physicalMeasurements:false,hardwareTested:false,
  presentationOnly:true};return group;
}
function add(scene,p,x,y,z,{exploded=false,shift=0}={}){
 const explosion=exploded?(p.userData.side==='emitter'?-21:p.userData.side==='receiver'?21:p.userData.side==='output'?40:0):0;
 // offsets move full recognizable subassemblies; wiring is schematic only.
 p.position.set(x+explosion,y+(exploded?shift:0),z+(exploded&&p.userData.side!=='guide'?9:0));
 scene.push(p);return p;
}
function base(scene,id,label,x,side,stage,exploded){
 const p=part(id,label,side,stage);
 block(p,0,0,1.2,143,106,2.4,'base');
 for(const dx of [-63,63])for(const dy of [-44,44])cyl(p,dx,dy,3.4,2.2,3.2,'pin');
 add(scene,p,x,0,0,{exploded,shift:side==='emitter'?-8:8});return p;
}
function resistor(p,{x=0,y=0,z=0,axis='x',bands=true}={}){
 cyl(p,x,y,z,3.3,18,'yellow',axis);
 const coords=[-5,-2,2,5];
 for(let i=0;i<coords.length&&bands;i++){
  const d=coords[i],palette=['red','dark','orange','gold'];
  // Rings extend very slightly beyond the ceramic body.
  if(axis==='x')cyl(p,x+d,y,z,3.65,.7,palette[i],'x');
  else cyl(p,x,y+d,z,3.65,.7,palette[i],'y');
 }
 const a=axis==='x'?[x-19,y,z]:[x,y-19,z],b=axis==='x'?[x+19,y,z]:[x,y+19,z];
 lead(p,a,axis==='x'?[x-9,y,z]:[x,y-9,z]);
 lead(p,axis==='x'?[x+9,y,z]:[x,y+9,z],b,'pin');
 // Second endpoints are represented by the adjacent circuit wires.
 return [a,b];
}
function indicator(p,color='red',direction='x',on=false){
 // 5 mm indicator approximation: cylindrical body, lens dome, two isolated legs.
 cyl(p,0,0,1,5,13,color,direction);
 if(direction==='x')sphere(p,8,0,1,5,color,on?{emissive:PALETTE[color],emissiveIntensity:2.6}:null);
 else sphere(p,0,0,9,5,color,on?{emissive:PALETTE[color],emissiveIntensity:2.6}:null);
 if(direction==='x'){lead(p,[-13,-2,0],[-7,-2,0]);lead(p,[-13,2,0],[-7,2,0]);}
 else{lead(p,[-2,0,-14],[-2,0,-6]);lead(p,[2,0,-14],[2,0,-6]);}
}
function transistor(p){
 // TO-92 silhouette. NO fabricated E/B/C lead order; source manufacturer unknown.
 cyl(p,0,0,7,8,15,'plastic','z');
 block(p,0,-5,7,14,6,15,'dark');
 for(const x of [-4,0,4])lead(p,[x,0,-12],[x,0,-2],'pin',.8);
}
function electricalWireBundle(p,sections){
 for(const {pts,color} of sections)tube(p,pts,color,1.05);
}
function beamGuide(p,clear=true,blue=false){
 const beamColor=blue?'blue':'cyan';
 if(clear){
  cyl(p,0,0,0,1.9,195,beamColor,'x',{opacity:.29,emissive:PALETTE[beamColor],emissiveIntensity:.6});
  for(const x of [-84,-46,-8,30,68])cyl(p,x,0,0,2.8,9,beamColor,'x',{opacity:.55,emissive:PALETTE[beamColor],emissiveIntensity:.55});
 }else{
  cyl(p,-55,0,0,1.8,67,beamColor,'x',{opacity:.3});
  cyl(p,55,0,0,1.8,67,beamColor,'x',{opacity:.3});
  block(p,0,0,0,8,31,43,'dark'); // symbolic opaque interruption card
 }
 p.userData.opticalGuideOnly=true;
 p.userData.noVisibleRayInAir=true;
}
function visibleB({exploded=false,blocked=false}={}){
 const stage='B', s=[];
 base(s,'TW-B-01','Emitter mounting board (concept)',-158,'emitter',stage,exploded);
 base(s,'TW-B-02','Receiver mounting board (concept)',158,'receiver',stage,exploded);
 const battery=part('TW-B-03','9 V battery + snap (verify voltage)', 'emitter',stage);
 block(battery,0,0,13,37,20,25,'plastic');block(battery,-10,0,26,8,9,4,'pin');block(battery,10,0,26,7,7,4,'gold');
 block(battery,0,0,13.4,34,20,13,'frame');
 add(s,battery,-196,23,0,{exploded,shift:-23});
 const limiter=part('TW-B-04','Measured 1 kΩ emitter limiter (candidate)', 'emitter',stage);
 resistor(limiter,{x:0,y:0,z:0});
 add(s,limiter,-161,-26,23,{exploded,shift:-34});
 const blue=part('TW-B-05','Blue emitter LED · current-limited', 'emitter',stage);
 indicator(blue,'blue','x',true);add(s,blue,-105,0,36,{exploded,shift:-7});
 const transmitterWires=part('TW-B-06','Emitter power wires · illustrative route','emitter',stage);
 electricalWireBundle(transmitterWires,[
  {color:'red',pts:[[-36,20,24],[-22,20,24],[-18,-26,23],[-8,-26,23]]},
  {color:'red',pts:[[9,-26,23],[23,-26,23],[23,0,36],[42,0,36]]},
  {color:'ground',pts:[[42,-4,36],[42,-41,20],[-29,-41,20],[-36,14,24]]}
 ]);
 add(s,transmitterWires,-158,0,0,{exploded,shift:-17});
 const sensor=part('TW-B-07','RED LED SENSOR · intentionally UNPOWERED','receiver',stage);
 indicator(sensor,'red','x',false); // red lens points toward blue LED (concept)
 add(s,sensor,108,0,36,{exploded,shift:-7});
 const shield=part('TW-B-08','Optional light shield tube · size unknown','receiver',stage);
 const geo=new THREE.CylinderGeometry(10.5,10.5,24,18,1,true);
 mesh(shield,geo,'dark',[-7,0,0],[0,0,Math.PI/2],{opacity:.57});
 add(s,shield,108,0,36,{exploded,shift:22});
 const circuit=part('TW-B-09','UNKNOWN amplifier + threshold · NOT BUILT','receiver',stage);
 block(circuit,0,0,3,39,30,6,'orange');
 block(circuit,0,0,7,31,23,2,'dark');
 for(const x of [-12,0,12]){block(circuit,x,-17,4,2,4,5,'pin');block(circuit,x,17,4,2,4,5,'pin');}
 circuit.userData.verifiedCircuit=false;
 circuit.userData.missingParts=true;
 add(s,circuit,156,25,9,{exploded,shift:31});
 const transistorStage=part('TW-B-10','2N4401 switch · PINOUT NOT VERIFIED','output',stage);
 transistor(transistorStage);
 transistorStage.userData.pinoutUnverified=true;
 add(s,transistorStage,186,-26,14,{exploded,shift:-29});
 const warn=part('TW-B-11','Silent red warning LED · output UNTESTED','output',stage);
 indicator(warn,'red','z',false);
 add(s,warn,222,-29,24,{exploded,shift:-17});
 const outputLimiter=part('TW-B-12','Warning LED resistor · independently required','output',stage);
 resistor(outputLimiter,{});
 add(s,outputLimiter,210,13,23,{exploded,shift:12});
 const receiveWires=part('TW-B-13','Detector leads · NO verified amplifier connection','receiver',stage);
 lead(receiveWires,[-8,-4,30],[1,18,17],'pin');
 lead(receiveWires,[-8,4,30],[5,18,17],'ground');
 receiveWires.userData.openCircuit=true;
 add(s,receiveWires,108,0,0,{exploded,shift:0});
 const beam=part('TW-B-14',blocked?'Light path BLOCKED (symbolic)':'Blue optical path · NOT visible in air','guide',stage);
 beamGuide(beam,!blocked,true);
 add(s,beam,0,0,36,{exploded:false});
 const unlinked=part('TW-B-15','Amplifier-to-switch LINK MISSING · diagram only','guide',stage);
 for(let i=0;i<5;i++)block(unlinked,i*7-16,0,0,3,1.5,1.5,'orange');
 unlinked.userData.missingInterface=true;
 add(s,unlinked,172,-3,26,{exploded,shift:0});
 const indicatorBase=part('TW-B-16','Warning LED holder / indicator panel','output',stage);
 block(indicatorBase,0,0,0,35,31,4,'frame');
 add(s,indicatorBase,222,-29,13,{exploded,shift:-6});
 return s;
}
function infraredC({exploded=false,blocked=false}={}){
 const stage='C', s=[];
 base(s,'TW-C-01','Emitter demonstration mount',-158,'emitter',stage,exploded);
 base(s,'TW-C-02','Receiver demonstration mount',158,'receiver',stage,exploded);
 const powerTx=part('TW-C-03','Regulated 5 V emitter supply · REQUIRED','emitter',stage);
 block(powerTx,0,0,11,43,27,22,'frame');block(powerTx,0,-14,16,19,3,6,'dark');
 add(s,powerTx,-200,29,0,{exploded,shift:-23});
 const tx=part('TW-C-04','Adafruit 2167/2168 IR emitter (matched only)','emitter',stage);
 cyl(tx,0,0,0,6,24,'dark','x');sphere(tx,13,0,0,5,'plastic');cyl(tx,-13,0,0,6.3,4,'frame','x');
 add(s,tx,-104,0,37,{exploded,shift:-8});
 const txWires=part('TW-C-05','Emitter RED +5 V / BLACK ground leads','emitter',stage);
 electricalWireBundle(txWires,[
  {color:'red',pts:[[-35,35,14],[-21,35,14],[22,14,34],[42,3,37]]},
  {color:'ground',pts:[[-35,27,12],[-18,27,9],[25,-15,17],[42,-3,37]]},
 ]);
 add(s,txWires,-158,0,0,{exploded,shift:-24});
 const rx=part('TW-C-06','Matched IR receiver · 3 leads with OUT','receiver',stage);
 cyl(rx,0,0,0,6.5,22,'dark','x');sphere(rx,-10,0,0,5,'plastic');cyl(rx,13,0,0,7,6,'frame','x');
 add(s,rx,104,0,37,{exploded,shift:-8});
 const powerRx=part('TW-C-07','Regulated 5 V receiver supply','receiver',stage);
 block(powerRx,0,0,11,43,27,22,'frame');block(powerRx,0,-14,16,19,3,6,'dark');
 add(s,powerRx,200,31,0,{exploded,shift:20});
 const pullup=part('TW-C-08','10 kΩ resistor · output pull-up','receiver',stage);
 resistor(pullup,{axis:'y'});add(s,pullup,145,24,22,{exploded,shift:29});
 const warningLimiter=part('TW-C-09','1 kΩ resistor · warning LED current limit','output',stage);
 resistor(warningLimiter,{axis:'y'});add(s,warningLimiter,184,-15,21,{exploded,shift:-24});
 const led=part('TW-C-10',blocked?'Silent warning LED ON · symbolic':'Silent warning LED OFF · symbolic','output',stage);
 indicator(led,'red','z',blocked);
 add(s,led,211,-14,31,{exploded,shift:-11});
 const holder=part('TW-C-11','Indicator panel / low-voltage mounting plate','output',stage);
 block(holder,0,0,0,40,28,4,'board');
 add(s,holder,211,-14,16,{exploded,shift:-12});
 const inOut=part('TW-C-12','Receiver output wire · active-LOW on beam break','receiver',stage);
 electricalWireBundle(inOut,[
  {color:'green',pts:[[0,-2,37],[18,-2,37],[21,-25,22],[76,-25,22],[76,-13,22]]}
 ]);
 add(s,inOut,104,0,0,{exploded,shift:4});
 const supplyBundle=part('TW-C-13','Receiver 5 V / GND / output routing (illustrative)','receiver',stage);
 electricalWireBundle(supplyBundle,[
  {color:'red',pts:[[0,30,17],[-29,39,17],[-31,4,36],[-42,4,36]]},
  {color:'ground',pts:[[0,28,13],[-25,29,12],[-30,-4,36],[-42,-4,36]]},
  {color:'red',pts:[[-32,38,18],[-51,38,18],[-51,24,22],[-45,24,22]]},
  {color:'red',pts:[[-28,38,20],[-3,-39,21],[14,-39,21],[14,-33,21]]},
 ]);
 add(s,supplyBundle,200,0,0,{exploded,shift:5});
 const outputBundle=part('TW-C-14','LED anode +5 V → resistor → LED cathode OUT','output',stage);
 electricalWireBundle(outputBundle,[
  {color:'red',pts:[[-11,39,17],[-25,-15,21],[-12,-15,21]]},
  {color:'red',pts:[[12,-15,21],[20,-15,31],[28,-15,31]]},
  {color:'green',pts:[[28,-15,16],[32,-35,19],[-26,-35,19]]},
 ]);
 add(s,outputBundle,184,0,0,{exploded,shift:-5});
 const guide=part('TW-C-15',blocked?'Invisible IR beam BLOCKED (symbolic)':'INVISIBLE IR ray · schematic guide only','guide',stage);
 beamGuide(guide,!blocked,false);
 add(s,guide,0,0,37,{exploded:false});
 return s;
}
export function opticalExample(id,{blocked=false}={}){
 const spec=OPTICAL_EXAMPLES[id];
 if(!spec)throw Error('Unknown optical example');
 const objects=(spec.experiment==='B'?visibleB:infraredC)({exploded:spec.exploded,blocked});
 if(objects.length!==spec.expectedParts)throw Error('3D concept component identity count changed');
 if(components({traverse(cb){objects.forEach(o=>o.traverse(cb));}}).length!==objects.length)
  throw Error('Each modeled part must be an independently inspectable component');
 const triangles=objects.flatMap(meshes).reduce((s,m)=>s+(m.geometry.index?.count??m.geometry.attributes.position.count)/3,0);
 if(triangles>28000||!triangles)throw Error('3D example triangle budget exceeded');
 return {spec,objects,triangles,blocked:!!blocked};
}
