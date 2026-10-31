import {chromium,webkit,devices} from 'playwright';
import assert from 'node:assert/strict';
import {readFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {pharynxParts} from '../ANATOMY/SLP/pharynx-manifest.js';
import {validPharynxModel} from '../scripts/prepare-slp-pharynx.mjs';

const engine=process.env.BROWSER_ENGINE==='webkit'?webkit:chromium;
const name=process.env.BROWSER_ENGINE==='webkit'?'webkit':'chromium';
const browser=await engine.launch(name==='chromium'
 ?{args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']}:{});
const origin='https://3dvision.test',errors=[];
try{
 const binary=await readFile('dist/models/slp/pharynx.glb');
 assert.equal(binary.length,7148788);
 assert.equal(validPharynxModel(binary),true,'Built pharynx binary must match immutable licensed source');
 assert.equal(binary.toString('ascii',16,20),'JSON');
 const jsonLength=binary.readUInt32LE(12);
 const gltf=JSON.parse(binary.toString('utf8',20,20+jsonLength));
 const names=new Set((gltf.nodes||[]).map(n=>n.name));
 for(const part of pharynxParts)assert.ok(names.has(part.id),'Missing real GLB node '+part.id);
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
 await page.goto(origin+'/ANATOMY/SLP/pharynx.html');
 await page.waitForFunction(()=>['ready','unavailable'].includes(document.querySelector('#pharynx-stage')?.dataset.modelStatus),null,{timeout:45000});
 assert.equal(await page.locator('#pharynx-select option').count(),21);
 assert.equal(await page.locator('#pharynx-filters input').count(),6);
 assert.equal(await page.locator('[data-pharynx-view]').count(),5);
 assert.match(await page.locator('main').textContent(),/mucosal pharyngeal lining/i);
 assert.match(await page.locator('main').textContent(),/CC BY-SA 2\.1 Japan/);
 const fallback=await page.locator('#pharynx-stage').getAttribute('data-fallback')==='true';
 if(fallback){
  assert.match(await page.locator('#pharynx-status').textContent(),/WebGL not supported|WebGL context lost/i,
   'A bad source download or GLB parse must fail the test, not count as a working fallback');
 }else{
  assert.equal(await page.locator('#pharynx-stage').getAttribute('data-model-status'),'ready');
  const dims=await page.locator('#pharynx-stage canvas').evaluate(el=>{
   const rect=el.getBoundingClientRect(),stage=el.parentElement;
   return {w:rect.width,expectedW:stage.clientWidth,h:rect.height,expectedH:stage.clientHeight};
  });
  assert.ok(Math.abs(dims.w-dims.expectedW)<2&&Math.abs(dims.h-dims.expectedH)<2,
   'iPhone retina canvas sizing mismatch: '+JSON.stringify(dims));
 }
 await page.locator('#pharynx-select').selectOption('levator-veli-palatini');
 assert.match(await page.locator('#pharynx-note-text').textContent(),/soft-palate elevator/i);
 assert.match(await page.locator('#pharynx-note-id').textContent(),/FMA46727/);
 if(!fallback){
  await page.locator('#pharynx-focus').click();
  assert.equal(await page.locator('#pharynx-stage').getAttribute('data-focused-group'),'levator-veli-palatini');
  await page.locator('#pharynx-isolate').click();
  assert.equal(await page.locator('#pharynx-isolate').getAttribute('aria-pressed'),'true');
  for(const direction of ['front','back','left','right','top'])
   await page.locator('[data-pharynx-view="'+direction+'"]').click();
 }
 await page.locator('#pharynx-filters input[value="nerves"]').uncheck();
 await page.locator('#pharynx-all').click();
 assert.equal(await page.locator('#pharynx-filters input:checked').count(),6);
 assert.equal(await page.locator('#pharynx-focus').isDisabled(),true);
 for(const part of pharynxParts){
  await page.locator('#pharynx-select').selectOption(part.id);
  assert.equal(await page.locator('#pharynx-note-name').textContent(),part.name);
  assert.ok((await page.locator('#pharynx-note-id').textContent()).includes(part.fma));
 }
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await mkdir('test-results',{recursive:true});
 await page.screenshot({path:'test-results/slp-pharynx-'+name+'-iphone.png',fullPage:true});
 if(!fallback){
  await page.locator('#pharynx-stage canvas').evaluate(canvas=>{
   canvas.dispatchEvent(new Event('webglcontextlost',{cancelable:true}));
  });
  assert.equal(await page.locator('#pharynx-stage').getAttribute('data-model-status'),'unavailable');
  assert.equal(await page.locator('#pharynx-stage').getAttribute('tabindex'),null);
  assert.equal(await page.locator('#pharynx-stage canvas').isVisible(),false);
  await page.locator('#pharynx-select').selectOption('musculus-uvulae');
  assert.match(await page.locator('#pharynx-note-name').textContent(),/uvular/i);
 }
 assert.deepEqual(errors,[]);
 console.log('PASS: '+name+' BodyParts3D 4.3 CC BY-SA 2.1 Japan pharynx study 20 meshes, mobile text/3D/fallback');
}catch(e){
 console.error('FAIL: '+name+' pharynx anatomy mobile:',e.stack);
 process.exitCode=1;
}finally{await browser.close();}
