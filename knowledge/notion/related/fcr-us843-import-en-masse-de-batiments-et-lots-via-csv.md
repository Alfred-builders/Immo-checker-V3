---
notion_id: "3281d95b-2f8a-81de-9276-fb86d753fe8b"
notion_url: "https://www.notion.so/FCR-US843-Import-en-masse-de-b-timents-et-lots-via-CSV-3281d95b2f8a81de9276fb86d753fe8b"
last_synced: "2026-03-26T12:56:10.513Z"
created: "2026-03-19T16:05:00.000Z"
last_edited: "2026-03-19T16:43:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "843"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Sponsors: "clement.flatchecker@outlook.fr, Flat Checker "
  Time spent: "0"
  Nom: "Import en masse de bâtiments et lots via CSV"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3131d95b-2f8a-81f3-a317-c6756c9ae867"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Status: "📌 Ready"
  Builders: "Tony Pineiro"
  Date de création: "2026-03-19T16:05:00.000Z"
  Code: "FCR - US843 Import en masse de bâtiments et lots via CSV"
  Time Spent Activation: "Non"
---

# FCR - US843 Import en masse de bâtiments et lots via CSV

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 843 |
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
| Date de création | 2026-03-19T16:05:00.000Z |
| Code | FCR - US843 Import en masse de bâtiments et lots via CSV |
| Time Spent Activation | Non |


# User Story
**En tant que** admin ou gestionnaire,
**je veux** importer en masse des bâtiments et lots depuis un fichier CSV,
**afin de** constituer rapidement mon parc immobilier sans saisir chaque bien manuellement.

---


