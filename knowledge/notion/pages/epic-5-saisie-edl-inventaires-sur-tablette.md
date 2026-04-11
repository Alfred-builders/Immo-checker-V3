---
notion_id: "3131d95b-2f8a-81ad-a326-dea9c36ca6d6"
notion_url: "https://www.notion.so/EPIC-5-Saisie-EDL-Inventaires-sur-Tablette-3131d95b2f8a81ada326dea9c36ca6d6"
last_synced: "2026-03-26T12:54:20.187Z"
created: "2026-02-26T15:30:00.000Z"
last_edited: "2026-03-23T12:45:00.000Z"
properties:
  Status: "🧐 À cadrer"
  User Stories: "3271d95b-2f8a-8144-a9ad-ee462fed816b"
  Categories: "Feature, Design"
  Priority: "P0"
  Brique Fonctionnelle: "3131d95b-2f8a-8158-a7f1-e187fd1ba493"
  Business Value: "Cœur opérationnel du produit. Priorité #1 UX. Objectif : réduire le temps de saisie de 1h30 à 45min par EDL meublé."
  Completion: "0"
  Sponsors: "clement.flatchecker@outlook.fr, Flat Checker "
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "EPIC 5 — Saisie EDL / Inventaires sur Tablette"
---

# EPIC 5 — Saisie EDL / Inventaires sur Tablette

| Propriete | Valeur |
|-----------|--------|
| Status | 🧐 À cadrer |
| User Stories | 3271d95b-2f8a-8144-a9ad-ee462fed816b |
| Categories | Feature, Design |
| Priority | P0 |
| Brique Fonctionnelle | 3131d95b-2f8a-8158-a7f1-e187fd1ba493 |
| Business Value | Cœur opérationnel du produit. Priorité #1 UX. Objectif : réduire le temps de saisie de 1h30 à 45min par EDL meublé. |
| Completion | 0 |
| Sponsors | clement.flatchecker@outlook.fr, Flat Checker  |
| Project | 3071d95b-2f8a-80ac-9db8-dc4e9d2196c9 |
| Epic | EPIC 5 — Saisie EDL / Inventaires sur Tablette |

Application tablette iOS/Android pour la réalisation des EDL et inventaires sur le terrain.

## Périmètre fonctionnel
- Mode hors-ligne complet
- Navigation sur une seule page avec sections repliables (toggles)
- Navigation par ancres (sidebar pièces + scroll automatique)
- Sections par catégorie (14 catégories : mobilier, couverts, vaisselle, etc.)
- Auto-complétion basée sur la banque de vocabulaire
- Guidage non-bloquant (suggestions visuelles)
- Duplication de pièce (T2 → T3 → T4)
- Ajout/suppression de pièces
- Aides contextuelles (tips)
- Commentaire global par pièce
- Items avec sous-items (2-3 niveaux max)
- **Label personnalisé des items** (`EvaluationItem.label`) :
  - **À la création de la pièce** : si le template définit des `labels_defaut` (EPIC 4, `TemplatePieceItem.labels_defaut`), les instances sont pré-remplies avec ces labels. Ex : Mur ×4 → "Mur d'accès", "Mur gauche", "Mur droit", "Mur de face".
  - **Si pas de labels prédéfinis** : auto-numérotation ("Mur", "Mur 2", "Mur 3").
  - **Renommage libre** : le technicien peut renommer chaque instance en tapant sur le label ("Mur côté fenêtre").
  - **Affichage** : si `label` est renseigné → affiche `label`. Sinon → affiche `CatalogueItem.nom` (+ numéro si doublon).
  - Le label personnalisé apparaît dans le PDF (EPIC 9).
- Vue missions du jour (planning technicien)

## Gestion des photos (ex-EPIC 7, fusionnée ici)
> ✅ L'EPIC 7 (Gestion des Photos) est fusionnée dans l'EPIC 5 car la prise de photos fait partie intégrante du flux de saisie terrain.

### Photos attachées aux items
- Chaque `EvaluationItem` peut avoir des photos associées
- Pas de galerie globale — les photos sont toujours rattachées à un item ou sous-item spécifique
- L'association photo-item est la clé pour les comparatifs entrée/sortie (V2)

