---
notion_id: "3131d95b-2f8a-81c3-b92a-c62e50395681"
notion_url: "https://www.notion.so/EPIC-4-Gestion-des-Templates-EDL-Inventaires-3131d95b2f8a81c3b92ac62e50395681"
last_synced: "2026-03-26T12:54:15.211Z"
created: "2026-02-26T15:29:00.000Z"
last_edited: "2026-03-23T12:45:00.000Z"
properties:
  Status: "📌 Ready to Start"
  User Stories: "3271d95b-2f8a-811c-8990-f83d81219dfe, 3271d95b-2f8a-8151-87df-f7eac418165f, 3271d95b-2f8a-814d-b9a1-d7e8fedfd6ae, 3271d95b-2f8a-817e-a4e4-e4c9fc311a11"
  Categories: "Feature"
  Priority: "P0"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Business Value: "Structure des documents EDL et inventaires. Définit ce que le technicien voit et remplit sur la tablette. Banque de vocabulaire exhaustive."
  Completion: "0"
  Sponsors: "clement.flatchecker@outlook.fr, Flat Checker "
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "EPIC 4 — Gestion des Templates (EDL & Inventaires)"
---

# EPIC 4 — Gestion des Templates (EDL & Inventaires)

| Propriete | Valeur |
|-----------|--------|
| Status | 📌 Ready to Start |
| User Stories | 3271d95b-2f8a-811c-8990-f83d81219dfe, 3271d95b-2f8a-8151-87df-f7eac418165f, 3271d95b-2f8a-814d-b9a1-d7e8fedfd6ae, 3271d95b-2f8a-817e-a4e4-e4c9fc311a11 |
| Categories | Feature |
| Priority | P0 |
| Brique Fonctionnelle | 3131d95b-2f8a-81de-af8e-d782a1b05a0e |
| Business Value | Structure des documents EDL et inventaires. Définit ce que le technicien voit et remplit sur la tablette. Banque de vocabulaire exhaustive. |
| Completion | 0 |
| Sponsors | clement.flatchecker@outlook.fr, Flat Checker  |
| Project | 3071d95b-2f8a-80ac-9db8-dc4e9d2196c9 |
| Epic | EPIC 4 — Gestion des Templates (EDL & Inventaires) |

Gestion des templates de pièces, du catalogue d'items, de la configuration des critères d'évaluation, et des valeurs de référentiel. Accessible depuis la page **Paramètres** (EPIC 11).
> 📋 **Spec détaillée** : voir la page [Spécification — Items, Critères d'évaluation & Templates EDL/Inventaire](https://www.notion.so/3251d95b2f8a81d9b0befe4d40f7fb68)

## Architecture retenue
**Templates par type de pièce**, pas par type de bien (T2, T4, studio…). L'utilisateur compose son EDL pièce par pièce. Un seul template par type de pièce en base, avec un flag `contexte` (EDL / Inventaire) sur chaque item — la séparation est gérée côté front-end.
**Pas de table Section** — la catégorie est un attribut `enum` de `CatalogueItem`. Le groupement visuel (Revêtements, Plomberie, Électricité…) se fait côté front-end.

## Périmètre fonctionnel

### TypePiece
- CRUD des types de pièces (Cuisine, Chambre, SDB, Cave…)
- Champs : nom, `categorie_piece` (vie / eau_sanitaires / circulations / exterieur_annexes / parties_communes), icon, source (plateforme / workspace)
- ~30 types de pièces par défaut au niveau plateforme
- Chaque workspace peut ajouter ses propres types

### CatalogueItem
- Catalogue centralisé d'items avec 3 niveaux : **plateforme** (socle Flat Checker) → **workspace** (ajouts/masquages) → **terrain** (création à la volée, locale à l'EDL en V1)
- Champs : nom, `categorie` (17 catégories enum), `contexte` (edl / inventaire — un item ne peut être que l'un ou l'autre), `parent_item_id` (self-ref pour sous-items, profondeur max 2), `aide_contextuelle` (tips ℹ️), source, est_archive
- ~155 items dans le catalogue plateforme, avec sous-items liés (plomberie, menuiseries, sanitaires)
- Sous-items définis au niveau catalogue, pas créés à la volée

### ValeurReferentiel
- Tags prédéfinis pour les critères Caractéristiques, Dégradations et Couleur, par item
- 3 niveaux : plateforme → workspace → terrain (tags créés à la volée par le technicien, locaux en V1)
- Champs : catalogue_item_id, critere (caracteristiques / degradations / couleur), valeur, source

