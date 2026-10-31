import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {oralModel,validOralModel} from '../scripts/prepare-slp-oral.mjs';
import {oralParts,oralRegions,oralLicense,verifyOralNodes} from '../ANATOMY/SLP/oral-manifest.js';

test('oral geometry is pinned to Z-Anatomy via immutable OrganUI source, not generic MIT assets',()=>{
 assert.equal(oralModel.repo,'organui/organui');
 assert.match(oralModel.commit,/^[a-f0-9]{40}$/);
 assert.equal(oralModel.bytes,754496);
 assert.equal(oralModel.gitBlobSha1,'b1e943c7fab677bff21f74e16d86830cc516f3df');
 assert.equal(oralModel.license,'CC-BY-SA-4.0');
 assert.equal(oralModel.sha256,'4bce66ed11d182e098dc8fecd60aa2011a0b44932a12a7ea8466059000964b92');
 assert.match(oralLicense.license,/CC BY-SA 4\.0/);
 assert.match(oralLicense.source,/DBCLS/);
 assert.equal(validOralModel(Buffer.alloc(64)),false);
});
test('fifteen distinct original source objects include eight glands, four ducts, and three landmarks',()=>{
 assert.equal(oralParts.length,15);
 assert.equal(oralParts.filter(p=>p.region==='glands').length,8);
 assert.equal(oralParts.filter(p=>p.region==='ducts').length,4);
 assert.equal(oralParts.filter(p=>p.region==='articulator').length,1);
 assert.equal(oralParts.filter(p=>p.region==='landmarks').length,2);
 assert.equal(Object.keys(oralRegions).length,4);
 assert.equal(verifyOralNodes(oralParts.map(p=>p.id)),true);
 assert.ok(oralParts.some(x=>x.id==='tongue'));
 assert.ok(oralParts.some(x=>x.id==='mandible'));
 assert.ok(oralParts.some(x=>x.id==='hyoid-bone'));
 for(const p of oralParts){
  assert.ok(p.description.length>=55);
  assert.ok(p.sourceObject);
  assert.ok(oralRegions[p.region]);
 }
 assert.throws(()=>verifyOralNodes(['tongue']),/fifteen/);
});
test('3D oral view protects honest partial coverage, license and build entry',()=>{
 const html=readFileSync(new URL('../ANATOMY/SLP/oral.html',import.meta.url),'utf8');
 const viewer=readFileSync(new URL('../ANATOMY/SLP/oral.js',import.meta.url),'utf8');
 const pkg=readFileSync(new URL('../package.json',import.meta.url),'utf8');
 const vite=readFileSync(new URL('../vite.config.js',import.meta.url),'utf8');
 for(const id of ['oral-stage','oral-select','oral-focus','oral-isolate','oral-filters','oral-note-id','oral-status'])
  assert.ok(html.includes('id="'+id+'"'),id);
 assert.match(html,/CC BY-SA 4\.0/);
 assert.match(html,/does not include lips, teeth, velum, pharynx/i);
 assert.match(viewer,/verifyOralNodes\(meshes\.map\(o=>o\.name\)\)/);
 assert.match(viewer,/GLTFLoader/);
 assert.doesNotMatch(viewer,/new THREE\.(SphereGeometry|CylinderGeometry|CapsuleGeometry)/);
 assert.match(pkg,/prepare-slp-oral\.mjs/);
 assert.match(vite,/oral:'ANATOMY\/SLP\/oral\.html'/);
});
test('cached oral model, if present, must match the pinned Git blob',()=>{
 try{
  const binary=readFileSync(new URL('../public/models/slp/oral.glb',import.meta.url));
  assert.equal(validOralModel(binary),true);
 }catch(e){if(e.code!=='ENOENT')throw e;}
});
