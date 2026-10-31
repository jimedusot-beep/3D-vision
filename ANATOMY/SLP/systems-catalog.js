// Expandable SLP curriculum scaffold, not a claim of comprehensive coverage.
// "outline" means no anatomical 3D model; "study" means a PARTIAL licensed
// model (including oral or pharyngeal source meshes), not the full subject. 
// Respiratory, larynx and diaphragm have separate, source-licensed 3D viewers.
export const systemModules=[
  {
    "id": "respiration",
    "name": "Respiratory system",
    "group": "Speech mechanism",
    "stage": "3d",
    "overview": "Airflow and pressure supply the energy for speech and phonation. Compare quiet breathing with speech breathing.",
    "objectives": [
      "Trace the conducting airway from mouth or nose to the lungs.",
      "Identify diaphragm, intercostal muscles, ribs, pleura, lungs and trachea.",
      "Explain how expiratory airflow and pressure support phonation.",
      "Distinguish speech-breath grouping from resting ventilation."
    ],
    "next": [
      "Add licensed, independently reviewed diaphragm and rib cage meshes (lungs, trachea and bronchial trees are now available as source-derived 3D)",
      "Respiratory mechanics diagrams with expert review",
      "Respiration-phonation coordination practice"
    ],
    "source": "https://www.asha.org/practice-portal/clinical-topics/voice-disorders/"
  },
  {
    "id": "phonation",
    "name": "Phonation and larynx",
    "group": "Speech mechanism",
    "stage": "3d",
    "overview": "Source-derived 3D laryngeal cartilages, muscles and ligaments; phonation and voiced/voiceless sounds.",
    "objectives": [
      "Identify laryngeal cartilages and intrinsic muscles.",
      "Explain abduction, adduction and glottal closure.",
      "Relate expiratory airflow to vocal-fold vibration.",
      "Recognize limits of ligament-only meshes and static diagrams."
    ],
    "next": [
      "Faculty review of source-group anatomy",
      "True fold mucosa and layered-tissue licensed models",
      "Reviewed glottal motion demonstrations"
    ],
    "source": "https://www.asha.org/practice-portal/clinical-topics/voice-disorders/"
  },
  {
    "id": "resonance",
    "name": "Resonance and velopharynx",
    "group": "Speech mechanism",
    "stage": "study",
    "overview": "Partial 3D pharyngeal constrictors and soft-palate muscle groups; nasal/oral cavity lining, dynamic closure and acoustics are not modeled.",
    "objectives": [
      "Locate nasopharynx, oropharynx and oral cavity.",
      "Explain the role of the velum in oral versus nasal resonance.",
      "Differentiate hypernasality, hyponasality and nasal air emission.",
      "Connect resonance changes to speech acoustics."
    ],
    "next": [
      "Extend existing source-derived palate and pharynx muscles with verified mucosal/cavity surfaces",
      "Velopharyngeal closure study views",
      "Clinical overview with source references"
    ],
    "source": "https://www.asha.org/practice-portal/clinical-topics/resonance-disorders/"
  },
  {
    "id": "articulation",
    "name": "Articulatory and orofacial system",
    "group": "Speech mechanism",
    "stage": "study",
    "overview": "Partial source-derived 3D of tongue, mandible and hyoid with salivary glands/ducts; lips, teeth, palate and dynamic speech articulation are not yet modeled.",
    "objectives": [
      "Identify major oral articulators and their attachments.",
      "Describe place, manner and voicing of consonants.",
      "Connect articulator position to vowels and consonants.",
      "Distinguish speech production from phonological organization."
    ],
    "next": [
      "Expand beyond currently licensed tongue, jaw, hyoid and salivary anatomy to lips, teeth, palate and internal tongue muscles",
      "IPA/place-of-articulation study lab",
      "Articulatory motion with validated reference"
    ],
    "source": "https://www.asha.org/practice-portal/clinical-topics/articulation-and-phonology/"
  },
  {
    "id": "neural",
    "name": "Neural control and cranial nerves",
    "group": "Control and perception",
    "stage": "study",
    "overview": "Partial source-derived 3D cranial nerves/branches and brainstem (44 + 30 records). Glossopharyngeal CN IX is text-only; central pathways and all nuclei are not modeled.",
    "objectives": [
      "Orient to cortex, cerebellum and brainstem.",
      "Identify clinical roles of cranial nerves V, VII, IX, X and XII.",
      "Distinguish motor planning, motor execution and language processing.",
      "Explain neural coordination of breathing, speaking and swallowing."
    ],
    "next": [
      "Source-verified partial brainstem and nerve meshes added; still need a licensed CN IX mesh and validated full cranial-nerve paths",
      "Functional pathways and lesion correlations",
      "Neuroanatomy review by qualified faculty"
    ],
    "source": "https://www.asha.org/policy/SP2016-00343/"
  },
  {
    "id": "hearing",
    "name": "Hearing and auditory processing",
    "group": "Control and perception",
    "stage": "study",
    "overview": "Partial source-derived 3D right outer/middle/inner ear and CN VIII; ear canal, hair cells and central auditory pathways are not modeled.",
    "objectives": [
      "Locate pinna, tympanic membrane, ossicles and cochlea.",
      "Trace auditory transduction from vibration to neural signaling.",
      "Describe hearing's role in speech perception and self-monitoring.",
      "Connect hearing differences with language access and habilitation."
    ],
    "next": [
      "Source-verified right-ear model added; next find licensed full auditory canal, inner-ear microanatomy and bilateral structures",
      "Sound-transmission conceptual animation",
      "Audiology and SLP boundary reference"
    ],
    "source": "https://www.asha.org/policy/SP2016-00343/"
  },
  {
    "id": "swallowing",
    "name": "Feeding, swallowing and airway protection",
    "group": "Aerodigestive",
    "stage": "study",
    "overview": "Oral-phase introduction with source-derived 3D tongue, mandible, hyoid and salivary glands; pharyngeal/esophageal swallowing and airway protection remain outlines.",
    "objectives": [
      "Identify oral, pharyngeal and esophageal components.",
      "Explain laryngeal elevation and airway closure concepts.",
      "Distinguish bolus flow from respiratory airflow.",
      "Recognize aspiration and referral boundaries without simulating diagnosis."
    ],
    "next": [
      "Extend partial oral salivary and jaw anatomy into pharynx, esophagus and laryngeal protection structures",
      "Reviewed phase-based schematic illustrations",
      "Faculty-approved swallowing safety content"
    ],
    "source": "https://www.asha.org/practice-portal/clinical-topics/adult-dysphagia/"
  },
  {
    "id": "acoustics",
    "name": "Speech acoustics and phonetics",
    "group": "Foundations",
    "stage": "outline",
    "overview": "Sound waves, frequency, intensity, formants, spectrograms, voiced/voiceless speech and IPA.",
    "objectives": [
      "Relate vocal-fold vibration to fundamental frequency.",
      "Differentiate pitch, loudness and spectral content.",
      "Read simple concept-level sound wave and spectrogram representations.",
      "Relate phonetic symbols to articulatory features."
    ],
    "next": [
      "Privacy-preserving local waveform demonstration",
      "Source-filter and resonance study links",
      "No diagnostic acoustic measures without validation"
    ],
    "source": "https://www.asha.org/policy/SP2016-00343/"
  },
  {
    "id": "language",
    "name": "Language, cognition and development",
    "group": "Foundations",
    "stage": "outline",
    "overview": "Language comprehension and expression, cognition, social communication, development and literacy.",
    "objectives": [
      "Explain phonology, morphology, syntax, semantics and pragmatics.",
      "Relate attention, memory and executive function to communication.",
      "Recognize lifespan developmental differences.",
      "Distinguish linguistic concepts from physical anatomy."
    ],
    "next": [
      "Concept maps rather than invented organ meshes",
      "Developmental study cases with sources",
      "Responsible and inclusive communication examples"
    ],
    "source": "https://www.asha.org/policy/SP2016-00343/"
  },
  {
    "id": "disorders",
    "name": "Voice and communication disorders",
    "group": "Clinical connections",
    "stage": "outline",
    "overview": "Nodules, polyps, paresis/paralysis, laryngitis, vocal fold dysfunction and other disorders, approached through evidence-based clinical context.",
    "objectives": [
      "Differentiate common disorder categories and perceptual features.",
      "Connect anatomy and physiology with possible functional effects.",
      "Separate educational examples from diagnosis or treatment advice.",
      "Identify limits of textbook illustrations and old clinical claims."
    ],
    "next": [
      "Source-audited disorder profiles",
      "Ethically licensed real examination media",
      "Clinician review before case assessments"
    ],
    "source": "https://www.asha.org/practice-portal/clinical-topics/voice-disorders/"
  }
];
export const respiratoryTerms=[
  {
    "id": "diaphragm",
    "name": "Diaphragm",
    "function": "Principal muscle of quiet inspiration. Contraction increases thoracic volume, helping air enter the lungs.",
    "relation": "In speech, controlled expiration—not inhalation—is generally the immediate airflow source for voice."
  },
  {
    "id": "external-intercostals",
    "name": "External intercostal muscles",
    "function": "Contribute to rib movement and chest wall expansion during inspiration.",
    "relation": "Respiratory muscle coordination supports breath management for speaking."
  },
  {
    "id": "internal-intercostals",
    "name": "Internal intercostal muscles",
    "function": "Some portions contribute to active expiration and rib cage movement.",
    "relation": "Speech may recruit expiratory control beyond resting quiet breathing."
  },
  {
    "id": "rib-cage",
    "name": "Ribs and thoracic cage",
    "function": "The ribs and sternum help protect thoracic organs and provide a mobile frame for respiratory mechanics.",
    "relation": "Changing thoracic volume alters the pressure conditions supporting airflow."
  },
  {
    "id": "lungs",
    "name": "Lungs",
    "function": "The pulmonary system provides air for ventilation and oxygen–carbon dioxide exchange.",
    "relation": "Expiratory air originating in the lungs supports the airstream used for speech."
  },
  {
    "id": "alveoli",
    "name": "Alveoli",
    "function": "Small air sacs where most pulmonary gas exchange occurs.",
    "relation": "They are essential for respiration but are not the anatomical location where voice is produced."
  },
  {
    "id": "bronchi",
    "name": "Bronchi and bronchioles",
    "function": "Conduct air between the trachea and regions of the lungs.",
    "relation": "Airflow travels through these conducting passages on its way to and from the lungs."
  },
  {
    "id": "trachea",
    "name": "Trachea",
    "function": "The conducting airway extending between the larynx and the primary bronchi.",
    "relation": "Expiratory airflow travels through the trachea toward the larynx during speech."
  },
  {
    "id": "subglottal",
    "name": "Subglottal region and pressure",
    "function": "The airway region inferior to the true vocal folds is relevant to the pressure below the glottis.",
    "relation": "Subglottal pressure and glottal resistance interact during phonation, not as a precise real-time simulation here."
  },
  {
    "id": "respiratory-coordination",
    "name": "Respiration–phonation coordination",
    "function": "Breathing, vocal-fold control and vocal-tract shaping are coordinated in spoken communication.",
    "relation": "Speech often uses rapid inspiration and relatively prolonged, controlled expiration compared with quiet breathing."
  }
];
export const respiratoryQuestions=[
  {
    "question": "Which muscle is the primary driver of quiet inspiration?",
    "answer": "diaphragm",
    "choices": [
      "diaphragm",
      "trachea",
      "larynx"
    ],
    "explanation": "Diaphragm contraction expands the thoracic cavity, supporting inspiration."
  },
  {
    "question": "What primarily supplies the airstream for typical spoken phonation?",
    "answer": "lungs",
    "choices": [
      "lungs",
      "tongue",
      "nasal cavity"
    ],
    "explanation": "Expiratory air from the respiratory system passes through the larynx for voice production."
  },
  {
    "question": "Which tube connects the larynx with the bronchi?",
    "answer": "trachea",
    "choices": [
      "trachea",
      "esophagus",
      "pharynx"
    ],
    "explanation": "The trachea conducts air between the larynx and bronchi."
  },
  {
    "question": "Where does most pulmonary gas exchange occur?",
    "answer": "alveoli",
    "choices": [
      "alveoli",
      "glottis",
      "epiglottis"
    ],
    "explanation": "The alveoli permit diffusion of oxygen and carbon dioxide between air and blood."
  },
  {
    "question": "Which concept describes pressure beneath the true vocal folds?",
    "answer": "subglottal",
    "choices": [
      "subglottal",
      "resonance",
      "palatal"
    ],
    "explanation": "Subglottal pressure is part of the aerodynamic conditions supporting phonation."
  },
  {
    "question": "Which area studies coordination of expiration with voicing?",
    "answer": "respiratory-coordination",
    "choices": [
      "respiratory-coordination",
      "rib-cage",
      "bronchi"
    ],
    "explanation": "Speech breathing coordinates airflow, respiratory muscle action and glottal control."
  }
];
export function validateSystems(){
  const ids=new Set(systemModules.map(s=>s.id));
  if(ids.size!==10||!ids.has('respiration')||!ids.has('phonation'))throw Error('Incomplete multi-system SLP curriculum');
  if(systemModules.filter(s=>s.stage==='3d').map(s=>s.id).join(',')!=='respiration,phonation'|| 
  systemModules.filter(s=>s.stage==='study').map(s=>s.id).join(',')!=='resonance,articulation,hearing,swallowing')
  throw Error('Full anatomy models and partial oral anatomy modules must be distinguished');
  if(respiratoryTerms.length!==10||respiratoryQuestions.length!==6)throw Error('Respiratory study coverage mismatch');
  const terms=new Set(respiratoryTerms.map(s=>s.id));
  if(terms.size!==10||respiratoryQuestions.some(q=>!terms.has(q.answer)||!q.choices.includes(q.answer)))throw Error('Respiratory clue mismatch');
  return true;
}
