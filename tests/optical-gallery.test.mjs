import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {exampleModel} from '../src/example-models.js';

const root=new URL('../',import.meta.url);
const html=await readFile(new URL('optical-tripwires.html',root),'utf8');
const main=await readFile(new URL('index.html',root),'utf8');
const vite=await readFile(new URL('vite.config.js',root),'utf8');
const doc=await readFile(new URL('EXPERIMENTS/003_MCGRUBER_SILENT_TRIPWIRES/README.md',root),'utf8');

test('B/C gallery is a real Vite-built page linked from the workshop home',()=>{
 assert.match(main,/href="\.\/optical-tripwires\.html"/);
 assert.match(vite,/tripwires:'optical-tripwires\.html'/);
 assert.match(html,/<section class="card b"/);
 assert.match(html,/<section class="card c"/);
 assert.match(html,/no sound/i);
 assert.match(html,/NOT.*(?:automatic|verified|proven)|not.*verified/i);
 assert.doesNotMatch(html,/<script\b/i);
});
test('all four 3D gallery links are allowlisted and lead to individually generated concepts',()=>{
 for(const id of [
  'mcgruber-visible-b-assembled','mcgruber-visible-b-exploded',
  'mcgruber-infrared-c-assembled','mcgruber-infrared-c-exploded'
 ]){
  assert.ok(exampleModel(id),id);
  assert.ok(html.includes('./?example='+id));
  assert.ok(doc.includes('?example='+id));
 }
 assert.match(html,/mcgruber-visible-b-assembled&amp;beam=blocked/);
 assert.match(html,/mcgruber-infrared-c-assembled&amp;beam=blocked/);
});
test('B missing amplifier and C simulated IR output cannot be mistaken for real hardware qualification',()=>{
 assert.match(doc,/\*\*Unresolved:\*\*/);
 assert.match(doc,/amplifier\/threshold/i);
 assert.match(doc,/illustrative/i);
 assert.match(doc,/not measured/i);
 assert.match(doc,/Hardware B next:/);
 assert.match(html,/simulat/i);
 assert.match(html,/no laser/i);
 assert.match(html,/not.*(?:print|verified|measured)/i);
});
