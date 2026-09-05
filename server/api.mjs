import defaults from '../content/default.json' with { type: 'json' };
import { upgradeContent, publicContent, validateCMS } from './cms.mjs';
const encoder = new TextEncoder();
export async function hash(value) {
  return Array.from(
    new Uint8Array(
      await crypto.subtle.digest('SHA-256', encoder.encode(value)),
    ),
    (b) => b.toString(16).padStart(2, '0'),
  ).join('');
}
export async function passwordHash(password, salt) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  return Array.from(
    new Uint8Array(
      await crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt: encoder.encode(salt),
          iterations: 100000,
          hash: 'SHA-256',
        },
        key,
        256,
      ),
    ),
    (b) => b.toString(16).padStart(2, '0'),
  ).join('');
}
const json = (data, status = 200, extra = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...extra,
    },
  });
const fail = (message, status = 400) => {
  throw Object.assign(new Error(message), { status });
};
async function body(req, max = 600000) {
  const declared = Number(req.headers.get('content-length'));
  if (declared > max) fail('Request is too large.', 413);
  const reader = req.body?.getReader();
  let total = 0;
  const chunks = [];
  if (reader) {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > max) {
        await reader.cancel();
        fail('Request is too large.', 413);
      }
      chunks.push(value);
    }
  }
  const bytes = new Uint8Array(total);
  let pos = 0;
  for (const c of chunks) {
    bytes.set(c, pos);
    pos += c.length;
  }
  return bytes;
}
async function readJson(req) {
  try {
    return JSON.parse(new TextDecoder().decode(await body(req)));
  } catch (e) {
    if (e.status) throw e;
    fail('Invalid request data.');
  }
}
function sameOrigin(req) {
  const origin = req.headers.get('origin');
  if (origin && origin !== new URL(req.url).origin)
    fail('Request origin is not allowed.', 403);
  if (req.headers.get('sec-fetch-site') === 'cross-site')
    fail('Request origin is not allowed.', 403);
}
const cookie = (token, req, age = 28800) =>
  `bd_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${age}${new URL(req.url).protocol === 'https:' ? '; Secure' : ''}`;
const getToken = (req) =>
  (req.headers.get('cookie') || '')
    .split(';')
    .map((s) => s.trim())
    .find((s) => s.startsWith('bd_session='))
    ?.slice(11) || '';
