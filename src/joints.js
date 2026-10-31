import * as THREE from 'three';

const TYPES = new Set(['fixed', 'revolute', 'prismatic']);
const MAX_JOINTS = 100;
const axisVector = axis => new THREE.Vector3(axis === 'x' ? 1 : 0, axis === 'y' ? 1 : 0, axis === 'z' ? 1 : 0);
const componentMap = root => new Map(root.children.filter(o => o.userData.component).map(o => [o.userData.id, o]));
const isLocked = object => { for (let p = object; p; p = p.parent) if (p.userData.locked) return true; return false; };

function assertRigid(matrix) {
  const position = new THREE.Vector3(), rotation = new THREE.Quaternion(), scale = new THREE.Vector3();
  matrix.decompose(position, rotation, scale);
  if (Math.min(...scale.toArray()) <= 0 || Math.max(scale.x, scale.y, scale.z) - Math.min(scale.x, scale.y, scale.z) > 1e-6) {
    throw Error('Joint endpoints need positive uniform scale. Apply the source transform or remove nonuniform scale first.');
  }
  const rebuilt = new THREE.Matrix4().compose(position, rotation, scale);
  if (rebuilt.elements.some((v, i) => Math.abs(v - matrix.elements[i]) > 1e-5)) throw Error('Joint endpoints cannot contain shear.');
}

export function validateJointDefinitions(joints = [], endpointIds) {
  if (!Array.isArray(joints) || joints.length > MAX_JOINTS) throw Error('Joint limit: 100');
  const ids = new Set(), driven = new Set(), graph = new Map();
  for (const j of joints) {
    if (!j || typeof j.id !== 'string' || ids.has(j.id) || !TYPES.has(j.type)) throw Error('Invalid joint definition');
    if (typeof j.parentId !== 'string' || typeof j.childId !== 'string' || j.parentId === j.childId) throw Error('A joint needs two different components');
    if (endpointIds && (!endpointIds.has(j.parentId) || !endpointIds.has(j.childId))) throw Error('Joint endpoints must remain top-level components. Remove the joint before grouping them.');
    if (driven.has(j.childId)) throw Error('A component can have only one driving joint');
    if (!['x', 'y', 'z'].includes(j.axis) || !Array.isArray(j.anchor) || j.anchor.length !== 3 || j.anchor.some(v => !Number.isFinite(v) || Math.abs(v) > 1e6)) throw Error('Invalid joint axis or pivot');
    if (!Array.isArray(j.base) || j.base.length !== 16 || j.base.some(v => !Number.isFinite(v) || Math.abs(v) > 1e7)) throw Error('Invalid joint placement');
    if (![j.min, j.max, j.value].every(Number.isFinite) || j.min > j.max || j.value < j.min || j.value > j.max || Math.max(Math.abs(j.min), Math.abs(j.max)) > 1e6) throw Error('Joint value is outside its travel limits');
    if (j.type === 'fixed' && (j.value !== 0 || j.min !== 0 || j.max !== 0)) throw Error('Fixed joints have no travel');
    const base = new THREE.Matrix4().fromArray(j.base);
    if (Math.abs(base.determinant()) < 1e-12 || [3, 7, 11].some(i => Math.abs(j.base[i]) > 1e-9) || Math.abs(j.base[15] - 1) > 1e-9) throw Error('Joint placement must be an invertible affine transform');
    assertRigid(base);
    ids.add(j.id); driven.add(j.childId);
    graph.set(j.parentId, [...(graph.get(j.parentId) || []), j.childId]);
  }
  const visiting = new Set(), visited = new Set();
  const visit = id => {
    if (visiting.has(id)) throw Error('Joint cycles are not supported');
    if (visited.has(id)) return;
    visiting.add(id);
    for (const next of graph.get(id) || []) visit(next);
    visiting.delete(id); visited.add(id);
  };
  for (const id of graph.keys()) visit(id);
  return joints;
}

