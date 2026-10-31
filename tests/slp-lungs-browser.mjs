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
   const a=el.getBoundingClientRect(),stage=el.parentElement;
   return {width:a.width,expected:stage.clientWidth,height:a.height,h:stage.clientHeight};
  });
  assert.ok(Math.abs(dims.width-dims.expected)<=1,
   'Retina canvas must match stage CSS content width: '+JSON.stringify(dims));
  assert.ok(Math.abs(dims.height-dims.h)<=1,
   'Retina canvas height must match stage CSS content height: '+JSON.stringify(dims));
  await page.locator('#lung-separate').evaluate(el=>{el.value='75';el.dispatchEvent(new Event('input',{bubbles:true}));});
  assert.equal(await page.locator('#lung-stage').getAttribute('data-separation'),'75');
  await page.locator('#lung-assemble').click();
  assert.equal(await page.locator('#lung-stage').getAttribute('data-separation'),'0');
  for(const view of ['front','back','left','right','top'])
   await page.locator('[data-view="'+view+'"]').click();
 }
 // Tour remains functional as source-linked text if WebGL is unavailable.
 await page.locator('#lung-tour-start').click();
 assert.equal(await page.locator('#lung-stage').getAttribute('data-tour-step'),'1');
 assert.equal(await page.locator('#lung-select').inputValue(),'FMA7338');
 assert.match(await page.locator('#lung-tour-title').textContent(),/Right upper-lobe/);
 assert.equal(await page.locator('#lung-tour-prev').isDisabled(),true);
 await page.locator('#lung-tour-next').click();
 assert.equal(await page.locator('#lung-select').inputValue(),'FMA26661');
 await page.locator('#lung-tour-prev').click();
 assert.equal(await page.locator('#lung-select').inputValue(),'FMA7338');
 for(let i=0;i<4;i++)await page.locator('#lung-tour-next').click();
 assert.equal(await page.locator('#lung-select').inputValue(),'FMA7394');
 assert.equal(await page.locator('#lung-tour-next').textContent(),'Finish tour');
 await page.locator('#lung-tour-next').click();
 assert.equal(await page.locator('#lung-stage').getAttribute('data-tour-step'),'off');
 assert.match(await page.locator('#lung-tour-summary').textContent(),/Tour complete/);
 assert.equal(await page.locator('#lung-select').inputValue(),'');
 await page.locator('#lung-tour-start').click();
 await page.locator('#lung-tour-close').click();
 assert.match(await page.locator('#lung-tour-summary').textContent(),/Tour closed/);
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
 if(!fallback){
  // Simulate loss *after* the source model was ready and between pointer events.
  // A graphics crash must not throw, falsely report "ready", or disable text/tour access.
  await page.locator('#lung-stage canvas').evaluate(canvas=>{
   canvas.dispatchEvent(new MouseEvent('pointerdown',{clientX:110,clientY:110,bubbles:true}));
   canvas.dispatchEvent(new Event('webglcontextlost',{cancelable:true}));
   canvas.dispatchEvent(new MouseEvent('pointerup',{clientX:110,clientY:110,bubbles:true}));
  });
  assert.equal(await page.locator('#lung-stage').getAttribute('data-model-status'),'unavailable');
  assert.equal(await page.locator('#lung-stage').getAttribute('tabindex'),null);
  assert.equal(await page.locator('#lung-separate').isDisabled(),true);
  assert.match(await page.locator('#model-status').textContent(),/graphics unavailable/i);
  assert.equal(await page.locator('#lung-stage canvas').isVisible(),false);
  await page.locator('#lung-tour-start').click();
  assert.equal(await page.locator('#lung-select').inputValue(),'FMA7338');
  await page.locator('#lung-tour-close').click();
  await page.locator('#lung-select').selectOption('FMA7394');
  assert.match(await page.locator('#lung-note-name').textContent(),/Trachea/);
 }
 assert.deepEqual(errors,[]);
 console.log('PASS: '+name+' source respiratory geometry, mobile tour, graphics-loss recovery and text fallback');
}catch(e){
 console.error('FAIL: '+name+' 3D lungs browser:',e.stack);process.exitCode=1;
}finally{await browser.close();}
