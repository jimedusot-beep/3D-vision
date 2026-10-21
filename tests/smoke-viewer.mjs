import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
const errors=[];
page.on('pageerror',e=>errors.push('PAGE '+e.message));
page.on('console',m=>{if(m.type()==='error')errors.push('CONSOLE '+m.text())});
page.on('requestfailed',req=>errors.push('REQUEST '+req.url()+' '+req.failure()?.errorText));
try {
  const r=await page.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded',timeout:30000});
  assert.equal(r.status(),200);
  console.log('Homepage loaded');
  await page.waitForFunction(()=>document.getElementById('status')?.textContent?.includes('Original GLB loaded'),{timeout:60000});
  console.log('Assembled GLB loaded');
  await page.locator('#explode').click();
  await page.waitForFunction(()=>document.getElementById('status')?.textContent?.includes('Original GLB loaded'),{timeout:60000});
  console.log('Exploded GLB loaded');
  await page.selectOption('#part','001');
  await page.waitForFunction(()=>document.getElementById('status')?.textContent?.includes('Viewing HBR-001'),{timeout:60000});
  console.log('HBR-001 STL loaded');
  await page.goto('http://127.0.0.1:8765/library.html',{waitUntil:'domcontentloaded'});
  assert.equal(await page.locator('article.part').count(),18);
  await page.locator('#q').fill('neck');
  assert.equal(await page.locator('article.part:not([hidden])').count(),1);
  console.log('18-part library and search loaded');
  await page.screenshot({path:'viewer-smoke.png',fullPage:true});
  const hardErrors=errors.filter(e=>!e.includes('favicon.ico'));
  assert.deepEqual(hardErrors,[],'Viewer console/network errors');
  console.log('PASS: browser smoke tests');
} catch(e) {
  await page.screenshot({path:'viewer-smoke-failed.png',fullPage:true}).catch(()=>{});
  console.error('FAIL:',e.message);
  console.error('Status:',await page.locator('#status').textContent().catch(()=>'<not found>'));
  console.error('Errors:',errors);
  process.exitCode=1;
} finally {await browser.close();}
