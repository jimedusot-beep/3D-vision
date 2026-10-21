import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {Workshop, mark, material, worldGeometry, inspect, validateProject} from '../src/core.js';
import {createJoint, applyJoints, setJointValue, validateJointDefinitions, pruneMissingJoints} from '../src/joints.js';
import {surfaceAnchor, resolveAnnotation} from '../src/annotations.js';
import {analyzeInterference, analyzeThickness} from '../src/analysis.js';
const near = (a, b, eps = 1e-5) => assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`);
const box = (name = 'Box', size = [10, 10, 10]) => mark(new THREE.Mesh(new THREE.BoxGeometry(...size), material()), name);
const item = m => ({id:m.userData.id,name:m.name,geometry:worldGeometry(m).toJSON()});

test('revolute joint rotates a component around its parent-frame pivot and survives undo/redo', () => {
  const w = new Workshop(), a = box('Base'), b = box('Link'); b.position.x = 20; w.add([a,b]);
  const j = createJoint(w.root, a, b, {type:'revolute',axis:'z'});
  w.checkpoint(); setJointValue(w.root,j.id,90); near(b.position.x,0); near(b.position.y,20);
  a.position.set(4,5,0); applyJoints(w.root); near(b.position.x,4); near(b.position.y,25);
  w.undo(); near(w.root.children[1].position.x,20); near(w.root.userData.joints[0].value,0);
  w.redo(); near(w.root.userData.joints[0].value,90); applyJoints(w.root); near(w.root.children[1].position.y,25);
  validateProject({format:'3dvision-project',version:1,scene:w.json()});
});
test('prismatic and fixed joints propagate a chain in dependency order', () => {
  const w=new Workshop(),a=box('A'),b=box('B'),c=box('C');b.position.x=10;c.position.x=15;w.add([a,b,c]);
  const j=createJoint(w.root,a,b,{type:'prismatic',axis:'y',min:-20,max:20});createJoint(w.root,b,c,{type:'fixed'});
  setJointValue(w.root,j.id,12);near(b.position.y,12);near(c.position.y,12);near(c.position.x,15);
  a.rotation.z=Math.PI/2;applyJoints(w.root);near(b.position.x,-12);near(b.position.y,10);near(c.position.y,15);
});
test('joint cycles, second drivers, invalid travel, nested endpoints and nonuniform frames are rejected',()=>{
  const w=new Workshop(),a=box('A'),b=box('B'),c=box('C');w.add([a,b,c]);const j=createJoint(w.root,a,b,{type:'revolute'});
  assert.throws(()=>createJoint(w.root,b,a),/cycles/);assert.throws(()=>createJoint(w.root,c,b),/one driving/);
  assert.throws(()=>setJointValue(w.root,j.id,181),/between/);near(j.value,0);
  c.scale.x=2;assert.throws(()=>createJoint(w.root,b,c),/uniform scale/);c.scale.x=1;
  b.userData.locked=true;assert.throws(()=>setJointValue(w.root,j.id,40),/Unlock/);
  w.group([a,c]);assert.throws(()=>applyJoints(w.root),/top-level/);
});
test('deleted endpoint joints are pruned and invalid imported joint matrices are rejected',()=>{
  const w=new Workshop(),a=box(),b=box();w.add([a,b]);createJoint(w.root,a,b);b.removeFromParent();assert.equal(pruneMissingJoints(w.root),1);
  w.add([b]);const j=createJoint(w.root,a,b);j.base[0]=NaN;assert.throws(()=>validateJointDefinitions(w.root.userData.joints),/placement/);
});
test('surface labels and distance measurements follow transformed components',()=>{
  const w=new Workshop(),a=box('A'),b=box('B');b.position.x=10;w.add([a,b]);
  const label={text:'Anchor',...surfaceAnchor(a,new THREE.Vector3(1,2,3))};a.position.x=5;near(resolveAnnotation(w.root,label).point.x,6);
  const measure={kind:'distance',anchors:[surfaceAnchor(a,new THREE.Vector3(5,0,0)),surfaceAnchor(b,new THREE.Vector3(10,0,0))]};
  near(resolveAnnotation(w.root,measure).value,5);b.position.x=25;near(resolveAnnotation(w.root,measure).value,20);
  b.visible=false;assert.equal(resolveAnnotation(w.root,measure),null);b.visible=true;near(resolveAnnotation(w.root,measure).value,20);
  b.removeFromParent();assert.equal(resolveAnnotation(w.root,measure),null);
});
test('mirrored transforms retain outward winding and do not modify source indices',()=>{
  const m=box();const source=[...m.geometry.index.array];m.scale.x=-2;
  near(inspect(m).signedVolume,2000);assert.deepEqual([...m.geometry.index.array],source);
});
test('interference distinguishes triangle contact, full containment and actual separation',()=>{
  const a=box('A'),b=box('B');b.position.x=5;
  assert.equal(analyzeInterference([item(a),item(b)]).results[0].kind,'surface');
  const small=box('Small',[2,2,2]);assert.equal(analyzeInterference([item(a),item(small)]).results[0].kind,'containment');
  b.position.x=30;assert.equal(analyzeInterference([item(a),item(b)]).results.length,0);
});
test('overlapping bounding boxes do not create a false surface collision',()=>{
  const a=box('Rail A',[10,1,1]),b=box('Rail B',[10,1,1]);a.rotation.z=b.rotation.z=Math.PI/4;b.position.set(-Math.SQRT2,Math.SQRT2,0);
  const result=analyzeInterference([item(a),item(b)],{clearance:.1});assert.equal(result.candidates,1);assert.equal(result.results[0].kind,'clear');
  const close=analyzeInterference([item(a),item(b)],{clearance:1.1}).results[0];assert.equal(close.kind,'clearance');near(close.distance,1);
});
test('containment handles hollow cavities and disconnected closed shells',()=>{
  const outer=worldGeometry(box('outer')),inner=worldGeometry(box('inner',[8,8,8]));
  for(let i=0;i<inner.index.count;i+=3){const b=inner.index.getX(i+1);inner.index.setX(i+1,inner.index.getX(i+2));inner.index.setX(i+2,b);}
  const shell=mark(new THREE.Mesh(mergeGeometries([outer,inner]),material()),'hollow');
  const small=box('small',[1,1,1]);assert.equal(analyzeInterference([item(shell),item(small)]).results[0].kind,'clear');
  const distant=box('outside',[1,1,1]);distant.position.x=20;
  const multi=mark(new THREE.Mesh(mergeGeometries([worldGeometry(distant),worldGeometry(small)]),material()),'two shells');
  assert.equal(analyzeInterference([item(box()),item(multi)]).results[0].kind,'containment');
});
test('normal-ray thickness finds a thin plate and measures a 10 mm cube',()=>{
  const cube=analyzeThickness([item(box())],{samples:128}).results[0];near(cube.minimum,10);assert.equal(cube.samples,12);assert.equal(cube.unresolved,0);
  const plate=analyzeThickness([item(box('thin',[10,10,.6]))],{threshold:1.2,samples:128}).results[0];near(plate.minimum,.6);assert.ok(plate.thin>0);assert.ok(plate.witnesses.length>0);
});
test('thickness refuses open topology and all analysis limits are explicit',()=>{
  const plane=mark(new THREE.Mesh(new THREE.PlaneGeometry(10,10),material()),'open');
  const report=analyzeThickness([item(plane)]).results[0];assert.equal(report.closed,false);assert.equal(report.samples,0);assert.match(report.reason,/required/);
  assert.throws(()=>analyzeThickness([item(box())],{samples:9999}),/12–512/);
  assert.throws(()=>analyzeInterference(Array.from({length:41},()=>item(box()))),/1 and 40/);
});
