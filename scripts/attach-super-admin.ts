/**
 * Attach a super-admin user to a workspace so they can login via the normal flow.
 * If no workspace exists, creates "ImmoChecker HQ" (a dedicated super-admin workspace).
 *
 * Usage: npx tsx scripts/attach-super-admin.ts <email>
 */
import { pool } from '../server/db/index.js'

async function main() {
  const email = process.argv[2] || 'admin@immocheck.fr'
  const client = await pool.connect()
  try {
    const u = await client.query(`SELECT id FROM utilisateur WHERE email = $1`, [email])
    if (u.rows.length === 0) {
      console.error(`[attach] User ${email} not found. Run create-super-admin.ts first.`)
      process.exit(1)
    }
    const userId = u.rows[0].id

    // Prefer attaching to Flat Checker (seed workspace). Fallback: create "ImmoChecker HQ".
    let ws = await client.query(`SELECT id, nom FROM workspace WHERE nom = 'Flat Checker' LIMIT 1`)
    if (ws.rows.length === 0) {
      ws = await client.query(
        `INSERT INTO workspace (nom, type_workspace, statut, email)
         VALUES ('ImmoChecker HQ', 'societe_edl', 'actif', $1)
         RETURNING id, nom`,
        [email]
      )
      console.log(`[attach] Created workspace "${ws.rows[0].nom}"`)
    }
    const wsId = ws.rows[0].id

    const attach = await client.query(
      `INSERT INTO workspace_user (workspace_id, user_id, role, est_actif)
       VALUES ($1, $2, 'admin', true)
       ON CONFLICT (workspace_id, user_id)
       DO UPDATE SET role = 'admin', est_actif = true
       RETURNING role`,
      [wsId, userId]
    )
    console.log(`[attach] ✅ ${email} attaché à "${ws.rows[0].nom}" comme ${attach.rows[0].role}`)
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
