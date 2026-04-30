import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  MagnifyingGlass, X, CaretRight,
  Plus, Pause, Play, EnvelopeSimple, ShieldCheck, UserMinus, UserCircle, LockKey,
  Buildings, UsersThree, ClipboardText, ArrowsClockwise, Copy, Check,
  PencilSimple, SignOut, Power,
} from '@phosphor-icons/react'
import { useAuditLog } from '../api'
import { Skeleton } from '../../../components/ui/skeleton'
import { Input } from '../../../components/ui/input'
import { Button } from '../../../components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { DynamicFilter, applyDynamicFilters, type FilterField, type ActiveFilter } from '../../../components/shared/dynamic-filter'
import { cn } from '../../../lib/cn'
import type { AuditLogEntry } from '../types'

/* ═══════════════════ Catalog ═══════════════════ */
type Tone = 'emerald' | 'red' | 'amber' | 'blue' | 'violet' | 'slate'
type Level = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG'

type ActionMeta = {
  label: string
  Icon: React.ElementType
  tone: Tone
  level: Level
  describe?: (e: AuditLogEntry) => string
}

const ACTION_META: Record<string, ActionMeta> = {
  'workspace.created': {
    label: 'workspace.created', Icon: Plus, tone: 'emerald', level: 'INFO',
    describe: (e) => `Workspace « ${(e.metadata as any)?.nom ?? '—'} » créé${(e.metadata as any)?.admin_email ? ` · admin initial ${(e.metadata as any).admin_email}` : ''}`,
  },
  'workspace.suspended': {
    label: 'workspace.suspended', Icon: Pause, tone: 'red', level: 'WARN',
    describe: (e) => {
      const m = e.metadata as any
      const nom = m?.nom ?? e.target_id.slice(0, 8)
      return m?.reason
        ? `Workspace « ${nom} » suspendu — motif : ${m.reason}`
        : `Workspace « ${nom} » mis en suspension`
    },
  },
  'workspace.updated': {
    label: 'workspace.updated', Icon: PencilSimple, tone: 'blue', level: 'INFO',
    describe: (e) => {
      const m = e.metadata as any
      const fields = Array.isArray(m?.changed) ? m.changed.join(', ') : '—'
      return `Workspace « ${m?.nom ?? e.target_id.slice(0, 8)} » mis à jour (${fields})`
    },
  },
  'workspace.reactivated': {
    label: 'workspace.reactivated', Icon: Play, tone: 'emerald', level: 'INFO',
    describe: (e) => `Workspace « ${(e.metadata as any)?.nom ?? e.target_id.slice(0, 8)} » réactivé`,
  },
  'workspace.status_changed': {
    label: 'workspace.status_changed', Icon: Buildings, tone: 'amber', level: 'WARN',
    describe: (e) => {
      const m = e.metadata as any
      return `Statut workspace : ${m?.from ?? '?'} → ${m?.to ?? '?'}`
    },
  },
  'workspace.admin_invite_resent': {
    label: 'workspace.admin_invite_resent', Icon: EnvelopeSimple, tone: 'blue', level: 'INFO',
    describe: (e) => `Invitation renvoyée à ${(e.metadata as any)?.email ?? '—'}`,
  },
  'user.promoted_super_admin': {
    label: 'user.promoted_super_admin', Icon: ShieldCheck, tone: 'red', level: 'ERROR',
    describe: (e) => `${(e.metadata as any)?.email ?? 'Utilisateur'} obtient les droits super-admin`,
  },
  'user.demoted_super_admin': {
    label: 'user.demoted_super_admin', Icon: UserMinus, tone: 'amber', level: 'WARN',
    describe: (e) => `${(e.metadata as any)?.email ?? 'Utilisateur'} perd ses droits super-admin`,
  },
  'user.deactivated': {
    label: 'user.deactivated', Icon: Power, tone: 'red', level: 'WARN',
    describe: (e) => `${(e.metadata as any)?.email ?? 'Utilisateur'} désactivé · sessions révoquées`,
  },
  'user.reactivated': {
    label: 'user.reactivated', Icon: UserCircle, tone: 'emerald', level: 'INFO',
    describe: (e) => `${(e.metadata as any)?.email ?? 'Utilisateur'} réactivé`,
  },
  'user.force_password_reset': {
    label: 'user.force_password_reset', Icon: LockKey, tone: 'violet', level: 'WARN',
    describe: (e) => `Réinitialisation forcée pour ${(e.metadata as any)?.email ?? '—'}`,
  },
  'user.sessions_revoked': {
    label: 'user.sessions_revoked', Icon: SignOut, tone: 'amber', level: 'WARN',
    describe: (e) => {
      const m = e.metadata as any
      const n = typeof m?.revoked === 'number' ? m.revoked : 0
      return `${m?.email ?? 'Utilisateur'} déconnecté de tous ses appareils (${n} session${n > 1 ? 's' : ''})`
    },
  },
}

