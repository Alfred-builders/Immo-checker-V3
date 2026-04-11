---
notion_id: "3131d95b-2f8a-81a8-b178-f5b5f59a570b"
notion_url: "https://www.notion.so/FCR-US586-Lister-filtrer-et-rechercher-dans-le-parc-immobilier-3131d95b2f8a81a8b178f5b5f59a570b"
last_synced: "2026-03-26T12:55:21.332Z"
created: "2026-02-26T15:50:00.000Z"
last_edited: "2026-03-19T16:06:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "586"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Time spent: "0"
  Nom: "Lister, filtrer et rechercher dans le parc immobilier"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3131d95b-2f8a-81f3-a317-c6756c9ae867"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Status: "📌 Ready"
  Builders: "Tony Pineiro"
  Date de création: "2026-02-26T15:50:00.000Z"
  Code: "FCR - US586 Lister, filtrer et rechercher dans le parc immobilier"
  Time Spent Activation: "Non"
---

# FCR - US586 Lister, filtrer et rechercher dans le parc immobilier

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 586 |
| Created by | Tony Pineiro |
| Priority | 🔴 P0 |
| Time spent | 0 |
| Pricing | 0 |
| Project | 3071d95b-2f8a-80ac-9db8-dc4e9d2196c9 |
| Epic | 3131d95b-2f8a-81f3-a317-c6756c9ae867 |
| Brique Fonctionnelle | 3131d95b-2f8a-81de-af8e-d782a1b05a0e |
| Status | 📌 Ready |
| Builders | Tony Pineiro |
| Date de création | 2026-02-26T15:50:00.000Z |
| Code | FCR - US586 Lister, filtrer et rechercher dans le parc immobilier |
| Time Spent Activation | Non |


# User Story
**En tant que** gestionnaire ou admin,
**je veux** lister, filtrer et rechercher mes bâtiments et lots dans une vue unifiée,
**afin de** retrouver rapidement un bien sans naviguer entre des pages séparées.

---


# Critères d'acceptation (Gherkin)
```gherkin
Feature: Liste et recherche parc immobilier (vue unifiée)

  # ──────────────────────────────────────
  # VUE TABLEAU
  # ──────────────────────────────────────

  Scenario: Vue principale — liste des bâtiments
    Given un gestionnaire connecté
    When il accède à "Parc immobilier"
    Then il voit un tableau des bâtiments de son workspace :
      | Désignation            | Type     | Adresse                              | Nb lots | Dernière mission | Missions à venir |
      | Résidence Les Tilleuls | Immeuble | 12 rue des Lilas, 75011 Paris        | 5       | 15/03/2026       | 2                |
      | Maison Dupont          | Maison   | 8 rue des Roses, 69003 Lyon          | 1       | 01/02/2026       | 0                |
    And l'adresse est affichée en une seule colonne (pas de colonnes séparées Ville/CP — l'autocomplete Google Places fournit l'adresse en un bloc)
    And il n'y a PAS d'onglet "Lots" séparé — les lots sont accessibles uniquement via drill-down

  Scenario: Drill-down — voir les lots d'un bâtiment
    Given un bâtiment "Résidence Les Tilleuls" avec 5 lots
    When le gestionnaire clique sur le chevron d'expansion
    Then les lots s'affichent en sous-lignes sous le bâtiment :
      | Icône | Nom / Réf | Étage | Type        | Surface | Meublé | Propriétaire  | Mandataire         | Dernier locataire (EDL) | Dernière mission |
      |       | Apt 1A    | RDC   | Appartement | 45 m²   | Non    | Pierre Leroy  | Agence Versailles  | Marie Martin            | 01/01/2026       |
      |       | Apt 2B    | 2ème  | Appartement | 65 m²   | Oui    | Pierre Leroy  | Agence Versailles  | —                       | 15/03/2026       |
      |       | Box 01    | SS    | Box parking | 15 m²   | —      | Pierre Leroy  | —                  | —                       | —                |
    And les drill-down sont **fermés par défaut**
    And chaque lot est cliquable vers sa fiche détail
    And les lots sont triés par étage ASC puis désignation ASC

  Scenario: Colonnes configurables
    Given le tableau des bâtiments
    When le gestionnaire clique sur le bouton "Colonnes"
    Then il peut activer/désactiver les colonnes
    And les colonnes visibles par défaut (bâtiments) : Désignation, Type, Adresse, Nb lots, Dernière mission, Missions à venir
    And les colonnes masquées par défaut : Année construction, Nombre d'étages, Numéro bâtiment, Créé le
    And le mécanisme de colonnes configurables est un composant transverse partagé sur tous les tableaux (cf note ci-dessous)

  # ──────────────────────────────────────
  # RECHERCHE & FILTRES
  # ──────────────────────────────────────

  Scenario: Recherche textuelle cross-attribut
    Given 50 bâtiments existent dans le workspace
    Then la barre de recherche filtre sur **tous les attributs** suivants :
      | Attribut recherché      | Source                            |
      | Désignation bâtiment    | Batiment.designation              |
      | Adresse                 | AdresseBatiment (rue, ville, CP)  |
      | Nom / Référence lot     | Lot.designation, Lot.reference    |
      | Propriétaire            | LotProprietaire → Tiers.nom      |
      | Mandataire / Agence     | Lot.mandataire_id → Tiers.nom    |
    And si le terme matche un lot mais pas son bâtiment parent, le bâtiment s'affiche quand même avec le lot en surbrillance

  Scenario: Filtres dynamiques
    Given des bâtiments et lots de types variés
    Then les filtres spécifiques au parc immobilier sont :
      | Filtre          | Type    | Champ source                |
      | Type de bien    | Select  | Lot.type_bien               |
      | Meublé          | Oui/Non | Lot.est_meuble              |
      | Propriétaire    | Select  | LotProprietaire → Tiers     |
      | Mandataire      | Select  | Lot.mandataire_id → Tiers   |
    And les filtres supportent les conditions AND et OR (logique gérée par le composant transverse)
    And un filtre sur un champ lot filtre aussi le bâtiment parent

  # ──────────────────────────────────────
  # ACTIONS
  # ──────────────────────────────────────

  Scenario: Actions depuis la liste
    Given la page Parc immobilier
    Then les actions suivantes sont disponibles :
      | Action            | Résultat                                      |
      | Clic sur ligne    | Navigation vers fiche détail bâtiment (US-610) |
      | Clic sur lot      | Navigation vers fiche détail lot (US-609)       |
      | Importer (CSV) | Ouvre la modale d'import en masse (US-843)     |
    And il n'y a PAS de bouton "Nouveau bâtiment" sur cette page — la création se fait via les record pickers (formulaire lot US-584 ou mission US-594)

  # ──────────────────────────────────────
  # VUE CARTE
  # ──────────────────────────────────────

  Scenario: Vue carte / map du parc immobilier
    Given 20 bâtiments géocodés dans le workspace
    When le gestionnaire active la vue carte
    Then une carte (Mapbox) affiche un marqueur par bâtiment
    And chaque marqueur affiche le nombre de lots sur le pin
    And chaque marqueur est coloré selon l'activité missions :
      | Couleur | Condition                                  |
      | Bleu    | Mission(s) à venir dans les 7 prochains jours |
      | Vert    | Dernière mission < 6 mois                  |
      | Gris    | Aucune mission récente (> 6 mois ou jamais) |
    And une **légende** est affichée en bas ou sur le côté de la carte expliquant les 3 couleurs
    And au clic sur un marqueur, un popup affiche :
      | Champ              | Exemple                        |
      | Désignation        | Résidence Les Tilleuls         |
      | Adresse            | 12 rue des Lilas, 75011 Paris  |
      | Nb lots            | 5                              |
      | Dernière mission   | 15/03/2026                     |
      | Missions à venir   | 2                              |
    And le clic sur le popup navigue vers la fiche détail bâtiment
    And les filtres de la vue tableau s'appliquent aussi à la vue carte
    And les bâtiments sans coordonnées GPS ne sont pas affichés sur la carte

  Scenario: Clustering au dézoom
    Given la vue carte avec 50 bâtiments
    When le gestionnaire dézoome
    Then les marqueurs proches se regroupent en clusters
    And chaque cluster affiche le nombre de bâtiments qu'il contient
    And au clic sur un cluster, la carte zoome pour révéler les marqueurs individuels

  Scenario: Basculement entre vues
    Given la page Parc immobilier
    Then un toggle permet de basculer entre "Tableau" et "Carte"
    And les filtres actifs sont conservés lors du basculement

  Scenario: Pagination
    Given plus de 25 bâtiments
    Then le tableau est paginé (25 résultats par page)
    And le nombre total est affiché
```

