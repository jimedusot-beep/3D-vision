// Tiny same-origin entry point. The diagnostics implementation is not fetched
// or evaluated unless this page explicitly opts in with debug=1.
if (new URLSearchParams(location.search).get('debug') === '1') {
 void import('./iphone-diagnostics.js').catch(() => {
  // An optional debug tool must never interrupt the anatomy experience.
  console.warn('Optional SLP diagnostics could not be loaded.');
 });
}
