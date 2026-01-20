import { serve } from '@hono/node-server'
import { config } from 'dotenv'
import { app } from './app'

// Load environment variables for local/Node.js environment
config()

const port = process.env.PORT ? parseInt(process.env.PORT) : 4000

console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
