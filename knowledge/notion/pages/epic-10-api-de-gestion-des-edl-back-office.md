---
notion_id: "3131d95b-2f8a-8132-940f-ee9684b08080"
notion_url: "https://www.notion.so/EPIC-10-API-de-Gestion-des-EDL-Back-office-3131d95b2f8a8132940fee9684b08080"
last_synced: "2026-03-26T12:54:31.682Z"
created: "2026-02-26T15:29:00.000Z"
last_edited: "2026-03-23T13:27:00.000Z"
properties:
  Status: "📋 Planned"
  User Stories: "3131d95b-2f8a-81b8-9178-f139d29338fc, 3131d95b-2f8a-8148-9e27-f328c415050a, 3131d95b-2f8a-813d-92a5-db44a85ed889, 3131d95b-2f8a-81d2-aff2-ccc937f3a05a, 3131d95b-2f8a-811d-af7b-c9b6f943d91a"
  Categories: "Technical, Infrastructure"
  Priority: "P0"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Business Value: "Intégration avec le back-office existant (Airtable). Permet l'automatisation et la création programmatique d'EDL. Fondation pour les intégrations futures."
  Completion: "0"
  Sponsors: "clement.flatchecker@outlook.fr, Flat Checker "
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "EPIC 10 — API de Gestion des EDL (Back-office)"
---

# EPIC 10 — API de Gestion des EDL (Back-office)

| Propriete | Valeur |
|-----------|--------|
| Status | 📋 Planned |
| User Stories | 3131d95b-2f8a-81b8-9178-f139d29338fc, 3131d95b-2f8a-8148-9e27-f328c415050a, 3131d95b-2f8a-813d-92a5-db44a85ed889, 3131d95b-2f8a-81d2-aff2-ccc937f3a05a, 3131d95b-2f8a-811d-af7b-c9b6f943d91a |
| Categories | Technical, Infrastructure |
| Priority | P0 |
| Brique Fonctionnelle | 3131d95b-2f8a-81de-af8e-d782a1b05a0e |
| Business Value | Intégration avec le back-office existant (Airtable). Permet l'automatisation et la création programmatique d'EDL. Fondation pour les intégrations futures. |
| Completion | 0 |
| Sponsors | clement.flatchecker@outlook.fr, Flat Checker  |
| Project | 3071d95b-2f8a-80ac-9db8-dc4e9d2196c9 |
| Epic | EPIC 10 — API de Gestion des EDL (Back-office) |

API REST sécurisée par workspace permettant l'intégration avec Airtable et tout SaaS/automatisation externe.

## Périmètre fonctionnel
- **Création de Missions** (les EDL sont auto-générés à partir de la mission — cf US-600). Support colocation (type_bail individuel/collectif).
- **Récupération des URLs** PDF & Web (4+1 URLs) après signature (cf US-601)
- **Webhooks** : `edl.signed`, `edl.infructueux`, `mission.terminee`, `mission.annulee`, `mission.created` (cf US-602)
- **CRUD Missions** : création, lecture, modification, annulation (planification programmatique)
- **Assignation techniciens** via l'API
- API sécurisée par **API keys** par workspace (cf US-599)
- Documentation interactive **OpenAPI/Swagger** (cf US-603)
- Accès depuis le back-office : **Paramètres > API & Intégrations** (EPIC 11)

## Règles métier transversales (appliquées côté API)
- **Auto-terminaison** : quand tous les EDL d'une mission sont signés, la mission passe automatiquement en `terminee`
- **Verrouillage mission terminée** : PATCH sur une mission terminée ne peut modifier que le `commentaire`
- **Annulation** : DELETE requiert un motif obligatoire, bloqué si mission terminée (EDL signés = documents légaux)
- **Isolation workspace** : la clé API détermine le workspace, toutes les requêtes sont scopées

## Dépendances
- **Dépend de** : EPIC 11 (auth/workspace), et globalement toutes les EPICs métier