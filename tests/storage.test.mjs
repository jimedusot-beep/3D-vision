import 'fake-indexeddb/auto';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as storage from '../src/storage.js';
import {parseModel,projectPackage,unpackProject} from '../src/io.js';
import {Workshop} from '../src/core.js';
globalThis.ProgressEvent ??= class {constructor(type,options){this.type=type;Object.assign(this,options)}};

const triangle={asset:{version:'2.0'},scene:0,scenes:[{nodes:[0]}],nodes:[{mesh:0}],meshes:[{primitives:[{attributes:{POSITION:0}}]}],buffers:[{uri:'mesh.bin',byteLength:36}],bufferViews:[{buffer:0,byteOffset:0,byteLength:36}],accessors:[{bufferView:0,componentType:5126,count:3,type:'VEC3',min:[0,0,0],max:[1,1,0]}]};
test('atomic metadata patches preserve concurrent asset fields',async()=>{
 const id=await storage.saveAsset(new File(['atomic'],'atomic.txt'));
 await Promise.all([storage.patchAsset(id,{importOptions:{units:'in'}}),storage.patchAsset(id,{cloudSaved:'test-origin'})]);
 const asset=await storage.readRecord('assets',id);assert.equal(asset.importOptions.units,'in');assert.equal(asset.cloudSaved,'test-origin');
});
test('identical GLTF JSON with different external bytes remains separate bundles',async()=>{
 const json=JSON.stringify({asset:{version:'2.0'},buffers:[{uri:'same.bin'}]});
 const a=await storage.saveAsset(new File([json],'first.gltf'),'device',{companions:[new File(['first buffer'],'same.bin')]});
 const b=await storage.saveAsset(new File([json],'second.gltf'),'device',{companions:[new File(['second buffer'],'same.bin')]});
 assert.notEqual(a,b);assert.equal(await (await storage.loadAssetBundle(a)).companions[0].text(),'first buffer');assert.equal(await (await storage.loadAssetBundle(b)).companions[0].text(),'second buffer');
});
test('legacy GLTF dependencies and aliased names survive project packages',async()=>{
 const bin=new File(['legacy-buffer'],'old.bin'),binId=await storage.saveAsset(bin);
 const gltf=new File([JSON.stringify({buffers:[{uri:'new.bin'}]})],'legacy.gltf');
 const id=await storage.saveAsset(gltf,'device',{companions:[new File([bin],'new.bin')],importOptions:{units:'cm'}});
 const assets=await storage.assetRecordsWithDependencies([id]);
 const pkg=unpackProject(await projectPackage({format:'3dvision-project',version:1,title:'Legacy',scene:new Workshop().json()},assets.map(a=>({...a,bytes:new Uint8Array(a.bytes)}))).arrayBuffer());
 await storage.restorePackageOriginals(pkg);
 const reopened=await storage.loadAssetBundle(id);assert.equal(reopened.companions[0].name,'new.bin');assert.equal(reopened.importOptions.units,'cm');
 const old=await storage.readRecord('assets',id);delete old.companions;await storage.storeRecord('assets',old);
 const recovered=await storage.assetRecordsWithDependencies([id]);assert.ok(recovered.some(a=>a.id===binId));
});
test('saved GLTF reopens its companion bytes and original import units',async()=>{
 const file=new File([JSON.stringify(triangle)],'Frame Mesh.gltf'),binary=new File([new Float32Array([0,0,0,1,0,0,0,1,0])],'mesh.bin');
 const id=await storage.saveAsset(file,'device',{companions:[file,binary],importOptions:{units:'cm',herbie:false}});
 assert.equal(typeof storage.loadAssetBundle,'function','Saved models must reconstruct their companion files');
 const bundle=await storage.loadAssetBundle(id);
 const models=await parseModel(bundle.file,{...bundle.importOptions,companions:bundle.companions});
 models[0].geometry.computeBoundingBox();
 assert.equal(models[0].geometry.boundingBox.max.x-models[0].geometry.boundingBox.min.x,10);
 assert.equal(bundle.companions[0].name,'mesh.bin');
 assert.equal((await storage.allRecords('assets')).filter(a=>a.name==='mesh.bin').length,1);
});
test('package roundtrip preserves original filenames including spaces',async()=>{
 const w=new Workshop(),project={format:'3dvision-project',version:1,title:'Parts',scene:w.json()};
 const bytes=new TextEncoder().encode('# frame notes');
 const blob=projectPackage(project,[{id:'a'.repeat(64),name:'Frame notes.md',bytes}]);
 const unpacked=unpackProject(await blob.arrayBuffer());
 assert.equal(unpacked.originals[0].name,'Frame notes.md');
 assert.equal(await unpacked.originals[0].text(),'# frame notes');
});
test('repository cache fetches updated bytes and keeps a last-good offline copy',async()=>{
 assert.equal(typeof storage.fetchSourceAsset,'function','Source loads must revalidate their cache');
 const url='https://example.test/part.stl';
 await storage.saveAsset(new File(['old mesh'],'part.stl'),url);
 let result=await storage.fetchSourceAsset(url,{fetcher:async()=>new File(['new mesh'],'part.stl')});
 assert.equal(await result.file.text(),'new mesh');assert.equal(result.stale,false);
 result=await storage.fetchSourceAsset(url,{fetcher:async()=>{throw Error('offline')}});
 assert.equal(await result.file.text(),'new mesh');assert.equal(result.stale,true);
});
