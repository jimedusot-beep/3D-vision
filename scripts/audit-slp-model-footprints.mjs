// Read-only GLB structure audit. Does NOT decompress Draco or alter mesh/source data.
// Run after "npm run build": node scripts/audit-slp-model-footprints.mjs
// Numbers describe glTF accessors and estimates, NOT GPU memory, FPS, or anatomical registration.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {join} from 'node:path';
const files=[
  ['larynx','larynx.glb'],['lungs','lungs.glb'],['diaphragm','diaphragm.glb'],
  ['oral','oral.glb'],['pharynx','pharynx.glb'],['ear','ear.glb'],['neural','neural.glb']
];
const componentByteWidths={5120:1,5121:1,5122:2,5123:2,5125:4,5126:4};
const typeWidths={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16};
export function parseGLBJSON(binary){
 if(binary.length<20||binary.toString('ascii',0,4)!=='glTF'||
  binary.readUInt32LE(4)!==2||binary.readUInt32LE(8)!==binary.length)throw Error('Invalid GLB v2 container');
 const jsonBytes=binary.readUInt32LE(12);
 if(jsonBytes<2||20+jsonBytes>binary.length||binary.toString('ascii',16,20)!=='JSON')
  throw Error('Missing or malformed GLB JSON chunk');
 const json=JSON.parse(binary.toString('utf8',20,20+jsonBytes));
 if(!Array.isArray(json.nodes)||!Array.isArray(json.meshes))throw Error('GLB node/mesh arrays missing');
 return json;
}
function countTriangles(primitive,accessors){
 const position=accessors[primitive.attributes?.POSITION];
 const indices=primitive.indices===undefined?null:accessors[primitive.indices];
 const n=indices?.count??position?.count??0;
 switch(primitive.mode??4){
  case 4:return Math.floor(n/3);
  case 5:case 6:return Math.max(0,n-2);
  default:return 0; // Lines/points are not triangles.
 }
}
function approxAccessorBytes(accessor){
 return (accessor?.count??0)*(typeWidths[accessor?.type]??0)*
  (componentByteWidths[accessor?.componentType]??0);
}
export function auditGLBJSON(gltf,bytes,kind='generic'){
 const meshes=gltf.meshes??[],accessors=gltf.accessors??[],nodes=gltf.nodes??[];
 let meshVertices=0,meshTriangles=0,primitives=0,draco=0,decodedAccessorBytes=0;
 const stats=meshes.map(m=>{
  let vertices=0,triangles=0;
  for(const primitive of m.primitives??[]){
   primitives++;
   vertices+=accessors[primitive.attributes?.POSITION]?.count??0;
   triangles+=countTriangles(primitive,accessors);
   if(primitive.extensions?.KHR_draco_mesh_compression)draco++;
  }
  meshVertices+=vertices;meshTriangles+=triangles;
  return {vertices,triangles,primitives:m.primitives?.length??0};
 });
 decodedAccessorBytes=accessors.reduce((total,a)=>total+approxAccessorBytes(a),0);
 const parents=new Map();
 for(const [i,node] of nodes.entries())for(const child of node.children??[])parents.set(child,i);
 function sourceTag(index){
  let at=index;
  for(let hops=0;at!==undefined&&hops<32;hops++){
   const n=nodes[at];
   if(n?.extras?.bx_id!==undefined)return {id:Number(n.extras.bx_id),category:n.extras.bx_cat};
   at=parents.get(at);
  }
  return null;
 }
 const instances=nodes.flatMap((n,i)=>n.mesh===undefined?[]:[{mesh:n.mesh,tag:sourceTag(i)}]);
 const visible=instances.filter(i=>kind==='neural'&&
  ['cranial_nerves','brainstem'].includes(i.tag?.category));
 const selectedIds=new Set(visible.map(x=>x.tag.id));
 const selectedMeshIndices=new Set(visible.map(x=>x.mesh));
 const sourceMeshIndices=new Set(instances.map(x=>x.mesh));
 const subtotal=[...selectedMeshIndices].reduce((a,id)=>({
  vertices:a.vertices+(stats[id]?.vertices??0),
  triangles:a.triangles+(stats[id]?.triangles??0),
  primitives:a.primitives+(stats[id]?.primitives??0)
 }),{vertices:0,triangles:0,primitives:0});
 return {
  model:kind,fileBytes:bytes,sceneCount:gltf.scenes?.length??0,nodeCount:nodes.length,
  meshDefinitions:meshes.length,meshInstances:instances.length,
  uniqueUsedMeshes:sourceMeshIndices.size,
  primitiveDefinitions:primitives,dracoPrimitiveDefinitions:draco,
  totalVertexAccessorEntries:meshVertices,totalTriangleIndexEntries:meshTriangles,
  allAccessorUncompressedBytesEstimate:decodedAccessorBytes,
  neural:kind==='neural'?{
   sourceTaggedRecords:selectedIds.size,
   selectedMeshDefinitions:selectedMeshIndices.size,
   selectedMeshInstances:visible.length,
   selectedVertexAccessorEntries:subtotal.vertices,
   selectedTriangleIndexEntries:subtotal.triangles,
   selectedPrimitiveDefinitions:subtotal.primitives,
   approximateUnselectedTriangleRatio:meshTriangles?Number((1-subtotal.triangles/meshTriangles).toFixed(4)):null
  }:null,
  caution:'Accessor counts, index entries and source tags are not actual GPU memory or medical geometry validation. Repeated instances and transforms are not merged, and separate models are NOT registered.'
 };
}
async function main(){
 const results=[];
 for(const [name,file] of files){
  const data=await readFile(join('public','models','slp',file));
  const info=auditGLBJSON(parseGLBJSON(data),data.length,name);
  if(name==='neural'&&info.neural.sourceTaggedRecords!==74)
   throw Error('Neural selected labels not verified: '+info.neural.sourceTaggedRecords);
  console.log(name+': '+(data.length/1048576).toFixed(2)+' MiB, '+
   info.meshDefinitions+' mesh definitions, '+info.primitiveDefinitions+' primitives, '+
   info.totalTriangleIndexEntries.toLocaleString()+' triangle index entries'+
   (name==='neural'?'; 74 selected groups, '+info.neural.selectedTriangleIndexEntries+
    ' selected triangle index entries':''));
  results.push(info);
 }
 await mkdir('test-results',{recursive:true});
 await writeFile('test-results/slp-model-footprints.json',JSON.stringify({
  runAt:new Date().toISOString(),method:'Read-only glTF JSON accessor and node counts',models:results
 },null,2)+'\n');
}
if(process.argv[1]&&/audit-slp-model-footprints\.mjs$/.test(process.argv[1]))
 main().catch(e=>{console.error(e);process.exitCode=1;});
