---
notion_id: "3131d95b-2f8a-81c0-9630-df33a2b7889c"
notion_url: "https://www.notion.so/Architecture-de-Donn-es-ImmoChecker-V1-3131d95b2f8a81c09630df33a2b7889c"
last_synced: "2026-03-26T12:51:54.627Z"
created: "2026-02-26T15:32:00.000Z"
last_edited: "2026-03-23T12:04:00.000Z"
properties:
  title: "🏗️ Architecture de Données — ImmoChecker V1"
---

# 🏗️ Architecture de Données — ImmoChecker V1

| Propriete | Valeur |
|-----------|--------|


# Vision d'ensemble
Ce document décrit l'architecture de données cible d'ImmoChecker V1, issue de l'atelier 1 et des arbitrages complémentaires.

---


# Principes d'architecture
> 🎯 **Séparation Auth / Métier** : `Utilisateur` (auth, identité humaine) vs `Tiers` (entité juridique, documentaire)
> 🔗 **Rôles portés par les relations** : un Tiers n'est ni "propriétaire" ni "locataire" intrinsèquement — c'est la FK qui qualifie le rôle
> 📊 **Tables pivots pour le N:N** : WorkspaceUser, TiersOrganisation, LotProprietaire, EDLLocataire, MissionTechnicien
> ⚡ **Dérivation plutôt que duplication** : la société réalisatrice d'un EDL est dérivée du **Workspace** (nom, SIRET, adresse). Pas de FK `tiers_id` sur WorkspaceUser — la table Tiers est réservée aux stakeholders lot.
> 🏢 **Multi-tenant** : isolation par `workspace_id` sur toutes les tables métier

---


# Couches du modèle

## 1. Couche Workspace & Utilisateurs
Gestion de l'authentification, des workspaces et des rôles utilisateurs.
| Table | Description | Clés étrangères |
| **Workspace** | Espace client isolé | — |
| **Utilisateur** | Personne authentifiée (unique cross-workspace) | — |
| **WorkspaceUser** *(pivot)* | Rôle d'un user dans un workspace. Pas de tiers_id (table Tiers = stakeholders lot uniquement). | user_id, workspace_id |

## 2. Couche Tiers
Tous les acteurs externes (propriétaires, mandataires, locataires) dans une table unifiée.
| Table | Description | Clés étrangères |
| **Tiers** | Entité juridique (physique ou morale) | workspace_id |
| **TiersOrganisation** *(pivot)* | Contact lié à une organisation | tiers_id, organisation_id |
| **LotProprietaire** *(pivot)* | Propriétaire(s) d'un lot | lot_id, tiers_id |
| **EDLLocataire** *(pivot)* | Locataire(s) d'un EDL | edl_id, tiers_id |

## 3. Couche Patrimoine
Structure hiérarchique Bâtiment → Lot.
| Table | Description | Clés étrangères |
| **Batiment** | Immeuble, maison, local | workspace_id |
| **AdresseBatiment** | Adresse(s) d'un bâtiment | batiment_id |
| **Lot** | Unité locative | batiment_id, mandataire_id |

## 4. Couche Opérationnelle
Missions, EDL, inventaires et saisie terrain.
| Table | Description | Clés étrangères |
| **Mission** | 1 intervention sur 1 lot. Statuts : statut (planifiee|assignee|terminee|annulee), statut_rdv (a_confirmer|confirme|reporte) | workspace_id, lot_id, created_by |
| **MissionTechnicien** *(pivot)* | Technicien(s) assigné(s) + statut_invitation (en_attente|accepte|refuse) | mission_id, user_id |
| **EDL / Inventaire** | Document de saisie | lot_id, mission_id, template_id, technicien_id, mandataire_id |
| **Piece** | Instance de pièce dans un EDL | edl_id |
| **Section** | Catégorie dans une pièce | piece_id |
| **Item** | Élément constaté (avec sous-items) | section_id, parent_item_id |
| **Photo** | Image liée à un item | item_id |
| **Avenant** | Réserve post-signature (10 jours) | edl_id |
| **IndisponibiliteTechnicien** | Plages d'indispo technicien. Toggle est_journee_entiere (si false, datetime inclut créneau horaire). Récurrence Google Calendar (est_recurrent + recurrence_config json). | user_id, workspace_id |
| **CleMission** | Clés documentées par EDL (entrée et sortie). 3 statuts : remise (entrée, documentaire), a_deposer / deposee (sortie, workflow). Photos via table Photo (entity_type = cle). FK vers EDL pour tracer les clés par locataire en colocation. | edl_id |

