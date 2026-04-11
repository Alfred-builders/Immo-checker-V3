// ── Type Pieces (US-832) ──

export type CategoriePiece = 'vie' | 'eau_sanitaires' | 'circulations' | 'exterieur_annexes' | 'equipements' | 'autres'

export interface TypePiece {
  id: string
  nom: string
  categorie_piece: CategoriePiece
  icon: string
  source: 'plateforme' | 'workspace'
  ordre_affichage: number
  est_archive: boolean
  nb_items?: number
  created_at: string
  updated_at: string
}

export const categoriePieceLabels: Record<CategoriePiece, string> = {
  vie: 'Pièces de vie',
  eau_sanitaires: 'Eau & Sanitaires',
  circulations: 'Circulations',
  exterieur_annexes: 'Extérieurs & Annexes',
  equipements: 'Équipements',
  autres: 'Autres',
}

// ── Catalogue Items (US-835) ──

export type CatalogueCategorie =
  | 'revetement_sol' | 'revetement_mur' | 'revetement_plafond'
  | 'menuiserie' | 'plomberie' | 'electricite' | 'chauffage' | 'ventilation'
  | 'electromenager' | 'mobilier' | 'equipement' | 'serrurerie'
  | 'vitrage' | 'exterieur' | 'divers' | 'structure' | 'securite'

export type CatalogueContexte = 'edl' | 'inventaire'

export interface CatalogueItem {
  id: string
  nom: string
  categorie: CatalogueCategorie
  contexte: CatalogueContexte
  parent_item_id: string | null
  aide_contextuelle: string | null
  source: 'plateforme' | 'workspace'
  qte_par_defaut: number | null
  ordre_affichage: number
  est_archive: boolean
  nb_sous_items?: number
  nb_pieces?: number
  created_at: string
  updated_at: string
}

export interface CatalogueItemDetail extends CatalogueItem {
  sous_items: CatalogueItem[]
  valeurs: ValeurReferentiel[]
  criteres_overrides: ConfigCritereItem[]
}

export const catalogueCategorieLabels: Record<CatalogueCategorie, string> = {
  revetement_sol: 'Revêtement sol',
  revetement_mur: 'Revêtement mur',
  revetement_plafond: 'Revêtement plafond',
  menuiserie: 'Menuiserie',
  plomberie: 'Plomberie',
  electricite: 'Électricité',
  chauffage: 'Chauffage',
  ventilation: 'Ventilation',
  electromenager: 'Électroménager',
  mobilier: 'Mobilier',
  equipement: 'Équipement',
  serrurerie: 'Serrurerie',
  vitrage: 'Vitrage',
  exterieur: 'Extérieur',
  divers: 'Divers',
  structure: 'Structure',
  securite: 'Sécurité',
}

// ── Valeur Referentiel (Tags) ──

export type CritereType = 'caracteristiques' | 'degradations' | 'couleur'

export interface ValeurReferentiel {
  id: string
  catalogue_item_id: string
  critere: CritereType
  valeur: string
  source: 'plateforme' | 'workspace'
  ordre_affichage: number
}

// ── Template Piece-Item (US-833) ──

export interface TemplatePieceItem {
  id: string
  type_piece_id: string
  catalogue_item_id: string
  quantite_defaut: number
  labels_defaut: string[] | null
  ordre_affichage: number
  item?: CatalogueItem
}

// ── Config Criteres (US-834) ──

export type NiveauExigence = 'masque' | 'optionnel' | 'recommande' | 'obligatoire'
export type CritereEvaluation = 'etat_general' | 'proprete' | 'photos' | 'caracteristiques' | 'couleur' | 'degradations' | 'fonctionnement' | 'quantite'

export const critereLabels: Record<CritereEvaluation, string> = {
  etat_general: 'État général',
  proprete: 'Propreté',
  photos: 'Photos',
  caracteristiques: 'Caractéristiques',
  couleur: 'Couleur',
  degradations: 'Dégradations',
  fonctionnement: 'Fonctionnement',
  quantite: 'Quantité',
}

export const niveauLabels: Record<NiveauExigence, string> = {
  masque: 'Masqué',
  optionnel: 'Optionnel',
  recommande: 'Recommandé',
  obligatoire: 'Obligatoire',
}

export const niveauColors: Record<NiveauExigence, string> = {
  masque: 'bg-muted/50 text-muted-foreground',
  optionnel: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  recommande: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  obligatoire: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
}

export interface ConfigCritereCategorie {
  id: string
  categorie: CatalogueCategorie
  contexte: CatalogueContexte
  etat_general: NiveauExigence
  proprete: NiveauExigence
  photos: NiveauExigence
  caracteristiques: NiveauExigence
  couleur: NiveauExigence
  degradations: NiveauExigence
  fonctionnement: NiveauExigence
  quantite: NiveauExigence
}

export interface ConfigCritereItem {
  id: string
  catalogue_item_id: string
  critere: CritereEvaluation
  niveau_exigence: NiveauExigence
}
