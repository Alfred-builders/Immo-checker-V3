/**
 * Create or promote a super-admin user.
 *
 * Usage:
 *   npx tsx scripts/create-super-admin.ts <email> [password] [prenom] [nom]
 *
 * If the user already exists, just flips is_super_admin = true.
 * If not, creates the user with the provided password (or 'Admin1234' fallback).
 * The user is NOT attached to any workspace — they'll provision workspaces
 * via the super-admin UI and can later join one via invitation.
 */
import bcrypt from 'bcryptjs'
import { pool } from '../server/db/index.js'

async function main() {
  const [, , email, password = 'Admin1234', prenom = 'Super', nom = 'Admin'] = process.argv
  if (!email) {
    console.error('Usage: tsx scripts/create-super-admin.ts <email> [password] [prenom] [nom]')
    process.exit(1)
  }

  const normalized = email.toLowerCase().trim()
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const existing = await client.query(
      `SELECT id, email, is_super_admin FROM utilisateur WHERE email = $1`,
      [normalized]
    )

    if (existing.rows.length > 0) {
      const row = existing.rows[0]
      if (row.is_super_admin) {
        console.log(`[create-super-admin] ✅ ${normalized} est déjà super-admin (id: ${row.id})`)
      } else {
        await client.query(
          `UPDATE utilisateur SET is_super_admin = true, updated_at = now() WHERE id = $1`,
          [row.id]
        )
        console.log(`[create-super-admin] ✅ ${normalized} promu super-admin (id: ${row.id})`)
      }
    } else {
      const passwordHash = await bcrypt.hash(password, 12)
      const result = await client.query(
        `INSERT INTO utilisateur (email, nom, prenom, password_hash, is_super_admin)
         VALUES ($1, $2, $3, $4, true)
         RETURNING id`,
        [normalized, nom, prenom, passwordHash]
      )
      console.log(`[create-super-admin] ✅ Super-admin créé`)
      console.log(`                     id:       ${result.rows[0].id}`)
      console.log(`                     email:    ${normalized}`)
      console.log(`                     password: ${password}`)
      console.log(`                     (change-le via Paramètres → Mon profil)`)
    }

    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch((err) => {
  console.error('[create-super-admin] Erreur:', err)
  process.exit(1)
})
