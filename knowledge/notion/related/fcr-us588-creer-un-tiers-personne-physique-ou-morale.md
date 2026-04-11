---
notion_id: "3131d95b-2f8a-81f6-9dbb-c73f64547ebd"
notion_url: "https://www.notion.so/FCR-US588-Cr-er-un-tiers-personne-physique-ou-morale-3131d95b2f8a81f69dbbc73f64547ebd"
last_synced: "2026-03-26T12:55:26.188Z"
created: "2026-02-26T15:52:00.000Z"
last_edited: "2026-03-18T14:37:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "588"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Time spent: "0"
  Nom: "Créer un tiers (personne physique ou morale)"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3131d95b-2f8a-8164-8e3e-e9fee9e70624"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Status: "📌 Ready"
  Builders: "Tony Pineiro"
  Date de création: "2026-02-26T15:52:00.000Z"
  Code: "FCR - US588 Créer un tiers (personne physique ou morale)"
  Time Spent Activation: "Non"
---

# FCR - US588 Créer un tiers (personne physique ou morale)

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 588 |
| Created by | Tony Pineiro |
| Priority | 🔴 P0 |
| Time spent | 0 |
| Pricing | 0 |
| Project | 3071d95b-2f8a-80ac-9db8-dc4e9d2196c9 |
| Epic | 3131d95b-2f8a-8164-8e3e-e9fee9e70624 |
| Brique Fonctionnelle | 3131d95b-2f8a-81de-af8e-d782a1b05a0e |
| Status | 📌 Ready |
| Builders | Tony Pineiro |
| Date de création | 2026-02-26T15:52:00.000Z |
| Code | FCR - US588 Créer un tiers (personne physique ou morale) |
| Time Spent Activation | Non |


# User Story
**En tant que** gestionnaire ou admin,
**je veux** créer un tiers (personne physique ou morale),
**afin de** l'associer à mes lots, EDL et missions.

---


# Critères d'acceptation (Gherkin)
```gherkin
Feature: Création d'un tiers

  Scenario: Formulaire adaptatif PP/PM
    Given un admin/gestionnaire ouvre le formulaire "Nouveau tiers"
    Then le premier champ est :
      | Type de personne | Toggle : Physique / Morale |
    And les champs s'adaptent au type sélectionné :
    
    Si Physique :
      | Champ         | Type   | Obligatoire |
      | Nom           | Texte  | Oui         |
      | Prénom        | Texte  | Oui         |
      | Email         | Email  | Non         |
      | Téléphone     | Texte  | Non         |
      | Adresse       | Autocomplete Google Places | Non |
    
    Si Morale :
      | Champ            | Type   | Obligatoire |
      | Raison sociale   | Texte  | Oui         |
      | SIREN            | Texte  | Non         |
      | Email            | Email  | Non         |
      | Téléphone        | Texte  | Non         |
      | Adresse          | Autocomplete Google Places | Non |

  Scenario: Création à la volée depuis un autre formulaire
    Given le gestionnaire est dans le formulaire de création de mission
    When il clique "Créer un tiers" dans le record picker
    Then le formulaire de création tiers s'ouvre en sous-modal
    And après création, le tiers est automatiquement sélectionné dans le picker

  Scenario: Validation
    Given formulaire PP sans nom
    Then champ encadré rouge "Champ obligatoire"
    Given formulaire PM sans raison sociale
    Then champ encadré rouge "Champ obligatoire"

  Scenario: Unicité
    Given un tiers avec email "pierre@leroy.fr" existe déjà
    When le gestionnaire crée un tiers avec le même email
    Then un warning non-bloquant s'affiche : "Un tiers avec cet email existe déjà"
    And la création reste possible (cas de doublons volontaires)
```

---


# Modèle de données impacté
- `Tiers` : type_personne (physique/morale), nom, prenom (PP), raison_sociale (PM), SIREN (PM), adresse, code_postal, ville, tel, email, representant_nom, procuration

---


# Règles métier
- Les champs affichés dépendent du type_personne (pas de SIREN pour PP, pas de prénom pour PM)
- L'autocomplete adresse utilise Google Places (composant partagé EPIC 16)
- La création à la volée est disponible depuis tous les record pickers tiers
- Accessible admin et gestionnaires