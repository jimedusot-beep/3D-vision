// Post-deployment smoke test: inspect the actual public GitHub Pages URL,
// rather than a local dev server or an intercepted file route. Not anatomy
// validation. Models are checked for HTTP availability, GLB v2 header/size,
// and accessible launch links, without rendering unrelated models together.
import {chromium,devices} from 'playwright';
import assert from 'node:assert/strict';
const base=process.env.BASE_URL||'https://jimedusot-beep.github.io/3D-vision/';
if(!/^https:\/\//.test(base))throw Error('Public HTTPS base URL required');
const url=p=>new URL(p,base).href;
const models=[
 {page:'index.html',asset:'larynx.glb',min:100000},
 {page:'lungs.html',asset:'lungs.glb',bytes:3901260},
 {page:'diaphragm.html',asset:'diaphragm.glb',min:100000},
 {page:'oral.html',asset:'oral.glb',bytes:754496},
 {page:'pharynx.html',asset:'pharynx.glb',bytes:7148788},
 {page:'ear.html',asset:'ear.glb',bytes:1010340},
 {page:'neural.html',asset:'neural.glb',bytes:4650816}
];
const browser=await chromium.launch({args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const ctx=await browser.newContext({...devices['iPhone 13']});
 const page=await ctx.newPage();
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const root=await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
 assert.ok(root?.ok(),'Public main workshop is not reachable');
 assert.equal(await page.locator('a[href="./ANATOMY/SLP/systems.html"]').count(),1,
  'Main workshop must launch complete Atlas instead of old larynx-only preview');
 const hub=await page.goto(url('ANATOMY/SLP/systems.html'),{waitUntil:'domcontentloaded',timeout:60000});
 assert.ok(hub?.ok(),'Public SLP study hub must load');
 await page.waitForFunction(()=>document.querySelectorAll('.module-card').length===10,null,{timeout:30000});
 assert.equal(await page.locator('#anatomy-launcher .anatomy-launch').count(),7);
 assert.match(await page.locator('#anatomy-launcher').textContent(),/independently sourced 3D anatomy models/i);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 for(const item of models){
  assert.equal(await page.locator('#anatomy-launcher a[href="./'+item.page+'"]').count(),1);
  const resource=await ctx.request.get(url('ANATOMY/SLP/'+item.page),{timeout:45000});
  assert.equal(resource.status(),200,'Public anatomy HTML missing: '+item.page);
  const body=await resource.text();
  assert.match(body,/<script type="module"/,'Built module missing: '+item.page);
  const mesh=await ctx.request.get(url('models/slp/'+item.asset),{timeout:90000});
  assert.equal(mesh.status(),200,'Public anatomy geometry missing: '+item.asset);
  const bytes=await mesh.body();
  assert.equal(bytes.toString('ascii',0,4),'glTF','GLB magic invalid: '+item.asset);
  assert.equal(bytes.readUInt32LE(4),2,'GLB version invalid: '+item.asset);
  assert.equal(bytes.readUInt32LE(8),bytes.length,'GLB length corrupt: '+item.asset);
  if(item.bytes)assert.equal(bytes.length,item.bytes,'Stale/mismatched asset: '+item.asset);
  else assert.ok(bytes.length>=item.min,'Source asset implausibly small: '+item.asset);
 }
 for(const name of ['draco_decoder.js','draco_decoder.wasm','draco_wasm_wrapper.js']){
  const res=await ctx.request.get(url('models/slp/draco/'+name),{timeout:45000});
  assert.equal(res.status(),200,'Missing local Draco decoder: '+name);
  assert.ok((await res.body()).length>1000,'Invalid local decoder: '+name);
 }
 const catalog=await ctx.request.get(url('models/slp/neural-source-manifest.json'));
 assert.equal(catalog.status(),200,'Neural source JSON missing');
 const data=await catalog.json();
 assert.equal(data.nodes?.length,437,'Wrong neural source manifest');
 assert.deepEqual(errors,[]);
 console.log('PASS public Pages: 7 source GLB binaries, local Draco decoder, 10-topic Atlas and mobile launch links');
}finally{await browser.close();}
