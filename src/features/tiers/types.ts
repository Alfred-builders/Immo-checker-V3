export interface Tiers {
  id: string
  type_personne: 'physique' | 'morale'
  nom: string
  prenom?: string | null
  raison_sociale?: string | null
  siren?: string | null
  email?: string | null
  tel?: string | null
  adresse?: string | null
  code_postal?: string | null
  ville?: string | null
  date_naissance?: string | null
  representant_nom?: string | null
  notes?: string | null
  procuration?: boolean | null
  est_archive: boolean
  nb_lots_proprio?: number
  nb_lots_mandataire?: number
  nb_edl_locataire?: number
  derniere_mission?: string | null
  dernier_lot?: string | null
  proprietaire_nom?: string | null
  contact_principal?: string | null
  created_at: string
  updated_at: string
  warning?: string
}

export interface TiersDetail extends Tiers {
  lots_proprietaire?: Array<{
    id: string
    designation: string
    type_bien: string
    batiment_designation: string
    est_principal: boolean
  }> | null
  lots_mandataire?: Array<{
    id: string
    designation: string
    type_bien: string
    batiment_designation: string
  }> | null
  organisations?: Array<{
    tiers_id: string
    nom: string
    raison_sociale?: string
    fonction?: string
    est_principal: boolean
  }> | null
  membres?: Array<{
    tiers_id: string
    nom: string
    prenom?: string
    fonction?: string
    est_principal: boolean
  }> | null
}

export interface TiersStats {
  total: number
  physiques: number
  morales: number
  proprietaires: number
  mandataires: number
}

export interface ListResponse<T> {
  data: T[]
  meta: { cursor?: string; has_more: boolean }
}
