---
notion_id: "3131d95b-2f8a-814b-95e7-e42537c63de7"
notion_url: "https://www.notion.so/EPIC-12-Saisie-Vocale-IA-3131d95b2f8a814b95e7e42537c63de7"
last_synced: "2026-03-26T12:54:32.995Z"
created: "2026-02-26T15:30:00.000Z"
last_edited: "2026-02-26T15:30:00.000Z"
properties:
  Status: "🧐 À cadrer"
  Categories: "Feature, Research"
  Priority: "P1"
  Brique Fonctionnelle: "3131d95b-2f8a-8158-a7f1-e187fd1ba493"
  Business Value: "Différenciant majeur vs concurrence. Objectif : diviser par 2 le temps de saisie inventaire (de 15min à 7-10min par pièce meublée)."
  Completion: "0"
  Sponsors: "clement.flatchecker@outlook.fr, Flat Checker "
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "EPIC 12 — Saisie Vocale & IA"
---

# EPIC 12 — Saisie Vocale & IA

| Propriete | Valeur |
|-----------|--------|
| Status | 🧐 À cadrer |
| Categories | Feature, Research |
| Priority | P1 |
| Brique Fonctionnelle | 3131d95b-2f8a-8158-a7f1-e187fd1ba493 |
| Business Value | Différenciant majeur vs concurrence. Objectif : diviser par 2 le temps de saisie inventaire (de 15min à 7-10min par pièce meublée). |
| Completion | 0 |
| Sponsors | clement.flatchecker@outlook.fr, Flat Checker  |
| Project | 3071d95b-2f8a-80ac-9db8-dc4e9d2196c9 |
| Epic | EPIC 12 — Saisie Vocale & IA |

Dictée vocale assistée par IA pour la saisie des inventaires.

## Périmètre fonctionnel
- Dictée vocale pour saisie des inventaires
- Transcription via Whisper/Deepgram (connexion requise)
- Parsing IA : extraction quantité, élément, spécificité, état
- Auto-catégorisation dans les bonnes sections (14 catégories)
- Pré-remplissage avec relecture/validation manuelle
- Guide contextuel de saisie vocale
- Corrections temps réel ("non en fait c'est rouge pas orange")
- Fallback manuel : choix entre vocal ou saisie classique

## Chiffrage détaillé
- Transcription vocale : 1 500 - 2 500€
- Parsing IA + prompt engineering : 3 000 - 5 000€
- Interface vocale : 2 000 - 3 000€
- Corrections temps réel : 2 000 - 3 000€
- Tests & itérations : 3 000 - 3 500€
- **Total : 12 000 - 15 000€**

## Dépendances
- **Dépend de** : EPIC 5 (interface tablette), EPIC 4 (templates/vocabulaire)

---

> ⚠️ **Priorité P1** — Fort différenciant mais non bloquant pour la V1.