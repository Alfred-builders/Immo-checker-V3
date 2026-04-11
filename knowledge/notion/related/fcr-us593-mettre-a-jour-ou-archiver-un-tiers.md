---
notion_id: "3131d95b-2f8a-818c-ba3f-c94c9767c22d"
notion_url: "https://www.notion.so/FCR-US593-Mettre-jour-ou-archiver-un-tiers-3131d95b2f8a818cba3fc94c9767c22d"
last_synced: "2026-03-26T12:55:34.741Z"
created: "2026-02-26T15:52:00.000Z"
last_edited: "2026-03-23T12:29:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "593"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Time spent: "0"
  Nom: "Mettre à jour ou archiver un tiers"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3131d95b-2f8a-8164-8e3e-e9fee9e70624"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Status: "📌 Ready"
  Builders: "Tony Pineiro"
  Date de création: "2026-02-26T15:52:00.000Z"
  Code: "FCR - US593 Mettre à jour ou archiver un tiers"
  Time Spent Activation: "Non"
---

# FCR - US593 Mettre à jour ou archiver un tiers

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 593 |
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
| Code | FCR - US593 Mettre à jour ou archiver un tiers |
| Time Spent Activation | Non |


# User Story
**En tant que** gestionnaire ou admin,
**je veux** modifier les informations d'un tiers ou l'archiver,
**afin de** maintenir un référentiel de contacts à jour.

---


# Critères d'acceptation (Gherkin)
```gherkin
Feature: Modification et archivage d'un tiers

  Scenario: Modification depuis la fiche détail
    Given la fiche détail d'un tiers "Pierre Leroy" (PP)
    When le gestionnaire modifie le téléphone
    Then la modification est enregistrée (édition in-page)
    And les champs affichés restent adaptés au type_personne

  Scenario: Champs non modifiables
    Given un tiers créé en tant que PP
    Then le type_personne (PP/PM) n'est PAS modifiable après création

  Scenario: Archivage d'un tiers sans EDL actif
    Given un tiers sans EDL en statut "brouillon"
    When l'admin clique "Archiver"
    Then est_archive = true
    And le tiers disparaît des listes et pickers par défaut

  Scenario: Archivage bloqué — EDL actif
    Given un tiers lié à un EDL en statut "brouillon"
    Then l'archivage est bloqué avec message : "Ce tiers est lié à X EDL en cours"

  Scenario: Archivage bloqué — missions actives
    Given un tiers propriétaire d'un lot avec une mission en statut "planifiee" ou "assignee"
    Then l'archivage est bloqué avec message : "Ce tiers est propriétaire d'un lot avec X missions actives"
    And même logique si le tiers est mandataire d'un lot avec missions actives

  Scenario: Pas de suppression
    Then aucun bouton "Supprimer" — uniquement "Archiver"
```

---


# Règles métier
- Édition in-page sur la fiche détail (même pattern que fiche lot)
- Le type_personne n'est pas modifiable (PP reste PP, PM reste PM)
- Soft delete via `est_archive` (réversible)
- Un tiers archivé est exclu des pickers et listes par défaut
- Un tiers ne peut pas être archivé s'il a des **EDL actifs** (brouillon) ou des **missions actives** (planifiée/assignée) sur ses lots (en tant que propriétaire, locataire, ou mandataire)
- Accessible admin et gestionnaires