// Exact BodyParts3D 4.3 mesh-node IDs from the pinned OrganUI pharynx GLB.
// 31 selected source meshes grouped into 20 nodes. Paired source parts are
// grouped; cannot be individually isolated without separate source models.
export const pharynxParts=Object.freeze([
  {
    "id": "superior-constrictor",
    "name": "Paired superior pharyngeal constrictors",
    "fma": "FMA46621",
    "concepts": [
      "FMA46631",
      "FMA46632"
    ],
    "region": "wall",
    "description": "Superior pharyngeal constrictor muscle group. Contributes to pharyngeal wall contraction during swallowing; no muscle movement is animated."
  },
  {
    "id": "middle-constrictor",
    "name": "Paired middle pharyngeal constrictors",
    "fma": "FMA46622",
    "concepts": [
      "FMA46633",
      "FMA46634"
    ],
    "region": "wall",
    "description": "Middle pharyngeal constrictor muscle group. Part of the muscular pharynx used in swallowing. Left and right surfaces are grouped in this model."
  },
  {
    "id": "inferior-constrictor",
    "name": "Paired inferior pharyngeal constrictors",
    "fma": "FMA46623",
    "concepts": [
      "FMA46635",
      "FMA46636"
    ],
    "region": "wall",
    "description": "Inferior pharyngeal constrictor group near the lower pharynx. Its subdivisions cannot be independently controlled in this grouped surface."
  },
  {
    "id": "pharyngeal-raphe",
    "name": "pharyngeal raphe",
    "fma": "FMA55077",
    "concepts": [
      "FMA55077"
    ],
    "region": "wall",
    "description": "Median fibrous pharyngeal raphe, the posterior attachment site for pharyngeal constrictor muscles."
  },
  {
    "id": "stylopharyngeus",
    "name": "Paired stylopharyngeus",
    "fma": "FMA46664",
    "concepts": [
      "FMA46667",
      "FMA46668"
    ],
    "region": "elevators",
    "description": "Stylopharyngeus muscle group. Helps elevate the pharynx during swallowing; left and right are a single selection."
  },
  {
    "id": "palatopharyngeus",
    "name": "Paired palatopharyngeus",
    "fma": "FMA46666",
    "concepts": [
      "FMA46671",
      "FMA46672"
    ],
    "region": "elevators",
    "description": "Palatopharyngeus muscle group associated with pharyngeal elevation and soft-palate function. This is static geometry."
  },
  {
    "id": "salpingopharyngeus",
    "name": "Paired salpingopharyngeus",
    "fma": "FMA46665",
    "concepts": [
      "FMA46669",
      "FMA46670"
    ],
    "region": "elevators",
    "description": "Salpingopharyngeus muscle group linking the auditory tube region with the pharynx and contributing to pharyngeal elevation."
  },
  {
    "id": "levator-veli-palatini",
    "name": "Paired levator veli palatini",
    "fma": "FMA46727",
    "concepts": [
      "FMA46728",
      "FMA46729"
    ],
    "region": "palate",
    "description": "Levator veli palatini is a principal soft-palate elevator. Important to velopharyngeal function during speech and swallowing; no closure is simulated."
  },
  {
    "id": "tensor-veli-palatini",
    "name": "Paired tensor veli palatini",
    "fma": "FMA46730",
    "concepts": [
      "FMA46731",
      "FMA46732"
    ],
    "region": "palate",
    "description": "Tensor veli palatini tenses the soft palate and participates in opening the pharyngotympanic tube. Not a velopharyngeal closure animation."
  },
  {
    "id": "musculus-uvulae",
    "name": "Uvular muscle",
    "fma": "FMA46733",
    "concepts": [
      "FMA46733"
    ],
    "region": "palate",
    "description": "Musculus uvulae contributes to shortening and shaping the uvula and soft palate. This source includes one group, not the whole palatal lining."
  },
  {
    "id": "tongue",
    "name": "tongue",
    "fma": "FMA54640",
    "concepts": [
      "FMA54640"
    ],
    "region": "landmarks",
    "description": "Tongue surface included for orientation with pharyngeal muscles; no intrinsic muscle layers or speech articulation movements are modeled."
  },
  {
    "id": "epiglottis",
    "name": "epiglottis",
    "fma": "FMA55130",
    "concepts": [
      "FMA55130"
    ],
    "region": "landmarks",
    "description": "Epiglottis is an important supraglottic landmark in airway protection during swallowing. Movement is not animated."
  },
  {
    "id": "hyoid-bone",
    "name": "hyoid bone",
    "fma": "FMA52749",
    "concepts": [
      "FMA52749"
    ],
    "region": "landmarks",
    "description": "Hyoid bone provides attachment for muscles coordinating tongue, pharynx and laryngeal position."
  },
  {
    "id": "thyroid-cartilage",
    "name": "thyroid cartilage",
    "fma": "FMA55099",
    "concepts": [
      "FMA55099"
    ],
    "region": "landmarks",
    "description": "Thyroid cartilage is a laryngeal skeletal landmark adjacent to the lower pharynx."
  },
  {
    "id": "cricoid-cartilage",
    "name": "cricoid cartilage",
    "fma": "FMA9615",
    "concepts": [
      "FMA9615"
    ],
    "region": "landmarks",
    "description": "Cricoid cartilage is part of the laryngeal framework, near the pharyngoesophageal region."
  },
  {
    "id": "arytenoid-cartilages",
    "name": "Paired arytenoid cartilages",
    "fma": "FMA55109",
    "concepts": [
      "FMA55113",
      "FMA55114"
    ],
    "region": "landmarks",
    "description": "Right and left arytenoid cartilages appear as one source group, not individually selectable parts."
  },
  {
    "id": "ascending-pharyngeal-artery",
    "name": "Right ascending pharyngeal artery",
    "fma": "FMA49498",
    "concepts": [
      "FMA49498"
    ],
    "region": "vessels",
    "description": "Right ascending pharyngeal artery from the source model, included as a vascular landmark; the left vessel is not included."
  },
  {
    "id": "pharyngeal-venous-plexus",
    "name": "pharyngeal venous plexus",
    "fma": "FMA50822",
    "concepts": [
      "FMA50822"
    ],
    "region": "vessels",
    "description": "Pharyngeal venous plexus is a vascular reference structure. This static surface does not depict blood flow."
  },
  {
    "id": "glossopharyngeal-nerves",
    "name": "Glossopharyngeal nerves",
    "fma": "FMA50894",
    "concepts": [
      "FMA50894"
    ],
    "region": "nerves",
    "description": "Glossopharyngeal nerve (cranial nerve IX) source surfaces. The model does not depict all branches or complete neural pathways."
  },
  {
    "id": "pharyngeal-nerves",
    "name": "Pharyngeal nerves",
    "fma": "FMA77524",
    "concepts": [
      "FMA77524"
    ],
    "region": "nerves",
    "description": "Source-defined pharyngeal nerve surfaces included as partial innervation landmarks, not a complete cranial-nerve pathway map."
  }
]);
export const pharynxById=new Map(pharynxParts.map(part=>[part.id,part]));
export const pharynxRegions=Object.freeze({
 wall:'Pharyngeal constrictors and raphe',
 elevators:'Pharyngeal elevator muscles',
 palate:'Soft-palate muscles',
 landmarks:'Tongue and laryngeal landmarks',
 vessels:'Vascular references',
 nerves:'Selected nerves'
});
export const pharynxLicense=Object.freeze({
 source:'BodyParts3D / Anatomography 4.3 © Database Center for Life Science (DBCLS). Adapted by OrganUI.',
 license:'CC BY-SA 2.1 Japan',
 licenseUrl:'https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en',
 provenance:'https://github.com/organui/pharynx-3d/blob/c3759092b524ab4637d691168bdc08bbee1fcfbb/docs/MODEL_PROVENANCE.md'
});
export function verifyPharynxNodes(names){
 const ids=new Set(names);
 if(names.length!==20||ids.size!==20||pharynxParts.length!==20||
    pharynxParts.some(part=>!ids.has(part.id)||!pharynxRegions[part.region]||!part.fma))
  throw Error('Pharynx GLB must contain the twenty original pinned source-mesh groups');
 return true;
}
