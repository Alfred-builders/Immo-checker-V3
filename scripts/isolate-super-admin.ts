/**
 * Isolate a super-admin on a dedicated empty workspace.
 * - Detach them from all client workspaces
 * - Create "ImmoChecker HQ" (if not exists)
 * - Attach them to HQ as admin (JWT still needs a workspace_id)
 *
 * Usage: npx tsx scripts/isolate-super-admin.ts <email>
 */
import { pool } from '../server/db/index.js'

async function main() {
  const email = process.argv[2] || 'admin@immocheck.fr'
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const u = await client.query(`SELECT id FROM utilisateur WHERE email = $1`, [email])
    if (u.rows.length === 0) {
      console.error(`[isolate] User ${email} not found.`)
      process.exit(1)
    }
    const userId = u.rows[0].id

    // Ensure HQ workspace exists
    let hq = await client.query(`SELECT id, nom FROM workspace WHERE nom = 'ImmoChecker HQ' LIMIT 1`)
    if (hq.rows.length === 0) {
      hq = await client.query(
        `INSERT INTO workspace (nom, type_workspace, statut, email)
         VALUES ('ImmoChecker HQ', 'societe_edl', 'actif', $1)
         RETURNING id, nom`,
        [email]
      )
      console.log(`[isolate] Created workspace "${hq.rows[0].nom}"`)
    }
    const hqId = hq.rows[0].id

    // List current memberships (for report)
    const memberships = await client.query(
      `SELECT w.nom, wu.role FROM workspace_user wu
       JOIN workspace w ON w.id = wu.workspace_id
       WHERE wu.user_id = $1`,
      [userId]
    )
    console.log(`[isolate] Current memberships:`, memberships.rows.map((r) => `${r.nom} (${r.role})`).join(', ') || '(none)')

    // Detach from ALL workspaces except HQ
    const deleted = await client.query(
      `DELETE FROM workspace_user
       WHERE user_id = $1 AND workspace_id != $2
       RETURNING workspace_id`,
      [userId, hqId]
    )
    if (deleted.rows.length > 0) {
      console.log(`[isolate] Detached from ${deleted.rows.length} workspace(s)`)
    }

    // Attach to HQ as admin (idempotent)
    await client.query(
      `INSERT INTO workspace_user (workspace_id, user_id, role, est_actif)
       VALUES ($1, $2, 'admin', true)
       ON CONFLICT (workspace_id, user_id)
       DO UPDATE SET role = 'admin', est_actif = true`,
      [hqId, userId]
    )
    console.log(`[isolate] ✅ ${email} est maintenant isolé sur "ImmoChecker HQ" (admin)`)

    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
