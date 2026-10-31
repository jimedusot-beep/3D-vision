// Session-only, transparent self-assessment. Does not grade correctness or store history.
// "Again" requeues one card later in the session; it is NOT a timed spacing algorithm.
export function createPracticeSession(prompts) {
  if(!Array.isArray(prompts)||prompts.length===0)throw new TypeError('Study prompts required');
  const ids=prompts.map(p=>p.id);
  if(ids.some(id=>typeof id!=='string'||!id)||new Set(ids).size!==ids.length)
    throw new TypeError('Study prompt IDs must be unique, nonempty strings');
  return {ids,queue:[...ids],currentId:null,currentRated:false,round:1,rated:0,recognized:0,reviewAgain:0};
}
export function nextPracticeQuestion(session) {
  if(session.queue.length===0){session.queue=[...session.ids];session.round++;}
  session.currentId=session.queue.shift();
  session.currentRated=false;
  return session.currentId;
}
export function ratePracticeQuestion(session,id,rating) {
  if(session.currentId!==id||session.currentRated||!['again','recognized'].includes(rating))
    return false;
  session.currentRated=true;
  session.rated++;
  if(rating==='again'){session.reviewAgain++;session.queue.push(id);}
  else session.recognized++;
  return true;
}
export function practiceSummary(session) {
  return {
    round:session.round,
    checks:session.rated,
    recognized:session.recognized,
    reviewAgain:session.reviewAgain,
    remaining:session.queue.length
  };
}
