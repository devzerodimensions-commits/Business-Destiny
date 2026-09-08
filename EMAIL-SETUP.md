# Consultation emails

Enquiries are saved in the website database before an email is attempted. Successful submissions redirect to `/thank-you`. Form text and thank-you text can be edited in **Admin → Contact & footer**; the hero form can also be switched off there.

In the Render service's **Environment**, configure:

| Key | Value |
| --- | --- |
| `RESEND_API_KEY` | A sending API key created in your Resend account |
| `ENQUIRY_FROM_EMAIL` | `Business Destiny <enquiries@your-verified-domain.com>` using your verified Resend domain |
| `ENQUIRY_TO_EMAIL` | `dev01.zerodimensions@gmail.com` (also the default if omitted) |

Never add credentials to GitHub or the public CMS. Save the environment changes and redeploy. Resend setup: https://resend.com/docs/dashboard/domains/introduction

Submit a test enquiry and check the recipient's inbox and spam folder. In **Admin → Consultation enquiries**, `Accepted by email provider` means Resend accepted the message, not proof of inbox delivery. Check Resend logs for delivery/bounces. `Not configured` and `Delivery failed` enquiries remain saved; after correcting configuration use **Retry enquiry email**. Provider idempotency prevents repeated sends with the same enquiry identifier within its supported window. This app does not run an automatic retry queue.
