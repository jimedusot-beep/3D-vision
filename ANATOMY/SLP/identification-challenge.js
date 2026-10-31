// Self-paced, session-only identification practice based on the source-linked
// study summaries. These are educational prompts, not a clinical assessment.
export const identificationClues={
  "hyoid-bone": "Which U-shaped bone suspends the larynx and serves as an attachment point for swallowing muscles?",
  "thyroid-cartilage": "Which large anterior cartilage shields the internal larynx and provides attachments for vocal structures?",
  "cricoid-cartilage": "Which cartilage forms a complete ring immediately inferior to the thyroid cartilage?",
  "epiglottis": "Which elastic cartilage helps protect the laryngeal inlet during swallowing?",
  "arytenoid-cartilages": "Which paired movable cartilages have vocal processes important for changing the glottal opening?",
  "corniculate-cuneiform-cartilages": "Which small supporting cartilages are found around the arytenoid tips and aryepiglottic folds?",
  "thyrohyoid-membrane": "Which fibrous sheet links the hyoid bone to the thyroid cartilage?",
  "cricothyroid-ligament": "Which anterior fibrous connection is located between the thyroid and cricoid cartilages?",
  "conus-elasticus": "Which fibroelastic membrane has a superior free edge that forms part of the vocal ligament?",
  "vocal-ligaments": "Which paired connective-tissue bands lie inside, but do not constitute all layers of, the true vocal folds?",
  "epiglottic-ligaments": "Which connective structures help anchor the protective inlet cartilage to nearby structures?",
  "cricothyroid-muscle": "Which intrinsic laryngeal muscle lengthens and tenses the vocal folds and can contribute to raising pitch?",
  "posterior-crico-arytenoid": "Which paired intrinsic muscles abduct the vocal folds to open the glottis?",
  "lateral-crico-arytenoid": "Which paired intrinsic muscles help adduct the vocal folds, narrowing the glottal gap?",
  "arytenoid-muscles": "Which intrinsic muscle group brings the posterior arytenoids closer together to assist glottal closure?",
  "thyro-arytenoid": "Which intrinsic muscle group can shorten the vocal folds and modulate their body stiffness?",
  "vocalis": "Which medial component of the thyroarytenoid helps fine-tune vocal-fold tension?",
  "aryepiglottic-muscle": "Which muscle group can narrow the upper laryngeal inlet during airway protection?",
  "trachea": "Which airway tube descends from the larynx and contains supportive cartilage rings?",
  "thyroid-gland": "Which nearby endocrine tissue secretes thyroid hormones but is not a sound-producing laryngeal muscle?"
};
function hash(s){let n=2166136261;for(const c of s){n=Math.imul(n^c.charCodeAt(0),16777619)>>>0;}return n;}
export function buildIdentificationDeck(items,names){
  if(items.length!==20||Object.keys(identificationClues).length!==20)
    throw new Error('Expected exactly the 20 verified anatomy groups');
  const ids=new Set(items.map(s=>s.id));
  if(ids.size!==20||Object.keys(identificationClues).some(id=>!ids.has(id)||!names[id]))
    throw new Error('Identification prompts and source anatomy IDs must match');
  return items.map((study,index)=>{
    const distractors=items.filter(s=>s.id!==study.id).sort((a,b)=>{
      const aGroup=a.category===study.category?0:1;
      const bGroup=b.category===study.category?0:1;
      return aGroup-bGroup||hash(study.id+a.id)-hash(study.id+b.id);
    }).slice(0,3).map(s=>s.id);
    const options=[study.id,...distractors].sort((a,b)=>
      hash(study.id+'-option-'+a)-hash(study.id+'-option-'+b));
    if(new Set(options).size!==4)throw new Error('Non-unique identification choices');
    return {id:study.id,number:index+1,clue:identificationClues[study.id],
      options,answer:study.id,source:study};
  });
}
export function checkIdentification(question,selectedId){
  if(!question.options.includes(selectedId))throw new RangeError('Invalid answer option');
  return selectedId===question.answer;
}
