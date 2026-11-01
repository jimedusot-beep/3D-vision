// Source-derived BodyParts3D 4.3 pharynx GLB, CC BY-SA 2.1 Japan (OrganUI).
// No mucosal lining, pharyngeal cavity surface or closure/swallowing animation.
import {create3DRetry} from './retry-3d.js';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {attachSourceExplosion} from './source-explode.js';
import {pharynxParts,pharynxById,pharynxRegions,verifyPharynxNodes} from './pharynx-manifest.js';
const $=id=>document.getElementById(id);
const stage=$('pharynx-stage');
const retry3D=create3DRetry({stage});
const activeRegions=new Set(Object.keys(pharynxRegions)),nodes=[];
const palette={wall:0xcd917c,elevators:0x94b3e6,palate:0x85d2c5,landmarks:0xd5c5b6,vessels:0xd98f95,nerves:0xd9be73};
let selected=null,isolate=false,renderer=null,model=null,controls=null,camera=null,scene=null;
let resizeObserver=null,explosion=null;
function message(value){$('pharynx-status').textContent=value;}
for(const part of pharynxParts){
 const option=document.createElement('option');
 option.value=part.id;option.textContent=part.name;
 $('pharynx-select').append(option);
}
for(const [id,label] of Object.entries(pharynxRegions)){
 const row=document.createElement('label'),input=document.createElement('input');
 input.type='checkbox';input.value=id;input.checked=true;
 input.addEventListener('change',()=>{
  if(input.checked)activeRegions.add(id);else activeRegions.delete(id);
  show();
 });
 row.append(input,document.createTextNode(label));
 $('pharynx-filters').append(row);
}
function draw(){if(renderer&&!document.hidden)renderer.render(scene,camera);}
function show(){
 for(const mesh of nodes){
  const part=pharynxById.get(mesh.name);
  mesh.visible=activeRegions.has(part.region)&&(!isolate||mesh.name===selected);
  mesh.material.emissive?.setHex(mesh.name===selected?0x286f5f:0x000000);
 }
 draw();
}
function select(id){
 if(id!==null&&!pharynxById.has(id))return;
 selected=id;
 const info=pharynxById.get(id);
 isolate=false;$('pharynx-isolate').setAttribute('aria-pressed','false');
 if(info)activeRegions.add(info.region);
 for(const input of $('pharynx-filters').querySelectorAll('input'))
  input.checked=activeRegions.has(input.value);
 $('pharynx-select').value=id||'';
 $('pharynx-note-name').textContent=info?.name||'Select a structure';
 $('pharynx-note-text').textContent=info?.description||
  'Select a pharyngeal constrictor, palate muscle or associated structure.';
 $('pharynx-note-id').textContent=info?'BodyParts3D concept: '+info.fma+' · Source group: '+info.id+(info.concepts.length>1?' · Paired sources combined':''):'';
 $('pharynx-focus').disabled=!id||!model||!renderer;
 $('pharynx-isolate').disabled=!id||!model||!renderer;
 if(!id)delete stage.dataset.focusedGroup;
 show();
}
$('pharynx-select').addEventListener('change',e=>select(e.target.value||null));
$('pharynx-isolate').addEventListener('click',()=>{
 if(!selected||!renderer||!model)return;
 isolate=!isolate;$('pharynx-isolate').setAttribute('aria-pressed',String(isolate));show();
});
function showAll(){
 isolate=false;selected=null;activeRegions.clear();
 Object.keys(pharynxRegions).forEach(id=>activeRegions.add(id));
 for(const input of $('pharynx-filters').querySelectorAll('input'))input.checked=true;
 $('pharynx-select').value='';
 $('pharynx-note-name').textContent='Select a structure';
 $('pharynx-note-text').textContent='All 20 original source-defined pharynx groups restored.';
 $('pharynx-note-id').textContent='';
 $('pharynx-focus').disabled=true;$('pharynx-isolate').disabled=true;
 $('pharynx-isolate').setAttribute('aria-pressed','false');
 delete stage.dataset.focusedGroup;
 show();
}
$('pharynx-all').addEventListener('click',showAll);
function frame(object,orientation='front'){
 if(!renderer||!camera||!controls||!object)return;
 object.updateMatrixWorld(true);
 const bounds=new THREE.Box3().setFromObject(object);
 if(bounds.isEmpty())return;
 const center=bounds.getCenter(new THREE.Vector3());
 const size=bounds.getSize(new THREE.Vector3());
 const largest=Math.max(size.x,size.y,size.z,.2);
 const height=Math.max(stage.clientHeight,1),width=Math.max(stage.clientWidth,1);
 const fov=THREE.MathUtils.degToRad(camera.fov);
 const fitHeight=largest/(2*Math.tan(fov/2));
 const fitWidth=fitHeight/(width/height);
 const distance=Math.min(45,Math.max(2,Math.max(fitHeight,fitWidth)*1.6));
 const prior=camera.position.clone().sub(controls.target);
 const keepView=orientation==='current'&&prior.lengthSq()>1e-9;
 const vector=keepView?prior.normalize():orientation==='back'?new THREE.Vector3(0,0,-1):
  orientation==='left'?new THREE.Vector3(1,0,0):
  orientation==='right'?new THREE.Vector3(-1,0,0):
  orientation==='top'?new THREE.Vector3(0,1,0):new THREE.Vector3(0,0,1);
 if(!keepView)camera.up.set(0,orientation==='top'?0:1,orientation==='top'?-1:0);
 camera.position.copy(center).addScaledVector(vector,distance);
 controls.target.copy(center);camera.lookAt(center);controls.update();draw();
}
function focus(){
 if(!renderer||!model||!selected)return;
 const target=nodes.find(mesh=>mesh.name===selected);
 if(!target)return;
 frame(target);stage.dataset.focusedGroup=selected;
}
$('pharynx-focus').addEventListener('click',focus);
for(const button of document.querySelectorAll('[data-pharynx-view]'))
 button.addEventListener('click',()=>frame(model,button.dataset.pharynxView));
