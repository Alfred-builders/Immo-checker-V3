---
notion_id: "3271d95b-2f8a-810c-b29c-f28899dba1de"
notion_url: "https://www.notion.so/FCR-US822-Gestion-des-cl-s-par-EDL-CleMission-3271d95b2f8a810cb29cf28899dba1de"
last_synced: "2026-03-26T12:51:37.992Z"
created: "2026-03-18T14:33:00.000Z"
last_edited: "2026-03-20T08:10:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "822"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Sponsors: "clement.flatchecker@outlook.fr, Flat Checker "
  Time spent: "0"
  Nom: "Gestion des clés par EDL (CleMission)"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3131d95b-2f8a-8131-b48b-e85641cc8c31"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Status: "📌 Ready"
  Builders: "Tony Pineiro"
  Date de création: "2026-03-18T14:33:00.000Z"
  Code: "FCR - US822 Gestion des clés par EDL (CleMission)"
  Time Spent Activation: "Non"
---

# FCR - US822 Gestion des clés par EDL (CleMission)

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 822 |
| Created by | Tony Pineiro |
| Priority | 🔴 P0 |
| Sponsors | clement.flatchecker@outlook.fr, Flat Checker  |
| Time spent | 0 |
| Pricing | 0 |
| Project | 3071d95b-2f8a-80ac-9db8-dc4e9d2196c9 |
| Epic | 3131d95b-2f8a-8131-b48b-e85641cc8c31 |
| Brique Fonctionnelle | 3131d95b-2f8a-81de-af8e-d782a1b05a0e |
| Status | 📌 Ready |
| Builders | Tony Pineiro |
| Date de création | 2026-03-18T14:33:00.000Z |
| Code | FCR - US822 Gestion des clés par EDL (CleMission) |
| Time Spent Activation | Non |


# User Story
**En tant que** technicien et admin,
**je veux** documenter les clés remises lors d'un EDL (entrée et sortie) et suivre leur dépôt après une sortie,
**afin de** tracer légalement les clés dans chaque document EDL et ne jamais perdre de clés à déposer.
> ℹ️ **Scope V1** : Entrée = constatation documentaire (type + quantité + photo, statut `remise`). Sortie = workflow de dépôt (statuts `a_deposer → deposee`). La gestion de récupération de clés en amont des missions est reportée en V2.

---


