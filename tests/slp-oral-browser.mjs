import {chromium,webkit,devices} from 'playwright';
import assert from 'node:assert/strict';
import {readFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {oralParts} from '../ANATOMY/SLP/oral-manifest.js';
import {validOralModel} from '../scripts/prepare-slp-oral.mjs';

const engine=process.env.BROWSER_ENGINE==='webkit'?webkit:chromium;
const name=process.env.BROWSER_ENGINE==='webkit'?'webkit':'chromium';
const browser=await engine.launch(name==='chromium'
 ?{args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']}:{});
const origin='https://3dvision.test',errors=[];
try{
 const binary=await readFile('dist/models/slp/oral.glb');
 assert.equal(validOralModel(binary),true,'Built oral binary must match immutable licensed source');
 assert.equal(binary.toString('ascii',16,20),'JSON');
 const jsonLength=binary.readUInt32LE(12);
 const gltf=JSON.parse(binary.toString('utf8',20,20+jsonLength));
 const names=new Set((gltf.nodes||[]).map(n=>n.name));
 for(const part of oralParts)assert.ok(names.has(part.id),'Missing real GLB node '+part.id);
 const ctx=await browser.newContext({...devices['iPhone 13']});
 await ctx.route(origin+'/**',async route=>{
  const pathname=decodeURIComponent(new URL(route.request().url()).pathname);
  const file=path.resolve('dist','.'+pathname);
  if(!file.startsWith(path.resolve('dist')+path.sep))return route.fulfill({status:403});
  try{
   const data=await readFile(file);
   const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.glb':'model/gltf-binary'}[path.extname(file)]||'application/octet-stream';
   return route.fulfill({body:data,contentType:mime});
  }catch{return route.fulfill({status:404});}
 });
 const page=await ctx.newPage();
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin+'/ANATOMY/SLP/oral.html');
 await page.waitForFunction(()=>['ready','unavailable'].includes(document.querySelector('#oral-stage')?.dataset.modelStatus),null,{timeout:45000});
 assert.equal(await page.locator('#oral-select option').count(),16);
 assert.equal(await page.locator('#oral-filters input').count(),4);
 assert.equal(await page.locator('[data-oral-view]').count(),5);
 assert.match(await page.locator('main').textContent(),/does not include lips, teeth, velum, pharynx/i);
 assert.match(await page.locator('main').textContent(),/CC BY-SA 4.0/);
 const fallback=await page.locator('#oral-stage').getAttribute('data-fallback')==='true';

 // Explosion is a real mesh transform, not a text-only box or isolated note.
 assert.equal(await page.locator('#oral-explode').count(),1);
 assert.equal(await page.locator('#oral-explode-amount').count(),1);
 if(!fallback){
  assert.equal(await page.locator('#oral-explode').isEnabled(),true);
  await page.locator('#oral-explode').click();
  assert.equal(await page.locator('#oral-stage').getAttribute('data-explosion-amount'),'65');
  assert.equal(await page.locator('#oral-explode').getAttribute('aria-pressed'),'true');
  assert.match(await page.locator('#oral-explode-status').textContent(),/3D source meshes separated/);
  await page.locator('#oral-explode-amount').evaluate(input=>{
   input.value='100';input.dispatchEvent(new Event('input',{bubbles:true}));
  });
  assert.equal(await page.locator('#oral-stage').getAttribute('data-explosion-amount'),'100');
  await page.locator('#oral-assemble').click();
  assert.equal(await page.locator('#oral-stage').getAttribute('data-explosion-amount'),'0');
  assert.equal(await page.locator('#oral-explode').getAttribute('aria-pressed'),'false');
  assert.match(await page.locator('#oral-explode-status').textContent(),/original relative positions/);
  await page.locator('#oral-explode').click();
  await page.locator('#oral-reset').click();
  assert.equal(await page.locator('#oral-stage').getAttribute('data-explosion-amount'),'0');
 }else{
  assert.equal(await page.locator('#oral-explode').isDisabled(),true);
  assert.match(await page.locator('#oral-explode-status').textContent(),/unavailable/);
 }

 if(fallback){
  assert.match(await page.locator('#oral-status').textContent(),/WebGL not supported|WebGL context lost/i,
   'A bad source download or GLB parse must fail the test, not count as a working fallback');
 }else{
  assert.equal(await page.locator('#oral-stage').getAttribute('data-model-status'),'ready');
  const dims=await page.locator('#oral-stage canvas').evaluate(el=>{
   const rect=el.getBoundingClientRect(),stage=el.parentElement;
   return {w:rect.width,expectedW:stage.clientWidth,h:rect.height,expectedH:stage.clientHeight};
  });
  assert.ok(Math.abs(dims.w-dims.expectedW)<2&&Math.abs(dims.h-dims.expectedH)<2,
   'iPhone retina canvas sizing mismatch: '+JSON.stringify(dims));
 }
 await page.locator('#oral-select').selectOption('tongue');
 assert.match(await page.locator('#oral-note-text').textContent(),/speech sounds/i);
 assert.match(await page.locator('#oral-note-id').textContent(),/Tongue/);
 if(!fallback){
  await page.locator('#oral-focus').click();
  assert.equal(await page.locator('#oral-stage').getAttribute('data-focused-group'),'tongue');
  await page.locator('#oral-isolate').click();
  assert.equal(await page.locator('#oral-isolate').getAttribute('aria-pressed'),'true');
  for(const direction of ['front','back','left','right','top'])
   await page.locator('[data-oral-view="'+direction+'"]').click();
 }
 await page.locator('#oral-filters input[value="ducts"]').uncheck();
 await page.locator('#oral-all').click();
 assert.equal(await page.locator('#oral-filters input:checked').count(),4);
 assert.equal(await page.locator('#oral-focus').isDisabled(),true);
 for(const part of oralParts){
  await page.locator('#oral-select').selectOption(part.id);
  assert.equal(await page.locator('#oral-note-name').textContent(),part.name);
  assert.ok((await page.locator('#oral-note-id').textContent()).includes(part.sourceObject));
 }
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await mkdir('test-results',{recursive:true});
 await page.screenshot({path:'test-results/slp-oral-'+name+'-iphone.png',fullPage:true});
 if(!fallback){
  await page.locator('#oral-stage canvas').evaluate(canvas=>{
   canvas.dispatchEvent(new Event('webglcontextlost',{cancelable:true}));
  });
  assert.equal(await page.locator('#oral-stage').getAttribute('data-model-status'),'unavailable');
  assert.equal(await page.locator('#oral-stage').getAttribute('tabindex'),null);
  assert.equal(await page.locator('#oral-stage canvas').isVisible(),false);
  await page.locator('#oral-select').selectOption('hyoid-bone');
  assert.match(await page.locator('#oral-note-name').textContent(),/Hyoid/);
 }
 assert.deepEqual(errors,[]);
 console.log('PASS: '+name+' Z-Anatomy CC BY-SA 4.0 oral study 15 meshes, mobile text/3D/fallback');
}catch(e){
 console.error('FAIL: '+name+' oral anatomy mobile:',e.stack);
 process.exitCode=1;
}finally{await browser.close();}
