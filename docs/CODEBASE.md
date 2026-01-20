# 🧠 Codebase Explanation: Unified Workflow API

This document provides a deep dive into the project's technical structure, design patterns, and file-by-file logic.

---

## 📂 Directory Structure

```text
nodejs/
├── src/                # 🔵 Source code (TypeScript)
│   ├── controllers/    # Request handlers (Business logic)
│   ├── db/             # Database connection & initialization
│   ├── routes/         # API endpoint definitions
│   ├── types/          # TypeScript interfaces & types
│   ├── app.ts          # Core Hono application logic
│   ├── index.ts        # Node.js entry point
│   └── worker.ts       # Cloudflare Worker entry point
├── docs/               # 📖 Documentation
│   ├── DEPLOYMENT.md   # Deployment strategies
│   └── ENVIRONMENT.md  # Environment variable reference
├── tests/              # 🧪 Testing suite
│   └── verify.js       # API verification script
├── dist/               # 📦 Compiled production code (Generated)
├── package.json        # Project metadata & scripts
├── tsconfig.json       # TypeScript configuration
└── wrangler.toml       # Cloudflare Worker configuration
```

---

## 🛠️ Key Components & Logic

### 1. Unified Application Core (`src/app.ts`)
The "heart" of the project. It uses the **Hono** framework to define the middleware and route structure.
- **Middleware**: Injects the `sql` database client into the request context (`c.set('sql', ...)`), making it available to all downstream controllers.
- **Routing**: Plugs in the item and file route modules.

### 2. Database Layer (`src/db/database.ts`)
Handles the connectivity to PostgreSQL using `postgres.js`.
- **`getSql(c)`**: A factory function that retrieves the `DATABASE_URL`.
    - **Caching**: On Node.js, it caches the connection to prevent "exhausting" database connections during high traffic.
    - **Worker Safety**: On Cloudflare Workers, caching is disabled to comply with the platform's strict request-bound I/O rules.
- **`initDb(sql)`**: Contains the "Idempotent" schema setup (uses `CREATE TABLE IF NOT EXISTS`) to ensure the database is ready without requiring manual migrations.

### 3. Controllers (The Brains)
Located in `src/controllers/`.
- **`itemController.ts`**: Manages CRUD logic for the `items` table. Uses `crypto.randomUUID()` for unique IDs and `COALESCE` in SQL for partial updates.
- **`fileController.ts`**: Implements a **Dual Storage Strategy**:
    - **Cloudflare Strategy**: If a `BUCKET` (R2) binding is present, it streams files to Cloudflare's object storage.
    - **Node.js Strategy**: If no bucket is found, it stores the file as binary data (`BYTEA`) directly inside the PostgreSQL `files` table.

### 4. Entry Points (The Adapters)
- **`src/index.ts`**: Uses `@hono/node-server` to boot the app as a standard HTTP server listening on a port (default 4000). Loads `.env` automatically.
- **`src/worker.ts`**: A standard Cloudflare Worker export. It leverages the built-in `fetch` handler and automatically receives bindings (like `DATABASE_URL` and `BUCKET`) from the environment.

---

## 🔄 Data Request Flow

1. **Request Received**: The entry point (`index.ts` or `worker.ts`) receives a request.
2. **Context Setup**: `app.ts` middleware runs, creates/retrieves a database connection, and attaches it to the context.
3. **Routing**: Hono matches the URL (e.g., `POST /items`) and passes control to the relevant controller method.
4. **Execution**: The controller interacts with the database/R2 and calculates the response.
5. **Response**: The control returns through the middleware and is sent back to the client as JSON or a file stream.

---

## 🔍 Line-by-Line Code Walkthrough

### 1. Controllers: The Business Logic

#### **`src/controllers/itemController.ts`**
- **`getAll`**:
  - `await initDb(sql)`: Ensures the `items` table exists before querying.
  - `sql SELECT * FROM items`: Standard fetch.
- **`create`**:
  - `crypto.randomUUID()`: Generates a unique string ID.
  - `body.name || 'Untitled'`: Fallback for missing input.
  - `INSERT INTO items...`: Persists the new object.
- **`update`**:
  - `COALESCE(${name ?? null}, name)`: This is a clever SQL trick. If `name` is provided, it updates the column. If `name` is null/undefined, it keeps the existing database value (`name`).

#### **`src/controllers/fileController.ts`**
- **`upload`**:
  - `c.req.formData()`: Parses the incoming file upload.
  - **`if (bucket)`**: If the Cloudflare R2 binding is found, it uses `bucket.put()` to store the file in object storage.
  - **`else`**: If running on Node.js, it converts the file to a `Uint8Array` and saves it as a `BYTEA` (binary) blob in PostgreSQL.
- **`getById`**:
  - **`if (bucket)`**: Fetches from R2 and uses `writeHttpMetadata` to restore the correct Content-Type (e.g., image/png).
  - **`else`**: Fetches the binary blob from Postgres and returns it as a standard web `Response`.

### 2. Routes: Endpoint Mapping

#### **`src/routes/itemRoutes.ts`**
- Maps HTTP verbs to controller methods:
  - `itemRoutes.get('/', ...)` -> `ItemController.getAll`
  - `itemRoutes.post('/', ...)` -> `ItemController.create`
  - `itemRoutes.get('/:id', ...)` -> `ItemController.getById`
  - `itemRoutes.put('/:id', ...)` -> `ItemController.update`
  - `itemRoutes.delete('/:id', ...)` -> `ItemController.delete`

#### **`src/routes/fileRoutes.ts`**
- Handles the binary data paths:
  - `fileRoutes.post('/upload', ...)` -> `FileController.upload`
  - `fileRoutes.get('/:id', ...)` -> `FileController.getById`

### 3. Database: The Foundation (`src/db/database.ts`)

- **`getSql`**: 
  - Dynamic discovery: Checks `c.env` for Workers and `process.env` for Node.js.
  - **Caching Logic**: On Node.js, it reuses the same connection object across requests. This is critical for performance as creating a new TCP/TLS connection for every request would be very slow.
- **`initDb`**:
  - Runs "Silent Migrations": It checks if tables exist every time a data-heavy route is called. This makes the project "Zero Setup" for new users.

---

## 🧪 Testing Suite (`tests/verify.js`)
A standalone JavaScript tool that uses `node-fetch` and `form-data`. It runs a sequence of 8 distinct tests (Root health check, CRUD operations, File Upload, and File Download) against both local servers simultaneously.
