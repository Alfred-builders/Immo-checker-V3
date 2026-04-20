export interface SearchBatimentResult {
  id: string
  designation: string
  type: string | null
  adresse: string | null
  nb_lots: number
}

export interface SearchLotResult {
  id: string
  designation: string
  type_bien: string
  etage: string | null
  batiment_designation: string
}

export interface SearchTiersResult {
  id: string
  nom: string
  prenom: string | null
  raison_sociale: string | null
  type_personne: 'physique' | 'morale'
  email: string | null
}

export interface SearchMissionResult {
  id: string
  reference: string
  date_planifiee: string | null
  statut: 'planifiee' | 'assignee' | 'terminee' | 'annulee'
  lot_designation: string
}

export interface SearchResults {
  batiments: SearchBatimentResult[]
  lots: SearchLotResult[]
  tiers: SearchTiersResult[]
  missions: SearchMissionResult[]
}

export interface SearchResponse {
  query: string
  results: SearchResults
  meta: {
    total_returned: number
    has_more: {
      batiments: boolean
      lots: boolean
      tiers: boolean
      missions: boolean
    }
  }
}

export type SearchCategory = keyof SearchResults
