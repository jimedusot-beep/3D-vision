import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {modelIdForLesson,lessonForModelId,modelStructureNames,modelSelectionNote} from './reference-mapping.js';
import catalog from './structures.json';
import {parseCommand, resolveEmbedOrigin, VERSION} from './contract.js';
import {sideX} from './orientation.js';
import {createPracticeSession,nextPracticeQuestion,ratePracticeQuestion,practiceSummary,questionsForStructure} from './practice-session.js';

const $=id=>document.getElementById(id);
const ids=new Set(catalog.structures.map(s=>s.id));
const byId=new Map(catalog.structures.map(s=>[s.id,s]));
const references=new Map(catalog.references.map(s=>[s.id,s]));
const meshes=new Map();
const stage=$('stage'), overlay=$('overlay');
let stageMode='map'; // An explanatory concept map is the honest default.
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x0e1a26);
const camera=new THREE.PerspectiveCamera(45,1,.05,100);
camera.position.set(0,1.2,5.8);
// Older devices and restricted browsers may lack WebGL; preserve the text-only study UI.
let renderer=null,orbit=null,graphicsLost=false;
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
// If a mobile GPU is suspended or resets mid-session, keep study controls usable.
renderer?.domElement.addEventListener('webglcontextlost',event=>{
  event.preventDefault();
  graphicsLost=true;
  $('status').textContent='3D graphics are temporarily unavailable; anatomy notes and recall still work.';
});
renderer?.domElement.addEventListener('webglcontextrestored',()=>{
  graphicsLost=false;
  renderState();
  scheduleFrame();
});
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
// Y is superior, Z is anterior and +X is the SUBJECT's left. An anterior view
// therefore shows anatomical left on the viewer's right. Unvalidated geometry.
add('thyroid-cartilage',new THREE.CylinderGeometry(1.18,1.0,1.85,28,1,true,-2.18,4.36),[0,.48,.1]);
add('cricoid-cartilage',new THREE.TorusGeometry(.87,.18,14,40),[0,-.72,0],[Math.PI/2,0,0]);
add('left-arytenoid',new THREE.ConeGeometry(.22,.56,12),[sideX('left',.38),-.20,-.55]);
add('right-arytenoid',new THREE.ConeGeometry(.22,.56,12),[sideX('right',.38),-.20,-.55]);
rod('left-vocal-fold',[sideX('left',.37),-.15,-.48],[sideX('left',.10),-.08,.65],.085);
rod('right-vocal-fold',[sideX('right',.37),-.15,-.48],[sideX('right',.10),-.08,.65],.085);
ellipsoid('left-posterior-cricoarytenoid',[sideX('left',.56),-.54,-.73],[.23,.45,.13]);
ellipsoid('right-posterior-cricoarytenoid',[sideX('right',.56),-.54,-.73],[.23,.45,.13]);
ellipsoid('left-lateral-cricoarytenoid',[sideX('left',.72),-.32,-.25],[.15,.32,.18]);
ellipsoid('right-lateral-cricoarytenoid',[sideX('right',.72),-.32,-.25],[.15,.32,.18]);

// BodyParts3D / Anatomography 4.3 as adapted by OrganUI, CC BY-SA 2.1 JP.
// Loaded only when the 3D view is chosen; the build verifies exact SHA-256
// and serves this 5.3 MB GLB from our own origin. No external runtime calls.
let referenceRoot=null, referenceMeshes=[], referenceSelected=null;
let referenceState='idle',referenceError='';
const expectedReference=['thyroid-cartilage','cricoid-cartilage','arytenoid-cartilages',
  'vocal-ligaments','posterior-crico-arytenoid','lateral-crico-arytenoid','epiglottis','trachea'];
