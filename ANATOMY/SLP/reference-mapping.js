// The BodyParts3D 4.3 GLB groups BOTH anatomical sides for many structures.
// Never label a bilateral mesh as evidence of only the patient's left or right.
// The true vocal-fold mucosa is absent: the source only depicts vocal LIGAMENTS.
export const modelStructureNames={
 'hyoid-bone':'Hyoid bone',
 'thyroid-cartilage':'Thyroid cartilage',
 'cricoid-cartilage':'Cricoid cartilage',
 'epiglottis':'Epiglottis',
 'arytenoid-cartilages':'Paired arytenoid cartilages',
 'corniculate-cuneiform-cartilages':'Corniculate and cuneiform cartilages',
 'thyrohyoid-membrane':'Thyrohyoid membrane',
 'cricothyroid-ligament':'Median cricothyroid ligament',
 'conus-elasticus':'Conus elasticus',
 'vocal-ligaments':'Vocal ligaments (NOT entire vocal folds)',
 'epiglottic-ligaments':'Epiglottic ligaments',
 'cricothyroid-muscle':'Cricothyroid muscle',
 'posterior-crico-arytenoid':'Paired posterior cricoarytenoid muscles',
 'lateral-crico-arytenoid':'Paired lateral cricoarytenoid muscles',
 'arytenoid-muscles':'Arytenoid muscles',
 'thyro-arytenoid':'Thyroarytenoid muscles',
 'vocalis':'Vocalis muscles',
 'aryepiglottic-muscle':'Aryepiglottic muscles',
 'trachea':'Trachea',
 'thyroid-gland':'Thyroid gland'
};
const sidePairs={
 'left-arytenoid':'arytenoid-cartilages',
 'right-arytenoid':'arytenoid-cartilages',
 'left-posterior-cricoarytenoid':'posterior-crico-arytenoid',
 'right-posterior-cricoarytenoid':'posterior-crico-arytenoid',
 'left-lateral-cricoarytenoid':'lateral-crico-arytenoid',
 'right-lateral-cricoarytenoid':'lateral-crico-arytenoid',
 'left-vocal-fold':'vocal-ligaments',
 'right-vocal-fold':'vocal-ligaments'
};
export function modelIdForLesson(id){
  return Object.prototype.hasOwnProperty.call(sidePairs,id)?sidePairs[id]:
    id==='thyroid-cartilage'||id==='cricoid-cartilage'?id:null;
}
export function lessonForModelId(id){
  if(id==='thyroid-cartilage'||id==='cricoid-cartilage')return id;
  // Never choose a random left/right lesson from a bilateral model click.
  return null;
}
export function modelSelectionNote(id){
  if(id==='vocal-ligaments')
    return 'This mesh contains paired vocal ligaments; it does NOT show the complete, mucosa-covered true vocal folds.';
  if(['arytenoid-cartilages','posterior-crico-arytenoid','lateral-crico-arytenoid'].includes(id))
    return 'The selected mesh is a BILATERAL group; individual left/right structures are not independently pickable in this asset.';
  return 'This is source-derived surface geometry, not a clinically reviewed model.';
}
