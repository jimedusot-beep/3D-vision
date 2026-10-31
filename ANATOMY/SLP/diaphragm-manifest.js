// Exact 13 named GLB nodes from OrganUI diaphragm (BodyParts3D 3.0).
// Source includes reference structures; only two hemi-diaphragm nodes depict
// the main breathing muscle. This is not the same model as 4.3 lungs.
export const diaphragmParts=Object.freeze([
 {id:'right-hemidiaphragm',name:'Right hemidiaphragm',fma:'FMA13295',region:'diaphragm',
  description:'Right half of the dome-shaped respiratory muscle. Diaphragm contraction helps expand the thoracic cavity during inspiration; the static mesh does not demonstrate movement.'},
 {id:'left-hemidiaphragm',name:'Left hemidiaphragm',fma:'FMA13295',region:'diaphragm',
  description:'Left half of the main inspiratory muscle, split from the shared BodyParts3D source by OrganUI. Shape is static and not a diaphragm contraction simulation.'},
 {id:'esophagus',name:'Esophagus',fma:'FMA7131',region:'passages',
  description:'The esophagus carries swallowed food toward the stomach, passes through the diaphragm, and is an important neighboring structure in swallowing anatomy.'},
 {id:'inferior-vena-cava',name:'Inferior vena cava',fma:'FMA10951',region:'passages',
  description:'Large systemic vein passing through the diaphragm toward the heart. Shown as anatomical context, not as a respiratory muscle.'},
 {id:'descending-aorta',name:'Descending aorta',fma:'FMA3784',region:'passages',
  description:'Major artery descending through the thorax behind the diaphragm. Its position is reference anatomy, not a representation of breathing mechanics.'},
 {id:'heart',name:'Heart wall',fma:'FMA7274',region:'thoracic',
  description:'Source-derived heart wall shown for orientation near the diaphragm; this model does not show heart motion or circulation.'},
 {id:'right-lung-lower-lobe',name:'Right lung lower lobe',fma:'FMA7337',region:'thoracic',
  description:'Source-derived lower lobe from BodyParts3D 3.0. Use to orient the diaphragm; it is not registered to the separate 4.3 lungs/airways model.'},
 {id:'left-lung-lower-lobe',name:'Left lung lower lobe',fma:'FMA7371',region:'thoracic',
  description:'Source-derived lower lobe from BodyParts3D 3.0, included as an orientation landmark. Not spatially registered with the other lungs viewer.'},
 {id:'liver',name:'Liver',fma:'FMA7197',region:'abdominal',
  description:'Upper abdominal organ lying below the right diaphragm. Present for location context, not as a respiratory or voice-production structure.'},
 {id:'stomach',name:'Stomach',fma:'FMA7148',region:'abdominal',
  description:'Upper abdominal digestive organ below the diaphragm. This view is an orientation reference, not a gastric or swallowing simulator.'},
 {id:'spleen',name:'Spleen',fma:'FMA7196',region:'abdominal',
  description:'Upper abdominal organ near the left diaphragm. Included for spatial context only.'},
 {id:'right-psoas-major',name:'Right psoas major',fma:'FMA22342',region:'muscular',
  description:'Right psoas major, a posterior abdominal muscle below the diaphragm. It is a neighboring landmark and is not the primary muscle of inspiration.'},
 {id:'left-psoas-major',name:'Left psoas major',fma:'FMA22343',region:'muscular',
  description:'Left psoas major, a posterior abdominal muscle included as a landmark rather than a diaphragm or respiratory muscle.'}
]);
export const diaphragmById=new Map(diaphragmParts.map(part=>[part.id,part]));
export const diaphragmRegions=Object.freeze({
 diaphragm:'Hemidiaphragms',
 passages:'Major passages',
 thoracic:'Thoracic reference',
 abdominal:'Abdominal reference',
 muscular:'Posterior muscles'
});
export const diaphragmLicense=Object.freeze({
 version:'BodyParts3D 3.0 (20110915)',
 credit:'BodyParts3D / Anatomography © The Database Center for Life Science (DBCLS), adapted by OrganUI.',
 license:'CC BY-SA 2.1 Japan',
 url:'https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en',
 provenance:'https://github.com/organui/organui/blob/21439ee45a2efb8cd9d970e9b56405b294e3744d/apps/web/public/models/diaphragm.ATTRIBUTION.md'
});
export function verifyDiaphragmNodes(names){
 const actual=new Set(names);
 if(names.length!==13||actual.size!==13||diaphragmParts.length!==13||
    diaphragmParts.some(part=>!actual.has(part.id)||!diaphragmRegions[part.region]))
  throw Error('Diaphragm GLB must match the 13 pinned BodyParts3D source-derived group names');
 return true;
}
