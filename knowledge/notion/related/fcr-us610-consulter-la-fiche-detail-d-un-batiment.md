---
notion_id: "3131d95b-2f8a-810b-b22c-d77008e63c9a"
notion_url: "https://www.notion.so/FCR-US610-Consulter-la-fiche-d-tail-d-un-b-timent-3131d95b2f8a810bb22cd77008e63c9a"
last_synced: "2026-03-26T12:56:05.108Z"
created: "2026-02-26T16:18:00.000Z"
last_edited: "2026-03-19T15:56:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "610"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Sponsors: "clement.flatchecker@outlook.fr, Flat Checker "
  Time spent: "0"
  Nom: "Consulter la fiche détail d'un bâtiment"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3131d95b-2f8a-81f3-a317-c6756c9ae867"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Status: "📌 Ready"
  Builders: "Tony Pineiro"
  Date de création: "2026-02-26T16:18:00.000Z"
  Code: "FCR - US610 Consulter la fiche détail d'un bâtiment"
  Time Spent Activation: "Non"
---

# FCR - US610 Consulter la fiche détail d'un bâtiment

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 610 |
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
| Code | FCR - US610 Consulter la fiche détail d'un bâtiment |
| Time Spent Activation | Non |


# User Story
**En tant que** gestionnaire ou admin,
**je veux** consulter et modifier la fiche détail d'un bâtiment,
**afin de** visualiser ses informations, ses adresses et la liste de ses lots.

---


# Critères d'acceptation (Gherkin)
```gherkin
Feature: Fiche détail d'un bâtiment

  # ──────────────────────────────────────
  # INFORMATIONS GÉNÉRALES
  # ──────────────────────────────────────

  Scenario: Affichage des informations générales (lecture par défaut)
    Given le gestionnaire ouvre la fiche du bâtiment "Résidence Les Tilleuls"
    Then il voit les informations suivantes en lecture seule :
      | Champ               | Source                   | Type          | Exemple                  |
      | Désignation         | Batiment.designation     | Texte         | Résidence Les Tilleuls   |
      | Type                | Batiment.type            | Enum (badge)  | Immeuble                 |
      | Numéro bâtiment     | Batiment.num_batiment    | Texte         | Bât. A                   |
      | Nombre d'étages     | Batiment.nb_etages       | Nombre        | 5                        |
      | Année construction  | Batiment.annee_construction | Nombre     | 1985                     |
      | Commentaire         | Batiment.commentaire     | Texte long    |                          |
      | Statut              | Batiment.est_archive     | Badge         | Actif / Archivé          |
      | Créé le             | Batiment.created_at      | Date (lecture) | 15/01/2026              |
      | Dernière modif.     | Batiment.updated_at      | Date (lecture) | 10/03/2026              |

  Scenario: Passage en mode édition (CTA → inline)
    Given la fiche est en mode lecture
    Then un bouton "Modifier" (icône crayon) est affiché en haut à droite
    When le gestionnaire clique sur "Modifier"
    Then le layout de la fiche ne change PAS — les champs restent à la même position
    And les valeurs texte des champs éditables deviennent des inputs inline (même emplacement, bordure ou fond léger pour indiquer l'éditabilité)
    And les champs non éditables restent en lecture seule (pas de changement visuel) :
      | Champ               | Éditable | Notes                          |
      | Désignation         | Oui      |                                |
      | Type                | Oui      | Dropdown                       |
      | Numéro bâtiment     | Oui      |                                |
      | Nombre d'étages     | Oui      |                                |
      | Année construction  | Oui      |                                |
      | Commentaire         | Oui      |                                |
      | Statut (est_archive)| Non      | Action séparée "Archiver"      |
      | Créé le             | Non      | Auto                           |
      | Dernière modif.     | Non      | Auto                           |
    And deux boutons apparaissent : "Enregistrer" et "Annuler"
    When le gestionnaire clique "Enregistrer"
    Then les modifications sont sauvegardées
    And la fiche repasse en mode lecture (inputs redeviennent du texte)
    When le gestionnaire clique "Annuler"
    Then les modifications sont abandonnées
    And la fiche repasse en mode lecture sans changement

  Scenario: Quitter la page avec des modifications non sauvegardées
    Given la fiche est en mode édition avec des modifications
    When le gestionnaire tente de quitter la page (navigation, retour, fermeture)
    Then une modale de confirmation s'affiche : "Vous avez des modifications non sauvegardées"
    And deux boutons sont proposés :
      | Action                      | Effet                              |
      | Enregistrer et quitter      | Sauvegarde puis navigue            |
      | Quitter sans sauvegarder    | Abandonne les modifications et navigue |

  # ──────────────────────────────────────
  # ADRESSES
  # ──────────────────────────────────────

  Scenario: Affichage des adresses (format carte)
    Given un bâtiment traversant avec 2 adresses
    Then la section "Adresses" affiche chaque adresse sous forme de carte compacte :
      | Carte 1                                              |
      | Badge "Principale"                                   |
      | 12 rue des Lilas, 75011 Paris (Bât. C, esc. 3)       |
      | 📍 Lien Google Maps                                  |
      |                                                      |
      | Carte 2                                              |
      | Badge "Secondaire"                                   |
      | 5 rue des Roses, 75011 Paris                         |
      | 📍 Lien Google Maps                                  |
    And l'adresse est affichée en une seule ligne (pas de colonnes séparées rue/CP/ville — l'autocomplete Google Places fournit l'adresse complète)
    And le complément d'adresse est affiché entre parenthèses s'il existe
    And le lien Google Maps ouvre maps.google.com?q={lat},{lng} dans un nouvel onglet
    And le lien Google Maps n'est affiché que si latitude/longitude sont renseignées
    And en mode édition, chaque adresse est modifiable via le même autocomplete Google Places que la création
    And un bouton "Ajouter une adresse" est disponible en mode édition

  Scenario: Adresse sans coordonnées GPS
    Given une adresse saisie manuellement (sans Google Places)
    Then le lien Google Maps n'est PAS affiché
    And une mention discrète "(coordonnées manquantes)" est affichée à la place

  # ──────────────────────────────────────
  # LOTS
  # ──────────────────────────────────────

  Scenario: Liste des lots (tableau simple)
    Given un bâtiment avec 5 lots
    Then la section "Lots" affiche un tableau :
      | Lot    | Étage | Type        | Surface | Meublé | Propriétaire  | Dernier locataire (EDL) | Dernière mission |
      | Apt 1A | RDC   | Appartement | 45 m²  | Non    | Pierre Leroy | Marie Martin            | 01/01/2026      |
    And chaque lot est cliquable vers sa fiche détail
    And les lots sont triés par étage ASC puis désignation ASC

  # ──────────────────────────────────────
  # STATS & ACTIONS
  # ──────────────────────────────────────

  Scenario: Statistiques résumées
    Given un bâtiment avec 12 lots
    Then un bandeau de stats affiche :
      | Total lots | Missions à venir | Dernière mission |
      | 12         | 2                | 15/03/2026      |

  Scenario: Actions rapides
    Given la fiche détail
    Then les actions sont :
      | Action                 | Condition                    |
      | Modifier               | Admin ou gestionnaire        |
      | Ajouter un lot         | Admin ou gestionnaire        |
      | Archiver le bâtiment   | Tous lots archivés ou sans mission |

  # ──────────────────────────────────────
  # CAS PARTICULIER
  # ──────────────────────────────────────

  Scenario: Bâtiment type maison (1 lot)
    Given un bâtiment "maison" avec 1 lot
    Then la section "Lots" affiche directement les infos du lot unique
    And un lien "Voir la fiche lot" est disponible
```

