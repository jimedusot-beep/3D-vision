const MAX_BYTES = 50 * 1024 * 1024;
const TYPES = {stl:'application/octet-stream',obj:'text/plain',ply:'application/octet-stream',off:'text/plain',glb:'model/gltf-binary',gltf:'model/gltf+json',bin:'application/octet-stream','3mf':'application/octet-stream','3dv':'application/zip',vision:'application/zip',md:'text/plain; charset=utf-8',scad:'text/plain; charset=utf-8',json:'application/json',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp',pdf:'application/pdf',csv:'text/csv',txt:'text/plain',zip:'application/zip'};
const json=(value,status=200)=>Response.json(value,{status,headers:{'cache-control':'private, no-store','x-content-type-options':'nosniff'}});
const digest=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',value))).map(b=>b.toString(16).padStart(2,'0')).join('');
function describe(object){const m=object.customMetadata||{};return {id:object.key.split('/').pop(),name:m.name||'Unnamed file',size:object.size,type:m.type||'application/octet-stream',uploadedAt:m.uploadedAt||object.uploaded?.toISOString()||'',sha256:m.sha256||''}}
async function boundedBody(request){const reader=request.body?.getReader();if(!reader)throw Error('empty');const chunks=[];let size=0;while(true){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>MAX_BYTES){await reader.cancel();throw Error('large')}chunks.push(value)}if(!size)throw Error('empty');const bytes=new Uint8Array(size);let at=0;for(const chunk of chunks){bytes.set(chunk,at);at+=chunk.byteLength}return bytes}

export async function handleFilesRequest(request,bucket){
 const userId=request.headers.get('oai-authenticated-user-id');
 if(!userId)return json({error:'Sign in with ChatGPT to access your saved files.',signIn:'/signin-with-chatgpt?return_to=%2F'},401);
 if(!bucket)return json({error:'File storage is unavailable. Your file has not been saved.'},503);
 const url=new URL(request.url),prefix='files/'+await digest(new TextEncoder().encode(userId))+'/',id=url.pathname.split('/')[3];
 try {
  if(request.method==='GET'&&!id){
   const cursor=url.searchParams.get('cursor');if(cursor&&cursor.length>4096)return json({error:'Invalid page.'},400);
   const result=await bucket.list({prefix,limit:1000,include:['customMetadata'],...(cursor?{cursor}:{})});
   return json({accountKey:await digest(new TextEncoder().encode(userId)),files:result.objects.map(describe),nextCursor:result.truncated?result.cursor:null,storage:'cloud'});
  }
  if(request.method==='GET'&&id){
   if(!/^[a-f0-9]{64}$/.test(id))return json({error:'File not found.'},404);
   const object=await bucket.get(prefix+id);if(!object)return json({error:'File not found.'},404);
   const name=object.customMetadata?.name||'file';
   return new Response(object.body,{headers:{'content-type':object.customMetadata?.type||'application/octet-stream','content-length':String(object.size),'content-disposition':"attachment; filename*=UTF-8''"+encodeURIComponent(name),'cache-control':'private, no-store','x-content-type-options':'nosniff'}});
  }
  if(request.method==='POST'&&!id){
   const origin=request.headers.get('origin');if(!origin||origin!==url.origin)return json({error:'Please save files from this site.'},403);
   const name=(url.searchParams.get('name')||'').normalize('NFC');
   if(!name||name.length>180||/[\x00-\x1f\x7f/\\]/.test(name))return json({error:'Use a filename of up to 180 characters without slashes.'},400);
   const extension=name.split('.').pop().toLowerCase(),type=TYPES[extension];if(!type)return json({error:'This file type is not supported by cloud storage. The local original is retained.'},415);
   const stated=request.headers.get('content-length');if(stated&&Number(stated)>MAX_BYTES)return json({error:'Files must be 50 MB or smaller.'},413);
   let bytes;try{bytes=await boundedBody(request)}catch(e){return json({error:e.message==='large'?'Files must be 50 MB or smaller.':'Empty files cannot be saved.'},e.message==='large'?413:400)}
   const hash=await digest(bytes),key=prefix+hash,existing=await bucket.head(key);
   if(existing)return json({file:describe(existing),duplicate:true});
   const uploadedAt=new Date().toISOString();
   const saved=await bucket.put(key,bytes,{httpMetadata:{contentType:type},customMetadata:{name,type,uploadedAt,sha256:hash}});
   return json({file:describe(saved),duplicate:false},201);
  }
  return json({error:'Method not allowed.'},405);
 }catch{return json({error:'Storage could not complete the request. Please try again.'},503)}
}

export {digest as cloudDigest, json as cloudJSON, TYPES as CLOUD_TYPES};
