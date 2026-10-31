import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import catalog from './structures.json';
import {parseCommand, VERSION} from './contract.js';

const $=id=>document.getElementById(id);
const ids=new Set(catalog.structures.map(s=>s.id));
const byId=new Map(catalog.structures.map(s=>[s.id,s]));
const references=new Map(catalog.references.map(s=>[s.id,s]));
const meshes=new Map();
const stage=$('stage'), overlay=$('overlay');
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x0e1a26);
const camera=new THREE.PerspectiveCamera(45,1,.05,100);
camera.position.set(4,3,7);
// Older devices and restricted browsers may lack WebGL; preserve the text-only study UI.
let renderer=null,orbit=null;
try {
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  stage.prepend(renderer.domElement);
  orbit=new OrbitControls(camera,renderer.domElement);
  orbit.enableDamping=true;
  orbit.minDistance=2.5;
  orbit.maxDistance=16;
  orbit.target.set(0,0,0);
} catch {
  renderer?.dispose();
  renderer=null;
  const fallback=document.createElement('p');
  fallback.id='webgl-fallback';
  fallback.setAttribute('role','alert');
  fallback.textContent='3D graphics are unavailable on this browser. Structure descriptions, references and study questions still work below.';
  stage.setAttribute('aria-label','3D visualization unavailable; accessible anatomy text and study controls are provided in the adjacent panel.');
  stage.removeAttribute('tabindex');
  stage.prepend(fallback);
}
scene.add(new THREE.HemisphereLight(0xffffff,0x435266,2.4));
const directional=new THREE.DirectionalLight(0xffffff,2.2);
directional.position.set(2,5,5);
scene.add(directional);
const root=new THREE.Group();
scene.add(root);
const palette={cartilage:0x6fbacb,fold:0xe6b2a8,muscle:0xd88d8a};

function add(id,geometry,position,rotation) {
  const data=byId.get(id);
  const material=new THREE.MeshStandardMaterial({color:palette[data.kind],roughness:.48,metalness:.04,transparent:true});
  const mesh=new THREE.Mesh(geometry,material);
  mesh.name=data.label;
  mesh.userData.structureId=id;
  mesh.position.set(...position);
  if(rotation)mesh.rotation.set(...rotation);
  root.add(mesh);
  meshes.set(id,mesh);
}
function rod(id,start,end,radius) {
  const a=new THREE.Vector3(...start),b=new THREE.Vector3(...end);
  const d=new THREE.Vector3().subVectors(b,a);
  add(id,new THREE.CylinderGeometry(radius,radius,d.length(),12),a.clone().add(b).multiplyScalar(.5).toArray());
  meshes.get(id).quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());
}
function ellipsoid(id,position,scale) {
  add(id,new THREE.SphereGeometry(1,16,12),position);
  meshes.get(id).scale.set(...scale);
}
// Primitive placeholders: NOT scans, actual dimensions, or validated anatomical geometry.
// Y is vertical, Z anterior. Geometry is deliberately schematic.
add('thyroid-cartilage',new THREE.CylinderGeometry(1.18,1.0,1.85,28,1,true,-2.18,4.36),[0,.48,.1]);
add('cricoid-cartilage',new THREE.TorusGeometry(.87,.18,14,40),[0,-.72,0],[Math.PI/2,0,0]);
add('left-arytenoid',new THREE.ConeGeometry(.22,.56,12),[-.38,-.20,-.55]);
add('right-arytenoid',new THREE.ConeGeometry(.22,.56,12),[.38,-.20,-.55]);
rod('left-vocal-fold',[-.37,-.15,-.48],[-.10,-.08,.65],.085);
rod('right-vocal-fold',[.37,-.15,-.48],[.10,-.08,.65],.085);
ellipsoid('left-posterior-cricoarytenoid',[-.56,-.54,-.73],[.23,.45,.13]);
ellipsoid('right-posterior-cricoarytenoid',[.56,-.54,-.73],[.23,.45,.13]);
ellipsoid('left-lateral-cricoarytenoid',[-.72,-.32,-.25],[.15,.32,.18]);
ellipsoid('right-lateral-cricoarytenoid',[.72,-.32,-.25],[.15,.32,.18]);

