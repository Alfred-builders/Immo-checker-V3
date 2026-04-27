// ── Mission Status Enums ──

// Cycle de vie pur de la mission. La réponse du technicien vit dans
// mission_technicien.statut_invitation, la confirmation du locataire dans statut_rdv.
export type MissionStatut = 'planifiee' | 'terminee' | 'annulee'
export type StatutRdv = 'a_confirmer' | 'confirme' | 'reporte'
export type StatutInvitation = 'en_attente' | 'accepte' | 'refuse'
export type SensEDL = 'entree' | 'sortie'
export type StatutEDL = 'brouillon' | 'signe' | 'infructueux'
export type TypeEDL = 'edl' | 'inventaire'
export type TypeCle = 'cle_principale' | 'badge' | 'boite_aux_lettres' | 'parking' | 'cave' | 'digicode' | 'autre'
export type StatutCle = 'remise' | 'a_deposer' | 'deposee'
export type TypeBail = 'individuel' | 'collectif'

// Statut unique d'affichage SIMPLIFIÉ dérivé des 3 axes (4 valeurs).
// Source de vérité PRIMAIRE pour les badges UI quotidienne (calendrier, drawer,
// modale du jour, colonne tableau, filtre tableau). Décision Notion :
// "Incohérence statut mission — Calendrier".
//
// Pour la granularité (où ça bloque exactement), voir la fiche détail mission
// qui affiche les 3 axes bruts séparés, et la sidebar "Actions en attente"
// qui décompose via getPendingActions().
export type StatutMission = 'a_traiter' | 'prete' | 'terminee' | 'annulee'

// Statut d'affichage DÉTAILLÉ à 8 valeurs. Conservé pour la sidebar "Actions
// en attente" et certaines vues secondaires (map, tiers/lot detail). Pour le
// badge primaire, utiliser StatutMission / getStatutMission / MissionStatusBadge.
export type StatutAffichage =
  | 'a_assigner'
  | 'invitation_envoyee'
  | 'refusee'
  | 'rdv_a_confirmer'
  | 'reportee'
  | 'prete'
  | 'terminee'
  | 'annulee'

// ── Labels ──

export const missionStatutLabels: Record<MissionStatut, string> = {
  planifiee: 'Planifiée',
  terminee: 'Terminée',
  annulee: 'Annulée',
}

export const statutMissionLabels: Record<StatutMission, string> = {
  a_traiter: 'À traiter',
  prete: 'Prête',
  terminee: 'Terminée',
  annulee: 'Annulée',
}

export const statutAffichageLabels: Record<StatutAffichage, string> = {
  a_assigner: 'À assigner',
  invitation_envoyee: 'Invitation envoyée',
  refusee: 'Refusée — à réassigner',
  rdv_a_confirmer: 'RDV à confirmer',
  reportee: 'Reportée',
  prete: 'Prête',
  terminee: 'Terminée',
  annulee: 'Annulée',
}

export const statutRdvLabels: Record<StatutRdv, string> = {
  a_confirmer: 'À confirmer',
  confirme: 'Confirmé',
  reporte: 'Reporté',
}

export const statutInvitationLabels: Record<StatutInvitation, string> = {
  en_attente: 'En attente',
  accepte: 'Accepté',
  refuse: 'Refusé',
}

export const sensLabels: Record<SensEDL, string> = {
  entree: 'Entrée',
  sortie: 'Sortie',
}

export const typeCleLabels: Record<TypeCle, string> = {
  cle_principale: 'Clé principale',
  badge: 'Badge',
  boite_aux_lettres: 'Boîte aux lettres',
  parking: 'Parking',
  cave: 'Cave',
  digicode: 'Digicode',
  autre: 'Autre',
}

export const statutCleLabels: Record<StatutCle, string> = {
  remise: 'Remise',
  a_deposer: 'À déposer',
  deposee: 'Déposée',
}

// ── Colors ──

// Raw statut colors — 3 valeurs du cycle de vie pur. À n'utiliser que quand on veut afficher
// le statut BRUT (ex. export CSV, API debug). Pour l'UI utilisateur : préférer getStatutAffichage().
export const missionStatutColors: Record<MissionStatut, string> = {
  planifiee: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  terminee: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  annulee: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
}

// Badge couleurs (fond + texte) pour le 4-valeurs primaire.
export const statutMissionColors: Record<StatutMission, string> = {
  a_traiter: 'bg-orange-50 text-orange-700 border-orange-200/60 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800',
  prete: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
  terminee: 'bg-muted/50 text-muted-foreground border-border/40',
  annulee: 'bg-red-50 text-red-700 border-red-200/60 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
}

