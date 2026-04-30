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
  couleur_fond VARCHAR(7), -- Hex background color
  fond_style VARCHAR(10) DEFAULT 'gradient' CHECK (fond_style IN ('plat', 'gradient', 'mesh')),
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
  avatar_url TEXT,
  auth_provider VARCHAR(50) DEFAULT 'email',
  signature_image TEXT,
  last_login_at TIMESTAMPTZ,
  last_login_ip VARCHAR(45),
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

-- Password reset tokens (separate from invitation — different semantics)
CREATE TABLE IF NOT EXISTS password_reset_token (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
  token_hash VARCHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_password_reset_token_hash ON password_reset_token(token_hash) WHERE used_at IS NULL;

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
  designation VARCHAR(255),
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
  designation VARCHAR(255),
  reference_interne VARCHAR(100),
  type_bien VARCHAR(30) NOT NULL CHECK (type_bien IN ('appartement', 'maison', 'studio', 'local_commercial', 'parking', 'cave', 'autre')),
  type_bien_precision VARCHAR(100),
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
  date_planifiee DATE,
  heure_debut TIME,
  heure_fin TIME,
  statut VARCHAR(15) NOT NULL DEFAULT 'planifiee' CHECK (statut IN ('planifiee', 'terminee', 'infructueuse', 'annulee')),
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
  pdf_url_legal TEXT,
  web_url_legal TEXT,
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

-- ============================================================
-- COUCHE 6 : API PUBLIQUE (EPIC 10)
-- ============================================================

-- API Keys par workspace
CREATE TABLE IF NOT EXISTS api_key (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id  UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
  name          VARCHAR(255) NOT NULL,
  key_hash      VARCHAR(255) NOT NULL UNIQUE,   -- SHA-256 du token complet
  key_prefix    VARCHAR(16)  NOT NULL,           -- ex: "imk_live_a3f2" (affiché en UI)
  scope         VARCHAR(10)  NOT NULL DEFAULT 'write'
                  CHECK (scope IN ('read', 'write')),
  created_by    UUID NOT NULL REFERENCES utilisateur(id),
  last_used_at  TIMESTAMPTZ,
  expires_at    TIMESTAMPTZ,                     -- NULL = pas d'expiration
  est_active    BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_api_key_hash      ON api_key(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_key_workspace ON api_key(workspace_id);

-- Webhooks — configuration par workspace
CREATE TABLE IF NOT EXISTS webhook_config (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
  url          VARCHAR(2048) NOT NULL,
  secret       VARCHAR(255)  NOT NULL,           -- stocké en clair (utilisé pour signer HMAC)
  events       TEXT[]        NOT NULL DEFAULT '{}',
  est_active   BOOLEAN       NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_webhook_config_workspace ON webhook_config(workspace_id);

-- Webhooks — historique des livraisons
CREATE TABLE IF NOT EXISTS webhook_delivery (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  webhook_id      UUID NOT NULL REFERENCES webhook_config(id) ON DELETE CASCADE,
  event_type      VARCHAR(50) NOT NULL,
  payload         JSONB       NOT NULL,
  statut          VARCHAR(20) NOT NULL DEFAULT 'pending'
                    CHECK (statut IN ('pending', 'success', 'failed', 'retrying')),
  attempts        INT         NOT NULL DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  response_code   INT,
  response_body   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_webhook_delivery_webhook ON webhook_delivery(webhook_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_delivery_status  ON webhook_delivery(statut, created_at);
CREATE INDEX IF NOT EXISTS idx_refresh_token_hash ON refresh_token(token_hash);

-- ============================================================
-- MIGRATION: User management improvements (US-578/580/810)
-- ============================================================
ALTER TABLE workspace_user ADD COLUMN IF NOT EXISTS est_actif BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE workspace_user ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_workspace_user_actif ON workspace_user(workspace_id, est_actif) WHERE est_actif = true;

-- ============================================================
-- MIGRATION: In-app notifications (US-821)
-- ============================================================
CREATE TABLE IF NOT EXISTS notification (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
  workspace_id  UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
  type          TEXT NOT NULL,
  titre         TEXT NOT NULL,
  message       TEXT,
  lien          TEXT,
  est_lu        BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at       TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_notification_user_ws_unread
  ON notification (user_id, workspace_id, est_lu, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_created_at
  ON notification (created_at);

-- ============================================================
-- MIGRATION: User profile enrichment (avatar + login tracking)
-- ============================================================
ALTER TABLE utilisateur ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE utilisateur ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE utilisateur ADD COLUMN IF NOT EXISTS last_login_ip VARCHAR(45);

-- ============================================================
-- MIGRATION: Super-admin + Onboarding (US-577/836)
-- ============================================================
ALTER TABLE utilisateur ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE utilisateur ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;
ALTER TABLE utilisateur ADD COLUMN IF NOT EXISTS onboarding_skipped_steps TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE utilisateur ADD COLUMN IF NOT EXISTS onboarding_current_step INT NOT NULL DEFAULT 1;

-- Super-admin audit log
CREATE TABLE IF NOT EXISTS audit_log (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  super_admin_user_id UUID NOT NULL REFERENCES utilisateur(id),
  action              VARCHAR(100) NOT NULL,
  target_type         VARCHAR(30) NOT NULL,
  target_id           UUID NOT NULL,
  metadata            JSONB NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_log_target
  ON audit_log(target_type, target_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_super_admin
  ON audit_log(super_admin_user_id, created_at DESC);

-- ============================================================
-- MIGRATION: EDL legal document URLs (US-601)
-- Separates standard PDF/web from legal version rendered by tablet
-- ============================================================
ALTER TABLE edl_inventaire ADD COLUMN IF NOT EXISTS pdf_url_legal TEXT;
ALTER TABLE edl_inventaire ADD COLUMN IF NOT EXISTS web_url_legal TEXT;

-- ============================================================
-- MIGRATION: Suppression du statut 'assignee' (doublon)
-- 'assignee' dupliquait mission_technicien.statut_invitation = 'accepte'.
-- L'info reste dans le pivot. Le cycle de vie pur devient :
--   planifiee → terminee (auto tous EDL signés) | annulee
-- ============================================================
UPDATE mission SET statut = 'planifiee' WHERE statut = 'assignee';
ALTER TABLE mission DROP CONSTRAINT IF EXISTS mission_statut_check;
ALTER TABLE mission ADD CONSTRAINT mission_statut_check
  CHECK (statut IN ('planifiee', 'terminee', 'infructueuse', 'annulee'));

-- ============================================================
-- MIGRATION: type_bien_precision sur lot
-- Quand type_bien = 'autre', permet de saisir une précision libre
-- (ex: "Entrepôt", "Loft", "Box moto"…). Même pattern que nb_pieces_precision.
-- ============================================================
ALTER TABLE lot ADD COLUMN IF NOT EXISTS type_bien_precision VARCHAR(100);

-- ============================================================
-- MIGRATION: timestamps de transition sur mission (audit Tony §8)
-- updated_at change à chaque update — pas spécifique. Ces colonnes
-- permettent au feed d'activité (chronologie) de dater précisément
-- les transitions clés. Set côté backend lors des transitions.
-- ============================================================
ALTER TABLE mission ADD COLUMN IF NOT EXISTS statut_rdv_updated_at TIMESTAMPTZ;
ALTER TABLE mission ADD COLUMN IF NOT EXISTS terminee_at TIMESTAMPTZ;
ALTER TABLE mission ADD COLUMN IF NOT EXISTS annulee_at TIMESTAMPTZ;

-- ============================================================
-- MIGRATION: désignation optionnelle bâtiment + lot (Flat Checker · avr. 2026)
-- Le numéro de bâtiment (A/B/C…) reste dans num_batiment, la désignation
-- ("Les Lilas") devient secondaire/optionnelle. Idem pour lot.designation —
-- fallback d'affichage = "Bât. {num}" / "{type_bien} · étage {etage}".
-- ============================================================
ALTER TABLE batiment ALTER COLUMN designation DROP NOT NULL;
ALTER TABLE lot ALTER COLUMN designation DROP NOT NULL;

-- ============================================================
-- MIGRATION: dashboard_metrics (workspace-level pref)
-- Tableau ordonné des IDs de métriques affichées sur le dashboard.
-- Voir src/features/dashboard/metric-catalog.ts pour la liste des IDs valides.
-- Limite applicative : max 6 entrées.
-- ============================================================
ALTER TABLE workspace ADD COLUMN IF NOT EXISTS dashboard_metrics JSONB
  NOT NULL DEFAULT '["edl_month","pending_actions","upcoming_7d"]'::jsonb;

-- ============================================================
-- MIGRATION: mission.date_planifiee nullable (Flat Checker §4.6 · avr. 2026)
-- Permet de créer une mission "À planifier" sans date confirmée.
-- Le badge UI "À planifier" est dérivé via getStatutAffichage() côté frontend.
-- ============================================================
ALTER TABLE mission ALTER COLUMN date_planifiee DROP NOT NULL;

-- ============================================================
-- MIGRATION: nouveau modèle de statuts mission (Flat Checker · 28/04/2026)
-- 5 statuts UI dérivés : à planifier / planifié / finalisée / infructueuse / annulée.
-- Au niveau SQL : 4 valeurs (à planifier est dérivé de date_planifiee IS NULL).
-- + nouvelle action "Infructueuse" (tech déplacé mais EDL pas réalisé).
-- + suppression statut_rdv (pas d'app locataire en V1).
-- ============================================================
-- 1. Ajouter "infructueuse" au CHECK statut
ALTER TABLE mission DROP CONSTRAINT IF EXISTS mission_statut_check;
ALTER TABLE mission ADD CONSTRAINT mission_statut_check
  CHECK (statut IN ('planifiee', 'terminee', 'infructueuse', 'annulee'));

-- 2. Champs dédiés à l'action Infructueuse
ALTER TABLE mission ADD COLUMN IF NOT EXISTS motif_infructueux TEXT;
ALTER TABLE mission ADD COLUMN IF NOT EXISTS infructueuse_at TIMESTAMPTZ;

-- 3. Drop statut_rdv (et son timestamp). Pas d'app locataire = pas d'état RDV.
--    La validation du créneau se fait à l'oral / mail hors plateforme.
ALTER TABLE mission DROP COLUMN IF EXISTS statut_rdv;
ALTER TABLE mission DROP COLUMN IF EXISTS statut_rdv_updated_at;

-- ============================================================
-- MIGRATION: super-admin P0 controls (avr. 2026)
-- Désactivation globale d'un utilisateur (différent de workspace_user.est_actif
-- qui est par appartenance). Suspension de workspace avec motif tracé.
-- ============================================================
ALTER TABLE utilisateur ADD COLUMN IF NOT EXISTS est_actif BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE utilisateur ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_utilisateur_actif ON utilisateur(est_actif) WHERE est_actif = false;

ALTER TABLE workspace ADD COLUMN IF NOT EXISTS suspended_reason TEXT;
ALTER TABLE workspace ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ;

-- ============================================================
-- TABLE: email_template (Cadrage FC §6 · 28/04/2026)
-- Templates personnalisables par workspace pour les mails transactionnels.
-- Code = identifiant logique (mission_planifiee, mission_creneau_modifie,
-- technicien_invite, mission_tech_assigne). Si pas de ligne pour un (workspace,
-- code), on retombe sur le template par défaut codé en TS (default-templates.ts).
-- Les variables {{xxx}} sont substituées au render. Édition structurée :
-- header + footer fixes (mis dans le wrapper côté serveur), seul body_html éditable.
-- ============================================================
CREATE TABLE IF NOT EXISTS email_template (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
  code VARCHAR(60) NOT NULL,
  sujet VARCHAR(255) NOT NULL,
  body_html TEXT NOT NULL,
  -- Snapshot des variables disponibles (référentiel, pas validation stricte) ;
  -- l'éditeur s'en sert pour proposer l'autocomplétion à l'admin.
  variables_dispo JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, code)
);
CREATE INDEX IF NOT EXISTS idx_email_template_workspace ON email_template(workspace_id);