## 6. Couche Catalogue & Référentiels
Items, types de pièces, valeurs de référence, configuration des critères d'évaluation.
> ⚠️ Remplace l'ancienne couche "Référentiels & Templates". La table Section est supprimée — la catégorie est un attribut de CatalogueItem, le groupement se fait côté front-end.
| Table | Description | Clés étrangères |
| **TypePiece** | Types de pièces (Cuisine, Chambre, SDB…) | workspace_id |
| **CatalogueItem** | Items du catalogue (Sol, Évier, Robinet…) avec self-ref parent_item_id | workspace_id, parent_item_id |
| **ValeurReferentiel** | Tags prédéfinis (Caractéristiques, Dégradations, Couleurs par item) | catalogue_item_id, workspace_id |
| **ConfigCritereCategorie** | Niveaux d'exigence par catégorie (dénormalisé : 1 row = 9 critères) | workspace_id |
| **ConfigCritereItem** | Overrides item-level (sparse : seulement les exceptions) | workspace_id, catalogue_item_id |
| **TemplatePieceItem** *(pivot)* | Items pré-sélectionnés par type de pièce + quantité par défaut | type_piece_id, catalogue_item_id, workspace_id |

## 7. Couche Préférences Utilisateur
Personnalisation de l'interface par utilisateur.
| Table | Description | Clés étrangères |
| **UserPreference** | Colonnes configurables, filtres sauvegardés par page/tableau | user_id |

---


# Décisions clés
| Question | Décision |  |  |
| Tiers : table unique ou séparée ? | **Unique** — rôle porté par la FK |  |  |
| Contact chez une organisation ? | Pivot **TiersOrganisation** (many-to-many) |  |  |
| Pont User ↔ Tiers ? | **WorkspaceUser.tiers_id** → entité juridique représentée |  |  |
| Société réalisatrice EDL ? | **Dérivée du Workspace** (nom, SIRET). ~~tiers_id sur WorkspaceUser supprimé~~ — table Tiers = stakeholders lot uniquement. *(20/03/2026)* |  |  |
| Prestataires ? | User standard dans WorkspaceUser. Distinction interne/externe dérivée de `tiers_id` (null = interne, renseigné = société externe). `~~is_externe~~`~~ supprimé~~ (simplification V1, 20/03/2026) |  |  |
| User multi-workspace ? | **Oui** via pivot WorkspaceUser |  |  |
| Propriétaire lié à… | **Lot** (pivot LotProprietaire) |  |  |
| Locataire lié à… | **EDL** (pivot EDLLocataire) |  |  |
| Mandataire lié à… | **Lot** (Lot.mandataire_id → Tiers) |  |  |
| Mission liée à… | **Lot** (1 mission = 1 lot) |  |  |
| Statuts mission | 3 champs séparés : **statut** (planifiee|assignee|terminee|annulee) + **statut_rdv** (a_confirmer|confirme|reporte) + **MissionTechnicien.statut_invitation** (en_attente|accepte|refuse) |  |  |
| Indisponibilités technicien | Table dédiée **IndisponibiliteTechnicien** avec toggle journée entière |  |  |
| Clés mission | Table **CleMission** : FK vers `edl_id`. Entrée + sortie. 3 statuts : `remise` (entrée, documentaire), `a_deposer / deposee` (sortie, workflow). Photos (entity_type = `cle`). Admin modifiable depuis webapp. |  |  |
| Maison individuelle | 1 bâtiment + 1 lot |  |  |
| Adresses bâtiment | Table fille AdresseBatiment (multiples) |  |  |
| Type workspace | societe_edl \ | bailleur \ | agence |
| Signature | Manuscrite tablette + QR code vérification |  |  |