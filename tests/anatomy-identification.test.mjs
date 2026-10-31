import {test} from 'node:test';
import assert from 'node:assert/strict';
import {identificationClues,buildIdentificationDeck,checkIdentification} from '../ANATOMY/SLP/identification-challenge.js';
import {sourceStudy} from '../ANATOMY/SLP/source-study.js';
import {modelStructureNames} from '../ANATOMY/SLP/reference-mapping.js';
import {readFileSync} from 'node:fs';

const deck=buildIdentificationDeck(sourceStudy,modelStructureNames);
test('every source anatomy group has one challenging, source-backed prompt and four unique choices',()=>{
  assert.equal(deck.length,20);
  assert.equal(new Set(deck.map(q=>q.id)).size,20);
  assert.equal(Object.keys(identificationClues).length,20);
  for(const q of deck){
    assert.equal(q.clue,identificationClues[q.id]);
    assert.equal(q.options.length,4);
    assert.equal(new Set(q.options).size,4,q.id);
    assert.ok(q.options.includes(q.answer));
    assert.ok(q.clue.length>50);
    assert.ok(q.source.sources.length>0);
    assert.equal(checkIdentification(q,q.answer),true);
    for(const wrong of q.options.filter(id=>id!==q.answer))
      assert.equal(checkIdentification(q,wrong),false);
  }
});
test('incorrect / unknown response options cannot score as correct',()=>{
  assert.throws(()=>checkIdentification(deck[0],'not-a-choice'),RangeError);
  assert.throws(()=>buildIdentificationDeck(sourceStudy.slice(1),modelStructureNames),/20/);
  assert.throws(()=>buildIdentificationDeck(sourceStudy,{}),/match/);
});
test('challenge is accessible without WebGL and stores no persistent personal data',()=>{
  const code=readFileSync(new URL('../ANATOMY/SLP/viewer.js',import.meta.url),'utf8');
  const html=readFileSync(new URL('../ANATOMY/SLP/index.html',import.meta.url),'utf8');
  for(const id of ['identify-clue','identify-options','identify-feedback','identify-explanation',
    'identify-references','identify-next','identify-restart','identify-find'])
    assert.ok(html.includes('id="'+id+'"'));
  assert.match(code,/function answerChallenge\(id\)/);
  assert.match(code,/if\(challengeAnswered\)return/);
  assert.match(code,/if\(!renderer\|\|graphicsLost\)openMobilePanel\('panel-details',true\)/);
  assert.ok(!code.includes('localStorage'));
  assert.ok(!code.includes('indexedDB'));
});
