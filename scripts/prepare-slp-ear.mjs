// Open source, pinned 3D ear source (Z-Anatomy -> OrganUI).
// Adapted geometry is CC BY-SA 4.0; not licensed under this app's MIT code license.
import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile,rename,rm} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const earModel=Object.freeze({
 repo:'organui/ear-3d',
 commit:'40ace7ed45cdbf604adda889e5db720ee6b1ce98',
 path:'public/models/ear.glb',
 bytes:1010340,
 sha256:'39437aeadce1c82d44efc7df1dbaedb872b2f7dd62d66537fc4d4178df0cede1',
 gitBlobSha1:'ca976a3a626517860a6f09673868f6a889e10f09',
 license:'CC-BY-SA-4.0',
 original:'Z-Anatomy',
 expectedGroups:16,
 earSide:'right'
});
const sourceUrl='https://raw.githubusercontent.com/'+earModel.repo+'/'+earModel.commit+'/'+earModel.path;
const destination=path.resolve('public/models/slp/ear.glb');
export function validEarModel(data){
 if(data.byteLength!==earModel.bytes||data.subarray(0,4).toString('ascii')!=='glTF'||
 data.readUInt32LE(4)!==2||data.readUInt32LE(8)!==earModel.bytes)return false;
 return createHash('sha1').update('blob '+data.length+'\0').update(data).digest('hex')===earModel.gitBlobSha1 &&
 createHash('sha256').update(data).digest('hex')===earModel.sha256;
}
export async function prepareEarModel(){
 try{
  const existing=await readFile(destination);
  if(validEarModel(existing)){console.log('Verified original pinned Z-Anatomy right-ear source geometry.');return;}
  throw Error('Cached ear GLB failed original upstream integrity checks; refusing overwrite.');
 }catch(e){if(e.code!=='ENOENT')throw e;}
 const response=await fetch(sourceUrl,{signal:AbortSignal.timeout(60000)});
 if(!response.ok)throw Error('Pinned right-ear GLB source HTTP '+response.status);
 const data=Buffer.from(await response.arrayBuffer());
 if(!validEarModel(data))throw Error('Right-ear GLB failed exact header, size, immutable Git blob and SHA-256 checks.');
 await mkdir(path.dirname(destination),{recursive:true});
 const tmp=destination+'.tmp';
 try{await writeFile(tmp,data);await rename(tmp,destination);}
 catch(e){await rm(tmp,{force:true});throw e;}
 console.log('Verified '+data.length+' bytes of CC BY-SA 4.0 Z-Anatomy right-ear geometry, SHA-256 '+earModel.sha256);
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 prepareEarModel().catch(e=>{console.error(e.message);process.exitCode=1;});
}
