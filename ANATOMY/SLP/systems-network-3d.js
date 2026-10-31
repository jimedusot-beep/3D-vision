// Abstract 3D navigation of SLP subjects, NOT a human-shaped anatomical model.
// This graph describes study-topic relationships only; no positions are body coordinates.
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
const pos={
 respiration:[-2.5,-.35,.6],phonation:[-.9,-.2,.6],
 resonance:[.5,.72,.6],articulation:[1.9,1.22,.45],
 neural:[-.15,2.0,-.9],hearing:[2.3,2.05,-.8],
 swallowing:[-.1,-1.65,.1],acoustics:[2.0,-.25,-.6],
 language:[2.75,.8,-1.55],disorders:[1.6,-1.65,-1.2]
};
const connections=[
 ['respiration','phonation'],['phonation','resonance'],['resonance','articulation'],
 ['phonation','swallowing'],['phonation','acoustics'],['neural','phonation'],
 ['neural','swallowing'],['neural','hearing'],['hearing','language'],
 ['articulation','language'],['acoustics','language'],['disorders','phonation'],
 ['disorders','swallowing'],['disorders','language']
];
export const systemLayout=pos;
export function validateLayout(modules){
 const ids=new Set(modules.map(x=>x.id));
 const positions=Object.keys(pos);
 if(ids.size!==10||positions.length!==10||positions.some(x=>!ids.has(x))||
   connections.some(pair=>pair.some(x=>!ids.has(x)))||
   Object.values(pos).some(v=>v.length!==3||v.some(n=>!Number.isFinite(n))))
  throw Error('3D topic map must have exactly ten curriculum nodes and valid relationships');
 return true;
}
function nameSprite(text,selected=false){
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=96;
 const ctx=canvas.getContext('2d');if(!ctx)return null;
 ctx.fillStyle=selected?'#145b53':'#163542';
 ctx.strokeStyle=selected?'#aaefd6':'#688b9e';
 ctx.lineWidth=5;
 ctx.beginPath();ctx.roundRect(8,8,496,80,14);ctx.fill();ctx.stroke();
 ctx.fillStyle='#f1fbff';ctx.font='600 29px system-ui';
 ctx.textAlign='center';ctx.textBaseline='middle';
 ctx.fillText(text,256,47,480);
 const texture=new THREE.CanvasTexture(canvas);
 texture.colorSpace=THREE.SRGBColorSpace;
 const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthTest:false}));
 sprite.scale.set(1.45,.27,1);
 return sprite;
}
export function initSystems3D({stage,modules,onSelect}){
 validateLayout(modules);
 const status=stage.querySelector('#systems-3d-status');
 const fallback=reason=>{
  stage.dataset.available='false';
  status.textContent='3D map unavailable ('+reason+'). The ten native subject buttons below remain fully usable.';
 };
 let renderer,scene,camera,controls,resizeObserver;
 try{
  renderer=new THREE.WebGLRenderer({antialias:!matchMedia('(pointer:coarse)').matches,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.setSize(1,1,false);
  stage.prepend(renderer.domElement);
 }catch{fallback('WebGL disabled');return {select(){},dispose(){}};}
 scene=new THREE.Scene();
 camera=new THREE.PerspectiveCamera(40,1,.1,100);
 camera.position.set(0,1,10.5);
 controls=new OrbitControls(camera,renderer.domElement);
 controls.enableDamping=false;controls.enablePan=false;controls.minDistance=7;controls.maxDistance=18;
 controls.target.set(0,0,-.2);
 scene.add(new THREE.AmbientLight(0xffffff,2));
 const light=new THREE.DirectionalLight(0xffffff,2);light.position.set(4,7,5);scene.add(light);
 const points=new Map(),targets=[];
 const selectedColor=0x86ebc2,hasModel=0x47ceae,outline=0x6f8ea2;
 for(const [a,b] of connections){
  const v1=new THREE.Vector3(...pos[a]),v2=new THREE.Vector3(...pos[b]);
  const geom=new THREE.BufferGeometry().setFromPoints([v1,v2]);
  const line=new THREE.Line(geom,new THREE.LineBasicMaterial({color:0x536f81,transparent:true,opacity:.7}));
  scene.add(line);
 }
 for(const [i,m] of modules.entries()){
  const object=new THREE.Group();object.position.set(...pos[m.id]);scene.add(object);
  const mesh=new THREE.Mesh(new THREE.IcosahedronGeometry(m.stage==='3d'?.23:.18,1),
   new THREE.MeshStandardMaterial({color:m.stage==='3d'?hasModel:outline,roughness:.4,metalness:.12,emissive:0x000000}));
  mesh.userData.systemId=m.id;
  object.add(mesh);targets.push(mesh);
  const label=nameSprite((i+1)+'. '+m.name.replace(' and ',' & ').slice(0,28));
  if(label){label.position.set(0,-.40,0);label.userData.systemId=m.id;object.add(label);targets.push(label);}
  points.set(m.id,{mesh,object,label});
 }
 function draw(){
  if(document.hidden||!renderer)return;
  renderer.render(scene,camera);
 }
 controls.addEventListener('change',draw);
 function resize(){
  if(!renderer)return;
  const w=Math.max(1,Math.round(stage.clientWidth)),h=Math.max(1,Math.round(stage.clientHeight));
  renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();draw();
 }
 resizeObserver=typeof ResizeObserver==='function'?new ResizeObserver(resize):null;
 if(resizeObserver)resizeObserver.observe(stage);else window.addEventListener('resize',resize);
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();fallback('graphics context lost');renderer=null;});
 let down=null;
 renderer.domElement.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY];});
 renderer.domElement.addEventListener('pointerup',e=>{
  if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>7)return;
  const rect=renderer.domElement.getBoundingClientRect();
  const xy=new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);
  const ray=new THREE.Raycaster();ray.setFromCamera(xy,camera);
  const hit=ray.intersectObjects(targets,false)[0];
  if(hit)onSelect(hit.object.userData.systemId);
 });
 function select(id){
  for(const [key,{mesh}] of points){
   mesh.material.emissive.setHex(key===id?0x17806b:0x000000);
   mesh.scale.setScalar(key===id?1.4:1);
  }
  status.textContent=modules.find(m=>m.id===id)?.name+
   ': '+(modules.find(m=>m.id===id)?.stage==='3d'?'real source-derived 3D module available':'study roadmap / no anatomical mesh yet')+
   '. Select a topic below for details.';
  draw();
 }
 stage.addEventListener('keydown',e=>{
  if(e.key==='ArrowLeft'||e.key==='ArrowRight'){
   e.preventDefault();const v=camera.position.clone().sub(controls.target);
   v.applyAxisAngle(new THREE.Vector3(0,1,0),e.key==='ArrowLeft'?-.14:.14);
   camera.position.copy(controls.target).add(v);controls.update();draw();
  }
 });
 stage.dataset.available='true';
 resize();
 return {select,dispose(){resizeObserver?.disconnect();controls.dispose();renderer?.dispose();}};
}
