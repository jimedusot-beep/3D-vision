// Public, versioned command parser; no arbitrary code, network, or hardware control.
export const VERSION = 1;
export const ACTIONS = Object.freeze(['open','select','isolate','transparency','labels','reset']);
export function parseCommand(data, structureIds) {
  if (!data || typeof data !== 'object' || Array.isArray(data) ||
      data.source !== 'herbie' || data.version !== VERSION ||
      typeof data.action !== 'string' || !ACTIONS.includes(data.action)) {
    return {ok:false,reason:'invalid_command'};
  }
  const id = data.structureId;
  if ((data.action === 'select' || data.action === 'isolate') &&
      (typeof id !== 'string' || !structureIds.has(id))) return {ok:false,reason:'unknown_structure'};
  if (data.action === 'open' && id !== undefined && (typeof id !== 'string' || !structureIds.has(id))) {
    return {ok:false,reason:'unknown_structure'};
  }
  if ((data.action === 'transparency' || data.action === 'labels') &&
      typeof data.enabled !== 'boolean') return {ok:false,reason:'invalid_enabled'};
  if (data.requestId !== undefined &&
      (typeof data.requestId !== 'string' || data.requestId.length > 80)) {
    return {ok:false,reason:'invalid_request_id'};
  }
  return {ok:true,action:data.action,structureId:id,enabled:data.enabled,requestId:data.requestId};
}


// Accept only a canonical parent *origin*, not an arbitrary URL with embedded
// credentials, paths, fragments or query data. This is transport filtering,
// never an authentication mechanism: the embedder controls its own URL.
export function resolveEmbedOrigin(raw, fallbackOrigin) {
  if(typeof raw!=='string'||raw.length>2048)return fallbackOrigin;
  try {
    const url=new URL(raw);
    const localHttp=url.protocol==='http:'&&
      ['localhost','127.0.0.1','[::1]'].includes(url.hostname);
    if(!localHttp&&url.protocol!=='https:')return fallbackOrigin;
    if(url.username||url.password||url.search||url.hash||url.pathname!=='/')
      return fallbackOrigin;
    return url.origin;
  }catch{
    return fallbackOrigin;
  }
}
