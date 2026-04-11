---
notion_id: "3131d95b-2f8a-8196-a7e0-efb1c107a623"
notion_url: "https://www.notion.so/FCR-US609-Consulter-la-fiche-d-tail-d-un-lot-3131d95b2f8a8196a7e0efb1c107a623"
last_synced: "2026-03-26T12:56:00.700Z"
created: "2026-02-26T16:18:00.000Z"
last_edited: "2026-03-19T15:43:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "609"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Sponsors: "clement.flatchecker@outlook.fr, Flat Checker "
  Time spent: "0"
  Nom: "Consulter la fiche détail d'un lot"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3131d95b-2f8a-81f3-a317-c6756c9ae867"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Status: "📌 Ready"
  Builders: "Tony Pineiro"
  Date de création: "2026-02-26T16:18:00.000Z"
  Code: "FCR - US609 Consulter la fiche détail d'un lot"
  Time Spent Activation: "Non"
---

# FCR - US609 Consulter la fiche détail d'un lot

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 609 |
| Created by | Tony Pineiro |
| Priority | 🔴 P0 |
| Sponsors | clement.flatchecker@outlook.fr, Flat Checker  |
| Time spent | 0 |
| Pricing | 0 |
| Project | 3071d95b-2f8a-80ac-9db8-dc4e9d2196c9 |
| Epic | 3131d95b-2f8a-81f3-a317-c6756c9ae867 |
| Brique Fonctionnelle | 3131d95b-2f8a-81de-af8e-d782a1b05a0e |
| Status | 📌 Ready |
| Builders | Tony Pineiro |
| Date de création | 2026-02-26T16:18:00.000Z |
| Code | FCR - US609 Consulter la fiche détail d'un lot |
| Time Spent Activation | Non |


# User Story
**En tant que** gestionnaire ou admin,
**je veux** consulter et modifier la fiche détail complète d'un lot,
**afin de** visualiser toutes les informations, les acteurs liés et l'historique des interventions sur une seule page.

---


# Critères d'acceptation (Gherkin)
```gherkin
Feature: Fiche détail d'un lot

  Scenario: Affichage one-page avec sections
    Given un lot "Apt 3B" dans le bâtiment "Résidence Les Tilleuls"
    When le gestionnaire ouvre la fiche du lot
    Then il voit une page unique avec des sections séparées visuellement :
      | Section              | Contenu                                           |
      | En-tête              | Désignation, icône type, référence libre, bâtiment (lien) |
      | Informations         | Champs éditables in-page                           |
      | Tiers liés           | Propriétaires, mandataire, dernier locataire       |
      | Missions             | Tableau des missions liées                         |
    And chaque section est repliable (fermée/ouverte)

  Scenario: Informations du lot (CTA → édition inline)
    Given la section "Informations" en mode lecture par défaut
    Then un bouton "Modifier" (icône crayon) est affiché en haut à droite
    When le gestionnaire clique sur "Modifier"
    Then les champs éditables deviennent des inputs inline :
      | Boutons | "Enregistrer" et "Annuler" apparaissent |
    Then le layout ne change PAS — les valeurs texte deviennent des inputs au même emplacement (bordure/fond léger)
    And il peut modifier :
      | Champ               | Type          | Éditable | Exemple                |
      | Désignation         | Texte         | Oui      | Apt 3B                 |
      | Référence libre     | Texte         | Oui      | Bail n°2026-042        |
      | Type de bien        | Enum + icône  | Oui      | 🏠 Appartement         |
      | Étage               | Texte         | Oui      | 3ème                   |
      | Emplacement palier  | Texte         | Oui      | Porte de gauche        |
      | Surface (m²)        | Nombre        | Oui      | 65                     |
      | Nombre de pièces    | Nombre        | Oui      | 3                      |
      | Meublé              | Oui/Non       | Oui      | Oui                    |
      | DPE                 | Enum (A-G)    | Oui      | D                      |
      | N° Cave             | Texte         | Oui      | C12                    |
      | N° Parking          | Texte         | Oui      | P45                    |
      | Commentaire         | Texte long    | Oui      | RAS                    |
      | Statut              | Badge         | Non      | Actif / Archivé (action séparée) |
      | Créé le             | Date          | Non      | 15/01/2026 (auto)      |
      | Dernière modif.     | Date          | Non      | 10/03/2026 (auto)      |
    And l'adresse du bâtiment parent est affichée (non éditable, héritée)
    And le bâtiment parent est cliquable vers sa fiche détail

  Scenario: Tiers liés
    Given un lot avec propriétaires et mandataire
    When le gestionnaire consulte la section "Tiers liés"
    Then il voit 3 sous-sections :

      Propriétaire(s) (éditable — lier/délier) :
      | Nom             | Type          | Principal | Contact        |
      | Jean Dupont     | Physique      | Oui       | 06 xx xx xx xx |
      | SCI Les Tilleuls| Morale        | Non       | contact@sci.fr |

      Mandataire (éditable — lier/délier) :
      | Agence Versailles | 01 23 45 67 89 | contact@agence.fr |

      Dernier locataire (lecture seule — issu des EDL) :
      | Marie Martin | Entrée le 01/01/2026 | 06 xx xx xx xx |

    And chaque tiers est cliquable vers sa fiche
    And les propriétaires et mandataire sont modifiables (lier/délier un tiers)
    And le dernier locataire n'est PAS modifiable (provient des EDL)

  Scenario: Missions liées
    Given un lot avec 3 missions
    When le gestionnaire consulte la section "Missions"
    Then il voit un tableau :
      | Référence | Date       | Type(s)           | Technicien    | Statut    | PDF   |
      | M-2026-42 | 15/03/2026 | Entrée            | Paul          | Planifiée | —     |
      | M-2026-12 | 01/01/2026 | Entrée + Sortie   | Sophie        | Terminée  | 📄    |
      | M-2025-88 | 15/06/2025 | Entrée            | Paul          | Terminée  | 📄    |
    And la colonne Type(s) peut afficher plusieurs tags si la mission contient des EDL d'entrée ET de sortie
    And chaque mission est cliquable vers sa fiche détail
    And les missions terminées avec EDL signé affichent un lien PDF
    And le tableau est trié par date DESC

  Scenario: Lot sans historique
    Given un lot nouvellement créé sans mission
    When le gestionnaire ouvre la fiche
    Then la section Missions affiche "Aucune mission réalisée pour ce lot."
    And un bouton "Créer une mission" est proposé (ouvre le formulaire modal pré-rempli avec ce lot)

  Scenario: Actions rapides depuis la fiche
    Given la fiche détail d'un lot
    Then les actions suivantes sont accessibles :
      | Action                  | Condition                    |
      | Créer une mission       | Toujours (pré-remplit le lot)|
      | Modifier le lot         | Admin ou gestionnaire        |
      | Archiver le lot         | Aucune mission en cours      |
      | Voir le bâtiment parent | Toujours (lien)              |
```

