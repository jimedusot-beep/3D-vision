import { BeamDetector } from './beam-core.mjs';
import { TestPanel } from './test-panel.mjs';

(()=>{
'use strict';
const el=id=>document.getElementById(id);
const detector=new BeamDetector();
const testPanel=new TestPanel(()=>({armed:autoArmed, state:detector.state, count, mode, reference:detector.reference, aim:{...aim}, camera:el('camdebug').textContent}));
let frameTime=null, freshAt=0, guard=0;
const v=el('video'),box=el('viewport'),canvas=el('hidden-canvas'),ctx=canvas.getContext('2d',{willReadFrequently:true});
let stream=null, camera='environment',deviceId='',running=false,raf=0,scoreHistory=[],smooth=null,calOn=null,calOff=null,calJob=null,calibrated=false,confirmed='unknown',candidate='unknown',streak=0,count=0,mode='red',aim={x:.5,y:.5},lastFrame=0,frames=0,lastRate=0,rateCount=0,rateStart=0,connectionId=0,wakeLock=null,autoArmed=false,autoReference=null,armJob=null;
function status(kind,title,subtitle){const s=el('status');s.className='status'+(kind?' '+kind:'');el('state').textContent=title;el('state-note').textContent=subtitle;}
function error(msg){const e=el('error');e.textContent=msg;e.style.display='block';}function clearError(){el('error').style.display='none';}
function clamp(n,a,b){return Math.max(a,Math.min(b,n));}
function med(a){const b=[...a].sort((x,y)=>x-y);return b[Math.floor(b.length/2)]||0;}
function resetCalibration(message='Aim at your light and press ARM AUTOMATIC DETECTION once.') {testPanel.interrupt('Setup changed or camera stopped. Re-arm and start a new test.');detector.disarm();queueMicrotask(()=>testPanel.render());calOn=calOff=null;calibrated=false;calJob=null;autoArmed=false;autoReference=null;armJob=null;confirmed=candidate='unknown';streak=0;smooth=null;scoreHistory=[];el('on-reading').textContent='Show the beam';el('off-reading').textContent='Cover the beam';el('confidence').textContent='Not calibrated';el('gap').textContent='—';el('cal-info').textContent=message;if(running)status('wait','READY TO ARM','Aim at the light and tap ARM once.');el('on').disabled=!running;el('off').disabled=!running;el('arm').disabled=true;el('arm').textContent='ARM AUTOMATIC DETECTION';el('auto-info').textContent='Aim the target circle at the illuminated light, then press ARM once. Blocking it needs no button.';}
function releaseCamera(){clearInterval(guard);guard=0;frameTime=null;freshAt=0;if(raf){cancelAnimationFrame(raf);raf=0;}if(stream){stream.getTracks().forEach(t=>t.stop());stream=null;}v.pause();v.srcObject=null;running=false;el('reticle').style.display='none';el('placeholder').classList.remove('hidden');el('camera-select').disabled=true;el('restart').disabled=true;el('reverse').disabled=true;el('start').textContent='Start camera';if(wakeLock){wakeLock.release().catch(()=>{});wakeLock=null;}}
function stopCamera(){connectionId++;releaseCamera();resetCalibration();status('','CAMERA OFF','Tap Start camera to begin.');el('live').textContent='Camera stopped';}
function cameraError(e){if(e?.name==='NotAllowedError'||e?.name==='PermissionDeniedError')return 'Camera permission was denied. Open this HTTPS page in Safari (not inside ChatGPT or Files), allow Camera in the address-bar website settings, and tap Start again.';if(e?.name==='NotReadableError')return 'Camera is already in use or temporarily unavailable. Close Camera/FaceTime, reload Safari and retry.';if(e?.name==='OverconstrainedError')return 'This camera configuration is unsupported. Choose another lens or reload.';if(e?.name==='NotFoundError')return 'No camera was found.';return `Camera failed: ${e?.message||String(e)}`;}
async function startCamera(){const token=++connectionId;clearError();releaseCamera();resetCalibration();status('wait','STARTING CAMERA','Allow Safari camera access.');
  if(!isSecureContext||!navigator.mediaDevices?.getUserMedia){error('Camera access requires a secure HTTPS page opened directly in Safari. Downloaded HTML files and embedded previews may fail.');status('','CAMERA UNAVAILABLE','Open the hosted HTTPS version in Safari.');return;}
  try{
    const constraints={audio:false,video:deviceId?{deviceId:{ideal:deviceId},width:{ideal:1280},height:{ideal:720},frameRate:{ideal:15,max:24}}:{facingMode:{ideal:camera},width:{ideal:1280},height:{ideal:720},frameRate:{ideal:15,max:24}}};
    const s=await navigator.mediaDevices.getUserMedia(constraints);
    if(token!==connectionId){s.getTracks().forEach(t=>t.stop());return;}stream=s;v.muted=true;v.playsInline=true;v.srcObject=s;
    await new Promise((resolve,reject)=>{let finished=false;const done=(ok)=>{if(finished)return;finished=true;clearTimeout(timeout);v.removeEventListener('loadedmetadata',ready);ok?resolve():reject(new Error('Camera video did not start.'));};const ready=()=>done(true);const timeout=setTimeout(()=>done(v.videoWidth>0),4000);v.addEventListener('loadedmetadata',ready);if(v.videoWidth>0)done(true);});
    if(token!==connectionId)return;
    await v.play();
    if(token!==connectionId)return;
    const track=s.getVideoTracks()[0];track.addEventListener('ended',()=>{if(token===connectionId){stopCamera();error('Camera stream ended. Restart camera to continue.');}});
    running=true;freshAt=performance.now();guard=setInterval(()=>{if(running&&performance.now()-freshAt>1500){stopCamera();status('wait','CAMERA STALLED','No fresh frames. Restart the camera and re-arm.');}},250);el('placeholder').classList.add('hidden');el('reticle').style.display='block';el('reverse').disabled=false;el('restart').disabled=false;el('start').textContent='Stop camera';el('camera-note').textContent=(track.getSettings?.().facingMode||camera)==='user'?'Front camera':'Rear camera';el('reverse').textContent=camera==='environment'?'Use front camera':'Use rear camera';el('camdebug').textContent=`${v.videoWidth}×${v.videoHeight} · ${track.label||'Phone camera'}`;
    resetCalibration();lastFrame=0;rateStart=performance.now();rateCount=0;raf=requestAnimationFrame(tick);
    moveReticle();populateCameras();
    try{if(navigator.wakeLock?.request){const lock=await navigator.wakeLock.request('screen');if(token!==connectionId||!running)await lock.release();else wakeLock=lock;}}catch(_){/* optional */}
  }catch(e){if(token!==connectionId)return;releaseCamera();resetCalibration();status('','CAMERA ERROR','See instructions below.');error(cameraError(e));}
}
async function populateCameras(){if(!navigator.mediaDevices?.enumerateDevices)return;try{const devices=(await navigator.mediaDevices.enumerateDevices()).filter(d=>d.kind==='videoinput');if(!running)return;const select=el('camera-select');select.replaceChildren();const base=document.createElement('option');base.textContent='Automatic camera';base.value='';select.append(base);devices.forEach((d,i)=>{const o=document.createElement('option');o.value=d.deviceId;o.textContent=d.label||`Camera ${i+1}`;select.append(o);});select.value=deviceId;select.disabled=false;}catch(e){el('camdebug').textContent+=' · Lens list unavailable';}}
function coordsForTap(clientX,clientY){const rect=box.getBoundingClientRect(),vw=v.videoWidth,vh=v.videoHeight;if(!vw||!vh)return null;const cw=rect.width,ch=rect.height,scale=Math.min(cw/vw,ch/vh),dw=vw*scale,dh=vh*scale,left=(cw-dw)/2,top=(ch-dh)/2;const x=(clientX-rect.left-left)/dw,y=(clientY-rect.top-top)/dh;if(x<0||x>1||y<0||y>1)return null;return{x:clamp(x,.03,.97),y:clamp(y,.03,.97)};}
function moveReticle(){const cw=box.clientWidth,ch=box.clientHeight,vw=v.videoWidth||4,vh=v.videoHeight||3,scale=Math.min(cw/vw,ch/vh),dw=vw*scale,dh=vh*scale,left=(cw-dw)/2,top=(ch-dh)/2,r=el('reticle');r.style.left=(left+aim.x*dw)+'px';r.style.top=(top+aim.y*dh)+'px';}
function readBeam(){if(v.readyState<2||!v.videoWidth)return null;const w=320,h=Math.round(w*v.videoHeight/v.videoWidth);if(h<40||h>800)return null;if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}ctx.drawImage(v,0,0,w,h);const cx=Math.round(aim.x*w),cy=Math.round(aim.y*h),r=Math.max(6,Math.round(w*.033));const x=clamp(cx-r,0,w-1),y=clamp(cy-r,0,h-1),ww=Math.min(r*2+1,w-x),hh=Math.min(r*2+1,h-y);const pixels=ctx.getImageData(x,y,ww,hh).data;const values=[];
  for(let j=0;j<hh;j++){for(let i=0;i<ww;i++){const k=(j*ww+i)*4,R=pixels[k],G=pixels[k+1],B=pixels[k+2];let p;if(mode==='red')p=clamp(R-Math.max(G,B)*1.04,0,255);else p=(R*.24+G*.67+B*.09);values.push(p);}}
  values.sort((a,b)=>b-a);const n=Math.max(4,Math.ceil(values.length*.12));let top=0;for(let i=0;i<n;i++)top+=values[i];top/=n;
  const ringR=r*2.2,pt=[];for(let a=0;a<16;a++){const theta=a*2*Math.PI/16,rx=clamp(Math.round(cx+ringR*Math.cos(theta)),0,w-1),ry=clamp(Math.round(cy+ringR*Math.sin(theta)),0,h-1);const rgba=ctx.getImageData(rx,ry,1,1).data;pt.push(mode==='red'?clamp(rgba[0]-Math.max(rgba[1],rgba[2])*1.04,0,255):rgba[0]*.24+rgba[1]*.67+rgba[2]*.09);}
  const background=med(pt),corrected=clamp(top-(mode==='red'?background*.45:background*.7),0,255);
  return corrected;
}
function applyCandidate(next){if(next===candidate)streak++;else{candidate=next;streak=1;}if(streak<4||next===confirmed)return;const prev=confirmed;confirmed=next;if(next==='present')status('present','BEAM DETECTED','Light is reaching the camera.');else{status('blocked','BEAM BROKEN','Light was interrupted at the target.');if(prev==='present'){count++;el('trip-count').textContent=String(count);}}}
function tick(time){if(!running)return;raf=requestAnimationFrame(tick);if(time-lastFrame<50)return;lastFrame=time;if(v.readyState<2||v.currentTime===frameTime)return;frameTime=v.currentTime;freshAt=time;let score;try{score=readBeam();}catch(e){stopCamera();error('Camera frame processing failed. Tap Restart camera.');return;}if(score===null)return;const quality=score;smooth=smooth===null?score:smooth*.7+score*.3;scoreHistory.push(quality);if(scoreHistory.length>24)scoreHistory.shift();if(scoreHistory.length>=5&&!armJob&&!calJob)el('arm').disabled=false;rateCount++;if(time-rateStart>1200){el('fps').textContent=String(Math.round(rateCount*1000/(time-rateStart)));rateCount=0;rateStart=time;}
  el('score').textContent=`Light score ${smooth.toFixed(1)}`;el('live').textContent=smooth.toFixed(0)+' / 255';el('bar').style.width=clamp(smooth/255*100,0,100).toFixed(1)+'%';
  if(calJob){calJob.samples.push(quality);if(calJob.samples.length>=12)finishCal();return;}
  if(armJob){armJob.samples.push(quality);if(armJob.samples.length>=16)finishAutoArm();return;}
  if(autoArmed){
    const previous=detector.state, previousCount=detector.count;
    detector.update(quality,time);
    if(detector.state==='disarmed'){resetCalibration();status('wait','RE-ARM REQUIRED','Camera timing or sample quality changed.');return;}
    if(detector.count>previousCount){count+=detector.count-previousCount;el('trip-count').textContent=String(count);}
    if(detector.state!==previous){
      if(detector.state==='present')status('present','BEAM DETECTED','Light is reaching the camera.');
      else status('blocked','BEAM BROKEN','Light was interrupted at the target.');
    }
    testPanel.observe(time);return;
  }
  if(!calibrated)return;const gap=calOn.value-calOff.value;const lower=calOff.value+gap*.36,upper=calOff.value+gap*.60;
  if(smooth>=upper)applyCandidate('present');else if(smooth<=lower)applyCandidate('blocked');else{streak=0;candidate=confirmed;}
}
function finishAutoArm(){
  const job=armJob;if(!job)return;armJob=null;el('arm').disabled=false;
  const result=detector.arm(job.samples,mode);
  if(!result.ok){autoArmed=false;status('wait','LIGHT TOO WEAK OR UNSTABLE','Improve alignment, move closer or try the other mode.');el('auto-info').textContent=result.reason;el('arm').textContent='RETRY AUTOMATIC ARM';testPanel.render();return;}
  const average=result.reference;autoReference=average;autoArmed=true;calibrated=false;calOn=calOff=null;confirmed='present';candidate='present';streak=0;testPanel.render();
  el('confidence').textContent='Auto mode active';el('gap').textContent='AUTO';
  status('present','BEAM DETECTED','Now block and unblock the light—no more tapping.');
  el('auto-info').textContent='ARMED • Measured light '+average.toFixed(1)+'/255. Cover the light to trigger the trip counter automatically.';
  el('arm').textContent='DISARM DETECTOR';
}
function beginAutoArm(){
  if(!running||armJob)return;if(calJob){error('Finish the current manual measurement first.');return;}
  if(autoArmed){testPanel.interrupt('Detector disarmed.');detector.disarm();autoArmed=false;testPanel.render();autoReference=null;confirmed=candidate='unknown';streak=0;calibrated=false;el('arm').textContent='ARM AUTOMATIC DETECTION';el('auto-info').textContent='Detector disarmed. Keep the light on and tap ARM when ready.';status('wait','DISARMED','Tap ARM once when the light is visible.');return;}
  if(scoreHistory.length<5){error('Camera is still settling. Hold the phone steady and try ARM again.');return;}
  clearError();resetCalibration();armJob={samples:[]};el('arm').disabled=true;status('wait','ARMING…','Keep the light ON and hold it steady for about two seconds.');
  el('auto-info').textContent='Learning illuminated beam automatically. No need to cover it or tap BLOCKED.';
}
function finishCal(){const job=calJob;if(!job)return;calJob=null;el('arm').disabled=false;el('on').disabled=false;el('off').disabled=false;const a=job.samples.slice(2).sort((x,y)=>x-y);const kept=a.slice(1,-1);const average=kept.reduce((s,x)=>s+x,0)/kept.length;const min=a[0],max=a.at(-1);const reading={value:average,noise:Math.max(0,(max-min)/2)};if(job.which==='on'){calOn=reading;el('on-reading').textContent=average.toFixed(1)+' units';}else{calOff=reading;el('off-reading').textContent=average.toFixed(1)+' units';}
  smooth=null;scoreHistory=[];confirmed=candidate='unknown';streak=0;calibrated=false;
  if(!calOn||!calOff){status('wait','FIRST READING SAVED','Now capture the other light condition.');el('cal-info').textContent='Keep the target fixed. Cover the beam, then press 2 · BLOCKED.';return;}
  const gap=calOn.value-calOff.value;el('gap').textContent=gap.toFixed(1);const noise=Math.max(calOn.noise,calOff.noise);const minGap=Math.max(8,noise*3);
  if(gap<=0){status('wait','CALIBRATION REVERSED','Light ON measured dimmer than BLOCKED.');el('confidence').textContent='Recheck target';el('cal-info').textContent='Put the yellow circle directly over the bright LED, reduce other light, and recalibrate both readings.';return;}
  if(gap<minGap){status('wait','SIGNAL TOO WEAK',`Gap ${gap.toFixed(1)}; need roughly ${minGap.toFixed(1)} or more.`);el('confidence').textContent='Signal too weak';el('cal-info').textContent='Move the LED closer, shade nearby lighting, and redo both readings before testing.';return;}
  calibrated=true;el('confidence').textContent=gap>minGap*2?'Strong contrast':'Usable contrast';el('cal-info').textContent='Ready! Unblock the LED until DETECTED appears, then cover it to count one beam break.';status('wait','CALIBRATION READY','Unblock the light first; then block it.');
}
function beginCal(which){if(!running||calJob||armJob)return;testPanel.interrupt('Manual calibration selected.');detector.disarm();autoArmed=false;testPanel.render();autoReference=null;armJob=null;el('arm').textContent='ARM AUTOMATIC DETECTION';if(scoreHistory.length<5){error('Camera is still settling; aim the LED and try again in a moment.');return;}clearError();calJob={which,samples:[]};el('on').disabled=true;el('off').disabled=true;el('arm').disabled=true;status('wait','MEASURING…',which==='on'?'Hold the light ON and keep the phone still.':'Keep the beam BLOCKED and hold still.');}
function changeMode(m){if(mode===m)return;mode=m;el('red-mode').setAttribute('aria-pressed',String(m==='red'));el('white-mode').setAttribute('aria-pressed',String(m==='white'));resetCalibration('Mode changed. Calibrate again because the light score changed.');}
el('arm').addEventListener('click',beginAutoArm);el('start').addEventListener('click',()=>running?stopCamera():startCamera());el('reverse').addEventListener('click',()=>{camera=camera==='environment'?'user':'environment';deviceId='';startCamera();});el('restart').addEventListener('click',startCamera);el('camera-select').addEventListener('change',e=>{deviceId=e.target.value;startCamera();});el('red-mode').addEventListener('click',()=>changeMode('red'));el('white-mode').addEventListener('click',()=>changeMode('white'));el('on').addEventListener('click',()=>beginCal('on'));el('off').addEventListener('click',()=>beginCal('off'));el('reset').addEventListener('click',()=>{testPanel.interrupt('Count reset.');count=0;el('trip-count').textContent='0';});
box.addEventListener('click',e=>{if(!running)return;const p=coordsForTap(e.clientX,e.clientY);if(!p){error('Tap inside the live camera picture rather than the black margin.');return;}clearError();aim=p;moveReticle();resetCalibration('Target moved. Calibrate again with the circle centered on the LED.');});
window.addEventListener('resize',()=>{if(running)moveReticle();});v.addEventListener('loadedmetadata',()=>{if(running)moveReticle();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopCamera();status('wait','CAMERA PAUSED','Return to Safari and tap Start camera again.');}});window.addEventListener('pagehide',stopCamera);
})();
