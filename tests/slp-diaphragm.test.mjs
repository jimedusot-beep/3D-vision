import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {diaphragmModel,validDiaphragmModel} from '../scripts/prepare-slp-diaphragm.mjs';
import {diaphragmParts,diaphragmRegions,diaphragmLicense,verifyDiaphragmNodes} from '../ANATOMY/SLP/diaphragm-manifest.js';

test('diaphragm asset uses an immutable source blob, 3.0 dataset and proper license',()=>{
 assert.equal(diaphragmModel.repo,'organui/organui');
 assert.match(diaphragmModel.commit,/^[a-f0-9]{40}$/);
 assert.match(diaphragmModel.gitBlobSha1,/^[a-f0-9]{40}$/);
 assert.equal(diaphragmModel.sha256,'2a6c8608efe4dd33b24ffa6c9cd678c0230629de4b6340ffaa72932b63d6e5ed');
 assert.equal(diaphragmModel.bytes,3649120);
 assert.equal(diaphragmModel.sourceVersion,'BodyParts3D 3.0');
 assert.equal(diaphragmModel.license,'CC-BY-SA-2.1-JP');
 assert.match(diaphragmLicense.credit,/DBCLS/);
 assert.match(diaphragmLicense.license,/CC BY-SA 2\.1 Japan/);
 assert.equal(validDiaphragmModel(Buffer.alloc(20)),false);
});
test('all thirteen named nodes match source parts and restrict main muscle to two halves',()=>{
 assert.equal(diaphragmParts.length,13);
 assert.equal(diaphragmParts.filter(x=>x.region==='diaphragm').length,2);
 assert.equal(Object.keys(diaphragmRegions).length,5);
 assert.equal(verifyDiaphragmNodes(diaphragmParts.map(x=>x.id)),true);
 for(const part of diaphragmParts){
  assert.match(part.fma,/^FMA[0-9]+$/);
  assert.ok(part.name.length>=5);
  assert.ok(part.description.length>=65);
  assert.ok(diaphragmRegions[part.region]);
 }
 assert.throws(()=>verifyDiaphragmNodes(['right-hemidiaphragm']),/13/);
 assert.throws(()=>verifyDiaphragmNodes([...diaphragmParts.slice(0,12).map(x=>x.id),'invalid']),/13/);
});
test('diaphragm viewer is a separate real 3D source page, not an invented overlay',()=>{
 const html=readFileSync(new URL('../ANATOMY/SLP/diaphragm.html',import.meta.url),'utf8');
 const viewer=readFileSync(new URL('../ANATOMY/SLP/diaphragm.js',import.meta.url),'utf8');
 const vite=readFileSync(new URL('../vite.config.js',import.meta.url),'utf8');
 const pkg=readFileSync(new URL('../package.json',import.meta.url),'utf8');
 assert.match(html,/BodyParts3D 3\.0/);
 assert.match(html,/BodyParts3D 4\.3/);
 assert.match(html,/CC BY-SA 2\.1 Japan/);
 assert.match(html,/id="diaphragm-stage"/);
 assert.match(html,/id="diaphragm-select"/);
 assert.match(html,/id="diaphragm-isolate"/);
 assert.match(html,/id="diaphragm-focus"/);
 assert.match(viewer,/verifyDiaphragmNodes\(meshes\.map\(o=>o\.name\)\)/);
 assert.match(viewer,/modelStatus='unavailable'/);
 assert.match(viewer,/new GLTFLoader\(\)\.parseAsync/);
 assert.doesNotMatch(viewer,/new THREE\.(SphereGeometry|CapsuleGeometry|CylinderGeometry)/);
 assert.match(vite,/diaphragm:'ANATOMY\/SLP\/diaphragm\.html'/);
 assert.match(pkg,/prepare-slp-diaphragm\.mjs/);
});
test('when present, local cached diaphragm model passes immutable Git identity',()=>{
 const path=new URL('../public/models/slp/diaphragm.glb',import.meta.url);
 try{
  const binary=readFileSync(path);
  assert.equal(validDiaphragmModel(binary),true);
 }catch(e){if(e.code!=='ENOENT')throw e;}
});
