# ImmoChecker — Contexte Permanent Claude Code

> Ce fichier centralise toutes les informations necessaires au developpement de la webapp ImmoChecker.
> Derniere mise a jour : 26 mars 2026.

---

## 1. Vision Produit

**ImmoChecker** est un outil de creation d'etats des lieux (EDL) et d'inventaires pour l'immobilier. Le produit se compose d'une webapp back-office (admin/gestionnaire) et d'une app mobile/tablette (technicien terrain). **Ce fichier concerne uniquement la webapp.**

L'objectif est de remplacer Immopad, fiabiliser les donnees, fluidifier l'operationnel et preparer une commercialisation SaaS.

**ImmoChecker n'est PAS un logiciel de gestion locative.** L'occupation des logements n'est pas geree.

> Document de reference complet : `knowledge/notion/pages/vision-fonctionnelle-cible-immochecker-v1.md`

### 3 types de workspace

- **societe_edl** — Societe d'EDL (ex: FlatChecker). Cas le plus complexe : missions, techniciens, mandataires.
- **bailleur** — Bailleur direct. Simplifie : EDL sans mission possible, pas de mandataire.
- **agence** — Agence immobiliere. Gestion interne, onglet Mandataire masque.

### Perimetre webapp (Lot 1)

La webapp ne descend jamais en dessous du niveau EDL_Inventaire. Les donnees de saisie terrain (pieces, items, photos) sont consultables uniquement via le PDF/Web genere. Le back-office pilote et consulte, la tablette saisit.

---

## 2. Architecture de Donnees

> Document de reference complet : `knowledge/notion/pages/architecture-de-donnees-immochecker-v1.md`
> Attributs detailles par table : `knowledge/notion/pages/attributs-par-table-immochecker-v1.md`

### Couches du modele (28 tables)

- **Couche Auth** : Workspace, Utilisateur, WorkspaceUser (pivot)
- **Couche Tiers** : Tiers, TiersOrganisation (pivot), LotProprietaire (pivot), EDLLocataire (pivot)
- **Couche Patrimoine** : Batiment, AdresseBatiment, Lot, AccesLot, CompteurLot, ReleveCompteur, ValeurReleveCompteur
- **Couche Operationnelle** : Mission, MissionTechnicien (pivot), CleMission, IndisponibiliteTechnicien, EDL_Inventaire, PieceEDL, EvaluationItem, Photo
- **Couche Catalogue** : TypePiece, CatalogueItem, ValeurReferentiel, ConfigCritereCategorie, ConfigCritereItem, TemplatePieceItem (pivot)
- **Couche Preferences** : UserPreference

---

## 3. Decisions d'Architecture Cles

Ces decisions sont dispersees dans les EPICs et les docs de reference. Elles sont centralisees ici pour Claude Code.

### Separation Auth / Metier

- **Utilisateur** = personne authentifiee (identite humaine, auth JWT)
- **Tiers** = entite juridique/documentaire (proprietaire, locataire, mandataire)
- Pas de pont User <> Tiers : WorkspaceUser n'a PAS de `tiers_id`. La table Tiers est reservee aux stakeholders autour des lots.
- La societe realisatrice d'un EDL est derivee du **Workspace** (nom, SIRET, adresse), pas d'un Tiers.

### Roles portes par les relations

- Un Tiers n'est ni "proprietaire" ni "locataire" intrinsequement — c'est la FK qui qualifie le role.
- Un meme Tiers peut jouer plusieurs roles (proprio ET locataire).

### Tables pivots pour le N:N

- **WorkspaceUser** : user <> workspace (role)
- **TiersOrganisation** : personne physique <> personne morale (fonction)
- **LotProprietaire** : lot <> tiers proprietaire(s) (supporte indivision)
- **EDLLocataire** : EDL <> tiers locataire(s) (supporte colocation)
- **MissionTechnicien** : mission <> user technicien (1 en V1, pivot pour anticiper multi)
- **TemplatePieceItem** : type de piece <> catalogue item

### Multi-tenant

- Isolation par `workspace_id` sur toutes les tables metier.
- JWT avec gestion workspaces et permissions.
- 3 roles : Admin / Gestionnaire / Technicien.

