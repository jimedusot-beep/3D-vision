/**
 * B/C guided 3D assembly lessons.
 *
 * This is a versioned teaching sequence, NOT an electrical simulator,
 * bill of materials, measured CAD, or any record of physical test success.
 * IDs deliberately correspond to the 16 / 15 THREE.js part groups.
 */
export const GUIDE_VERSION = 1;
const connection=(from,to,note,kind="conditional")=>Object.freeze({from,to,note,kind});
const test=(task,observation,record)=>Object.freeze({task,observation,record});
const step=(key,title,parts,placement,instructions,connections,checkpoint,{gate="bench-unverified",caution=""}={})=>
 Object.freeze({key,title,parts:Object.freeze(parts),placement,instructions:Object.freeze(instructions),
  connections:Object.freeze(connections),checkpoint,gate,caution});

export const TRIPWIRE_GUIDES=Object.freeze({
 B:Object.freeze({
  experiment:"B",title:"Visible blue LED → unpowered red LED sensor",
  modelPrefix:"TW-B-",expectedParts:16,status:"ANALOG FRONT END MISSING",
  notice:"No real amplifier/threshold has been demonstrated. This is a guided teaching layout, NOT a finished automatic alarm.",
  steps:Object.freeze([
   step("layout","Place the transmitter and receiver",["TW-B-01","TW-B-02","TW-B-05","TW-B-07","TW-B-14"],
    "Put the blue LED on the left board and point it toward the separate RED sensing LED on the right. These model distances are illustrative, not a doorway measurement.",
    ["Keep the receiver LED unpowered: it is a sensor, not a second light source.",
     "Use a rigid short-distance support initially; align the two LED tips at about 1–3 inches for the first real experiment.",
     "The blue beam drawn in the scene is a graphic guide, not a glowing ray in normal air."],
    [],
    test("Dry placement, power OFF","Two LEDs face one another without either bare leg touching other wires.","Photograph actual donor markings and write the initial distance."),
    {gate:"visual-only"}),
   step("emitter","Current-limit the blue transmitter",["TW-B-03","TW-B-04","TW-B-05","TW-B-06"],
    "Keep the battery and limiting resistor on the emitter board. The blue LED's long/short leads are only a provisional polarity clue; use the actual LED's markings or diode test.",
    ["With power DISCONNECTED, measure a prospective resistor using the Fluke in ohms mode. Around 1 kΩ is only a candidate for an ordinary low-current blue indicator LED on a verified 9 V battery.",
     "Confirm actual battery polarity and LED ratings. Never connect a loose LED directly across a battery.",
     "Wire in series, inspect clips for shorts, then briefly energize and measure the resistor voltage drop to calculate current."],
    [connection("9 V battery +","Measured series resistor (~1 kΩ candidate)","Confirm supply, LED current rating and actual resistor value first."),
     connection("Series resistor","BLUE LED anode","This is the emitter, not the unpowered red sensor."),
     connection("BLUE LED cathode","9 V battery −","Return path only on the emitter-side circuit.")],
    test("With Fluke set to DC volts, after checking wiring","Blue LED glows at low brightness; measured resistor drop gives I = Vresistor / R.","Record battery voltage, verified resistance and calculated emitter current."),
    {gate:"measure-before-power",caution:"No direct battery-to-LED connection. If resistor value or LED rating is unknown, do not energize."}),
   step("sensor","Measure the red LED as an unpowered detector",["TW-B-07","TW-B-08","TW-B-13","TW-B-14"],
    "Put the red sensor on the receiver board, optionally inside a short opaque light-shield tube. Its two leads go to the multimeter only, not to a battery.",
    ["Use COM and V/Ω with the Fluke on DC millivolts; note the polarity and any negative sign.",
     "Keep the blue LED aligned at the same fixed distance. Record light ON → card BLOCKED → light RESTORED.",
     "Repeat 10 times; check room light ON and OFF. Do not touch the sensor leads or adjust alignment during a reading."],
    [connection("Unpowered RED sensing LED lead A","Fluke V/mV input","Meter only; absolutely NO receiver battery.", "measurement"),
     connection("Unpowered RED sensing LED lead B","Fluke COM","Do not bridge this LED into the warning-output circuit.", "measurement")],
    test("10 real ON/BLOCKED/RESTORED DC millivolt trials","Look for repeatable same-polarity light/block contrast above drift; no value is assumed.","Use McGruber P01 EXPERIMENT_B_MEASUREMENTS.csv; leave results NOT_RUN until measured."),
    {gate:"required-physical-evidence",caution:"A few millivolts cannot drive a 2N4401 base directly. Do not connect the red sensor to the transistor."}),
   step("output","Identify the independent silent warning stage",["TW-B-10","TW-B-11","TW-B-12","TW-B-16"],
    "Place the 2N4401, a separate warning LED and its own series resistor on the receiver-side output holder. They do not yet connect to the red sensing LED.",
    ["Identify the exact 2N4401 manufacturer/package and confirm emitter/base/collector orientation from its real datasheet. Pinouts differ among manufacturer drawings.",
     "Check that a separate red warning LED has an independent current-limiting resistor.",
     "A manual base-drive test requires a properly measured base resistor and pull-down arrangement; those values/components have not been qualified here."],
    [connection("Verified output supply +","Measured indicator resistor","Output supply and resistor still to be confirmed.", "conditional"),
     connection("Indicator resistor","Separate WARNING LED anode","Do not confuse warning LED with unpowered sensing LED.", "conditional"),
     connection("Warning LED cathode","2N4401 collector","ONLY after actual C/B/E pin orientation is established.", "conditional"),
     connection("2N4401 emitter","Verified output ground","This is a conceptual low-side switch, not an operational sensor link.", "conditional")],
    test("Only after transistor datasheet/pin verification","Manual proof: indicator reliably toggles with safe controlled base drive; NOT automatic light-break detection.","Record transistor marking, datasheet and current-limited voltage/current measurements."),
    {gate:"conditional-not-built",caution:"STOP if the 2N4401 pinout, LED ratings or safe base resistor is uncertain."}),
   step("missing-amplifier","Critical gap: amplifier and darkness threshold",["TW-B-07","TW-B-09","TW-B-10","TW-B-15"],
    "The orange circuit block and dotted link in 3D are a MISSING interface, deliberately not an actual IC, wire or validated gain stage.",
    ["The red LED photodiode yields a weak light-dependent signal; measure its contrast first.",
     "Choose a real high-impedance amplifier and switching threshold based on those measurements and actual supply/component datasheets.",
     "Add polarity inversion or a darkness comparator so beam present = warning OFF and beam broken = warning ON. Threshold and hysteresis are not selected."],
    [connection("Red LED sensor","HIGH-IMPEDANCE AMPLIFIER: NOT IDENTIFIED","NO physical wire is authorized by this placeholder.", "missing"),
     connection("Amplifier / threshold","2N4401 base-drive network: NOT DESIGNED","Do not assume the orange dotted line is functional.", "missing")],
    test("Design review / future measured prototype","No automatic triggering pass is possible at this stage; identify the actual amplifier before proceeding.","Open gap: measured mV signal, receiver component and proven threshold required."),
    {gate:"BLOCKED",caution:"This stage is intentionally not buildable yet. Do not bridge the sensor straight to the transistor."}),
   step("validate","Final silent beam-break test — not yet qualified",["TW-B-05","TW-B-07","TW-B-09","TW-B-10","TW-B-11","TW-B-14"],
    "Align the separated emitter and receiver mounts only after the real amplifier, threshold and transistor driver have passed electrical checks.",
    ["Power on and confirm the WARNING LED is OFF with the beam present.",
     "Block light without touching either circuit: the warning LED must turn ON; restore light: it must turn OFF.",
     "Repeat 30 intentional crossings and 15 minutes of clear-beam idle time in realistic ambient lighting. Record misses, double counts and false trips."],
    [connection("Beam present","warning OFF","Future physical acceptance condition; NOT verified.", "target"),
     connection("Beam blocked","warning ON","Future physical acceptance condition; NOT verified.", "target")],
    test("Actual standalone physical test, WITHOUT phone or sound","30/30 correct crossings and no false warning during 15-minute idle are targets, not results.","Use a dated physical test record including failures and ambient-light conditions."),
    {gate:"BLOCKED",caution:"Not qualified until the missing amplifier is implemented and real trials are recorded."}),
  ]),
 }),
 C:Object.freeze({
  experiment:"C",title:"Matched invisible infrared → silent warning LED",
  modelPrefix:"TW-C-",expectedParts:15,status:"MATCHED 5 V MODULE NOT CONFIRMED OWNED",
  notice:"This walkthrough is SPECIFIC to an identified Adafruit 2167/2168 open-collector matched pair. Its output logic is documented by the vendor, not measured on McGruber hardware.",
  steps:Object.freeze([
   step("identify","Identify and separate the matched IR modules",["TW-C-03","TW-C-04","TW-C-06","TW-C-07"],
    "The left board holds the two-wire IR emitter. The right holds the corresponding three-wire receiver, its output electronics and the warning light.",
    ["Obtain/identify a genuine matched Adafruit 2167 or 2168 pair. Do not substitute the unidentified R-NZ remote PCB.",
     "Identify transmitter RED (+ power) and BLACK (ground). Identify receiver RED (+ power), BLACK (ground), and WHITE/YELLOW (OUT).",
     "Verify two stable regulated 5 V supplies if the modules are on physically separate sides. A low-load USB bank may turn itself off."],
    [],
    test("Power OFF, component identification","Matching rated emitter and receiver, safe supply ratings and wire colors confirmed.","Record model markings, source and power ratings; no ownership assumed."),
    {gate:"required-hardware",caution:"These modules are rated about 10–20 inches, not 6–15 feet. Do NOT use a 9 V supply on them."}),
   step("mount","Aim emitter at receiver on separate stands",["TW-C-01","TW-C-02","TW-C-04","TW-C-06","TW-C-15"],
    "Face the IR emitter and receiver across a short unobstructed gap. IR is invisible; the cyan line in 3D only shows alignment.",
    ["Start with modules a few inches apart on stable nonconductive supports.",
     "Avoid side light, sunlight and other strong IR sources. Keep the optical path below eye height.",
     "Only extend distance AFTER confirmed electrical HIGH/LOW switching and inside the manufacturer's rated range."],
    [],
    test("Mechanical alignment check","A small opaque card can interrupt the entire optical path without touching either module.","Write alignment distance; do not infer range from the model's millimeters."),
    {gate:"visual-only"}),
   step("emitter-power","Connect the IR transmitter power",["TW-C-03","TW-C-04","TW-C-05"],
    "Use the rated two-wire Adafruit IR transmitter module, which incorporates its intended emitter drive. This is NOT a loose unprotected IR LED.",
    ["Disconnect supply before wiring. Identify correct leads on this specific vendor's module.",
     "Connect RED to regulated +5 V and BLACK to its own supply ground.",
     "With the receiver still disconnected, briefly energize and verify supply voltage. Never stare into infrared emitters."],
    [connection("Transmitter RED lead","Emitter-side regulated +5 V","Use the rated complete module, not a bare IR diode."),
     connection("Transmitter BLACK lead","Emitter-side GND","No separate wire is needed between the emitter and receiver grounds.")],
    test("Fluke DC volts at emitter-side power leads","Supply stays within the selected module's 3.3–5.5 V rating.","Record actual voltage and supply source."),
    {gate:"measure-before-power",caution:"No raw 9 V battery and no bare IR LED connected directly to 5 V."}),
   step("receiver-power","Power the three-wire receiver",["TW-C-06","TW-C-07","TW-C-13"],
    "Keep the receiver supply, output and warning LED together on the right board. GND here is local to this board.",
    ["Power disconnected: receiver RED to regulated +5 V and BLACK to receiver-side GND.",
     "Receiver WHITE/YELLOW is the signal OUT, NOT power or ground.",
     "The two sides communicate only by light; they need not share their supply grounds."],
    [connection("Receiver RED lead","Receiver-side regulated +5 V","Vendor-specified lead color only."),
     connection("Receiver BLACK lead","Receiver-side GND","Common local reference for measurement and warning branch."),
     connection("Receiver WHITE/YELLOW","Receiver OUT node","Keep unconnected until pull-up is checked.", "conditional")],
    test("Fluke DC volts with receiver energized","Measure receiver supply at its local red/black wires; inspect for shorts and heating.","Record actual voltage and module label."),
    {gate:"measure-before-power",caution:"Stop if your receiver is not identified as the vendor's three-wire module."}),
   step("pull-up","Install the 10 kΩ output pull-up and prove logic",["TW-C-06","TW-C-08","TW-C-12","TW-C-13","TW-C-15"],
    "Place a measured 10 kΩ resistor between receiver-side +5 V and the receiver OUT node. This makes the manufacturer's open-collector output readable.",
    ["With power OFF, connect the verified pull-up from receiver +5 V to receiver WHITE/YELLOW OUT.",
     "Power the aligned pair; place the Fluke COM on receiver GND and V input on OUT.",
     "Measure three states: beam clear, card blocking beam, then restored. Adafruit documents OUT HIGH → LOW → HIGH."],
    [connection("Receiver-side +5 V","10 kΩ pull-up resistor","Measure resistance before connecting power."),
     connection("10 kΩ pull-up resistor","Receiver WHITE/YELLOW OUT","Same OUT node read by the Fluke."),
     connection("Fluke COM","Receiver BLACK/GND","DC voltage reference.", "measurement"),
     connection("Fluke DC V","Receiver OUT","Meter only before adding the warning LED.", "measurement")],
    test("Actual Fluke output truth-table check","For specified Adafruit pair only: clear ≈ HIGH; blocked ≈ LOW; restored ≈ HIGH.","Record all three DC voltages. If different, STOP and identify the actual module."),
    {gate:"required-physical-evidence",caution:"Do not add indicator load if polarity or sink behavior is unverified."}),
   step("indicator","Connect the silent red warning LED branch",["TW-C-06","TW-C-08","TW-C-09","TW-C-10","TW-C-11","TW-C-12","TW-C-14"],
    "On the receiver board, place the 1 kΩ resistor in series with the SEPARATE warning LED. Its cathode returns to receiver OUT, not directly to GND.",
    ["Power OFF and only after the HIGH/LOW test passed: identify warning LED anode/cathode.",
     "From receiver-side +5 V, wire through a measured 1 kΩ resistor to warning LED anode. Connect warning LED cathode to OUT.",
     "Power on and check silently: clear = LED OFF; blocked = LED ON; restored = LED OFF. The 3D glow is only a demonstration."],
    [connection("Receiver-side +5 V","1 kΩ warning LED resistor","Resistor must be in series; ~3 mA is only a calculated example."),
     connection("1 kΩ resistor","Red WARNING LED anode (+)","Not the receiver sensor."),
     connection("Red WARNING LED cathode (−)","Receiver WHITE/YELLOW OUT","Open collector should sink current on beam break.")],
    test("Physical silent indicator switching, no microcontroller","OFF → ON → OFF, without touching a switch, for the identified matched pair.","Record actual behavior, resistor value and measured supply. Do not mark PASS from the 3D animation."),
    {gate:"required-physical-evidence",caution:"This direct-LED wiring is model-specific. For DFRobot or remote-control salvage, do NOT assume active-LOW/open-collector behavior."}),
   step("reliability","Repeat silent beam-break and power-loss tests",["TW-C-01","TW-C-02","TW-C-04","TW-C-06","TW-C-10","TW-C-15"],
    "Once the real breadboard reliably switches, secure it with strain relief and aim its red warning indicator where you can see it.",
    ["Perform 30 intentional interruptions; record single correct warning each time.",
     "Leave clear for 15 minutes, with ambient lights on/off as appropriate, and watch for false warnings.",
     "Power-cycle each side: a disconnected receiver can cause warning OFF and is NOT a fail-safe alarm. Record those limitations."],
    [connection("IR beam clear","Silent red warning LED OFF","Real desired outcome, not established by this viewer.", "target"),
     connection("IR beam blocked","Silent red warning LED ON","Real desired outcome, not established by this viewer.", "target")],
    test("Actual 30-crossing / 15-minute idle test","Targets: 30/30 intended warnings, zero false triggers during idle, known behavior after disconnect.","Record misses, false triggers, restart behavior and maximum reliably demonstrated distance."),
    {gate:"required-physical-evidence",caution:"Never claim 15-ft range from a vendor-rated 10–20-inch module. Not a security or life-safety device."}),
  ]),
 }),
});

