import {booleanGeometry} from './boolean.js';
self.onmessage=({data})=>{try{const g=booleanGeometry(data.a,data.b,data.operation);self.postMessage({geometry:g.toJSON()});}catch(e){self.postMessage({error:e.message})}};
