---
notion_id: "3271d95b-2f8a-8138-af24-e7b22bc0a4a1"
notion_url: "https://www.notion.so/FCR-US824-Archiver-un-b-timent-ou-un-lot-3271d95b2f8a8138af24e7b22bc0a4a1"
last_synced: "2026-03-26T12:56:06.722Z"
created: "2026-03-18T14:33:00.000Z"
last_edited: "2026-03-19T16:01:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "824"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Sponsors: "clement.flatchecker@outlook.fr, Flat Checker "
  Time spent: "0"
  Nom: "Archiver un bâtiment ou un lot"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3131d95b-2f8a-81f3-a317-c6756c9ae867"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Status: "📌 Ready"
  Builders: "Tony Pineiro"
  Date de création: "2026-03-18T14:33:00.000Z"
  Code: "FCR - US824 Archiver un bâtiment ou un lot"
  Time Spent Activation: "Non"
---

# FCR - US824 Archiver un bâtiment ou un lot

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 824 |
| Created by | Tony Pineiro |
| Priority | 🔴 P0 |
| Sponsors | clement.flatchecker@outlook.fr, Flat Checker  |
| Time spent | 0 |
| Pricing | 0 |
| Project | 3071d95b-2f8a-80ac-9db8-dc4e9d2196c9 |
| Epic | 3131d95b-2f8a-81f3-a317-c6756c9ae867 |
| Brique Fonctionnelle | 3131d95b-2f8a-81de-af8e-d782a1b05a0e |
| Status | 📌 Ready |
| Builders | Tony Pineiro |
| Date de création | 2026-03-18T14:33:00.000Z |
| Code | FCR - US824 Archiver un bâtiment ou un lot |
| Time Spent Activation | Non |


# User Story
**En tant que** admin,
**je veux** archiver un bâtiment ou un lot que je ne gère plus,
**afin de** garder l'historique sans polluer les listes et pickers actifs.

---


