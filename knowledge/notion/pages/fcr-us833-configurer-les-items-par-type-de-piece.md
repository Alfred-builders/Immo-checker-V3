---
notion_id: "3271d95b-2f8a-8151-87df-f7eac418165f"
notion_url: "https://www.notion.so/FCR-US833-Configurer-les-items-par-type-de-pi-ce-3271d95b2f8a815187dff7eac418165f"
last_synced: "2026-03-26T12:52:18.010Z"
created: "2026-03-18T14:42:00.000Z"
last_edited: "2026-03-23T12:44:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "833"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Sponsors: "clement.flatchecker@outlook.fr, Flat Checker "
  Time spent: "0"
  Nom: "Configurer les items par type de pièce"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3131d95b-2f8a-81c3-b92a-c62e50395681"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Status: "📌 Ready"
  Builders: "Tony Pineiro"
  Date de création: "2026-03-18T14:42:00.000Z"
  Code: "FCR - US833 Configurer les items par type de pièce"
  Time Spent Activation: "Non"
---

# FCR - US833 Configurer les items par type de pièce

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 833 |
| Created by | Tony Pineiro |
| Priority | 🔴 P0 |
| Sponsors | clement.flatchecker@outlook.fr, Flat Checker  |
| Time spent | 0 |
| Pricing | 0 |
| Project | 3071d95b-2f8a-80ac-9db8-dc4e9d2196c9 |
| Epic | 3131d95b-2f8a-81c3-b92a-c62e50395681 |
| Brique Fonctionnelle | 3131d95b-2f8a-81de-af8e-d782a1b05a0e |
| Status | 📌 Ready |
| Builders | Tony Pineiro |
| Date de création | 2026-03-18T14:42:00.000Z |
| Code | FCR - US833 Configurer les items par type de pièce |
| Time Spent Activation | Non |


# User Story
**En tant que** admin du workspace,
**je veux** configurer quels items apparaissent par défaut dans chaque type de pièce,
**afin que** les techniciens aient une pré-sélection pertinente sans configuration manuelle.

---


# Critères d'acceptation (Gherkin)
```gherkin
Feature: Configuration items par pièce

  Scenario: Voir les items d'un type de pièce
    Given l'admin ouvre le détail du type "Cuisine"
    Then il voit les items groupés par **onglets EDL | Inventaire** :
      EDL :
        | Catégorie      | Items                                    |
        | Revêtements    | Sol, Mur, Plafond, Plinthe               |
        | Menuiseries    | Porte, Fenêtre, Placards                 |
        | Plomberie      | Évier (+ sous-items)                     |
        | Cuisine        | Plan de travail, Crédence, Éléments bas… |
      Inventaire :
        | Catégorie      | Items                                    |
        | Électroménager | Réfrigérateur, Lave-vaisselle, Four…     |
        | Vaisselle      | Assiettes, Verres, Couverts…             |

  Scenario: Ajouter un item à la pièce
    Given l'admin clique "Ajouter un item" dans l'onglet EDL
    Then une modale s'ouvre avec le catalogue complet filtré par contexte EDL
    And il peut chercher et sélectionner un ou plusieurs items
    And les items ajoutés apparaissent dans le template de la pièce

  Scenario: Retirer un item de la pièce
    Given l'item "Cheminée" est dans le template Salon
    When l'admin clique sur le bouton de suppression
    Then l'item est retiré du template (mais reste dans le catalogue)

  Scenario: Quantité par défaut
    Given l'item "Mur" dans le template d'une pièce
    Then l'admin peut configurer la quantité par défaut (ex: 4)
    And cette quantité sera proposée au technicien comme nombre d'instances à créer

  Scenario: Labels par défaut (items avec qté > 1)
    Given l'item "Mur" dans le template Cuisine avec quantite_defaut = 4
    Then l'admin peut configurer des labels par défaut pour chaque instance :
      | Instance | Label par défaut |
      | 1        | Mur d'accès      |
      | 2        | Mur gauche       |
      | 3        | Mur droit        |
      | 4        | Mur de face      |
    And ces labels sont stockés dans `labels_defaut` (JSON array) sur TemplatePieceItem
    And si aucun label n'est défini, le système auto-numérote ("Mur 1", "Mur 2", etc.)
    And le technicien peut toujours renommer librement sur le terrain (cf EPIC 5, EvaluationItem.label)

  Scenario: Labels par défaut — quantité 1
    Given l'item "Sol" dans le template Cuisine avec quantite_defaut = 1
    Then le champ labels_defaut n'est pas affiché (inutile pour une seule instance)
```

---


# Modèle de données
- `TemplatePieceItem` : type_piece_id, catalogue_item_id, quantite_defaut, labels_defaut (JSON array, optionnel), ordre_affichage

---


# Règles métier
- Onglets EDL | Inventaire pour séparer visuellement (retour client 18/03/2026)
- La présence dans TemplatePieceItem = item pré-sélectionné
- Les items absents du template restent disponibles via le catalogue (bouton "+" sur la tablette)
- L'ordre d'affichage est configurable par drag & drop
- `labels_defaut` : tableau de libellés prédéfinis (ex : ["Mur d'accès","Mur gauche","Mur droit","Mur de face"]). Optionnel — si absent, auto-numérotation. La taille du tableau doit correspondre à `quantite_defaut`. Cf Spécification Items (section 2).