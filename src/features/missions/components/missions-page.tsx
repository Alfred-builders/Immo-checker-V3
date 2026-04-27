import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  MagnifyingGlass, Plus, List, MapTrifold, ClipboardText, SpinnerGap, CalendarBlank, CaretUp, CaretDown, FileText, X,
} from '@phosphor-icons/react'
import { Input } from 'src/components/ui/input'
import { Button } from 'src/components/ui/button'
import { Skeleton } from 'src/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from 'src/components/ui/tooltip'
import { useMissions, useMissionStats, useWorkspaceTechnicians } from '../api'
import { ColumnConfig, type ColumnDef } from 'src/components/shared/column-config'
import { DynamicFilter, applyDynamicFilters, type FilterField, type ActiveFilter } from 'src/components/shared/dynamic-filter'
import { ResizeHandle, useResizableColumns } from 'src/components/shared/resizable-columns'
import { usePagePreference } from 'src/lib/use-page-preference'
import { formatDate, formatTime } from 'src/lib/formatters'
import { CreateMissionModal } from './create-mission-modal'
import { MissionMap } from './mission-map'
import { MissionCalendar } from './mission-calendar'
import type { Mission, StatutMission } from '../types'
import {
  statutRdvLabels, statutInvitationLabels,
  sensLabels, sensColors,
  getPendingActions, getStatutMission,
} from '../types'
import { MissionStatusBadge } from './mission-status-badge'

const BATCH_SIZE = 30

export const MISSION_COLUMNS: ColumnDef[] = [
  { id: 'reference', label: 'Reference', defaultVisible: true },
  { id: 'lot', label: 'Lot / Adresse', defaultVisible: true },
  { id: 'date', label: 'Date', defaultVisible: true },
  { id: 'types', label: 'Type(s)', defaultVisible: true },
  { id: 'technicien', label: 'Technicien', defaultVisible: true },
  { id: 'proprietaire', label: 'Propriétaire', defaultVisible: false },
  { id: 'locataires', label: 'Locataire(s)', defaultVisible: false },
  { id: 'statut', label: 'Statut mission', defaultVisible: true },
  { id: 'statut_rdv', label: 'Statut RDV', defaultVisible: true },
  { id: 'invitation', label: 'Invitation', defaultVisible: false },
  { id: 'documents', label: 'Documents', defaultVisible: true },
  { id: 'created_at', label: 'Créée le', defaultVisible: false },
]

export const DEFAULT_COL_WIDTHS: Record<string, number> = {
  reference: 130, lot: 220, date: 110, types: 130, technicien: 150,
  proprietaire: 160, locataires: 180,
  statut: 130, statut_rdv: 110, invitation: 110, documents: 100, created_at: 110,
}

// Sort accessor per column id. Columns missing here are non-sortable.
export const SORTABLE: Record<string, (m: Mission) => string> = {
  reference: (m) => m.reference,
  lot: (m) => m.lot_designation || '',
  date: (m) => m.date_planifiee || '',
  technicien: (m) => (m.technicien ? `${m.technicien.prenom} ${m.technicien.nom}` : ''),
  statut: (m) => getStatutMission(m),
  statut_rdv: (m) => m.statut_rdv || '',
  created_at: (m) => m.created_at || '',
}

type ViewMode = 'table' | 'calendrier' | 'carte'

export type PeriodFilter = 'today' | 'week' | 'month' | 'all'
export type SortDir = 'asc' | 'desc'

interface MissionsPrefs {
  visible_columns: string[]
  column_order: string[]
  filters: {
    period: PeriodFilter
    statut: string
    rdv: string
  }
  sort: { col: string; dir: SortDir }
}

const PREF_DEFAULTS: MissionsPrefs = {
  visible_columns: MISSION_COLUMNS.filter((c) => c.defaultVisible).map((c) => c.id),
  column_order: MISSION_COLUMNS.map((c) => c.id),
  filters: { period: 'all', statut: 'all', rdv: 'all' },
  sort: { col: 'date', dir: 'desc' },
}

export function getPeriodDates(period: PeriodFilter): { date_from?: string; date_to?: string } {
  const now = new Date()
  const today = now.toISOString().split('T')[0]

  switch (period) {
    case 'today':
      return { date_from: today, date_to: today }
    case 'week': {
      const day = now.getDay()
      const mondayOffset = day === 0 ? -6 : 1 - day
      const monday = new Date(now)
      monday.setDate(now.getDate() + mondayOffset)
      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)
      return { date_from: monday.toISOString().split('T')[0], date_to: sunday.toISOString().split('T')[0] }
    }
    case 'month': {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      return { date_from: firstDay.toISOString().split('T')[0], date_to: lastDay.toISOString().split('T')[0] }
    }
    case 'all':
    default:
      return {}
  }
}

