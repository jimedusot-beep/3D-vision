import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseCommand} from '../ANATOMY/SLP/contract.js';
const root=new URL('../',import.meta.url);
const catalog=JSON.parse(readFileSync(new URL('ANATOMY/SLP/structures.json',root),'utf8'));
const html=readFileSync(new URL('ANATOMY/SLP/index.html',root),'utf8');
const viewer=readFileSync(new URL('ANATOMY/SLP/viewer.js',root),'utf8');
const vite=readFileSync(new URL('vite.config.js',root),'utf8');
const ids=new Set(catalog.structures.map(x=>x.id));
const message=(action,more={})=>({source:'herbie',version:1,action,...more});
test('anatomy catalog has stable distinct IDs and descriptive provenance',()=>{
 assert.equal(catalog.schema_version,1);
 assert.equal(ids.size,catalog.structures.length);
 assert.ok(ids.size>=10);
 for(const s of catalog.structures) {
   assert.match(s.id,/^[a-z]+(?:-[a-z]+)*$/);
   assert.ok(s.label.length>5 && s.description.length>25);
 }
 assert.equal(catalog.scientific_status,'simplified_educational_illustration_unvalidated');
 assert.equal(catalog.animation_status,'disabled_pending_validated_geometry_and_review');
});
test('valid known structure command accepted',()=>assert.deepEqual(parseCommand(message('select',{structureId:'left-vocal-fold'}),ids),
 {ok:true,action:'select',structureId:'left-vocal-fold',enabled:undefined,requestId:undefined}));
test('unknown structure refused',()=>assert.equal(parseCommand(message('isolate',{structureId:'made-up'}),ids).reason,'unknown_structure'));
test('unsupported animation and invalid versions refused',()=>{
 assert.equal(parseCommand(message('phonate'),ids).ok,false);
 assert.equal(parseCommand({...message('reset'),version:2},ids).ok,false);
});
test('invalid transparency and labels options refused',()=>{
 assert.equal(parseCommand(message('transparency',{enabled:'yes'}),ids).ok,false);
 assert.equal(parseCommand(message('labels'),ids).ok,false);
});
test('untrusted sources and request IDs refused',()=>{
 assert.equal(parseCommand({...message('reset'),source:'other'},ids).ok,false);
 assert.equal(parseCommand(message('reset',{requestId:'a'.repeat(81)}),ids).ok,false);
});
test('dedicated Vite entry and mechanical workshop preserved',()=>{
 assert.match(vite,/anatomy:'ANATOMY\/SLP\/index\.html'/);
 assert.match(vite,/main:'index\.html'/);
 assert.match(vite,/tripwires:'optical-tripwires\.html'/);
 assert.match(html,/Back to mechanical workshop/);
 assert.match(html,/Phonation animation unavailable/);
});
test('keyboard, touch and origin checks included',()=>{
 assert.match(viewer,/OrbitControls/);
 assert.match(viewer,/ArrowLeft/);
 assert.match(viewer,/ResizeObserver/);
 assert.match(viewer,/event\.origin!==allowedOrigin/);
 assert.match(viewer,/event\.source!==window\.parent/);
 assert.match(viewer,/raycaster\.intersectObjects/);
});
