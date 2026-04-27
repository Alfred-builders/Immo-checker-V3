import { useState, useMemo, useEffect } from 'react'
import { MagnifyingGlass, MapTrifold, List, BuildingOffice, CaretRight, CaretUp, CaretDown, House, Storefront, Bank, Plus, UploadSimple } from '@phosphor-icons/react'
import { Input } from 'src/components/ui/input'
import { Badge } from 'src/components/ui/badge'
import { Button } from 'src/components/ui/button'
import { Skeleton } from 'src/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select'
import { useQueryClient } from '@tanstack/react-query'
import { useBatimentsInfinite, useBatimentLots } from '../api'
import { formatDate } from '../../../lib/formatters'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CreateBuildingModal } from './create-building-modal'
import { CreateLotModal } from './create-lot-modal'
import { ImportCSVModal } from './import-csv-modal'
import { PatrimoineMap } from './patrimoine-map'
import { ColumnConfig, type ColumnDef } from '../../../components/shared/column-config'
import { usePagePreference } from '../../../lib/use-page-preference'
import { ResizeHandle, useResizableColumns } from '../../../components/shared/resizable-columns'
import { DynamicFilter, type FilterField, type ActiveFilter } from '../../../components/shared/dynamic-filter'
import { LoadMoreFooter } from '../../../components/shared/load-more-footer'
import type { Batiment, Lot } from '../types'

const BATIMENT_COLUMNS: ColumnDef[] = [
  { id: 'designation', label: 'Désignation', defaultVisible: true },
  { id: 'type', label: 'Type', defaultVisible: true },
  { id: 'adresse', label: 'Adresse', defaultVisible: true },
  { id: 'nb_lots', label: 'Lots', defaultVisible: true },
  { id: 'derniere_mission', label: 'Dernière mission', defaultVisible: true },
  { id: 'missions_a_venir', label: 'À venir', defaultVisible: true },
  { id: 'annee_construction', label: 'Année construction', defaultVisible: false },
  { id: 'nb_etages', label: 'Étages', defaultVisible: false },
  { id: 'created_at', label: 'Créé le', defaultVisible: false },
]

const FILTER_FIELDS: FilterField[] = [
  { id: 'type', label: 'Type', type: 'select', options: [
    { value: 'immeuble', label: 'Immeuble' },
    { value: 'maison', label: 'Maison' },
    { value: 'local_commercial', label: 'Local commercial' },
    { value: 'mixte', label: 'Mixte' },
  ]},
  { id: 'ville', label: 'Ville', type: 'text' },
  { id: 'designation', label: 'Désignation', type: 'text' },
  { id: 'nb_lots', label: 'Nb lots', type: 'number' },
  { id: 'nb_etages', label: 'Étages', type: 'number' },
  { id: 'annee_construction', label: 'Année', type: 'number' },
  { id: 'derniere_mission', label: 'Dernière mission', type: 'text' },
  { id: 'missions_a_venir', label: 'Missions à venir', type: 'number' },
  { id: 'created_at', label: 'Créé le', type: 'text' },
  { id: 'est_archive', label: 'Archivé', type: 'boolean' },
]

const typeIcons: Record<string, typeof BuildingOffice> = {
  immeuble: BuildingOffice, maison: House, local_commercial: Storefront, mixte: Bank, autre: BuildingOffice,
}

const typeLabels: Record<string, string> = {
  immeuble: 'Immeuble', maison: 'Maison', local_commercial: 'Local commercial', mixte: 'Mixte', autre: 'Autre',
}

const typeColors: Record<string, string> = {
  immeuble: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  maison: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  local_commercial: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  mixte: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  autre: 'bg-muted text-muted-foreground',
}

const DEFAULT_COL_WIDTHS: Record<string, number> = {
  designation: 220,
  type: 120,
  adresse: 200,
  nb_lots: 64,
  nb_etages: 64,
  annee_construction: 72,
  derniere_mission: 110,
  missions_a_venir: 72,
  created_at: 100,
}

// Sortable column definitions
type SortKey = 'designation' | 'nb_lots' | 'nb_etages' | 'annee_construction' | 'derniere_mission' | 'missions_a_venir' | 'created_at'
type SortDir = 'asc' | 'desc'

const SORTABLE_COLS: Set<string> = new Set(['designation', 'nb_lots', 'nb_etages', 'annee_construction', 'derniere_mission', 'missions_a_venir', 'created_at'])

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

