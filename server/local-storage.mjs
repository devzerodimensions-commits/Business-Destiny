import { DatabaseSync } from 'node:sqlite';
import { mkdir, readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
export async function localStorage(root, dataDir) {
  await mkdir(path.join(dataDir, 'media'), { recursive: true });
  const sql = new DatabaseSync(path.join(dataDir, 'business-destiny.sqlite'));
  sql.exec('PRAGMA journal_mode=WAL');
  sql.exec(
    'CREATE TABLE IF NOT EXISTS local_migrations (name TEXT PRIMARY KEY)',
  );

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
  return {
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
        await writeFile(path.join(dataDir, 'media', key), bytes);
        await writeFile(
          path.join(dataDir, 'media', key + '.json'),
          JSON.stringify(options),
        );
      },
    },
  };
}
