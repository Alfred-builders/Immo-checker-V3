/**
 * seed-this-week.ts
 *
 * Crée des missions cohérentes pour la semaine en cours.
 * **Majorité "Prête"** (tech accepté + RDV confirmé) — reste = quelques cas pour
 * démontrer les autres statuts d'affichage.
 *
 * Couverture finale (15 missions) :
 *   • 10× prete              — happy path
 *   •  2× rdv_a_confirmer    — action admin requise
 *   •  1× invitation_envoyee — technicien à relancer
 *   •  1× a_assigner         — pas encore de tech
 *   •  1× terminee           — EDL signés (auto-terminaison)
 *
 * Idempotent : préfixe `M-WK-` purgé avant ré-insertion.
 * Transactionnel : rollback complet si une seule insertion échoue.
 *
 * Usage : npx tsx scripts/seed-this-week.ts
 */

import { pool } from '../server/db/index.js'

async function main() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // ── 1. Workspace actif ──────────────────────────────────────────────
    const ws = await client.query(
      `SELECT id, nom FROM workspace WHERE statut = 'actif' ORDER BY created_at ASC LIMIT 1`
    )
    if (ws.rows.length === 0) throw new Error('Aucun workspace actif — lance `npm run seed` d\'abord')
    const workspaceId: string = ws.rows[0].id
    console.log(`[seed-week] Workspace: ${ws.rows[0].nom} (${workspaceId})`)

    // ── 2. Admin + techniciens ──────────────────────────────────────────
    const admin = await client.query(
      `SELECT u.id FROM utilisateur u JOIN workspace_user wu ON wu.user_id = u.id
       WHERE wu.workspace_id = $1 AND wu.role = 'admin' LIMIT 1`,
      [workspaceId]
    )
    if (admin.rows.length === 0) throw new Error('Aucun admin dans le workspace')
    const adminId: string = admin.rows[0].id

    const techs = await client.query(
      `SELECT u.id FROM utilisateur u JOIN workspace_user wu ON wu.user_id = u.id
       WHERE wu.workspace_id = $1 AND wu.role = 'technicien' ORDER BY u.created_at ASC`,
      [workspaceId]
    )
    if (techs.rows.length < 2) throw new Error('Au moins 2 techniciens requis')
    const techIds: string[] = techs.rows.map(r => r.id)
    console.log(`[seed-week] ${techIds.length} techniciens disponibles`)

    // ── 3. Lots disponibles ─────────────────────────────────────────────
    const lots = await client.query(
      `SELECT id, designation FROM lot WHERE workspace_id = $1 AND est_archive = false ORDER BY created_at ASC LIMIT 15`,
      [workspaceId]
    )
    if (lots.rows.length < 15) throw new Error(`Au moins 15 lots requis (trouvés : ${lots.rows.length})`)
    const lotIds: string[] = lots.rows.map(r => r.id)

    // ── 4. Tiers physiques (locataires) ─────────────────────────────────
    const tiersLoc = await client.query(
      `SELECT id FROM tiers WHERE workspace_id = $1 AND type_personne = 'physique' AND est_archive = false
       ORDER BY created_at ASC LIMIT 15`,
      [workspaceId]
    )
    if (tiersLoc.rows.length < 10) throw new Error(`Au moins 10 tiers physiques requis (trouvés : ${tiersLoc.rows.length})`)
    const locIds: string[] = tiersLoc.rows.map(r => r.id)

    // ── 5. Purge idempotente ────────────────────────────────────────────
    const purge = await client.query(
      `DELETE FROM mission WHERE workspace_id = $1 AND reference LIKE 'M-WK-%' RETURNING id`,
      [workspaceId]
    )
    if (purge.rowCount) console.log(`[seed-week] Purge: ${purge.rowCount} missions précédentes supprimées`)

    // ── 6. Calendrier semaine (lundi → dimanche) ────────────────────────
    const today = new Date()
    const day = today.getDay()
    const monday = new Date(today)
    monday.setDate(today.getDate() - day + (day === 0 ? -6 : 1))
    monday.setHours(0, 0, 0, 0)
    function dayOf(offset: number): string {
      const d = new Date(monday)
      d.setDate(monday.getDate() + offset)
      return d.toISOString().slice(0, 10)
    }

    // ── 7. Références ───────────────────────────────────────────────────
    let seq = 1
    const newRef = () => `M-WK-${String(seq++).padStart(3, '0')}`

    // ── 8. Helper d'insertion ───────────────────────────────────────────
    type MissionSpec = {
      label: string
      lotIdx: number
      date: string
      h1: string
      h2: string
      statut: 'planifiee' | 'terminee' | 'annulee'
      rdv: 'a_confirmer' | 'confirme' | 'reporte'
      motif?: string
      commentaire?: string
      technicien?: { userId: string; invitation: 'en_attente' | 'accepte' | 'refuse' }
      edls: Array<{
        sens: 'entree' | 'sortie'
        type?: 'edl' | 'inventaire'
        statut?: 'brouillon' | 'signe' | 'infructueux'
        date_signature?: string | null
        locataires?: Array<{ tiersIdx: number; role: 'entrant' | 'sortant' }>
      }>
      avec_inventaire?: boolean
      type_bail?: 'individuel' | 'collectif'
    }

    async function insertMission(spec: MissionSpec) {
      const mRes = await client.query(
        `INSERT INTO mission
           (workspace_id, lot_id, created_by, reference, date_planifiee,
            heure_debut, heure_fin, statut, statut_rdv,
            avec_inventaire, type_bail, commentaire, motif_annulation)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         RETURNING id, reference`,
        [
          workspaceId, lotIds[spec.lotIdx], adminId, newRef(), spec.date,
          spec.h1, spec.h2, spec.statut, spec.rdv,
          spec.avec_inventaire ?? false, spec.type_bail ?? null,
          spec.commentaire ?? null, spec.motif ?? null,
        ]
      )
      const missionId: string = mRes.rows[0].id
      const reference: string = mRes.rows[0].reference

      if (spec.technicien) {
        await client.query(
          `INSERT INTO mission_technicien (mission_id, user_id, est_principal, statut_invitation)
           VALUES ($1, $2, true, $3)`,
          [missionId, spec.technicien.userId, spec.technicien.invitation]
        )
      }

      for (const edl of spec.edls) {
        const edlRes = await client.query(
          `INSERT INTO edl_inventaire
             (workspace_id, mission_id, lot_id, technicien_id, type, sens, statut, date_signature)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING id`,
          [
            workspaceId, missionId, lotIds[spec.lotIdx],
            spec.technicien?.userId ?? null,
            edl.type ?? 'edl', edl.sens, edl.statut ?? 'brouillon',
            edl.date_signature ?? null,
          ]
        )
        if (edl.locataires) {
          for (const loc of edl.locataires) {
            await client.query(
              `INSERT INTO edl_locataire (edl_id, tiers_id, role_locataire) VALUES ($1, $2, $3)`,
              [edlRes.rows[0].id, locIds[loc.tiersIdx], loc.role]
            )
          }
        }
      }

      console.log(`  ✓ ${reference} [${spec.label}] — ${spec.date} ${spec.h1}-${spec.h2}`)
    }

    // ── 9. Plan : 10× prete + 5 autres = 15 missions ─────────────────────
    // Technicien alterné entre techIds[0] et techIds[1] pour réalisme.
    const t0 = techIds[0]
    const t1 = techIds[1]

    const missions: MissionSpec[] = [
      // ═══════════════════════ MAJORITÉ — 10× PRÊTE ═══════════════════════
      // Lundi
      {
        label: 'prete', lotIdx: 0, date: dayOf(0), h1: '09:00', h2: '11:00',
        statut: 'planifiee', rdv: 'confirme',
        technicien: { userId: t0, invitation: 'accepte' },
        edls: [{ sens: 'entree', locataires: [{ tiersIdx: 0, role: 'entrant' }] }],
      },
      {
        label: 'prete+inv', lotIdx: 1, date: dayOf(0), h1: '14:30', h2: '16:30',
        statut: 'planifiee', rdv: 'confirme', avec_inventaire: true,
        commentaire: 'Code interphone #A458',
        technicien: { userId: t1, invitation: 'accepte' },
        edls: [
          { sens: 'sortie', locataires: [{ tiersIdx: 1, role: 'sortant' }] },
          { sens: 'sortie', type: 'inventaire', locataires: [{ tiersIdx: 1, role: 'sortant' }] },
        ],
      },
      // Mardi
      {
        label: 'prete', lotIdx: 2, date: dayOf(1), h1: '09:30', h2: '11:00',
        statut: 'planifiee', rdv: 'confirme',
        technicien: { userId: t0, invitation: 'accepte' },
        edls: [{ sens: 'entree', locataires: [{ tiersIdx: 2, role: 'entrant' }] }],
      },
      {
        label: 'prete', lotIdx: 3, date: dayOf(1), h1: '14:00', h2: '16:00',
        statut: 'planifiee', rdv: 'confirme',
        commentaire: 'Locataire demande passer les clés en main propre',
        technicien: { userId: t1, invitation: 'accepte' },
        edls: [{ sens: 'sortie', locataires: [{ tiersIdx: 3, role: 'sortant' }] }],
      },
      // Mercredi
      {
        label: 'prete+entrée+sortie', lotIdx: 4, date: dayOf(2), h1: '09:00', h2: '12:00',
        statut: 'planifiee', rdv: 'confirme',
        commentaire: 'Changement de locataire — double EDL entrée + sortie',
        technicien: { userId: t0, invitation: 'accepte' },
        edls: [
          { sens: 'sortie', locataires: [{ tiersIdx: 4, role: 'sortant' }] },
          { sens: 'entree', locataires: [{ tiersIdx: 5, role: 'entrant' }] },
        ],
      },
      {
        label: 'prete', lotIdx: 5, date: dayOf(2), h1: '15:00', h2: '16:30',
        statut: 'planifiee', rdv: 'confirme',
        technicien: { userId: t1, invitation: 'accepte' },
        edls: [{ sens: 'entree', locataires: [{ tiersIdx: 6, role: 'entrant' }] }],
      },
      // Jeudi
      {
        label: 'prete+coloc_collectif', lotIdx: 6, date: dayOf(3), h1: '10:00', h2: '12:30',
        statut: 'planifiee', rdv: 'confirme', type_bail: 'collectif',
        commentaire: 'Colocation solidaire — 2 signataires sur le même EDL',
        technicien: { userId: t0, invitation: 'accepte' },
        edls: [{
          sens: 'entree',
          locataires: [
            { tiersIdx: 7, role: 'entrant' },
            { tiersIdx: 8, role: 'entrant' },
          ],
        }],
      },
      {
        label: 'prete', lotIdx: 7, date: dayOf(3), h1: '14:30', h2: '16:00',
        statut: 'planifiee', rdv: 'confirme',
        technicien: { userId: t1, invitation: 'accepte' },
        edls: [{ sens: 'sortie', locataires: [{ tiersIdx: 9, role: 'sortant' }] }],
      },
      // Vendredi
      {
        label: 'prete+inv', lotIdx: 8, date: dayOf(4), h1: '09:00', h2: '11:30',
        statut: 'planifiee', rdv: 'confirme', avec_inventaire: true,
        technicien: { userId: t0, invitation: 'accepte' },
        edls: [
          { sens: 'entree', locataires: [{ tiersIdx: 0, role: 'entrant' }] },
          { sens: 'entree', type: 'inventaire', locataires: [{ tiersIdx: 0, role: 'entrant' }] },
        ],
      },
      {
        label: 'prete', lotIdx: 9, date: dayOf(4), h1: '14:00', h2: '15:30',
        statut: 'planifiee', rdv: 'confirme',
        technicien: { userId: t1, invitation: 'accepte' },
        edls: [{ sens: 'sortie', locataires: [{ tiersIdx: 1, role: 'sortant' }] }],
      },

      // ═══════════════════════ 5 CAS VARIÉS ═══════════════════════
      // CAS "rdv_a_confirmer" (×2) — tech OK mais RDV pas confirmé
      {
        label: 'rdv_a_confirmer', lotIdx: 10, date: dayOf(1), h1: '16:30', h2: '18:00',
        statut: 'planifiee', rdv: 'a_confirmer',
        commentaire: 'Rappeler locataire pour confirmer créneau',
        technicien: { userId: t0, invitation: 'accepte' },
        edls: [{ sens: 'entree', locataires: [{ tiersIdx: 2, role: 'entrant' }] }],
      },
      {
        label: 'rdv_a_confirmer', lotIdx: 11, date: dayOf(3), h1: '17:00', h2: '18:30',
        statut: 'planifiee', rdv: 'a_confirmer',
        technicien: { userId: t1, invitation: 'accepte' },
        edls: [{ sens: 'sortie', locataires: [{ tiersIdx: 3, role: 'sortant' }] }],
      },
      // CAS "invitation_envoyee" — tech pas encore répondu
      {
        label: 'invitation_envoyee', lotIdx: 12, date: dayOf(2), h1: '14:00', h2: '15:30',
        statut: 'planifiee', rdv: 'confirme',
        commentaire: 'Mission attribuée, attente réponse technicien',
        technicien: { userId: t0, invitation: 'en_attente' },
        edls: [{ sens: 'entree', locataires: [{ tiersIdx: 4, role: 'entrant' }] }],
      },
      // CAS "a_assigner" — pas encore de tech
      {
        label: 'a_assigner', lotIdx: 13, date: dayOf(5), h1: '10:00', h2: '12:00',
        statut: 'planifiee', rdv: 'a_confirmer',
        commentaire: 'À assigner en priorité (weekend)',
        edls: [{ sens: 'sortie', locataires: [{ tiersIdx: 5, role: 'sortant' }] }],
      },
      // CAS "terminee" — EDL signés (auto-terminaison)
      {
        label: 'terminee', lotIdx: 14, date: dayOf(0), h1: '08:00', h2: '09:30',
        statut: 'terminee', rdv: 'confirme',
        technicien: { userId: t1, invitation: 'accepte' },
        edls: [{
          sens: 'sortie', statut: 'signe',
          date_signature: new Date(monday.getTime() + 9 * 3600000 + 15 * 60000).toISOString(),
          locataires: [{ tiersIdx: 6, role: 'sortant' }],
        }],
      },
    ]

    console.log(`[seed-week] Création de ${missions.length} missions sur la semaine ${dayOf(0)} → ${dayOf(6)}`)
    console.log(`[seed-week] Répartition : 10 Prêtes · 2 RDV à confirmer · 1 Invitation envoyée · 1 À assigner · 1 Terminée`)
    for (const m of missions) await insertMission(m)

    await client.query('COMMIT')
    console.log(`[seed-week] ✅ Terminé — ${missions.length} missions insérées`)
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('[seed-week] ❌ Échec, rollback :', err)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
