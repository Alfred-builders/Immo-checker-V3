---
notion_id: "3131d95b-2f8a-81c1-8265-e4dcc4094beb"
notion_url: "https://www.notion.so/FCR-US591-Lier-un-mandataire-de-gestion-un-lot-3131d95b2f8a81c18265e4dcc4094beb"
last_synced: "2026-03-26T12:55:31.313Z"
created: "2026-02-26T15:52:00.000Z"
last_edited: "2026-03-23T12:29:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "591"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Time spent: "0"
  Nom: "Lier un mandataire de gestion à un lot"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3131d95b-2f8a-8164-8e3e-e9fee9e70624"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Status: "📋 Backlog"
  Builders: "Tony Pineiro"
  Date de création: "2026-02-26T15:52:00.000Z"
  Code: "FCR - US591 Lier un mandataire de gestion à un lot"
  Time Spent Activation: "Non"
---

# FCR - US591 Lier un mandataire de gestion à un lot

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 591 |
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
| Code | FCR - US591 Lier un mandataire de gestion à un lot |
| Time Spent Activation | Non |


# User Story
**En tant que** gestionnaire,
**je veux** associer un mandataire de gestion à un lot,
**afin de** tracer quelle agence gère quel bien.

---


# Critères d'acceptation (Gherkin)
```javascript
Feature: Mandataire de gestion

  Scenario: Associer une agence comme mandataire
    Given un lot et un tiers "Agence Principale" (morale) existent
    When le gestionnaire définit Lot.mandataire_id = "Agence Principale"
    Then le lot est géré par cette agence

  Scenario: Lot sans mandataire (bailleur direct)
    Given un lot dans un workspace type "bailleur"
    When aucun mandataire n'est renseigné
    Then mandataire_id reste null
    And le workflow fonctionne normalement (bailleur = réalisateur)

  Scenario: Changement de mandataire
    Given un lot géré par "Agence A"
    When le gestionnaire change pour "Agence B"
    Then mandataire_id est mis à jour
    And les EDL futurs référencent "Agence B"
    And les EDL passés conservent leur mandataire d'origine

  Scenario: Filtrage par mandataire
    Given 10 lots gérés par "Agence A" et 5 par "Agence B"
    When le gestionnaire filtre par mandataire="Agence A"
    Then 10 lots apparaissent
```

---


# Règles métier
- Le mandataire est lié au **Lot** via FK directe (pas de pivot, relation 1-to-1)
- Optionnel : les bailleurs directs n'ont pas de mandataire
- Le mandataire du lot est hérité par défaut sur l'EDL (`EDL_Inventaire.mandataire_id` snapshoté à la création de l'EDL depuis `Lot.mandataire_id`). Si le mandataire du lot change après, les EDL passés conservent leur mandataire d'origine.
- Permet le filtrage par agence et prépare le portail agences futur