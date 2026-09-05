// Small-site uploads share the database, avoiding a second storage account.
export function postgresMedia(DB) {
  return {
    async put(key, bytes, options) {
      const data = Buffer.from(bytes);
      const type = options.httpMetadata.contentType;
      if (
        data.length > 5242880 ||
        !['image/png', 'image/jpeg', 'image/webp'].includes(type)
      )
        throw Error('Upload must be a PNG, JPEG or WebP image under 5 MB.');
      await DB.prepare(
        'INSERT INTO business_destiny.media (id, data, mime) VALUES (?, ?, ?)',
      )
        .bind(key, data.toString('base64'), type)
        .run();
    },
    async get(key) {
      const row = await DB.prepare(
        'SELECT data, mime FROM business_destiny.media WHERE id=?',
      )
        .bind(key)
        .first();
      return row
        ? { bytes: Buffer.from(row.data, 'base64'), type: row.mime }
        : null;
    },
  };
}
