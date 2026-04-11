-- ImmoChecker V1 — Complete Database Schema (28 tables + 1 system)
-- Generated from Notion spec: Architecture de Données + Attributs par Table
-- Convention: CHECK constraints (not ENUM types), UUID PKs, TIMESTAMPTZ, snake_case

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- COUCHE 1 : AUTH & WORKSPACE
-- ============================================================

CREATE TABLE IF NOT EXISTS workspace (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom VARCHAR(255) NOT NULL UNIQUE,
  type_workspace VARCHAR(20) NOT NULL CHECK (type_workspace IN ('societe_edl', 'bailleur', 'agence')),
  statut VARCHAR(20) NOT NULL DEFAULT 'actif' CHECK (statut IN ('actif', 'suspendu', 'trial')),
  siret VARCHAR(14),
  email VARCHAR(255),
  telephone VARCHAR(20),
  adresse VARCHAR(500),
  code_postal VARCHAR(10),
  ville VARCHAR(255),
  logo_url TEXT,
  couleur_primaire VARCHAR(7), -- Hex color #RRGGBB
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS utilisateur (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  nom VARCHAR(255) NOT NULL,
  prenom VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  tel VARCHAR(20),
  auth_provider VARCHAR(50) DEFAULT 'email',
  signature_image TEXT,
  failed_login_attempts INT NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workspace_user (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'gestionnaire', 'technicien')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, user_id)
);

-- Invitations (auth flow)
CREATE TABLE IF NOT EXISTS invitation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'gestionnaire', 'technicien')),
  token UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
  invited_by UUID NOT NULL REFERENCES utilisateur(id),
  accepted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Refresh tokens
CREATE TABLE IF NOT EXISTS refresh_token (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- COUCHE 2 : TIERS
-- ============================================================

CREATE TABLE IF NOT EXISTS tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
  type_personne VARCHAR(10) NOT NULL CHECK (type_personne IN ('physique', 'morale')),
  nom VARCHAR(255) NOT NULL,
  prenom VARCHAR(255),
  raison_sociale VARCHAR(255),
  siren VARCHAR(14),
  email VARCHAR(255),
  tel VARCHAR(20),
  adresse VARCHAR(500),
  code_postal VARCHAR(10),
  ville VARCHAR(255),
  date_naissance DATE,
  representant_nom VARCHAR(255),
  procuration BOOLEAN DEFAULT false,
  notes TEXT,
  est_archive BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tiers_organisation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tiers_id UUID NOT NULL REFERENCES tiers(id) ON DELETE CASCADE,
  organisation_id UUID NOT NULL REFERENCES tiers(id) ON DELETE CASCADE,
  fonction VARCHAR(100),
  est_principal BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tiers_id, organisation_id)
);

-- ============================================================
-- COUCHE 3 : PATRIMOINE
-- ============================================================

