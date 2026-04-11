---
notion_id: "3271d95b-2f8a-8137-bb3a-cd3de4b85862"
notion_url: "https://www.notion.so/FCR-US814-Stat-cards-r-vis-es-de-la-page-Missions-3271d95b2f8a8137bb3acd3de4b85862"
last_synced: "2026-03-26T12:56:58.913Z"
created: "2026-03-18T09:27:00.000Z"
last_edited: "2026-03-20T08:26:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "814"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Sponsors: "clement.flatchecker@outlook.fr, Flat Checker "
  Time spent: "0"
  Nom: "Stat cards révisées de la page Missions"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3131d95b-2f8a-8131-b48b-e85641cc8c31"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Status: "📌 Ready"
  Builders: "Tony Pineiro"
  Date de création: "2026-03-18T09:27:00.000Z"
  Code: "FCR - US814 Stat cards révisées de la page Missions"
  Time Spent Activation: "Non"
---

# FCR - US814 Stat cards révisées de la page Missions

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 814 |
| Created by | Tony Pineiro |
| Priority | 🔴 P0 |
| Sponsors | clement.flatchecker@outlook.fr, Flat Checker  |
| Time spent | 0 |
| Pricing | 0 |
| Project | 3071d95b-2f8a-80ac-9db8-dc4e9d2196c9 |
| Epic | 3131d95b-2f8a-8131-b48b-e85641cc8c31 |
| Brique Fonctionnelle | 3131d95b-2f8a-81de-af8e-d782a1b05a0e |
| Status | 📌 Ready |
| Builders | Tony Pineiro |
| Date de création | 2026-03-18T09:27:00.000Z |
| Code | FCR - US814 Stat cards révisées de la page Missions |
| Time Spent Activation | Non |


# User Story
**En tant que** gestionnaire ou admin,
**je veux** voir des indicateurs clés en haut de la page missions,
**afin de** piloter mon activité d'un coup d'œil.

---


# Critères d'acceptation (Gherkin)
```gherkin
Feature: Stat cards missions

  Scenario: Affichage des indicateurs
    Given le gestionnaire accède à la page Missions
    Then il voit 4 stat cards :
      | Card              | Calcul                                                              |
      | Total             | COUNT(missions du workspace, hors annulées)                         |
      | Missions du jour  | COUNT(missions date = aujourd'hui)                                  |
      | Actions en attente| COUNT(missions ayant au moins 1 action en attente — cf définition)  |
      | À venir           | COUNT(missions futures planifiées)                                  |

  Scenario: Définition des "Actions en attente" (alignée sur le dashboard admin US-837 / US-841)
    Given une mission
    Then elle est comptée dans "Actions en attente" si au moins 1 de ces conditions est vraie :
      | Action                  | Condition                                        | Champ source                          |
      | À assigner              | Aucun technicien lié à la mission                | MissionTechnicien vide                |
      | Invitation en attente   | Technicien assigné, réponse en cours ou refusée  | MissionTechnicien.statut_invitation != accepte |
      | RDV à confirmer         | Créneau posé mais pas encore confirmé            | Mission.statut_rdv = a_confirmer      |

  Scenario: Stat cards masquables
    Given les stat cards affichées
    When le gestionnaire clique sur le toggle de masquage
    Then les stat cards se replient pour gagner en hauteur tableau

  Scenario: Stat cards cliquables — filtre le tableau
    Given la stat card "Actions en attente" affiche "5"
    When le gestionnaire clique dessus
    Then le tableau se filtre automatiquement sur les missions ayant au moins 1 action en attente

  Scenario: Stat card cliquable — Missions du jour
    Given la stat card "Missions du jour" affiche "8"
    When le gestionnaire clique dessus
    Then le tableau se filtre sur les missions planifiées aujourd'hui

  Scenario: Stat card cliquable — À venir
    Given la stat card "À venir" affiche "12"
    When le gestionnaire clique dessus
    Then le tableau se filtre sur les missions futures (date > aujourd'hui)
```

---


# Modèle de données impacté
**Tables consultées** :
- `Mission` (statut, date_planifiee, statut_rdv)
- `MissionTechnicien` (statut_invitation) — pour les actions en attente
- `Lot` → `Batiment` → `AdresseBatiment` (contexte tableau)

---


# Règles métier
- **"Actions en attente"** utilise exactement la même définition que le dashboard admin ([US-837](https://www.notion.so/3281d95b2f8a812eafb4d868bd54baa2)) et le bloc détaillé ([US-841](https://www.notion.so/3281d95b2f8a818cac05c2548f4bf392)) : 3 types d'actions (à assigner, invitation en attente, RDV à confirmer). Une mission avec plusieurs actions n'est comptée qu'une fois.
- "Missions du jour" inclut toutes les missions du jour, tous statuts
- Les cards sont cliquables et filtrent le tableau en dessous
- En plus des stat cards, le tableau supporte les **filtres dynamiques** (EPIC 16) sur les 3 statuts distincts :
  - `Mission.statut` (planifiée | assignée | terminée | annulée)
  - `Mission.statut_rdv` (a_confirmer | confirme | reporte)
  - `MissionTechnicien.statut_invitation` (en_attente | accepte | refuse)
- Ces 3 colonnes sont affichées dans le tableau et utilisables comme filtres et colonnes de tri

---


# Décisions
- **20/03/2026** : Stat card "À assigner" remplacée par "Actions en attente" pour aligner avec le dashboard admin (US-837/US-841). Même définition : 3 types d'actions (à assigner / invitation en attente / RDV à confirmer).