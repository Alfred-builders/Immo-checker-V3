import { useState, useRef, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconTrendingUp, IconTrendingDown } from '@tabler/icons-react'
import { Plus, CalendarBlank, Clock, WarningCircle, CaretRight, CaretUp, CaretDown, FileText, SquaresFour, ChartLine, CheckCircle } from '@phosphor-icons/react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Label, Line, LineChart, Pie, PieChart, Sector, XAxis } from 'recharts'
import type { PieSectorShapeProps } from 'recharts/types/polar/Pie'
import { Button } from 'src/components/ui/button'
import { Badge } from 'src/components/ui/badge'
import {
  Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from 'src/components/ui/card'
import {
  ChartContainer, ChartStyle, ChartTooltip, ChartTooltipContent, type ChartConfig,
} from 'src/components/ui/chart'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from 'src/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from 'src/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from 'src/components/ui/sheet'
import { useDashboardStats, useDashboardActivity } from '../api'
import { useMissions } from '../../missions/api'
import { CreateMissionModal } from '../../missions/components/create-mission-modal'
import { UnavailabilityModal } from '../../missions/components/unavailability-modal'
import { MissionCalendar } from '../../missions/components/mission-calendar'
import { MiniCalendar } from './mini-calendar'
import { DayMissionsModal } from './day-missions-modal'
import { MissionDrawer } from './mission-drawer'
import { OnboardingChecklistCard } from '../../onboarding/components/onboarding-checklist-card'
import { formatDate } from 'src/lib/formatters'
import { cn } from 'src/lib/cn'
import type { Mission, MissionStatut } from '../../missions/types'
import { missionStatutLabels, missionStatutColors, sensLabels, sensColors, getPendingActions } from '../../missions/types'

// ── Chart configs (data comes from API) ──
const chartConfig: ChartConfig = {
  entrees: { label: 'Entrées', color: 'var(--color-primary)' },
  sorties: { label: 'Sorties', color: 'var(--color-chart-2)' },
}
const weeklyBarConfig: ChartConfig = {
  entrees: { label: 'Entrées', color: 'var(--chart-1)' },
  sorties: { label: 'Sorties', color: 'var(--chart-2)' },
}
const monthlyTrendConfig: ChartConfig = {
  planifiees: { label: 'Planifiées', color: 'var(--chart-1)' },
  terminees:  { label: 'Terminées',  color: 'var(--chart-2)' },
}

// ── Donut — statuts config ──
const statutChartConfig: ChartConfig = {
  count:     { label: 'Missions' },
  planifiee: { label: 'Planifiée', color: 'var(--chart-1)' },
  assignee:  { label: 'Assignée',  color: 'var(--chart-2)' },
  terminee:  { label: 'Terminée',  color: 'var(--chart-3)' },
  annulee:   { label: 'Annulée',   color: 'var(--chart-4)' },
}

type DashTab = 'overview' | 'analytics'

export function DashboardPage() {
  const navigate = useNavigate()
  const actionsRef = useRef<HTMLDivElement>(null)
  const { data: stats } = useDashboardStats()
  const { data: missionsData } = useMissions({ limit: 50 })
  const missions = missionsData?.data ?? []

  // Tab
  const [tab, setTab] = useState<DashTab>('overview')

  // Drawer
  const [drawerMissionId, setDrawerMissionId] = useState<string | null>(null)

  // Creation modals
  const [showCreateChoice, setShowCreateChoice] = useState(false)
  const [showCreateMission, setShowCreateMission] = useState(false)
  const [showCreateIndispo, setShowCreateIndispo] = useState(false)
  const [prefillDate, setPrefillDate] = useState<string | undefined>()

  // Day modal (mini calendar)
  const [dayModalDate, setDayModalDate] = useState<string | null>(null)

  // Chart range + real activity data
  const [chartRange, setChartRange] = useState<'7j' | '30j' | '90j'>('30j')
  const { data: activityData } = useDashboardActivity(chartRange)
  const filteredChart = activityData?.daily ?? []
  const weeklyBarData = useMemo(() => {
    const weeks: Record<string, { week: string; entrees: number; sorties: number }> = {}
    ;(activityData?.daily ?? []).forEach((d) => {
      const date = new Date(d.date)
      const mon = new Date(date)
      mon.setDate(date.getDate() - ((date.getDay() + 6) % 7))
      const key = mon.toISOString().slice(0, 10)
      if (!weeks[key]) weeks[key] = { week: key, entrees: 0, sorties: 0 }
      weeks[key].entrees += d.entrees
      weeks[key].sorties += d.sorties
    })
    return Object.values(weeks).slice(-8)
  }, [activityData])
  const monthlyTrendData = activityData?.monthly ?? []

  const pendingMissions = missions.filter(m => getPendingActions(m).length > 0)

  // ── Interactive pie — répartition statuts (all missions, not just page 1) ──
  const STATUT_ORDER = ['planifiee', 'assignee', 'terminee', 'annulee'] as MissionStatut[]
  const statutPieData = STATUT_ORDER.map((s) => ({
    statut: s,
    count: activityData?.statuts?.[s] ?? missions.filter((m) => m.statut === s).length,
    fill: `var(--color-${s})`,
  }))

  const [activeStatut, setActiveStatut] = useState<MissionStatut>('planifiee')
  const activeStatutIndex = useMemo(
    () => statutPieData.findIndex((d) => d.statut === activeStatut),
    [statutPieData, activeStatut],
  )
  const renderPieShape = useCallback(
    ({ index, outerRadius = 0, ...props }: PieSectorShapeProps) => {
      if (index === activeStatutIndex) {
        return (
          <g>
            <Sector {...props} outerRadius={outerRadius + 10} />
            <Sector {...props} outerRadius={outerRadius + 25} innerRadius={outerRadius + 12} />
          </g>
        )
      }
      return <Sector {...props} outerRadius={outerRadius} />
    },
    [activeStatutIndex],
  )

  // Metric detail sheet
  type MetricType = 'edl' | 'pending' | 'upcoming' | 'completed' | null
  const [metricSheet, setMetricSheet] = useState<MetricType>(null)
  const [metricFilter, setMetricFilter] = useState('all')

  // Reset filter when metric changes
  const openMetric = (m: MetricType) => { setMetricSheet(m); setMetricFilter('all') }

  const metricMissionsRaw = (() => {
    if (!metricSheet) return []
    switch (metricSheet) {
      case 'edl': return missions
      case 'pending': return pendingMissions
      case 'upcoming': return missions.filter(m => m.statut === 'planifiee' || m.statut === 'assignee')
      case 'completed': return missions.filter(m => m.statut === 'terminee')
      default: return []
    }
  })()

  const metricMissions = metricFilter === 'all'
    ? metricMissionsRaw
    : metricMissionsRaw.filter(m => {
        if (metricFilter === 'entree') return m.edl_types.includes('entree')
        if (metricFilter === 'sortie') return m.edl_types.includes('sortie')
        if (metricFilter === 'inventaire') return m.edl_types.includes('inventaire')
        if (metricFilter === 'a_assigner') return !m.technicien
        if (metricFilter === 'invitation') return m.technicien?.statut_invitation !== 'accepte'
        if (metricFilter === 'rdv') return m.statut_rdv === 'a_confirmer'
        if (metricFilter === 'planifiee' || metricFilter === 'assignee' || metricFilter === 'terminee') return m.statut === metricFilter
        return true
      })

  // Filter options per metric type
  const metricFilterOptions: Record<string, { value: string; label: string }[]> = {
    edl: [
      { value: 'all', label: 'Tous' },
      { value: 'entree', label: 'Entrées' },
      { value: 'sortie', label: 'Sorties' },
      { value: 'inventaire', label: 'Inventaires' },
    ],
    pending: [
      { value: 'all', label: 'Toutes' },
      { value: 'a_assigner', label: 'À assigner' },
      { value: 'invitation', label: 'Invitation' },
      { value: 'rdv', label: 'RDV à confirmer' },
    ],
    upcoming: [
      { value: 'all', label: 'Toutes' },
      { value: 'planifiee', label: 'Planifiées' },
      { value: 'assignee', label: 'Assignées' },
    ],
    completed: [
      { value: 'all', label: 'Toutes' },
      { value: 'entree', label: 'Entrées' },
      { value: 'sortie', label: 'Sorties' },
    ],
  }

  const metricLabels: Record<string, { title: string; color: string }> = {
    edl: { title: 'EDL du mois', color: 'text-primary' },
    pending: { title: 'Actions en attente', color: 'text-amber-600' },
    upcoming: { title: 'À venir (7 jours)', color: 'text-foreground' },
    completed: { title: 'Terminées ce mois', color: 'text-green-600' },
  }

  function handleMissionClick(id: string) { setDrawerMissionId(id) }
  function handleEmptyDayClick(date: string) { setPrefillDate(date); setShowCreateChoice(true) }
  function handleCreateChoice(type: 'mission' | 'indispo') {
    setShowCreateChoice(false)
    if (type === 'mission') setShowCreateMission(true)
    else setShowCreateIndispo(true)
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">

          {/* Modals */}
          <CreateMissionModal open={showCreateMission} onOpenChange={setShowCreateMission} preselectedDate={prefillDate} />
          <UnavailabilityModal open={showCreateIndispo} onOpenChange={setShowCreateIndispo} preselectedDate={prefillDate} />
          <MissionDrawer missionId={drawerMissionId} open={!!drawerMissionId} onClose={() => setDrawerMissionId(null)} />

          <Dialog open={showCreateChoice} onOpenChange={setShowCreateChoice}>
            <DialogContent className="max-w-xs">
              <DialogHeader><DialogTitle>Nouvelle entrée</DialogTitle></DialogHeader>
              <div className="flex flex-col gap-2">
                <Button onClick={() => handleCreateChoice('mission')} className="justify-start">
                  <CalendarBlank className="h-4 w-4" /> Nouvelle mission
                </Button>
                <Button variant="outline" onClick={() => handleCreateChoice('indispo')} className="justify-start">
                  <Clock className="h-4 w-4" /> Indisponibilité technicien
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {dayModalDate && (
            <DayMissionsModal
              date={dayModalDate}
              onClose={() => setDayModalDate(null)}
              onMissionClick={(id) => { setDayModalDate(null); handleMissionClick(id) }}
            />
          )}

          {/* Metric detail sheet — wide with table */}
          <Sheet open={!!metricSheet} onOpenChange={() => setMetricSheet(null)}>
            <SheetContent side="right" className="w-[600px] sm:w-[680px] lg:w-[750px] overflow-y-auto p-0">
              {metricSheet && (
                <div>
                  <SheetHeader className="px-6 pt-5 pb-3 border-b border-border/30 space-y-3">
                    <div>
                      <SheetTitle className={`text-lg font-bold ${metricLabels[metricSheet]?.color || ''}`}>
                        {metricLabels[metricSheet]?.title}
                      </SheetTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">{metricMissions.length} élément{metricMissions.length > 1 ? 's' : ''}{metricFilter !== 'all' ? ' (filtré)' : ''}</p>
                    </div>
                    {/* Filter tabs */}
                    <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5 w-fit">
                      {(metricFilterOptions[metricSheet] || []).map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => setMetricFilter(opt.value)}
                          className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all ${
                            metricFilter === opt.value
                              ? 'bg-card text-foreground shadow-sm'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </SheetHeader>

                  {metricMissions.length === 0 ? (
                    <div className="px-6 py-16 text-center text-sm text-muted-foreground/50">Aucun élément</div>
                  ) : (
                    <div>
                      <table className="w-full table-fixed">
                        <thead>
                          <tr className="bg-surface-sunken text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            <th className="text-left px-4 py-2.5 w-24">Ref.</th>
                            <th className="text-left px-4 py-2.5">Lot / Adresse</th>
                            <th className="text-left px-4 py-2.5 w-20">Date</th>
                            <th className="text-left px-4 py-2.5 w-20">Type</th>
                            <th className="text-left px-4 py-2.5 w-24">Statut</th>
                            {metricSheet === 'pending' && <th className="text-left px-4 py-2.5 w-[130px]">Actions</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {metricMissions.map((m, idx) => {
                            const actions = getPendingActions(m)
                            return (
                              <tr
                                key={m.id}
                                className={`hover:bg-primary/[0.03] cursor-pointer transition-colors text-[13px] ${idx % 2 === 1 ? 'bg-surface-sunken/30' : ''}`}
                                onClick={() => { setMetricSheet(null); handleMissionClick(m.id) }}
                              >
                                <td className="px-4 py-3">
                                  <span className="font-mono text-[12px] font-bold text-foreground hover:text-primary transition-colors">{m.reference}</span>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="font-medium text-foreground truncate max-w-[200px]">{m.lot_designation}</div>
                                  <div className="text-[11px] text-muted-foreground/50 truncate max-w-[200px]">{m.adresse || m.batiment_designation}</div>
                                </td>
                                <td className="px-4 py-3 text-muted-foreground text-[12px]">{formatDate(m.date_planifiee)}</td>
                                <td className="px-4 py-3">
                                  <div className="flex flex-wrap gap-1">
                                    {m.edl_types.map(type => (
                                      <span key={type} className={`px-1.5 py-0.5 rounded-full text-[8px] font-semibold ${
                                        type === 'entree' || type === 'sortie' ? sensColors[type as 'entree' | 'sortie'] : 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300'
                                      }`}>
                                        {type === 'entree' || type === 'sortie' ? sensLabels[type as 'entree' | 'sortie'] : 'Inv.'}
                                      </span>
                                    ))}
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${missionStatutColors[m.statut]}`}>
                                    {missionStatutLabels[m.statut]}
                                  </span>
                                </td>
                                {metricSheet === 'pending' && (
                                  <td className="px-4 py-3">
                                    <div className="flex flex-wrap gap-1">
                                      {actions.map((a, i) => (
                                        <span key={i} className="px-1.5 py-0.5 rounded-full text-[8px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">{a}</span>
                                      ))}
                                    </div>
                                  </td>
                                )}
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="px-6 py-4 border-t border-border/30">
                    <button onClick={() => { setMetricSheet(null); navigate('/app/missions') }} className="text-xs text-primary font-semibold hover:underline">
                      Voir toutes les missions →
                    </button>
                  </div>
                </div>
              )}
            </SheetContent>
          </Sheet>

          {/* ── Header ── */}
          <div className="px-4 lg:px-6 flex items-end justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">Tableau de bord</h1>
              {/* Icon-only tabs */}
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => setTab('overview')}
                  title="Planning"
                  className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all ${
                    tab === 'overview'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/50'
                  }`}
                >
                  <SquaresFour className="h-[18px] w-[18px]" weight={tab === 'overview' ? 'fill' : 'regular'} />
                </button>
                <button
                  onClick={() => setTab('analytics')}
                  title="Analytique"
                  className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all ${
                    tab === 'analytics'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/50'
                  }`}
                >
                  <ChartLine className="h-[18px] w-[18px]" weight={tab === 'analytics' ? 'bold' : 'regular'} />
                </button>
              </div>
            </div>
            {/* Split buttons: Mission + Indispo side by side */}
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => { setPrefillDate(undefined); setShowCreateMission(true) }}>
                <Plus className="h-3.5 w-3.5" /> Mission
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setPrefillDate(undefined); setShowCreateIndispo(true) }}>
                <Clock className="h-3.5 w-3.5" /> Indisponibilité
              </Button>
            </div>
          </div>

          {/* ═══════════════════════════════════════ */}
          {/* TAB 1: VUE D'ENSEMBLE (US 837-841)     */}
          {/* ═══════════════════════════════════════ */}
          {tab === 'overview' && (
            <>
              {/* US-837: 4 Stat cards — same as Tab 2, all clickable */}
              <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
                <StatMetricCard label="EDL du mois" value={stats?.edl_month ?? 0} tag="+8 ce mois" footerText="Entrées + sorties" tagIcon={<IconTrendingUp className="size-3" />} onClick={() => openMetric('edl')} />
                <StatMetricCard label="Actions en attente" value={stats?.pending_actions ?? 0} color="amber" tag="urgent" footerText="À traiter" tagIcon={<WarningCircle className="size-3" weight="fill" />} onClick={() => openMetric('pending')} />
                <StatMetricCard label="À venir (7 jours)" value={stats?.upcoming_7d ?? 0} color="sky" tag="cette semaine" footerText="Planifiées" tagIcon={<CalendarBlank className="size-3" />} onClick={() => openMetric('upcoming')} />
                <StatMetricCard label={`${stats?.completed_month ?? 0} / ${stats?.total_month ?? 0} ce mois (hors annulées)`} value={stats?.total_month ? `${Math.round(((stats.completed_month ?? 0) / stats.total_month) * 100)}%` : '—'} tag={`${stats?.completed_month ?? 0} terminées`} footerText="Missions terminées ce mois" color="emerald" tagIcon={<CheckCircle className="size-3" />} onClick={() => openMetric('completed')} />
              </div>

              {/* Onboarding section — admin only, auto-hides when workspace is fully configured */}
              <OnboardingChecklistCard />

              {/* US-838 + US-839 + US-841: Calendar + Right panel (mini calendar + actions) */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 px-4 lg:px-6 items-start">
                {/* Week calendar — taller */}
                <div className="min-h-[600px]">
                  <MissionCalendar
                    onMissionClick={handleMissionClick}
                    onEmptyDayClick={handleEmptyDayClick}
                    mode="week"
                    hideModeSwitcher
                  />
                </div>

                {/* Right column: Mini calendar + Actions en attente */}
                <div className="flex flex-col gap-4 sticky top-20">
                  {/* Mini calendar */}
                  <MiniCalendar
                    onDayClick={(date, count) => { if (count > 0) setDayModalDate(date) }}
                    onMissionClick={handleMissionClick}
                  />

                  {/* Actions en attente */}
                  <div ref={actionsRef}>
                    <Card>
                      <CardHeader className="pb-2 px-4">
                        <CardTitle className="text-xs flex items-center gap-2">
                          <WarningCircle className="h-3.5 w-3.5 text-amber-500" weight="fill" />
                          Actions en attente
                        </CardTitle>
                        <CardDescription className="text-[11px]">{pendingMissions.length} action{pendingMissions.length > 1 ? 's' : ''}</CardDescription>
                      </CardHeader>
                      <CardContent className="px-0 pb-0 max-h-[320px] overflow-y-auto">
                        {pendingMissions.length === 0 && (
                          <div className="px-4 py-6 text-center text-xs text-muted-foreground/50">
                            Aucune action en attente
                          </div>
                        )}
                        {pendingMissions.slice(0, 10).map((m) => {
                          const actions = getPendingActions(m)
                          return (
                            <div
                              key={m.id}
                              className="flex items-start gap-2.5 px-4 py-2.5 hover:bg-accent/50 cursor-pointer transition-colors border-b border-border/20 last:border-0"
                              onClick={() => handleMissionClick(m.id)}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                              <div className="flex-1 min-w-0">
                                <div className="text-[12px] font-semibold truncate">{m.reference}</div>
                                <div className="text-[10px] text-muted-foreground truncate">{m.lot_designation}</div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {actions.map((a, i) => (
                                    <span key={i} className="px-1.5 py-0 rounded-full text-[8px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">{a}</span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ═══════════════════════════════════════ */}
          {/* TAB 2: ANALYTIQUE (bonus)               */}
          {/* ═══════════════════════════════════════ */}
          {tab === 'analytics' && (
            <>
              {/* 4 stat cards — same metrics as Tab 1, all clickable */}
              <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
                <StatMetricCard label="EDL du mois" value={stats?.edl_month ?? 0} tag="+8 ce mois" footerText="Entrées + sorties" tagIcon={<IconTrendingUp className="size-3" />} onClick={() => openMetric('edl')} />
                <StatMetricCard label="Actions en attente" value={stats?.pending_actions ?? 0} color="amber" tag="urgent" footerText="À traiter" tagIcon={<WarningCircle className="size-3" weight="fill" />} onClick={() => openMetric('pending')} />
                <StatMetricCard label="À venir (7 jours)" value={stats?.upcoming_7d ?? 0} color="sky" tag="cette semaine" footerText="Planifiées" tagIcon={<CalendarBlank className="size-3" />} onClick={() => openMetric('upcoming')} />
                <StatMetricCard label={`${stats?.completed_month ?? 0} / ${stats?.total_month ?? 0} ce mois (hors annulées)`} value={stats?.total_month ? `${Math.round(((stats.completed_month ?? 0) / stats.total_month) * 100)}%` : '—'} tag={`${stats?.completed_month ?? 0} terminées`} footerText="Missions terminées ce mois" color="emerald" tagIcon={<CheckCircle className="size-3" />} onClick={() => openMetric('completed')} />
              </div>

              {/* Area chart */}
              <div className="px-4 lg:px-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Activité missions</CardTitle>
                    <CardDescription>Entrées et sorties sur la période</CardDescription>
                    <CardAction>
                      <Select value={chartRange} onValueChange={(v) => setChartRange(v as typeof chartRange)}>
                        <SelectTrigger className="w-[100px] rounded-lg"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="90j">90 jours</SelectItem>
                          <SelectItem value="30j">30 jours</SelectItem>
                          <SelectItem value="7j">7 jours</SelectItem>
                        </SelectContent>
                      </Select>
                    </CardAction>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="aspect-auto h-[220px] w-full">
                      <AreaChart data={filteredChart}>
                        <defs>
                          <linearGradient id="gEnt" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} /><stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.02} /></linearGradient>
                          <linearGradient id="gSor" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--color-chart-2)" stopOpacity={0.3} /><stop offset="95%" stopColor="var(--color-chart-2)" stopOpacity={0.02} /></linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} tickFormatter={(v) => new Date(v).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })} />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent labelFormatter={(v) => new Date(v).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })} indicator="dot" />} />
                        <Area dataKey="sorties" type="natural" fill="url(#gSor)" stroke="var(--color-chart-2)" stackId="a" />
                        <Area dataKey="entrees" type="natural" fill="url(#gEnt)" stroke="var(--color-primary)" stackId="a" />
                      </AreaChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>

              {/* ── Row 2 : Donut statuts + Stacked bar hebdo ── */}
              <div className="px-4 lg:px-6">
                <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2">

                  {/* Interactive Pie — Répartition des statuts */}
                  <Card data-chart="pie-statuts" className="flex flex-col">
                    <ChartStyle id="pie-statuts" config={statutChartConfig} />
                    <CardHeader className="flex-row items-start space-y-0 pb-0">
                      <div className="grid gap-1">
                        <CardTitle>Répartition des statuts</CardTitle>
                        <CardDescription>Total : {Object.values(activityData?.statuts ?? {}).reduce((a, b) => a + b, 0)} missions</CardDescription>
                      </div>
                      <Select value={activeStatut} onValueChange={(v) => setActiveStatut(v as MissionStatut)}>
                        <SelectTrigger className="ml-auto h-7 w-[140px] rounded-lg pl-2.5" aria-label="Sélectionner un statut">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent align="end" className="rounded-xl">
                          {STATUT_ORDER.map((s) => {
                            const cfg = statutChartConfig[s as keyof typeof statutChartConfig]
                            if (!cfg) return null
                            return (
                              <SelectItem key={s} value={s} className="rounded-lg [&_span]:flex">
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="flex h-3 w-3 shrink-0 rounded-xs" style={{ backgroundColor: `var(--color-${s})` }} />
                                  {missionStatutLabels[s]}
                                </div>
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </CardHeader>
                    <CardContent className="flex flex-1 justify-center pb-0">
                      <ChartContainer id="pie-statuts" config={statutChartConfig} className="mx-auto aspect-square w-full max-w-[280px]">
                        <PieChart>
                          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                          <Pie
                            data={statutPieData}
                            dataKey="count"
                            nameKey="statut"
                            innerRadius={60}
                            strokeWidth={5}
                            shape={renderPieShape}
                          >
                            <Label
                              content={({ viewBox }) => {
                                if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                                  const active = statutPieData[activeStatutIndex]
                                  return (
                                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                      <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                                        {(active?.count ?? 0).toLocaleString()}
                                      </tspan>
                                      <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 24} className="fill-muted-foreground text-xs">
                                        {active ? missionStatutLabels[active.statut as MissionStatut] : ''}
                                      </tspan>
                                    </text>
                                  )
                                }
                              }}
                            />
                          </Pie>
                        </PieChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  {/* Stacked Bar — Entrées / Sorties hebdomadaires */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Entrées &amp; Sorties</CardTitle>
                      <CardDescription>Volume par semaine — 8 dernières semaines</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={weeklyBarConfig} className="h-[220px] w-full">
                        <BarChart accessibilityLayer data={weeklyBarData}>
                          <CartesianGrid vertical={false} />
                          <XAxis
                            dataKey="week"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(v) => new Date(v).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
                          />
                          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                          <Bar dataKey="entrees" stackId="a" fill="var(--color-entrees)" radius={[0, 0, 4, 4]} />
                          <Bar dataKey="sorties"  stackId="a" fill="var(--color-sorties)"  radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                    <CardFooter>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[var(--chart-1)]" /> Entrées</span>
                        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[var(--chart-2)]" /> Sorties</span>
                      </div>
                    </CardFooter>
                  </Card>

                </div>
              </div>

              {/* ── Row 3 : Multi-line — Évolution mensuelle ── */}
              <div className="px-4 lg:px-6 pb-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Évolution mensuelle</CardTitle>
                    <CardDescription>Missions planifiées vs terminées — 6 derniers mois</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={monthlyTrendConfig} className="h-[200px] w-full">
                      <LineChart accessibilityLayer data={monthlyTrendData} margin={{ left: 12, right: 12 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <Line dataKey="planifiees" type="monotone" stroke="var(--color-planifiees)" strokeWidth={2} dot={false} />
                        <Line dataKey="terminees"  type="monotone" stroke="var(--color-terminees)"  strokeWidth={2} dot={false} />
                      </LineChart>
                    </ChartContainer>
                  </CardContent>
                  <CardFooter>
                    <div className="flex w-full items-start gap-2 text-sm">
                      <div className="grid gap-1.5">
                        <div className="flex items-center gap-2 font-medium leading-none text-emerald-600">
                          Tendance à la hausse ce trimestre <IconTrendingUp className="h-4 w-4" />
                        </div>
                        <div className="flex items-center gap-2 text-xs leading-none text-muted-foreground">
                          6 derniers mois — données réelles
                        </div>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  )
}

/* ── Missions Table with sortable headers + resize lines ── */
type SortCol = 'reference' | 'lot' | 'date' | 'statut' | 'technicien' | null
type SortDir = 'asc' | 'desc'

const TABLE_COLS: { id: SortCol; label: string; w: string; sortable: boolean }[] = [
  { id: 'reference', label: 'Référence', w: '14%', sortable: true },
  { id: 'lot', label: 'Lot', w: '22%', sortable: true },
  { id: 'date', label: 'Date', w: '13%', sortable: true },
  { id: null, label: 'Type', w: '16%', sortable: false },
  { id: 'statut', label: 'Statut', w: '14%', sortable: true },
  { id: 'technicien', label: 'Technicien', w: '21%', sortable: true },
]

function MissionsTable({ missions, navigate }: { missions: Mission[]; navigate: (path: string) => void }) {
  const [sortCol, setSortCol] = useState<SortCol>(null)
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  function handleSort(col: SortCol) {
    if (!col) return
    if (sortCol === col) {
      if (sortDir === 'asc') setSortDir('desc')
      else { setSortCol(null); setSortDir('asc') }
    } else {
      setSortCol(col)
      setSortDir('asc')
    }
  }

  const sorted = [...missions].sort((a, b) => {
    if (!sortCol) return 0
    let av = '', bv = ''
    switch (sortCol) {
      case 'reference': av = a.reference; bv = b.reference; break
      case 'lot': av = a.lot_designation || ''; bv = b.lot_designation || ''; break
      case 'date': av = a.date_planifiee || ''; bv = b.date_planifiee || ''; break
      case 'statut': av = a.statut; bv = b.statut; break
      case 'technicien': av = a.technicien ? `${a.technicien.prenom} ${a.technicien.nom}` : ''; bv = b.technicien ? `${b.technicien.prenom} ${b.technicien.nom}` : ''; break
    }
    const cmp = av.localeCompare(bv, 'fr', { numeric: true })
    return sortDir === 'asc' ? cmp : -cmp
  })

  return (
    <table className="w-full text-sm table-fixed">
      <thead>
        <tr className="border-b border-border/30 group/thead bg-muted/20">
          {TABLE_COLS.map((col, i) => {
            const isActive = sortCol === col.id
            const isLast = i === TABLE_COLS.length - 1
            return (
              <th
                key={col.label}
                className={`text-left font-medium text-[11px] tracking-wide text-muted-foreground/70 px-3 py-3.5 relative select-none transition-colors ${col.sortable ? 'cursor-pointer hover:text-foreground' : ''}`}
                style={{ width: col.w }}
                onClick={() => col.sortable && handleSort(col.id)}
              >
                <span className={`inline-flex items-center gap-1.5 ${isActive ? 'text-foreground' : ''}`}>
                  {col.label}
                  {col.sortable && (
                    <span className="inline-flex flex-col -space-y-1 opacity-40">
                      <CaretUp className={`h-2.5 w-2.5 ${isActive && sortDir === 'asc' ? 'text-primary opacity-100' : ''}`} weight={isActive && sortDir === 'asc' ? 'bold' : 'regular'} />
                      <CaretDown className={`h-2.5 w-2.5 ${isActive && sortDir === 'desc' ? 'text-primary opacity-100' : ''}`} weight={isActive && sortDir === 'desc' ? 'bold' : 'regular'} />
                    </span>
                  )}
                </span>
                {/* Resize separator — visible on ALL headers when ANY header hovered */}
                {!isLast && (
                  <div className="absolute right-0 top-1/4 bottom-1/4 w-[1.5px] bg-transparent group-hover/thead:bg-muted-foreground/30 transition-colors cursor-col-resize" />
                )}
              </th>
            )
          })}
        </tr>
      </thead>
      <tbody>
        {sorted.map((m) => (
          <tr key={m.id} className="border-b border-border/30 last:border-0 hover:bg-accent/50 cursor-pointer transition-colors" onClick={() => navigate(`/app/missions/${m.id}`, { state: { breadcrumbs: [{ label: 'Missions', href: '/app/missions' }, { label: m.reference || 'Mission' }] } })}>
            <td className="px-3 py-3 font-medium">{m.reference}</td>
            <td className="px-3 py-3 text-muted-foreground truncate">{m.lot_designation}</td>
            <td className="px-3 py-3 text-muted-foreground">{formatDate(m.date_planifiee)}</td>
            <td className="px-3 py-3">
              <div className="flex gap-1">
                {m.edl_types?.map((t) => (
                  <span key={t} className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ${t === 'entree' || t === 'sortie' ? sensColors[t as 'entree' | 'sortie'] : 'bg-violet-100 text-violet-700'}`}>
                    {t === 'entree' || t === 'sortie' ? sensLabels[t as 'entree' | 'sortie'] : 'Inv.'}
                  </span>
                ))}
              </div>
            </td>
            <td className="px-3 py-3"><span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-medium ${missionStatutColors[m.statut]}`}>{missionStatutLabels[m.statut]}</span></td>
            <td className="px-3 py-3 text-muted-foreground">{m.technicien ? `${m.technicien.prenom} ${m.technicien.nom}` : '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/* ── Stat Metric Card — tag top-right, text footer bottom ── */
const metricColorMap: Record<string, { text: string; badge: string; footer: string }> = {
  default: { text: 'text-foreground', badge: '', footer: 'text-muted-foreground' },
  amber: { text: 'text-amber-600', badge: 'text-amber-600 border-amber-200 bg-amber-50', footer: 'text-amber-600' },
  sky: { text: 'text-sky-600', badge: 'text-sky-600 border-sky-200 bg-sky-50', footer: 'text-sky-600' },
  emerald: { text: 'text-emerald-600', badge: 'text-emerald-600 border-emerald-200 bg-emerald-50', footer: 'text-emerald-600' },
}

function StatMetricCard({ label, value, tag, footerText, color = 'default', tagIcon, onClick }: {
  label: string
  value: string | number
  tag: string
  footerText: string
  color?: string
  tagIcon?: React.ReactNode
  onClick: () => void
}) {
  const c = metricColorMap[color] || metricColorMap.default

  return (
    <Card className="@container/card cursor-pointer hover:shadow-elevation-raised-hover transition-all" onClick={onClick}>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className={`text-2xl font-semibold tabular-nums ${c.text} @[250px]/card:text-3xl`}>{value}</CardTitle>
        <CardAction>
          <Badge variant="outline" className={c.badge}>
            {tagIcon} {tag}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardFooter className="pt-0">
        <span className={`text-xs font-medium ${c.footer}`}>{footerText}</span>
      </CardFooter>
    </Card>
  )
}
