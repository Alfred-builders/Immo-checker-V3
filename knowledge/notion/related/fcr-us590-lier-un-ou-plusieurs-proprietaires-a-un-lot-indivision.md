---
notion_id: "3131d95b-2f8a-8147-a839-e2f001f8920a"
notion_url: "https://www.notion.so/FCR-US590-Lier-un-ou-plusieurs-propri-taires-un-lot-indivision-3131d95b2f8a8147a839e2f001f8920a"
last_synced: "2026-03-26T12:55:28.760Z"
created: "2026-02-26T15:52:00.000Z"
last_edited: "2026-03-17T17:10:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "590"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Time spent: "0"
  Nom: "Lier un ou plusieurs propriétaires à un lot (indivision)"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3131d95b-2f8a-8164-8e3e-e9fee9e70624"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Status: "📋 Backlog"
  Builders: "Tony Pineiro"
  Date de création: "2026-02-26T15:52:00.000Z"
  Code: "FCR - US590 Lier un ou plusieurs propriétaires à un lot (indivision)"
  Time Spent Activation: "Non"
---

# FCR - US590 Lier un ou plusieurs propriétaires à un lot (indivision)

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 590 |
| Created by | Tony Pineiro |
| Priority | 🔴 P0 |
| Time spent | 0 |
| Pricing | 0 |
| Project | 3071d95b-2f8a-80ac-9db8-dc4e9d2196c9 |
| Epic | 3131d95b-2f8a-8164-8e3e-e9fee9e70624 |
| Brique Fonctionnelle | 3131d95b-2f8a-81de-af8e-d782a1b05a0e |
| Status | 📋 Backlog |
| Builders | Tony Pineiro |
| Date de création | 2026-02-26T15:52:00.000Z |
| Code | FCR - US590 Lier un ou plusieurs propriétaires à un lot (indivision) |
| Time Spent Activation | Non |


# User Story
**En tant que** gestionnaire,
**je veux** associer un ou plusieurs propriétaires à un lot,
**afin de** documenter qui détient le bien.

---


# Critères d'acceptation (Gherkin)
```javascript
Feature: Association propriétaire → lot

  Scenario: Un seul propriétaire
    Given un lot et un tiers "Jean Dupont" existent
    When le gestionnaire associe Jean comme propriétaire
    Then une entrée LotProprietaire est créée avec est_principal=true

  Scenario: Indivision (plusieurs propriétaires)
    Given un lot et tiers "Jean" et "Marie" existent
    When le gestionnaire associe les 2 comme co-propriétaires
    Then 2 entrées LotProprietaire sont créées
    And un des deux est marqué est_principal=true

  Scenario: SCI propriétaire
    Given un tiers morale "SCI Les Tilleuls" existe
    When le gestionnaire l'associe comme propriétaire d'un lot
    Then une LotProprietaire est créée
    And le représentant légal est accessible via TiersOrganisation

  Scenario: Affichage sur la fiche lot
    Given un lot avec 2 propriétaires
    When le gestionnaire consulte la fiche lot
    Then il voit les 2 propriétaires avec indication du principal
```

---


# Modèle de données impacté
**Table pivot** : `LotProprietaire`
- `lot_id` (FK → Lot), `tiers_id` (FK → Tiers), `est_principal` (bool)

---


# Règles métier
- Le propriétaire est lié au **Lot** (pas au bâtiment)
- Supporte l'indivision (N propriétaires pour 1 lot)
- Un propriétaire peut être physique ou morale
- Le propriétaire principal apparaît en premier sur le PDF de l'EDL