### Patrimoine

- Structure : Batiment -> Lot (etage = simple champ du lot)
- Maison individuelle = 1 Batiment + 1 Lot
- `Lot.mandataire_id` -> Tiers : FK directe (1 seul mandataire par lot)
- `code_acces` migre vers EDL_Inventaire (change a chaque intervention)
- `num_cave`, `num_parking` restent sur le Lot (donnees stables)
- Compteurs : section retiree de la fiche lot — geres uniquement cote EDL tablette

### Templates & Catalogue

- Pas de table Section — la categorie est un attribut enum de CatalogueItem
- Templates par type de piece (pas par type de bien)
- 3 niveaux : plateforme -> workspace -> terrain
- Un item est soit EDL soit Inventaire (champ `contexte`), pas les deux
- Sous-items via self-ref `parent_item_id` (profondeur max 2)
- Criteres d'evaluation par categorie (pas par item) avec overrides ponctuels
- 8 criteres fixes : etat_general, proprete, photos, caracteristiques, couleur, degradations, fonctionnement, quantite
- 4 niveaux d'exigence : masque / optionnel / recommande / obligatoire

### Missions

- 1 mission = 1 lot (non modifiable apres creation)
- Statut simplifie : `planifiee` | `assignee` | `terminee` | `annulee`
- Auto-terminaison : quand tous les EDL lies sont signes
- Verrouillage post-terminaison : date/heure/technicien en lecture seule. Seuls commentaire + cles modifiables.
- Annulation bloquee si mission terminee (EDL signes = documents legaux)
- Colocation : bail collectif (1 EDL, N locataires) ou bails individuels (N EDL)
- `CleMission` FK vers `edl_id` (pas `mission_id`) — colocation geree
- Indisponibilites technicien : creneaux + recurrence style Google Calendar

### Interface

- Edition inline retiree — toute modification passe par fiche detail ou drawer
- Filtres rapides en dropdown compact (pattern transversal toutes les vues)
- Suppression onglet Lots — lots accessibles uniquement via drill-down batiment ou recherche globale
- Colonne agregee "Nom / Raison sociale" sur tous les onglets Tiers

---

## 4. Navigation Back-office

```
OPERATIONNEL
  ├── Tableau de bord (EPIC 14)
  └── Missions (EPIC 13)

REFERENTIEL
  ├── Parc immobilier — Batiments & Lots (EPIC 1)
  └── Tiers (EPIC 2)

ADMINISTRATION
  ├── Parametres (EPIC 11)
  │   ├── Informations workspace
  │   ├── Utilisateurs & Roles
  │   ├── Templates / Pieces (EPIC 4)
  │   ├── Catalogue d'items (EPIC 4)
  │   ├── Parametrage Criteres (EPIC 4)
  │   └── Referentiels / Tags (EPIC 4)
  └── API & Integrations (EPIC 10)
```

Le technicien n'a acces qu'a l'app mobile. Pas d'interface desktop.

---

## 5. Cycles de Vie

### Mission

`Planifiee` -> `Assignee` -> `Terminee` (auto) | `Annulee`

### EDL / Inventaire

`Brouillon` -> `Signe` | `Infructueux`

### Statuts separes sur la Mission

- **statut** : `planifiee` | `assignee` | `terminee` | `annulee`
- **statut_rdv** : `a_confirmer` | `confirme` | `reporte`
- **MissionTechnicien.statut_invitation** : `en_attente` | `accepte` | `refuse`

---

## 6. Stack Technique

### Frontend (Webapp Back-office)

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** + **shadcn/ui** (Radix primitives)
- **React Router 6** (routing SPA)
- **TanStack Query** (React Query) pour le server state
- **Recharts** (graphiques dashboard)
- **Lucide React** (icones)
- **Fontshare** (typographie : Display + Body + Mono)
- **date-fns** + locale fr (formatage dates)
- **Zod** (validation schemas partages avec le backend)
- **React Hook Form** (formulaires)

### Backend

- **Node.js** + **Express** (ESM modules)
- **PostgreSQL** sur Railway (`pg` driver, Pool, max 20 connexions)
- **JWT** (jsonwebtoken) + **bcryptjs** pour l'authentification
- **Zod** (validation des schemas cote backend)
- **Resend** (emails transactionnels — invitations, notifications)

