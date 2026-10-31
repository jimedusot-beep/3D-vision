// Live, session-only neural practice UI. Original questions are source-linked.
// Lessons remain accessible even when 3D or Draco decoding are unavailable.
import {neuralAnswerLabels,practiceChoices,createNeuralPracticeSession,
 currentNeuralQuestion,recordNeuralAnswer,nextNeuralQuestion,
 restartMissedNeuralQuestions} from './neural-practice.js';
const $=id=>document.getElementById(id);
export function initNeuralPractice({selectStructure,focusStructure}){
 let session=null;
 const panel=$('neural-practice-active'),feedback=$('neural-practice-feedback');
 const choices=$('neural-practice-options'),next=$('neural-practice-next');
 const start=$('neural-practice-start'),exit=$('neural-practice-exit');
 const summary=$('neural-practice-summary'),redo=$('neural-practice-missed');
 function show(){
  const q=currentNeuralQuestion(session);
  if(!q)return;
  selectStructure(null); // Do not disclose the correct source mesh before a reply.
  $('neural-practice-progress').textContent=
   (session.round===1?'First attempt':'Review missed')+' · Question '+(session.index+1)+' of '+session.queue.length;
  $('neural-practice-question').textContent=q.prompt;
  feedback.textContent='';feedback.hidden=true;
  next.disabled=true;next.textContent='Next question';
  choices.replaceChildren();
  for(const option of practiceChoices(q)){
   const button=document.createElement('button');button.type='button';
   button.textContent=option.label;button.dataset.answer=String(option.id);
   button.addEventListener('click',()=>{
    const result=recordNeuralAnswer(session,option.id);
    if(!result)return;
    for(const candidate of choices.querySelectorAll('button')){
     candidate.disabled=true;
     candidate.dataset.correct=String(Number(candidate.dataset.answer)===q.correct);
     candidate.setAttribute('aria-pressed',String(candidate===button));
    }
    if(result.sourceId!==null){
     selectStructure(result.sourceId);focusStructure();
    }
    feedback.hidden=false;
    feedback.textContent=(result.right?'Correct. ':'Not quite. ')+
     'Answer: '+result.correctLabel+'. '+q.explanation+
     (result.sourceId===null
       ?' No original 3D mesh is available for this nerve; use the text explanation.'
       :' Source mesh '+result.sourceId+' is selected if 3D graphics are available.');
    next.disabled=false;
    next.textContent=session.index===session.queue.length-1?'See results':'Next question';
   });
   choices.append(button);
  }
 }
 function complete(){
  panel.hidden=true;start.hidden=false;
  const text=session.round===1
   ?'First attempt: '+session.correct+' of 7 correct. '+session.missed.length+
    ' question(s) missed. This informal practice is not a clinical exam or verified competency score.'
   :'Missed-question review complete. '+session.missedSecond+
    ' of '+session.missed.length+' missed again. Return on another day for distributed practice.';
  summary.textContent=text;summary.hidden=false;
  redo.hidden=!(session.round===1&&session.missed.length>0);
 }
 function stop(){
  if(!session)return;
  session=null;panel.hidden=true;start.hidden=false;redo.hidden=true;
  summary.hidden=false;summary.textContent='Practice closed. No answers or scores were saved.';
  selectStructure(null);
 }
 start.addEventListener('click',()=>{
  if(!$('neural-lesson-active').hidden)$('neural-lesson-close').click();
  session=createNeuralPracticeSession();
  start.hidden=true;panel.hidden=false;summary.hidden=true;redo.hidden=true;
  show();
 });
 next.addEventListener('click',()=>{
  if(!session||!session.answered)return;
  if(nextNeuralQuestion(session))show();else complete();
 });
 redo.addEventListener('click',()=>{
  if(!session||!restartMissedNeuralQuestions(session))return;
  panel.hidden=false;start.hidden=true;summary.hidden=true;redo.hidden=true;
  show();
 });
 exit.addEventListener('click',stop);
 return {stop,isActive:()=>session!==null&&!session.finished};
}
