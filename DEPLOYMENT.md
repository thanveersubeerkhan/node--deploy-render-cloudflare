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


### **Run Node.js Server:**
```bash
npm start
```
*   Uses `.env` for secrets.
*   Uses PostgreSQL `files` table for storage (fallback mode).

---

# Render Deployment Guide (Node.js)

Since this project is hybrid, you can also deploy it as a standard Node.js server on Render.

## 1. Create a New Web Service
1.  Log in to the [Render Dashboard](https://dashboard.render.com/).
2.  Click **"New +"** -> **"Web Service"**.
3.  Connect your GitHub repository.

## 2. Configure Settings
Fill in the following details:
*   **Runtime:** Node
*   **Build Command:** `npm install`
*   **Start Command:** `npm start`

## 3. Set Environment Variables
1.  Scroll down to **"Environment Variables"**.
2.  Add the following key-value pair:
    *   **Key:** `DATABASE_URL`
    *   **Value:** *(Paste your Neon PostgreSQL connection string)*
    *   *(Note: You do not need R2 credentials here, as the app will automatically switch to using the database for file storage when the R2 bucket is missing.)*

## 4. Deploy
1.  Click **"Create Web Service"**.
2.  Render will start the build process. Once complete, your app will be live at `https://your-app-name.onrender.com`.、
