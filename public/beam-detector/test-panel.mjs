import { QualificationRun } from './beam-core.mjs';
const key='mcgruber-beam-v4-tests', ids=['test-distance','test-source','test-lighting','test-duration','test-crossings'];
const el=id=>document.getElementById(id);
export class TestPanel {
  constructor(snapshot) {
    this.snapshot=snapshot;this.run=null;this.saved=false;this.history=[];this.lastRender=0;
    try {const data=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(data))this.history=data.filter(r=>r&&r.schema===1&&typeof r.phase==='string'&&typeof r.distance==='string').slice(-50);}catch {el('save-status').textContent='Local storage unavailable. Download results before leaving.';}
    el('begin-test').addEventListener('click',()=>this.begin());
    el('finish-crossings').addEventListener('click',()=>{if(this.run){const s=this.snapshot();this.run.finishCrossings(performance.now(),s.count,s.state,el('crossings-confirm').checked);this.observe(performance.now());}});
    el('cancel-test').addEventListener('click',()=>this.interrupt('Cancelled by operator.'));
    el('export-tests').addEventListener('click',()=>this.export());
    for(const id of ids)el(id).addEventListener('change',()=>{this.interrupt('Test settings changed.');this.render();});
    queueMicrotask(()=>this.render());
  }
  active(){return this.run&&['crossings','idle'].includes(this.run.phase);}
  begin(){
    const s=this.snapshot();if(!s.armed||s.state!=='present'||this.active())return;
    this.run=new QualificationRun({distance:el('test-distance').value,source:el('test-source').value,lighting:el('test-lighting').value,idleMs:Number(el('test-duration').value),requiredCrossings:Number(el('test-crossings').value),mode:s.mode,reference:s.reference,aim:s.aim,camera:s.camera,version:el('build-version').textContent,startedISO:new Date().toISOString(),userAgent:navigator.userAgent},performance.now(),s.count);
    this.saved=false;el('crossings-confirm').checked=false;this.render();
  }
  interrupt(reason){if(this.active()){this.run.interrupt(reason);this.saveTerminal();}this.render();}
  observe(time){
    if(this.active()){const s=this.snapshot();this.run.observe(time,s.count,s.state);this.saveTerminal();}
    if(time-this.lastRender>250||!this.active()){this.lastRender=time;this.render();}
  }
  saveTerminal(){
    if(!this.run||this.active()||this.saved)return;
    const row={...this.run.result(),finishedISO:new Date().toISOString()};this.history.push(row);this.history=this.history.slice(-50);this.saved=true;
    try{localStorage.setItem(key,JSON.stringify(this.history));el('save-status').textContent='Last 50 completed attempts saved in this browser. Download for a backup.';}
    catch{el('save-status').textContent='Could not save locally. Results remain here until reload; download now.';}
  }
  render(){
    const s=this.snapshot(),active=this.active();
    el('begin-test').disabled=!!active||!s.armed||s.state!=='present';
    el('finish-crossings').disabled=this.run?.phase!=='crossings';el('crossings-confirm').disabled=this.run?.phase!=='crossings';el('cancel-test').disabled=!active;
    for(const id of ids)el(id).disabled=!!active;
    if(this.run){const r=this.run;el('test-status').textContent=`${r.phase.toUpperCase()} · ${r.observedBreaks}/${r.meta.requiredCrossings} breaks · ${r.meta.distance} · ${r.reason}`+(r.phase==='idle'?` ${Math.max(0,Math.ceil((r.meta.idleMs-r.idleElapsedMs)/1000))} seconds remaining.`:'');}
    const source=el('test-source').value,lighting=el('test-lighting').value;
    const distances=new Set(this.history.filter(r=>r.phase==='passed'&&r.source===source&&r.lighting===lighting&&(r.requiredCrossings||10)>=Number(el('test-crossings').value)&&r.idleMs>=Number(el('test-duration').value)).map(r=>r.distance));
    el('range-summary').textContent=`${distances.size} of 6 distances passed at the selected crossing/time requirements for ${source}, ${lighting}. ${[...distances].join(', ')}. Each pass applies only to its recorded setup.`;
    el('test-history').replaceChildren();
    for(const r of this.history.slice(-8).reverse()){const p=document.createElement('p');p.textContent=`${r.phase.toUpperCase()} · ${r.distance} · ${r.source} · ${r.lighting} · ${r.observedBreaks}/${r.requiredCrossings||10} · ${Math.floor(r.idleElapsedMs/1000)}s stationary`;el('test-history').append(p);}
  }
  export(){
    const payload={schema:1,app:'McGruber Silent Beam Lab V4',exportedISO:new Date().toISOString(),evidence:'User-run camera experiment; no independent hardware verification.',history:this.history,active:this.active()?this.run.result():null};
    const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));
    const a=document.createElement('a');a.href=url;a.download='mcgruber-beam-test-results.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
}
