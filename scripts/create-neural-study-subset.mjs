// Lossless study-only derivative of the pinned Brain Project Z-Anatomy GLB.
// We copy the original 74 Draco payload byte ranges verbatim and retain
// original mesh vertices/accessor metadata, material definitions and transforms.
// No mesh simplification, medical interpolation, or cross-model registration.
import {createHash} from 'node:crypto';
import {neuralParts} from '../ANATOMY/SLP/neural-manifest.js';

const sha256=data=>createHash('sha256').update(data).digest('hex');
function assert(ok,reason){if(!ok)throw Error('Unsafe neural subset: '+reason);}
function parseGLB(data){
 assert(Buffer.isBuffer(data)&&data.length>=28,'GLB must be a binary buffer');
 assert(data.toString('ascii',0,4)==='glTF'&&data.readUInt32LE(4)===2&&
  data.readUInt32LE(8)===data.length,'not a well-formed glTF 2 binary container');
 let offset=12,json=null,bin=null;
 while(offset<data.length){
  assert(offset+8<=data.length,'truncated GLB chunk header');
  const length=data.readUInt32LE(offset),type=data.toString('ascii',offset+4,offset+8);
  offset+=8;assert(offset+length<=data.length,'truncated GLB chunk');
  if(type==='JSON'){assert(!json,'duplicate JSON chunk');json=JSON.parse(data.toString('utf8',offset,offset+length));}
  else if(type==='BIN\\0'){assert(!bin,'duplicate BIN chunk');bin=data.subarray(offset,offset+length);}
  else throw Error('Unsafe neural subset: unknown GLB chunk '+JSON.stringify(type));
  offset+=length;
 }
 assert(json&&bin,'missing GLB JSON or BIN');
 return {gltf:json,bin};
}
function encodeGLB(json,bin){
 const encoded=Buffer.from(JSON.stringify(json)),jpad=(4-encoded.length%4)%4;
 const bpad=(4-bin.length%4)%4;
 const chunk=Buffer.alloc(encoded.length+jpad,0x20);encoded.copy(chunk);
 const payload=Buffer.alloc(bin.length+bpad);bin.copy(payload);
 const out=Buffer.alloc(12+8+chunk.length+8+payload.length);
 out.write('glTF',0);out.writeUInt32LE(2,4);out.writeUInt32LE(out.length,8);
 out.writeUInt32LE(chunk.length,12);out.write('JSON',16);chunk.copy(out,20);
 const next=20+chunk.length;out.writeUInt32LE(payload.length,next);
 out.write('BIN\\0',next+4,'ascii');payload.copy(out,next+8);
 return out;
}
export function createNeuralStudySubset(source){
 const {gltf:g,bin}=parseGLB(source);
 assert(g.scenes?.length===1&&g.scene===0,'expected exactly one default scene');
 assert(g.buffers?.length===1,'expected a single embedded GLB buffer');
 assert(g.animations===undefined&&g.skins===undefined,'animated/skinned geometry requires separate review');
 assert(!g.images?.length&&!g.textures?.length,'texture dependencies require separate review');
 assert(g.nodes?.length===437&&g.meshes?.length===437,'pinned source node/mesh inventory changed');
 assert(g.nodes.every(n=>n.mesh!==undefined&&!(n.children?.length)),
  'study subset requires independent root-level mesh nodes');
 assert(g.scenes[0].nodes?.length===437,'expected source scene to list all mesh nodes');
 assert(g.extensionsUsed?.every(x=>['KHR_draco_mesh_compression','KHR_materials_ior','KHR_materials_specular'].includes(x)),
  'unsupported glTF extension would require a new dependency audit');
 const expected=new Map(neuralParts.map(p=>[Number(p.id),p.region]));
 assert(expected.size===74,'manifest contains duplicate or missing source IDs');
 const kept=g.nodes.map((node,i)=>({node,i})).filter(({node})=>
  expected.get(Number(node.extras?.bx_id))===node.extras?.bx_cat);
 assert(kept.length===74,'source GLB does not contain exactly 74 study nodes');
 const selected=new Set(kept.map(x=>Number(x.node.extras.bx_id)));
 assert(selected.size===74&&[...expected.keys()].every(id=>selected.has(id)),
  'source nerve/brainstem ID mapping changed');
 const indexMap=new Map(),meshMap=new Map(),accessorMap=new Map(),viewMap=new Map();
 const out={
  asset:{...g.asset,generator:'H.E.R.B.I.E. deterministic 74-group source-only GLB subset'},
  scene:0,scenes:[{...g.scenes[0],nodes:kept.map((_,i)=>i)}],
  nodes:[],meshes:[],accessors:[],bufferViews:[],buffers:[{byteLength:0}],
  materials:g.materials||[],
  extensionsUsed:g.extensionsUsed||[],extensionsRequired:g.extensionsRequired||[],
  extras:{...(g.extras||{}),sourceSha256:sha256(source),sourceLicense:'CC-BY-SA-4.0',
   derivative:'Source mesh/transform/filter-only. 74 retained, 363 not exported.'}
 };
 const binParts=[];let binLength=0;
 function view(index){
  assert(Number.isInteger(index)&&g.bufferViews?.[index],'missing compressed buffer view '+index);
  if(viewMap.has(index))return viewMap.get(index);
  const item=g.bufferViews[index];
  assert(item.buffer===0,'external buffer view not supported');
  const offset=item.byteOffset||0,end=offset+item.byteLength;
  assert(offset>=0&&item.byteLength>0&&end<=g.buffers[0].byteLength&&end<=bin.length,
   'compressed payload exceeds original BIN');
  const padding=(4-binLength%4)%4;
  if(padding){binParts.push(Buffer.alloc(padding));binLength+=padding;}
  const mapped=out.bufferViews.length;viewMap.set(index,mapped);
  out.bufferViews.push({...item,buffer:0,byteOffset:binLength});
  binParts.push(bin.subarray(offset,end));binLength+=item.byteLength;
  return mapped;
 }
 function accessor(index){
  assert(Number.isInteger(index)&&g.accessors?.[index],'unknown accessor '+index);
  if(accessorMap.has(index))return accessorMap.get(index);
  const a=g.accessors[index];
  // Draco extension fully owns this geometry's payload. Do not silently
  // rewrite non-Draco buffers or sparsely encoded accessors.
  assert(a.bufferView===undefined&&!a.sparse,'unexpected uncompressed/sparse geometry accessor');
  const mapped=out.accessors.length;accessorMap.set(index,mapped);
  out.accessors.push({...a});return mapped;
 }
 function mesh(index){
  assert(Number.isInteger(index)&&g.meshes?.[index],'missing mesh');
  if(meshMap.has(index))return meshMap.get(index);
  const item=g.meshes[index];
  assert(item.primitives?.length===1,'source mesh primitive layout changed');
  const parts=item.primitives.map(p=>{
   assert(p.extensions?.KHR_draco_mesh_compression&&
    Object.keys(p.extensions).length===1,'only original Draco-compressed primitives can be copied');
   const oldExtension=p.extensions.KHR_draco_mesh_compression;
   const a=Object.fromEntries(Object.entries(p.attributes||{}).map(([key,i])=>[key,accessor(i)]));
   const mapped={...p,attributes:a,
    extensions:{...p.extensions,KHR_draco_mesh_compression:{
     ...oldExtension,bufferView:view(oldExtension.bufferView)}}};
   if(p.indices!==undefined)mapped.indices=accessor(p.indices);
   assert(!p.targets?.length,'morph-target dependencies require review');
   if(p.material!==undefined)assert(g.materials?.[p.material],'missing material '+p.material);
   return mapped;
  });
  const mapped=out.meshes.length;meshMap.set(index,mapped);
  out.meshes.push({...item,primitives:parts});return mapped;
 }
 for(const {node,i} of kept){
  assert(g.scenes[0].nodes.includes(i),'selected mesh not in original scene');
  const mapped=indexMap.size;indexMap.set(i,mapped);
  out.nodes.push({...node,mesh:mesh(node.mesh)});
 }
 const payload=Buffer.concat(binParts,binLength);
 out.buffers[0].byteLength=payload.length;
 const studyGLB=encodeGLB(out,payload);
 const reparse=parseGLB(studyGLB);
 assert(reparse.gltf.nodes.length===74&&reparse.gltf.meshes.length===74&&
  reparse.gltf.bufferViews.length===74,'unexpected subset topology');
 // Confirm every compressed payload byte is identical to its pinned source.
 for(const [oldIndex,newIndex] of viewMap){
  const src=g.bufferViews[oldIndex],dest=out.bufferViews[newIndex];
  const sourceBytes=bin.subarray(src.byteOffset||0,(src.byteOffset||0)+src.byteLength);
  const cloneBytes=payload.subarray(dest.byteOffset,dest.byteOffset+dest.byteLength);
  assert(sourceBytes.equals(cloneBytes),'source Draco bytes were altered');
 }
 const provenance={
  kind:'source-preserving-neural-study-subset',source:'Z-Anatomy / BodyParts3D via Brain Project',
  license:'CC-BY-SA-4.0',sourceSHA256:sha256(source),sourceBytes:source.length,
  modelSHA256:sha256(studyGLB),modelBytes:studyGLB.length,
  sourceMeshDefinitions:g.meshes.length,studyMeshDefinitions:out.meshes.length,
  sourceNodeCount:g.nodes.length,studyNodeCount:out.nodes.length,
  copiedDracoViews:viewMap.size,
  preservedSourceIds:[...selected].sort((a,b)=>a-b),
  transformedGeometry:false,anatomicallyRegistered:false,
  note:'Original node transforms and per-primitive Draco compressed bytes are copied unchanged. File is a source-preserving filtered derivative, not a medical alignment or clinical model.'
 };
 return {studyGLB,provenance};
}
