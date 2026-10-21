import {webkit,devices} from 'playwright';
import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
await mkdir('test-results',{recursive:true});let browser;const results=[];
try{
 browser=await webkit.launch();const context=await browser.newContext({...devices['iPhone 13']});
 await context.route('https://3dvision.test/**',async route=>{let p=new URL(route.request().url()).pathname;if(p.endsWith('/'))p+='index.html';const ext=path.extname(p);try{const body=await readFile(path.resolve('dist','.'+p));await route.fulfill({body,contentType:{'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.glb':'model/gltf-binary'}[ext]||'application/octet-stream'});}catch{await route.fulfill({status:404});}});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('https://3dvision.test/');await page.waitForFunction(()=>window.vision?.ready,null,{timeout:30000});assert.equal(await page.locator('#component-count').textContent(),'18');results.push('Real assembled GLB: 18 meshes');
 await page.locator('#mobile-library').click();await page.locator('#herbie-exploded').click();await page.waitForFunction(()=>document.getElementById('status').textContent.includes('exploded · 18'));results.push('Original exploded GLB');
 await page.locator('#mobile-tree').click();await page.locator('.tree-row button').first().click();await page.locator('#mobile-inspector').click();await page.locator('#position-x').fill('23');await page.locator('#apply-transform').click();assert.equal(await page.evaluate(()=>vision.selected[0].position.x),23);await page.locator('#close-right').click();results.push('Touch panels and numeric transform');
 await page.locator('#save').click();await page.waitForFunction(()=>document.getElementById('status').textContent.includes('Revision saved'));await page.reload();await page.waitForFunction(()=>vision?.ready,null,{timeout:30000});assert.equal(await page.locator('#component-count').textContent(),'18');assert.equal(await page.evaluate(()=>vision.workshop.root.children[0].position.x),23);results.push('IndexedDB save/reload retains positions');
 await page.locator('#file-input').setInputFiles('HERBIE_V1/STL/HBR-001.stl');await page.waitForFunction(()=>document.getElementById('component-count').textContent==='19');results.push('Device STL import into assembly');
 const size=await page.evaluate(async()=>{vision.select([]);const blob=await vision.makeExport('glb');return blob.size;});assert.ok(size>1000);results.push('GLB export');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);assert.deepEqual(errors,[]);await page.screenshot({path:'test-results/webkit-mobile.png',timeout:10000});console.log('PASS: WebKit iPhone emulation: '+results.join('; '));
}catch(e){console.error('FAIL: WebKit:',e.stack);results.push('FAIL: '+e.message);process.exitCode=1;}finally{await browser?.close();await writeFile('test-results/webkit-results.json',JSON.stringify({engine:'Playwright WebKit',platform:process.platform,results},null,2));}