# Critères d'acceptation (Gherkin)
```gherkin
Feature: Archivage bâtiment et lot

  # ──────────────────────────────────────
  # ARCHIVAGE
  # ──────────────────────────────────────

  Scenario: Archiver un lot sans mission en cours
    Given un lot sans mission planifiee/assignee
    When l'admin clique "Archiver" + confirmation
    Then est_archive = true
    And le lot disparaît des listes, recherches et pickers par défaut

  Scenario: Archivage bloqué si missions en cours
    Given un lot avec une mission en statut planifiee ou assignee
    When l'admin tente d'archiver
    Then une erreur s'affiche : "Impossible d'archiver — X mission(s) en cours"
    And l'archivage est bloqué

  Scenario: Archiver un bâtiment
    Given tous les lots du bâtiment sont archivés ou sans mission
    When l'admin clique "Archiver le bâtiment" + confirmation
    Then le bâtiment est archivé (est_archive = true)
    And tous les lots non archivés restants sont aussi archivés

  Scenario: Désarchiver
    Given un lot archivé et le filtre "Archivés" est actif
    When l'admin clique "Désarchiver"
    Then le lot redevient actif (est_archive = false)
    And il réapparaît dans les listes, recherches et pickers

  Scenario: Pas de suppression définitive
    Given la fiche d'un bâtiment ou lot
    Then il n'y a AUCUN bouton "Supprimer" — uniquement "Archiver"

  # ──────────────────────────────────────
  # IMPACTS SUR LES RECORD PICKERS
  # ──────────────────────────────────────

  Scenario: Lot archivé exclu des pickers
    Given un lot archivé "Apt 2B"
    When le gestionnaire ouvre le picker lot dans le formulaire mission (US-594)
    Then "Apt 2B" n'apparaît PAS dans les résultats
    And il n'est pas trouvable via la recherche dans le picker

  Scenario: Bâtiment archivé exclu des pickers
    Given un bâtiment archivé "Résidence Les Tilleuls"
    When le gestionnaire ouvre le picker bâtiment dans le formulaire lot (US-583/584)
    Then "Résidence Les Tilleuls" n'apparaît PAS dans les résultats

  Scenario: Création de mission impossible sur lot archivé
    Given un lot archivé
    Then il est impossible de créer une nouvelle mission liée à ce lot
    And le lot n'apparaît pas dans les pickers donc le cas ne peut pas se produire via l'UI

  # ──────────────────────────────────────
  # IMPACTS SUR LES LISTES ET TABLEAUX
  # ──────────────────────────────────────

  Scenario: Parc immobilier — masquage par défaut (US-586)
    Given des lots et bâtiments archivés
    Then ils n'apparaissent PAS dans le tableau par défaut
    And un filtre "Afficher les archivés" permet de les retrouver
    And les éléments archivés sont affichés grisés avec un badge "Archivé"

  Scenario: Vue carte — exclusion par défaut (US-586)
    Given un bâtiment archivé avec coordonnées GPS
    Then il n'apparaît PAS sur la vue carte par défaut
    And si le filtre "Archivés" est actif, le marqueur apparaît grisé

  Scenario: Recherche globale — exclusion par défaut
    Given un lot archivé "Apt 2B"
    When le gestionnaire tape "2B" dans la recherche globale
    Then "Apt 2B" n'apparaît PAS dans les résultats par défaut
    And une option "Inclure les archivés" permet de le retrouver

  # ──────────────────────────────────────
  # IMPACTS SUR LES FICHES ET MISSIONS
  # ──────────────────────────────────────

  Scenario: Missions existantes conservées (historique)
    Given un lot archivé avec 3 missions terminées
    Then les missions restent visibles et consultables
    And sur la fiche mission (US-811) et le drawer (US-842), le lot est affiché avec un badge "Archivé"
    And les liens PDF et Web des EDL signés restent accessibles

  Scenario: Fiche bâtiment — lots archivés grisés (US-610)
    Given un bâtiment avec 3 lots actifs et 2 lots archivés
    Then le bandeau stats affiche : "3 actifs / 2 archivés"
    And dans le drill-down lots, les lots archivés sont grisés avec badge "Archivé"
    And les lots archivés sont affichés en bas de la liste (après les actifs)

  Scenario: Fiche tiers — lots archivés grisés (US-806, US-809)
    Given un propriétaire avec 2 lots actifs et 1 lot archivé
    Then la section "Lots" affiche les 3 lots
    And le lot archivé est grisé avec badge "Archivé"
    And il reste cliquable vers sa fiche (en lecture seule)

  Scenario: Fiche lot archivé — lecture seule
    Given un lot archivé
    When le gestionnaire ouvre la fiche
    Then la fiche est accessible mais un bandeau "Ce lot est archivé" est affiché en haut
    And le bouton "Modifier" est masqué (pas d'édition sur un lot archivé)
    And le bouton "Créer une mission" est masqué
    And seul le bouton "Désarchiver" est disponible

  # ──────────────────────────────────────
  # IMPACTS SUR LE DASHBOARD ET LES STATS
  # ──────────────────────────────────────

  Scenario: Dashboard — pas d'impact sur les missions existantes
    Given un lot archivé avec une mission terminée le mois dernier
    Then cette mission apparaît toujours dans les stats "EDL du mois" si signé ce mois
    And les missions à venir sur des lots archivés ne sont PAS possibles (aucune mission ne peut être créée)

  # ──────────────────────────────────────
  # IMPACTS SUR L'API (EPIC 10)
  # ──────────────────────────────────────

  Scenario: API — exclusion par défaut
    Given un lot archivé
    When un appel API GET /lots est fait sans paramètre spécifique
    Then le lot archivé n'est PAS retourné
    When un appel API GET /lots?include_archived=true est fait
    Then le lot archivé est retourné avec un champ "est_archive": true
```

---


# Modèle de données impacté
**Champ utilisé** : `est_archive` (bool, default: false) sur `Batiment` et `Lot`
**Tables impactées par le filtrage** :
- `Lot` — filtré dans les pickers (formulaire mission US-594, formulaire lot US-584)
- `Batiment` — filtré dans les pickers (formulaire lot US-583)
- Tableau parc immobilier (US-586) — filtré par défaut
- Vue carte (US-586) — filtré par défaut
- Recherche globale — filtré par défaut
- API REST (EPIC 10) — filtré par défaut, paramètre `include_archived` optionnel

---


# Règles métier
- **Soft delete** via `est_archive` (réversible, pas de suppression définitive en V1)
- L'archivage est bloqué si des missions planifiées ou assignées existent sur le lot
- L'archivage d'un bâtiment archive aussi ses lots non encore archivés
- **Exclusions par défaut** : les éléments archivés sont exclus des listes, tableaux, pickers, recherche, vue carte et API par défaut
- **Accès à l'historique** : un filtre "Afficher les archivés" est disponible sur les listes et la recherche pour retrouver les éléments archivés
- Les missions existantes liées à des lots archivés restent visibles et consultables (historique + conformité légale)
- La fiche d'un lot archivé est en **lecture seule** (pas de modification, pas de création de mission)
- Les éléments archivés sont visuellement grisés avec un badge "Archivé" partout où ils apparaissent
- La conformité légale impose la conservation des données (10+ ans, cf EPIC 11)

---


# Décisions
- **19/03/2026** : Documentation complète des impacts en cascade de l'archivage : pickers, listes, carte, recherche, fiches, missions, dashboard, API