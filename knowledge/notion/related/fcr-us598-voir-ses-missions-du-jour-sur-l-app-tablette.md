---
notion_id: "3131d95b-2f8a-8110-9f94-efe5ea03c3c9"
notion_url: "https://www.notion.so/FCR-US598-Voir-ses-missions-du-jour-sur-l-app-tablette-3131d95b2f8a81109f94efe5ea03c3c9"
last_synced: "2026-03-26T12:56:46.418Z"
created: "2026-02-26T15:52:00.000Z"
last_edited: "2026-03-23T12:09:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "598"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Time spent: "0"
  Nom: "Voir ses missions du jour sur l'app tablette"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3131d95b-2f8a-8131-b48b-e85641cc8c31"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Status: "📋 Backlog"
  Builders: "Tony Pineiro"
  Date de création: "2026-02-26T15:52:00.000Z"
  Code: "FCR - US598 Voir ses missions du jour sur l'app tablette"
  Time Spent Activation: "Non"
---

# FCR - US598 Voir ses missions du jour sur l'app tablette

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 598 |
| Created by | Tony Pineiro |
| Priority | 🔴 P0 |
| Time spent | 0 |
| Pricing | 0 |
| Project | 3071d95b-2f8a-80ac-9db8-dc4e9d2196c9 |
| Epic | 3131d95b-2f8a-8131-b48b-e85641cc8c31 |
| Brique Fonctionnelle | 3131d95b-2f8a-81de-af8e-d782a1b05a0e |
| Status | 📋 Backlog |
| Builders | Tony Pineiro |
| Date de création | 2026-02-26T15:52:00.000Z |
| Code | FCR - US598 Voir ses missions du jour sur l'app tablette |
| Time Spent Activation | Non |


# User Story
**En tant que** technicien,
**je veux** voir mes missions du jour sur ma tablette,
**afin de** savoir où intervenir.

---


# Critères d'acceptation (Gherkin)
```javascript
Feature: Planning technicien tablette

  Scenario: Missions du jour
    Given Paul a 3 missions planifiées aujourd'hui
    When il ouvre l'app tablette
    Then il voit ses 3 missions avec : lot, adresse, heure début/fin, type EDL (entrée/sortie)

  Scenario: Détail d'une mission
    Given Paul consulte une mission
    Then il voit : adresse complète, nom locataire, type EDL/inventaire
    And un bouton "Démarrer l'EDL"

  Scenario: Technicien — visibilité restreinte aux missions assignées
    Given Sophie a 2 missions assignées
    When elle ouvre l'app
    Then elle voit uniquement les 2 missions qui lui sont assignées
    And aucun autre lot ou mission du workspace (scoping identique pour tous les techniciens)

  Scenario: Pas de mission aujourd'hui
    Given Paul n'a aucune mission ce jour
    When il ouvre l'app
    Then un message "Aucune mission planifiée aujourd'hui" s'affiche
    And il peut consulter les missions des jours suivants
```

---


# Règles métier
- L'app tablette affiche les missions du jour par défaut
- Le technicien peut naviguer jour par jour (J-1, J+1)
- Tous les techniciens ne voient que leurs missions assignées (scoping uniforme, pas de distinction interne/externe en V1)
- L'adresse affichée est l'adresse principale du bâtiment + étage/numéro du lot