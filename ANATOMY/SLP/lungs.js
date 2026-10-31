import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {lungGroups,lungGroupById,lungRegions,verifyLungGroups} from './lungs-manifest.js';

const $=id=>document.getElementById(id),stage=$('lung-stage');
const regionColors={
 'right-upper':0xd5a286,'right-middle':0x91b7a7,'right-lower':0xb87f75,
 'left-upper':0xd9b997,'left-lower':0x879fae,'airway':0x9ed4d8
};
const offsets={
 'right-upper':[-.8,.65,.12],'right-middle':[-1.1,.05,.16],
 'right-lower':[-.7,-.65,.15],'left-upper':[.8,.52,.12],
 'left-lower':[.8,-.65,.1],'airway':[0,.24,-1.15]
};
const enabled=new Set(Object.keys(lungRegions)),regions=new Map(),meshNodes=[];
let selected=null,isolate=false,amount=0,model=null,box=null,renderer=null,controls=null,camera=null,scene=null,first=0,resize=null;
function message(text){$('model-status').textContent=text;}
function select(id){
 if(id!==null&&!lungGroupById.has(id))return;
 selected=id;isolate=false;$('lung-isolate').setAttribute('aria-pressed','false');
 const info=lungGroupById.get(id);
 if(info)enabled.add(info.region);
 for(const b of $('layer-choices').querySelectorAll('input'))b.checked=enabled.has(b.value);
 $('lung-select').value=id||'';
 $('lung-note-name').textContent=info?.name||'Select a structure';
 $('lung-note-text').textContent=info?info.description+' · Source model ID: '+info.id+'.':'Tap a segment in 3D or select it by name. Source groups are not validated clinical segment borders.';
 show();
}
for(const structure of lungGroups){
 const option=document.createElement('option');option.value=structure.id;option.textContent=structure.name;
 $('lung-select').append(option);
}
$('lung-select').addEventListener('change',e=>select(e.target.value||null));
for(const [region,name] of Object.entries(lungRegions)){
 const label=document.createElement('label'),box=document.createElement('input');
 box.type='checkbox';box.checked=true;box.value=region;
 box.addEventListener('change',()=>{if(box.checked)enabled.add(region);else enabled.delete(region);show();});
 label.append(box,document.createTextNode(name));
 $('layer-choices').append(label);
}
$('lung-isolate').addEventListener('click',()=>{
 if(!selected){message('Select a named anatomical group before isolating.');return;}
 isolate=!isolate;$('lung-isolate').setAttribute('aria-pressed',String(isolate));show();
});
$('lung-all').addEventListener('click',()=>{
 isolate=false;selected=null;
 $('lung-select').value='';$('lung-isolate').setAttribute('aria-pressed','false');
 $('lung-note-name').textContent='Select a structure';
 $('lung-note-text').textContent='All source-defined lung segments, trachea and bronchial trees restored.';
 for(const name of Object.keys(lungRegions))enabled.add(name);
 for(const input of $('layer-choices').querySelectorAll('input'))input.checked=true;
 show();
});
function show(){
 for(const m of meshNodes){
  const info=lungGroupById.get(m.name);
  m.visible=enabled.has(info.region)&&(!isolate||selected===m.name);
  m.material.emissive?.setHex(selected===m.name?0x1f7162:0x000000);
 }
 if(model)draw();
}
function separate(){
 if(!model||!box)return;
 const scale=box.getSize(new THREE.Vector3()).length()*.30*(amount/100);
 for(const [region,group] of regions){
  const direction=offsets[region];
  group.position.set(direction[0]*scale,direction[1]*scale,direction[2]*scale);
 }
 model.updateMatrixWorld(true);
 draw();
}
function setAmount(value){
 amount=Math.min(100,Math.max(0,Number(value)||0));
 $('lung-separate').value=String(amount);
 $('lung-separate-value').textContent=amount+'%';
 stage.dataset.separation=String(amount);
 separate();
}
$('lung-separate').addEventListener('input',e=>setAmount(e.target.value));
$('lung-assemble').addEventListener('click',()=>setAmount(0));
function view(direction='front'){
 if(!camera||!model)return;
 const bounds=new THREE.Box3().setFromObject(model);
 const center=bounds.getCenter(new THREE.Vector3());
 const max=Math.max(...bounds.getSize(new THREE.Vector3()).toArray());
 const distance=Math.max(3,max/(2*Math.tan(THREE.MathUtils.degToRad(camera.fov)/2))*.85);
 const vector=direction==='back'?new THREE.Vector3(0,0,-1):
 direction==='left'?new THREE.Vector3(1,0,0):
 direction==='right'?new THREE.Vector3(-1,0,0):
 direction==='top'?new THREE.Vector3(0,1,0):new THREE.Vector3(0,0,1);
 camera.up.set(0,direction==='top'?0:1,direction==='top'?-1:0);
 camera.position.copy(center).addScaledVector(vector,distance);
 camera.lookAt(center);controls.target.copy(center);controls.update();draw();
}
for(const button of document.querySelectorAll('[data-view]'))button.addEventListener('click',()=>view(button.dataset.view));
$('lung-reset').addEventListener('click',()=>{setAmount(0);select(null);view('front');});
function draw(){if(!renderer||document.hidden)return;renderer.render(scene,camera);}
function size(){
 if(!renderer)return;
 const rect=stage.getBoundingClientRect(),w=Math.max(1,Math.round(rect.width)),h=Math.max(1,Math.round(rect.height));
 renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();draw();
}
function fallback(reason){
 stage.dataset.fallback='true';$('fallback').hidden=false;
 message('3D graphics unavailable: '+reason+'. All 20 written source-model labels and descriptions remain available.');
 $('lung-objects').textContent='Text study available for all 20 licensed model groups; graphics unavailable.';
 for(const id of ['lung-isolate','lung-separate','lung-assemble',...[]])$(id).disabled=true;
 for(const button of document.querySelectorAll('[data-view]'))button.disabled=true;
}
function startScene(){
 try{
  renderer=new THREE.WebGLRenderer({antialias:!matchMedia('(pointer:coarse)').matches,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
  renderer.setSize(1,1,false);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  stage.prepend(renderer.domElement);
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();renderer=null;fallback('WebGL context lost');});
 }catch(e){fallback('WebGL not supported');return false;}
 scene=new THREE.Scene();
 camera=new THREE.PerspectiveCamera(34,1,.05,200);
 scene.add(new THREE.HemisphereLight(0xe5f9ff,0x35435a,2.4));
 const light=new THREE.DirectionalLight(0xffeedb,3.0);light.position.set(4,6,8);scene.add(light);
 const fill=new THREE.DirectionalLight(0x96d8f7,1.2);fill.position.set(-5,0,-4);scene.add(fill);
 controls=new OrbitControls(camera,renderer.domElement);
 controls.enableDamping=false;controls.enablePan=true;controls.minDistance=.7;controls.maxDistance=40;
 controls.addEventListener('change',draw);
 resize=typeof ResizeObserver==='function'?new ResizeObserver(size):null;
 if(resize)resize.observe(stage);else window.addEventListener('resize',size);
 size();
 // Pointer selection is separate from dragging/orbiting.
 let down=null;
 renderer.domElement.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY];});
 renderer.domElement.addEventListener('pointerup',e=>{
  if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>8||!meshNodes.length)return;
  const r=renderer.domElement.getBoundingClientRect();
  const mouse=new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);
  const ray=new THREE.Raycaster();ray.setFromCamera(mouse,camera);
  const hit=ray.intersectObjects(meshNodes.filter(m=>m.visible),false)[0];
  if(hit)select(hit.object.name);
 });
 stage.addEventListener('keydown',e=>{
  if(!camera||!controls)return;
  if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){
   e.preventDefault();const dir=e.key==='ArrowLeft'?-.13:e.key==='ArrowRight'?.13:0;
   const dy=e.key==='ArrowUp'?.13:e.key==='ArrowDown'?-.13:0;
   const vector=camera.position.clone().sub(controls.target);
   vector.applyAxisAngle(new THREE.Vector3(0,1,0),dir);
   vector.applyAxisAngle(new THREE.Vector3(1,0,0),dy);
   camera.position.copy(controls.target).add(vector);camera.lookAt(controls.target);controls.update();draw();
  }
 });
 return true;
}
async function load(){
 if(!startScene())return;
 try{
  const url=new URL('../../models/slp/lungs.glb',location.href);
  const response=await fetch(url,{signal:AbortSignal.timeout(45000)});
  if(!response.ok)throw Error('Source model HTTP '+response.status);
  const bytes=await response.arrayBuffer();
  if(bytes.byteLength!==3901260)throw Error('Unexpected lung GLB size');
  const parsed=await new GLTFLoader().parseAsync(bytes,'');
  model=parsed.scene;
  model.updateMatrixWorld(true);
  model.traverse(o=>{if(o.isMesh)meshNodes.push(o);});
  verifyLungGroups(meshNodes.map(m=>m.name));
  for(const region of Object.keys(lungRegions)){
   const group=new THREE.Group();group.name='study-region-'+region;model.add(group);regions.set(region,group);
  }
  for(const mesh of meshNodes){
   regions.get(lungGroupById.get(mesh.name).region).attach(mesh);
   mesh.material=mesh.material.clone();
   // Source names stay untouched and selection is based on the verified manifest.
   mesh.material.side=THREE.DoubleSide;
   mesh.material.emissive=new THREE.Color(0);
   if(mesh.material.color)mesh.material.color.setHex(regionColors[lungGroupById.get(mesh.name).region]);
  }
  box=new THREE.Box3().setFromObject(model);
  scene.add(model);
  stage.dataset.modelStatus='ready';
  message('Licensed BodyParts3D 4.3 lung segments and airway surfaces loaded. Rotate or select a group; this is not a breathing simulation.');
  show();view('front');size();
 }catch(e){model=null;fallback(String(e?.message||'asset or decoder problem'));}
}
void load();
