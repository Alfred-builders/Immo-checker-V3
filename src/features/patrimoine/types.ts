export interface Adresse {
  rue: string
  complement?: string | null
  code_postal: string
  ville: string
  latitude?: number | null
  longitude?: number | null
}

export interface AdresseDetail extends Adresse {
  id: string
  type: 'principale' | 'secondaire'
  ordre: number
}

export interface Batiment {
  id: string
  designation: string
  type: 'immeuble' | 'maison' | 'local_commercial' | 'mixte' | 'autre'
  num_batiment?: string | null
  nb_etages?: number | null
  annee_construction?: number | null
  commentaire?: string | null
  est_archive: boolean
  adresse_principale?: Adresse | null
  nb_lots: number
  derniere_mission?: string | null
  missions_a_venir: number
  created_at: string
  updated_at: string
}

export interface BatimentDetail extends Batiment {
  adresses: AdresseDetail[] | null
}

export interface TiersRef {
  id: string
  nom: string
  prenom?: string | null
  type_personne?: string
  raison_sociale?: string | null
  email?: string | null
  tel?: string | null
  est_principal?: boolean
}

export interface Lot {
  id: string
  designation: string
  reference_interne?: string | null
  type_bien: string
  type_bien_precision?: string | null
  etage?: string | null
  emplacement_palier?: string | null
  surface?: number | null
  meuble: boolean
  nb_pieces?: string | null
  est_archive: boolean
  proprietaires?: TiersRef[] | null
  mandataire?: TiersRef | null
  derniere_mission?: string | null
}

export interface LotDetail extends Lot {
  batiment_id: string
  batiment?: { id: string; designation: string; type: string }
  // type_bien_precision déjà hérité de Lot — renseigné uniquement si type_bien = 'autre'
  dpe_classe?: string | null
  ges_classe?: string | null
  eau_chaude_type?: string | null
  eau_chaude_mode?: string | null
  chauffage_type?: string | null
  chauffage_mode?: string | null
  num_cave?: string | null
  num_parking?: string | null
  commentaire?: string | null
  mandataire_id?: string | null
  created_at: string
  updated_at: string
}

export interface ListResponse<T> {
  data: T[]
  meta: {
    cursor?: string
    has_more: boolean
    total?: number
  }
}
