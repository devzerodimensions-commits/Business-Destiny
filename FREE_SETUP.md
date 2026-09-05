# Free hosting with Render + Neon

The website and admin panel share one Render Free web service. Neon stores content, login sessions, enquiries and small image uploads. Supabase is not required.

## 1. Neon
Open https://console.neon.tech and select your project (create a Free project if you only created an account). Click Connect and copy the PostgreSQL connection string for the database owner role. Copy only the URL starting postgresql://, without psql or surrounding quotes. Keep the password and TLS parameters included. Direct or pooled Neon URLs are supported.

Keep this secret private; do not post it on GitHub or in chat.

## 2. Render
For a new deployment, open:
https://render.com/deploy?repo=https%3A%2F%2Fgithub.com%2Fdevzerodimensions-commits%2FBusiness-Destiny

If a Blueprint already exists, sync the latest main branch rather than creating a duplicate. Cancel any old paid deployment form first. Confirm Free, no disk, and STORAGE_BACKEND=neon.

Paste your Neon URL into DATABASE_URL. Enter ADMIN_USERNAME, ADMIN_SALT and ADMIN_PASSWORD_HASH from the private local .render.env file. Never commit that file. Supabase settings are not needed.

For an existing web service, use Environment, set these values, and save/redeploy. Keep REQUIRE_PERSISTENT_STORAGE=1, HOST=0.0.0.0, and TRUST_PROXY=1.

## 3. Verify deployment
The server creates its private business_destiny schema automatically. Wait for the build and health check to pass. Open the assigned website URL, then /admin. Change the initial password under Account settings. Publish a small edit, upload an image, and verify both remain after a service restart.

The repository's default homepage is included. Localhost database edits, password changes and uploaded local files do not transfer automatically.

## Free-plan limits
Render Free sleeps after 15 minutes without traffic, delaying the next visit. Neon Free has database and compute quotas. Uploaded images are stored as base64 database records (roughly one-third overhead): compress images and watch database usage. This is intended for a small website, not a large media library. Each upload is limited to 5 MB. Bundled assets do not consume Neon storage.

Stay on Free plans. No paid disk is configured. Provider account verification may still apply.

Official references:
- https://neon.com/docs/connect/connection-pooling
- https://neon.com/pricing
- https://render.com/docs/free

Optional Supabase support remains available with STORAGE_BACKEND=supabase and its storage URL/server key. Local development retains SQLite.
