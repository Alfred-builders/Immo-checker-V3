---
notion_id: "3271d95b-2f8a-811c-8990-f83d81219dfe"
notion_url: "https://www.notion.so/FCR-US832-G-rer-les-types-de-pi-ces-CRUD-TypePiece-3271d95b2f8a811c8990f83d81219dfe"
last_synced: "2026-03-26T12:56:20.991Z"
created: "2026-03-18T14:42:00.000Z"
last_edited: "2026-03-18T14:42:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "832"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Sponsors: "clement.flatchecker@outlook.fr, Flat Checker "
  Time spent: "0"
  Nom: "Gérer les types de pièces (CRUD TypePiece)"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3131d95b-2f8a-81c3-b92a-c62e50395681"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Status: "📌 Ready"
  Builders: "Tony Pineiro"
  Date de création: "2026-03-18T14:42:00.000Z"
  Code: "FCR - US832 Gérer les types de pièces (CRUD TypePiece)"
  Time Spent Activation: "Non"
---

# FCR - US832 Gérer les types de pièces (CRUD TypePiece)

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 832 |
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
| Code | FCR - US832 Gérer les types de pièces (CRUD TypePiece) |
| Time Spent Activation | Non |


# User Story
**En tant que** admin du workspace,
**je veux** gérer les types de pièces disponibles dans mes templates,
**afin de** personnaliser les pièces proposées à mes techniciens.

---


# Critères d'acceptation (Gherkin)
```gherkin
Feature: Gestion des types de pièces

  Scenario: Liste des types de pièces
    Given l'admin accède à Paramètres > Templates > Pièces
    Then il voit la liste des types de pièces groupés par catégorie :
      | Catégorie               | Exemples                              |
      | Pièces de vie           | Entrée, Salon, Cuisine, Chambre…      |
      | Eau & Sanitaires        | SDB, WC, Buanderie…                   |
      | Circulations            | Couloir, Dressing…                    |
      | Extérieurs & Annexes    | Balcon, Terrasse, Cave, Garage…       |
    And chaque pièce affiche : nom, icône, nb items liés, source (Plateforme/Workspace)
    And les pièces plateforme sont non supprimables (badge "Plateforme")

  Scenario: Ajouter un type de pièce
    Given l'admin clique "Ajouter un type de pièce"
    Then il renseigne : nom, catégorie, icône
    And la source est automatiquement "Workspace"
    And le type apparaît dans la liste

  Scenario: Supprimer un type de pièce workspace
    Given un type de pièce "Piscine" créé par le workspace
    When l'admin clique "Supprimer"
    Then le type est archivé (soft delete)
    And les EDL existants utilisant ce type ne sont pas affectés

  Scenario: Les types plateforme ne sont pas supprimables
    Given un type "Cuisine" (source = Plateforme)
    Then le bouton "Supprimer" n'est pas disponible
```

---


# Modèle de données
- `TypePiece` : nom, categorie_piece (enum), icon, source (plateforme/workspace), workspace_id, est_archive

---


# Règles métier
- ~30 types de pièces par défaut (niveau plateforme), non supprimables
- Le workspace peut ajouter ses propres types
- Accessible depuis Paramètres > Templates