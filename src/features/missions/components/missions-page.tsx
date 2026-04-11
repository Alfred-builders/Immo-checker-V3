import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MagnifyingGlass, Plus, List, GridFour, MapTrifold, ClipboardText, SpinnerGap, CalendarBlank,
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
import { formatDate, formatTime } from 'src/lib/formatters'
import { CreateMissionModal } from './create-mission-modal'
import { MissionKanban } from './mission-kanban'
import { MissionMap } from './mission-map'
import { MissionCalendar } from './mission-calendar'
import type { Mission, MissionStatut } from '../types'
import {
  missionStatutLabels, missionStatutColors,
  statutRdvLabels, statutInvitationLabels,
  sensLabels, sensColors,
  getStatutDerive, getPendingActions,
} from '../types'

const BATCH_SIZE = 30

const MISSION_COLUMNS: ColumnDef[] = [
  { id: 'reference', label: 'Reference', defaultVisible: true },
  { id: 'lot', label: 'Lot / Adresse', defaultVisible: true },
  { id: 'date', label: 'Date', defaultVisible: true },
  { id: 'types', label: 'Type(s)', defaultVisible: true },
  { id: 'technicien', label: 'Technicien', defaultVisible: true },
  { id: 'statut', label: 'Statut mission', defaultVisible: true },
  { id: 'statut_rdv', label: 'Statut RDV', defaultVisible: true },
  { id: 'invitation', label: 'Invitation', defaultVisible: false },
  { id: 'created_at', label: 'Créée le', defaultVisible: false },
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
    statut: statutFilter !== 'all' ? (statutFilter as MissionStatut) : undefined,
    technicien_id: techFilter !== 'all' ? techFilter : undefined,
    pending_actions: pendingFilter || undefined,
    ...periodDates,
  })

  const missions = missionsData?.data ?? []
  const { visible: visibleCols, setVisible: setVisibleCols } = useColumnPreferences('missions_list', MISSION_COLUMNS)

  // Reset display count on filter changes
  useEffect(() => {
    setDisplayCount(BATCH_SIZE)
  }, [search, period, techFilter, statutFilter, pendingFilter])

  const displayedMissions = useMemo(
    () => missions.slice(0, displayCount),
    [missions, displayCount]
  )
  const hasMore = displayCount < missions.length

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
            <SelectValue placeholder="Periode" />
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
            <SelectItem value="assignee">Assignée</SelectItem>
            <SelectItem value="terminee">Terminée</SelectItem>
            <SelectItem value="annulee">Annulée</SelectItem>
          </SelectContent>
        </Select>

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
        <div className="bg-card rounded-2xl border border-border/60 shadow-elevation-raised overflow-hidden">
          {/* Table header */}
          <div className="flex items-center gap-4 px-6 py-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground select-none bg-surface-sunken">
            <div className="w-5 shrink-0" /> {/* pending dot space */}
            {isCol('reference') && <div className="w-[110px] shrink-0">Reference</div>}
            {isCol('lot') && <div className="flex-1 min-w-[180px]">Lot / Adresse</div>}
            {isCol('date') && <div className="w-[100px] shrink-0">Date</div>}
            {isCol('types') && <div className="w-[140px] shrink-0">Type(s)</div>}
            {isCol('technicien') && <div className="w-[140px] shrink-0">Technicien</div>}
            {isCol('statut') && <div className="w-[110px] shrink-0">Statut</div>}
            {isCol('statut_rdv') && <div className="w-[100px] shrink-0">RDV</div>}
            {isCol('invitation') && <div className="w-[100px] shrink-0">Invitation</div>}
            {isCol('created_at') && <div className="w-[90px] shrink-0">Créée le</div>}
          </div>

          {/* Loading skeleton */}
          {isLoading && (
            <div>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className={`flex items-center gap-4 px-6 py-3 ${i % 2 === 0 ? 'bg-surface-sunken/50' : ''}`}>
                  <div className="w-5" />
                  <Skeleton className="h-4 w-20 rounded-full" />
                  <Skeleton className="h-4 flex-1 rounded-full" />
                  <Skeleton className="h-4 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && missions.length === 0 && (
            <div className="py-20 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-muted/60 mb-4">
                <ClipboardText className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-semibold text-muted-foreground">
                {search || statutFilter !== 'all' || techFilter !== 'all' || pendingFilter
                  ? 'Aucune mission trouvee'
                  : 'Aucune mission planifiee'}
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                {search || statutFilter !== 'all' || techFilter !== 'all' || pendingFilter
                  ? 'Essayez avec d\'autres critères'
                  : 'Créez votre première mission d\'intervention'}
              </p>
            </div>
          )}

          {/* Rows */}
          {!isLoading && displayedMissions.map((mission, idx) => (
            <MissionRow
              key={mission.id}
              mission={mission}
              visibleCols={visibleCols}
              index={idx}
              onClick={() => navigate(`/app/missions/${mission.id}`, { state: { breadcrumbs: [{ label: 'Missions', href: '/app/missions' }, { label: mission.reference }] } })}
            />
          ))}

          {/* Infinite scroll sentinel */}
          {!isLoading && hasMore && (
            <div ref={sentinelRef} className="py-5 text-center">
              <SpinnerGap className="h-5 w-5 animate-spin text-muted-foreground/40 mx-auto" />
            </div>
          )}

          {/* End of list */}
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

