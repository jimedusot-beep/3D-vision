// IndexedDB retains originals once, independently of saved scene revisions.
import {fetchFile} from './io.js';
const assetListeners=new Set();
export function subscribeAssetSaves(listener){assetListeners.add(listener);return()=>assetListeners.delete(listener)}
function notifyAssets(id){for(const listener of assetListeners)try{Promise.resolve(listener(id)).catch(()=>{})}catch{}}
let opening;
export function database(){if(!opening)opening=new Promise((resolve,reject)=>{const request=indexedDB.open('3dvision-workshop',1);request.onupgradeneeded=()=>{for(const name of ['assets','projects','session'])request.result.createObjectStore(name,{keyPath:'id'});};request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(Error('Browser storage unavailable: '+request.error?.message));});return opening;}
// Store original bytes instead of Blob objects: this avoids WebKit's IndexedDB
// Blob backing-file failures while preserving the exact original file contents.
function withBlob(store,record){if(store==='assets'&&record?.bytes&&!record.blob)return{...record,blob:new Blob([record.bytes],{type:record.mimeType||''})};return record;}
export async function storeRecord(store,value){let stored=value;if(store==='assets'&&value.blob){stored={...value,bytes:value.bytes||await value.blob.arrayBuffer(),mimeType:value.mimeType||value.blob.type};delete stored.blob;}const db=await database();return new Promise((resolve,reject)=>{const tx=db.transaction(store,'readwrite');const request=tx.objectStore(store).put(stored);tx.oncomplete=()=>{resolve(value);if(store==='assets')notifyAssets(value.id)};const failure=e=>{const error=e.target?.error||tx.error||request.error;reject(Error('Could not save to this browser: '+(error?.name||'StorageError')+' '+(error?.message||'The browser rejected the write. Export a backup.')));};tx.onerror=failure;tx.onabort=failure;});}
export async function readRecord(store,key){const db=await database();return new Promise((resolve,reject)=>{const r=db.transaction(store).objectStore(store).get(key);r.onsuccess=()=>resolve(withBlob(store,r.result));r.onerror=()=>reject(r.error);});}
export async function allRecords(store){const db=await database();return new Promise((resolve,reject)=>{const r=db.transaction(store).objectStore(store).getAll();r.onsuccess=()=>resolve(r.result.map(value=>withBlob(store,value)));r.onerror=()=>reject(r.error);});}
export async function patchAsset(id,changes,{notify=true}={}){const db=await database();return new Promise((resolve,reject)=>{const tx=db.transaction('assets','readwrite'),store=tx.objectStore('assets'),request=store.get(id);let result;request.onsuccess=()=>{if(request.result){result={...request.result,...changes,id};store.put(result)}};tx.oncomplete=()=>{resolve(withBlob('assets',result));if(notify&&result)notifyAssets(id)};tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Asset update aborted'));});}
export async function restorePackageOriginals({originals,originalMetadata={}}){const entries=Object.values(originalMetadata),byId=new Map(entries.map((m,i)=>[m.id,{metadata:m,file:originals[i]}])),ids=[];for(let i=0;i<originals.length;i++){const file=originals[i],metadata=entries[i]||{};let companions=originals;if(metadata.companions){companions=metadata.companions.map(dep=>{const found=byId.get(dep.id);if(!found)throw Error('Missing packaged companion '+dep.name);return new File([found.file],dep.name)})}const id=await saveAsset(file,'package',{companions,importOptions:metadata.importOptions});const labels={};for(const key of ['displayName','folder'])if(typeof metadata[key]==='string'&&metadata[key].length<=180)labels[key]=metadata[key];if(Object.keys(labels).length)await patchAsset(id,labels);ids.push(id)}return ids;}
export async function saveAsset(file,source='device',{companions=[],importOptions}={}){
 const bytes=await file.arrayBuffer();let hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),x=>x.toString(16).padStart(2,'0')).join('');
 let old=await readRecord('assets',hash),dependencies=old?.companions||[];
 if(file.name.toLowerCase().endsWith('.gltf')&&companions.length){
  const json=JSON.parse(new TextDecoder().decode(bytes));
  const names=[...new Set([...(json.buffers||[]),...(json.images||[])].map(x=>x.uri).filter(uri=>typeof uri==='string'&&!/^(data:|blob:)/.test(uri)).map(uri=>decodeURIComponent(uri.split('/').pop().split('?')[0])))];
  const resolved=[];
  for(const name of names){const match=companions.filter(f=>f.name===name);if(match.length>1)throw Error('Ambiguous GLTF companion '+name);if(!match.length)throw Error('Missing GLTF companion '+name);resolved.push({name,id:await saveAsset(match[0],source)})}
  dependencies=resolved;
  if(resolved.length){hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify([hash,resolved])))),x=>x.toString(16).padStart(2,'0')).join('');old=await readRecord('assets',hash)}
 }
 const now=new Date().toISOString();
 await storeRecord('assets',{...old,id:hash,name:old?.name||file.name,displayName:old?.displayName||file.name,folder:old?.folder||'Imports',names:[...new Set([...(old?.names||[]),old?.name,file.name].filter(Boolean))],sources:[...new Set([...(old?.sources||[]),old?.source,source].filter(Boolean))],bytes:old?.bytes||bytes,mimeType:old?.mimeType||file.type,source:old?.source||source,created:old?.created||now,updated:now,companions:dependencies,importOptions:importOptions||old?.importOptions});return hash;
}
export async function loadAssetBundle(id){
 const asset=await readRecord('assets',id);if(!asset)throw Error('Saved file not found');
 const files=[];let dependencies=asset.companions;
 // Older versions saved companions separately without linking them. Recover
 // only unambiguous filenames; do not silently substitute an unrelated buffer.
 if(!dependencies&&asset.name.toLowerCase().endsWith('.gltf')){
  const json=JSON.parse(await asset.blob.text()),records=await allRecords('assets');dependencies=[];
  for(const uri of [...(json.buffers||[]),...(json.images||[])].map(x=>x.uri).filter(x=>typeof x==='string'&&!/^(data:|blob:)/.test(x))){const name=decodeURIComponent(uri.split('/').pop().split('?')[0]),matches=records.filter(a=>a.name===name||a.names?.includes(name));if(matches.length!==1)throw Error('Reimport GLTF with its companions: '+name+' is missing or ambiguous');dependencies.push({name,id:matches[0].id})}
 }
 if(dependencies&&dependencies!==asset.companions){asset.companions=dependencies;await patchAsset(id,{companions:dependencies})}
 for(const dependency of dependencies||[]){const record=await readRecord('assets',dependency.id);if(!record)throw Error('Missing saved companion '+dependency.name+'. Reimport the original file set.');files.push(new File([record.blob],dependency.name,{type:record.mimeType||''}))}
 const herbie=asset.name.startsWith('HERBIE_V1_')&&asset.name.endsWith('.glb')&&(asset.sources||[asset.source]).some(s=>s==='repository'||/\/models\/HERBIE_V1_/.test(s||''));
 return{file:new File([asset.blob],asset.name,{type:asset.mimeType||''}),companions:files,importOptions:asset.importOptions||{units:'auto',herbie},asset};
}
export async function fetchSourceAsset(url,{fetcher=fetchFile,name}={}){
 try{const file=await fetcher(url,name);await saveAsset(file,url);return{file,stale:false}}
 catch(error){const cached=(await allRecords('assets')).filter(a=>a.source===url||a.sources?.includes(url)).sort((a,b)=>(b.updated||b.created||'').localeCompare(a.updated||a.created||''))[0];if(!cached)throw error;return{file:new File([cached.blob],name||cached.name),stale:true,error};}
}
export async function assetRecordsWithDependencies(ids){const found=new Map(),pending=[...ids];while(pending.length){const id=pending.pop();if(found.has(id))continue;let asset=await readRecord('assets',id);if(!asset)throw Error('A project original is missing: '+id);if(!asset.companions&&asset.name.toLowerCase().endsWith('.gltf'))asset=(await loadAssetBundle(id)).asset;found.set(id,asset);for(const dep of asset.companions||[])pending.push(dep.id)}return[...found.values()]}
export async function saveRevision(projectId,title,folder,scene,assetIds){const old=projectId?await readRecord('projects',projectId):null;const project=old||{id:crypto.randomUUID(),revisions:[]};project.title=title;project.folder=folder;project.updated=new Date().toISOString();project.revisions.unshift({id:crypto.randomUUID(),date:project.updated,scene,assetIds:[...assetIds]});project.revisions=project.revisions.slice(0,10);await storeRecord('projects',project);return project;}
