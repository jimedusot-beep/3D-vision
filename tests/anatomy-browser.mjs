import {chromium,webkit,devices} from 'playwright';
import assert from 'node:assert/strict';
import {readFile,mkdir} from 'node:fs/promises';
import path from 'node:path';

const engine=process.env.BROWSER_ENGINE==='webkit'?webkit:chromium;
const name=process.env.BROWSER_ENGINE==='webkit'?'webkit':'chromium';
const browser=await engine.launch(name==='chromium'?{args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']}:{});
const origin='https://3dvision.test';
const contentType={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css'};
const host='<html><body><iframe title="anatomy" src="/ANATOMY/SLP/index.html"></iframe></body></html>';
const errors=[];
async function routeAssets(context) {
  await context.route(origin+'/**',async route=>{
    const url=new URL(route.request().url());
    if(url.pathname==='/test-host.html')return route.fulfill({body:host,contentType:'text/html'});
    const requestPath=decodeURIComponent(url.pathname);
    const normalized=path.resolve('dist','.'+requestPath);
    if(!normalized.startsWith(path.resolve('dist')+path.sep))return route.fulfill({status:403});
    try {
      const data=await readFile(normalized);
      return route.fulfill({body:data,contentType:contentType[path.extname(normalized)]||'application/octet-stream'});
    } catch{return route.fulfill({status:404});}
  });
}
try {
  const desktop=await browser.newContext({viewport:{width:1320,height:850}});
  await routeAssets(desktop);
  const page=await desktop.newPage();
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(origin+'/ANATOMY/SLP/index.html');
  await page.waitForFunction(()=>document.getElementById('status')?.textContent?.includes('ready.'),null,{timeout:30000});
  assert.equal(await page.locator('button[data-id]').count(),10);
  assert.match(await page.locator('#coverage-list').textContent(),/Epiglottis/);
  assert.equal(await page.locator('#study-reveal').isDisabled(),true);
  await page.locator('#study-next').click();
  assert.match(await page.locator('#study-question').textContent(),/largest cartilage/);
  assert.equal(await page.locator('#study-answer').isHidden(),true);
  await page.locator('#study-reveal').click();
  assert.match(await page.locator('#study-answer').textContent(),/Thyroid cartilage/);
  assert.equal(await page.locator('#study-sources a').count(),2);
  await page.locator('#study-next').click();
  assert.match(await page.locator('#study-question').textContent(),/complete ring/);
  assert.equal(await page.locator('#study-answer').isHidden(),true);
  assert.equal(await page.locator('#study-sources').isHidden(),true);
  await page.locator('button[data-id="left-vocal-fold"]').click();
  assert.match(await page.locator('#detail').textContent(),/Left vocal fold/);
  assert.match(await page.locator('#detail').textContent(),/NOT the approximate 3D shape/);
  const evidence=page.locator('#detail .evidence-links a');
  assert.equal(await evidence.count(),2);
  assert.ok((await evidence.first().getAttribute('href')).startsWith('https://'));
  assert.equal(await evidence.first().getAttribute('rel'),'noopener noreferrer');
  await page.locator('button[data-isolate="left-vocal-fold"]').click();
  assert.equal(await page.locator('button[data-isolate="left-vocal-fold"]').getAttribute('aria-pressed'),'true');
  await page.locator('#show-all').click();
  assert.equal(await page.locator('button[data-isolate="left-vocal-fold"]').getAttribute('aria-pressed'),'false');
  await page.locator('#transparent').check();
  await page.locator('#labels').uncheck();
  await page.locator('#reset').click();
  assert.equal(await page.locator('#transparent').isChecked(),false);
  assert.equal(await page.locator('#labels').isChecked(),true);
  await page.locator('#stage').focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#stage canvas').count(),1);
  assert.equal(await page.locator('button:disabled').count(),1);
  console.log('PASS: '+name+' desktop anatomy controls');

  // Force WebGL initialization failure: text references and recall must remain usable.
  const noGpu=await desktop.newPage();
  noGpu.on('pageerror',e=>errors.push(e.message));
  await noGpu.addInitScript(()=>{
    const original=HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext=function(type,...args) {
      if(['webgl','webgl2','experimental-webgl'].includes(type))return null;
      return original.call(this,type,...args);
    };
  });
  await noGpu.goto(origin+'/ANATOMY/SLP/index.html');
  await noGpu.waitForFunction(()=>document.getElementById('status')?.textContent?.includes('text-based anatomy study is ready.'));
  assert.equal(await noGpu.locator('#webgl-fallback').isVisible(),true);
  assert.equal(await noGpu.locator('button[data-id]').count(),10);
  await noGpu.locator('button[data-id="cricoid-cartilage"]').click();
  assert.match(await noGpu.locator('#detail').textContent(),/complete ring/);
  await noGpu.locator('#study-next').click();
  await noGpu.locator('#study-reveal').click();
  assert.equal(await noGpu.locator('#study-sources a').count(),2);
  await noGpu.locator('#reset').click();
  console.log('PASS: '+name+' WebGL-unavailable text and recall fallback');

  const parent=await desktop.newPage();
  await parent.goto(origin+'/test-host.html');
  const iframe=parent.frameLocator('iframe');
  await iframe.locator('#status').waitFor();
  const response=await parent.evaluate(()=>new Promise((resolve,reject)=>{
    const onMessage=e=>{if(e.data?.source==='3d-vision-anatomy'&&e.data.requestId==='request-1') {
      window.removeEventListener('message',onMessage);clearTimeout(timer);resolve(e.data);
    }};
    const timer=setTimeout(()=>{window.removeEventListener('message',onMessage);reject(Error('No anatomy response'));},8000);
    window.addEventListener('message',onMessage);
    document.querySelector('iframe').contentWindow.postMessage({source:'herbie',version:1,action:'select',structureId:'left-vocal-fold',requestId:'request-1'},location.origin);
  }));
  assert.equal(response.ok,true);
  assert.equal(response.selected,'left-vocal-fold');
  for(const requestId of ['isolate-once','isolate-twice']) {
    const answer=await parent.evaluate(requestId=>new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>{window.removeEventListener('message',onMessage);reject(Error('No isolate response'));},5000);
      function onMessage(e) {
        if(e.data?.source!=='3d-vision-anatomy'||e.data.requestId!==requestId)return;
        clearTimeout(timer);window.removeEventListener('message',onMessage);resolve(e.data);
      }
      window.addEventListener('message',onMessage);
      document.querySelector('iframe').contentWindow.postMessage(
        {source:'herbie',version:1,action:'isolate',structureId:'left-vocal-fold',requestId},location.origin
      );
    }),requestId);
    assert.equal(answer.ok,true);
    assert.equal(answer.isolated,'left-vocal-fold','Repeated host isolate must not toggle off');
  }
  console.log('PASS: '+name+' same-origin H.E.R.B.I.E. command contract');
  // A different parent origin cannot control the viewer without explicit embedOrigin opt-in.
  const outsider=await desktop.newPage();
  await outsider.route('https://untrusted.test/**',route=>route.fulfill({
    contentType:'text/html',
    body:'<html><body><iframe title="anatomy" src="https://3dvision.test/ANATOMY/SLP/index.html"></iframe></body></html>'
  }));
  await outsider.goto('https://untrusted.test/test.html');
  const restricted=outsider.frameLocator('iframe');
  await restricted.locator('button[data-id="left-vocal-fold"]').waitFor();
  await outsider.evaluate(()=>document.querySelector('iframe').contentWindow.postMessage(
    {source:'herbie',version:1,action:'select',structureId:'left-vocal-fold',requestId:'untrusted-1'},
    'https://3dvision.test'
  ));
  await outsider.waitForTimeout(250);
  assert.equal(await restricted.locator('button[data-id="left-vocal-fold"]').getAttribute('aria-pressed'),'false');
  console.log('PASS: '+name+' rejects commands from unapproved parent origins');

  const mobile=await browser.newContext({...devices['iPhone 13']});
  await routeAssets(mobile);
  const touch=await mobile.newPage();
  touch.on('pageerror',e=>errors.push(e.message));
  await touch.goto(origin+'/ANATOMY/SLP/index.html');
  await touch.waitForFunction(()=>document.getElementById('status')?.textContent?.includes('ready.'),null,{timeout:30000});
  await touch.locator('button[data-id="right-vocal-fold"]').click();
  assert.match(await touch.locator('#detail').textContent(),/Right vocal fold/);
  assert.equal(await touch.locator('#detail .evidence-links a').count(),2);
  await touch.locator('#study-next').click();
  await touch.locator('#study-reveal').click();
  assert.match(await touch.locator('#study-answer').textContent(),/Thyroid cartilage/);
  assert.equal(await touch.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  assert.deepEqual(errors,[]);
  await mkdir('test-results',{recursive:true});
  await touch.screenshot({path:'test-results/anatomy-'+name+'-mobile.png'});
  console.log('PASS: '+name+' mobile anatomy selection, layout and WebGL initialization');
} catch(e) {
  console.error('FAIL: '+name+' anatomy browser:',e.stack);
  process.exitCode=1;
} finally {
  await browser.close();
}
