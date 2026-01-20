# Deployment Guide

This document outlines the strategies and steps for deploying the Unified Workflow API to various environments.

## 🌤️ Cloudflare Workers (Recommended)

Cloudflare Workers provide a global, low-latency execution environment with automatic scaling.

### 1. R2 Bucket Setup
The worker requires an R2 bucket for file storage.
```bash
npx wrangler r2 bucket create nodejs-bucket
```

### 2. Configuration (`wrangler.toml`)
Ensure your `wrangler.toml` has the correct binding:
```toml
[[r2_buckets]]
binding = "BUCKET"
bucket_name = "nodejs-bucket"
```

### 3. Secrets
Set your production database URL using wrangler secrets:
```bash
npx wrangler secret put DATABASE_URL
```

### 4. Deploy
```bash
npm run deploy
```

---

## 💻 Standard Node.js (VPS / Render / Heroku)

Deploy as a standard Node.js application using any hosting provider.

### 1. Build
Compile the TypeScript source to JavaScript:
```bash
npm run build
```

### 2. Environment Variables
Ensure the following variables are set in your hosting provider's dashboard:
- `DATABASE_URL`: Your PostgreSQL connection string.
- `PORT`: (Optional) Defaults to 3000.

### 3. Run
Start the server using the compiled output:
```bash
npm start
```

### Recommended Infrastructure (Node.js)
- **Database**: [Neon.tech](https://neon.tech) (Serverless Postgres)
- **Hosting**: [Render](https://render.com) or [Railway](https://railway.app)
- **Process Manager**: Use `pm2` for VPS deployments for automatic restarts.

```bash
pm2 start dist/index.js --name "workflow-api"
```

## 🔗 GitHub Integration (CI/CD)

To have your Workers build and deploy automatically whenever you push code, follow these steps.

### Method A: Cloudflare Dashboard (Native)
1. Go to **Workers & Pages** in your Cloudflare dashboard.
2. Select `nodejs-worker`.
3. Go to **Settings** > **Git Integration**.
4. Click **Connect to GitHub** and select your repository.
5. In the **Build Settings**:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist` (Note: for Workers, you often just need the script, but wrangler handles it).
6. **IMPORTANT**: You must add your `DATABASE_URL` to **Settings** > **Variables** > **Production** in the dashboard, or the automated build will fail.

### Method B: GitHub Actions (Recommended)
Create a file at `.github/workflows/deploy.yml`:
```yaml
name: Deploy
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm install
      - name: Deploy
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```
Generate an API Token at **My Profile** > **API Tokens** > **Edit Cloudflare Workers** template.

The application uses an "auto-init" strategy for simplicity. On the first request to `/items` or `/files/upload`, the application will automatically create the necessary tables (`items` and `files`) if they do not exist.

**Required PostgreSQL Table Schemas:**
- `items`: `(id TEXT PRIMARY KEY, name TEXT, value TEXT)`
- `files`: `(id TEXT PRIMARY KEY, name TEXT, type TEXT, data BYTEA, created_at TIMESTAMP)`
