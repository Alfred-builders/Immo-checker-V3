---
notion_id: "3271d95b-2f8a-814d-b9a1-d7e8fedfd6ae"
notion_url: "https://www.notion.so/FCR-US834-Param-trer-les-crit-res-d-exigence-par-cat-gorie-d-items-3271d95b2f8a814db9a1d7e8fedfd6ae"
last_synced: "2026-03-26T12:56:22.131Z"
created: "2026-03-18T14:42:00.000Z"
last_edited: "2026-03-18T14:42:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "834"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Sponsors: "clement.flatchecker@outlook.fr, Flat Checker "
  Time spent: "0"
  Nom: "Paramétrer les critères d'exigence par catégorie d'items"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3131d95b-2f8a-81c3-b92a-c62e50395681"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Status: "📌 Ready"
  Builders: "Tony Pineiro"
  Date de création: "2026-03-18T14:42:00.000Z"
  Code: "FCR - US834 Paramétrer les critères d'exigence par catégorie d'items"
  Time Spent Activation: "Non"
---

# FCR - US834 Paramétrer les critères d'exigence par catégorie d'items

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 834 |
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
| Code | FCR - US834 Paramétrer les critères d'exigence par catégorie d'items |
| Time Spent Activation | Non |


# User Story
**En tant que** admin du workspace,
**je veux** configurer les niveaux d'exigence des critères par catégorie d'items,
**afin de** définir rapidement ce que les techniciens doivent remplir sans paramétrer item par item.

---


# Critères d'acceptation (Gherkin)
```gherkin
Feature: Paramétrage critères par catégorie

  Scenario: Vue matrice catégorie × critères
    Given l'admin accède à Paramètres > Paramétrage Critères
    Then il voit un onglet EDL | Inventaire
    And une matrice avec :
      - En lignes : les catégories (Revêtements, Menuiseries, Plomberie…)
      - En colonnes : les 8 critères paramétrables (État, Propreté, Photos, Caractéristiques, Couleur, Dégradations, Fonctionnement, Quantité)
    And chaque cellule est un NivPick (Masqué / Optionnel / Recommandé / Obligatoire)
    And le nombre d'overrides par catégorie est affiché

  Scenario: Modifier un critère au niveau catégorie
    Given la catégorie "Revêtements" avec État = Recommandé
    When l'admin change État en Obligatoire
    Then TOUS les items de la catégorie Revêtements héritent de État = Obligatoire
    And les items avec un override existant sur État ne sont PAS impactés

  Scenario: Drill-down vers les items d'une catégorie
    Given l'admin clique sur la ligne "Plomberie"
    Then il voit le profil par défaut de la catégorie (éditable)
    And en dessous, le tableau des items de cette catégorie :
      | Item    | État  | Propreté | Photos | Carac. | Couleur | Dégr. | Fonct. | Qté  |
      | Évier   | Rec.  | Rec.     | Rec.   | Rec.   | Masqué  | Rec.  | Masqué | Masqué |
      | Robinet | Opt.  | Opt.     | Opt.   | Opt.   | Masqué  | Opt.  | **Obl.**| Masqué |
    And les cellules avec override sont surlignées (fond jaune + point orange)
    And un bouton "Réinitialiser" par item permet de supprimer les overrides

  Scenario: Override item-level
    Given l'item "Robinet" dans la catégorie Plomberie
    When l'admin change Fonctionnement de Masqué à Obligatoire
    Then un override est créé pour cet item uniquement
    And la cellule est surlignée pour indiquer la différence avec le profil catégorie
    And si la catégorie change Fonctionnement plus tard, l'override persiste
```

---


# Modèle de données
- `ConfigCritereCategorie` : workspace_id, categorie (enum), + 8 colonnes critères (dénormalisé)
- `ConfigCritereItem` : workspace_id, catalogue_item_id, critere (enum 8 valeurs), niveau (enum 4 valeurs). Table sparse — seuls les overrides.

---


# Règles métier
- 8 critères paramétrables (observation retiré — toujours optionnel)
- 4 niveaux : Masqué / Optionnel / Recommandé / Obligatoire
- Le profil catégorie s'applique à tous les items de la catégorie par défaut
- Les overrides item persistent même si le profil catégorie change
- Un paramétrage par défaut Flat Checker est pré-configuré
- Accessible depuis Paramètres > Paramétrage Critères