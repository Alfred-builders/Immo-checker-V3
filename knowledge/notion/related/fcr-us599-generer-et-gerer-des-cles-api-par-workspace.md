---
notion_id: "3131d95b-2f8a-81b8-9178-f139d29338fc"
notion_url: "https://www.notion.so/FCR-US599-G-n-rer-et-g-rer-des-cl-s-API-par-workspace-3131d95b2f8a81b89178f139d29338fc"
last_synced: "2026-03-26T12:54:59.043Z"
created: "2026-02-26T15:58:00.000Z"
last_edited: "2026-03-23T13:27:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "599"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Sponsors: "clement.flatchecker@outlook.fr, Flat Checker "
  Time spent: "0"
  Nom: "Générer et gérer des clés API par workspace"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3131d95b-2f8a-8132-940f-ee9684b08080"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Status: "📋 Backlog"
  Builders: "Tony Pineiro"
  Date de création: "2026-02-26T15:58:00.000Z"
  Code: "FCR - US599 Générer et gérer des clés API par workspace"
  Time Spent Activation: "Non"
---

# FCR - US599 Générer et gérer des clés API par workspace

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 599 |
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
| Code | FCR - US599 Générer et gérer des clés API par workspace |
| Time Spent Activation | Non |


# User Story
**En tant qu'** admin d'un workspace,
**je veux** générer une ou plusieurs clés API,
**afin de** permettre à mon back-office (Airtable, SaaS) de communiquer avec ImmoChecker de manière sécurisée.

---


# Critères d'acceptation (Gherkin)
```gherkin
Feature: Gestion des clés API par workspace

  Scenario: Génération d'une clé API
    Given un admin du workspace "FlatChecker"
    When il génère une nouvelle clé API avec label="Airtable Sync"
    Then une clé API unique est créée (format: ic_live_xxxx)
    And la clé complète est affichée une seule fois (non récupérable ensuite)
    And la clé est associée au workspace "FlatChecker"

  Scenario: Authentification API via clé
    Given une clé API valide pour "FlatChecker"
    When un appel API est fait avec header Authorization: Bearer ic_live_xxxx
    Then la requête est authentifiée dans le contexte du workspace "FlatChecker"
    And seules les données de ce workspace sont accessibles

  Scenario: Clé API invalide
    Given une clé API révoquée ou inexistante
    When un appel API est fait avec cette clé
    Then une erreur 401 Unauthorized est retournée

  Scenario: Révocation d'une clé API
    Given une clé API active "Airtable Sync"
    When l'admin la révoque
    Then la clé est désactivée immédiatement
    And tout appel API avec cette clé retourne 401

  Scenario: Plusieurs clés par workspace
    Given un workspace avec 2 clés API actives
    When l'admin liste les clés
    Then il voit les 2 clés avec label, date de création, dernier usage
    And les clés sont affichées masquées (ic_live_****xxxx)
```

---


# Modèle de données impacté
**Table** : `ApiKey`
- `id` (uuid, PK), `workspace_id` (FK → Workspace)
- `key_hash` (string, hash de la clé), `key_prefix` (string, 8 derniers chars)
- `label` (string), `is_active` (bool, default: true)
- `last_used_at` (datetime?), `created_at`, `revoked_at` (datetime?)

---


# Règles métier
- La clé complète n'est jamais stockée en clair (hash uniquement)
- Seul l'admin peut générer/révoquer des clés
- Le rate limiting s'applique par clé API (à définir : ex. 100 req/min)
- Chaque clé API hérite du scope complet du workspace (pas de permissions granulaires en V1)
- La page de gestion des clés est accessible depuis **Paramètres > API & Intégrations** (EPIC 11, cf US-810)