### Photos d'ensemble par pièce
- Champ `photos_ensemble` sur `PieceEDL` : photo(s) générale(s) de la pièce avant détail par item
- Nombre minimum de photos configurable par pièce (`nb_photos_min` sur PieceEDL)

### Photos individuelles par sous-item
- Photo d'ensemble sur l'item parent (ex : lavabo complet)
- Photos individuelles sur chaque sous-item (ex : robinet, bonde, siphon)
- Le technicien peut prendre une photo directement depuis la fiche item

### Stockage & optimisation
- Stockage S3-compatible (R2 Cloudflare, AWS S3, Supabase Storage)
- Résolution configurable par workspace (qualité vs poids)
- Compression automatique avant upload (réduire le poids sans perte visible)
- Optimisation pour intégration dans les PDF générés (EPIC 9)

### UX prise de photo (US à créer quand on attaque l'app mobile)
- Bouton photo accessible directement depuis chaque item
- Raccourcis photos (photo globale pièce, photo item, photo sous-item)
- Preview inline après prise de photo
- Suppression/remplacement d'une photo
- Mode hors-ligne : photos stockées localement, syncées au retour connexion

---


## Points UX spécifiques à l'app mobile

### Pattern de chargement des items dans une pièce
Deux options à trancher :
- **Option A (Nockee)** : pièce vide → bouton "Remplir" → items pré-cochés → review/décocher avant de charger
- **Option B (Immopad)** : création pièce → tous les items chargés d'office → supprimer les non pertinents
- **À valider avec FC** quand on attaquera cette EPIC

### Colocation — Duplication et modification d'EDL sur tablette
Pour les colocations à bails individuels (N EDL sur le même lot dans la même mission) :
1. Le technicien réalise l'EDL complet pour le 1er locataire
1. Il **duplique** l'EDL (bouton "Dupliquer" sur la fiche mission) → copie structure + contenu + photos
1. Il ouvre l'EDL dupliqué et **modifie** :
  - Change le locataire
  - **Retire la chambre** que ce locataire n'occupe pas
  - **Ajoute ou garde la chambre** qu'il occupe
  - Le reste (parties communes, cuisine, SDB…) est identique et n'a pas besoin d'être retouché
1. Répète pour chaque colocataire
**La seule différence entre les EDL d'une même mission coloc = le locataire + la/les chambre(s).** Tout le reste est partagé.

### Saisie des clés pendant l'EDL (CleMission) — cf [US-822](https://www.notion.so/3271d95b2f8a810cb29cf28899dba1de)
Pendant la réalisation d'un EDL sur tablette, une section "Clés" permet de documenter les clés :
- **EDL de sortie** : le locataire remet ses clés au technicien. Saisie : type (enum 7 valeurs), quantité, photo(s), commentaire. Statut initial = `a_deposer`.
- **EDL d'entrée** : clés remises au locataire entrant. Même saisie, statut = `remise` (documentaire, pas de workflow dépôt).
- Chaque CleMission est liée à l'`edl_id` (pas mission_id) — en colocation, chaque locataire a ses propres clés.
- Le document PDF (EPIC 9) affiche les clés de l'EDL correspondant.
- Après la mission, le technicien suit le dépôt des clés via la checklist du dashboard (US-816) et peut confirmer le dépôt (`a_deposer → deposee`).

### Création EDL sans mission (bailleur direct)
- Un utilisateur (profil bailleur) peut lancer un EDL directement depuis l'app sans mission planifiée
- Le système crée automatiquement une mission en arrière-plan pour homogénéité des données
- Flow sans couture : créer EDL → sélectionner lot → saisie → signature → PDF

### Technicien = app mobile uniquement
- Le technicien n'a accès qu'à l'app mobile/tablette (pas de webapp desktop)
- L'app couvre : dashboard, missions, accepter/refuser, indisponibilités, saisie EDL, signature, gestion clés

## ⚠️ Points à cadrer
- Dépend des décisions EPIC 4 (templates et référentiels, ex-EPIC 6 fusionnée)
- Pattern de chargement items (à valider avec FC)
- Maquettage et prototypage à itérer en priorité
- Optimisation tablette mode paysage, zones de tap 44px min
- App responsive tablette + mobile (iOS + Android)

## Dépendances
- **Dépend de** : EPIC 4 (templates + référentiels), EPIC 13 (missions)