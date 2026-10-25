import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {tripwireGuide,guideStep,guideIndex,validateGuide,GUIDE_VERSION} from '../src/tripwire-build-guides.js';
import {opticalExample} from '../src/optical-tripwire-models.js';

for(const [exp,n,base] of [['B',6,'mcgruber-visible-b'],['C',7,'mcgruber-infrared-c']]){
 test(exp+' lessons: all highlighted parts exist and stages have wiring / physical test gates',()=>{
  const guide=tripwireGuide(exp);
  assert.equal(guide.steps.length,n);
  for(const view of ['assembled','exploded']){
   const model=opticalExample(base+'-'+view);
   const ids=model.objects.map(o=>o.name.split(' · ')[0]);
   assert.equal(validateGuide(guide,ids),true);
  }
  const keys=guide.steps.map(s=>s.key);
  assert.equal(new Set(keys).size,n);
  assert.ok(guide.steps.every(s=>s.checkpoint.task&&s.checkpoint.observation&&s.checkpoint.record));
  assert.ok(guide.steps.every(s=>s.parts.every(id=>id.startsWith('TW-'+exp+'-'))));
  assert.ok(guide.steps.some(s=>s.connections.length>=3));
  assert.ok(guide.steps.every(s=>s.gate!=='passed'&&s.gate!=='verified'));
  assert.equal(GUIDE_VERSION,1);
 });
}
test('B stays genuinely unbuilt: red LED unpowered, missing front end, explicit physical stop',()=>{
 const guide=tripwireGuide('B');
 const sensor=guide.steps.find(s=>s.key==='sensor');
 const missing=guide.steps.find(s=>s.key==='missing-amplifier');
 assert.match(sensor.instructions.join(' '),/DC millivolts/i);
 assert.match(sensor.connections.map(c=>c.from).join(' '),/Unpowered RED/);
 assert.ok(sensor.connections.every(c=>c.kind==='measurement'));
 assert.equal(missing.gate,'BLOCKED');
 assert.ok(missing.connections.every(c=>c.kind==='missing'));
 assert.match(missing.caution,/Do not bridge/i);
 assert.match(guide.notice,/NOT a finished automatic alarm/);
 assert.match(guide.steps.at(-1).checkpoint.observation,/targets, not results/);
});
test('C wiring is vendor-specific, current-limited, separate grounds and polarity-checked',()=>{
 const guide=tripwireGuide('C');
 const tx=guide.steps.find(s=>s.key==='emitter-power');
 const rx=guide.steps.find(s=>s.key==='receiver-power');
 const pull=guide.steps.find(s=>s.key==='pull-up');
 const lamp=guide.steps.find(s=>s.key==='indicator');
 assert.match(tx.connections[0].from,/RED/);
 assert.match(tx.connections[0].to,/5 V/);
 assert.match(rx.connections[2].to,/OUT/);
 assert.match(tx.connections[1].note,/No separate wire/);
 assert.match(pull.connections[0].to,/10 kΩ/);
 assert.match(pull.checkpoint.observation,/HIGH.*LOW.*HIGH/);
 assert.match(lamp.connections[0].to,/1 kΩ/);
 assert.match(lamp.connections[1].to,/anode/);
 assert.match(lamp.connections[2].from,/cathode/);
 assert.match(lamp.connections[2].to,/OUT/);
 assert.match(lamp.instructions.join(' '),/only after the HIGH\/LOW test passed/i);
 assert.match(guide.notice,/documented by the vendor, not measured/);
});
test('Guide URLs reject invalid step numbers instead of navigating to unknown content',()=>{
 assert.equal(guideIndex(null,7),0);
 for(const input of ['x','-1','0','999','1e2','../../1','1<script>',''])assert.equal(guideIndex(input,7),0);
 assert.equal(guideIndex('1',7),0);
 assert.equal(guideIndex('7',7),6);
 assert.equal(guideIndex('8',7),0);
 assert.equal(guideStep('C',6).key,'reliability');
 assert.equal(guideStep('B',6),null);
 assert.equal(tripwireGuide('D'),null);
 assert.equal(validateGuide(tripwireGuide('B'),['TW-B-01']),false);
});
test('Guide is silent and cannot claim physical measurements via local study progress',async()=>{
 const ui=await readFile(new URL('../src/tripwire-guide-ui.js',import.meta.url),'utf8');
 const data=await readFile(new URL('../src/tripwire-build-guides.js',import.meta.url),'utf8');
 for(const source of [ui,data]){
  for(const pattern of [/AudioContext/,/\.play\(/,/navigator\.mediaDevices/,/fetch\(/,/setInterval\(/,/\btestPass\b/i]){
   assert.doesNotMatch(source,pattern);
  }
 }
 assert.match(ui,/not tested/);
 assert.match(ui,/NOT recorded/);
 assert.match(ui,/physical checks still UNVERIFIED/);
});