### Infrastructure

- **Railway** (hosting webapp + PostgreSQL)
- **GitHub** (repo + CI/CD via Railway auto-deploy)
- **Notion** (specs, suivi, knowledge sync)

---

## 7. Conventions de Code

### Structure du projet

```
/src
  /components           ← Composants UI reutilisables
  /components/ui        ← shadcn/ui (ne pas modifier)
  /features             ← Feature modules
    /{feature}
      /components       ← Composants specifiques a la feature
      /hooks            ← Hooks custom
      /api.ts           ← Appels API (React Query)
      /types.ts         ← Types TypeScript
  /layouts              ← Layout sidebar + topbar
  /lib                  ← Utilitaires (api client, cn, formatters)
  /hooks                ← Hooks globaux
/server
  /routes               ← Express routes
  /services             ← Business logic
  /db                   ← Schema, migrations, pool
  /middleware            ← Auth JWT, validation
```

### Conventions de nommage

- **Composants React** : PascalCase (`BuildingList.tsx`)
- **Fonctions / hooks** : camelCase (`useBuildings`, `formatDate`)
- **Colonnes DB / API JSON** : snake_case (`workspace_id`, `created_at`)
- **Fichiers features** : kebab-case (`building-list.tsx`, `use-buildings.ts`)
- **Types TS** : PascalCase avec suffixe (`Building`, `CreateBuildingInput`, `BuildingResponse`)

### API REST

- Endpoints : `/api/{resource}` (pluriel) — `/api/batiments`, `/api/tiers`, `/api/missions`
- Reponses JSON : `{ data, meta? }` pour les listes, objet direct pour les details
- Erreurs : `{ error: string, code: string, details?: any }`
- Pagination : cursor-based (`?cursor=xxx&limit=50`)
- Validation : Zod cote backend (middleware), Zod + React Hook Form cote frontend

### Dates & i18n

- Stockage : ISO 8601, TIMESTAMPTZ en base
- Affichage : format fr-FR (`date-fns/locale/fr`)
- UI en francais, code et API en anglais
- IDs : UUID v4 partout (`uuid_generate_v4()` cote DB)

### Git

