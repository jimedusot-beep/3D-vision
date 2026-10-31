import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const labs=[
 {page:'index.html',asset:'larynx.glb'},
 {page:'lungs.html',asset:'lungs.glb'},
 {page:'diaphragm.html',asset:'diaphragm.glb'},
 {page:'oral.html',asset:'oral.glb'},
 {page:'pharynx.html',asset:'pharynx.glb'},
 {page:'ear.html',asset:'ear.glb'},
 {page:'neural.html',asset:'neural.glb'}
];
test('one reachable anatomy launcher links all seven source-derived modules',()=>{
 const html=read('ANATOMY/SLP/systems.html');
 const home=read('index.html');
 assert.equal((html.match(/class="anatomy-launch"/g)||[]).length,7);
 for(const lab of labs){
  assert.ok(html.includes('class="anatomy-launch" href="./'+lab.page+'"'),'Missing '+lab.page);
  assert.ok(read('ANATOMY/SLP/'+lab.page).includes('type="module"'),'Not a standalone Vite page: '+lab.page);
 }
 assert.match(home,/href="\.\/ANATOMY\/SLP\/systems\.html"/);
 assert.doesNotMatch(home,/SLP Anatomy Lab \(illustrative\)/);
 assert.match(html,/not one spatially registered human body/i);
});
test('deployment includes all seven viewers, related integrity checks and post-release probes',()=>{
 const vite=read('vite.config.js');
 const pages=read('.github/workflows/pages.yml');
 const live=read('.github/workflows/live-site.yml');
 const smoke=read('tests/slp-public-site.mjs');
 assert.match(vite,/base:'\.\/'/);
 for(const lab of labs){
  assert.ok(vite.includes("'ANATOMY/SLP/"+lab.page+"'"),'Vite build omits '+lab.page);
  assert.ok(smoke.includes("asset:'"+lab.asset+"'"),'Public GLB test missing '+lab.asset);
 }
 for(const model of ['lungs','diaphragm','oral','pharynx','ear','neural'])
  assert.ok(pages.includes('node tests/slp-'+model+'-browser.mjs'),'Pages predeploy lacks model gate: '+model);
 assert.match(live,/node tests\/slp-public-site\.mjs/);
 assert.match(live,/BROWSER_ENGINE=webkit node tests\/slp-public-site\.mjs/);
 assert.match(pages,/actions\/deploy-pages@v4/);
});
test('no merger of individually transformed anatomy geometry is falsely claimed',()=>{
 const html=read('ANATOMY/SLP/systems.html');
 const license=read('THIRD_PARTY_NOTICES.md');
 assert.match(html,/independently sourced 3D anatomy models/i);
 assert.match(license,/CC BY-SA 2\.1 Japan/);
 assert.match(license,/CC BY-SA 4\.0/);
 assert.match(license,/seven source-model coordinate spaces have not been registered/i);
});
