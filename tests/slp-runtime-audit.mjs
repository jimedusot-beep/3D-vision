// Audit the *published* Atlas, beyond the existing HTTP-only GLB smoke test.
// This measures model-ready times under GitHub runner conditions, not phone FPS.
// Run: BASE_URL=https://jimedusot-beep.github.io/3D-vision/ node tests/slp-runtime-audit.mjs
//      BROWSER_ENGINE=webkit BASE_URL=... node tests/slp-runtime-audit.mjs
import {chromium,webkit,devices} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile,appendFile} from 'node:fs/promises';
const base=process.env.BASE_URL||'https://jimedusot-beep.github.io/3D-vision/';
if(!/^https:\/\//.test(base))throw Error('Published HTTPS URL required');
const engineName=process.env.BROWSER_ENGINE==='webkit'?'webkit':'chromium';
const engine=engineName==='webkit'?webkit:chromium;
const definitions=[
  {id:'larynx',file:'index.html',stage:'#stage',source:'larynx.glb'},
  {id:'lungs',file:'lungs.html',stage:'#lung-stage',source:'lungs.glb'},
  {id:'diaphragm',file:'diaphragm.html',stage:'#diaphragm-stage',source:'diaphragm.glb'},
  {id:'oral',file:'oral.html',stage:'#oral-stage',source:'oral.glb'},
  {id:'pharynx',file:'pharynx.html',stage:'#pharynx-stage',source:'pharynx.glb'},
  {id:'ear',file:'ear.html',stage:'#ear-stage',source:'ear.glb'},
  {id:'neural',file:'neural.html',stage:'#neural-stage',source:'neural.glb'}
];
const browser=await engine.launch(engineName==='webkit'?{}:{
 args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']
});
const report={
 auditedAt:new Date().toISOString(),
 pageBase:base,
 browser:engineName,
 device:'Playwright iPhone 13 emulation on a GitHub runner (NOT actual iPhone hardware)',
 conditions:'Internet-dependent production load; no throttling; browser cache shared between routes',
 models:[],
 failures:[]
};
try{
 const context=await browser.newContext({...devices['iPhone 13']});
 for(const item of definitions){
  const page=await context.newPage(),errors=[],requests=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('requestfailed',request=>requests.push({url:request.url(),reason:request.failure()?.errorText}));
  const start=Date.now();
  let data={id:item.id,page:item.file,source:item.source};
  try{
   const response=await page.goto(new URL('ANATOMY/SLP/'+item.file,base).href,
    {waitUntil:'domcontentloaded',timeout:60000});
   assert.ok(response?.ok(),item.id+' live HTML HTTP '+response?.status());
   if(item.id==='larynx'){
    await page.locator('#mode-three').click({timeout:25000});
    await page.waitForFunction(()=>{
     const text=document.querySelector('#status')?.textContent||'';
     return /Licensed 3D source geometry loaded|Source anatomy unavailable/.test(text);
    },null,{timeout:90000});
    assert.match(await page.locator('#status').textContent(),/Licensed 3D source geometry loaded/,
     'Larynx failed to render real 3D source, only a concept map or text fallback loaded');
    assert.equal(await page.locator('#stage').evaluate(e=>e.classList.contains('mode-three')),true);
   }else{
    await page.waitForFunction(selector=>{
      const status=document.querySelector(selector)?.dataset.modelStatus;
      return status==='ready'||status==='unavailable';
    },item.stage,{timeout:90000});
    const status=await page.locator(item.stage).getAttribute('data-model-status');
    if(status!=='ready')throw Error(item.id+' data-model-status='+status+
      ': '+(await page.locator(item.stage).textContent()).slice(0,240));
   }
   const canvas=page.locator(item.stage+' canvas').first();
   assert.equal(await canvas.isVisible(),true,'3D canvas not visible');
   const dimensions=await canvas.evaluate(element=>{
    const box=element.getBoundingClientRect();
    return {width:Math.round(box.width),height:Math.round(box.height),
      backingWidth:element.width,backingHeight:element.height};
   });
   assert.ok(dimensions.width>=100&&dimensions.height>=100,'3D canvas lacks usable area');
   data={...data,readyMs:Date.now()-start,canvas:dimensions,
    telemetry:await page.evaluate(()=>{
     const resources=performance.getEntriesByType('resource');
     const models=resources.filter(x=>x.name.endsWith('.glb'));
     const scripts=resources.filter(x=>/\.(js|mjs)(\?|$)/.test(x.name));
     const bytes=entries=>entries.reduce((n,x)=>n+(x.transferSize||0),0);
     return {resourceCount:resources.length,glbRequests:models.length,
       glbTransferBytes:bytes(models),scriptTransferBytes:bytes(scripts),
       navigationDOMContentLoadedMs:Math.round(performance.getEntriesByType('navigation')[0]?.domContentLoadedEventEnd||0),
       jsHeapBytes:performance.memory?.usedJSHeapSize??null,
       deviceMemoryGB:navigator.deviceMemory??null};
    }),errors,failedRequests:requests};
   // User-facing contract: "Explode 3D" must visibly change the *canvas*,
   // never merely open a note, status message or concept text panel.
   // A visible source mesh should move, then return to 0% after Reassemble.
   const explodeButton=item.id==='larynx'?'#mode-explode':
     item.id==='lungs'?'#lung-explode':'#'+item.id+'-explode';
   const reassembleButton=item.id==='larynx'?'#explode-assemble':
     item.id==='lungs'?'#lung-assemble':'#'+item.id+'-assemble';
   const stageDataKey=item.id==='lungs'?'separation':'explosionAmount';
   const beforeExplosion=await canvas.screenshot({timeout:15000});
   assert.equal(await page.locator(explodeButton).isEnabled(),true,
     item.id+' actual 3D explode control not enabled after source load');
   await page.locator(explodeButton).click();
   await page.waitForFunction(({stage,key})=>
     Number(document.querySelector(stage)?.dataset[key])>0,
     {stage:item.stage,key:stageDataKey},{timeout:15000});
   await page.waitForTimeout(120); // let WebGL paint after the 3D transform
   const afterExplosion=await canvas.screenshot({timeout:15000});
   assert.notDeepEqual(afterExplosion,beforeExplosion,
     item.id+' explode click did not visibly change the actual 3D canvas');
   await page.locator(reassembleButton).click();
   await page.waitForFunction(({stage,key})=>
     Number(document.querySelector(stage)?.dataset[key])===0,
     {stage:item.stage,key:stageDataKey},{timeout:15000});
   data.explode3D={
     button:explodeButton,canvasPixelsChanged:true,reassembledAtZero:true
   };
   if(data.telemetry.glbRequests<1)throw Error('No real source GLB requested');
   if(errors.length)throw Error('Uncaught JavaScript errors: '+errors.slice(0,3).join(' | '));
   if(requests.length)throw Error('Failed network requests: '+JSON.stringify(requests.slice(0,3)));
   if(data.readyMs>12000)data.warning='Model took over 12 seconds to appear on this runner; investigate mobile bottlenecks.';
   console.log('PASS '+engineName+' '+item.id+': source mesh visible after '+data.readyMs+' ms, canvas '+dimensions.width+'×'+dimensions.height);
  }catch(error){
   data={...data,readyMs:Date.now()-start,error:String(error?.message||error).slice(0,800),
    errors,failedRequests:requests};
   report.failures.push({id:item.id,message:data.error});
   console.error('FAIL '+engineName+' '+item.id+': '+data.error);
  }finally{report.models.push(data);await page.close();}
 }
 await context.close();
}finally{await browser.close();}
await mkdir('test-results',{recursive:true});
const file='test-results/slp-runtime-audit-'+engineName+'.json';
await writeFile(file,JSON.stringify(report,null,2)+'\n');
const table='| Anatomy lab | Ready (ms) | Visible 3D | Notes |\n|---|---:|:---:|---|\n'+
 report.models.map(m=>'| '+m.id+' | '+(m.readyMs??'—')+' | '+(m.error?'No':'Yes')+
 ' | '+(m.error?'Error: '+m.error.replaceAll('|','/').slice(0,140):(m.warning||'Source GLB rendered'))+' |').join('\n');
if(process.env.GITHUB_STEP_SUMMARY)await appendFile(process.env.GITHUB_STEP_SUMMARY,
 '\n### SLP Atlas live 3D load audit — '+engineName+'\n\n'+
 '**Emulated iPhone 13, not physical-device performance.**\n\n'+table+'\n');
console.log('\n'+table);
if(report.failures.length){console.error('Live 3D rendering failed for: '+report.failures.map(x=>x.id).join(', '));process.exitCode=1;}