const view={selected:null,isolated:null,transparent:false,labels:true};
const labels=new Map();
for(const s of catalog.structures) {
  const row=document.createElement('div');
  row.style.display='grid';
  row.style.gridTemplateColumns='1fr auto';
  row.style.gap='.3rem';
  const button=document.createElement('button');
  button.type='button';
  button.textContent=s.label;
  button.dataset.id=s.id;
  button.setAttribute('aria-pressed','false');
  button.onclick=()=>select(s.id);
  const iso=document.createElement('button');
  iso.type='button';
  iso.textContent='Isolate';
  iso.title='Show only '+s.label;
  iso.dataset.isolate=s.id;
  iso.setAttribute('aria-pressed','false');
  iso.onclick=()=>isolate(s.id);
  row.append(button,iso);
  $('structures').append(row);
  const label=document.createElement('span');
  label.className='part-label';
  label.textContent=s.label;
  overlay.append(label);
  labels.set(s.id,label);
}
// Referenced text-only study exercise: this does not evaluate anatomical geometry.
const review={index:-1};
const question=$('study-question'),answer=$('study-answer'),sources=$('study-sources');
const nextReview=$('study-next'),revealReview=$('study-reveal');
$('coverage-intro').textContent=catalog.coverage.included_meshes;
$('coverage-warning').textContent=catalog.coverage.statement;
for(const item of catalog.coverage.omitted_structures) {
  const li=document.createElement('li');
  li.textContent=item;
  $('coverage-list').append(li);
}
nextReview.onclick=()=>{
  review.index=(review.index+1)%catalog.review_prompts.length;
  const prompt=catalog.review_prompts[review.index];
  question.textContent='Question '+(review.index+1)+' of '+catalog.review_prompts.length+': '+prompt.question;
  answer.hidden=true; answer.textContent='';
  sources.hidden=true; sources.replaceChildren();
  revealReview.disabled=false;
};
revealReview.onclick=()=>{
  if(review.index<0)return;
  const prompt=catalog.review_prompts[review.index];
  answer.textContent=prompt.answer;
  answer.hidden=false;
  sources.replaceChildren();
  const caption=document.createElement('strong');
  caption.textContent='Read the supporting references:';
  sources.append(caption);
  for(const id of prompt.source_ids) {
    const ref=references.get(id);
    if(!ref)continue;
    const link=document.createElement('a');
    link.href=ref.url; link.textContent=ref.label; link.target='_blank'; link.rel='noopener noreferrer';
    sources.append(link);
  }
  sources.hidden=false;
};
function renderState() {
  for(const [id,m] of meshes) {
    m.visible=!view.isolated || view.isolated===id;
    m.material.opacity=view.transparent && id!==view.selected?.2:.9;
    m.material.depthWrite=!(view.transparent && id!==view.selected);
    m.material.emissive.setHex(id===view.selected?0x325a53:0x000000);
  }
  for(const b of $('structures').querySelectorAll('button[data-id]'))
    b.setAttribute('aria-pressed',String(b.dataset.id===view.selected));
  for(const b of $('structures').querySelectorAll('button[data-isolate]'))
    b.setAttribute('aria-pressed',String(b.dataset.isolate===view.isolated));
  $('transparent').checked=view.transparent;
  $('labels').checked=view.labels;
  const info=byId.get(view.selected);
  const detail=$('detail');
  detail.replaceChildren();
  if(info) {
    const heading=document.createElement('strong');
    heading.textContent=info.label;
    const description=document.createElement('p');
    description.textContent=info.description;
    const caveat=document.createElement('p');
    caveat.className='evidence-note';
    caveat.textContent='The references support the written anatomy note, NOT the approximate 3D shape or its relative placement.';
    const cited=document.createElement('div');
    cited.className='evidence-links';
    const intro=document.createElement('strong');
    intro.textContent='Read the references: ';
    cited.append(intro);
    for(const id of info.source_ids) {
      const ref=references.get(id);
      if(!ref)continue;
      const link=document.createElement('a');
      link.href=ref.url;
      link.textContent=ref.label;
      link.target='_blank';
      link.rel='noopener noreferrer';
      cited.append(link);
    }
    detail.append(heading,description,caveat,cited);
  } else {
    detail.textContent='Select a structure to learn its name and function. All model shapes are conceptual placeholders.';
  }
  $('status').textContent=!renderer
    ?'3D view unavailable; text-based anatomy study is ready.'
    :info?'Selected '+info.label+'. Referenced text; unvalidated geometry.':'Illustrative larynx scene ready.';
}
function select(id){view.selected=id;view.isolated=null;renderState();}
function isolate(id){view.selected=id;view.isolated=view.isolated===id?null:id;renderState();}
function setIsolated(id){view.selected=id;view.isolated=id;renderState();}
function reset(){view.selected=null;view.isolated=null;view.transparent=false;view.labels=true;root.rotation.set(0,0,0);camera.position.set(4,3,7);if(orbit){orbit.target.set(0,0,0);orbit.update();}renderState();}
$('show-all').onclick=()=>{view.isolated=null;renderState();};
$('reset').onclick=reset;
$('transparent').onchange=e=>{view.transparent=e.target.checked;renderState();};
$('labels').onchange=e=>{view.labels=e.target.checked;renderState();};
const raycaster=new THREE.Raycaster(),mouse=new THREE.Vector2();
// An orbit drag must not also select an accidental structure when the pointer is released.
let pointerStart=null,dragged=false;
renderer?.domElement.addEventListener('pointerdown',e=>{
  pointerStart={x:e.clientX,y:e.clientY};
  dragged=false;
});
renderer?.domElement.addEventListener('pointermove',e=>{
  if(pointerStart && Math.hypot(e.clientX-pointerStart.x,e.clientY-pointerStart.y)>6)dragged=true;
});
renderer?.domElement.addEventListener('pointercancel',()=>{pointerStart=null;dragged=false;});
renderer?.domElement.addEventListener('click',e=>{
  if(dragged){dragged=false;pointerStart=null;return;}
  pointerStart=null;
  const bounds=renderer.domElement.getBoundingClientRect();
  mouse.set((e.clientX-bounds.left)/bounds.width*2-1,-((e.clientY-bounds.top)/bounds.height*2-1));
  raycaster.setFromCamera(mouse,camera);
  const hit=raycaster.intersectObjects([...meshes.values()],false).find(x=>x.object.visible);
  if(hit) select(hit.object.userData.structureId);
});
function setCameraDistance(factor) {
  // Match OrbitControls limits for keyboard zoom, preventing near-plane clipping.
  const target=orbit?orbit.target:new THREE.Vector3();
  const offset=camera.position.clone().sub(target);
  const distance=THREE.MathUtils.clamp(offset.length()*factor,2.5,16);
  if(offset.lengthSq()===0)return;
  camera.position.copy(target).add(offset.normalize().multiplyScalar(distance));
  camera.updateProjectionMatrix();
  orbit?.update();
}
stage.addEventListener('keydown',e=>{
  const map={ArrowLeft:[0,-.12],ArrowRight:[0,.12],ArrowUp:[-.12,0],ArrowDown:[.12,0]};
  if(map[e.key]){e.preventDefault();root.rotation.x+=map[e.key][0];root.rotation.y+=map[e.key][1];}
  else if(e.key==='+'||e.key==='='){e.preventDefault();setCameraDistance(.9);}
  else if(e.key==='-'){e.preventDefault();setCameraDistance(1.1);}
  else if(e.key==='Escape'){e.preventDefault();reset();}
});
const query=new URLSearchParams(location.search);
if(ids.has(query.get('select')))select(query.get('select'));else renderState();
let allowedOrigin=location.origin;
try {
  if(query.has('embedOrigin')) {
    const url=new URL(query.get('embedOrigin'));
    if(url.protocol==='https:'||(url.protocol==='http:'&&url.hostname==='localhost')) allowedOrigin=url.origin;
  }
}catch{ /* Invalid origins keep same-origin policy */ }
function receive(event) {
  if(event.source!==window.parent||event.origin!==allowedOrigin)return;
  const c=parseCommand(event.data,ids);
  if(c.ok){
    if(c.action==='select')select(c.structureId);
    if(c.action==='isolate')setIsolated(c.structureId);
    if(c.action==='transparency'){view.transparent=c.enabled;renderState();}
    if(c.action==='labels'){view.labels=c.enabled;renderState();}
    if(c.action==='reset')reset();
    if(c.action==='open'&&c.structureId)select(c.structureId);
  }
  event.source.postMessage({source:'3d-vision-anatomy',version:VERSION,requestId:c.requestId||null,ok:c.ok,reason:c.reason||null,scene:'slp-larynx-v1',selected:view.selected,isolated:view.isolated},event.origin);
}
window.addEventListener('message',receive);
if(window.parent!==window)window.parent.postMessage({source:'3d-vision-anatomy',version:VERSION,ready:true,scene:'slp-larynx-v1'},allowedOrigin);
function fit(){
  if(!renderer)return;
  const w=stage.clientWidth,h=stage.clientHeight;
  if(w<1||h<1)return;
  camera.aspect=w/h;camera.updateProjectionMatrix();
  renderer.setSize(w,h,false);
}
new ResizeObserver(fit).observe(stage);
function drawLabels(){
  for(const [id,label] of labels) {
    const m=meshes.get(id);
    label.hidden=!view.labels||!m.visible;
    if(label.hidden)continue;
    const point=m.getWorldPosition(new THREE.Vector3()).project(camera);
    label.hidden=point.z < -1||point.z>1||Math.abs(point.x)>1||Math.abs(point.y)>1;
    label.style.left=((point.x+1)*.5*stage.clientWidth)+'px';
    label.style.top=((1-point.y)*.5*stage.clientHeight)+'px';
  }
}
function animate(){
  if(!renderer)return;
  requestAnimationFrame(animate);
  orbit?.update();
  root.updateMatrixWorld(true);
  drawLabels();
  renderer.render(scene,camera);
}
fit();animate();