// Client-side filter logic
function applyFilters(batiments: Batiment[], filters: ActiveFilter[]): Batiment[] {
  if (filters.length === 0) return batiments
  return batiments.filter(bat => {
    return filters.every(f => {
      const val = getFieldValue(bat, f.field)
      return matchFilter(val, f.operator, f.value, f.field)
    })
  })
}

function getFieldValue(bat: Batiment, field: string): string | number | boolean | null {
  switch (field) {
    case 'type': return bat.type
    case 'ville': return bat.adresse_principale?.ville ?? null
    case 'designation': return bat.designation
    case 'nb_lots': return bat.nb_lots
    case 'nb_etages': return bat.nb_etages ?? null
    case 'annee_construction': return bat.annee_construction ?? null
    case 'est_archive': return bat.est_archive
    default: return null
  }
}

function matchFilter(val: string | number | boolean | null, op: string, target: string, _field: string): boolean {
  if (!target) return true
  if (val === null || val === undefined) return false
  const sVal = String(val).toLowerCase()
  const sTarget = target.toLowerCase()

  switch (op) {
    case 'contains': return sVal.includes(sTarget)
    case 'equals': return sVal === sTarget
    case 'not_equals': return sVal !== sTarget
    case 'starts_with': return sVal.startsWith(sTarget)
    case 'gt': return Number(val) > Number(target)
    case 'lt': return Number(val) < Number(target)
    case 'gte': return Number(val) >= Number(target)
    case 'lte': return Number(val) <= Number(target)
    default: return true
  }
}

// Client-side sort
function applySorting(batiments: Batiment[], sortKey: SortKey | null, sortDir: SortDir): Batiment[] {
  if (!sortKey) return batiments
  return [...batiments].sort((a, b) => {
    let aVal: any = (a as any)[sortKey]
    let bVal: any = (b as any)[sortKey]
    // Handle nested derniere_mission as date string
    if (aVal === null || aVal === undefined) aVal = ''
    if (bVal === null || bVal === undefined) bVal = ''
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal
    }
    const cmp = String(aVal).localeCompare(String(bVal), 'fr', { numeric: true })
    return sortDir === 'asc' ? cmp : -cmp
  })
}