function updateReferenceSelection(id) {
  referenceSelected=id;
  $('model-structure').textContent=id
    ?'Source mesh: '+modelStructureNames[id]+'. '+modelSelectionNote(id):'';
  $('model-structure').hidden=!id;
}
function applyReferenceState(){
  if(!referenceRoot)return;
  const selected=referenceSelected||modelIdForLesson(view.selected);
  const isolated=modelIdForLesson(view.isolated);
  for(const mesh of referenceMeshes){
    const id=mesh.userData.structureId||mesh.name;
    mesh.visible=!view.isolated||id===isolated;
    const faded=(selected&&id!==selected)||(view.transparent&&id!==selected);
    const material=mesh.material;
    const materials=Array.isArray(material)?material:[material];
    for(const m of materials){
      m.transparent=!!faded;
      m.opacity=faded ? 0.18 : 1;
      m.depthWrite=!faded;
      if(m.emissive)m.emissive.setHex(id===selected?0x203c32:0x000000);
      m.needsUpdate=true;
    }
  }
}
function frameRealModel(direction='front'){
  if(!referenceRoot)return;
  const bounds=new THREE.Box3().setFromObject(referenceRoot);
  const size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
  const aspect=Math.max(.4,stage.clientWidth/Math.max(1,stage.clientHeight));
  const tan=Math.tan(THREE.MathUtils.degToRad(camera.fov)*.5);
  const distance=Math.max(size.y/(2*tan*.72),size.x/(2*tan*aspect*.72),size.z*1.8,2.5);
  const d=Math.min(60,distance);
  orbit?.target.copy(center);
  camera.position.set(center.x,center.y,center.z+(direction==='back'?-d:d));
  camera.lookAt(center);
  if(orbit){
    orbit.minDistance=Math.max(.65,size.length()*.3);
    orbit.maxDistance=Math.max(20,d*4);
    orbit.update();
  }
  fit();
  scheduleFrame();
}
async function ensureReferenceModel(){
  if(!renderer||referenceState!=='idle')return;
  referenceState='loading';
  $('status').textContent='Loading the sourced anatomy model (5.3 MB)…';
  try{
    const url=new URL('../../models/slp/larynx.glb',location.href);
    const response=await fetch(url,{signal:AbortSignal.timeout(40000)});
    if(!response.ok)throw new Error('source geometry unavailable (HTTP '+response.status+')');
    const data=await response.arrayBuffer();
    if(data.byteLength!==5257920 || new DataView(data).getUint32(0,true)!==0x46546c67)
      throw new Error('source geometry has an unexpected file header or size');
    const gltf=await new GLTFLoader().parseAsync(data,'');
    const nodes=[];
    const ids=new Set();
    gltf.scene.traverse(o=>{
      if(o.isMesh){
        const id=o.userData.structureId||o.name;
        if(!Object.prototype.hasOwnProperty.call(modelStructureNames,id))
          throw new Error('Unknown source model structure '+id);
        ids.add(id);
        const old=o.material;
        o.material=Array.isArray(old)?old.map(m=>m.clone()):old.clone();
        nodes.push(o);
      }
    });
    if(expectedReference.some(id=>!ids.has(id))||ids.size!==20)
      throw new Error('Source model is missing verified anatomical groups');
    referenceRoot=gltf.scene;
    referenceMeshes=nodes;
    scene.add(referenceRoot);
    root.visible=false;
    overlay.hidden=true;
    referenceState='ready';
    updateReferenceSelection(null);
    applyReferenceState();
    frameRealModel('front');
    $('notice').textContent='Real BodyParts3D 4.3 anatomy meshes (CC BY-SA 2.1 Japan) — NOT clinically reviewed. Vocal ligaments are NOT complete true vocal folds. Source credits in Notes.';
    $('status').textContent='Licensed 3D source geometry loaded: 20 selectable groups. Expert review pending.';
  }catch(err){
    referenceState='error';
    referenceError=err?.message||'unknown load error';
    root.visible=false; // Never silently present fabricated shapes as source anatomy.
    overlay.hidden=true;
    $('status').textContent='Source anatomy unavailable: '+referenceError+'. The text study map and notes remain available.';
    $('notice').textContent='The licensed 3D model could not load. Use Study map and sourced written notes; no fake anatomy substituted.';
  }
}

