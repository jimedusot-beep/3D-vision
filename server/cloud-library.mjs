import {cloudDigest, cloudJSON, CLOUD_TYPES} from './cloud-files.mjs';
const UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const HASH=/^[a-f0-9]{64}$/;
const filename=name=>typeof name==='string'&&name.length>0&&name.length<=180&&!/[\x00-\x1f\x7f/\\]/.test(name)&&!!CLOUD_TYPES[name.split('.').pop().toLowerCase()];
const label=(value,max=180)=>typeof value==='string'&&value.length>0&&value.length<=max&&!/[\x00-\x1f\x7f]/.test(value);
async function bodyJSON(request){
 const reader=request.body?.getReader();if(!reader)throw Error('Missing metadata');let length=0;const chunks=[];
 while(true){const {value,done}=await reader.read();if(done)break;length+=value.length;if(length>65536){await reader.cancel();throw Error('Metadata exceeds 64 KB')}chunks.push(value)}
 const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length}return JSON.parse(new TextDecoder().decode(bytes));
}
function assetMetadata(data,id){
 if(!HASH.test(id)||!HASH.test(data.blobId)||!filename(data.name)||!label(data.displayName)||!label(data.folder,120))throw Error('Invalid file metadata');
 const options=data.importOptions||{};
 if(Object.keys(options).some(k=>!['units','up','herbie'].includes(k))||!['auto','mm','cm','m','in'].includes(options.units||'auto')||!['auto','y','z'].includes(options.up||'auto')||('herbie'in options&&typeof options.herbie!=='boolean'))throw Error('Invalid import settings');
 if(!Array.isArray(data.companions)||data.companions.length>100||data.companions.some(d=>!filename(d.name)||!HASH.test(d.blobId)))throw Error('Invalid companion files');
 if(new Set(data.companions.map(d=>d.name)).size!==data.companions.length)throw Error('Ambiguous companion filenames');
 return {kind:'asset',id,blobId:data.blobId,name:data.name,displayName:data.displayName,folder:data.folder,importOptions:{units:options.units||'auto',up:options.up||'auto',herbie:!!options.herbie},companions:data.companions.map(d=>({name:d.name,blobId:d.blobId}))};
}
export async function handleLibraryRequest(request,bucket){
 const user=request.headers.get('oai-authenticated-user-id');
 if(!user)return cloudJSON({error:'Sign in with ChatGPT to access your saved library.'},401);
 if(!bucket)return cloudJSON({error:'Cloud storage is unavailable. Local files are retained.'},503);
 const url=new URL(request.url),accountKey=await cloudDigest(new TextEncoder().encode(user)),prefix='library/'+accountKey+'/',filePrefix='files/'+accountKey+'/';
 const parts=url.pathname.split('/').filter(Boolean).slice(2);
 try{
  if(request.method==='GET'&&!parts.length){
   const cursor=url.searchParams.get('cursor');if(cursor&&cursor.length>4096)return cloudJSON({error:'Invalid page'},400);
   const page=await bucket.list({prefix,limit:1000,include:['customMetadata'],...(cursor?{cursor}:{})});
   return cloudJSON({storage:'cloud',version:2,accountKey,entries:page.objects.map(o=>({...JSON.parse(o.customMetadata.summary),updatedAt:o.customMetadata.updatedAt})),nextCursor:page.truncated?page.cursor:null});
  }
  const asset=parts.length===2&&parts[0]==='assets'&&HASH.test(parts[1]);
  const revision=parts.length===4&&parts[0]==='projects'&&UUID.test(parts[1])&&parts[2]==='revisions'&&UUID.test(parts[3]);
  if(!asset&&!revision)return cloudJSON({error:'Library entry not found'},404);
  const key=prefix+(asset?'assets/'+parts[1]:'projects/'+parts[1]+'/'+parts[3])+'.json';
  if(request.method==='GET'){
   const record=await bucket.get(key);if(!record)return cloudJSON({error:'Library entry not found'},404);
   return cloudJSON(JSON.parse(await record.text()));
  }
  if(request.method!=='POST')return cloudJSON({error:'Method not allowed'},405);
  if(request.headers.get('origin')!==url.origin)return cloudJSON({error:'Save library changes from this site.'},403);
  if(!request.headers.get('content-type')?.includes('application/json'))return cloudJSON({error:'Metadata must be JSON'},415);
  let data,record;
  try{data=await bodyJSON(request);if(asset)record=assetMetadata(data,parts[1]);else{
   if(!HASH.test(data.packageId)||!label(data.title,80)||!label(data.folder,120))throw Error('Invalid project revision');
   record={kind:'project',id:parts[3],projectId:parts[1],packageId:data.packageId,title:data.title,folder:data.folder};
  }}catch(e){return cloudJSON({error:e.message||'Invalid metadata'},400)}
  const referenced=asset?[record.blobId,...record.companions.map(d=>d.blobId)]:[record.packageId];
  for(const id of referenced)if(!await bucket.head(filePrefix+id))return cloudJSON({error:'An original file is missing from your account. Retry the backup.'},409);
  const existing=await bucket.get(key);
  if(!asset&&existing){const previous=JSON.parse(await existing.text());if(previous.packageId!==record.packageId||previous.title!==record.title||previous.folder!==record.folder)return cloudJSON({error:'This revision already exists with different contents. Save a new revision; both devices retain their work.'},409);return cloudJSON({entry:previous,duplicate:true});}
  const updatedAt=new Date().toISOString();record.updatedAt=updatedAt;
  // Immutable revision keys preserve concurrent device saves. Only file labels/settings are replaceable.
  const options={httpMetadata:{contentType:'application/json'},customMetadata:{summary:JSON.stringify(asset?{kind:'asset',id:record.id,name:record.name,displayName:record.displayName,folder:record.folder}:record),updatedAt}};
  if(!asset)options.onlyIf={etagDoesNotMatch:'*'};
  const saved=await bucket.put(key,JSON.stringify(record),options);
  if(!saved)return cloudJSON({error:'A concurrent save used this revision ID. Save a new revision.'},409);
  return cloudJSON({entry:record},existing?200:201);
 }catch{return cloudJSON({error:'Cloud library request failed. Local work is retained; retry the backup.'},503)}
}
