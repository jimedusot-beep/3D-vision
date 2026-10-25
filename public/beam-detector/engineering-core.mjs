// McGruber shared, pure engineering requirements and measurement screening.
// A catalog requirement is NOT proof of a physical device, safety or performance.
export const PARTS = Object.freeze([
{id:"supply-9v",name:"9V alkaline + snap connector",evidence:"Photographed in recent owner's bench images",kind:"power"},
{id:"supply-low",name:"Verified low-voltage supply matched to circuit",evidence:"9V batteries/holders available; loaded voltage and module compatibility unverified",kind:"power"},
{id:"resistor-led",name:"Measured LED series resistor + safe power rating",evidence:"Mixed resistors owned; actual values unconfirmed",kind:"passive"},
{id:"resistor-base",name:"Measured NPN base resistor (10 kΩ example)",evidence:"Mixed resistors owned; actual value unconfirmed",kind:"passive"},
{id:"led-blue",name:"Blue visible LED emitter",evidence:"Owner photograph shows illuminated blue LED",kind:"optical"},
{id:"led-red",name:"Loose red LED for photovoltaic experiment",evidence:"Owner has colored LEDs; DC optical suitability not yet qualified",kind:"optical"},
{id:"led-status",name:"Separate visible status LED",evidence:"Colored LED assortment pictured",kind:"output"},
{id:"npn-2n4401",name:"Identified 2N4401 NPN + actual pinout",evidence:"Part number visible; manufacturer/lead order not verified",kind:"driver"},
{id:"optical-qualified",name:"Qualified light-sensitive receiver at target range",evidence:"Missing proof; ordinary receiving LED has only preliminary meter observations",kind:"sensor"},
{id:"optical-interface",name:"Tested amplifier/threshold and noise hysteresis",evidence:"Required functionality not demonstrated; exact amplifier/comparator parts unknown",kind:"signal"},
{id:"wire-mount",name:"Insulated connections, mounting and strain relief",evidence:"Wires, tape/clip leads owned; final mounts unbuilt",kind:"mechanical"},
{id:"fluke",name:"Fluke 15B+ meter and verified probes",evidence:"Owner has photographed meter and reported shorted-lead zero test",kind:"tool"},
{id:"mouse-switch",name:"Mechanical microswitch mapped COM/NO/NC",evidence:"Mice pictured; contact mapping not measured",kind:"sensor"},
{id:"switch-input",name:"Known correctly rated contact trigger",evidence:"Mouse switches and bag switches pictured; ratings untested",kind:"sensor"},
{id:"box-mechanical",name:"Small, safe cardboard/soft housing",evidence:"Household material route proposed; dimensioned build unverified",kind:"mechanical"},
{id:"latch-soft",name:"Low-force spring/hinge/latch and stop",evidence:"Household cardboard/hinge salvage possible; actual mechanism untested",kind:"mechanical"},
{id:"phone-camera",name:"Phone camera prototype with permission",evidence:"Owner-reported working red-beam phone detector",kind:"sensor"},
{id:"motion-sensor",name:"Qualified true motion sensor or approved camera method",evidence:"Phone camera available; no PIR verified",kind:"sensor"},
{id:"motion-output",name:"Silent visual motion-event indicator",evidence:"LED hardware available; physical integration untested",kind:"output"},
{id:"keyfob",name:"Owned 433MHz-labeled RF key fob",evidence:"Photographed; matching signals not verified",kind:"rf"},
{id:"rf-receiver",name:"Compatible documented RF receiver/decoder",evidence:"Not found in owned photo inventory",kind:"rf"},
{id:"mouse-donor",name:"Optical mouse donor and mechanical switches",evidence:"Two opened mice pictured",kind:"donor"},
{id:"mouse-optical",name:"Documented mouse tracking sensor protocol + controller",evidence:"U1/U2 are PCB labels, not actual chip model IDs",kind:"advanced"},
{id:"ir-emitter",name:"Documented eye-safe IR optical transmitter",evidence:"Amazon R-NZ remote may contain IR emitter, unconfirmed",kind:"optical"},
{id:"ir-receiver",name:"Spectrally matched IR receiver with documented output",evidence:"Not established in salvage photo inventory",kind:"sensor"},
{id:"ir-modulation",name:"Compatible IR drive/encoding or demodulation",evidence:"Needed if sensor and transmitter depend on modulation; protocol undetermined",kind:"signal"},
{id:"elmo-donor",name:"Elmo donor with characterized supply",evidence:"Ownership reported; electronics/power failure diagnosis unverified",kind:"donor"},
{id:"motor-identified",name:"Identified motor/servo, voltage and stall current",evidence:"No actual rated actuator measured",kind:"actuator"},
{id:"motor-driver",name:"Correct power driver and inductive suppression",evidence:"Not established from photographed transistors",kind:"driver"},
{id:"controller",name:"Validated standalone controller/control logic",evidence:"None identified for requested robotic functions",kind:"control"},
{id:"endstop",name:"Mechanical limits, soft travel and shutoff",evidence:"Design dependent, unbuilt",kind:"mechanical"}
]);
export const PROJECTS = Object.freeze([
{id:"P01",name:"Visible light tripwire",needs:["supply-9v","resistor-led","led-blue","led-red","led-status","npn-2n4401","resistor-base","optical-qualified","optical-interface","wire-mount","fluke"],optional:[],gate:"No-phone automatic warning OFF with beam, ON when blocked; measure 30/30 and 15 min idle",nearTerm:"Validate limited-current LED transmitter, ten DC mV A/B/A readings, then manual NPN switching"},
{id:"P02",name:"Motion-triggered visual prank",needs:["phone-camera","motion-sensor","motion-output","wire-mount"],optional:["controller"],gate:"Ten movement and ten no-movement trials with no unexpected trigger",nearTerm:"Test fixed phone camera software; no microphone or sound required"},
{id:"P03",name:"Pop-up surprise box",needs:["box-mechanical","latch-soft"],optional:["switch-input","led-status"],gate:"20 safe low-force release/rearm cycles with zero jams",nearTerm:"Build and measure paper/cardboard spring and latch without electronics"},
{id:"P04",name:"Object-removal silent alert",needs:["mouse-switch","fluke","supply-9v","resistor-led","led-status","wire-mount"],optional:["npn-2n4401"],gate:"Twenty released/placed object cycles with verified contact mapping and no false LED change",nearTerm:"Power off and map COM/NO/NC switch pairs with Fluke continuity"},
{id:"P05",name:"Wireless clicker",needs:["keyfob","rf-receiver","supply-low","led-status"],optional:["controller"],gate:"Authorized intended button actions each generate distinguishable receiver outputs",nearTerm:"Inspect and document fob battery/PCB; don't infer RF protocol from 433MHz printing"},
{id:"P06",name:"Mouse-powered switch gadgets",needs:["mouse-donor","mouse-switch","fluke","resistor-led","led-status","supply-9v"],optional:["mouse-optical"],gate:"Ten clean contact events and ten releases",nearTerm:"Map salvaged switch; digital optical sensor is a separate research project"},
{id:"P07",name:"Standalone silent control box",needs:["supply-9v","resistor-led","resistor-base","led-status","npn-2n4401","switch-input","wire-mount"],optional:["optical-interface"],gate:"Twenty input/output cycles, no unstable indicator, measured supply/load",nearTerm:"Prove NPN switching with safe base resistor and a separate alert LED"},
{id:"P08",name:"Invisible IR tripwire",needs:["ir-emitter","ir-receiver","ir-modulation","supply-low","led-status","wire-mount"],optional:["optical-interface"],gate:"Ten interruptions at each measured range with eye-safe emitter",nearTerm:"Only inspect remote emission; don't assume continuous IR from remote-control codes"},
{id:"P09",name:"Moving companion robot",needs:["elmo-donor","motor-identified","motor-driver","controller","supply-low","endstop","wire-mount"],optional:["motion-sensor","led-status"],gate:"One bounded safe movement, then twenty powered cycles and stall/stop tests",nearTerm:"Measure donor's supply and identify motors and end stops before attaching drivers"}
]);
export const STATES = Object.freeze(["not-checked","found-not-tested","electrically-verified","unavailable"]);
export const EMPTY_COUNTS = Object.freeze({ready:0,found:0,unchecked:0,unavailable:0});
export function projectReadiness(project,statuses={}){
  if(!project||!Array.isArray(project.needs))throw new TypeError("Invalid project");
  const counts={...EMPTY_COUNTS};const unresolved=[];
  for(const id of project.needs){
    const state=STATES.includes(statuses[id])?statuses[id]:"not-checked";
    if(state==="electrically-verified")counts.ready++;
    else {if(state==="found-not-tested")counts.found++;else if(state==="unavailable")counts.unavailable++;else counts.unchecked++;unresolved.push({id,state});}
  }
  return {projectId:project.id,total:project.needs.length,...counts,unresolved,
    benchReady:unresolved.length===0,
    message:unresolved.length===0?"Requirements user-marked verified; actual circuit tests and full qualification still required.":"Prerequisite inventory or verification incomplete; do not call this a finished build."};
}
export function checkLed({supplyV,forwardV,resistanceOhm,ratingW,ledRatedMaxmA}){
  const v=Number(supplyV),f=Number(forwardV),r=Number(resistanceOhm),w=Number(ratingW);
  if(![v,f,r,w].every(Number.isFinite)||v<=0||f<=0||v<=f||r<=0||w<=0)return {valid:false,reason:"Enter positive measured supply, LED forward estimate, resistor Ω and resistor wattage; supply must exceed LED drop."};
  const currentmA=1000*(v-f)/r,resistorWatts=(v-f)*(v-f)/r,ledWatts=(v-f)/r*f;
  const max=ledRatedMaxmA==null||ledRatedMaxmA===""?null:Number(ledRatedMaxmA);
  if(max!==null&&(!Number.isFinite(max)||max<=0))return {valid:false,reason:"LED's rated maximum must be a valid positive mA number."};
  return {valid:true,currentmA,resistorWatts,ledWatts,
    resistorWithinRating:resistorWatts<=w,
    ledWithinRating:max!==null?currentmA<=max:null,
    qualified:resistorWatts<=w&&max!==null&&currentmA<=max,
    notice:"Calculation only. Ratings, resistor heat, actual current, polarity and wiring must be checked physically. This does not certify safety."};
}
const median = a => {const b=[...a].sort((x,y)=>x-y);return (b[Math.floor((b.length-1)/2)]+b[Math.floor(b.length/2)])/2;};
export function analyzeReceiverTriples(rows){
  if(!Array.isArray(rows)||rows.length<10)return{valid:false,reason:"Log at least ten complete light ON / blocked / restored DC mV triples."};
  const values=rows.map(r=>[Number(r.on),Number(r.blocked),Number(r.restored)]);
  if(rows.some((r,i)=>["on","blocked","restored"].some(k=>r[k]===""||r[k]===null||r[k]===undefined)||!values[i].every(Number.isFinite)))return{valid:false,reason:"Every sample needs three finite DC mV readings, including actual zeros."};
  const deltas=values.map(([on,blocked])=>on-blocked),returns=values.map(([on,blocked,restored])=>Math.abs(restored-on)), med=median(deltas),sameSign=deltas.filter(d=>Math.sign(d)===Math.sign(med)&&Math.abs(d)>0.2).length;
  const sign=Math.sign(med),contrast=median(deltas.map(Math.abs)),recovery=returns.filter((r,i)=>r<=Math.max(0.5,Math.abs(deltas[i])*0.5)).length;
  return {valid:true,count:rows.length,medianContrastmV:med,absoluteMedianContrastmV:contrast,signConsistency:sameSign,recoveryCount:recovery,
    suggestsContrast:contrast>=1&&sameSign>=Math.ceil(rows.length*.9)&&recovery>=Math.ceil(rows.length*.8),
    interpretation:contrast>=1&&sameSign>=Math.ceil(rows.length*.9)&&recovery>=Math.ceil(rows.length*.8)?"Owner-entered DC samples show repeatable contrast under this limited screening heuristic. Check input loading, photocurrent, ambient response and amplification before claiming a working receiver.":"Samples do not meet the screening rule (≥1 mV median contrast, ≥90% consistent polarity, ≥80% restored near ON). Improve alignment, contacts and ambient control; this is not proof of a bad LED.",
    caveat:"Heuristic assumes sample entries are real DC mV. Meter drift, repeated copied values and test operator effects cannot be independently verified."};
}
