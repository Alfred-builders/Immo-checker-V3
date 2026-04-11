---
notion_id: "3131d95b-2f8a-81a7-b0f3-e3558e44a603"
notion_url: "https://www.notion.so/FCR-US577-Cr-er-un-workspace-avec-type-de-profil-3131d95b2f8a81a7b0f3e3558e44a603"
last_synced: "2026-03-26T12:55:01.789Z"
created: "2026-02-26T15:50:00.000Z"
last_edited: "2026-03-23T13:09:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "577"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Time spent: "0"
  Nom: "Créer un workspace avec type de profil"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3131d95b-2f8a-812c-ab8b-ed6b2d98c4fa"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Status: "📋 Backlog"
  Builders: "Tony Pineiro"
  Date de création: "2026-02-26T15:50:00.000Z"
  Code: "FCR - US577 Créer un workspace avec type de profil"
  Time Spent Activation: "Non"
---

# FCR - US577 Créer un workspace avec type de profil

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 577 |
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
| Code | FCR - US577 Créer un workspace avec type de profil |
| Time Spent Activation | Non |


# User Story
**En tant que** super-admin / premier utilisateur,
**je veux** créer un nouveau workspace ImmoChecker,
**afin de** disposer d'un espace isolé pour gérer mon activité.

---


# Critères d'acceptation (Gherkin)
```javascript
Feature: Création d'un workspace

  Scenario: Création workspace societe_edl
    Given un utilisateur authentifié sans workspace
    When il crée un workspace avec nom="FlatChecker" et type_profil="societe_edl"
    Then un workspace est créé avec un UUID unique
    And l'utilisateur est ajouté comme WorkspaceUser avec role="admin"
    And les données du workspace sont isolées

  Scenario: Création workspace bailleur
    Given un utilisateur authentifié sans workspace
    When il crée un workspace avec type_profil="bailleur"
    Then le workspace est créé avec workflow simplifié

  Scenario: Création workspace agence
    Given un utilisateur authentifié sans workspace
    When il crée un workspace avec type_profil="agence"
    Then le workspace est créé avec gestion de parc intégrée

  Scenario: Champs obligatoires
    Given un utilisateur authentifié
    When il tente de créer un workspace sans nom
    Then une erreur de validation est retournée
```

---


# Modèle de données impacté
**Table** : `Workspace`
- `id` (uuid, PK)
- `nom` (string, requis)
- `type_workspace` (enum: societe_edl | bailleur | agence, requis)
- `logo_url` (string?, URL de l'image uploadée)
- `couleur_primaire` (string?, hex ex: #2563eb — couleur de l'interface et des PDF)
- `adresse` (string?), `code_postal` (string?), `ville` (string?)
- `siret` (string?)
- `email` (string?), `telephone` (string?)
- `created_at`, `updated_at` (datetime, auto)
> ℹ️ Pas de `plan_abonnement` en V1 — la gestion des abonnements n'est pas dans le scope.
**Table** : `WorkspaceUser` — entrée auto-créée pour le fondateur avec role=admin

---


# Règles métier
- Le `type_workspace` détermine le workflow par défaut (simplifié pour bailleur, complet pour societe_edl) et conditionne l'affichage de certains onglets (ex : Mandataire masqué pour agence)
- L'utilisateur créateur devient automatiquement admin
- Les noms de workspace ne sont pas uniques (plusieurs "Agence Dupont" possibles)
- Logo, couleur primaire, SIRET, adresse, email, téléphone sont optionnels à la création (configurables ensuite via Paramètres US-810)
- Le `nom` et le `siret` du workspace sont utilisés pour la chaîne de signature EDL ("Réalisé par")