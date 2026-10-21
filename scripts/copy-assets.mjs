import {cp,writeFile,readFile,mkdir} from 'node:fs/promises';
const catalog=JSON.parse(await readFile('public/catalog.json','utf8'));
for(const {path:p} of catalog.items){await mkdir('dist/'+p.split('/').slice(0,-1).join('/'),{recursive:true});await cp(p,'dist/'+p);}
await writeFile('dist/.nojekyll','');
console.log('Copied repository models and documents');
