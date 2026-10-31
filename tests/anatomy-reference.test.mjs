import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {model,validAsset} from '../scripts/prepare-anatomy-reference.mjs';
import {modelIdForLesson,lessonForModelId,modelStructureNames,modelSelectionNote} from '../ANATOMY/SLP/reference-mapping.js';

test('real anatomy model provenance is pinned and an honest separate license',()=>{
  assert.equal(model.repo,'organui/larynx-3d');
  assert.match(model.commit,/^[0-9a-f]{40}$/);
  assert.equal(model.sha256,'d07598a36e0177c0a1c87c28df145500d3e1766a9f02b58d003bd85e775202df');
  assert.equal(model.bytes,5257920);
  assert.equal(model.license,'CC-BY-SA-2.1-JP');
  assert.equal(validAsset(Buffer.alloc(16)),false);
  assert.equal(Object.keys(modelStructureNames).length,20);
});
test('bilateral structures and vocal ligaments never claim an exact side or complete vocal folds',()=>{
  assert.equal(modelIdForLesson('right-arytenoid'),'arytenoid-cartilages');
  assert.equal(modelIdForLesson('left-arytenoid'),'arytenoid-cartilages');
  assert.equal(modelIdForLesson('left-vocal-fold'),'vocal-ligaments');
  assert.equal(modelIdForLesson('right-vocal-fold'),'vocal-ligaments');
  assert.equal(lessonForModelId('arytenoid-cartilages'),null);
  assert.equal(lessonForModelId('vocal-ligaments'),null);
  assert.equal(lessonForModelId('thyroid-cartilage'),'thyroid-cartilage');
  assert.match(modelSelectionNote('vocal-ligaments'),/NOT.*complete/);
  assert.match(modelSelectionNote('arytenoid-cartilages'),/BILATERAL/);
  assert.equal(modelIdForLesson('not-known'),null);
});
test('verified local model, if prepared, must match the upstream hash',async()=>{
  try{
    const bytes=await readFile(new URL('../public/models/slp/larynx.glb',import.meta.url));
    assert.ok(validAsset(bytes),'Cached anatomy model must be pinned, not altered');
  }catch(e){if(e.code!=='ENOENT')throw e;}
});
