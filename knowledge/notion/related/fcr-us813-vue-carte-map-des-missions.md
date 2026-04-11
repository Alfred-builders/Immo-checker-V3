---
notion_id: "3271d95b-2f8a-81b1-9531-e27b41241ed3"
notion_url: "https://www.notion.so/FCR-US813-Vue-carte-map-des-missions-3271d95b2f8a81b19531e27b41241ed3"
last_synced: "2026-03-26T12:56:55.127Z"
created: "2026-03-18T09:27:00.000Z"
last_edited: "2026-03-23T13:27:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "813"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Sponsors: "clement.flatchecker@outlook.fr, Flat Checker "
  Time spent: "0"
  Nom: "Vue carte / map des missions"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3131d95b-2f8a-8131-b48b-e85641cc8c31"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Status: "📌 Ready"
  Builders: "Tony Pineiro"
  Date de création: "2026-03-18T09:27:00.000Z"
  Code: "FCR - US813 Vue carte / map des missions"
  Time Spent Activation: "Non"
---

# FCR - US813 Vue carte / map des missions

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 813 |
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
| Code | FCR - US813 Vue carte / map des missions |
| Time Spent Activation | Non |


# User Story
**En tant que** gestionnaire ou admin,
**je veux** visualiser les missions sur une carte,
**afin d'** optimiser les tournées et visualiser la répartition géographique.

---


# Critères d'acceptation (Gherkin)
```gherkin
Feature: Vue carte des missions

  # ──────────────────────────────────────
  # AFFICHAGE CARTE
  # ──────────────────────────────────────

  Scenario: Affichage des missions sur la carte
    Given des missions géocodées existent
    When le gestionnaire active la vue carte (onglet dans la page Missions)
    Then une carte (composant carte partagé, EPIC 16) affiche un marqueur par mission
    And chaque marqueur est coloré selon le statut dérivé (même mapping que le calendrier US-838) :
      | Statut dérivé      | Couleur marqueur         |
      | Planifiée          | Bleu                     |
      | Actions en attente | Orange                   |
      | Confirmée          | Vert                     |
      | Terminée           | Gris                     |
      | Annulée            | Rouge                    |
    And les missions sans adresse géocodée ne sont pas affichées sur la carte

  Scenario: Clustering — plusieurs missions au même bâtiment
    Given 3 missions sont planifiées dans le même bâtiment (même coordonnées GPS)
    Then les marqueurs sont regroupés en un cluster avec le compteur "3"
    When le gestionnaire clique sur le cluster
    Then le zoom s'effectue sur le bâtiment OU une liste des 3 missions s'affiche

  # ──────────────────────────────────────
  # POPUP AU CLIC
  # ──────────────────────────────────────

  Scenario: Clic sur un marqueur → popup
    Given un marqueur de mission sur la carte
    When le gestionnaire clique dessus
    Then un popup s'affiche avec :
      | Info              | Source                                  |
      | Référence         | Mission.reference (M-2026-042)          |
      | Adresse           | Bâtiment → AdresseBatiment (complète)   |
      | Lot               | Lot.nom                                 |
      | Date / Heure      | Mission.date_planifiee + heure_debut    |
      | Type EDL          | EDL_Inventaire.sens + inventaire        |
      | Technicien        | MissionTechnicien → User (nom)          |
      | Statut            | Badge coloré (même couleur que marqueur)|
      | Bouton "Détails"  | Ouvre le drawer (US-842) ou la fiche mission (US-811) |
    And le popup se ferme au clic en dehors

  # ──────────────────────────────────────
  # FILTRES
  # ──────────────────────────────────────

  Scenario: Filtre temporel rapide (dropdown)
    Given la vue carte active
    Then un dropdown compact permet de choisir la période :
      | Option          | Résultat                            |
      | Aujourd'hui     | Missions du jour                    |
      | Cette semaine   | Missions lundi → dimanche courant   |
      | Ce mois         | Missions du mois en cours           |
      | Plage custom    | Date picker début / fin             |
    And le filtre par défaut est "Cette semaine"
    And le dropdown est le même pattern que sur les autres vues (tableau, calendrier) pour la cohérence UX

  Scenario: Filtre par technicien (dropdown)
    Given la vue carte active
    Then un dropdown par technicien est disponible
    When l'admin filtre sur "Paul"
    Then seules les missions assignées à Paul sont affichées

  Scenario: Filtre par statut
    Given la vue carte active
    Then un dropdown par statut est disponible (Planifiée, Actions en attente, Confirmée, Terminée, Annulée)
    And les filtres sont combinables (temporel + technicien + statut)

  Scenario: Compteur de résultats
    Given des filtres actifs
    Then un compteur affiche "X missions affichées" au-dessus de la carte
```

---


# Modèle de données impacté
**Nécessite** : `AdresseBatiment.latitude` + `AdresseBatiment.longitude` (géocodage) — déjà dans le data model.
**Tables consultées** :
- `Mission` (date_planifiee, heure_debut, statut, statut_rdv)
- `MissionTechnicien` → `User` (technicien, statut_invitation)
- `Lot` → `Batiment` → `AdresseBatiment` (adresse, lat/lng)
- `EDL_Inventaire` (sens, avec_inventaire)

---


# Règles métier
- Le **géocodage** des adresses est fait à la création/modification du bâtiment (appel API Mapbox geocoding)
- Les missions sans adresse géocodée ne sont **pas affichées** sur la carte (pas de marqueur fantôme)
- Le **clustering** regroupe les missions au même bâtiment (même coordonnées GPS). Clic sur un cluster → zoom ou liste dépliée
- Le mapping couleur des marqueurs est **identique** à celui du calendrier semaine ([US-838](https://www.notion.so/3281d95b2f8a81df908bfb9e488e79ab)) — statut dérivé "Actions en attente" = MissionTechnicien vide OU statut_invitation != accepte OU statut_rdv = a_confirmer
- Le clic sur un marqueur ouvre un **popup** (pas le drawer directement) avec les infos clés + un bouton "Détails" qui ouvre le drawer ([US-842](https://www.notion.so/placeholder)) ou la fiche mission ([US-811](https://www.notion.so/3271d95b2f8a818d9885e00e5b5da241))
- Les **filtres rapides** utilisent un **dropdown compact** (pas des tags) pour gagner de la place — même pattern que les autres vues de la page Missions. Les filtres dynamiques avancés (EPIC 16) s'appliquent en complément
- La carte se **recentre automatiquement** sur les marqueurs visibles après filtrage (bounding box)

---


# Décisions
- **20/03/2026** : Enrichissement complet — popup détaillé au clic (avec bouton "Détails" → drawer), clustering pour missions même bâtiment, filtres temporels en dropdown compact (même pattern que tableaux), mapping couleurs aligné sur US-838, compteur de résultats.