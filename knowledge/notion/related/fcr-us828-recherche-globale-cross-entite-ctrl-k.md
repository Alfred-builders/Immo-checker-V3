---
notion_id: "3271d95b-2f8a-8182-8a6e-f425ed4487ee"
notion_url: "https://www.notion.so/FCR-US828-Recherche-globale-cross-entit-Ctrl-K-3271d95b2f8a81828a6ef425ed4487ee"
last_synced: "2026-03-26T12:57:11.769Z"
created: "2026-03-18T14:33:00.000Z"
last_edited: "2026-03-18T14:33:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "828"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Sponsors: "clement.flatchecker@outlook.fr, Flat Checker "
  Time spent: "0"
  Nom: "Recherche globale cross-entité (Ctrl+K)"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3271d95b-2f8a-8198-928c-f11fa16a89de"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Status: "📌 Ready"
  Builders: "Tony Pineiro"
  Date de création: "2026-03-18T14:33:00.000Z"
  Code: "FCR - US828 Recherche globale cross-entité (Ctrl+K)"
  Time Spent Activation: "Non"
---

# FCR - US828 Recherche globale cross-entité (Ctrl+K)

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 828 |
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
| Date de création | 2026-03-18T14:33:00.000Z |
| Code | FCR - US828 Recherche globale cross-entité (Ctrl+K) |
| Time Spent Activation | Non |


# User Story
**En tant que** admin ou gestionnaire,
**je veux** rechercher n'importe quel objet via Ctrl+K,
**afin de** naviguer rapidement.

---


# Critères d'acceptation (Gherkin)
```gherkin
Feature: Recherche globale

  Scenario: Résultats catégorisés
    Given l'utilisateur tape "Tilleuls"
    Then résultats groupés : Bâtiment | Lot | Tiers | Mission
    And max 5 résultats par catégorie
    And chaque résultat cliquable vers sa fiche

  Scenario: Recherche par nom de tiers
    Given tape "Leroy"
    Then trouve le tiers + les lots liés + les missions liées
```

# Règles métier
- Couvre : bâtiments, lots, tiers, missions
- Résultats en temps réel (debounce 300ms)
- Ctrl+K / Cmd+K pour ouvrir, Echap pour fermer