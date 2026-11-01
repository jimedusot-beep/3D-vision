// Licensed source-mesh exploded-study layout. No procedural anatomy, cloning,
// resampling, mesh deformation or cross-model registration.
// Offsets are intentionally diagrammatic and NOT anatomical positions/forces.
export function createSourceExplosion({THREE,model,groups,layout=null}){
 if(!model||!Array.isArray(groups)||groups.length<2)throw Error('Explosion needs multiple verified source groups');
 model.updateMatrixWorld(true);
 // Only verified study meshes determine the explosion scale and center.
 // The neural source includes hundreds of unrelated, hidden meshes; using the
 // full GLB's bounds can throw its visible nerves far off-screen.
 const seen=new Set(),usedMeshes=new Set(),parts=[];
 const studyBounds=new THREE.Box3();
 for(let i=0;i<groups.length;i++){
  const {id,meshes}=groups[i];
  if(!id||seen.has(id)||!Array.isArray(meshes)||meshes.length===0)
   throw Error('Invalid or duplicate source group in exploded study');
  seen.add(id);
  const partBounds=new THREE.Box3();
  for(const mesh of meshes){
   if(!mesh?.isMesh||!mesh.parent||usedMeshes.has(mesh))
    throw Error('Explosion only supports distinct source meshes in a live model');
   let ancestor=mesh;
   while(ancestor&&ancestor!==model)ancestor=ancestor.parent;
   if(ancestor!==model)throw Error('Source group mesh is outside the loaded model: '+id);
   usedMeshes.add(mesh);
   partBounds.expandByObject(mesh);
  }
  if(partBounds.isEmpty())throw Error('Source group bounds empty: '+id);
  studyBounds.union(partBounds);
  parts.push({id,meshes,partBounds});
 }
 if(studyBounds.isEmpty())throw Error('Study-source mesh bounds unavailable');
 const center=studyBounds.getCenter(new THREE.Vector3());
 const size=studyBounds.getSize(new THREE.Vector3());
 const span=Math.max(size.x,size.y,size.z,0.0001);
 const custom=layout?layout({THREE,parts,center,span}):null;
 if(custom!==null&&!(custom instanceof Map))throw Error('Source explosion layout must return a group offset Map');
 const records=[];
 for(let i=0;i<parts.length;i++){
  const {id,meshes,partBounds}=parts[i];
  const radial=partBounds.getCenter(new THREE.Vector3()).sub(center);
  // Distinct, reproducible directions keep overlapping parts distinguishable.
  const y=1-2*(i+0.5)/parts.length;
  const phi=i*Math.PI*(3-Math.sqrt(5));
  const seed=new THREE.Vector3(Math.cos(phi)*Math.sqrt(1-y*y),y,
   Math.sin(phi)*Math.sqrt(1-y*y));
  const direction=radial.length()>span*.035
   ?radial.normalize().multiplyScalar(.75).addScaledVector(seed,.55).normalize():seed;
  const centerDistance=partBounds.getSize(new THREE.Vector3()).length();
  const distance=span*(.43+Math.min(.27,centerDistance/span*.16));
  const customVector=custom?.get(id);
  if(custom&&(customVector?.isVector3!==true||![
    customVector.x,customVector.y,customVector.z].every(Number.isFinite)))
    throw Error('Invalid source offset for '+id);
  const displacement=customVector?customVector.clone():direction.multiplyScalar(distance);
  for(const mesh of meshes)records.push({
   mesh,id,original:mesh.position.clone(),
   displacement:displacement.clone()
  });
 }
 function setAmount(value){
  if(!Number.isFinite(value)||value<0||value>100)
   throw new RangeError('Explosion must be from 0–100 percent');
  const amount=value/100;
  // Keep displacement in WORLD axes even when glTF parent nodes have transforms.
  model.updateMatrixWorld(true);
  for(const item of records){
   const parent=item.mesh.parent;
   parent.updateWorldMatrix(true,false);
   const parentLinear=new THREE.Matrix3().setFromMatrix4(parent.matrixWorld);
   const determinant=parentLinear.determinant();
   if(Math.abs(determinant)<1e-12)throw Error('Singular source node transform: '+item.id);
   const local=item.displacement.clone().applyMatrix3(parentLinear.invert())
    .multiplyScalar(amount);
   item.mesh.position.copy(item.original).add(local);
  }
  model.updateMatrixWorld(true);
  return amount;
 }
 return Object.freeze({setAmount,groupCount:groups.length,meshCount:records.length});
}
export function attachSourceExplosion({THREE,prefix,stage,model,groups,render,frame,layout=null,layoutDescription=''}){
 const $=name=>document.getElementById(prefix+'-'+name);
 const toggle=$('explode'),assemble=$('assemble'),slider=$('explode-amount');
 const output=$('explode-value'),status=$('explode-status');
 if(!toggle||!assemble||!slider||!output||!status)
  throw Error('Source explosion controls missing: '+prefix);
 const explosion=createSourceExplosion({THREE,model,groups,layout});
 let amount=0;
 function update(value){
  amount=Math.max(0,Math.min(100,Math.round(Number(value)/5)*5));
  explosion.setAmount(amount);
  stage.dataset.explosionAmount=String(amount);
  toggle.setAttribute('aria-pressed',String(amount>0));
  toggle.textContent=amount>0?'Reassemble 3D':'Explode 3D';
  assemble.disabled=amount===0;
  slider.value=String(amount);
  output.textContent=amount+'%';
  status.textContent=amount>0?
   '3D source meshes separated by '+amount+'% for study. '+(layoutDescription||'These are NOT anatomical positions.'):
   '3D source meshes assembled in their original relative positions.';
  // Keep the learner's chosen view while refitting separated mesh bounds.
  // Explicit camera presets and Reset remain the only controls that change angle.
  frame(model,'current');render();
 }
 toggle.disabled=false;slider.disabled=false;
 toggle.addEventListener('click',()=>update(amount===0?65:0));
 assemble.addEventListener('click',()=>update(0));
 slider.addEventListener('input',()=>update(Number(slider.value)));
 update(0);
 return Object.freeze({setAmount:update,getAmount:()=>amount,groupCount:explosion.groupCount});
}
