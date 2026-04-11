---
notion_id: "3131d95b-2f8a-81a5-adb1-c98b216d60b6"
notion_url: "https://www.notion.so/FCR-US589-Associer-une-personne-physique-une-personne-morale-via-TiersOrganisation-3131d95b2f8a81a5adb1c98b216d60b6"
last_synced: "2026-03-26T12:55:27.429Z"
created: "2026-02-26T15:52:00.000Z"
last_edited: "2026-03-17T17:11:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "589"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Time spent: "0"
  Nom: "Associer une personne physique à une personne morale via TiersOrganisation"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3131d95b-2f8a-8164-8e3e-e9fee9e70624"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Status: "📋 Backlog"
  Builders: "Tony Pineiro"
  Date de création: "2026-02-26T15:52:00.000Z"
  Code: "FCR - US589 Associer une personne physique à une personne morale via TiersOrganisation"
  Time Spent Activation: "Non"
---

# FCR - US589 Associer une personne physique à une personne morale via TiersOrganisation

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 589 |
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
| Code | FCR - US589 Associer une personne physique à une personne morale via TiersOrganisation |
| Time Spent Activation | Non |


# User Story
**En tant que** gestionnaire,
**je veux** rattacher un contact à une organisation,
**afin de** savoir qui contacter chez une agence ou une SCI.

---


# Critères d'acceptation (Gherkin)
```javascript
Feature: Liaison contact ↔ organisation

  Scenario: Rattacher un contact à une agence
    Given un tiers "Marie" (physique) et un tiers "Agence Versailles" (morale) existent
    When le gestionnaire lie Marie à Agence Versailles avec fonction="gestionnaire locatif"
    Then une entrée TiersOrganisation est créée

  Scenario: Contact principal
    Given Marie et Sophie sont liées à "Agence Versailles"
    When le gestionnaire définit Marie comme contact principal
    Then Marie a est_principal=true
    And Sophie a est_principal=false

  Scenario: Contact multi-organisations
    Given Jean est agent indépendant
    When il est lié à "Agence Versailles" ET "Cabinet Martin"
    Then Jean a 2 entrées TiersOrganisation avec fonctions différentes

  Scenario: Voir les contacts d'une organisation
    Given "Agence Versailles" a 3 contacts
    When le gestionnaire consulte la fiche de l'agence
    Then il voit la liste des 3 contacts avec leurs fonctions
    And le contact principal est mis en évidence
```

---


# Modèle de données impacté
**Table pivot** : `TiersOrganisation`
- `tiers_id` (FK → Tiers, physique)
- `organisation_id` (FK → Tiers, morale)
- `fonction` (string: gérant, gestionnaire locatif, comptable...)
- `est_principal` (bool, default false)

---


# Règles métier
- Lien many-to-many : 1 contact → N organisations
- Seuls les tiers physiques peuvent être liés à des organisations
- Seuls les tiers moraux peuvent être une organisation
- Un seul contact principal par organisation