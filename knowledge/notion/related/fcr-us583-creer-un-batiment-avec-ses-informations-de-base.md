---
notion_id: "3131d95b-2f8a-819c-9980-d19f54040bb7"
notion_url: "https://www.notion.so/FCR-US583-Cr-er-un-b-timent-avec-ses-informations-de-base-3131d95b2f8a819c9980d19f54040bb7"
last_synced: "2026-03-26T12:55:14.791Z"
created: "2026-02-26T15:50:00.000Z"
last_edited: "2026-03-19T15:49:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "583"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Time spent: "0"
  Nom: "Créer un bâtiment avec ses informations de base"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3131d95b-2f8a-81f3-a317-c6756c9ae867"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Status: "📌 Ready"
  Builders: "Tony Pineiro"
  Date de création: "2026-02-26T15:50:00.000Z"
  Code: "FCR - US583 Créer un bâtiment avec ses informations de base"
  Time Spent Activation: "Non"
---

# FCR - US583 Créer un bâtiment avec ses informations de base

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 583 |
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
| Code | FCR - US583 Créer un bâtiment avec ses informations de base |
| Time Spent Activation | Non |


# User Story
**En tant que** gestionnaire ou admin,
**je veux** créer un bâtiment à la volée depuis un record picker (formulaire lot ou formulaire mission),
**afin de** ne pas interrompre mon parcours de création pour aller structurer le parc immobilier au préalable.
> ℹ️ **Composant partagé** : Ce formulaire n'est PAS accessible depuis un bouton "Nouveau bâtiment" sur la page Parc immobilier. Le parcours principal est : création de mission (US-594) → sélection lot → le lot n'existe pas → création lot (US-584) → le bâtiment n'existe pas → création bâtiment (cette US). Le formulaire est le même quel que soit le point d'entrée.

---


# Critères d'acceptation (Gherkin)
```gherkin
Feature: Formulaire de création bâtiment (composant partagé)

  Scenario: Point d'entrée unique — record picker bâtiment
    Given le gestionnaire est dans le formulaire de création de lot (US-584) ou de mission (US-594)
    And le champ "Bâtiment" affiche un record picker avec les bâtiments existants
    When le gestionnaire ne trouve pas son bâtiment dans la liste
    And il clique sur "Ajouter un bâtiment" en bas de la dropdown
    Then le formulaire de création bâtiment s'ouvre en sous-modal
    And il n'y a PAS de bouton "Nouveau bâtiment" sur la page Parc immobilier

  Scenario: Champs du formulaire
    Given le formulaire de création bâtiment est ouvert
    Then les champs suivants sont affichés :
      | Champ               | Type                                          | Obligatoire |
      | Désignation         | Texte                                         | Oui         |
      | Type                | Enum (immeuble/maison/local_commercial/mixte) | Oui         |
      | Adresse principale  | Autocomplete Google Places                    | Oui         |
      | Complément adresse  | Texte                                         | Non         |
      | Adresse secondaire  | Autocomplete Google Places                    | Non         |
      | Année construction  | Nombre                                        | Non         |
      | Numéro bâtiment     | Texte (A, B, C…)                              | Non         |
      | Nombre d'étages     | Nombre                                        | Non         |
      | Commentaire         | Texte long                                    | Non         |

  Scenario: Autocomplete adresse (Google Places)
    Given le champ adresse
    When le gestionnaire tape "12 rue des Li"
    Then des suggestions Google Places s'affichent
    And à la sélection, l'adresse complète est stockée en un bloc :
      | Donnée        | Valeur auto-remplie         |
      | Adresse       | 12 rue des Lilas, 75011 Paris |
      | Latitude      | 48.8588                     |
      | Longitude     | 2.3829                      |
    And l'utilisateur peut corriger manuellement si besoin

  Scenario: Création avec adresses multiples (immeuble traversant)
    Given le formulaire de création
    When le gestionnaire clique "Ajouter une adresse secondaire"
    Then un second bloc adresse avec autocomplete apparaît
    And chaque adresse a son propre géocodage

  Scenario: Sélection du type "maison"
    Given le gestionnaire sélectionne type = "maison"
    When il valide le formulaire
    Then le bâtiment est créé
    And le formulaire de création de lot s'ouvre automatiquement (pré-lié au bâtiment)
    And le lot est créé avec un lien direct vers le bâtiment (1 bâtiment = 1 lot pour une maison)

  Scenario: Retour après création
    Given le gestionnaire a créé un bâtiment depuis le record picker
    When la création est confirmée
    Then le bâtiment nouvellement créé est automatiquement sélectionné dans le picker
    And le gestionnaire revient au formulaire d'origine (lot ou mission)

  Scenario: Validation
    Given un formulaire avec désignation vide
    When le gestionnaire soumet
    Then le champ désignation est encadré en rouge avec "Champ obligatoire"
    And le formulaire n'est pas soumis

  Scenario: Permissions
    Given un technicien connecté
    Then le bouton "Ajouter un bâtiment" n'est pas visible dans le record picker
```

---


# Modèle de données impacté
**Tables créées** :
- `Batiment` : workspace_id, designation (requis), type (enum), annee_construction, num_batiment, nb_etages, commentaire, est_archive, created_at, updated_at
- `AdresseBatiment` : batiment_id, type (principale/secondaire), adresse_complete, complement, latitude, longitude, ordre

---


# Règles métier
- **Pas de bouton "Nouveau bâtiment" sur la page Parc immobilier** — le bâtiment se crée toujours dans le contexte d'un lot ou d'une mission
- Seuls admin et gestionnaires peuvent créer des bâtiments
- Au moins une adresse principale est requise
- Le type par défaut est "immeuble"
- L'adresse est stockée en un bloc (pas de champs séparés rue/CP/ville) — l'autocomplete Google Places fournit l'adresse complète
- Le géocodage (latitude/longitude) est automatique via Google Places. Si saisie manuelle → pas de coordonnées GPS (bâtiment non affiché sur la vue carte)
- Après création, le bâtiment est auto-sélectionné dans le picker du formulaire appelant
- Si type = "maison", le formulaire lot s'ouvre automatiquement après création (cf US-585)

---


# Décisions
- **19/03/2026** : Reframing — le formulaire bâtiment est un composant partagé appelé depuis les record pickers (lot, mission), pas un parcours autonome. Pas de bouton "Nouveau bâtiment" sur la page Parc immobilier.
- **19/03/2026** : Adresse stockée en un bloc (pas de colonnes séparées rue/CP/ville) — cohérent avec l'autocomplete Google Places