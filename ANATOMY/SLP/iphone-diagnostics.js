// Opt-in, on-device-only diagnostics for Issue #31. No telemetry, storage or uploads.
// This script is inert unless the *exact* URL parameter ?debug=1 is present.
if (new URLSearchParams(location.search).get('debug') === '1') {
 const labs = {
  'index.html': {name:'larynx', stage:'stage', status:'status'},
  'oral.html': {name:'oral', stage:'oral-stage', status:'oral-status'},
  'pharynx.html': {name:'pharynx', stage:'pharynx-stage', status:'pharynx-status'},
  'ear.html': {name:'ear', stage:'ear-stage', status:'ear-status'}
 };
 const lab = labs[location.pathname.split('/').pop()];
 if (lab) mount(lab);
}

function mount(lab) {
 const stage = document.getElementById(lab.stage);
 const status = document.getElementById(lab.status);
 if (!stage || !status) return;

 const started = performance.now();
 const events = [];
 const scriptErrors = [];
 const rejections = [];
 const warnings = [];
 const touch = {count:0, pointerCount:0, last:'none'};
 const model = {start:null, startTime:null, end:null, endTime:null, error:null};
 let lastAction = 'none';
 const now = () => new Date().toISOString();
 const stamp = () => new Date(performance.timeOrigin + performance.now()).toISOString();
 const limited = value => String(value ?? 'unknown').replace(/\s+/g,' ').slice(0,240);
 const keep = (list, item, max=15) => {list.push(item);if(list.length>max)list.shift();};
 function beginLoad() {
  if (model.start) return;
  model.start = stamp();
  model.startTime = performance.now();
 }
 function endLoad(error) {
  if (model.end) return;
  beginLoad();
  model.end = stamp();
  model.endTime = performance.now();
  if (error) model.error = limited(error);
 }
 function logAction(action) {
  lastAction = now() + ' | ' + limited(action);
  paint();
 }
 function syncModel() {
  const text = status.textContent || '';
  if (lab.name === 'larynx') {
   if (/Loading the sourced anatomy model/i.test(text)) beginLoad();
   if (/Licensed 3D source geometry loaded/i.test(text)) endLoad(null);
   if (/Source anatomy unavailable|3D graphics are temporarily unavailable/i.test(text))
    endLoad(text);
  } else {
   beginLoad();
   const state = stage.dataset.modelStatus;
   if (state === 'ready') endLoad(null);
   if (state === 'unavailable') endLoad(text || 'Model unavailable');
  }
  paint();
 }
 function rendererInfo() {
  const canvas = stage.querySelector('canvas');
  if (!canvas) return 'not created';
  try {
   // Inspect only an existing WebGL2 canvas; never make a separate probe canvas.
   const gl = canvas.getContext('webgl2');
   if (!gl) return 'WebGL2 context not available';
   return [
    'vendor=' + limited(gl.getParameter(gl.VENDOR)),
    'renderer=' + limited(gl.getParameter(gl.RENDERER)),
    'version=' + limited(gl.getParameter(gl.VERSION)),
    'maxTextureSize=' + gl.getParameter(gl.MAX_TEXTURE_SIZE),
    'drawingBuffer=' + gl.drawingBufferWidth + 'x' + gl.drawingBufferHeight
   ].join('; ');
  } catch (e) { return 'unable to read: ' + limited(e?.message); }
 }
 function memoryInfo() {
  const m = performance.memory;
  if (!m || !Number.isFinite(m.usedJSHeapSize))
   return 'performance.memory not exposed by this browser';
  if (Number.isFinite(m.jsHeapSizeLimit) && m.jsHeapSizeLimit > 0 &&
      m.usedJSHeapSize > m.jsHeapSizeLimit * .9 &&
      !warnings.some(x=>x.includes('JS heap above 90%'))) {
   keep(warnings, now() + ' | JS heap above 90% of reported limit');
  }
  return 'used=' + m.usedJSHeapSize + '; total=' + (m.totalJSHeapSize ?? 'unknown') +
   '; limit=' + (m.jsHeapSizeLimit ?? 'unknown') + ' bytes';
 }
 function report() {
  const canvas = stage.querySelector('canvas');
  const box = canvas?.getBoundingClientRect();
  const runtime = Math.round(performance.now() - started);
  const modelMs = model.endTime !== null && model.startTime !== null ?
    Math.round(model.endTime - model.startTime) + ' ms (observer timing)' : 'pending';
  const lines = [
   'H.E.R.B.I.E. SLP iPhone diagnostics — Issue #31',
   'Lab: ' + lab.name,
   'Captured at (UTC): ' + now(),
   'Debug enabled: yes (?debug=1); local browser only; no automatic upload',
   'Elapsed since panel boot: ' + runtime + ' ms',
   'Model load start (observed): ' + (model.start || 'not observed'),
   'Model load end (observed): ' + (model.end || 'not observed'),
   'Model elapsed: ' + modelMs,
   'Model state: ' + (lab.name === 'larynx' ? (model.error ? 'unavailable' : model.end ? 'ready' : 'pending') :
     (stage.dataset.modelStatus || 'pending')),
   'Model load error: ' + (model.error || 'none'),
   'Canvas size: ' + (canvas ? (Math.round(box.width) + 'x' + Math.round(box.height) +
     ' CSS px; ' + canvas.width + 'x' + canvas.height + ' device px') : 'not created'),
   'devicePixelRatio: ' + window.devicePixelRatio,
   'WebGL renderer info: ' + rendererInfo(),
   'Canvas touch events: ' + touch.count + '; touch pointers: ' + touch.pointerCount +
     '; last type: ' + touch.last,
   'WebGL context events: ' + (events.length ? events.join(' | ') : 'none'),
   'Last user action: ' + lastAction,
   'window.onerror: ' + (scriptErrors.length ? scriptErrors.join(' | ') : 'none'),
   'unhandledrejection: ' + (rejections.length ? rejections.join(' | ') : 'none'),
   'performance.memory: ' + memoryInfo(),
   'Memory warnings: ' + (warnings.length ? warnings.join(' | ') : 'none observed (API may be unavailable)'),
   'Evidence limitations: model load times are observed by this page, not GPU profiling; ' +
    'WebGL renderer is a privacy-masked browser value; no hardware memory telemetry.',
   'Review this report for private details before sharing it in Issue #31.'
  ];
  return lines.join('\n');
 }

 const panel = document.createElement('details');
 panel.id = 'slp-debug-panel';
 panel.style.cssText = 'position:fixed;right:8px;bottom:8px;z-index:2147483647;' +
  'width:min(94vw,370px);max-height:65dvh;overflow:auto;background:#0e2533;color:#f5ffff;' +
  'border:2px solid #91e6da;border-radius:10px;box-shadow:0 6px 24px #000a;' +
  'font:13px/1.4 system-ui,sans-serif;padding:8px';
 const summary = document.createElement('summary');
 summary.textContent = 'Diagnostics · ' + lab.name + ' (local)';
 summary.style.cssText = 'cursor:pointer;font-weight:700;min-height:32px';
 const note = document.createElement('p');
 note.textContent = 'Opt-in. Nothing is sent. Review the report before sharing.';
 const copy = document.createElement('button');
 copy.type = 'button';
 copy.id = 'slp-debug-copy';
 copy.textContent = 'Copy report';
 copy.style.cssText = 'min-height:44px;padding:8px;border:1px solid #b4eee9;' +
  'background:#17585e;color:#fff;border-radius:7px;font:inherit;cursor:pointer';
 const copyStatus = document.createElement('p');
 copyStatus.id = 'slp-debug-copy-status';
 copyStatus.setAttribute('role','status');
 copyStatus.setAttribute('aria-live','polite');
 const output = document.createElement('pre');
 output.id = 'slp-debug-output';
 output.style.cssText = 'white-space:pre-wrap;overflow-wrap:anywhere;max-height:32dvh;' +
  'overflow:auto;border-top:1px solid #658a98;padding-top:7px;font:11px/1.4 monospace';
 const manual = document.createElement('textarea');
 manual.id = 'slp-debug-manual-copy';
 manual.hidden = true;
 manual.readOnly = true;
 manual.setAttribute('aria-label','Select and manually copy diagnostics report');
 manual.style.cssText = 'width:100%;height:90px;font:11px monospace';
 panel.append(summary,note,copy,copyStatus,output,manual);
 document.body.append(panel);
 function paint() {
  if (panel.open) output.textContent = report();
 }
 panel.addEventListener('toggle',paint);
 copy.addEventListener('click',async () => {
  const text = report();
  output.textContent = text;
  try {
   if (!navigator.clipboard?.writeText) throw Error('Clipboard API unavailable');
   await navigator.clipboard.writeText(text);
   manual.hidden = true;
   copyStatus.textContent = 'Copied. Review before pasting into Issue #31.';
  } catch {
   manual.value = text;
   manual.hidden = false;
   manual.focus();
   manual.select();
   copyStatus.textContent = 'Clipboard blocked. Select the text and use Copy.';
  }
 });

 stage.addEventListener('webglcontextlost', () => {
  keep(events,now() + ' | webglcontextlost');
  keep(warnings,now() + ' | WebGL context lost; GPU or memory cause not established');
  paint();
 },true);
 stage.addEventListener('webglcontextrestored', () => {
  keep(events,now() + ' | webglcontextrestored');
  paint();
 },true);
 for (const name of ['touchstart','touchmove','touchend','touchcancel']) {
  stage.addEventListener(name,e=>{
   if (e.target?.tagName !== 'CANVAS') return;
   touch.count++;
   touch.last = now() + ' | ' + name;
   if(name!=='touchmove'||touch.count%20===0)paint();
  },{capture:true,passive:true});
 }
 for (const name of ['pointerdown','pointerup','pointercancel']) {
  stage.addEventListener(name,e=>{
   if(e.target?.tagName !== 'CANVAS' || e.pointerType !== 'touch')return;
   touch.pointerCount++;
   touch.last = now() + ' | ' + name + ' (touch)';
   paint();
  },true);
 }
 window.addEventListener('error',e=>{
  keep(scriptErrors,now()+' | '+limited(e.message || 'Unknown window error'));
  paint();
 });
 window.addEventListener('unhandledrejection',e=>{
  keep(rejections,now()+' | '+limited(e.reason?.message || e.reason));
  paint();
 });
 for (const name of ['memorypressure','memorywarning']) {
  window.addEventListener(name,()=>{
   keep(warnings,now() + ' | ' + name + ' event (nonstandard browser signal)');
   paint();
  });
 }
 const prefix = lab.name === 'larynx' ? '' : lab.name + '-';
 document.addEventListener('change',e=>{
  const target=e.target;
  if (target?.id === (lab.name === 'larynx' ? 'source-select' : prefix+'select')) {
   logAction('select ' + limited(target.value || '(none)'));
  }
 },true);
 document.addEventListener('input',e=>{
  const target=e.target;
  if (target?.id === (lab.name === 'larynx' ? 'explode-amount' : prefix+'explode-amount'))
   logAction('explode amount ' + limited(target.value) + '%');
 },true);
 document.addEventListener('click',e=>{
  const target=e.target?.closest?.('button');
  if(!target)return;
  const id=target.id;
  if(id === (lab.name === 'larynx' ? 'mode-explode' : prefix+'explode'))
   logAction('explode 3D');
  else if(id === (lab.name === 'larynx' ? 'explode-assemble' : prefix+'assemble'))
   logAction('reassemble');
  else if(lab.name === 'larynx' && (target.dataset.id||target.dataset.conceptId))
   logAction('select ' + limited(target.dataset.id||target.dataset.conceptId));
  else if(lab.name === 'oral' && target.dataset.oralStudy)
   logAction('select ' + limited(target.dataset.oralStudy));
 },true);

 const observer = new MutationObserver(syncModel);
 observer.observe(stage,{attributes:true,attributeFilter:['data-model-status'],childList:true});
 observer.observe(status,{subtree:true,childList:true,characterData:true});
 syncModel();
}
