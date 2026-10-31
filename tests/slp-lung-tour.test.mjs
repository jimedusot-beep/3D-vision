import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {lungTourStops,validateLungTour} from '../ANATOMY/SLP/lung-tour.js';
import {lungGroupById} from '../ANATOMY/SLP/lungs-manifest.js';

test('respiratory guided tour uses only real source model IDs and text-scoped statements',()=>{
 assert.equal(validateLungTour(),true);
 assert.equal(lungTourStops.length,5);
 assert.equal(new Set(lungTourStops.map(s=>s.id)).size,5);
 assert.deepEqual(lungTourStops.map(s=>s.id),[
  'FMA7338','FMA26661','FMA7380','FMA26662','FMA7394'
 ]);
 for(const stop of lungTourStops){
  assert.ok(lungGroupById.has(stop.id));
  assert.ok(stop.note.length>=60);
 }
 assert.throws(()=>validateLungTour([lungTourStops[0]]),/five distinct/);
});

test('respiratory guided tour offers keyboard-safe native controls and larynx handoff',()=>{
 const html=readFileSync(new URL('../ANATOMY/SLP/lungs.html',import.meta.url),'utf8');
 const js=readFileSync(new URL('../ANATOMY/SLP/lungs.js',import.meta.url),'utf8');
 for(const id of ['lung-tour-start','lung-tour-active','lung-tour-progress',
  'lung-tour-title','lung-tour-note','lung-tour-prev','lung-tour-next',
  'lung-tour-close','lung-tour-summary'])
  assert.ok(html.includes('id="'+id+'"'),id);
 assert.match(html,/The order is for learning—not a simulation/);
 assert.match(html,/Explore the separate 3D larynx/);
 assert.match(js,/initLungTour\(/);
 assert.match(js,/function focusTourStructure\(/);
 assert.match(js,/lungTour\?\.refresh\(\)/);
});