const view={selected:null,isolated:null,transparent:false,labels:true};
const labels=new Map();
const structureRows=[];
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
  iso.setAttribute('aria-label','Isolate '+s.label);
  iso.dataset.isolate=s.id;
  iso.setAttribute('aria-pressed','false');
  iso.onclick=()=>isolate(s.id);
  row.append(button,iso);
  $('structures').append(row);
  structureRows.push({structure:s,row});
  const label=document.createElement('span');
  label.className='part-label';
  label.textContent=s.label;
  overlay.append(label);
  labels.set(s.id,label);
}
// Mobile navigation is local UI state, separate from the H.E.R.B.I.E. API.
const mobilePanels=['panel-structures','panel-details','panel-practice'];
function openMobilePanel(id,scroll=false) {
  if(!mobilePanels.includes(id))return;
  for(const name of mobilePanels){
    $(name).dataset.mobileActive=String(name===id);
  }
  for(const button of document.querySelectorAll('#mobile-tabs [data-mobile-target]')){
    button.setAttribute('aria-pressed',String(button.dataset.mobileTarget===id));
  }
  if(scroll&&window.matchMedia('(max-width:760px)').matches)
    $('mobile-tabs').scrollIntoView({block:'start',behavior:'auto'});
}
for(const button of document.querySelectorAll('#mobile-tabs [data-mobile-target]')){
  button.addEventListener('click',()=>openMobilePanel(button.dataset.mobileTarget));
}
$('open-details').addEventListener('click',()=>openMobilePanel('panel-details',true));
$('practice-from-detail').addEventListener('click',()=>{
  if(!$('study-selected').disabled)$('study-selected').click();
  openMobilePanel('panel-practice',true);
});
// Functional grouping, NOT an anatomical coordinate map: every link points to
// an existing sourced teaching entry, and the viewer invents no new structures.
const mapGroups=[
  {kind:'cartilage',title:'Structural framework',summary:'Supporting cartilages and attachment landmarks',ids:['thyroid-cartilage','cricoid-cartilage','left-arytenoid','right-arytenoid']},
  {kind:'fold',title:'Voiced sound source',summary:'True vocal folds; no vibration is simulated',ids:['left-vocal-fold','right-vocal-fold']},
  {kind:'muscle-open',title:'Opening the glottis',summary:'Posterior cricoarytenoid muscles abduct the folds',ids:['left-posterior-cricoarytenoid','right-posterior-cricoarytenoid']},
  {kind:'muscle-close',title:'Closing the glottis',summary:'Lateral cricoarytenoid muscles adduct the folds',ids:['left-lateral-cricoarytenoid','right-lateral-cricoarytenoid']}
];
const mapButtons=new Map();
for(const group of mapGroups){
  const card=document.createElement('article');
  card.className='map-group';
  card.dataset.kind=group.kind;
  const title=document.createElement('h3');
  title.textContent=group.title;
  const desc=document.createElement('p');
  desc.textContent=group.summary;
  const parts=document.createElement('div');
  parts.className='map-parts';
  for(const id of group.ids){
    const structure=byId.get(id);
    if(!structure)throw Error('Unknown concept-map structure '+id);
    const button=document.createElement('button');
    button.type='button';
    button.dataset.conceptId=id;
    button.textContent=structure.label;
    button.setAttribute('aria-pressed','false');
    button.addEventListener('click',()=>select(id));
    parts.append(button);
    mapButtons.set(id,button);
  }
  card.append(title,desc,parts);
  $('concept-groups').append(card);
}
// The catalog filter uses textContent only. No user-entered HTML or network requests.
$('structure-search').addEventListener('input',event=>{
  const term=event.target.value.trim().toLocaleLowerCase();
  let shown=0;
  for(const {structure,row} of structureRows) {
    const match=structure.label.toLocaleLowerCase().includes(term)||
      structure.id.includes(term);
    row.hidden=!match;
    row.style.display=match?'grid':'none'; // Existing inline grid style overrides UA [hidden].
    if(match)shown++;
  }
  $('structure-count').textContent=shown===0
    ?'No matching structures. Clear the search to show all 10.'
    :shown+' of '+structureRows.length+' structures shown.';
});
// Learning objectives and original formative exercises use source-linked text only.
const objectives=new Map(catalog.learning_objectives.map(o=>[o.id,o]));
const prompts=new Map(catalog.review_prompts.map(p=>[p.id,p]));
let practice=createPracticeSession(catalog.review_prompts); // Memory only; no storage.
const question=$('study-question'),answer=$('study-answer'),explanation=$('study-explanation');
const sources=$('study-sources'),nextReview=$('study-next'),revealReview=$('study-reveal');
const again=$('study-again'),recognized=$('study-recognized');
function appendReferenceLinks(container,ids) {
  for(const id of ids) {
    const ref=references.get(id);
    if(!ref)continue;
    const link=document.createElement('a');
    link.href=ref.url;
    link.textContent=ref.label;
    link.target='_blank';
    link.rel='noopener noreferrer';
    container.append(link);
  }
}
for(const objective of catalog.learning_objectives) {
  const li=document.createElement('li');
  const heading=document.createElement('strong');
  heading.textContent=objective.label;
  const details=document.createElement('p');
  details.textContent=objective.statement;
  li.append(heading,details);
  appendReferenceLinks(li,objective.source_ids);
  $('learning-objectives').append(li);
}
$('coverage-intro').textContent=catalog.coverage.included_meshes;
$('coverage-warning').textContent=catalog.coverage.statement;
for(const item of catalog.coverage.omitted_structures) {
  const li=document.createElement('li');
  li.textContent=item;
  $('coverage-list').append(li);
}
function updatePracticeProgress() {
  const s=practiceSummary(practice);
  $('study-progress').textContent='Self-rated practice checks: '+s.checks+
    ' (recalled: '+s.recognized+', review again: '+s.reviewAgain+
    '). Queue remaining: '+s.remaining+'. Round '+s.round+
    '. This is not a grade or validated mastery score; nothing is saved.';
}
nextReview.onclick=()=>{
  const id=nextPracticeQuestion(practice);
  const prompt=prompts.get(id);
  const objective=objectives.get(prompt.objective_id);
  $('study-objective').textContent='Learning objective: '+objective.label+
    ' · Question type: '+prompt.level+'.';
  question.textContent='Question '+(catalog.review_prompts.findIndex(x=>x.id===id)+1)+
    ' of '+catalog.review_prompts.length+': '+prompt.question;
  answer.hidden=true;answer.textContent='';
  explanation.hidden=true;explanation.textContent='';
  sources.hidden=true;sources.replaceChildren();
  revealReview.disabled=false;
  again.disabled=true;recognized.disabled=true;
  updatePracticeProgress();
};
revealReview.onclick=()=>{
  if(!practice.currentId)return;
  const prompt=prompts.get(practice.currentId);
  answer.textContent=prompt.answer;
  answer.hidden=false;
  explanation.textContent='Why: '+prompt.explanation;
  explanation.hidden=false;
  sources.replaceChildren();
  const caption=document.createElement('strong');
  caption.textContent='Read the supporting references:';
  sources.append(caption);
  appendReferenceLinks(sources,prompt.source_ids);
  sources.hidden=false;
  if(!practice.currentRated){again.disabled=false;recognized.disabled=false;}
};
for(const [button,rating] of [[again,'again'],[recognized,'recognized']]) {
  button.onclick=()=>{
    if(!practice.currentId||answer.hidden)return;
    if(ratePracticeQuestion(practice,practice.currentId,rating)) {
      again.disabled=true;recognized.disabled=true;
      updatePracticeProgress();
    }
  };
}
updatePracticeProgress();
function restartPractice(items,scope) {
  if(items.length===0)return;
  practice=createPracticeSession(items);
  $('study-scope').textContent=scope;
  $('study-objective').textContent='Select “Next question” to start this set.';
  question.textContent='Choose “Next question” to begin.';
  answer.hidden=true;answer.textContent='';
  explanation.hidden=true;explanation.textContent='';
  sources.hidden=true;sources.replaceChildren();
  revealReview.disabled=true;
  again.disabled=true;recognized.disabled=true;
  updatePracticeProgress();
}
$('study-reset').onclick=()=>restartPractice(catalog.review_prompts,
  'Practicing all '+catalog.review_prompts.length+' source-linked questions.');
