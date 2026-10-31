// Separate BodyParts3D 3.0 diaphragm study asset — NOT registered/aligned
// with our BodyParts3D 4.3 lung geometry. Model credit remains CC BY-SA 2.1 JP.
// Copyright © The Database Center for Life Science (DBCLS), adapted by OrganUI.
import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile,rename,rm} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const diaphragmModel=Object.freeze({
 repo:'organui/organui',
 commit:'21439ee45a2efb8cd9d970e9b56405b294e3744d',
 path:'apps/web/public/models/diaphragm.glb',
 bytes:3649120,
 gitBlobSha1:'afbc6133a44f8f9408d8c49ceb7345c61f5f690f',
 sha256:'2a6c8608efe4dd33b24ffa6c9cd678c0230629de4b6340ffaa72932b63d6e5ed',
 license:'CC-BY-SA-2.1-JP',
 sourceVersion:'BodyParts3D 3.0',
 expectedGroups:13,
 // Both SHA-256 and the content-addressed Git blob SHA-1 are pinned.
});
const sourceUrl='https://raw.githubusercontent.com/'+diaphragmModel.repo+'/'+diaphragmModel.commit+'/'+diaphragmModel.path;
const destination=path.resolve('public/models/slp/diaphragm.glb');
export function hashDiaphragm(data){
 return createHash('sha256').update(data).digest('hex');
}
export function validDiaphragmModel(data){
 if(data.byteLength!==diaphragmModel.bytes ||
    data.subarray(0,4).toString('ascii')!=='glTF'||
    data.readUInt32LE(4)!==2||
    data.readUInt32LE(8)!==diaphragmModel.bytes)return false;
 // Git's blob object identity is calculated over header + bytes, not bare bytes.
 const digest=createHash('sha1').update('blob '+data.length+'\0').update(data).digest('hex');
 return digest===diaphragmModel.gitBlobSha1 && hashDiaphragm(data)===diaphragmModel.sha256;
}
export async function prepareDiaphragmModel(){
 try{
  const existing=await readFile(destination);
  if(validDiaphragmModel(existing)){
   console.log('Verified pinned BodyParts3D 3.0 diaphragm GLB; SHA-256 '+hashDiaphragm(existing));
   return;
  }
  throw Error('Existing diaphragm asset failed the pinned Git blob integrity check; refusing overwrite.');
 }catch(e){if(e.code!=='ENOENT')throw e;}
 const response=await fetch(sourceUrl,{signal:AbortSignal.timeout(60000)});
 if(!response.ok)throw Error('Pinned diaphragm source HTTP '+response.status);
 const data=Buffer.from(await response.arrayBuffer());
 if(!validDiaphragmModel(data))throw Error('Diaphragm GLB differs from pinned source byte count, v2 header, Git blob SHA-1 or SHA-256.');
 await mkdir(path.dirname(destination),{recursive:true});
 const tmp=destination+'.tmp';
 try{await writeFile(tmp,data);await rename(tmp,destination);}
 catch(e){await rm(tmp,{force:true});throw e;}
 console.log('Verified '+data.length+' bytes of licensed BodyParts3D 3.0 diaphragm geometry; SHA-256 '+hashDiaphragm(data));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 prepareDiaphragmModel().catch(e=>{console.error(e.message);process.exitCode=1;});
}
