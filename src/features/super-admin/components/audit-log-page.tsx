import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  MagnifyingGlass, Funnel, X, CaretDown, CaretUp,
  Plus, Pause, Play, EnvelopeSimple, ShieldCheck, UserMinus, UserCircle, LockKey,
  Buildings, UsersThree, ClipboardText, Clock,
} from '@phosphor-icons/react'
import { useAuditLog } from '../api'
import { Skeleton } from '../../../components/ui/skeleton'
import { Badge } from '../../../components/ui/badge'
import { Input } from '../../../components/ui/input'
import { Button } from '../../../components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import type { AuditLogEntry } from '../types'

/* ═══════════════════ Action catalog ═══════════════════
 * Source de vérité pour labels, icônes, couleurs, description. Une seule liste à maintenir. */
type ActionMeta = {
  label: string
  Icon: React.ElementType
  tone: 'emerald' | 'red' | 'amber' | 'blue' | 'violet' | 'slate'
  /** Phrase naturelle avec placeholders {nom} {email} etc. — optionnelle */
  describe?: (e: AuditLogEntry) => string
}

const ACTION_META: Record<string, ActionMeta> = {
  'workspace.created': {
    label: 'Workspace créé', Icon: Plus, tone: 'emerald',
    describe: (e) => `Workspace « ${(e.metadata as any)?.nom ?? '—'} » créé${(e.metadata as any)?.admin_email ? ` · admin initial ${(e.metadata as any).admin_email}` : ''}`,
  },
  'workspace.suspended': {
    label: 'Workspace suspendu', Icon: Pause, tone: 'red',
    describe: (e) => `Workspace « ${(e.metadata as any)?.nom ?? e.target_id.slice(0, 8)} » mis en suspension`,
  },
  'workspace.reactivated': {
    label: 'Workspace réactivé', Icon: Play, tone: 'emerald',
    describe: (e) => `Workspace « ${(e.metadata as any)?.nom ?? e.target_id.slice(0, 8)} » réactivé`,
  },
  'workspace.status_changed': {
    label: 'Statut changé', Icon: Buildings, tone: 'amber',
    describe: (e) => {
      const m = e.metadata as any
      return `Statut workspace : ${m?.from ?? '?'} → ${m?.to ?? '?'}`
    },
  },
  'workspace.admin_invite_resent': {
    label: 'Invitation admin renvoyée', Icon: EnvelopeSimple, tone: 'blue',
    describe: (e) => `Invitation renvoyée à ${(e.metadata as any)?.email ?? '—'}`,
  },
  'user.promoted_super_admin': {
    label: 'Promu super-admin', Icon: ShieldCheck, tone: 'red',
    describe: (e) => `${(e.metadata as any)?.email ?? 'Utilisateur'} obtient les droits super-admin`,
  },
  'user.demoted_super_admin': {
    label: 'Super-admin rétrogradé', Icon: UserMinus, tone: 'amber',
    describe: (e) => `${(e.metadata as any)?.email ?? 'Utilisateur'} perd ses droits super-admin`,
  },
  'user.deactivated': {
    label: 'Utilisateur désactivé', Icon: UserCircle, tone: 'slate',
    describe: (e) => `${(e.metadata as any)?.email ?? 'Utilisateur'} désactivé`,
  },
  'user.force_password_reset': {
    label: 'Reset MDP forcé', Icon: LockKey, tone: 'violet',
    describe: (e) => `Réinitialisation forcée pour ${(e.metadata as any)?.email ?? '—'}`,
  },
}

const TONE_BG: Record<ActionMeta['tone'], string> = {
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
  red: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
  amber: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
  blue: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
  violet: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800',
  slate: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700',
}

const TONE_DOT: Record<ActionMeta['tone'], string> = {
  emerald: 'bg-emerald-500', red: 'bg-red-500', amber: 'bg-amber-500',
  blue: 'bg-blue-500', violet: 'bg-violet-500', slate: 'bg-slate-400',
}

const TARGET_ICON: Record<string, React.ElementType> = {
  workspace: Buildings,
  user: UsersThree,
  invitation: EnvelopeSimple,
}

/* ═══════════════════ Helpers ═══════════════════ */
function getMeta(action: string): ActionMeta {
  return ACTION_META[action] ?? { label: action, Icon: ClipboardText, tone: 'slate' }
}

