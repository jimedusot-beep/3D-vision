import {chromium, webkit, devices} from 'playwright';
import assert from 'node:assert/strict';
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import * as THREE from 'three';
import {STLExporter} from 'three/addons/exporters/STLExporter.js';
import {STLLoader} from 'three/addons/loaders/STLLoader.js';
const engine=process.env.BROWSER_ENGINE||'chromium', useWebkit=engine==='webkit', mobile=useWebkit||process.env.MOBILE==='1';
const base=process.env.BASE_URL||'https://3dvision.test/';
const results=[],errors=[];
await mkdir('test-results',{recursive:true});
const proxyUrl=process.env.BASE_URL&&(process.env.HTTPS_PROXY||process.env.HTTP_PROXY);
const proxy=proxyUrl?(()=>{const u=new URL(proxyUrl);return{server:u.origin,...(u.username?{username:decodeURIComponent(u.username),password:decodeURIComponent(u.password)}:{})};})():undefined;
const browser=await (useWebkit?webkit:chromium).launch({proxy,...(!useWebkit?{args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']}: {})});
const context=await browser.newContext({...mobile?devices['iPhone 13']:{viewport:{width:1440,height:1000}},acceptDownloads:true});
if(!process.env.BASE_URL)await context.route('https://3dvision.test/**',async route=>{
 let p=decodeURIComponent(new URL(route.request().url()).pathname);if(p.endsWith('/'))p+='index.html';
 const file=path.resolve('dist','.'+p);if(!file.startsWith(path.resolve('dist')+'/'))return route.fulfill({status:403});
 try{await route.fulfill({body:await readFile(file),contentType:{'.js':'text/javascript','.html':'text/html','.css':'text/css','.json':'application/json','.glb':'model/gltf-binary'}[path.extname(p)]||'application/octet-stream'});}catch{await route.fulfill({status:404});}
});
const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
const ready=()=>page.waitForFunction(()=>window.vision?.ready,null,{timeout:45000});
const report=name=>{results.push({name,status:'PASS'});console.log('PASS:',engine,name);};
const count=()=>page.locator('#component-count').textContent();
const clear=async()=>{await page.locator('#new').click();await page.getByRole('button',{name:'Create empty workspace',exact:true}).click();};
async function inspector(){if(mobile&&!await page.locator('#right-panel').evaluate(e=>e.classList.contains('open')))await page.locator('#mobile-inspector').click();}
async function left(tab='assembly'){if(mobile){if(!await page.locator('#left-panel').evaluate(e=>e.classList.contains('open'))||!await page.locator(`#${tab}-panel`).isVisible())await page.locator(tab==='catalog'?'#mobile-library':'#mobile-tree').click();}else await page.locator(`[data-left=${tab}]`).click();}
async function select(index){await left();await page.locator('.tree-row button').nth(index).click();await inspector();}
const position=()=>page.evaluate(()=>vision.workshop.root.children[1].position.toArray());
async function close(a,b){assert.ok(Math.abs(a-b)<.002,`${a} ≈ ${b}`);}
const bytes=g=>{const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial());const data=new STLExporter().parse(m,{binary:true});return Buffer.from(data.buffer,data.byteOffset,data.byteLength);};
const cube=bytes(new THREE.BoxGeometry(10,10,10));
try{
 await page.goto(base);await ready();assert.equal(await count(),'18');
 await left('catalog');await page.locator('#catalog-search').fill('Skeleton_Assembly.glb');assert.equal(await page.locator('#catalog-list button').count(),1);
 await clear();await left('catalog');await page.locator('#catalog-list button').click();await page.waitForFunction(()=>document.getElementById('status').textContent.includes('Loaded Skeleton_Assembly.glb'));
 const max=await page.evaluate(()=>Math.max(...vision.workshop.root.children.flatMap(m=>vision.inspect(m).size)));
 assert.ok(max>50&&max<1500,`Correct millimeter dimensions: ${max}`);
 const up=await page.evaluate(async()=>{vision.select([]);const glb=await vision.makeExport('glb');const objects=await vision.parseModel(new File([await glb.arrayBuffer()],'round.glb'));return Math.max(...objects.flatMap(m=>vision.inspect(m).size));});await close(up,max);report('Skeleton experiment imports at source mm/Z-up and standard GLB export roundtrips');
 await page.locator('#import').click();await page.locator('#import-units').selectOption('in');await page.locator('#import-up').selectOption('y');await page.locator('#close-dialog').click();
 await clear();await left('catalog');await page.locator('#catalog-search').fill('HBR-001.stl');await page.locator('#catalog-list button').click();await page.waitForFunction(()=>document.getElementById('component-count').textContent==='1');
 const sourceBytes=await readFile('HERBIE_V1/STL/HBR-001.stl'),source=new STLLoader().parse(sourceBytes.buffer.slice(sourceBytes.byteOffset,sourceBytes.byteOffset+sourceBytes.byteLength));
 source.computeBoundingBox();const expected=source.boundingBox.getSize(new THREE.Vector3()).toArray();const actual=await page.evaluate(()=>vision.inspect(vision.workshop.root.children[0]).size);for(let i=0;i<3;i++)await close(actual[i],expected[i]);report('Repository STL coordinates ignore unrelated device-import settings');await page.locator('#import').click();await page.locator('#close-dialog').click();

 await clear();await page.locator('#file-input').setInputFiles([{name:'Hinge-parent.stl',mimeType:'application/octet-stream',buffer:cube},{name:'Hinge-driven.stl',mimeType:'application/octet-stream',buffer:cube}]);await page.waitForFunction(()=>document.getElementById('component-count').textContent==='2');
 await select(1);await page.locator('#position-x').fill('30');await page.locator('#apply-transform').click();
 await left();await page.locator('#select-all').click();await inspector();await page.locator('#joint-create').click();await page.locator('#joint-type').selectOption('revolute');await page.getByRole('button',{name:'Create joint',exact:true}).click();assert.equal(await page.locator('#joint-list option').count(),1);
 await page.locator('#joint-value').fill('90');await page.locator('#joint-apply').click();const p=await position();await close(p[0],0);await close(p[1],30);
 await select(1);assert.equal(await page.locator('#position-x').isDisabled(),true);report('Revolute joint rotates about its parent axis and controls its driven component');
 await select(0);await page.locator('#position-x').fill('10');await page.locator('#apply-transform').click();await close((await position())[0],10);await close((await position())[1],30);
 await page.locator('#undo').click();await close((await position())[0],0);await page.locator('#redo').click();await close((await position())[0],10);report('Parent movement propagates through the joint; undo and redo preserve constraints');
 await left();await page.locator('#select-all').click();await page.locator('#group').click();assert.match(await page.locator('#status').textContent(),/top-level/);assert.equal(await count(),'2');assert.equal(await page.locator('#joint-list option').count(),1);report('Unsupported grouping rolls back atomically without damaging parts or joints');
 await inspector();
 // Issue #24: entering invalid input must not rebuild the root or add undo
 // checkpoints, especially immediately before the Animate button is clicked.
 await page.evaluate(()=>{window.__jointRootBeforeInvalid=vision.workshop.root;});
 const historyBefore=await page.evaluate(()=>vision.workshop.past.length);
 for(let n=0;n<3;n++){
   await page.locator('#joint-value').fill('999');
   await page.locator('#joint-apply').click();
   assert.match(await page.locator('#status').textContent(),/travel must be between/);
   assert.equal(await page.evaluate(()=>vision.workshop.root===window.__jointRootBeforeInvalid),true,
     'Bad input must not rebuild the scene root');
   assert.equal(await page.evaluate(()=>vision.workshop.past.length),historyBefore,
     'Bad input must not checkpoint/overwrite undo history');
   assert.equal(await page.locator('#joint-value').inputValue(),'90',
     'Show the last good value instead of stale 999');
   await close(await page.evaluate(()=>vision.workshop.root.userData.joints[0].value),90);
   await close((await position())[1],30);
 }
 await page.locator('#joint-animate').click();
 const justStarted=await page.evaluate(()=>({
   value:vision.workshop.root.userData.joints[0].value,
   button:document.getElementById('joint-animate').textContent,
   status:document.getElementById('status').textContent,
   selected:document.getElementById('joint-list').value,
   error:document.getElementById('status').classList.contains('status-error')
 }));
 assert.equal(justStarted.button,'Pause joint','Animation must start: '+JSON.stringify(justStarted));
 assert.ok(Number.isFinite(justStarted.value)&&justStarted.value>=-180&&justStarted.value<=180,
   'Joint animation must retain a valid pose at launch: '+JSON.stringify(justStarted));
 assert.match(justStarted.status,/Joint animation running/);
 // A real frame can land near the original pose as the sine wave advances.
 // Check meaningful animation travel over time, not a single sampled phase.
 await page.waitForFunction(()=>Math.abs(vision.workshop.root.userData.joints[0].value-90)>1,
   null,{timeout:8000});
 await page.locator('#joint-animate').click();
 await page.waitForFunction(()=>document.getElementById('joint-animate').textContent==='Animate joint');
 const savedValue=await page.evaluate(()=>vision.workshop.root.userData.joints[0].value);
 assert.ok(savedValue>=-180&&savedValue<=180);
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 await close(await page.evaluate(()=>vision.workshop.root.userData.joints[0].value),savedValue);
 report('Invalid travel preserves root and undo history; animation primes immediately and pauses at a saveable pose');
 await page.locator('#save').click();await page.waitForFunction(()=>document.getElementById('status').textContent.includes('Revision saved'));await page.reload();await ready();assert.equal(await page.locator('#joint-list option').count(),1);await close(await page.evaluate(()=>vision.workshop.root.userData.joints[0].value),savedValue);
 await inspector();await page.locator('#joint-value').fill('45');await page.locator('#joint-apply').click();const downloads=page.waitForEvent('download');await page.locator('#export').click();await page.getByRole('button',{name:'Download complete project (.3dv)',exact:true}).click();const file=path.resolve('test-results/jointed-'+engine+'.3dv');await(await downloads).saveAs(file);await page.locator('#close-dialog').click();await clear();await page.locator('#file-input').setInputFiles(file);await page.waitForFunction(()=>document.getElementById('status').textContent.includes('Project package reopened'));
 assert.equal(await page.locator('#joint-list option').count(),1);await inspector();await page.locator('#joint-value').fill('0');await page.locator('#joint-apply').click();await close((await position())[0],40);await close((await position())[1],0);report('Joints survive IndexedDB reload and a downloaded/reimported complete project package');
 await page.locator('#joint-remove').click();await left();await page.locator('#select-all').click();await inspector();await page.locator('#joint-create').click();await page.locator('#joint-type').selectOption('prismatic');await page.locator('#joint-axis').selectOption('z');await page.getByRole('button',{name:'Create joint',exact:true}).click();await page.locator('#joint-value').fill('12.5');await page.locator('#joint-apply').click();await close((await position())[2],12.5);await page.locator('#joint-remove').click();await close((await position())[2],12.5);report('Prismatic travel uses millimeters; removing a joint retains its pose');
 await page.locator('#joint-create').click();await page.getByRole('button',{name:'Create joint',exact:true}).click();assert.equal(await page.locator('#joint-value').isDisabled(),true);await page.locator('#joint-remove').click();report('Fixed joints retain relative placement without editable travel');
 // A real surface click places an attached note; moving its component moves the label.
 await clear();await page.locator('#file-input').setInputFiles({name:'Annotation-cube.stl',mimeType:'application/octet-stream',buffer:cube});await page.waitForFunction(()=>document.getElementById('component-count').textContent==='1');await inspector();await page.locator('#annotate').click();const rect=await page.locator('#viewport').boundingBox();await page.locator('#viewport').click({position:{x:rect.width/2,y:rect.height/2}});await page.waitForSelector('#dialog[open]');await page.locator('#dialog-body input').fill('Attached surface');await page.getByRole('button',{name:'Place label',exact:true}).click();
 const attached=await page.evaluate(()=>vision.workshop.root.userData.annotations[0]);assert.ok(attached.componentId&&attached.localPoint);await select(0);await page.locator('#position-z').fill('25');await page.locator('#apply-transform').click();await page.waitForSelector('.annotation-label');assert.equal(await page.locator('.annotation-label').filter({hasText:'Attached surface'}).count(),1);report('Surface annotation is attached to a component rather than a fixed world point');
 await clear();await page.locator('#file-input').setInputFiles([{name:'Collision-A.stl',mimeType:'application/octet-stream',buffer:cube},{name:'Collision-B.stl',mimeType:'application/octet-stream',buffer:cube}]);await page.waitForFunction(()=>document.getElementById('component-count').textContent==='2');await select(1);await page.locator('#position-x').fill('5');await page.locator('#apply-transform').click();await left();await page.locator('#select-all').click();await inspector();await page.locator('#collision').click();await page.waitForFunction(()=>vision.analysis?.type==='interference');assert.equal(await page.evaluate(()=>vision.analysis.results[0].kind),'surface');assert.match(await page.locator('#report').textContent(),/SURFACE/);report('Geometry worker detects triangle interference rather than only box overlap');
 const thin=bytes(new THREE.BoxGeometry(20,20,.6));await clear();await page.locator('#file-input').setInputFiles({name:'Thin-plate.stl',mimeType:'application/octet-stream',buffer:thin});await page.waitForFunction(()=>document.getElementById('component-count').textContent==='1');await inspector();await page.locator('#thickness').evaluate(el=>el.closest('details').open=true);await page.locator('#thickness').click();await page.waitForFunction(()=>vision.analysis?.type==='thickness');const thickness=await page.evaluate(()=>vision.analysis.results[0]);assert.ok(thickness.thin>0);await close(thickness.minimum,.6);assert.match(await page.locator('#report').textContent(),/Sampled minimum 0.6000/);assert.match(await page.locator('#report').textContent(),/Print readiness: UNVERIFIED/);
 const dl=page.waitForEvent('download');await page.locator('#download-report').click();const json=path.resolve('test-results/thickness-'+engine+'.json');await(await dl).saveAs(json);assert.equal(JSON.parse(await readFile(json,'utf8')).type,'thickness');report('Thin-wall sampler flags a 0.6 mm plate and exports a clearly qualified JSON report');
 if(mobile)await page.locator('#close-right').click();await page.locator('#fit').click();await page.waitForTimeout(1200);const frames=await page.evaluate(()=>vision.frames);await page.waitForTimeout(500);assert.equal(await page.evaluate(()=>vision.frames),frames);await page.locator('#projection').click();await page.waitForFunction(n=>vision.frames>n,frames);report('Idle rendering stops and camera changes wake the viewport');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);assert.deepEqual(errors,[]);await page.screenshot({path:`test-results/advanced-${engine}.png`});
}catch(e){console.error('FAIL advanced:',engine,e.stack);console.error('Status:',await page.locator('#status').textContent().catch(()=>''));console.error(errors);results.push({name:e.message,status:'FAIL'});process.exitCode=1;await page.screenshot({path:`test-results/advanced-${engine}-failure.png`,timeout:3000}).catch(()=>{});}finally{await context.close();await browser.close();await writeFile(`test-results/advanced-${engine}-results.json`,JSON.stringify({engine,base,results},null,2));}
