import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {earModel,validEarModel} from '../scripts/prepare-slp-ear.mjs';
import {earParts,earRegions,earLicense,soundJourney,verifyEarNodes} from '../ANATOMY/SLP/ear-manifest.js';

test('right ear model is pinned to exact Z-Anatomy-derived upstream, CC BY-SA 4.0',()=>{
 assert.equal(earModel.repo,'organui/ear-3d');
 assert.equal(earModel.commit,'40ace7ed45cdbf604adda889e5db720ee6b1ce98');
 assert.equal(earModel.bytes,1010340);
 assert.equal(earModel.sha256,'39437aeadce1c82d44efc7df1dbaedb872b2f7dd62d66537fc4d4178df0cede1');
 assert.equal(earModel.gitBlobSha1,'ca976a3a626517860a6f09673868f6a889e10f09');
 assert.equal(earModel.license,'CC-BY-SA-4.0');
 assert.equal(earModel.earSide,'right');
 assert.match(earLicense.credit,/Z-Anatomy.*DBCLS/);
 assert.equal(validEarModel(Buffer.alloc(30)),false);
});
test('exactly sixteen original source-group IDs, including no invented auditory canal',()=>{
 assert.equal(earParts.length,16);
 assert.equal(verifyEarNodes(earParts.map(x=>x.id)),true);
 assert.equal(earParts.reduce((sum,part)=>sum+part.sourceObjectCount,0),31);
 assert.deepEqual(Object.fromEntries(Object.keys(earRegions).map(k=>[k,earParts.filter(x=>x.region===k).length])),
 {outer:7,middle:5,inner:2,nerves:2});
 assert.ok(!earParts.some(p=>p.id==='ear-canal'||p.id==='hair-cells'));
 assert.ok(earParts.some(p=>p.id==='cochlea'));
 assert.ok(earParts.some(p=>p.id==='chorda-tympani'));
 assert.ok(earParts.every(p=>p.description.length>=60&&earRegions[p.region]));
 assert.throws(()=>verifyEarNodes(earParts.map(x=>x.id).slice(0,15)),/sixteen/);
});
test('seven-stage guided journey reflects NIDCD real sound sequence, with omissions flagged',()=>{
 assert.deepEqual(soundJourney.map(x=>x.id),
 ['helix','tympanic-membrane','malleus','incus','stapes','cochlea','vestibulocochlear-nerve']);
 assert.ok(soundJourney.every(x=>earParts.some(p=>p.id===x.id)&&x.note.length>=30));
 assert.match(soundJourney[0].note,/ear canal is missing/i);
 assert.match(soundJourney[5].note,/hair cells/i);
 assert.match(soundJourney[6].note,/not a complete neural pathway/i);
 assert.equal(soundJourney.some(x=>x.id==='vestibule'||x.id==='auditory-tube'),false);
});
test('source model has separate 3D page, attribution, text-only parity and real source nodes',()=>{
 const html=readFileSync(new URL('../ANATOMY/SLP/ear.html',import.meta.url),'utf8');
 const js=readFileSync(new URL('../ANATOMY/SLP/ear.js',import.meta.url),'utf8');
 const vite=readFileSync(new URL('../vite.config.js',import.meta.url),'utf8');
 const pkg=readFileSync(new URL('../package.json',import.meta.url),'utf8');
 for(const id of ['ear-stage','ear-status','ear-select','ear-filters','ear-focus','ear-isolate','ear-fallback',
 'ear-journey-start','ear-journey-active','ear-journey-progress','ear-journey-next','ear-journey-prev','ear-journey-note','ear-journey-close'])
  assert.ok(html.includes('id="'+id+'"'),id);
 assert.match(html,/right ear only/i);
 assert.match(html,/CC BY-SA 4\.0/);
 assert.match(html,/hair cells/i);
 assert.match(js,/verifyEarNodes\(meshes\.map\(o=>o\.name\)\)/);
 assert.match(js,/GLTFLoader\(\)\.parseAsync/);
 assert.doesNotMatch(js,/new THREE\.(SphereGeometry|CapsuleGeometry|CylinderGeometry)/);
 assert.match(pkg,/prepare-slp-ear\.mjs/);
 assert.match(vite,/ear:'ANATOMY\/SLP\/ear\.html'/);
});
test('cached binary must match immutable source when on disk',()=>{
 try{
  const binary=readFileSync(new URL('../public/models/slp/ear.glb',import.meta.url));
  assert.equal(validEarModel(binary),true);
 }catch(e){if(e.code!=='ENOENT')throw e;}
});
