import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createPracticeSession,nextPracticeQuestion,ratePracticeQuestion,practiceSummary} from '../ANATOMY/SLP/practice-session.js';

const cards=[{id:'alpha'},{id:'beta'},{id:'gamma'}];
test('validates unique nonempty practice IDs',()=>{
  assert.throws(()=>createPracticeSession([]),TypeError);
  assert.throws(()=>createPracticeSession([{id:'x'},{id:'x'}]),TypeError);
  assert.throws(()=>createPracticeSession([{id:''}]),TypeError);
});
test('starts in authored order without network or persistent storage',()=>{
  const session=createPracticeSession(cards);
  assert.equal(nextPracticeQuestion(session),'alpha');
  assert.equal(nextPracticeQuestion(session),'beta');
  assert.deepEqual(practiceSummary(session),{round:1,checks:0,recognized:0,reviewAgain:0,remaining:1});
});
test('review again queues a single repeat after other current questions',()=>{
  const session=createPracticeSession(cards);
  assert.equal(nextPracticeQuestion(session),'alpha');
  assert.equal(ratePracticeQuestion(session,'alpha','again'),true);
  assert.equal(ratePracticeQuestion(session,'alpha','again'),false);
  assert.equal(nextPracticeQuestion(session),'beta');
  assert.equal(nextPracticeQuestion(session),'gamma');
  assert.equal(nextPracticeQuestion(session),'alpha');
  assert.deepEqual(practiceSummary(session),{round:1,checks:1,recognized:0,reviewAgain:1,remaining:0});
});
test('only valid self-ratings count and a new round resets the review queue',()=>{
  const session=createPracticeSession(cards);
  assert.equal(ratePracticeQuestion(session,'alpha','recognized'),false);
  assert.equal(nextPracticeQuestion(session),'alpha');
  assert.equal(ratePracticeQuestion(session,'beta','recognized'),false);
  assert.equal(ratePracticeQuestion(session,'alpha','nonsense'),false);
  assert.equal(ratePracticeQuestion(session,'alpha','recognized'),true);
  assert.equal(nextPracticeQuestion(session),'beta');
  assert.equal(nextPracticeQuestion(session),'gamma');
  assert.equal(nextPracticeQuestion(session),'alpha');
  assert.deepEqual(practiceSummary(session),{round:2,checks:1,recognized:1,reviewAgain:0,remaining:2});
});
test('sessions are independent and summary is aggregate-only',()=>{
  const first=createPracticeSession(cards),second=createPracticeSession(cards);
  nextPracticeQuestion(first);
  ratePracticeQuestion(first,'alpha','again');
  assert.equal(practiceSummary(second).checks,0);
  assert.deepEqual(Object.keys(practiceSummary(first)).sort(),['checks','recognized','remaining','reviewAgain','round'].sort());
});
