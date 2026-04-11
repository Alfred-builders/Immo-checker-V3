import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { pool } from './index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function migrate() {
  const schemaPath = path.resolve(__dirname, 'schema.sql')
  const sql = fs.readFileSync(schemaPath, 'utf-8')

  console.log('[migrate] Connecting to database...')

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    console.log('[migrate] Running schema.sql...')
    await client.query(sql)
    await client.query('COMMIT')
    console.log('[migrate] Schema applied successfully (28 tables + indexes)')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('[migrate] Migration failed:', err)
    throw err
  } finally {
    client.release()
    await pool.end()
  }
}

migrate().catch((err) => {
  console.error(err)
  process.exit(1)
})
