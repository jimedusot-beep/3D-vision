import {chromium,webkit,devices} from 'playwright';
import assert from 'node:assert/strict';
import {readFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
const browserEngine=process.env.BROWSER_ENGINE==='webkit'?webkit:chromium;
const name=process.env.BROWSER_ENGINE==='webkit'?'webkit':'chromium';
const browser=await browserEngine.launch(name==='chromium'
 ?{args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']}:{});
const origin='https://3dvision.test',errors=[];
try{
 const ctx=await browser.newContext({...devices['iPhone 13']});
 await ctx.route(origin+'/**',async route=>{
  const p=decodeURIComponent(new URL(route.request().url()).pathname);
  const file=path.resolve('dist','.'+p);
  if(!file.startsWith(path.resolve('dist')+path.sep))return route.fulfill({status:403});
  try{
   const body=await readFile(file);
   const contentType={'.js':'text/javascript','.html':'text/html','.css':'text/css','.glb':'model/gltf-binary'}[path.extname(file)]||'application/octet-stream';
   return route.fulfill({body,contentType});
  }catch{return route.fulfill({status:404});}
 });
 const page=await ctx.newPage();
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin+'/ANATOMY/SLP/lungs.html');
 await page.waitForFunction(()=>document.querySelector('#lung-stage')?.dataset.modelStatus==='ready'||
  document.querySelector('#lung-stage')?.dataset.fallback==='true',null,{timeout:45000});
 assert.equal(await page.locator('#lung-select option').count(),21);
 assert.equal(await page.locator('#layer-choices input').count(),6);
 assert.match(await page.locator('#lung-objects').textContent(),/20/);
 const fallback=await page.locator('#lung-stage').getAttribute('data-fallback')==='true';
 if(fallback){
  // If no WebGL context, the real study content must still be usable.
  assert.match(await page.locator('#fallback').textContent(),/Use the complete anatomy structure selector/);
  assert.equal(await page.locator('#lung-separate').isDisabled(),true);
 }else{
  assert.equal(await page.locator('#lung-stage').getAttribute('data-model-status'),'ready');
  assert.equal(await page.locator('#lung-stage canvas').count(),1);
  const dims=await page.locator('#lung-stage canvas').evaluate(el=>{
   const a=el.getBoundingClientRect(),b=el.parentElement.getBoundingClientRect();
   return {width:a.width,expected:b.width,height:a.height,h:b.height};
  });
  assert.ok(Math.abs(dims.width-dims.expected)<2,'Retina canvas must remain CSS-sized');
  assert.ok(Math.abs(dims.height-dims.h)<2,'Retina canvas height must fit stage');
  await page.locator('#lung-separate').evaluate(el=>{el.value='75';el.dispatchEvent(new Event('input',{bubbles:true}));});
  assert.equal(await page.locator('#lung-stage').getAttribute('data-separation'),'75');
  await page.locator('#lung-assemble').click();
  assert.equal(await page.locator('#lung-stage').getAttribute('data-separation'),'0');
  for(const view of ['front','back','left','right','top'])
   await page.locator('[data-view="'+view+'"]').click();
 }
 await page.locator('#lung-select').selectOption('FMA7394');
 assert.match(await page.locator('#lung-note-name').textContent(),/Trachea/);
 assert.match(await page.locator('#lung-note-text').textContent(),/conducting airway/i);
 await page.locator('#layer-choices input[value="airway"]').uncheck();
 await page.locator('#lung-all').click();
 assert.equal(await page.locator('#layer-choices input:checked').count(),6);
 await page.locator('#lung-select').selectOption('FMA7372');
 assert.match(await page.locator('#lung-note-name').textContent(),/apicoposterior/i);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 assert.deepEqual(errors,[]);
 await mkdir('test-results',{recursive:true});
 await page.screenshot({path:'test-results/slp-lungs-'+name+'-iphone.png',fullPage:true});
 console.log('PASS: '+name+' pinned respiratory source model, 20 groups, six lobe filters, mobile camera and fallback');
}catch(e){
 console.error('FAIL: '+name+' 3D lungs browser:',e.stack);process.exitCode=1;
}finally{await browser.close();}
