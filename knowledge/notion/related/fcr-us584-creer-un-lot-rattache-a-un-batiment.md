---
notion_id: "3131d95b-2f8a-81e2-ab85-eff84eb43c2c"
notion_url: "https://www.notion.so/FCR-US584-Cr-er-un-lot-rattach-un-b-timent-3131d95b2f8a81e2ab85eff84eb43c2c"
last_synced: "2026-03-26T12:55:16.228Z"
created: "2026-02-26T15:50:00.000Z"
last_edited: "2026-03-18T14:36:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "584"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Time spent: "0"
  Nom: "Créer un lot rattaché à un bâtiment"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3131d95b-2f8a-81f3-a317-c6756c9ae867"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Status: "📌 Ready"
  Builders: "Tony Pineiro"
  Date de création: "2026-02-26T15:50:00.000Z"
  Code: "FCR - US584 Créer un lot rattaché à un bâtiment"
  Time Spent Activation: "Non"
---

# FCR - US584 Créer un lot rattaché à un bâtiment

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 584 |
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
| Code | FCR - US584 Créer un lot rattaché à un bâtiment |
| Time Spent Activation | Non |


# User Story
**En tant que** gestionnaire ou admin,
**je veux** créer un lot rattaché à un bâtiment,
**afin de** pouvoir y planifier des EDL et inventaires.

---


# Critères d'acceptation (Gherkin)
```gherkin
Feature: Création d'un lot

  Scenario: Formulaire de création
    Given un admin/gestionnaire ouvre le formulaire "Nouveau lot"
    Then le formulaire modal affiche les champs :
      | Champ               | Type                                          | Obligatoire |
      | Bâtiment            | Record picker (désignation + adresse)         | Oui         |
      | Désignation         | Texte (Apt 3B, Maison Dupont…)                | Oui         |
      | Référence libre     | Texte (n° bail, réf cadastrale…)              | Non         |
      | Type de bien        | Enum + icône                                  | Oui         |
      | Étage               | Texte libre (RDC, 3ème, SS-1…)                | Non         |
      | Emplacement palier  | Texte (porte gauche, droite…)                 | Non         |
      | Surface (m²)        | Nombre                                        | Non         |
      | Nb pièces           | Nombre                                        | Non         |
      | Meublé              | Toggle oui/non                                | Non (défaut: Non) |
      | DPE                 | Enum (A-G)                                    | Non         |
      | N° Cave             | Texte                                         | Non         |
      | N° Parking          | Texte                                         | Non         |
      | Commentaire         | Texte long                                    | Non         |

  Scenario: Record picker bâtiment
    Given le champ Bâtiment
    When le gestionnaire tape "Tilleuls"
    Then la dropdown affiche les bâtiments matchants :
      | Désignation              | Adresse                      |
      | Résidence Les Tilleuls   | 12 rue des Lilas, 75011      |
    And un bouton "Créer un bâtiment" est disponible en bas

  Scenario: Création depuis la fiche bâtiment
    Given le gestionnaire est sur la fiche d'un bâtiment
    When il clique "Ajouter un lot"
    Then le formulaire s'ouvre avec le bâtiment pré-rempli et non modifiable

  Scenario: Raccourci "Nouvelle maison" (suite)
    Given un bâtiment de type "maison" vient d'être créé via le raccourci
    Then le formulaire lot s'ouvre avec :
      - Bâtiment = pré-rempli (la maison créée)
      - Type de bien = pré-rempli "maison"

  Scenario: Validation
    Given un formulaire sans désignation ni type de bien
    When le gestionnaire soumet
    Then les champs obligatoires sont encadrés en rouge

  Scenario: Permissions
    Given un technicien connecté
    Then le bouton "Nouveau lot" n'est pas visible
```

---


# Modèle de données impacté
**Table créée** : `Lot`
- batiment_id (FK), designation (requis), reference_libre, type_bien (enum + icône), etage, emplacement_palier, surface, nb_pieces, est_meuble, DPE, num_cave, num_parking, commentaire, mandataire_id (FK → Tiers, optionnel), est_archive, created_at, updated_at

---


# Règles métier
- Un lot appartient à un seul bâtiment (non modifiable après création)
- L'étage est texte libre ("RDC", "3ème", "SS-1")
- Le mandataire est optionnel (ajouté ensuite depuis la fiche lot, pas dans le formulaire de création)
- Les propriétaires sont liés via pivot `LotProprietaire` (depuis la fiche lot, pas dans le formulaire)
- Les compteurs sont ajoutés depuis la fiche lot (section Compteurs), pas dans le formulaire de création
- Accessible depuis : page Parc > bouton "Nouveau lot", fiche bâtiment > "Ajouter un lot", record picker lot (formulaire mission)