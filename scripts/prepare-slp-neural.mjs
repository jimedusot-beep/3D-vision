// Reuse pinned Z-Anatomy / BodyParts3D data from the open Brain Project.
// Model data: CC BY-SA 4.0; original Brain Project viewer code: Apache-2.0.
// Only 44 cranial-nerve records and 30 brainstem records are surfaced in
// our study UI; remaining third-party geometry is hidden, never re-licensed.
import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile,rename,rm,copyFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
export const neuralModel=Object.freeze({
 repo:'itayinbarr/brainproject',commit:'2929e94f521a8ddceab26bc100a98dc06b0da060',
 modelPath:'brain-atlas/models/brain.glb',modelBytes:4650816,
 modelBlob:'c80dd62202b5cf8a2a43c7a019311781bd95457c',
 modelSha256:'76a49ea4526a4880613aec7a02756bd7301b0b9d0680d7cae33e197b672c5453',
 manifestPath:'brain-atlas/models/manifest.json',manifestBytes:232455,
 manifestBlob:'ad25ab2d45b2d46a94f324143506f0fa3bc6906a',
 manifestSha256:'66c32355e02c3ba5fadf3b3bdb61b18c619162d6c5ee2083262e59bed4274d93',
 license:'CC-BY-SA-4.0',source:'Z-Anatomy / BodyParts3D',
 expectedCranialRecords:44,expectedBrainstemRecords:30
});
const directory=path.resolve('public/models/slp');
export function gitBlobDigest(data){
 return createHash('sha1').update('blob '+data.length+'\0').update(data).digest('hex');
}
export function validNeuralAsset(data,type){
 if(type==='model')return data.byteLength===neuralModel.modelBytes &&
  data.subarray(0,4).toString('ascii')==='glTF' &&
  data.readUInt32LE(4)===2 && data.readUInt32LE(8)===data.length &&
  gitBlobDigest(data)===neuralModel.modelBlob&&
  createHash('sha256').update(data).digest('hex')===neuralModel.modelSha256;
 if(type==='manifest'){
  if(data.length!==neuralModel.manifestBytes||gitBlobDigest(data)!==neuralModel.manifestBlob||
  createHash('sha256').update(data).digest('hex')!==neuralModel.manifestSha256)return false;
  try{
   const records=JSON.parse(data.toString('utf8')).nodes;
   return Array.isArray(records)&&records.length===437 &&
     records.filter(x=>x.category==='cranial_nerves').length===44 &&
     records.filter(x=>x.category==='brainstem').length===30;
  }catch{return false;}
 }
 throw Error('Unsupported asset kind: '+type);
}
async function ensurePinned(type,name,pathInRepo){
 const output=path.join(directory,name);
 try{
  const existing=await readFile(output);
  if(validNeuralAsset(existing,type))return existing;
  throw Error('Cached '+name+' failed immutable source verification; refusing overwrite.');
 }catch(e){if(e.code!=='ENOENT')throw e;}
 const url='https://raw.githubusercontent.com/'+neuralModel.repo+'/'+neuralModel.commit+'/'+pathInRepo;
 const response=await fetch(url,{signal:AbortSignal.timeout(90000)});
 if(!response.ok)throw Error('Pinned '+name+' download HTTP '+response.status);
 const data=Buffer.from(await response.arrayBuffer());
 if(!validNeuralAsset(data,type))throw Error('Pinned '+name+' source content failed size, GLB/JSON and Git SHA-1 verification.');
 await mkdir(directory,{recursive:true});
 const tmp=output+'.tmp';
 try{await writeFile(tmp,data);await rename(tmp,output);}catch(e){await rm(tmp,{force:true});throw e;}
 return data;
}
export async function prepareNeuralModel(){
 const [model,manifest]=await Promise.all([
  ensurePinned('model','neural.glb',neuralModel.modelPath),
  ensurePinned('manifest','neural-source-manifest.json',neuralModel.manifestPath)
 ]);
 const gltfDecoder=path.resolve('node_modules/three/examples/jsm/libs/draco/gltf');
 const dest=path.join(directory,'draco');await mkdir(dest,{recursive:true});
 for(const file of ['draco_decoder.js','draco_decoder.wasm','draco_wasm_wrapper.js'])
  await copyFile(path.join(gltfDecoder,file),path.join(dest,file));
 console.log('Verified source-derived Z-Anatomy 3D brain (437 GLB records; 44 nerve and 30 brainstem) under CC BY-SA 4.0. Model SHA-256: '+createHash('sha256').update(model).digest('hex')+'; manifest SHA-256: '+createHash('sha256').update(manifest).digest('hex')+'.');
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))
 prepareNeuralModel().catch(e=>{console.error(e.message);process.exitCode=1;});
