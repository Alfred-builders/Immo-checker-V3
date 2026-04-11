---
notion_id: "3271d95b-2f8a-8185-a64b-c91517517ea8"
notion_url: "https://www.notion.so/FCR-US817-Colonnes-configurables-sur-tous-les-tableaux-3271d95b2f8a8185a64bc91517517ea8"
last_synced: "2026-03-26T12:57:06.514Z"
created: "2026-03-18T09:28:00.000Z"
last_edited: "2026-03-18T09:28:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "817"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Sponsors: "clement.flatchecker@outlook.fr, Flat Checker "
  Time spent: "0"
  Nom: "Colonnes configurables sur tous les tableaux"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3271d95b-2f8a-8198-928c-f11fa16a89de"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Status: "📌 Ready"
  Builders: "Tony Pineiro"
  Date de création: "2026-03-18T09:28:00.000Z"
  Code: "FCR - US817 Colonnes configurables sur tous les tableaux"
  Time Spent Activation: "Non"
---

# FCR - US817 Colonnes configurables sur tous les tableaux

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 817 |
| Created by | Tony Pineiro |
| Priority | 🔴 P0 |
| Sponsors | clement.flatchecker@outlook.fr, Flat Checker  |
| Time spent | 0 |
| Pricing | 0 |
| Project | 3071d95b-2f8a-80ac-9db8-dc4e9d2196c9 |
| Epic | 3271d95b-2f8a-8198-928c-f11fa16a89de |
| Brique Fonctionnelle | 3131d95b-2f8a-81de-af8e-d782a1b05a0e |
| Status | 📌 Ready |
| Builders | Tony Pineiro |
| Date de création | 2026-03-18T09:28:00.000Z |
| Code | FCR - US817 Colonnes configurables sur tous les tableaux |
| Time Spent Activation | Non |


# User Story
**En tant que** utilisateur,
**je veux** configurer les colonnes affichées dans chaque tableau,
**afin de** personnaliser ma vue selon mes besoins.

---


# Critères d'acceptation (Gherkin)
```gherkin
Feature: Colonnes configurables

  Scenario: Toggle colonnes
    Given un tableau (bâtiments, tiers, missions…)
    When l'utilisateur clique sur le bouton "Colonnes"
    Then un panneau s'ouvre avec la liste des colonnes disponibles
    And chaque colonne a un toggle on/off
    And les colonnes actives sont réordonnables par drag and drop

  Scenario: Persistence
    Given l'utilisateur masque la colonne "Email" dans la vue Tiers
    When il revient sur la page plus tard
    Then la colonne "Email" est toujours masquée

  Scenario: Réinitialisation
    Given l'utilisateur a personnalisé les colonnes
    When il clique sur "Réinitialiser"
    Then les colonnes par défaut du workspace sont restaurées
```

---


# Modèle de données impacté
- `UserPreference` : user_id, page, config JSON (colonnes visibles, ordre, largeurs)

---


# Règles métier
- Les préférences sont par utilisateur et par tableau
- Les colonnes par défaut sont définies par Flat Checker (niveau workspace)
- Composant partagé identique sur tous les tableaux de l'app