const LEVEL_CLS: Record<Level, string> = {
  INFO: 'text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/20',
  WARN: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
  ERROR: 'text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20',
  DEBUG: 'text-slate-500 dark:text-slate-400 bg-slate-500/10 border-slate-500/20',
}

const TONE_TEXT: Record<Tone, string> = {
  emerald: 'text-emerald-600 dark:text-emerald-400',
  red: 'text-red-600 dark:text-red-400',
  amber: 'text-amber-600 dark:text-amber-400',
  blue: 'text-blue-600 dark:text-blue-400',
  violet: 'text-violet-600 dark:text-violet-400',
  slate: 'text-slate-500 dark:text-slate-400',
}

const TONE_BAR: Record<Tone, string> = {
  emerald: 'bg-emerald-500 group-hover:bg-emerald-500/60',
  red: 'bg-red-500 group-hover:bg-red-500/60',
  amber: 'bg-amber-500 group-hover:bg-amber-500/60',
  blue: 'bg-blue-500 group-hover:bg-blue-500/60',
  violet: 'bg-violet-500 group-hover:bg-violet-500/60',
  slate: 'bg-slate-400 group-hover:bg-slate-400/60',
}

const TARGET_LABEL: Record<string, string> = {
  workspace: 'workspace',
  user: 'user',
  invitation: 'invitation',
}

/* ═══════════════════ Helpers ═══════════════════ */
function getMeta(action: string): ActionMeta {
  return ACTION_META[action] ?? { label: action, Icon: ClipboardText, tone: 'slate', level: 'INFO' }
}

function formatTimeRelative(iso: string): string {
  const d = new Date(iso)
  const diffMs = Date.now() - d.getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  if (diffMin < 1) return "à l'instant"
  if (diffMin < 60) return `${diffMin}min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH}h`
  const diffD = Math.floor(diffH / 24)
  return `${diffD}j`
}

function formatTimeWithMs(iso: string): string {
  const d = new Date(iso)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  const ms = String(d.getMilliseconds()).padStart(3, '0')
  return `${hh}:${mm}:${ss}.${ms}`
}

function formatDateISO(iso: string): string {
  const d = new Date(iso)
  return d.toISOString().slice(0, 10)
}

function formatFullTimestamp(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit',
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
    .map(([k, v]) => [k, typeof v === 'object' ? JSON.stringify(v, null, 2) : String(v)] as [string, string])
}

type Period = 'all' | '24h' | '7d' | '30d'
function periodCutoff(p: Period): number {
  if (p === '24h') return Date.now() - 86400_000
  if (p === '7d') return Date.now() - 7 * 86400_000
  if (p === '30d') return Date.now() - 30 * 86400_000
  return 0
}

