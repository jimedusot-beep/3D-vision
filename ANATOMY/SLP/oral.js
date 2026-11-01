// Licensed Z-Anatomy oral/salivary model via OrganUI (CC BY-SA 4.0).
// Tongue, mandible and hyoid are landmarks, not complete speech/swallowing mechanics.
import {create3DRetry} from './retry-3d.js';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {attachSourceExplosion} from './source-explode.js';
import {visibleSourceBounds} from './visible-source-bounds.js';
import {oralParts,oralById,oralRegions,verifyOralNodes} from './oral-manifest.js';
const $=id=>document.getElementById(id);
const stage=$('oral-stage');
const retry3D=create3DRetry({stage});
const activeRegions=new Set(Object.keys(oralRegions)),nodes=[];
const palette={glands:0xd4a183,ducts:0x90cccf,articulator:0xbf817c,landmarks:0xbab4ac};
let selected=null,isolate=false,renderer=null,model=null,controls=null,camera=null,scene=null;
let resizeObserver=null,explosion=null;
function message(value){$('oral-status').textContent=value;}
for(const part of oralParts){
 const option=document.createElement('option');
 option.value=part.id;option.textContent=part.name;
 $('oral-select').append(option);
}
for(const [id,label] of Object.entries(oralRegions)){
 const row=document.createElement('label'),input=document.createElement('input');
 input.type='checkbox';input.value=id;input.checked=true;
 input.addEventListener('change',()=>{
  if(input.checked)activeRegions.add(id);else activeRegions.delete(id);
  show();
 });
 row.append(input,document.createTextNode(label));
 $('oral-filters').append(row);
}
function draw(){if(renderer&&!document.hidden)renderer.render(scene,camera);}
function show(){
 for(const mesh of nodes){
  const part=oralById.get(mesh.name);
  mesh.visible=activeRegions.has(part.region)&&(!isolate||mesh.name===selected);
  mesh.material.emissive?.setHex(mesh.name===selected?0x286f5f:0x000000);
 }
 draw();
}
function select(id){
 if(id!==null&&!oralById.has(id))return;
 selected=id;
 const info=oralById.get(id);
 isolate=false;$('oral-isolate').setAttribute('aria-pressed','false');
 if(info)activeRegions.add(info.region);
 for(const input of $('oral-filters').querySelectorAll('input'))
  input.checked=activeRegions.has(input.value);
 $('oral-select').value=id||'';
 $('oral-note-name').textContent=info?.name||'Select a structure';
 $('oral-note-text').textContent=info?.description||
  'Choose any salivary gland, duct, tongue, mandible or hyoid source group.';
 $('oral-note-id').textContent=info?'Z-Anatomy original object: '+info.sourceObject+' · Group: '+info.id:'';
 $('oral-focus').disabled=!id||!model||!renderer;
 $('oral-isolate').disabled=!id||!model||!renderer;
 if(!id)delete stage.dataset.focusedGroup;
 show();
}
$('oral-select').addEventListener('change',e=>select(e.target.value||null));
$('oral-isolate').addEventListener('click',()=>{
 if(!selected||!renderer||!model)return;
 isolate=!isolate;$('oral-isolate').setAttribute('aria-pressed',String(isolate));show();
});
function showAll(){
 isolate=false;selected=null;activeRegions.clear();
 Object.keys(oralRegions).forEach(id=>activeRegions.add(id));
 for(const input of $('oral-filters').querySelectorAll('input'))input.checked=true;
 $('oral-select').value='';
 $('oral-note-name').textContent='Select a structure';
 $('oral-note-text').textContent='All 15 source-derived oral and salivary groups restored.';
 $('oral-note-id').textContent='';
 $('oral-focus').disabled=true;$('oral-isolate').disabled=true;
 $('oral-isolate').setAttribute('aria-pressed','false');
 delete stage.dataset.focusedGroup;
 show();
}
$('oral-all').addEventListener('click',showAll);
function frame(object,orientation='front'){
 if(!renderer||!camera||!controls||!object)return;
 object.updateMatrixWorld(true);
 const bounds=visibleSourceBounds(THREE,object);
 if(bounds.isEmpty())return;
 const center=bounds.getCenter(new THREE.Vector3());
 const size=bounds.getSize(new THREE.Vector3());
 const largest=Math.max(size.x,size.y,size.z,.2);
 const height=Math.max(stage.clientHeight,1),width=Math.max(stage.clientWidth,1);
 const fov=THREE.MathUtils.degToRad(camera.fov);
 const fitHeight=largest/(2*Math.tan(fov/2));
 const fitWidth=fitHeight/(width/height);
 const distance=Math.max(2,Math.max(fitHeight,fitWidth)*1.6);
 camera.far=Math.max(200,distance+largest*3);
 camera.updateProjectionMatrix();
 controls.maxDistance=Math.max(70,distance*2);
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
$('oral-focus').addEventListener('click',focus);
for(const button of document.querySelectorAll('[data-oral-view]'))
 button.addEventListener('click',()=>frame(model,button.dataset.oralView));
$('oral-reset').addEventListener('click',()=>{explosion?.setAmount(0);showAll();frame(model);});
function resize(){
 if(!renderer)return;
 const w=Math.max(1,Math.round(stage.clientWidth)),h=Math.max(1,Math.round(stage.clientHeight));
 renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();draw();
}
function fallback(reason){
 stage.dataset.fallback='true';stage.dataset.modelStatus='unavailable';
 stage.removeAttribute('tabindex');stage.querySelector('canvas')?.style.setProperty('display','none');
 $('oral-fallback').hidden=false;
 retry3D.show();
 for(const id of ['oral-explode','oral-explode-amount','oral-assemble'])$(id).disabled=true;
 $('oral-explode-status').textContent='3D separation unavailable: use the source structure list and written notes.';
 for(const id of ['oral-focus','oral-isolate'])$(id).disabled=true;
 for(const button of document.querySelectorAll('[data-oral-view]'))button.disabled=true;
 message('3D graphics unavailable: '+reason+'. Read and select all 15 written source groups below. Choose Retry 3D to attempt loading again.');
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
  const url=new URL('../../models/slp/oral.glb',location.href);
  const response=await fetch(url,{signal:AbortSignal.timeout(45000)});
  if(!response.ok)throw Error('Source model HTTP '+response.status);
  const buffer=await response.arrayBuffer();
  if(buffer.byteLength!==754496)throw Error('Unexpected oral source file size');
  const parsed=await new GLTFLoader().parseAsync(buffer,'');
  if(stage.dataset.fallback==='true')return;
  const candidate=parsed.scene,meshes=[];
  candidate.traverse(o=>{if(o.isMesh)meshes.push(o);});
  verifyOralNodes(meshes.map(o=>o.name));
  for(const mesh of meshes){
   mesh.material=mesh.material.clone();mesh.material.side=THREE.DoubleSide;
   mesh.material.emissive=new THREE.Color(0);
   mesh.material.color?.setHex(palette[oralById.get(mesh.name).region]);
   nodes.push(mesh);
  }
  model=candidate;scene.add(model);
  explosion=attachSourceExplosion({
   THREE,prefix:'oral',stage,model,
   groups:nodes.map(mesh=>({id:mesh.name,meshes:[mesh]})),
   render:draw,frame
  });
  stage.dataset.modelStatus='ready';retry3D.hide();
  message('Licensed Z-Anatomy oral study model: 15 source-derived groups loaded. Static tongue, jaw, glands, ducts and hyoid; no motion simulation.');
  show();frame(model);resize();
 }catch(e){model=null;fallback(String(e?.message||'invalid model'));}
}
void load();
