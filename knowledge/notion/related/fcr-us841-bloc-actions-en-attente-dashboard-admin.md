---
notion_id: "3281d95b-2f8a-818c-ac05-c2548f4bf392"
notion_url: "https://www.notion.so/FCR-US841-Bloc-Actions-en-attente-Dashboard-Admin-3281d95b2f8a818cac05c2548f4bf392"
last_synced: "2026-03-26T12:55:49.025Z"
created: "2026-03-19T13:23:00.000Z"
last_edited: "2026-03-19T13:51:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "841"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Sponsors: "clement.flatchecker@outlook.fr, Flat Checker "
  Time spent: "0"
  Nom: "Bloc Actions en attente Dashboard Admin"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3271d95b-2f8a-816e-9e35-ec34bc151a59"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Status: "📌 Ready"
  Builders: "Tony Pineiro"
  Date de création: "2026-03-19T13:23:00.000Z"
  Code: "FCR - US841 Bloc Actions en attente Dashboard Admin"
  Time Spent Activation: "Non"
---

# FCR - US841 Bloc Actions en attente Dashboard Admin

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 841 |
| Created by | Tony Pineiro |
| Priority | 🔴 P0 |
| Sponsors | clement.flatchecker@outlook.fr, Flat Checker  |
| Time spent | 0 |
| Pricing | 0 |
| Project | 3071d95b-2f8a-80ac-9db8-dc4e9d2196c9 |
| Epic | 3271d95b-2f8a-816e-9e35-ec34bc151a59 |
| Brique Fonctionnelle | 3131d95b-2f8a-81de-af8e-d782a1b05a0e |
| Status | 📌 Ready |
| Builders | Tony Pineiro |
| Date de création | 2026-03-19T13:23:00.000Z |
| Code | FCR - US841 Bloc Actions en attente Dashboard Admin |
| Time Spent Activation | Non |


# User Story
**En tant que** admin ou gestionnaire,
**je veux** voir la liste des missions nécessitant une action de ma part,
**afin de** résoudre rapidement les blocages (assignation, invitation, RDV).
> Rattachée à l'[EPIC 14 — Dashboard Admin (Back-office)](https://www.notion.so/3271d95b2f8a816e9e35ec34bc151a59)

---


# Critères d'acceptation (Gherkin)
```gherkin
Feature: Bloc Actions en attente

  Scenario: Affichage du bloc
    Given le dashboard admin
    Then une section "Actions en attente" affiche les missions ayant au moins 1 action à résoudre
    And les 3 types d'actions sont :
      | Action                  | Condition                                        | Champ source                          |
      | À assigner              | Aucun technicien lié à la mission                | MissionTechnicien vide                |
      | Invitation en attente   | Technicien assigné, réponse en cours ou refusée  | MissionTechnicien.statut_invitation   |
      | RDV à confirmer         | Créneau posé mais pas encore confirmé            | Mission.statut_rdv = a_confirmer      |

  Scenario: Carte mission avec plusieurs actions
    Given une mission sans technicien ET avec statut_rdv = a_confirmer
    Then la carte affiche 2 tags d'action : "À assigner" + "RDV à confirmer"

  Scenario: Informations sur la carte
    Given une mission avec des actions en attente
    Then la carte affiche :
      | Info              | Source                    |
      | Référence         | Mission.reference         |
      | Lot / Adresse     | Lot → Bâtiment.adresse    |
      | Date planifiée    | Mission.date_planifiee    |
      | Type EDL          | EDL_Inventaire.type       |
      | Tags actions      | Liste des actions en attente (tags colorés) |

  Scenario: Clic sur une carte → Drawer
    Given une carte dans le bloc "Actions en attente"
    When l'admin clique sur la carte
    Then le Drawer latéral s'ouvre (US-842) avec focus sur la section Actions

  Scenario: Refus d'invitation → retour dans "À assigner"
    Given un technicien a refusé une mission
    Then l'assignation du technicien est retirée (MissionTechnicien supprimé ou désactivé)
    And la mission revient dans le bloc avec l'action "À assigner"
    When l'admin assigne un nouveau technicien (via le Drawer US-842)
    Then l'action "À assigner" disparaît
    And une nouvelle action "Invitation en attente" apparaît (en attente d'acceptation du nouveau technicien)

  Scenario: Résolution complète
    Given une mission n'a plus d'action en attente
    Then la carte disparaît du bloc
    And la stat card "Actions en attente" (US-837) est décrémentée
```

---


# Modèle de données impacté
**Tables consultées** :
- `Mission` (statut_rdv)
- `MissionTechnicien` (statut_invitation)
- `Lot` → `Batiment` → `AdresseBatiment`
- `EDL_Inventaire` (type)

---


# Règles métier
- Une même mission peut afficher **plusieurs actions en attente** simultanément
- Si un technicien **refuse**, la mission revient dans le bloc avec "Invitation refusée" — l'admin doit réassigner
- Les mises à jour sont en **temps réel** après résolution via le drawer