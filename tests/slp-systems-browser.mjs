import {chromium,webkit,devices} from 'playwright';
import assert from 'node:assert/strict';
import {readFile,mkdir} from 'node:fs/promises';
import path from 'node:path';

const engine=process.env.BROWSER_ENGINE==='webkit'?webkit:chromium;
const name=process.env.BROWSER_ENGINE==='webkit'?'webkit':'chromium';
const browser=await engine.launch(name==='chromium'?{args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']}:{});
const origin='https://3dvision.test';
const errors=[];
async function routeFiles(context){
  await context.route(origin+'/**',async route=>{
    const url=new URL(route.request().url());
    const requestPath=decodeURIComponent(url.pathname);
    const resolved=path.resolve('dist','.'+requestPath);
    if(!resolved.startsWith(path.resolve('dist')+path.sep))return route.fulfill({status:403});
    try{
      const data=await readFile(resolved);
      const type={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json'}[path.extname(resolved)]||'application/octet-stream';
      return route.fulfill({body:data,contentType:type});
    }catch{return route.fulfill({status:404});}
  });
}
try{
  const ctx=await browser.newContext({...devices['iPhone 13']});
  await routeFiles(ctx);
  const page=await ctx.newPage();
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(origin+'/ANATOMY/SLP/systems.html');
  await page.waitForFunction(()=>document.querySelectorAll('.module-card').length===10,null,{timeout:25000});
  assert.equal(await page.locator('.module-card').count(),10);
  assert.equal(await page.locator('.module-card[data-active="true"]').count(),1);
  assert.match(await page.locator('#module-title').textContent(),/Respiratory system/);
  assert.equal(await page.locator('#respiratory-study').isVisible(),true);
  assert.match(await page.locator('#module-status').textContent(),/3D/);
  assert.equal(await page.locator('#systems-network').isVisible(),true);
  assert.equal(await page.locator('#module-open-3d').isVisible(),true);
  assert.equal(await page.locator('#model-target-link').getAttribute('href'),'./lungs.html');
  assert.equal(await page.locator('#term-grid .term').count(),10);
  assert.equal(await page.locator('#resp-options button').count(),3);
  assert.equal(await page.locator('#resp-next').isDisabled(),true);
  assert.match(await page.locator('#flow-description').textContent(),/INTO the lungs/);
  await page.locator('#flow-speak').click();
  assert.equal(await page.locator('#flow-speak').getAttribute('aria-pressed'),'true');
  assert.match(await page.locator('#flow-description').textContent(),/OUT from the lungs/);
  await page.locator('#resp-options button').filter({hasText:'Diaphragm'}).click();
  assert.match(await page.locator('#resp-answer').textContent(),/Correct/);
  assert.equal(await page.locator('#resp-next').isEnabled(),true);
  await page.locator('#resp-next').click();
  assert.match(await page.locator('#resp-score').textContent(),/Question 2 of 6/);
  await page.locator('#resp-restart').click();
  assert.match(await page.locator('#resp-score').textContent(),/Question 1 of 6.*0 correct/);
  await page.locator('button[data-module-id="swallowing"]').click();
  assert.match(await page.locator('#module-title').textContent(),/swallowing/i);
  assert.equal(await page.locator('#respiratory-study').isHidden(),true);
  assert.match(await page.locator('#module-status').textContent(),/Partial source-derived 3D/i);
  assert.equal(await page.locator('#module-open-3d').isVisible(),true);
  assert.equal(await page.locator('#model-target-link').getAttribute('href'),'./oral.html');
  await page.locator('button[data-module-id="articulation"]').click();
  assert.match(await page.locator('#module-status').textContent(),/Partial source-derived 3D/i);
  assert.equal(await page.locator('#model-target-link').getAttribute('href'),'./oral.html');
  await page.locator('button[data-module-id="resonance"]').click();
  assert.match(await page.locator('#module-status').textContent(),/Partial source-derived 3D/i);
  assert.equal(await page.locator('#module-open-3d').isVisible(),true);
  assert.equal(await page.locator('#model-target-link').getAttribute('href'),'./pharynx.html');
  await page.locator('button[data-module-id="hearing"]').click();
  assert.match(await page.locator('#module-status').textContent(),/Partial source-derived 3D/i);
  assert.equal(await page.locator('#module-open-3d').isVisible(),true);
  assert.equal(await page.locator('#model-target-link').getAttribute('href'),'./ear.html');
  await page.locator('button[data-module-id="phonation"]').click();
  assert.match(await page.locator('#module-status').textContent(),/3D/);
  assert.equal(await page.locator('#module-open-3d').isVisible(),true);
  assert.equal(await page.locator('#model-target-link').getAttribute('href'),'./index.html');
  await page.locator('button[data-module-id="respiration"]').click();
  assert.equal(await page.locator('#respiratory-study').isVisible(),true);
  assert.equal(await page.locator('#model-target-link').getAttribute('href'),'./lungs.html');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.goto(origin+'/ANATOMY/SLP/index.html');
  assert.equal(await page.locator('a[href="./systems.html"]').count(),2);
  assert.deepEqual(errors,[]);
  await mkdir('test-results',{recursive:true});
  await page.goto(origin+'/ANATOMY/SLP/systems.html');
  await page.screenshot({path:'test-results/slp-systems-'+name+'-iphone.png',fullPage:true});
  await page.waitForFunction(()=>['true','false'].includes(document.querySelector('#systems-network')?.dataset.available),null,{timeout:15000});
  const has3d=await page.locator('#systems-network').getAttribute('data-available')==='true';
  if(has3d){
    await page.locator('#systems-network canvas').evaluate(canvas=>{
      // Do not synthesize a pointerdown: WebKit rejects pointer capture for untrusted
      // events, unrelated to this application's WebGL-loss recovery.
      canvas.dispatchEvent(new Event('webglcontextlost',{cancelable:true}));
    });
    assert.equal(await page.locator('#systems-network').getAttribute('data-available'),'false');
    assert.equal(await page.locator('#systems-network').getAttribute('tabindex'),null);
    assert.equal(await page.locator('#systems-network canvas').isVisible(),false);
    await page.locator('button[data-module-id="hearing"]').click();
    assert.match(await page.locator('#module-title').textContent(),/Hearing and auditory processing/);
    assert.match(await page.locator('#systems-3d-status').textContent(),/3D map unavailable/);
    await page.locator('button[data-module-id="respiration"]').click();
    assert.equal(await page.locator('#respiratory-study').isVisible(),true);
    assert.match(await page.locator('#systems-3d-status').textContent(),/3D map unavailable/);
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: '+name+' iPhone SLP systems hub, respiratory study and graphics-loss native navigation');
}catch(e){
  console.error('FAIL: '+name+' SLP systems browser:',e.stack);
  process.exitCode=1;
}finally{await browser.close();}
