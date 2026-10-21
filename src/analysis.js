import * as THREE from 'three';
import {MeshBVH} from 'three-mesh-bvh';
import {inspect, validateGeometry} from './core.js';

import {ANALYSIS_LIMITS} from './analysis-limits.js';
export {ANALYSIS_LIMITS} from './analysis-limits.js';
const parser = new THREE.BufferGeometryLoader();
const vec = () => new THREE.Vector3();

function prepare(item) {
  const geometry = parser.parse(item.geometry);
  validateGeometry(geometry);
  const mesh = new THREE.Mesh(geometry);
  const topology = inspect(mesh);
  const bvh = new MeshBVH(geometry, {indirect: true, maxLeafSize: 8});
  geometry.boundsTree = bvh;
  geometry.computeBoundingBox();
  const size = geometry.boundingBox.getSize(vec()).length();
  return {...item, geometry, bvh, topology, epsilon: Math.max(1e-7, size * 1e-8)};
}
function release(items) { for (const item of items) { item.geometry.dispose(); delete item.geometry.boundsTree; } }
function prepareAll(items) {
  if (!Array.isArray(items) || !items.length || items.length > ANALYSIS_LIMITS.meshes) throw Error('Select between 1 and 40 meshes for analysis');
  const prepared = []; let triangles = 0;
  try {
    for (const item of items) {
      const n = (item.geometry.data?.index?.array?.length ?? item.geometry.data?.attributes?.position?.array?.length / 3) / 3;
      triangles += n;
      if (!Number.isFinite(triangles) || triangles > ANALYSIS_LIMITS.triangles) throw Error('Analysis limit: 300,000 combined triangles. Select fewer components.');
      prepared.push(prepare(item));
    }
    return prepared;
  } catch (e) { release(prepared); throw e; }
}

// One representative vertex per connected surface shell catches full containment
// even when two meshes never intersect at their surfaces.
function shellVertices(geometry) {
  const p = geometry.attributes.position, index = geometry.index;
  const count = (index?.count ?? p.count) / 3;
  const parent = Array.from({length: count}, (_, i) => i), owners = new Map();
  const find = a => { while (parent[a] !== a) { parent[a] = parent[parent[a]]; a = parent[a]; } return a; };
  for (let t = 0; t < count; t++) {
    for (let j = 0; j < 3; j++) {
      const i = index ? index.getX(t * 3 + j) : t * 3 + j;
      const key = [p.getX(i), p.getY(i), p.getZ(i)].map(v => Math.round(v * 1e5)).join(',');
      if (owners.has(key)) parent[find(t)] = find(owners.get(key)); else owners.set(key, t);
    }
  }
  const samples = new Map();
  for (let t = 0; t < count; t++) {
    const id = find(t);
    if (!samples.has(id)) samples.set(id, vec().fromBufferAttribute(p, index ? index.getX(t * 3) : t * 3));
  }
  if (samples.size > 512) throw Error('Containment check is limited to 512 connected shells per mesh');
  return [...samples.values()];
}
function inside(item, point) {
  const directions = [[1, .371, .129], [.217, 1, .413], [.139, .287, 1]];
  const votes = directions.map(direction => {
    const ray = new THREE.Ray(point, new THREE.Vector3(...direction).normalize());
    const hits = item.bvh.raycast(ray, THREE.DoubleSide, item.epsilon);
    const distances = hits.map(h => h.distance).sort((a, b) => a - b);
    let crossings = 0, previous = -Infinity;
    for (const d of distances) if (d - previous > item.epsilon * 4) { crossings++; previous = d; }
    return crossings % 2;
  });
  return votes.every(v => v === votes[0]) ? !!votes[0] : null;
}
function containsShell(container, other) {
  let ambiguous = false;
  for (const point of other.shells ??= shellVertices(other.geometry)) {
    const result = inside(container, point);
    if (result) return true;
    if (result === null) ambiguous = true;
  }
  return ambiguous ? null : false;
}

