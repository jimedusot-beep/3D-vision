import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { exampleModel, EXAMPLE_MODELS } from "../src/example-models.js";

const dir = new URL("../EXPERIMENTS/002_MCGRUBER_TRIPWIRE/", import.meta.url);
const manifest = JSON.parse(await readFile(new URL("assembly_manifest.json", dir), "utf8"));

function meshParts(object) {
  const parts = [];
  object.traverse((o) => {
    if (o.isMesh) {
      const attr = o.geometry.getAttribute("position");
      if (!attr || attr.count < 3) throw new Error("Invalid mesh without vertices");
      for (const v of attr.array) assert.ok(Number.isFinite(v));
      parts.push({ name: o.name, points: attr.array, triangles: attr.count / 3 });
    }
  });
  return parts;
}

test("one-click example routes are allowlisted, Y-up, in millimetres and nonfabrication", () => {
  assert.equal(Object.keys(EXAMPLE_MODELS).length, 6);
  const importedModels=Object.values(EXAMPLE_MODELS).filter(item=>!item.kind);
  const generatedModels=Object.values(EXAMPLE_MODELS).filter(item=>item.kind==='procedural');
  assert.equal(importedModels.length,2);
  assert.equal(generatedModels.length,4);
  assert.equal(exampleModel("mcgruber-tripwire-exploded")?.expectedParts, 13);
  assert.equal(exampleModel("mcgruber-tripwire-assembled")?.expectedParts, 13);
  assert.equal(exampleModel("../../.env"), null);
  assert.equal(exampleModel("https://evil.example/model.obj"), null);
  assert.equal(exampleModel(null), null);
  for (const item of importedModels) {
    assert.match(item.path, /^EXPERIMENTS\/002_MCGRUBER_TRIPWIRE\/(assembled|exploded)\.obj$/);
    assert.deepEqual(item.options, { units: "mm", up: "y" });
    assert.equal(item.verifiedFit, false);
  }
  assert.equal(manifest.model.hardware_tested, false);
  assert.equal(manifest.model.physical_dimensions_verified, false);
});

test("13 source-derived OBJ meshes remain independently named with consistent exploded offsets", async () => {
  const loader = new OBJLoader();
  const assembled = meshParts(loader.parse(await readFile(new URL("assembled.obj", dir), "utf8")));
  const exploded = meshParts(loader.parse(await readFile(new URL("exploded.obj", dir), "utf8")));
  const ids = manifest.parts.map((p) => p.id);
  assert.deepEqual(assembled.map((p) => p.name), ids);
  assert.deepEqual(exploded.map((p) => p.name), ids);
  assert.equal(assembled.length, 13);
  for (let i = 0; i < 13; i++) {
    assert.equal(assembled[i].triangles, exploded[i].triangles);
    for (let axis = 0; axis < 3; axis++) {
      const offset = exploded[i].points[axis] - assembled[i].points[axis];
      assert.ok(Math.abs(offset - manifest.parts[i].explode_offset_illustrative_mm[axis]) < .001,
        `${ids[i]} axis ${axis}: ${offset}`);
    }
  }
});
