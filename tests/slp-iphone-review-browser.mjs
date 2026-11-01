// A real browser exercises the private field-review UI; passing these checks
// never substitutes for physical Safari, VoiceOver, heat or battery testing.
import {chromium,webkit,devices} from 'playwright';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

const engineName=process.env.BROWSER_ENGINE==='webkit'?'webkit':'chromium';
const engine=engineName==='webkit'?webkit:chromium;
const browser=await engine.launch(engineName==='chromium'?
 {args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']}:{});
const origin='https://3dvision.test';
try{
 const ctx=await browser.newContext({...devices['iPhone 13']});
 await ctx.route(origin+'/**',async route=>{
  const pathname=decodeURIComponent(new URL(route.request().url()).pathname);
  const file=path.resolve('dist','.'+pathname);
  if(!file.startsWith(path.resolve('dist')+path.sep))return route.fulfill({status:403});
  try{
   const body=await readFile(file);
   const mime={'.js':'text/javascript','.html':'text/html','.css':'text/css',
    '.json':'application/json'}[path.extname(file)]||'application/octet-stream';
   return route.fulfill({body,contentType:mime});
  }catch{return route.fulfill({status:404});}
 });
 const page=await ctx.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin+'/ANATOMY/SLP/systems.html');
 const link=page.getByRole('link',{name:'private iPhone testing checklist'});
 assert.equal(await link.count(),1,'Atlas launch link to physical-device testing is missing');
 await link.click();
 await page.waitForURL('**/ANATOMY/SLP/iphone-review.html');
 assert.match(await page.title(),/Real iPhone Atlas Review/);
 assert.equal(await page.locator('#lab-tasks .task').count(),7);
 assert.equal(await page.locator('#device-tasks .task').count(),6);
 assert.equal(await page.locator('fieldset').count(),13);
 for(const href of ['./index.html?view=three','./lungs.html','./diaphragm.html',
  './oral.html','./pharynx.html','./ear.html','./neural.html']){
  assert.equal(await page.locator('.open-lab[href="'+href+'"]').count(),1);
 }
 assert.equal(await page.locator('#progress').textContent().then(x=>x.includes('0 of 13 checks')),true);
 await page.locator('#run-diagnostics').click();
 assert.match(await page.locator('#diagnostics-status').textContent(),/capabilities checked/);
 assert.equal(await page.locator('#diagnostics dt').count(),5);
 await page.locator('[data-task="larynx"] input[value="pass"]').check();
 await page.locator('[data-task="neural"] input[value="issue"]').check();
 assert.equal(await page.locator('[data-issue-detail="neural"]').isVisible(),true);
 assert.equal(await page.locator('[data-issue-detail="larynx"]').isHidden(),true);
 await page.locator('[data-issue-kind="neural"]').selectOption('explode');
 await page.locator('[data-issue-note="neural"]').fill('Explode does not separate the model in 3D.');
 await page.locator('[data-task="oral"] input[value="issue"]').check();
 assert.equal(await page.locator('[data-issue-kind="oral"]').inputValue(),'');
 await page.locator('[data-task="oral"] input[value="not-tested"]').check();
 assert.equal(await page.locator('[data-issue-detail="oral"]').isHidden(),true);
 await page.locator('[data-task="voiceover"] input[value="issue"]').check();
 await page.locator('#device-note').fill('iPhone 13, manually entered');
 await page.locator('#load-time').fill('12.5');
 await page.locator('#observations').fill('Neural rotation worked; VoiceOver has a focus order issue.');
 assert.match(await page.locator('#progress').textContent(),/3 of 13 checks recorded; 2 marked as issues/);
 // Local persistence is necessary when the reviewer visits a lab and goes Back.
 await page.goto(origin+'/ANATOMY/SLP/lungs.html',{waitUntil:'domcontentloaded'});
 await page.goBack({waitUntil:'domcontentloaded'});
 await page.waitForURL('**/ANATOMY/SLP/iphone-review.html');
 assert.equal(await page.locator('[data-task="larynx"] input[value="pass"]').isChecked(),true);
 assert.equal(await page.locator('[data-task="voiceover"] input[value="issue"]').isChecked(),true);
 assert.equal(await page.locator('#load-time').inputValue(),'12.5');
 assert.equal(await page.locator('[data-issue-kind="neural"]').inputValue(),'explode');
 assert.equal(await page.locator('[data-issue-note="neural"]').inputValue(),'Explode does not separate the model in 3D.');
 await page.reload();
 assert.equal(await page.locator('[data-task="neural"] input[value="issue"]').isChecked(),true);
 await page.locator('#make-report').click();
 const report=await page.locator('#report').inputValue();
 for(const required of ['manual','iPhone 13, manually entered','Larynx / phonation: pass',
  'Cranial nerves / brainstem: issue','VoiceOver screen reader: issue','12.5 seconds',
  'Neural rotation worked','Problem: Explode / Reassemble is wrong',
  'Observation: Explode does not separate the model in 3D.']){
  assert.ok(report.toLowerCase().includes(required.toLowerCase()),'Missing report section '+required);
 }
 assert.doesNotMatch(report,/navigator\.userAgent|hardware identifier\s*:/);
 // Test dynamic accessibility, not actual VoiceOver screen reading.
 await page.setViewportSize({width:320,height:640});
 await page.evaluate(()=>document.documentElement.style.fontSize='32px');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,
  '200% text at narrow iPhone width should not cause horizontal page clipping');
 assert.equal(await page.locator('#make-report').isVisible(),true);
 await page.locator('#clear-review').click();
 assert.equal(await page.locator('#observations').inputValue(),'');
 assert.equal(await page.locator('#report').inputValue(),'');
 assert.equal(await page.locator('[data-task="neural"] input[value="not-tested"]').isChecked(),true);
 assert.equal(await page.locator('[data-issue-detail="neural"]').isHidden(),true);
 assert.equal(await page.locator('[data-issue-kind="neural"]').inputValue(),'');
 assert.equal(await page.locator('[data-issue-note="neural"]').inputValue(),'');
 assert.equal(await page.evaluate(()=>localStorage.getItem('herbie:slp:iphone-review:v1')),null);
 assert.deepEqual(errors,[]);
 console.log('PASS '+engineName+' on-device-review protocol, all seven lab links, local persistence, diagnostics, 200% text and safe report clearing');
 await ctx.close();
}finally{await browser.close();}
