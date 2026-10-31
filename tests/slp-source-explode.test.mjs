import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createSourceExplosion} from '../ANATOMY/SLP/source-explode.js';

function buildScene(){
 const root=new THREE.Group();
 const scaled=new THREE.Group();
 scaled.scale.set(1.4,.85,2.2);scaled.rotation.y=.38;
 scaled.position.set(1,2,-.5);root.add(scaled);
 const a=new THREE.Mesh(new THREE.BoxGeometry(1,.9,.6),new THREE.MeshBasicMaterial());
 const b=new THREE.Mesh(new THREE.SphereGeometry(.35,12,10),new THREE.MeshBasicMaterial());
 const c=new THREE.Mesh(new THREE.BoxGeometry(.3,.6,.4),new THREE.MeshBasicMaterial());
 a.position.set(-.7,0,.1);b.position.set(.5,.1,.2);c.position.set(.7,-.2,.4);
 scaled.add(a,b,c);root.updateMatrixWorld(true);
 return {root,scaled,a,b,c};
}
const pos=mesh=>mesh.getWorldPosition(new THREE.Vector3());
test('a real source group actually moves in 3D; original mesh geometry and source identity are untouched',()=>{
 const {root,a,b,c}=buildScene();
 const original=[a,b,c].map(pos);
 const geometry=[a.geometry,b.geometry,c.geometry];
 const sourceNames=['source-a','source-b','source-c'];
 const explosion=createSourceExplosion({THREE,model:root,groups:[
  {id:sourceNames[0],meshes:[a]},{id:sourceNames[1],meshes:[b]},{id:sourceNames[2],meshes:[c]}
 ]});
 assert.equal(explosion.groupCount,3);
 assert.equal(explosion.meshCount,3);
 assert.equal(explosion.setAmount(65),.65);
 const moved=[a,b,c].map(pos);
 assert.ok(moved.every((p,i)=>p.distanceTo(original[i])>.01),'Every real mesh must move visually');
 assert.ok(moved[0].distanceTo(moved[1])!==original[0].distanceTo(original[1]));
 for(let i=0;i<3;i++)assert.equal([a,b,c][i].geometry,geometry[i]);
 assert.equal(explosion.setAmount(0),0);
 for(let i=0;i<3;i++){
  assert.ok(pos([a,b,c][i]).distanceTo(original[i])<1e-9,'Original world position restored');
  assert.strictEqual([a,b,c][i].geometry,geometry[i],'No procedural replacement');
 }
});
test('separate meshes in one source identity remain rigidly grouped',()=>{
 const {root,a,b,c}=buildScene();
 const initial=pos(a).distanceTo(pos(b));
 const explosion=createSourceExplosion({THREE,model:root,groups:[
  {id:'source-a',meshes:[a,b]},{id:'source-b',meshes:[c]}
 ]});
 explosion.setAmount(100);
 assert.ok(Math.abs(pos(a).distanceTo(pos(b))-initial)<1e-9,
 'Grouped original-source fragments must move by the same world offset');
 explosion.setAmount(0);
 assert.ok(Math.abs(pos(a).distanceTo(pos(b))-initial)<1e-9);
});
test('hidden unrelated geometry never changes the visible source explosion layout',()=>{
 const {root,a,b,c}=buildScene();
 const groups=[{id:'a',meshes:[a]},{id:'b',meshes:[b]},{id:'c',meshes:[c]}];
 const baseline=createSourceExplosion({THREE,model:root,groups});
 baseline.setAmount(65);
 const expected=[a,b,c].map(pos);
 baseline.setAmount(0);
 const hidden=new THREE.Mesh(new THREE.BoxGeometry(12000,9000,11000),new THREE.MeshBasicMaterial());
 hidden.name='unrelated-hidden-brain-geometry';hidden.position.set(25000,25000,25000);
 hidden.visible=false;root.add(hidden);
 const focus=createSourceExplosion({THREE,model:root,groups});
 focus.setAmount(65);
 [a,b,c].forEach((mesh,i)=>assert.ok(pos(mesh).distanceTo(expected[i])<1e-8,
  'Hidden off-study source records cannot alter explosion distance or position'));
 assert.ok(hidden.position.distanceTo(new THREE.Vector3(25000,25000,25000))<1e-9);
 focus.setAmount(0);
});
test('reject fabricated or repeated source meshes and invalid separation',()=>{
 const {root,a,b,c}=buildScene();
 assert.throws(()=>createSourceExplosion({THREE,model:root,groups:[{id:'one',meshes:[a]}]}),/multiple/);
 assert.throws(()=>createSourceExplosion({THREE,model:root,groups:[
  {id:'one',meshes:[a]},{id:'one',meshes:[b]}
 ]}),/duplicate/);
 const explosion=createSourceExplosion({THREE,model:root,groups:[
  {id:'one',meshes:[a]},{id:'two',meshes:[b,c]}
 ]});
 for(const bad of [-1,101,NaN,Infinity])assert.throws(()=>explosion.setAmount(bad),/0–100/);
});
test('all five previously missing viewers have physically linked controls and WebGL fallback',async()=>{
 const {readFileSync}=await import('node:fs');
 for(const id of ['diaphragm','oral','pharynx','ear','neural']){
  const html=readFileSync(new URL('../ANATOMY/SLP/'+id+'.html',import.meta.url),'utf8');
  const js=readFileSync(new URL('../ANATOMY/SLP/'+id+'.js',import.meta.url),'utf8');
  for(const key of ['explode','explode-amount','explode-value','assemble','explode-status'])
   assert.ok(html.includes('id="'+id+'-'+key+'"'),id+' missing '+key);
  assert.match(js,/attachSourceExplosion/);
  assert.match(html,/Explode 3D/);
  assert.match(html,/Reassemble/);
  assert.doesNotMatch(js,/new THREE\.(SphereGeometry|CylinderGeometry|TubeGeometry)/);
 }
});

test('seven source anatomy viewers expose consistent Retry 3D controls on errors',async()=>{
 const {readFileSync}=await import('node:fs');
 for(const id of ['diaphragm','oral','pharynx','ear','neural','lungs','viewer']){
  const code=readFileSync(new URL('../ANATOMY/SLP/'+id+'.js',import.meta.url),'utf8');
  assert.match(code,/create3DRetry/,'Missing Retry 3D helper in '+id);
  assert.match(code,/retry3D\.show\(\)/,'Missing failure recovery path in '+id);
  assert.match(code,/retry3D\.hide\(\)/,'Missing recovery-success or context-restored cleanup in '+id);
 }
 const utility=readFileSync(new URL('../ANATOMY/SLP/retry-3d.js',import.meta.url),'utf8');
 assert.match(utility,/Retry 3D/);
 assert.match(utility,/aria-label/);
 assert.match(utility,/location\.reload/);
});