/* ---- Mission Row ---- */
function MissionRow({
  mission,
  visibleCols,
  index,
  onClick,
}: {
  mission: Mission
  visibleCols: string[]
  index: number
  onClick: () => void
}) {
  const isCol = (id: string) => visibleCols.includes(id)
  const pendingActions = getPendingActions(mission)
  const hasPending = pendingActions.length > 0
  const techName = mission.technicien
    ? `${mission.technicien.prenom} ${mission.technicien.nom}`
    : null

  return (
    <div
      className={`flex items-center gap-4 px-6 py-3 hover:bg-primary/[0.04] transition-colors duration-150 cursor-pointer group ${index % 2 === 1 ? 'bg-surface-sunken/50' : ''}`}
      onClick={onClick}
    >
      {/* Pending indicator */}
      <div className="w-5 shrink-0 flex items-center justify-center">
        {hasPending && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                {pendingActions.map((a, i) => (
                  <div key={i}>{a}</div>
                ))}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Reference */}
      {isCol('reference') && (
        <div className="w-[110px] shrink-0">
          <span className="font-mono text-[13px] font-medium text-foreground group-hover:text-primary transition-colors duration-200">
            {mission.reference}
          </span>
        </div>
      )}

      {/* Lot + Address */}
      {isCol('lot') && (
        <div className="flex-1 min-w-[180px]">
          <p className="text-[13px] font-medium text-foreground truncate">{mission.lot_designation}</p>
          <p className="text-xs text-muted-foreground/60 truncate">
            {mission.batiment_designation}{mission.adresse ? ` - ${mission.adresse}` : ''}
          </p>
        </div>
      )}

      {/* Date */}
      {isCol('date') && (
        <div className="w-[100px] shrink-0 text-[13px] text-muted-foreground">
          <div>{formatDate(mission.date_planifiee)}</div>
          {mission.heure_debut && (
            <div className="text-xs text-muted-foreground/50">
              {formatTime(mission.heure_debut)}
              {mission.heure_fin ? ` - ${formatTime(mission.heure_fin)}` : ''}
            </div>
          )}
        </div>
      )}

      {/* Type(s) */}
      {isCol('types') && (
        <div className="w-[140px] shrink-0 flex flex-wrap gap-1">
          {mission.edl_types.map((type) => {
            if (type === 'entree' || type === 'sortie') {
              return (
                <span
                  key={type}
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${sensColors[type as 'entree' | 'sortie']}`}
                >
                  {sensLabels[type as 'entree' | 'sortie']}
                </span>
              )
            }
            return (
              <span
                key={type}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300"
              >
                Inventaire
              </span>
            )
          })}
        </div>
      )}

      {/* Technicien */}
      {isCol('technicien') && (
        <div className="w-[140px] shrink-0 text-[13px] text-muted-foreground truncate">
          {techName || <span className="text-muted-foreground/30">Non assigne</span>}
        </div>
      )}

      {/* Statut mission */}
      {isCol('statut') && (
        <div className="w-[110px] shrink-0">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${missionStatutColors[mission.statut]}`}>
            {missionStatutLabels[mission.statut]}
          </span>
        </div>
      )}

      {/* Statut RDV */}
      {isCol('statut_rdv') && (
        <div className="w-[100px] shrink-0">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
            mission.statut_rdv === 'confirme'
              ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
              : mission.statut_rdv === 'reporte'
                ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
          }`}>
            {statutRdvLabels[mission.statut_rdv]}
          </span>
        </div>
      )}

      {/* Invitation */}
      {isCol('invitation') && (
        <div className="w-[100px] shrink-0">
          {mission.technicien ? (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
              mission.technicien.statut_invitation === 'accepte'
                ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                : mission.technicien.statut_invitation === 'refuse'
                  ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
            }`}>
              {statutInvitationLabels[mission.technicien.statut_invitation]}
            </span>
          ) : (
            <span className="text-muted-foreground/30 text-xs">--</span>
          )}
        </div>
      )}

      {/* Created at */}
      {isCol('created_at') && (
        <div className="w-[90px] shrink-0 text-[13px] text-muted-foreground/60">
          {formatDate(mission.created_at)}
        </div>
      )}
    </div>
  )
}
