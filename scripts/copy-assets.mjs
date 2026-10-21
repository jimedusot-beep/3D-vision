import {cp,writeFile,readFile,mkdir} from 'node:fs/promises';
const output=process.argv[2]||'dist';
const catalog=JSON.parse(await readFile('public/catalog.json','utf8'));
for(const {path:p} of catalog.items){await mkdir(output+'/' +p.split('/').slice(0,-1).join('/'),{recursive:true});await cp(p,output+'/' +p);}
await writeFile(output+'/.nojekyll','');
console.log('Copied repository models and documents');
