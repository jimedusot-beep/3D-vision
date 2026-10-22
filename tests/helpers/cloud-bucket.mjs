export class CloudBucket {
 objects=new Map();writes=0;
 async put(key,input,options={}){if(options.onlyIf?.etagDoesNotMatch==='*'&&this.objects.has(key))return null;const bytes=typeof input==='string'?new TextEncoder().encode(input):new Uint8Array(input);const object={key,bytes,size:bytes.byteLength,uploaded:new Date(),customMetadata:options.customMetadata||{},httpMetadata:options.httpMetadata||{}};this.objects.set(key,object);this.writes++;return object}
 async head(key){return this.objects.get(key)||null}
 async get(key){const object=this.objects.get(key);return object?{...object,body:object.bytes,text:async()=>new TextDecoder().decode(object.bytes)}:null}
 async list({prefix,limit=1000,cursor}){const all=[...this.objects.values()].filter(o=>o.key.startsWith(prefix)).sort((a,b)=>a.key.localeCompare(b.key));const offset=Number(cursor)||0,objects=all.slice(offset,offset+limit),truncated=offset+limit<all.length;return{objects,truncated,...truncated?{cursor:String(offset+limit)}:{}}}
}