$('pharynx-reset').addEventListener('click',()=>{explosion?.setAmount(0);showAll();frame(model);});
function resize(){
 if(!renderer)return;
 const w=Math.max(1,Math.round(stage.clientWidth)),h=Math.max(1,Math.round(stage.clientHeight));
 renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();draw();
}
function fallback(reason){
 stage.dataset.fallback='true';stage.dataset.modelStatus='unavailable';
 stage.removeAttribute('tabindex');stage.querySelector('canvas')?.style.setProperty('display','none');
 $('pharynx-fallback').hidden=false;
 retry3D.show();
 for(const id of ['pharynx-explode','pharynx-explode-amount','pharynx-assemble'])$(id).disabled=true;
 $('pharynx-explode-status').textContent='3D separation unavailable: use the source structure list and written notes.';
 for(const id of ['pharynx-focus','pharynx-isolate'])$(id).disabled=true;
 for(const button of document.querySelectorAll('[data-pharynx-view]'))button.disabled=true;
 message('3D graphics unavailable: '+reason+'. Read and select all 20 written source groups below. Choose Retry 3D to attempt loading again.');
}
function initScene(){
 try{
  renderer=new THREE.WebGLRenderer({antialias:!matchMedia('(pointer:coarse)').matches,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));
  renderer.setSize(1,1,false);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  stage.prepend(renderer.domElement);
 }catch{renderer=null;fallback('WebGL not supported');return false;}
 scene=new THREE.Scene();
 camera=new THREE.PerspectiveCamera(35,1,.05,200);
 scene.add(new THREE.HemisphereLight(0xf5ffff,0x34536a,2.0));
 const light=new THREE.DirectionalLight(0xfff1de,2.5);light.position.set(5,8,7);scene.add(light);
 controls=new OrbitControls(camera,renderer.domElement);
 controls.enableDamping=false;controls.enablePan=true;controls.minDistance=.8;controls.maxDistance=70;
 controls.addEventListener('change',draw);
 const canvas=renderer.domElement;
 canvas.addEventListener('webglcontextlost',e=>{
  e.preventDefault();renderer=null;model=null;fallback('WebGL context lost');
 });
 let pointer=null;
 canvas.addEventListener('pointerdown',e=>{if(renderer)pointer=[e.clientX,e.clientY];});
 canvas.addEventListener('pointercancel',()=>{pointer=null;});
 canvas.addEventListener('pointerup',e=>{
  const down=pointer;pointer=null;
  if(!renderer||!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>8)return;
  const rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return;
  const normalized=new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);
  const ray=new THREE.Raycaster();ray.setFromCamera(normalized,camera);
  const hit=ray.intersectObjects(nodes.filter(mesh=>mesh.visible),false)[0];
  if(hit)select(hit.object.name);
 });
 stage.addEventListener('keydown',e=>{
  if(e.target!==stage||!renderer||!camera||!controls)return;
  if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){
   e.preventDefault();
   const direction=camera.position.clone().sub(controls.target);
   if(e.key==='ArrowLeft'||e.key==='ArrowRight')direction.applyAxisAngle(
    new THREE.Vector3(0,1,0),e.key==='ArrowLeft'?-.12:.12);
   else direction.applyAxisAngle(new THREE.Vector3(1,0,0),e.key==='ArrowUp'?.12:-.12);
   camera.position.copy(controls.target).add(direction);
   camera.lookAt(controls.target);controls.update();draw();
  }
 });
 resizeObserver=typeof ResizeObserver==='function'?new ResizeObserver(resize):null;
 if(resizeObserver)resizeObserver.observe(stage);else window.addEventListener('resize',resize);
 resize();
 return true;
}
async function load(){
 if(!initScene())return;
 try{
  const url=new URL('../../models/slp/pharynx.glb',location.href);
  const response=await fetch(url,{signal:AbortSignal.timeout(45000)});
  if(!response.ok)throw Error('Source model HTTP '+response.status);
  const buffer=await response.arrayBuffer();
  if(buffer.byteLength!==7148788)throw Error('Unexpected pharynx source file size');
  const parsed=await new GLTFLoader().parseAsync(buffer,'');
  if(stage.dataset.fallback==='true')return;
  const candidate=parsed.scene,meshes=[];
  candidate.traverse(o=>{if(o.isMesh)meshes.push(o);});
  verifyPharynxNodes(meshes.map(o=>o.name));
  for(const mesh of meshes){
   mesh.material=mesh.material.clone();mesh.material.side=THREE.DoubleSide;
   mesh.material.emissive=new THREE.Color(0);
   mesh.material.color?.setHex(palette[pharynxById.get(mesh.name).region]);
   nodes.push(mesh);
  }
  model=candidate;scene.add(model);
  explosion=attachSourceExplosion({
   THREE,prefix:'pharynx',stage,model,
   groups:nodes.map(mesh=>({id:mesh.name,meshes:[mesh]})),
   render:draw,frame
  });
  stage.dataset.modelStatus='ready';retry3D.hide();
  message('Licensed BodyParts3D 4.3 pharyngeal muscle study: 20 source-defined groups loaded. Static surfaces, not velopharyngeal closure or swallowing motion.');
  show();frame(model);resize();
 }catch(e){model=null;fallback(String(e?.message||'invalid model'));}
}
void load();
