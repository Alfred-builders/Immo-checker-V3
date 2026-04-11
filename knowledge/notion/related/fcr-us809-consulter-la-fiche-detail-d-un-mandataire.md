---
notion_id: "3271d95b-2f8a-8198-bcc5-f715bb023475"
notion_url: "https://www.notion.so/FCR-US809-Consulter-la-fiche-d-tail-d-un-mandataire-3271d95b2f8a8198bcc5f715bb023475"
last_synced: "2026-03-26T12:56:19.761Z"
created: "2026-03-18T09:26:00.000Z"
last_edited: "2026-03-23T12:28:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "809"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Sponsors: "clement.flatchecker@outlook.fr, Flat Checker "
  Time spent: "0"
  Nom: "Consulter la fiche détail d'un mandataire"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3131d95b-2f8a-8164-8e3e-e9fee9e70624"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Status: "📌 Ready"
  Builders: "Tony Pineiro"
  Date de création: "2026-03-18T09:26:00.000Z"
  Code: "FCR - US809 Consulter la fiche détail d'un mandataire"
  Time Spent Activation: "Non"
---

# FCR - US809 Consulter la fiche détail d'un mandataire

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 809 |
| Created by | Tony Pineiro |
| Priority | 🔴 P0 |
| Sponsors | clement.flatchecker@outlook.fr, Flat Checker  |
| Time spent | 0 |
| Pricing | 0 |
| Project | 3071d95b-2f8a-80ac-9db8-dc4e9d2196c9 |
| Epic | 3131d95b-2f8a-8164-8e3e-e9fee9e70624 |
| Brique Fonctionnelle | 3131d95b-2f8a-81de-af8e-d782a1b05a0e |
| Status | 📌 Ready |
| Builders | Tony Pineiro |
| Date de création | 2026-03-18T09:26:00.000Z |
| Code | FCR - US809 Consulter la fiche détail d'un mandataire |
| Time Spent Activation | Non |


# User Story
**En tant que** gestionnaire ou admin,
**je veux** consulter la fiche complète d'un mandataire de gestion,
**afin de** voir les lots en gestion et les missions associées.

---


# Critères d'acceptation (Gherkin)
```gherkin
Feature: Fiche détail mandataire

  Scenario: Informations et lots en gestion
    Given un mandataire "Agence Principale" avec 15 lots en gestion
    When le gestionnaire ouvre la fiche
    Then il voit la raison sociale, SIRET, adresse
    And une section "Lots en gestion" liste les lots :
      | Lot    | Bâtiment              | Propriétaire  | Locataire actuel |
      | Apt 2B | Résidence Les Tilleuls| Pierre Leroy  | Marie Martin     |

  Scenario: Missions liées aux lots en gestion
    Given un mandataire avec des lots ayant des missions
    When le gestionnaire consulte la section "Missions"
    Then il voit les missions de tous les lots gérés par ce mandataire :
      | Mission   | Lot    | Propriétaire | Date       | Type   | Statut    | Technicien    |
      | M-2026-42 | Apt 2B | Pierre Leroy| 15/03/2026 | Sortie | Planifiée | Jean Dupont   |
    And chaque mission est cliquable vers sa fiche détail (US-811)
    And utile pour FC pour voir l'activité par agence

  Scenario: Contacts du mandataire
    Given un mandataire de type personne morale
    When le gestionnaire consulte la section "Contacts"
    Then il voit les contacts via TiersOrganisation :
      | Contact       | Fonction          | Téléphone      | Principal |
      | Julie Moreau  | Gestionnaire      | 01 23 45 67 89 | ✅        |
```

---


# Modèle de données impacté
**Tables consultées** :
- `Tiers` — base mandataire
- `Lot` (WHERE `mandataire_id` = tiers) → `Batiment` — lots en gestion
- `TiersOrganisation` — contacts

---


# Règles métier
- **Pattern d'édition** : CTA "Modifier" → édition inline → "Enregistrer" / "Annuler". Lecture par défaut. Le layout ne change pas entre les deux modes — les valeurs texte deviennent simplement des inputs éditables au même emplacement (bordure/fond léger). Si l'utilisateur quitte avec des modifications non sauvegardées, une modale propose "Enregistrer et quitter" / "Quitter sans sauvegarder". Pattern identique sur toutes les fiches détail (cf US-610).
- Visible uniquement pour les workspaces de type "societe_edl"
- **Missions** : affiche les missions des lots en gestion (join Lot.mandataire_id → Mission via lot_id). Utile pour voir l'activité par agence.
- Si le tiers est aussi propriétaire ou locataire (multi-rôle), les sections correspondantes apparaissent également