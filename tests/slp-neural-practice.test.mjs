import {test} from 'node:test';
import assert from 'node:assert/strict';
import {neuralLessons,neuralById} from '../ANATOMY/SLP/neural-manifest.js';
import {neuralAnswerLabels,neuralPracticeQuestions,practiceChoices,validateNeuralPractice,
 createNeuralPracticeSession,currentNeuralQuestion,recordNeuralAnswer,nextNeuralQuestion,
 restartMissedNeuralQuestions} from '../ANATOMY/SLP/neural-practice.js';

test('seven original questions are linked to source-verified SLP nerve concepts, never invented meshes',()=>{
 assert.equal(validateNeuralPractice(),true);
 assert.equal(neuralPracticeQuestions.length,7);
 assert.equal(neuralAnswerLabels.length,7);
 for(const [i,q] of neuralPracticeQuestions.entries()){
  assert.equal(q.correct,i);
  assert.equal(q.sourceKey,neuralLessons[i].key);
  const options=practiceChoices(q);
  assert.equal(options.length,4);
  assert.equal(new Set(options.map(o=>o.id)).size,4);
  assert.equal(options.filter(o=>o.id===q.correct).length,1);
 }
 assert.match(neuralPracticeQuestions[2].explanation,/vestibular/i);
 assert.match(neuralPracticeQuestions[3].explanation,/does not have a separate CN IX mesh/i);
 assert.throws(()=>practiceChoices({...neuralPracticeQuestions[0]}),/verified neural source/);
});
test('seven first-attempt answers return original source ids only after a choice and report honest score',()=>{
 const session=createNeuralPracticeSession();
 assert.equal(session.round,1);
 assert.equal(session.queue.length,7);
 for(let i=0;i<7;i++){
  const q=currentNeuralQuestion(session);
  assert.equal(q,neuralPracticeQuestions[i]);
  assert.equal(session.answered,false);
  assert.equal(recordNeuralAnswer(session,-42),null);
  assert.equal(session.answered,false);
  const result=recordNeuralAnswer(session,q.correct);
  assert.equal(result.right,true);
  assert.equal(session.correct,i+1);
  if(i===3)assert.equal(result.sourceId,null);
  else assert.ok(neuralById.has(result.sourceId));
  assert.equal(recordNeuralAnswer(session,q.correct),null,'duplicate clicks cannot score twice');
  assert.equal(nextNeuralQuestion(session),i!==6);
 }
 assert.equal(session.finished,true);
 assert.equal(session.correct,7);
 assert.equal(session.missed.length,0);
 assert.equal(restartMissedNeuralQuestions(session),false);
 assert.equal(currentNeuralQuestion(session),null);
});
test('wrong first attempts can be reviewed once without inflating score',()=>{
 const session=createNeuralPracticeSession();
 const missed=[0,3,6];
 for(let i=0;i<7;i++){
  const q=currentNeuralQuestion(session);
  const chosen=missed.includes(i)?practiceChoices(q).find(c=>c.id!==q.correct).id:q.correct;
  const result=recordNeuralAnswer(session,chosen);
  assert.equal(result.right,!missed.includes(i));
  nextNeuralQuestion(session);
 }
 assert.equal(session.correct,4);
 assert.deepEqual(session.missed.map(q=>q.correct),missed);
 assert.equal(restartMissedNeuralQuestions(session),true);
 assert.equal(session.queue.length,3);
 assert.equal(session.round,2);
 for(let i=0;i<3;i++){
  const q=currentNeuralQuestion(session);
  const response=i===0?practiceChoices(q).find(c=>c.id!==q.correct).id:q.correct;
  assert.ok(recordNeuralAnswer(session,response));
  nextNeuralQuestion(session);
 }
 assert.equal(session.missedSecond,1);
 assert.equal(session.correct,4,'original first attempt score must remain separate');
 assert.equal(restartMissedNeuralQuestions(session),false);
});
test('source quiz declares no persistence, professional diagnosis, or external AGPL code copy',async()=>{
 const {readFileSync}=await import('node:fs');
 const ui=readFileSync(new URL('../ANATOMY/SLP/neural-practice-ui.js',import.meta.url),'utf8');
 const html=readFileSync(new URL('../ANATOMY/SLP/neural.html',import.meta.url),'utf8');
 assert.doesNotMatch(ui,/localStorage|sessionStorage|indexedDB|fetch\(|sendBeacon|Anki/);
 assert.match(html,/nothing is uploaded or saved/i);
 assert.match(html,/Review missed questions/);
 assert.match(html,/CN IX remains text-only/);
 assert.match(html,/evidence-based retrieval practice in clinical anatomy/);
});
