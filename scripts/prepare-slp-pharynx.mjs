// Reuse vetted open-source model instead of inventing anatomy.
// BodyParts3D 4.3 © DBCLS, CC BY-SA 2.1 Japan. OrganUI adaptation.
import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile,rename,rm} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
export const pharynxModel=Object.freeze({
 repo:'organui/pharynx-3d',
 commit:'c3759092b524ab4637d691168bdc08bbee1fcfbb',
 path:'public/models/pharynx.glb',
 bytes:7148788,
 sha256:'70d3992cc103ab18f1e9598582cf84c21cc4cbc4d1e65f3853a78efc2961202d',
 gitBlobSha1:'f4a638d64d86d43eefb3b3f0ca6450e9d4fda47e',
 license:'CC-BY-SA-2.1-JP',
 sourceVersion:'BodyParts3D 4.3',
 expectedGroups:20
});
const url='https://raw.githubusercontent.com/'+pharynxModel.repo+'/'+pharynxModel.commit+'/'+pharynxModel.path;
const destination=path.resolve('public/models/slp/pharynx.glb');
export function validPharynxModel(data){
 if(data.byteLength!==pharynxModel.bytes||data.subarray(0,4).toString('ascii')!=='glTF'||
    data.readUInt32LE(4)!==2||data.readUInt32LE(8)!==pharynxModel.bytes)return false;
 const blob=createHash('sha1').update('blob '+data.length+'\0').update(data).digest('hex');
 const digest=createHash('sha256').update(data).digest('hex');
 return blob===pharynxModel.gitBlobSha1&&digest===pharynxModel.sha256;
}
export async function preparePharynxModel(){
 try{
  const existing=await readFile(destination);
  if(validPharynxModel(existing)){console.log('Pinned BodyParts3D 4.3 pharynx integrity verified.');return;}
  throw Error('Cached pharynx GLB failed integrity verification; refusing to overwrite.');
 }catch(e){if(e.code!=='ENOENT')throw e;}
 const response=await fetch(url,{signal:AbortSignal.timeout(90000)});
 if(!response.ok)throw Error('Pinned pharynx source HTTP '+response.status);
 const buffer=Buffer.from(await response.arrayBuffer());
 if(!validPharynxModel(buffer))throw Error('Pharynx source failed exact GLB header, file size, Git blob and SHA-256 checks.');
 await mkdir(path.dirname(destination),{recursive:true});
 const tmp=destination+'.tmp';
 try{await writeFile(tmp,buffer);await rename(tmp,destination);}catch(e){await rm(tmp,{force:true});throw e;}
 console.log('Verified '+buffer.length+' bytes of pinned BodyParts3D 4.3 pharynx GLB, CC BY-SA 2.1 JP.');
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))
 preparePharynxModel().catch(e=>{console.error(e.message);process.exitCode=1;});
