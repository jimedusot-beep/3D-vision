import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseGLBJSON,auditGLBJSON} from '../scripts/audit-slp-model-footprints.mjs';
function tinyGLB(gltf){
 const encoded=Buffer.from(JSON.stringify(gltf));
 const padded=Math.ceil(encoded.length/4)*4;
 const out=Buffer.alloc(20+padded,0x20);
 out.write('glTF',0);out.writeUInt32LE(2,4);out.writeUInt32LE(out.length,8);
 out.writeUInt32LE(padded,12);out.write('JSON',16);encoded.copy(out,20);
 return out;
}
const source={
 nodes:[
  {children:[1,2],extras:{bx_id:419,bx_cat:'cranial_nerves'}},
  {mesh:0},
  {mesh:1,extras:{bx_id:20,bx_cat:'brainstem'}},
  {mesh:2,extras:{bx_id:25,bx_cat:'cortex'}}
 ],
 meshes:[
  {primitives:[{attributes:{POSITION:0},indices:1,extensions:{KHR_draco_mesh_compression:{bufferView:0,attributes:{POSITION:0}}}}]},
  {primitives:[{attributes:{POSITION:2},indices:3}]},
  {primitives:[{attributes:{POSITION:4},indices:5}]}
 ],
 accessors:[
  {count:100,componentType:5126,type:'VEC3'},
  {count:300,componentType:5125,type:'SCALAR'},
  {count:20,componentType:5126,type:'VEC3'},
  {count:60,componentType:5125,type:'SCALAR'},
  {count:90,componentType:5126,type:'VEC3'},
  {count:270,componentType:5125,type:'SCALAR'}
 ]
};
test('read-only GLB parser validates headers and JSON chunk bounds',()=>{
 const encoded=tinyGLB(source);
 assert.equal(parseGLBJSON(encoded).meshes.length,3);
 for(const wrong of [
  Buffer.alloc(5),
  Buffer.from(encoded).fill(0,0,4),
  Buffer.from(encoded).fill(0,8,12)
 ])assert.throws(()=>parseGLBJSON(wrong),/GLB/);
});
test('footprint audit counts source IDs including metadata inherited from parent and excludes cortex',()=>{
 const summary=auditGLBJSON(source,1111,'neural');
 assert.equal(summary.meshDefinitions,3);
 assert.equal(summary.meshInstances,3);
 assert.equal(summary.dracoPrimitiveDefinitions,1);
 assert.equal(summary.totalTriangleIndexEntries,210);
 assert.equal(summary.totalVertexAccessorEntries,210);
 assert.equal(summary.neural.sourceTaggedRecords,2);
 assert.equal(summary.neural.selectedTriangleIndexEntries,120);
 assert.equal(summary.neural.selectedVertexAccessorEntries,120);
 assert.equal(summary.neural.selectedPrimitiveDefinitions,2);
 assert.ok(summary.neural.approximateUnselectedTriangleRatio>0.4);
 assert.match(summary.caution,/not actual GPU memory/i);
});
