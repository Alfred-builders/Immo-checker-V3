---
notion_id: "3131d95b-2f8a-81a1-bb6a-d5c2b927d5e5"
notion_url: "https://www.notion.so/EPIC-9-G-n-ration-Diffusion-des-Rapports-3131d95b2f8a81a1bb6ad5c2b927d5e5"
last_synced: "2026-03-26T12:54:23.426Z"
created: "2026-02-26T15:30:00.000Z"
last_edited: "2026-03-23T12:42:00.000Z"
properties:
  Status: "🧐 À cadrer"
  User Stories: "3271d95b-2f8a-815c-84d0-fe7a68deca14, 3271d95b-2f8a-8113-a23c-ef06c1f3ec24"
  Categories: "Feature"
  Priority: "P0"
  Brique Fonctionnelle: "3131d95b-2f8a-8158-a7f1-e187fd1ba493"
  Business Value: "Production des livrables finaux : PDF professionnel et version web. Duplication intelligente pour gain de temps. Comparatifs entrée/sortie."
  Completion: "0"
  Sponsors: "clement.flatchecker@outlook.fr, Flat Checker "
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "EPIC 9 — Génération & Diffusion des Rapports"
---

# EPIC 9 — Génération & Diffusion des Rapports

| Propriete | Valeur |
|-----------|--------|
| Status | 🧐 À cadrer |
| User Stories | 3271d95b-2f8a-815c-84d0-fe7a68deca14, 3271d95b-2f8a-8113-a23c-ef06c1f3ec24 |
| Categories | Feature |
| Priority | P0 |
| Brique Fonctionnelle | 3131d95b-2f8a-8158-a7f1-e187fd1ba493 |
| Business Value | Production des livrables finaux : PDF professionnel et version web. Duplication intelligente pour gain de temps. Comparatifs entrée/sortie. |
| Completion | 0 |
| Sponsors | clement.flatchecker@outlook.fr, Flat Checker  |
| Project | 3071d95b-2f8a-80ac-9db8-dc4e9d2196c9 |
| Epic | EPIC 9 — Génération & Diffusion des Rapports |

Génération des rapports PDF et version web après signature. Intègre le scellé électronique et la page de vérification d'authenticité.

## Périmètre fonctionnel

### Génération PDF
- Génération PDF professionnelle (EDL & Inventaire) via service dédié (Gotenberg, Puppeteer ou API spécialisée)
- Structure claire et lisible
- **QR code de vérification** intégré en en-tête de première page (encadré : QR + "Ce document est protégé contre la fraude")
- Logo workspace personnalisable

### Version web
- Version web en lecture seule, consultable dans un navigateur
- **Liens persistants non expirants** (`url_web`, `url_web_legal`)
- Bouton "Télécharger PDF" sur la page web

### URLs par document (sur `EDL_Inventaire`)
- `url_pdf` — PDF complet (document de travail)
- `url_web` — version web (lecture seule)
- `url_pdf_legal` — PDF version contractuelle (annexée au bail)
- `url_web_legal` — version web légale
- ⚠️ **Question ouverte** : faut-il 2 versions (standard + légal) ou un seul format ? À valider avec FC. Si un seul format → simplification à 2 URLs.

### Scellé électronique & vérification (benchmark Nockee)
- À la signature, un `verification_token` (hash unique du contenu signé) est généré
- Une `url_verification` publique est créée (ex : [app.immochecker.fr/verify/{token}](http://app.immochecker.fr/verify/%7Btoken%7D))
- Le QR code est généré dynamiquement dans le PDF à partir de `url_verification`
- **Page web publique de vérification** (pas d'auth) : logo, type de document, date, adresse, bouton télécharger, badge "protégé contre la fraude par scellé électronique"
- Si le document a été altéré post-signature → avertissement sur la page de vérification

### Label personnalisé des items
- Le PDF affiche le `label` personnalisé de chaque item si renseigné, sinon le nom du CatalogueItem (+ numéro si doublon)
- Ex : "Mur de face" au lieu de "Mur 1", "Fenêtre salon" au lieu de "Fenêtre 2"
- Cf EPIC 5 + Spécification Items (section 2, comportement UX)

### Section Clés dans le document
- Le PDF et la version web affichent la **section Clés** de l'EDL : liste des clés saisies pendant l'EDL (type, quantité, photo(s), commentaire)
- **EDL d'entrée** : clés remises au locataire (statut `remise`) — traçabilité légale
- **EDL de sortie** : clés récupérées par le technicien (statut `a_deposer`)
- En colocation, chaque document EDL n'affiche que les clés de **son** locataire (`CleMission.edl_id`)
- Cf [US-822](https://www.notion.so/3271d95b2f8a810cb29cf28899dba1de)

### Duplication intelligente
- Options granulaires : garder structure des pièces uniquement, garder contenu des pièces (items), garder/supprimer commentaires, garder/supprimer photos
- **Baguette magique** : vider états et commentaires mais garder structure

### Liaison items entrée ↔ sortie
- Association photo-item pour comparatifs détaillés (s'appuie sur EPIC 7)
- Préparation V2 : comparatifs automatiques entrée/sortie

## Dépendances
- **Dépend de** : EPIC 5 (saisie + photos, ex-EPIC 7 fusionnée), EPIC 8 (signature et verrouillage)
- **Lié à** : EPIC 10 (API pour récupérer les URLs)