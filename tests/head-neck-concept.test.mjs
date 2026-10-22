import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const root = new URL('../', import.meta.url);
const base = new URL('EXPERIMENTS/002_HEAD_NECK_KINEMATICS/', root);
const manifest = JSON.parse(readFileSync(new URL('study-manifest.json', base), 'utf8'));
const scad = readFileSync(new URL('Head_Neck_Kinematics.scad', base), 'utf8');
const original = readFileSync(new URL('HERBIE_V1/CAD/HERBIE_V1_Master.scad', root), 'utf8');
const inventory = readFileSync(new URL('HERBIE_V1/PARTS.csv', root), 'utf8');

test('study never implies approved/printable/verified hardware', () => {
  assert.equal(manifest.design_status, 'DIGITAL_KINEMATICS_STUDY_UNVERIFIED');
  for (const key of [
    'actuator_selected', 'mounting_fit_verified', 'collision_free_verified',
    'real_head_mass_measured', 'center_of_gravity_measured',
    'bearing_strength_verified', 'print_ready',
    'physical_actuation_enabled', 'new_production_part_numbers_allocated',
  ]) assert.equal(manifest[key], false, key);
  for (const axis of manifest.conceptual_kinematic_axes)
    assert.equal(axis.hardware_limit_verified, false);
});

test('HBR-005 remains fixed and production inventory unchanged by this study', () => {
  assert.match(inventory, /HBR-005,Fixed_Neck,PROVISIONAL_UNTESTED/);
  assert.deepEqual(manifest.existing_part_affected, {
    id: 'HBR-005', name: 'Fixed_Neck', replacement_approved: false,
  });
  assert.doesNotMatch(inventory, /HBR-019/);
});

function scadValue(name) {
  const match = original.match(new RegExp('(?:^|\\n)' + name + '\\s*=\\s*([0-9.]+)\\s*;'));
  assert.ok(match, 'master CAD property missing: ' + name);
  return Number(match[1]);
}

test('nominal head and torso envelope references agree with CAD source', () => {
  assert.equal(manifest.source_envelope_mm.head.width, scadValue('head_w'));
  assert.equal(manifest.source_envelope_mm.head.depth, scadValue('head_d'));
  assert.equal(manifest.source_envelope_mm.head.height, scadValue('head_h'));
  assert.equal(manifest.source_envelope_mm.torso.width, scadValue('torso_w'));
  assert.equal(manifest.source_envelope_mm.torso.depth, scadValue('torso_d'));
  assert.equal(manifest.source_envelope_mm.torso.nominal_top_z, 320);
  assert.equal(manifest.source_envelope_mm.head.nominal_center_z,
    355 + scadValue('head_h') / 2);
});

test('conceptual axes are pan Z, tilt X and not approved travel bounds', () => {
  const [pan, tilt] = manifest.conceptual_kinematic_axes;
  assert.deepEqual([pan.name, pan.axis], ['pan', '+Z']);
  assert.deepEqual([tilt.name, tilt.axis], ['tilt', '+X']);
  assert.match(scad, /rotate\(\[0, 0, pan_angle\]\)/);
  assert.match(scad, /rotate\(\[tilt_angle, 0, 0\]\)/);
  assert.match(scad, /pan_preview_deg\s*=\s*0/);
  assert.match(scad, /tilt_preview_deg\s*=\s*0/);
  assert.match(scad, /NOT.*printable servo mount/);
});
