import { Hono } from 'hono'
import { getSql } from './db/database'
import itemRoutes from './routes/itemRoutes'
import fileRoutes from './routes/fileRoutes'
import { Bindings, Variables } from './types'

export const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// Middleware to inject DB client
app.use('*', async (c, next) => {
  try {
    const sql = getSql(c as any)
    c.set('sql', sql)
  } catch (error) {
    console.error('DB Connection Error:', error)
    // We don't return 500 here to allow potential routes that don't need DB
  }
  await next()
})

// Routes
app.route('/items', itemRoutes)
app.route('/files', fileRoutes)

// Default root route
app.get('/', (c) => {
  const isWorker = !!c.env && Object.keys(c.env).length > 0
  const environment = isWorker ? 'Cloudflare Workers' : 'Node.js'
  return c.text(`API is running on ${environment}!`)
})
