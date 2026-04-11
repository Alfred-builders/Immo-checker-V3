---
notion_id: "3271d95b-2f8a-8182-bde1-fcdcfba5aff9"
notion_url: "https://www.notion.so/FCR-US808-Naviguer-par-onglets-type-de-tiers-avec-colonnes-dynamiques-3271d95b2f8a8182bde1fcdcfba5aff9"
last_synced: "2026-03-26T12:56:18.308Z"
created: "2026-03-18T09:26:00.000Z"
last_edited: "2026-03-23T12:27:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "808"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Sponsors: "clement.flatchecker@outlook.fr, Flat Checker "
  Time spent: "0"
  Nom: "Naviguer par onglets type de tiers avec colonnes dynamiques"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3131d95b-2f8a-8164-8e3e-e9fee9e70624"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Status: "📌 Ready"
  Builders: "Tony Pineiro"
  Date de création: "2026-03-18T09:26:00.000Z"
  Code: "FCR - US808 Naviguer par onglets type de tiers avec colonnes dynamiques"
  Time Spent Activation: "Non"
---

# FCR - US808 Naviguer par onglets type de tiers avec colonnes dynamiques

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 808 |
| Created by | Tony Pineiro |
| Priority | 🔴 P0 |
| Sponsors | clement.flatchecker@outlook.fr, Flat Checker  |
| Time spent | 0 |
| Pricing | 0 |
| Project | 3071d95b-2f8a-80ac-9db8-dc4e9d2196c9 |
| Epic | 3131d95b-2f8a-8164-8e3e-e9fee9e70624 |
| Brique Fonctionnelle | 3131d95b-2f8a-81de-af8e-d782a1b05a0e |
| Status | 📌 Ready |
| Builders | Tony Pineiro |
| Date de création | 2026-03-18T09:26:00.000Z |
| Code | FCR - US808 Naviguer par onglets type de tiers avec colonnes dynamiques |
| Time Spent Activation | Non |


# User Story
**En tant que** gestionnaire ou admin,
**je veux** naviguer entre les types de tiers via des onglets avec des colonnes adaptées,
**afin de** voir les informations pertinentes pour chaque rôle.

---