export function pruneMissingJoints(root) {
  const ids = new Set(); root.traverse(o => { if (o.userData.component) ids.add(o.userData.id); });
  const joints = root.userData.joints || [];
  root.userData.joints = joints.filter(j => ids.has(j.parentId) && ids.has(j.childId));
  return joints.length - root.userData.joints.length;
}

export function createJoint(root, parent, child, {type = 'fixed', axis = 'z', anchor = [0, 0, 0], min, max} = {}) {
  if (parent?.parent !== root || child?.parent !== root) throw Error('Select two top-level components, or their top-level visual groups.');
  if (isLocked(child)) throw Error('Unlock the driven component before creating a joint');
  root.updateMatrixWorld(true);
  assertRigid(parent.matrixWorld); assertRigid(child.matrixWorld);
  const joint = {
    id: THREE.MathUtils.generateUUID(), type, axis, anchor: [...anchor],
    parentId: parent.userData.id, childId: child.userData.id,
    base: parent.matrixWorld.clone().invert().multiply(child.matrixWorld).toArray(),
    min: min ?? (type === 'revolute' ? -180 : type === 'prismatic' ? -50 : 0),
    max: max ?? (type === 'revolute' ? 180 : type === 'prismatic' ? 50 : 0), value: 0,
  };
  const list = [...(root.userData.joints || []), joint];
  validateJointDefinitions(list, new Set(componentMap(root).keys()));
  root.userData.joints = list;
  return joint;
}

export function jointFor(root, object) {
  for (let p = object; p && p !== root; p = p.parent) {
    const j = (root.userData.joints || []).find(j => j.childId === p.userData.id);
    if (j) return j;
  }
  return null;
}

export function applyJoints(root) {
  const objects = componentMap(root), list = validateJointDefinitions(root.userData.joints || [], new Set(objects.keys()));
  root.updateMatrixWorld(true);
  const byChild = new Map(list.map(j => [j.childId, j])), done = new Set();
  const apply = j => {
    if (done.has(j.id)) return;
    if (byChild.has(j.parentId)) apply(byChild.get(j.parentId));
    const parent = objects.get(j.parentId), child = objects.get(j.childId);
    parent.updateWorldMatrix(true, false); assertRigid(parent.matrixWorld);
    const motion = new THREE.Matrix4();
    if (j.type === 'revolute') {
      const a = new THREE.Vector3().fromArray(j.anchor);
      motion.makeTranslation(a.x, a.y, a.z)
        .multiply(new THREE.Matrix4().makeRotationAxis(axisVector(j.axis), THREE.MathUtils.degToRad(j.value)))
        .multiply(new THREE.Matrix4().makeTranslation(-a.x, -a.y, -a.z));
    } else if (j.type === 'prismatic') {
      const d = axisVector(j.axis).multiplyScalar(j.value); motion.makeTranslation(d.x, d.y, d.z);
    }
    const world = parent.matrixWorld.clone().multiply(motion).multiply(new THREE.Matrix4().fromArray(j.base));
    child.parent.updateWorldMatrix(true, false);
    child.parent.matrixWorld.clone().invert().multiply(world).decompose(child.position, child.quaternion, child.scale);
    child.updateMatrixWorld(true); done.add(j.id);
  };
  list.forEach(apply);
  return list.length;
}

// Pure validation: reject invalid input without checkpointing, rebuilding
// scene objects or disturbing the currently valid pose/undo history.
export function validateJointTravel(root, id, value) {
  const joint = (root.userData.joints || []).find(j => j.id === id);
  if (!joint) throw Error('Select a joint first');
  const child = componentMap(root).get(joint.childId);
  if (!child || isLocked(child)) throw Error('Unlock the driven component before changing joint travel');
  if (!Number.isFinite(value) || value < joint.min || value > joint.max) throw Error(`Joint travel must be between ${joint.min} and ${joint.max}`);
  if (joint.type === 'fixed' && value !== 0) throw Error('Fixed joints have no travel');
  return joint;
}
export function setJointValue(root, id, value) {
  const joint = validateJointTravel(root, id, value);
  const previous = joint.value;
  joint.value = value;
  try { applyJoints(root); } catch (e) { joint.value = previous; throw e; }
  return joint;
}
