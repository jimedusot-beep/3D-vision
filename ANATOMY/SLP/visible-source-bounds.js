// World-space bounds for the source meshes the learner can ACTUALLY see.
// Three.js Box3.setFromObject() includes hidden meshes, so it can frame a
// tiny isolated ear ossicle as if the complete source model were visible.
// Static, verified source geometry only: no anatomy or transforms are altered.
export function visibleSourceBounds(THREE, object) {
  if (!object || typeof object.updateMatrixWorld !== 'function')
    throw new TypeError('A source model is required to measure visible geometry');
  object.updateMatrixWorld(true);
  const bounds = new THREE.Box3();
  function visit(node) {
    // A hidden ancestor also hides all its descendants in the renderer.
    if (node.visible === false) return;
    if (node.isMesh && node.geometry) {
      if (!node.geometry.boundingBox) node.geometry.computeBoundingBox();
      if (node.geometry.boundingBox && !node.geometry.boundingBox.isEmpty())
        bounds.union(node.geometry.boundingBox.clone().applyMatrix4(node.matrixWorld));
    }
    for (const child of node.children) visit(child);
  }
  visit(object);
  return bounds;
}
