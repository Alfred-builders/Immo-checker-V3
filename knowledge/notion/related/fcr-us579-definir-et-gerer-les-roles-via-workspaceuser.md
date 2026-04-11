---
notion_id: "3131d95b-2f8a-81d2-ba8a-d1710b4b4a0f"
notion_url: "https://www.notion.so/FCR-US579-D-finir-et-g-rer-les-r-les-via-WorkspaceUser-3131d95b2f8a81d2ba8ad1710b4b4a0f"
last_synced: "2026-03-26T12:55:06.331Z"
created: "2026-02-26T15:50:00.000Z"
last_edited: "2026-03-23T12:03:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "579"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Time spent: "0"
  Nom: "Définir et gérer les rôles via WorkspaceUser"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3131d95b-2f8a-812c-ab8b-ed6b2d98c4fa"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Status: "📋 Backlog"
  Builders: "Tony Pineiro"
  Date de création: "2026-02-26T15:50:00.000Z"
  Code: "FCR - US579 Définir et gérer les rôles via WorkspaceUser"
  Time Spent Activation: "Non"
---

# FCR - US579 Définir et gérer les rôles via WorkspaceUser

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 579 |
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
| Code | FCR - US579 Définir et gérer les rôles via WorkspaceUser |
| Time Spent Activation | Non |


# User Story
**En tant qu'** admin d'un workspace,
**je veux** définir le rôle de chaque utilisateur,
**afin de** contrôler les accès et permissions de chacun.

---


# Critères d'acceptation (Gherkin)
```javascript
Feature: Gestion des rôles via WorkspaceUser

  Scenario: Ajout gestionnaire
    Given un admin du workspace "FlatChecker"
    When il ajoute Marie avec role="gestionnaire"
    Then Marie accède au back-office
    And Marie ne peut pas modifier les paramètres workspace

  Scenario: Ajout technicien
    Given un admin du workspace
    When il ajoute Paul avec role="technicien"
    Then Paul accède à l'app tablette (pas de back-office)
    And Paul voit ses missions assignées

  Scenario: Ajout technicien (interne ou externe)
    Given un admin du workspace
    When il ajoute Sophie avec role="technicien"
    Then Sophie accède à l'app tablette (pas de back-office)
    And Sophie voit ses missions assignées
    And la société réalisatrice sur les documents EDL de Sophie = le Workspace

  Scenario: Utilisateur multi-workspace
    Given Sophie est technicien chez "FlatChecker"
    When "Agence Versailles" l'ajoute aussi
    Then Sophie a 2 entrées WorkspaceUser distinctes
    And elle voit un sélecteur de workspace à la connexion

  Scenario: Changement de rôle
    Given Marie est gestionnaire
    When l'admin change son rôle en admin
    Then les permissions admin sont immédiatement actives
```

---


# Modèle de données impacté
**Table pivot** : `WorkspaceUser`
- `user_id` (FK → Utilisateur), `workspace_id` (FK → Workspace)
- `role` (enum: admin | gestionnaire | technicien)
- **Clé unique** : (user_id, workspace_id)
- Pas de `tiers_id` ni `is_externe` — la table Tiers est réservée aux stakeholders autour des lots (propriétaire, locataire, mandataire)

---


# Règles métier
- **admin** : accès complet (paramètres, utilisateurs, toutes données)
- **gestionnaire** : back-office (CRUD métier) sans paramètres workspace
- **technicien** : app tablette uniquement
- Pas de distinction interne/externe en V1 : tous les techniciens sont des Users dans WorkspaceUser avec role="technicien". La table Tiers est réservée aux stakeholders lot (propriétaire, locataire, mandataire). *(Décision 20/03/2026)*
- La société réalisatrice de l'EDL = le Workspace (dérivé de `Workspace.nom`, `Workspace.siret`)
- Si une distinction interne/externe est nécessaire en V2 (ex: facturation prestataires), on pourra ajouter des champs simples sur WorkspaceUser (`societe_nom`, `societe_siren`)