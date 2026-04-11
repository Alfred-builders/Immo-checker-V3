---
notion_id: "3131d95b-2f8a-81f3-a317-c6756c9ae867"
notion_url: "https://www.notion.so/EPIC-1-Gestion-des-B-timents-Lots-3131d95b2f8a81f3a317c6756c9ae867"
last_synced: "2026-03-26T12:54:01.322Z"
created: "2026-02-26T15:28:00.000Z"
last_edited: "2026-03-23T13:28:00.000Z"
properties:
  Status: "📌 Ready to Start"
  User Stories: "3131d95b-2f8a-819c-9980-d19f54040bb7, 3131d95b-2f8a-81e2-ab85-eff84eb43c2c, 3131d95b-2f8a-818e-84da-f1f56abcdbd4, 3131d95b-2f8a-81a8-b178-f5b5f59a570b, 3131d95b-2f8a-8196-a7e0-efb1c107a623, 3131d95b-2f8a-810b-b22c-d77008e63c9a, 3271d95b-2f8a-8138-af24-e7b22bc0a4a1, 3281d95b-2f8a-81de-9276-fb86d753fe8b"
  Categories: "Feature"
  Priority: "P0"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Business Value: "Structure patrimoniale de base. Sans bâtiments ni lots, impossible de créer des EDL. Interface beaucoup plus explicite que l'existant Immopad."
  Completion: "0"
  Sponsors: "clement.flatchecker@outlook.fr, Flat Checker "
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "EPIC 1 — Gestion des Bâtiments & Lots"
---

# EPIC 1 — Gestion des Bâtiments & Lots

| Propriete | Valeur |
|-----------|--------|
| Status | 📌 Ready to Start |
| User Stories | 3131d95b-2f8a-819c-9980-d19f54040bb7, 3131d95b-2f8a-81e2-ab85-eff84eb43c2c, 3131d95b-2f8a-818e-84da-f1f56abcdbd4, 3131d95b-2f8a-81a8-b178-f5b5f59a570b, 3131d95b-2f8a-8196-a7e0-efb1c107a623, 3131d95b-2f8a-810b-b22c-d77008e63c9a, 3271d95b-2f8a-8138-af24-e7b22bc0a4a1, 3281d95b-2f8a-81de-9276-fb86d753fe8b |
| Categories | Feature |
| Priority | P0 |
| Brique Fonctionnelle | 3131d95b-2f8a-81de-af8e-d782a1b05a0e |
| Business Value | Structure patrimoniale de base. Sans bâtiments ni lots, impossible de créer des EDL. Interface beaucoup plus explicite que l'existant Immopad. |
| Completion | 0 |
| Sponsors | clement.flatchecker@outlook.fr, Flat Checker  |
| Project | 3071d95b-2f8a-80ac-9db8-dc4e9d2196c9 |
| Epic | EPIC 1 — Gestion des Bâtiments & Lots |

Gestion de la structure hiérarchique du patrimoine immobilier : **Bâtiment → Lot**. L'étage est un simple champ du lot, pas un niveau hiérarchique supplémentaire.

## Périmètre fonctionnel

### Bâtiment
- CRUD complet (création, édition in-page, archivage)
- Champs : désignation, type (`immeuble` | `maison` | `local_commercial` | `mixte`), année construction, numéro bâtiment, nombre d'étages, commentaire
- **Adresses multiples** via table fille `AdresseBatiment` (type `principale` | `secondaire`, rue, complément, CP, ville)
- **Géocodage** : `latitude` / `longitude` sur AdresseBatiment pour la vue carte des missions (EPIC 13)

