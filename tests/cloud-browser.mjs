import {chromium,devices} from 'playwright';
import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {unzipSync,strFromU8} from 'fflate';
import * as THREE from 'three';
import {STLExporter} from 'three/addons/exporters/STLExporter.js';
import {handleFilesRequest} from '../server/cloud-files.mjs';
import {handleLibraryRequest} from '../server/cloud-library.mjs';
import {CloudBucket} from './helpers/cloud-bucket.mjs';
const bucket=new CloudBucket(),base='https://cloud.3dvision.test/workshop/index.html',results=[],errors=[];
const browser=await chromium.launch({args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
await mkdir('test-results',{recursive:true});
async function device(user,mobile=false){
 const context=await browser.newContext({...(mobile?devices['iPhone 13']:{viewport:{width:1440,height:1000}}),acceptDownloads:true});let offline=false;
 await context.route('https://cloud.3dvision.test/**',async route=>{
  const incoming=route.request(),url=new URL(incoming.url());
  if(url.pathname.startsWith('/api/')){
   if(offline)return route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'Test connection interrupted'})});
   const headers={...incoming.headers(),'oai-authenticated-user-id':user};
   const request=new Request(url,{method:incoming.method(),headers,...incoming.method()==='POST'?{body:incoming.postDataBuffer()}: {}});
   const response=await(url.pathname.startsWith('/api/library')?handleLibraryRequest:handleFilesRequest)(request,bucket);
   return route.fulfill({status:response.status,headers:Object.fromEntries(response.headers),body:Buffer.from(await response.arrayBuffer())});
  }
  let name=decodeURIComponent(url.pathname.replace(/^\/workshop\//,''));if(!name||name.endsWith('/'))name+='index.html';const file=path.resolve('dist',name);if(!file.startsWith(path.resolve('dist')+'/'))return route.fulfill({status:403});
  try{await route.fulfill({body:await readFile(file),contentType:{'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.glb':'model/gltf-binary'}[path.extname(name)]||'application/octet-stream'});}catch{await route.fulfill({status:404});}
 });
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base);await page.waitForFunction(()=>window.vision?.ready,null,{timeout:45000});await page.evaluate(()=>vision.cloud.flush());return{page,context,setOffline:value=>offline=value};
}
const report=name=>{results.push({name,status:'PASS'});console.log('PASS:',name)};
const clear=async p=>{await p.locator('#new').click();await p.getByRole('button',{name:'Create empty workspace',exact:true}).click()};
let a,b,c;
try{
 a=await device('account-A');await clear(a.page);await a.page.locator('#import').click();await a.page.locator('#import-units').selectOption('cm');await a.page.locator('#import-up').selectOption('z');
 const mesh=new THREE.Mesh(new THREE.BoxGeometry(10,10,10),new THREE.MeshStandardMaterial()),data=new STLExporter().parse(mesh,{binary:true}),buffer=Buffer.from(data.buffer,data.byteOffset,data.byteLength);
 await a.page.locator('#file-input').setInputFiles({name:'Cloud hinge original.stl',mimeType:'application/octet-stream',buffer});await a.page.waitForFunction(()=>document.getElementById('component-count').textContent==='1');await a.page.evaluate(()=>vision.cloud.flush());
 await a.page.locator('[data-left=files]').click();await a.page.locator('#file-search').fill('Cloud hinge original');const card=a.page.locator('#files-list .asset-card').filter({hasText:'Cloud hinge original.stl'});await card.getByRole('button',{name:'Organize'}).click();await a.page.locator('#dialog-body input').nth(0).fill('Cross-device hinge');await a.page.locator('#dialog-body input').nth(1).fill('Robot fixtures');await a.page.getByRole('button',{name:'Save file details'}).click();await a.page.evaluate(()=>vision.cloud.flush());report('Imported original, source units, display name and folder backed up from device A');
 await a.page.locator('[data-left=assembly]').click();await a.page.locator('.tree-row button').first().click();await a.page.locator('#duplicate').click();await a.page.locator('#position-x').fill('150');await a.page.locator('#apply-transform').click();await a.page.locator('#select-all').click();await a.page.locator('#joint-create').click();await a.page.locator('#joint-type').selectOption('revolute');await a.page.getByRole('button',{name:'Create joint',exact:true}).click();await a.page.locator('#joint-value').fill('30');await a.page.locator('#joint-apply').click();await a.page.locator('#title').fill('Cross-device robot');await a.page.locator('#save').click();await a.page.waitForFunction(()=>document.getElementById('save-state').textContent.includes('backed up to your account'));
 const originalProject=await a.page.evaluate(()=>vision.projectData());assert.ok(originalProject.projectId);report('Complete jointed assembly saved as an immutable cloud revision');
 b=await device('account-A',true);await b.page.locator('#cloud').click();await b.page.waitForSelector('#cloud-files .asset-card');const project=b.page.locator('#cloud-files .asset-card').filter({hasText:'Cross-device robot'});await project.getByRole('button',{name:'Open revision',exact:true}).click();await b.page.waitForFunction(()=>document.getElementById('status').textContent.includes('Project package reopened'));assert.equal(await b.page.locator('#component-count').textContent(),'2');assert.equal(await b.page.evaluate(()=>vision.workshop.root.userData.joints[0].value),30);assert.equal(await b.page.evaluate(()=>vision.projectData().projectId),originalProject.projectId);report('Fresh device B restores geometry, joint travel and stable project identity');
 await clear(b.page);await b.page.locator('#cloud').click();await b.page.locator('#cloud-view').selectOption('assets');await b.page.locator('#cloud-search').fill('Robot fixtures');const saved=b.page.locator('#cloud-files .asset-card').filter({hasText:'Cross-device hinge'});await saved.getByRole('button',{name:'Open',exact:true}).click();await b.page.waitForFunction(()=>document.getElementById('component-count').textContent==='1');assert.ok(Math.abs(await b.page.evaluate(()=>vision.inspect(vision.workshop.root.children[0]).size[0])-100)<.01);report('Cloud file reopen preserves centimeter import settings and searchable folder labels');
 c=await device('account-B');await c.page.locator('#cloud').click();assert.equal(await c.page.locator('#cloud-files .asset-card').filter({hasText:'Cross-device robot'}).count(),0);report('A different signed-in account cannot list the first account’s project');
 a.setOffline(true);await a.page.locator('#save').click();await a.page.waitForFunction(()=>document.getElementById('status').textContent.includes('Cloud backup failed'));assert.match(await a.page.locator('#save-state').textContent(),/saved on this device/);assert.match(await a.page.locator('#cloud').textContent(),/retry/);report('Cloud interruption retains the local revision and reports the failed backup');
 a.setOffline(false);await a.page.locator('#cloud').click();await a.page.getByRole('button',{name:'Back up current project',exact:true}).click();await a.page.waitForFunction(()=>document.getElementById('save-state').textContent.includes('backed up to your account'));await a.page.locator('#close-dialog').click();await b.page.locator('#cloud').click();await b.page.locator('#cloud-search').fill('');await b.page.locator('#cloud-view').selectOption('projects');await b.page.getByRole('button',{name:'Refresh',exact:true}).click();const revisions=b.page.locator('#cloud-files .asset-card').filter({hasText:'Cross-device robot'}).locator('option');assert.equal(await revisions.count(),2);report('Retry creates another retained revision instead of overwriting the other device’s saved work');
 assert.match(await b.page.locator('#cloud-usage').textContent(),/unique blobs.*2 revisions/);
 const downloading=b.page.waitForEvent('download');await b.page.getByRole('button',{name:'Download account backup',exact:true}).click();const backup=await downloading;const zip=unzipSync(new Uint8Array(await readFile(await backup.path())));const manifest=JSON.parse(strFromU8(zip['manifest.json']));assert.equal(manifest.entries.filter(e=>e.kind==='project').length,2);assert.ok(manifest.entries.some(e=>e.kind==='asset'&&e.folder==='Robot fixtures'));for(const f of manifest.files)assert.ok(zip['files/'+f.id]);report('Mobile cloud usage and recovery ZIP include every original and retained revision');
 assert.deepEqual(errors,[]);await b.page.screenshot({path:'test-results/cloud-two-device.png'});
}catch(e){console.error(e.stack);results.push({name:e.message,status:'FAIL'});process.exitCode=1;console.error('A:',await a?.page.locator('#status').textContent().catch(()=>''));console.error('B:',await b?.page.locator('#status').textContent().catch(()=>''));await b?.page.screenshot({path:'test-results/cloud-failure.png',timeout:3000}).catch(()=>{});}finally{await browser.close();await writeFile('test-results/cloud-results.json',JSON.stringify({scope:'Independent browser contexts with actual application/server handlers and deterministic bucket',results},null,2));}
