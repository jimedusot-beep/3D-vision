import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {pharynxModel,validPharynxModel} from '../scripts/prepare-slp-pharynx.mjs';
import {pharynxParts,pharynxRegions,pharynxLicense,verifyPharynxNodes} from '../ANATOMY/SLP/pharynx-manifest.js';

test('real 4.3 pharynx GLB is immutable, hashed and independently licensed',()=>{
 assert.equal(pharynxModel.repo,'organui/pharynx-3d');
 assert.match(pharynxModel.commit,/^[a-f0-9]{40}$/);
 assert.equal(pharynxModel.bytes,7148788);
 assert.equal(pharynxModel.sha256,'70d3992cc103ab18f1e9598582cf84c21cc4cbc4d1e65f3853a78efc2961202d');
 assert.equal(pharynxModel.gitBlobSha1,'f4a638d64d86d43eefb3b3f0ca6450e9d4fda47e');
 assert.equal(pharynxModel.license,'CC-BY-SA-2.1-JP');
 assert.match(pharynxLicense.source,/DBCLS/);
 assert.equal(validPharynxModel(Buffer.alloc(30)),false);
});
test('twenty verified original pharynx mesh groups preserve IDs and source concept labels',()=>{
 assert.equal(pharynxParts.length,20);
 assert.equal(new Set(pharynxParts.map(x=>x.id)).size,20);
 assert.equal(verifyPharynxNodes(pharynxParts.map(x=>x.id)),true);
 assert.deepEqual(Object.keys(pharynxRegions),['wall','elevators','palate','landmarks','vessels','nerves']);
 assert.equal(pharynxParts.filter(x=>x.region==='palate').length,3);
 assert.equal(pharynxParts.filter(x=>x.region==='nerves').length,2);
 assert.ok(pharynxParts.some(x=>x.id==='levator-veli-palatini'));
 assert.ok(pharynxParts.some(x=>x.id==='glossopharyngeal-nerves'));
 for(const p of pharynxParts){
  assert.match(p.fma,/^FMA[0-9]+$/);
  assert.ok(p.description.length>=65,p.id);
  assert.ok(pharynxRegions[p.region]);
 }
 assert.throws(()=>verifyPharynxNodes(['tongue']),/twenty/);
});
test('pharynx study is separate from unregistered organs and explicitly static',()=>{
 const html=readFileSync(new URL('../ANATOMY/SLP/pharynx.html',import.meta.url),'utf8');
 const js=readFileSync(new URL('../ANATOMY/SLP/pharynx.js',import.meta.url),'utf8');
 const pkg=readFileSync(new URL('../package.json',import.meta.url),'utf8');
 const vite=readFileSync(new URL('../vite.config.js',import.meta.url),'utf8');
 for(const id of ['pharynx-stage','pharynx-status','pharynx-select','pharynx-filters',
  'pharynx-focus','pharynx-isolate','pharynx-fallback'])
  assert.ok(html.includes('id="'+id+'"'));
 assert.match(html,/20 source-defined groups/);
 assert.match(html,/mucosal pharyngeal lining/);
 assert.match(html,/CC BY-SA 2\.1 Japan/);
 assert.match(js,/verifyPharynxNodes\(meshes\.map\(o=>o\.name\)\)/);
 assert.match(js,/new GLTFLoader\(\)\.parseAsync/);
 assert.doesNotMatch(js,/new THREE\.(SphereGeometry|CylinderGeometry|CapsuleGeometry)/);
 assert.match(pkg,/prepare-slp-pharynx\.mjs/);
 assert.match(vite,/pharynx:'ANATOMY\/SLP\/pharynx\.html'/);
});
test('locally downloaded pharynx GLB is verified when present',()=>{
 try{
  const binary=readFileSync(new URL('../public/models/slp/pharynx.glb',import.meta.url));
  assert.equal(validPharynxModel(binary),true);
 }catch(e){if(e.code!=='ENOENT')throw e;}
});
