# 🚀 Hybrid Hono: Node.js + Cloudflare Workers

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-F38020?style=for-the-badge&logo=cloudflareworkers&logoColor=white)](https://workers.cloudflare.com/)
[![Hono](https://img.shields.io/badge/Hono-E36002?style=for-the-badge&logo=hono&logoColor=white)](https://hono.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

A powerful, high-performance web API built with **Hono**. This project features a **hybrid architecture** that can run seamlessly as a Cloudflare Worker (with R2 storage) or a standard Node.js server (with PostgreSQL storage).

---

## ✨ Key Features

- **🚀 Dual-Runtime Support**: Run on Cloudflare Workers or any Node.js environment (Render, VPS, etc.).
- **📂 Smart Storage Strategy**: 
  - **Cloudflare R2**: High-performance object storage when running on Cloudflare.
  - **PostgreSQL (Bytea)**: Seamless fallback to database-backed storage when running in Node.js.
- **🛠️ Automated DB Management**: Auto-initializes PostgreSQL tables (`items` and `files`) on the fly.
- **⚡ Ultra-fast Routing**: Built on [Hono](https://hono.dev/), the smallest and fastest web framework for modern runtimes.

---

## 📂 Project Architecture

### 核心 Logic (`app.js`)
The beating heart of the application. It contains the CRUD logic and the intelligent file upload strategy.

### Entry Points
- `worker.js`: Optimized for **Cloudflare Workers**.
- `server.js`: Optimized for **Node.js** (using `@hono/node-server`).

### Configuration
- `wrangler.toml`: Cloudflare deployment settings.
- `package.json`: Dependency management and scripts.

---

## 🛠️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- A PostgreSQL database (e.g., [Neon.tech](https://neon.tech/))
- (Optional) [Cloudflare Account](https://dash.cloudflare.com/) for R2 storage.

### Installation
```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL
```

### Local Development

#### Standard Node.js
```bash
npm start
```

#### Cloudflare Workers (Simulation)
```bash
npm run dev:worker
```

---

## 📡 API Documentation

### Items CRUD
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/items` | List all items. |
| `GET` | `/items/:id` | Get a specific item. |
| `POST` | `/items` | Create a new item (JSON). |
| `PUT` | `/items/:id` | Update an item. |
| `DELETE` | `/items/:id` | Delete an item. |

### File Management
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/upload` | Upload a file (Multipart Form Data). Returns `fileId`. |
| `GET` | `/files/:id` | Download/View a file by ID. |

---

## 🚀 Deployment

- **Cloudflare Workers**: Run `wrangler deploy`. See [DEPLOYMENT.md](file:///d:/desktop%20folders/pr-automate-report-generate-agent/DEPLOYMENT.md) for details.
- **Render**: Connect your GitHub repo and set the build/start commands. See [DEPLOYMENT.md](file:///d:/desktop%20folders/pr-automate-report-generate-agent/DEPLOYMENT.md).

---

## 📜 License
MIT

