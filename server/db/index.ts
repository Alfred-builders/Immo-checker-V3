import pg from 'pg'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const { Pool } = pg

const dbUrl = process.env.DATABASE_URL || ''
const isInternalRailway = dbUrl.includes('.railway.internal')

const pool = new Pool({
  connectionString: dbUrl,
  max: 20,
  ssl: (process.env.NODE_ENV === 'production' && !isInternalRailway) ? { rejectUnauthorized: false } : false,
})

pool.on('error', (err) => {
  console.error('[db] Unexpected error on idle client', err)
})

export async function query<T extends pg.QueryResultRow = any>(
  text: string,
  params?: unknown[]
): Promise<pg.QueryResult<T>> {
  const start = Date.now()
  const result = await pool.query<T>(text, params)
  const duration = Date.now() - start
  if (duration > 500) {
    console.warn(`[db] Slow query (${duration}ms): ${text.slice(0, 80)}...`)
  }
  return result
}

export async function getClient() {
  return pool.connect()
}

export { pool }
