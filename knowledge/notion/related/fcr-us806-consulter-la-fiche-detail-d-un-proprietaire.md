---
notion_id: "3271d95b-2f8a-8122-8227-ea55dd998f42"
notion_url: "https://www.notion.so/FCR-US806-Consulter-la-fiche-d-tail-d-un-propri-taire-3271d95b2f8a81228227ea55dd998f42"
last_synced: "2026-03-26T12:56:11.789Z"
created: "2026-03-18T09:25:00.000Z"
last_edited: "2026-03-23T12:28:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "806"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Sponsors: "clement.flatchecker@outlook.fr, Flat Checker "
  Time spent: "0"
  Nom: "Consulter la fiche détail d'un propriétaire"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3131d95b-2f8a-8164-8e3e-e9fee9e70624"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Status: "📌 Ready"
  Builders: "Tony Pineiro"
  Date de création: "2026-03-18T09:25:00.000Z"
  Code: "FCR - US806 Consulter la fiche détail d'un propriétaire"
  Time Spent Activation: "Non"
---

# FCR - US806 Consulter la fiche détail d'un propriétaire

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 806 |
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
| Date de création | 2026-03-18T09:25:00.000Z |
| Code | FCR - US806 Consulter la fiche détail d'un propriétaire |
| Time Spent Activation | Non |


# User Story
**En tant que** gestionnaire ou admin,
**je veux** consulter la fiche complète d'un propriétaire,
**afin de** voir ses lots, ses missions associées et ses informations de contact.

---


# Critères d'acceptation (Gherkin)
```gherkin
Feature: Fiche détail propriétaire

  Scenario: Affichage des informations de base
    Given un tiers "Pierre Leroy" de type personne physique, rôle propriétaire
    When le gestionnaire ouvre la fiche
    Then il voit :
      | Champ          | Valeur                    |
      | Nom            | Leroy                     |
      | Prénom         | Pierre                    |
      | Email          | pierre.leroy@email.com    |
      | Téléphone      | 06 12 34 56 78            |
      | Adresse        | 5 rue Victor Hugo, Paris  |

  Scenario: Lots possédés
    Given un propriétaire avec 3 lots
    When le gestionnaire consulte la section "Lots"
    Then il voit :
      | Lot    | Bâtiment              | Adresse               | Dernier locataire (EDL) | Dernière mission |
      | Apt 2B | Résidence Les Tilleuls| 12 rue des Lilas      | Marie Martin            | 15/03/2026      |
      | Apt 4A | Résidence Les Tilleuls| 12 rue des Lilas      | —                       | 01/06/2025      |
      | Maison | —                     | 8 rue des Roses       | Paul Dupont             | 01/02/2026      |
    And chaque lot est cliquable vers sa fiche détail

  Scenario: Missions liées aux lots du propriétaire
    Given un propriétaire avec des lots ayant des missions
    When le gestionnaire consulte la section "Missions"
    Then il voit les missions de tous les lots du propriétaire :
      | Mission   | Lot    | Date       | Type       | Statut   | Technicien    |
      | M-2026-42 | Apt 2B | 15/03/2026 | Sortie     | Planifiée| Jean Dupont   |

  Scenario: Personne morale avec représentants
    Given un propriétaire de type personne morale "SCI Leroy"
    When le gestionnaire ouvre la fiche
    Then il voit les informations de la société (raison sociale, SIRET, adresse)
    And une section "Contacts" liste les représentants via TiersOrganisation :
      | Contact        | Fonction         | Téléphone      | Email              | Principal |
      | Pierre Leroy   | Gérant           | 06 12 34 56 78 | pierre@sci.com     | ✅        |
      | Marie Leroy    | Associée         | 06 98 76 54 32 | marie@sci.com      | —         |
```

---


# Modèle de données impacté
**Tables consultées** (lecture) :
- `Tiers` — infos de base
- `LotProprietaire` → `Lot` → `Batiment` — lots possédés
- `TiersOrganisation` — représentants (si personne morale)
- `Mission` + `MissionTechnicien` — missions via lots
- `EDL_Inventaire` + `EDLLocataire` → `Tiers` — locataires actuels

---


# Règles métier
- La fiche propriétaire affiche les lots en propriété active (pas les anciens)
- **Affichage conditionnel PP/PM** : si PP → nom, prénom, adresse, tel, email. Si PM → raison_sociale, SIREN, adresse, tel, email + section Contacts (TiersOrganisation). Les champs non pertinents au type ne sont pas affichés (pas de SIREN pour une PP, pas de prénom pour une PM)
- **"Dernier locataire (EDL)"** est informatif (issu du dernier EDL d'entrée), pas un statut d'occupation — ImmoChecker n'est pas un logiciel de gestion locative
- Les missions affichées sont celles des lots du propriétaire
- Pour les personnes morales, le contact principal est mis en avant
- **Multi-rôle** : si le tiers est aussi locataire d'un lot (via EDLLocataire), une section "Lots (locataire)" apparaît avec l'historique des lots loués (cf US-807). Badges de rôles en haut de la fiche.
- **Pattern d'édition** : CTA "Modifier" → édition inline → "Enregistrer" / "Annuler". Lecture par défaut. Le layout ne change pas entre les deux modes — les valeurs texte deviennent simplement des inputs éditables au même emplacement (bordure/fond léger). Si l'utilisateur quitte avec des modifications non sauvegardées, une modale propose "Enregistrer et quitter" / "Quitter sans sauvegarder". Pattern identique sur toutes les fiches détail (cf US-610).
- Accessible aux admin et gestionnaires