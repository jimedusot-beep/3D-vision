// Pure, dependency-free scrubbing of diagnostic text before display or export.
// Best-effort minimization, not a guarantee that every possible secret is detected.
export function redactDiagnosticText(value) {
 let text = String(value ?? '');
 // URLs may contain credentials in query/fragment; retain only the address
 // before ? or #. Covers http(s), ws(s), file and www-style links.
 text = text.replace(/\b(?:https?|wss?|file):\/\/[^\s<>"'\x60]+|\bwww\.[^\s<>"'\x60]+/gi, url => {
  const q=url.indexOf('?'), h=url.indexOf('#');
  const cut=Math.min(q<0?url.length:q,h<0?url.length:h);
  return cut===url.length?url:url.slice(0,cut)+'[REDACTED_URL_PARAMS]';
 });
 // Root/relative URLs are also possible in errors, e.g. /api?token=secret.
 text = text.replace(/(^|[\s(])((?:\.{0,2}\/|\/)[^\s?#<>"'\x60]+)[?#][^\s<>"'\x60]+/gm,
  (_match,before,path)=>before+path+'[REDACTED_URL_PARAMS]');
 text = text.replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,'[REDACTED_EMAIL]');
 // Credential-bearing headers and assignments. Only the diagnostic label remains.
 text = text.replace(/\b(Bearer|Basic)[ \t]+[^\s,;'"<>]+/gi,'$1 [REDACTED_TOKEN]');
 text = text.replace(/\b((?:authorization|x-api-key|api[-_ ]?key|access[-_ ]?token|refresh[-_ ]?token|client[-_ ]?secret|password|secret|token)\s*[:=]\s*)(?:"[^"]*"|'[^']*'|[^\s,;&<>]+)/gi,
  '$1[REDACTED_TOKEN]');
 // Recognizable provider/token prefixes and JWTs with long segments.
 text = text.replace(/\b(?:sk-(?:proj-)?|gh[pousr]_|github_pat_|AIza|xox[baprs]-)[A-Za-z0-9_-]{6,}/g,
  '[REDACTED_TOKEN]');
 text = text.replace(/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{8,}(?:\.[A-Za-z0-9_-]{6,})?/g,
  '[REDACTED_TOKEN]');
 // Long hashes, opaque identifiers and base64/base64url-like sequences.
 text = text.replace(/(?<![A-Za-z0-9])[A-Fa-f0-9]{24,}(?![A-Za-z0-9])/g,
  '[REDACTED_LONG_HEX]');
 text = text.replace(/(?<![A-Za-z0-9+/_=-])[A-Za-z0-9+/_-]{32,}={0,2}(?![A-Za-z0-9+/_=-])/g,
  '[REDACTED_OPAQUE]');
 return text;
}
