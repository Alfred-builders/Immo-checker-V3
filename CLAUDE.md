# ImmoChecker — Contexte Permanent Claude Code

> Webapp back-office (admin/gestionnaire). L'app mobile (technicien terrain) est un autre projet.
> Specs détaillées : `knowledge/notion/_index.md` — EPICs, US, attributs DB, vision complète.

---

## 1. Vision

**ImmoChecker** = outil de création d'EDL et inventaires immobiliers. Remplace Immopad. Cible SaaS multi-tenant.

**N'EST PAS** un logiciel de gestion locative. L'occupation des logements n'est pas gérée.

### 3 types de workspace
- **societe_edl** — Société d'EDL. Cas complet : missions, techniciens, mandataires.
- **bailleur** — Bailleur direct. EDL sans mission possible, pas de mandataire.
- **agence** — Agence immobilière. Onglet Mandataire masqué.

### Périmètre webapp
La webapp ne descend jamais sous le niveau EDL_Inventaire. Saisie terrain (pièces, items, photos) consultable via PDF/Web uniquement. Le back-office pilote et consulte, la tablette saisit.

---

## 2. Stack

**Frontend** : React 18 + TS + Vite, Tailwind + shadcn/ui (Radix), React Router 6, TanStack Query, React Hook Form + Zod, date-fns/fr, Recharts, Lucide.
**Backend** : Node + Express ESM, PostgreSQL (pg Pool max 20), JWT + bcryptjs, Zod, Resend.
**Infra** : Railway (hosting + PG), GitHub auto-deploy, Notion (specs).

Détails : `package.json`. Conventions : composants `PascalCase.tsx`, fichiers `kebab-case.ts`, DB/API `snake_case`, IDs UUID v4, dates TIMESTAMPTZ. API REST `/api/{resource}`, erreurs `{ error, code, details? }`.

### Pagination (listes)

