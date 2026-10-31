import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createNeuralStudySubset} from '../scripts/create-neural-study-subset.mjs';
import {neuralParts} from '../ANATOMY/SLP/neural-manifest.js';
import {createHash} from 'node:crypto';
// Test the lossless packed-BIN remapping against 437 synthetic, independent
// source nodes. Actual pinned Draco bytes are tested in build and browser CI.
function fixture(){
 const nodes=[],meshes=[],accessors=[],bufferViews=[];
 const bin=Buffer.alloc(437*12);
 const ids=neuralParts.map(x=>({id:x.id,region:x.region}));
 for(let i=0;i<437;i++){
  const picked=ids[i];
  const tag=picked?{bx_id:picked.id,bx_cat:picked.region}:{bx_id:10000+i,bx_cat:'cortex'};
  nodes.push({mesh:i,name:'original-source-'+i,extras:tag,
   translation:[i*.001,i*.002,-i*.003]});
  meshes.push({primitives:[{
   attributes:{POSITION:i*2},indices:i*2+1,
   extensions:{KHR_draco_mesh_compression:{bufferView:i,attributes:{POSITION:0}}}
  }],name:'mesh-'+i});
  accessors.push({componentType:5126,count:3,type:'VEC3',min:[0,0,0],max:[1,1,1]},
   {componentType:5123,count:3,type:'SCALAR'});
  bufferViews.push({buffer:0,byteOffset:i*12,byteLength:12});
  for(let j=0;j<12;j++)bin[i*12+j]=(i+j*3)%256;
 }
 const json={asset:{version:'2.0'},scene:0,scenes:[{nodes:nodes.map((_,i)=>i)}],
  nodes,meshes,accessors,bufferViews,buffers:[{byteLength:bin.length}],
  materials:[],extensionsUsed:['KHR_draco_mesh_compression'],
  extensionsRequired:['KHR_draco_mesh_compression']};
 const raw=Buffer.from(JSON.stringify(json)),pad=(4-raw.length%4)%4;
 const out=Buffer.alloc(12+8+raw.length+pad+8+bin.length);
 out.write('glTF',0);out.writeUInt32LE(2,4);out.writeUInt32LE(out.length,8);
 out.writeUInt32LE(raw.length+pad,12);out.write('JSON',16);raw.copy(out,20);
 out.fill(0x20,20+raw.length,20+raw.length+pad);
 const offset=20+raw.length+pad;out.writeUInt32LE(bin.length,offset);
 out.writeUInt32LE(0x004e4942,offset+4);bin.copy(out,offset+8);
 return out;
}
function parsed(bytes){
 const jsonLength=bytes.readUInt32LE(12);
 const g=JSON.parse(bytes.toString('utf8',20,20+jsonLength));
 const binStart=20+jsonLength+8;
 return {g,bin:bytes.subarray(binStart)};
}
test('source-only neural GLB has exactly 74 correct unmodified Draco payloads and transforms',()=>{
 const original=fixture(),hash=buf=>createHash('sha256').update(buf).digest('hex');
 const first=createNeuralStudySubset(original),again=createNeuralStudySubset(original);
 const {g,bin}=parsed(first.studyGLB),src=parsed(original);
 assert.equal(first.studyGLB.equals(again.studyGLB),true,'deterministic export');
 assert.equal(first.provenance.sourceSHA256,hash(original));
 assert.equal(first.provenance.modelSHA256,hash(first.studyGLB));
 assert.equal(first.provenance.studyNodeCount,74);
 assert.equal(first.provenance.studyMeshDefinitions,74);
 assert.equal(first.provenance.copiedDracoViews,74);
 assert.ok(first.studyGLB.length<original.length/2,'subset must shrink the source binary');
 const sourceIds=new Set(neuralParts.map(p=>Number(p.id)));
 assert.deepEqual(new Set(g.nodes.map(n=>Number(n.extras.bx_id))),sourceIds);
 for(const node of g.nodes){
  const originalNode=src.g.nodes.find(n=>Number(n.extras.bx_id)===Number(node.extras.bx_id));
  assert.deepEqual(node.translation,originalNode.translation,'world transform preserved');
  assert.deepEqual(node.extras,originalNode.extras,'source identity preserved');
  const oldPrim=src.g.meshes[originalNode.mesh].primitives[0];
  const newPrim=g.meshes[node.mesh].primitives[0];
  const oldView=src.g.bufferViews[oldPrim.extensions.KHR_draco_mesh_compression.bufferView];
  const newView=g.bufferViews[newPrim.extensions.KHR_draco_mesh_compression.bufferView];
  const oldBytes=src.bin.subarray(oldView.byteOffset,oldView.byteOffset+oldView.byteLength);
  const newBytes=bin.subarray(newView.byteOffset,newView.byteOffset+newView.byteLength);
  assert.deepEqual(newBytes,oldBytes,'each compressed anatomical mesh must be byte-for-byte identical');
  assert.deepEqual(g.accessors[newPrim.attributes.POSITION],
   src.g.accessors[oldPrim.attributes.POSITION],'vertex accessor metadata preserved');
 }
});
test('neural derivative fails closed for unexpected GLB formats or missing study structures',()=>{
 assert.throws(()=>createNeuralStudySubset(Buffer.alloc(45)),/Unsafe neural subset/);
 const original=fixture();const broken=Buffer.from(original);
 broken.writeUInt32LE(100,8);
 assert.throws(()=>createNeuralStudySubset(broken),/Unsafe neural subset/);
});