export function PatrimoinePage() {
  const [search, setSearch] = useState('')
  const [dynamicFilters, setDynamicFilters] = useState<ActiveFilter[]>([])
  const [typeQuickFilter, setTypeQuickFilter] = useState<string>('all')
  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  // Cycle 3-états : mémorise la dernière col/dir pour reprendre après "no sort".
  const [lastSortKey, setLastSortKey] = useState<SortKey | null>(null)
  const [lastSortDir, setLastSortDir] = useState<SortDir>('asc')
  const [view, setViewState] = useState<'table' | 'carte'>(() => {
    const saved = sessionStorage.getItem('patrimoine_view')
    return saved === 'carte' ? 'carte' : 'table'
  })
  function setView(v: 'table' | 'carte') {
    setViewState(v)
    sessionStorage.setItem('patrimoine_view', v)
  }
  const [showCreateBuilding, setShowCreateBuilding] = useState(false)
  const [showCreateLot, setShowCreateLot] = useState(false)
  const [showImportCSV, setShowImportCSV] = useState(false)
  const [maisonBatimentId, setMaisonBatimentId] = useState<string | null>(null)

  // Auto-ouverture depuis Cmd+K (?action=create-batiment).
  const [searchParams, setSearchParams] = useSearchParams()
  useEffect(() => {
    if (searchParams.get('action') === 'create-batiment') {
      setShowCreateBuilding(true)
      const next = new URLSearchParams(searchParams)
      next.delete('action')
      setSearchParams(next, { replace: true })
    }
  }, [searchParams, setSearchParams])
  const { colWidths, onResizeStart: handleResizeStart, onResize: handleResize } = useResizableColumns(DEFAULT_COL_WIDTHS)

  const debouncedSearch = useDebounce(search, 300)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const colDefaults = useMemo(() => ({
    visible_columns: BATIMENT_COLUMNS.filter(c => c.defaultVisible).map(c => c.id),
    column_order: BATIMENT_COLUMNS.map(c => c.id),
  }), [])
  const { config: colPrefs, update: updateColPrefs } = usePagePreference<{ visible_columns: string[]; column_order: string[] }>('patrimoine_batiments', colDefaults)
  const visibleCols = Array.isArray(colPrefs.visible_columns) ? colPrefs.visible_columns : colDefaults.visible_columns
  const columnOrder = Array.isArray(colPrefs.column_order) ? colPrefs.column_order : colDefaults.column_order
  function setVisibleCols(next: string[]) { updateColPrefs({ visible_columns: next }) }
  function setColumnOrder(next: string[]) { updateColPrefs({ column_order: next }) }

  // Check if archive filter is active
  const hasArchiveFilter = dynamicFilters.some(f => f.field === 'est_archive')
  const typeFilter = typeQuickFilter !== 'all' ? typeQuickFilter : dynamicFilters.find(f => f.field === 'type' && f.operator === 'equals')?.value

  const {
    data,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useBatimentsInfinite({
    search: debouncedSearch || undefined,
    type: typeFilter || undefined,
    archived: hasArchiveFilter || undefined,
  })

  const batimentsRaw = useMemo(() => data?.pages.flatMap((p) => p.data) ?? [], [data])

  // Apply client-side filters + sort
  const filteredBatiments = useMemo(() => {
    const filtered = applyFilters(batimentsRaw, dynamicFilters.filter(f => !['type', 'est_archive'].includes(f.field)))
    return applySorting(filtered, sortKey, sortDir)
  }, [batimentsRaw, dynamicFilters, sortKey, sortDir])

  const isCol = (id: string) => visibleCols.includes(id)

  // Toggle sort — cycle 3-états : asc → none → desc → none → asc...
  function handleSort(col: string) {
    if (!SORTABLE_COLS.has(col)) return
    const key = col as SortKey

    if (sortKey === key) {
      // Actuellement actif → cancel + mémorise.
      setLastSortKey(key)
      setLastSortDir(sortDir)
      setSortKey(null)
      return
    }
    if (sortKey === null && lastSortKey === key) {
      // Pas de tri, mais cette col était la dernière active → flip dir.
      const newDir: SortDir = lastSortDir === 'asc' ? 'desc' : 'asc'
      setLastSortDir(newDir)
      setSortKey(key)
      setSortDir(newDir)
      return
    }
    // Nouvelle colonne → start asc.
    setLastSortKey(key)
    setLastSortDir('asc')
    setSortKey(key)
    setSortDir('asc')
  }

  // Stats
  const totalBatiments = filteredBatiments.length
  const totalLots = filteredBatiments.reduce((acc, b) => acc + (b.nb_lots || 0), 0)
  const withMissions = filteredBatiments.filter(b => b.missions_a_venir > 0).length

  // Effective column order — saved order, ensure all known columns covered
  const effectiveOrder = useMemo(() => {
    const known = BATIMENT_COLUMNS.map(c => c.id)
    const seen = new Set<string>()
    const out: string[] = []
    for (const id of columnOrder) {
      if (known.includes(id) && !seen.has(id)) { out.push(id); seen.add(id) }
    }
    for (const id of known) if (!seen.has(id)) out.push(id)
    return out
  }, [columnOrder])
  const visibleOrdered = effectiveOrder.filter(id => visibleCols.includes(id))

  return (
    <div className="px-8 py-6 max-w-[1400px] mx-auto space-y-6">
      {/* Modals */}
      <CreateBuildingModal
        open={showCreateBuilding}
        onOpenChange={setShowCreateBuilding}
        onCreated={() => queryClient.invalidateQueries({ queryKey: ['batiments'] })}
        onMaisonCreated={(batId) => { setMaisonBatimentId(batId); setShowCreateLot(true) }}
      />
      <CreateLotModal
        open={showCreateLot}
        onOpenChange={(open) => { setShowCreateLot(open); if (!open) setMaisonBatimentId(null) }}
        preselectedBatimentId={maisonBatimentId ?? undefined}
        preselectedTypeBien={maisonBatimentId ? 'maison' : undefined}
        onCreated={(id) => navigate(`/app/patrimoine/lots/${id}`)}
      />
      <ImportCSVModal
        open={showImportCSV}
        onOpenChange={setShowImportCSV}
        onImported={() => window.location.reload()}
      />

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Parc immobilier</h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isLoading ? '...' : `${totalBatiments} bâtiment${totalBatiments > 1 ? 's' : ''}`}
            {' \u00b7 '}
            {isLoading ? '...' : `${totalLots} lot${totalLots > 1 ? 's' : ''}`}
            {withMissions > 0 && (
              <> {'\u00b7 '}<span className="text-primary font-semibold">{withMissions} mission{withMissions > 1 ? 's' : ''} à venir</span></>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowImportCSV(true)}>
            <UploadSimple className="h-4 w-4" /> Import CSV
          </Button>
          <Button size="sm" onClick={() => setShowCreateLot(true)}>
            <Plus className="h-4 w-4" /> Nouveau lot
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <Input
            placeholder="Rechercher un bâtiment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10"
          />
        </div>

        {/* Quick filter: Type */}
        <Select value={typeQuickFilter} onValueChange={setTypeQuickFilter}>
          <SelectTrigger className="w-36 h-10 text-sm">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="immeuble">Immeuble</SelectItem>
            <SelectItem value="maison">Maison</SelectItem>
            <SelectItem value="local_commercial">Local commercial</SelectItem>
            <SelectItem value="mixte">Mixte</SelectItem>
          </SelectContent>
        </Select>

        <DynamicFilter fields={FILTER_FIELDS} filters={dynamicFilters} onChange={setDynamicFilters} />

        <div className="flex-1" />
        <ColumnConfig
          page="patrimoine_batiments"
          columns={BATIMENT_COLUMNS}
          visibleColumns={visibleCols}
          onColumnsChange={setVisibleCols}
          order={columnOrder}
          onOrderChange={setColumnOrder}
        />
        <div className="flex items-center bg-muted/60 rounded-full p-0.5">
          <button
            onClick={() => setView('table')}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
              view === 'table' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView('carte')}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
              view === 'carte' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <MapTrifold className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Table view */}
      {view === 'table' && (
        <div className="bg-card rounded-2xl border border-border/40 shadow-elevation-raised overflow-hidden">
         <div className="overflow-x-auto">
          <div className="min-w-max">
          {/* Table header */}
          <div className="flex items-center gap-4 px-5 py-3 border-b border-border/30 text-xs font-medium text-muted-foreground select-none bg-muted/20">
            <div className="w-7 shrink-0" />
            {visibleOrdered.map(id => {
              const sortable = SORTABLE_COLS.has(id)
              const labelMap: Record<string, string> = { designation: 'Désignation', type: 'Type', adresse: 'Adresse', nb_lots: 'Lots', nb_etages: 'Étages', annee_construction: 'Année', derniere_mission: 'Dern. mission', missions_a_venir: 'À venir', created_at: 'Créé le' }
              const align: 'center' | undefined = ['nb_lots', 'nb_etages', 'annee_construction', 'missions_a_venir'].includes(id) ? 'center' : undefined
              return sortable ? (
                <SortableHeader key={id} colId={id} label={labelMap[id]} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} width={colWidths[id]} onResizeStart={handleResizeStart} onResize={handleResize} align={align} />
              ) : (
                <div key={id} className="relative overflow-visible shrink-0" style={{ width: colWidths[id], minWidth: 40 }}>
                  {labelMap[id]}
                  <ResizeHandle colId={id} onResizeStart={handleResizeStart} onResize={handleResize} />
                </div>
              )
            })}
          </div>

          {isLoading && (
            <div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-3 border-b border-border/15">
                  <div className="w-7" />
                  <Skeleton className="h-4 flex-1 rounded-lg" />
                  <Skeleton className="h-4 w-20 rounded-lg" />
                  <Skeleton className="h-4 w-32 rounded-lg" />
                </div>
              ))}
            </div>
          )}

          {!isLoading && filteredBatiments.length === 0 && (
            <div className="py-20 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-muted/60 mb-4">
                <BuildingOffice className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                {search || dynamicFilters.length > 0 || typeQuickFilter !== 'all' ? 'Aucun résultat pour cette recherche' : 'Aucun bâtiment dans votre parc'}
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                {search || dynamicFilters.length > 0 || typeQuickFilter !== 'all' ? 'Essayez avec d\'autres critères' : 'Commencez par ajouter un lot'}
              </p>
            </div>
          )}

          {!isLoading && filteredBatiments.map((bat, idx) => (
            <BatimentRow key={bat.id} batiment={bat} visibleCols={visibleOrdered} colWidths={colWidths} index={idx} />
          ))}
          </div>
         </div>

          {!isLoading && filteredBatiments.length > 0 && (
            <LoadMoreFooter
              currentCount={filteredBatiments.length}
              hasNextPage={!!hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              onLoadMore={() => fetchNextPage()}
              noun={['bâtiment', 'bâtiments']}
            />
          )}
        </div>
      )}

      {view === 'carte' && <PatrimoineMap batiments={filteredBatiments} />}
    </div>
  )
}

