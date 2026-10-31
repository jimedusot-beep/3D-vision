// E2E regression: transient source download failure must expose a real, usable
// Retry 3D control, then recover after the network becomes healthy.
import {chromium,webkit,devices} from 'playwright';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

const engineName=process.env.BROWSER_ENGINE==='webkit'?'webkit':'chromium';
const engine=engineName==='webkit'?webkit:chromium;
const browser=await engine.launch(engineName==='chromium'
 ?{args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']}:{});
const origin='https://3dvision.test';
try{
 for(const viewer of [
  {name:'larynx',page:'index.html?view=three',asset:'larynx.glb',stage:'#stage',
   failed:'#status',success:/Licensed 3D source geometry loaded/},
  {name:'diaphragm',page:'diaphragm.html',asset:'diaphragm.glb',
   stage:'#diaphragm-stage',success:/Licensed BodyParts3D 3.0 diaphragm/}
 ]){
  const ctx=await browser.newContext({...devices['iPhone 13']});
  await ctx.route(origin+'/**',async route=>{
   const request=decodeURIComponent(new URL(route.request().url()).pathname);
   const resolved=path.resolve('dist','.'+request);
   if(!resolved.startsWith(path.resolve('dist')+path.sep))return route.fulfill({status:403});
   try{
    const data=await readFile(resolved);
    const mime={'.html':'text/html','.js':'text/javascript',
     '.css':'text/css','.json':'application/json','.glb':'model/gltf-binary'}[path.extname(resolved)]||'application/octet-stream';
    return route.fulfill({body:data,contentType:mime});
   }catch{return route.fulfill({status:404});}
  });
  let downloadCount=0;
  const page=await ctx.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/models/slp/'+viewer.asset,async route=>{
   downloadCount++;
   if(downloadCount===1)return route.fulfill({status:503,body:'Temporary network failure'});
   return route.fallback();
  });
  await page.goto(origin+'/ANATOMY/SLP/'+viewer.page);
  if(viewer.name==='larynx'){
   await page.waitForFunction(()=>document.querySelector('#status')?.textContent.includes('Source anatomy unavailable'),
    null,{timeout:45000});
  }else{
   await page.waitForFunction(()=>document.querySelector('#diaphragm-stage')?.dataset.modelStatus==='unavailable',
    null,{timeout:45000});
   assert.equal(await page.locator('#diaphragm-fallback').isVisible(),true);
  }
  const retry=page.locator('.slp-retry-3d');
  assert.equal(await retry.isVisible(),true,viewer.name+' must expose recovery after a real failed GLB request');
  assert.equal(await retry.isEnabled(),true);
  assert.match(await retry.getAttribute('aria-label'),/Retry loading the real 3D anatomy model/);
  if(viewer.name==='diaphragm'){
   await Promise.all([page.waitForNavigation({waitUntil:'domcontentloaded'}),retry.click()]);
   await page.waitForFunction(()=>document.querySelector('#diaphragm-stage')?.dataset.modelStatus==='ready',
    null,{timeout:60000});
   assert.match(await page.locator('#diaphragm-status').textContent(),viewer.success);
  }else{
   await retry.click();
   await page.waitForFunction(()=>/Licensed 3D source geometry loaded/.test(
    document.querySelector('#status')?.textContent||''),null,{timeout:60000});
   assert.match(await page.locator('#status').textContent(),viewer.success);
  }
  assert.ok(downloadCount>=2,viewer.name+' must actually request the source GLB again');
  assert.equal(await page.locator('.slp-retry-3d').isVisible(),false,
   viewer.name+' hides recovery after actual source-model success');
  assert.equal(await page.locator(viewer.stage+' canvas').first().isVisible(),true);
  assert.deepEqual(errors,[],'No uncaught errors during retry');
  console.log('PASS '+engineName+' '+viewer.name+' transient download -> Retry 3D -> licensed source canvas');
  await ctx.close();
 }
}finally{await browser.close();}
