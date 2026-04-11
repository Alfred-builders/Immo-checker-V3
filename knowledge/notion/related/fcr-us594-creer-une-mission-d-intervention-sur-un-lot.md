---
notion_id: "3131d95b-2f8a-819f-b3db-c62635733740"
notion_url: "https://www.notion.so/FCR-US594-Cr-er-une-mission-d-intervention-sur-un-lot-3131d95b2f8a819fb3dbc62635733740"
last_synced: "2026-03-26T12:56:34.985Z"
created: "2026-02-26T15:52:00.000Z"
last_edited: "2026-03-20T17:23:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "594"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Time spent: "0"
  Nom: "Créer une mission d'intervention sur un lot"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3131d95b-2f8a-8131-b48b-e85641cc8c31"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Status: "📌 Ready"
  Builders: "Tony Pineiro"
  Date de création: "2026-02-26T15:52:00.000Z"
  Code: "FCR - US594 Créer une mission d'intervention sur un lot"
  Time Spent Activation: "Non"
---

# FCR - US594 Créer une mission d'intervention sur un lot

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 594 |
| Created by | Tony Pineiro |
| Priority | 🔴 P0 |
| Time spent | 0 |
| Pricing | 0 |
| Project | 3071d95b-2f8a-80ac-9db8-dc4e9d2196c9 |
| Epic | 3131d95b-2f8a-8131-b48b-e85641cc8c31 |
| Brique Fonctionnelle | 3131d95b-2f8a-81de-af8e-d782a1b05a0e |
| Status | 📌 Ready |
| Builders | Tony Pineiro |
| Date de création | 2026-02-26T15:52:00.000Z |
| Code | FCR - US594 Créer une mission d'intervention sur un lot |
| Time Spent Activation | Non |


# User Story
**En tant que** gestionnaire ou admin,
**je veux** créer une mission d'intervention en sélectionnant facilement un lot via un formulaire riche,
**afin de** planifier une intervention terrain rapidement, même si le lot ou le bâtiment n'existe pas encore.
> **Note** : cette US fusionne le formulaire de création mission et le composant record picker enrichi (bâtiments et lots). Le record picker est un composant partagé réutilisé dans tous les contextes (dashboard, missions, bâtiment).

---


