---
notion_id: "3131d95b-2f8a-8148-9e27-f328c415050a"
notion_url: "https://www.notion.so/FCR-US600-Cr-er-un-EDL-Mission-via-API-REST-3131d95b2f8a81489e27f328c415050a"
last_synced: "2026-03-26T12:54:53.414Z"
created: "2026-02-26T15:58:00.000Z"
last_edited: "2026-03-23T12:08:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "600"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Sponsors: "clement.flatchecker@outlook.fr, Flat Checker "
  Time spent: "0"
  Nom: "Créer un EDL / Mission via API REST"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3131d95b-2f8a-8132-940f-ee9684b08080"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Status: "📋 Backlog"
  Builders: "Tony Pineiro"
  Date de création: "2026-02-26T15:58:00.000Z"
  Code: "FCR - US600 Créer un EDL / Mission via API REST"
  Time Spent Activation: "Non"
---

# FCR - US600 Créer un EDL / Mission via API REST

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 600 |
| Created by | Tony Pineiro |
| Priority | 🔴 P0 |
| Sponsors | clement.flatchecker@outlook.fr, Flat Checker  |
| Time spent | 0 |
| Pricing | 0 |
| Project | 3071d95b-2f8a-80ac-9db8-dc4e9d2196c9 |
| Epic | 3131d95b-2f8a-8132-940f-ee9684b08080 |
| Brique Fonctionnelle | 3131d95b-2f8a-81de-af8e-d782a1b05a0e |
| Status | 📋 Backlog |
| Builders | Tony Pineiro |
| Date de création | 2026-02-26T15:58:00.000Z |
| Code | FCR - US600 Créer un EDL / Mission via API REST |
| Time Spent Activation | Non |


# User Story
**En tant que** système externe (Airtable, SaaS),
**je veux** créer une mission avec EDL/inventaires planifiés via API,
**afin d'** automatiser la planification depuis le back-office existant.

---


# Critères d'acceptation (Gherkin)
```gherkin
Feature: Création EDL via API REST

  Scenario: Création d'une mission EDL entrée via API
    Given une clé API valide pour "FlatChecker"
    When un POST /api/v1/missions est envoyé avec :
      | Champ            | Valeur                  | Notes                              |
      | lot_id           | uuid-du-lot             | Obligatoire                        |
      | sens             | entree                  | entree / sortie                    |
      | avec_inventaire  | true                    | Optionnel, défaut: false           |
      | locataire_id     | uuid-du-tiers           | Optionnel (ajout ultérieur)        |
      | date_planifiee   | 2026-03-15              | Obligatoire                        |
      | heure_debut      | 09:00                   | Optionnel                          |
      | heure_fin        | 11:00                   | Optionnel                          |
      | technicien_id    | uuid-du-user            | Optionnel (mission "à assigner" si absent) |
      | commentaire      | "3e étage, code 4521"   | Optionnel                          |
    Then une mission est créée avec statut = "planifiee" (ou "assignee" si technicien_id fourni)
    And statut_rdv = "a_confirmer"
    And un EDL_Inventaire est généré et rattaché à la mission
    And si technicien_id fourni, MissionTechnicien créé avec statut_invitation = "en_attente"
    And la réponse retourne le mission_id et edl_id
    And le code HTTP est 201

  Scenario: Création mission avec plusieurs locataires (colocation baux individuels)
    Given une clé API valide
    When un POST /api/v1/missions est envoyé avec :
      | locataires       | [uuid-1, uuid-2, uuid-3] |
      | type_bail        | individuel               |
    Then 3 EDL_Inventaire sont créés (1 par locataire)

  Scenario: Création mission colocation bail collectif
    Given une clé API valide
    When un POST /api/v1/missions est envoyé avec :
      | locataires       | [uuid-1, uuid-2, uuid-3] |
      | type_bail        | collectif                |
    Then 1 seul EDL_Inventaire est créé avec les 3 locataires via EDLLocataire

  Scenario: Création mission avec données invalides
    Given une clé API valide
    When un POST /api/v1/missions est envoyé avec lot_id inexistant
    Then une erreur 422 est retournée avec détail de validation

  Scenario: Annulation mission via API — respect des règles métier
    Given une mission "M-2026-0042" en statut "planifiee"
    When un DELETE /api/v1/missions/M-2026-0042 est envoyé avec motif="Locataire absent"
    Then le statut passe à "annulee" et les EDL passent en "infructueux"
    And le code HTTP est 200

  Scenario: Annulation bloquée — mission terminée
    Given une mission "M-2026-0042" en statut "terminee" (EDL signés)
    When un DELETE /api/v1/missions/M-2026-0042 est envoyé
    Then une erreur 403 est retournée : "Impossible d'annuler une mission avec des EDL signés"

  Scenario: Récupération d'une mission existante
    Given une mission "M-2026-0042" existe
    When un GET /api/v1/missions/M-2026-0042 est envoyé
    Then la mission est retournée avec : statut, statut_rdv, lot, technicien + statut_invitation, EDL associés (statut, URLs si signés)

  Scenario: Liste paginée des missions
    Given 50 missions existent dans le workspace
    When un GET /api/v1/missions?page=1&per_page=20 est envoyé
    Then 20 missions sont retournées avec pagination (total, next_page)
```

---


# Modèle de données impacté
**Tables** : `Mission`, `MissionTechnicien`, `EDL_Inventaire`, `EDLLocataire`, `ApiKey` (pour auth)
**Endpoints V1** :
- `POST /api/v1/missions` — Créer une mission (+ EDL auto-générés)
- `GET /api/v1/missions` — Lister (pagination, filtres par statut/date/technicien)
- `GET /api/v1/missions/:id` — Détail (inclut EDL, technicien, statuts)
- `PATCH /api/v1/missions/:id` — Modifier (date, heure, technicien, commentaire). Respecte verrouillage si terminée.
- `DELETE /api/v1/missions/:id` — Annuler (motif obligatoire, bloqué si terminée, cf [US-825](https://www.notion.so/3271d95b2f8a81b1a89bcc72394b0423))

---


# Règles métier
- La création via API respecte les mêmes validations que le formulaire UI (lot doit exister, date obligatoire, etc.)
- L'API respecte l'isolation workspace (la clé API détermine le workspace)
- **Auto-terminaison** : quand tous les EDL sont signés, la mission passe automatiquement en `terminee` (cf EPIC 13)
- **Verrouillage mission terminée** : PATCH sur une mission terminée ne peut modifier que le `commentaire` (cf US-811)
- **Annulation** : DELETE requiert un motif, bloqué si mission terminée (cf US-825)
- Les mutations sont idempotentes quand possible (idempotency-key header)
- Format de réponse : JSON, pagination cursor-based

---


# Décisions
- **20/03/2026** : Alignement complet avec le modèle de données V1 (sens/avec_inventaire au lieu de type/sous_type, date_planifiee au lieu de date_prevue, statut_rdv, type_bail pour coloc, verrouillage + auto-terminaison + blocage annulation).