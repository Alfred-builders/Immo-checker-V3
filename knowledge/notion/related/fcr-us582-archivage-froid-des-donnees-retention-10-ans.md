---
notion_id: "3131d95b-2f8a-81d8-8baa-e3ac1558e639"
notion_url: "https://www.notion.so/FCR-US582-Archivage-froid-des-donn-es-r-tention-10-ans-3131d95b2f8a81d88baae3ac1558e639"
last_synced: "2026-03-26T12:55:12.800Z"
created: "2026-02-26T15:50:00.000Z"
last_edited: "2026-03-23T13:09:00.000Z"
properties:
  Not included in audit: "Non"
  Catégorie: "User Story"
  Identifiant: "582"
  Created by: "Tony Pineiro"
  Priority: "🔴 P0"
  Time spent: "0"
  Nom: "Archivage froid des données (rétention 10+ ans)"
  Pricing: "0"
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "3131d95b-2f8a-812c-ab8b-ed6b2d98c4fa"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Status: "📋 Backlog"
  Builders: "Tony Pineiro"
  Date de création: "2026-02-26T15:50:00.000Z"
  Code: "FCR - US582 Archivage froid des données (rétention 10+ ans)"
  Time Spent Activation: "Non"
---

# FCR - US582 Archivage froid des données (rétention 10+ ans)

| Propriete | Valeur |
|-----------|--------|
| Not included in audit | Non |
| Catégorie | User Story |
| Identifiant | 582 |
| Created by | Tony Pineiro |
| Priority | 🔴 P0 |
| Time spent | 0 |
| Pricing | 0 |
| Project | 3071d95b-2f8a-80ac-9db8-dc4e9d2196c9 |
| Epic | 3131d95b-2f8a-812c-ab8b-ed6b2d98c4fa |
| Brique Fonctionnelle | 3131d95b-2f8a-81de-af8e-d782a1b05a0e |
| Status | 📋 Backlog |
| Builders | Tony Pineiro |
| Date de création | 2026-02-26T15:50:00.000Z |
| Code | FCR - US582 Archivage froid des données (rétention 10+ ans) |
| Time Spent Activation | Non |


# User Story
**En tant qu'** admin d'un workspace,
**je veux** que les EDL signés et leurs pièces jointes soient archivés durablement,
**afin de** respecter les obligations légales de conservation.

---


# Critères d'acceptation (Gherkin)
```javascript
Feature: Archivage S3

  Scenario: Stockage hot en V1
    Given un EDL signé
    Then le PDF et les photos restent en stockage standard (hot) accessible instantanément
    And aucune migration vers le stockage froid n'est déclenchée en V1
    And les URLs de téléchargement et la page de vérification (url_verification) sont toujours accessibles

  Scenario: Rétention minimale 10 ans
    Given un EDL signé il y a 10 ans
    Then l'EDL et ses pièces jointes sont toujours disponibles
    And aucune suppression automatique n'a eu lieu

  Scenario: Migration cold (V2, quand le volume le justifie)
    Given des centaines de milliers d'EDL archivés
    Then une règle lifecycle S3 pourra être activée : hot (0-90j) → warm (90j-2ans) → cold/glacier (2ans+)
    And les métadonnées en base restent toujours accessibles
    And la page de vérification (url_verification) reste hot même si le PDF est cold
```

---


# Règles métier
- Conservation minimale : 10 ans (obligation légale EDL)
- **V1 : tout en hot** (stockage standard). Le volume de FC (~100-150 EDL/mois) ne justifie pas le cold storage. Coût négligeable.
- **V2** : quand le volume le justifie (commercialisation SaaS, centaines de clients), activer lifecycle S3 : hot → warm → cold/glacier. La page de vérification (QR code) doit toujours rester accessible instantanément.
- Les métadonnées en base restent toujours accessibles
- Aucune suppression automatique des fichiers