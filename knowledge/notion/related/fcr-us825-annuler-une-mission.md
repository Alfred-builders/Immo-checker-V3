---
notion_id: "3271d95b-2f8a-81b1-a89b-cc72394b0423"
notion_url: "https://www.notion.so/FCR-US825-Annuler-une-mission-3271d95b2f8a81b1a89bcc72394b0423"
last_synced: "2026-03-26T12:57:02.937Z"
created: "2026-03-18T14:33:00.000Z"
last_edited: "2026-03-20T08:22:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "825"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Sponsors: "clement.flatchecker@outlook.fr, Flat Checker "
  Time spent: "0"
  Nom: "Annuler une mission"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3131d95b-2f8a-8131-b48b-e85641cc8c31"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Status: "📌 Ready"
  Builders: "Tony Pineiro"
  Date de création: "2026-03-18T14:33:00.000Z"
  Code: "FCR - US825 Annuler une mission"
  Time Spent Activation: "Non"
---

# FCR - US825 Annuler une mission

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 825 |
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
| Code | FCR - US825 Annuler une mission |
| Time Spent Activation | Non |


# User Story
**En tant que** admin/gestionnaire ou technicien,
**je veux** annuler une mission planifiée,
**afin de** gérer les imprévus tout en protégeant les données légales (EDL signés).

---


# Critères d'acceptation (Gherkin)
```gherkin
Feature: Annulation de mission

  # ──────────────────────────────────────
  # ANNULATION PAR L'ADMIN (WEBAPP)
  # ──────────────────────────────────────

  Scenario: Annulation par l'admin — mission planifiée ou assignée
    Given une mission en statut "planifiee" ou "assignee"
    And aucun EDL lié n'est signé
    When l'admin clique "Annuler" et saisit un motif (obligatoire)
    Then le statut mission passe à "annulee"
    And les EDL associés passent en statut "infructueux"
    And une notification est envoyée au technicien assigné

  Scenario: Annulation bloquée — mission terminée (EDL signés)
    Given une mission en statut "terminee"
    And au moins un EDL lié a le statut "signe"
    Then le bouton "Annuler" est masqué
    And si l'action est tentée (API), elle est rejetée avec erreur "Impossible d'annuler une mission avec des EDL signés"

  Scenario: Annulation avec EDL en cours (non signés)
    Given une mission avec des EDL en statut "brouillon" ou "en_cours" (pas encore signés)
    When l'admin clique "Annuler" + motif
    Then un avertissement s'affiche : "X EDL en cours seront marqués infructueux. Confirmer ?"
    When l'admin confirme
    Then le statut mission passe à "annulee"
    And les EDL non signés passent en statut "infructueux"

  # ──────────────────────────────────────
  # ANNULATION PAR LE TECHNICIEN (MOBILE)
  # ──────────────────────────────────────

  Scenario: Annulation par le technicien — mission dans + de 48h
    Given une mission assignée dont la date planifiée est dans plus de 48h
    When le technicien clique "Annuler" + motif (obligatoire)
    Then le statut mission passe à "annulee"
    And les EDL associés passent en statut "infructueux"
    And une notification est envoyée à l'admin

  Scenario: Annulation bloquée par le technicien — mission dans - de 48h
    Given une mission assignée dont la date planifiée est dans moins de 48h
    Then le bouton "Annuler" est masqué
    And un message indique : "Contactez votre gestionnaire"

  Scenario: Annulation bloquée par le technicien — mission terminée
    Given une mission en statut "terminee"
    Then le bouton "Annuler" n'est pas affiché (ni admin, ni technicien)
```

---


# Règles métier
- **Motif obligatoire** pour toute annulation
- **Technicien** : annulation bloquée si < 48h avant la date planifiée. Message "Contactez votre gestionnaire"
- **Admin** : peut annuler à tout moment SAUF si la mission est terminée (avec EDL signés)
- **Mission terminée = annulation impossible** : une mission avec au moins un EDL signé ne peut plus être annulée. Les EDL signés sont des documents légaux irrévocables.
- **Auto-terminaison** : une mission passe automatiquement en `terminee` quand tous ses EDL liés sont signés (cf [EPIC 13](https://www.notion.so/3131d95b2f8a8131b48be85641cc8c31)). En colocation (N EDL), la mission attend le dernier EDL signé.
- **EDL non signés** : si des EDL sont en cours (brouillon, en_cours) mais pas encore signés, l'admin peut annuler avec confirmation → les EDL passent en "infructueux"
- **Notification croisée** : admin → technicien et technicien → admin
- **Protection API** : l'endpoint d'annulation vérifie la présence d'EDL signés côté serveur (pas seulement côté UI)

---


# Décisions
- **20/03/2026** : Ajout du blocage explicite de l'annulation pour les missions terminées (EDL signés). Ajout du scénario intermédiaire (EDL en cours non signés). Protection API côté serveur.