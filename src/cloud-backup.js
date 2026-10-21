import {zipSync,strToU8} from 'fflate';
export const BACKUP_LIMIT=32*1024*1024;
export function cloudUsage(files,entries){
 const blobs=new Map(files.map(f=>[f.id,f]));
 return {bytes:[...blobs.values()].reduce((n,f)=>n+f.size,0),blobs:blobs.size,files:entries.filter(e=>e.kind==='asset').length,projects:new Set(entries.filter(e=>e.kind==='project').map(e=>e.projectId)).size,revisions:entries.filter(e=>e.kind==='project').length};
}
export async function createAccountBackup(api,{limit=BACKUP_LIMIT,onProgress=()=>{}}={}){
 const snapshot=await api.list(),usage=cloudUsage(snapshot.files,snapshot.entries);
 if(usage.bytes>limit)throw Error('Account backup exceeds the 32 MiB browser memory limit. Download individual project revisions and originals instead.');
 const archive={},records=[];let total=0;
 for(const entry of snapshot.entries){
  const record=entry.kind==='asset'?await api.getAsset(entry.id):entry;
  records.push(record);
 }
 for(const [index,file] of snapshot.files.entries()){
  const downloaded=await api.download(file.id,file.name),bytes=new Uint8Array(await downloaded.arrayBuffer());
  total+=bytes.byteLength;if(total>limit)throw Error('Account changed or backup exceeded the browser memory limit. Retry or download individual files.');
  // Hash-only paths prevent filenames from introducing archive path traversal.
  archive['files/'+file.id]=bytes;onProgress(index+1,snapshot.files.length);
 }
 const manifest={format:'3d-vision-account-backup',version:1,createdAt:new Date().toISOString(),files:snapshot.files,entries:records};
 archive['manifest.json']=strToU8(JSON.stringify(manifest,null,2));
 archive['README.txt']=strToU8('3D Vision account backup\nFiles are stored under their SHA-256 in files/. manifest.json maps hashes to original filenames, folders, import settings and project revisions. Rename a file using its manifest filename before opening it. Open .3dv project packages using Import in 3D Vision to restore editable assemblies. This archive is a recovery copy; automatic whole-account restoration is not available. Metadata is collected sequentially and is not a transactional account snapshot.\n');
 return new Blob([zipSync(archive,{level:0})],{type:'application/zip'});
}
export const formatBytes=n=>n<1024?n+' B':n<1048576?(n/1024).toFixed(1)+' KiB':(n/1048576).toFixed(1)+' MiB';