$('study-selected').onclick=()=>{
  const info=byId.get(view.selected);
  if(!info)return;
  const subset=questionsForStructure(catalog.review_prompts,info.id);
  if(subset.length===0)return;
  restartPractice(subset,'Practicing '+subset.length+' question(s) about '+
    info.label+' (paired left/right structures share concepts).');
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
  for(const [id,button] of mapButtons)
    button.setAttribute('aria-pressed',String(id===view.selected));
  $('transparent').checked=view.transparent;
  $('labels').checked=view.labels;
  const info=byId.get(view.selected);
  const related=info?questionsForStructure(catalog.review_prompts,info.id):[];
  $('selection-ribbon').hidden=!info;
  $('selection-name').textContent=info?'Selected: '+info.label:'';
  $('practice-from-detail').disabled=related.length===0;
  $('study-selected').disabled=related.length===0;
  $('study-selected').title=info
    ?related.length+' question(s) about '+info.label
    :'Select a structure to enable focused practice';
  applyReferenceState();
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
    const provenance=document.createElement('details');
    provenance.className='candidate-provenance';
    const summary=document.createElement('summary');
    summary.textContent='Possible open-data model (NOT imported or validated)';
    provenance.append(summary);
    const note=document.createElement('p');
    const candidate=info.candidate_model;
    if(candidate.status==='indexed_not_imported_unvalidated') {
      note.textContent='BodyParts3D official index lists "'+candidate.source_label+
        '" ('+candidate.concept_id+', '+candidate.representation_id+
        '). This is an index match only: NO source mesh is loaded or scientifically reviewed.';
    } else {
      note.textContent='No exact complete true vocal-fold mesh has been matched in this candidate index. A vocal ligament is NOT equivalent to an entire true vocal fold.';
    }
    provenance.append(note);
    const indexLink=document.createElement('a');
    indexLink.href=catalog.mesh_candidate_catalog.index_url;
    indexLink.target='_blank';
    indexLink.rel='noopener noreferrer';
    indexLink.textContent='View official source index';
    provenance.append(indexLink);
    detail.append(provenance);
  } else {
    detail.textContent='Select a structure to learn its name and function. All model shapes are conceptual placeholders.';
  }
  $('status').textContent=!renderer
    ?'3D view unavailable; text-based anatomy study is ready.'
    :stageMode==='three'&&referenceState==='loading'?'Loading licensed BodyParts3D larynx surface geometry…'
    :stageMode==='three'&&referenceState==='error'?'Licensed model unavailable: '+referenceError+'. Use the study map and notes.'
    :stageMode==='three'&&referenceState==='ready'?(info?'Selected '+info.label+'. Bilateral source geometry may represent both sides.':'BodyParts3D 4.3 anatomy surfaces loaded. Independent review pending.')
    :graphicsLost?'3D graphics are temporarily unavailable; anatomy notes and recall still work.'
    :info?'Selected '+info.label+'. Referenced text; unvalidated geometry.'
    :stageMode==='map'?'Structure-and-function study map ready. No spatial or clinical claims.':'Unvalidated 3D sketch ready.';
}
function select(id){updateReferenceSelection(null);view.selected=id;view.isolated=null;renderState();}
function isolate(id){updateReferenceSelection(null);view.selected=id;view.isolated=view.isolated===id?null:id;renderState();}
function setIsolated(id){updateReferenceSelection(null);view.selected=id;view.isolated=id;renderState();}
function reset(){updateReferenceSelection(null);view.selected=null;view.isolated=null;view.transparent=false;view.labels=true;root.rotation.set(0,0,0);if(referenceRoot)frameRealModel('front');else{camera.position.set(0,1.2,5.8);if(orbit){orbit.target.set(0,0,0);orbit.update();}}renderState();}
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
  const targets=referenceRoot?referenceMeshes:[...meshes.values()];
  const hit=raycaster.intersectObjects(targets,false).find(x=>x.object.visible);
  if(hit){
    if(referenceRoot){
      const id=hit.object.userData.structureId||hit.object.name;
      const lesson=lessonForModelId(id);
      if(lesson)select(lesson);
      else{
        view.selected=null;view.isolated=null;
        updateReferenceSelection(id);renderState();
      }
    }else select(hit.object.userData.structureId);
  }
});
function setCameraDistance(factor) {
  // Match OrbitControls limits for keyboard zoom, preventing near-plane clipping.
  const target=orbit?orbit.target:new THREE.Vector3();
  const offset=camera.position.clone().sub(target);
  const distance=THREE.MathUtils.clamp(offset.length()*factor,orbit?.minDistance||2.5,orbit?.maxDistance||16);
  if(offset.lengthSq()===0)return;
  camera.position.copy(target).add(offset.normalize().multiplyScalar(distance));
  camera.updateProjectionMatrix();
  orbit?.update();
}
stage.addEventListener('keydown',e=>{
  if(stageMode!=='three')return;
  const map={ArrowLeft:[0,-.12],ArrowRight:[0,.12],ArrowUp:[-.12,0],ArrowDown:[.12,0]};
  if(map[e.key]){e.preventDefault();root.rotation.x+=map[e.key][0];root.rotation.y+=map[e.key][1];}
  else if(e.key==='+'||e.key==='='){e.preventDefault();setCameraDistance(.9);}
  else if(e.key==='-'){e.preventDefault();setCameraDistance(1.1);}
  else if(e.key==='Escape'){e.preventDefault();reset();}
});
const query=new URLSearchParams(location.search);
if(ids.has(query.get('select')))select(query.get('select'));else renderState();
// Explicit opt-in is limited to a canonical HTTPS or loopback origin.
// No private study data is sent across the public, read-only host contract.
const allowedOrigin=resolveEmbedOrigin(query.get('embedOrigin'),location.origin);
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
  // The hidden canvas must not resize while the mobile document-flow map is active.
  if(stageMode!=='three'||!renderer)return;
  const w=stage.clientWidth,h=stage.clientHeight;
  if(w<1||h<1)return;
  camera.aspect=w/h;camera.updateProjectionMatrix();
  renderer.setSize(w,h,false);
}
// ResizeObserver is absent in some recovered-phone browsers.
if(typeof ResizeObserver==='function')new ResizeObserver(fit).observe(stage);
else window.addEventListener('resize',fit);
const overviewLabels=new Set(['thyroid-cartilage','cricoid-cartilage','left-vocal-fold','right-vocal-fold']);
function drawLabels(){
  // On narrow screens an overview has no floating tags: their overlap
  // obscures the model and the selected-structure ribbon already names it.
  // Only the selected label is allowed on mobile.
  const narrow=window.matchMedia('(max-width:760px)').matches;
  for(const [id,label] of labels) {
    const m=meshes.get(id);
    label.hidden=referenceRoot!==null||stageMode!=='three'||!view.labels||!m.visible||
      (view.selected ? view.selected!==id : narrow||!overviewLabels.has(id));
    if(label.hidden)continue;
    const point=m.getWorldPosition(new THREE.Vector3()).project(camera);
    label.hidden=point.z < -1||point.z>1||Math.abs(point.x)>1||Math.abs(point.y)>1;
    label.style.left=((point.x+1)*.5*stage.clientWidth)+'px';
    label.style.top=((1-point.y)*.5*stage.clientHeight)+'px';
  }
}
// A hidden tab must not continually consume GPU/CPU or burn phone battery.
let frameScheduled=false;
function scheduleFrame(){
  if(stageMode!=='three'||!renderer||graphicsLost||document.hidden||frameScheduled)return;
  frameScheduled=true;
  requestAnimationFrame(animate);
}
function animate(){
  frameScheduled=false;
  if(stageMode!=='three'||!renderer||graphicsLost||document.hidden)return;
  orbit?.update();
  root.updateMatrixWorld(true);
  drawLabels();
  renderer.render(scene,camera);
  scheduleFrame();
}
document.addEventListener('visibilitychange',()=>{
  if(!document.hidden){fit();scheduleFrame();}
});
function presetCamera(direction){
  if(!renderer)return;
  if(referenceRoot){frameRealModel(direction);return;}
  root.rotation.set(0,0,0);
  camera.position.set(0,1.2,direction==='back'?-5.8:5.8);
  camera.up.set(0,1,0);
  orbit?.target.set(0,0,0);
  orbit?.update();
  fit();
  scheduleFrame();
}
function setPresentation(mode){
  if(mode!=='map'&&mode!=='three')return;
  if(mode==='three'&&(!renderer||graphicsLost))return;
  stageMode=mode;
  stage.classList.toggle('mode-map',mode==='map');
  stage.classList.toggle('mode-three',mode==='three');
  $('mode-map').setAttribute('aria-pressed',String(mode==='map'));
  $('mode-three').setAttribute('aria-pressed',String(mode==='three'));
  $('mode-three').disabled=!renderer;
  $('three-view-controls').hidden=mode!=='three';
  stage.setAttribute('aria-label',mode==='map'
    ?'Interactive structure-and-function map; choose a labeled concept to read its sourced explanation'
    :'Unvalidated 3D larynx sketch; drag to rotate, pinch or scroll to zoom');
  if(mode==='three')stage.setAttribute('tabindex','0');
  else stage.removeAttribute('tabindex');
  $('notice').textContent=mode==='map'
    ?'Concepts grouped by function, NOT anatomical position. No measurements or clinical use.'
    :referenceState==='ready'?'BodyParts3D 4.3 surface meshes, CC BY-SA 2.1 JP. Not clinically reviewed. Vocal ligaments are not complete folds.'
    :'Preparing source anatomy. No clinical use; original 3D primitives are not a medical reconstruction.';
  if(mode==='three'){
    root.visible=false;overlay.hidden=true;
    fit();scheduleFrame();void ensureReferenceModel();
  }
  renderState();
}
$('mode-map').addEventListener('click',()=>setPresentation('map'));
$('mode-three').addEventListener('click',()=>setPresentation('three'));
$('camera-front').addEventListener('click',()=>presetCamera('front'));
$('camera-back').addEventListener('click',()=>presetCamera('back'));
fit();
setPresentation('map');