export function MissionsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  // Pré-filtre date passé via URL (?date_from=YYYY-MM-DD&date_to=YYYY-MM-DD)
  // Quand présent, prend le pas sur la sélection de période.
  const [customDate, setCustomDate] = useState<{ from: string; to: string } | null>(() => {
    const df = searchParams.get('date_from')
    const dt = searchParams.get('date_to')
    if (df && dt) return { from: df, to: dt }
    return null
  })
  const [dynamicFilters, setDynamicFilters] = useState<ActiveFilter[]>([])
  const [view, setViewState] = useState<ViewMode>(() => {
    const saved = sessionStorage.getItem('missions_view')
    // Migration : la vue "kanban" a été retirée en V1 (décision Tony §7).
    // Toute préférence stale tombe sur "table".
    if (saved === 'table' || saved === 'calendrier' || saved === 'carte') return saved
    return 'table'
  })
  const [showCreate, setShowCreate] = useState(false)
  const [displayCount, setDisplayCount] = useState(BATCH_SIZE)
  const sentinelRef = useRef<HTMLDivElement>(null)

  function setView(v: ViewMode) {
    setViewState(v)
    sessionStorage.setItem('missions_view', v)
  }

  function clearCustomDate() {
    setCustomDate(null)
    const next = new URLSearchParams(searchParams)
    next.delete('date_from')
    next.delete('date_to')
    setSearchParams(next, { replace: true })
  }

  // Persisted preferences (visible columns, order, quick filters, sort)
  const { config: prefs, loaded: prefsLoaded, update: updatePrefs } = usePagePreference<MissionsPrefs>(
    'missions_list',
    PREF_DEFAULTS,
  )

  const [filters, setFiltersState] = useState(PREF_DEFAULTS.filters)
  const [sort, setSortState] = useState(PREF_DEFAULTS.sort)
  const [visibleCols, setVisibleColsState] = useState<string[]>(PREF_DEFAULTS.visible_columns)
  const [columnOrder, setColumnOrderState] = useState<string[]>(PREF_DEFAULTS.column_order)

  // Sync state once preferences finish loading from the server.
  const syncedRef = useRef(false)
  useEffect(() => {
    if (!prefsLoaded || syncedRef.current) return
    syncedRef.current = true
    setFiltersState({ ...PREF_DEFAULTS.filters, ...(prefs.filters || {}) })
    setSortState({ ...PREF_DEFAULTS.sort, ...(prefs.sort || {}) })
    if (Array.isArray(prefs.visible_columns)) setVisibleColsState(prefs.visible_columns)
    if (Array.isArray(prefs.column_order)) setColumnOrderState(prefs.column_order)
  }, [prefsLoaded, prefs])

  function updateFilters(partial: Partial<MissionsPrefs['filters']>) {
    setFiltersState((prev) => {
      const next = { ...prev, ...partial }
      updatePrefs({ filters: next })
      return next
    })
  }

  function updateSort(next: { col: string; dir: SortDir }) {
    setSortState(next)
    updatePrefs({ sort: next })
  }

  function setVisibleCols(next: string[]) {
    setVisibleColsState(next)
    updatePrefs({ visible_columns: next })
  }

  function setColumnOrder(next: string[]) {
    setColumnOrderState(next)
    updatePrefs({ column_order: next })
  }

  function handlePeriodChange(v: PeriodFilter) {
    updateFilters({ period: v })
    if (customDate) clearCustomDate()
  }

  const periodDates = useMemo(
    () => (customDate ? { date_from: customDate.from, date_to: customDate.to } : getPeriodDates(filters.period)),
    [customDate, filters.period],
  )

  const { data: statsData, isLoading: statsLoading } = useMissionStats()
  const stats = statsData ?? { total: 0, today: 0, pending: 0, upcoming: 0 }

  const { data: techData } = useWorkspaceTechnicians()
  const technicians = techData ?? []

  // Custom filter fields. `getValue` accessors map the user-friendly column id
  // to the actual data path on Mission, so nested fields (technicien object,
  // derived statut) match correctly when filtered client-side.
  const filterFields: FilterField[] = useMemo(() => [
    { id: 'reference', label: 'Référence', type: 'text' },
    { id: 'lot_designation', label: 'Lot', type: 'text' },
    {
      id: 'technicien',
      label: 'Technicien',
      type: 'select',
      options: technicians.map((t) => ({ value: t.id, label: `${t.prenom} ${t.nom}` })),
      getValue: (m: Mission) => m.technicien?.user_id,
    },
    {
      id: 'statut',
      label: 'Statut',
      type: 'select',
      options: [
        { value: 'a_traiter', label: 'À traiter' },
        { value: 'prete', label: 'Prête' },
        { value: 'terminee', label: 'Terminée' },
        { value: 'annulee', label: 'Annulée' },
      ],
      getValue: (m: Mission) => getStatutMission(m),
    },
    {
      id: 'statut_rdv',
      label: 'Statut RDV',
      type: 'select',
      options: [
        { value: 'a_confirmer', label: 'À confirmer' },
        { value: 'confirme', label: 'Confirmé' },
        { value: 'reporte', label: 'Reporté' },
      ],
    },
    { id: 'avec_inventaire', label: 'Inventaire', type: 'boolean', getValue: (m: Mission) => m.avec_inventaire },
    { id: 'date_planifiee', label: 'Date mission', type: 'date' },
    { id: 'created_at', label: 'Créée le', type: 'date' },
    { id: 'commentaire', label: 'Commentaire', type: 'text' },
  ], [technicians])

  const { data: missionsData, isLoading } = useMissions({
    search: search || undefined,
    statut_affichage: filters.statut !== 'all' ? (filters.statut as StatutMission) : undefined,
    statut_rdv: filters.rdv !== 'all' ? (filters.rdv as any) : undefined,
    ...periodDates,
  })

  const missionsRaw = missionsData?.data ?? []

  const missions = useMemo(
    () => applyDynamicFilters(missionsRaw, dynamicFilters, filterFields),
    [missionsRaw, dynamicFilters, filterFields],
  )

  const { colWidths, onResizeStart, onResize } = useResizableColumns(DEFAULT_COL_WIDTHS)

  // Reset display count on filter changes
  useEffect(() => {
    setDisplayCount(BATCH_SIZE)
  }, [search, filters.period, filters.statut, filters.rdv, customDate, dynamicFilters])

  function handleSort(col: string) {
    if (!SORTABLE[col]) return
    if (sort.col === col) {
      updateSort({ col, dir: sort.dir === 'asc' ? 'desc' : 'asc' })
    } else {
      // Date-like columns default to descending (most recent first); the rest
      // start ascending. The user can flip after the first click.
      const dir: SortDir = col === 'date' || col === 'created_at' ? 'desc' : 'asc'
      updateSort({ col, dir })
    }
  }

  const sortedMissions = useMemo(() => {
    const accessor = SORTABLE[sort.col]
    if (!accessor) return missions
    return [...missions].sort((a, b) => {
      const av = accessor(a) || ''
      const bv = accessor(b) || ''
      const cmp = av.localeCompare(bv, 'fr', { numeric: true })
      return sort.dir === 'asc' ? cmp : -cmp
    })
  }, [missions, sort])

  const displayedMissions = useMemo(
    () => sortedMissions.slice(0, displayCount),
    [sortedMissions, displayCount]
  )
  const hasMore = displayCount < sortedMissions.length

  // Infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore) {
          setDisplayCount(prev => Math.min(prev + BATCH_SIZE, missions.length))
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, missions.length])

  function handleStatClick(type: 'total' | 'today' | 'pending' | 'upcoming') {
    if (customDate) clearCustomDate()
    switch (type) {
      case 'total':
        updateFilters({ period: 'all', statut: 'all' })
        break
      case 'today':
        updateFilters({ period: 'today', statut: 'all' })
        break
      case 'pending':
        // "À traiter" couvre déjà les missions avec actions en attente.
        updateFilters({ period: 'all', statut: 'a_traiter' })
        break
      case 'upcoming':
        updateFilters({ period: 'all', statut: 'all' })
        break
    }
  }

  // Effective column order: saved order, but always covering all known columns
  // (anything new gets appended at the end so future columns appear by default).
  const effectiveOrder: string[] = useMemo(() => {
    const knownIds = MISSION_COLUMNS.map((c) => c.id)
    const seen = new Set<string>()
    const out: string[] = []
    for (const id of columnOrder) {
      if (knownIds.includes(id) && !seen.has(id)) {
        out.push(id)
        seen.add(id)
      }
    }
    for (const id of knownIds) {
      if (!seen.has(id)) out.push(id)
    }
    return out
  }, [columnOrder])

  const visibleOrdered = effectiveOrder.filter((id) => visibleCols.includes(id))

  const hasActiveFilters =
    !!search ||
    filters.statut !== 'all' ||
    filters.rdv !== 'all' ||
    filters.period !== 'all' ||
    !!customDate ||
    dynamicFilters.length > 0

  return (
    <div className="px-8 py-6 max-w-[1400px] mx-auto space-y-6">
      <CreateMissionModal open={showCreate} onOpenChange={setShowCreate} />

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Missions</h1>
          <p className="text-xs text-muted-foreground mt-1">
            {statsLoading ? '...' : `${stats.total} mission${stats.total > 1 ? 's' : ''}`}
            {stats.today > 0 && (
              <> {'· '}<button onClick={() => handleStatClick('today')} className="text-primary font-semibold hover:text-primary/80 transition-colors">{stats.today} aujourd'hui</button></>
            )}
            {stats.pending > 0 && (
              <> {'· '}<button onClick={() => handleStatClick('pending')} className="text-orange-600 dark:text-orange-400 font-semibold hover:opacity-80 transition-opacity">{stats.pending} en attente</button></>
            )}
            {stats.upcoming > 0 && (
              <> {'· '}{stats.upcoming} à venir</>
            )}
          </p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" /> Nouvelle mission
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <Input
            placeholder="Rechercher une mission..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10"
          />
        </div>

        {/* Quick filters */}
        <Select
          value={customDate ? '__custom' : filters.period}
          onValueChange={(v) => { if (v === '__custom') return; handlePeriodChange(v as PeriodFilter) }}
        >
          <SelectTrigger className="h-10 w-[180px] text-sm">
            <SelectValue placeholder="Période" />
          </SelectTrigger>
          <SelectContent>
            {customDate && (
              <SelectItem value="__custom" disabled>
                {customDate.from === customDate.to
                  ? formatDate(customDate.from)
                  : `${formatDate(customDate.from)} → ${formatDate(customDate.to)}`}
              </SelectItem>
            )}
            <SelectItem value="all">Tout</SelectItem>
            <SelectItem value="today">Aujourd'hui</SelectItem>
            <SelectItem value="week">Cette semaine</SelectItem>
            <SelectItem value="month">Ce mois</SelectItem>
          </SelectContent>
        </Select>
        {customDate && (
          <button
            onClick={clearCustomDate}
            className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold hover:bg-primary/15 transition-colors"
            title="Retirer le filtre date"
          >
            <CalendarBlank className="h-3 w-3" weight="fill" />
            {customDate.from === customDate.to
              ? formatDate(customDate.from)
              : `${formatDate(customDate.from)} → ${formatDate(customDate.to)}`}
            <X className="h-3 w-3" />
          </button>
        )}

        <Select value={filters.statut} onValueChange={(v) => updateFilters({ statut: v })}>
          <SelectTrigger className="h-10 w-[150px] text-sm">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="a_traiter">À traiter</SelectItem>
            <SelectItem value="prete">Prête</SelectItem>
            <SelectItem value="terminee">Terminée</SelectItem>
            <SelectItem value="annulee">Annulée</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.rdv} onValueChange={(v) => updateFilters({ rdv: v })}>
          <SelectTrigger className="h-10 w-[150px] text-sm">
            <SelectValue placeholder="Statut RDV" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les RDV</SelectItem>
            <SelectItem value="a_confirmer">À confirmer</SelectItem>
            <SelectItem value="confirme">Confirmé</SelectItem>
            <SelectItem value="reporte">Reporté</SelectItem>
          </SelectContent>
        </Select>

        <DynamicFilter fields={filterFields} filters={dynamicFilters} onChange={setDynamicFilters} />

        <div className="flex-1" />

        <ColumnConfig
          page="missions_list"
          columns={MISSION_COLUMNS}
          visibleColumns={visibleCols}
          onColumnsChange={setVisibleCols}
          order={effectiveOrder}
          onOrderChange={setColumnOrder}
        />

        {/* View toggle */}
        <div className="flex items-center bg-muted/60 rounded-full p-0.5">
          {([['table', List], ['calendrier', CalendarBlank], ['carte', MapTrifold]] as [ViewMode, React.ElementType][]).map(([v, Icon]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
                view === v ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Table view */}
      {view === 'table' && (
        <div className="bg-card rounded-2xl border border-border/40 shadow-elevation-raised overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: 'max-content' }}>
            <thead>
              <tr className="border-b border-border/30 group/thead bg-muted/20">
                <th className="w-[3%] px-2 py-3.5" />
                {visibleOrdered.map((id, idx) => {
                  const def = MISSION_COLUMNS.find((c) => c.id === id)
                  if (!def) return null
                  const sortKey = SORTABLE[id] ? id : ''
                  const last = idx === visibleOrdered.length - 1
                  return (
                    <MissionTh
                      key={id}
                      col={sortKey}
                      label={def.label}
                      w={colWidths[id] ?? 120}
                      sortable={!!sortKey}
                      sortCol={sort.col}
                      sortDir={sort.dir}
                      onSort={handleSort}
                      colId={id}
                      onResizeStart={onResizeStart}
                      onResize={onResize}
                      last={last}
                    />
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {/* Loading */}
              {isLoading && [1,2,3,4,5,6].map(i => (
                <tr key={i} className="border-b border-border/20">
                  <td className="px-2 py-3" /><td colSpan={Math.max(1, visibleOrdered.length)} className="px-3 py-3"><Skeleton className="h-4 w-full rounded-lg" /></td>
                </tr>
              ))}

              {/* Empty */}
              {!isLoading && missions.length === 0 && (
                <tr><td colSpan={visibleOrdered.length + 1} className="py-20 text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-muted/60 mb-4">
                    <ClipboardText className="h-6 w-6 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-semibold text-muted-foreground">
                    {hasActiveFilters ? 'Aucune mission trouvée' : 'Aucune mission planifiée'}
                  </p>
                  <p className="text-[11px] text-muted-foreground/60 mt-1">
                    {hasActiveFilters ? 'Essayez avec d\'autres critères' : 'Créez votre première mission'}
                  </p>
                </td></tr>
              )}

              {/* Rows */}
              {!isLoading && displayedMissions.map((mission) => {
                const pending = getPendingActions(mission)
                return (
                  <tr
                    key={mission.id}
                    className="border-b border-border/15 last:border-0 hover:bg-primary/[0.03] cursor-pointer transition-all duration-150 group"
                    onClick={() => navigate(`/app/missions/${mission.id}`, { state: { breadcrumbs: [{ label: 'Missions', href: '/app/missions' }, { label: mission.reference }] } })}
                  >
                    <td className="px-2 py-3 text-center">
                      {pending.length > 0 && (
                        <TooltipProvider><Tooltip><TooltipTrigger asChild>
                          <div className="w-2 h-2 rounded-full bg-orange-500 mx-auto" />
                        </TooltipTrigger><TooltipContent side="right" className="text-xs">
                          {pending.map((a, i) => <div key={i}>{a}</div>)}
                        </TooltipContent></Tooltip></TooltipProvider>
                      )}
                    </td>
                    {visibleOrdered.map((id) => <MissionTd key={id} colId={id} mission={mission} />)}
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Infinite scroll sentinel */}
          {!isLoading && hasMore && (
            <div ref={sentinelRef} className="py-5 text-center">
              <SpinnerGap className="h-5 w-5 animate-spin text-muted-foreground/40 mx-auto" />
            </div>
          )}

          {!isLoading && !hasMore && missions.length > BATCH_SIZE && (
            <div className="py-3.5 text-center text-[11px] text-muted-foreground/40">
              {missions.length} mission{missions.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}

      {/* Calendar view */}
      {view === 'calendrier' && (
        <MissionCalendar missions={missions} />
      )}

      {/* Map view */}
      {view === 'carte' && (
        <MissionMap missions={missions} />
      )}
    </div>
  )
}

/* ── Table header cell with separator + sort arrows ── */
export function MissionTh({ col, label, w, sortable = true, last, sortCol, sortDir, onSort, colId, onResizeStart, onResize }: {
  col: string; label: string; w: number; sortable?: boolean; last?: boolean
  sortCol: string | null; sortDir: 'asc' | 'desc'; onSort: (col: string) => void
  colId: string; onResizeStart: () => void; onResize: (id: string, delta: number) => void
}) {
  const isActive = sortable && !!col && sortCol === col
  return (
    <th
      className={`text-left font-medium text-[11px] text-muted-foreground px-3 py-3.5 relative select-none transition-colors ${sortable ? 'cursor-pointer hover:text-foreground' : ''}`}
      style={{ width: w, minWidth: 40 }}
      onClick={() => sortable && col && onSort(col)}
    >
      <span className={`inline-flex items-center gap-1.5 ${isActive ? 'text-foreground' : ''}`}>
        {label}
        {sortable && (
          <span className={`inline-flex flex-col -space-y-1 ${isActive ? '' : 'opacity-40'}`}>
            <CaretUp className={`h-2.5 w-2.5 ${isActive && sortDir === 'asc' ? 'text-primary' : ''}`} weight={isActive && sortDir === 'asc' ? 'bold' : 'regular'} />
            <CaretDown className={`h-2.5 w-2.5 ${isActive && sortDir === 'desc' ? 'text-primary' : ''}`} weight={isActive && sortDir === 'desc' ? 'bold' : 'regular'} />
          </span>
        )}
      </span>
      {!last && <ResizeHandle colId={colId} onResizeStart={onResizeStart} onResize={onResize} />}
    </th>
  )
}

/* ── Body cell renderers, looked up by column id so they follow user-chosen order ── */
export function MissionTd({ colId, mission }: { colId: string; mission: Mission }) {
  switch (colId) {
    case 'reference':
      return <td className="px-3 py-3 font-mono text-[13px] font-medium text-foreground group-hover:text-primary transition-colors truncate">{mission.reference}</td>
    case 'lot':
      return (
        <td className="px-3 py-3 truncate">
          <div className="text-[13px] font-medium text-foreground truncate">{mission.lot_designation}</div>
          <div className="text-[11px] text-muted-foreground/50 truncate">{mission.adresse || mission.batiment_designation}</div>
        </td>
      )
    case 'date':
      return (
        <td className="px-3 py-3 text-[13px] text-muted-foreground">
          {formatDate(mission.date_planifiee)}
          {mission.heure_debut && <div className="text-[11px] text-muted-foreground/40">{formatTime(mission.heure_debut)}</div>}
        </td>
      )
    case 'types':
      return (
        <td className="px-3 py-3">
          <div className="flex flex-wrap gap-1">
            {mission.edl_types.map((t) => (
              <span key={t} className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${t === 'entree' || t === 'sortie' ? sensColors[t as 'entree' | 'sortie'] : 'bg-violet-100 text-violet-700'}`}>
                {t === 'entree' || t === 'sortie' ? sensLabels[t as 'entree' | 'sortie'] : 'Inv.'}
              </span>
            ))}
          </div>
        </td>
      )
    case 'technicien': {
      const techName = mission.technicien ? `${mission.technicien.prenom} ${mission.technicien.nom}` : null
      return <td className="px-3 py-3 text-[13px] text-muted-foreground truncate">{techName || <span className="text-muted-foreground/30">—</span>}</td>
    }
    case 'proprietaire':
      return <td className="px-3 py-3 text-[13px] text-muted-foreground truncate" title={mission.proprietaire_nom || ''}>{mission.proprietaire_nom || <span className="text-muted-foreground/30">—</span>}</td>
    case 'locataires':
      return <td className="px-3 py-3 text-[13px] text-muted-foreground truncate" title={mission.locataires_noms?.join(', ') || ''}>{mission.locataires_noms && mission.locataires_noms.length > 0 ? mission.locataires_noms.join(', ') : <span className="text-muted-foreground/30">—</span>}</td>
    case 'statut':
      return <td className="px-3 py-3"><MissionStatusBadge mission={mission} variant="compact" /></td>
    case 'statut_rdv':
      return (
        <td className="px-3 py-3">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${mission.statut_rdv === 'confirme' ? 'bg-green-100 text-green-700' : mission.statut_rdv === 'reporte' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
            {statutRdvLabels[mission.statut_rdv]}
          </span>
        </td>
      )
    case 'invitation':
      return (
        <td className="px-3 py-3">
          {mission.technicien ? (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${mission.technicien.statut_invitation === 'accepte' ? 'bg-green-100 text-green-700' : mission.technicien.statut_invitation === 'refuse' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
              {statutInvitationLabels[mission.technicien.statut_invitation]}
            </span>
          ) : <span className="text-muted-foreground/30 text-[11px]">—</span>}
        </td>
      )
    case 'documents':
      return (
        <td className="px-3 py-3">
          {mission.has_signed_document ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" title="Au moins un EDL signé disponible">
              <FileText className="h-3 w-3" weight="fill" /> Dispo
            </span>
          ) : <span className="text-muted-foreground/30 text-[11px]">—</span>}
        </td>
      )
    case 'created_at':
      return <td className="px-3 py-3 text-[13px] text-muted-foreground/50">{formatDate(mission.created_at)}</td>
    default:
      return null
  }
}