# Critères d'acceptation (Gherkin)
```gherkin
Feature: Import CSV bâtiments et lots

  # ──────────────────────────────────────
  # ÉTAPE 1 — UPLOAD DU FICHIER
  # ──────────────────────────────────────

  Scenario: Accès à l'import
    Given un admin ou gestionnaire sur la page Parc immobilier (US-586)
    Then un bouton "Importer (CSV)" est disponible dans les actions de la page
    When il clique sur le bouton
    Then une modale d'import s'ouvre

  Scenario: Upload du fichier CSV
    Given la modale d'import est ouverte
    Then l'utilisateur peut :
      | Action                  | Détail                                      |
      | Drag & drop             | Glisser un fichier .csv dans la zone        |
      | Sélection fichier       | Bouton "Parcourir" pour sélectionner un .csv |
    And les formats acceptés sont : .csv (séparateur virgule ou point-virgule, encodage UTF-8)
    And la taille max est : 5 Mo (environ 10 000 lignes)
    And un lien "Télécharger le template CSV" permet de récupérer un fichier modèle pré-rempli avec les en-têtes attendus et 2-3 lignes d'exemple

  # ──────────────────────────────────────
  # ÉTAPE 2 — MAPPING DES COLONNES
  # ──────────────────────────────────────

  Scenario: Interface de mapping
    Given un fichier CSV uploadé avec succès
    Then la modale affiche l'écran de mapping avec :
      | Élément                | Détail                                              |
      | Colonnes détectées     | Liste des en-têtes du CSV (colonne gauche)           |
      | Attributs cibles       | Dropdown avec les champs ImmoChecker (colonne droite)|
      | Aperçu                 | 3-5 premières lignes du CSV en prévisualisation      |
    And le système tente un auto-mapping intelligent (correspondance par nom de colonne)
    And l'utilisateur peut corriger manuellement chaque mapping
    And les champs obligatoires non mappés sont signalés en rouge
    And les colonnes du CSV non mappées sont ignorées (pas d'erreur)

  Scenario: Champs cibles disponibles pour le mapping
    Given l'écran de mapping
    Then les attributs cibles sont regroupés en 3 sections :

    # Bâtiment (dédupliqué par référence ou par adresse)
      | Attribut cible              | Obligatoire | Type          | Notes                                            |
      | Référence bâtiment          | Non*        | Texte         | Identifiant libre (ex: ref client, code interne). Sert de clé de liaison lot → bâtiment si fourni. |
      | Désignation bâtiment        | Non         | Texte         | Si absent, généré depuis l'adresse ("12 rue des Lilas") |
      | Rue                         | Oui         | Texte         | Ex: "12 rue des Lilas"                           |
      | Code postal                 | Oui         | Texte         | Ex: "75011"                                      |
      | Ville                       | Oui         | Texte         | Ex: "Paris"                                      |
      | Complément adresse          | Non         | Texte         | Ex: "Bât. C, escalier 3"                         |
      | Type bâtiment               | Non         | Enum          | immeuble / maison / local_commercial / mixte. Défaut: immeuble |
      | Numéro bâtiment             | Non         | Texte         | Ex: "A", "B"                                     |
      | Nombre d'étages             | Non         | Nombre        |                                                  |
      | Année construction          | Non         | Nombre        |                                                  |
    And *la référence bâtiment est obligatoire si le CSV contient uniquement des lots (sans données bâtiment) ou si plusieurs bâtiments ont la même adresse

    # Lot (1 ligne CSV = 1 lot, obligatoirement lié à un bâtiment)
      | Attribut cible              | Obligatoire | Type          | Notes                                            |
      | Désignation lot             | Oui         | Texte         | Ex: "Apt 2B"                                     |
      | Référence bâtiment (liaison) | Oui*        | Texte         | Référence du bâtiment auquel rattacher ce lot. Matché par : 1) référence bâtiment (si fournie) 2) adresse (rue+CP+ville) |
    And *si les données bâtiment sont sur la même ligne CSV que le lot (fichier "flat"), le champ référence bâtiment n'est pas nécessaire — le lot est rattaché au bâtiment via l'adresse de la même ligne
      | Type de bien                | Non         | Enum          | appartement / maison / studio / local_commercial / box_parking / cave. Défaut: appartement |
      | Étage                       | Non         | Texte         | Ex: "RDC", "3ème", "SS"                          |
      | Emplacement palier          | Non         | Texte         | Ex: "Porte de gauche"                            |
      | Surface (m²)                | Non         | Nombre        |                                                  |
      | Nombre de pièces            | Non         | Nombre        |                                                  |
      | Meublé                      | Non         | Oui/Non       | Défaut: Non                                      |
      | DPE                         | Non         | Enum (A-G)    |                                                  |
      | Référence libre             | Non         | Texte         | Ex: numéro de bail, réf cadastrale               |
      | N° Cave                     | Non         | Texte         |                                                  |
      | N° Parking                  | Non         | Texte         |                                                  |
      | Commentaire lot             | Non         | Texte         |                                                  |

    # ⚠️ Pas de tiers dans cet import
    And l'import ne couvre PAS les tiers (propriétaires, mandataires, locataires)
    And les tiers sont liés manuellement après import via les fiches lot (US-609)
    And un import tiers séparé pourra être envisagé en V2 avec clé unique (email ou SIRET)

  Scenario: Validation du mapping
    Given l'écran de mapping complété
    When l'utilisateur clique "Valider le mapping"
    Then le système vérifie :
      | Vérification                       | Résultat si KO                              |
      | Adresse structurée mappée (rue+CP+ville) | Erreur bloquante : "Champ obligatoire"  |
      | Désignation lot mappée             | Erreur bloquante : "Champ obligatoire"       |
      | Chaque lot lié à un bâtiment      | Erreur bloquante si aucun bâtiment identifiable (ni réf, ni adresse) |
      | Valeurs enum reconnues             | Warning : "X lignes avec valeurs non reconnues" |
      | Doublons potentiels (même adresse + même lot) | Warning : "X doublons détectés"    |
    And si pas d'erreur bloquante, le bouton "Lancer l'import" est activé

  # ──────────────────────────────────────
  # ÉTAPE 3 — EXÉCUTION DE L'IMPORT
  # ──────────────────────────────────────

  Scenario: Dédoublonnage des bâtiments par adresse
    Given un CSV avec 10 lots dont 5 ont la même adresse (rue+CP+ville)
    When l'import est lancé
    Then 1 seul bâtiment est créé pour cette adresse
    And les 5 lots sont rattachés à ce bâtiment
    And si un bâtiment avec cette adresse existe déjà dans le workspace, les lots sont rattachés au bâtiment existant (pas de doublon)

  Scenario: Dédoublonnage des bâtiments par référence
    Given un CSV avec une colonne "Référence bâtiment" renseignée
    Then les lots avec la même référence bâtiment sont regroupés sous le même bâtiment
    And la référence prime sur l'adresse en cas de conflit

  Scenario: Lot sans bâtiment identifiable
    Given un CSV avec un lot dont ni la référence bâtiment ni l'adresse ne sont renseignées
    Then cette ligne est en erreur : "Impossible de rattacher le lot à un bâtiment"
    And le lot n'est PAS importé

  Scenario: Exécution de l'import
    Given le mapping est validé et l'utilisateur a cliqué "Lancer l'import"
    Then un indicateur de progression est affiché (barre de progression ou pourcentage)
    And pour chaque ligne du CSV :
      1. Identifier le bâtiment : par référence (si fournie) ou par adresse (rue+CP+ville)
      2. Chercher un bâtiment existant dans le workspace avec ce critère
      3. Si non trouvé → créer le bâtiment avec les infos mappées
      4. Créer le lot rattaché au bâtiment
      5. Géocoder l'adresse (rue+CP+ville) via Google Geocoding API pour stocker lat/lng
    And l'import est transactionnel par ligne (une erreur sur la ligne 42 n'annule pas les lignes 1-41)

  # ──────────────────────────────────────
  # ÉTAPE 4 — RAPPORT D'IMPORT (bonus)
  # ──────────────────────────────────────

  Scenario: Rapport d'import après exécution
    Given l'import est terminé
    Then un rapport s'affiche dans la modale avec :
      | Donnée                          | Exemple                                |
      | Total lignes traitées           | 150                                    |
      | Bâtiments créés                 | 12                                     |
      | Bâtiments existants réutilisés  | 3                                      |
      | Lots créés                      | 148                                    |

      | Erreurs                         | 2                                      |
      | Warnings                        | 8                                      |
    And un tableau des erreurs/warnings est affiché :
      | Ligne | Erreur / Warning                                          |
      | 42    | Erreur : Désignation lot manquante                        |
      | 103   | Warning : Type de bien "T3" non reconnu → défaut appliqué |
      | 78    | Warning : Géocodage échoué pour "12 impasse des...", coordonnées manquantes |
    And un bouton "Télécharger le rapport (CSV)" permet d'exporter les erreurs
    And un bouton "Fermer" ferme la modale et rafraîchit le tableau parc immobilier
```