export function analyzeInterference(items, {clearance = .2, progress = () => {}} = {}) {
  if (!Number.isFinite(clearance) || clearance < 0 || clearance > 10000) throw Error('Clearance must be between 0 and 10,000 mm');
  const list = prepareAll(items), results = [];
  const total = list.length * (list.length - 1) / 2;
  let checked = 0, candidates = 0;
  try {
    for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
      const a = list[i], b = list[j], boxA = a.geometry.boundingBox, boxB = b.geometry.boundingBox;
      const expanded = boxA.clone().expandByScalar(clearance);
      if (!expanded.intersectsBox(boxB)) { progress({checked: ++checked, total}); continue; }
      candidates++;
      let kind = 'clear', detail = '', distance;
      if (boxA.intersectsBox(boxB) && a.bvh.intersectsGeometry(b.geometry, new THREE.Matrix4())) {
        kind = 'surface'; detail = 'Triangle surfaces intersect or touch; positive overlap volume is not inferred.';
      } else if (a.topology.closed && b.topology.closed && boxA.intersectsBox(boxB)) {
        const ab = containsShell(a, b), ba = containsShell(b, a);
        if (ab || ba) { kind = 'containment'; detail = 'A closed surface shell is inside the other mesh (ray parity).'; }
        else if (ab === null || ba === null) { kind = 'uncertain'; detail = 'Containment rays disagree; inspect this pair manually.'; }
      } else if (boxA.intersectsBox(boxB) && (!a.topology.closed || !b.topology.closed)) {
        kind = 'uncertain'; detail = 'No surface intersection, but open/inconsistent topology prevents a solid containment decision.';
      }
      if (kind === 'clear') {
        const near = a.bvh.closestPointToGeometry(b.geometry, new THREE.Matrix4(), {}, {}, 0, clearance + 1e-6);
        if (near && near.distance <= clearance) { kind = 'clearance'; distance = near.distance; detail = 'Surface separation is within your clearance threshold.'; }
      }
      results.push({a: a.id, b: b.id, names: [a.name, b.name], kind, detail, ...(distance === undefined ? {} : {distance})});
      progress({checked: ++checked, total});
    }
    return {type: 'interference', units: 'mm', clearance, checked, candidates, results,
      limitations: 'Triangle contact and closed-shell containment use floating-point geometry. Self intersections, exact overlap volume and mechanical contact tolerances are not certified.'};
  } finally { release(list); }
}

export function analyzeThickness(items, {threshold = 1.2, samples = 256, progress = () => {}} = {}) {
  if (!Number.isFinite(threshold) || threshold <= 0 || threshold > 10000) throw Error('Thickness warning threshold must be positive and at most 10,000 mm');
  if (!Number.isInteger(samples) || samples < 12 || samples > ANALYSIS_LIMITS.samples) throw Error('Choose 12–512 thickness samples');
  const list = prepareAll(items), results = [];
  try {
    for (const [meshIndex, item] of list.entries()) {
      const report = {id: item.id, name: item.name, closed: item.topology.closed, triangles: item.topology.triangles, samples: 0, unresolved: 0, thin: 0, witnesses: []};
      if (!item.topology.closed || Math.abs(item.topology.signedVolume) < 1e-10) {
        report.reason = 'Closed, consistently oriented nonzero-volume topology is required. Wall thickness was not evaluated.';
        results.push(report); progress({checked: meshIndex + 1, total: list.length}); continue;
      }
      const geometry = item.geometry, p = geometry.attributes.position, index = geometry.index;
      const count = Math.min(samples, item.topology.triangles), widths = [];
      const a = vec(), b = vec(), c = vec();
      for (let sample = 0; sample < count; sample++) {
        const t = Math.floor(sample * item.topology.triangles / count);
        a.fromBufferAttribute(p, index ? index.getX(t * 3) : t * 3);
        b.fromBufferAttribute(p, index ? index.getX(t * 3 + 1) : t * 3 + 1);
        c.fromBufferAttribute(p, index ? index.getX(t * 3 + 2) : t * 3 + 2);
        const normal = b.clone().sub(a).cross(c.clone().sub(a)).normalize().multiplyScalar(item.topology.signedVolume > 0 ? -1 : 1);
        const start = a.clone().add(b).add(c).multiplyScalar(1 / 3);
        const ray = new THREE.Ray(start.clone().addScaledVector(normal, item.epsilon), normal);
        const hit = item.bvh.raycastFirst(ray, THREE.DoubleSide, item.epsilon);
        report.samples++;
        if (!hit) { report.unresolved++; continue; }
        const width = hit.distance + item.epsilon;
        widths.push(width);
        if (width < threshold) {
          report.thin++;
          if (report.witnesses.length < ANALYSIS_LIMITS.witnesses) report.witnesses.push({start: start.toArray(), end: hit.point.toArray(), width});
        }
      }
      widths.sort((a, b) => a - b);
      if (widths.length) { report.minimum = widths[0]; report.median = widths[Math.floor(widths.length / 2)]; report.p05 = widths[Math.floor(widths.length * .05)]; }
      results.push(report); progress({checked: meshIndex + 1, total: list.length});
    }
    return {type: 'thickness', units: 'mm', threshold, results,
      limitations: 'Sampled inward-normal ray lengths only. Small features, tangential walls, self intersections and unsampled thin regions can be missed. This is not the true minimum thickness or a print-readiness certificate.'};
  } finally { release(list); }
}
