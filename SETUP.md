# ImmoChecker — Developer Setup Guide

## Prerequisites

- **Node.js** >= 18 (recommended: 22)
- **npm** >= 9
- **Git**
- **Claude Code** CLI (optional, for AI-assisted development)

---

## 1. Clone & Install

```bash
git clone https://github.com/Alfred-builders/Immo-checker-V3.git immo-check
cd immo-check
npm install
```

---

## 2. Environment Variables

Create a `.env` file at the project root:

```env
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<dbname>
JWT_SECRET=<generate-a-strong-random-secret>
JWT_REFRESH_SECRET=<generate-a-strong-random-secret>
PORT=3002
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
RESEND_API_KEY=<your-resend-api-key>
VITE_MAPBOX_TOKEN=<your-mapbox-public-token>
```

> The `DATABASE_URL` points to the shared Railway PostgreSQL instance. The database is already seeded with demo data.

---

## 3. Run the App

```bash
npm run dev
```

This starts **both** services concurrently:
- **Frontend** (Vite): http://localhost:5173
- **Backend** (Express): http://localhost:3002

### Login Credentials

| Email | Password | Role |
|---|---|---|
| `admin@flatchecker.fr` | `Admin1234` | Admin |

---

## 4. Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start frontend + backend in dev mode |
| `npm run dev:client` | Start frontend only (Vite) |
| `npm run dev:server` | Start backend only (tsx watch) |
| `npm run build` | Build for production (Vite + tsc) |
| `npm start` | Run production build |
| `npx tsx server/db/seed.ts` | Re-seed the database with demo data |

---

## 5. Project Structure

```
/src                          Frontend (React + TypeScript + Vite)
  /components/ui              shadcn/ui components (do not edit manually)
  /components/shared          Reusable components (FloatingSaveBar, DynamicFilter, etc.)
  /features                   Feature modules
    /auth                     Login, register, forgot password
    /dashboard                Dashboard (EPIC 14)
    /missions                 Missions (EPIC 13)
    /patrimoine               Batiments & Lots (EPIC 1)
    /tiers                    Tiers (EPIC 2)
    /templates                Templates, Catalogue, Criteres (EPIC 4)
    /admin                    Settings, Users, API keys (EPIC 11)
  /layouts                    Main layout (sidebar) + Auth layout
  /hooks                      Global hooks (useAuth, etc.)
  /lib                        Utilities (api-client, formatters, cn)

/server                       Backend (Express + TypeScript)
  /routes                     API routes (REST)
  /routes/v1                  Public API v1 (for external integrations)
  /services                   Business logic (auth, email)
  /db                         Database (schema.sql, seed.ts, pool)
  /middleware                 Auth JWT, validation, rate limiting

/knowledge/notion             Synced Notion specs (read-only reference)
  /pages                      EPICs and feature specs
  /related                    User Stories (62 US)
```

---

## 6. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS v4 |
| UI Components | shadcn/ui (Radix), Phosphor Icons |
| State | TanStack Query (React Query) |
| Charts | Recharts |
| Maps | Mapbox GL |
| Backend | Node.js, Express (ESM) |
| Database | PostgreSQL (Railway) |
| Auth | JWT (httpOnly cookies) + bcryptjs |
| Email | Resend |
| Hosting | Railway (auto-deploy from main) |

---

## 7. Key Conventions

- **Files**: kebab-case (`mission-detail-page.tsx`)
- **Components**: PascalCase (`MissionDetailPage`)
- **DB columns / API JSON**: snake_case (`date_planifiee`)
- **Commits**: `type(scope): description` (feat, fix, refactor, docs, test, chore)
- **UI in French**, code and API in English
- **No hard delete** — archiving only (`est_archive = true`)
- **No inline editing on tables** — all modifications via detail page or drawer
- **Elevation system**: 5 levels (Sunken, Default, Raised, Overlay, Floating) — see `CLAUDE.md` section 7h

---

## 8. Using Claude Code

The project is fully configured for Claude Code:

```bash
claude
```

Claude Code will automatically read:
- `CLAUDE.md` — Complete project context, architecture decisions, conventions
- `.claude/rules/` — Specific rules (database, git, shadcn, etc.)
- `.claude/skills/` — Custom skills (frontend designer, etc.)
- `knowledge/notion/` — All Notion specs and User Stories

### Key context files for Claude:
- `CLAUDE.md` — **Read this first.** Contains the full product vision, data model, navigation, state machines, UI patterns, and interdictions.
- `knowledge/notion/_index.md` — Index of all Notion specs
- `knowledge/notion/pages/epic-*.md` — EPIC-level specs
- `knowledge/notion/related/fcr-us*.md` — Individual User Stories

---

## 9. Database

The PostgreSQL database is hosted on Railway. Connection details are in `.env`.

### Reset / Re-seed

```bash
# Apply schema (creates tables if not exist)
node -e "const{Pool}=require('pg');const fs=require('fs');const p=new Pool({connectionString:process.env.DATABASE_URL});p.query(fs.readFileSync('server/db/schema.sql','utf8')).then(()=>{console.log('OK');p.end()})"

# Seed demo data
npx tsx server/db/seed.ts
```

### Schema

28 tables across 5 layers:
- **Auth**: workspace, utilisateur, workspace_user
- **Tiers**: tiers, tiers_organisation, lot_proprietaire, edl_locataire
- **Patrimoine**: batiment, adresse_batiment, lot
- **Operationnel**: mission, mission_technicien, edl_inventaire, cle_mission, indisponibilite_technicien
- **Catalogue**: type_piece, catalogue_item, valeur_referentiel, template_piece_item, config_critere_categorie

Full schema: `server/db/schema.sql`

---

## 10. Production (Railway)

- **URL**: https://webapp-production-3ea7.up.railway.app
- **Auto-deploy**: from `main` branch via GitHub integration
- **Manual deploy**: `railway up --service webapp --detach`
- **Logs**: `railway logs -n 30`
- **Status**: `railway service status`

### Railway CLI Setup

```bash
npm install -g @railway/cli
railway login
railway link --project immo-check --environment production
railway service webapp
```

---

## 11. API Documentation

Swagger UI available at:
- **Local**: http://localhost:3002/api/docs
- **Production**: https://webapp-production-3ea7.up.railway.app/api/docs

OpenAPI spec: `server/openapi.yaml`
