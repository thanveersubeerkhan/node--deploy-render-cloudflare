import { AppContext } from '../types'
import { initDb } from '../db/database'

export class FileController {
  static async upload(c: AppContext) {
    const form = await c.req.formData()
    const file = form.get('file')

    if (!file || typeof (file as any).arrayBuffer !== 'function') {
      return c.json({ error: 'File missing' }, 400)
    }

    const id = crypto.randomUUID()
    const fileAny = file as any
    const buffer = await fileAny.arrayBuffer()
    const bucket = c.env?.BUCKET

    if (bucket) {
      await bucket.put(id, buffer, {
        httpMetadata: { contentType: fileAny.type },
        customMetadata: { filename: fileAny.name }
      })
    } else {
      const sql = c.get('sql')
      await initDb(sql)
      const data = new Uint8Array(buffer)
      
      await sql`
        INSERT INTO files (id, name, type, data)
        VALUES (${id}, ${fileAny.name}, ${fileAny.type}, ${data})
      `
    }

    return c.json({ fileId: id }, 201)
  }

  static async getById(c: AppContext) {
    const id = c.req.param('id')
    const bucket = c.env?.BUCKET

    if (bucket) {
      const object = await bucket.get(id)
      if (!object) return c.json({ error: 'Not found' }, 404)

      const headers = new Headers()
      object.writeHttpMetadata(headers)
      headers.set('etag', object.httpEtag)
      const filename = object.customMetadata?.filename || 'file'
      headers.set('Content-Disposition', `inline; filename="${filename}"`)

      return new Response(object.body, { headers })
    } else {
      const sql = c.get('sql')
      const result = await sql`SELECT * FROM files WHERE id = ${id}`
      
      if (result.length === 0) {
        return c.json({ error: 'Not found' }, 404)
      }

      const file = result[0]
      return new Response(file.data, {
        headers: {
          'Content-Type': file.type,
          'Content-Disposition': `inline; filename="${file.name}"`
        }
      })
    }
  }
}
