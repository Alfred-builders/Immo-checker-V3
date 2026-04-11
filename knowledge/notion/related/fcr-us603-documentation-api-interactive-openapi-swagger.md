---
notion_id: "3131d95b-2f8a-811d-af7b-c9b6f943d91a"
notion_url: "https://www.notion.so/FCR-US603-Documentation-API-interactive-OpenAPI-Swagger-3131d95b2f8a811daf7bc9b6f943d91a"
last_synced: "2026-03-26T12:54:57.406Z"
created: "2026-02-26T15:58:00.000Z"
last_edited: "2026-02-26T15:58:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "603"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Sponsors: "clement.flatchecker@outlook.fr, Flat Checker "
  Time spent: "0"
  Nom: "Documentation API interactive (OpenAPI / Swagger)"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3131d95b-2f8a-8132-940f-ee9684b08080"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Status: "📋 Backlog"
  Builders: "Tony Pineiro"
  Date de création: "2026-02-26T15:58:00.000Z"
  Code: "FCR - US603 Documentation API interactive (OpenAPI / Swagger)"
  Time Spent Activation: "Non"
---

# FCR - US603 Documentation API interactive (OpenAPI / Swagger)

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 603 |
| Created by | Tony Pineiro |
| Priority | 🔴 P0 |
| Sponsors | clement.flatchecker@outlook.fr, Flat Checker  |
| Time spent | 0 |
| Pricing | 0 |
| Project | 3071d95b-2f8a-80ac-9db8-dc4e9d2196c9 |
| Epic | 3131d95b-2f8a-8132-940f-ee9684b08080 |
| Brique Fonctionnelle | 3131d95b-2f8a-81de-af8e-d782a1b05a0e |
| Status | 📋 Backlog |
| Builders | Tony Pineiro |
| Date de création | 2026-02-26T15:58:00.000Z |
| Code | FCR - US603 Documentation API interactive (OpenAPI / Swagger) |
| Time Spent Activation | Non |


# User Story
**En tant que** développeur intégrateur (ou admin technique),
**je veux** consulter une documentation API interactive,
**afin de** comprendre et tester les endpoints disponibles sans support.

---


# Critères d'acceptation (Gherkin)
```gherkin
Feature: Documentation API

  Scenario: Accès à la documentation Swagger
    Given un utilisateur authentifié
    When il accède à /api/docs
    Then une interface Swagger UI est affichée
    And tous les endpoints sont listés par catégorie (missions, edl, lots, tiers, webhooks)

  Scenario: Test d'un endpoint depuis la doc
    Given l'utilisateur a renseigné sa clé API dans Swagger
    When il exécute un GET /api/v1/missions
    Then la réponse réelle est affichée avec statut, headers, body

  Scenario: Schéma OpenAPI exportable
    Given la documentation existe
    When un GET /api/openapi.json est envoyé
    Then le schéma OpenAPI 3.0 complet est retourné
    And il peut être importé dans Postman, Insomnia, etc.
```

---


# Règles métier
- La doc est auto-générée depuis les schémas API (pas de maintenance manuelle)
- Chaque endpoint documente : paramètres, body, réponses (200, 400, 401, 422), exemples
- L'accès à /api/docs est protégé par authentification (pas public)
- Le schéma OpenAPI est versionné (v1)