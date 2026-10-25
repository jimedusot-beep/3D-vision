import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {components,meshes} from '../src/core.js';
import {exampleModel,EXAMPLE_MODELS} from '../src/example-models.js';
import {opticalExample,OPTICAL_EXAMPLES} from '../src/optical-tripwire-models.js';

const variants=Object.keys(OPTICAL_EXAMPLES);
const partId=o=>o.name.split(' · ')[0];

test('four explicit B/C entrypoints are recognized, unknown inputs stay blocked',()=>{
 assert.deepEqual(variants,[
  'mcgruber-visible-b-assembled','mcgruber-visible-b-exploded',
  'mcgruber-infrared-c-assembled','mcgruber-infrared-c-exploded',
 ]);
 assert.equal(exampleModel('javascript:alert(1)'),null);
 assert.equal(exampleModel('../../fake.gltf'),null);
 for(const id of variants){
  const source=exampleModel(id),spec=OPTICAL_EXAMPLES[id];
  assert.equal(source?.kind,'procedural');
  assert.equal(source.experiment,spec.experiment);
  assert.equal(source.expectedParts,spec.expectedParts);
  assert.equal(source.verifiedFit,false);
 }
 assert.equal(Object.keys(EXAMPLE_MODELS).length,6);
});

test('both assembled and exploded models contain distinguishable, selectable 3D geometry',()=>{
 for(const id of variants){
  const {objects,triangles,spec}=opticalExample(id);
  const expected=spec.experiment==='B'?16:15;
  assert.equal(objects.length,expected,id);
  assert.equal(components(new THREE.Group().add(...objects)).length,expected);
  const keys=objects.map(partId);
  assert.equal(new Set(keys).size,expected);
  assert.ok(keys.every(k=>k.startsWith('TW-'+spec.experiment+'-')));
  assert.ok(objects.every(o=>o.isGroup&&o.userData.component&&!o.userData.verifiedFit));
  assert.ok(objects.every(o=>o.userData.presentationOnly && o.userData.hardwareTested===false));
  assert.ok(triangles>500&&triangles<28000,id+': '+triangles+' triangles');
  assert.ok(objects.flatMap(meshes).every(m=>m.geometry.getAttribute('position').count>=3),id);
  const allMaterials=objects.flatMap(meshes).map(m=>m.material);
  assert.ok(allMaterials.some(m=>m.transparent),'Must visibly distinguish conceptual light-beam guide');
  assert.ok(allMaterials.some(m=>m.color.getHexString()==='479cf7'||m.color.getHexString()==='49d1df'),'Optical color legend missing');
  const json=new THREE.Group().add(...objects).toJSON();
  assert.doesNotThrow(()=>new THREE.ObjectLoader().parse(json));
 }
});

test('exploded arrangements move named parts but preserve their geometry and identity',()=>{
 for(const experiment of ['visible-b','infrared-c']){
  const assembled=opticalExample('mcgruber-'+experiment+'-assembled'),
        exploded=opticalExample('mcgruber-'+experiment+'-exploded');
  assert.deepEqual(assembled.objects.map(partId),exploded.objects.map(partId));
  let moved=0;
  assembled.objects.forEach((a,i)=>{
   const b=exploded.objects[i];
   assert.equal(meshes(a).length,meshes(b).length);
   const delta=b.position.clone().sub(a.position);
   if(a.userData.side==='guide') assert.equal(delta.length(),0);
   else {assert.ok(Math.abs(delta.x)>=21);moved++;}
  });
  assert.ok(moved>=12);
 }
});

test('B models retain an explicitly missing amplifier; no pretend automatic warning',()=>{
 for(const ending of ['assembled','exploded']){
  const {objects}=opticalExample('mcgruber-visible-b-'+ending,{blocked:true});
  const names=objects.map(o=>o.name).join('\n');
  assert.match(names,/RED LED SENSOR · intentionally UNPOWERED/);
  assert.match(names,/UNKNOWN amplifier \+ threshold · NOT BUILT/);
  assert.match(names,/2N4401 switch · PINOUT NOT VERIFIED/);
  assert.match(names,/Silent red warning LED · output UNTESTED/);
  assert.equal(objects.find(o=>partId(o)==='TW-B-09').userData.missingParts,true);
  assert.equal(objects.find(o=>partId(o)==='TW-B-15').userData.missingInterface,true);
  const warning=objects.find(o=>partId(o)==='TW-B-11');
  assert.equal(meshes(warning).some(m=>m.material.emissiveIntensity>0),false);
 }
});

test('C modules are documented 5 V Adafruit concept, blocking changes only example indicator',()=>{
 const clear=opticalExample('mcgruber-infrared-c-assembled',{blocked:false});
 const blocked=opticalExample('mcgruber-infrared-c-assembled',{blocked:true});
 assert.equal(clear.objects.length,15);
 const names=clear.objects.map(o=>o.name).join('\n');
 for(const term of ['Regulated 5 V','10 kΩ','1 kΩ','silent','Adafruit','active-LOW'])
   assert.match(names,new RegExp(term,'i'));
 assert.doesNotMatch(names,/buzzer|speaker|arduino|laser|9 V/i);
 const warning=s=>s.objects.find(o=>partId(o)==='TW-C-10');
 const intensity=s=>meshes(warning(s)).reduce((max,m)=>Math.max(max,m.material.emissiveIntensity),0);
 assert.equal(intensity(clear),0);
 assert.ok(intensity(blocked)>0);
 const guide=blocked.objects.find(o=>partId(o)==='TW-C-15');
 assert.equal(guide.userData.noVisibleRayInAir,true);
 assert.ok(meshes(guide).some(m=>m.material.color.getHexString()==='172333'));
});

test('all procedural outputs explicitly reject unknown IDs',()=>{
 assert.throws(()=>opticalExample('nonexistent'),/Unknown optical example/);
});
