const EVENT_URL = 'https://plausible.samrridh.xyz/api/event';

function methodNotAllowed() {
  return new Response('Method Not Allowed', {
    status: 405,
    headers: { Allow: 'POST' },
  });
}

function visitorIp(request) {
  return (
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
    ''
  );
}

function stripCookies(headers) {
  const next = new Headers(headers);
  next.delete('cookie');
  next.delete('Cookie');
  next.delete('set-cookie');
  next.delete('Set-Cookie');
  return next;
}

export async function onRequest(context) {
  if (context.request.method !== 'POST') {
    return methodNotAllowed();
  }

  const ip = visitorIp(context.request);
  const headers = stripCookies(context.request.headers);

  if (ip) {
    headers.set('X-Forwarded-For', ip);
    headers.set('X-Plausible-IP', ip);
  }

  const upstream = await fetch(EVENT_URL, {
    method: 'POST',
    headers,
    body: context.request.body,
  });

  const responseHeaders = stripCookies(upstream.headers);

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}
