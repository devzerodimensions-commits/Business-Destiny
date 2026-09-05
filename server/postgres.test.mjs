import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { postgresAdapter } from './postgres.mjs';
import { postgresMedia } from './postgres-media.mjs';
import { handleAPI, passwordHash } from './api.mjs';
import defaults from '../content/default.json' with { type: 'json' };
await test('Postgres: protected admin, draft isolation, atomic publication, enquiries and password rotation', async () => {
  const pg = new PGlite();
  await pg.exec(
    await readFile(new URL('./postgres-schema.sql', import.meta.url), 'utf8'),
  );
  const pool = {
    query: (sql, args) => pg.query(sql, args),
    connect: async () => ({
      query: (sql, args) => pg.query(sql, args),
      release() {},
    }),
  };
  const DB = postgresAdapter(pool),
    env = {
      DB,
      ADMIN_USERNAME: 'admin',
      ADMIN_SALT: 'salt',
      ADMIN_PASSWORD_HASH: await passwordHash('postgres-test-password', 'salt'),
    };
  let cookie = '';
  async function request(path, method = 'GET', value) {
    return handleAPI(
      new Request('https://test.example/api/' + path, {
        method,
        headers: {
          origin: 'https://test.example',
          cookie,
          'content-type': 'application/json',
        },
        ...(method !== 'GET' ? { body: JSON.stringify(value) } : {}),
      }),
      env,
    );
  }
  try {
    const media = postgresMedia(DB);
    const bytes = Buffer.from([137, 80, 78, 71, 0, 255]);
    await media.put('test.png', bytes, {
      httpMetadata: { contentType: 'image/png' },
    });
    const saved = await postgresMedia(postgresAdapter(pool)).get('test.png');
    assert.deepEqual(saved.bytes, bytes);
    assert.equal(saved.type, 'image/png');
    assert.equal(await media.get('missing.png'), null);
    await assert.rejects(
      media.put('bad.svg', bytes, {
        httpMetadata: { contentType: 'image/svg+xml' },
      }),
    );
    await assert.rejects(
      media.put('large.png', Buffer.alloc(5242881), {
        httpMetadata: { contentType: 'image/png' },
      }),
    );
    assert.equal((await request('admin/content')).status, 401);
    let res = await request('login', 'POST', {
      username: 'admin',
      password: 'postgres-test-password',
    });
    assert.equal(res.status, 200);
    cookie = res.headers.get('set-cookie').split(';')[0];
    const c = structuredClone(defaults);
    c.sections[0].title = 'Postgres saved draft';
    assert.equal(
      (await request('admin/content', 'PUT', { content: c })).status,
      200,
    );
    assert.equal(
      (await (await request('content')).json()).sections[0].title,
      defaults.sections[0].title,
    );
    assert.equal(
      (await request('admin/content', 'PUT', { content: c, publish: true }))
        .status,
      200,
    );
    assert.equal(
      (await (await request('content')).json()).sections[0].title,
      'Postgres saved draft',
    );
    await assert.rejects(
      DB.batch([
        DB.prepare('UPDATE content SET value=? WHERE id=?').bind(
          'invalid',
          'published',
        ),
        DB.prepare('INSERT INTO nonexistent (id) VALUES (?)').bind('bad'),
      ]),
    );
    assert.equal(
      (await (await request('content')).json()).sections[0].title,
      'Postgres saved draft',
    );
    assert.equal(
      (
        await request('enquiries', 'POST', {
          name: 'Customer',
          email: 'customer@example.com',
          phone: '9999999999',
          question: 'Factory guidance',
          consent: 'on',
        })
      ).status,
      201,
    );
    const rows = await (await request('admin/enquiries')).json();
    assert.equal(rows.length, 1);
    assert.equal(typeof rows[0].created, 'number');
    assert.equal(
      (
        await request('admin/password', 'PUT', {
          current: 'postgres-test-password',
          password: 'changed-postgres-password',
        })
      ).status,
      200,
    );
    await request('logout', 'POST', {});
    assert.equal((await request('admin/content')).status, 401);
    assert.equal(
      (
        await request('login', 'POST', {
          username: 'admin',
          password: 'changed-postgres-password',
        })
      ).status,
      200,
    );
    for (let i = 0; i < 20; i++)
      res = await request('login', 'POST', {
        username: 'admin',
        password: 'wrong',
      });
    assert.equal(res.status, 429);
    await pg.exec('CREATE ROLE anon NOLOGIN; SET ROLE anon;');
    await assert.rejects(
      pg.query('SELECT * FROM business_destiny.enquiries'),
      /permission denied/,
    );
  } finally {
    await pg.close();
  }
});