---


# Modèle de données impacté
**Tables créées/modifiées** :
- `Batiment` — création (dédupliqué par adresse dans le workspace)
- `AdresseBatiment` — création de l'adresse principale par bâtiment
- `Lot` — création (1 ligne CSV = 1 lot)
- `LotProprietaire` — liaison si propriétaire trouvé par matching nom
- `Lot.mandataire_id` — liaison si mandataire trouvé par matching nom
**Géocodage** : L'adresse importée n'est PAS géocodée automatiquement via Google Places (pas de latitude/longitude). Le bâtiment importé n'apparaîtra pas sur la vue carte tant que l'adresse n'est pas mise à jour manuellement (via la fiche bâtiment US-610 avec l'autocomplete Google Places). Une amélioration V2 pourrait géocoder en batch après import.

---


# Règles métier
- **1 ligne CSV = 1 lot** obligatoirement rattaché à un bâtiment. Un lot sans bâtiment identifiable est rejeté.
- **Adresse structurée** : rue + code postal + ville (3 colonnes). Pas d'adresse en un seul bloc — nécessaire pour un géocodage fiable.
- **Dédoublonnage bâtiment** : par référence (prioritaire si fournie) ou par adresse normalisée (minuscules, sans espaces superflus). Si un bâtiment existe déjà → les lots sont rattachés à l'existant.
- **Référence bâtiment** : clé de liaison libre (code client, ref interne). Stockée dans Batiment pour réutilisation. Indispensable si plusieurs bâtiments à la même adresse.
- **Champs obligatoires** : rue + CP + ville (bâtiment) + désignation (lot). Tout le reste est optionnel avec des valeurs par défaut.
- **PAS de tiers dans cet import** : les propriétaires, mandataires et locataires sont liés manuellement après import. Le matching par nom est trop risqué (homonymes, casse, accents). Un import tiers séparé avec clé unique (email ou SIRET) pourra être envisagé en V2.
- **Géocodage automatique** : l'adresse structurée (rue+CP+ville) est géocodable via Google Geocoding API. Tenté à l'import. Non bloquant si échec (warning dans le rapport).
- **Valeurs enum non reconnues** : ignorées avec un warning (la valeur par défaut est appliquée).
- **Import transactionnel par ligne** : une erreur sur une ligne n'annule pas les autres.
- **Template CSV** : un fichier modèle téléchargeable avec les en-têtes et quelques lignes d'exemple aide l'utilisateur à formater son fichier.
- **Accessible aux admin et gestionnaires uniquement.**
- **Rapport d'erreur** : fonctionnalité bonus (nice to have), peut être simplifié en V1 à un simple compteur succès/échecs.

---


# Décisions
- **19/03/2026** : Création de l'US. Le rapport d'erreur détaillé est un bonus — en V1 un compteur succès/erreurs suffit.
- **19/03/2026** : Adresse structurée (rue + CP + ville en 3 colonnes) au lieu d'un seul champ — nécessaire pour un géocodage fiable.
- **19/03/2026** : Ajout référence libre sur le bâtiment comme clé de liaison lot → bâtiment (complète le matching par adresse).
- **19/03/2026** : Retrait de l'import tiers (propriétaires/mandataires) — matching par nom trop risqué (homonymes). Les tiers sont liés manuellement après import. V2 envisageable avec clé unique (email/SIRET).
- **19/03/2026** : Géocodage automatique via Google Geocoding API sur l'adresse structurée (non bloquant si échec).