# Critères d'acceptation (Gherkin)
```gherkin
Feature: Navigation par onglets et colonnes dynamiques

  # ──────────────────────────────────────
  # ONGLETS ET COLONNES
  # ──────────────────────────────────────

  Scenario: Navigation par onglets
    Given le gestionnaire accède à la page Tiers
    Then il voit les onglets dans l'ordre : Propriétaire | Locataire | Mandataire | Tous
    And l'onglet "Tous" est visuellement discret (grisé ou en fin de ligne)

  Scenario: Colonne agrégée "Nom / Raison sociale" (commune à tous les onglets)
    Given un tableau de tiers (n'importe quel onglet)
    Then la 1ère colonne est "Nom / Raison sociale" qui affiche :
      - PP (personne physique) : "Prénom Nom" (ex : "Pierre Leroy")
      - PM (personne morale) : "Raison sociale" (ex : "SCI Les Tilleuls")
    And cette logique d'agrégation est identique sur tous les onglets et tous les pickers tiers

  Scenario: Colonnes onglet Propriétaire
    Given l'onglet "Propriétaire" est sélectionné
    Then le tableau affiche les tiers ayant au moins 1 entrée LotProprietaire :
      | Nom / Raison sociale | Type (PP/PM) | Email | Téléphone | Nb lots | Dernière mission |

  Scenario: Colonnes onglet Locataire
    Given l'onglet "Locataire" est sélectionné
    Then le tableau affiche les tiers ayant au moins 1 entrée EDLLocataire :
      | Nom / Raison sociale | Email | Téléphone | Dernier lot (EDL) | Propriétaire | Dernière mission |

  Scenario: Colonnes onglet Mandataire
    Given l'onglet "Mandataire" est sélectionné
    Then le tableau affiche les tiers référencés par au moins 1 Lot.mandataire_id :
      | Raison sociale | Contact principal | Email | Téléphone | Nb lots en gestion |

  Scenario: Colonnes onglet Tous
    Given l'onglet "Tous" est sélectionné
    Then le tableau affiche tous les tiers du workspace sans filtre de rôle :
      | Nom / Raison sociale | Type (PP/PM) | Rôle(s) | Email | Téléphone | Dernière mission |
    And la colonne "Rôle(s)" peut afficher **plusieurs badges** si le tiers a plusieurs rôles (ex : "Propriétaire" + "Locataire")

  Scenario: Tiers multi-rôles dans un onglet
    Given un tiers "Jean Dupont" qui est propriétaire d'un lot ET locataire d'un autre
    Then il apparaît dans l'onglet "Propriétaire" (avec ses lots possédés)
    And il apparaît dans l'onglet "Locataire" (avec ses lots loués)
    And dans l'onglet "Tous", sa colonne "Rôle(s)" affiche 2 badges : "Propriétaire" + "Locataire"
    And au clic, la fiche détail affiche toutes ses casquettes (sections conditionnelles)

  Scenario: Masquage conditionnel mandataire
    Given un workspace de type "agence"
    Then l'onglet "Mandataire" n'est pas affiché
    And l'ordre est : Propriétaire | Locataire | Tous

  # ──────────────────────────────────────
  # RECHERCHE ET FILTRES
  # ──────────────────────────────────────

  Scenario: Barre de recherche rapide
    Given un onglet tiers sélectionné
    Then une barre de recherche est disponible au-dessus du tableau
    And la recherche couvre : nom, prénom, raison_sociale, email, téléphone
    And les résultats sont filtrés en temps réel

  Scenario: Filtres rapides (dropdowns compacts)
    Given un onglet tiers (Propriétaire, Locataire, ou Tous)
    Then des dropdowns compacts sont disponibles :
      | Filtre             | Type      | Valeurs (selon onglet)                   |
      | Type personne      | Dropdown  | Tous / Physique / Morale                 |
    And les filtres sont combinables avec la recherche
    And même pattern UX que les autres vues (missions US-597, carte US-813)

  Scenario: Pagination et tri
    Given un workspace avec 200 tiers
    Then le tableau est paginé (25 résultats par page)
    And le tri par défaut est alphabétique (Nom / Raison sociale ASC)
    And les colonnes sont triables au clic
```

---


# Modèle de données impacté
**Tables consultées** :
- `Tiers` — base
- `LotProprietaire` — détermine le rôle Propriétaire + comptage lots
- `Lot.mandataire_id` — détermine le rôle Mandataire + comptage lots en gestion
- `EDLLocataire` → `EDL_Inventaire` → `Lot` — détermine le rôle Locataire + dernier lot
- `TiersOrganisation` → `Tiers` — contact principal (mandataire)
- `Workspace.type_workspace` — conditionne l'affichage mandataire

---


# Règles métier
- Chaque onglet a ses colonnes par défaut, customisables via le composant colonnes configurables (EPIC 16)
- La colonne "Rôle(s)" n'apparaît que dans la vue "Tous" — peut afficher **plusieurs badges** (multi-rôle)
- Le masquage mandataire dépend du `type_workspace` : masqué si "agence"
- La colonne agrégée "Nom / Raison sociale" est le pattern standard sur tous les tableaux tiers et pickers : `prénom + nom` pour PP, `raison_sociale` pour PM
- **Barre de recherche** couvre nom, prénom, raison_sociale, email, téléphone
- **Filtres dropdown compact** : même pattern transversal que les missions
- **"Dernier lot (EDL)"** dans l'onglet Locataire est informatif (issu du dernier EDL d'entrée) — pas un statut d'occupation
- Pagination 25 résultats par page, tri alphabétique par défaut

---


# Décisions
- **20/03/2026** : Colonne "Nom / Raison sociale" agrégée (PP = Prénom Nom, PM = Raison sociale) appliquée à tous les onglets y compris Locataire (pas de colonnes Nom/Prénom séparées). Colonnes onglet Tous définies. Barre de recherche + filtres dropdown compact ajoutés. Edge case multi-rôles spécifié (badges multiples dans Tous, apparition dans chaque onglet pertinent).