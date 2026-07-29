const SCRIPT_URL =
  'https://plausible.samrridh.xyz/js/pa-WkTbIq3fhmnWdrWntIjBb.js';

const PASSTHROUGH_HEADERS = [
  'content-type',
  'cache-control',
  'etag',
  'last-modified',
  'content-length',
  'content-encoding',
];

function methodNotAllowed() {
  return new Response('Method Not Allowed', {
    status: 405,
    headers: { Allow: 'GET, HEAD' },
  });
}

function buildResponseHeaders(upstream) {
  const headers = new Headers();
  for (const name of PASSTHROUGH_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }
  if (!headers.has('content-type')) {
    headers.set('content-type', 'application/javascript; charset=utf-8');
  }
  return headers;
}

export async function onRequest(context) {
  if (context.request.method !== 'GET' && context.request.method !== 'HEAD') {
    return methodNotAllowed();
  }

  const cache = caches.default;
  const cacheKey = new Request(new URL(context.request.url).toString(), {
    method: 'GET',
  });

  const cached = await cache.match(cacheKey);
  if (cached) {
    return cached;
  }

  const upstream = await fetch(SCRIPT_URL, {
    headers: { Accept: 'application/javascript,*/*' },
    cf: { cacheTtl: 86400, cacheEverything: true },
  });

  const headers = buildResponseHeaders(upstream);
  const body =
    context.request.method === 'HEAD' ? null : await upstream.arrayBuffer();

  const response = new Response(body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers,
  });

  if (upstream.ok) {
    context.waitUntil(cache.put(cacheKey, response.clone()));
  }

  return response;
}
