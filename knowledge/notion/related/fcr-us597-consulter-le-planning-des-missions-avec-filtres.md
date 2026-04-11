---
notion_id: "3131d95b-2f8a-817f-ba22-f11c8bf1d7e3"
notion_url: "https://www.notion.so/FCR-US597-Consulter-le-planning-des-missions-avec-filtres-3131d95b2f8a817fba22f11c8bf1d7e3"
last_synced: "2026-03-26T12:56:45.387Z"
created: "2026-02-26T15:52:00.000Z"
last_edited: "2026-03-20T08:47:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "597"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Time spent: "0"
  Nom: "Consulter le planning des missions avec filtres"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3131d95b-2f8a-8131-b48b-e85641cc8c31"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Status: "📌 Ready"
  Builders: "Tony Pineiro"
  Date de création: "2026-02-26T15:52:00.000Z"
  Code: "FCR - US597 Consulter le planning des missions avec filtres"
  Time Spent Activation: "Non"
---

# FCR - US597 Consulter le planning des missions avec filtres

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 597 |
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
| Code | FCR - US597 Consulter le planning des missions avec filtres |
| Time Spent Activation | Non |


# User Story
**En tant que** gestionnaire ou admin,
**je veux** consulter, filtrer et trier la liste des missions,
**afin de** piloter l'activité terrain de mon workspace.

---


# Critères d'acceptation (Gherkin)
```gherkin
Feature: Page Missions — Vue tableau

  Scenario: Colonnes par défaut
    Given le gestionnaire ouvre la page Missions
    Then il voit un tableau avec les colonnes :
      | Référence | Lot (+ adresse) | Date | Type(s) (entrée/sortie) | Technicien | Statut mission | Statut RDV | Statut invitation |
    And la colonne "Type(s)" peut afficher **plusieurs tags** si la mission contient des EDL d'entrée ET de sortie (ex : tags "Entrée" + "Sortie" côte à côte)
    And la règle 1 mission = 1 lot reste inchangée
    And le tableau est paginé (25 résultats par page)
    And le tri par défaut est date DESC

  Scenario: Colonnes configurables
    When le gestionnaire clique "Colonnes"
    Then il peut activer/désactiver : propriétaire, mandataire, bâtiment, commentaire, créé par, créé le

  Scenario: 3 statuts distincts affichés
    Given des missions dans différents statuts
    Then chaque mission affiche :
      | Donnée              | Colonne           | Valeurs                              |
      | Statut mission      | Statut mission    | Planifiée, Assignée, Terminée, Annulée |
      | Statut RDV          | Statut RDV        | À confirmer, Confirmé, Reporté       |
      | Statut invitation   | Invitation tech.  | En attente, Accepté, Refusé          |
    And chaque statut est affiché en badge coloré
    And les statuts sont en **lecture seule** dans le tableau (pas d'édition inline — modification via la fiche mission US-811 ou le drawer US-842)

  Scenario: Voyant alerte — Actions en attente
    Given une mission ayant au moins 1 action en attente (même définition que US-837 / US-841) :
      - MissionTechnicien vide (à assigner)
      - MissionTechnicien.statut_invitation != accepte (invitation en attente ou refusée)
      - Mission.statut_rdv = a_confirmer (RDV à confirmer)
    Then un **indicateur orange** (dot ou icône ⚠️) est affiché en début de ligne
    And l'indicateur est visible même sans lire chaque badge individuellement (repérage rapide en scan vertical)
    And le hover sur l'indicateur affiche un tooltip listant les actions en attente (ex : "À assigner, RDV à confirmer")
    And les missions sans action en attente n'ont pas d'indicateur

  Scenario: Filtres rapides (dropdowns compacts)
    Given le tableau des missions
    Then une barre de filtres rapides est affichée au-dessus du tableau avec des dropdowns compacts :
      | Filtre             | Type      | Valeurs                                                     |
      | Période            | Dropdown  | Aujourd'hui / Cette semaine / Ce mois / Plage custom        |
      | Technicien         | Dropdown  | Tous / liste des techniciens                                |
      | Statut mission     | Dropdown  | Tous / Planifiée / Assignée / Terminée / Annulée            |
    And les dropdowns sont combinables entre eux
    And le filtre par défaut est : Période = Ce mois, Technicien = Tous, Statut = Tous

  Scenario: Filtres dynamiques avancés (EPIC 16)
    Given le tableau des missions
    When le gestionnaire clique "+ Filtre" pour ajouter un filtre avancé
    Then il peut filtrer par :
      | Champ              | Opérateurs                              |
      | Statut mission     | Est / N'est pas                         |
      | Statut RDV         | Est / N'est pas                         |
      | Statut invitation  | Est / N'est pas                         |
      | Technicien         | Est / N'est pas                         |
      | Date               | Avant / Après / Entre                   |
      | Type               | Entrée / Sortie                         |
    And les filtres avancés sont cumulables avec les filtres rapides (AND)

  Scenario: Basculement entre vues
    Given la page Missions
    Then un toggle permet de basculer entre : Tableau | Kanban | Carte
    And les filtres actifs sont conservés lors du basculement

  Scenario: Actions depuis le tableau
    Given la page Missions
    Then :
      | Action              | Résultat                           |
      | Nouvelle mission    | Modal de création (US594)          |
      | Clic sur ligne      | Navigation vers fiche mission (US811) |
```

---


# Modèle de données impacté
**Tables consultées** :
- `Mission` — données principales + `statut`, `statut_rdv`
- `MissionTechnicien` → `Utilisateur` — technicien + `statut_invitation`
- `Lot` → `Batiment` → `AdresseBatiment` — lot et adresse
- `EDL_Inventaire` — type (entrée/sortie)
- `LotProprietaire` / `Lot.mandataire_id` → `Tiers` — pour les colonnes optionnelles

---


# Règles métier
- Pagination 25 résultats par page
- Tri par défaut : date DESC
- Les stat cards (US814) sont affichées au-dessus du tableau
- **Voyant alerte** : un indicateur orange en début de ligne pour les missions avec actions en attente. Même définition que le dashboard admin ([US-837](https://www.notion.so/3281d95b2f8a812eafb4d868bd54baa2) / [US-841](https://www.notion.so/3281d95b2f8a818cac05c2548f4bf392)). Tooltip au hover avec le détail des actions. Cohérent avec les couleurs des autres vues (orange sur calendrier US-838, Kanban US-812, carte US-813).
- **Pas d'édition inline** dans le tableau : les changements de statut, technicien, date impliquent des logiques complexes (revalidation, modales de confirmation, verrouillage mission terminée). Toute modification passe par la fiche mission ([US-811](https://www.notion.so/3271d95b2f8a818d9885e00e5b5da241)) ou le drawer ([US-842](https://www.notion.so/3281d95b2f8a812dbc42ec3a3592ae96))
- Les **filtres rapides** utilisent des **dropdowns compacts** (pas des tags/pills) pour gagner de la place — pattern UX transversal appliqué sur toutes les vues (tableau, carte US-813, calendrier US-838)
- Les filtres rapides se combinent avec les filtres dynamiques avancés (EPIC 16)
- Accessible aux admin et gestionnaires (les techniciens voient uniquement leurs missions sur l'app mobile)