---
notion_id: "3271d95b-2f8a-8172-b557-db7102f28c23"
notion_url: "https://www.notion.so/FCR-US818-Filtres-dynamiques-type-Notion-3271d95b2f8a8172b557db7102f28c23"
last_synced: "2026-03-26T12:57:08.212Z"
created: "2026-03-18T09:28:00.000Z"
last_edited: "2026-03-23T13:10:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "818"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Sponsors: "clement.flatchecker@outlook.fr, Flat Checker "
  Time spent: "0"
  Nom: "Filtres dynamiques type Notion"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3271d95b-2f8a-8198-928c-f11fa16a89de"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Status: "📌 Ready"
  Builders: "Tony Pineiro"
  Date de création: "2026-03-18T09:28:00.000Z"
  Code: "FCR - US818 Filtres dynamiques type Notion"
  Time Spent Activation: "Non"
---

# FCR - US818 Filtres dynamiques type Notion

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 818 |
| Created by | Tony Pineiro |
| Priority | 🔴 P0 |
| Sponsors | clement.flatchecker@outlook.fr, Flat Checker  |
| Time spent | 0 |
| Pricing | 0 |
| Project | 3071d95b-2f8a-80ac-9db8-dc4e9d2196c9 |
| Epic | 3271d95b-2f8a-8198-928c-f11fa16a89de |
| Brique Fonctionnelle | 3131d95b-2f8a-81de-af8e-d782a1b05a0e |
| Status | 📌 Ready |
| Builders | Tony Pineiro |
| Date de création | 2026-03-18T09:28:00.000Z |
| Code | FCR - US818 Filtres dynamiques type Notion |
| Time Spent Activation | Non |


# User Story
**En tant que** utilisateur,
**je veux** construire des filtres avancés sur les tableaux,
**afin de** trouver précisément les données qui m'intéressent.

---


# Critères d'acceptation (Gherkin)
```gherkin
Feature: Filtres dynamiques

  Scenario: Construction d'un filtre
    Given un tableau (missions, tiers, lots…)
    When l'utilisateur clique sur "+ Filtre"
    Then un builder s'ouvre : champ → opérateur → valeur
    And les opérateurs s'adaptent au type (texte: contient/égal, date: avant/après, enum: est)

  Scenario: Filtres cumulables (AND uniquement en V1)
    Given un filtre "Statut = Planifiée"
    When l'utilisateur ajoute "Technicien = Jean Dupont"
    Then les deux filtres s'appliquent en AND
    And la logique OR n'est pas disponible en V1 (V2 si besoin confirmé)

  Scenario: Complémentarité avec les filtres rapides dropdown
    Given des filtres rapides dropdown (Période, Technicien, Statut) sur le tableau missions
    When l'utilisateur ouvre le builder avancé "+ Filtre"
    Then les filtres avancés se combinent avec les filtres rapides actifs
    And les deux sont visibles simultanément
```

---


# Modèle de données impacté
- `UserPreference` : user_id, page, config JSON (filtres actifs par page — pas de presets nommés en V1)

---


# Règles métier
- **AND uniquement en V1**. OR → V2 si le besoin est confirmé.
- **Presets sauvegardés → V2**. Les filtres rapides dropdown (Période/Technicien/Statut) couvrent les cas courants. Les presets nommés par utilisateur seront ajoutés si le besoin est confirmé.
- La barre de recherche rapide reste disponible en parallèle des filtres
- Les filtres avancés complètent les filtres rapides dropdown (pattern transversal EPIC 16)