### ConfigCritereCategorie (paramétrage des niveaux d'exigence)
- **Par catégorie, pas par item** — réduit la maintenance de ~1260 à ~17 configurations par workspace
- **8 critères paramétrables** : état_général, propreté, photos, caractéristiques, couleur, dégradations, fonctionnement, quantité. Observation retiré du paramétrage (toujours optionnel — validé client 18/03/2026)
- 4 niveaux d'exigence : masqué / optionnel / recommandé / obligatoire
- Modèle **dénormalisé** : 1 row = 1 catégorie × 9 colonnes critères
- Paramétrage par défaut Flat Checker pré-configuré, chaque workspace peut modifier

### ConfigCritereItem (overrides)
- Overrides ponctuels quand le défaut catégorie ne convient pas (ex : Robinet → Fonctionnement = Obligatoire alors que Plomberie = Masqué)
- Table **sparse** : seules les exceptions sont stockées. Pas de row = défaut catégorie
- Champs : workspace_id, catalogue_item_id, critere, niveau

### TemplatePieceItem (pivot)
- Linking items → pièces par défaut : quels items sont pré-sélectionnés dans chaque type de pièce
- Champs : type_piece_id, catalogue_item_id, quantite_defaut (ex : Mur = 4, Fenêtre = 1), `labels_defaut` (JSON array, optionnel — ex : ["Mur d'accès","Mur gauche","Mur droit","Mur de face"]), ordre_affichage
- `labels_defaut` : si présent, utilisé pour pré-remplir `EvaluationItem.label` à la création de la pièce sur tablette (EPIC 5). Si absent, auto-numérotation.
- La présence dans cette table = pré-sélectionné. Les items absents sont disponibles via le catalogue complet (bouton "+")

## Interface back-office
- **Page Catalogue Items** : liste par onglet EDL / Inventaire, groupée par catégorie, recherche, formulaire de création, drawer de détail item
- **Page Pièces & Templates** : liste des types de pièces par catégorie, drawer de détail avec **onglets EDL | Inventaire** pour séparer clairement les items par contexte (retour client 18/03/2026 : « vraiment dissocier la partie EDL et inventaire »), ajout/suppression d'items
- **Page Paramétrage Critères** : matrice catégorie × critères avec NivPick, drill-down par catégorie pour voir les items et les overrides
- Toutes ces pages sont accessibles depuis la section **Paramètres** (EPIC 11)

## Décisions prises
- ✅ Table Section supprimée — catégorie = attribut de CatalogueItem
- ✅ Critères par catégorie (pas par item) avec overrides ponctuels — en attente validation client
- ✅ 9 critères fixes au niveau plateforme, non modifiables par les workspaces
- ✅ ConfigCritereCategorie dénormalisé (1 row = 8 colonnes — observation retiré)
- ✅ Séparation EDL/Inventaire par onglets dans le détail pièce
- ✅ Un item est soit EDL soit Inventaire, pas les deux
- ✅ Sous-items définis au catalogue, profondeur max 2

## ⚠️ Point en attente validation client
- [x] **Critères par catégorie vs par item** : la proposition est validée côté Alfred, en attente de confirmation Flat Checker

## Gestion des référentiels métier (ex-EPIC 6, fusionnée ici)
> ✅ L'EPIC 6 (Référentiels Métier) est fusionnée dans l'EPIC 4 car elle couvre les mêmes tables et la même section Paramètres.

### ValeurReferentiel
- Tags prédéfinis par item et par critère (caracteristiques / degradations / couleur)
- 3 niveaux : plateforme (Flat Checker) → workspace → terrain (technicien)
- ~500+ valeurs dans le référentiel plateforme

### Aides contextuelles
- Champ `aide_contextuelle` sur `CatalogueItem` : tip ℹ️ non bloquant
- Défini au niveau plateforme (FC), personnalisable par workspace en V2

### Back-office référentiels
- **Niveau workspace** : l'admin du workspace peut ajouter des tags, masquer des tags socle. Accessible depuis Paramètres > Référentiels.
- **Niveau plateforme (Flat Checker)** : gestion des valeurs socle disponibles sur tous les workspaces. En V1, modification directe en base. En V2, interface super-admin dédiée.

## Dépendances
- **Dépend de** : EPIC 11 (workspace)
- **Bloque** : EPIC 5 (saisie tablette)