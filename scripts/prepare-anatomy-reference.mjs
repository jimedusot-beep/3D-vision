// Download a pinned, independently attributable source model. Never trust
// floating branch names or replace a verified asset with unknown bytes.
import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile,rename,rm} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const model={
  repo:'organui/larynx-3d',
  commit:'aa18162e23a7617b1db91e5b929f05940fede2b2',
  sha256:'d07598a36e0177c0a1c87c28df145500d3e1766a9f02b58d003bd85e775202df',
  bytes:5257920,
  license:'CC-BY-SA-2.1-JP'
};
const modelURL='https://raw.githubusercontent.com/'+model.repo+'/'+model.commit+'/public/models/larynx.glb';
const output=path.resolve('public/models/slp/larynx.glb');
export function validAsset(data){
  return data.byteLength===model.bytes &&
    data.subarray(0,4).toString('ascii')==='glTF' &&
    data.readUInt32LE(8)===model.bytes &&
    createHash('sha256').update(data).digest('hex')===model.sha256;
}
export async function prepareModel(){
  try{
    const installed=await readFile(output);
    if(validAsset(installed)){console.log('Pinned BodyParts3D larynx model verified.');return;}
    throw new Error('Existing anatomy model failed SHA-256 verification; refusing overwrite. Delete the invalid generated file before retrying.');
  }catch(e){
    if(e.code!=='ENOENT')throw e;
  }
  const response=await fetch(modelURL,{signal:AbortSignal.timeout(45000)});
  if(!response.ok)throw new Error('Pinned anatomy source returned HTTP '+response.status);
  const bytes=Buffer.from(await response.arrayBuffer());
  if(!validAsset(bytes))throw new Error('Anatomy model does not match pinned bytes, GLB header and SHA-256');
  await mkdir(path.dirname(output),{recursive:true});
  const tmp=output+'.tmp';
  try{await writeFile(tmp,bytes);await rename(tmp,output);}catch(e){await rm(tmp,{force:true});throw e;}
  console.log('Verified '+model.bytes+' bytes of BodyParts3D 4.3 mesh via OrganUI; CC BY-SA 2.1 JP.');
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  prepareModel().catch(e=>{console.error('Anatomy model preparation failed:',e.message);process.exitCode=1;});
}
