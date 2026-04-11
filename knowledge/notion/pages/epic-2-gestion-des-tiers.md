---
notion_id: "3131d95b-2f8a-8164-8e3e-e9fee9e70624"
notion_url: "https://www.notion.so/EPIC-2-Gestion-des-Tiers-3131d95b2f8a81648e3ee9fee9e70624"
last_synced: "2026-03-26T12:54:04.895Z"
created: "2026-02-26T15:28:00.000Z"
last_edited: "2026-03-23T12:32:00.000Z"
properties:
  Status: "📌 Ready to Start"
  User Stories: "3131d95b-2f8a-81f6-9dbb-c73f64547ebd, 3131d95b-2f8a-81a5-adb1-c98b216d60b6, 3131d95b-2f8a-8147-a839-e2f001f8920a, 3131d95b-2f8a-81c1-8265-e4dcc4094beb, 3131d95b-2f8a-81da-aa5d-cb97824de207, 3131d95b-2f8a-818c-ba3f-c94c9767c22d, 3271d95b-2f8a-8122-8227-ea55dd998f42, 3271d95b-2f8a-810a-95d7-c6f604926f0d, 3271d95b-2f8a-8182-bde1-fcdcfba5aff9, 3271d95b-2f8a-8198-bcc5-f715bb023475"
  Categories: "Feature"
  Priority: "P0"
  Brique Fonctionnelle: "3131d95b-2f8a-81de-af8e-d782a1b05a0e"
  Business Value: "Gestion centralisée de tous les acteurs externes (propriétaires, agences mandataires, locataires). Table unifiée évitant les doublons et supportant les multi-rôles."
  Completion: "0"
  Sponsors: "clement.flatchecker@outlook.fr, Flat Checker "
  Project: "3071d95b-2f8a-80ac-9db8-dc4e9d2196c9"
  Epic: "EPIC 2 — Gestion des Tiers"
---

# EPIC 2 — Gestion des Tiers

| Propriete | Valeur |
|-----------|--------|
| Status | 📌 Ready to Start |
| User Stories | 3131d95b-2f8a-81f6-9dbb-c73f64547ebd, 3131d95b-2f8a-81a5-adb1-c98b216d60b6, 3131d95b-2f8a-8147-a839-e2f001f8920a, 3131d95b-2f8a-81c1-8265-e4dcc4094beb, 3131d95b-2f8a-81da-aa5d-cb97824de207, 3131d95b-2f8a-818c-ba3f-c94c9767c22d, 3271d95b-2f8a-8122-8227-ea55dd998f42, 3271d95b-2f8a-810a-95d7-c6f604926f0d, 3271d95b-2f8a-8182-bde1-fcdcfba5aff9, 3271d95b-2f8a-8198-bcc5-f715bb023475 |
| Categories | Feature |
| Priority | P0 |
| Brique Fonctionnelle | 3131d95b-2f8a-81de-af8e-d782a1b05a0e |
| Business Value | Gestion centralisée de tous les acteurs externes (propriétaires, agences mandataires, locataires). Table unifiée évitant les doublons et supportant les multi-rôles. |
| Completion | 0 |
| Sponsors | clement.flatchecker@outlook.fr, Flat Checker  |
| Project | 3071d95b-2f8a-80ac-9db8-dc4e9d2196c9 |
| Epic | EPIC 2 — Gestion des Tiers |

Gestion de tous les acteurs externes dans une **table unique **`**Tiers**`. Le rôle (propriétaire, mandataire, locataire) est porté par la relation, pas par l'entité.

## Périmètre fonctionnel

### Table Tiers
- CRUD complet
- `type_personne` : `physique` | `morale`
- **Champs personne physique** : nom, prénom
- **Champs personne morale** : raison_sociale, SIREN
- **Champs communs** : adresse, CP, ville, tel, email
- **Champs spécifiques locataire** (PP) : representant_nom, procuration
- Un même tiers peut jouer plusieurs rôles (proprio ET locataire)
- L'affichage des champs est conditionnel au `type_personne` (formulaires et fiches détail)

### Table pivot TiersOrganisation
- Lie une personne physique à une organisation (morale)
- Champs : tiers_id, organisation_id, fonction, est_principal
- Many-to-many : 1 contact peut être lié à N organisations
- Ex : Marie (gestionnaire) chez Agence Versailles ET chez SCI Les Tilleuls