// Petit dot de couleur (utilisé dans badge + cartes calendrier).
export const statutMissionDotColors: Record<StatutMission, string> = {
  a_traiter: 'bg-orange-500',
  prete: 'bg-emerald-500',
  terminee: 'bg-muted-foreground/30',
  annulee: 'bg-red-400',
}

// Fond pastel des cartes du calendrier (avec bordure).
export const statutMissionCardColors: Record<StatutMission, string> = {
  a_traiter: 'bg-orange-50 border-orange-200/60 dark:bg-orange-950/30 dark:border-orange-800',
  prete: 'bg-emerald-50 border-emerald-200/60 dark:bg-emerald-950/30 dark:border-emerald-800',
  terminee: 'bg-muted/30 border-border/30',
  annulee: 'bg-red-50/40 border-red-200/30 opacity-60',
}

export const statutAffichageColors: Record<StatutAffichage, string> = {
  a_assigner: 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  invitation_envoyee: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  refusee: 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  rdv_a_confirmer: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  reportee: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  prete: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  terminee: 'bg-muted/50 text-muted-foreground',
  annulee: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
}

export const statutAffichageBorderColors: Record<StatutAffichage, string> = {
  a_assigner: 'border-l-orange-500',
  invitation_envoyee: 'border-l-amber-500',
  refusee: 'border-l-orange-500',
  rdv_a_confirmer: 'border-l-amber-500',
  reportee: 'border-l-amber-500',
  prete: 'border-l-emerald-500',
  terminee: 'border-l-muted-foreground',
  annulee: 'border-l-red-500',
}

export const statutAffichageMarkerColors: Record<StatutAffichage, string> = {
  a_assigner: '#f97316',
  invitation_envoyee: '#f59e0b',
  refusee: '#f97316',
  rdv_a_confirmer: '#f59e0b',
  reportee: '#f59e0b',
  prete: '#10b981',
  terminee: '#9ca3af',
  annulee: '#ef4444',
}

export const sensColors: Record<SensEDL, string> = {
  entree: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  sortie: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
}

export const statutCleColors: Record<StatutCle, string> = {
  remise: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  a_deposer: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  deposee: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
}

// ── Data Types ──

export interface MissionTechnicien {
  user_id: string
  nom: string
  prenom: string
  est_principal: boolean
  statut_invitation: StatutInvitation
  email?: string | null
  assigned_at?: string | null
  invitation_updated_at?: string | null
}

export interface EDLLocataire {
  tiers_id: string
  nom: string
  prenom?: string
  type_personne?: 'physique' | 'morale'
  raison_sociale?: string
  role_locataire: 'entrant' | 'sortant'
}

export interface EDLInventaire {
  id: string
  type: TypeEDL
  sens: SensEDL
  statut: StatutEDL
  type_bail: TypeBail | null
  date_realisation: string | null
  date_signature: string | null
  code_acces: string | null
  presence_locataire: boolean | null
  presence_bailleur: boolean | null
  commentaire: string | null
  url_pdf: string | null
  url_web: string | null
  url_pdf_legal: string | null
  url_web_legal: string | null
  created_at?: string | null
  locataires: EDLLocataire[]
}

export interface CleMission {
  id: string
  edl_id: string
  type_cle: TypeCle
  quantite: number
  statut: StatutCle
  lieu_depot: string | null
  commentaire: string | null
  deposee_at: string | null
  created_at: string
}

export interface Mission {
  id: string
  reference: string
  lot_id: string
  lot_designation: string
  lot_type_bien: string
  batiment_designation: string
  adresse: string | null
  date_planifiee: string
  heure_debut: string | null
  heure_fin: string | null
  statut: MissionStatut
  statut_rdv: StatutRdv
  avec_inventaire: boolean
  type_bail: TypeBail | null
  commentaire: string | null
  motif_annulation: string | null
  technicien: MissionTechnicien | null
  edl_types: string[] // ['entree', 'sortie', 'inventaire']
  has_pending_actions: boolean
  proprietaire_nom?: string | null
  locataires_noms?: string[]
  has_signed_document?: boolean
  created_at: string
}

