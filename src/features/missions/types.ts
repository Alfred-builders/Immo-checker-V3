// ── Mission Status Enums ──
//
// Modèle de statuts mission — Cadrage Flat Checker (28/04/2026).
//   • Statut MISSION (4 valeurs SQL) : planifiee / terminee / infructueuse / annulee
//   • Statut UI dérivé (5 valeurs) : a_planifier / planifie / finalisee / infructueuse / annulee
//     — "a_planifier" = mission planifiee sans date confirmée (date_planifiee IS NULL).
//     — "finalisee" = SQL terminee, label FR "Finalisée".
//   • Statut INVITATION technicien : en_attente (Invité) / accepte / refuse
//   • PAS de statut RDV locataire en V1 (suppression — pas d'app locataire).

export type MissionStatut = 'planifiee' | 'terminee' | 'infructueuse' | 'annulee'
export type StatutInvitation = 'en_attente' | 'accepte' | 'refuse'
export type SensEDL = 'entree' | 'sortie'
export type StatutEDL = 'brouillon' | 'signe' | 'infructueux'
export type TypeEDL = 'edl' | 'inventaire'
export type TypeCle = 'cle_principale' | 'badge' | 'boite_aux_lettres' | 'parking' | 'cave' | 'digicode' | 'autre'
export type StatutCle = 'remise' | 'a_deposer' | 'deposee'
export type TypeBail = 'individuel' | 'collectif'

// Statut UI dérivé — source de vérité unique pour tous les badges, filtres,
// couleurs cartes, etc. Les anciens StatutMission (4 valeurs a_traiter/prete/...)
// et StatutAffichage (9 valeurs) ont été supprimés au profit de ce modèle plat.
export type StatutMission = 'a_planifier' | 'planifie' | 'finalisee' | 'infructueuse' | 'annulee'

// ── Labels ──

export const missionStatutLabels: Record<MissionStatut, string> = {
  planifiee: 'Planifiée',
  terminee: 'Finalisée',
  infructueuse: 'Infructueuse',
  annulee: 'Annulée',
}

export const statutMissionLabels: Record<StatutMission, string> = {
  a_planifier: 'À planifier',
  planifie: 'Planifié',
  finalisee: 'Finalisée',
  infructueuse: 'Infructueuse',
  annulee: 'Annulée',
}

// "En attente" → "Invité" (cf. cadrage : terminologie côté agence). Conservé en
// version courte pour les pills compactes ; version longue pour les contextes
// ambigus (Tony §3.5).
export const statutInvitationLabels: Record<StatutInvitation, string> = {
  en_attente: 'Invité',
  accepte: 'Accepté',
  refuse: 'Refusé',
}

