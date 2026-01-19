# Cloudflare Worker Deployment Guide

Follow these steps to deploy your application to Cloudflare Workers with R2 storage.

## 1. Login to Cloudflare
Connect your terminal to your Cloudflare account.
```bash
npx wrangler login
```
*   A browser window will open.
*   Log in and click **"Allow"** to authorize.

## 2. Enable R2 (First Time Only)
Before generating buckets via command line, you must enable the service.
1.  Go to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2.  Click on **R2** in the sidebar.
3.  Click **"Enable R2"** (Free tier includes 10GB storage).

## 3. Create R2 Bucket
Create the storage bucket for your files.
```bash
npx wrangler r2 bucket create nodejs-bucket
```

## 4. Set Database Connection
Securely store your database credentials (do not commit `.env` files).
```bash
npx wrangler secret put DATABASE_URL
```
*   When prompted, paste your Neon PostgreSQL connection string.

## 5. Deploy
Publish your worker to the internet.
```bash
npx wrangler deploy
```

## 6. Verify
Your app is now live!
*   **API URL:** `https://nodejs-worker.<your-subdomain>.workers.dev`
*   **Test:** Visit `/items` or upload a file to `/upload` to verify.

---

## Development Commands

**Run Cloudflare Worker Locally:**
```bash
npm run dev:worker
```
*   Uses `.dev.vars` for secrets.
*   Uses R2 bucket for storage.

**Run Node.js Server:**
```bash
npm start
```
*   Uses `.env` for secrets.
*   Uses PostgreSQL `files` table for storage (fallback mode).
