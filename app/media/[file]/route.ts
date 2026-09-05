import { env } from 'cloudflare:workers';
export async function GET(request: Request) {
  const file = new URL(request.url).pathname.split('/').pop()!;
  if (!/^[a-zA-Z0-9._-]+$/.test(file))
    return new Response('Not found', { status: 404 });
  const object = await (env as unknown as { MEDIA: R2Bucket }).MEDIA.get(file);
  if (!object) return new Response('Not found', { status: 404 });
  return new Response(object.body, {
    headers: {
      'Content-Type':
        object.httpMetadata?.contentType || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'public,max-age=31536000,immutable',
    },
  });
}
