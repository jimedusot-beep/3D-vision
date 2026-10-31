// Source-linked retrieval practice for the twenty pinned BodyParts3D respiratory groups.
// This tests identification of model group-to-region labels, NOT clinical anatomy mastery.
// Questions have text-only parity when WebGL is unavailable. No answers are stored.
import {lungGroups,lungGroupById,lungRegions} from './lungs-manifest.js';

export const lungPracticeQuestions=Object.freeze(lungGroups.map(group=>Object.freeze({
 id:group.id,
 name:group.name,
 answer:group.region,
 description:group.description
})));
export const lungPracticeWarmup=Object.freeze(
 Object.keys(lungRegions).map(region=>lungPracticeQuestions.find(q=>q.answer===region))
);

export function regionChoices(question){
 const regions=Object.keys(lungRegions);
 if(!regions.includes(question.answer))throw Error('Unknown anatomical region');
 const distractors=regions.filter(region=>region!==question.answer);
 const offset=lungPracticeQuestions.findIndex(q=>q.id===question.id);
 if(offset<0)throw Error('Question does not match source manifest');
 const alternatives=[0,1,2].map(i=>distractors[(offset+i)%distractors.length]);
 const options=alternatives.map(id=>({id,label:lungRegions[id]}));
 options.splice(offset%4,0,{id:question.answer,label:lungRegions[question.answer]});
 return options;
}

export function validateLungPractice(){
 if(lungPracticeQuestions.length!==20||new Set(lungPracticeQuestions.map(q=>q.id)).size!==20||
   lungPracticeWarmup.length!==6||new Set(lungPracticeWarmup.map(q=>q.answer)).size!==6)
   throw Error('Respiratory practice must cover 20 distinct source groups and six regions');
 for(const question of lungPracticeQuestions){
  const source=lungGroupById.get(question.id);
  const choices=regionChoices(question);
  if(!source||question.answer!==source.region||question.name!==source.name||
   question.description!==source.description||
   choices.length!==4||new Set(choices.map(x=>x.id)).size!==4||
   choices.filter(choice=>choice.id===question.answer).length!==1)
   throw Error('Practice answer or distractors do not match pinned source manifest: '+question.id);
 }
 return true;
}

export function initLungPractice({selectStructure,focusStructure,resetScene}){
 validateLungPractice();
 const $=id=>document.getElementById(id);
 const panel=$('lung-practice-active'),quick=$('lung-practice-quick'),
       full=$('lung-practice-full'),next=$('lung-practice-next'),
       exit=$('lung-practice-exit'),options=$('lung-practice-options'),
       feedback=$('lung-practice-feedback'),summary=$('lung-practice-summary'),
       stage=$('lung-stage');
 let questions=[],index=-1,correct=0,answered=false;
 function showQuestion(){
  const question=questions[index];
  resetScene();
  answered=false;
  feedback.hidden=true;feedback.textContent='';
  next.disabled=true;
  options.replaceChildren();
  $('lung-practice-progress').textContent='Question '+(index+1)+' of '+questions.length+
   ' · '+correct+' correct';
  $('lung-practice-question').textContent='Which lobe or airway category is assigned to the source-model group “'+question.name+'”?';
  for(const choice of regionChoices(question)){
   const button=document.createElement('button');
   button.type='button';button.textContent=choice.label;
   button.dataset.region=choice.id;
   button.addEventListener('click',()=>{
    if(answered)return;
    answered=true;
    const right=choice.id===question.answer;
    if(right)correct++;
    for(const candidate of options.querySelectorAll('button')){
     candidate.disabled=true;
     candidate.dataset.correct=String(candidate.dataset.region===question.answer);
     candidate.setAttribute('aria-pressed',String(candidate===button));
    }
    selectStructure(question.id);
    focusStructure(question.id);
    feedback.hidden=false;
    feedback.textContent=(right?'Correct. ':'Not quite. ')+
     'Source label: '+question.name+'. Region: '+lungRegions[question.answer]+
     '. '+question.description+' · BodyParts3D source group '+question.id+
     '. Use the highlighted 3D structure (if available) and notes to review.';
    $('lung-practice-progress').textContent='Question '+(index+1)+' of '+questions.length+
     ' · '+correct+' correct';
    next.disabled=false;
    next.textContent=index===questions.length-1?'Finish review':'Next question';
   });
   options.append(button);
  }
 }
 function finish(completed){
  const total=questions.length,score=correct,seen=index+(answered?1:0);
  questions=[];index=-1;answered=false;
  panel.hidden=true;quick.hidden=false;full.hidden=false;
  stage.dataset.practice='off';
  resetScene();
  summary.hidden=false;
  summary.textContent=completed
   ?'Review complete: '+score+' of '+total+' correct on the first attempt. Study aid only; no result was saved.'
   :'Practice exited after '+seen+' of '+total+' questions. No answers saved.';
 }
 function begin(mode){
  if(stage.dataset.tourStep!=='off')$('lung-tour-close').click();
  questions=mode==='full'?[...lungPracticeQuestions]:[...lungPracticeWarmup];
  correct=0;index=0;answered=false;
  panel.hidden=false;quick.hidden=true;full.hidden=true;
  summary.hidden=true;summary.textContent='';
  stage.dataset.practice=mode;
  showQuestion();
 }
 quick.addEventListener('click',()=>begin('quick'));
 full.addEventListener('click',()=>begin('full'));
 next.addEventListener('click',()=>{
  if(index<0||!answered)return;
  if(index===questions.length-1)finish(true);
  else{index++;showQuestion();}
 });
 exit.addEventListener('click',()=>{
  if(index<0)return;
  finish(false);
 });
 stage.dataset.practice='off';
 return {exit:()=>{if(index>=0)exit.click();}};
}
