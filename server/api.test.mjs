import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFile } from 'node:fs/promises';
import { handleAPI, passwordHash } from './api.mjs';
import defaults from '../content/default.json' with { type: 'json' };
await test('admin security, publishing, enquiries, uploads and password rotation', async () => {
  const sql = new DatabaseSync(':memory:');
  sql.exec(
    await readFile(
      new URL('../drizzle/0000_plain_black_crow.sql', import.meta.url),
      'utf8',
    ),
  );
  function prepare(query, args = []) {
    return {
      bind(...v) {
        return prepare(query, v);
      },
      first() {
        return sql.prepare(query).get(...args) || null;
      },
      all() {
        return { results: sql.prepare(query).all(...args) };
      },
      run() {
        return sql.prepare(query).run(...args);
      },
    };
  }
  const media = new Map(),
    env = {
      DB: { prepare, batch: (s) => s.map((x) => x.run()) },
      MEDIA: { put: (key, bytes) => media.set(key, bytes) },
      ADMIN_USERNAME: 'admin',
      ADMIN_SALT: 'test-salt',
      ADMIN_PASSWORD_HASH: await passwordHash('test-password-123', 'test-salt'),
    };
  let cookie = '';
  async function request(path, method = 'GET', body, options = {}) {
    const headers = {
      origin: 'https://test.local',
      cookie,
      ...options.headers,
    };
    if (body && !options.raw) headers['content-type'] = 'application/json';
    return handleAPI(
      new Request('https://test.local/api/' + path, {
        method,
        headers,
        ...(method !== 'GET' && body
          ? { body: options.raw ? body : JSON.stringify(body) }
          : {}),
      }),
      env,
    );
  }
  assert.equal((await request('admin/content')).status, 401);
  assert.equal(
    (
      await request('admin/upload', 'POST', new Uint8Array([137, 80, 78, 71]), {
        raw: true,
      })
    ).status,
    401,
  );
  assert.equal(
    (
      await request('login', 'POST', {
        username: 'admin',
        password: 'incorrect',
      })
    ).status,
    401,
  );
  let response = await request('login', 'POST', {
    username: 'admin',
    password: 'test-password-123',
  });
  assert.equal(response.status, 200);
  assert.match(
    response.headers.get('set-cookie'),
    /HttpOnly.*SameSite=Strict.*Secure/,
  );
  cookie = response.headers.get('set-cookie').split(';')[0];
  assert.equal((await request('admin/content')).status, 200);
  const next = structuredClone(defaults);
  next.sections[0].title = 'A draft title';
  assert.equal(
    (await request('admin/content', 'PUT', { content: next })).status,
    200,
  );
  assert.equal(
    (await (await request('content')).json()).sections[0].title,
    defaults.sections[0].title,
  );
  assert.equal(
    (await (await request('admin/content')).json()).draft.sections[0].title,
    'A draft title',
  );
  assert.equal(
    (
      await request(
        'admin/content',
        'PUT',
        { content: next, publish: true },
        { headers: { origin: 'https://evil.example' } },
      )
    ).status,
    403,
  );
  assert.equal(
    (await request('admin/content', 'PUT', { content: next, publish: true }))
      .status,
    200,
  );
  assert.equal(
    (await (await request('content')).json()).sections[0].title,
    'A draft title',
  );
  const broken = structuredClone(next);
  broken.sections[0].image = 'javascript:alert(1)';
  assert.equal(
    (await request('admin/content', 'PUT', { content: broken, publish: true }))
      .status,
    400,
  );
  assert.equal((await request('enquiries', 'POST', { name: 'A' })).status, 400);
  assert.equal(
    (
      await request('enquiries', 'POST', {
        name: 'Test client',
        phone: '+91 9876543210',
        email: 'test@example.com',
        question: 'Factory Vastu',
        consent: 'on',
      })
    ).status,
    201,
  );
  assert.equal((await (await request('admin/enquiries')).json()).length, 1);
  assert.equal(
    (await request('admin/upload', 'POST', '<svg/>', { raw: true })).status,
    400,
  );
  response = await request(
    'admin/upload',
    'POST',
    new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]),
    { raw: true },
  );
  assert.equal(response.status, 201);
  assert.match((await response.json()).url, /^\/media\/.+\.png$/);
  assert.equal(media.size, 1);
  assert.equal(
    (
      await request('admin/password', 'PUT', {
        current: 'incorrect',
        password: 'updated-password-123',
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await request('admin/password', 'PUT', {
        current: 'test-password-123',
        password: 'updated-password-123',
      })
    ).status,
    200,
  );
  assert.equal((await request('logout', 'POST')).status, 200);
  assert.equal((await request('admin/content')).status, 401);
  assert.equal(
    (
      await request('login', 'POST', {
        username: 'admin',
        password: 'test-password-123',
      })
    ).status,
    401,
  );
  assert.equal(
    (
      await request('login', 'POST', {
        username: 'admin',
        password: 'updated-password-123',
      })
    ).status,
    200,
  );
  for (let i = 0; i < 20; i++)
    response = await request('login', 'POST', {
      username: 'admin',
      password: 'incorrect',
    });
  assert.equal(response.status, 429);
  sql.close();
});
