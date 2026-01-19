import 'dotenv/config'
import { serve } from '@hono/node-server'
import { app } from './app.js'

serve({
  fetch: app.fetch,
  port: process.env.PORT || 3000
}, (info) => {
  console.log(`Listening on http://localhost:${info.port}`)
})