### Lot
- CRUD complet
- Champs : designation, `reference_libre` (numéro de bail, cadastral — champ libre), type_bien (`appartement` | `maison` | `box_parking` | `bureau` | `local_commercial` | `autre`) avec **icône par type**, étage, emplacement_palier (porte gauche, droite…), surface, est_meuble, nb_pieces, DPE
- ⚠️ `code_acces` **migré vers **`**EDL_Inventaire**` (retour client : change à chaque intervention, pas lié au bien physique). `num_cave` et `num_parking` **restent sur le Lot** (données stables liées au bien physique).
- Liaison `mandataire_id → Tiers` (FK directe, 1 seul mandataire par lot)
- Liaison propriétaires via pivot `LotProprietaire` (supporte l'indivision)
- Compteurs via `CompteurLot` (type, numéro PRM, numéro série, emplacement)

### Cas particulier
- **Maison individuelle** = 1 Bâtiment + 1 Lot (architecture uniforme, UX simplifiée avec raccourci "Nouvelle maison")

## Interface back-office (retours prototype mars 2026)

### Page "Parc immobilier" (remplace l'ancien onglet Bâtiments)
- **Suppression de l'onglet Lots** — les lots sont accessibles uniquement via drill-down depuis les bâtiments ou via la recherche globale (EPIC 16)
- **Vue tableau** : bâtiments avec colonnes configurables (désignation, adresse, ville, CP, nb lots, dernière mission, missions à venir)
- **Vue carte / map** (composant carte partagé, EPIC 16) : marqueurs par bâtiment avec **nombre de lots affiché sur le pin**. Colorés par activité mission (bleu = mission à venir, vert = mission récente < 6 mois, gris = aucune mission récente). **Clustering** au dézoom (pins proches regroupés avec nombre de bâtiments). Popup au clic : désignation, adresse, nb lots, dernière mission. Filtres identiques à la vue tableau. Utilise `AdresseBatiment.latitude/longitude`.
> ⚠️ **ImmoChecker n'est pas un logiciel de gestion locative** — on ne gère pas l'occupation des logements (un EDL d'entrée peut être fait par FC et la sortie par un autre presta). Les indicateurs sont basés sur l'activité missions, pas sur l'occupation.
- **Drill-down** : chevron d'expansion pour voir les lots en sous-lignes (icône type, nom/réf, étage, type, surface, meublé, propriétaire, locataire actuel)
- Recherche cross-entité : un terme matchant un lot affiche aussi son bâtiment parent
- **Barre de recherche** au-dessus du tableau (couvre désignation, adresse, ville, CP) — même pattern transversal que Tiers (US-808) et Missions (US-597)
- **Filtres rapides en dropdown compact** : Ville, Type de bien, Meublé — même pattern transversal EPIC 16
- Filtres avancés cumulables via "+ Filtre" (propriétaire, mandataire, etc.)

### Record picker enrichi (composant partagé)
- **Lot picker** dans tous les formulaires : nom + adresse + propriétaire + étage + emplacement palier
- **Bâtiment picker** dans le formulaire de création lot : désignation + adresse (pas de propriétaire — le propriétaire est sur le Lot, pas sur le Bâtiment)
- Recherche par nom, adresse (rue, ville, CP) ; pour le lot picker : aussi par propriétaire
- **Création à la volée** : lot et bâtiment créables depuis le picker si inexistants

### Page détail Bâtiment
- Informations générales éditables in-page
- Tableau des adresses (sous-tableau éditable)
- Tableau simple des lots (pas de drill-down — les missions sont consultables dans la fiche lot ou la page Missions)
- Statistiques : total lots, missions à venir, dernière mission
- Actions : ajouter un lot, modifier, archiver

### Page détail Lot
- **One-page avec sections repliables** (pas de navigation tabulaire — cohérent avec la philosophie "une seule page")
- Section Informations : tous les champs éditables in-page (désignation, référence libre, type + icône, étage, emplacement palier, surface, nb pièces, meublé, DPE, num_cave, num_parking, commentaire)
- ~~Section Compteurs~~ retirée de la fiche lot — les compteurs sont gérés uniquement côté EDL sur tablette. V2 éventuel pour les remonter ici. (Aligné avec US-609)
- Section Tiers liés : propriétaire(s) (modifiable), mandataire (modifiable), dernier locataire (lecture seule — issu des EDL)
- Section Missions : tableau des missions liées avec liens PDF pour les EDL signés
- ⚠️ `code_acces` n'est PAS sur le lot — migré vers `EDL_Inventaire`
- `num_cave`, `num_parking` restent sur le lot (liés au bien physique)

## Dépendances
- **Dépend de** : EPIC 11 (workspace/auth)
- **Bloque** : EPIC 13 (Missions), EPIC 2 (Tiers liés aux lots)

## Décisions
- **23/03/2026** : Seul `code_acces` migré vers EDL_Inventaire. `num_cave`/`num_parking` restent sur le Lot (aligné US-609).
- **23/03/2026** : Section Compteurs retirée de la fiche lot — compteurs gérés uniquement côté EDL tablette (aligné US-609).
- **23/03/2026** : "Mapbox" remplacé par "composant carte partagé (EPIC 16)" — choix techno ouvert.
- **23/03/2026** : Ajout barre de recherche + filtres rapides dropdown sur le tableau Bâtiments (pattern transversal EPIC 16).