/* ── Sortable Column Header ── */
function SortableHeader({ colId, label, sortKey, sortDir, onSort, width, onResizeStart, onResize, align }: {
  colId: string; label: string; sortKey: string | null; sortDir: SortDir; onSort: (col: string) => void
  width: number; onResizeStart: any; onResize: any; align?: 'center'
}) {
  const isActive = sortKey === colId
  return (
    <div
      className={`relative overflow-visible shrink-0 cursor-pointer group/sort ${align === 'center' ? 'text-center' : ''}`}
      style={{ width, minWidth: 40 }}
      onClick={() => onSort(colId)}
    >
      <span className={`inline-flex items-center gap-1.5 ${isActive ? 'text-foreground' : ''}`}>
        {label}
        <span className={`inline-flex flex-col -space-y-1 ${isActive ? '' : 'opacity-40'}`}>
          <CaretUp className={`h-2.5 w-2.5 ${isActive && sortDir === 'asc' ? 'text-primary' : ''}`} weight={isActive && sortDir === 'asc' ? 'bold' : 'regular'} />
          <CaretDown className={`h-2.5 w-2.5 ${isActive && sortDir === 'desc' ? 'text-primary' : ''}`} weight={isActive && sortDir === 'desc' ? 'bold' : 'regular'} />
        </span>
      </span>
      <ResizeHandle colId={colId} onResizeStart={onResizeStart} onResize={onResize} />
    </div>
  )
}