# Critères d'acceptation (Gherkin)
```gherkin
Feature: Gestion des clés par EDL (V1)

  # ──────────────────────────────────────
  # SAISIE DES CLÉS (ENTRÉE ET SORTIE)
  # ──────────────────────────────────────

  Scenario: Le technicien saisit les clés récupérées pendant l'EDL de sortie
    Given un EDL de sortie en cours sur la tablette
    Then une section "Clés récupérées" est disponible
    When le technicien ajoute une clé :
      | Champ           | Type   | Obligatoire | Notes                                              |
      | Type de clé     | Enum   | Oui         | cle_principale / badge / boite_aux_lettres / parking / cave / digicode / autre |
      | Quantité        | Nombre | Oui         | Défaut : 1                                         |
      | Photo(s)        | Photo  | Non         | Photo du trousseau/badge (entity_type = cle dans table Photo) |
      | Commentaire     | Texte  | Non         | Ex : "Clé avec porte-clés bleu"                    |
    Then une CleMission est créée avec edl_id = EDL courant et statut = "a_deposer"
    And le technicien peut ajouter plusieurs clés

  Scenario: Le technicien documente les clés remises au locataire entrant
    Given un EDL d'entrée en cours sur la tablette
    Then une section "Clés remises au locataire" est disponible
    When le technicien ajoute une clé :
      | Champ           | Type   | Obligatoire | Notes                                              |
      | Type de clé     | Enum   | Oui         | cle_principale / badge / boite_aux_lettres / parking / cave / digicode / autre |
      | Quantité        | Nombre | Oui         | Défaut : 1                                         |
      | Photo(s)        | Photo  | Non         | Photo du trousseau/badge (entity_type = cle dans table Photo) |
      | Commentaire     | Texte  | Non         | Ex : "2 clés + 1 badge"                            |
    Then une CleMission est créée avec edl_id = EDL courant et statut = "remise"
    And aucune action de dépôt n'est attendue (purement documentaire)
    And le document PDF de l'EDL d'entrée affiche la liste des clés remises

  Scenario: Colocation — chaque EDL trace ses propres clés
    Given une mission avec 3 EDL de sortie (3 colocataires)
    When chaque locataire remet ses clés pendant son EDL
    Then chaque CleMission est rattachée à l'EDL du locataire concerné (via edl_id)
    And le document PDF de chaque EDL affiche uniquement les clés remises par ce locataire
    And la vue agrégée (fiche mission, dashboard) affiche toutes les clés via le join EDL → Mission



  Scenario: EDL sans clé
    Given un EDL (entrée ou sortie) en cours
    And aucune clé n'est concernée (ex : digicode uniquement, pas de clé physique)
    Then la section "Clés" reste vide
    And aucune CleMission n'est créée

  # ──────────────────────────────────────
  # SUIVI DU DÉPÔT (APRÈS L'EDL)
  # ──────────────────────────────────────

  Scenario: Liste des clés à déposer — fiche mission (US-811) et drawer (US-842)
    Given un EDL de sortie terminé avec 3 clés récupérées
    Then la section "Clés" de la fiche mission affiche :
      | Type clé            | Quantité | Statut     | Commentaire                |
      | Clé principale      | 2        | a_deposer  | "Porte-clés bleu + rouge"  |
      | Badge parking       | 1        | a_deposer  |                            |
    And chaque clé a un bouton pour passer le statut à "deposee"
    And un champ "Lieu de dépôt" (texte libre) est disponible par clé ou global à la mission

  Scenario: Le technicien confirme le dépôt
    Given une clé en statut "a_deposer"
    When le technicien clique "Déposée" (depuis l'app mobile)
    Then le statut passe à "deposee"
    And la clé sort de la checklist "Clés à déposer"

  Scenario: L'admin modifie le statut des clés depuis la webapp
    Given une clé en statut "a_deposer" ou "deposee"
    When l'admin accède à la fiche mission ou au détail de l'EDL dans la webapp
    Then il peut modifier le statut de chaque clé (a_deposer ↔ deposee)
    And il peut modifier le lieu de dépôt et le commentaire
    And les clés en statut "remise" (entrée) sont affichées en lecture seule (pas de workflow)

  Scenario: Toutes les clés déposées
    Given une mission avec 3 clés, toutes en statut "deposee"
    Then la section "Clés" affiche "Toutes les clés ont été déposées ✅"
    And aucune alerte n'est remontée

  # ──────────────────────────────────────
  # CHECKLIST TECHNICIEN (DASHBOARD MOBILE)
  # ──────────────────────────────────────

  Scenario: Checklist clés agrégée (dashboard technicien US-816)
    Given un technicien avec 3 missions terminées ayant des clés à déposer
    Then il voit une checklist agrégée :
      | Mission   | Lot / Adresse           | Type clé         | Quantité | Lieu de dépôt       |
      | M-2026-42 | Apt 2B, 12 rue Lilas    | Clé principale   | 2        | Agence Versailles   |
      | M-2026-42 | Apt 2B, 12 rue Lilas    | Badge parking    | 1        | Agence Versailles   |
      | M-2026-38 | Apt 4A, 8 rue Roses     | Clé principale   | 1        | Gardien             |
    And chaque ligne a un bouton "Déposée" pour confirmer le dépôt

  # ──────────────────────────────────────
  # ALERTES
  # ──────────────────────────────────────

  Scenario: Rappel clés non déposées (24h)
    Given une mission terminée + clés en statut "a_deposer" depuis 24h
    Then une notification push est envoyée au technicien

  Scenario: Alerte admin — clés en attente de dépôt
    Given des clés en statut "a_deposer" depuis plus de 48h
    Then l'admin voit une alerte dans le dashboard (à définir — V2 potentiel)
```

