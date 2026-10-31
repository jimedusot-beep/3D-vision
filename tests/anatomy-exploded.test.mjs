import {test} from 'node:test';
import assert from 'node:assert/strict';
import {explosionOffset,explosionVectors,assertExplosionCoverage} from '../ANATOMY/SLP/exploded-study.js';
import {modelStructureNames} from '../ANATOMY/SLP/reference-mapping.js';
import {readFileSync} from 'node:fs';

test('all 20 licensed anatomy groups have manual exploded directions with no duplicates',()=>{
  const ids=Object.keys(modelStructureNames);
  assert.equal(ids.length,20);
  assert.equal(assertExplosionCoverage(ids),true);
  assert.deepEqual(Object.keys(explosionVectors).sort(),ids.sort());
  assert.throws(()=>assertExplosionCoverage(ids.slice(1)),/20/);
  assert.throws(()=>assertExplosionCoverage([...ids,'made-up']),/20/);
});
test('rigid explode math restores original positions exactly at zero',()=>{
  for(const id of Object.keys(modelStructureNames)){
    assert.deepEqual(explosionOffset(id,0,2.5),[0,0,0],id);
    const half=explosionOffset(id,50,2.5),full=explosionOffset(id,100,2.5);
    assert.equal(half.length,3);
    assert.ok(full.some(v=>v!==0),id+' does not move');
    for(let i=0;i<3;i++)assert.ok(Math.abs(half[i]*2-full[i])<1e-10);
  }
});
test('reject invalid amount, scale and unknown anatomy structures',()=>{
  assert.throws(()=>explosionOffset('unknown',25,1),RangeError);
  for(const a of [-1,101,NaN,Infinity])assert.throws(()=>explosionOffset('hyoid-bone',a,1),RangeError);
  for(const scale of [0,-1,NaN])assert.throws(()=>explosionOffset('hyoid-bone',50,scale),RangeError);
});
test('real GLB meshes move as grouped rigid source geometry without being re-scaled',()=>{
 const viewer=readFileSync(new URL('../ANATOMY/SLP/viewer.js',import.meta.url),'utf8');
 assert.match(viewer,/referenceGroups\.get\(node\.userData\.structureId\|\|node\.name\)\.attach\(node\)/);
 assert.match(viewer,/group\.position\.set\(\.\.\.offset\)/);
 assert.match(viewer,/assertExplosionCoverage\(ids\)/);
 assert.doesNotMatch(viewer,/referenceGroups\.get\([^\n]+\.scale\.set/);
});