---


# Modèle de données impacté
**Tables consultées** (lecture seule) :
- `Lot` — infos principales
- `Batiment` + `AdresseBatiment` — bâtiment parent et adresses
- `~~CompteurLot~~` retiré de la fiche lot — les compteurs sont gérés uniquement côté EDL (V2 éventuel pour les afficher ici)
- `LotProprietaire` + `Tiers` — propriétaires liés
- `Tiers` (via `Lot.mandataire_id`) + `TiersOrganisation` — mandataire + contact principal
- `Mission` + `EDL_Inventaire` + `EDLLocataire` — historique missions et locataires
- `MissionTechnicien` + `Utilisateur` — techniciens assignés
**Tables modifiées** (édition in-page) :
- `Lot` — modification des champs de base
- `LotProprietaire` — lier/délier propriétaires
- `Lot.mandataire_id` — lier/délier mandataire

---


# Règles métier
- **Pattern d'édition** : CTA "Modifier" → édition inline → "Enregistrer" / "Annuler". Lecture par défaut. Le layout ne change pas entre les deux modes — les valeurs texte deviennent simplement des inputs éditables au même emplacement (bordure/fond léger). Si l'utilisateur quitte avec des modifications non sauvegardées, une modale propose "Enregistrer et quitter" / "Quitter sans sauvegarder". Pattern identique sur toutes les fiches détail (cf US-610).
- **One-page avec sections** (pas de navigation tabulaire) — cohérent avec la philosophie "navigation une page" de l'app
- Les sections sont repliables, ouvertes par défaut
- La fiche est accessible aux admin et gestionnaires (pas aux techniciens)
- L'historique missions est trié par date DESC
- Le "dernier locataire" est informatif (issu du dernier EDL d'entrée), **pas un statut d'occupation** — ImmoChecker n'est pas un logiciel de gestion locative
- Les liens PDF ne sont affichés que pour les EDL avec statut = "signe"
- `code_acces` n'est PAS sur le lot — migré vers `EDL_Inventaire` (change à chaque intervention)
- `num_cave`, `num_parking` restent sur le lot (données stables liées au bien physique)
- ~~Section Compteurs~~ retirée de la fiche lot — les compteurs sont gérés uniquement côté EDL. V2 éventuel pour les remonter ici
- La colonne Type(s) dans le tableau missions supporte le multi-tags (entrée + sortie sur la même mission)
- La fiche lot est la page pivot principale pour le gestionnaire — elle centralise l'accès à toutes les entités liées