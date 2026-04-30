// Glue layer entre les routes mission et le service de templates email.
// Centralise la collecte des variables (mission + lot + adresse + locataires +
// technicien + workspace) et le dispatch fire-and-forget vers les bons
// destinataires selon le déclencheur métier (Cadrage FC §6).

import { query } from '../db/index.js'
import {
  sendTemplated,
  formatDateLong,
  formatHeure,
} from './email-template-service.js'

interface MissionContext {
  workspace_id: string
  workspace_nom: string
  mission_id: string
  mission_reference: string
  date_planifiee: string | null
  heure_debut: string | null
  heure_fin: string | null
  lot_designation: string
  lot_adresse: string
}

interface Locataire {
  email: string | null
  prenom: string | null
  nom: string
  raison_sociale: string | null
}

interface Technicien {
  email: string | null
  prenom: string
  nom: string
  tel: string | null
}

/** Charge en une requête tout le contexte mission utile aux mails. */
async function loadMissionContext(missionId: string): Promise<MissionContext | null> {
  const r = await query(
    `SELECT m.id, m.reference, m.date_planifiee::date::text as date_planifiee, m.heure_debut, m.heure_fin,
       m.workspace_id, w.nom AS workspace_nom,
       l.designation AS lot_designation,
       (SELECT concat_ws(', ', ab.rue, ab.code_postal || ' ' || ab.ville)
        FROM adresse_batiment ab
        WHERE ab.batiment_id = l.batiment_id AND ab.type = 'principale' LIMIT 1) AS lot_adresse
     FROM mission m
     JOIN workspace w ON w.id = m.workspace_id
     JOIN lot l ON l.id = m.lot_id
     WHERE m.id = $1`,
    [missionId]
  )
  if (r.rows.length === 0) return null
  const row = r.rows[0]
  return {
    workspace_id: row.workspace_id,
    workspace_nom: row.workspace_nom ?? '',
    mission_id: row.id,
    mission_reference: row.reference,
    date_planifiee: row.date_planifiee,
    heure_debut: row.heure_debut,
    heure_fin: row.heure_fin,
    lot_designation: row.lot_designation ?? '',
    lot_adresse: row.lot_adresse ?? '',
  }
}

async function loadLocataires(missionId: string): Promise<Locataire[]> {
  // Tous les locataires distincts liés aux EDL de la mission, avec un email.
  const r = await query(
    `SELECT DISTINCT t.email, t.prenom, t.nom, t.raison_sociale
     FROM edl_locataire el
     JOIN edl_inventaire ei ON ei.id = el.edl_id
     JOIN tiers t ON t.id = el.tiers_id
     WHERE ei.mission_id = $1 AND t.email IS NOT NULL AND t.email <> ''`,
    [missionId]
  )
  return r.rows
}

async function loadTechnicien(missionId: string): Promise<Technicien | null> {
  const r = await query(
    `SELECT u.email, u.prenom, u.nom, u.tel
     FROM mission_technicien mt
     JOIN utilisateur u ON u.id = mt.user_id
     WHERE mt.mission_id = $1 AND mt.est_principal = true
     LIMIT 1`,
    [missionId]
  )
  if (r.rows.length === 0) return null
  return r.rows[0]
}

function locataireDisplayName(l: Locataire): string {
  if (l.prenom && l.nom) return `${l.prenom} ${l.nom}`
  if (l.raison_sociale) return l.raison_sociale
  return l.nom
}

function baseVars(ctx: MissionContext) {
  return {
    workspace_nom: ctx.workspace_nom,
    mission_reference: ctx.mission_reference,
    lot_designation: ctx.lot_designation,
    lot_adresse: ctx.lot_adresse,
    date_planifiee: formatDateLong(ctx.date_planifiee),
    heure_debut: formatHeure(ctx.heure_debut),
    heure_fin: formatHeure(ctx.heure_fin),
  }
}

/* ────────────────────────────────────────────────────────────
 * Déclencheurs métier — appelés depuis les routes missions.ts
 * Tous fire-and-forget : aucune erreur ne remonte au caller.
 * ──────────────────────────────────────────────────────────── */

