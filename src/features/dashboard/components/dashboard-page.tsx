import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconTrendingUp, IconTrendingDown } from '@tabler/icons-react'
import { Plus, CalendarBlank, Clock, WarningCircle, CaretRight } from '@phosphor-icons/react'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'
import { Button } from 'src/components/ui/button'
import { Badge } from 'src/components/ui/badge'
import {
  Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from 'src/components/ui/card'
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig,
} from 'src/components/ui/chart'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from 'src/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from 'src/components/ui/dialog'
import { useDashboardStats, useMonthSummary } from '../api'
import { useMissions } from '../../missions/api'
import { CreateMissionModal } from '../../missions/components/create-mission-modal'
import { UnavailabilityModal } from '../../missions/components/unavailability-modal'
import { formatDate } from 'src/lib/formatters'
import type { Mission } from '../../missions/types'
import { missionStatutLabels, missionStatutColors, sensLabels, sensColors, getPendingActions } from '../../missions/types'

// ── Chart data (fake 90 days) ──
const chartData = Array.from({ length: 90 }, (_, i) => {
  const d = new Date(2026, 1, 1 + i)
  return {
    date: d.toISOString().slice(0, 10),
    entrees: Math.floor(Math.random() * 6) + 2,
    sorties: Math.floor(Math.random() * 4) + 1,
  }
})

