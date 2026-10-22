import {test} from 'node:test';
import assert from 'node:assert/strict';
import {unzipSync,strFromU8} from 'fflate';
import {createAccountBackup,cloudUsage} from '../src/cloud-backup.js';
import {createCloudAPI} from '../src/cloud-api.js';
import {CloudBucket} from './helpers/cloud-bucket.mjs';
import {handleFilesRequest} from '../server/cloud-files.mjs';
import {handleLibraryRequest} from '../server/cloud-library.mjs';
test('account recovery archive preserves byte-exact originals and full companion/settings metadata',async()=>{
 const bucket=new CloudBucket(),api=createCloudAPI({base:'https://cloud.test/',fetcher:async(url,options={})=>{
 const req=new Request(url,{...options,headers:{...options.headers,origin:'https://cloud.test','oai-authenticated-user-id':'owner'}});return(new URL(url).pathname.startsWith('/api/library')?handleLibraryRequest:handleFilesRequest)(req,bucket)}});
 await api.list();const blob=await api.upload(new File(['exact bytes'],'hinge.stl'));
 await api.saveAsset(blob.id,{blobId:blob.id,name:'hinge.stl',displayName:'Hinge',folder:'Fixtures',importOptions:{units:'cm',up:'z'},companions:[]});
 const progress=[],archive=unzipSync(new Uint8Array(await(await createAccountBackup(api,{onProgress:(...v)=>progress.push(v)})).arrayBuffer()));
 const manifest=JSON.parse(strFromU8(archive['manifest.json']));assert.equal(strFromU8(archive['files/'+blob.id]),'exact bytes');assert.equal(manifest.entries[0].folder,'Fixtures');assert.equal(manifest.entries[0].importOptions.units,'cm');assert.deepEqual(progress,[[1,1]]);assert.match(strFromU8(archive['README.txt']),/automatic whole-account restoration is not available/);
 const usage=cloudUsage((await api.list()).files,manifest.entries);assert.deepEqual(usage,{bytes:11,blobs:1,files:1,projects:0,revisions:0});
 await assert.rejects(createAccountBackup(api,{limit:5}),/memory limit/);
});
test('backup stops on failed integrity/download and never returns a partial archive',async()=>{
 const api={list:async()=>({files:[{id:'a',name:'part.stl',size:1}],entries:[]}),download:async()=>{throw Error('checksum does not match')}};await assert.rejects(createAccountBackup(api),/checksum/);
});