export const statutInvitationLabelsLong: Record<StatutInvitation, string> = {
  en_attente: 'Technicien invité — en attente de réponse',
  accepte: 'Technicien a accepté',
  refuse: 'Technicien a refusé',
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

// Raw statut colors — 4 valeurs SQL. Préférer statutMissionColors (UI dérivé).
export const missionStatutColors: Record<MissionStatut, string> = {
  planifiee: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  terminee: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  infructueuse: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  annulee: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
}

// Badge couleurs (fond + texte + bordure) pour les 5 valeurs UI.
export const statutMissionColors: Record<StatutMission, string> = {
  a_planifier:  'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
  planifie:     'bg-sky-50 text-sky-700 border-sky-200/60 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800',
  finalisee:    'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
  infructueuse: 'bg-orange-50 text-orange-700 border-orange-200/60 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800',
  annulee:      'bg-red-50 text-red-700 border-red-200/60 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
}

// Petit dot de couleur (utilisé dans badge + cartes calendrier).
export const statutMissionDotColors: Record<StatutMission, string> = {
  a_planifier:  'bg-amber-500',
  planifie:     'bg-sky-500',
  finalisee:    'bg-emerald-500',
  infructueuse: 'bg-orange-500',
  annulee:      'bg-red-400',
}

// Fond pastel des cartes du calendrier (avec bordure).
export const statutMissionCardColors: Record<StatutMission, string> = {
  a_planifier:  'bg-amber-50 border-amber-200/60 dark:bg-amber-950/30 dark:border-amber-800',
  planifie:     'bg-sky-50 border-sky-200/60 dark:bg-sky-950/30 dark:border-sky-800',
  finalisee:    'bg-emerald-50 border-emerald-200/60 dark:bg-emerald-950/30 dark:border-emerald-800',
  infructueuse: 'bg-orange-50 border-orange-200/60 dark:bg-orange-950/30 dark:border-orange-800',
  annulee:      'bg-red-50/40 border-red-200/30 opacity-60',
}

// Pastilles markers pour la carte (mission-map).
export const statutMissionMarkerColors: Record<StatutMission, string> = {
  a_planifier:  '#f59e0b',
  planifie:     '#0ea5e9',
  finalisee:    '#10b981',
  infructueuse: '#f97316',
  annulee:      '#ef4444',
}

// Bordure verticale (utilisée dans certaines listes / cartes minimalistes).
export const statutMissionBorderColors: Record<StatutMission, string> = {
  a_planifier:  'border-l-amber-500',
  planifie:     'border-l-sky-500',
  finalisee:    'border-l-emerald-500',
  infructueuse: 'border-l-orange-500',
  annulee:      'border-l-red-500',
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
  avatar_url?: string | null
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
  date_planifiee: string | null
  heure_debut: string | null
  heure_fin: string | null
  statut: MissionStatut
  avec_inventaire: boolean
  type_bail: TypeBail | null
  commentaire: string | null
  motif_annulation: string | null
  motif_infructueux: string | null
  technicien: MissionTechnicien | null
  edl_types: string[] // ['entree', 'sortie', 'inventaire']
  has_pending_actions: boolean
  proprietaire_nom?: string | null
  locataires_noms?: string[]
  has_signed_document?: boolean
  created_at: string
  // Timestamps de transition pour le feed d'activité
  terminee_at?: string | null
  infructueuse_at?: string | null
  annulee_at?: string | null
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
    lot?: {
      id: string
      designation: string | null
      type_bien?: string | null
      nb_pieces?: string | null
      meuble?: boolean | null
    } | null
    adresse?: string | null
  }>
  indisponibilites: Array<{ id: string; date_debut: string; date_fin: string; motif: string | null }>
}

// ── Helpers ──

// Source de vérité unique pour les badges UI : transforme le statut SQL brut
// + l'absence de date en l'un des 5 statuts UI.
export function getStatutMission(mission: Pick<Mission, 'statut' | 'date_planifiee'>): StatutMission {
  if (mission.statut === 'annulee') return 'annulee'
  if (mission.statut === 'infructueuse') return 'infructueuse'
  if (mission.statut === 'terminee') return 'finalisee'
  if (!mission.date_planifiee) return 'a_planifier'
  return 'planifie'
}

// "Action requise" = mission planifiée mais incomplète (pas de date OU pas de
// technicien OU technicien pas accepté). Sert à la stat card "Actions en
// attente" du dashboard et au filtre sidebar.
export function hasPendingActions(mission: Pick<Mission, 'statut' | 'technicien' | 'date_planifiee'>): boolean {
  if (mission.statut !== 'planifiee') return false
  if (!mission.date_planifiee) return true
  if (!mission.technicien) return true
  if (mission.technicien.statut_invitation !== 'accepte') return true
  return false
}

export function getPendingActions(mission: Pick<Mission, 'statut' | 'technicien' | 'date_planifiee'>): string[] {
  if (mission.statut !== 'planifiee') return []
  const actions: string[] = []
  if (!mission.date_planifiee) actions.push('À planifier')
  if (!mission.technicien) actions.push('À assigner')
  else if (mission.technicien.statut_invitation === 'en_attente') actions.push('Inv. tech en attente')
  else if (mission.technicien.statut_invitation === 'refuse') actions.push('Inv. tech refusée')
  return actions
}
