import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseCommand,resolveEmbedOrigin} from '../ANATOMY/SLP/contract.js';
import {sideX, SUBJECT_X} from '../ANATOMY/SLP/orientation.js';
const root=new URL('../',import.meta.url);
const catalog=JSON.parse(readFileSync(new URL('ANATOMY/SLP/structures.json',root),'utf8'));
const html=readFileSync(new URL('ANATOMY/SLP/index.html',root),'utf8');
const evidenceHtml=readFileSync(new URL('ANATOMY/SLP/about.html',root),'utf8');
const viewer=readFileSync(new URL('ANATOMY/SLP/viewer.js',root),'utf8');
const discover=readFileSync(new URL('scripts/discover.mjs',root),'utf8');
const vite=readFileSync(new URL('vite.config.js',root),'utf8');
const ids=new Set(catalog.structures.map(x=>x.id));
const message=(action,more={})=>({source:'herbie',version:1,action,...more});
test('anatomical sides use patient coordinates in anterior view',()=>{
 assert.deepEqual(SUBJECT_X,{left:1,right:-1});
 assert.equal(catalog.coordinate_frame.subject_left,'+X');
 assert.equal(catalog.coordinate_frame.subject_right,'-X');
 assert.equal(catalog.coordinate_frame.anterior,'+Z');
 assert.equal(catalog.coordinate_frame.superior,'+Y');
 assert.equal(catalog.coordinate_frame.units,catalog.units);
 assert.equal(sideX('left',.38),.38);
 assert.equal(sideX('right',.38),-.38);
 assert.throws(()=>sideX('up',.5),RangeError);
 assert.throws(()=>sideX('left',-1),RangeError);
 const sideNames=['left','right'];
 for(const side of sideNames)for(const name of ['arytenoid','vocal-fold','posterior-cricoarytenoid','lateral-cricoarytenoid'])
   assert.match(viewer,new RegExp("sideX\\('"+side+"',"));
 assert.match(html,/id="orientation-note"/);
 assert.match(evidenceHtml,/subject's left appears to the viewer's right/);
});
test('anatomy evidence notes are published as a dedicated HTML page',()=>{
 assert.ok(vite.includes("anatomyEvidence:'ANATOMY/SLP/about.html'"));
 assert.ok(html.includes('href="./about.html"'));
 assert.ok(!html.includes('href="./SOURCES.md"'));
 assert.match(evidenceHtml,/Illustrative geometry, not validated medical anatomy/);
 for(const ref of catalog.references)assert.ok(evidenceHtml.includes(ref.url));
});
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
 assert.match(html,/id="study-answer"[^>]*\bhidden\b/);
 assert.match(viewer,/prompt\.source_ids/);
});
test('undergraduate draft objectives trace all recall items to educational references',()=>{
  assert.equal(catalog.learning_objectives.length,4);
  assert.equal(catalog.review_prompts.length,12);
  assert.equal(catalog.course.status,'draft_unreviewed_formative_material');
  const objectiveIds=new Set(catalog.learning_objectives.map(o=>o.id));
  assert.equal(objectiveIds.size,catalog.learning_objectives.length);
  const sourceIds=new Set(catalog.references.map(r=>r.id));
  for(const objective of catalog.learning_objectives) {
    assert.ok(objective.statement.length>60);
    assert.ok(objective.source_ids.length);
    for(const id of objective.source_ids)assert.ok(sourceIds.has(id));
    assert.ok(catalog.review_prompts.some(p=>p.objective_id===objective.id));
  }
  for(const prompt of catalog.review_prompts){
    assert.ok(objectiveIds.has(prompt.objective_id),prompt.id+' lacks objective');
    assert.ok(['recall','compare','application'].includes(prompt.level));
    assert.ok(prompt.explanation.length>45);
  }
  assert.ok(html.includes('id="learning-objectives"'));
  assert.ok(html.includes('id="study-progress"'));
  assert.ok(html.includes('id="study-again" disabled'));
  assert.ok(html.includes('id="study-recognized" disabled'));
  assert.ok(viewer.includes('createPracticeSession(catalog.review_prompts)'));
  assert.ok(!viewer.includes('localStorage'));
  assert.ok(!viewer.includes('sessionStorage'));
  assert.ok(!viewer.includes('indexedDB'));
});
test('BodyParts3D source IDs are indexed candidates, not imported or clinically validated meshes',()=>{
 assert.equal(catalog.mesh_candidate_catalog.status,'index_entries_checked_no_mesh_files_imported');
 assert.ok(catalog.mesh_candidate_catalog.index_url.endsWith('isa_parts_list_e.txt'));
 assert.ok(catalog.mesh_candidate_catalog.license_url.startsWith('https://'));
 const found=catalog.structures.filter(s=>s.candidate_model.status==='indexed_not_imported_unvalidated');
 const unmatched=catalog.structures.filter(s=>s.candidate_model.status==='exact_structure_not_identified');
 assert.equal(found.length,8);
 assert.deepEqual(unmatched.map(s=>s.id).sort(),['left-vocal-fold','right-vocal-fold']);
 const known={
  'thyroid-cartilage':['FMA55099','BP7901'],
  'cricoid-cartilage':['FMA9615','BP9117'],
  'left-arytenoid':['FMA55114','BP8314'],
  'right-arytenoid':['FMA55113','BP9249'],
  'left-posterior-cricoarytenoid':['FMA46578','BP7822'],
  'right-posterior-cricoarytenoid':['FMA46577','BP8360'],
  'left-lateral-cricoarytenoid':['FMA46581','BP8828'],
  'right-lateral-cricoarytenoid':['FMA46580','BP8618']
 };
 for(const s of found){
   const expected=known[s.id];
   assert.ok(expected,s.id+' missing official-index mapping');
   assert.deepEqual([s.candidate_model.concept_id,s.candidate_model.representation_id],expected);
   assert.ok(s.candidate_model.source_label.includes(s.id.startsWith('left')?'left':s.id.startsWith('right')?'right':'cartilage')||s.id==='thyroid-cartilage'||s.id==='cricoid-cartilage');
 }
 for(const s of unmatched)assert.match(s.candidate_model.note,/NOT equivalent/);
});
test('embed parent origins permit canonical HTTPS or loopback, rejecting ambiguous URL parts',()=>{
 const fallback='https://3dvision.test';
 assert.equal(resolveEmbedOrigin(null,fallback),fallback);
 assert.equal(resolveEmbedOrigin('https://companion.example',fallback),'https://companion.example');
 assert.equal(resolveEmbedOrigin('https://companion.example:443/',fallback),'https://companion.example');
 assert.equal(resolveEmbedOrigin('http://localhost:4173',fallback),'http://localhost:4173');
 assert.equal(resolveEmbedOrigin('http://127.0.0.1:4173/',fallback),'http://127.0.0.1:4173');
 assert.equal(resolveEmbedOrigin('https://example.com@evil.example/',fallback),fallback);
 for(const raw of [
  'http://public.example',
  'https://companion.example/path',
  'https://companion.example/?token=abc',
  'https://companion.example/#fragment',
  'https://user:secret@companion.example',
  'javascript:alert(1)',
  '/relative',
  '::::',
  'x'.repeat(2049)
 ])assert.equal(resolveEmbedOrigin(raw,fallback),fallback,raw.slice(0,35));
 assert.match(viewer,/resolveEmbedOrigin\(query.get\('embedOrigin'\),location.origin\)/);
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
