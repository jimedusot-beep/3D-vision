// Opt-in Issue #31 diagnostics: real built files in iPhone-emulated Chromium/WebKit.
// Does NOT substitute for physical Safari, WebGL memory telemetry or VoiceOver.
import {chromium,webkit,devices} from 'playwright';
import {readFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

const browserName=process.env.BROWSER_ENGINE==='webkit'?'webkit':'chromium';
const engine=browserName==='webkit'?webkit:chromium;
const browser=await engine.launch(browserName==='webkit'?{}:{
 args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']
});
const origin='https://3dvision.test';
const cases=[
 {name:'larynx',url:'/ANATOMY/SLP/index.html?view=three&debug=1',
  stage:'#stage',picker:'#source-select',value:'posterior-crico-arytenoid',
  explode:'#mode-explode',assemble:'#explode-assemble'},
 {name:'oral',url:'/ANATOMY/SLP/oral.html?debug=1',
  stage:'#oral-stage',picker:'#oral-select',value:'tongue',
  explode:'#oral-explode',assemble:'#oral-assemble'},
 {name:'pharynx',url:'/ANATOMY/SLP/pharynx.html?debug=1',
  stage:'#pharynx-stage',picker:'#pharynx-select',value:'levator-veli-palatini',
  explode:'#pharynx-explode',assemble:'#pharynx-assemble'},
 {name:'ear',url:'/ANATOMY/SLP/ear.html?debug=1',
  stage:'#ear-stage',picker:'#ear-select',value:'cochlea',
  explode:'#ear-explode',assemble:'#ear-assemble'}
];
try{
 const ctx=await browser.newContext({...devices['iPhone 13']});
 const root=path.resolve('dist');
 await ctx.route('**/*',async route=>{
  if(new URL(route.request().url()).origin!==origin)return route.fulfill({status:403});
  try {
   const pathname=decodeURIComponent(new URL(route.request().url()).pathname);
   const file=path.resolve(root,'.'+pathname);
   if(!file.startsWith(root+path.sep))return route.fulfill({status:403});
   const bytes=await readFile(file);
   const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css',
    '.glb':'model/gltf-binary','.json':'application/json','.woff2':'font/woff2',
    '.svg':'image/svg+xml','.png':'image/png'}[path.extname(file)]||'application/octet-stream';
   return route.fulfill({body:bytes,contentType:mime});
  }catch{return route.fulfill({status:404});}
 });
 await mkdir('test-results',{recursive:true});
 for(const item of cases){
  const page=await ctx.newPage();
  const errors=[];
  page.on('pageerror',err=>errors.push(err.message));
  try{
   await page.goto(origin+item.url,{waitUntil:'domcontentloaded'});
   const panel=page.locator('#slp-debug-panel');
   await panel.waitFor({timeout:12000});
   assert.equal(await panel.locator('summary').textContent(),
    'Diagnostics · '+item.name+' (local)');
   await page.waitForFunction(({stage,name})=>{
    const el=document.querySelector(stage);
    return name==='larynx'?
      /Licensed 3D source geometry loaded/.test(document.querySelector('#status')?.textContent||''):
      el?.dataset.modelStatus==='ready';
   },{stage:item.stage,name:item.name},{timeout:45000});
   const canvas=page.locator(item.stage+' canvas').first();
   assert.equal(await canvas.isVisible(),true,item.name+' missing real 3D canvas');
   await panel.locator('summary').click();
   // HTML <details> toggle dispatch may be queued after the click on Chromium.
   await page.waitForFunction(name=>
    document.querySelector('#slp-debug-output')?.textContent.includes('Lab: '+name),
    item.name,{timeout:6000});
   const text=await page.locator('#slp-debug-output').textContent();
   for(const expected of [
    'Lab: '+item.name,'Model load start (observed): 20',
    'Model load end (observed): 20','Model load error: none',
    'Canvas size: ','devicePixelRatio: ','WebGL renderer info: ',
    'WebGL context events: none','Canvas touch events: ',
    'window.onerror: none','unhandledrejection: none',
    'performance.memory: ','Memory warnings: ',
    'Last user action: none'
   ])assert.ok(text.includes(expected),item.name+' report missing '+expected);
   await panel.locator('summary').click();
   await canvas.tap({position:{x:60,y:80}});
   if(item.name==='larynx')await page.locator('#source-tools summary').click();
   await page.locator(item.picker).selectOption(item.value);
   await panel.locator('summary').click();
   await page.waitForFunction(value=>document.querySelector('#slp-debug-output')?.textContent.includes(
     'Last user action: ') && document.querySelector('#slp-debug-output')?.textContent.includes('select '+value),
    item.value,{timeout:5000});
   assert.match(await page.locator('#slp-debug-output').textContent(),
    /Canvas touch events: [1-9][0-9]*/);
   await panel.locator('summary').click();
   await page.locator(item.explode).click();
   await page.locator(item.assemble).click();
   await panel.locator('summary').click();
   await page.waitForFunction(()=>
    /Last user action: .*reassemble/.test(
     document.querySelector('#slp-debug-output')?.textContent||''),null,{timeout:6000});
   const after=await page.locator('#slp-debug-output').textContent();
   assert.match(after,/Last user action: .*reassemble/);
   assert.match(after,/window.onerror: none/);
   assert.match(after,/unhandledrejection: none/);
   assert.match(after,/Model load error: none/);
   await page.locator('#slp-debug-copy').click();
   const copyStatus=await page.locator('#slp-debug-copy-status').textContent();
   assert.match(copyStatus,/Copied|Clipboard blocked/);
   assert.deepEqual(errors,[],item.name+' introduced JavaScript errors');
   // The flag must not be sticky in localStorage or leaked into a regular page.
   await page.goto(origin+item.url.replace(/[?&]debug=1/g,''),{waitUntil:'domcontentloaded'});
   assert.equal(await page.locator('#slp-debug-panel').count(),0,
    item.name+' displayed diagnostics without opt-in');
   assert.deepEqual(errors,[],item.name+' non-debug page emitted JavaScript errors');
   console.log('PASS '+browserName+' '+item.name+' debug=1 report, canvas touch, select, explode/reassemble and no-flag absence');
  }finally{await page.close();}
 }
 await ctx.close();
}finally{await browser.close();}
