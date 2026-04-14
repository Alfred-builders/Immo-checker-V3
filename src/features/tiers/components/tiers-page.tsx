import { useState, useMemo } from 'react'
import { MagnifyingGlass, Plus, User, BuildingOffice, UsersThree, Briefcase, CaretUp, CaretDown } from '@phosphor-icons/react'
import { Input } from 'src/components/ui/input'
import { Button } from 'src/components/ui/button'
import { Skeleton } from 'src/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select'
import { useTiers, useTiersStats } from '../api'
import { CreateTiersModal } from './create-tiers-modal'
import { ResizeHandle, useResizableColumns } from '../../../components/shared/resizable-columns'
import { ColumnConfig } from '../../../components/shared/column-config'
import { DynamicFilter, type FilterField, type ActiveFilter } from '../../../components/shared/dynamic-filter'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../hooks/use-auth'
import { formatDate } from '../../../lib/formatters'
import type { Tiers } from '../types'

type Tab = 'proprietaire' | 'locataire' | 'mandataire' | 'tous'

// --- Column definitions per tab (spec-compliant) ---

interface ColumnDef {
  id: string
  label: string
  width: number
  minWidth?: number
  align?: 'center' | 'left' | 'right'
  resizable?: boolean
}

// Proprietaire: Nom/RS, type, email, tel, nb lots, derniere mission
const COLUMNS_PROPRIETAIRE: ColumnDef[] = [
  { id: 'avatar', label: '', width: 32, resizable: false },
  { id: 'nom', label: 'Nom / Raison sociale', width: 220, minWidth: 40 },
  { id: 'type', label: 'Type', width: 96, minWidth: 40 },
  { id: 'email', label: 'Email', width: 180, minWidth: 40 },
  { id: 'tel', label: 'Téléphone', width: 130, minWidth: 40 },
  { id: 'nb_lots', label: 'Nb lots', width: 80, minWidth: 40, align: 'center' },
  { id: 'derniere_mission', label: 'Dernière mission', width: 120, minWidth: 40 },
]

// Locataire: Nom/RS, email, tel, dernier lot (EDL), proprietaire, derniere mission
const COLUMNS_LOCATAIRE: ColumnDef[] = [
  { id: 'avatar', label: '', width: 32, resizable: false },
  { id: 'nom', label: 'Nom / Raison sociale', width: 200, minWidth: 40 },
  { id: 'email', label: 'Email', width: 180, minWidth: 40 },
  { id: 'tel', label: 'Téléphone', width: 130, minWidth: 40 },
  { id: 'dernier_lot', label: 'Dernier lot', width: 160, minWidth: 40 },
  { id: 'proprietaire', label: 'Propriétaire', width: 150, minWidth: 40 },
  { id: 'derniere_mission', label: 'Dernière mission', width: 120, minWidth: 40 },
]

// Mandataire: RS, contact principal, email, tel, nb lots en gestion
const COLUMNS_MANDATAIRE: ColumnDef[] = [
  { id: 'avatar', label: '', width: 32, resizable: false },
  { id: 'nom', label: 'Raison sociale', width: 220, minWidth: 40 },
  { id: 'contact_principal', label: 'Contact principal', width: 160, minWidth: 40 },
  { id: 'email', label: 'Email', width: 180, minWidth: 40 },
  { id: 'tel', label: 'Téléphone', width: 130, minWidth: 40 },
  { id: 'nb_lots_gestion', label: 'Lots en gestion', width: 110, minWidth: 40, align: 'center' },
]

// Tous: Nom/RS, type, roles, email, tel, derniere mission
const COLUMNS_TOUS: ColumnDef[] = [
  { id: 'avatar', label: '', width: 32, resizable: false },
  { id: 'nom', label: 'Nom / Raison sociale', width: 200, minWidth: 40 },
  { id: 'type', label: 'Type', width: 96, minWidth: 40 },
  { id: 'roles', label: 'Rôle(s)', width: 180, minWidth: 40 },
  { id: 'email', label: 'Email', width: 180, minWidth: 40 },
  { id: 'tel', label: 'Téléphone', width: 130, minWidth: 40 },
  { id: 'derniere_mission', label: 'Dernière mission', width: 120, minWidth: 40 },
]

