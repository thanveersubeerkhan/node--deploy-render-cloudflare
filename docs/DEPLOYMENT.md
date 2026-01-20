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

---

## 🛠️ Database Migrations

The application uses an "auto-init" strategy for simplicity. On the first request to `/items` or `/files/upload`, the application will automatically create the necessary tables (`items` and `files`) if they do not exist.

**Required PostgreSQL Table Schemas:**
- `items`: `(id TEXT PRIMARY KEY, name TEXT, value TEXT)`
- `files`: `(id TEXT PRIMARY KEY, name TEXT, type TEXT, data BYTEA, created_at TIMESTAMP)`
