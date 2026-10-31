// Licensed source geometry; no procedural replacement for missing respiratory anatomy.
// BodyParts3D 4.3 © DBCLS, CC BY-SA 2.1 Japan; OrganUI 2026 adaptation.
import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile,rename,rm} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const lungsModel=Object.freeze({
 repo:'organui/lungs-3d',
 commit:'5815084f43efe438ebfae3fd889ee2baf343dfbf',
 sha256:'b2b19e5f7473036598e3552a5835a4ebc0f55c786ddd00863cb6a170409ed346',
 bytes:3901260,
 license:'CC-BY-SA-2.1-JP',
 sourceVersion:'BodyParts3D 4.3',
 expectedGroups:20
});
const url='https://raw.githubusercontent.com/'+lungsModel.repo+'/'+lungsModel.commit+'/public/models/lungs.glb';
const destination=path.resolve('public/models/slp/lungs.glb');
export function validLungsModel(data){
 return data.byteLength===lungsModel.bytes &&
 data.subarray(0,4).toString('ascii')==='glTF' &&
 data.readUInt32LE(8)===lungsModel.bytes &&
 createHash('sha256').update(data).digest('hex')===lungsModel.sha256;
}
export async function prepareLungsModel(){
 try{
  const existing=await readFile(destination);
  if(validLungsModel(existing)){console.log('Pinned BodyParts3D 4.3 lungs model verified.');return;}
  throw Error('Existing lungs asset failed checksum; refusing overwrite. Remove invalid generated file manually.');
 }catch(e){if(e.code!=='ENOENT')throw e;}
 const response=await fetch(url,{signal:AbortSignal.timeout(60000)});
 if(!response.ok)throw Error('Source lungs download HTTP '+response.status);
 const data=Buffer.from(await response.arrayBuffer());
 if(!validLungsModel(data))throw Error('Lungs asset differs from pinned byte count, GLB header or SHA-256.');
 await mkdir(path.dirname(destination),{recursive:true});
 const tmp=destination+'.tmp';
 try{await writeFile(tmp,data);await rename(tmp,destination);}catch(e){await rm(tmp,{force:true});throw e;}
 console.log('Verified '+lungsModel.bytes+' licensed lung/airway model bytes (CC BY-SA 2.1 JP).');
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 prepareLungsModel().catch(e=>{console.error(e.message);process.exitCode=1;});
}