---


# Modèle de données impacté
**Tables consultées** :
- `Batiment` — infos principales (designation, type, num_batiment, nb_etages, annee_construction, commentaire, est_archive, created_at, updated_at)
- `AdresseBatiment` — adresses multiples (type, rue, complement, code_postal, ville, latitude, longitude, ordre)
- `Lot` — tableau des lots
- `Mission` — stats (missions à venir, dernière mission)
- `EDL_Inventaire` + `EDLLocataire` → `Tiers` — dernier locataire (informatif)
- `LotProprietaire` → `Tiers` — propriétaire par lot

---


# Règles métier
- **Pattern d'édition** : CTA "Modifier" → édition inline → "Enregistrer" / "Annuler". Le layout ne change pas entre les deux modes — les valeurs texte deviennent simplement des inputs éditables au même emplacement (bordure/fond léger pour signaler l'éditabilité). Ce pattern est le même sur toutes les fiches détail (bâtiment, lot, tiers, mission).
- La fiche est le point d'entrée vers les lots du bâtiment
- Les stats sont mission-based (pas d'occupation — ImmoChecker n'est pas un logiciel de gestion locative)
- "Dernier locataire (EDL)" est informatif, pas un statut d'occupation
- Le lien Google Maps est généré à partir de `latitude` et `longitude` de l'adresse — masqué si coordonnées absentes
- L'adresse principale ne peut PAS être supprimée tant que le bâtiment a des lots actifs
- Le tri par défaut des lots : étage ASC, puis désignation ASC
- Accessible aux admin et gestionnaires

---


# Décisions
- **19/03/2026** : Pattern d'édition CTA → inline pour toutes les fiches détail (bâtiment, lot, tiers, mission). Lecture par défaut, bouton "Modifier" active l'édition, "Enregistrer" / "Annuler" pour sortir.
- **19/03/2026** : Ajout du lien rapide Google Maps sur chaque adresse (utilise lat/lng de AdresseBatiment). Masqué si coordonnées absentes.
- **19/03/2026** : Ajout des champs manquants vs modèle de données : complément d'adresse, est_archive (badge), created_at et updated_at (metadata lecture seule).
- **19/03/2026** : Adresses affichées sous forme de cartes compactes (pas de colonnes séparées rue/CP/ville — l'autocomplete Google Places fournit l'adresse en un bloc)
- **19/03/2026** : Modale de confirmation si l'utilisateur quitte en mode édition avec des modifications non sauvegardées ("Enregistrer et quitter" / "Quitter sans sauvegarder")