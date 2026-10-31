// Focused neural Atlas: 44 cranial-nerve/branch and 30 brainstem records.
// Model: Brain Project / Z-Anatomy / BodyParts3D, CC BY-SA 4.0.
// No generated anatomical tubes or invented missing CN IX geometry.
import {create3DRetry} from './retry-3d.js';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/addons/loaders/DRACOLoader.js';
import {attachSourceExplosion} from './source-explode.js';
import {initNeuralPractice} from './neural-practice-ui.js';
import {neuralParts,neuralById,neuralRegions,neuralLessons,
 verifyNeuralManifest,verifyNeuralNodes,teachingStepId} from './neural-manifest.js';
const $=id=>document.getElementById(id),stage=$('neural-stage');
const retry3D=create3DRetry({stage});
const active=new Set(Object.keys(neuralRegions));
let sideFilter='both',searchQuery='';
const selectedMeshes=new Map();
let selected=null,isolate=false,scene=null,renderer=null,camera=null,controls=null,draco=null,allMeshes=[];
let model=null,lessonIndex=-1,resizeObserver=null,explosion=null;
const colors={cranial_nerves:0xe3ba7e,brainstem:0x8abbd5};
function status(msg){$('neural-status').textContent=msg;}
for(const category of Object.keys(neuralRegions)){
 const label=document.createElement('label'),checkbox=document.createElement('input');
 checkbox.type='checkbox';checkbox.value=category;checkbox.checked=true;
 checkbox.addEventListener('change',()=>{
  if(checkbox.checked)active.add(category);else active.delete(category);
  refreshVisibility();
 });label.append(checkbox,document.createTextNode(neuralRegions[category]));
 $('neural-filters').append(label);
}
function matchesSide(part){return sideFilter==='both'||part.side===sideFilter;}
function matchesSearch(part){
 if(!searchQuery)return true;
 return (part.name+' '+part.side+' '+part.id+' '+part.sourceName).toLowerCase().includes(searchQuery);
}
function rebuildChoices(){
 const list=$('neural-select');
 const empty=document.createElement('option');empty.value='';empty.textContent='Select a structure';
 list.replaceChildren(empty);
 let count=0;
 for(const [id,label] of Object.entries(neuralRegions)){
  const group=document.createElement('optgroup');group.label=label;
  for(const part of neuralParts.filter(p=>p.region===id&&matchesSide(p)&&matchesSearch(p))){
   const option=document.createElement('option');option.value=String(part.id);
   option.textContent=part.name+' · '+part.side;group.append(option);
   count++;
  }
  if(group.childElementCount)list.append(group);
 }
 list.value=selected!==null&&neuralById.has(selected)&&matchesSide(neuralById.get(selected))&&matchesSearch(neuralById.get(selected))?String(selected):'';
 $('neural-search-count').textContent=count+' of 74 structures match the search and side filters.';
}
$('neural-search').addEventListener('input',event=>{
 searchQuery=event.target.value.trim().toLowerCase();
 if(selected!==null&&!matchesSearch(neuralById.get(selected)))select(null);
 rebuildChoices();
});
$('neural-side').addEventListener('change',event=>{
 sideFilter=event.target.value;
 if(selected!==null&&!matchesSide(neuralById.get(selected)))select(null);
 rebuildChoices();refreshVisibility();
});
rebuildChoices();
function draw(){if(renderer&&!document.hidden)renderer.render(scene,camera);}
function displayed(mesh){
 const p=neuralById.get(mesh.userData.studyId);
 return active.has(p.region)&&matchesSide(p)&&(!isolate||p.id===selected);
}
function refreshVisibility(){
 const count=neuralParts.filter(p=>active.has(p.region)&&matchesSide(p)&&(!isolate||p.id===selected)).length;
 $('neural-visible-count').textContent=count+' source records match the 3D display filters.';
 if(!allMeshes.length)return;
 for(const mesh of allMeshes){
  mesh.visible=displayed(mesh);
  mesh.material.emissive?.setHex(mesh.userData.studyId===selected?0x224d49:0);
 }
 draw();
}
function select(id){
 selected=id==null?null:Number(id);
 const p=neuralById.get(selected);
 if(selected!==null&&!p)return;
 $('neural-select').value=p?String(p.id):'';
 isolate=false;$('neural-isolate').setAttribute('aria-pressed','false');
 if(p){
  active.add(p.region);for(const el of $('neural-filters').querySelectorAll('input'))el.checked=active.has(el.value);
  if(!matchesSide(p)){sideFilter='both';$('neural-side').value='both';}
  if(!matchesSearch(p)){searchQuery='';$('neural-search').value='';}
 }
 rebuildChoices();
 $('neural-note-name').textContent=p?p.name+' · '+p.side:'Select a structure';
 $('neural-note-text').textContent=p?p.note:'Source-based anatomy for 44 cranial nerve/branch and 30 brainstem/nucleus records.';
 $('neural-note-id').textContent=p?'Original Z-Anatomy / BodyParts3D model node ID: '+p.id+' · '+p.sourceName+' · '+p.region:'';
 $('neural-focus').disabled=!p||!renderer||!model;
 $('neural-isolate').disabled=!p||!renderer||!model;
 if(!p)delete stage.dataset.focusedGroup;
 refreshVisibility();
}
$('neural-select').addEventListener('change',event=>select(event.target.value||null));
function showAll(){
 active.clear();Object.keys(neuralRegions).forEach(k=>active.add(k));
 for(const el of $('neural-filters').querySelectorAll('input'))el.checked=true;
 sideFilter='both';searchQuery='';
 $('neural-side').value='both';$('neural-search').value='';
 select(null);rebuildChoices();refreshVisibility();
}
$('neural-all').addEventListener('click',showAll);
$('neural-isolate').addEventListener('click',()=>{
 if(!renderer||selected===null)return;
 isolate=!isolate;
 $('neural-isolate').setAttribute('aria-pressed',String(isolate));
 refreshVisibility();
});
function frame(meshes,orientation='front'){
 if(!renderer||!camera||!controls||meshes.length===0)return;
 const box=new THREE.Box3();for(const mesh of meshes)box.expandByObject(mesh);
 if(box.isEmpty())return;
 const center=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3());
 const span=Math.max(size.x,size.y,size.z,.03),ratio=Math.max(.3,stage.clientWidth/Math.max(1,stage.clientHeight));
 const fit=span/(2*Math.tan(THREE.MathUtils.degToRad(camera.fov)/2));
 const distance=Math.max(.08,Math.min(10,fit*Math.max(1,1/ratio)*1.65));
 const v=orientation==='back'?new THREE.Vector3(0,0,-1):
  orientation==='left'?new THREE.Vector3(1,0,0):
  orientation==='right'?new THREE.Vector3(-1,0,0):
  orientation==='top'?new THREE.Vector3(0,1,0):new THREE.Vector3(0,0,1);
 camera.up.set(0,orientation==='top'?0:1,orientation==='top'?-1:0);
 camera.position.copy(center).addScaledVector(v,distance);
 camera.near=Math.max(.0001,distance/1500);
 camera.far=Math.max(20,distance*8);
 camera.updateProjectionMatrix();
 controls.target.copy(center);camera.lookAt(center);controls.update();draw();
}
function available(){return allMeshes.filter(mesh=>mesh.visible);}
function focus(){
 if(!renderer||selected===null)return;
 const meshes=selectedMeshes.get(selected);
 if(!meshes?.length)return;
 frame(meshes);stage.dataset.focusedGroup=String(selected);
}
$('neural-focus').addEventListener('click',focus);
for(const button of document.querySelectorAll('[data-neural-view]')){
 button.addEventListener('click',()=>frame(available(),button.dataset.neuralView));
}
$('neural-reset').addEventListener('click',()=>{explosion?.setAmount(0);showAll();frame(available());});
function resize(){
 if(!renderer)return;
 const w=Math.max(1,stage.clientWidth),h=Math.max(1,stage.clientHeight);
 renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();draw();
}
function fallback(reason){
 stage.dataset.fallback='true';stage.dataset.modelStatus='unavailable';
 stage.removeAttribute('tabindex');
 stage.querySelector('canvas')?.style.setProperty('display','none');
 $('neural-fallback').hidden=false;
 retry3D.show();
 $('neural-focus').disabled=true;$('neural-isolate').disabled=true;
 for(const id of ['neural-explode','neural-explode-amount','neural-assemble'])$(id).disabled=true;
 $('neural-explode-status').textContent='3D separation unavailable; written source notes remain available.';
 for(const button of document.querySelectorAll('[data-neural-view]'))button.disabled=true;
 status('3D model unavailable: '+reason+'. Text notes and the seven-stop neural study remain available.');
}
function initializeScene(){
 try{
  renderer=new THREE.WebGLRenderer({antialias:!matchMedia('(pointer:coarse)').matches,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));
  renderer.setSize(1,1,false);renderer.outputColorSpace=THREE.SRGBColorSpace;
  stage.prepend(renderer.domElement);
 }catch{renderer=null;fallback('WebGL not supported');return false;}
 scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(35,1,.0001,20);
 scene.add(new THREE.HemisphereLight(0xf7ffff,0x385b77,2.1));
 const sun=new THREE.DirectionalLight(0xffedde,2.5);sun.position.set(3,5,7);scene.add(sun);
 controls=new OrbitControls(camera,renderer.domElement);
 controls.enableDamping=false;controls.enablePan=true;controls.minDistance=.015;controls.maxDistance=20;
 controls.addEventListener('change',draw);
 const canvas=renderer.domElement;
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();renderer=null;model=null;fallback('WebGL context lost');});
 let point=null;
 canvas.addEventListener('pointerdown',e=>{point=renderer?[e.clientX,e.clientY]:null;});
 canvas.addEventListener('pointercancel',()=>{point=null;});
 canvas.addEventListener('pointerup',e=>{
  const start=point;point=null;if(!renderer||!start||Math.hypot(start[0]-e.clientX,start[1]-e.clientY)>8)return;
  const rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return;
  const normalized=new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);
  const ray=new THREE.Raycaster();ray.setFromCamera(normalized,camera);
  const hit=ray.intersectObjects(available(),false)[0];if(hit)select(hit.object.userData.studyId);
 });
 stage.addEventListener('keydown',e=>{
  if(e.target!==stage||!renderer||!controls)return;
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;
  e.preventDefault();
  const v=camera.position.clone().sub(controls.target);
  const axis=['ArrowLeft','ArrowRight'].includes(e.key)?new THREE.Vector3(0,1,0):new THREE.Vector3(1,0,0);
  const amount=(e.key==='ArrowLeft'||e.key==='ArrowUp'?-1:1)*.12;
  v.applyAxisAngle(axis,amount);camera.position.copy(controls.target).add(v);
  camera.lookAt(controls.target);controls.update();draw();
 });
 resizeObserver=typeof ResizeObserver==='function'?new ResizeObserver(resize):null;
 if(resizeObserver)resizeObserver.observe(stage);else window.addEventListener('resize',resize);
 resize();return true;
}
async function loadNeural(){
 if(!initializeScene())return;
 try{
  const manifestResponse=await fetch(new URL('../../models/slp/neural-source-manifest.json',location.href),{signal:AbortSignal.timeout(40000)});
  if(!manifestResponse.ok)throw Error('Pinned source manifest HTTP '+manifestResponse.status);
  const manifest=await manifestResponse.json();
  if(!verifyNeuralManifest(manifest.nodes))throw Error('Source manifest categories or IDs do not match the 74 frozen neural groups');
  // The immutable 4.44 MiB pinned source remains published for independent
  // verification; this source-preserving derivative retains only the 74
  // required Draco primitives, their original transforms and node IDs.
  const studyResponse=await fetch(new URL('../../models/slp/neural-study-provenance.json',location.href),
   {signal:AbortSignal.timeout(30000)});
  if(!studyResponse.ok)throw Error('Focused neural provenance HTTP '+studyResponse.status);
  const study=await studyResponse.json();
  if(study.kind!=='source-preserving-neural-study-subset'||study.studyMeshDefinitions!==74||
   study.sourceSHA256!=='76a49ea4526a4880613aec7a02756bd7301b0b9d0680d7cae33e197b672c5453')
   throw Error('Focused neural source provenance mismatch');
  const modelResponse=await fetch(new URL('../../models/slp/neural-study.glb',location.href),
   {signal:AbortSignal.timeout(90000)});
  if(!modelResponse.ok)throw Error('Focused neural GLB HTTP '+modelResponse.status);
  const data=await modelResponse.arrayBuffer();
  if(data.byteLength!==study.modelBytes||new DataView(data).getUint32(0,true)!==0x46546c67)
   throw Error('Unexpected focused neural GLB size or header');
  const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',data)),
   byte=>byte.toString(16).padStart(2,'0')).join('');
  if(digest!==study.modelSHA256)throw Error('Focused neural binary SHA-256 verification failed');
  draco=new DRACOLoader();
  draco.setDecoderPath(new URL('../../models/slp/draco/',location.href).href);
  draco.setDecoderConfig({type:'wasm'});
  const gltfLoader=new GLTFLoader();gltfLoader.setDRACOLoader(draco);
  const gltf=await gltfLoader.parseAsync(data,'');
  if(stage.dataset.fallback==='true')return;
  const pairs=[];
  gltf.scene.traverse(mesh=>{
   if(!mesh.isMesh)return;
   const extras=mesh.userData?.bx_id!=null?mesh.userData:mesh.parent?.userData||{};
   const id=Number(extras.bx_id),part=neuralById.get(id);
   if(!part||extras.bx_cat!==part.region){mesh.visible=false;return;}
   const mat=mesh.material?.clone();
   if(!mat)throw Error('Missing source material for neural mesh '+id);
   mat.color?.setHex(colors[part.region]);mat.emissive=new THREE.Color(0);
   mesh.material=mat;mesh.userData.studyId=id;
   pairs.push({id,category:part.region});
   if(!selectedMeshes.has(id))selectedMeshes.set(id,[]);
   selectedMeshes.get(id).push(mesh);
   allMeshes.push(mesh);
  });
  const byId=[...selectedMeshes.keys()].map(id=>({id,category:neuralById.get(id).region}));
  if(!verifyNeuralNodes(byId))throw Error('GLB is missing one or more of the 74 pinned Z-Anatomy nerve/brainstem source groups');
  model=gltf.scene;scene.add(model);
  explosion=attachSourceExplosion({
   THREE,prefix:'neural',stage,model,
   groups:[...selectedMeshes.entries()].map(([id,meshes])=>({id:String(id),meshes})),
   render:draw,
   // Source GLB contains 363 unrelated records: frame only visible SLP meshes.
   frame:()=>frame(available())
  });
  stage.dataset.modelStatus='ready';retry3D.hide();status('74 source-derived nerve/brainstem groups loaded from the smaller, source-preserving study GLB. Other Brain Project geometry is not included; incomplete nerve coverage is disclosed.');
  refreshVisibility();resize();frame(available());
  draco.dispose();
 }catch(e){model=null;fallback(String(e?.message||'invalid source geometry'));}
}
const practice=initNeuralPractice({selectStructure:select,focusStructure:focus});
let studyIndex=-1;
function presentLesson(){
 if(studyIndex<0||studyIndex>=neuralLessons.length)return;
 const item=neuralLessons[studyIndex],id=teachingStepId(item,'left');
 $('neural-lesson-progress').textContent='Step '+(studyIndex+1)+' of '+neuralLessons.length+' · '+item.label;
 $('neural-lesson-note').textContent=item.note+(id===null?' No source mesh is selected for this checkpoint.':' Source mesh highlighted when graphics are available.');
 select(id);if(id!==null)focus();
 $('neural-lesson-prev').disabled=studyIndex===0;
 $('neural-lesson-next').textContent=studyIndex===neuralLessons.length-1?'Finish study':'Next';
}
$('neural-lesson-start').addEventListener('click',()=>{
 if(practice.isActive())practice.stop();
 studyIndex=0;$('neural-lesson-active').hidden=false;
 $('neural-lesson-summary').hidden=true;presentLesson();
});
$('neural-lesson-prev').addEventListener('click',()=>{if(studyIndex>0){studyIndex--;presentLesson();}});
$('neural-lesson-next').addEventListener('click',()=>{
 if(studyIndex<0)return;
 if(studyIndex===neuralLessons.length-1){
  studyIndex=-1;$('neural-lesson-active').hidden=true;
  $('neural-lesson-summary').hidden=false;
  $('neural-lesson-summary').textContent='Study complete. This was a functional review, not a tracing or clinical test.';
 }else{studyIndex++;presentLesson();}
});
$('neural-lesson-close').addEventListener('click',()=>{
 studyIndex=-1;$('neural-lesson-active').hidden=true;
 $('neural-lesson-summary').hidden=true;
});
void loadNeural();
