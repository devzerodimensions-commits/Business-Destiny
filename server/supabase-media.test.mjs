import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { connectMedia } from './supabase-media.mjs';
await test('Supabase image storage creates a limited bucket and uploads without exposing the server key', async () => {
  const calls = [];
  const env = {
    SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'test-server-key',
  };
  const mocked = mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push({ url: String(url), options });
    if (options.method === 'GET')
      return new Response(
        JSON.stringify({
          statusCode: '404',
          error: 'not_found',
          message: 'Bucket not found',
        }),
        { status: 404, headers: { 'content-type': 'application/json' } },
      );
    return new Response(
      JSON.stringify({
        name: 'business-destiny',
        Key: 'business-destiny/image.png',
      }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    );
  });
  try {
    const storage = await connectMedia(env);
    await storage.put('image.png', new Uint8Array([137, 80, 78, 71]), {
      httpMetadata: { contentType: 'image/png' },
    });
    assert.equal(calls.length, 3);
    const bucket = JSON.parse(calls[1].options.body);
    assert.equal(bucket.public, true);
    assert.equal(bucket.file_size_limit, 5242880);
    assert.equal(
      storage.publicUrl('image.png'),
      'https://example.supabase.co/storage/v1/object/public/business-destiny/image.png',
    );
    assert.ok(
      !storage.publicUrl('image.png').includes(env.SUPABASE_SERVICE_ROLE_KEY),
    );
  } finally {
    mocked.mock.restore();
  }
});