const COLUMNS_BY_TAB: Record<Tab, ColumnDef[]> = {
  proprietaire: COLUMNS_PROPRIETAIRE,
  locataire: COLUMNS_LOCATAIRE,
  mandataire: COLUMNS_MANDATAIRE,
  tous: COLUMNS_TOUS,
}

const TIERS_FILTER_FIELDS: FilterField[] = [
  { id: 'type_personne', label: 'Type', type: 'select', options: [
    { value: 'physique', label: 'Personne physique' },
    { value: 'morale', label: 'Personne morale' },
  ]},
  { id: 'nom', label: 'Nom', type: 'text' },
  { id: 'email', label: 'Email', type: 'text' },
  { id: 'tel', label: 'Téléphone', type: 'text' },
  { id: 'ville', label: 'Ville', type: 'text' },
  { id: 'est_archive', label: 'Archivé', type: 'boolean' },
  { id: 'nb_lots', label: 'Nb lots', type: 'number' },
  { id: 'created_at', label: 'Créé le', type: 'text' },
]

function buildDefaultWidths(columns: ColumnDef[]): Record<string, number> {
  const widths: Record<string, number> = {}
  for (const col of columns) widths[col.id] = col.width
  return widths
}

export function TiersPage() {
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<Tab>('proprietaire')
  const [typePersonneFilter, setTypePersonneFilter] = useState<string>('all')
  const [villeFilter, setVilleFilter] = useState<string>('all')
  const [archivedFilter, setArchivedFilter] = useState<string>('active')
  const [showCreate, setShowCreate] = useState(false)
  const navigate = useNavigate()
  const { workspace } = useAuth()

  const columns = COLUMNS_BY_TAB[tab]
  const defaultWidths = useMemo(() => buildDefaultWidths(columns), [columns])
  const { colWidths, onResizeStart, onResize } = useResizableColumns(defaultWidths)
  const [visibleCols, setVisibleCols] = useState<string[]>(columns.filter(c => c.label).map(c => c.id))

  const role = tab === 'tous' ? undefined : tab
  const { data, isLoading } = useTiers({
    search: search || undefined,
    role,
    type_personne: typePersonneFilter !== 'all' ? typePersonneFilter as 'physique' | 'morale' : undefined,
  })
  const { data: stats } = useTiersStats()
  const tiersRaw = data?.data ?? []

  // Sort
  type SortDir = 'asc' | 'desc'
  const [sortCol, setSortCol] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  function handleSort(col: string) {
    if (sortCol === col) { setSortDir(d => d === 'asc' ? 'desc' : 'asc') }
    else { setSortCol(col); setSortDir('asc') }
  }

  // Extra client-side filters
  const filtered = useMemo(() => {
    let list = tiersRaw
    if (villeFilter !== 'all') list = list.filter(t => t.ville === villeFilter)
    if (archivedFilter === 'active') list = list.filter(t => !t.est_archive)
    else if (archivedFilter === 'archived') list = list.filter(t => t.est_archive)
    return list
  }, [tiersRaw, villeFilter, archivedFilter])

  const uniqueVilles = useMemo(() => {
    const villes = new Set<string>()
    tiersRaw.forEach(t => { if (t.ville) villes.add(t.ville) })
    return [...villes].sort()
  }, [tiersRaw])

  const tiersList = useMemo(() => {
    if (!sortCol) return filtered
    return [...filtered].sort((a, b) => {
      const key = sortCol as keyof typeof a
      let aVal: any = a[key]
      let bVal: any = b[key]
      if (sortCol === 'nom') {
        aVal = a.type_personne === 'morale' ? (a.raison_sociale || a.nom) : `${a.prenom || ''} ${a.nom}`
        bVal = b.type_personne === 'morale' ? (b.raison_sociale || b.nom) : `${b.prenom || ''} ${b.nom}`
      }
      if (aVal == null) return 1
      if (bVal == null) return -1
      const cmp = typeof aVal === 'number' ? aVal - bVal : String(aVal).localeCompare(String(bVal))
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [filtered, sortCol, sortDir])

  // Hide Mandataire tab for agence workspaces
  const showMandataire = workspace?.type_workspace !== 'agence'

  const tabs: { key: Tab; label: string; icon: typeof UsersThree; count?: number; discrete?: boolean }[] = [
    { key: 'proprietaire', label: 'Propriétaires', icon: User, count: stats?.proprietaires },
    { key: 'locataire', label: 'Locataires', icon: User },
    ...(showMandataire ? [{ key: 'mandataire' as Tab, label: 'Mandataires', icon: Briefcase, count: stats?.mandataires }] : []),
    { key: 'tous', label: 'Tous', icon: UsersThree, count: stats?.total, discrete: true },
  ]

  return (
    <div className="px-8 py-6 max-w-[1400px] mx-auto space-y-6">
      <CreateTiersModal open={showCreate} onOpenChange={setShowCreate} onCreated={(id) => navigate(`/app/tiers/${id}`)} />

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Tiers</h1>
          <p className="text-xs text-muted-foreground mt-1">Propriétaires, locataires{showMandataire ? ', mandataires' : ''}</p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" /> Nouveau tiers
        </Button>
      </div>

      {/* Tabs — pill segmented control */}
      <div className="flex items-center bg-muted/60 rounded-full p-0.5 w-fit">
        {tabs.map(({ key, label, count, discrete }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              tab === key
                ? 'bg-card text-foreground shadow-sm'
                : discrete
                  ? 'text-muted-foreground/50 hover:text-muted-foreground'
                  : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
            {count !== undefined && (
              <span className={`ml-1 ${tab === key ? 'text-foreground/50' : 'text-muted-foreground/40'}`}>{count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Filters bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <Input placeholder="Rechercher un tiers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-10" />
        </div>

        <Select value={typePersonneFilter} onValueChange={setTypePersonneFilter}>
          <SelectTrigger className="h-10 w-[160px] text-sm">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="physique">Personne physique</SelectItem>
            <SelectItem value="morale">Personne morale</SelectItem>
          </SelectContent>
        </Select>

        <Select value={villeFilter} onValueChange={setVilleFilter}>
          <SelectTrigger className="h-10 w-[140px] text-sm">
            <SelectValue placeholder="Ville" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les villes</SelectItem>
            {uniqueVilles.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={archivedFilter} onValueChange={setArchivedFilter}>
          <SelectTrigger className="h-10 w-[120px] text-sm">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Actifs</SelectItem>
            <SelectItem value="archived">Archivés</SelectItem>
            <SelectItem value="all">Tous</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto">
          <ColumnConfig
            page="tiers_list"
            columns={columns.filter(c => c.label).map(c => ({ id: c.id, label: c.label, defaultVisible: true }))}
            visibleColumns={visibleCols}
            onColumnsChange={setVisibleCols}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border/40 shadow-elevation-raised overflow-hidden">
        {/* Dynamic header */}
        <div className="flex items-center gap-4 px-5 py-3 border-b border-border/30 text-xs font-medium text-muted-foreground select-none bg-muted/20">
          {columns.filter(col => !col.label || visibleCols.includes(col.id)).map((col) => {
            const sortable = col.id !== 'avatar' && !!col.label
            const isActive = sortCol === col.id && sortable
            return (
              <div
                key={col.id}
                className={`relative shrink-0 ${col.align === 'center' ? 'text-center' : ''} ${sortable ? 'cursor-pointer hover:text-foreground transition-colors' : ''}`}
                style={{ width: colWidths[col.id] ?? col.width, minWidth: col.minWidth ?? undefined }}
                onClick={() => sortable && handleSort(col.id)}
              >
                <span className={`inline-flex items-center gap-1.5 ${isActive ? 'text-foreground' : ''}`}>
                  {col.label}
                  {sortable && (
                    <span className="inline-flex flex-col -space-y-1 opacity-40">
                      <CaretUp className={`h-2.5 w-2.5 ${isActive && sortDir === 'asc' ? 'text-primary !opacity-100' : ''}`} weight={isActive && sortDir === 'asc' ? 'bold' : 'regular'} />
                      <CaretDown className={`h-2.5 w-2.5 ${isActive && sortDir === 'desc' ? 'text-primary !opacity-100' : ''}`} weight={isActive && sortDir === 'desc' ? 'bold' : 'regular'} />
                    </span>
                  )}
                </span>
                {col.resizable !== false && col.label && (
                  <ResizeHandle colId={col.id} onResizeStart={onResizeStart} onResize={onResize} />
                )}
              </div>
            )
          })}
        </div>

        {isLoading && (
          <div>{[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center gap-4 px-5 py-3 border-b border-border/15">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 flex-1 rounded-full" />
              <Skeleton className="h-4 w-20 rounded-full" />
            </div>
          ))}</div>
        )}

        {!isLoading && tiersList.length === 0 && (
          <div className="py-20 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-muted/60 mb-4">
              <UsersThree className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-semibold text-muted-foreground">
              {search ? 'Aucun résultat pour cette recherche' : 'Aucun tiers'}
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              {search ? 'Essayez avec d\'autres critères' : 'Commencez par ajouter un tiers'}
            </p>
          </div>
        )}

        {!isLoading && tiersList.map((tiers, idx) => (
          <TiersRow
            key={tiers.id}
            tiers={tiers}
            columns={columns.filter(col => !col.label || visibleCols.includes(col.id))}
            colWidths={colWidths}
            index={idx}
            onClick={() => {
              const name = tiers.type_personne === 'morale' ? (tiers.raison_sociale || tiers.nom) : `${tiers.prenom || ''} ${tiers.nom}`.trim()
              navigate(`/app/tiers/${tiers.id}`, { state: { breadcrumbs: [{ label: 'Tiers', href: '/app/tiers' }, { label: name }] } })
            }}
          />
        ))}
      </div>
    </div>
  )
}

// --- Cell renderers ---

function AvatarCell({ tiers: t, width }: { tiers: Tiers; width: number }) {
  return (
    <div className="shrink-0 flex justify-center" style={{ width }}>
      <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${t.type_personne === 'morale' ? 'bg-green-100 dark:bg-green-950' : 'bg-primary/8'}`}>
        {t.type_personne === 'morale'
          ? <BuildingOffice className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
          : <span className="text-[10px] font-semibold text-primary/70">{(t.prenom?.[0] || t.nom[0]).toUpperCase()}</span>
        }
      </div>
    </div>
  )
}

function NomCell({ tiers: t, width }: { tiers: Tiers; width: number }) {
  const displayName = t.type_personne === 'morale'
    ? t.raison_sociale || t.nom
    : `${t.prenom || ''} ${t.nom}`.trim()
  return (
    <div className="shrink-0 min-w-0" style={{ width }}>
      <p className="font-semibold text-[13px] text-foreground group-hover:text-primary truncate transition-colors duration-200">{displayName}</p>
      {t.est_archive && <span className="text-[10px] text-muted-foreground/50">Archivé</span>}
    </div>
  )
}

function TypeCell({ tiers: t, width }: { tiers: Tiers; width: number }) {
  return (
    <div className="shrink-0" style={{ width }}>
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${t.type_personne === 'morale' ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' : 'bg-primary/10 text-primary'}`}>
        {t.type_personne === 'morale' ? 'Morale' : 'Physique'}
      </span>
    </div>
  )
}

function RolesCell({ tiers: t, width }: { tiers: Tiers; width: number }) {
  const roles: { label: string; className: string }[] = []
  if ((t.nb_lots_proprio || 0) > 0) roles.push({ label: 'Propriétaire', className: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' })
  if ((t.nb_edl_locataire || 0) > 0) roles.push({ label: 'Locataire', className: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' })
  if ((t.nb_lots_mandataire || 0) > 0) roles.push({ label: 'Mandataire', className: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300' })

  return (
    <div className="shrink-0 flex items-center gap-1 flex-wrap" style={{ width }}>
      {roles.length > 0
        ? roles.map((r) => (
            <span key={r.label} className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${r.className}`}>{r.label}</span>
          ))
        : <span className="text-muted-foreground/25 text-[13px]">--</span>
      }
    </div>
  )
}

function EmailCell({ tiers: t, width }: { tiers: Tiers; width: number }) {
  return <div className="shrink-0 text-[13px] text-muted-foreground truncate" style={{ width }}>{t.email || '--'}</div>
}

function TelCell({ tiers: t, width }: { tiers: Tiers; width: number }) {
  return <div className="shrink-0 text-[13px] text-muted-foreground" style={{ width }}>{t.tel || '--'}</div>
}

function NbLotsCell({ count, width }: { count: number; width: number }) {
  return (
    <div className="shrink-0 text-center" style={{ width }}>
      {count > 0 ? <span className="inline-flex items-center justify-center h-6 min-w-6 px-2 rounded-full bg-muted/50 text-xs font-semibold text-foreground/70">{count}</span> : <span className="text-muted-foreground/25">--</span>}
    </div>
  )
}

function DerniereMissionCell({ tiers: t, width }: { tiers: Tiers; width: number }) {
  return (
    <div className="shrink-0 text-[13px] text-muted-foreground/60" style={{ width }}>
      {t.derniere_mission ? formatDate(t.derniere_mission) : <span className="text-muted-foreground/25">--</span>}
    </div>
  )
}

function DernierLotCell({ tiers: t, width }: { tiers: Tiers; width: number }) {
  return (
    <div className="shrink-0 text-[13px] text-muted-foreground truncate" style={{ width }}>
      {t.dernier_lot || <span className="text-muted-foreground/25">--</span>}
    </div>
  )
}

function ProprietaireCell({ tiers: t, width }: { tiers: Tiers; width: number }) {
  return (
    <div className="shrink-0 text-[13px] text-muted-foreground truncate" style={{ width }}>
      {t.proprietaire_nom || <span className="text-muted-foreground/25">--</span>}
    </div>
  )
}

function ContactPrincipalCell({ tiers: t, width }: { tiers: Tiers; width: number }) {
  return (
    <div className="shrink-0 text-[13px] text-muted-foreground truncate" style={{ width }}>
      {t.contact_principal || <span className="text-muted-foreground/25">--</span>}
    </div>
  )
}

// --- Row ---

function TiersRow({ tiers: t, columns, colWidths, index, onClick }: {
  tiers: Tiers; columns: ColumnDef[]; colWidths: Record<string, number>; index: number; onClick: () => void
}) {
  return (
    <div
      className="group flex items-center gap-4 px-5 py-3 border-b border-border/15 last:border-0 hover:bg-primary/[0.03] cursor-pointer transition-all duration-150 text-[13px]"
      onClick={onClick}
    >
      {columns.map((col) => {
        const w = colWidths[col.id] ?? col.width
        switch (col.id) {
          case 'avatar': return <AvatarCell key={col.id} tiers={t} width={w} />
          case 'nom': return <NomCell key={col.id} tiers={t} width={w} />
          case 'type': return <TypeCell key={col.id} tiers={t} width={w} />
          case 'roles': return <RolesCell key={col.id} tiers={t} width={w} />
          case 'email': return <EmailCell key={col.id} tiers={t} width={w} />
          case 'tel': return <TelCell key={col.id} tiers={t} width={w} />
          case 'nb_lots': return <NbLotsCell key={col.id} count={t.nb_lots_proprio || 0} width={w} />
          case 'nb_lots_gestion': return <NbLotsCell key={col.id} count={t.nb_lots_mandataire || 0} width={w} />
          case 'derniere_mission': return <DerniereMissionCell key={col.id} tiers={t} width={w} />
          case 'dernier_lot': return <DernierLotCell key={col.id} tiers={t} width={w} />
          case 'proprietaire': return <ProprietaireCell key={col.id} tiers={t} width={w} />
          case 'contact_principal': return <ContactPrincipalCell key={col.id} tiers={t} width={w} />
          default: return null
        }
      })}
    </div>
  )
}