# Critères d'acceptation (Gherkin)
```gherkin
Feature: Créer une mission d'intervention

  Scenario: Ouverture du formulaire en modal
    Given le gestionnaire est sur n'importe quelle page (dashboard, missions, bâtiment…)
    When il clique sur "Nouvelle mission"
    Then un formulaire s'ouvre en modal (pas de redirection de page)
    And le formulaire est identique quel que soit le point d'entrée

  Scenario: Record picker enrichi pour le lot
    Given le formulaire de création de mission
    When le gestionnaire clique sur le champ "Lot"
    Then une dropdown enrichie s'ouvre avec pour chaque lot :
      | Champ          | Exemple                        |
      | Nom du lot     | Apt 2B                         |
      | Adresse        | 12 rue des Lilas, 75011 Paris  |
      | Propriétaire   | Pierre Leroy                   |
      | Étage          | 2ème                           |
      | Emplacement    | Porte de gauche                |
    And une barre de recherche permet de filtrer par nom, adresse ou propriétaire
    And un bouton "Créer un lot" est disponible en bas de la dropdown

  Scenario: Création d'un lot à la volée
    Given le gestionnaire ne trouve pas son lot dans le picker
    When il clique sur "Créer un lot"
    Then le formulaire de création de lot s'ouvre en sous-modal
    And ce formulaire est identique à celui de la page Parc immobilier (US584)
    And le champ "Bâtiment" utilise aussi un record picker enrichi :
      | Champ          | Exemple                        |
      | Désignation    | Résidence Les Tilleuls         |
      | Adresse        | 12 rue des Lilas, 75011 Paris  |
    And un bouton "Ajouter un bâtiment" permet de créer un bâtiment à la volée
    And après création, le lot est automatiquement sélectionné dans le formulaire mission

  Scenario: Champs du formulaire mission
    Given le formulaire de création de mission ouvert
    Then les champs suivants sont affichés dans l'ordre :
      | Champ                | Type          | Obligatoire | Détail                           |
      | Lot                  | Record picker | Oui         | Picker enrichi (cf. ci-dessus)   |
      | Sens                 | Enum          | Oui         | Entrée / Sortie                  |
      | Avec inventaire      | Toggle        | Oui         | Oui / Non (défaut: Non)          |
      | Date planifiée       | Date          | Oui         | Datepicker                       |
      | Heure début          | Heure         | Non         | Sélecteur d'heure                |
      | Heure fin            | Heure         | Non         | Sélecteur d'heure                |
      | Technicien           | Dropdown      | Non         | Dropdown simple (1 seul tech)    |
      | Commentaire          | Texte long    | Non         | Instructions terrain             |

  # ──────────────────────────────────────
  # LOCATAIRES & TYPE DE BAIL
  # ──────────────────────────────────────

  Scenario: Section locataire(s) — cas standard (1 locataire)
    Given le formulaire de création de mission
    Then une section "Locataire(s)" est affichée après le toggle inventaire
    And par défaut, 1 ligne locataire est présente
    And chaque ligne locataire contient :
      | Champ            | Type          | Obligatoire | Détail                              |
      | Locataire        | Record picker | Non         | Picker vers Tiers (type=locataire)  |
    And un bouton "+ Ajouter un locataire" permet d'ajouter des lignes supplémentaires
    And chaque locataire peut être supprimé (sauf le premier si seul)

  Scenario: Sélection du type de bail (apparaît si 2+ locataires)
    Given le gestionnaire a ajouté un 2ème locataire
    Then un champ "Type de bail" apparaît :
      | Champ          | Type   | Défaut     | Valeurs                           |
      | Type de bail   | Radio  | Individuel | Individuel / Collectif            |
    And un texte d'aide précise :
      - Individuel : "1 EDL par locataire (baux séparés) — le technicien réalise N EDL distincts"
      - Collectif : "1 seul EDL signé par tous les locataires (bail commun)"
    And si le gestionnaire repasse à 1 seul locataire, le champ "Type de bail" disparaît

  Scenario: Création mission — colocation baux individuels
    Given le gestionnaire a ajouté 3 locataires (Alice, Bob, Claire)
    And le type de bail est "Individuel"
    And le sens est "Entrée" avec inventaire
    When il valide le formulaire
    Then 1 mission est créée
    And **3 EDL_Inventaire** sont créés (1 par locataire), chacun lié à la mission
    And chaque EDL a son propre locataire via la table pivot EDLLocataire (1:1)
    And le technicien verra 3 EDL à réaliser dans sa mission

  Scenario: Création mission — colocation bail collectif
    Given le gestionnaire a ajouté 3 locataires (Alice, Bob, Claire)
    And le type de bail est "Collectif"
    And le sens est "Entrée" avec inventaire
    When il valide le formulaire
    Then 1 mission est créée
    And **1 seul EDL_Inventaire** est créé, lié à la mission
    And les 3 locataires sont liés à ce même EDL via la table pivot EDLLocataire (N:1)
    And le technicien verra 1 seul EDL à réaliser, signé par les 3 locataires

  Scenario: Création mission avec locataire non renseigné
    Given le gestionnaire ne renseigne pas le locataire (champ vide)
    When il valide le formulaire
    Then la mission est créée avec 1 EDL_Inventaire sans locataire associé
    And le locataire pourra être ajouté plus tard depuis la fiche mission (US-811)

  Scenario: Sélection du technicien
    Given le champ "Technicien"
    When le gestionnaire clique sur le dropdown
    Then il voit la liste des techniciens actifs du workspace
    And il peut en sélectionner un seul (pas de multi-sélection)
    And la sélection est optionnelle (mission "à assigner" si laissé vide)

  Scenario: Soumission du formulaire
    Given tous les champs obligatoires remplis
    When le gestionnaire valide
    Then la mission est créée avec :
      | Champ       | Valeur                                    |
      | reference   | Auto-générée (M-2026-XXXX)                |
      | statut      | "planifiee" (ou "assignee" si technicien) |
      | lot_id      | Le lot sélectionné                        |
      | created_by  | L'utilisateur courant                     |
    And `statut_rdv` est initialisé à `a_confirmer`
    And si technicien assigné, `MissionTechnicien.statut_invitation` = `en_attente`
    And la modal se ferme
    And la page sous-jacente se rafraîchit

  Scenario: Pré-remplissage depuis le contexte
    Given le gestionnaire crée une mission depuis la fiche d'un lot
    Then le champ "Lot" est pré-rempli et non modifiable
    Given le gestionnaire crée une mission depuis le calendrier (clic sur un créneau)
    Then le champ "Date" et "Heure début" sont pré-remplis
```

---


# Modèle de données impacté
**Tables modifiées** :
- `Mission` — création : lot_id, date_planifiee, heure_debut, heure_fin, commentaire, created_by, reference (auto), statut, statut_rdv=a_confirmer
- `MissionTechnicien` — création si technicien sélectionné : mission_id, user_id, est_principal=true, statut_invitation=en_attente
- `EDL_Inventaire` — création automatique du/des document(s) : type_document (edl/inventaire), sens, lot_id, mission_id
**Aucune nouvelle table.**

---


# Règles métier
- 1 mission = 1 lot (non modifiable après création)
- La référence est auto-générée : M-{année}-{séquence 4 chiffres}
- Le statut initial est dérivé : "planifiee" si pas de technicien, "assignee" si technicien assigné
- Le sens (entrée/sortie) et le toggle inventaire déterminent quels documents EDL_Inventaire sont créés automatiquement
- Le formulaire de création lot/bâtiment à la volée est le MÊME composant que celui des pages dédiées (harmonisation)
- Le record picker lot est réutilisé dans tous les contextes (dashboard, missions, bâtiment) — composant partagé
- La recherche dans les pickers couvre : nom, adresse (rue, ville, CP), propriétaire
- Les résultats des pickers sont limités au workspace courant
- Accessible aux admin et gestionnaires
- **Colocation — deux types de bail** :
  - **Baux individuels** (défaut) : N locataires → N EDL distincts (1 par locataire). Le technicien réalise N EDL.
  - **Bail collectif** : N locataires → 1 seul EDL, signé par tous. Les locataires sont liés via la table pivot `EDLLocataire`.
  - Le choix se fait via un radio "Type de bail" qui apparaît dans le formulaire dès qu'il y a 2+ locataires.
  - **Après coup** (fiche mission US-811 ou terrain) : ajout d'EDL supplémentaires possible tant que la mission n'est pas terminée. Duplication d'EDL exclusivement sur l'app tablette (EPIC 5).