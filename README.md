# Project Codebase Guide

This project is a hybrid Node.js + Cloudflare Workers application. Here is a detailed explanation of every file in the project.

## 📂 Source Code

### `app.js`
**The Core Application Logic**
This is the main file that defines the web API.
*   **Framework:** uses `hono` to create routing (GET, POST, PUT, DELETE).
*   **Database Logic:**
    *   Connects to PostgreSQL using `postgres.js`.
    *   Automatically creates tables (`items`, `files`) if they don't exist.
*   **Hybrid Storage Logic:**
    *   Checks if it's running on Cloudflare (`c.env.BUCKET` exists).
    *   **If Cloudflare:** Saves uploaded files to R2 Storage.
    *   **If Node.js:** Saves uploaded files directly to the PostgreSQL database as a fallback.

### `worker.js`
**Cloudflare Entry Point**
This file is used *only* when deploying to Cloudflare Workers.
*   It imports `app` from `app.js`.
*   It exports the app in the default format that Cloudflare's runtime expects (`export default { fetch: ... }`).

### `server.js`
**Node.js Entry Point**
This file is used *only* when extracting the app to a standard server (like Render, AWS EC2, or local Node.js).
*   It imports `app` from `app.js`.
*   It uses `@hono/node-server` to create a standalone HTTP server.
*   It listens on port 3000 (or `process.env.PORT`).

---

## ⚙️ Configuration

### `wrangler.toml`
**Cloudflare Configuration**
Configures how the app runs on Cloudflare Global Network.
*   **name:** Sets the worker name (`nodejs-worker`).
*   **limitations:** Enables Node.js compatibility flags (`nodejs_compat`).
*   **r2_buckets:** Connects the worker to the R2 storage bucket (`nodejs-bucket`).
*   **vars:** Defines where environment variables come from.

### `package.json`
**Project Dependencies**
Lists the libraries required to run the project.
*   **Dependencies:**
    *   `hono`: The web framework.
    *   `postgres`: Database client.
    *   `@hono/node-server`: Adapter to run Hono on Node.js.
    *   `dotenv`: Loads `.env` files for local Node.js development.
*   **Scripts:**
    *   `npm run dev:worker`: Starts local Cloudflare development server.
    *   `npm start`: Starts local standard Node.js server.

---

## 🔐 Environment & Secrets

### `.env`
**Node.js Secrets**
*   Stores sensitive data when running locally or on a standard server.
*   **Key Variable:** `DATABASE_URL` (Connection string for Neon PostgreSQL).
*   *Note: This file is ignored by Git to protect your secrets.*

### `.dev.vars`
**Cloudflare Local Secrets**
*   Stores sensitive data when running `wrangler dev` (local Cloudflare simulation).
*   **Key Variable:** `DATABASE_URL`.
*   *Note: This file is ignored by Git.*

### `.env.example` & `.dev.vars.example`
**Template Files**
*   These are safe, commit-friendly templates.
*   They show other developers what variables they need to set without revealing your actual passwords.

---

## 📚 Documentation

### `DEPLOYMENT.md`
**Step-by-Step Guide**
A manual I created to help you deploy the app.
*   Contains commands to login to Cloudflare (`wrangler login`).
*   Instructions to create buckets and set secrets.
*   Guide for deploying to Render.

### `.gitignore`
**Git Exclusion List**
Tells Git which files *not* to upload to GitHub.
*   Excludes `node_modules` (heavy library files).
*   Excludes `.env`, `.dev.vars`, and `.wrangler` (secrets and temporary cache).
