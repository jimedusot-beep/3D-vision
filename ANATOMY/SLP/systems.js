import {systemModules,respiratoryTerms,respiratoryQuestions,validateSystems} from './systems-catalog.js';
validateSystems();
const $=id=>document.getElementById(id);
const stages={study:'Respiratory study available · No 3D yet', '3d':'Source-derived 3D model available',
  outline:'Curriculum outline · Models and lessons pending review'};
const cards=new Map();
let current='respiration';
for(const module of systemModules){
  const article=document.createElement('article');
  article.className='module-card';article.dataset.active='false';
  const tag=document.createElement('span');tag.className='pill';tag.textContent=stages[module.stage];
  const name=document.createElement('h3');name.textContent=module.name;
  const summary=document.createElement('p');summary.textContent=module.overview;
  const button=document.createElement('button');button.type='button';
  button.textContent='Study '+module.name;
  button.dataset.moduleId=module.id;
  button.setAttribute('aria-pressed','false');
  button.addEventListener('click',()=>chooseModule(module.id,true));
  article.append(tag,name,summary,button);
  $('module-grid').append(article);
  cards.set(module.id,{article,button});
}
function addItems(list,items){
  list.replaceChildren();
  for(const item of items){const li=document.createElement('li');li.textContent=item;list.append(li);}
}
function chooseModule(id,scroll=false){
  const module=systemModules.find(item=>item.id===id);
  if(!module)return;
  current=id;
  for(const [key,{article,button}] of cards){
    article.dataset.active=String(key===id);
    button.setAttribute('aria-pressed',String(key===id));
  }
  $('module-title').textContent=module.name;
  $('module-status').textContent=stages[module.stage]+' · '+module.group;
  $('module-description').textContent=module.overview;
  addItems($('module-objectives'),module.objectives);
  addItems($('module-next'),module.next);
  $('module-open-3d').hidden=module.id!=='phonation';
  $('respiratory-study').hidden=module.id!=='respiration';
  $('module-source').replaceChildren();
  const link=document.createElement('a');
  link.href=module.source;link.rel='noopener noreferrer';link.target='_blank';
  link.textContent='View an ASHA reference for this study area';
  $('module-source').append(link);
  if(scroll)$('module-detail').focus({preventScroll:false});
}
for(const term of respiratoryTerms){
  const box=document.createElement('article');box.className='term';
  const h=document.createElement('h4');h.textContent=term.name;
  const detail=document.createElement('p');detail.textContent=term.function;
  const speech=document.createElement('p');speech.textContent='Speech connection: '+term.relation;
  box.append(h,detail,speech);
  $('term-grid').append(box);
}
const phases={
  inhale:'Quiet inspiration: diaphragm contraction expands the thorax and supports airflow INTO the lungs. This diagram is static and does not calculate volume.',
  speak:'Typical speech exhalation: air moves OUT from the lungs through the trachea and larynx; regulated pressure and vocal-fold action help generate voice.'
};
function selectPhase(phase){
  $('flow-inhale').setAttribute('aria-pressed',String(phase==='inhale'));
  $('flow-speak').setAttribute('aria-pressed',String(phase==='speak'));
  $('flow-description').textContent=phases[phase];
}
$('flow-inhale').addEventListener('click',()=>selectPhase('inhale'));
$('flow-speak').addEventListener('click',()=>selectPhase('speak'));
selectPhase('inhale');
let index=0,correct=0,answered=false;
function showQuestion(){
  const q=respiratoryQuestions[index];answered=false;
  $('resp-score').textContent='Question '+(index+1)+' of '+respiratoryQuestions.length+
    ' · '+correct+' correct in this session';
  $('resp-question').textContent=q.question;
  $('resp-answer').hidden=true;
  $('resp-answer').textContent='';
  $('resp-next').disabled=true;
  $('resp-next').textContent=index===respiratoryQuestions.length-1?'Finish':'Next question';
  $('resp-options').replaceChildren();
  for(const id of q.choices){
    const choice=document.createElement('button');choice.type='button';
    const term=respiratoryTerms.find(x=>x.id===id);
    choice.textContent=term?.name||id;choice.dataset.answerId=id;
    choice.setAttribute('aria-pressed','false');
    choice.addEventListener('click',()=>checkAnswer(id));
    $('resp-options').append(choice);
  }
}
function checkAnswer(id){
  if(answered)return;
  const q=respiratoryQuestions[index];
  if(!q.choices.includes(id))return;
  answered=true;
  const accurate=id===q.answer;
  if(accurate)correct++;
  for(const button of $('resp-options').querySelectorAll('button')){
    button.disabled=true;
    button.setAttribute('aria-pressed',String(button.dataset.answerId===id));
  }
  $('resp-score').textContent='Question '+(index+1)+' of '+respiratoryQuestions.length+
    ' · '+correct+' correct in this session';
  $('resp-answer').hidden=false;
  const answer=respiratoryTerms.find(x=>x.id===q.answer);
  $('resp-answer').textContent=(accurate?'Correct. ':'Not quite. ')+
    'Answer: '+answer.name+'. '+q.explanation;
  $('resp-next').disabled=false;
}
$('resp-next').addEventListener('click',()=>{
  if(!answered)return;
  if(index===respiratoryQuestions.length-1){
    $('resp-score').textContent='Completed '+respiratoryQuestions.length+
      ' questions · '+correct+' correct in this session';
    $('resp-question').textContent='Use Restart six checks to review the respiratory system again.';
    $('resp-options').replaceChildren();
    $('resp-answer').hidden=true;
    $('resp-next').disabled=true;
    return;
  }
  index++;showQuestion();
});
$('resp-restart').addEventListener('click',()=>{index=0;correct=0;showQuestion();});
showQuestion();
const initial=new URLSearchParams(location.search).get('system');
chooseModule(systemModules.some(s=>s.id===initial)?initial:'respiration');