export interface MissionDetail extends Mission {
  lot: {
    id: string
    designation: string
    type_bien: string
    etage: string | null
    surface: number | null
    batiment: { id: string; designation: string }
    adresse: { rue: string; ville: string; code_postal: string } | null
  }
  proprietaires: Array<{ id: string; nom: string; prenom?: string; type_personne: string }>
  mandataire: { id: string; nom: string; prenom?: string; type_personne?: 'physique' | 'morale'; raison_sociale?: string } | null
  edls: EDLInventaire[]
  cles: CleMission[]
  created_by_nom: string
}

export interface MissionStats {
  total: number
  today: number
  pending: number
  upcoming: number
}

export interface IndisponibiliteTechnicien {
  id: string
  user_id: string
  user_nom?: string
  user_prenom?: string
  date_debut: string
  date_fin: string
  est_journee_entiere: boolean
  est_recurrent: boolean
  recurrence_config: RecurrenceConfig | null
  motif: string | null
  created_at: string
  // Virtual occurrence fields (expanded by server, not persisted)
  parent_id?: string
  is_occurrence?: boolean
}

export interface RecurrenceConfig {
  freq: 'daily' | 'weekly' | 'biweekly' | 'monthly'
  byday?: string[] // ['MO', 'TU', 'WE', ...]
  bymonthday?: number[]
  count?: number
  until?: string // ISO date
  exdates?: string[] // excluded dates (YYYY-MM-DD)
}

export interface TechnicianConflicts {
  missions: Array<{
    id: string
    reference: string
    date_planifiee: string
    heure_debut: string | null
    heure_fin: string | null
    lot?: { id: string; designation: string } | null
    adresse?: string | null
  }>
  indisponibilites: Array<{ id: string; date_debut: string; date_fin: string; motif: string | null }>
}

// ── Helpers ──

// Source de vérité PRIMAIRE pour le badge mission dans l'UI quotidienne (4 valeurs).
// Combine les 3 axes (mission.statut, statut_invitation, statut_rdv) en À traiter / Prête / Terminée / Annulée.
// Décision Notion "Incohérence statut mission — Calendrier".
export function getStatutMission(mission: Pick<Mission, 'statut' | 'statut_rdv' | 'technicien'>): StatutMission {
  if (mission.statut === 'terminee') return 'terminee'
  if (mission.statut === 'annulee') return 'annulee'
  const hasPendingAction =
    !mission.technicien ||
    mission.technicien.statut_invitation !== 'accepte' ||
    mission.statut_rdv === 'a_confirmer' ||
    mission.statut_rdv === 'reporte'
  return hasPendingAction ? 'a_traiter' : 'prete'
}

// Statut DÉTAILLÉ à 8 valeurs — granularité pour la sidebar "Actions en attente"
// et certaines vues secondaires. Pour le badge primaire, préférer getStatutMission.
export function getStatutAffichage(mission: Pick<Mission, 'statut' | 'statut_rdv' | 'technicien'>): StatutAffichage {
  if (mission.statut === 'annulee') return 'annulee'
  if (mission.statut === 'terminee') return 'terminee'
  if (!mission.technicien) return 'a_assigner'
  if (mission.technicien.statut_invitation === 'en_attente') return 'invitation_envoyee'
  if (mission.technicien.statut_invitation === 'refuse') return 'refusee'
  if (mission.statut_rdv === 'a_confirmer') return 'rdv_a_confirmer'
  if (mission.statut_rdv === 'reporte') return 'reportee'
  return 'prete'
}

// Statuts "actions en attente" = dashboard stat card + bloc US-841 + filtre sous-sélection.
const PENDING_AFFICHAGE: StatutAffichage[] = [
  'a_assigner', 'invitation_envoyee', 'refusee', 'rdv_a_confirmer', 'reportee',
]

export function hasPendingActions(mission: Pick<Mission, 'statut' | 'statut_rdv' | 'technicien'>): boolean {
  return PENDING_AFFICHAGE.includes(getStatutAffichage(mission))
}

export function getPendingActions(mission: Pick<Mission, 'statut' | 'statut_rdv' | 'technicien'>): string[] {
  if (mission.statut === 'terminee' || mission.statut === 'annulee') return []
  const actions: string[] = []
  if (!mission.technicien) actions.push('À assigner')
  else if (mission.technicien.statut_invitation === 'en_attente') actions.push('Invitation technicien en attente')
  else if (mission.technicien.statut_invitation === 'refuse') actions.push('Invitation technicien refusée')
  if (mission.statut_rdv === 'a_confirmer') actions.push('RDV à confirmer')
  return actions
}