---


# Modèle de données
**Table** : `CleMission`
| Attribut | Type | Notes |
| id | uuid | PK |
| edl_id | FK | → EDL_Inventaire. Rattachement à l’EDL (pas à la mission) : en colocation, chaque locataire remet ses propres clés, et chaque document EDL doit tracer les clés remises par ce locataire. L’agrégation au niveau mission se fait via EDL_Inventaire.mission_id. |
| type_cle | Enum | cle_principale / badge / boite_aux_lettres / parking / cave / digicode / autre |
| quantite | Nombre | Défaut : 1 |
| statut | Enum | remise (entrée, documentaire) / a_deposer (sortie) / deposee (sortie, confirmé) |
| lieu_depot | Texte | Ex : "Agence Versailles", "Gardien Mme Dupont" |
| commentaire | Texte | Description libre (ex : "porte-clés bleu") |
| created_at | DateTime | Auto |
| deposee_at | DateTime | Renseigné quand statut passe à "deposee" |

---


# Règles métier
- **Entrée et sortie** : les clés sont documentées dans les deux sens. Entrée = constatation (statut `remise`, documentaire). Sortie = workflow dépôt (statuts `a_deposer → deposee`).
- **Photos** : chaque clé peut avoir une ou plusieurs photos (table Photo avec entity_type = `cle`). Important pour preuve légale.
- **Rattachement à l'EDL** (pas à la mission) : en colocation (1 mission → N EDL), chaque locataire remet/reçoit ses propres clés. Le document EDL trace les clés de ce locataire. L'agrégation au niveau mission pour la checklist de dépôt se fait via le join `CleMission.edl_id → EDL_Inventaire.mission_id`.
- **Cycle de vie** : 3 statuts — `remise` (entrée, pas de workflow), `a_deposer → deposee` (sortie)
- Pas de gestion de récupération en amont (pas de `a_recuperer`, `recuperee`, `sur_place`)
- La saisie se fait sur l'app tablette pendant l'EDL (entrée ou sortie)
- Le suivi du dépôt (sortie uniquement) est visible sur la fiche mission (webapp), le drawer dashboard (US-842), et le dashboard technicien (US-816)
- **Modifiable par le technicien (mobile) ET l'admin (webapp)** : l'admin peut modifier le statut, le lieu de dépôt et le commentaire depuis la webapp
- Notification push 24h si clés non déposées
- Le `lieu_depot` est un texte libre (pas de référentiel de lieux en V1)
- Les clés en statut `remise` (entrée) n'apparaissent pas dans la checklist "Clés à déposer"

---


# V2 — Évolutions possibles
- Gestion de récupération en amont (clés à récupérer avant la mission : agence, gardien, boîte à clés)
- Flows plus riches avec statuts intermédiaires (a_recuperer, recuperee, sur_place)
- Récupération de clés en amont des missions (agence, gardien, boîte à clés)
- Référentiel de lieux de dépôt (au lieu du texte libre)
- Alerte admin dans le dashboard pour les clés en attente de dépôt depuis plus de 48h
- Historique des mouvements de clés par lot

---


# Décisions
- **19/03/2026** : Simplification majeure — scope V1 réduit aux clés de sortie uniquement (locataire remet → technicien dépose). 2 statuts : a_deposer / deposee. Toute la gestion de récupération en amont et les flows d’entrée sont reportés en V2.
- **20/03/2026** : FK changée de `mission_id` → `edl_id` (FK → EDL_Inventaire). Raison : en colocation, chaque locataire remet ses propres clés, le document EDL doit tracer les clés de ce locataire spécifiquement.
- **20/03/2026** : Ajout EDL d'entrée (constatation documentaire, statut `remise`). Photos par clé (entity_type `cle` dans table Photo). Admin peut modifier statut/lieu/commentaire depuis la webapp.