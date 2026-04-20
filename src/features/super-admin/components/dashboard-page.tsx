import { useSuperAdminStats, useSuperAdminTrends } from '../api'
import { Buildings, UsersThree, FileText, TrendUp, Clock, ShieldCheck, PauseCircle, Sparkle } from '@phosphor-icons/react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell } from 'recharts'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardAction } from '../../../components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '../../../components/ui/chart'
import { Skeleton } from '../../../components/ui/skeleton'
import { Badge } from '../../../components/ui/badge'
import { IconTrendingUp } from '@tabler/icons-react'

const chartConfig = {
  workspaces: { label: 'Workspaces', color: 'var(--chart-1)' },
  users: { label: 'Utilisateurs', color: 'var(--chart-2)' },
} satisfies ChartConfig

const typeColors: Record<string, string> = {
  societe_edl: 'var(--chart-1)',
  bailleur: 'var(--chart-2)',
  agence: 'var(--chart-3)',
}

const typeLabels: Record<string, string> = {
  societe_edl: 'Société EDL',
  bailleur: 'Bailleur',
  agence: 'Agence',
}

const statutLabels: Record<string, { label: string; color: string }> = {
  actif: { label: 'Actifs', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  suspendu: { label: 'Suspendus', color: 'text-red-700 bg-red-50 border-red-200' },
  trial: { label: 'Trial', color: 'text-amber-700 bg-amber-50 border-amber-200' },
}

function formatDay(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

export function SuperAdminDashboardPage() {
  const { data: stats, isLoading: loadingStats } = useSuperAdminStats()
  const { data: trends, isLoading: loadingTrends } = useSuperAdminTrends()

  const dailyData = (trends?.daily ?? []).map((d) => ({ ...d, label: formatDay(d.day) }))

  return (
    <div className="px-6 lg:px-8 py-6 max-w-[1400px] mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Tableau de bord</h1>
        <p className="text-sm text-muted-foreground mt-1">Vue d'ensemble de la plateforme ImmoChecker</p>
      </div>

      {/* Row 1 — 4 main KPI cards (workspace-dashboard style) */}
      <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card @xl/main:grid-cols-2 @5xl/main:grid-cols-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Workspaces actifs"
          value={stats?.workspaces_actifs}
          sub={`${stats?.workspaces_total ?? 0} au total`}
          tag={stats?.workspaces_created_30d ? `+${stats.workspaces_created_30d} 30j` : undefined}
          tagIcon={<IconTrendingUp className="size-3" />}
          loading={loadingStats}
        />
        <KpiCard
          label="Utilisateurs MAU"
          value={stats?.users_mau}
          sub={`${stats?.users_total ?? 0} comptes au total`}
          tag={stats?.users_created_30d ? `+${stats.users_created_30d} 30j` : undefined}
          tagIcon={<IconTrendingUp className="size-3" />}
          color="sky"
          loading={loadingStats}
        />
        <KpiCard
          label="EDL signés"
          value={stats?.edl_signed_total}
          sub="Cumul depuis création"
          tag="cumul"
          tagIcon={<FileText className="size-3" />}
          color="emerald"
          loading={loadingStats}
        />
        <KpiCard
          label="Missions actives"
          value={stats?.missions_total}
          sub="Toutes plateformes"
          tag="live"
          tagIcon={<Sparkle className="size-3" weight="fill" />}
          color="amber"
          loading={loadingStats}
        />
      </div>

      {/* Row 2 — 2 charts side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">
        {/* Area chart — daily creation trends */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution 30 derniers jours</CardTitle>
            <CardDescription>Nouveaux workspaces et utilisateurs créés par jour</CardDescription>
            <CardAction>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[var(--chart-1)]" /> Workspaces</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[var(--chart-2)]" /> Utilisateurs</span>
              </div>
            </CardAction>
          </CardHeader>
          <CardContent>
            {loadingTrends ? (
              <Skeleton className="h-[240px] rounded-xl" />
            ) : (
              <ChartContainer config={chartConfig} className="h-[240px] w-full">
                <AreaChart data={dailyData} margin={{ left: 4, right: 12, top: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradWs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradUs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    interval={Math.max(Math.floor(dailyData.length / 6), 1)}
                    fontSize={11}
                  />
                  <YAxis tickLine={false} axisLine={false} width={28} fontSize={11} allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="workspaces" stroke="var(--chart-1)" fill="url(#gradWs)" strokeWidth={2} />
                  <Area type="monotone" dataKey="users" stroke="var(--chart-2)" fill="url(#gradUs)" strokeWidth={2} />
                </AreaChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Pie chart — workspaces by type */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition par type</CardTitle>
            <CardDescription>Workspaces par type de profil</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {loadingTrends ? (
              <Skeleton className="h-[200px] rounded-xl" />
            ) : trends?.by_type?.length ? (
              <>
                <ChartContainer config={chartConfig} className="h-[200px] w-full">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Pie
                      data={trends.by_type}
                      dataKey="count"
                      nameKey="type_workspace"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {trends.by_type.map((entry) => (
                        <Cell key={entry.type_workspace} fill={typeColors[entry.type_workspace] ?? 'var(--chart-4)'} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
                <div className="flex flex-col gap-1.5 text-xs">
                  {trends.by_type.map((t) => (
                    <div key={t.type_workspace} className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: typeColors[t.type_workspace] ?? 'var(--chart-4)' }} />
                        {typeLabels[t.type_workspace] ?? t.type_workspace}
                      </span>
                      <span className="font-semibold text-foreground tabular-nums">{t.count}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Aucune donnée</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 3 — Top active + secondary stats */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">
        {/* Top active workspaces */}
        <Card>
          <CardHeader>
            <CardTitle>Workspaces les plus actifs (30j)</CardTitle>
            <CardDescription>Classés par nombre de missions créées</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingTrends ? (
              <div className="space-y-2">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-10" />)}</div>
            ) : trends?.top_active?.length ? (
              <div className="divide-y divide-border/40">
                {trends.top_active.map((w, i) => (
                  <Link
                    key={w.id}
                    to={`/super-admin/workspaces/${w.id}`}
                    className="flex items-center justify-between py-2.5 hover:bg-accent/40 -mx-2 px-2 rounded transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-[11px] font-mono text-muted-foreground/60 w-4 shrink-0">#{i + 1}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{w.nom}</p>
                        <p className="text-[11px] text-muted-foreground capitalize">{typeLabels[w.type_workspace] ?? w.type_workspace}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {w.missions_count} {w.missions_count === 1 ? 'mission' : 'missions'}
                    </Badge>
                  </Link>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground py-4">Aucune mission sur les 30 derniers jours</p>}
          </CardContent>
        </Card>

        {/* Secondary KPIs */}
        <Card>
          <CardHeader>
            <CardTitle>État de la plateforme</CardTitle>
            <CardDescription>Statistiques secondaires</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <SecondaryRow
              icon={<Buildings size={14} className="text-muted-foreground" />}
              label="Statuts workspaces"
              value={
                <div className="flex gap-1.5 flex-wrap justify-end">
                  {(trends?.by_statut ?? []).map((s) => (
                    <Badge key={s.statut} className={`${statutLabels[s.statut]?.color ?? ''} text-[10px]`}>
                      {statutLabels[s.statut]?.label ?? s.statut} · {s.count}
                    </Badge>
                  ))}
                </div>
              }
            />
            <SecondaryRow
              icon={<ShieldCheck size={14} className="text-muted-foreground" />}
              label="Super-admins"
              value={<span className="font-semibold text-foreground">{stats?.super_admins_count ?? 0}</span>}
            />
            <SecondaryRow
              icon={<Clock size={14} className="text-muted-foreground" />}
              label="Invitations en attente"
              value={<span className="font-semibold text-foreground">{stats?.invitations_pending ?? 0}</span>}
            />
            <SecondaryRow
              icon={<UsersThree size={14} className="text-muted-foreground" />}
              label="Utilisateurs non actifs 30j"
              value={<span className="font-semibold text-foreground">{Math.max(0, (stats?.users_total ?? 0) - (stats?.users_mau ?? 0))}</span>}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/* ── Helpers ── */

function KpiCard({ label, value, sub, tag, tagIcon, color, loading }: {
  label: string
  value: number | undefined
  sub: string
  tag?: string
  tagIcon?: React.ReactNode
  color?: 'sky' | 'emerald' | 'amber'
  loading?: boolean
}) {
  const colorCls = color === 'sky'
    ? 'text-sky-700 bg-sky-50 border-sky-200'
    : color === 'emerald'
      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
      : color === 'amber'
        ? 'text-amber-700 bg-amber-50 border-amber-200'
        : 'text-primary bg-primary/5 border-primary/15'
  const numColor = color === 'sky' ? 'text-sky-700'
    : color === 'emerald' ? 'text-emerald-700'
    : color === 'amber' ? 'text-amber-700'
    : 'text-primary'

  return (
    <Card data-slot="card">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className={`text-3xl font-bold tabular-nums tracking-tight ${numColor}`}>
          {loading ? <Skeleton className="h-8 w-20" /> : (value ?? 0)}
        </CardTitle>
        {tag && (
          <CardAction>
            <Badge variant="outline" className={`${colorCls} gap-1 text-[10px]`}>
              {tagIcon}
              {tag}
            </Badge>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-[11px] text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  )
}

function SecondaryRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 border-b border-border/20 last:border-0">
      <span className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        {label}
      </span>
      <div className="text-sm">{value}</div>
    </div>
  )
}
