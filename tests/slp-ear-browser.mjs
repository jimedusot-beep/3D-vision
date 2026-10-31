import {chromium,webkit,devices} from 'playwright';
import assert from 'node:assert/strict';
import {readFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {earParts} from '../ANATOMY/SLP/ear-manifest.js';
import {validEarModel} from '../scripts/prepare-slp-ear.mjs';

const engine=process.env.BROWSER_ENGINE==='webkit'?webkit:chromium;
const name=process.env.BROWSER_ENGINE==='webkit'?'webkit':'chromium';
const browser=await engine.launch(name==='chromium'
 ?{args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']}:{});
const origin='https://3dvision.test',errors=[];
try{
 const binary=await readFile('dist/models/slp/ear.glb');
 assert.equal(binary.length,1010340);
 assert.equal(validEarModel(binary),true,'Built ear binary must match immutable licensed source');
 assert.equal(binary.toString('ascii',16,20),'JSON');
 const jsonLength=binary.readUInt32LE(12);
 const gltf=JSON.parse(binary.toString('utf8',20,20+jsonLength));
 const names=new Set((gltf.nodes||[]).map(n=>n.name));
 for(const part of earParts)assert.ok(names.has(part.id),'Missing real GLB node '+part.id);
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
 await page.goto(origin+'/ANATOMY/SLP/ear.html');
 await page.waitForFunction(()=>['ready','unavailable'].includes(document.querySelector('#ear-stage')?.dataset.modelStatus),null,{timeout:45000});
 assert.equal(await page.locator('#ear-select option').count(),17);
 assert.equal(await page.locator('#ear-filters input').count(),4);
 assert.equal(await page.locator('[data-ear-view]').count(),5);
 assert.match(await page.locator('main').textContent(),/right ear only/i);
 assert.match(await page.locator('main').textContent(),/CC BY-SA 4\.0/);
 const fallback=await page.locator('#ear-stage').getAttribute('data-fallback')==='true';
 if(fallback){
  assert.match(await page.locator('#ear-status').textContent(),/WebGL not supported|WebGL context lost/i,
   'A bad source download or GLB parse must fail the test, not count as a working fallback');
 }else{
  assert.equal(await page.locator('#ear-stage').getAttribute('data-model-status'),'ready');
  const dims=await page.locator('#ear-stage canvas').evaluate(el=>{
   const rect=el.getBoundingClientRect(),stage=el.parentElement;
   return {w:rect.width,expectedW:stage.clientWidth,h:rect.height,expectedH:stage.clientHeight};
  });
  assert.ok(Math.abs(dims.w-dims.expectedW)<2&&Math.abs(dims.h-dims.expectedH)<2,
   'iPhone retina canvas sizing mismatch: '+JSON.stringify(dims));
 }
 await page.locator('#ear-select').selectOption('cochlea');
 assert.match(await page.locator('#ear-note-text').textContent(),/sensory hearing transduction/i);
 assert.match(await page.locator('#ear-note-id').textContent(),/Z-Anatomy source/);
 if(!fallback){
  await page.locator('#ear-focus').click();
  assert.equal(await page.locator('#ear-stage').getAttribute('data-focused-group'),'cochlea');
  await page.locator('#ear-isolate').click();
  assert.equal(await page.locator('#ear-isolate').getAttribute('aria-pressed'),'true');
  for(const direction of ['front','back','left','right','top'])
   await page.locator('[data-ear-view="'+direction+'"]').click();
 }
 await page.locator('#ear-filters input[value="outer"]').uncheck();
 await page.locator('#ear-all').click();
 assert.equal(await page.locator('#ear-filters input:checked').count(),4);
 assert.equal(await page.locator('#ear-focus').isDisabled(),true);
 for(const part of earParts){
  await page.locator('#ear-select').selectOption(part.id);
  assert.equal(await page.locator('#ear-note-name').textContent(),part.name);
  assert.ok((await page.locator('#ear-note-id').textContent()).includes(part.id));
 }
 // Guided study must remain available with graphics disabled.
 await page.locator('#ear-journey-start').click();
 const tourIds=['helix','tympanic-membrane','malleus','incus','stapes','cochlea','vestibulocochlear-nerve'];
 for(const [i,id] of tourIds.entries()){
  assert.equal(await page.locator('#ear-select').inputValue(),id);
  assert.match(await page.locator('#ear-journey-progress').textContent(),new RegExp('Step '+(i+1)+' of 7'));
  if(i===0)assert.match(await page.locator('#ear-journey-note').textContent(),/ear canal is missing/i);
  if(i===5)assert.match(await page.locator('#ear-journey-note').textContent(),/hair cells/i);
  await page.locator('#ear-journey-next').click();
 }
 assert.match(await page.locator('#ear-journey-summary').textContent(),/Tour complete/);
 assert.equal(await page.locator('#ear-journey-active').isHidden(),true);
 await page.locator('#ear-journey-start').click();
 await page.locator('#ear-journey-next').click();
 await page.locator('#ear-journey-prev').click();
 assert.equal(await page.locator('#ear-select').inputValue(),'helix');
 await page.locator('#ear-journey-close').click();
 assert.equal(await page.locator('#ear-journey-active').isHidden(),true);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await mkdir('test-results',{recursive:true});
 await page.screenshot({path:'test-results/slp-ear-'+name+'-iphone.png',fullPage:true});
 if(!fallback){
  await page.locator('#ear-stage canvas').evaluate(canvas=>{
   canvas.dispatchEvent(new Event('webglcontextlost',{cancelable:true}));
  });
  assert.equal(await page.locator('#ear-stage').getAttribute('data-model-status'),'unavailable');
  assert.equal(await page.locator('#ear-stage').getAttribute('tabindex'),null);
  assert.equal(await page.locator('#ear-stage canvas').isVisible(),false);
  await page.locator('#ear-select').selectOption('vestibule');
  assert.match(await page.locator('#ear-note-name').textContent(),/vestibule/i);
 }
 assert.deepEqual(errors,[]);
 console.log('PASS: '+name+' Z-Anatomy CC BY-SA 4.0 right-ear study 16 meshes, mobile text/3D/fallback');
}catch(e){
 console.error('FAIL: '+name+' ear anatomy mobile:',e.stack);
 process.exitCode=1;
}finally{await browser.close();}
