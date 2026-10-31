// Fixed 20 anatomy groups from OrganUI's pinned lungs-3d BodyParts3D 4.3 manifest.
// These are actual source GLB node names, not fabricated complete organs.
// Source-derived segment groupings are educational and not clinical borders.
export const lungGroups=[
  {
    "id": "FMA7338",
    "name": "Right apical segment",
    "region": "right-upper",
    "kind": "segment",
    "description": "A source-defined region of lung parenchyma in the right upper lobe. This surface depicts selected segment tissue, not an alveolar microstructure or individualized lung boundaries."
  },
  {
    "id": "FMA7339",
    "name": "Right posterior segment",
    "region": "right-upper",
    "kind": "segment",
    "description": "A source-defined region of lung parenchyma in the right upper lobe. This surface depicts selected segment tissue, not an alveolar microstructure or individualized lung boundaries."
  },
  {
    "id": "FMA7359",
    "name": "Right anterior segment",
    "region": "right-upper",
    "kind": "segment",
    "description": "A source-defined region of lung parenchyma in the right upper lobe. This surface depicts selected segment tissue, not an alveolar microstructure or individualized lung boundaries."
  },
  {
    "id": "FMA7361",
    "name": "Right lateral segment",
    "region": "right-middle",
    "kind": "segment",
    "description": "A source-defined region of lung parenchyma in the right middle lobe. This surface depicts selected segment tissue, not an alveolar microstructure or individualized lung boundaries."
  },
  {
    "id": "FMA7360",
    "name": "Right medial segment",
    "region": "right-middle",
    "kind": "segment",
    "description": "A source-defined region of lung parenchyma in the right middle lobe. This surface depicts selected segment tissue, not an alveolar microstructure or individualized lung boundaries."
  },
  {
    "id": "FMA7366",
    "name": "Right superior segment",
    "region": "right-lower",
    "kind": "segment",
    "description": "A source-defined region of lung parenchyma in the right lower lobe. This surface depicts selected segment tissue, not an alveolar microstructure or individualized lung boundaries."
  },
  {
    "id": "FMA7364",
    "name": "Right anterior basal segment",
    "region": "right-lower",
    "kind": "segment",
    "description": "A source-defined region of lung parenchyma in the right lower lobe. This surface depicts selected segment tissue, not an alveolar microstructure or individualized lung boundaries."
  },
  {
    "id": "FMA7363",
    "name": "Right lateral basal segment",
    "region": "right-lower",
    "kind": "segment",
    "description": "A source-defined region of lung parenchyma in the right lower lobe. This surface depicts selected segment tissue, not an alveolar microstructure or individualized lung boundaries."
  },
  {
    "id": "FMA7362",
    "name": "Right posterior basal segment",
    "region": "right-lower",
    "kind": "segment",
    "description": "A source-defined region of lung parenchyma in the right lower lobe. This surface depicts selected segment tissue, not an alveolar microstructure or individualized lung boundaries."
  },
  {
    "id": "FMA7372",
    "name": "Left apicoposterior segment",
    "region": "left-upper",
    "kind": "segment",
    "description": "A source-defined region of lung parenchyma in the left upper lobe. This surface depicts selected segment tissue, not an alveolar microstructure or individualized lung boundaries."
  },
  {
    "id": "FMA7373",
    "name": "Left anterior segment",
    "region": "left-upper",
    "kind": "segment",
    "description": "A source-defined region of lung parenchyma in the left upper lobe. This surface depicts selected segment tissue, not an alveolar microstructure or individualized lung boundaries."
  },
  {
    "id": "FMA7374",
    "name": "Superior lingular segment",
    "region": "left-upper",
    "kind": "segment",
    "description": "A source-defined region of lung parenchyma in the left upper lobe. This surface depicts selected segment tissue, not an alveolar microstructure or individualized lung boundaries."
  },
  {
    "id": "FMA7375",
    "name": "Inferior lingular segment",
    "region": "left-upper",
    "kind": "segment",
    "description": "A source-defined region of lung parenchyma in the left upper lobe. This surface depicts selected segment tissue, not an alveolar microstructure or individualized lung boundaries."
  },
  {
    "id": "FMA7376",
    "name": "Left superior segment",
    "region": "left-lower",
    "kind": "segment",
    "description": "A source-defined region of lung parenchyma in the left lower lobe. This surface depicts selected segment tissue, not an alveolar microstructure or individualized lung boundaries."
  },
  {
    "id": "FMA7378",
    "name": "Left anterior basal segment",
    "region": "left-lower",
    "kind": "segment",
    "description": "A source-defined region of lung parenchyma in the left lower lobe. This surface depicts selected segment tissue, not an alveolar microstructure or individualized lung boundaries."
  },
  {
    "id": "FMA7379",
    "name": "Left lateral basal segment",
    "region": "left-lower",
    "kind": "segment",
    "description": "A source-defined region of lung parenchyma in the left lower lobe. This surface depicts selected segment tissue, not an alveolar microstructure or individualized lung boundaries."
  },
  {
    "id": "FMA7380",
    "name": "Left posterior basal segment",
    "region": "left-lower",
    "kind": "segment",
    "description": "A source-defined region of lung parenchyma in the left lower lobe. This surface depicts selected segment tissue, not an alveolar microstructure or individualized lung boundaries."
  },
  {
    "id": "FMA7394",
    "name": "Trachea",
    "region": "airway",
    "kind": "airway",
    "description": "Conducting airway immediately below the larynx. It carries air between the glottic region and the bronchi."
  },
  {
    "id": "FMA26661",
    "name": "Right bronchial tree",
    "region": "airway",
    "kind": "airway",
    "description": "Source-derived bronchial branches carrying air into the corresponding lung; simplified branch geometry, not a full airway or flow simulation."
  },
  {
    "id": "FMA26662",
    "name": "Left bronchial tree",
    "region": "airway",
    "kind": "airway",
    "description": "Source-derived bronchial branches carrying air into the corresponding lung; simplified branch geometry, not a full airway or flow simulation."
  }
];
export const lungGroupById=new Map(lungGroups.map(item=>[item.id,item]));
export const lungRegions={
 'right-upper':'Right upper lobe','right-middle':'Right middle lobe',
 'right-lower':'Right lower lobe','left-upper':'Left upper lobe',
 'left-lower':'Left lower lobe','airway':'Conducting airway'
};
export const lungLicense={
  "source": "BodyParts3D / Anatomography 4.3, © Database Center for Life Science (DBCLS). Adapted by OrganUI.",
  "license": "CC BY-SA 2.1 Japan",
  "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en",
  "provenance": "https://github.com/organui/lungs-3d/blob/5815084f43efe438ebfae3fd889ee2baf343dfbf/docs/MODEL_PROVENANCE.md"
};
export function verifyLungGroups(ids){
 const modelIds=new Set(ids);
 if(modelIds.size!==20||lungGroups.some(x=>!modelIds.has(x.id))||lungGroups.length!==20)
  throw Error('Lungs GLB node IDs must exactly match 20 pinned source groups');
 return true;
}
