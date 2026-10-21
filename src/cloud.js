import {allRecords,readRecord,patchAsset,subscribeAssetSaves,loadAssetBundle,saveAsset} from './storage.js';
import {safeName,download,unpackProject} from './io.js';
import {createCloudAPI,CLOUD_WORKSHOP,stableJSON,contentHash} from './cloud-api.js';
export {CLOUD_WORKSHOP} from './cloud-api.js';
export function createCloudLibrary({notify=()=>{},onOpen,makeProject,onProject=onOpen,saveCurrentProject}){
 const api=createCloudAPI(),origin=location.origin;
 let state='checking',entries=[],chain=Promise.resolve(),message='',render=()=>{},lastOwner=null,projectError=false;
 const pending=new Set(),dirty=new Set(),failed=new Set();
 const cloudButton=document.createElement('button');cloudButton.id='cloud';cloudButton.textContent='Cloud';document.querySelector('.header-actions')?.prepend(cloudButton);
 function update(){cloudButton.textContent=state==='ready'?(pending.size?'Cloud · saving…':failed.size||projectError?'Cloud · retry':'Cloud ✓'):'Cloud';render()}
 async function refresh(){try{const data=await api.list();entries=data.entries;lastOwner=data.accountKey;state='ready';return true}catch(e){state=e.status===401?'signin':e.status===404?'local':'offline';message=e.message;return false}finally{update()}}
 const ready=refresh();
 async function syncOriginal(id,force=false){
  const asset=await readRecord('assets',id);if(!asset)return;
  const bundle=await loadAssetBundle(id),options=bundle.importOptions||{};
  const shape={name:asset.name,displayName:asset.displayName||asset.name,folder:asset.folder||'Imports',importOptions:{units:options.units||'auto',up:options.up||'auto',herbie:!!options.herbie},blobId:await contentHash(await asset.blob.arrayBuffer()),companions:[]};
  for(const file of bundle.companions)shape.companions.push({name:file.name,blobId:await contentHash(await file.arrayBuffer())});
  const fingerprint=await contentHash(new TextEncoder().encode(stableJSON(shape))),marker=origin+':'+api.accountKey;
  if(!force&&asset.cloudAccount===marker&&asset.cloudVersion===fingerprint)return;
  await api.upload(new File([asset.blob],asset.name));for(const f of bundle.companions)await api.upload(f);
  const {entry}=await api.saveAsset(id,shape);entries=entries.filter(e=>!(e.kind==='asset'&&e.id===id));entries.push(entry);
  await patchAsset(id,{cloudAccount:marker,cloudVersion:fingerprint,cloudError:null},{notify:false});failed.delete(id);message='Files and import settings backed up to your account.';
 }
 function queueOriginal(id,force=false){
  dirty.add(id);if(pending.has(id))return;pending.add(id);update();
  chain=chain.then(async()=>{await ready;if(state!=='ready')return;while(dirty.delete(id)){try{await syncOriginal(id,force)}catch(e){failed.add(id);await patchAsset(id,{cloudError:e.message},{notify:false});message='Saved locally; cloud backup needs retry: '+e.message;notify(message,true);break}}}).catch(e=>{message=e.message;notify('Cloud backup pending: '+message,true)}).finally(()=>{pending.delete(id);update()});
 }
 subscribeAssetSaves(queueOriginal);
 ready.then(async ok=>{if(ok)for(const asset of await allRecords('assets'))queueOriginal(asset.id)}).catch(e=>notify(e.message,true));
 async function saveProject(blob,title,options={}){
  await ready;if(state!=='ready')return false;await chain;
  try{const parsed=unpackProject(await blob.arrayBuffer()).project,projectId=options.projectId||parsed.projectId||crypto.randomUUID(),revisionId=options.revisionId||crypto.randomUUID();
   const file=await api.upload(new File([blob],safeName(title||parsed.title||'Assembly')+'.3dv',{type:'application/zip'}));
   await api.saveRevision(projectId,revisionId,{packageId:file.id,title:(title||parsed.title||'Assembly').slice(0,80),folder:options.folder||parsed.folder||'My projects'});
   projectError=false;message='Complete project revision saved to your account.';await refresh();notify(message);return true;
  }catch(e){projectError=true;message='Revision saved locally. Cloud backup failed: '+e.message;notify(message,true);update();return false}
 }
 async function openAsset(entry){
  const data=await api.getAsset(entry.id),file=await api.download(data.blobId,data.name),companions=[];
  for(const d of data.companions)companions.push(await api.download(d.blobId,d.name));
  const id=await saveAsset(file,'cloud',{companions,importOptions:data.importOptions});
  await patchAsset(id,{displayName:data.displayName,folder:data.folder},{notify:false});
  await onOpen(file,companions,data.importOptions);document.getElementById('dialog').close();
 }
 async function openRevision(entry){const file=await api.download(entry.packageId,entry.title+'.3dv');await onProject(file,[]);document.getElementById('dialog').close()}
 function open(){
  const dialog=document.getElementById('dialog'),body=document.getElementById('dialog-body');document.getElementById('dialog-title').textContent='Private cloud library';body.replaceChildren();
  const paragraph=document.createElement('p');paragraph.textContent='Sign in with the same ChatGPT account on each device. Imported files, names, folders and import settings are backed up here. Save revision stores a complete editable assembly, including joints and originals. Concurrent project revisions are kept separately; scenes are not automatically merged.';body.append(paragraph);
  const stateLine=document.createElement('p');stateLine.id='cloud-state';body.append(stateLine);
  const controls=document.createElement('div');controls.className='cloud-actions';body.append(controls);
  const tab=document.createElement('select');tab.id='cloud-view';tab.setAttribute('aria-label','Cloud library view');tab.add(new Option('Projects & revisions','projects'));tab.add(new Option('Saved files','assets'));body.append(tab);
  const search=document.createElement('input');search.id='cloud-search';search.type='search';search.placeholder='Search names and folders';search.setAttribute('aria-label','Search cloud library');body.append(search);
  const list=document.createElement('div');list.id='cloud-files';body.append(list);
  const action=(label,fn,parent=controls)=>{const b=document.createElement('button');b.textContent=label;b.onclick=async()=>{b.disabled=true;try{await fn()}catch(e){message=e.message;notify(e.message,true)}finally{b.disabled=false;update()}};parent.append(b);return b};
  action('Refresh',refresh);action('Retry file backups',async()=>{if(!await refresh())return;for(const asset of await allRecords('assets'))queueOriginal(asset.id,true);await chain;await refresh()});
  if(makeProject)action('Back up current project',async()=>{if(saveCurrentProject)await saveCurrentProject();else await saveProject(await makeProject(),document.getElementById('title')?.value)});
  render=()=>{
   if(!dialog.open)return;
   stateLine.replaceChildren();stateLine.textContent=state==='ready'?`Private account storage · ${pending.size?pending.size+' file backups pending. ':''}${message}`:state==='checking'?'Checking account storage…':state==='signin'?'Sign in to enable cloud saving.':state==='local'?'This static host saves locally. Open the private cloud workshop to sync across devices.':'Cloud unavailable. Local copies are retained. '+message;
   if(state!=='ready'&&state!=='checking'){const a=document.createElement('a');a.href=state==='local'?CLOUD_WORKSHOP:'/signin-with-chatgpt?return_to=%2F';a.target='_top';a.textContent=state==='local'?' Open private cloud workshop →':' Sign in with ChatGPT →';stateLine.append(a)}
   list.replaceChildren();if(state!=='ready')return;
   const query=search.value.toLowerCase(),filtered=entries.filter(e=>([e.title,e.name,e.displayName,e.folder].filter(Boolean).join(' ')).toLowerCase().includes(query));
   if(tab.value==='assets'){
    for(const entry of filtered.filter(e=>e.kind==='asset').sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt))){const row=document.createElement('article');row.className='asset-card';const title=document.createElement('h3');title.textContent=entry.displayName;const meta=document.createElement('p');meta.textContent=entry.folder+' · '+entry.name;row.append(title,meta);action('Open',()=>openAsset(entry),row);action('Download original',async()=>{const data=await api.getAsset(entry.id);download(await api.download(data.blobId,data.name),data.name)},row);list.append(row)}
   }else{
    const projects=new Map();for(const e of filtered.filter(e=>e.kind==='project'))projects.set(e.projectId,[...(projects.get(e.projectId)||[]),e]);
    for(const revisions of [...projects.values()].sort((a,b)=>b[0].updatedAt.localeCompare(a[0].updatedAt))){revisions.sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt));const latest=revisions[0],row=document.createElement('article');row.className='asset-card';const title=document.createElement('h3');title.textContent=latest.title;const meta=document.createElement('p');meta.textContent=latest.folder+' · '+revisions.length+' cloud revision'+(revisions.length===1?'':'s');const select=document.createElement('select');select.setAttribute('aria-label','Cloud revision of '+latest.title);revisions.forEach((r,i)=>select.add(new Option((i?'':'Latest · ')+new Date(r.updatedAt).toLocaleString(),r.id)));row.append(title,meta,select);const current=()=>revisions.find(r=>r.id===select.value);action('Open revision',()=>openRevision(current()),row);action('Download project',async()=>{const e=current();download(await api.download(e.packageId,safeName(e.title)+'.3dv'),safeName(e.title)+'.3dv')},row);list.append(row)}
   }
   if(!list.children.length){const p=document.createElement('p');p.textContent=tab.value==='assets'?'No matching saved files. Import files to back them up.':'No matching project backups. Use Save revision.';list.append(p)}
  };
  tab.onchange=search.oninput=render;dialog.showModal();render();refresh();
 }
 cloudButton.onclick=open;
 return{open,saveProject,queueOriginal,refresh,ready,async flush(){await ready;await chain},get available(){return state==='ready'},get accountKey(){return lastOwner}};
}
