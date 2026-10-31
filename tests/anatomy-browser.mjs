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
  assert.equal(await page.locator('button[data-concept-id]').count(),10);
  assert.equal(await page.locator('#concept-map').isVisible(),true);
  assert.equal(await page.locator('#mode-map').getAttribute('aria-pressed'),'true');
  assert.match(await page.locator('#concept-map').textContent(),/not a spatial anatomy diagram/);
  await page.locator('button[data-concept-id="left-arytenoid"]').click();
  assert.equal(await page.locator('button[data-concept-id="left-arytenoid"]').getAttribute('aria-pressed'),'true');
  assert.match(await page.locator('#detail').textContent(),/Left arytenoid cartilage/);
  await page.locator('#reset').click();
  assert.equal(await page.locator('button[data-concept-id="left-arytenoid"]').getAttribute('aria-pressed'),'false');
  if(await page.locator('#mode-three').isEnabled()){
    await page.locator('#mode-three').click();
    await page.waitForFunction(()=>document.getElementById('status')?.textContent?.includes('Licensed 3D source geometry loaded')||
      document.getElementById('status')?.textContent?.includes('BodyParts3D 4.3 anatomy surfaces loaded'),null,{timeout:30000});
    assert.match(await page.locator('#notice').textContent(),/BodyParts3D 4.3/);
    assert.equal(await page.locator('#model-structure').isHidden(),true);
    assert.equal(await page.locator('#mode-three').getAttribute('aria-pressed'),'true');
    assert.equal(await page.locator('#concept-map').isHidden(),true);
    assert.equal(await page.locator('#stage canvas').isVisible(),true);
    await page.locator('#camera-back').click();
    await page.locator('#camera-front').click();
    await page.locator('#mode-map').click();
    assert.equal(await page.locator('#concept-map').isVisible(),true);
  }else{
    assert.equal(await page.locator('#webgl-fallback').isVisible(),true);
  }
  await page.locator('#structure-search').fill('arytenoid cartilage');
  assert.equal(await page.locator('#structures button[data-id]:visible').count(),2);
  assert.match(await page.locator('#structure-count').textContent(),/2 of 10/);
  await page.locator('#structure-search').fill('nonexistent part 999');
  assert.equal(await page.locator('#structures button[data-id]:visible').count(),0);
  assert.match(await page.locator('#structure-count').textContent(),/No matching structures/);
  await page.locator('#structure-search').fill('');
  assert.equal(await page.locator('#structures button[data-id]:visible').count(),10);
  assert.equal(await page.locator('#study-selected').isDisabled(),true);
  const policy=await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');
  assert.match(policy,/script-src 'self'/);
  assert.match(await page.locator('meta[name="referrer"]').getAttribute('content'),/no-referrer/);
  const inlineScriptBlocked=await page.evaluate(()=>{
    const injected=document.createElement('script');
    injected.textContent='window.__anatomyUnsafeInlineScript=1';
    document.head.append(injected);
    return window.__anatomyUnsafeInlineScript===undefined;
  });
  assert.equal(inlineScriptBlocked,true,'Inline JavaScript must be blocked by the anatomy page CSP');
  assert.equal(await page.locator('#learning-objectives li').count(),4);
  assert.match(await page.locator('#study-progress').textContent(),/nothing is saved/);
  assert.equal(await page.locator('button[data-isolate="left-vocal-fold"]').getAttribute('aria-label'),'Isolate Left vocal fold');
  assert.match(await page.locator('#orientation-note').textContent(),/subject's left is on your right/);
  const about=await desktop.newPage();
  const evidenceResponse=await about.goto(origin+'/ANATOMY/SLP/about.html');
  assert.equal(evidenceResponse.status(),200,'Published evidence page must exist in dist');
  assert.match(await about.locator('h1').textContent(),/evidence and limitations/i);
  await about.locator('a[href="./index.html"]').first().click();
  await about.locator('#stage').waitFor();
  await about.close();
  assert.match(await page.locator('#coverage-list').textContent(),/Epiglottis/);
  assert.equal(await page.locator('#study-reveal').isDisabled(),true);
  await page.locator('#study-next').click();
  assert.match(await page.locator('#study-question').textContent(),/largest cartilage/);
  assert.equal(await page.locator('#study-answer').isHidden(),true);
  await page.locator('#study-reveal').click();
  assert.match(await page.locator('#study-answer').textContent(),/Thyroid cartilage/);
  assert.equal(await page.locator('#study-sources a').count(),2);
  assert.match(await page.locator('#study-explanation').textContent(),/drawing does not reproduce/);
  assert.equal(await page.locator('#study-again').isEnabled(),true);
  await page.locator('#study-again').click();
  assert.match(await page.locator('#study-progress').textContent(),/review again: 1/);
  assert.equal(await page.locator('#study-again').isDisabled(),true);
  await page.locator('#study-next').click();
  assert.match(await page.locator('#study-question').textContent(),/complete ring/);
  assert.equal(await page.locator('#study-answer').isHidden(),true);
  assert.equal(await page.locator('#study-sources').isHidden(),true);
  await page.locator('button[data-id="left-vocal-fold"]').click();
  assert.match(await page.locator('#detail').textContent(),/Left vocal fold/);
  assert.equal(await page.locator('#study-selected').isEnabled(),true);
  await page.locator('#study-selected').click();
  assert.match(await page.locator('#study-scope').textContent(),/3 question\(s\) about Left vocal fold/);
  assert.equal(await page.locator('#study-reveal').isDisabled(),true);
  assert.match(await page.locator('#study-progress').textContent(),/checks: 0/);
  await page.locator('#study-next').click();
  assert.match(await page.locator('#study-question').textContent(),/paired structures vibrate/);
  await page.locator('#study-reset').click();
  assert.match(await page.locator('#study-scope').textContent(),/all 12 source-linked questions/);
  assert.equal(await page.locator('#study-reveal').isDisabled(),true);
  assert.match(await page.locator('#detail').textContent(),/NOT the approximate 3D shape/);
  const evidence=page.locator('#detail .evidence-links a');
  assert.equal(await evidence.count(),2);
  assert.ok((await evidence.first().getAttribute('href')).startsWith('https://'));
  assert.equal(await evidence.first().getAttribute('rel'),'noopener noreferrer');
  assert.match(await page.locator('#detail .candidate-provenance').textContent(),/vocal ligament is NOT equivalent/);
  assert.equal(await page.locator('#detail .candidate-provenance a').getAttribute('rel'),'noopener noreferrer');
  await page.locator('button[data-id="left-arytenoid"]').click();
  assert.match(await page.locator('#detail .candidate-provenance').textContent(),/FMA55114, BP8314/);
  await page.locator('button[data-id="left-vocal-fold"]').click();
  await page.locator('button[data-isolate="left-vocal-fold"]').click();
  assert.equal(await page.locator('button[data-isolate="left-vocal-fold"]').getAttribute('aria-pressed'),'true');
  await page.locator('#show-all').click();
  assert.equal(await page.locator('button[data-isolate="left-vocal-fold"]').getAttribute('aria-pressed'),'false');
  await page.locator('#transparent').check();
  await page.locator('#labels').uncheck();
  await page.locator('#reset').click();
  assert.equal(await page.locator('#transparent').isChecked(),false);
  assert.equal(await page.locator('#labels').isChecked(),true);
  if(await page.locator('#mode-three').isEnabled()){
    await page.locator('#mode-three').click();
    await page.locator('#stage').focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#stage canvas').count(),1);
    await page.locator('#mode-map').click();
  }
  assert.equal(await page.locator('#concept-map').isVisible(),true);
  assert.equal(await page.getByRole('button',{name:'Phonation animation unavailable'}).isDisabled(),true);
  assert.equal(await page.locator('#study-again').isDisabled(),true);
  console.log('PASS: '+name+' desktop anatomy controls');

  // WebKit can independently refuse a GPU context for a new tab; both paths
  // must retain the learning interface, and only a canvas can lose context.
  const lostGpu=await desktop.newPage();
  lostGpu.on('pageerror',e=>errors.push(e.message));
  await lostGpu.goto(origin+'/ANATOMY/SLP/index.html');
  await lostGpu.waitForFunction(()=>/ready\.|unavailable/.test(document.getElementById('status')?.textContent||''));
  const hasCanvas=await lostGpu.locator('#stage canvas').count()===1;
  if(hasCanvas){
    await lostGpu.evaluate(()=>document.querySelector('#stage canvas')
      .dispatchEvent(new Event('webglcontextlost',{cancelable:true})));
    assert.match(await lostGpu.locator('#status').textContent(),/temporarily unavailable/);
  }else{
    assert.equal(await lostGpu.locator('#webgl-fallback').isVisible(),true);
    assert.match(await lostGpu.locator('#status').textContent(),/text-based anatomy study is ready/);
  }
  await lostGpu.locator('button[data-id="cricoid-cartilage"]').click();
  assert.match(await lostGpu.locator('#detail').textContent(),/complete ring/);
  await lostGpu.locator('#study-next').click();
  await lostGpu.locator('#study-reveal').click();
  assert.equal(await lostGpu.locator('#study-sources a').count(),2);
  if(hasCanvas){
    await lostGpu.evaluate(()=>document.querySelector('#stage canvas')
      .dispatchEvent(new Event('webglcontextrestored')));
    assert.match(await lostGpu.locator('#status').textContent(),/Referenced text; unvalidated geometry/);
  }
  await lostGpu.close();
  console.log('PASS: '+name+' GPU loss or unavailable context preserves text-based study');

  // Force WebGL initialization failure: text references and recall must remain usable.
  const noGpu=await desktop.newPage();
  noGpu.on('pageerror',e=>errors.push(e.message));
  await noGpu.addInitScript(()=>{
    // Model an older browser without usable WebGL or ResizeObserver.
    Object.defineProperty(window,'ResizeObserver',{value:undefined,configurable:true});
    const original=HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext=function(type,...args) {
      if(['webgl','webgl2','experimental-webgl'].includes(type))return null;
      return original.call(this,type,...args);
    };
  });
  await noGpu.goto(origin+'/ANATOMY/SLP/index.html');
  await noGpu.waitForFunction(()=>document.getElementById('status')?.textContent?.includes('text-based anatomy study is ready.'));
  assert.equal(await noGpu.locator('#webgl-fallback').isVisible(),true);
  assert.equal(await noGpu.locator('#concept-map').isVisible(),true);
  assert.equal(await noGpu.locator('#mode-three').isDisabled(),true);
  await noGpu.locator('button[data-concept-id="thyroid-cartilage"]').click();
  assert.match(await noGpu.locator('#detail').textContent(),/Thyroid cartilage/);
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
  // Even when a hostile embedder supplies a URL, only a canonical origin is
  // a permitted opt-in. A path-bearing URL must fall back to same-origin.
  const malformedSrc=origin+'/ANATOMY/SLP/index.html?embedOrigin='+
    encodeURIComponent('https://untrusted.test/some-path');
  await outsider.evaluate(src=>new Promise(resolve=>{
    const frame=document.querySelector('iframe');
    frame.addEventListener('load',resolve,{once:true});
    frame.src=src;
  }),malformedSrc);
  await restricted.locator('button[data-id="left-vocal-fold"]').waitFor();
  await outsider.evaluate(()=>document.querySelector('iframe').contentWindow.postMessage(
    {source:'herbie',version:1,action:'select',structureId:'left-vocal-fold',requestId:'bad-origin-url'},
    'https://3dvision.test'
  ));
  await outsider.waitForTimeout(250);
  assert.equal(await restricted.locator('button[data-id="left-vocal-fold"]').getAttribute('aria-pressed'),'false');
  console.log('PASS: '+name+' rejects path-bearing iframe origin opt-in');

  const mobile=await browser.newContext({...devices['iPhone 13']});
  await routeAssets(mobile);
  const touch=await mobile.newPage();
  touch.on('pageerror',e=>errors.push(e.message));
  await touch.goto(origin+'/ANATOMY/SLP/index.html');
  await touch.waitForFunction(()=>document.getElementById('status')?.textContent?.includes('ready.'),null,{timeout:30000});
  assert.equal(await touch.locator('#concept-map').isVisible(),true);
  // Retina WebKit regression: the drawing buffer is 2x CSS pixels, but the
  // rendered canvas must occupy exactly ONE stage, not a clipped 2x stage.
  if(await touch.locator('#mode-three').isEnabled()){
    await touch.locator('#mode-three').click();
    await touch.waitForFunction(()=>document.getElementById('status')?.textContent?.includes('BodyParts3D 4.3 anatomy surfaces loaded')||
      document.getElementById('status')?.textContent?.includes('Licensed 3D source geometry loaded'),null,{timeout:35000});
    assert.match(await touch.locator('#notice').textContent(),/BodyParts3D 4.3/);
    await touch.waitForFunction(()=>[...document.querySelectorAll('.part-label')].every(el=>el.hidden),null,{timeout:5000});
    const geometry=await touch.evaluate(()=>{
      const stage=document.querySelector('#stage');
      const canvas=stage.querySelector('canvas');
      const s=stage.getBoundingClientRect(),r=canvas.getBoundingClientRect();
      const visibleLabels=[...stage.querySelectorAll('.part-label')].filter(el=>!el.hidden).length;
      return {stage:{x:s.x,y:s.y,w:s.width,h:s.height},
        canvas:{x:r.x,y:r.y,w:r.width,h:r.height},
        buffer:{w:canvas.width,h:canvas.height},
        css:{w:getComputedStyle(canvas).width,h:getComputedStyle(canvas).height},
        labels:visibleLabels,dpr:devicePixelRatio};
    });
    assert.ok(geometry.dpr>=2,'Regression requires a Retina high-density viewport');
    assert.ok(Math.abs(geometry.canvas.w-geometry.stage.w)<1,
      'Canvas CSS width must equal stage width, never the high-density buffer: '+JSON.stringify(geometry));
    assert.ok(Math.abs(geometry.canvas.h-geometry.stage.h)<1,
      'Canvas CSS height must equal stage height: '+JSON.stringify(geometry));
    assert.ok(Math.abs(geometry.canvas.x-geometry.stage.x)<1,
      'Canvas left edge must align with stage: '+JSON.stringify(geometry));
    assert.ok(Math.abs(geometry.canvas.y-geometry.stage.y)<1,
      'Canvas top edge must align with stage: '+JSON.stringify(geometry));
    assert.ok(geometry.buffer.w>=geometry.canvas.w*1.5,
      'HiDPI buffer should use device pixels without changing CSS size');
    assert.equal(geometry.labels,0,'Overview labels must not overlap the phone canvas');
    await touch.locator('#camera-back').click();
    await touch.locator('#camera-front').click();
    await touch.locator('#mode-map').click();
    assert.equal(await touch.locator('#concept-map').isVisible(),true);
  }else{
    assert.equal(await touch.locator('#webgl-fallback').isVisible(),true);
  }
  assert.equal(await touch.locator('#mobile-tabs').isVisible(),true);
  assert.equal(await touch.locator('#panel-structures').isVisible(),true);
  assert.equal(await touch.locator('#panel-details').isHidden(),true);
  assert.equal(await touch.locator('#panel-practice').isHidden(),true);
  // On phones the concept map must scroll with the page, not in a nested pane.
  assert.equal(await touch.locator('#concept-map').evaluate(el=>getComputedStyle(el).position),'relative');
  assert.equal(await touch.locator('#concept-map').evaluate(el=>getComputedStyle(el).overflowY),'visible');
  // Scroll the regular document once before a real touch click; no inner
  // scrolling region or continuous GPU resize should move the target.
  await touch.locator('button[data-concept-id="right-vocal-fold"]')
    .evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));
  await touch.locator('button[data-concept-id="right-vocal-fold"]').click({timeout:15000});
  assert.equal(await touch.locator('button[data-concept-id="right-vocal-fold"]').getAttribute('aria-pressed'),'true');
  assert.equal(await touch.locator('#selection-ribbon').isVisible(),true);
  assert.match(await touch.locator('#selection-name').textContent(),/Right vocal fold/);
  await touch.locator('#open-details').click();
  assert.equal(await touch.locator('#panel-details').isVisible(),true);
  assert.equal(await touch.locator('[data-mobile-target="panel-details"]').getAttribute('aria-pressed'),'true');
  assert.match(await touch.locator('#detail').textContent(),/Right vocal fold/);
  assert.equal(await touch.locator('#detail .evidence-links a').count(),2);
  await touch.locator('#practice-from-detail').click();
  assert.equal(await touch.locator('#panel-practice').isVisible(),true);
  assert.match(await touch.locator('#study-scope').textContent(),/3 question\(s\) about Right vocal fold/);
  await touch.locator('#study-next').click();
  assert.match(await touch.locator('#study-question').textContent(),/paired structures vibrate/);
  await touch.locator('#study-reveal').click();
  assert.match(await touch.locator('#study-answer').textContent(),/vocal folds/i);
  await touch.locator('#study-recognized').click();
  assert.match(await touch.locator('#study-progress').textContent(),/recalled: 1/);
  await touch.locator('#study-reset').click();
  await touch.locator('#study-next').click();
  await touch.locator('#study-reveal').click();
  assert.match(await touch.locator('#study-answer').textContent(),/Thyroid cartilage/);
  await touch.locator('[data-mobile-target="panel-structures"]').click();
  assert.equal(await touch.locator('#panel-structures').isVisible(),true);
  assert.equal(await touch.locator('#panel-practice').isHidden(),true);
  await touch.locator('#structure-search').fill('vocal fold');
  assert.equal(await touch.locator('#structures button[data-id]:visible').count(),2);
  await touch.locator('#structure-search').fill('');
  await touch.locator('button[data-id="right-vocal-fold"]').click();
  assert.equal(await touch.locator('#selection-ribbon').isVisible(),true);
  await touch.locator('#reset').click();
  assert.equal(await touch.locator('#selection-ribbon').isHidden(),true);
  assert.equal(await touch.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  assert.deepEqual(errors,[]);
  await mkdir('test-results',{recursive:true});
  await touch.screenshot({path:'test-results/anatomy-'+name+'-mobile.png'});
  console.log('PASS: '+name+' mobile map, accessible panel navigation, notes-to-practice path and responsive layout');
} catch(e) {
  console.error('FAIL: '+name+' anatomy browser:',e.stack);
  process.exitCode=1;
} finally {
  await browser.close();
}
