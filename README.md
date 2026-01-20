# Node.js & Cloudflare Workers: Unified Workflow API

A high-performance, TypeScript-based API designed for seamless execution on both **Node.js** and **Cloudflare Workers**. It provides a unified interface for item management and file storage, with intelligent storage strategies that adapt to the runtime environment.

## 🏗️ Architecture

The project uses a shared core application logic (`src/app.ts`) with environment-specific entry points.

```mermaid
graph TD
    subgraph "Clients"
        Web["Web/Mobile App"]
        CURL["cURL / Postman"]
    end

    subgraph "Application"
        API["Hono API (src/app.ts)"]
        ItemCtrl["Item Controller"]
        FileCtrl["File Controller"]
    end

    subgraph "Runtimes"
        Node["Node.js (src/index.ts)"]
        CFW["Cloudflare Worker (src/worker.ts)"]
    end

    subgraph "Storage"
        DB[("PostgreSQL")]
        R2[("Cloudflare R2")]
    end

    Web --> CFW
    CURL --> Node
    
    Node --> API
    CFW --> API
    
    API --> ItemCtrl
    API --> FileCtrl
    
    ItemCtrl --> DB
    FileCtrl -- "Node Strategy" --> DB
    FileCtrl -- "Worker Strategy" --> R2
```

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v18 or higher
- **PostgreSQL**: A running instance (e.g., Neon.tech, Supabase, or Local)
- **Wrangler**: `npm install -g wrangler` (for Cloudflare development)

### 2. Setup
```bash
git clone <repository-url>
cd nodejs-workflow-cloudflare-deployment
npm install
```

### 3. Environment
Create a `.env` (Node) or `.dev.vars` (Worker) file:
```env
DATABASE_URL=postgres://user:password@host:port/dbname?sslmode=require
```

### 4. Run
| Runtime | Command | Port |
| --- | --- | --- |
| **Node.js** | `npm run dev` | `4000` |
| **Worker** | `npm run dev:worker` | `8787` |

## 📖 API Documentation

### Item Management
| Route | Method | Description |
| --- | --- | --- |
| `/items` | `GET` | Fetch all items |
| `/items` | `POST` | Create a new item |
| `/items/:id` | `GET` | Get item details |
| `/items/:id` | `PUT` | Update an item |
| `/items/:id` | `DELETE` | Remove an item |

**Example POST Body:**
```json
{
  "name": "My Workspace Task",
  "value": "Important data to store"
}
```

### File Management
| Route | Method | Description |
| --- | --- | --- |
| `/files/upload` | `POST` | Upload file (`multipart/form-data`) |
| `/files/:id` | `GET` | Download / Stream file |

*Note: Files are stored in PostgreSQL as `BYTEA` on Node.js and in Cloudflare R2 on Workers.*

## 🧪 Testing

The project includes a built-in verification suite. Ensure both servers are running, then execute:

```bash
npm test
```

## 🚢 Deployment

Detailed instructions for production deployment are available in the **[Deployment Guide](docs/DEPLOYMENT.md)**.

- **Cloudflare Workers**: `npm run deploy`
- **Node.js**: `npm run build` && `npm start`
