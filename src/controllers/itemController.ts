import { AppContext, Item } from '../types'
import { initDb } from '../db/database'

export class ItemController {
  static async getAll(c: AppContext) {
    const sql = c.get('sql')
    await initDb(sql)
    const items = await sql`SELECT * FROM items`
    return c.json(items)
  }

  static async getById(c: AppContext) {
    const id = c.req.param('id')
    const sql = c.get('sql')
    const item = await sql`SELECT * FROM items WHERE id = ${id}`
    return item.length > 0
      ? c.json(item[0])
      : c.json({ error: 'Not found' }, 404)
  }

  static async create(c: AppContext) {
    const sql = c.get('sql')
    await initDb(sql)
    const body = await c.req.json()
    const id = crypto.randomUUID()
    const name = body.name || 'Untitled'
    const value = body.value || JSON.stringify(body)
    
    const newItem: Item = { id, name, value }
    await sql`
      INSERT INTO items (id, name, value)
      VALUES (${id}, ${name}, ${value})
    `
    return c.json(newItem, 201)
  }

  static async update(c: AppContext) {
    const sql = c.get('sql')
    const id = c.req.param('id')
    const body = await c.req.json()
    const name = body.name
    const value = body.value
    
    const result = await sql`
      UPDATE items 
      SET name = COALESCE(${name ?? null}, name),
          value = COALESCE(${value ?? null}, value)
      WHERE id = ${id}
      RETURNING *
    `
    if (result.length === 0) {
      return c.json({ error: 'Not found' }, 404)
    }
    return c.json(result[0])
  }

  static async delete(c: AppContext) {
    const sql = c.get('sql')
    await sql`DELETE FROM items WHERE id = ${c.req.param('id')}`
    return c.json({ ok: true })
  }
}
