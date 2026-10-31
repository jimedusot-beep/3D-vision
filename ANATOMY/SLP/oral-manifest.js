// Original teaching notes aligned with the fifteen source GLB groups documented by
// OrganUI; adapted from Z-Anatomy (CC BY-SA 4.0), partly based on BodyParts3D.
// This is not the complete tongue musculature, oral cavity, or swallowing system.
export const oralParts=Object.freeze([
 {
  "id": "right-parotid-gland",
  "name": "Right parotid gland",
  "region": "glands",
  "description": "Parotid gland located near the right ear and jaw; produces saliva that reaches the mouth through a duct.",
  "sourceObject": "Parotid_glandr"
 },
 {
  "id": "left-parotid-gland",
  "name": "Left parotid gland",
  "region": "glands",
  "description": "Parotid gland near the left ear and jaw; one of the major paired glands that contribute saliva for oral lubrication.",
  "sourceObject": "Parotid_glandl"
 },
 {
  "id": "right-accessory-parotid-gland",
  "name": "Right accessory parotid gland",
  "region": "glands",
  "description": "Source-defined accessory parotid gland tissue near the right cheek; this model is not an individual patient's anatomy.",
  "sourceObject": "(Accessory_parotid_gland)r"
 },
 {
  "id": "left-accessory-parotid-gland",
  "name": "Left accessory parotid gland",
  "region": "glands",
  "description": "Source-defined accessory parotid tissue in the left cheek region; gland sizes and positions vary across people.",
  "sourceObject": "(Accessory_parotid_gland)l"
 },
 {
  "id": "right-parotid-duct",
  "name": "Right parotid duct",
  "region": "ducts",
  "description": "A passage conveying saliva from the right parotid region into the oral cavity; the model does not simulate saliva flow.",
  "sourceObject": "Parotid_ductr"
 },
 {
  "id": "left-parotid-duct",
  "name": "Left parotid duct",
  "region": "ducts",
  "description": "A duct carrying secretions from the left parotid gland toward the mouth; this static mesh cannot demonstrate flow.",
  "sourceObject": "Parotid_ductl"
 },
 {
  "id": "right-submandibular-gland",
  "name": "Right submandibular gland",
  "region": "glands",
  "description": "Salivary gland located beneath the right lower jaw; saliva helps moisten food for chewing and swallowing.",
  "sourceObject": "Submandibular_glandr"
 },
 {
  "id": "left-submandibular-gland",
  "name": "Left submandibular gland",
  "region": "glands",
  "description": "Major salivary gland under the left mandible that contributes to moisture in the mouth and preparation for swallowing.",
  "sourceObject": "Submandibular_glandl"
 },
 {
  "id": "right-submandibular-duct",
  "name": "Right submandibular duct",
  "region": "ducts",
  "description": "The duct conducting saliva from the right submandibular gland into the floor of the mouth.",
  "sourceObject": "Submandibular_ductr"
 },
 {
  "id": "left-submandibular-duct",
  "name": "Left submandibular duct",
  "region": "ducts",
  "description": "The duct conveying saliva from the left submandibular gland to the mouth floor; no fluid mechanics are represented.",
  "sourceObject": "Submandibular_ductl"
 },
 {
  "id": "right-sublingual-gland",
  "name": "Right sublingual gland",
  "region": "glands",
  "description": "Salivary tissue underneath the tongue on the right, helping keep oral surfaces moist for speech and swallowing.",
  "sourceObject": "Sublingual_glandr"
 },
 {
  "id": "left-sublingual-gland",
  "name": "Left sublingual gland",
  "region": "glands",
  "description": "Salivary gland beneath the tongue on the left; this is gross surface anatomy, without microscopic gland ducts.",
  "sourceObject": "Sublingual_glandl"
 },
 {
  "id": "tongue",
  "name": "Tongue",
  "region": "articulator",
  "description": "The tongue shapes many speech sounds, manipulates food during chewing, and assists the oral stage of swallowing. Static geometry does not depict tongue movement.",
  "sourceObject": "Tongue"
 },
 {
  "id": "mandible",
  "name": "Mandible",
  "region": "landmarks",
  "description": "The lower jaw provides a moving bony framework for chewing and oral articulation; the model does not animate jaw movement.",
  "sourceObject": "Mandible"
 },
 {
  "id": "hyoid-bone",
  "name": "Hyoid bone",
  "region": "landmarks",
  "description": "Small bone in the upper neck associated with tongue and laryngeal muscle attachments and swallowing mechanics.",
  "sourceObject": "Hyoid_bone"
 }
]);
export const oralById=new Map(oralParts.map(part=>[part.id,part]));
export const oralRegions=Object.freeze({
 glands:'Major and accessory salivary glands',
 ducts:'Visible salivary ducts',
 articulator:'Tongue',
 landmarks:'Jaw and hyoid landmarks'
});
export const oralLicense=Object.freeze({
 source:'Z-Anatomy (Gauthier Kervyn, Lluís Vinent Juanico and contributors), based in part on BodyParts3D © DBCLS; adapted by OrganUI.',
 license:'CC BY-SA 4.0',
 licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',
 original:'https://github.com/LluisV/Z-Anatomy',
 provenance:'https://github.com/organui/organui/blob/21439ee45a2efb8cd9d970e9b56405b294e3744d/apps/web/public/models/salivary-glands.ATTRIBUTION.md'
});
export function verifyOralNodes(names){
 const ids=new Set(names);
 if(names.length!==15||ids.size!==15||oralParts.length!==15||
  oralParts.some(part=>!ids.has(part.id)||!oralRegions[part.region]))
  throw Error('Oral GLB must contain exactly fifteen documented Z-Anatomy source nodes');
 return true;
}
