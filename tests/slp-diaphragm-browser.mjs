import {chromium,webkit,devices} from 'playwright';
import assert from 'node:assert/strict';
import {readFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {diaphragmParts} from '../ANATOMY/SLP/diaphragm-manifest.js';
import {validDiaphragmModel} from '../scripts/prepare-slp-diaphragm.mjs';

const engine=process.env.BROWSER_ENGINE==='webkit'?webkit:chromium;
const name=process.env.BROWSER_ENGINE==='webkit'?'webkit':'chromium';
const browser=await engine.launch(name==='chromium'
 ?{args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']}:{});
const origin='https://3dvision.test',errors=[];
try{
 const binary=await readFile('dist/models/slp/diaphragm.glb');
 assert.equal(validDiaphragmModel(binary),true,'Published asset MUST match pinned Git blob');
 const chunkLength=binary.readUInt32LE(12);
 assert.equal(binary.toString('ascii',16,20),'JSON');
 const gltf=JSON.parse(binary.toString('utf8',20,20+chunkLength));
 const names=new Set((gltf.nodes||[]).map(node=>node.name));
 for(const structure of diaphragmParts)
  assert.ok(names.has(structure.id),'Pinned binary missing source mesh '+structure.id);
 const ctx=await browser.newContext({...devices['iPhone 13']});
 await ctx.route(origin+'/**',async route=>{
  const p=decodeURIComponent(new URL(route.request().url()).pathname);
  const file=path.resolve('dist','.'+p);
  if(!file.startsWith(path.resolve('dist')+path.sep))return route.fulfill({status:403});
  try{
   const content=await readFile(file);
   const type={'.html':'text/html','.js':'text/javascript','.css':'text/css','.glb':'model/gltf-binary'}[path.extname(file)]||'application/octet-stream';
   return route.fulfill({body:content,contentType:type});
  }catch{return route.fulfill({status:404});}
 });
 const page=await ctx.newPage();
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin+'/ANATOMY/SLP/diaphragm.html');
 await page.waitForFunction(()=>document.querySelector('#diaphragm-stage')?.dataset.modelStatus==='ready'||
  document.querySelector('#diaphragm-stage')?.dataset.fallback==='true',null,{timeout:45000});
 assert.equal(await page.locator('#diaphragm-select option').count(),14);
 assert.equal(await page.locator('#diaphragm-filters input').count(),5);
 assert.equal(await page.locator('[data-diaphragm-view]').count(),5);
 assert.match(await page.locator('main').textContent(),/source coordinates and adapted scaling are not verified/i);
 const fallback=await page.locator('#diaphragm-stage').getAttribute('data-fallback')==='true';

 // Explosion is a real mesh transform, not a text-only box or isolated note.
 assert.equal(await page.locator('#diaphragm-explode').count(),1);
 assert.equal(await page.locator('#diaphragm-explode-amount').count(),1);
 if(!fallback){
  assert.equal(await page.locator('#diaphragm-explode').isEnabled(),true);
  // The original bug snapped the learner back to front when using Explode.
  await page.locator('[data-diaphragm-view="right"]').click();
  const rightCameraView=await page.locator('#diaphragm-stage canvas').screenshot();
  await page.locator('#diaphragm-explode').click();
  assert.equal(await page.locator('#diaphragm-stage').getAttribute('data-explosion-amount'),'65');
  assert.equal(await page.locator('#diaphragm-explode').getAttribute('aria-pressed'),'true');
  assert.match(await page.locator('#diaphragm-explode-status').textContent(),/3D source meshes separated/);
  await page.locator('#diaphragm-explode-amount').evaluate(input=>{
   input.value='100';input.dispatchEvent(new Event('input',{bubbles:true}));
  });
  assert.equal(await page.locator('#diaphragm-stage').getAttribute('data-explosion-amount'),'100');
  await page.locator('#diaphragm-assemble').click();
  assert.equal(await page.locator('#diaphragm-stage').getAttribute('data-explosion-amount'),'0');
  assert.equal(await page.locator('#diaphragm-explode').getAttribute('aria-pressed'),'false');
  assert.match(await page.locator('#diaphragm-explode-status').textContent(),/original relative positions/);
  const restoredRightView=await page.locator('#diaphragm-stage canvas').screenshot();
  assert.deepEqual(restoredRightView,rightCameraView,
   'diaphragm: Explode and Reassemble must preserve right/rotated camera direction and framed pose');
  await page.locator('#diaphragm-explode').click();
  await page.locator('#diaphragm-reset').click();
  assert.equal(await page.locator('#diaphragm-stage').getAttribute('data-explosion-amount'),'0');
 }else{
  assert.equal(await page.locator('#diaphragm-explode').isDisabled(),true);
  assert.match(await page.locator('#diaphragm-explode-status').textContent(),/unavailable/);
 }

 if(fallback){
  assert.match(await page.locator('#diaphragm-status').textContent(),/WebGL not supported|WebGL context lost/i,
   'An asset download/geometry error is not an acceptable graphics fallback');
  assert.equal(await page.locator('#diaphragm-focus').isDisabled(),true);
 }else{
  assert.equal(await page.locator('#diaphragm-stage').getAttribute('data-model-status'),'ready');
  assert.equal(await page.locator('#diaphragm-stage canvas').count(),1);
  const dims=await page.locator('#diaphragm-stage canvas').evaluate(el=>{
   const rect=el.getBoundingClientRect(),parent=el.parentElement;
   return {w:rect.width,pw:parent.clientWidth,h:rect.height,ph:parent.clientHeight};
  });
  assert.ok(Math.abs(dims.w-dims.pw)<2&&Math.abs(dims.h-dims.ph)<2,
   'Canvas must fit parent CSS pixels on Retina screens: '+JSON.stringify(dims));
 }
 await page.locator('#diaphragm-select').selectOption('right-hemidiaphragm');
 assert.match(await page.locator('#diaphragm-note-text').textContent(),/inspiration/i);
 assert.match(await page.locator('#diaphragm-note-id').textContent(),/FMA13295/);
 if(!fallback){
  assert.equal(await page.locator('#diaphragm-focus').isEnabled(),true);
  await page.locator('#diaphragm-focus').click();
  assert.equal(await page.locator('#diaphragm-stage').getAttribute('data-focused-group'),'right-hemidiaphragm');
  await page.locator('#diaphragm-isolate').click();
  assert.equal(await page.locator('#diaphragm-isolate').getAttribute('aria-pressed'),'true');
  for(const view of ['front','back','left','right','top'])
   await page.locator('[data-diaphragm-view="'+view+'"]').click();
 }
 await page.locator('#diaphragm-filters input[value="abdominal"]').uncheck();
 await page.locator('#diaphragm-all').click();
 assert.equal(await page.locator('#diaphragm-filters input:checked').count(),5);
 assert.equal(await page.locator('#diaphragm-select').inputValue(),'');
 assert.equal(await page.locator('#diaphragm-focus').isDisabled(),true);
 for(const structure of diaphragmParts){
  await page.locator('#diaphragm-select').selectOption(structure.id);
  assert.match(await page.locator('#diaphragm-note-id').textContent(),new RegExp(structure.fma));
 }
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await mkdir('test-results',{recursive:true});
 await page.screenshot({path:'test-results/slp-diaphragm-'+name+'-iphone.png',fullPage:true});
 if(!fallback){
  await page.locator('#diaphragm-stage canvas').evaluate(canvas=>
   canvas.dispatchEvent(new Event('webglcontextlost',{cancelable:true})));
  assert.equal(await page.locator('#diaphragm-stage').getAttribute('data-model-status'),'unavailable');
  assert.equal(await page.locator('#diaphragm-stage').getAttribute('tabindex'),null);
  assert.equal(await page.locator('#diaphragm-stage canvas').isVisible(),false);
  await page.locator('#diaphragm-select').selectOption('left-hemidiaphragm');
  assert.match(await page.locator('#diaphragm-note-name').textContent(),/Left hemidiaphragm/);
 }
 assert.deepEqual(errors,[]);
 console.log('PASS: '+name+' pinned CC BY-SA diaphragm GLB, 13 source groups, mobile selection, camera and fallback');
}catch(e){
 console.error('FAIL: '+name+' diaphragm mobile browser:',e.stack);process.exitCode=1;
}finally{await browser.close();}
