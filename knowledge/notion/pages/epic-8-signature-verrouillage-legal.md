---
notion_id: "3131d95b-2f8a-81ed-aa72-e2a4b2ff1dac"
notion_url: "https://www.notion.so/EPIC-8-Signature-Verrouillage-L-gal-3131d95b2f8a81edaa72e2a4b2ff1dac"
last_synced: "2026-03-26T12:54:21.735Z"
created: "2026-02-26T15:30:00.000Z"
last_edited: "2026-03-23T13:26:00.000Z"
properties:
  Status: "🧐 À cadrer"
  Categories: "Feature"
  Priority: "P0"
  Brique Fonctionnelle: "3131d95b-2f8a-8158-a7f1-e187fd1ba493"
  Business Value: "Verrouillage légal post-signature. Valeur juridique du document."
  Completion: "0"
  Sponsors: "clement.flatchecker@outlook.fr, Flat Checker "
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "EPIC 8 — Signature & Verrouillage Légal"
---

# EPIC 8 — Signature & Verrouillage Légal

| Propriete | Valeur |
|-----------|--------|
| Status | 🧐 À cadrer |
| Categories | Feature |
| Priority | P0 |
| Brique Fonctionnelle | 3131d95b-2f8a-8158-a7f1-e187fd1ba493 |
| Business Value | Verrouillage légal post-signature. Valeur juridique du document. |
| Completion | 0 |
| Sponsors | clement.flatchecker@outlook.fr, Flat Checker  |
| Project | 3071d95b-2f8a-80ac-9db8-dc4e9d2196c9 |
| Epic | EPIC 8 — Signature & Verrouillage Légal |

Signature manuscrite sur tablette et verrouillage légal du document.

## Périmètre fonctionnel

### Signature manuscrite
- Signature manuscrite sur tablette (pas de signature électronique certifiée — trop coûteux)
- Chaque partie prenante signe sur la tablette : technicien + locataire (+ représentant avec procuration si applicable)
- La signature est capturée comme image et intégrée au PDF

### Verrouillage post-signature
- Impossibilité de modifier un EDL après signature (document légal)
- Le statut passe à `signe` et toutes les données de l'EDL sont verrouillées en écriture
- Déclenche la génération PDF + version web (EPIC 9)
- Déclenche l'auto-terminaison de la mission si tous les EDL liés sont signés (EPIC 13)

### Scellé électronique & vérification d'authenticité
- À la signature, un `verification_token` (hash SHA-256 du contenu signé) est généré et stocké sur `EDL_Inventaire`
- Une `url_verification` publique est créée (ex : `app.immochecker.fr/verify/{token}`)
- Un **QR code** est généré dynamiquement dans le PDF à partir de `url_verification` (EPIC 9)
- **Page web publique de vérification** (pas d'auth) : logo workspace, type de document, date, adresse, bouton télécharger, badge "protégé contre la fraude par scellé électronique"
- Si le document a été altéré post-signature → avertissement sur la page de vérification
- Benchmark : Nockee ([app.nockee.fr/verify](http://app.nockee.fr/verify))

### Avenants (post-signature)
- Le locataire dispose de **10 jours** pour émettre des réserves sur un EDL d'entrée (article 3-2 loi du 6 juillet 1989)
- Un avenant est un document lié à l'EDL original via `EDL_Inventaire.avenant_parent_id`
- L'EDL original reste inchangé — l'avenant est un document séparé

## ⚠️ Points à cadrer (avenants)
- **Workflow avenant** : comment le locataire soumet-il ses réserves ? Email ? Interface dédiée ? Formulaire en ligne ?
- **Double signature** : l'avenant nécessite-t-il la signature du bailleur/représentant + locataire ?
- **Format** : l'avenant génère-t-il un PDF séparé ou un addendum au PDF original ?
- **Notification** : qui est notifié quand un avenant est soumis ?
- ⚠️ Impact chiffrage si workflow complexe : +1 000 - 2 000€

## Décisions
- **23/03/2026** : Ajout du scellé électronique (verification_token, url_verification, QR code, page publique de vérification). Alignement avec EPIC 9 et Vision Fonctionnelle.
- **23/03/2026** : Avenant = document séparé lié via `avenant_parent_id`. EDL original inchangé. Délai légal 10 jours intégré. Workflow détaillé encore à cadrer.
- US à créer quand on attaquera l'app mobile (lot 2).

## Dépendances
- **Dépend de** : EPIC 5 (interface tablette)