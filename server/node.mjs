import http from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { mkdir, readFile, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleAPI } from './api.mjs';
const root = fileURLToPath(new URL('..', import.meta.url));
await mkdir(path.join(root, 'data/media'), { recursive: true });
const sql = new DatabaseSync(path.join(root, 'data/business-destiny.sqlite'));
sql.exec('PRAGMA journal_mode=WAL');
sql.exec('CREATE TABLE IF NOT EXISTS local_migrations (name TEXT PRIMARY KEY)');
const { readdir } = await import('node:fs/promises');
for (const name of (await readdir(path.join(root, 'drizzle')))
  .filter((n) => n.endsWith('.sql'))
  .sort()) {
  if (
    !sql.prepare('SELECT name FROM local_migrations WHERE name=?').get(name)
  ) {
    sql.exec('BEGIN');
    try {
      sql.exec(await readFile(path.join(root, 'drizzle', name), 'utf8'));
      sql.prepare('INSERT INTO local_migrations (name) VALUES (?)').run(name);
      sql.exec('COMMIT');
    } catch (e) {
      sql.exec('ROLLBACK');
      throw e;
    }
  }
}
function prepared(query, args = []) {
  return {
    bind(...values) {
      return prepared(query, values);
    },
    async first() {
      return sql.prepare(query).get(...args) || null;
    },
    async all() {
      return { results: sql.prepare(query).all(...args) };
    },
    run() {
      return sql.prepare(query).run(...args);
    },
  };
}
const env = {
  ...process.env,
  DB: {
    prepare: prepared,
    async batch(statements) {
      sql.exec('BEGIN');
      try {
        const r = [];
        for (const s of statements) r.push(s.run());
        sql.exec('COMMIT');
        return r;
      } catch (e) {
        sql.exec('ROLLBACK');
        throw e;
      }
    },
  },
  MEDIA: {
    async put(key, bytes, options) {
      await writeFile(path.join(root, 'data/media', key), bytes);
      await writeFile(
        path.join(root, 'data/media', key + '.json'),
        JSON.stringify(options),
      );
    },
  },
};
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
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
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
      headers.set('x-local-address', req.socket.remoteAddress || 'local');
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
      try {
        const file = path.join(root, 'data', url.pathname);
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
server.listen(port, '127.0.0.1', () =>
  console.log(`Business Destiny ready: http://127.0.0.1:${port}`),
);
