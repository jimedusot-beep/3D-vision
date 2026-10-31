import {createJoint, setJointValue, validateJointTravel} from './joints.js';

// The panel owns controls; joint definitions and poses live in the saved scene.
export function jointPanel({root, selected, mutate, checkpoint, resetPreview, changed, poseChanged, invalidate, status, run, dialog, field, button, paragraph}) {
  const $ = id => document.getElementById(id);
  let animation = null;
  const list = () => root().userData.joints || [];
  const current = () => list().find(j => j.id === $('joint-list').value);
  const component = id => root().children.find(o => o.userData.id === id);
  function values() {
    const j = current(), locked = component(j?.childId)?.userData.locked;
    $('joint-controls').hidden = !j;
    if (!j) return;
    for (const id of ['joint-value', 'joint-range']) {
      const input = $(id); input.min = j.min; input.max = j.max; input.step = j.type === 'revolute' ? '0.1' : '0.01';
      if (document.activeElement !== input) input.value = Number(j.value.toFixed(3));
      input.disabled = j.type === 'fixed' || locked || !!animation;
    }
    $('joint-unit').textContent = j.type === 'revolute' ? 'Travel in degrees' : j.type === 'prismatic' ? 'Travel in parent-local mm' : 'Fixed relative placement';
    $('joint-apply').disabled = j.type === 'fixed' || locked || !!animation;
    $('joint-animate').disabled = j.type === 'fixed' || locked || j.min === j.max;
    $('joint-animate').textContent = animation ? 'Pause joint' : 'Animate joint';
  }
  function render() {
    const previous = $('joint-list').value;
    $('joint-list').replaceChildren();
    for (const j of list()) $('joint-list').add(new Option(`${j.type} · ${component(j.parentId)?.name || '?'} → ${component(j.childId)?.name || '?'}`, j.id));
    if (list().some(j => j.id === previous)) $('joint-list').value = previous;
    $('joint-empty').hidden = !!list().length;
    values();
  }
  function stop() {
    if (!animation) return false;
    animation = null; values(); changed(); return true;
  }
  function create() {
    resetPreview();
    const choices = root().children.filter(o => o.userData.component);
    if (choices.length < 2) throw Error('Add at least two top-level components before creating a joint');
    dialog('Create assembly joint', body => {
      paragraph(body, 'Choose a parent and a driven component. Current relative placement becomes the zero reference. These are kinematic mesh joints; they do not simulate forces or solve closed loops.');
      const selector = (label, id, options) => {
        const l = document.createElement('label'); l.textContent = label;
        const input = document.createElement('select'); input.id = id;
        options.forEach(([name, value]) => input.add(new Option(name, value))); body.append(l, input); return input;
      };
      const options = choices.map(o => [o.name, o.userData.id]);
      const parent = selector('Parent component', 'joint-parent', options);
      const child = selector('Driven component', 'joint-child', options);
      const chosen = selected().filter(o => o.parent === root());
      parent.value = chosen[0]?.userData.id || choices[0].userData.id;
      child.value = chosen[1]?.userData.id || choices.find(o => o.userData.id !== parent.value).userData.id;
      const type = selector('Joint type', 'joint-type', [['Fixed placement', 'fixed'], ['Revolute / hinge', 'revolute'], ['Prismatic / slider', 'prismatic']]);
      const axis = selector('Parent-local axis', 'joint-axis', [['X', 'x'], ['Y', 'y'], ['Z', 'z']]); axis.value = 'z';
      const pivot = ['X', 'Y', 'Z'].map(a => { const i = field(body, `Pivot ${a} · parent-local mm`, '0', 'number'); i.id = 'joint-pivot-' + a.toLowerCase(); i.step = '.1'; return i; });
      const min = field(body, 'Minimum travel (° or mm)', '0', 'number'); min.id = 'joint-min';
      const max = field(body, 'Maximum travel (° or mm)', '0', 'number'); max.id = 'joint-max';
      type.onchange = () => { const n = type.value === 'revolute' ? 180 : type.value === 'prismatic' ? 50 : 0; min.value = -n; max.value = n; min.disabled = max.disabled = type.value === 'fixed'; pivot.forEach(i => i.disabled = type.value !== 'revolute'); };
      type.onchange();
      paragraph(body, 'Travel limits must include zero. A component has one driving joint. Remove a joint before grouping its endpoints. Positive uniform scale is required.');
      body.append(button('Create joint', () => {
        const j = mutate(() => createJoint(root(), component(parent.value), component(child.value), {type:type.value, axis:axis.value, anchor:pivot.map(i => Number(i.value)), min:Number(min.value), max:Number(max.value)}));
        render(); $('joint-list').value = j.id; values(); $('dialog').close(); status('Joint created and included in project saves.');
      }, 'accent'));
    });
  }
  $('joint-create').onclick = () => run(create);
  $('joint-list').onchange = () => { stop(); values(); };
  const apply = value => {
    const id = current()?.id, next = Number(value);
    // A validation failure must not call mutate(): its rollback reconstitutes
    // the scene and may disrupt a subsequent animation on mobile WebKit.
    try { validateJointTravel(root(), id, next); }
    catch (error) {
      const j = current();
      if (j) {
        $('joint-value').value = String(Number(j.value.toFixed(3)));
        $('joint-range').value = String(Number(j.value.toFixed(3)));
      }
      throw error;
    }
    mutate(() => setJointValue(root(), id, next));
    values(); status('Joint travel applied.');
  };
  $('joint-apply').onclick = () => run(() => apply($('joint-value').value));
  // One history entry per completed slider gesture, including touch and keyboard.
  $('joint-range').onchange = e => run(() => apply(e.target.value));
  $('joint-remove').onclick = () => run(() => { const id = current()?.id; mutate(() => root().userData.joints = list().filter(j => j.id !== id)); status('Joint removed; current component positions retained.'); });
  $('joint-animate').onclick = () => run(() => {
    if (stop()) return;
    resetPreview(); const j = current(); if (!j || j.type === 'fixed') throw Error('Choose a moving joint');
    setJointValue(root(), j.id, j.value); checkpoint();
    const phase = Math.asin(Math.max(-1, Math.min(1, 2 * (j.value - j.min) / (j.max - j.min) - 1)));
    animation = {id:j.id, start:performance.now(), phase};
    values();
    // Prime one small pose update immediately. Background/throttled WebKit can
    // delay the first RAF; moving the joint on the actual user command gives
    // immediate feedback while the regular render loop continues animation.
    // This is a transient preview pose, not an extra undo/save checkpoint.
    tick(animation.start + 48);
    if(animation)status('Joint animation running; use Pause joint to hold this pose.');
    invalidate();
  });
  function tick(t) {
    if (!animation) return false;
    const j = list().find(j => j.id === animation.id);
    if (!j) { stop(); return false; }
    try { setJointValue(root(), j.id, j.min + (Math.sin((t - animation.start) / 1500 + animation.phase) + 1) / 2 * (j.max - j.min)); values(); poseChanged(); }
    catch (e) { stop(); status(e.message, true); }
    return !!animation;
  }
  return {render, stop, tick, get active() { return !!animation; }};
}
