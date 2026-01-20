import postgres from 'postgres'
import { AppContext } from '../types'

let cachedSql: any = null
let cachedUrl: string | undefined = undefined

export const getSql = (c: AppContext) => {
  const url = c.env?.DATABASE_URL || (typeof process !== 'undefined' ? process.env?.DATABASE_URL : undefined)
  if (!url) {
    throw new Error('Missing DATABASE_URL environment variable')
  }

  // Cloudflare Workers don't allow sharing I/O objects across requests.
  // We check if we are in a Worker by checking for bindings in c.env
  // or the absence of a global process (though wrangler shims it).
  const isWorker = !!c.env && Object.keys(c.env).length > 0

  if (!isWorker && cachedSql && cachedUrl === url) {
    return cachedSql
  }

  const sql = postgres(url)
  
  if (!isWorker) {
    cachedSql = sql
    cachedUrl = url
  }
  
  return sql
}

export const initDb = async (sql: any) => {
  await sql`
    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      name TEXT,
      value TEXT
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS files (
      id TEXT PRIMARY KEY,
      name TEXT,
      type TEXT,
      data BYTEA,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `
}
