---
notion_id: "3131d95b-2f8a-817f-93a1-c77d53bf7e21"
notion_url: "https://www.notion.so/FCR-US581-Garantir-l-isolation-compl-te-des-donn-es-entre-workspaces-3131d95b2f8a817f93a1c77d53bf7e21"
last_synced: "2026-03-26T12:55:10.784Z"
created: "2026-02-26T15:50:00.000Z"
last_edited: "2026-03-17T17:10:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "581"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Time spent: "0"
  Nom: "Garantir l'isolation complète des données entre workspaces"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3131d95b-2f8a-812c-ab8b-ed6b2d98c4fa"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Status: "📋 Backlog"
  Builders: "Tony Pineiro"
  Date de création: "2026-02-26T15:50:00.000Z"
  Code: "FCR - US581 Garantir l'isolation complète des données entre workspaces"
  Time Spent Activation: "Non"
---

# FCR - US581 Garantir l'isolation complète des données entre workspaces

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 581 |
| Created by | Tony Pineiro |
| Priority | 🔴 P0 |
| Time spent | 0 |
| Pricing | 0 |
| Project | 3071d95b-2f8a-80ac-9db8-dc4e9d2196c9 |
| Epic | 3131d95b-2f8a-812c-ab8b-ed6b2d98c4fa |
| Brique Fonctionnelle | 3131d95b-2f8a-81de-af8e-d782a1b05a0e |
| Status | 📋 Backlog |
| Builders | Tony Pineiro |
| Date de création | 2026-02-26T15:50:00.000Z |
| Code | FCR - US581 Garantir l'isolation complète des données entre workspaces |
| Time Spent Activation | Non |


# User Story
**En tant que** client ImmoChecker,
**je veux** que mes données soient strictement isolées,
**afin de** garantir confidentialité et sécurité.

---


# Critères d'acceptation (Gherkin)
```javascript
Feature: Isolation des données

  Scenario: Aucune visibilité cross-workspace
    Given un admin "FlatChecker" et un admin "Agence Versailles"
    When l'admin FlatChecker liste les bâtiments
    Then il ne voit que ceux de FlatChecker

  Scenario: Toutes tables métier scoped
    Given des données dans 2 workspaces
    When une requête est exécutée sur Batiment, Lot, Tiers, EDL, Mission, Template
    Then chaque requête filtre par workspace_id du JWT courant

  Scenario: Switch de workspace
    Given Sophie est dans 2 workspaces
    When elle switch vers "Agence Versailles"
    Then son JWT est rafraîchi avec le nouveau workspace_id
    And elle ne voit plus aucune donnée FlatChecker

  Scenario: Tentative d'accès cross-workspace via API
    Given un JWT pour workspace "FlatChecker"
    When une requête tente d'accéder à un lot de "Agence Versailles"
    Then réponse 403 Forbidden
```

---


# Règles métier
- **Toutes** les tables métier portent un `workspace_id` (sauf Utilisateur = global)
- Middleware API injecte automatiquement le filtre workspace_id
- Switch de workspace = refresh JWT
- Aucune jointure cross-workspace permise