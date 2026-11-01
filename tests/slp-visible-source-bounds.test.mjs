import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {readFileSync} from 'node:fs';
import {visibleSourceBounds} from '../ANATOMY/SLP/visible-source-bounds.js';

const center=box=>box.getCenter(new THREE.Vector3());
const size=box=>box.getSize(new THREE.Vector3());

test('visible geometry only: hidden regions cannot make an isolated structure tiny',()=>{
 const root=new THREE.Group();
 const jaw=new THREE.Mesh(new THREE.BoxGeometry(4,2,2),new THREE.MeshBasicMaterial());
 const ossicle=new THREE.Mesh(new THREE.BoxGeometry(.3,.2,.4),new THREE.MeshBasicMaterial());
 const hiddenGroup=new THREE.Group();
 const huge=new THREE.Mesh(new THREE.BoxGeometry(500,500,500),new THREE.MeshBasicMaterial());
 jaw.position.set(0,0,0);ossicle.position.set(2,0,0);
 huge.position.set(1000,0,0);hiddenGroup.add(huge);hiddenGroup.visible=false;
 root.add(jaw,ossicle,hiddenGroup);
 const all=visibleSourceBounds(THREE,root);
 assert.ok(size(all).x>4,'normal view includes all visible structures');
 jaw.visible=false;
 const isolated=visibleSourceBounds(THREE,root);
 assert.ok(size(isolated).x<.31,'only the small structure defines the frame');
 assert.ok(center(isolated).distanceTo(new THREE.Vector3(2,0,0))<1e-9);
 assert.equal(huge.visible,true,'source visibility state is not mutated');
});

test('world-space source bounds track actual explosion transforms without changing geometry',()=>{
 const root=new THREE.Group();
 const parent=new THREE.Group();parent.scale.set(2,1,1);parent.position.x=3;
 const left=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial());
 const right=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial());
 left.position.x=-2;right.position.x=2;
 parent.add(left,right);root.add(parent);
 const original=visibleSourceBounds(THREE,root);
 const geometry=left.geometry;
 right.position.x+=5;
 const expanded=visibleSourceBounds(THREE,root);
 assert.ok(size(expanded).x>size(original).x+9);
 right.position.x-=5;
 const restored=visibleSourceBounds(THREE,root);
 assert.ok(size(restored).distanceTo(size(original))<1e-9);
 assert.equal(left.geometry,geometry,'original source meshes remain unchanged');
});

test('all groups hidden returns empty bounds rather than an invalid camera position',()=>{
 const root=new THREE.Group();
 const mesh=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial());
 mesh.visible=false;root.add(mesh);
 assert.equal(visibleSourceBounds(THREE,root).isEmpty(),true);
 assert.throws(()=>visibleSourceBounds(THREE,null),TypeError);
});

test('four iPhone-flagged labs share visible source framing and have no fixed camera distance cap',()=>{
 for(const name of ['viewer','oral','pharynx','ear']){
  const source=readFileSync(new URL('../ANATOMY/SLP/'+name+'.js',import.meta.url),'utf8');
  assert.match(source,/visibleSourceBounds\(THREE,/);
  assert.doesNotMatch(source,/Math\.min\((?:45|60),\s*(?:Math\.max\(|distance)/);
  assert.match(source,/camera\.far=Math\.max\(200,/);
 }
});