---


# Modèle de données impacté
**Tables consultées** (lecture seule) :
- `Batiment` — liste principale
- `AdresseBatiment` (type=principale) — adresse complète en un bloc + `latitude`/`longitude` pour la vue carte
- `Lot` — sous-lignes drill-down
- `LotProprietaire` → `Tiers` — propriétaire par lot
- `Lot.mandataire_id` → `Tiers` — mandataire par lot (colonne drill-down + filtre)
- `Mission` — dernière mission par lot/bâtiment + comptage missions à venir
- `EDL_Inventaire` + `EDLLocataire` → `Tiers` — dernier locataire connu (informatif)

---


# Règles métier
- La page "Parc immobilier" remplace l'ancien onglet "Bâtiments" ET l'onglet "Lots" (supprimé)
- Les lots ne sont visibles que via drill-down depuis un bâtiment ou via la recherche globale
- L'adresse est une colonne unique (pas de colonnes séparées Ville/CP)
- La **recherche est cross-attribut** : désignation, adresse, lot, propriétaire, mandataire
- Un bâtiment type "maison" (1 lot) peut afficher le lot directement sans drill-down
- "Dernier locataire" est informatif, pas un statut d'occupation
- Les filtres sur des champs lot retournent les bâtiments parents correspondants
- Pagination : 25 résultats par page, tri par défaut : désignation ASC
- Accessible aux admin et gestionnaires
> ⚠️ **Composant transverse tableau** : Les mécaniques de colonnes configurables, filtres dynamiques (AND/OR), recherche rapide, pagination, resize/freeze de colonnes et édition inline sont des composants partagés sur tous les tableaux de l'application (parc immo, missions, tiers). Ils doivent être spécifiés dans une US transverse dédiée. Cette US-586 définit uniquement les colonnes et filtres **spécifiques** au parc immobilier.

---


# Décisions
- **19/03/2026** : Adresse en une seule colonne (pas de colonnes séparées Ville/CP) — cohérent avec l'autocomplete Google Places
- **19/03/2026** : Ajout colonne "Mandataire" dans le drill-down lots
- **19/03/2026** : Recherche cross-attribut : désignation, adresse, lot, propriétaire, mandataire
- **19/03/2026** : Filtres AND/OR — logique gérée par un composant transverse, pas spécifique à cette US
- **19/03/2026** : Action "Nouveau bâtiment" unique (le choix de type se fait dans la modale, pas de raccourci "Nouvelle maison" séparé en haut de page)
- **19/03/2026** : Ajout d'une légende pour les couleurs des pins sur la vue carte
- **19/03/2026** : Colonnes configurables, filtres dynamiques, etc. → à spécifier dans une US transverse dédiée. Cette US définit les colonnes/filtres spécifiques au parc immobilier.