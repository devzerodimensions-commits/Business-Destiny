export async function connectMedia(env) {
  if (
    !env.SUPABASE_URL?.startsWith('https://') ||
    !env.SUPABASE_SERVICE_ROLE_KEY
  )
    throw Error('Supabase storage URL and server key are required.');
  const { createClient } = await import('@supabase/supabase-js');
  const client = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const bucket = 'business-destiny';
  const { data, error } = await client.storage.getBucket(bucket);
  if (error) {
    if (String(error.statusCode) !== '404' && !/not found/i.test(error.message))
      throw Error('Unable to access Supabase Storage. Check the server key.');
    const result = await client.storage.createBucket(bucket, {
      public: true,
      fileSizeLimit: 5242880,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
    });
    if (result.error)
      throw Error('Unable to create the Business Destiny image bucket.');
  } else if (!data.public) {
    throw Error(
      'The business-destiny storage bucket must be public for website images.',
    );
  }
  return {
    async put(key, bytes, options) {
      const { error } = await client.storage
        .from(bucket)
        .upload(key, bytes, {
          contentType: options.httpMetadata.contentType,
          cacheControl: '31536000',
          upsert: false,
        });
      if (error)
        throw Error(
          'Image upload failed. Check Supabase storage availability and limits.',
        );
    },
    publicUrl(key) {
      return client.storage.from(bucket).getPublicUrl(key).data.publicUrl;
    },
  };
}
