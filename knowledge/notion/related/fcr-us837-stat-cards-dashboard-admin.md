---
notion_id: "3281d95b-2f8a-812e-afb4-d868bd54baa2"
notion_url: "https://www.notion.so/FCR-US837-Stat-cards-Dashboard-Admin-3281d95b2f8a812eafb4d868bd54baa2"
last_synced: "2026-03-26T12:55:39.174Z"
created: "2026-03-19T13:22:00.000Z"
last_edited: "2026-03-19T13:36:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "837"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Sponsors: "clement.flatchecker@outlook.fr, Flat Checker "
  Time spent: "0"
  Nom: "Stat cards Dashboard Admin"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3271d95b-2f8a-816e-9e35-ec34bc151a59"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Status: "📌 Ready"
  Builders: "Tony Pineiro"
  Date de création: "2026-03-19T13:22:00.000Z"
  Code: "FCR - US837 Stat cards Dashboard Admin"
  Time Spent Activation: "Non"
---

# FCR - US837 Stat cards Dashboard Admin

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 837 |
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
| Date de création | 2026-03-19T13:22:00.000Z |
| Code | FCR - US837 Stat cards Dashboard Admin |
| Time Spent Activation | Non |


# User Story
**En tant que** admin ou gestionnaire,
**je veux** voir des indicateurs clés en haut du dashboard,
**afin de** connaître d'un coup d'œil l'état de mon activité.
> Rattachée à l'[EPIC 14 — Dashboard Admin (Back-office)](https://www.notion.so/3271d95b2f8a816e9e35ec34bc151a59)

---


# Critères d'acceptation (Gherkin)
```gherkin
Feature: Stat cards Dashboard Admin

  Scenario: Affichage des 3 stat cards
    Given l'admin accède au dashboard
    Then il voit 3 cartes en haut de page :
      | Card              | Donnée                                              |
      | EDL du mois       | COUNT(EDL créés ce mois)                            |
      | Actions en attente| COUNT(missions ayant au moins 1 action en attente)  |
      | À venir           | COUNT(missions futures 7 jours)                     |

  Scenario: Clic sur la carte "Actions en attente"
    Given la carte "Actions en attente" affiche 5
    When l'admin clique dessus
    Then la page scrolle vers le bloc "Actions en attente" (US-841)

  Scenario: Mise à jour temps réel
    Given l'admin résout une action via le drawer (US-842)
    Then les compteurs des stat cards sont mis à jour immédiatement
```

---


# Modèle de données impacté
**Tables consultées** :
- `EDL_Inventaire` — COUNT ce mois
- `Mission` + `MissionTechnicien` — actions en attente (MissionTechnicien vide OU statut_invitation != accepte OU statut_rdv = a_confirmer)
- `Mission` — missions futures 7 jours

---


# Règles métier
- Les compteurs sont calculés en temps réel
- ~~Badges d'alerte~~ supprimés — redondants avec la stat card + le bloc "Actions en attente"

---


# Décisions
- **19/03/2026** : Suppression des badges d'alerte (redondants avec stat card + bloc détaillé)
- **19/03/2026** : Stat card "À assigner" renommée → "Actions en attente" (couvre les 3 types d'actions)