// Guided observation of the pinned, source-defined respiratory geometry.
// The order is pedagogical, NOT simulated airflow or a connected bronchial path.
import {lungGroupById} from './lungs-manifest.js';

export const lungTourStops=Object.freeze([
  {id:'FMA7338',title:'1. Right upper-lobe segment',
   note:'Start at a source-defined patch of lung tissue. The model does not depict alveoli or gas exchange. Speech uses controlled expiratory airflow originating in the lungs.'},
  {id:'FMA26661',title:'2. Right bronchial tree',
   note:'Explore the branching conducting airways on the right. These modeled branches connect conceptually with larger air passages; not every fine bronchiole is represented.'},
  {id:'FMA7380',title:'3. Left lower-lobe segment',
   note:'Compare a source-defined segment on the left with the right lung. Surface boundaries are from the selected source data, not an individual person or clinical segmentation.'},
  {id:'FMA26662',title:'4. Left bronchial tree',
   note:'Inspect the left conducting airways. Both bronchial trees lead toward the trachea; the sequence of study stops is not an animation of airflow.'},
  {id:'FMA7394',title:'5. Trachea and the speech connection',
   note:'During typical voiced speech, air moves upward through the trachea toward the larynx. This model stops at the trachea: open the separate 3D larynx viewer next to study phonation.'}
]);

export function validateLungTour(stops=lungTourStops){
 if(stops.length!==5||new Set(stops.map(s=>s.id)).size!==stops.length||
   stops.some(s=>!lungGroupById.has(s.id)||!s.title||s.note.length<60))
   throw Error('Guided lung tour must reference five distinct, documented source-mesh groups');
 return true;
}
export function initLungTour({selectStructure,focusStructure,resetScene}){
 validateLungTour();
 const $=id=>document.getElementById(id);
 const panel=$('lung-tour-active'),start=$('lung-tour-start'),
       previous=$('lung-tour-prev'),next=$('lung-tour-next'),close=$('lung-tour-close'),
       summary=$('lung-tour-summary'),stage=$('lung-stage');
 let index=-1;
 function present(){
  const stop=lungTourStops[index];
  if(!stop)return;
  panel.hidden=false;start.hidden=true;summary.textContent='';
  $('lung-tour-progress').textContent='Step '+(index+1)+' of '+lungTourStops.length;
  $('lung-tour-title').textContent=stop.title;
  $('lung-tour-note').textContent=stop.note;
  previous.disabled=index===0;
  next.textContent=index===lungTourStops.length-1?'Finish tour':'Next structure';
  stage.dataset.tourStep=String(index+1);
  selectStructure(stop.id);
  focusStructure(stop.id);
 }
 function end(completed){
  index=-1;panel.hidden=true;start.hidden=false;stage.dataset.tourStep='off';
  resetScene();
  summary.textContent=completed
   ?'Tour complete. Continue into the separate 3D larynx lab to study where phonation occurs.'
   :'Tour closed. All lung and airway surfaces restored.';
 }
 start.addEventListener('click',()=>{
  // Tour and quiz share the model selection. Only one can own the scene at once.
  if(stage.dataset.practice!=='off')$('lung-practice-exit').click();
  index=0;present();
 });
 previous.addEventListener('click',()=>{if(index>0){index--;present();}});
 next.addEventListener('click',()=>{
  if(index<0)return;
  if(index===lungTourStops.length-1)end(true);
  else {index++;present();}
 });
 close.addEventListener('click',()=>{if(index>=0)end(false);});
 stage.dataset.tourStep='off';
 return {refresh(){if(index>=0)focusStructure(lungTourStops[index].id);}};
}
