# Free hosting: Business Destiny

The GitHub configuration now uses **Render Free + Supabase Free**. The website and admin panel share one Render URL; admin is at `/admin`.

## 1. Create a free Supabase project

Open https://supabase.com/dashboard and create a project on the **Free** plan. Save the database password you choose. Wait for the project to finish provisioning.

You do not need to run SQL or create a storage bucket manually. The Node server creates its private database tables and website-image bucket on first startup.

## 2. Collect these three connection settings

| Render environment variable | Where to get it in Supabase |
| --- | --- |
| `DATABASE_URL` | Click **Connect**, choose **Session pooler**, and copy the URI. Replace the password placeholder with your database password. URL-encode special characters in that password. Use the pooler's port **5432**. |
| `SUPABASE_URL` | Your project's API URL, such as `https://your-project.supabase.co`. |
| `SUPABASE_SERVICE_ROLE_KEY` | Project settings → API Keys → legacy **service_role** key, or a new backend secret key. Never use the public/anon key here. |

Enter these values directly in Render's environment settings. Do not post them on GitHub or in a public message.

The database connection checks the TLS certificate. If Supabase's connection fails certificate verification, download the project's CA certificate from its database settings and add the complete certificate as the optional Render environment variable `DATABASE_CA_CERT`. Do not disable certificate verification.

## 3. Open the updated Render Blueprint

https://render.com/deploy?repo=https%3A%2F%2Fgithub.com%2Fdevzerodimensions-commits%2FBusiness-Destiny

If you still have the old paid setup open, cancel it and reopen this link so Render reads the latest `main` branch. If you already created a Blueprint, sync its latest configuration instead of creating a duplicate service.

Confirm the web service says **Free**, with **no persistent disk**. The Blueprint sets the remaining platform settings automatically.

Besides the three Supabase values, enter `ADMIN_USERNAME`, `ADMIN_SALT` and `ADMIN_PASSWORD_HASH` from the private `.render.env` file on your computer. These retain the initial admin account already provided to you. Never commit this file. A password changed only in your localhost database does not automatically transfer to a fresh hosted database.

## 4. Deploy

Deploy and wait for the build and health check to succeed. The resulting `onrender.com` address opens the website. Append `/admin` for the admin login. Change the initial password under Account settings after first login.

Your current homepage content is included. Saved admin edits and image uploads will go to Supabase, so they survive Render restarts. The local SQLite database and uploaded local files are not automatically copied to Supabase.

## Free-plan limits

- Render Free sleeps after 15 minutes without traffic; the next visit can take about a minute to load.
- Supabase Free has storage and usage limits and can pause projects after a week of inactivity.
- Stay on the free plans and within their quotas. Providers can still request account verification; this configuration cannot guarantee that a provider will never request a card.

Official references: https://render.com/docs/free · https://supabase.com/pricing · https://supabase.com/docs/guides/database/connecting-to-postgres