async function one(db, sql, ...args) {
  return db
    .prepare(sql)
    .bind(...args)
    .first();
}
async function run(db, sql, ...args) {
  return db
    .prepare(sql)
    .bind(...args)
    .run();
}
async function rate(req, db, kind, maximum) {
  const identity =
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-local-address') ||
    'unknown';
  const key = kind + ':' + (await hash(identity));
  const now = Date.now();
  await run(db, 'DELETE FROM limits WHERE expires < ?', now);
  await run(
    db,
    'INSERT INTO limits (id,count,expires) VALUES (?,1,?) ON CONFLICT(id) DO UPDATE SET count=limits.count+1',
    key,
    now + 3600000,
  );
  const entry = await one(db, 'SELECT count FROM limits WHERE id=?', key);
  if (entry.count > maximum)
    fail('Too many attempts. Please try again in an hour.', 429);
}
async function credentials(env) {
  const row = await one(
    env.DB,
    'SELECT value FROM settings WHERE id=?',
    'credentials',
  );
  if (row) return JSON.parse(row.value);
  if (!env.ADMIN_PASSWORD_HASH || !env.ADMIN_SALT)
    fail('Admin account has not been configured.', 503);
  return {
    username: env.ADMIN_USERNAME || 'admin',
    hash: env.ADMIN_PASSWORD_HASH,
    salt: env.ADMIN_SALT,
  };
}
function validContent(c) {
  if (!c || typeof c !== 'object') fail('Invalid homepage content.');
  c = upgradeContent(c);
  validateCMS(c, fail);
  for (const k of Object.keys(defaults))
    if (!(k in c)) fail('Missing homepage setting: ' + k);
  for (const k of [
    'brand',
    'theme',
    'labels',
    'footer',
    'contact',
    'founder',
    'artTag',
    'form',
  ]) {
    if (!c[k] || typeof c[k] !== 'object' || Array.isArray(c[k]))
      fail('Invalid ' + k);
    for (const [key, value] of Object.entries(defaults[k]))
      if (!(key in c[k]) || typeof c[k][key] !== typeof value)
        fail('Invalid setting: ' + k + '.' + key);
  }
  if (!Array.isArray(c.sections) || c.sections.length > 30)
    fail('Use up to 30 sections.');
  const ids = new Set();
  for (const s of c.sections) {
    if (
      !s ||
      typeof s.id !== 'string' ||
      !/^[a-z0-9-]{1,80}$/.test(s.id) ||
      ids.has(s.id)
    )
      fail('Sections need unique identifiers.');
    ids.add(s.id);
    for (const key of [
      'title',
      'highlight',
      'description',
      'body',
      'eyebrow',
      'image',
      'imageAlt',
    ])
      if (typeof s[key] !== 'string') fail('Invalid section ' + key);
    if (
      typeof s.visible !== 'boolean' ||
      !Array.isArray(s.items) ||
      s.items.length > 40
    )
      fail('Invalid section items.');
    for (const item of s.items) {
      if (!item || typeof item.title !== 'string') fail('Items need a title.');
      for (const [key, val] of Object.entries(item)) {
        if (
          key === 'featured'
            ? typeof val !== 'boolean'
            : typeof val !== 'string'
        )
          fail('Invalid item ' + key);
      }
    }
  }
  if (
    !c.sections.some((s) => s.id === 'hero' && s.visible) ||
    !c.sections.some((s) => s.id === 'contact' && s.visible)
  )
    fail(
      'Keep the hero and contact sections visible so the homepage remains usable.',
    );
  for (const key of ['accent', 'sky', 'background'])
    if (!/^#[0-9a-f]{6}$/i.test(c.theme[key])) fail('Choose a valid colour.');
  if (!['standard', 'compact'].includes(c.theme.layout))
    fail('Layout must be standard or compact.');
  if (
    !Number.isFinite(c.theme.roundness) ||
    c.theme.roundness < 0 ||
    c.theme.roundness > 40
  )
    fail('Corner roundness must be between 0 and 40.');
  if (
    !Array.isArray(c.navigation) ||
    c.navigation.length > 10 ||
    c.navigation.some(
      (n) =>
        typeof n.label !== 'string' ||
        typeof n.target !== 'string' ||
        !(
          ids.has(n.target) ||
          n.target === '/blog' ||
          c.pages.some((p) => '/pages/' + p.slug === n.target)
        ),
    )
  )
    fail('Navigation must link to existing sections.');
  if (!Array.isArray(c.form.fields) || c.form.fields.length > 12)
    fail('Invalid enquiry fields.');
  for (const f of c.form.fields)
    if (
      ![
        'name',
        'email',
        'phone',
        'company',
        'city',
        'industry',
        'birthDate',
        'birthTime',
        'birthPlace',
      ].includes(f.name) ||
      !['text', 'email', 'tel', 'date', 'time'].includes(f.type) ||
      typeof f.label !== 'string' ||
      typeof f.placeholder !== 'string' ||
      typeof f.required !== 'boolean'
    )
      fail('Invalid enquiry field.');
  for (const name of ['name', 'email', 'phone'])
    if (!c.form.fields.some((f) => f.name === name && f.required))
      fail('Name, email, and phone must stay required.');
  if (new Set(c.form.fields.map((f) => f.name)).size !== c.form.fields.length)
    fail('Enquiry field names must be unique.');
  function walk(x) {
    for (const [k, v] of Object.entries(x)) {
      if (typeof v === 'string') {
        if (v.length > 10000) fail('A text field is too long.');
        if (
          ['image', 'logo'].includes(k) &&
          v &&
          !(/^\/media\/[a-zA-Z0-9._-]+$/.test(v) || v.startsWith('https://'))
        )
          fail('Images must use an uploaded file or an HTTPS address.');
      } else if (v && typeof v === 'object') walk(v);
    }
  }
  walk(c);
  return c;
}
export async function handleAPI(req, env) {
  try {
    const path = new URL(req.url).pathname.replace(/^\/api\//, '');
    const method = req.method;
    if (!['GET', 'HEAD'].includes(method)) sameOrigin(req);
    if (path === 'content' && method === 'GET') {
      const row = await one(
        env.DB,
        'SELECT value FROM content WHERE id=?',
        'published',
      );
      return json(publicContent(row ? JSON.parse(row.value) : defaults));
    }
    if (path === 'login' && method === 'POST') {
      await rate(req, env.DB, 'login', 20);
      const input = await readJson(req);
      if (typeof input.password !== 'string' || input.password.length > 256)
        fail('Invalid username or password.', 401);
      const cred = await credentials(env);
      const digest = await passwordHash(input.password, cred.salt);
      if (input.username !== cred.username || digest !== cred.hash)
        fail('Invalid username or password.', 401);
      const token = crypto.randomUUID() + crypto.randomUUID();
      await run(env.DB, 'DELETE FROM sessions WHERE expires < ?', Date.now());
      await run(
        env.DB,
        'INSERT INTO sessions (token,expires) VALUES (?,?)',
        await hash(token),
        Date.now() + 28800000,
      );
      return json({ ok: true }, 200, { 'Set-Cookie': cookie(token, req) });
    }
    if (path === 'logout' && method === 'POST') {
      await run(
        env.DB,
        'DELETE FROM sessions WHERE token=?',
        await hash(getToken(req)),
      );
      return json({ ok: true }, 200, { 'Set-Cookie': cookie('', req, 0) });
    }
    if (path === 'enquiries' && method === 'POST') {
      await rate(req, env.DB, 'enquiry', 12);
      const input = await readJson(req);
      if (input.website) return json({ ok: true });
      const allowed = [
        'name',
        'phone',
        'email',
        'company',
        'city',
        'industry',
        'birthDate',
        'birthTime',
        'birthPlace',
        'service',
        'question',
        'consent',
      ];
      const data = {};
      for (const key of allowed)
        if (typeof input[key] === 'string')
          data[key] = input[key]
            .trim()
            .slice(0, key === 'question' ? 3000 : 180);
      if (
        !data.name ||
        !data.email ||
        !/^\S+@\S+\.\S+$/.test(data.email) ||
        !data.phone ||
        data.phone.replace(/\D/g, '').length < 7 ||
        !data.question ||
        data.consent !== 'on'
      )
        fail(
          'Please enter your name, valid email and phone, question, and consent.',
        );
      const id = crypto.randomUUID();
      await run(
        env.DB,
        'INSERT INTO enquiries (id,data,created) VALUES (?,?,?)',
        id,
        JSON.stringify(data),
        Date.now(),
      );
      return json({ ok: true, id }, 201);
    }
    if (!path.startsWith('admin/')) return json({ error: 'Not found' }, 404);
    const sessionKey = await hash(getToken(req));
    const session = await one(
      env.DB,
      'SELECT token FROM sessions WHERE token=? AND expires>?',
      sessionKey,
      Date.now(),
    );
    if (!session) fail('Please sign in to continue.', 401);
    if (path === 'admin/content' && method === 'GET') {
      const row = await one(
        env.DB,
        'SELECT value FROM content WHERE id=?',
        'draft',
      );
      return json({
        draft: upgradeContent(row ? JSON.parse(row.value) : defaults),
      });
    }
    if (path === 'admin/content' && method === 'PUT') {
      const input = await readJson(req),
        content = validContent(input.content);
      const value = JSON.stringify(content),
        now = Date.now();
      const statements = [
        env.DB.prepare(
          'INSERT INTO content (id,value,updated) VALUES (?,?,?) ON CONFLICT(id) DO UPDATE SET value=excluded.value,updated=excluded.updated',
        ).bind('draft', value, now),
      ];
      if (input.publish === true)
        statements.push(
          env.DB.prepare(
            'INSERT INTO content (id,value,updated) VALUES (?,?,?) ON CONFLICT(id) DO UPDATE SET value=excluded.value,updated=excluded.updated',
          ).bind('published', value, now),
        );
      await env.DB.batch(statements);
      return json({ ok: true });
    }
    if (path === 'admin/enquiries' && method === 'GET') {
      const rows = await env.DB.prepare(
        'SELECT * FROM enquiries ORDER BY created DESC LIMIT 500',
      ).all();
      return json(
        rows.results.map((r) => ({ ...r, data: JSON.parse(r.data) })),
      );
    }
    if (path === 'admin/password' && method === 'PUT') {
      await rate(req, env.DB, 'password', 20);
      const input = await readJson(req);
      if (
        typeof input.password !== 'string' ||
        input.password.length < 12 ||
        input.password.length > 256 ||
        typeof input.current !== 'string' ||
        input.current.length > 256
      )
        fail('Use a password between 12 and 256 characters.');
      const cred = await credentials(env);
      if ((await passwordHash(input.current, cred.salt)) !== cred.hash)
        fail('Current password is incorrect.', 400);
      const salt = crypto.randomUUID();
      const next = {
        username: cred.username,
        salt,
        hash: await passwordHash(input.password, salt),
      };
      await env.DB.batch([
        env.DB.prepare(
          'INSERT INTO settings (id,value) VALUES (?,?) ON CONFLICT(id) DO UPDATE SET value=excluded.value',
        ).bind('credentials', JSON.stringify(next)),
        env.DB.prepare('DELETE FROM sessions WHERE token<>?').bind(sessionKey),
      ]);
      return json({ ok: true });
    }
    if (path === 'admin/upload' && method === 'POST') {
      const bytes = await body(req, 5 * 1024 * 1024);
      const png =
        bytes[0] === 137 &&
        bytes[1] === 80 &&
        bytes[2] === 78 &&
        bytes[3] === 71;
      const jpg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
      const webp =
        String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' &&
        String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
      if (!png && !jpg && !webp) fail('Upload a PNG, JPEG, or WebP image.');
      const ext = png ? 'png' : jpg ? 'jpg' : 'webp',
        type = png ? 'image/png' : jpg ? 'image/jpeg' : 'image/webp',
        key = crypto.randomUUID() + '.' + ext;
      await env.MEDIA.put(key, bytes, { httpMetadata: { contentType: type } });
      return json({ url: '/media/' + key }, 201);
    }
    return json({ error: 'Not found' }, 404);
  } catch (e) {
    if (!e.status) console.error('API error:', e.message);
    return json(
      {
        error: e.status
          ? e.message
          : 'The request could not be completed. Please try again.',
      },
      e.status || 500,
    );
  }
}
