import {test} from 'node:test';
import assert from 'node:assert/strict';
import {handleFilesRequest} from '../server/cloud-files.mjs';
import {handleLibraryRequest} from '../server/cloud-library.mjs';
import {createCloudAPI,contentHash} from '../src/cloud-api.js';
import {CloudBucket} from './helpers/cloud-bucket.mjs';
const base='https://cloud.test/workshop/index.html';
function service(bucket,user='owner'){return async(url,options={})=>{const request=new Request(url,{...options,headers:{...options.headers,origin:'https://cloud.test',...(user?{'oai-authenticated-user-id':user}:{})}});return (new URL(url).pathname.startsWith('/api/library')?handleLibraryRequest:handleFilesRequest)(request,bucket)}}
const metadata=(blobId)=>({blobId,name:'part.stl',displayName:'Left hinge',folder:'Robot fixtures',importOptions:{units:'in',up:'y',herbie:false},companions:[]});
test('two independent clients restore byte-exact files, folders and source coordinates',async()=>{
 const bucket=new CloudBucket(),first=createCloudAPI({base,fetcher:service(bucket)});await first.list();
 const file=new File(['original mesh bytes'],'part.stl'),blob=await first.upload(file);await first.saveAsset(blob.id,metadata(blob.id));
 const second=createCloudAPI({base,fetcher:service(bucket)});const list=await second.list();assert.equal(list.entries[0].displayName,'Left hinge');assert.equal(list.entries[0].folder,'Robot fixtures');const restored=await second.getAsset(blob.id);assert.deepEqual(restored.importOptions,{units:'in',up:'y',herbie:false});assert.equal(await(await second.download(restored.blobId,restored.name)).text(),await file.text());
 const writes=bucket.writes;await second.upload(file);assert.equal(bucket.writes,writes,'Already saved blobs are not reuploaded');
});
test('GLTF manifests bind the exact companion version and cannot reference another account',async()=>{
 const bucket=new CloudBucket(),api=createCloudAPI({base,fetcher:service(bucket)});await api.list();const buffer=await api.upload(new File(['mesh buffer'],'model.bin')),source=await api.upload(new File(['gltf json'],'model.gltf'));const id=await contentHash(new TextEncoder().encode('bundle identity'));await api.saveAsset(id,{...metadata(source.id),name:'model.gltf',companions:[{name:'model.bin',blobId:buffer.id}]});const record=await api.getAsset(id);assert.equal(await(await api.download(record.companions[0].blobId,record.companions[0].name)).text(),'mesh buffer');
 const other=createCloudAPI({base,fetcher:service(bucket,'other')});assert.equal((await other.list()).entries.length,0);await assert.rejects(other.getAsset(id),/not found/);await assert.rejects(other.download(source.id),/not found/);await assert.rejects(other.saveAsset(id,{...metadata(source.id)}),/missing from your account/);
});
test('concurrent device project revisions remain separate and existing revisions are immutable',async()=>{
 const bucket=new CloudBucket(),fetcher=service(bucket),a=createCloudAPI({base,fetcher}),b=createCloudAPI({base,fetcher});await a.list();await b.list();const project=crypto.randomUUID(),ra=crypto.randomUUID(),rb=crypto.randomUUID();const fa=await a.upload(new File(['revision A'],'assembly.3dv')),fb=await b.upload(new File(['revision B'],'assembly.3dv'));const record=id=>({packageId:id,title:'Robot',folder:'Assemblies'});
 await Promise.all([a.saveRevision(project,ra,record(fa.id)),b.saveRevision(project,rb,record(fb.id))]);assert.equal((await a.list()).entries.filter(e=>e.kind==='project').length,2);await a.saveRevision(project,ra,record(fa.id));await assert.rejects(b.saveRevision(project,ra,record(fb.id)),/different contents/);
});
test('metadata writes require account identity, same origin and valid bounded values',async()=>{
 const bucket=new CloudBucket(),id='a'.repeat(64),url='https://cloud.test/api/library/assets/'+id;
 const req=(body,{user='owner',origin='https://cloud.test'}={})=>new Request(url,{method:'POST',headers:{...(user?{'oai-authenticated-user-id':user}:{}),origin,'content-type':'application/json'},body:JSON.stringify(body)});
 assert.equal((await handleLibraryRequest(req({}, {user:''}),bucket)).status,401);assert.equal((await handleLibraryRequest(req({}, {origin:'https://other.test'}),bucket)).status,403);assert.equal((await handleLibraryRequest(req({...metadata(id),importOptions:{units:'unknown'}}),bucket)).status,400);assert.equal((await handleLibraryRequest(req({...metadata(id),name:'../part.stl'}),bucket)).status,400);assert.equal((await handleLibraryRequest(req({text:'a'.repeat(66000)}),bucket)).status,400);
});
test('download integrity failure prevents corrupted files from opening',async()=>{
 const bucket=new CloudBucket(),api=createCloudAPI({base,fetcher:service(bucket)});await api.list();const file=await api.upload(new File(['good original'],'part.stl'));const key=[...bucket.objects.keys()][0];bucket.objects.get(key).bytes=new TextEncoder().encode('bad bytes');await assert.rejects(api.download(file.id),/checksum does not match/);
});
