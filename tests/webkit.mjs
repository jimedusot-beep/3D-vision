import {webkit,devices} from 'playwright';
import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
await mkdir('test-results',{recursive:true});let browser;const results=[];const base=process.env.BASE_URL||'https://3dvision.test/';
try{
 browser=await webkit.launch();const context=await browser.newContext({...devices['iPhone 13']});
 if(!process.env.BASE_URL)await context.route('https://3dvision.test/**',async route=>{let p=new URL(route.request().url()).pathname;if(p.endsWith('/'))p+='index.html';const ext=path.extname(p);try{const body=await readFile(path.resolve('dist','.'+p));await route.fulfill({body,contentType:{'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.glb':'model/gltf-binary'}[ext]||'application/octet-stream'});}catch{await route.fulfill({status:404});}});
 const page=await context.newPage();page.on('console',m=>{if(m.type()==='error')console.error('WebKit console:',m.text())});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base);await page.waitForFunction(()=>window.vision?.ready,null,{timeout:30000});assert.equal(await page.locator('#component-count').textContent(),'18',await page.locator('#status').textContent());results.push('Real assembled GLB: 18 meshes');
 await page.locator('#mobile-library').click();await page.locator('#herbie-exploded').click();await page.waitForFunction(()=>document.getElementById('status').textContent.includes('exploded · 18'));results.push('Original exploded GLB');
 await page.locator('#mobile-tree').click();await page.locator('.tree-row button').first().click();await page.locator('#mobile-inspector').click();await page.locator('#position-x').fill('23');await page.locator('#apply-transform').click();assert.equal(await page.evaluate(()=>vision.selected[0].position.x),23);await page.locator('#close-right').click();results.push('Touch panels and numeric transform');
 await page.locator('#save').click();await page.waitForFunction(()=>document.getElementById('status').textContent.includes('Revision saved'));await page.reload();await page.waitForFunction(()=>vision?.ready,null,{timeout:30000});assert.equal(await page.locator('#component-count').textContent(),'18');assert.equal(await page.evaluate(()=>vision.workshop.root.children[0].position.x),23);results.push('IndexedDB save/reload retains positions');
 await page.locator('#file-input').setInputFiles('HERBIE_V1/STL/HBR-001.stl');await page.waitForFunction(()=>document.getElementById('component-count').textContent==='19');results.push('Device STL import into assembly');
 const size=await page.evaluate(async()=>{vision.select([]);const blob=await vision.makeExport('glb');return blob.size;});assert.ok(size>1000);results.push('GLB export');
 const tripwire=await context.newPage();await tripwire.goto(new URL('?example=mcgruber-tripwire-exploded',base).href);
 await tripwire.waitForFunction(()=>window.vision?.ready,null,{timeout:30000});
 await tripwire.waitForFunction(()=>document.getElementById('component-count').textContent==='13',null,{timeout:15000});
 assert.match(await tripwire.locator('#title').inputValue(),/tripwire.*exploded/i);
 assert.equal(await tripwire.locator('#stage-badge').getAttribute('data-context'),'tripwire');
 assert.match(await tripwire.locator('#stage-badge').textContent(),/NOT MEASURED/);
 await tripwire.close();results.push('Direct 13-part tripwire deep link on iPhone WebKit');


 const b=await context.newPage();
 for(const [model,expected,stage] of [
  ['mcgruber-visible-b-assembled','16','tripwire-b'],
  ['mcgruber-infrared-c-assembled','15','tripwire-c']]){
  await b.goto(new URL('?example='+model,base).href);
  await b.waitForFunction(()=>window.vision?.ready,null,{timeout:30000});
  await b.waitForFunction(n=>document.getElementById('component-count').textContent===n,expected,{timeout:15000});
  assert.equal(await b.locator('#stage-badge').getAttribute('data-context'),stage);
  assert.equal(await b.locator('#optical-switcher').isVisible(),true);
  assert.equal(await b.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 }
 await b.locator('#optical-beam').click();
 await b.waitForFunction(()=>window.vision?.ready&&document.getElementById('optical-switcher')?.dataset.beam==='blocked',null,{timeout:30000});
 assert.match(await b.locator('#tree').textContent(),/Silent warning LED ON/);
 assert.match(await b.locator('#stage-badge').textContent(),/HARDWARE UNTESTED/);
 await b.screenshot({path:'test-results/silent-tripwire-c-iphone.png',timeout:10000});
 await b.close();results.push('Real B/C generated meshes, touch viewport, symbolic IR indication and honest status on iPhone WebKit');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);assert.deepEqual(errors,[]);await page.screenshot({path:'test-results/webkit-mobile.png',timeout:10000});console.log('PASS: WebKit iPhone emulation: '+results.join('; '));
}catch(e){console.error('FAIL: WebKit:',e.stack);results.push('FAIL: '+e.message);process.exitCode=1;}finally{await browser?.close();await writeFile('test-results/webkit-results.json',JSON.stringify({engine:'Playwright WebKit',platform:process.platform,results},null,2));}
