import {test} from 'node:test';
import assert from 'node:assert/strict';
import {workerTask} from '../src/tasks.js';
class WorkerStub {
 constructor(reply){this.reply=reply;this.terminated=false;}
 postMessage(message){this.message=message;this.reply?.(this);}
 terminate(){this.terminated=true;}
}
test('worker task forwards progress and result, then releases its worker',async()=>{
 const progress=[];const w=new WorkerStub(w=>{w.onmessage({data:{progress:{checked:1,total:2}}});w.onmessage({data:{result:{type:'thickness'}}});});let cancellation;
 assert.deepEqual(await workerTask(w,{type:'thickness'},{progress:v=>progress.push(v),cancel:fn=>cancellation=fn}),{type:'thickness'});
 assert.deepEqual(progress,[{checked:1,total:2}]);assert.equal(w.terminated,true);assert.equal(cancellation,null);
});
test('cancelled, failed and timed-out workers are terminated and cannot mutate a scene',async()=>{
 for(const mode of ['cancel','failure','timeout']){
  let cancel;const w=new WorkerStub(mode==='failure'?w=>w.onmessage({data:{error:'Invalid topology'}}):null);
  const promise=workerTask(w,{}, {cancel:fn=>cancel=fn,timeout:5});
  if(mode==='cancel')cancel();await assert.rejects(promise,mode==='cancel'?/cancelled/:mode==='failure'?/topology/:/exceeded/);assert.equal(w.terminated,true);assert.equal(cancel,null);
 }
});
