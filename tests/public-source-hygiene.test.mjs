// Public repository guard: only checks tracked file paths, not file contents or history.
// A .gitignore rule does not prevent `git add -f`, so fail the normal unit suite
// if an obviously private export or credential filename is already tracked.
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const forbiddenDirs = new Set(['secrets', 'private', 'private-data', 'local-evidence', 'bench-evidence']);
const forbiddenSuffixes = ['.pem', '.key', '.p12', '.pfx', '.3dv', '.sqlite', '.sqlite3'];

export function unsafeTrackedPath(name) {
  const parts = name.replaceAll('\\', '/').split('/');
  const base = parts.at(-1).toLowerCase();
  if (parts.some(part => forbiddenDirs.has(part.toLowerCase()))) return true;
  if ((base === '.env' || base.startsWith('.env.')) && base !== '.env.example') return true;
  return forbiddenSuffixes.some(ext => base.endsWith(ext));
}

test('public site repository does not track obvious private artifacts', () => {
  // GitHub Actions checks out Git; a local archive without Git should fail visibly.
  const tracked = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' })
    .split('\0').filter(Boolean);
  const bad = tracked.filter(unsafeTrackedPath);
  assert.deepEqual(bad, [], 'Remove tracked private files, inspect Git history and rotate exposed keys');
});

test('guard recognizes private files while allowing open-source model files', () => {
  for (const name of ['.env', 'build/.env.local', 'secrets/config.json', 'private/brain.glb',
      'project.3dv', 'bench-evidence/measurements.csv', 'local-evidence/sample.txt',
      'keys/client.pem', 'local.sqlite3']) {
    assert.equal(unsafeTrackedPath(name), true, name);
  }
  for (const name of ['.env.example', 'public/models/ear.glb', 'HERBIE_V1/PARTS.csv',
      'THIRD_PARTY_NOTICES.md', 'tests/public-source-hygiene.test.mjs']) {
    assert.equal(unsafeTrackedPath(name), false, name);
  }
});
