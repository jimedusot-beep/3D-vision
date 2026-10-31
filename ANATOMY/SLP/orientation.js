// Anatomical sides belong to the modeled subject, not the observer.
// In an anterior view (camera at +Z looking toward -Z), +X is the subject's
// left, which appears to the right of the viewer. Display units are arbitrary.
export const SUBJECT_X=Object.freeze({left:1,right:-1});
export function sideX(side,magnitude) {
  if(!Object.prototype.hasOwnProperty.call(SUBJECT_X,side) || !Number.isFinite(magnitude) || magnitude<0)
    throw new RangeError('Expected anatomical side and nonnegative finite distance');
  return SUBJECT_X[side]*magnitude;
}
