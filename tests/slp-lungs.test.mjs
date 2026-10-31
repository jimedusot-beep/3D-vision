import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {readFileSync} from 'node:fs';
import {lungsModel,validLungsModel} from '../scripts/prepare-slp-lungs.mjs';
import {lungGroups,lungRegions,lungLicense,verifyLungGroups} from '../ANATOMY/SLP/lungs-manifest.js';

test('4.3 source model pin has exact version, checksum and separate CC BY-SA 2.1 Japan licensing',()=>{
 assert.equal(lungsModel.repo,'organui/lungs-3d');
 assert.match(lungsModel.commit,/^[a-f0-9]{40}$/);
 assert.equal(lungsModel.bytes,3901260);
 assert.equal(lungsModel.sha256,'b2b19e5f7473036598e3552a5835a4ebc0f55c786ddd00863cb6a170409ed346');
 assert.equal(lungsModel.license,'CC-BY-SA-2.1-JP');
 assert.match(lungLicense.license,/CC BY-SA 2.1 Japan/);
 assert.match(lungLicense.source,/DBCLS/);
 assert.equal(validLungsModel(Buffer.alloc(16)),false);
});
test('lung tissue and bronchi map to exactly twenty genuine, nonfabricated source model IDs',()=>{
 assert.equal(verifyLungGroups(lungGroups.map(s=>s.id)),true);
 assert.equal(lungGroups.filter(s=>s.kind==='segment').length,17);
 assert.equal(lungGroups.filter(s=>s.kind==='airway').length,3);
 assert.equal(new Set(lungGroups.map(s=>s.id)).size,20);
 assert.equal(Object.keys(lungRegions).length,6);
 for(const s of lungGroups){
  assert.ok(lungRegions[s.region],s.id);
  assert.match(s.id,/^FMA[0-9]+$/);
  assert.ok(s.description.length>45);
 }
 assert.throws(()=>verifyLungGroups(['FMA7394']),/20/);
});
test('cached lung source binary, if present, is verified against pinned hash',async()=>{
 try{const buffer=await readFile(new URL('../public/models/slp/lungs.glb',import.meta.url));
  assert.equal(validLungsModel(buffer),true);
 }catch(e){if(e.code!=='ENOENT')throw e;}
});
test('anatomy views are supported, not fake full-body procedural anatomy',()=>{
 const html=readFileSync(new URL('../ANATOMY/SLP/lungs.html',import.meta.url),'utf8');
 const js=readFileSync(new URL('../ANATOMY/SLP/lungs.js',import.meta.url),'utf8');
 const packageJson=readFileSync(new URL('../package.json',import.meta.url),'utf8');
 for(const id of ['lung-stage','lung-select','lung-separate','lung-assemble','layer-choices','model-status'])
  assert.ok(html.includes('id="'+id+'"'));
 assert.match(html,/omits the diaphragm, ribs, pleura, alveoli/);
 assert.match(js,/verifyLungGroups\(meshNodes\.map\(m=>m\.name\)\)/);
 assert.match(js,/\.attach\(mesh\)/);
 assert.doesNotMatch(js,/new THREE\.(SphereGeometry|CapsuleGeometry|CylinderGeometry)/);
 assert.match(packageJson,/prepare-slp-lungs\.mjs/);
});