CREATE TABLE IF NOT EXISTS batiment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
  designation VARCHAR(255) NOT NULL,
  type VARCHAR(30) NOT NULL CHECK (type IN ('immeuble', 'maison', 'local_commercial', 'mixte', 'autre')),
  num_batiment VARCHAR(50),
  nb_etages INT,
  annee_construction INT,
  reference_interne VARCHAR(100),
  commentaire TEXT,
  est_archive BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS adresse_batiment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batiment_id UUID NOT NULL REFERENCES batiment(id) ON DELETE CASCADE,
  type VARCHAR(15) NOT NULL CHECK (type IN ('principale', 'secondaire')),
  rue VARCHAR(500) NOT NULL,
  complement VARCHAR(255),
  code_postal VARCHAR(10) NOT NULL,
  ville VARCHAR(255) NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  ordre INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lot (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batiment_id UUID NOT NULL REFERENCES batiment(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
  mandataire_id UUID REFERENCES tiers(id) ON DELETE SET NULL,
  designation VARCHAR(255) NOT NULL,
  reference_interne VARCHAR(100),
  type_bien VARCHAR(30) NOT NULL CHECK (type_bien IN ('appartement', 'maison', 'studio', 'local_commercial', 'parking', 'cave', 'autre')),
  nb_pieces VARCHAR(10) CHECK (nb_pieces IN ('studio', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'autre')),
  nb_pieces_precision VARCHAR(50),
  etage VARCHAR(20),
  emplacement_palier VARCHAR(100),
  surface NUMERIC(8,2),
  meuble BOOLEAN NOT NULL DEFAULT false,
  dpe_classe VARCHAR(1) CHECK (dpe_classe IN ('A', 'B', 'C', 'D', 'E', 'F', 'G')),
  ges_classe VARCHAR(1) CHECK (ges_classe IN ('A', 'B', 'C', 'D', 'E', 'F', 'G')),
  eau_chaude_type VARCHAR(20) CHECK (eau_chaude_type IN ('individuelle', 'collective', 'aucun', 'autre')),
  eau_chaude_mode VARCHAR(20) CHECK (eau_chaude_mode IN ('gaz', 'electrique', 'autre')),
  chauffage_type VARCHAR(20) CHECK (chauffage_type IN ('individuel', 'collectif', 'aucun')),
  chauffage_mode VARCHAR(20) CHECK (chauffage_mode IN ('gaz', 'electrique', 'fioul', 'autre')),
  num_cave VARCHAR(50),
  num_parking VARCHAR(50),
  commentaire TEXT,
  est_archive BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lot_proprietaire (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lot_id UUID NOT NULL REFERENCES lot(id) ON DELETE CASCADE,
  tiers_id UUID NOT NULL REFERENCES tiers(id) ON DELETE CASCADE,
  est_principal BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(lot_id, tiers_id)
);

CREATE TABLE IF NOT EXISTS compteur_lot (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lot_id UUID NOT NULL REFERENCES lot(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL CHECK (type IN ('eau_froide', 'eau_chaude', 'electricite', 'gaz', 'chauffage_collectif')),
  numero_serie VARCHAR(100),
  numero_prm VARCHAR(100),
  emplacement VARCHAR(255),
  photo_reference TEXT,
  commentaire TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- COUCHE 4 : OPERATIONNELLE
-- ============================================================

CREATE TABLE IF NOT EXISTS mission (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
  lot_id UUID NOT NULL REFERENCES lot(id) ON DELETE RESTRICT,
  created_by UUID NOT NULL REFERENCES utilisateur(id),
  reference VARCHAR(20) NOT NULL, -- Format: M-YYYY-XXXX, UNIQUE per workspace
  date_planifiee DATE NOT NULL,
  heure_debut TIME,
  heure_fin TIME,
  statut VARCHAR(15) NOT NULL DEFAULT 'planifiee' CHECK (statut IN ('planifiee', 'assignee', 'terminee', 'annulee')),
  statut_rdv VARCHAR(15) DEFAULT 'a_confirmer' CHECK (statut_rdv IN ('a_confirmer', 'confirme', 'reporte')),
  avec_inventaire BOOLEAN NOT NULL DEFAULT false,
  type_bail VARCHAR(15) CHECK (type_bail IN ('individuel', 'collectif')),
  motif_annulation TEXT,
  commentaire TEXT,
  est_archive BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mission_technicien (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id UUID NOT NULL REFERENCES mission(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES utilisateur(id),
  est_principal BOOLEAN NOT NULL DEFAULT true,
  statut_invitation VARCHAR(15) DEFAULT 'en_attente' CHECK (statut_invitation IN ('en_attente', 'accepte', 'refuse')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(mission_id, user_id)
);

CREATE TABLE IF NOT EXISTS edl_inventaire (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
  mission_id UUID REFERENCES mission(id) ON DELETE SET NULL,
  lot_id UUID NOT NULL REFERENCES lot(id),
  technicien_id UUID REFERENCES utilisateur(id),
  mandataire_id UUID REFERENCES tiers(id),
  contact_mandataire_id UUID REFERENCES tiers(id),
  edl_entree_id UUID REFERENCES edl_inventaire(id), -- For exit EDL comparatives
  type VARCHAR(15) NOT NULL CHECK (type IN ('edl', 'inventaire')),
  sens VARCHAR(10) NOT NULL CHECK (sens IN ('entree', 'sortie')),
  statut VARCHAR(15) NOT NULL DEFAULT 'brouillon' CHECK (statut IN ('brouillon', 'signe', 'infructueux')),
  code_acces VARCHAR(100),
  date_realisation TIMESTAMPTZ,
  date_signature TIMESTAMPTZ,
  presence_bailleur BOOLEAN NOT NULL DEFAULT false,
  presence_locataire BOOLEAN,
  etat_proprete VARCHAR(15) CHECK (etat_proprete IN ('tres_propre', 'propre', 'correct', 'sale', 'tres_sale')),
  commentaire_general TEXT,
  observations_locataire TEXT,
  motif_infructueux VARCHAR(255),
  future_adresse_locataire VARCHAR(500),
  attestation_assurance BOOLEAN,
  attestation_entretien_chaudiere BOOLEAN,
  consentement_locataire BOOLEAN,
  signature_bailleur_url TEXT,
  signature_locataire_url TEXT,
  pdf_url TEXT,
  web_url TEXT,
  url_verification TEXT,
  verification_token VARCHAR(100),
  est_archive BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS edl_locataire (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  edl_id UUID NOT NULL REFERENCES edl_inventaire(id) ON DELETE CASCADE,
  tiers_id UUID NOT NULL REFERENCES tiers(id) ON DELETE CASCADE,
  role_locataire VARCHAR(10) NOT NULL CHECK (role_locataire IN ('entrant', 'sortant')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(edl_id, tiers_id)
);

CREATE TABLE IF NOT EXISTS cle_mission (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  edl_id UUID NOT NULL REFERENCES edl_inventaire(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES mission(id) ON DELETE CASCADE,
  type_cle VARCHAR(25) NOT NULL CHECK (type_cle IN ('cle_principale', 'badge', 'boite_aux_lettres', 'parking', 'cave', 'digicode', 'autre')),
  quantite INT NOT NULL DEFAULT 1,
  statut VARCHAR(15) NOT NULL DEFAULT 'remise' CHECK (statut IN ('remise', 'a_deposer', 'deposee')),
  lieu_depot TEXT,
  commentaire TEXT,
  deposee_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS acces_lot (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  edl_id UUID NOT NULL REFERENCES edl_inventaire(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('cle', 'badge', 'telecommande', 'digicode', 'autre')),
  quantite INT NOT NULL DEFAULT 1,
  commentaire TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS indisponibilite_technicien (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
  date_debut TIMESTAMPTZ NOT NULL,
  date_fin TIMESTAMPTZ NOT NULL,
  est_journee_entiere BOOLEAN NOT NULL DEFAULT true,
  est_recurrent BOOLEAN NOT NULL DEFAULT false,
  recurrence_config JSONB, -- { freq, byday?, bymonthday?, count?, until? }
  motif VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Compteur readings per EDL
CREATE TABLE IF NOT EXISTS releve_compteur (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  edl_id UUID NOT NULL REFERENCES edl_inventaire(id) ON DELETE CASCADE,
  compteur_id UUID NOT NULL REFERENCES compteur_lot(id) ON DELETE CASCADE,
  type_contrat VARCHAR(20) CHECK (type_contrat IN ('base', 'hp_hc', 'personnalise')),
  photo_compteur TEXT,
  photo_prm TEXT,
  inaccessible BOOLEAN DEFAULT false,
  commentaire TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS valeur_releve_compteur (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  releve_id UUID NOT NULL REFERENCES releve_compteur(id) ON DELETE CASCADE,
  libelle VARCHAR(100) NOT NULL,
  valeur NUMERIC(15,3),
  photo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- COUCHE 5 : CATALOGUE & TEMPLATES
-- ============================================================

CREATE TABLE IF NOT EXISTS type_piece (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspace(id) ON DELETE CASCADE, -- NULL = plateforme
  nom VARCHAR(255) NOT NULL,
  icon VARCHAR(10), -- Emoji
  categorie_piece VARCHAR(30) NOT NULL CHECK (categorie_piece IN ('vie', 'eau_sanitaires', 'circulations', 'exterieur_annexes', 'equipements', 'autres')),
  source VARCHAR(15) NOT NULL DEFAULT 'plateforme' CHECK (source IN ('plateforme', 'workspace')),
  est_archive BOOLEAN NOT NULL DEFAULT false,
  ordre_affichage INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS catalogue_item (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspace(id) ON DELETE CASCADE, -- NULL = plateforme
  parent_item_id UUID REFERENCES catalogue_item(id) ON DELETE CASCADE, -- Self-ref for sub-items (max depth 2)
  nom VARCHAR(255) NOT NULL,
  categorie VARCHAR(30) NOT NULL CHECK (categorie IN ('revetement_sol', 'revetement_mur', 'revetement_plafond', 'menuiserie', 'plomberie', 'electricite', 'chauffage', 'ventilation', 'electromenager', 'mobilier', 'equipement', 'serrurerie', 'vitrage', 'exterieur', 'divers', 'structure', 'securite')),
  contexte VARCHAR(15) NOT NULL CHECK (contexte IN ('edl', 'inventaire')),
  source VARCHAR(15) NOT NULL DEFAULT 'plateforme' CHECK (source IN ('plateforme', 'workspace', 'terrain')),
  aide_contextuelle TEXT,
  est_archive BOOLEAN NOT NULL DEFAULT false,
  ordre_affichage INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS valeur_referentiel (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  catalogue_item_id UUID NOT NULL REFERENCES catalogue_item(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspace(id) ON DELETE CASCADE, -- NULL = plateforme
  critere VARCHAR(20) NOT NULL CHECK (critere IN ('caracteristiques', 'degradations', 'couleur')),
  valeur VARCHAR(255) NOT NULL,
  source VARCHAR(15) NOT NULL DEFAULT 'plateforme' CHECK (source IN ('plateforme', 'workspace', 'terrain')),
  est_archive BOOLEAN NOT NULL DEFAULT false,
  ordre_affichage INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS config_critere_categorie (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
  categorie VARCHAR(30) NOT NULL CHECK (categorie IN ('revetement_sol', 'revetement_mur', 'revetement_plafond', 'menuiserie', 'plomberie', 'electricite', 'chauffage', 'ventilation', 'electromenager', 'mobilier', 'equipement', 'serrurerie', 'vitrage', 'exterieur', 'divers', 'structure', 'securite')),
  etat_general VARCHAR(15) NOT NULL DEFAULT 'obligatoire' CHECK (etat_general IN ('masque', 'optionnel', 'recommande', 'obligatoire')),
  proprete VARCHAR(15) NOT NULL DEFAULT 'recommande' CHECK (proprete IN ('masque', 'optionnel', 'recommande', 'obligatoire')),
  photos VARCHAR(15) NOT NULL DEFAULT 'recommande' CHECK (photos IN ('masque', 'optionnel', 'recommande', 'obligatoire')),
  caracteristiques VARCHAR(15) NOT NULL DEFAULT 'optionnel' CHECK (caracteristiques IN ('masque', 'optionnel', 'recommande', 'obligatoire')),
  couleur VARCHAR(15) NOT NULL DEFAULT 'optionnel' CHECK (couleur IN ('masque', 'optionnel', 'recommande', 'obligatoire')),
  degradations VARCHAR(15) NOT NULL DEFAULT 'recommande' CHECK (degradations IN ('masque', 'optionnel', 'recommande', 'obligatoire')),
  fonctionnement VARCHAR(15) NOT NULL DEFAULT 'optionnel' CHECK (fonctionnement IN ('masque', 'optionnel', 'recommande', 'obligatoire')),
  quantite VARCHAR(15) NOT NULL DEFAULT 'masque' CHECK (quantite IN ('masque', 'optionnel', 'recommande', 'obligatoire')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, categorie)
);

CREATE TABLE IF NOT EXISTS config_critere_item (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
  catalogue_item_id UUID NOT NULL REFERENCES catalogue_item(id) ON DELETE CASCADE,
  critere VARCHAR(20) NOT NULL CHECK (critere IN ('etat_general', 'proprete', 'photos', 'caracteristiques', 'couleur', 'degradations', 'fonctionnement', 'quantite')),
  niveau VARCHAR(15) NOT NULL CHECK (niveau IN ('masque', 'optionnel', 'recommande', 'obligatoire')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, catalogue_item_id, critere)
);

CREATE TABLE IF NOT EXISTS template_piece_item (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type_piece_id UUID NOT NULL REFERENCES type_piece(id) ON DELETE CASCADE,
  catalogue_item_id UUID NOT NULL REFERENCES catalogue_item(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspace(id) ON DELETE CASCADE, -- NULL = plateforme
  quantite_defaut INT NOT NULL DEFAULT 1,
  labels_defaut JSONB, -- Default labels for duplicates
  ordre_affichage INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(type_piece_id, catalogue_item_id, workspace_id)
);

-- ============================================================
-- COUCHE 6 : SAISIE TERRAIN (EDL)
-- ============================================================

CREATE TABLE IF NOT EXISTS piece_edl (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  edl_id UUID NOT NULL REFERENCES edl_inventaire(id) ON DELETE CASCADE,
  type_piece_id UUID NOT NULL REFERENCES type_piece(id),
  nom_personnalise VARCHAR(255) NOT NULL,
  ordre INT NOT NULL DEFAULT 1,
  commentaire_piece TEXT,
  nb_photos_min INT,
  photos_ensemble JSONB, -- General view photos
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS evaluation_item (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  piece_edl_id UUID NOT NULL REFERENCES piece_edl(id) ON DELETE CASCADE,
  catalogue_item_id UUID NOT NULL REFERENCES catalogue_item(id),
  parent_evaluation_id UUID REFERENCES evaluation_item(id) ON DELETE CASCADE, -- Self-ref for sub-items
  label VARCHAR(255),
  ordre INT NOT NULL DEFAULT 1,
  quantite INT DEFAULT 1,
  etat_general VARCHAR(20) CHECK (etat_general IN ('neuf', 'bon_etat', 'etat_usage', 'mauvais_etat', 'degrade')),
  fonctionnement VARCHAR(25) CHECK (fonctionnement IN ('fonctionne', 'fonctionne_difficilement', 'hors_service', 'non_teste')),
  proprete VARCHAR(15) CHECK (proprete IN ('ras', 'a_nettoyer')),
  couleur VARCHAR(100),
  caracteristiques JSONB, -- Array of selected characteristic IDs
  degradations JSONB, -- Array of degradation tag IDs
  observation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS photo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  edl_id UUID NOT NULL REFERENCES edl_inventaire(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL,
  entity_type VARCHAR(15) NOT NULL CHECK (entity_type IN ('item', 'sous_item', 'piece', 'compteur', 'acces', 'cle')),
  url TEXT NOT NULL,
  titre VARCHAR(255),
  ordre INT,
  taille_octets INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- COUCHE 7 : PREFERENCES
-- ============================================================

CREATE TABLE IF NOT EXISTS user_preference (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
  page VARCHAR(100) NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, workspace_id, page)
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Workspace isolation (critical for multi-tenant queries)
CREATE INDEX IF NOT EXISTS idx_tiers_workspace ON tiers(workspace_id);
CREATE INDEX IF NOT EXISTS idx_batiment_workspace ON batiment(workspace_id);
CREATE INDEX IF NOT EXISTS idx_lot_workspace ON lot(workspace_id);
CREATE INDEX IF NOT EXISTS idx_mission_workspace ON mission(workspace_id);
CREATE INDEX IF NOT EXISTS idx_edl_workspace ON edl_inventaire(workspace_id);

-- Foreign keys (query performance)
CREATE INDEX IF NOT EXISTS idx_adresse_batiment ON adresse_batiment(batiment_id);
CREATE INDEX IF NOT EXISTS idx_lot_batiment ON lot(batiment_id);
CREATE INDEX IF NOT EXISTS idx_lot_mandataire ON lot(mandataire_id);
CREATE INDEX IF NOT EXISTS idx_lot_proprietaire_lot ON lot_proprietaire(lot_id);
CREATE INDEX IF NOT EXISTS idx_lot_proprietaire_tiers ON lot_proprietaire(tiers_id);
CREATE INDEX IF NOT EXISTS idx_mission_lot ON mission(lot_id);
CREATE INDEX IF NOT EXISTS idx_mission_technicien_mission ON mission_technicien(mission_id);
CREATE INDEX IF NOT EXISTS idx_edl_mission ON edl_inventaire(mission_id);
CREATE INDEX IF NOT EXISTS idx_edl_lot ON edl_inventaire(lot_id);
CREATE INDEX IF NOT EXISTS idx_edl_locataire_edl ON edl_locataire(edl_id);
CREATE INDEX IF NOT EXISTS idx_cle_mission_edl ON cle_mission(edl_id);
CREATE INDEX IF NOT EXISTS idx_piece_edl_edl ON piece_edl(edl_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_piece ON evaluation_item(piece_edl_id);
CREATE INDEX IF NOT EXISTS idx_photo_entity ON photo(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_catalogue_parent ON catalogue_item(parent_item_id);
CREATE INDEX IF NOT EXISTS idx_template_piece ON template_piece_item(type_piece_id);
CREATE INDEX IF NOT EXISTS idx_valeur_ref_item ON valeur_referentiel(catalogue_item_id);

-- Archive filter (commonly filtered)
CREATE INDEX IF NOT EXISTS idx_batiment_archive ON batiment(est_archive) WHERE est_archive = false;
CREATE INDEX IF NOT EXISTS idx_lot_archive ON lot(est_archive) WHERE est_archive = false;
CREATE INDEX IF NOT EXISTS idx_tiers_archive ON tiers(est_archive) WHERE est_archive = false;

-- Search
CREATE INDEX IF NOT EXISTS idx_batiment_designation ON batiment(designation);
CREATE INDEX IF NOT EXISTS idx_lot_designation ON lot(designation);
CREATE INDEX IF NOT EXISTS idx_tiers_nom ON tiers(nom);
CREATE INDEX IF NOT EXISTS idx_utilisateur_email ON utilisateur(email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_mission_reference_workspace ON mission(workspace_id, reference);
CREATE INDEX IF NOT EXISTS idx_mission_date ON mission(date_planifiee);
CREATE INDEX IF NOT EXISTS idx_mission_workspace_statut ON mission(workspace_id, statut);

-- Performance: common query patterns
CREATE INDEX IF NOT EXISTS idx_edl_locataire_tiers ON edl_locataire(tiers_id);
CREATE INDEX IF NOT EXISTS idx_mission_technicien_user ON mission_technicien(user_id);
CREATE INDEX IF NOT EXISTS idx_indispo_user ON indisponibilite_technicien(user_id);
CREATE INDEX IF NOT EXISTS idx_tiers_org_org ON tiers_organisation(organisation_id);
CREATE INDEX IF NOT EXISTS idx_workspace_user_user ON workspace_user(user_id);
CREATE INDEX IF NOT EXISTS idx_mission_archive ON mission(est_archive) WHERE est_archive = false;

-- Invitation
CREATE INDEX IF NOT EXISTS idx_invitation_token ON invitation(token);
CREATE INDEX IF NOT EXISTS idx_invitation_email ON invitation(email);
CREATE INDEX IF NOT EXISTS idx_refresh_token_hash ON refresh_token(token_hash);