export function tripwireGuide(experiment){
 return experiment==="B"||experiment==="C"?TRIPWIRE_GUIDES[experiment]:null;
}
export function guideStep(experiment,index){
 const guide=tripwireGuide(experiment);
 if(!guide||!Number.isSafeInteger(index)||index<0||index>=guide.steps.length)return null;
 return guide.steps[index];
}
export function guideIndex(input,count){
 // URL index is 1-based, with a safe default. No arbitrary JavaScript or paths.
 if(typeof input!=="string"||!/^[1-9]\d{0,2}$/.test(input))return 0;
 const n=Number(input);
 return n>=1&&n<=count?n-1:0;
}
export function validateGuide(guide,ids){
 if(!guide||!Array.isArray(ids)||ids.length!==guide.expectedParts)return false;
 const known=new Set(ids);
 if(known.size!==ids.length)return false;
 const steps=guide.steps;
 return steps.length>=5&&steps.every(s=>
  s.key&&s.title&&s.placement&&s.instructions.length>0&&s.parts.length>0&&
  s.parts.every(p=>known.has(p))&&
  ["visual-only","measure-before-power","required-physical-evidence",
   "required-hardware","conditional-not-built","BLOCKED"].includes(s.gate)&&
  s.connections.every(c=>c.from&&c.to&&c.note&&
    ["conditional","measurement","missing","target"].includes(c.kind))&&
  s.checkpoint.task&&s.checkpoint.observation&&s.checkpoint.record);
}
