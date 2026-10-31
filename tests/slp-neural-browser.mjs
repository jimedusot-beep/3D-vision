import {chromium,webkit,devices} from 'playwright';
import assert from 'node:assert/strict';
import {readFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {neuralParts,neuralLessons,teachingStepId,verifyNeuralManifest} from '../ANATOMY/SLP/neural-manifest.js';
import {validNeuralAsset} from '../scripts/prepare-slp-neural.mjs';
import {neuralPracticeQuestions,practiceChoices} from '../ANATOMY/SLP/neural-practice.js';

const engine=process.env.BROWSER_ENGINE==='webkit'?webkit:chromium;
const name=process.env.BROWSER_ENGINE==='webkit'?'webkit':'chromium';
const browser=await engine.launch(name==='chromium'
 ?{args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']}:{});
const origin='https://3dvision.test',errors=[];
try{
 const binary=await readFile('dist/models/slp/neural.glb'),manifestData=await readFile('dist/models/slp/neural-source-manifest.json');
 assert.equal(validNeuralAsset(binary,'model'),true,'Deployed 3D source must match Git-pinned model');
 assert.equal(validNeuralAsset(manifestData,'manifest'),true,'Deployed JSON source must match Git-pinned manifest');
 assert.equal(verifyNeuralManifest(JSON.parse(manifestData.toString('utf8')).nodes),true);
 for(const decoder of ['draco_decoder.js','draco_decoder.wasm','draco_wasm_wrapper.js'])
  assert.ok((await readFile('dist/models/slp/draco/'+decoder)).length>1000,'Missing local '+decoder);
 // GLB JSON extras are source IDs on the original nodes. Exclude unrelated cortex/tracts.
 const length=binary.readUInt32LE(12);
 assert.equal(binary.toString('ascii',16,20),'JSON');
 const gltf=JSON.parse(binary.toString('utf8',20,20+length));
 const sourceIds=new Set((gltf.nodes||[]).map(n=>n.extras?.bx_id).filter(id=>id!=null));
 for(const p of neuralParts)assert.ok(sourceIds.has(p.id),'Source GLB does not contain neural record '+p.id);
 const ctx=await browser.newContext({...devices['iPhone 13']});
 await ctx.route(origin+'/**',async route=>{
  const requestPath=decodeURIComponent(new URL(route.request().url()).pathname);
  const file=path.resolve('dist','.'+requestPath);
  if(!file.startsWith(path.resolve('dist')+path.sep))return route.fulfill({status:403});
  try{
   const bytes=await readFile(file);
   const type={'.html':'text/html','.js':'text/javascript','.css':'text/css','.glb':'model/gltf-binary',
    '.json':'application/json','.wasm':'application/wasm'}[path.extname(file)]||'application/octet-stream';
   return route.fulfill({body:bytes,contentType:type});
  }catch{return route.fulfill({status:404});}
 });
 const page=await ctx.newPage();
 page.on('pageerror',error=>errors.push(error.message));
 await page.goto(origin+'/ANATOMY/SLP/neural.html');
 await page.waitForFunction(()=>['ready','unavailable'].includes(document.querySelector('#neural-stage')?.dataset.modelStatus),
  null,{timeout:75000});
 assert.equal(await page.locator('#neural-select option').count(),75);
 assert.equal(await page.locator('#neural-filters input').count(),2);
 assert.equal(await page.locator('#neural-side option').count(),4);
 await page.locator('#neural-search').fill('vagus');
 assert.equal(await page.locator('#neural-select option').count(),3);
 assert.match(await page.locator('#neural-search-count').textContent(),/2 of 74/);
 await page.locator('#neural-side').selectOption('left');
 assert.equal(await page.locator('#neural-select option').count(),2);
 const leftVagus=neuralParts.find(p=>p.name==='Vagus nerve (X)'&&p.side==='left');
 await page.locator('#neural-select').selectOption(String(leftVagus.id));
 assert.match(await page.locator('#neural-note-text').textContent(),/laryngeal functions/);
 await page.locator('#neural-side').selectOption('right');
 assert.equal(await page.locator('#neural-select').inputValue(),'');
 assert.equal(await page.locator('#neural-select option').count(),2);
 await page.locator('#neural-all').click();
 assert.equal(await page.locator('#neural-search').inputValue(),'');
 assert.equal(await page.locator('#neural-side').inputValue(),'both');
 assert.equal(await page.locator('#neural-select option').count(),75);
 assert.match(await page.locator('#neural-visible-count').textContent(),/74 source records/);
 assert.equal(await page.locator('[data-neural-view]').count(),5);
 assert.match(await page.locator('main').textContent(),/CN IX is missing as a separate 3D mesh/i);
 const fallback=await page.locator('#neural-stage').getAttribute('data-fallback')==='true';
 if(fallback){
  assert.match(await page.locator('#neural-status').textContent(),/WebGL not supported|WebGL context lost/i,
   'Asset/decoder/mesh ID parsing failure is not an acceptable fallback');
  assert.equal(await page.locator('#neural-focus').isDisabled(),true);
 }else{
  assert.equal(await page.locator('#neural-stage').getAttribute('data-model-status'),'ready');
  assert.match(await page.locator('#neural-status').textContent(),/74 source-derived/i);
  const dims=await page.locator('#neural-stage canvas').evaluate(canvas=>{
   const rect=canvas.getBoundingClientRect(),parent=canvas.parentElement;
   return {width:rect.width,expectedW:parent.clientWidth,height:rect.height,expectedH:parent.clientHeight};
  });
  assert.ok(Math.abs(dims.width-dims.expectedW)<2&&Math.abs(dims.height-dims.expectedH)<2,
   '3D canvas should fit iPhone CSS pixels: '+JSON.stringify(dims));
 }
 for(const part of neuralParts){
  await page.locator('#neural-select').selectOption(String(part.id));
  assert.match(await page.locator('#neural-note-id').textContent(),new RegExp('node ID: '+part.id+' ·'));
  assert.match(await page.locator('#neural-note-name').textContent(),new RegExp(part.side));
 }
 const vagus=neuralParts.find(x=>x.name==='Vagus nerve (X)'&&x.side==='left');
 await page.locator('#neural-select').selectOption(String(vagus.id));
 assert.match(await page.locator('#neural-note-text').textContent(),/laryngeal functions/i);
 if(!fallback){
  await page.locator('#neural-focus').click();
  assert.equal(await page.locator('#neural-stage').getAttribute('data-focused-group'),String(vagus.id));
  await page.locator('#neural-isolate').click();
  assert.equal(await page.locator('#neural-isolate').getAttribute('aria-pressed'),'true');
  for(const view of ['front','back','left','right','top'])
   await page.locator('[data-neural-view="'+view+'"]').click();
 }
 await page.locator('#neural-filters input[value="brainstem"]').uncheck();
 await page.locator('#neural-all').click();
 assert.equal(await page.locator('#neural-filters input:checked').count(),2);
 assert.equal(await page.locator('#neural-select').inputValue(),'');
 await page.locator('#neural-lesson-start').click();
 for(let i=0;i<neuralLessons.length;i++){
  const step=neuralLessons[i],id=teachingStepId(step);
  assert.match(await page.locator('#neural-lesson-progress').textContent(),new RegExp('Step '+(i+1)+' of 7'));
  assert.ok((await page.locator('#neural-lesson-note').textContent()).includes(step.note));
  assert.equal(await page.locator('#neural-select').inputValue(),id===null?'':String(id));
  if(id===null)assert.match(await page.locator('#neural-lesson-note').textContent(),/NO glossopharyngeal 3D nerve mesh/);
  await page.locator('#neural-lesson-next').click();
 }
 assert.match(await page.locator('#neural-lesson-summary').textContent(),/Study complete/);
 assert.equal(await page.locator('#neural-lesson-active').isHidden(),true);
 await page.locator('#neural-lesson-start').click();
 await page.locator('#neural-lesson-next').click();
 await page.locator('#neural-lesson-prev').click();
 assert.equal(await page.locator('#neural-select').inputValue(),String(teachingStepId(neuralLessons[0])));
 await page.locator('#neural-lesson-close').click();
 assert.equal(await page.locator('#neural-lesson-active').isHidden(),true);

 // Evidence-based, session-only retrieval practice; no 3D hint before answering.
 await page.locator('#neural-practice-start').click();
 assert.equal(await page.locator('#neural-practice-active').isVisible(),true);
 const missed=new Set([1,3]);
 for(const [i,q] of neuralPracticeQuestions.entries()){
  assert.equal(await page.locator('#neural-select').inputValue(),'','Answer mesh must stay undisclosed until response');
  assert.equal(await page.locator('#neural-practice-next').isDisabled(),true);
  assert.equal(await page.locator('#neural-practice-options button').count(),4);
  assert.match(await page.locator('#neural-practice-question').textContent(),new RegExp(q.prompt.replace(/[.*+?^$()|[\\]{}]/g,'\\ assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);')));
  const answer=missed.has(i)?practiceChoices(q).find(x=>x.id!==q.correct).id:q.correct;
  await page.locator('#neural-practice-options button[data-answer="'+answer+'"]').click();
  assert.equal(await page.locator('#neural-practice-next').isEnabled(),true);
  const feedback=await page.locator('#neural-practice-feedback').textContent();
  assert.match(feedback,missed.has(i)?/Not quite/:/Correct/);
  if(i===3){
   assert.match(feedback,/No original 3D mesh is available for this nerve/);
   assert.equal(await page.locator('#neural-select').inputValue(),'');
  }else assert.equal(await page.locator('#neural-select').inputValue(),
    String(teachingStepId(neuralLessons[q.correct])));
  const before=feedback;
  await page.locator('#neural-practice-options button').first().evaluate(b=>b.click());
  assert.equal(await page.locator('#neural-practice-feedback').textContent(),before,'Repeat click cannot change score');
  await page.locator('#neural-practice-next').click();
 }
 assert.match(await page.locator('#neural-practice-summary').textContent(),/First attempt: 5 of 7 correct/);
 assert.equal(await page.locator('#neural-practice-missed').isVisible(),true);
 await page.locator('#neural-practice-missed').click();
 for(const i of [1,3]){
  const q=neuralPracticeQuestions[i];
  assert.match(await page.locator('#neural-practice-progress').textContent(),/Review missed/);
  await page.locator('#neural-practice-options button[data-answer="'+q.correct+'"]').click();
  await page.locator('#neural-practice-next').click();
 }
 assert.match(await page.locator('#neural-practice-summary').textContent(),/0 of 2 missed again/);
 await page.locator('#neural-practice-start').click();
 await page.locator('#neural-practice-exit').click();
 assert.match(await page.locator('#neural-practice-summary').textContent(),/No answers or scores were saved/);
 // Guided lesson and quiz must not overlap visually or reveal stale quiz answers.
 await page.locator('#neural-lesson-start').click();
 await page.locator('#neural-practice-start').click();
 assert.equal(await page.locator('#neural-lesson-active').isHidden(),true);
 await page.locator('#neural-practice-exit').click();
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await mkdir('test-results',{recursive:true});
 await page.screenshot({path:'test-results/slp-neural-'+name+'-iphone.png',fullPage:true});
 if(!fallback){
  await page.locator('#neural-stage canvas').evaluate(canvas=>canvas.dispatchEvent(new Event('webglcontextlost',{cancelable:true})));
  assert.equal(await page.locator('#neural-stage').getAttribute('data-model-status'),'unavailable');
  assert.equal(await page.locator('#neural-stage canvas').isVisible(),false);
  await page.locator('#neural-select').selectOption(String(vagus.id));
  assert.match(await page.locator('#neural-note-name').textContent(),/Vagus/);
 }
 assert.deepEqual(errors,[]);
 console.log('PASS: '+name+' pinned 74 source-mesh neural atlas, local Draco, honest IX gap and text/3D guided study');
}catch(e){
 console.error('FAIL: '+name+' neural anatomy study',e.stack);
 process.exitCode=1;
}finally{await browser.close();}
