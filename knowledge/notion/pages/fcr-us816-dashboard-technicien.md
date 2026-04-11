---
notion_id: "3271d95b-2f8a-8144-a9ad-ee462fed816b"
notion_url: "https://www.notion.so/FCR-US816-Dashboard-Technicien-3271d95b2f8a8144a9adee462fed816b"
last_synced: "2026-03-26T12:52:48.131Z"
created: "2026-03-18T09:28:00.000Z"
last_edited: "2026-03-19T17:22:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "816"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Sponsors: "clement.flatchecker@outlook.fr, Flat Checker "
  Time spent: "0"
  Nom: "Dashboard Technicien"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3131d95b-2f8a-81ad-a326-dea9c36ca6d6"
  Brique Fonctionnelle: "3131d95b-2f8a-8158-a7f1-e187fd1ba493"
  Status: "❓ À cadrer"
  Builders: "Tony Pineiro"
  Date de création: "2026-03-18T09:28:00.000Z"
  Code: "FCR - US816 Dashboard Technicien"
  Time Spent Activation: "Non"
---

# FCR - US816 Dashboard Technicien

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 816 |
| Created by | Tony Pineiro |
| Priority | 🔴 P0 |
| Sponsors | clement.flatchecker@outlook.fr, Flat Checker  |
| Time spent | 0 |
| Pricing | 0 |
| Project | 3071d95b-2f8a-80ac-9db8-dc4e9d2196c9 |
| Epic | 3131d95b-2f8a-81ad-a326-dea9c36ca6d6 |
| Brique Fonctionnelle | 3131d95b-2f8a-8158-a7f1-e187fd1ba493 |
| Status | ❓ À cadrer |
| Builders | Tony Pineiro |
| Date de création | 2026-03-18T09:28:00.000Z |
| Code | FCR - US816 Dashboard Technicien |
| Time Spent Activation | Non |

> ⚠️ **Note** : Le technicien n'a accès qu'à l'application mobile/tablette (pas d'interface desktop). Cette US décrit l'expérience sur l'app mobile. Décision validée meeting client 18/03/2026.

# User Story
**En tant que** technicien,
**je veux** un tableau de bord simplifié avec mes stats, mon calendrier et mes clés,
**afin de** préparer mes interventions du jour.

---


# Critères d'acceptation (Gherkin)
```gherkin
Feature: Dashboard Technicien

  Scenario: Stats personnelles
    Given un technicien connecté
    Then il voit :
      | Stat            | Calcul                              |
      | EDL Entrée      | COUNT(EDL entrée réalisés, total)   |
      | EDL Sortie      | COUNT(EDL sortie réalisés, total)   |
      | Total EDL       | Somme des deux                      |

  Scenario: Calendrier des missions
    Given un technicien avec 3 missions cette semaine
    Then un calendrier simplifié affiche ses missions personnelles

  Scenario: Checklist clés à déposer (V1 — sortie uniquement)
    Given un technicien ayant réalisé des EDL de sortie avec clés récupérées
    Then une checklist agrégée affiche les clés en statut "a_deposer" :
      | Mission   | Lot / Adresse           | Clé             | Quantité | Lieu de dépôt      |
      | M-2026-42 | Apt 2B, 12 rue Lilas    | Clé principale  | 2        | Agence Versailles  |
      | M-2026-42 | Apt 2B, 12 rue Lilas    | Badge parking   | 1        | Agence Versailles  |
      | M-2026-38 | Apt 4A, 8 rue Roses     | Clé principale  | 1        | Gardien            |
    And chaque ligne a un bouton "Déposée" pour confirmer le dépôt
    And les clés en statut "deposee" n'apparaissent plus dans la checklist
    And les clés d'EDL d'entrée ne sont PAS gérées en V1 (cf US-822)
```

---


# Modèle de données impacté
**Tables consultées** :
- `Mission` + `MissionTechnicien` (filtrées sur user courant)
- `EDL_Inventaire` — stats
- `CleMission` — checklist clés

---


# Règles métier
- Le technicien ne voit que SES missions
- Les stats sont cumulées depuis le début (pas réinitialisées chaque mois)
- La checklist clés affiche uniquement les clés en statut "a_deposer" (V1 = EDL de sortie uniquement, cf US-822)