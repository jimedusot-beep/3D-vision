import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {oralParts} from '../ANATOMY/SLP/oral-manifest.js';
import {createOralClusterLayout} from '../ANATOMY/SLP/oral-explode-layout.js';
import {createSourceExplosion} from '../ANATOMY/SLP/source-explode.js';

const pos=mesh=>mesh.getWorldPosition(new THREE.Vector3());
test('all fifteen oral groups receive moderate, coherent study offsets',()=>{
 const parts=oralParts.map((part,i)=>{
  const bounds=new THREE.Box3(new THREE.Vector3(i,0,0),new THREE.Vector3(i+1,1,1));
  return {id:part.id,partBounds:bounds};
 });
 const layout=createOralClusterLayout({THREE,parts,span:10});
 assert.equal(layout.size,15);
 const compare=(a,b)=>assert.ok(layout.get(a).distanceTo(layout.get(b))<1e-12,
  a+' and '+b+' must stay together');
 compare('right-parotid-gland','right-parotid-duct');
 compare('right-parotid-gland','right-accessory-parotid-gland');
 compare('left-parotid-gland','left-parotid-duct');
 compare('right-submandibular-gland','right-submandibular-duct');
 compare('left-submandibular-gland','left-submandibular-duct');
 assert.ok(layout.get('right-parotid-gland').distanceTo(layout.get('left-parotid-gland'))>3,
  'Contralateral clusters should separate legibly');
 assert.ok(layout.get('tongue').length()<layout.get('right-parotid-gland').length(),
  'Center articulator should move less than the outer glands');
 for(const [id,offset] of layout){
  assert.ok(offset.length()<4,'No extreme starburst displacement: '+id);
 }
 assert.throws(()=>createOralClusterLayout({THREE,parts:[{id:'fabricated-oral-group'}],span:10}),/Unrecognized/);
});
test('actual source meshes use the same rigid cluster displacement, and return to assembled geometry',()=>{
 const model=new THREE.Group(),parent=new THREE.Group();
 parent.rotation.y=.35;parent.scale.set(1.7,.8,1.4);model.add(parent);
 const groups=oralParts.map((part,i)=>{
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(.2,.25,.2),new THREE.MeshStandardMaterial());
  mesh.name=part.id;
  mesh.position.set((i%5-2)*.48,Math.floor(i/5)*.42,0);
  parent.add(mesh);
  return {id:part.id,meshes:[mesh]};
 });
 const before=new Map(groups.map(x=>[x.id,pos(x.meshes[0]).clone()]));
 const originalGeometry=new Map(groups.map(x=>[x.id,x.meshes[0].geometry]));
 const explode=createSourceExplosion({THREE,model,groups,layout:createOralClusterLayout});
 explode.setAmount(65);
 const delta=id=>pos(groups.find(x=>x.id===id).meshes[0]).sub(before.get(id));
 assert.ok(delta('right-parotid-gland').distanceTo(delta('right-parotid-duct'))<1e-8);
 assert.ok(delta('left-parotid-gland').distanceTo(delta('left-parotid-duct'))<1e-8);
 assert.ok(delta('mandible').length()>.01);
 explode.setAmount(0);
 for(const group of groups){
  assert.ok(pos(group.meshes[0]).distanceTo(before.get(group.id))<1e-8);
  assert.strictEqual(group.meshes[0].geometry,originalGeometry.get(group.id));
 }
});
