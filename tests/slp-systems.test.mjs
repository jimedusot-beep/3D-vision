import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {systemModules,respiratoryTerms,respiratoryQuestions,validateSystems} from '../ANATOMY/SLP/systems-catalog.js';
import {systemLayout,validateLayout} from '../ANATOMY/SLP/systems-network-3d.js';
test('SLP system study map has ten unique, source-linked curriculum areas',()=>{
  assert.equal(validateSystems(),true);
  assert.equal(systemModules.length,10);
  const ids=systemModules.map(m=>m.id);
  assert.equal(new Set(ids).size,10);
  for(const m of systemModules){
    assert.ok(m.name.length>5&&m.overview.length>35);
    assert.ok(m.objectives.length>=4);
    assert.ok(m.next.length>=3);
    assert.match(m.source,/^https:\/\/(www\.)?asha\.org\//);
    assert.ok(['3d','study','outline'].includes(m.stage));
  }
  assert.deepEqual(systemModules.filter(x=>x.stage==='3d').map(x=>x.id),['respiration','phonation']);
  assert.equal(systemModules.filter(x=>x.stage==='study').length,0);
});
test('respiration content covers airway, breathing muscles, subglottal pressure and speech coordination',()=>{
 const ids=new Set(respiratoryTerms.map(x=>x.id));
 for(const id of ['diaphragm','external-intercostals','internal-intercostals','rib-cage',
   'lungs','alveoli','bronchi','trachea','subglottal','respiratory-coordination'])
   assert.ok(ids.has(id),id);
 assert.equal(ids.size,10);
 for(const t of respiratoryTerms){assert.ok(t.function.length>35);assert.ok(t.relation.length>30);}
 assert.equal(respiratoryQuestions.length,6);
 for(const q of respiratoryQuestions){
   assert.ok(ids.has(q.answer));
   assert.equal(new Set(q.choices).size,3);
   assert.ok(q.choices.includes(q.answer));
   assert.ok(q.explanation.length>35);
 }
});
test('website links larynx from systems and both are standalone Vite build entries',()=>{
 const html=readFileSync(new URL('../ANATOMY/SLP/systems.html',import.meta.url),'utf8');
 const js=readFileSync(new URL('../ANATOMY/SLP/systems.js',import.meta.url),'utf8');
 const larynx=readFileSync(new URL('../ANATOMY/SLP/index.html',import.meta.url),'utf8');
 const vite=readFileSync(new URL('../vite.config.js',import.meta.url),'utf8');
 assert.match(vite,/systems:'ANATOMY\/SLP\/systems\.html'/);
 assert.match(vite,/lungs:'ANATOMY\/SLP\/lungs\.html'/);
 assert.equal(validateLayout(systemModules),true);
 assert.equal(Object.keys(systemLayout).length,10);
 assert.match(html,/id="systems-network"/);
 assert.match(html,/href="\.\/lungs\.html"/);
 assert.match(html,/href="\.\/index\.html"/);
 assert.match(larynx,/href="\.\/systems\.html"/);
 assert.match(html,/id="resp-diagram"/);
 assert.match(html,/Concept schematic/);
 assert.match(js,/answered=true/);
 assert.match(js,/choice\.disabled=true|button\.disabled=true/);
 assert.doesNotMatch(js,/localStorage|indexedDB|fetch\(/);
 assert.doesNotMatch(html,/<script(?![^>]*type="module")/);
});
