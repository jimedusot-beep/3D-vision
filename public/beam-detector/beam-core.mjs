// Camera-independent detection and evidence logic. No browser or storage side effects.
const validScore = n => Number.isFinite(n) && n >= 0 && n <= 255;
export class BeamDetector {
  constructor() { this.count = 0; this.disarm(); }
  disarm() { this.state = 'disarmed'; this.reference = null; this.lastTime = null; this.candidate = null; this.since = null; }
  arm(samples, mode = 'red') {
    this.disarm();
    if (!Array.isArray(samples) || samples.length < 12 || !samples.every(validScore)) return {ok:false, reason:'Need at least 12 fresh readings.'};
    const sorted = [...samples].sort((a,b)=>a-b), trimmed = sorted.slice(2,-2);
    const average = trimmed.reduce((s,v)=>s+v,0)/trimmed.length;
    const noise = (sorted.at(-1)-sorted[0])/2;
    const minimum = Math.max(mode === 'red' ? 15 : 19, noise*3);
    if (average < minimum) return {ok:false, reason:`Light ${average.toFixed(1)}; needs ${minimum.toFixed(1)}. Aim closer or reduce glare.`};
    this.reference = average; this.state = 'present';
    return {ok:true, reference:average};
  }
  update(score, time) {
    if (this.state === 'disarmed') return this.state;
    if (!validScore(score) || !Number.isFinite(time) || (this.lastTime !== null && (time <= this.lastTime || time-this.lastTime > 1500))) {
      this.disarm(); return this.state;
    }
    this.lastTime = time;
    const low = Math.max(5,this.reference*.45), high = Math.max(low+3,this.reference*.67);
    const next = score <= low ? 'blocked' : score >= high ? 'present' : null;
    if (!next || next === this.state) { this.candidate=null; this.since=null; return this.state; }
    if (next !== this.candidate) { this.candidate=next; this.since=time; return this.state; }
    if (time-this.since >= 120) {
      if (this.state === 'present' && next === 'blocked') this.count++;
      this.state=next; this.candidate=null; this.since=null;
    }
    return this.state;
  }
}
export class QualificationRun {
  constructor(meta = {}, time, count) {
    this.meta={...meta, idleMs:meta.idleMs === 300000 ? 300000 : 120000};
    this.startedAt=time; this.baseCount=count; this.lastCount=count;
    this.phase='crossings'; this.reason='Make exactly ten crossings without touching the screen.';
    this.idleStart=null; this.observedBreaks=0; this.operatorConfirmed=false; this.idleElapsedMs=0;
  }
  observe(time,count,state) {
    if (!['crossings','idle'].includes(this.phase)) return;
    this.lastCount=count; this.observedBreaks=count-this.baseCount;
    if (state === 'disarmed') { this.interrupt('Detector disarmed or camera unavailable.'); return; }
    if (this.phase === 'idle') {
      this.idleElapsedMs=Math.max(0,time-this.idleStart);
      if (count !== this.idleCount || state !== 'present') { this.phase='failed'; this.reason='False interruption during the stationary test.'; }
      else if (this.idleElapsedMs >= this.meta.idleMs) { this.phase='passed'; this.reason='Ten operator-confirmed crossings and stationary test passed for this setup only.'; }
    }
  }
  finishCrossings(time,count,state,operatorConfirmed) {
    if (this.phase !== 'crossings' || !operatorConfirmed) return false;
    this.observedBreaks=count-this.baseCount; this.operatorConfirmed=true;
    if (this.observedBreaks !== 10 || state !== 'present') {
      this.phase='failed'; this.reason='Need ten counted breaks and beam restored after ten actual crossings.'; return false;
    }
    this.idleCount=count; this.idleStart=time; this.phase='idle'; this.reason='Leave the light uninterrupted and the app in the foreground.'; return true;
  }
  interrupt(reason) { if (['crossings','idle'].includes(this.phase)) {this.phase='interrupted';this.reason=reason;} }
  result() {return {schema:1, ...this.meta, phase:this.phase, reason:this.reason, observedBreaks:this.observedBreaks, operatorConfirmed:this.operatorConfirmed, idleElapsedMs:this.idleElapsedMs, truth:'Crossings, source, distance and lighting reported by operator; camera count measured locally.'};}
}