function formatTimeRelative(iso: string): string {
  const d = new Date(iso)
  const diffMs = Date.now() - d.getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  if (diffMin < 1) return "à l'instant"
  if (diffMin < 60) return `il y a ${diffMin} min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `il y a ${diffH}h`
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

function formatFullTimestamp(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function groupByDay(entries: AuditLogEntry[]) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)
  const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7)

  const groups: Record<string, { label: string; entries: AuditLogEntry[] }> = {
    today: { label: "Aujourd'hui", entries: [] },
    yesterday: { label: 'Hier', entries: [] },
    week: { label: 'Cette semaine', entries: [] },
    older: { label: 'Plus ancien', entries: [] },
  }

  for (const e of entries) {
    const d = new Date(e.created_at); d.setHours(0, 0, 0, 0)
    if (d.getTime() === today.getTime()) groups.today.entries.push(e)
    else if (d.getTime() === yesterday.getTime()) groups.yesterday.entries.push(e)
    else if (d >= weekAgo) groups.week.entries.push(e)
    else groups.older.entries.push(e)
  }
  return Object.entries(groups).filter(([, g]) => g.entries.length > 0)
}

function metadataPairs(m: Record<string, unknown> | null | undefined): Array<[string, string]> {
  if (!m) return []
  return Object.entries(m)
    .filter(([, v]) => v !== null && v !== undefined && v !== '')
    .map(([k, v]) => [k, typeof v === 'object' ? JSON.stringify(v) : String(v)] as [string, string])
}

/* ═══════════════════ Page ═══════════════════ */
export function SuperAdminAuditLogPage() {
  const [targetType, setTargetType] = useState<string>('all')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [search, setSearch] = useState('')

  const { data, isLoading } = useAuditLog({
    target_type: targetType !== 'all' ? targetType : undefined,
    action: actionFilter !== 'all' ? actionFilter : undefined,
  })

  const entries = useMemo(() => {
    const list = data?.data ?? []
    if (!search.trim()) return list
    const q = search.trim().toLowerCase()
    return list.filter((e) => {
      const meta = getMeta(e.action)
      const authorName = `${e.super_admin.prenom} ${e.super_admin.nom}`.toLowerCase()
      return (
        meta.label.toLowerCase().includes(q)
        || authorName.includes(q)
        || e.super_admin.email.toLowerCase().includes(q)
        || e.target_id.toLowerCase().includes(q)
        || JSON.stringify(e.metadata ?? {}).toLowerCase().includes(q)
      )
    })
  }, [data?.data, search])

  // Stats sur les 7 derniers jours
  const stats = useMemo(() => {
    const all = data?.data ?? []
    const weekAgo = Date.now() - 7 * 86400_000
    const recent = all.filter((e) => new Date(e.created_at).getTime() >= weekAgo)
    return {
      total: all.length,
      recent7j: recent.length,
      workspacesCreated: recent.filter(e => e.action === 'workspace.created').length,
      superAdminChanges: recent.filter(e => e.action.startsWith('user.') && e.action.includes('super_admin')).length,
    }
  }, [data?.data])

  const grouped = useMemo(() => groupByDay(entries), [entries])
  const hasFilters = search || targetType !== 'all' || actionFilter !== 'all'

  function clearFilters() {
    setSearch(''); setTargetType('all'); setActionFilter('all')
  }

  return (
    <div className="px-8 py-6 max-w-6xl mx-auto space-y-6">
      {/* ═══ Header ═══ */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Journal d'audit</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Trace immuable de toutes les actions effectuées par les super-administrateurs.
        </p>
      </div>

      {/* ═══ Stat cards ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total actions" value={stats.total} Icon={ClipboardText} tone="slate" />
        <StatCard label="7 derniers jours" value={stats.recent7j} Icon={Clock} tone="blue" />
        <StatCard label="Workspaces créés" value={stats.workspacesCreated} Icon={Buildings} tone="emerald" hint="sur 7j" />
        <StatCard label="Changements super-admin" value={stats.superAdminChanges} Icon={ShieldCheck} tone="red" hint="sur 7j" />
      </div>

      {/* ═══ Filters toolbar ═══ */}
      <div className="bg-card rounded-2xl border border-border/40 shadow-elevation-raised p-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <Input
            placeholder="Rechercher par auteur, cible, métadonnées…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-9"
          />
        </div>
        <Select value={targetType} onValueChange={setTargetType}>
          <SelectTrigger className="h-9 w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les cibles</SelectItem>
            <SelectItem value="workspace">Workspaces</SelectItem>
            <SelectItem value="user">Utilisateurs</SelectItem>
            <SelectItem value="invitation">Invitations</SelectItem>
          </SelectContent>
        </Select>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="h-9 w-[210px]"><SelectValue placeholder="Action" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les actions</SelectItem>
            {Object.entries(ACTION_META).map(([key, m]) => (
              <SelectItem key={key} value={key}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 gap-1.5">
            <X className="h-3.5 w-3.5" /> Réinitialiser
          </Button>
        )}
        <div className="ml-auto text-[11px] text-muted-foreground">
          {entries.length} entrée{entries.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* ═══ Timeline ═══ */}
      {isLoading && (
        <div className="bg-card rounded-2xl border border-border/40 shadow-elevation-raised divide-y divide-border/20">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="p-4 flex gap-3">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && entries.length === 0 && (
        <div className="bg-card rounded-2xl border border-border/40 shadow-elevation-raised p-16 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-muted/60 mb-4">
            <Funnel className="h-6 w-6 text-muted-foreground/50" />
          </div>
          <p className="text-sm font-semibold text-foreground">Aucune entrée</p>
          <p className="text-xs text-muted-foreground mt-1">
            {hasFilters ? 'Aucun résultat pour ces filtres.' : 'Aucune action super-admin n\'a encore été tracée.'}
          </p>
          {hasFilters && (
            <Button variant="outline" size="sm" className="mt-4" onClick={clearFilters}>Réinitialiser les filtres</Button>
          )}
        </div>
      )}

      {!isLoading && grouped.length > 0 && (
        <div className="space-y-5">
          {grouped.map(([groupKey, group]) => (
            <section key={groupKey}>
              <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground/60 mb-2 pl-1">
                {group.label} · {group.entries.length}
              </h2>
              <div className="bg-card rounded-2xl border border-border/40 shadow-elevation-raised divide-y divide-border/15 overflow-hidden">
                {group.entries.map(entry => <AuditRow key={entry.id} entry={entry} />)}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════ Row ═══════════════════ */
function AuditRow({ entry }: { entry: AuditLogEntry }) {
  const [open, setOpen] = useState(false)
  const meta = getMeta(entry.action)
  const Icon = meta.Icon
  const TargetIcon = TARGET_ICON[entry.target_type] ?? ClipboardText
  const description = meta.describe?.(entry)
  const pairs = metadataPairs(entry.metadata)

  const authorInitials = `${entry.super_admin.prenom[0] ?? ''}${entry.super_admin.nom[0] ?? ''}`.toUpperCase()
  const authorName = `${entry.super_admin.prenom} ${entry.super_admin.nom}`.trim() || entry.super_admin.email

  return (
    <div className="px-4 py-3 hover:bg-muted/20 transition-colors">
      <div className="flex items-start gap-3">
        {/* Icône action */}
        <div className={`shrink-0 h-9 w-9 rounded-lg flex items-center justify-center border ${TONE_BG[meta.tone]}`}>
          <Icon className="h-4 w-4" weight="fill" />
        </div>

        {/* Contenu principal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={`${TONE_BG[meta.tone]} text-[11px] font-semibold px-2 py-0.5 border`}>
                <span className={`w-1.5 h-1.5 rounded-full ${TONE_DOT[meta.tone]} mr-1.5`} />
                {meta.label}
              </Badge>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground/70 px-1.5 py-0.5 rounded bg-muted/40">
                <TargetIcon className="h-3 w-3" />
                {entry.target_type}
              </span>
            </div>
            <span
              className="text-[11px] text-muted-foreground/60 shrink-0 font-mono"
              title={formatFullTimestamp(entry.created_at)}
            >
              {formatTimeRelative(entry.created_at)}
            </span>
          </div>

          {description && (
            <p className="text-[13px] text-foreground mt-1.5 leading-snug">{description}</p>
          )}

          {/* Author + toggle metadata */}
          <div className="flex items-center justify-between gap-3 mt-2">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                {authorInitials || '?'}
              </span>
              <Link
                to={`/super-admin/users/${entry.super_admin.id}`}
                className="hover:text-primary hover:underline transition-colors"
              >
                {authorName}
              </Link>
              <span className="text-muted-foreground/40">·</span>
              <span className="text-muted-foreground/60">{entry.super_admin.email}</span>
            </div>
            {pairs.length > 0 && (
              <button
                onClick={() => setOpen(v => !v)}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {open ? <CaretUp className="h-3 w-3" /> : <CaretDown className="h-3 w-3" />}
                Détails ({pairs.length})
              </button>
            )}
          </div>

          {/* Metadata expanded */}
          {open && pairs.length > 0 && (
            <div className="mt-2.5 rounded-lg bg-muted/30 px-3 py-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[11px]">
              {pairs.map(([k, v]) => (
                <div key={k} className="contents">
                  <span className="text-muted-foreground/70 font-mono">{k}</span>
                  <span className="text-foreground font-mono break-all">{v}</span>
                </div>
              ))}
              <div className="contents">
                <span className="text-muted-foreground/70 font-mono">target_id</span>
                <span className="text-foreground font-mono break-all">{entry.target_id}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════ Stat card ═══════════════════ */
function StatCard({ label, value, Icon, tone, hint }: {
  label: string
  value: number
  Icon: React.ElementType
  tone: ActionMeta['tone']
  hint?: string
}) {
  return (
    <div className="bg-card rounded-2xl border border-border/40 shadow-elevation-raised p-4 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold tracking-tight text-foreground mt-1">{value}</p>
        {hint && <p className="text-[11px] text-muted-foreground/50 mt-0.5">{hint}</p>}
      </div>
      <div className={`shrink-0 h-9 w-9 rounded-lg flex items-center justify-center border ${TONE_BG[tone]}`}>
        <Icon className="h-4 w-4" weight="fill" />
      </div>
    </div>
  )
}