### Liaisons avec le patrimoine
- `LotProprietaire` (pivot) : lie des tiers-propriétaires à des lots (supporte l'indivision, avec `est_principal`)
- `Lot.mandataire_id → Tiers` : **FK directe** — un lot n'a qu'un seul mandataire (pas de pivot)
- `EDLLocataire` (pivot) : lie des tiers-locataires à un EDL (supporte colocation + distinction entrant/sortant via `role_locataire`)

## Interface back-office (retours prototype mars 2026)

### Navigation par onglets avec colonnes dynamiques
- **Onglets** dans l'ordre : Propriétaire | Locataire | Mandataire | Tous
- Onglet "Tous" visuellement discret (grisé ou en fin de ligne)
- **Masquage conditionnel** : onglet Mandataire masqué pour les workspaces de type "agence" (`Workspace.type_workspace`)
- **Colonnes par défaut différentes par onglet** :
  - Propriétaire : **Nom / Raison sociale** (agrégé), type PP/PM, email, téléphone, nb lots, dernière mission
  - Locataire : **Nom / Raison sociale** (agrégé), email, téléphone, dernier lot (EDL), propriétaire, dernière mission
  - Mandataire : Raison sociale, contact principal, email, téléphone, nb lots en gestion
  - Tous : **Nom / Raison sociale** (agrégé), type PP/PM, email, téléphone, dernière mission
- Colonnes customisables via le composant colonnes configurables (EPIC 16)
- **Barre de recherche** au-dessus du tableau (couvre nom, prénom, raison_sociale, email, téléphone)
- **Filtres rapides en dropdown compact** (Type personne : Tous / Physique / Morale) — même pattern transversal que missions

### Gestion PP / PM dans les tableaux et formulaires
- **Colonne agrégée "Nom / Raison sociale"** : affiche `prénom + nom` pour les PP et `raison_sociale` pour les PM. Évite les colonnes vides dans les tableaux mixtes.
- Les champs spécifiques PM (SIREN, raison sociale détaillée) ne sont **pas dans les colonnes par défaut** des tableaux — visibles uniquement dans la fiche détail
- Les champs spécifiques PP (prénom) ne sont **pas affichés pour les PM** dans les fiches détail
- **Formulaires de création/édition** : les champs affichés s'adaptent au `type_personne` sélectionné (sélection PP → affiche nom/prénom, sélection PM → affiche raison_sociale/SIREN)

### Suppressions (retour FC)
- Suppression de la colonne Ville → remplacée par Dernière mission (vue proprio) / Propriétaire (vue locataire)
> ⚠️ **ImmoChecker n'est pas un logiciel de gestion locative** — l'occupation des logements n'est pas gérée (un EDL d'entrée peut être fait par FC et la sortie par un autre presta). Les colonnes "dernier locataire" sont informatives, pas un statut d'occupation.
- Suppression de la colonne Rôle (sauf vue "Tous")

### Fiches détail enrichies par type
**Propriétaire** :
- Informations de base + édition in-page
- Lots possédés (tableau avec bâtiment, adresse, locataire actuel, statut) — cliquables
- Missions liées aux lots du propriétaire
- Si personne morale : section "Contacts" via TiersOrganisation (contact, fonction, téléphone, email, principal)
**Locataire** :
- Informations de base
- **Tous les lots liés** (historique complet via EDLLocataire) — pas seulement le "lot actuel". Un locataire peut être passé par plusieurs lots. Tableau avec lot, bâtiment, adresse, propriétaire, date entrée, date sortie, statut (en cours / terminé). ImmoChecker ne gère pas l'occupation.
- Documents EDL liés (type, lot, date, statut, liens PDF/Web)
- Missions associées (tableau détaillé avec mission, lot, date, type, statut, technicien)
**Mandataire** :
- Raison sociale, SIRET, adresse
- Lots en gestion (via `Lot.mandataire_id`)
- Contacts via TiersOrganisation
- Visible uniquement pour workspaces de type "societe_edl"

### Fiches détail — Tiers multi-rôle
Un même tiers peut avoir plusieurs rôles (propriétaire ET locataire, par exemple). Le rôle est dérivé des relations (LotProprietaire, EDLLocataire, Lot.mandataire_id), pas stocké sur le tiers.
- **Onglets** : le tiers apparaît dans chaque onglet pertinent (ex : onglet Propriétaire + onglet Locataire)
- **Onglet Tous** : colonne "Rôle(s)" avec **plusieurs badges** si multi-rôle
- **Fiche détail unique** par tiers : les sections sont **conditionnelles** selon les rôles détectés :
  - Si LotProprietaire → section "Lots possédés"
  - Si EDLLocataire → section "Lots (locataire)"
  - Si Lot.mandataire_id → section "Lots en gestion"
  - Badges de rôles en haut de la fiche
- Peu importe l'onglet d'où on clique, la fiche affiche **toutes** les casquettes du tiers

## Décisions d'architecture
- Table unique (pas de table Propriétaire / Mandataire / Locataire séparées)
- ~~Le pont User ↔ Tiers via ~~`~~WorkspaceUser.tiers_id~~` **Supprimé (20/03/2026)** — la table Tiers est réservée aux stakeholders autour des lots (propriétaire, locataire, mandataire). Les techniciens sont exclusivement dans User/WorkspaceUser. La société réalisatrice = le Workspace.
- Le mandataire est une **FK directe** sur Lot (`Lot.mandataire_id → Tiers`), pas un pivot

## Dépendances
- **Dépend de** : EPIC 11 (workspace/auth)
- **Lié à** : EPIC 1 (lots pour les liaisons proprio/mandataire)

## Décisions
- **20/03/2026** : Fiche locataire — "Lot actuel" remplacé par "Lots liés" (historique complet). Section Missions détaillée.
- **20/03/2026** : Colonne agrégée "Nom / Raison sociale" (PP = Prénom Nom, PM = Raison sociale) appliquée à **tous** les onglets y compris Locataire. Pas de colonnes Nom/Prénom séparées.
- **20/03/2026** : Colonnes onglet Tous définies. Barre de recherche + filtres dropdown ajoutés.
- **20/03/2026** : Tiers multi-rôle : fiche unique avec sections conditionnelles par rôle détecté, badges multiples dans l'onglet Tous.
- **20/03/2026** : US-592 recentrée sur le moteur de recherche + auto-complétion pickers (le tableau tiers par onglets = US-808).
- **20/03/2026** : US-593 archivage — bloqué aussi si missions actives (pas seulement EDL brouillon).
- **20/03/2026** : US-591 mandataire — snapshot `EDL_Inventaire.mandataire_id` à la création.
- **20/03/2026** : US-809 mandataire — section Missions ajoutée (lots en gestion).