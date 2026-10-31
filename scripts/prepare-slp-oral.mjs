// Source-verified oral/salivary study model. Z-Anatomy via OrganUI.
// Attribution: Z-Anatomy © contributors, based in part on BodyParts3D © DBCLS.
// Geometry is CC BY-SA 4.0; this does NOT imply geometry from any other
// SLP viewer is anatomically registered or under the same license.
import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile,rename,rm} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const oralModel=Object.freeze({
 repo:'organui/organui',
 commit:'21439ee45a2efb8cd9d970e9b56405b294e3744d',
 path:'apps/web/public/models/salivary-glands.glb',
 bytes:754496,
 gitBlobSha1:'b1e943c7fab677bff21f74e16d86830cc516f3df',
 license:'CC-BY-SA-4.0',
 source:'Z-Anatomy FBX (via OrganUI)',
 expectedGroups:15,
 // SHA-256 will also be pinned following a verified CI download.
});
const source='https://raw.githubusercontent.com/'+oralModel.repo+'/'+oralModel.commit+'/'+oralModel.path;
const output=path.resolve('public/models/slp/oral.glb');
export function oralSha256(data){return createHash('sha256').update(data).digest('hex');}
export function validOralModel(data){
 if(data.byteLength!==oralModel.bytes||data.subarray(0,4).toString('ascii')!=='glTF'||
 data.readUInt32LE(4)!==2||data.readUInt32LE(8)!==oralModel.bytes)return false;
 const blob=createHash('sha1').update('blob '+data.length+'\0').update(data).digest('hex');
 return blob===oralModel.gitBlobSha1&&(!oralModel.sha256||oralSha256(data)===oralModel.sha256);
}
export async function prepareOralModel(){
 try{
  const existing=await readFile(output);
  if(validOralModel(existing)){
   console.log('Pinned Z-Anatomy oral GLB verified; SHA-256 '+oralSha256(existing));return;
  }
  throw Error('Cached oral model failed source integrity verification; refusing overwrite.');
 }catch(e){if(e.code!=='ENOENT')throw e;}
 const response=await fetch(source,{signal:AbortSignal.timeout(60000)});
 if(!response.ok)throw Error('Pinned oral model download HTTP '+response.status);
 const data=Buffer.from(await response.arrayBuffer());
 if(!validOralModel(data))throw Error('Oral model differs from pinned immutable Git blob, byte count or GLB header.');
 await mkdir(path.dirname(output),{recursive:true});
 const tmp=output+'.tmp';
 try{await writeFile(tmp,data);await rename(tmp,output);}
 catch(e){await rm(tmp,{force:true});throw e;}
 console.log('Verified '+data.length+' bytes Z-Anatomy oral source model (CC BY-SA 4.0); SHA-256 '+oralSha256(data));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))
 prepareOralModel().catch(e=>{console.error(e.message);process.exitCode=1;});
