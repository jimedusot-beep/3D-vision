// Physical-iPhone field protocol. No analytics, remote persistence, accounts,
// tracking, network requests or automatic accessibility claims.
const $=id=>document.getElementById(id);
const KEY='herbie:slp:iphone-review:v1';
const labs=[
 {id:'larynx',label:'Larynx / phonation',href:'./index.html?view=three',detail:'Look for 20 source groups; test a question and Find in 3D.'},
 {id:'lungs',label:'Lungs and airways',href:'./lungs.html',detail:'Check lung segments, airway tour and an answer.'},
 {id:'diaphragm',label:'Diaphragm',href:'./diaphragm.html',detail:'Check both hemidiaphragms and nearby structures.'},
 {id:'oral',label:'Oral anatomy',href:'./oral.html',detail:'Choose tongue, jaw or hyoid and inspect the labeled notes.'},
 {id:'pharynx',label:'Pharynx / soft palate',href:'./pharynx.html',detail:'Choose a named constrictor or velum structure.'},
 {id:'ear',label:'Right ear / hearing',href:'./ear.html',detail:'Select outer, middle and inner ear structures.'},
 {id:'neural',label:'Cranial nerves / brainstem',href:'./neural.html',detail:'Select a nerve, check source notes and reassemble all 74 study structures.'}
];
const usability=[
 {id:'touch',label:'Touch controls and scrolling',detail:'Rotate, pinch-zoom, pan and tap 3D; page should scroll without unintended gestures.'},
 {id:'voiceover',label:'VoiceOver screen reader',detail:'With VoiceOver on, follow headings and focus order. Use the native model picker, Explode/Reassemble and quiz feedback. Mark an inaccessible 3D action as an issue.'},
 {id:'large-text',label:'Large text / Display Zoom',detail:'Use larger iOS text or Safari Page Zoom; check labels, buttons and 3D controls are not clipped.'},
 {id:'rotation',label:'Portrait and landscape',detail:'Rotate the phone and confirm the canvas, controls and page still fit without horizontal scrolling.'},
 {id:'practice',label:'Learning and recovery',detail:'Answer a right and wrong quiz option. If 3D fails, confirm notes remain and Retry 3D is usable. Do not force graphics failure.'},
 {id:'stability',label:'Five-minute session and battery/heat',detail:'Study normally for five minutes. Look for crashes, surprise reloads, freezing or unusual heat. No temperature sensor reading is claimed.'}
];
const allowed=['not-tested','pass','issue'];
const issueKinds=[
 ['','Choose the main problem (optional)'],
 ['loading','Model never loads / loading spinner'],
 ['no-3d','Text or placeholder instead of 3D'],
 ['explode','Explode / Reassemble is wrong'],
 ['selection','Tap, isolate, or select does not work'],
 ['appearance','Anatomy looks inaccurate / missing parts'],
 ['controls','Camera, zoom, or layout problem'],
 ['other','Other problem']
];
const initial=()=>({version:1,checks:{},issueDetails:{},device:'',seconds:'',notes:'',diagnostics:null});
let state=initial();
let canSave=true;
try{
 const prior=JSON.parse(localStorage.getItem(KEY)||'null');
 if(prior&&prior.version===1&&typeof prior.checks==='object'){
  for(const {id} of [...labs,...usability]){
   if(allowed.includes(prior.checks[id]))state.checks[id]=prior.checks[id];
  }
  if(prior.issueDetails&&typeof prior.issueDetails==='object'){
   for(const {id} of labs){
    const detail=prior.issueDetails[id];
    if(!detail||typeof detail!=='object')continue;
    const kind=issueKinds.some(([key])=>key&&key===detail.kind)?detail.kind:'';
    const note=typeof detail.note==='string'?detail.note.slice(0,240):'';
    if(kind||note)state.issueDetails[id]={kind,note};
   }
  }
  state.device=typeof prior.device==='string'?prior.device.slice(0,100):'';
  state.seconds=typeof prior.seconds==='string'?prior.seconds.slice(0,20):'';
  state.notes=typeof prior.notes==='string'?prior.notes.slice(0,1500):'';
  state.diagnostics=prior.diagnostics&&typeof prior.diagnostics==='object'?prior.diagnostics:null;
 }
}catch{canSave=false;}
const save=()=>{
 if(!canSave)return;
 try{localStorage.setItem(KEY,JSON.stringify(state));}
 catch{canSave=false;$('message').textContent='Browser storage is unavailable. Keep this page open or copy a report now.';}
};
const elem=(tag,cls,text)=>{
 const node=document.createElement(tag);
 if(cls)node.className=cls;
 if(text!==undefined)node.textContent=text;
 return node;
};
function taskCard(task,parent,lab){
 const section=elem('section','task');section.dataset.task=task.id;
 const heading=elem('h3','',task.label);section.append(heading);
 if(lab){
  const link=elem('a','open-lab','Open '+task.label+' 3D lab');
  link.href=task.href;
  section.append(link);
 }
 section.append(elem('p','',task.detail));
 const field=document.createElement('fieldset'),legend=elem('legend','','Result for '+task.label);
 field.append(legend);
 const options=elem('div','options');
 for(const [value,labelText] of [['pass','Pass'],['issue','Issue'],['not-tested','Not tested']]){
  const label=document.createElement('label'),radio=document.createElement('input');
  radio.type='radio';radio.name='review-'+task.id;radio.value=value;
  radio.checked=(state.checks[task.id]||'not-tested')===value;
  radio.addEventListener('change',()=>{
   if(!radio.checked)return;
   state.checks[task.id]=value;
   if(lab)section.querySelector('.issue-detail').hidden=value!=='issue';
   save();updateProgress();
  });
  label.append(radio,document.createTextNode(labelText));options.append(label);
 }
 field.append(options);section.append(field);
 if(lab){
  const issueDetail=elem('div','issue-detail');
  issueDetail.dataset.issueDetail=task.id;
  issueDetail.hidden=(state.checks[task.id]||'not-tested')!=='issue';
  const selectLabel=elem('label','field','What went wrong in '+task.label+'?');
  const select=document.createElement('select');select.name='issue-kind-'+task.id;
  select.dataset.issueKind=task.id;
  for(const [key,label] of issueKinds){
   const option=document.createElement('option');option.value=key;option.textContent=label;select.append(option);
  }
  select.value=state.issueDetails[task.id]?.kind||'';
  select.addEventListener('change',()=>{
   const detail=state.issueDetails[task.id]||{kind:'',note:''};
   state.issueDetails[task.id]={...detail,kind:select.value};save();
  });
  selectLabel.append(select);issueDetail.append(selectLabel);
  const noteLabel=elem('label','field','What did you see? (optional, maximum 240 characters)');
  const note=document.createElement('textarea');note.dataset.issueNote=task.id;
  note.rows=2;note.maxLength=240;
  note.placeholder='Example: Explode shows no movement, but 3D rotation works.';
  note.value=state.issueDetails[task.id]?.note||'';
  note.addEventListener('input',()=>{
   const detail=state.issueDetails[task.id]||{kind:'',note:''};
   state.issueDetails[task.id]={...detail,note:note.value};save();
  });
  noteLabel.append(note);issueDetail.append(noteLabel);section.append(issueDetail);
 }
 parent.append(section);
}
for(const item of labs)taskCard(item,$('lab-tasks'),true);
for(const item of usability)taskCard(item,$('device-tasks'),false);
for(const [id,key] of [['device-note','device'],['load-time','seconds'],['observations','notes']]){
 const input=$(id);
 input.value=state[key]||'';
 input.addEventListener('input',()=>{
  state[key]=input.value;save();
 });
}
function updateProgress(){
 const values=[...labs,...usability].map(t=>state.checks[t.id]||'not-tested');
 const completed=values.filter(x=>x!=='not-tested').length;
 const issues=values.filter(x=>x==='issue').length;
 $('progress').textContent=completed+' of '+values.length+' checks recorded; '+issues+' marked as issues.';
}
updateProgress();
function displayDiagnostics(){
 const diag=state.diagnostics;
 if(!diag){$('diagnostics-status').textContent='Not checked yet.';return;}
 const pairs=[
  ['WebGL 2',diag.webgl2],
  ['Touch',diag.touch],
  ['Viewport',diag.viewport],
  ['Device pixel ratio',diag.dpr],
  ['Reduced motion preference',diag.reducedMotion]
 ];
 $('diagnostics').replaceChildren();
 for(const [key,value] of pairs){
  $('diagnostics').append(elem('dt','',key),elem('dd','',String(value)));
 }
 $('diagnostics-status').textContent='Browser capabilities checked. This does not test a 3D anatomy model or VoiceOver.';
}
displayDiagnostics();
$('run-diagnostics').addEventListener('click',()=>{
 let webgl2='Unavailable';
 try{
  const canvas=document.createElement('canvas');
  const gl=canvas.getContext('webgl2',{antialias:false,depth:false,powerPreference:'low-power'});
  if(gl){
   webgl2=gl.isContextLost()?'Context lost':'Available';
   gl.getExtension('WEBGL_lose_context')?.loseContext();
  }
 }catch{webgl2='Unavailable';}
 state.diagnostics={
  webgl2,
  touch:navigator.maxTouchPoints>0?'Touch input reported':'No touch input reported',
  viewport:window.innerWidth+' × '+window.innerHeight+' CSS pixels',
  dpr:String(window.devicePixelRatio||1),
  reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches?'Enabled':'Disabled'
 };
 save();displayDiagnostics();
});
function buildReport(){
 const diag=state.diagnostics;
 const lines=[
  'H.E.R.B.I.E. SLP Anatomy Atlas — physical iPhone review',
  'Results entered by a human tester. Not an automated hardware or VoiceOver pass.',
  'Device / iOS (optional): '+(state.device.trim()||'Not provided'),
  'WebGL 2 check: '+(diag?.webgl2||'Not checked'),
  'Touch: '+(diag?.touch||'Not checked'),
  'Viewport: '+(diag?.viewport||'Not checked'),
  'Device pixel ratio: '+(diag?.dpr||'Not checked'),
  'Reduced motion: '+(diag?.reducedMotion||'Not checked'),
  'Measured first model load (optional): '+(state.seconds?state.seconds+' seconds':'Not measured'),
  '',
  '3D model tests:'
 ];
 for(const x of labs){
  const result=state.checks[x.id]||'not-tested';
  const details=state.issueDetails[x.id]||{};
  lines.push('- '+x.label+': '+result);
  if(result==='issue'){
   const kind=issueKinds.find(([key])=>key===details.kind);
   if(kind&&kind[0])lines.push('  Problem: '+kind[1]);
   if(details.note?.trim())lines.push('  Observation: '+details.note.trim().replace(/\s+/g,' '));
  }
 }
 lines.push('','Usability and accessibility tests:');
 for(const x of usability)lines.push('- '+x.label+': '+(state.checks[x.id]||'not-tested'));
 lines.push('','Observations: '+(state.notes.trim()||'None provided'),
  'Reminder: A manual report is evidence about this specific device/session, not anatomy accuracy.');
 const result=lines.join('\n');
 $('report').value=result;
 return result;
}
$('make-report').addEventListener('click',()=>{
 buildReport();$('message').textContent='Report prepared. Copy it to share your observations.';
});
$('copy-report').addEventListener('click',async()=>{
 const report=buildReport();
 try{
  if(!navigator.clipboard?.writeText)throw Error('Clipboard unsupported');
  await navigator.clipboard.writeText(report);
  $('message').textContent='Report copied. Paste it into ChatGPT or the GitHub issue.';
 }catch{
  $('report').focus();$('report').select();
  $('message').textContent='Safari did not permit automatic copying. The report is selected; use Copy from the text selection menu.';
 }
});
$('clear-review').addEventListener('click',()=>{
 // No backend data exists to delete. Clear only this page's own saved record.
 state=initial();
 for(const task of [...labs,...usability]){
  const choice=document.querySelector('[name="review-'+task.id+'"][value="not-tested"]');
  if(choice)choice.checked=true;
 }
 for(const task of labs){
  const detail=document.querySelector('[data-issue-detail="'+task.id+'"]');
  if(detail)detail.hidden=true;
  const kind=document.querySelector('[data-issue-kind="'+task.id+'"]');
  if(kind)kind.value='';
  const note=document.querySelector('[data-issue-note="'+task.id+'"]');
  if(note)note.value='';
 }
 for(const id of ['device-note','load-time','observations','report'])$(id).value='';
 try{localStorage.removeItem(KEY);canSave=true;}catch{canSave=false;}
 $('message').textContent='Review selections and locally saved results cleared.';
 displayDiagnostics();updateProgress();
});
