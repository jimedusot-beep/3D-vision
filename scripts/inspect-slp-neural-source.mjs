// Inspect, do not alter, the immutable Z-Anatomy/Brain Project source GLB.
// CI is the first place the verified binary is available.
import {readFile} from 'node:fs/promises';
import {parseGLBJSON} from './audit-slp-model-footprints.mjs';
const b=await readFile('public/models/slp/neural.glb');
const g=parseGLBJSON(b);
const parents=new Map();
for(const [i,n] of g.nodes.entries())for(const k of n.children||[])parents.set(k,i);
const ids=new Set(),include=new Set();
const collect=(idx,group)=>{if(include.has(idx))return;include.add(idx);const n=g.nodes[idx];if(n?.mesh!==undefined)ids.add(group);for(const ch of n.children||[])collect(ch,group);};
for(const [i,n] of g.nodes.entries())if(['cranial_nerves','brainstem'].includes(n.extras?.bx_cat)&&n.extras?.bx_id!=null)collect(i,Number(n.extras.bx_id));
const selection=[...include];for(const x of selection){let at=x;while(parents.has(at)){at=parents.get(at);include.add(at);}}
const selectedNodes=[...include].map(i=>g.nodes[i]);
const selectedMeshes=new Set(selectedNodes.map(n=>n.mesh).filter(x=>x!==undefined));
const selectedPrims=[...selectedMeshes].flatMap(i=>g.meshes[i]?.primitives||[]);
const usedViews=new Set(selectedPrims.map(p=>p.extensions?.KHR_draco_mesh_compression?.bufferView).filter(x=>x!==undefined));
const extensions=new Set(selectedPrims.flatMap(p=>Object.keys(p.extensions||{})));
const stat={glbBytes:b.length,nodes:g.nodes.length,selectedNodeCount:include.size,sourceRecords:ids.size,
 sceneCount:g.scenes?.length||0,sceneRoots:g.scenes?.map(x=>x.nodes),
 meshes:g.meshes?.length,selectedMeshes:selectedMeshes.size,
 selectedPrimitives:selectedPrims.length,
 accessors:g.accessors?.length,bufferViews:g.bufferViews?.length,
 usedDracoViews:usedViews.size,extensions:[...extensions],extensionsUsed:g.extensionsUsed,
 animations:g.animations?.length||0,skins:g.skins?.length||0,cameras:g.cameras?.length||0,
 images:g.images?.length||0,materials:g.materials?.length||0,textures:g.textures?.length||0,
 buffers:g.buffers?.map(x=>x.byteLength),
 selectedMeshSample:[...selectedMeshes].slice(0,3).map(i=>({i,primitives:g.meshes[i]?.primitives?.map(p=>({mode:p.mode,indices:p.indices,attributes:p.attributes,extensions:p.extensions}))})),
 sourceNodeSample:g.nodes.map((n,i)=>({i,n})).filter(x=>x.n.extras?.bx_id!==undefined).slice(0,3),
 unselectedNodeSample:g.nodes.map((n,i)=>({i,n})).filter(x=>x.n.extras?.bx_id!==undefined&&!['cranial_nerves','brainstem'].includes(x.n.extras?.bx_cat)).slice(0,2),
 gltfRootExtras:Object.keys(g).filter(k=>k.startsWith('extensions'))};
console.log('NEURAL_STRUCTURE_AUDIT '+JSON.stringify(stat));
if(ids.size!==74)throw Error('Expected 74 verified source node groups; found '+ids.size);
