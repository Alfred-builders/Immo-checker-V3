// ── Mission Status Enums ──

export type MissionStatut = 'planifiee' | 'assignee' | 'terminee' | 'annulee'
export type StatutRdv = 'a_confirmer' | 'confirme' | 'reporte'
export type StatutInvitation = 'en_attente' | 'accepte' | 'refuse'
export type SensEDL = 'entree' | 'sortie'
export type StatutEDL = 'brouillon' | 'signe' | 'infructueux'
export type TypeEDL = 'edl' | 'inventaire'
export type TypeCle = 'cle_principale' | 'badge' | 'boite_aux_lettres' | 'parking' | 'cave' | 'digicode' | 'autre'
export type StatutCle = 'remise' | 'a_deposer' | 'deposee'
export type TypeBail = 'individuel' | 'collectif'

// Derived status for visual display (combines 3 independent statuses)
export type StatutDerive = 'planifiee' | 'actions_en_attente' | 'confirmee' | 'terminee' | 'annulee'

// ── Labels ──

export const missionStatutLabels: Record<MissionStatut, string> = {
  planifiee: 'Planifiée',
  assignee: 'Assignée',
  terminee: 'Terminée',
  annulee: 'Annulée',
}

export const statutRdvLabels: Record<StatutRdv, string> = {
  a_confirmer: 'À confirmer',
  confirme: 'Confirme',
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

export const missionStatutColors: Record<MissionStatut, string> = {
  planifiee: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  assignee: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  terminee: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  annulee: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
}

export const statutDeriveColors: Record<StatutDerive, string> = {
  planifiee: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  actions_en_attente: 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  confirmee: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  terminee: 'bg-muted/50 text-muted-foreground',
  annulee: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
}

export const statutDeriveBorderColors: Record<StatutDerive, string> = {
  planifiee: 'border-l-blue-500',
  actions_en_attente: 'border-l-orange-500',
  confirmee: 'border-l-emerald-500',
  terminee: 'border-l-muted-foreground',
  annulee: 'border-l-red-500',
}

export const statutDeriveMarkerColors: Record<StatutDerive, string> = {
  planifiee: '#3b82f6',
  actions_en_attente: '#f97316',
  confirmee: '#10b981',
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
}

export interface EDLLocataire {
  tiers_id: string
  nom: string
  prenom?: string
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
  mandataire: { id: string; nom: string; raison_sociale?: string } | null
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
}

export interface RecurrenceConfig {
  freq: 'daily' | 'weekly' | 'biweekly' | 'monthly'
  byday?: string[] // ['MO', 'TU', 'WE', ...]
  bymonthday?: number[]
  count?: number
  until?: string // ISO date
}

export interface TechnicianConflicts {
  missions: Array<{ id: string; reference: string; date_planifiee: string; heure_debut: string | null; heure_fin: string | null }>
  indisponibilites: Array<{ id: string; date_debut: string; date_fin: string; motif: string | null }>
}

// ── Helpers ──

export function getStatutDerive(mission: Pick<Mission, 'statut' | 'statut_rdv' | 'technicien'>): StatutDerive {
  if (mission.statut === 'terminee') return 'terminee'
  if (mission.statut === 'annulee') return 'annulee'

  const hasNoTech = !mission.technicien
  const invitationPending = mission.technicien && mission.technicien.statut_invitation !== 'accepte'
  const rdvNotConfirmed = mission.statut_rdv === 'a_confirmer'

  if (hasNoTech || invitationPending || rdvNotConfirmed) return 'actions_en_attente'
  return 'confirmee'
}

export function getPendingActions(mission: Pick<Mission, 'statut' | 'statut_rdv' | 'technicien'>): string[] {
  if (mission.statut === 'terminee' || mission.statut === 'annulee') return []
  const actions: string[] = []
  if (!mission.technicien) actions.push('A assigner')
  else if (mission.technicien.statut_invitation === 'en_attente') actions.push('Invitation en attente')
  else if (mission.technicien.statut_invitation === 'refuse') actions.push('Invitation refusee')
  if (mission.statut_rdv === 'a_confirmer') actions.push('RDV a confirmer')
  return actions
}
