import { Context } from 'hono'
import { Sql } from 'postgres'

export interface Item {
  id: string
  name: string
  value: string
}

export interface FileData {
  id: string
  name: string
  type: string
  data: Uint8Array
  created_at?: Date
}

export type Bindings = {
  DATABASE_URL: string
  BUCKET?: R2Bucket
}

export type Variables = {
  sql: Sql
}

export type AppContext = Context<{ Bindings: Bindings; Variables: Variables }>
