import { Hono } from 'hono'
import postgres from 'postgres'

export const app = new Hono()

// Middleware to inject DB client
app.use('*', async (c, next) => {
  // Use environment variable from Hono context (Workers) or process.env (Node)
  const url = c.env?.DATABASE_URL || (typeof process !== 'undefined' ? process.env?.DATABASE_URL : undefined)

  if (!url) {
    return c.json({ error: 'Missing DATABASE_URL environment variable' }, 500)
  }
  
  // postgres.js handles connection logic.
  const sql = postgres(url)
  c.set('sql', sql)
  
  await next()
})


// Ensure tables exist
const initDb = async (sql) => {
  await sql`
    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      name TEXT,
      value TEXT
    )
  `
  // Create files table for Node.js/Render storage
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

/* ---------- CRUD ---------- */

app.get('/items', async c => {
  const sql = c.get('sql')
  await initDb(sql)
  const items = await sql`SELECT * FROM items`
  return c.json(items)
})

app.get('/items/:id', async c => {
  const sql = c.get('sql')
  const item = await sql`SELECT * FROM items WHERE id = ${c.req.param('id')}`
  return item.length > 0
    ? c.json(item[0])
    : c.json({ error: 'Not found' }, 404)
})

app.post('/items', async c => {
  const sql = c.get('sql')
  await initDb(sql)
  const body = await c.req.json()
  const id = crypto.randomUUID()
  const name = body.name || 'Untitled'
  const value = body.value || JSON.stringify(body)
  const newItem = { id, name, value }
  await sql`
    INSERT INTO items (id, name, value)
    VALUES (${id}, ${name}, ${value})
  `
  return c.json(newItem, 201)
})

app.put('/items/:id', async c => {
  const sql = c.get('sql')
  const id = c.req.param('id')
  const body = await c.req.json()
  const name = body.name
  const value = body.value
  const result = await sql`
    UPDATE items 
    SET name = COALESCE(${name}, name),
        value = COALESCE(${value}, value)
    WHERE id = ${id}
    RETURNING *
  `
  if (result.length === 0) {
    return c.json({ error: 'Not found' }, 404)
  }
  return c.json(result[0])
})

app.delete('/items/:id', async c => {
  const sql = c.get('sql')
  await sql`DELETE FROM items WHERE id = ${c.req.param('id')}`
  return c.json({ ok: true })
})

/* ---------- FILE UPLOAD (Dual Strategy) ---------- */

app.post('/upload', async c => {
  const form = await c.req.formData()
  const file = form.get('file')

  if (!(file instanceof File)) {
    return c.json({ error: 'File missing' }, 400)
  }

  const id = crypto.randomUUID()
  const buffer = await file.arrayBuffer()
  const bucket = c.env?.BUCKET // R2 Bucket binding

  if (bucket) {
    // Strategy 1: Cloudflare R2
    await bucket.put(id, buffer, {
      httpMetadata: { contentType: file.type },
      customMetadata: { filename: file.name }
    })
  } else {
    // Strategy 2: PostgreSQL (Node.js/Render)
    const sql = c.get('sql')
    await initDb(sql) // Ensure table exists
    
    // Convert ArrayBuffer to Buffer for postgres.js bytea
    const data = new Uint8Array(buffer)
    
    await sql`
      INSERT INTO files (id, name, type, data)
      VALUES (${id}, ${file.name}, ${file.type}, ${data})
    `
  }

  return c.json({ fileId: id }, 201)
})

app.get('/files/:id', async c => {
  const id = c.req.param('id')
  const bucket = c.env?.BUCKET

  if (bucket) {
    // Strategy 1: Cloudflare R2
    const object = await bucket.get(id)
    if (!object) return c.json({ error: 'Not found' }, 404)

    const headers = new Headers()
    object.writeHttpMetadata(headers)
    headers.set('etag', object.httpEtag)
    
    // Retrieve custom filename if stored, or default
    const filename = object.customMetadata?.filename || 'file'
    headers.set('Content-Disposition', `inline; filename="${filename}"`)

    return new Response(object.body, { headers })
  } else {
    // Strategy 2: PostgreSQL (Node.js/Render)
    const sql = c.get('sql')
    const result = await sql`SELECT * FROM files WHERE id = ${id}`
    
    if (result.length === 0) {
      return c.json({ error: 'Not found' }, 404)
    }

    const file = result[0]
    // file.data is a Buffer/Uint8Array from postgres.js
    
    return new Response(file.data, {
      headers: {
        'Content-Type': file.type,
        'Content-Disposition': `inline; filename="${file.name}"`
      }
    })
  }
})
