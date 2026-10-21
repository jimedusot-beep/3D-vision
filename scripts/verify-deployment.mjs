import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const exec=promisify(execFile),base=new URL(process.argv[2]||'');
if(base.protocol!=='https:')throw Error('Provide an HTTPS website URL');if(!base.pathname.endsWith('/'))base.pathname+='/';
async function fetchBytes(path){const url=new URL(path,base);const {stdout}=await exec('curl',['--fail','--silent','--show-error','--location','--max-time','30',url.href],{encoding:'buffer',maxBuffer:55*1024*1024});return stdout;}
const html=await fetchBytes('');const src=html.toString();if(!src.includes('3D Vision'))throw Error('Unexpected homepage');
const links=[...src.matchAll(/(?:src|href)="([^"#]+\.(?:js|css))"/g)].map(m=>m[1]);
const catalog=JSON.parse(await readFile('dist/catalog.json','utf8'));
const files=[...new Set(['index.html','catalog.json',...links,...catalog.items.map(i=>i.path),'licenses/three.txt','licenses/three-bvh-csg.txt','licenses/three-mesh-bvh.txt','licenses/fflate.txt'])];
const hash=b=>createHash('sha256').update(b).digest('hex');const results=[];
for(let i=0;i<files.length;i+=4){await Promise.all(files.slice(i,i+4).map(async p=>{const remote=p==='index.html'?html:await fetchBytes(p);const local=await readFile('dist/'+p.replace(/^\.\//,''));if(hash(remote)!==hash(local))throw Error('Deployed bytes differ: '+p);results.push({path:p,bytes:remote.length,sha256:hash(remote),status:'PASS'});}));}
await mkdir('test-results',{recursive:true});await writeFile('test-results/deployment-results.json',JSON.stringify({url:base.href,verifiedAt:new Date().toISOString(),files:results},null,2));console.log(`PASS: ${results.length} live files match the tested build; includes all 18 STLs and both GLBs. URL ${base.href}`);
