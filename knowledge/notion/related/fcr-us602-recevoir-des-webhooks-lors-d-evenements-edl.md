---
notion_id: "3131d95b-2f8a-81d2-aff2-ccc937f3a05a"
notion_url: "https://www.notion.so/FCR-US602-Recevoir-des-webhooks-lors-d-v-nements-EDL-3131d95b2f8a81d2aff2ccc937f3a05a"
last_synced: "2026-03-26T12:54:51.888Z"
created: "2026-02-26T15:58:00.000Z"
last_edited: "2026-03-23T12:09:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "602"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Sponsors: "clement.flatchecker@outlook.fr, Flat Checker "
  Time spent: "0"
  Nom: "Recevoir des webhooks lors d'événements EDL"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3131d95b-2f8a-8132-940f-ee9684b08080"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Status: "📋 Backlog"
  Builders: "Tony Pineiro"
  Date de création: "2026-02-26T15:58:00.000Z"
  Code: "FCR - US602 Recevoir des webhooks lors d'événements EDL"
  Time Spent Activation: "Non"
---

# FCR - US602 Recevoir des webhooks lors d'événements EDL

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 602 |
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
| Code | FCR - US602 Recevoir des webhooks lors d'événements EDL |
| Time Spent Activation | Non |


# User Story
**En tant qu'** admin d'un workspace,
**je veux** configurer des webhooks pour être notifié automatiquement quand un EDL change de statut,
**afin que** mon back-office (Airtable, n8n) puisse réagir en temps réel.

---


# Critères d'acceptation (Gherkin)
```gherkin
Feature: Webhooks événements EDL

  Scenario: Configuration d'un webhook
    Given un admin du workspace "FlatChecker"
    When il crée un webhook avec:
      | url           | https://hooks.airtable.com/xxx |
      | events        | edl.signed, edl.completed      |
      | secret        | whsec_xxxx (auto-généré)       |
    Then le webhook est enregistré et actif
    And un ping de vérification est envoyé à l'URL

  Scenario: Notification EDL signé
    Given un webhook configuré pour "edl.signed"
    When un EDL est signé sur la tablette
    Then un POST est envoyé à l'URL du webhook
    And le payload contient: event, edl_id, mission_id, lot_id, url_pdf, url_web, url_pdf_legal, url_web_legal, url_verification, timestamp
    And le header contient une signature HMAC pour vérification

  Scenario: Notification mission terminée
    Given un webhook configuré pour "mission.completed"
    When tous les EDL/inventaires d'une mission sont signés
    Then un POST est envoyé avec les détails de la mission complète

  Scenario: Retry en cas d'échec
    Given un webhook configuré
    When l'URL retourne une erreur 500
    Then le système retry 3 fois (délai exponentiel: 1min, 5min, 30min)
    And après 3 échecs, le webhook est marqué "failing"
    And l'admin est notifié

  Scenario: Désactivation d'un webhook
    Given un webhook actif
    When l'admin le désactive
    Then plus aucun événement n'est envoyé à cette URL
```

---


# Modèle de données impacté
**Table** : `Webhook`
- `id` (uuid, PK), `workspace_id` (FK)
- `url` (string), `secret` (string, pour HMAC)
- `events` (json array), `is_active` (bool)
- `last_triggered_at` (datetime?), `last_status_code` (int?)
- `failure_count` (int, default: 0)
**Table** : `WebhookLog`
- `id`, `webhook_id` (FK), `event` (string)
- `payload` (json), `status_code` (int), `response_body` (text?)
- `created_at`

---


# Règles métier
- Les webhooks utilisent une signature HMAC-SHA256 pour sécuriser les payloads
- Événements supportés V1 : `edl.signed`, `edl.infructueux`, `mission.terminee` (auto-terminaison, tous EDL signés), `mission.annulee`, `mission.created`
- Timeout de livraison : 10 secondes
- Après 10 échecs consécutifs, le webhook est automatiquement désactivé
- Les logs webhook sont conservés 30 jours