const chartConfig: ChartConfig = {
  entrees: { label: 'Entrées', color: 'var(--color-primary)' },
  sorties: { label: 'Sorties', color: 'var(--color-chart-2)' },
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { data: stats } = useDashboardStats()
  const { data: missionsData } = useMissions({ limit: 20 })
  const missions = missionsData?.data ?? []

  const [showCreateChoice, setShowCreateChoice] = useState(false)
  const [showCreateMission, setShowCreateMission] = useState(false)
  const [showCreateIndispo, setShowCreateIndispo] = useState(false)
  const [chartRange, setChartRange] = useState('30j')

  const filteredChart = chartData.slice(chartRange === '7j' ? -7 : chartRange === '30j' ? -30 : 0)

  const pendingMissions = missions.filter(m => getPendingActions(m).length > 0)

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">

          {/* Modals */}
          <CreateMissionModal open={showCreateMission} onOpenChange={setShowCreateMission} />
          <UnavailabilityModal open={showCreateIndispo} onOpenChange={setShowCreateIndispo} />
          <Dialog open={showCreateChoice} onOpenChange={setShowCreateChoice}>
            <DialogContent className="max-w-xs">
              <DialogHeader><DialogTitle>Nouvelle entrée</DialogTitle></DialogHeader>
              <div className="flex flex-col gap-2">
                <Button onClick={() => { setShowCreateChoice(false); setShowCreateMission(true) }} className="justify-start">
                  <CalendarBlank className="h-4 w-4" /> Nouvelle mission
                </Button>
                <Button variant="outline" onClick={() => { setShowCreateChoice(false); setShowCreateIndispo(true) }} className="justify-start">
                  <Clock className="h-4 w-4" /> Indisponibilité technicien
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* ── Section Cards (shadcn pattern) ── */}
          <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
            <Card className="@container/card">
              <CardHeader>
                <CardDescription>Missions aujourd'hui</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {stats?.today ?? 0}
                </CardTitle>
                <CardAction>
                  <Badge variant="outline">
                    <IconTrendingUp />
                    +3
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                  En hausse cette semaine <IconTrendingUp className="size-4" />
                </div>
                <div className="text-muted-foreground">
                  Par rapport à la semaine dernière
                </div>
              </CardFooter>
            </Card>

            <Card className="@container/card">
              <CardHeader>
                <CardDescription>Actions en attente</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {stats?.pending_actions ?? 0}
                </CardTitle>
                <CardAction>
                  <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                    <IconTrendingUp />
                    +2
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium text-amber-600">
                  2 techniciens à assigner
                </div>
                <div className="text-muted-foreground">
                  3 RDV à confirmer
                </div>
              </CardFooter>
            </Card>

            <Card className="@container/card">
              <CardHeader>
                <CardDescription>Missions à venir</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {stats?.upcoming_7d ?? 0}
                </CardTitle>
                <CardAction>
                  <Badge variant="outline">
                    <IconTrendingUp />
                    +25%
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                  Cette semaine <IconTrendingUp className="size-4" />
                </div>
                <div className="text-muted-foreground">
                  5 entrées, 3 sorties
                </div>
              </CardFooter>
            </Card>

            <Card className="@container/card">
              <CardHeader>
                <CardDescription>Terminées ce mois</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {stats?.edl_month ?? 0}
                </CardTitle>
                <CardAction>
                  <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">
                    98%
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium text-emerald-600">
                  Taux de complétion excellent <IconTrendingUp className="size-4" />
                </div>
                <div className="text-muted-foreground">
                  +12% par rapport au mois dernier
                </div>
              </CardFooter>
            </Card>
          </div>

          {/* ── Chart Area (shadcn pattern) ── */}
          <div className="px-4 lg:px-6">
            <Card className="@container/chart">
              <CardHeader>
                <CardTitle>Activité missions</CardTitle>
                <CardDescription>
                  Entrées et sorties sur la période
                </CardDescription>
                <CardAction>
                  <Select value={chartRange} onValueChange={setChartRange}>
                    <SelectTrigger className="w-[100px] rounded-lg" aria-label="Période">
                      <SelectValue placeholder="30j" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="90j" className="rounded-lg">90 jours</SelectItem>
                      <SelectItem value="30j" className="rounded-lg">30 jours</SelectItem>
                      <SelectItem value="7j" className="rounded-lg">7 jours</SelectItem>
                    </SelectContent>
                  </Select>
                </CardAction>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="aspect-auto h-[220px] w-full">
                  <AreaChart data={filteredChart}>
                    <defs>
                      <linearGradient id="fillEntrees" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="fillSorties" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-chart-2)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--color-chart-2)" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      minTickGap={32}
                      tickFormatter={(v) => {
                        const d = new Date(v)
                        return d.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })
                      }}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent
                          labelFormatter={(v) => new Date(v).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
                          indicator="dot"
                        />
                      }
                    />
                    <Area
                      dataKey="sorties"
                      type="natural"
                      fill="url(#fillSorties)"
                      stroke="var(--color-chart-2)"
                      stackId="a"
                    />
                    <Area
                      dataKey="entrees"
                      type="natural"
                      fill="url(#fillEntrees)"
                      stroke="var(--color-primary)"
                      stackId="a"
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* ── Bottom: Missions table + Actions en attente ── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 px-4 lg:px-6">

            {/* Recent missions table */}
            <Card>
              <CardHeader>
                <CardTitle>Missions récentes</CardTitle>
                <CardDescription>{missions.length} missions</CardDescription>
                <CardAction>
                  <Button size="sm" onClick={() => setShowCreateChoice(true)}>
                    <Plus className="h-4 w-4" /> Nouveau
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent className="px-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/60">
                        <th className="text-left font-medium text-muted-foreground px-6 py-3">Référence</th>
                        <th className="text-left font-medium text-muted-foreground px-3 py-3">Lot</th>
                        <th className="text-left font-medium text-muted-foreground px-3 py-3">Date</th>
                        <th className="text-left font-medium text-muted-foreground px-3 py-3">Type</th>
                        <th className="text-left font-medium text-muted-foreground px-3 py-3">Statut</th>
                        <th className="text-left font-medium text-muted-foreground px-3 py-3">Technicien</th>
                      </tr>
                    </thead>
                    <tbody>
                      {missions.slice(0, 10).map((m) => {
                        const pending = getPendingActions(m)
                        return (
                          <tr
                            key={m.id}
                            className="border-b border-border/40 last:border-0 hover:bg-accent/50 cursor-pointer transition-colors"
                            onClick={() => navigate(`/app/missions/${m.id}`, { state: { breadcrumbs: [{ label: 'Tableau de bord', href: '/app/dashboard' }, { label: m.reference }] } })}
                          >
                            <td className="px-6 py-3 font-medium flex items-center gap-2">
                              {pending.length > 0 && <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />}
                              {m.reference}
                            </td>
                            <td className="px-3 py-3 text-muted-foreground truncate max-w-[200px]">{m.lot_designation}</td>
                            <td className="px-3 py-3 text-muted-foreground">{formatDate(m.date_planifiee)}</td>
                            <td className="px-3 py-3">
                              <div className="flex gap-1">
                                {m.edl_types?.map((t) => (
                                  <span key={t} className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                                    t === 'entree' || t === 'sortie' ? sensColors[t as 'entree' | 'sortie'] : 'bg-violet-100 text-violet-700'
                                  }`}>
                                    {t === 'entree' || t === 'sortie' ? sensLabels[t as 'entree' | 'sortie'] : 'Inv.'}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-medium ${missionStatutColors[m.statut]}`}>
                                {missionStatutLabels[m.statut]}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-muted-foreground">
                              {m.technicien ? `${m.technicien.prenom} ${m.technicien.nom}` : <span className="text-muted-foreground/30">—</span>}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" onClick={() => navigate('/app/missions')} className="text-xs text-muted-foreground">
                  Voir toutes les missions <CaretRight className="h-3 w-3 ml-1" />
                </Button>
              </CardFooter>
            </Card>

            {/* Actions en attente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <WarningCircle className="h-4 w-4 text-amber-500" weight="fill" />
                  Actions en attente
                </CardTitle>
                <CardDescription>{pendingMissions.length} actions</CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <div className="flex flex-col">
                  {pendingMissions.length === 0 && (
                    <div className="px-6 py-8 text-center text-sm text-muted-foreground/50">
                      Aucune action en attente
                    </div>
                  )}
                  {pendingMissions.slice(0, 8).map((m) => {
                    const actions = getPendingActions(m)
                    return (
                      <div
                        key={m.id}
                        className="flex items-center gap-3 px-6 py-3 hover:bg-accent/50 cursor-pointer transition-colors border-b border-border/30 last:border-0"
                        onClick={() => navigate(`/app/missions/${m.id}`)}
                      >
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{m.reference}</div>
                          <div className="text-xs text-muted-foreground truncate">{m.lot_designation}</div>
                        </div>
                        <div className="text-right shrink-0">
                          {actions.map((a, i) => (
                            <div key={i} className="text-[10px] text-amber-600 font-medium">{a}</div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  )
}