- Commits : `type(scope): description` — types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`
- Branches : `feat/xxx`, `fix/xxx`, `refactor/xxx`
- PR obligatoire pour merge sur `main`

---

## 7b. Interdictions V1 — Ce que ImmoChecker ne fait PAS

Ces regles sont non-negociables en V1. Elles evitent le scope creep et clarifient les limites du produit.

- **PAS de gestion locative** — l'occupation des logements n'est pas geree
- **PAS d'edition inline sur les tableaux** — toute modification passe par fiche detail ou drawer
- **PAS de suppression hard delete** — archivage uniquement (soft delete)
- **PAS de section compteurs sur la fiche lot** — geres uniquement cote EDL tablette
- **PAS de table Section pour les items** — la categorie est un enum sur CatalogueItem
- **PAS de tiers_id sur WorkspaceUser** — table Tiers = stakeholders lot uniquement
- **PAS de modification du lot** sur une mission apres creation
- **PAS d'annulation de mission si terminee** — EDL signes = documents legaux immuables
- **PAS d'onglet Lots separe** — lots accessibles uniquement via drill-down batiment ou recherche
- **PAS de drag & drop sur le Kanban missions** en V1
- **PAS de donnees de saisie terrain dans la webapp** — le back-office consulte via PDF/Web uniquement

---

## 7c. Auth & Securite

- **JWT** : access 15-30min `{ userId, email, workspaceId, role }`, refresh 7j en httpOnly cookie. JAMAIS localStorage.
- **Inscription** : invitation-only (expire 7j). Admin invite → email Resend → formulaire (email pre-rempli).
- **Password** : 8+ chars, 1 maj, 1 chiffre. Lockout 10 essais/15min. bcryptjs salt 12.
- **Multi-workspace** : 1 actif dans JWT, switcher → refresh JWT complet + reload.
- **Visibilite** : `societe_edl` = tout visible. `bailleur` = pas mandataire, EDL sans mission possible. `agence` = pas mandataire.

---

## 7d. Transitions d'etat — Regles critiques

- **planifiee → assignee** : quand technicien accepte l'invitation
- **assignee → terminee** : auto quand TOUS les EDL lies sont signes
- **annulation** : admin + motif obligatoire. **IMPOSSIBLE si terminee** (erreur `MISSION_LOCKED`)
- **Verrouillage post-terminaison** : tout lecture seule SAUF commentaire + CleMission (statut, lieu_depot)
- **lot_id** immutable des la creation de mission
- **EDL** : `brouillon → signe` (immuable, document legal) ou `brouillon → infructueux`

---

## 7e. Workflow Colocation

- Choix bail visible uniquement si 2+ locataires : **Individuel** (defaut, N EDL) | **Collectif** (1 EDL, N signataires)
- Bail individuel : N locataires → N EDL, auto-terminaison attend tous signes
- Bail collectif : N locataires → 1 EDL via pivot `EDLLocataire`
- Entree + Sortie sur meme mission : `sens` porte par `EDL_Inventaire.sens`
- `CleMission` FK vers `edl_id` (pas `mission_id`) — cles par EDL

---

## 7f. Patterns UI partages

- **Record Picker** : dropdown avec recherche + bouton "Creer" en sous-modal (Lot, Batiment, Tiers). Pas de bouton standalone "Nouveau batiment" sur la page Parc.
- **Filtres rapides** : dropdowns compacts (Periode/Technicien/Statut) en haut de chaque vue, persistes dans `UserPreference`, partages entre vues.
- **Drawer lateral** : panneau droite, detail mission. Lecture seule si terminee (sauf commentaire + cles).
- **Colonnes configurables** : toggle show/hide + reinitialiser, persistes dans `UserPreference`.
- **Calendrier** : semaine (cartes pastel par statut) + mini mensuel (sidebar). Clic mission → drawer. Pas de creation par clic creneau.
- **Vue carte** : clusters au dezoom, couleur par statut/activite, seuls batiments geocodes visibles.

---

## 7g. Enums & Constantes metier

> Enums sont definis dans le schema DB et le code source. Consulter `server/db/` pour les valeurs exactes.
> Regles cles : Mission.reference auto-genere `M-{YYYY}-{XXXX}`, pagination cursor-based (limit 50/max 100, reponse `{ data, meta: { cursor, has_more, total } }`).

---

## 7h. Systeme d'elevation

ImmoChecker utilise un systeme d'elevation a 5 niveaux inspire d'Atlassian Design System. Chaque element visuel appartient a exactement un niveau. **Surface + Shadow sont TOUJOURS apparies.** Ce systeme est la source de verite pour toute decision visuelle de profondeur.

### Les 5 niveaux

| # | Niveau | Surface | Shadow | Z-index | Utilisation |
|---|---|---|---|---|---|
| 0 | **Sunken** | `bg-surface-sunken` | aucune | 0 | Table headers (sur Default), filter bars, disabled inputs, kanban column bg |
| 1 | **Default** | `bg-background` | aucune | 0 | Fond de page uniquement — point de depart |
| 2 | **Raised** | `bg-card` + `shadow-elevation-raised` + `border border-border/60` | `shadow-elevation-raised` | 0, z-20 (header), z-30 (sidebar) | Cards, sidebar, header, sections, formulaires |
| 3 | **Overlay** | `bg-popover` + `shadow-elevation-overlay` + `border border-border/60` | `shadow-elevation-overlay` | z-40 | Dropdowns, selects, popovers, tooltips, autocomplete |
| 4 | **Floating** | `bg-surface-floating` + `shadow-elevation-floating` + `border border-border/60` | `shadow-elevation-floating` | z-50 | Dialogs, sheets, alert-dialogs, floating save bar |

### Regles d'appariement

1. **Surface + Shadow toujours apparies** : jamais de shadow-elevation-raised sur un bg-background, jamais de bg-card sans shadow.
2. **Border toujours inclus** : tous les elements Raised/Overlay/Floating ont `border border-border/60`.

### Regles d'imbrication

3. **Sunken UNIQUEMENT sur Default** : ne JAMAIS mettre `bg-surface-sunken` a l'interieur d'une card Raised ou d'un Overlay. Utiliser `bg-muted/30` pour differencier des zones a l'interieur d'elements Raised.
4. **Raised dans Overlay OK** : les cards a l'interieur des modals gardent leur elevation Raised.

### Echelle Z-index (stricte)

| Token | Valeur | Usage |
|---|---|---|
| z-0 | 0 | Contenu par defaut |
| z-10 | 10 | Elements sticky, resize handles |
| z-20 | 20 | Header sticky |
| z-30 | 30 | Sidebar |
| z-40 | 40 | Overlays (dropdowns, popovers, selects, tooltips, autocomplete) |
| z-50 | 50 | Modaux (dialog, sheet, alert-dialog, floating save bar) |

### Etats d'interaction

| Etat | Token surface | Token shadow |
|---|---|---|
| Raised hover | `bg-surface-raised-hovered` | `shadow-elevation-raised-hover` |
| Raised pressed | `bg-surface-pressed` | `shadow-elevation-raised` |
| Overlay hover | `bg-surface-overlay-hovered` | — |

**Regle** : ne PAS combiner transition de shadow + changement de couleur de surface. Utiliser l'un OU l'autre.

### Classes composites CSS

- `.elevation-raised` = surface + shadow + border
- `.elevation-raised-interactive` = idem + hover:shadow-elevation-raised-hover transition
- `.elevation-overlay` = surface overlay + shadow overlay + border
- `.elevation-floating` = surface floating + shadow floating + border

### Patterns INTERDITS

| Interdit | Utiliser a la place |
|---|---|
| `bg-white` | `bg-card` ou `bg-surface-raised` |
| `shadow-sm` / `shadow-md` / `shadow-lg` pour elevation | `shadow-elevation-raised` / `-overlay` / `-floating` |
| `shadow-xs` pour elevation | `shadow-xs` = form controls UNIQUEMENT |
| `bg-muted/50` pour zones en retrait | `bg-surface-sunken` (sur Default) ou `bg-muted/30` (dans Raised) |
| `z-50` sur elements non-modaux | Sidebar=z-30, header=z-20, dropdowns=z-40 |
| `bg-surface-sunken` dans une card | `bg-muted/30` (sunken = Default surface seulement) |
| `hover:shadow-md` sur une card | `hover:shadow-elevation-raised-hover` |

### Dark mode

En dark mode, les surfaces s'eclaircissent quand l'elevation augmente (effet "eclaire par l'avant"). Les shadows restent presentes mais plus intenses. Le systeme de tokens gere ca automatiquement — ne jamais hardcoder de couleurs de surface.

---

## 8. Specifications, EPICs & User Stories

> Toutes les specs, EPICs et US detaillees sont dans `knowledge/notion/`. Consulter `knowledge/notion/_index.md` pour naviguer.
> - EPICs : `knowledge/notion/pages/epic-{N}-*.md` (EPICs 1, 2, 4, 10, 11, 13, 14, 16)
> - User Stories (62 US) : `knowledge/notion/related/fcr-us{NNN}-*.md`
> - Seed data : `knowledge/notion/databases/pieces.md` et `items-edl-inventaire.md`

### Chaine de dependances

EPIC 11 (Auth) → EPIC 1 (Batiments) → EPIC 2 (Tiers) → EPIC 4 (Templates) → EPIC 13 (Missions) → EPIC 14 (Dashboard) → EPIC 10 (API). EPIC 16 (Transverses) = progressif.

### Sprints

| Sprint | Scope | US count |
|---|---|---|
| 1 | Fondations + Parc immobilier (EPIC 11 partiel + 1 + 16 socle) | 14 |
| 2 | Tiers + Templates + Parametres (EPIC 2 + 4 + 11 fin) | 16 |
| 3 | Missions & Planification (EPIC 13) | 11 |
| 4 | Dashboard Admin + API (EPIC 14 + 10) | 11 |
| 5 | Composants transverses, Import, QA (EPIC 16 fin) | 6 |

<!-- Archonse Tech Stack & Global Rules: voir Section 6 (Stack Technique) et .claude/rules/ pour les regles DB/security/deploy. -->

<!-- ARCHONSE:GLOBAL_RULES:END -->
