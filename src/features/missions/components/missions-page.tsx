import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MagnifyingGlass, Plus, List, GridFour, MapTrifold, ClipboardText, SpinnerGap, CalendarBlank, CaretUp, CaretDown, FileText,
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
import { ColumnConfig, useColumnPreferences, type ColumnDef } from 'src/components/shared/column-config'
import { DynamicFilter, type FilterField, type ActiveFilter } from 'src/components/shared/dynamic-filter'
import { ResizeHandle, useResizableColumns } from 'src/components/shared/resizable-columns'
import { formatDate, formatTime } from 'src/lib/formatters'
import { CreateMissionModal } from './create-mission-modal'
import { MissionKanban } from './mission-kanban'
import { MissionMap } from './mission-map'
import { MissionCalendar } from './mission-calendar'
import type { Mission, StatutMission } from '../types'
import {
  statutRdvLabels, statutInvitationLabels,
  sensLabels, sensColors,
  getPendingActions,
} from '../types'
import { MissionStatusBadge } from './mission-status-badge'

const BATCH_SIZE = 30

const MISSION_COLUMNS: ColumnDef[] = [
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

const MISSION_FILTER_FIELDS: FilterField[] = [
  { id: 'reference', label: 'Référence', type: 'text' },
  { id: 'lot_designation', label: 'Lot', type: 'text' },
  { id: 'technicien_nom', label: 'Technicien', type: 'text' },
  { id: 'statut', label: 'Statut', type: 'select', options: [
    { value: 'a_traiter', label: 'À traiter' },
    { value: 'prete', label: 'Prête' },
    { value: 'terminee', label: 'Terminée' },
    { value: 'annulee', label: 'Annulée' },
  ]},
  { id: 'statut_rdv', label: 'Statut RDV', type: 'select', options: [
    { value: 'a_confirmer', label: 'À confirmer' },
    { value: 'confirme', label: 'Confirmé' },
    { value: 'reporte', label: 'Reporté' },
  ]},
  { id: 'avec_inventaire', label: 'Inventaire', type: 'boolean' },
  { id: 'commentaire', label: 'Commentaire', type: 'text' },
]

type ViewMode = 'table' | 'kanban' | 'calendrier' | 'carte'

type PeriodFilter = 'today' | 'week' | 'month' | 'all'

function getPeriodDates(period: PeriodFilter): { date_from?: string; date_to?: string } {
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
  const [search, setSearch] = useState('')
  const [period, setPeriod] = useState<PeriodFilter>('all')
  const [techFilter, setTechFilter] = useState<string>('all')
  const [statutFilter, setStatutFilter] = useState<string>('all')
  const [rdvFilter, setRdvFilter] = useState<string>('all')
  const [dynamicFilters, setDynamicFilters] = useState<ActiveFilter[]>([])
  const [pendingFilter, setPendingFilter] = useState(false)
  const [view, setViewState] = useState<ViewMode>(() => {
    const saved = sessionStorage.getItem('missions_view')
    return (saved as ViewMode) || 'table'
  })
  const [showCreate, setShowCreate] = useState(false)
  const [displayCount, setDisplayCount] = useState(BATCH_SIZE)
  const sentinelRef = useRef<HTMLDivElement>(null)

  function setView(v: ViewMode) {
    setViewState(v)
    sessionStorage.setItem('missions_view', v)
  }

  const periodDates = useMemo(() => getPeriodDates(period), [period])

  const { data: statsData, isLoading: statsLoading } = useMissionStats()
  const stats = statsData ?? { total: 0, today: 0, pending: 0, upcoming: 0 }

  const { data: techData } = useWorkspaceTechnicians()
  const technicians = techData ?? []

  const { data: missionsData, isLoading } = useMissions({
    search: search || undefined,
    statut_affichage: statutFilter !== 'all' ? (statutFilter as StatutMission) : undefined,
    statut_rdv: rdvFilter !== 'all' ? (rdvFilter as any) : undefined,
    technicien_id: techFilter !== 'all' ? techFilter : undefined,
    pending_actions: pendingFilter || undefined,
    ...periodDates,
  })

  const missionsRaw = missionsData?.data ?? []

  // Apply dynamic filters client-side
  const missions = useMemo(() => {
    if (dynamicFilters.length === 0) return missionsRaw
    return missionsRaw.filter(m => {
      for (const f of dynamicFilters) {
        const val = String((m as any)[f.field] ?? '')
        switch (f.operator) {
          case 'contains': if (!val.toLowerCase().includes(f.value.toLowerCase())) return false; break
          case 'equals': if (val.toLowerCase() !== f.value.toLowerCase()) return false; break
          case 'not_equals': if (val.toLowerCase() === f.value.toLowerCase()) return false; break
          case 'starts_with': if (!val.toLowerCase().startsWith(f.value.toLowerCase())) return false; break
          default: break
        }
      }
      return true
    })
  }, [missionsRaw, dynamicFilters])
  const { visible: visibleCols, setVisible: setVisibleCols } = useColumnPreferences('missions_list', MISSION_COLUMNS)
  const { colWidths, onResizeStart, onResize } = useResizableColumns({
    reference: 120, lot: 220, date: 110, types: 130, technicien: 140,
    proprietaire: 150, locataires: 170,
    statut: 110, statut_rdv: 90, invitation: 90, documents: 90, created_at: 90,
  })

  // Reset display count on filter changes
  useEffect(() => {
    setDisplayCount(BATCH_SIZE)
  }, [search, period, techFilter, statutFilter, pendingFilter])

  // Sort state
  const [sortCol, setSortCol] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  function handleSort(col: string) {
    if (sortCol === col) {
      if (sortDir === 'asc') setSortDir('desc')
      else { setSortCol(null); setSortDir('asc') }
    } else {
      setSortCol(col)
      setSortDir('asc')
    }
  }

  const sortedMissions = useMemo(() => {
    if (!sortCol) return missions
    return [...missions].sort((a, b) => {
      let av = '', bv = ''
      switch (sortCol) {
        case 'reference': av = a.reference; bv = b.reference; break
        case 'lot': av = a.lot_designation || ''; bv = b.lot_designation || ''; break
        case 'date': av = a.date_planifiee || ''; bv = b.date_planifiee || ''; break
        case 'statut': av = a.statut; bv = b.statut; break
        case 'technicien': av = a.technicien ? `${a.technicien.prenom} ${a.technicien.nom}` : ''; bv = b.technicien ? `${b.technicien.prenom} ${b.technicien.nom}` : ''; break
        case 'statut_rdv': av = a.statut_rdv || ''; bv = b.statut_rdv || ''; break
        case 'created_at': av = a.created_at || ''; bv = b.created_at || ''; break
        default: return 0
      }
      const cmp = av.localeCompare(bv, 'fr', { numeric: true })
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [missions, sortCol, sortDir])

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

  const isCol = (id: string) => visibleCols.includes(id)

  function handleStatClick(type: 'total' | 'today' | 'pending' | 'upcoming') {
    setPendingFilter(false)
    switch (type) {
      case 'total':
        setPeriod('all')
        setStatutFilter('all')
        break
      case 'today':
        setPeriod('today')
        setStatutFilter('all')
        break
      case 'pending':
        setPeriod('all')
        setStatutFilter('all')
        setPendingFilter(true)
        break
      case 'upcoming':
        setPeriod('all')
        setStatutFilter('planifiee')
        break
    }
  }

  const filters = { period, techFilter, statutFilter, pendingFilter }

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
              <> {'\u00b7 '}<button onClick={() => handleStatClick('today')} className="text-primary font-semibold hover:text-primary/80 transition-colors">{stats.today} aujourd'hui</button></>
            )}
            {stats.pending > 0 && (
              <> {'\u00b7 '}<button onClick={() => handleStatClick('pending')} className="text-orange-600 dark:text-orange-400 font-semibold hover:opacity-80 transition-opacity">{stats.pending} en attente</button></>
            )}
            {stats.upcoming > 0 && (
              <> {'\u00b7 '}{stats.upcoming} à venir</>
            )}
          </p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" /> Nouvelle mission
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <Input
            placeholder="Rechercher une mission..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10"
          />
        </div>

        {/* Quick filters */}
        <Select value={period} onValueChange={(v) => setPeriod(v as PeriodFilter)}>
          <SelectTrigger className="h-10 w-[150px] text-sm">
            <SelectValue placeholder="Période" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tout</SelectItem>
            <SelectItem value="today">Aujourd'hui</SelectItem>
            <SelectItem value="week">Cette semaine</SelectItem>
            <SelectItem value="month">Ce mois</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statutFilter} onValueChange={setStatutFilter}>
          <SelectTrigger className="h-10 w-[140px] text-sm">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="planifiee">Planifiée</SelectItem>
            <SelectItem value="terminee">Terminée</SelectItem>
            <SelectItem value="annulee">Annulée</SelectItem>
          </SelectContent>
        </Select>

        <Select value={rdvFilter} onValueChange={setRdvFilter}>
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

        <DynamicFilter fields={MISSION_FILTER_FIELDS} filters={dynamicFilters} onChange={setDynamicFilters} />

        <div className="flex-1" />

        <ColumnConfig
          page="missions_list"
          columns={MISSION_COLUMNS}
          visibleColumns={visibleCols}
          onColumnsChange={setVisibleCols}
        />

        {/* View toggle */}
        <div className="flex items-center bg-muted/60 rounded-full p-0.5">
          {([['table', List], ['kanban', GridFour], ['calendrier', CalendarBlank], ['carte', MapTrifold]] as [ViewMode, React.ElementType][]).map(([v, Icon]) => (
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
        <div className="bg-card rounded-2xl border border-border/40 shadow-elevation-raised overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/30 group/thead bg-muted/20">
                <th className="w-[3%] px-2 py-3.5" />
                {isCol('reference') && <MissionTh col="reference" label="Référence" w={colWidths.reference} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} colId="reference" onResizeStart={onResizeStart} onResize={onResize} />}
                {isCol('lot') && <MissionTh col="lot" label="Lot / Adresse" w={colWidths.lot} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} colId="lot" onResizeStart={onResizeStart} onResize={onResize} />}
                {isCol('date') && <MissionTh col="date" label="Date" w={colWidths.date} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} colId="date" onResizeStart={onResizeStart} onResize={onResize} />}
                {isCol('types') && <MissionTh col="" label="Type(s)" w={colWidths.types} sortable={false} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} colId="types" onResizeStart={onResizeStart} onResize={onResize} />}
                {isCol('technicien') && <MissionTh col="technicien" label="Technicien" w={colWidths.technicien} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} colId="technicien" onResizeStart={onResizeStart} onResize={onResize} />}
                {isCol('proprietaire') && <MissionTh col="" label="Propriétaire" w={colWidths.proprietaire} sortable={false} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} colId="proprietaire" onResizeStart={onResizeStart} onResize={onResize} />}
                {isCol('locataires') && <MissionTh col="" label="Locataire(s)" w={colWidths.locataires} sortable={false} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} colId="locataires" onResizeStart={onResizeStart} onResize={onResize} />}
                {isCol('statut') && <MissionTh col="statut" label="Statut" w={colWidths.statut} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} colId="statut" onResizeStart={onResizeStart} onResize={onResize} />}
                {isCol('statut_rdv') && <MissionTh col="statut_rdv" label="RDV" w={colWidths.statut_rdv} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} colId="statut_rdv" onResizeStart={onResizeStart} onResize={onResize} />}
                {isCol('invitation') && <MissionTh col="" label="Invitation" w={colWidths.invitation} sortable={false} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} colId="invitation" onResizeStart={onResizeStart} onResize={onResize} />}
                {isCol('documents') && <MissionTh col="" label="Docs" w={colWidths.documents} sortable={false} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} colId="documents" onResizeStart={onResizeStart} onResize={onResize} />}
                {isCol('created_at') && <MissionTh col="created_at" label="Créée le" w={colWidths.created_at} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} colId="created_at" onResizeStart={onResizeStart} onResize={onResize} last />}
              </tr>
            </thead>
            <tbody>
              {/* Loading */}
              {isLoading && [1,2,3,4,5,6].map(i => (
                <tr key={i} className="border-b border-border/20">
                  <td className="px-2 py-3" /><td colSpan={12} className="px-3 py-3"><Skeleton className="h-4 w-full rounded-lg" /></td>
                </tr>
              ))}

              {/* Empty */}
              {!isLoading && missions.length === 0 && (
                <tr><td colSpan={13} className="py-20 text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-muted/60 mb-4">
                    <ClipboardText className="h-6 w-6 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-semibold text-muted-foreground">
                    {search || statutFilter !== 'all' || pendingFilter ? 'Aucune mission trouvée' : 'Aucune mission planifiée'}
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    {search || statutFilter !== 'all' || pendingFilter ? 'Essayez avec d\'autres critères' : 'Créez votre première mission'}
                  </p>
                </td></tr>
              )}

              {/* Rows */}
              {!isLoading && displayedMissions.map((mission) => {
                const pending = getPendingActions(mission)
                const techName = mission.technicien ? `${mission.technicien.prenom} ${mission.technicien.nom}` : null
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
                    {isCol('reference') && <td className="px-3 py-3 font-mono text-[13px] font-medium text-foreground group-hover:text-primary transition-colors truncate">{mission.reference}</td>}
                    {isCol('lot') && <td className="px-3 py-3 truncate"><div className="text-[13px] font-medium text-foreground truncate">{mission.lot_designation}</div><div className="text-xs text-muted-foreground/50 truncate">{mission.adresse || mission.batiment_designation}</div></td>}
                    {isCol('date') && <td className="px-3 py-3 text-[13px] text-muted-foreground">{formatDate(mission.date_planifiee)}{mission.heure_debut && <div className="text-xs text-muted-foreground/40">{formatTime(mission.heure_debut)}</div>}</td>}
                    {isCol('types') && <td className="px-3 py-3"><div className="flex flex-wrap gap-1">{mission.edl_types.map(t => <span key={t} className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${t === 'entree' || t === 'sortie' ? sensColors[t as 'entree' | 'sortie'] : 'bg-violet-100 text-violet-700'}`}>{t === 'entree' || t === 'sortie' ? sensLabels[t as 'entree' | 'sortie'] : 'Inv.'}</span>)}</div></td>}
                    {isCol('technicien') && <td className="px-3 py-3 text-[13px] text-muted-foreground truncate">{techName || <span className="text-muted-foreground/30">—</span>}</td>}
                    {isCol('proprietaire') && <td className="px-3 py-3 text-[13px] text-muted-foreground truncate" title={mission.proprietaire_nom || ''}>{mission.proprietaire_nom || <span className="text-muted-foreground/30">—</span>}</td>}
                    {isCol('locataires') && <td className="px-3 py-3 text-[13px] text-muted-foreground truncate" title={mission.locataires_noms?.join(', ') || ''}>{mission.locataires_noms && mission.locataires_noms.length > 0 ? mission.locataires_noms.join(', ') : <span className="text-muted-foreground/30">—</span>}</td>}
                    {isCol('statut') && <td className="px-3 py-3"><MissionStatusBadge mission={mission} variant="compact" /></td>}
                    {isCol('statut_rdv') && <td className="px-3 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${mission.statut_rdv === 'confirme' ? 'bg-green-100 text-green-700' : mission.statut_rdv === 'reporte' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{statutRdvLabels[mission.statut_rdv]}</span></td>}
                    {isCol('invitation') && <td className="px-3 py-3">{mission.technicien ? <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${mission.technicien.statut_invitation === 'accepte' ? 'bg-green-100 text-green-700' : mission.technicien.statut_invitation === 'refuse' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{statutInvitationLabels[mission.technicien.statut_invitation]}</span> : <span className="text-muted-foreground/30 text-xs">—</span>}</td>}
                    {isCol('documents') && <td className="px-3 py-3">{mission.has_signed_document ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" title="Au moins un EDL signé disponible"><FileText className="h-3 w-3" weight="fill" /> Dispo</span> : <span className="text-muted-foreground/30 text-xs">—</span>}</td>}
                    {isCol('created_at') && <td className="px-3 py-3 text-[13px] text-muted-foreground/50">{formatDate(mission.created_at)}</td>}
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
            <div className="py-3.5 text-center text-xs text-muted-foreground/40">
              {missions.length} mission{missions.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}

      {/* Kanban view */}
      {view === 'kanban' && (
        <MissionKanban missions={missions} filters={filters} />
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
function MissionTh({ col, label, w, sortable = true, last, sortCol, sortDir, onSort, colId, onResizeStart, onResize }: {
  col: string; label: string; w: number; sortable?: boolean; last?: boolean
  sortCol: string | null; sortDir: 'asc' | 'desc'; onSort: (col: string) => void
  colId: string; onResizeStart: () => void; onResize: (id: string, delta: number) => void
}) {
  const isActive = sortCol === col && sortable
  return (
    <th
      className={`text-left font-medium text-xs text-muted-foreground px-3 py-3.5 relative select-none transition-colors ${sortable ? 'cursor-pointer hover:text-foreground' : ''}`}
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
