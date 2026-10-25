/**
 * Small, accessible teaching overlay on top of the existing 3D Vision scene.
 * Reading progress is explicitly NOT a real-hardware test log or acceptance.
 */
import {GUIDE_VERSION,tripwireGuide,guideIndex,validateGuide} from './tripwire-build-guides.js';
const byId=id=>document.getElementById(id);
function el(tag,text,className){
 const node=document.createElement(tag);
 if(text!==undefined)node.textContent=text;
 if(className)node.className=className;
 return node;
}
const urlWithStep=index=>{
 const url=new URL(location.href);
 url.searchParams.set('step',String(index+1));
 return url;
};
function readProgress(key,count){
 try{
  const value=JSON.parse(localStorage.getItem(key)||'[]');
  return new Set(Array.isArray(value)?value.filter(i=>Number.isSafeInteger(i)&&i>=0&&i<count):[]);
 }catch{return new Set();}
}
function storeProgress(key,checked){
 try{localStorage.setItem(key,JSON.stringify([...checked].sort((a,b)=>a-b)));}catch{/* storage disabled; lesson still works */}
}
function addList(target,entries,className){
 const list=el('ol',undefined,className);
 for(const text of entries)list.append(el('li',text));
 target.append(list);
}
function addConnections(target,connections){
 const list=el('ul',undefined,'guide-connections');
 if(!connections.length){
  list.append(el('li','No electrical wiring in this placement step. Keep power disconnected.'));
 }else{
  for(const conn of connections){
   const item=el('li',undefined,'guide-connection '+conn.kind);
   item.append(el('strong',conn.from),el('span',' → '),el('strong',conn.to));
   item.append(el('p',conn.note));
   if(conn.kind==='missing')item.append(el('small','UNDESIGNED CONNECTION — DO NOT WIRE'));
   else if(conn.kind==='target')item.append(el('small','DESIRED RESULT — NOT PHYSICALLY VERIFIED'));
   list.append(item);
  }
 }
 target.append(list);
}

/**
 * @param {{experiment:string,modelParts:Array<{name:string,userData:any}>,
 * selectParts:function(Array):void,focusParts:function(Array):void,
 * updateLinks:function(number):void,initialStep:string}} opts
 */
export function createTripwireLesson({experiment,modelParts,selectParts,focusParts,updateLinks,initialStep}){
 const guide=tripwireGuide(experiment);
 if(!guide)throw Error('Unknown tripwire lesson');
 const lookup=new Map(modelParts.map(p=>[p.name.split(' · ')[0],p]));
 if(!validateGuide(guide,[...lookup.keys()]))throw Error('Lesson/3D component identities are out of sync');

 const root=byId('tripwire-guide');
 const toggle=byId('guide-toggle'),previous=byId('guide-prev'),next=byId('guide-next');
 const review=byId('guide-read'),focus=byId('guide-focus'),reset=byId('guide-reset');
 const key='3d-vision:mcgruber-guides:v'+GUIDE_VERSION+':'+experiment;
 const reviewed=readProgress(key,guide.steps.length);
 let index=guideIndex(initialStep,guide.steps.length);
 let collapsed=false;
 root.hidden=false;
 root.dataset.experiment=experiment;
 byId('guide-title').textContent='Experiment '+experiment+' · 3D build lesson';
 byId('guide-notice').textContent=guide.notice;
 byId('guide-version').textContent='Illustrative workshop · '+guide.steps.length+' stages · version '+GUIDE_VERSION;

 function show(){
  const s=guide.steps[index];
  const active=s.parts.map(id=>lookup.get(id));
  byId('guide-step-count').textContent='Stage '+(index+1)+' of '+guide.steps.length;
  byId('guide-stage-title').textContent=s.title;
  byId('guide-placement').textContent=s.placement;
  byId('guide-parts').replaceChildren();
  for(const id of s.parts){
   const p=lookup.get(id);
   const button=el('button',p.name,'guide-part');
   button.type='button';
   button.dataset.part=id;
   button.onclick=()=>selectParts([p]);
   byId('guide-parts').append(button);
  }
  byId('guide-instructions').replaceChildren();
  addList(byId('guide-instructions'),s.instructions,'guide-steps');
  byId('guide-connections').replaceChildren();
  addConnections(byId('guide-connections'),s.connections);
  byId('guide-check-task').textContent=s.checkpoint.task;
  byId('guide-check-expected').textContent=s.checkpoint.observation;
  byId('guide-check-record').textContent=s.checkpoint.record;
  byId('guide-caution').hidden=!s.caution;
  byId('guide-caution').textContent=s.caution;
  byId('guide-gate').textContent=s.gate==='BLOCKED'?
   'BLOCKED — design or real measurements missing':
   s.gate==='visual-only'?'Visual placement only':
   'Real-world test NOT recorded';
  byId('guide-gate').dataset.gate=s.gate;
  previous.disabled=index===0;
  next.disabled=index===guide.steps.length-1;
  next.textContent=next.disabled?'Last stage':'Next stage →';
  review.setAttribute('aria-pressed',String(reviewed.has(index)));
  review.textContent=reviewed.has(index)?'✓ Lesson read (not tested)':'Mark lesson as read';
  const n=reviewed.size;
  byId('guide-progress').textContent=n+' of '+guide.steps.length+' lessons read · physical checks still UNVERIFIED';
  byId('guide-progress-bar').value=n;
  byId('guide-progress-bar').max=guide.steps.length;
  selectParts(active);
  updateLinks(index);
 }
 function navigate(target){
  index=Math.max(0,Math.min(guide.steps.length-1,target));
  history.replaceState(history.state,'',urlWithStep(index));
  show();
 }
 previous.onclick=()=>navigate(index-1);
 next.onclick=()=>navigate(index+1);
 focus.onclick=()=>focusParts(guide.steps[index].parts.map(id=>lookup.get(id)));
 review.onclick=()=>{
  if(reviewed.has(index))reviewed.delete(index);else reviewed.add(index);
  storeProgress(key,reviewed);show();
 };
 reset.onclick=()=>{
  reviewed.clear();storeProgress(key,reviewed);show();
 };
 toggle.onclick=()=>{
  collapsed=!collapsed;
  root.dataset.collapsed=String(collapsed);
  toggle.textContent=collapsed?'Open lesson':'Collapse lesson';
  toggle.setAttribute('aria-expanded',String(!collapsed));
 };
 byId('guide-select-stage').onclick=()=>selectParts(guide.steps[index].parts.map(id=>lookup.get(id)));
 show();
 return {
  get index(){return index;},
  get reviewed(){return [...reviewed];},
  get collapsed(){return collapsed;},
  goTo:navigate,
  render:show,
  dispose(){
   for(const button of [previous,next,review,focus,reset,toggle,byId('guide-select-stage')])button.onclick=null;
   root.hidden=true;
  }
 };
}