/** Mission qui passe en "Planifié" (date renseignée). Notifie tous les
 * locataires avec email. Si un tech est déjà assigné, on inclut son nom (le
 * template peut s'en servir). */
export async function notifyMissionPlanifiee(missionId: string): Promise<void> {
  try {
    const ctx = await loadMissionContext(missionId)
    if (!ctx || !ctx.date_planifiee) return
    const [locataires, tech] = await Promise.all([loadLocataires(missionId), loadTechnicien(missionId)])
    if (locataires.length === 0) return
    const vars = baseVars(ctx)
    for (const loc of locataires) {
      if (!loc.email) continue
      await sendTemplated(ctx.workspace_id, 'mission_planifiee', loc.email, {
        ...vars,
        destinataire_nom: locataireDisplayName(loc),
        technicien_nom: tech ? `${tech.prenom} ${tech.nom}` : '',
      })
    }
  } catch (err) {
    console.error('[mission-mailer] notifyMissionPlanifiee failed:', err)
  }
}

/** Modification du créneau (date, heure_debut, heure_fin). Notifie locataires
 * + technicien (qui aura été reset à 'en_attente' par la route PATCH). */
export async function notifyCreneauModifie(
  missionId: string,
  oldFields: { date_planifiee?: string | null; heure_debut?: string | null; heure_fin?: string | null },
): Promise<void> {
  try {
    const ctx = await loadMissionContext(missionId)
    if (!ctx) return
    const [locataires, tech] = await Promise.all([loadLocataires(missionId), loadTechnicien(missionId)])
    const vars = {
      ...baseVars(ctx),
      ancienne_date: formatDateLong(oldFields.date_planifiee),
      ancien_horaire: oldFields.heure_debut
        ? `${formatHeure(oldFields.heure_debut)}${oldFields.heure_fin ? `–${formatHeure(oldFields.heure_fin)}` : ''}`
        : '',
    }
    for (const loc of locataires) {
      if (!loc.email) continue
      await sendTemplated(ctx.workspace_id, 'mission_creneau_modifie', loc.email, {
        ...vars,
        destinataire_nom: locataireDisplayName(loc),
      })
    }
    if (tech?.email) {
      await sendTemplated(ctx.workspace_id, 'mission_creneau_modifie', tech.email, {
        ...vars,
        destinataire_nom: `${tech.prenom} ${tech.nom}`,
      })
    }
  } catch (err) {
    console.error('[mission-mailer] notifyCreneauModifie failed:', err)
  }
}

/** Assignation d'un technicien — invitation envoyée au tech. Si la mission est
 * déjà planifiée et qu'on assigne après coup (assignation différée), on envoie
 * aussi un mail au locataire avec les coordonnées du tech. */
export async function notifyTechnicienAssigne(missionId: string, opts?: { isDeferred?: boolean }): Promise<void> {
  try {
    const ctx = await loadMissionContext(missionId)
    if (!ctx) return
    const tech = await loadTechnicien(missionId)
    if (!tech?.email) return

    const vars = baseVars(ctx)

    // 1. Mail invitation au tech
    await sendTemplated(ctx.workspace_id, 'technicien_invite', tech.email, {
      ...vars,
      destinataire_nom: `${tech.prenom} ${tech.nom}`,
      app_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/app/missions/${missionId}`,
    })

    // 2. Si assignation différée, prévenir le locataire que le tech est connu.
    if (opts?.isDeferred && ctx.date_planifiee) {
      const locataires = await loadLocataires(missionId)
      for (const loc of locataires) {
        if (!loc.email) continue
        await sendTemplated(ctx.workspace_id, 'mission_tech_assigne', loc.email, {
          ...vars,
          destinataire_nom: locataireDisplayName(loc),
          technicien_nom: `${tech.prenom} ${tech.nom}`,
          technicien_tel: tech.tel ?? '',
        })
      }
    }
  } catch (err) {
    console.error('[mission-mailer] notifyTechnicienAssigne failed:', err)
  }
}
