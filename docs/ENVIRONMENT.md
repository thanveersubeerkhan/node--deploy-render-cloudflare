# Environment Variables

The application requires several environment variables to function correctly. These can be set in a `.env` file (for Node.js) or `.dev.vars` (for local Worker development).

## Required Variables

| Variable | Description | Example |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL connection string | `postgres://user:password@localhost:5432/db` |

## Cloudflare Specific (Worker)

| Variable | Description |
| --- | --- |
| `BUCKET` | R2 Bucket binding (configured in `wrangler.toml`) |

## Optional Variables (Node.js)

| Variable | Description | Default |
| --- | --- | --- |
| `PORT` | Listening port for the server | `3000` |
