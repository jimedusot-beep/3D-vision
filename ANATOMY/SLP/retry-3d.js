// Accessible, one-tap recovery when licensed source geometry or WebGL fails.
// Reload is intentional after WebGL context loss: browser/GPU resources may
// remain invalid, and a new page can acquire a fresh renderer safely.
export function create3DRetry({stage,retry=()=>location.reload()}){
 if(!stage)throw Error('Retry 3D requires a stage');
 const button=document.createElement('button');
 button.type='button';
 button.className='slp-retry-3d';
 button.textContent='Retry 3D';
 button.hidden=true;
 button.setAttribute('aria-label','Retry loading the real 3D anatomy model');
 button.style.cssText='position:relative;z-index:3;display:block;margin:.8rem 1rem;padding:.65rem 1rem;min-height:44px;border:2px solid #9be8dd;border-radius:9px;background:#1a5d63;color:#fff;font:600 1rem system-ui;cursor:pointer';
 // User-agent [hidden] can lose to an author display style rule.
 button.style.display='none';
 stage.append(button);
 let pending=false;
 const hide=()=>{button.hidden=true;button.style.display='none';button.disabled=false;button.textContent='Retry 3D';pending=false;};
 const show=()=>{button.hidden=false;button.style.display='block';button.disabled=false;button.textContent='Retry 3D';pending=false;};
 button.addEventListener('click',async()=>{
  if(pending)return;
  pending=true;button.disabled=true;button.textContent='Retrying 3D…';
  try{await retry();}
  catch{show();}
 });
 return Object.freeze({button,show,hide});
}
