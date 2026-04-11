---
notion_id: "3131d95b-2f8a-81f3-a6da-dac0429a77f9"
notion_url: "https://www.notion.so/FCR-US595-Assigner-un-ou-plusieurs-techniciens-une-mission-3131d95b2f8a81f3a6dadac0429a77f9"
last_synced: "2026-03-26T12:56:38.445Z"
created: "2026-02-26T15:52:00.000Z"
last_edited: "2026-03-23T12:10:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "595"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Time spent: "0"
  Nom: "Assigner un ou plusieurs techniciens à une mission"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3131d95b-2f8a-8131-b48b-e85641cc8c31"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Status: "📌 Ready"
  Builders: "Tony Pineiro"
  Date de création: "2026-02-26T15:52:00.000Z"
  Code: "FCR - US595  Assigner un ou plusieurs techniciens à une mission"
  Time Spent Activation: "Non"
---

# FCR - US595  Assigner un ou plusieurs techniciens à une mission

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 595 |
| Created by | Tony Pineiro |
| Priority | 🔴 P0 |
| Time spent | 0 |
| Pricing | 0 |
| Project | 3071d95b-2f8a-80ac-9db8-dc4e9d2196c9 |
| Epic | 3131d95b-2f8a-8131-b48b-e85641cc8c31 |
| Brique Fonctionnelle | 3131d95b-2f8a-81de-af8e-d782a1b05a0e |
| Status | 📌 Ready |
| Builders | Tony Pineiro |
| Date de création | 2026-02-26T15:52:00.000Z |
| Code | FCR - US595  Assigner un ou plusieurs techniciens à une mission |
| Time Spent Activation | Non |


# User Story
**En tant que** gestionnaire,
**je veux** assigner un technicien à une mission,
**afin qu'** il la voit sur son planning tablette et puisse accepter ou refuser l'intervention.

---


# Critères d'acceptation (Gherkin)
```gherkin
Feature: Assignation technicien

  Scenario: Assignation technicien
    Given une mission "M-2026-0042" et un technicien "Paul" existent dans le workspace
    When le gestionnaire assigne Paul (depuis le drawer US-842, la fiche mission US-811, ou le formulaire de création US-594)
    Then une entrée MissionTechnicien est créée avec statut_invitation = "en_attente"
    And Paul reçoit une notification d'assignation
    And Paul voit la mission sur son app mobile
    And la société réalisatrice sur les documents EDL = le Workspace

  Scenario: Acceptation par le technicien
    Given Paul est assigné à "M-2026-0042" avec statut_invitation = "en_attente"
    When Paul accepte la mission
    Then statut_invitation passe à "accepte"
    And le statut mission passe à "assignee" (si pas déjà)

  Scenario: Refus par le technicien
    Given Paul est assigné à "M-2026-0042" avec statut_invitation = "en_attente"
    When Paul refuse la mission
    Then l'assignation de Paul est retirée (MissionTechnicien supprimé ou désactivé)
    And la mission revient dans le bloc "Actions en attente" du dashboard avec l'action "À assigner" (US-841)
    And l'admin reçoit une notification de refus

  Scenario: Assignation après refus
    Given Paul a refusé "M-2026-0042" et la mission est revenue "À assigner"
    When le gestionnaire assigne Sophie (depuis le drawer dashboard US-842 ou la fiche mission US-811)
    Then Sophie est assignée avec statut_invitation = "en_attente"
    And Paul ne voit plus la mission

  Scenario: Mission sans technicien
    Given une mission planifiée
    When aucun technicien n'est assigné
    Then la mission apparaît comme "non assignée" dans le bloc "Actions en attente" du dashboard

  Scenario: Revalidation après changement de date/heure
    Given Paul a accepté "M-2026-0042" (statut_invitation = "accepte")
    When l'admin modifie la date ou l'heure de la mission
    Then l'admin choisit entre :
      | Option                   | Effet                                          |
      | Demander revalidation    | statut_invitation repasse à "en_attente" + notif Paul |
      | Confirmer d'office       | statut_invitation reste "accepte" (pas de notif)      |
```

---


# Modèle de données impacté
**Table** : `MissionTechnicien`
- `mission_id` (FK → Mission)
- `user_id` (FK → User)
- `est_principal` (bool, default: true)
- `statut_invitation` : `en_attente | accepte | refuse` (default: en_attente)

---


# Règles métier
- Un seul technicien principal par mission en V1
- Le technicien assigné est aussi le technicien de l'EDL (EDL.technicien_id)
- Tous les techniciens (internes et externes) ne voient que leurs missions assignées sur l'app mobile
- Le `statut_invitation` est indépendant du `statut` de la mission et du `statut_rdv`
- Si le technicien refuse → la mission revient dans "Actions en attente" du dashboard, l'admin doit réassigner
- La modification de date/heure propose un choix : demander revalidation ou confirmer d'office (cf US-842 / US-811)
- Points d'assignation/réassignation : drawer dashboard (US-842), fiche mission (US-811), formulaire de création (US-594). Pas d'édition inline dans le tableau (décision 20/03/2026).
- Pas de distinction interne/externe en V1. Pas de `is_externe` ni `tiers_id` sur WorkspaceUser. Tous les techniciens = Users avec role="technicien". *(Décision 20/03/2026)*
- La société réalisatrice de l'EDL = le Workspace (dérivé de `Workspace.nom`, `Workspace.siret`)
- Tous les techniciens accèdent à l'app mobile uniquement (pas de back-office)

---


# Décisions
- **19/03/2026** : Ajout du workflow statut_invitation (en_attente → accepte/refuse) et du mécanisme de revalidation au changement de date/heure. Alignement avec US-842 et EPIC 13.
- **20/03/2026** : Retrait point d'assignation "tableau missions inline" (inline edit supprimé). Suppression doublon scénario. Correction référence US-815 → US-842.