---
notion_id: "3281d95b-2f8a-818e-85e1-dcdb1512ec04"
notion_url: "https://www.notion.so/FCR-US839-Mini-calendrier-mensuel-Dashboard-Admin-3281d95b2f8a818e85e1dcdb1512ec04"
last_synced: "2026-03-26T12:55:42.696Z"
created: "2026-03-19T13:22:00.000Z"
last_edited: "2026-03-25T14:59:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "839"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Sponsors: "clement.flatchecker@outlook.fr, Flat Checker "
  Time spent: "0"
  Nom: "Mini-calendrier mensuel Dashboard Admin"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3271d95b-2f8a-816e-9e35-ec34bc151a59"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Status: "📌 Ready"
  Builders: "Tony Pineiro"
  Date de création: "2026-03-19T13:22:00.000Z"
  Code: "FCR - US839 Mini-calendrier mensuel Dashboard Admin"
  Time Spent Activation: "Non"
---

# FCR - US839 Mini-calendrier mensuel Dashboard Admin

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 839 |
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
| Code | FCR - US839 Mini-calendrier mensuel Dashboard Admin |
| Time Spent Activation | Non |


# User Story
**En tant que** admin ou gestionnaire,
**je veux** un mini-calendrier mensuel pour repérer les jours chargés et consulter les missions d'un jour donné,
**afin de** piloter la planification sur le mois sans quitter le dashboard.
> Rattachée à l'[EPIC 14 — Dashboard Admin (Back-office)](https://www.notion.so/3271d95b2f8a816e9e35ec34bc151a59)

---


# Critères d'acceptation (Gherkin)
```gherkin
Feature: Mini-calendrier mensuel

  Scenario: Affichage du mini-calendrier
    Given le dashboard admin
    Then un mini-calendrier mensuel est affiché à droite du calendrier semaine
    And les jours avec des missions planifiées affichent un indicateur visuel (pastille/tag)
    And des flèches ← → permettent de naviguer mois précédent / suivant

  Scenario: Clic sur une date → Modale
    Given le mini-calendrier mensuel
    When l'admin clique sur le 15 mars (qui a 4 missions)
    Then une modale s'ouvre avec la liste des 4 missions de cette date
    And chaque mission affiche :
      | Info              | Source                    |
      | Référence         | Mission.reference         |
      | Lot / Adresse     | Lot → Bâtiment.adresse    |
      | Technicien        | MissionTechnicien → User  |
      | Statut            | Mission.statut            |
      | Actions en attente| Dérivé                    |
    And chaque mission est cliquable → ouvre le Drawer latéral (US-842)
    And un lien "Voir dans le tableau des missions →" navigue vers la vue tableau filtrée sur cette date
    And l'admin ne sort PAS du dashboard (modale, pas de redirection)

  Scenario: Jour sans mission
    Given un jour sans mission dans le mini-calendrier
    When l'admin clique dessus
    Then rien ne se passe
```

---


# Modèle de données impacté
**Tables consultées** :
- `Mission` (date_planifiee, statut) — agrégation par jour pour les pastilles
- `MissionTechnicien` → `User` — technicien
- `Lot` → `Batiment` → `AdresseBatiment` — adresse

---


# Règles métier
- La modale ne fait PAS sortir du dashboard
- Les missions de la modale sont cliquables → ouvrent le drawer (même drawer que le calendrier semaine)