import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseCommand} from '../ANATOMY/SLP/contract.js';
const root=new URL('../',import.meta.url);
const catalog=JSON.parse(readFileSync(new URL('ANATOMY/SLP/structures.json',root),'utf8'));
const html=readFileSync(new URL('ANATOMY/SLP/index.html',root),'utf8');
const viewer=readFileSync(new URL('ANATOMY/SLP/viewer.js',root),'utf8');
const discover=readFileSync(new URL('scripts/discover.mjs',root),'utf8');
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
test('every anatomy note links to explicit HTTPS educational sources, never to validated geometry',()=>{
 assert.equal(catalog.references.length,3);
 const references=new Map(catalog.references.map(ref=>[ref.id,ref]));
 assert.equal(references.size,catalog.references.length);
 assert.deepEqual(new Set(catalog.source_ids),new Set(references.keys()));
 for(const ref of catalog.references) {
   const url=new URL(ref.url);
   assert.equal(url.protocol,'https:');
   assert.ok(['openstax.org','www.ncbi.nlm.nih.gov'].includes(url.hostname));
   assert.ok(ref.label.length>=12);
 }
 for(const structure of catalog.structures) {
   assert.ok(structure.source_ids.length>0,structure.id+' missing source');
   for(const id of structure.source_ids)assert.ok(references.has(id),structure.id+' has unknown reference '+id);
 }
 assert.match(html,/references support the written anatomy note|anatomy note &amp; references/);
 assert.match(viewer,/NOT the approximate 3D shape/);
 assert.match(viewer,/noopener noreferrer/);
});
test('referenced study prompts are complete, unique and text-only',()=>{
 const names=new Set();
 const sources=new Set(catalog.references.map(r=>r.id));
 assert.ok(catalog.review_prompts.length>=6);
 for(const prompt of catalog.review_prompts) {
   assert.ok(!names.has(prompt.id),'Duplicate study prompt');
   names.add(prompt.id);
   assert.ok(ids.has(prompt.structure_id));
   assert.ok(prompt.question.length>20 && prompt.answer.length>8);
   assert.ok(prompt.source_ids.length>0);
   for(const id of prompt.source_ids)assert.ok(sources.has(id));
 }
 assert.equal(catalog.coverage.omitted_structures.length>=8,true);
 assert.match(catalog.coverage.statement,/NOT absent/);
 assert.match(html,/id="study-question"/);
 assert.match(html,/id="study-answer" hidden/);
 assert.match(viewer,/prompt\.source_ids/);
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
test('educational anatomy files cannot be auto-listed as mechanical parts or print assets',()=>{
 assert.match(discover,/\['node_modules'[^\n]*'ANATOMY'\]/);
 assert.doesNotMatch(vite,/anatomy.*input.*models/);
});
test('older devices retain study mode when WebGL is unavailable',()=>{
 assert.match(viewer,/new THREE\.WebGLRenderer/);
 assert.match(viewer,/catch \{/);
 assert.match(viewer,/webgl-fallback/);
 assert.match(viewer,/text-based anatomy study is ready/);
 assert.match(viewer,/MathUtils\.clamp\(offset\.length\(\)\*factor,2\.5,16\)/);
});
test('keyboard, touch and origin checks included',()=>{
 assert.match(viewer,/OrbitControls/);
 assert.match(viewer,/ArrowLeft/);
 assert.match(viewer,/ResizeObserver/);
 assert.match(viewer,/event\.origin!==allowedOrigin/);
 assert.match(viewer,/event\.source!==window\.parent/);
 assert.match(viewer,/raycaster\.intersectObjects/);
});
