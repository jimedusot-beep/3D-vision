import * as THREE from 'three';

export function surfaceAnchor(object, worldPoint) {
  object.updateWorldMatrix(true, false);
  return {componentId: object.userData.id, localPoint: object.worldToLocal(worldPoint.clone()).toArray(), point: worldPoint.toArray()};
}
export function resolveAnchor(root, anchor) {
  if (!anchor) return null;
  if (anchor.componentId && anchor.localPoint) {
    let object; root.traverse(o => { if (o.userData.id === anchor.componentId) object = o; });
    if (!object) return null;
    for (let p = object; p; p = p.parent) if (!p.visible) return null;
    return object.localToWorld(new THREE.Vector3().fromArray(anchor.localPoint));
  }
  return Array.isArray(anchor.point) ? new THREE.Vector3().fromArray(anchor.point) : null;
}
export function resolveAnnotation(root, item) {
  if (item.anchors) {
    const points = item.anchors.map(a => resolveAnchor(root, a));
    if (points.some(p => !p)) return null;
    let value;
    if (item.kind === 'distance' && points.length === 2) value = points[0].distanceTo(points[1]);
    else if (item.kind === 'angle' && points.length === 3) {
      const a = points[0].clone().sub(points[1]), b = points[2].clone().sub(points[1]);
      if (a.lengthSq() < 1e-16 || b.lengthSq() < 1e-16) return null;
      value = THREE.MathUtils.radToDeg(a.angleTo(b));
    } else return null;
    return {text: value.toFixed(3) + (item.kind === 'distance' ? ' mm' : '°'), point: points.at(-1), points, value};
  }
  const point = resolveAnchor(root, item);
  return point ? {text: item.text, point, points: []} : null;
}
export function validateAnnotations(list = []) {
  if (!Array.isArray(list) || list.length > 100) throw Error('Annotation limit: 100');
  const vector = v => Array.isArray(v) && v.length === 3 && v.every(x => Number.isFinite(x) && Math.abs(x) <= 1e8);
  const anchor = a => a && (a.componentId ? typeof a.componentId === 'string' && vector(a.localPoint) : vector(a.point));
  for (const item of list) {
    if (item.anchors) {
      const n = item.kind === 'distance' ? 2 : item.kind === 'angle' ? 3 : 0;
      if (!n || !Array.isArray(item.anchors) || item.anchors.length !== n || !item.anchors.every(anchor)) throw Error('Invalid surface measurement');
    } else if (!anchor(item) || typeof item.text !== 'string' || item.text.length > 500) throw Error('Invalid annotation');
  }
}
