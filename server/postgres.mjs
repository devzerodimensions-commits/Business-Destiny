import { readFile } from 'node:fs/promises';

// This adapter accepts server-owned SQL only. Values always remain parameters.
export function postgresQuery(sql) {
  let index = 0;
  return sql
    .replace(
      /\b(FROM|INTO|UPDATE)\s+(content|sessions|settings|enquiries|limits)\b/gi,
      '$1 business_destiny.$2',
    )
    .replace(/\?/g, () => '$' + ++index);
}
const normalize = (row) =>
  row
    ? Object.fromEntries(
        Object.entries(row).map(([k, v]) => [
          k,
          ['created', 'updated', 'expires'].includes(k) ? Number(v) : v,
        ]),
      )
    : null;
export function postgresAdapter(pool) {
  function prepare(sql, args = []) {
    const query = postgresQuery(sql);
    return {
      query,
      args,
      bind(...values) {
        return prepare(sql, values);
      },
      async first() {
        return normalize((await pool.query(query, args)).rows[0]);
      },
      async all() {
        return { results: (await pool.query(query, args)).rows.map(normalize) };
      },
      async run() {
        await pool.query(query, args);
        return { success: true };
      },
    };
  }
  return {
    prepare,
    async batch(statements) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        for (const s of statements) await client.query(s.query, s.args);
        await client.query('COMMIT');
        return statements.map(() => ({ success: true }));
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
    },
  };
}
export async function connectPostgres(env) {
  const { Pool } = await import('pg');
  const connection = new URL(env.DATABASE_URL);
  if (!['postgres:', 'postgresql:'].includes(connection.protocol))
    throw Error('DATABASE_URL must be a Postgres connection string.');
  // Do not let URL sslmode flags disable certificate verification.
  for (const key of ['sslmode', 'sslcert', 'sslkey', 'sslrootcert'])
    connection.searchParams.delete(key);
  const pool = new Pool({
    connectionString: connection.toString(),
    ssl: {
      rejectUnauthorized: true,
      ...(env.DATABASE_CA_CERT
        ? { ca: env.DATABASE_CA_CERT.replace(/\\n/g, '\n') }
        : {}),
    },
    max: 3,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000,
  });
  pool.on('error', () =>
    console.error('The database connection was interrupted.'),
  );
  try {
    await pool.query(
      await readFile(new URL('./postgres-schema.sql', import.meta.url), 'utf8'),
    );
    return postgresAdapter(pool);
  } catch (e) {
    await pool.end();
    throw e;
  }
}
