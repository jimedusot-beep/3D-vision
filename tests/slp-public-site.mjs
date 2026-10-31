// Post-deployment smoke test: inspect the actual public GitHub Pages URL,
// rather than a local dev server or an intercepted file route. Not anatomy
// validation. Models are checked for HTTP availability, GLB v2 header/size,
// and accessible launch links, without rendering unrelated models together.
import {chromium,webkit,devices} from 'playwright';
import assert from 'node:assert/strict';
const base=process.env.BASE_URL||'https://jimedusot-beep.github.io/3D-vision/';
if(!/^https:\/\//.test(base))throw Error('Public HTTPS base URL required');
const url=p=>new URL(p,base).href;
const models=[
 {page:'index.html',asset:'larynx.glb',min:100000},
 {page:'lungs.html',asset:'lungs.glb',bytes:3901260},
 {page:'diaphragm.html',asset:'diaphragm.glb',min:100000},
 {page:'oral.html',asset:'oral.glb',bytes:754496},
 {page:'pharynx.html',asset:'pharynx.glb',bytes:7148788},
 {page:'ear.html',asset:'ear.glb',bytes:1010340},
 {page:'neural.html',asset:'neural.glb',bytes:4650816}
];
const engine=process.env.BROWSER_ENGINE==='webkit'?webkit:chromium;
const browser=await engine.launch(process.env.BROWSER_ENGINE==='webkit'?{}:{args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const ctx=await browser.newContext({...devices['iPhone 13']});
 // The CAD workshop can asynchronously fetch independent robot assets. Do
 // not attribute workshop errors to the Atlas after navigating away from it.
 const workshop=await ctx.newPage();
 const root=await workshop.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
 assert.ok(root?.ok(),'Public main workshop is not reachable');
 assert.equal(await workshop.locator('a[href="./ANATOMY/SLP/systems.html"]').count(),1,
  'Main workshop must launch complete Atlas instead of old larynx-only preview');
 await workshop.close();
 const page=await ctx.newPage();
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const hub=await page.goto(url('ANATOMY/SLP/systems.html'),{waitUntil:'domcontentloaded',timeout:60000});
 assert.ok(hub?.ok(),'Public SLP study hub must load');
 await page.waitForFunction(()=>document.querySelectorAll('.module-card').length===10,null,{timeout:30000});
 assert.equal(await page.locator('#anatomy-launcher .anatomy-launch').count(),7);
 assert.match(await page.locator('#anatomy-launcher').textContent(),/independently sourced 3D anatomy models/i);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 for(const item of models){
  const launchHref='./'+item.page+(item.page==='index.html'?'?view=three':'');
  assert.equal(await page.locator('#anatomy-launcher a[href="'+launchHref+'"]').count(),1);
  const resource=await ctx.request.get(url('ANATOMY/SLP/'+item.page),{timeout:45000});
  assert.equal(resource.status(),200,'Public anatomy HTML missing: '+item.page);
  const body=await resource.text();
  assert.match(body,/<script type="module"/,'Built module missing: '+item.page);
  const explosionId=item.page==='index.html'?'mode-explode':
   item.page==='lungs.html'?'lung-explode':item.page.replace('.html','')+'-explode';
  assert.ok(body.includes('id="'+explosionId+'"'),
   'Public page is missing published Explode 3D button: '+item.page);
  const mesh=await ctx.request.get(url('models/slp/'+item.asset),{timeout:90000});
  assert.equal(mesh.status(),200,'Public anatomy geometry missing: '+item.asset);
  const bytes=await mesh.body();
  assert.equal(bytes.toString('ascii',0,4),'glTF','GLB magic invalid: '+item.asset);
  assert.equal(bytes.readUInt32LE(4),2,'GLB version invalid: '+item.asset);
  assert.equal(bytes.readUInt32LE(8),bytes.length,'GLB length corrupt: '+item.asset);
  if(item.bytes)assert.equal(bytes.length,item.bytes,'Stale/mismatched asset: '+item.asset);
  else assert.ok(bytes.length>=item.min,'Source asset implausibly small: '+item.asset);
 }
 for(const name of ['draco_decoder.js','draco_decoder.wasm','draco_wasm_wrapper.js']){
  const res=await ctx.request.get(url('models/slp/draco/'+name),{timeout:45000});
  assert.equal(res.status(),200,'Missing local Draco decoder: '+name);
  assert.ok((await res.body()).length>1000,'Invalid local decoder: '+name);
 }

 // The original source GLB is deliberately still pinned and published, while
 // the viewer fetches a smaller, independently SHA-verified study-only copy.
 const studyRes=await ctx.request.get(url('models/slp/neural-study-provenance.json'));
 assert.equal(studyRes.status(),200,'Focused neural provenance JSON missing');
 const study=await studyRes.json();
 assert.equal(study.studyMeshDefinitions,74);
 assert.ok(study.modelBytes<study.sourceBytes*.55,'Neural transfer-size optimization absent');
 const optimized=await ctx.request.get(url('models/slp/neural-study.glb'),{timeout:90000});
 assert.equal(optimized.status(),200,'Focused neural GLB missing');
 const binary=await optimized.body();
 assert.equal(binary.length,study.modelBytes,'Focused GLB does not match size manifest');
 assert.equal(binary.toString('ascii',0,4),'glTF');
 const catalog=await ctx.request.get(url('models/slp/neural-source-manifest.json'));
 assert.equal(catalog.status(),200,'Neural source JSON missing');
 const data=await catalog.json();
 assert.equal(data.nodes?.length,437,'Wrong neural source manifest');
 // The physical-device review must be available in the actual published
 // Atlas. Browser emulation tests the workflow, not physical iPhone VoiceOver.
 const manualLink=await ctx.request.get(url('ANATOMY/SLP/iphone-review.html'),{timeout:45000});
 assert.equal(manualLink.status(),200,'Public physical-iPhone review page missing');
 const source=await manualLink.text();
 assert.match(source,/no.*uploaded/i,'Privacy notice missing from iPhone review');
 // Verify the actual built module as a DOM element. Vite fingerprints script
 // filenames on each build, so source-filename or regex guesses are brittle.
 const reviewURL=url('ANATOMY/SLP/iphone-review.html');
 const reviewNav=await page.goto(reviewURL,{waitUntil:'domcontentloaded',timeout:60000});
 assert.ok(reviewNav?.ok(),'Live physical-iPhone review page failed to load');
 const moduleSrc=await page.locator('script[type="module"][src]').last().getAttribute('src');
 assert.ok(moduleSrc&&moduleSrc.endsWith('.js'),'Published iPhone review has no JavaScript module');
 const moduleRes=await ctx.request.get(new URL(moduleSrc,reviewURL).href,{timeout:45000});
 assert.equal(moduleRes.status(),200,'Compiled iPhone review JavaScript is not served');
 await page.waitForFunction(()=>document.querySelectorAll('#lab-tasks .task').length===7,null,{timeout:30000});
 assert.equal(await page.locator('#device-tasks .task').count(),6);
 assert.equal(await page.locator('fieldset').count(),13);
 assert.equal(await page.locator('a.open-lab').count(),7);
 await page.locator('#run-diagnostics').click();
 assert.match(await page.locator('#diagnostics-status').textContent(),/capabilities checked/);
 await page.locator('[data-task="larynx"] input[value="pass"]').check();
 await page.locator('[data-task="voiceover"] input[value="issue"]').check();
 await page.locator('#observations').fill('Manual phone test pending; simulated review UI check only.');
 await page.locator('#make-report').click();
 const report=await page.locator('#report').inputValue();
 assert.match(report,/Larynx \/ phonation: pass/);
 assert.match(report,/VoiceOver screen reader: issue/);
 assert.match(report,/Not an automated hardware or VoiceOver pass/);
 await page.reload({waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.querySelectorAll('#lab-tasks .task').length===7,null,{timeout:30000});
 assert.equal(await page.locator('[data-task="larynx"] input[value="pass"]').isChecked(),true);
 await page.locator('#clear-review').click();
 assert.equal(await page.locator('[data-task="larynx"] input[value="not-tested"]').isChecked(),true);
 assert.equal(await page.evaluate(()=>localStorage.getItem('herbie:slp:iphone-review:v1')),null);
 assert.deepEqual(errors,[]);
 console.log('PASS public Pages: 7 source GLBs, source integrity, 10-topic Atlas and private physical-iPhone review');
}finally{await browser.close();}
