import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {neuralModel,validNeuralAsset} from '../scripts/prepare-slp-neural.mjs';
import {neuralParts,neuralById,neuralLessons,neuralRegions,neuralLicense,verifyNeuralManifest,verifyNeuralNodes,teachingStepId} from '../ANATOMY/SLP/neural-manifest.js';

test('neural 3D model + source JSON are pinned to an immutable CC BY-SA source',()=>{
 assert.equal(neuralModel.repo,'itayinbarr/brainproject');
 assert.match(neuralModel.commit,/^[a-f0-9]{40}$/);
 assert.equal(neuralModel.modelBytes,4650816);
 assert.equal(neuralModel.manifestBytes,232455);
 assert.equal(neuralModel.modelBlob,'c80dd62202b5cf8a2a43c7a019311781bd95457c');
 assert.equal(neuralModel.manifestBlob,'ad25ab2d45b2d46a94f324143506f0fa3bc6906a');
 assert.equal(neuralModel.modelSha256,'76a49ea4526a4880613aec7a02756bd7301b0b9d0680d7cae33e197b672c5453');
 assert.equal(neuralModel.manifestSha256,'66c32355e02c3ba5fadf3b3bdb61b18c619162d6c5ee2083262e59bed4274d93');
 assert.equal(neuralModel.license,'CC-BY-SA-4.0');
 assert.match(neuralLicense.model,/CC BY-SA 4\.0/);
 assert.match(neuralLicense.code,/Apache/);
 assert.equal(validNeuralAsset(Buffer.alloc(20),'model'),false);
 assert.equal(validNeuralAsset(Buffer.from('{"nodes":[]}'),'manifest'),false);
});
test('44 source nerves or branches plus 30 brainstem groups, not twelve complete cranial nerves',()=>{
 assert.equal(neuralParts.length,74);
 assert.equal(neuralParts.filter(p=>p.region==='cranial_nerves').length,44);
 assert.equal(neuralParts.filter(p=>p.region==='brainstem').length,30);
 assert.equal(new Set(neuralParts.map(p=>p.id)).size,74);
 assert.equal(Object.keys(neuralRegions).length,2);
 assert.ok(neuralParts.every(p=>p.source==='Z-Anatomy / BodyParts3D'));
 assert.equal(verifyNeuralNodes(neuralParts.map(p=>({id:p.id,category:p.region}))),true);
 assert.equal(verifyNeuralNodes(neuralParts.map(p=>({id:p.id,category:'wrong'}))),false);
 assert.equal(verifyNeuralNodes([]),false);
 assert.ok(!neuralParts.some(p=>/Glossopharyngeal nerve/i.test(p.name)));
 assert.ok(neuralParts.some(p=>p.name==='Medulla oblongata'&&p.side==='left'));
 assert.ok(neuralById.has(419)); // Left vagus source node.
});
test('seven SLP checkpoints include accurate missing-mesh IX warning',()=>{
 assert.equal(neuralLessons.length,7);
 assert.deepEqual(neuralLessons.map(l=>l.key),
 ['Trigeminal nerve (V)','Facial nerve (VII)','Vestibular nerve',null,
 'Vagus nerve (X)','Accessory nerve (XI)','Hypoglossal nerve (XII)']);
 assert.equal(teachingStepId(neuralLessons[3]),null);
 assert.match(neuralLessons[3].note,/NO glossopharyngeal 3D nerve mesh/);
 assert.match(neuralLessons[2].note,/only vestibular nerve geometry/i);
 for(const lesson of neuralLessons){
  assert.ok(lesson.note.length>80);
  if(lesson.key)assert.ok(neuralById.has(teachingStepId(lesson)));
 }
});
test('standalone Draco viewer has source/licensing disclosure, text-first interface',()=>{
 const html=readFileSync(new URL('../ANATOMY/SLP/neural.html',import.meta.url),'utf8');
 const js=readFileSync(new URL('../ANATOMY/SLP/neural.js',import.meta.url),'utf8');
 const pkg=readFileSync(new URL('../package.json',import.meta.url),'utf8');
 const vite=readFileSync(new URL('../vite.config.js',import.meta.url),'utf8');
 for(const id of ['neural-stage','neural-select','neural-filters','neural-note-text',
 'neural-status','neural-fallback','neural-focus','neural-isolate','neural-lesson-start',
 'neural-lesson-progress','neural-lesson-next','neural-lesson-prev','neural-lesson-close',
 'neural-lesson-note','neural-lesson-summary'])
  assert.ok(html.includes('id="'+id+'"'),id);
 assert.match(html,/CN IX is missing as a separate 3D mesh/);
 assert.match(html,/44 source-labeled/);
 assert.match(html,/CC BY-SA 4\.0/);
 assert.match(js,/new DRACOLoader\(\)/);
 assert.match(js,/verifyNeuralManifest\(manifest\.nodes\)/);
 assert.match(js,/verifyNeuralNodes\(byId\)/);
 assert.match(js,/teachingStepId/);
 assert.doesNotMatch(js,/new THREE\.(SphereGeometry|CylinderGeometry|CapsuleGeometry|TubeGeometry)/);
 assert.match(pkg,/prepare-slp-neural\.mjs/);
 assert.match(vite,/neural:'ANATOMY\/SLP\/neural\.html'/);
});
test('locally cached model and source manifest are original when present',()=>{
 for(const [filename,type] of [['neural.glb','model'],['neural-source-manifest.json','manifest']]){
  try{
   const data=readFileSync(new URL('../public/models/slp/'+filename,import.meta.url));
   assert.equal(validNeuralAsset(data,type),true,filename);
   if(type==='manifest')assert.equal(verifyNeuralManifest(JSON.parse(data.toString('utf8')).nodes),true);
  }catch(e){if(e.code!=='ENOENT')throw e;}
 }
});
