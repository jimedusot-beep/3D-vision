import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {lungGroups,lungRegions} from '../ANATOMY/SLP/lungs-manifest.js';
import {lungPracticeQuestions,lungPracticeWarmup,regionChoices,validateLungPractice} from '../ANATOMY/SLP/lung-practice.js';

test('practice questions cover every one of the 20 pinned respiratory source IDs',()=>{
 assert.equal(validateLungPractice(),true);
 assert.equal(lungPracticeQuestions.length,20);
 assert.deepEqual(lungPracticeQuestions.map(q=>q.id),lungGroups.map(group=>group.id));
 for(const question of lungPracticeQuestions){
  const original=lungGroups.find(group=>group.id===question.id);
  assert.equal(question.name,original.name);
  assert.equal(question.answer,original.region);
  assert.equal(question.description,original.description);
 }
});
test('quick warmup visits all six model regions once',()=>{
 assert.equal(lungPracticeWarmup.length,6);
 assert.deepEqual(new Set(lungPracticeWarmup.map(q=>q.answer)),new Set(Object.keys(lungRegions)));
});
test('region choices are uniquely sourced, include the answer exactly once and vary position',()=>{
 const positions=new Set();
 for(const question of lungPracticeQuestions){
  const options=regionChoices(question);
  assert.equal(options.length,4);
  assert.equal(new Set(options.map(c=>c.id)).size,4);
  assert.ok(options.every(c=>c.label===lungRegions[c.id]));
  positions.add(options.findIndex(c=>c.id===question.answer));
 }
 assert.deepEqual(positions,new Set([0,1,2,3]));
 assert.throws(()=>regionChoices({...lungPracticeQuestions[0],id:'FMA00000'}),/manifest/);
 assert.throws(()=>regionChoices({...lungPracticeQuestions[0],answer:'not-a-region'}),/region/);
});
test('respiratory practice UI has native choices, live feedback and 3D/text integration',()=>{
 const html=readFileSync(new URL('../ANATOMY/SLP/lungs.html',import.meta.url),'utf8');
 const js=readFileSync(new URL('../ANATOMY/SLP/lungs.js',import.meta.url),'utf8');
 const tour=readFileSync(new URL('../ANATOMY/SLP/lung-tour.js',import.meta.url),'utf8');
 const practice=readFileSync(new URL('../ANATOMY/SLP/lung-practice.js',import.meta.url),'utf8');
 for(const id of ['lung-practice','lung-practice-quick','lung-practice-full','lung-practice-active',
  'lung-practice-progress','lung-practice-question','lung-practice-options','lung-practice-feedback',
  'lung-practice-next','lung-practice-exit','lung-practice-summary'])
  assert.ok(html.includes('id="'+id+'"'),id);
 assert.match(js,/initLungPractice\(/);
 assert.match(js,/selectStructure:select/);
 assert.match(practice,/selectStructure\(question\.id\)/);
 assert.match(practice,/focusStructure\(question\.id\)/);
 assert.match(practice,/if\(index<0\|\|!answered\)return/);
 assert.match(tour,/if\(stage\.dataset\.practice!=='off'\)/);
 assert.doesNotMatch(practice,/localStorage|indexedDB|fetch\(|navigator\.sendBeacon/);
});