- **Réponse API** : `{ data: T[], meta: { cursor: string | null, has_more: boolean, total?: number } }` via le helper serveur `sendList()`. `total` est optionnel (coût d'un `COUNT(*)` à la demande).
- **Cursor** : UUID du dernier row par défaut. Exception documentée : `notifications` utilise `created_at` (timestamp).
- **Limite** : default 25, max 100, paramètre `?limit=` accepté.
- **UX tableaux** : infinite scroll auto via le composant partagé `<LoadMoreFooter />` (`src/components/shared/load-more-footer.tsx`). Le composant pose une sentinelle invisible en bas de tableau (IntersectionObserver, `rootMargin: 120px`), déclenche `fetchNextPage` automatiquement, et affiche un spinner « Chargement… » dans le pied tant que la page suivante arrive. Pied avec compteur « N affichés (sur Y) » + message « Tous les résultats sont affichés » quand fini. Pas de bouton, pas de pages numérotées.
- **Frontend** : `useInfiniteQuery` (TanStack Query) avec `getNextPageParam: (last) => last.meta.has_more ? last.meta.cursor : undefined`. Convention de nommage : `useXxxInfinite()` quand un hook simple coexiste.
- **Endpoints non paginés tolérés** : sous-listes de détail courtes (`/tiers/:id/missions`, `/tiers/:id/edl-history`) — limite hardcodée acceptée si bornée et documentée.

---

## 3. Décisions d'architecture clés

### Séparation Auth / Métier
- **Utilisateur** = personne authentifiée (JWT). **Tiers** = entité juridique (proprio/locataire/mandataire).
- Pas de pont User <> Tiers. WorkspaceUser n'a PAS de `tiers_id`.
- La société réalisatrice d'un EDL = **Workspace** (nom, SIRET, adresse), pas un Tiers.

### Rôles portés par les relations
- Un Tiers n'est ni "propriétaire" ni "locataire" intrinsèquement — la FK qualifie le rôle. Un même Tiers peut jouer plusieurs rôles.

### Tables pivots N:N
WorkspaceUser, TiersOrganisation, LotProprietaire (indivision), EDLLocataire (colocation), MissionTechnicien (1 en V1, pivot pour anticiper multi), TemplatePieceItem.

### Multi-tenant
- Isolation par `workspace_id` sur toutes les tables métier. 3 rôles : Admin / Gestionnaire / Technicien.

### Patrimoine
- Batiment → Lot (etage = champ du lot). Maison individuelle = 1 Batiment + 1 Lot.
- `Lot.mandataire_id` → Tiers (FK directe, 1 mandataire par lot).
- `code_acces` migre sur EDL_Inventaire (change à chaque intervention). `num_cave`/`num_parking` restent sur Lot.
- Compteurs : retirés de la fiche lot — gérés uniquement côté EDL tablette.

### Templates & Catalogue
- Pas de table Section — la catégorie est un enum sur CatalogueItem.
- Templates par type de pièce (pas par type de bien). 3 niveaux : plateforme → workspace → terrain.
- Item = soit EDL soit Inventaire (`contexte`), pas les deux.
- Sous-items via self-ref `parent_item_id` (profondeur max 2).
- Critères d'évaluation par catégorie (overrides ponctuels). 8 critères fixes : `etat_general`, `proprete`, `photos`, `caracteristiques`, `couleur`, `degradations`, `fonctionnement`, `quantite`. 4 niveaux d'exigence : `masque` / `optionnel` / `recommande` / `obligatoire`.

### Missions
- 1 mission = 1 lot (immutable après création).
- 3 axes orthogonaux : `mission.statut` (`planifiee`/`terminee`/`annulee`) + `MissionTechnicien.statut_invitation` (`en_attente`/`accepte`/`refuse`) + `mission.statut_rdv` (`a_confirmer`/`confirme`/`reporte`).
- Badge UI dérivé via `getStatutAffichage()` — 8 valeurs (`a_assigner`, `invitation_envoyee`, `refusee`, `rdv_a_confirmer`, `reportee`, `prete`, `terminee`, `annulee`). **Source de vérité pour toute l'UI.**
- Auto-terminaison : quand tous les EDL liés sont signés.
- Verrouillage post-terminaison : tout en lecture seule SAUF commentaire + CleMission (statut, lieu_depot).
- `CleMission` FK vers `edl_id` (pas `mission_id`) — colocation gérée.
- Indisponibilités technicien : créneaux + récurrence style Google Calendar.
- Référence auto `M-{YYYY}-{XXXX}`.

### EDL
- `brouillon → signe` (immuable, document légal) ou `brouillon → infructueux`. Sens entrée/sortie via `EDL_Inventaire.sens`.

### Colocation
- Choix bail visible uniquement si 2+ locataires : **Individuel** (défaut, N EDL) | **Collectif** (1 EDL, N signataires via pivot `EDLLocataire`).

---

## 4. Interdictions V1 (non-négociables)

- **PAS de gestion locative** — l'occupation des logements n'est pas gérée.
- **PAS d'édition inline** sur les tableaux — modification via fiche détail ou drawer.
- **PAS de hard delete** — archivage uniquement (soft delete).
- **PAS de section compteurs** sur la fiche lot — gérés côté EDL tablette.
- **PAS de table Section** — catégorie = enum sur CatalogueItem.
- **PAS de `tiers_id` sur WorkspaceUser** — table Tiers = stakeholders lot uniquement.
- **PAS de modification du lot** sur une mission après création.
- **PAS d'annulation si terminée** — EDL signés = documents légaux immuables (erreur `MISSION_LOCKED`).
- **PAS d'onglet Lots séparé** — drill-down bâtiment ou recherche globale uniquement.
- **PAS de drag & drop** sur le Kanban missions en V1.
- **PAS de saisie terrain** dans la webapp — consultation via PDF/Web uniquement.
- **PAS de `bg-white`**, **PAS de `text-[<11px]`** (cf. §7 et §8).

---

## 5. Auth & Sécurité

- **JWT** : access 15-30min `{ userId, email, workspaceId, role }`, refresh 7j httpOnly cookie. **JAMAIS localStorage**.
- **Inscription** : invitation-only (expire 7j), email Resend.
- **Password** : 8+ chars, 1 maj, 1 chiffre. Lockout 10 essais/15min. bcryptjs salt 12.
- **Multi-workspace** : 1 actif dans JWT. Switcher → refresh JWT complet + reload.
- **Super-admin** : flag `utilisateur.is_super_admin`, re-vérifié en DB via middleware `requireSuperAdmin` (pas juste JWT). Routes `/super-admin/*` invisibles depuis back-office normal. Workspace `statut = 'suspendu'` bloque login.
- **Onboarding** : flag `onboarding_completed_at` **par user** (admin formé ne revoit pas le wizard). Détails : `knowledge/notion/`.

---

## 6. Transitions d'état — règles critiques

- **Acceptation technicien** : ne change PAS `mission.statut` — `MissionTechnicien.statut_invitation` passe `en_attente → accepte`.
- **planifiee → terminee** : auto quand TOUS les EDL liés sont signés.
- **annulation** : admin + motif obligatoire. **IMPOSSIBLE si terminée**.
- **Verrouillage post-terminaison** : tout lecture seule SAUF commentaire + CleMission (statut, lieu_depot).
- **lot_id** immutable dès création.

---

## 7. Système d'élévation (design system)

5 niveaux. **Surface + Shadow toujours appariés**. Border `border-border/40` sur Raised/Overlay/Floating.

| Niveau | Surface | Shadow | Z-index | Usage |
|---|---|---|---|---|
| **Sunken** | `bg-surface-sunken` | — | 0 | Table headers, filter bars, kanban col bg, disabled inputs |
| **Default** | `bg-background` | — | 0 | Fond de page |
| **Raised** | `bg-card` | `shadow-elevation-raised` | 0 / z-20 header / z-30 sidebar | Cards, sections, formulaires |
| **Overlay** | `bg-popover` | `shadow-elevation-overlay` | z-40 | Dropdowns, selects, popovers, tooltips, autocomplete |
| **Floating** | `bg-surface-floating` | `shadow-elevation-floating` | z-50 | Dialogs, sheets, alert-dialogs, floating save bar |

### Règles
- **Sunken UNIQUEMENT sur Default** — dans une card Raised, utiliser `bg-muted/30` pour différencier.
- **Raised dans Overlay OK** (cards dans modals).
- **Dropdowns/Popovers/Selects** = TOUJOURS `shadow-elevation-overlay`. Jamais `shadow-md`/`shadow-lg`.
- `shadow-sm` accepté pour état actif d'un toggle/tab (pas de l'élévation).
- `shadow-xs` = form controls UNIQUEMENT.
- Pas de combinaison transition shadow + changement couleur surface — l'un OU l'autre.

