---
notion_id: "3271d95b-2f8a-81e7-98d6-f6f6bcb85516"
notion_url: "https://www.notion.so/FCR-US812-Vue-Kanban-des-missions-3271d95b2f8a81e798d6f6f6bcb85516"
last_synced: "2026-03-26T12:56:53.535Z"
created: "2026-03-18T09:27:00.000Z"
last_edited: "2026-03-20T08:35:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "812"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Sponsors: "clement.flatchecker@outlook.fr, Flat Checker "
  Time spent: "0"
  Nom: "Vue Kanban des missions"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3131d95b-2f8a-8131-b48b-e85641cc8c31"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Status: "📌 Ready"
  Builders: "Tony Pineiro"
  Date de création: "2026-03-18T09:27:00.000Z"
  Code: "FCR - US812 Vue Kanban des missions"
  Time Spent Activation: "Non"
---

# FCR - US812 Vue Kanban des missions

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 812 |
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
| Code | FCR - US812 Vue Kanban des missions |
| Time Spent Activation | Non |


# User Story
**En tant que** gestionnaire ou admin,
**je veux** visualiser les missions en vue Kanban,
**afin de** suivre l'avancement des interventions d'un coup d'œil.

---


# Critères d'acceptation (Gherkin)
```gherkin
Feature: Vue Kanban missions

  # ──────────────────────────────────────
  # COLONNES ET CARTES
  # ──────────────────────────────────────

  Scenario: Colonnes par statut mission
    Given des missions dans différents statuts
    When le gestionnaire active la vue Kanban (onglet dans la page Missions)
    Then les missions sont organisées en 4 colonnes correspondant à Mission.statut :
      | Colonne    | Statut     |
      | Planifiée  | planifiee  |
      | Assignée   | assignee   |
      | Terminée   | terminee   |
      | Annulée    | annulee    |
    And un compteur par colonne est affiché en en-tête

  Scenario: Contenu des cartes mission
    Given des missions dans le Kanban
    Then chaque carte affiche :
      | Info              | Source                                          |
      | Référence         | Mission.reference (M-2026-042)                  |
      | Lot + Adresse     | Lot.nom + Bâtiment.adresse (tronquée)           |
      | Date              | Mission.date_planifiee                          |
      | Technicien        | MissionTechnicien → User (initiales ou avatar)  |
      | Type EDL          | Tags entrée/sortie (peut être multiple)         |
    And la carte a une **bordure gauche colorée** selon le statut dérivé (même mapping que calendrier US-838) :
      | Statut dérivé      | Couleur                  |
      | Planifiée          | Bleu                     |
      | Actions en attente | Orange                   |
      | Confirmée          | Vert                     |
      | Terminée           | Gris                     |
      | Annulée            | Rouge                    |

  Scenario: Badge "Actions en attente" sur les cartes
    Given une mission sans technicien (MissionTechnicien vide)
    Then la carte affiche un tag orange "À assigner"
    Given une mission avec statut_invitation = en_attente ou refuse
    Then la carte affiche un tag orange "Invitation en attente" ou "Invitation refusée"
    Given une mission avec statut_rdv = a_confirmer
    Then la carte affiche un tag orange "RDV à confirmer"
    And une carte peut afficher plusieurs tags simultanément

  Scenario: Tri des cartes dans chaque colonne
    Given une colonne du Kanban avec plusieurs cartes
    Then les cartes sont triées par date_planifiee ASC (les plus proches en haut)

  # ──────────────────────────────────────
  # INTERACTIONS
  # ──────────────────────────────────────

  Scenario: Clic sur une carte → Drawer ou fiche mission
    Given une carte mission dans le Kanban
    When le gestionnaire clique sur la carte
    Then le drawer latéral s'ouvre (US-842) OU navigation vers la fiche mission (US-811)

  Scenario: Pas de drag & drop
    Given la vue Kanban
    Then le drag & drop entre colonnes n'est PAS supporté
    And le changement de statut se fait uniquement via le drawer (US-842) ou la fiche mission (US-811)
    And les règles de transition (auto-terminaison, blocage annulation) sont gérées dans ces interfaces

  # ──────────────────────────────────────
  # FILTRES
  # ──────────────────────────────────────

  Scenario: Filtres rapides (dropdowns compacts)
    Given la vue Kanban
    Then une barre de filtres rapides est affichée au-dessus du Kanban avec des dropdowns compacts :
      | Filtre             | Type      | Valeurs                                          |
      | Période            | Dropdown  | Aujourd'hui / Cette semaine / Ce mois / Plage custom |
      | Technicien         | Dropdown  | Tous / liste des techniciens                     |
    And les dropdowns sont combinables
    And même pattern UX que le tableau (US-597), la carte (US-813) et le calendrier (US-838)
```

---


# Modèle de données impacté
**Tables consultées** (vue alternative, pas de modification) :
- `Mission` (statut, date_planifiee, statut_rdv)
- `MissionTechnicien` → `User` (technicien, statut_invitation)
- `Lot` → `Batiment` → `AdresseBatiment`
- `EDL_Inventaire` (sens, statut — pour les contraintes drag & drop)

---


# Règles métier
- Les colonnes correspondent aux 4 valeurs de `Mission.statut`
- La **couleur de bordure** des cartes utilise le même statut dérivé que le calendrier ([US-838](https://www.notion.so/3281d95b2f8a81df908bfb9e488e79ab)) : "Actions en attente" = MissionTechnicien vide OU statut_invitation != accepte OU statut_rdv = a_confirmer
- Les **tags d'actions en attente** sur les cartes utilisent la même définition que le bloc dashboard ([US-841](https://www.notion.so/3281d95b2f8a818cac05c2548f4bf392))
- **Pas de drag & drop** : les transitions de statut impliquent trop de logique métier (auto-terminaison quand EDL signés, blocage annulation mission terminée, motif obligatoire…). Le changement de statut se fait via le drawer ([US-842](https://www.notion.so/placeholder)) ou la fiche mission ([US-811](https://www.notion.so/3271d95b2f8a818d9885e00e5b5da241)) où les validations sont en place.
- Les cartes sont triées par `date_planifiee` ASC dans chaque colonne
- Les **filtres rapides** utilisent des **dropdowns compacts** — même pattern transversal que les autres vues

---


# Décisions
- **20/03/2026** : Enrichissement complet — alignement statuts dérivés avec calendrier (US-838), tags "Actions en attente" sur les cartes (US-841), suppression drag & drop (trop de logique de transition), filtres dropdown compact (pattern transversal), interaction clic → drawer (US-842).