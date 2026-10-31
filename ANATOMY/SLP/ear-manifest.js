// Original Z-Anatomy right-ear GLB nodes, selected from OrganUI ear-3d,
// commit 40ace7ed45cdbf604adda889e5db720ee6b1ce98.
// 31 source FBX objects grouped into sixteen runtime meshes.
export const earParts=Object.freeze([
  {
    "id": "helix",
    "name": "Helix",
    "region": "outer",
    "description": "The helix is the curved outer rim of the auricle. The ear canal is absent from this source model.",
    "sourceObjectCount": 3
  },
  {
    "id": "antihelix",
    "name": "Antihelix",
    "region": "outer",
    "description": "The antihelix forms an inner ridge of the outer ear and is not one of the middle-ear ossicles.",
    "sourceObjectCount": 2
  },
  {
    "id": "scapha-and-fossa",
    "name": "Scapha and triangular fossa",
    "region": "outer",
    "description": "Scapha and triangular fossa are surface depressions of the pinna, grouped in one selection.",
    "sourceObjectCount": 2
  },
  {
    "id": "concha",
    "name": "Concha",
    "region": "outer",
    "description": "The concha is the bowl of the pinna approaching the ear-canal entrance. The canal itself is not modeled.",
    "sourceObjectCount": 3
  },
  {
    "id": "tragus",
    "name": "Tragus",
    "region": "outer",
    "description": "The tragus and neighboring ear landmarks form a source group near the external auditory meatus.",
    "sourceObjectCount": 4
  },
  {
    "id": "lobule",
    "name": "Lobule",
    "region": "outer",
    "description": "The lobule forms the soft lower part of the outer ear; it is not part of the ossicular chain.",
    "sourceObjectCount": 1
  },
  {
    "id": "back-of-auricle",
    "name": "Posterior auricle",
    "region": "outer",
    "description": "The posterior auricle group combines landmarks on the back of the right external ear.",
    "sourceObjectCount": 5
  },
  {
    "id": "tympanic-membrane",
    "name": "Tympanic membrane (eardrum)",
    "region": "middle",
    "description": "The eardrum separates outer and middle ear. Sound waves can make it vibrate, but this model is static.",
    "sourceObjectCount": 1
  },
  {
    "id": "malleus",
    "name": "Malleus",
    "region": "middle",
    "description": "The malleus is the first ossicle connected to the tympanic membrane and transfers its movement to the incus.",
    "sourceObjectCount": 1
  },
  {
    "id": "incus",
    "name": "Incus",
    "region": "middle",
    "description": "The incus is the second ossicle transmitting mechanical vibration toward the stapes; motion is not simulated.",
    "sourceObjectCount": 1
  },
  {
    "id": "stapes",
    "name": "Stapes",
    "region": "middle",
    "description": "The stapes transmits movement to the oval window of the cochlea; the oval window is not separately modeled.",
    "sourceObjectCount": 1
  },
  {
    "id": "auditory-tube",
    "name": "Auditory (Eustachian) tube",
    "region": "middle",
    "description": "The auditory or Eustachian tube helps regulate middle-ear pressure; it is not the sound-conduction route to cochlea.",
    "sourceObjectCount": 1
  },
  {
    "id": "chorda-tympani",
    "name": "Chorda Tympani",
    "region": "nerves",
    "description": "The chorda tympani is a facial-nerve branch traversing the middle ear, related to taste and secretion, not hearing transduction.",
    "sourceObjectCount": 1
  },
  {
    "id": "cochlea",
    "name": "Cochlea",
    "region": "inner",
    "description": "The cochlea houses sensory hearing transduction. Hair cells, basilar membrane and fluid motion are not modeled.",
    "sourceObjectCount": 1
  },
  {
    "id": "vestibule",
    "name": "Vestibule",
    "region": "inner",
    "description": "The vestibule forms part of the balance apparatus, not the cochlear sound pathway; its mesh is a grouped landmark.",
    "sourceObjectCount": 1
  },
  {
    "id": "vestibulocochlear-nerve",
    "name": "Vestibulocochlear nerve (CN VIII)",
    "region": "nerves",
    "description": "Cranial nerve VIII carries hearing and balance information. This is a composite source group, not a full brain pathway.",
    "sourceObjectCount": 3
  }
]);
export const earById=new Map(earParts.map(part=>[part.id,part]));
export const earRegions=Object.freeze({
 outer:'External ear landmarks',
 middle:'Middle ear and pressure equalization',
 inner:'Inner ear hearing and balance',
 nerves:'Selected cranial nerves'
});
export const earLicense=Object.freeze({
 credit:'Z-Anatomy (Gauthier Kervyn, Lluís Vinent Juanico and contributors), based in part on BodyParts3D / Anatomography © DBCLS. Adapted by OrganUI.',
 license:'CC BY-SA 4.0',
 licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',
 provenance:'https://github.com/organui/ear-3d/blob/40ace7ed45cdbf604adda889e5db720ee6b1ce98/docs/MODEL_PROVENANCE.md'
});
export const soundJourney=Object.freeze([
 {id:'helix',note:'Outer ear shapes incoming sound. The ear canal is missing from this model, although sound reaches the eardrum through it.'},
 {id:'tympanic-membrane',note:'Eardrum responds to sound pressure by vibrating; the 3D surface is static.'},
 {id:'malleus',note:'Malleus: the first mechanical middle-ear ossicle.'},
 {id:'incus',note:'Incus: conveys movement toward the stapes.'},
 {id:'stapes',note:'Stapes: transfers movement toward the oval window, which is not modeled as a separate structure.'},
 {id:'cochlea',note:'Cochlea: sensory hearing transduction occurs here, but hair cells, fluids and basilar membrane are not shown.'},
 {id:'vestibulocochlear-nerve',note:'CN VIII carries auditory and vestibular signals. This grouped nerve is not a complete neural pathway.'}
]);
export function verifyEarNodes(names){
 const ids=new Set(names);
 if(names.length!==16||ids.size!==16||earParts.length!==16||
 earParts.some(part=>!ids.has(part.id)||!earRegions[part.region]))
  throw Error('Right-ear model must contain exactly sixteen original Z-Anatomy groups');
 return true;
}
