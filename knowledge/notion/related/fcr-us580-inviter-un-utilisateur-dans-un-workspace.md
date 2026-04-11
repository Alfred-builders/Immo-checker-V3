---
notion_id: "3131d95b-2f8a-8137-bb3f-d33d86fd27a6"
notion_url: "https://www.notion.so/FCR-US580-Inviter-un-utilisateur-dans-un-workspace-3131d95b2f8a8137bb3fd33d86fd27a6"
last_synced: "2026-03-26T12:55:07.734Z"
created: "2026-02-26T15:50:00.000Z"
last_edited: "2026-03-23T12:03:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "580"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Time spent: "0"
  Nom: "Inviter un utilisateur dans un workspace"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3131d95b-2f8a-812c-ab8b-ed6b2d98c4fa"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Status: "📋 Backlog"
  Builders: "Tony Pineiro"
  Date de création: "2026-02-26T15:50:00.000Z"
  Code: "FCR - US580 Inviter un utilisateur dans un workspace"
  Time Spent Activation: "Non"
---

# FCR - US580 Inviter un utilisateur dans un workspace

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 580 |
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
| Code | FCR - US580 Inviter un utilisateur dans un workspace |
| Time Spent Activation | Non |


# User Story
**En tant qu'** admin d'un workspace,
**je veux** inviter un utilisateur par email,
**afin qu'** il rejoigne mon workspace avec le bon rôle.

---


# Critères d'acceptation (Gherkin)
```javascript
Feature: Invitation utilisateur

  Scenario: Invitation nouvel utilisateur
    Given un admin du workspace
    When il invite email="sophie@edl.fr" avec role="technicien"
    Then un email d'invitation est envoyé
    And l'invitation est en statut "pending"
    And Sophie crée son compte via le lien
    And un WorkspaceUser est créé avec le rôle prédéfini

  Scenario: Invitation utilisateur existant
    Given Sophie a déjà un compte ImmoChecker
    When l'admin invite sophie@edl.fr
    Then Sophie reçoit une notification
    And elle accepte depuis son dashboard
    And un WorkspaceUser est créé sans nouveau Utilisateur

  Scenario: Invitation email déjà membre
    Given Sophie est déjà membre du workspace
    When l'admin tente de l'inviter
    Then message "Cet utilisateur est déjà membre"

  Scenario: Expiration invitation
    Given une invitation envoyée il y a 8 jours
    When Sophie clique sur le lien
    Then le lien est expiré (durée de vie : 7 jours)

  Scenario: Invitation d'un technicien
    Given un admin du workspace
    When il invite sophie@edl-express.fr avec role="technicien"
    Then Sophie reçoit l'email d'invitation
    And à l'acceptation, un WorkspaceUser est créé avec role="technicien"
    And Sophie n'a accès qu'à l'app mobile (pas de back-office)
    And la société réalisatrice de ses EDL sera le Workspace (pas de picker société à l'invitation)

  Scenario: Désactivation d'un prestataire
    Given Sophie est prestataire active dans le workspace
    When l'admin désactive son accès (depuis la page Paramètres US-810)
    Then le WorkspaceUser est désactivé (soft delete)
    And Sophie ne voit plus ce workspace
    And ses missions passées restent accessibles en historique
```

---


# Règles métier
- Seuls les admin peuvent inviter
- Invitation expire après 7 jours
- Utilisateur existant : pas de re-création de compte
- Rôle défini à l'invitation, pas à l'acceptation
- **Tous les techniciens** (internes ou externes) suivent le même parcours d'invitation : email + rôle. Pas de champ société, pas de flag `is_externe`, pas de `tiers_id` sur WorkspaceUser. La table Tiers est réservée aux stakeholders lot (propriétaire, locataire, mandataire). Simplification V1.

---


# Décisions
- **19/03/2026** : Fusion des spécificités prestataire (ex-US-604) dans cette US.
- **20/03/2026** : Suppression de `is_externe` et de `tiers_id` sur WorkspaceUser. Tous les techniciens sont des Users simples. La société réalisatrice = le Workspace.