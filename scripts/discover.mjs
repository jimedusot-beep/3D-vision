import {readdir,readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
const items=[]; const formats=/\.(stl|obj|glb|gltf|3mf|ply|off|pdf|png|scad|csv|md|zip)$/i;
const names=new Map();
const importSettings=JSON.parse(await readFile('model-import-settings.json','utf8'));
const csv=await readFile('HERBIE_V1/PARTS.csv','utf8');
for(const line of csv.split('\n')){const p=line.split(',');if(/^HBR-/.test(p[1]))names.set(p[1],p[2]?.replaceAll('_',' '));}
async function walk(dir){for(const entry of await readdir(dir,{withFileTypes:true})){if(entry.name.startsWith('.')||['node_modules','dist','src','public','scripts','tests','docs','test-results'].includes(entry.name))continue;const p=path.posix.join(dir,entry.name);if(entry.isDirectory())await walk(p);else if(formats.test(p)){const ext=p.split('.').pop().toLowerCase();items.push({...(importSettings[p]?{importOptions:importSettings[p]}:{}),path:p,name:names.get(entry.name.replace(/\.stl$/i,''))||entry.name,kind:ext,project:p.startsWith('models/')?'HERBIE_V1':p.split('/')[0]});}}}
await walk('.');await mkdir('public',{recursive:true});await writeFile('public/catalog.json',JSON.stringify({version:1,items},null,2)+'\n');console.log(`Discovered ${items.length} repository assets`);
