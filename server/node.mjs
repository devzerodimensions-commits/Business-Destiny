import { localStorage } from './local-storage.mjs';
import { connectPostgres } from './postgres.mjs';
import { connectMedia } from './supabase-media.mjs';
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isIP } from 'node:net';
import { handleAPI } from './api.mjs';
const root = fileURLToPath(new URL('..', import.meta.url));
const dataDir = path.resolve(process.env.DATA_DIR || path.join(root, 'data'));
const remoteStorage = process.env.STORAGE_BACKEND === 'supabase';
if (process.env.REQUIRE_PERSISTENT_STORAGE === '1' && !remoteStorage)
  throw Error(
    'Configure Supabase before deploying. Local storage is not safe on the Render free plan.',
  );
if (
  remoteStorage &&
  (!process.env.DATABASE_URL ||
    !process.env.SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY)
)
  throw Error(
    'Set DATABASE_URL, SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Render.',
  );
const env = remoteStorage
  ? {
      ...process.env,
      DB: await connectPostgres(process.env),
      MEDIA: await connectMedia(process.env),
    }
  : await localStorage(root, dataDir);
const development = process.argv.includes('--dev');
const vite = development
  ? await (
      await import('vite')
    ).createServer({
      configFile: path.join(root, 'vite.node.config.ts'),
      server: { middlewareMode: true },
      appType: 'spa',
    })
  : null;
const mime = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
};
const server = http.createServer(async (req, res) => {
  try {
    const publicOrigin =
      process.env.PUBLIC_ORIGIN || process.env.RENDER_EXTERNAL_URL;
    const url = new URL(
      req.url || '/',
      publicOrigin || `http://${req.headers.host}`,
    );
    if (
      /(?:^|\/)(?:\.env[^/]*|\.dev\.vars|\.credentials\.txt|\.git|data)(?:\/|$)/i.test(
        decodeURIComponent(url.pathname),
      )
    ) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    if (url.pathname.startsWith('/api/')) {
      const headers = new Headers();
      for (const [k, v] of Object.entries(req.headers))
        if (v) headers.set(k, Array.isArray(v) ? v.join(',') : v);
      headers.delete('cf-connecting-ip');
      const forwarded = String(req.headers['x-forwarded-for'] || '')
        .split(',')
        .at(-1)
        ?.trim();
      headers.set(
        'x-local-address',
        process.env.TRUST_PROXY === '1' && forwarded && isIP(forwarded)
          ? forwarded
          : req.socket.remoteAddress || 'local',
      );
      const request = new Request(url, {
        method: req.method,
        headers,
        ...(!['GET', 'HEAD'].includes(req.method)
          ? { body: req, duplex: 'half' }
          : {}),
      });
      const response = await handleAPI(request, env);
      res.writeHead(response.status, Object.fromEntries(response.headers));
      res.end(Buffer.from(await response.arrayBuffer()));
      return;
    }
    if (/^\/media\/[a-f0-9-]+\.(png|jpg|webp)$/.test(url.pathname)) {
      if (remoteStorage) {
        res.writeHead(302, {
          Location: env.MEDIA.publicUrl(path.basename(url.pathname)),
          'Cache-Control': 'public,max-age=3600',
        });
        res.end();
        return;
      }
      try {
        const file = path.join(dataDir, 'media', path.basename(url.pathname));
        const bytes = await readFile(file);
        res.setHeader('Content-Type', mime[path.extname(file)]);
        res.end(bytes);
        return;
      } catch {}
    }
    if (vite) {
      vite.middlewares(req, res);
      return;
    }
    const decoded = decodeURIComponent(url.pathname);
    const folder = path.join(root, 'dist-node');
    let file = path.resolve(folder, '.' + decoded);
    if (!file.startsWith(folder + path.sep) && file !== folder) {
      res.writeHead(403);
      res.end();
      return;
    }
    try {
      if (!(await stat(file)).isFile()) file = path.join(folder, 'index.html');
    } catch {
      if (path.extname(decoded)) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      file = path.join(folder, 'index.html');
    }
    res.setHeader(
      'Content-Type',
      mime[path.extname(file)] || 'application/octet-stream',
    );
    res.end(await readFile(file));
  } catch (e) {
    console.error(e.message);
    res.writeHead(500);
    res.end('Request failed');
  }
});
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '127.0.0.1';
server.listen(port, host, () =>
  console.log(
    `Business Destiny ready: ${process.env.RENDER_EXTERNAL_URL || `http://${host}:${port}`}`,
  ),
);