/* ═══════════════════ Page ═══════════════════ */
export function SuperAdminAuditLogPage() {
  const [period, setPeriod] = useState<Period>('all')
  const [targetType, setTargetType] = useState<string>('all')
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [dynamicFilters, setDynamicFilters] = useState<ActiveFilter[]>([])

  // Server-side filter on target_type only — action / author / level are filtered client-side
  // so the user can stack them as dynamic-filter badges.
  const { data, isLoading, isFetching, refetch } = useAuditLog({
    target_type: targetType !== 'all' ? targetType : undefined,
  })

  const allEntries = data?.data ?? []

  // Authors derived from the result set, used as options in dynamic filter
  const authors = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>()
    for (const e of allEntries) {
      const id = e.super_admin.id
      const name = `${e.super_admin.prenom} ${e.super_admin.nom}`.trim() || e.super_admin.email
      if (!map.has(id)) map.set(id, { id, name })
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [allEntries])

  // Filter fields exposed via DynamicFilter (action, author, free-text on metadata)
  const filterFields: FilterField[] = useMemo(() => [
    {
      id: 'action',
      label: 'Action',
      type: 'select',
      options: Object.keys(ACTION_META).map(k => ({ value: k, label: k })),
    },
    {
      id: 'auteur',
      label: 'Auteur',
      type: 'select',
      options: authors.map(a => ({ value: a.id, label: a.name })),
      getValue: (e: AuditLogEntry) => e.super_admin.id,
    },
    {
      id: 'auteur_email',
      label: 'Email auteur',
      type: 'text',
      getValue: (e: AuditLogEntry) => e.super_admin.email,
    },
    {
      id: 'target_id',
      label: 'ID cible',
      type: 'text',
    },
    {
      id: 'metadata',
      label: 'Métadonnées',
      type: 'text',
      getValue: (e: AuditLogEntry) => JSON.stringify(e.metadata ?? {}),
    },
    {
      id: 'created_at',
      label: 'Date',
      type: 'date',
    },
  ], [authors])

  const entries = useMemo(() => {
    const cutoff = periodCutoff(period)
    let list = allEntries
    if (cutoff) list = list.filter(e => new Date(e.created_at).getTime() >= cutoff)
    if (levelFilter !== 'all') list = list.filter(e => getMeta(e.action).level === levelFilter)
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter((e) => {
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
    }
    list = applyDynamicFilters(list, dynamicFilters, filterFields)
    return list
  }, [allEntries, period, levelFilter, search, dynamicFilters, filterFields])

  const grouped = useMemo(() => groupByDay(entries), [entries])
  const hasFilters = !!search || period !== 'all' || targetType !== 'all' || levelFilter !== 'all' || dynamicFilters.length > 0

  function clearFilters() {
    setSearch(''); setPeriod('all'); setTargetType('all'); setLevelFilter('all'); setDynamicFilters([])
  }

  return (
    <div className="px-6 lg:px-8 py-6 max-w-[1400px] mx-auto flex flex-col gap-4">
      {/* ═══ Header ═══ */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Journal d'audit</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Trace immuable de toutes les actions super-admin.
        </p>
      </div>

      {/* ═══ Toolbar (style client) ═══ */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <Input
            placeholder="Rechercher dans le journal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10"
          />
        </div>

        <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <SelectTrigger className="h-10 w-[180px] text-sm">
            <SelectValue placeholder="Période" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toute la période</SelectItem>
            <SelectItem value="24h">Dernières 24h</SelectItem>
            <SelectItem value="7d">7 derniers jours</SelectItem>
            <SelectItem value="30d">30 derniers jours</SelectItem>
          </SelectContent>
        </Select>

        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="h-10 w-[150px] text-sm">
            <SelectValue placeholder="Niveau" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous niveaux</SelectItem>
            <SelectItem value="INFO">INFO</SelectItem>
            <SelectItem value="WARN">WARN</SelectItem>
            <SelectItem value="ERROR">ERROR</SelectItem>
          </SelectContent>
        </Select>

        <Select value={targetType} onValueChange={setTargetType}>
          <SelectTrigger className="h-10 w-[150px] text-sm">
            <SelectValue placeholder="Cible" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes cibles</SelectItem>
            <SelectItem value="workspace">Workspaces</SelectItem>
            <SelectItem value="user">Utilisateurs</SelectItem>
            <SelectItem value="invitation">Invitations</SelectItem>
          </SelectContent>
        </Select>

        <DynamicFilter fields={filterFields} filters={dynamicFilters} onChange={setDynamicFilters} />

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 gap-1.5">
            <X className="h-3.5 w-3.5" /> Réinitialiser
          </Button>
        )}

        <div className="flex-1" />

        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200/80 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60 font-mono">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60 animate-ping" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          LIVE
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-1.5 h-10"
        >
          <ArrowsClockwise className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} />
          Rafraîchir
        </Button>
      </div>

      {/* ═══ Console / log viewer ═══ */}
      <div className="bg-card rounded-xl border border-border/40 shadow-elevation-raised overflow-hidden">
        {/* Console header */}
        <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-border/40 bg-surface-sunken">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
            </div>
            <span className="text-[11px] font-mono text-muted-foreground/70 ml-1.5">
              audit-log · {entries.length} entr{entries.length === 1 ? 'ée' : 'ées'}
              {hasFilters && allEntries.length !== entries.length && (
                <span className="text-muted-foreground/50"> / {allEntries.length}</span>
              )}
            </span>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground/50">
            stream.tail · jsonl
          </span>
        </div>

        {/* Stream body */}
        <div className="font-mono">
          {isLoading && (
            <div className="px-4 py-3 space-y-2">
              {[1, 2, 3, 4, 5, 6, 7].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-3 flex-1" />
                </div>
              ))}
            </div>
          )}

          {!isLoading && entries.length === 0 && (
            <div className="px-6 py-16 text-center">
              <p className="text-[12px] font-mono text-muted-foreground/60">
                $ tail -f audit.log <span className="text-muted-foreground/40">--filter=…</span>
              </p>
              <p className="text-sm font-semibold text-foreground mt-3">Aucune entrée</p>
              <p className="text-xs text-muted-foreground mt-1">
                {hasFilters ? 'Aucun résultat pour cette sélection.' : "Aucune action super-admin n'a encore été tracée."}
              </p>
              {hasFilters && (
                <Button variant="outline" size="sm" className="mt-4" onClick={clearFilters}>Réinitialiser les filtres</Button>
              )}
            </div>
          )}

          {!isLoading && grouped.length > 0 && (
            <div className="divide-y divide-border/30">
              {grouped.map(([groupKey, group]) => (
                <section key={groupKey}>
                  {/* Day group header — comment-style */}
                  <div className="px-4 py-1.5 bg-muted/20 border-b border-border/30 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-muted-foreground/70">
                      <span className="text-muted-foreground/40">## </span>
                      {group.label}
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground/40 tabular-nums">
                      {group.entries.length} event{group.entries.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="divide-y divide-border/15">
                    {group.entries.map((entry, idx) => (
                      <LogLine key={entry.id} entry={entry} index={idx} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════ Log line ═══════════════════ */
function LogLine({ entry, index }: { entry: AuditLogEntry; index: number }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const meta = getMeta(entry.action)
  const description = meta.describe?.(entry)
  const pairs = metadataPairs(entry.metadata)
  const authorName = `${entry.super_admin.prenom} ${entry.super_admin.nom}`.trim() || entry.super_admin.email

  function copyJson(e: React.MouseEvent) {
    e.stopPropagation()
    const payload = {
      id: entry.id,
      ts: entry.created_at,
      level: meta.level,
      action: entry.action,
      target: { type: entry.target_type, id: entry.target_id },
      actor: { id: entry.super_admin.id, email: entry.super_admin.email },
      metadata: entry.metadata,
    }
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2)).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  return (
    <div
      className={cn(
        'group relative text-[12px] transition-colors cursor-pointer',
        index % 2 === 1 && 'bg-muted/[0.04]',
        open ? 'bg-muted/30' : 'hover:bg-muted/20',
      )}
      onClick={() => setOpen(v => !v)}
    >
      {/* Severity vertical bar — always present, intensifies when expanded */}
      <div className={cn('absolute left-0 top-0 bottom-0 w-[3px] transition-opacity', TONE_BAR[meta.tone], open ? 'opacity-100' : 'opacity-30 group-hover:opacity-80')} />

      {/* Header line — fixed columns */}
      <div className="flex items-start gap-3 pl-4 pr-3 py-1.5">
        {/* Caret */}
        <CaretRight
          className={cn(
            'h-3 w-3 mt-0.5 shrink-0 text-muted-foreground/40 transition-transform',
            open && 'rotate-90 text-foreground/70',
          )}
        />

        {/* Timestamp */}
        <span
          className="shrink-0 text-muted-foreground/60 tabular-nums select-all"
          title={formatFullTimestamp(entry.created_at)}
        >
          <span className="text-muted-foreground/40">{formatDateISO(entry.created_at)}</span>{' '}
          <span className="text-foreground/80">{formatTimeWithMs(entry.created_at)}</span>
        </span>

        {/* Level */}
        <span
          className={cn(
            'shrink-0 inline-flex items-center justify-center px-1.5 h-[18px] min-w-[52px] rounded text-[10.5px] font-bold tracking-wider border',
            LEVEL_CLS[meta.level],
          )}
        >
          {meta.level}
        </span>

        {/* Action + target + message */}
        <div className="flex-1 min-w-0 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className={cn('font-semibold', TONE_TEXT[meta.tone])}>
            {meta.label}
          </span>
          <span className="text-muted-foreground/50">·</span>
          <span className="text-muted-foreground/70">
            <span className="text-muted-foreground/50">target=</span>
            <span className="text-foreground/80">{TARGET_LABEL[entry.target_type] ?? entry.target_type}</span>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-foreground/60">{entry.target_id.slice(0, 8)}</span>
          </span>
          {description && (
            <>
              <span className="text-muted-foreground/40">»</span>
              <span className="text-foreground/90 font-sans">{description}</span>
            </>
          )}
        </div>

        {/* Right-side meta (author + relative time) */}
        <div className="shrink-0 flex items-center gap-2 text-muted-foreground/60">
          <Link
            to={`/super-admin/users/${entry.super_admin.id}`}
            onClick={(e) => e.stopPropagation()}
            className="hover:text-primary hover:underline truncate max-w-[160px]"
            title={authorName}
          >
            <span className="text-muted-foreground/40">@</span>{entry.super_admin.email.split('@')[0]}
          </Link>
          <span className="text-muted-foreground/30">·</span>
          <span className="tabular-nums w-9 text-right">{formatTimeRelative(entry.created_at)}</span>
        </div>
      </div>

      {/* Expanded payload */}
      {open && (
        <div
          className="pl-12 pr-4 pb-3 -mt-0.5 space-y-2"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Action toolbar */}
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-3 text-muted-foreground/60">
              <span><span className="text-muted-foreground/40">id=</span>{entry.id}</span>
              <span><span className="text-muted-foreground/40">target_id=</span>{entry.target_id}</span>
            </div>
            <button
              onClick={copyJson}
              className="inline-flex items-center gap-1 px-2 h-6 rounded border border-border/40 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
              {copied ? 'Copié' : 'Copier JSON'}
            </button>
          </div>

          {/* Author block */}
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground/70">
            <span className="text-muted-foreground/40">actor</span>
            <span className="text-muted-foreground/40">→</span>
            <span className="text-foreground/80">{authorName}</span>
            <span className="text-muted-foreground/40">&lt;{entry.super_admin.email}&gt;</span>
          </div>

          {/* Metadata payload — JSON-styled */}
          {pairs.length > 0 && (
            <div className="rounded-md border border-border/40 bg-surface-sunken overflow-hidden">
              <div className="px-3 py-1 border-b border-border/30 flex items-center justify-between bg-muted/30">
                <span className="text-[11px] text-muted-foreground/60">payload.metadata</span>
                <span className="text-[11px] text-muted-foreground/40 tabular-nums">{pairs.length} key{pairs.length > 1 ? 's' : ''}</span>
              </div>
              <div className="px-3 py-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-[11.5px]">
                <span className="text-muted-foreground/40">{'{'}</span>
                <span />
                {pairs.map(([k, v], i) => (
                  <div key={k} className="contents">
                    <span className="text-violet-500 dark:text-violet-400 pl-3">"{k}":</span>
                    <span className="text-emerald-700 dark:text-emerald-400 break-all whitespace-pre-wrap">
                      {/^\d+(\.\d+)?$/.test(v) || v === 'true' || v === 'false' || v === 'null'
                        ? <span className="text-amber-600 dark:text-amber-400">{v}</span>
                        : <>"{v}"</>}
                      {i < pairs.length - 1 && <span className="text-muted-foreground/40">,</span>}
                    </span>
                  </div>
                ))}
                <span className="text-muted-foreground/40">{'}'}</span>
                <span />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
