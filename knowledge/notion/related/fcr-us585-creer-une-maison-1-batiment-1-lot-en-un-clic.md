---
notion_id: "3131d95b-2f8a-818e-84da-f1f56abcdbd4"
notion_url: "https://www.notion.so/FCR-US585-Cr-er-une-maison-1-b-timent-1-lot-en-un-clic-3131d95b2f8a818e84daf1f56abcdbd4"
last_synced: "2026-03-26T12:55:17.294Z"
created: "2026-02-26T15:50:00.000Z"
last_edited: "2026-03-19T15:56:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "585"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Time spent: "0"
  Nom: "Créer une maison = 1 bâtiment + 1 lot en un clic"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3131d95b-2f8a-81f3-a317-c6756c9ae867"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Status: "📌 Ready"
  Builders: "Tony Pineiro"
  Date de création: "2026-02-26T15:50:00.000Z"
  Code: "FCR - US585 Créer une maison = 1 bâtiment + 1 lot en un clic"
  Time Spent Activation: "Non"
---

# FCR - US585 Créer une maison = 1 bâtiment + 1 lot en un clic

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 585 |
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
| Code | FCR - US585 Créer une maison = 1 bâtiment + 1 lot en un clic |
| Time Spent Activation | Non |


# User Story
**En tant que** gestionnaire,
**je veux** que la sélection du type "maison" dans le formulaire bâtiment (US-583) enchaîne automatiquement avec la création du lot,
**afin de** ne pas avoir à créer séparément bâtiment et lot pour une maison individuelle.
> ℹ️ Cette US décrit un **comportement automatique** du formulaire bâtiment (US-583), pas un bouton séparé "Nouvelle maison". Le parcours est : record picker bâtiment → "Ajouter un bâtiment" → type = "maison" → après validation, le formulaire lot s'ouvre automatiquement, pré-lié au bâtiment.

---


# Critères d'acceptation (Gherkin)
```gherkin
Feature: Raccourci maison individuelle (comportement automatique)

  Scenario: Sélection type "maison" → enchaînement lot
    Given le gestionnaire est dans le formulaire de création bâtiment (US-583)
    When il sélectionne type = "maison"
    And il renseigne désignation, adresse, etc.
    And il valide
    Then un Bâtiment type="maison" est créé
    And le formulaire de création de lot s'ouvre automatiquement en sous-modal
    And le lot est pré-lié au bâtiment (champ bâtiment verrouillé)
    And le type de bien du lot est pré-rempli = "maison"

  Scenario: Création du lot après le bâtiment
    Given le formulaire lot est ouvert après création du bâtiment maison
    When le gestionnaire renseigne surface, meublé, nombre de pièces, etc.
    And il valide
    Then le lot est créé et rattaché au bâtiment
    And le gestionnaire revient au formulaire d'origine (mission ou lot) avec le lot auto-sélectionné

  Scenario: Le bâtiment et le lot sont liés
    Given une maison créée via ce parcours
    When le gestionnaire consulte le bâtiment
    Then il voit exactement 1 lot
    And les informations sont cohérentes
```

---


# Règles métier
- Maison = 1 Bâtiment (type=maison) + 1 Lot (type_bien=maison)
- Architecture uniforme : pas de cas particulier en base
- L'UX simplifie la saisie en enchaînant automatiquement bâtiment → lot quand type = "maison"
- Il n'y a **PAS** de bouton "Nouvelle maison" séparé — le raccourci est intégré au formulaire bâtiment via le choix de type
- Le lot créé hérite automatiquement du workspace du bâtiment

---


# Décisions
- **19/03/2026** : Reframing — le raccourci maison n'est plus un bouton séparé, c'est le comportement auto quand type="maison" est sélectionné dans le formulaire bâtiment (US-583)