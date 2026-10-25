import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from 'three';
import {opticalExample, OPTICAL_EXAMPLES} from '../src/optical-tripwire-models.js';
import {exampleModel} from '../src/example-models.js';

const countFaces=part=>{let n=0;part.traverse(o=>{if(o.isMesh)n+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;});return n;};
const matchPart=(model,prefix)=>model.objects.find(o=>o.name.startsWith(prefix));
const objectsById=model=>model.objects.map(o=>o.name.split(' · ')[0]);
const validVertexRanges=model=>{
 const bb=new THREE.Box3();
 for(const component of model.objects) {
  const box=new THREE.Box3().setFromObject(component);
  assert.ok(!box.isEmpty(),'Geometry is empty: '+component.name);
  bb.union(box);
  component.traverse(node=>{
   if(!node.isMesh)return;
   const a=node.geometry.attributes.position;
   assert.ok(a?.count>=3,'Invalid mesh '+component.name);
   for(const v of a.array)assert.ok(Number.isFinite(v),component.name);
   assert.ok(node.material?.isMaterial,'No material on '+component.name);
  });
 }
 assert.ok(bb.max.x-bb.min.x>250,'Emitter and receiver should be separated in layout');
 assert.ok(bb.max.x-bb.min.x<1000,'Illustrative scene may not claim life-size doorway');
};
for(const experiment of ['B','C']){
 for(const view of ['assembled','exploded']){
  test(`Experiment ${experiment} ${view}: genuinely selectable 3D part groups and no hardware claims`,()=>{
   const id=experiment==='B'?'mcgruber-visible-b-'+view:'mcgruber-infrared-c-'+view;
   const result=opticalExample(id);
   const spec=OPTICAL_EXAMPLES[id],router=exampleModel(id);
   assert.equal(result.spec,spec);
   assert.equal(result.objects.length,experiment==='B'?16:15);
   assert.equal(result.objects.length,new Set(objectsById(result)).size);
   assert.deepEqual(router,{...router,kind:'procedural',experiment,exploded:view==='exploded',
     expectedParts:result.objects.length,verifiedFit:false});
   assert.ok(result.triangles>100&&result.triangles<28000);
   assert.equal(result.triangles,result.objects.reduce((s,o)=>s+countFaces(o),0));
   assert.ok(result.objects.every(o=>o.userData.component&&o.userData.presentationOnly&&
     o.userData.hardwareTested===false&&o.userData.verifiedFit===false));
   validVertexRanges(result);
   assert.ok(matchPart(result,`TW-${experiment}-01 ·`),'Missing emitter base');
   assert.ok(matchPart(result,`TW-${experiment}-02 ·`),'Missing receiver base');
  });
 }
}
test('Exploded 3D groups genuinely separate emitter, receiver and output hardware',()=>{
 for(const experiment of ['B','C']){
  const prefix=experiment==='B'?'mcgruber-visible-b':'mcgruber-infrared-c';
  const assembled=opticalExample(prefix+'-assembled');
  const exploded=opticalExample(prefix+'-exploded');
  for(const id of ['01','02']){
   const a=matchPart(assembled,`TW-${experiment}-${id} ·`);
   const b=matchPart(exploded,`TW-${experiment}-${id} ·`);
   assert.ok(a&&b);
   assert.ok(Math.abs(a.position.x-b.position.x)>=20,'Part did not move for explode');
   assert.ok(Math.abs(a.position.z-b.position.z)>=8,'Part did not lift for explode');
  }
 }
});
test('B red sensor remains unpowered and dark-loss interface stays explicitly MISSING',()=>{
 const clear=opticalExample('mcgruber-visible-b-assembled',{blocked:false});
 const blocked=opticalExample('mcgruber-visible-b-assembled',{blocked:true});
 const detector=matchPart(clear,'TW-B-07 ·');
 const front=matchPart(clear,'TW-B-09 ·');
 const gap=matchPart(clear,'TW-B-15 ·');
 assert.match(detector.name,/UNPOWERED/);
 assert.equal(front.userData.missingParts,true);
 assert.equal(front.userData.verifiedCircuit,false);
 assert.equal(gap.userData.missingInterface,true);
 assert.match(matchPart(clear,'TW-B-10 ·').name,/PINOUT NOT VERIFIED/);
 const lamp=matchPart(clear,'TW-B-11 ·');
 const lampBlocked=matchPart(blocked,'TW-B-11 ·');
 assert.match(lamp.name,/UNTESTED/);
 assert.equal(lamp.name,lampBlocked.name,'B must not falsely show automatic alarm');
 assert.ok([...lamp.children].every(o=>!o.material||o.material.emissiveIntensity===0));
 assert.ok([...lampBlocked.children].every(o=>!o.material||o.material.emissiveIntensity===0));
});
test('C blocked state visually lights only its warning LED, without changing real test status',()=>{
 const clear=opticalExample('mcgruber-infrared-c-assembled',{blocked:false});
 const blocked=opticalExample('mcgruber-infrared-c-assembled',{blocked:true});
 const a=matchPart(clear,'TW-C-10 ·'),b=matchPart(blocked,'TW-C-10 ·');
 assert.match(a.name,/OFF · symbolic/);
 assert.match(b.name,/ON · symbolic/);
 assert.equal(clear.objects.length,blocked.objects.length);
 assert.ok(a.children.every(o=>!o.material||o.material.emissiveIntensity===0));
 assert.ok(b.children.some(o=>o.material?.emissiveIntensity>0));
 assert.match(matchPart(blocked,'TW-C-15 ·').name,/BLOCKED/);
 assert.equal(blocked.blocked,true);
 assert.ok(clear.objects.every(o=>o.userData.hardwareTested===false));
});
test('No audio, network commands or Arduino dependency in illustrative 3D generator',async()=>{
 const source=await readFile(new URL('../src/optical-tripwire-models.js',import.meta.url),'utf8');
 for(const pattern of [/\bAudioContext\b/,/\.play\(/,/navigator\.mediaDevices/,/fetch\(/,/setInterval\(/]){
  assert.doesNotMatch(source,pattern);
 }
 assert.throws(()=>opticalExample('../../secret'),/Unknown optical example/);
});


test('B receiver red LED physically faces left toward its blue transmitter',()=>{
 const model=opticalExample('mcgruber-visible-b-assembled');
 const blue=matchPart(model,'TW-B-05 ·');
 const redSensor=matchPart(model,'TW-B-07 ·');
 assert.ok(blue.position.x<redSensor.position.x);
 assert.ok(Math.abs(redSensor.rotation.z-Math.PI)<1e-9,
  'Red sensor lens points +X by default; it must rotate toward the blue LED at -X');
 assert.match(redSensor.name,/UNPOWERED/);
});
test('1k and 10k nominal color bands are accurate and unmeasured parts are not assigned guessed bands',()=>{
 const b=opticalExample('mcgruber-visible-b-assembled');
 const c=opticalExample('mcgruber-infrared-c-assembled');
 const bands=part=>part.children.slice(1,5).map(mesh=>mesh.material.color.getHexString());
 const colors={brown:'83582e',black:'172333',red:'f04c60',orange:'f2a449',gold:'d9bc68'};
 const oneK=[colors.brown,colors.black,colors.red,colors.gold];
 const tenK=[colors.brown,colors.black,colors.orange,colors.gold];
 const bEmitter=matchPart(b,'TW-B-04 ·'),bOutput=matchPart(b,'TW-B-12 ·');
 const cPullup=matchPart(c,'TW-C-08 ·'),cIndicator=matchPart(c,'TW-C-09 ·');
 assert.deepEqual(bands(bEmitter),oneK);
 assert.deepEqual(bands(cPullup),tenK);
 assert.deepEqual(bands(cIndicator),oneK);
 assert.equal(bEmitter.userData.nominalOhms,1000);
 assert.equal(cPullup.userData.nominalOhms,10000);
 assert.equal(cIndicator.userData.nominalOhms,1000);
 assert.equal(bOutput.userData.nominalOhms,null);
 assert.equal(bOutput.children.length,3,'Unknown output resistor must have no fabricated color bands');
 for(const part of [bEmitter,bOutput,cPullup,cIndicator]){
  assert.equal(part.userData.resistanceMeasured,false);
  assert.equal(part.userData.hardwareTested,false);
 }
});