/* ── Building Row ── */
function renderBatimentCell(id: string, batiment: Batiment, colWidths: Record<string, number>) {
  const Icon = typeIcons[batiment.type] || BuildingOffice
  const adresse = batiment.adresse_principale
  switch (id) {
    case 'designation':
      return (
        <div key={id} className="shrink-0 flex items-center gap-3 min-w-0 overflow-hidden" style={{ width: colWidths.designation }}>
          <div className="h-8 w-8 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
            <Icon className="h-4 w-4 text-muted-foreground/60" />
          </div>
          <div className="min-w-0">
            <span className="font-medium text-[13px] text-foreground group-hover/row:text-primary truncate block transition-colors duration-200">{batiment.designation}</span>
            {batiment.est_archive && <span className="text-[11px] text-muted-foreground/50">Archivé</span>}
          </div>
        </div>
      )
    case 'type':
      return (
        <div key={id} className="shrink-0" style={{ width: colWidths.type }}>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${typeColors[batiment.type] || typeColors.autre}`}>
            {typeLabels[batiment.type]}
          </span>
        </div>
      )
    case 'adresse':
      return (
        <div key={id} className="shrink-0 text-[13px] text-muted-foreground truncate" style={{ width: colWidths.adresse }}>
          {adresse ? `${adresse.rue}, ${adresse.ville}` : <span className="text-muted-foreground/30">--</span>}
        </div>
      )
    case 'nb_lots':
      return (
        <div key={id} className="shrink-0 text-center" style={{ width: colWidths.nb_lots }}>
          <span className="inline-flex items-center justify-center h-6 min-w-6 px-2 rounded-full bg-muted/50 text-xs font-semibold text-foreground/70">{batiment.nb_lots}</span>
        </div>
      )
    case 'nb_etages':
      return <div key={id} className="shrink-0 text-center text-muted-foreground/60 text-[13px]" style={{ width: colWidths.nb_etages }}>{batiment.nb_etages ?? <span className="text-muted-foreground/25">--</span>}</div>
    case 'annee_construction':
      return <div key={id} className="shrink-0 text-center text-muted-foreground/60 text-[13px]" style={{ width: colWidths.annee_construction }}>{batiment.annee_construction ?? <span className="text-muted-foreground/25">--</span>}</div>
    case 'derniere_mission':
      return <div key={id} className="shrink-0 text-[13px] text-muted-foreground/60" style={{ width: colWidths.derniere_mission }}>{batiment.derniere_mission ? formatDate(batiment.derniere_mission) : <span className="text-muted-foreground/25">--</span>}</div>
    case 'missions_a_venir':
      return (
        <div key={id} className="shrink-0 text-center" style={{ width: colWidths.missions_a_venir }}>
          {batiment.missions_a_venir > 0 ? (
            <span className="inline-flex items-center justify-center h-6 min-w-6 px-2 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">{batiment.missions_a_venir}</span>
          ) : <span className="text-muted-foreground/25">--</span>}
        </div>
      )
    case 'created_at':
      return <div key={id} className="shrink-0 text-[13px] text-muted-foreground/60" style={{ width: colWidths.created_at }}>{formatDate(batiment.created_at)}</div>
    default:
      return null
  }
}

function BatimentRow({ batiment, visibleCols, colWidths }: { batiment: Batiment; visibleCols: string[]; colWidths: Record<string, number>; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="group/row">
      <div
        className="flex items-center gap-4 px-5 py-3 border-b border-border/15 last:border-0 hover:bg-primary/[0.03] cursor-pointer transition-all duration-150"
        onClick={() => navigate(`/app/patrimoine/batiments/${batiment.id}`, { state: { breadcrumbs: [{ label: 'Parc immobilier', href: '/app/patrimoine' }, { label: batiment.designation }] } })}
      >
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
          className="w-7 h-7 shrink-0 flex items-center justify-center rounded-lg hover:bg-muted/80 transition-colors"
        >
          <CaretRight className={`h-4 w-4 text-muted-foreground/50 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
        </button>
        {visibleCols.map(id => renderBatimentCell(id, batiment, colWidths))}
      </div>

      {expanded && <LotSubRows batimentId={batiment.id} batimentName={batiment.designation} />}
    </div>
  )
}

/* ── Lot Sub-rows ── */
function LotSubRows({ batimentId, batimentName }: { batimentId: string; batimentName: string }) {
  const { data: lots, isLoading } = useBatimentLots(batimentId)
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="pl-12 pr-5 py-3 bg-muted/30">
        {[1, 2].map((i) => (
          <div key={i} className="grid grid-cols-[1fr_100px_60px_80px_70px_140px] gap-3 py-2.5">
            <Skeleton className="h-4 rounded-lg" /><Skeleton className="h-4 rounded-lg" /><Skeleton className="h-4 rounded-lg" /><Skeleton className="h-4 rounded-lg" /><Skeleton className="h-4 rounded-lg" /><Skeleton className="h-4 rounded-lg" />
          </div>
        ))}
      </div>
    )
  }

  if (!lots || lots.length === 0) {
    return (
      <div className="pl-12 pr-5 py-4 bg-muted/30 text-sm text-muted-foreground/50">
        Aucun lot dans ce bâtiment
      </div>
    )
  }

  return (
    <div className="bg-muted/30 border-t border-border/40">
      <div className="grid grid-cols-[1fr_100px_60px_80px_70px_140px] gap-3 pl-14 pr-5 py-2.5 text-[11px] font-medium text-muted-foreground/50 border-b border-border/30">
        <div>Lot</div>
        <div>Type</div>
        <div>Étage</div>
        <div>Surface</div>
        <div>Meublé</div>
        <div>Propriétaire</div>
      </div>
      {lots.map((lot) => {
        const propLabel = lot.proprietaires?.map(p => p.prenom ? `${p.prenom} ${p.nom}` : p.nom).join(', ') || '--'
        return (
          <div
            key={lot.id}
            className="group grid grid-cols-[1fr_100px_60px_80px_70px_140px] gap-3 pl-14 pr-5 py-3 hover:bg-accent/50 cursor-pointer transition-colors duration-200 text-[13px] border-b border-border/20 last:border-b-0 items-center"
            onClick={() => navigate(`/app/patrimoine/lots/${lot.id}`, { state: { breadcrumbs: [{ label: 'Parc immobilier', href: '/app/patrimoine' }, { label: batimentName, href: `/app/patrimoine/batiments/${batimentId}` }, { label: lot.designation }] } })}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-6 w-6 rounded-lg bg-card flex items-center justify-center shrink-0 border border-border/40">
                <House className="h-3 w-3 text-muted-foreground/40" />
              </div>
              <span className="font-medium text-foreground/80 group-hover:text-primary truncate transition-colors duration-200">{lot.designation}</span>
            </div>
            <div>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${typeColors[lot.type_bien] || typeColors.autre}`}
                title={lot.type_bien === 'autre' && lot.type_bien_precision ? lot.type_bien_precision : undefined}
              >
                {lot.type_bien === 'autre' && lot.type_bien_precision
                  ? lot.type_bien_precision
                  : lot.type_bien.replace('_', ' ')}
              </span>
            </div>
            <div className="text-muted-foreground/50">{lot.etage || <span className="text-muted-foreground/25">--</span>}</div>
            <div className="text-muted-foreground/50">{lot.surface ? `${lot.surface} m²` : <span className="text-muted-foreground/25">--</span>}</div>
            <div>
              {lot.meuble ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">Meublé</span>
              ) : <span className="text-muted-foreground/25">--</span>}
            </div>
            <div className="text-muted-foreground/50 truncate">{propLabel}</div>
          </div>
        )
      })}
    </div>
  )
}
