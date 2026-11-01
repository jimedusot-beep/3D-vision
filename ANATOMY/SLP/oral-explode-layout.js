// Deliberately modest world-space study layout for the 15 verified oral meshes.
// Salivary ducts move with the corresponding source-side gland family, rather
// than scattering independently in a radial starburst. Directions are merely
// educational separation, NOT anatomy registration or tissue motion.
export function createOralClusterLayout({THREE,parts,span}){
 if(!Number.isFinite(span)||span<=0||!Array.isArray(parts))
  throw Error('Oral study requires verified mesh bounds and a finite span');
 const centerX=id=>{
  const part=parts.find(p=>p.id===id);
  return part?.partBounds?.getCenter(new THREE.Vector3()).x;
 };
 // Read actual source coordinates; do not assume glTF +X is patient's right.
 const right=centerX('right-parotid-gland'),left=centerX('left-parotid-gland');
 const rightSign=Number.isFinite(right)&&Number.isFinite(left)&&right<left?-1:1;
 const result=new Map();
 for(const {id} of parts){
  if(typeof id!=='string')throw Error('Oral source identity missing');
  let xyz;
  if(id.startsWith('right-')||id.startsWith('left-')){
   const side=(id.startsWith('right-')?1:-1)*rightSign;
   if(id.includes('parotid')&&!id.includes('submandibular'))
    xyz=[side*.30,.06,0];
   else if(id.includes('submandibular'))
    xyz=[side*.23,-.12,0];
   else if(id.includes('sublingual'))
    xyz=[side*.12,.07,.06];
   else throw Error('Unrecognized oral source group: '+id);
  }else if(id==='tongue')xyz=[0,.03,.08];
  else if(id==='mandible')xyz=[0,-.16,.04];
  else if(id==='hyoid-bone')xyz=[0,-.25,-.04];
  else throw Error('Unrecognized oral source group: '+id);
  result.set(id,new THREE.Vector3(...xyz).multiplyScalar(span));
 }
 return result;
}
