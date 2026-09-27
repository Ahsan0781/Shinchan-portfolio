# Contact Form + Auto-Reply Setup

Your portfolio has two moving parts on the backend side:

1. **Netlify Forms** — captures every submission and emails *you* (already working automatically once deployed on Netlify, no setup needed).
2. **A serverless function** (`netlify/functions/send-autoreply.js`) — sends an automatic "thanks for reaching out" email back to *the visitor*. This part needs a few minutes of setup.

## Why a setup step is needed
Sending email requires an email-sending service (Netlify itself doesn't send email). This project uses **Resend** because it has a generous free tier and a simple API — but you could swap in SendGrid, Mailgun, or Postmark by editing the function.

## Setup steps (~5–10 minutes)

1. **Create a free Resend account** at https://resend.com and verify your email.
2. **Get an API key**: in the Resend dashboard, go to *API Keys* → *Create API Key*. Copy it.
3. **(Optional but recommended) Verify your own domain** in Resend so emails come from `hello@yourdomain.com` instead of a shared address. Until you do this, you can use `onboarding@resend.dev` as a temporary sender for testing.
4. **Deploy this whole folder to Netlify** (drag-and-drop the folder, or connect the Git repo — either way, keep the folder structure intact so Netlify finds `netlify.toml` and the `netlify/functions` folder).
5. **Add environment variables** in Netlify: go to *Site settings → Environment variables* and add:
   - `RESEND_API_KEY` = the API key you copied from Resend
   - `FROM_EMAIL` = `Sheikh Ahsan <hello@yourdomain.com>` (or `Sheikh Ahsan <onboarding@resend.dev>` for testing)
6. **Redeploy the site** (Netlify needs a fresh deploy to pick up new environment variables).
7. **Test it**: submit the contact form on your live site. You should get the Netlify Forms notification email, and the address you entered should receive the auto-reply within a few seconds.

## If something doesn't arrive
- Check **Netlify → Functions → send-autoreply → Logs** for errors (a missing or wrong `RESEND_API_KEY` is the most common issue).
- Check Resend's dashboard under **Logs** to see if the email was accepted or bounced.
- Spam folders — test emails from a fresh sender sometimes land there until your domain is verified.

## File structure this depends on
```
your-site/
├── index.html
├── netlify.toml
└── netlify/
    └── functions/
        └── send-autoreply.js
```
Don't move or rename these — Netlify looks for functions in the exact path declared in `netlify.toml`.
