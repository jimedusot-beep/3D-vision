import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:390,height:844}});
await context.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){if(String(type).includes('webgl'))return null;return original.call(this,type,...args)}});
await context.route('https://recovery.test/**',async route=>{let p=new URL(route.request().url()).pathname;if(p.endsWith('/'))p+='index.html';try{const file=path.resolve('dist','.'+p);if(!file.startsWith(path.resolve('dist')+'/'))return route.fulfill({status:403});const bytes=await readFile(file);const ext=path.extname(p);await route.fulfill({body:bytes,contentType:{'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json'}[ext]||'application/octet-stream'})}catch{await route.fulfill({status:404})}});
const page=await context.newPage();
try{
 await page.goto('https://recovery.test/');await page.waitForFunction(()=>window.visionFiles?.ready);
 assert.ok(await page.locator('#graphics-note').isVisible());
 await page.locator('#file-input').setInputFiles([{name:'Recovery notes.md',mimeType:'text/markdown',buffer:Buffer.from('# Keep these notes\nSaved with graphics disabled.')}]);
 await page.waitForFunction(()=>document.getElementById('files-list').textContent.includes('Recovery notes.md'));
 await page.reload();await page.waitForFunction(()=>window.visionFiles?.ready);
 const card=page.locator('.asset-card').filter({hasText:'Recovery notes.md'});assert.equal(await card.count(),1);await card.getByRole('button',{name:'Read',exact:true}).click();
 assert.equal(await page.locator('#preview-text').textContent(),'# Keep these notes\nSaved with graphics disabled.');
 await page.locator('#cloud').click();await page.waitForFunction(()=>document.getElementById('cloud-state').textContent.includes('static host'));
 assert.ok(await page.getByRole('link',{name:'Open private cloud workshop →'}).isVisible());
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await mkdir('test-results',{recursive:true});await page.screenshot({path:'test-results/file-recovery-mobile.png'});
 console.log('PASS: files import, persist after reload, read and reach cloud link with WebGL disabled');
}finally{await browser.close()}
