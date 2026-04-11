---
notion_id: "3131d95b-2f8a-813d-92a5-db44a85ed889"
notion_url: "https://www.notion.so/FCR-US601-R-cup-rer-les-URLs-PDF-et-web-d-un-EDL-sign-via-API-3131d95b2f8a813d92a5db44a85ed889"
last_synced: "2026-03-26T12:55:00.463Z"
created: "2026-02-26T15:58:00.000Z"
last_edited: "2026-03-23T12:09:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "601"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Sponsors: "clement.flatchecker@outlook.fr, Flat Checker "
  Time spent: "0"
  Nom: "Récupérer les URLs PDF et web d'un EDL signé via API"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3131d95b-2f8a-8132-940f-ee9684b08080"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Status: "📋 Backlog"
  Builders: "Tony Pineiro"
  Date de création: "2026-02-26T15:58:00.000Z"
  Code: "FCR - US601 Récupérer les URLs PDF et web d'un EDL signé via API"
  Time Spent Activation: "Non"
---

# FCR - US601 Récupérer les URLs PDF et web d'un EDL signé via API

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 601 |
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
| Code | FCR - US601 Récupérer les URLs PDF et web d'un EDL signé via API |
| Time Spent Activation | Non |


# User Story
**En tant que** système externe (Airtable, SaaS),
**je veux** récupérer les URLs du PDF et de la version web d'un EDL signé,
**afin de** les archiver et les diffuser depuis mon back-office.

---


# Critères d'acceptation (Gherkin)
```gherkin
Feature: Récupération URLs EDL signé

  Scenario: EDL signé → 4 URLs disponibles
    Given un EDL_Inventaire avec statut = "signe" et PDF généré
    When un GET /api/v1/edl-inventaires/:id est envoyé
    Then la réponse contient :
      | Champ             | Description                              | Persistant |
      | url_pdf           | PDF complet (document de travail)        | URL pré-signée S3 (24h) |
      | url_web           | Version web lecture seule                | Lien persistant |
      | url_pdf_legal     | PDF version contractuelle (annexe bail)  | URL pré-signée S3 (24h) |
      | url_web_legal     | Version web légale                       | Lien persistant |
      | url_verification  | Page publique de vérification (QR code)  | Lien persistant |
    And les URLs PDF sont des URLs pré-signées S3 (regénérées à chaque appel, expiration 24h)
    And les URLs web sont des liens persistants non expirants

  Scenario: EDL non signé → pas d'URLs
    Given un EDL_Inventaire avec statut = "brouillon"
    When un GET /api/v1/edl-inventaires/:id est envoyé
    Then les champs url_pdf, url_web, url_pdf_legal, url_web_legal, url_verification sont null
    And le statut est retourné pour suivi

  Scenario: EDL infructueux → pas d'URLs
    Given un EDL_Inventaire avec statut = "infructueux"
    When un GET /api/v1/edl-inventaires/:id est envoyé
    Then les URLs sont null
    And le motif_infructueux est retourné

  Scenario: Téléchargement direct du PDF
    Given un EDL_Inventaire signé avec url_pdf disponible
    When un GET /api/v1/edl-inventaires/:id/pdf est envoyé
    Then le PDF est retourné en binary stream (Content-Type: application/pdf)

  Scenario: Liste des EDL d'une mission
    Given une mission avec 3 EDL (2 signés, 1 brouillon)
    When un GET /api/v1/missions/:mission_id/edl-inventaires est envoyé
    Then les 3 EDL sont retournés avec leur statut et URLs respectives

  Scenario: Liste des EDL d'un lot
    Given un lot avec 5 EDL historiques
    When un GET /api/v1/lots/:lot_id/edl-inventaires est envoyé
    Then les EDL sont retournés avec pagination
```

---


# Modèle de données impacté
**Table** : `EDL_Inventaire` — champs `url_pdf`, `url_web`, `url_pdf_legal`, `url_web_legal`, `url_verification`
**Endpoints** :
- `GET /api/v1/edl-inventaires/:id` — Détail EDL avec URLs et statut
- `GET /api/v1/edl-inventaires/:id/pdf` — Téléchargement direct PDF
- `GET /api/v1/missions/:mission_id/edl-inventaires` — EDL d'une mission
- `GET /api/v1/lots/:lot_id/edl-inventaires` — EDL d'un lot (historique)

---


# Règles métier
- Les URL pré-signées S3 expirent après 24h (regénérées à chaque appel API)
- Les liens web sont persistants (non expirants) et publics avec token d'accès
- Le PDF n'est disponible que pour les EDL signés (statut = `signe`)
- L'accès via API est scopé au workspace de la clé API
- ⚠️ **Question ouverte** : faut-il 2 versions du rapport (standard + légal) ou un seul format ? Si un seul → simplification à 2 URLs. Cf EPIC 9.

---


# Décisions
- **20/03/2026** : Alignement avec le modèle de données V1 (table EDL_Inventaire, 4+1 URLs, statuts brouillon/signe/infructueux, ajout url_verification pour le scellé électronique).