### Classes composites
`.elevation-raised`, `.elevation-raised-interactive`, `.elevation-overlay`, `.elevation-floating`.

### Antipatterns → remplacements
| Interdit | Utiliser |
|---|---|
| `bg-white` | `bg-card` (ou `bg-card/95` glassmorphism) |
| `shadow-md/lg` pour élévation | `shadow-elevation-{raised\|overlay\|floating}` |
| `bg-muted/50` zone retrait | `bg-surface-sunken` (Default) ou `bg-muted/30` (Raised) |
| `z-50` non-modal | sidebar=z-30, header=z-20, dropdowns=z-40 |
| `hover:shadow-md` sur card | `hover:shadow-elevation-raised-hover` |
| `border-border/60` Raised/Overlay | `border-border/40` |

Dark mode : surfaces s'éclaircissent quand l'élévation augmente — géré par tokens, ne jamais hardcoder.

---

## 8. Typographie — plancher de lisibilité

**Plancher absolu : 11px**. Tailles < 11px (`text-[7px]` → `text-[10px]`) **interdites**, y compris en inline `style="font-size: Npx"`.

| Usage | Taille | Classe |
|---|---|---|
| Body | 12-14px | `text-xs` / `text-sm` |
| Secondaire (helper, meta, tag, badge, eyebrow, hint) | 11px | `text-[11px]` |

- Eyebrows uppercase : `text-[11px] font-bold uppercase tracking-wider`.
- Si un badge ne tient pas : réduire le padding ou le contenu, **jamais la police**.
- Avatars : conteneur min `h-5 w-5` avec `text-[11px]` (sinon `h-6 w-6`).

---

## 9. Patterns UI partagés

- **Record Picker** : dropdown recherche + bouton "Créer" en sous-modal (Lot, Bâtiment, Tiers). Pas de bouton standalone "Nouveau bâtiment".
- **Filtres rapides** : dropdowns compacts (Période/Technicien/Statut), persistés dans `UserPreference`, partagés entre vues.
- **Drawer mission** : panneau droite. Lecture seule si terminée (sauf commentaire + clés).
- **Colonnes configurables** : toggle show/hide + reset, persistés dans `UserPreference`.
- **Calendrier** : semaine (cartes pastel par statut) + mini mensuel sidebar. Clic → drawer. Pas de création par clic créneau.
- **Vue carte** : clusters au dézoom, couleur par statut, seuls bâtiments géocodés visibles.

---

## 10. Git

- Conventional Commits : `type(scope): description` — `feat`/`fix`/`refactor`/`docs`/`test`/`chore`.
- Branches `feat/xxx`, `fix/xxx`, `refactor/xxx`. PR obligatoire pour merge sur `main`.

---

## 11. Pour aller plus loin

- **Specs/EPICs/US** : `knowledge/notion/_index.md`
- **Architecture DB détaillée** : `knowledge/notion/pages/architecture-de-donnees-immochecker-v1.md`
- **Attributs par table** : `knowledge/notion/pages/attributs-par-table-immochecker-v1.md`
- **Règles transverses** : `.claude/rules/` (DB, security, deploy, shadcn)
- **Enums** : voir `server/db/` (source de vérité)
