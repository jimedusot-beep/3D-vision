// Explicit, allowlisted deep links into repository-owned example models.
// Do not fetch arbitrary URLs from query parameters.
export const EXAMPLE_MODELS = Object.freeze({
  "mcgruber-tripwire-exploded": Object.freeze({
    path: "EXPERIMENTS/002_MCGRUBER_TRIPWIRE/exploded.obj",
    name: "McGruber tripwire · exploded concept",
    options: Object.freeze({ units: "mm", up: "y" }),
    expectedParts: 13,
    verifiedFit: false,
  }),
  "mcgruber-tripwire-assembled": Object.freeze({
    path: "EXPERIMENTS/002_MCGRUBER_TRIPWIRE/assembled.obj",
    name: "McGruber tripwire · assembled concept",
    options: Object.freeze({ units: "mm", up: "y" }),
    expectedParts: 13,
    verifiedFit: false,
  }),
});
export function exampleModel(id) {
  if (typeof id !== "string" || !Object.prototype.hasOwnProperty.call(EXAMPLE_MODELS, id))
    return null;
  return EXAMPLE_MODELS[id];
}
