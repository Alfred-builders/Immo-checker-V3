---
notion_id: "3271d95b-2f8a-817e-a4e4-e4c9fc311a11"
notion_url: "https://www.notion.so/FCR-US835-G-rer-le-catalogue-d-items-CatalogueItem-3271d95b2f8a817ea4e4e4c9fc311a11"
last_synced: "2026-03-26T12:56:25.623Z"
created: "2026-03-18T14:42:00.000Z"
last_edited: "2026-03-18T14:42:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "835"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Sponsors: "clement.flatchecker@outlook.fr, Flat Checker "
  Time spent: "0"
  Nom: "Gérer le catalogue d'items (CatalogueItem)"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3131d95b-2f8a-81c3-b92a-c62e50395681"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Status: "📌 Ready"
  Builders: "Tony Pineiro"
  Date de création: "2026-03-18T14:42:00.000Z"
  Code: "FCR - US835 Gérer le catalogue d'items (CatalogueItem)"
  Time Spent Activation: "Non"
---

# FCR - US835 Gérer le catalogue d'items (CatalogueItem)

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 835 |
| Created by | Tony Pineiro |
| Priority | 🔴 P0 |
| Sponsors | clement.flatchecker@outlook.fr, Flat Checker  |
| Time spent | 0 |
| Pricing | 0 |
| Project | 3071d95b-2f8a-80ac-9db8-dc4e9d2196c9 |
| Epic | 3131d95b-2f8a-81c3-b92a-c62e50395681 |
| Brique Fonctionnelle | 3131d95b-2f8a-81de-af8e-d782a1b05a0e |
| Status | 📌 Ready |
| Builders | Tony Pineiro |
| Date de création | 2026-03-18T14:42:00.000Z |
| Code | FCR - US835 Gérer le catalogue d'items (CatalogueItem) |
| Time Spent Activation | Non |


# User Story
**En tant que** admin du workspace,
**je veux** consulter et enrichir le catalogue d'items disponibles,
**afin de** personnaliser les éléments que mes techniciens peuvent évaluer.

---


# Critères d'acceptation (Gherkin)
```gherkin
Feature: Catalogue d'items

  Scenario: Consultation du catalogue
    Given l'admin accède à Paramètres > Catalogue Items
    Then il voit les items par onglet EDL | Inventaire
    And groupés par catégorie (Revêtements, Menuiseries…)
    And chaque item affiche : nom, catégorie, source (Plateforme/Workspace), nb sous-items, nb pièces liées

  Scenario: Détail d'un item
    Given l'admin clique sur "Évier"
    Then un drawer s'ouvre avec :
      - Critères avec niveaux hérités (catégorie) + overrides surlignés
      - Tags Caractéristiques (Inox, Résine, Céramique…)
      - Tags Dégradations (Rayure, Éclat, Calcaire…)
      - Sous-items (Robinet, Bonde, Siphon, Joints)
      - Aide contextuelle (tip technicien)

  Scenario: Ajouter un item au catalogue
    Given l'admin clique "Nouvel item"
    Then il renseigne : nom, catégorie, contexte (EDL/Inventaire)
    And la source est "Workspace"
    And il peut ajouter des tags caractéristiques et dégradations

  Scenario: Ajouter/modifier des tags référentiel
    Given le détail de l'item "Mur"
    When l'admin ajoute un tag dégradation "Trace de scotch"
    Then le tag est ajouté en tant que ValeurReferentiel source=workspace
    And les tags plateforme sont non supprimables (distinction visuelle)

  Scenario: Items plateforme non supprimables
    Given un item "Sol" source=Plateforme
    Then pas de bouton "Supprimer"
    And l'admin peut masquer l'item (est_archive) pour ne plus le proposer
```

---


# Modèle de données
- `CatalogueItem` : nom, categorie (enum), contexte (edl/inventaire), parent_item_id (self-ref), aide_contextuelle, source, workspace_id, est_archive
- `ValeurReferentiel` : catalogue_item_id, critere, valeur, source, workspace_id

---


# Règles métier
- 3 niveaux : plateforme (FC, non modifiable) → workspace (ajouts/masquages) → terrain (V1: local EDL)
- Les items plateforme peuvent être masqués (est_archive) mais pas supprimés
- Les tags plateforme sont non supprimables, distinction visuelle (badge)
- Accessible depuis Paramètres > Catalogue Items