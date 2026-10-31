// Original low-stakes SLP retrieval prompts, not copied from flashcard add-ons.
// Source-backed answer concepts from the pinned neuralLessons; missing CN IX stays TEXT ONLY.
// Questions are study exercises, never a diagnostic nerve exam or a clinical grade.
import {neuralLessons,neuralById,teachingStepId} from './neural-manifest.js';

const prompts=[
 ['mastication','Which cranial nerve supplies muscles of mastication (chewing)?',0,
  'CN V (trigeminal) supplies the major muscles of chewing. This source mesh shows only part of its nerve course.'],
 ['lip-control','Which cranial nerve supplies muscles of facial expression used for lip closure?',1,
  'CN VII (facial) supplies muscles of facial expression, including muscles involved in lip movement.'],
 ['vestibular','Which displayed nerve branch is mainly associated with balance, rather than representing the entire cochlear hearing pathway?',2,
  'The source includes a vestibular nerve branch of CN VIII. It must not be mislabeled as the entire auditory nerve or cochlear branch.'],
 ['posterior-sensation','Which cranial nerve has important posterior-tongue and pharyngeal sensory roles but is absent as a 3D mesh in this model?',3,
  'CN IX (glossopharyngeal) is relevant to posterior tongue/pharyngeal sensation and swallowing. This source does not have a separate CN IX mesh.'],
 ['voice-swallow','Which cranial nerve has major pharyngeal and laryngeal functions relevant to voice and swallowing?',4,
  'CN X (vagus) helps support pharyngeal and laryngeal functions. This mesh does not resolve its specific laryngeal branches.'],
 ['neck-muscles','Which cranial nerve supplies the sternocleidomastoid and trapezius?',5,
  'CN XI (accessory) supplies sternocleidomastoid and trapezius. It is not the primary tongue motor nerve.'],
 ['tongue-motor','Which cranial nerve provides motor supply to most intrinsic and extrinsic tongue muscles?',6,
  'CN XII (hypoglossal) supplies most tongue musculature important for articulation and bolus control.']
];
export const neuralPracticeQuestions=Object.freeze(prompts.map(([id,prompt,correct,explanation])=>
 Object.freeze({id,prompt,correct,explanation,sourceKey:neuralLessons[correct].key})));
export const neuralAnswerLabels=Object.freeze(neuralLessons.map(step=>step.label));
function hash(str){
 let n=2166136261;
 for(const char of str)n=Math.imul(n^char.charCodeAt(0),16777619)>>>0;
 return n;
}
export function practiceChoices(question){
 if(!neuralPracticeQuestions.includes(question))throw new RangeError('Question must be part of verified neural source quiz');
 const distractors=neuralLessons.map((_,i)=>i).filter(i=>i!==question.correct)
  .sort((a,b)=>hash(question.id+':'+a)-hash(question.id+':'+b)).slice(0,3);
 const choices=[question.correct,...distractors].sort((a,b)=>
  hash(question.id+':answer:'+a)-hash(question.id+':answer:'+b));
 return choices.map(index=>({id:index,label:neuralAnswerLabels[index]}));
}
export function validateNeuralPractice(){
 if(neuralPracticeQuestions.length!==7||new Set(neuralPracticeQuestions.map(q=>q.id)).size!==7)
  throw Error('Exactly seven distinct neural source practice concepts required');
 for(const [index,q] of neuralPracticeQuestions.entries()){
  if(q.correct!==index||q.sourceKey!==neuralLessons[index].key||
    q.prompt.length<45||q.explanation.length<75)throw Error('Practice concept mismatch: '+q.id);
  const choices=practiceChoices(q);
  if(choices.length!==4||new Set(choices.map(c=>c.id)).size!==4||
   choices.filter(c=>c.id===q.correct).length!==1)throw Error('Practice choices not unique: '+q.id);
  const sourceId=teachingStepId(neuralLessons[index],'left');
  if(index===3&&sourceId!==null)throw Error('Missing CN IX must have no invented source mesh');
  if(index!==3&&!neuralById.has(sourceId))throw Error('Practice answer missing source mesh: '+q.id);
 }
 return true;
}
// Keep first-attempt scores distinct from optional review of missed questions.
export function createNeuralPracticeSession(){
 validateNeuralPractice();
 return {queue:[...neuralPracticeQuestions],round:1,index:0,answered:false,
  correct:0,missed:[],missedSecond:0,finished:false};
}
export function currentNeuralQuestion(session){return session.finished?null:session.queue[session.index]||null;}
export function recordNeuralAnswer(session,answer){
 const q=currentNeuralQuestion(session);
 if(!q||session.answered||!practiceChoices(q).some(c=>c.id===answer))return null;
 const right=q.correct===answer;
 session.answered=true;
 if(session.round===1){if(right)session.correct++;else session.missed.push(q);}
 else if(!right)session.missedSecond++;
 return {right,question:q,correctLabel:neuralAnswerLabels[q.correct],
  sourceId:teachingStepId(neuralLessons[q.correct],'left')};
}
export function nextNeuralQuestion(session){
 if(!session.answered||session.finished)return false;
 if(session.index+1<session.queue.length){
  session.index++;session.answered=false;return true;
 }
 session.finished=true;return false;
}
export function restartMissedNeuralQuestions(session){
 if(!session.finished||session.round!==1||session.missed.length===0)return false;
 session.round=2;session.queue=[...session.missed];session.index=0;
 session.answered=false;session.finished=false;return true;
}
