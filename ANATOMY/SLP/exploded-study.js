/**
 * Educational exploded view of BodyParts3D 4.3 anatomical SURFACES.
 * Coordinates: X = subject's left, Y = superior, Z = anterior.
 * Each source group moves rigidly: no mesh deformations or new anatomy.
 * Directions are intentionally diagrammatic, NOT anatomical force vectors.
 */
export const explosionVectors=Object.freeze({
  'hyoid-bone':[0,1.15,-0.20],
  'thyroid-cartilage':[-0.7,0.40,0.85],
  'cricoid-cartilage':[0,-0.65,0.45],
  'epiglottis':[0.35,1.1,-0.75],
  'arytenoid-cartilages':[0.10,0.65,-0.95],
  'corniculate-cuneiform-cartilages':[0.85,1.12,-0.75],
  'thyrohyoid-membrane':[-1.0,0.72,0.35],
  'cricothyroid-ligament':[-0.5,-0.3,1.15],
  'conus-elasticus':[0.8,-0.10,-0.45],
  'vocal-ligaments':[0,0.30,1.15],
  'epiglottic-ligaments':[-0.85,1.0,-0.55],
  'cricothyroid-muscle':[-1.1,-0.42,0.25],
  'posterior-crico-arytenoid':[-0.8,-0.30,-1.05],
  'lateral-crico-arytenoid':[1.05,-0.20,-0.65],
  'arytenoid-muscles':[0.7,0.38,-1.1],
  'thyro-arytenoid':[1.15,0.26,0.18],
  'vocalis':[-0.95,0.18,0.45],
  'aryepiglottic-muscle':[1.1,0.80,-0.2],
  'trachea':[0,-1.35,0],
  'thyroid-gland':[0.85,-0.95,0.7]
});
const own=Object.prototype.hasOwnProperty;
export function explosionOffset(id,amount,scale){
  if(!own.call(explosionVectors,id))throw new RangeError('Unknown source geometry group');
  if(!Number.isFinite(amount)||amount<0||amount>100)
    throw new RangeError('Explosion amount must be from 0 to 100');
  if(!Number.isFinite(scale)||scale<=0)throw new RangeError('Invalid model scale');
  // Also normalize signed zero so assembled groups recover precisely [0,0,0].
  if(amount===0)return [0,0,0];
  const factor=amount/100*scale;
  return explosionVectors[id].map(n=>n*factor);
}
export function assertExplosionCoverage(ids){
  const actual=new Set(ids);
  const required=Object.keys(explosionVectors);
  if(actual.size!==required.length||required.some(id=>!actual.has(id)))
    throw new Error('Exploded study view needs exactly the 20 verified source anatomy groups');
  return true;
}
