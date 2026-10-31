// Chromium-only simulated slow-connection/CPU audit of three large SLP labs.
// Measures a constrained GitHub runner, *not* measured 4G, real iPhone or GPU memory.
// Example: SLP_SLOW_AUDIT=1 node tests/slp-slow-mobile.mjs
import {chromium,devices} from 'playwright';
import {mkdir,writeFile,appendFile} from 'node:fs/promises';
const base=process.env.BASE_URL||'https://jimedusot-beep.github.io/3D-vision/';
if(!/^https:\/\//.test(base))throw Error('HTTPS deployment required');
const models=[
 {id:'larynx',page:'index.html?view=three',selector:'#stage'},
 {id:'pharynx',page:'pharynx.html',selector:'#pharynx-stage'},
 {id:'neural',page:'neural.html',selector:'#neural-stage'}
];
const report={
 date:new Date().toISOString(),url:base,engine:'Chromium CDP',
 device:'Simulated iPhone 13 on GitHub Actions (not physical hardware)',
 network:{latencyMs:150,downloadBytesPerSecond:300000,uploadBytesPerSecond:100000},
 cpuSlowdownFactor:2,
 cache:'disabled',results:[],errors:[]
};
const browser=await chromium.launch({args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 for(const model of models){
  const context=await browser.newContext({...devices['iPhone 13']});
  const page=await context.newPage();
  const cdp=await context.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
  // The mature CDP command is deprecated but remains supported in Playwright
  // Chromium; the newer by-rule API is experimental and runner-dependent.
  await cdp.send('Network.emulateNetworkConditions',{
   offline:false,latency:report.network.latencyMs,
   downloadThroughput:report.network.downloadBytesPerSecond,
   uploadThroughput:report.network.uploadBytesPerSecond,
   connectionType:'cellular4g'
  });
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:report.cpuSlowdownFactor});
  const failures=[],exceptions=[];
  page.on('requestfailed',r=>failures.push({url:r.url(),reason:r.failure()?.errorText}));
  page.on('pageerror',e=>exceptions.push(e.message));
  const start=Date.now();
  const item={id:model.id};
  try{
   const res=await page.goto(new URL('ANATOMY/SLP/'+model.page,base).href,{
    waitUntil:'domcontentloaded',timeout:90000
   });
   if(!res?.ok())throw Error('HTML HTTP '+res?.status());
   if(model.id==='larynx'){
    await page.waitForFunction(()=>/Licensed 3D source geometry loaded|Source anatomy unavailable/
      .test(document.querySelector('#status')?.textContent||''),null,{timeout:120000});
    const status=await page.locator('#status').textContent();
    if(!/Licensed 3D source geometry loaded/.test(status))throw Error('Larynx: '+status);
    if(!await page.locator('#stage').evaluate(e=>e.classList.contains('mode-three')))
     throw Error('Larynx did not enter the source geometry view');
   }else{
    await page.waitForFunction(sel=>
     ['ready','unavailable'].includes(document.querySelector(sel)?.dataset.modelStatus),
     model.selector,{timeout:120000});
    const status=await page.locator(model.selector).getAttribute('data-model-status');
    if(status!=='ready')throw Error(model.id+' source did not render: '+
     (await page.locator(model.selector).textContent()).slice(0,300));
   }
   const canvas=await page.locator(model.selector+' canvas').first();
   if(!await canvas.isVisible())throw Error('3D canvas not visible after model load');
   const rect=await canvas.boundingBox();
   if(!rect||rect.width<100||rect.height<100)throw Error('Canvas has invalid dimensions');
   item.readyMs=Date.now()-start;
   item.canvas={width:Math.round(rect.width),height:Math.round(rect.height)};
   item.transfer=await page.evaluate(()=>{
    const models=performance.getEntriesByType('resource').filter(e=>e.name.endsWith('.glb'));
    return {requestedGlbs:models.length,
     glbTransferBytes:models.reduce((sum,e)=>sum+(e.transferSize||0),0),
     glbDurationsMs:models.map(e=>Math.round(e.duration)),
     jsHeapUsedBytes:performance.memory?.usedJSHeapSize??null};
   });
   if(item.transfer.requestedGlbs<1)throw Error('No verified source GLB loaded');
   if(exceptions.length||failures.length)throw Error('Page errors or network failures: '+
    JSON.stringify({exceptions,failures}).slice(0,450));
   if(item.readyMs>60000)item.warning='Ready took >60 seconds under simulated constraints.';
   console.log('PASS simulated constrained '+item.id+' ready in '+item.readyMs+' ms');
  }catch(e){
   item.readyMs=Date.now()-start;item.error=String(e?.message||e).slice(0,750);
   item.exceptions=exceptions.slice(0,5);item.failedRequests=failures.slice(0,5);
   report.errors.push({id:model.id,error:item.error});
   console.error('FAIL simulated constrained '+item.id+': '+item.error);
  }finally{report.results.push(item);await context.close();}
 }
}finally{await browser.close();}
await mkdir('test-results',{recursive:true});
await writeFile('test-results/slp-slow-mobile.json',JSON.stringify(report,null,2)+'\n');
if(process.env.GITHUB_STEP_SUMMARY){
 const table='| Lab | 2× CPU + ~2.4 Mbps simulated download | Result |\n|---|---:|---|\n'+
  report.results.map(x=>'| '+x.id+' | '+x.readyMs+' ms | '+(x.error?'Failed: '+x.error.replaceAll('|','/').slice(0,100):'Visible model')+' |').join('\n');
 await appendFile(process.env.GITHUB_STEP_SUMMARY,'\n## SLP slower-network experiment\n\n'+
 '**Synthetic CDP throttling only; not a real phone, cellular carrier or GPU benchmark.**\n\n'+table+'\n');
}
if(report.errors.length)process.exitCode=1;
