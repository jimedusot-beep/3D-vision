import {test} from 'node:test';
import assert from 'node:assert/strict';
import {sourceStudy,getSourceStudy,sourceCategories} from '../ANATOMY/SLP/source-study.js';
import {modelStructureNames} from '../ANATOMY/SLP/reference-mapping.js';
import {guidedLarynxTour} from '../ANATOMY/SLP/guided-tour.js';
import {readFileSync} from 'node:fs';

test('all 20 actual source meshes have unique source-linked teaching summaries',()=>{
  assert.equal(sourceStudy.length,20);
  const ids=sourceStudy.map(s=>s.id);
  assert.equal(new Set(ids).size,20);
  assert.deepEqual(ids.slice().sort(),Object.keys(modelStructureNames).sort());
  for(const item of sourceStudy){
    assert.equal(getSourceStudy(item.id),item);
    assert.ok(item.pronunciation.length>5);
    assert.ok(item.function.length>40);
    assert.ok(item.limitation.length>35);
    assert.ok(Object.hasOwn(sourceCategories,item.category));
    assert.ok(item.sources.length>=1);
    for(const s of item.sources)assert.match(s.url,/^https:\/\/(www\.)?(ncbi\.nlm\.nih\.gov|asha\.org)\//);
  }
  assert.equal(getSourceStudy('unmatched'),null);
  assert.equal(getSourceStudy('left-vocal-fold'),null); // Bilateral source != lateralized whole fold
});
test('critical limitations remain visible in twenty source notes',()=>{
  assert.match(getSourceStudy('vocal-ligaments').limitation,/not entire true folds/i);
  assert.match(getSourceStudy('arytenoid-cartilages').limitation,/both sides/i);
  assert.match(getSourceStudy('thyroid-gland').function,/endocrine/i);
  assert.match(getSourceStudy('posterior-crico-arytenoid').function,/abduct/i);
  assert.match(getSourceStudy('lateral-crico-arytenoid').function,/adduct/i);
  assert.match(getSourceStudy('cricothyroid-muscle').function,/pitch/i);
});
test('guided tour follows sourced structures and no artificial phonation animation',()=>{
  assert.equal(guidedLarynxTour.length,6);
  for(const step of guidedLarynxTour){
    assert.ok(getSourceStudy(step.id));
    assert.ok(step.title.length>10);
    assert.ok(step.question.length>12);
    assert.ok(step.answer.length>25);
  }
  assert.match(guidedLarynxTour[2].answer,/mucosa/i);
  const html=readFileSync(new URL('../ANATOMY/SLP/index.html',import.meta.url),'utf8');
  assert.match(html,/Static concept diagrams/); // The model never pretends to vibrate.
  assert.match(html,/Phonation animation unavailable/);
  assert.match(html,/id="camera-top"/);
  assert.match(html,/id="source-filters"/);
});
