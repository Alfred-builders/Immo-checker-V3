import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { MagnifyingGlass, ShieldCheck, CaretUp, CaretDown, X } from '@phosphor-icons/react'
import { useSuperAdminUsers } from '../api'
import { Input } from '../../../components/ui/input'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { Skeleton } from '../../../components/ui/skeleton'
import { formatDate } from '../../../lib/formatters'
import type { SuperAdminUserRow } from '../types'

type SortKey = 'prenom' | 'email' | 'last_login_at' | 'created_at' | 'memberships'
type SortDir = 'asc' | 'desc'

export function SuperAdminUsersListPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'super_admin' | 'inactif'>('all')
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const { data, isLoading } = useSuperAdminUsers(search || undefined)
  const allUsers = data?.data ?? []

  const users = useMemo(() => {
    let list = allUsers
    if (filter === 'super_admin') list = list.filter((u) => u.is_super_admin)
    else if (filter === 'inactif') list = list.filter((u) => {
      if (!u.last_login_at) return true
      const days = (Date.now() - new Date(u.last_login_at).getTime()) / 86_400_000
      return days > 30
    })

    return [...list].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'memberships') {
        cmp = (a.memberships?.length ?? 0) - (b.memberships?.length ?? 0)
      } else if (sortKey === 'prenom') {
        cmp = `${a.prenom} ${a.nom}`.localeCompare(`${b.prenom} ${b.nom}`)
      } else {
        const av = (a as any)[sortKey]
        const bv = (b as any)[sortKey]
        if (av == null && bv == null) cmp = 0
        else if (av == null) cmp = 1
        else if (bv == null) cmp = -1
        else cmp = String(av).localeCompare(String(bv))
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [allUsers, filter, sortKey, sortDir])

  function toggleSort(k: SortKey) {
    if (sortKey === k) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(k); setSortDir('asc') }
  }

  const hasFilters = !!search || filter !== 'all'

  return (
    <div className="px-6 lg:px-8 py-6 max-w-[1400px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Utilisateurs</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {users.length} utilisateur{users.length > 1 ? 's' : ''}{hasFilters ? ' (filtré)' : ''}
        </p>
      </div>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[240px] max-w-sm">
          <MagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Email, nom, prénom..."
            className="pl-10 h-10"
          />
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <SelectTrigger className="h-10 w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les utilisateurs</SelectItem>
            <SelectItem value="super_admin">Super-admins uniquement</SelectItem>
            <SelectItem value="inactif">Inactifs (&gt; 30j)</SelectItem>
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setFilter('all') }} className="text-xs text-muted-foreground">
            <X size={12} /> Effacer
          </Button>
        )}
      </div>

      <div className="bg-card rounded-2xl border border-border/40 shadow-elevation-raised overflow-hidden">
        <div className="grid grid-cols-[1.5fr_200px_100px_140px_140px] gap-4 px-5 py-3 border-b border-border/30 text-xs font-medium text-muted-foreground bg-muted/20 select-none">
          <SortHeader k="prenom" label="Utilisateur" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
          <span>Workspaces</span>
          <SortHeader k="memberships" label="Nb WS" align="center" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
          <SortHeader k="last_login_at" label="Dernière connexion" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
          <SortHeader k="created_at" label="Créé le" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
        </div>

        {isLoading && (
          <div className="divide-y divide-border/20">
            {[1,2,3].map(i => <div key={i} className="px-5 py-3"><Skeleton className="h-6" /></div>)}
          </div>
        )}

        {!isLoading && users.length === 0 && (
          <div className="px-5 py-16 text-center text-sm text-muted-foreground">
            {hasFilters ? 'Aucun utilisateur ne correspond à ces filtres' : 'Aucun utilisateur'}
          </div>
        )}

        {!isLoading && users.map((u: SuperAdminUserRow) => {
          const daysSinceLogin = u.last_login_at
            ? Math.floor((Date.now() - new Date(u.last_login_at).getTime()) / 86_400_000)
            : null
          const isInactive = daysSinceLogin !== null && daysSinceLogin > 30
          return (
            <Link
              key={u.id}
              to={`/super-admin/users/${u.id}`}
              className="grid grid-cols-[1.5fr_200px_100px_140px_140px] gap-4 px-5 py-3 border-b border-border/15 last:border-0 hover:bg-accent/40 transition-colors items-center"
            >
              <div className="min-w-0 flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center shrink-0">
                  {u.prenom.charAt(0).toUpperCase()}{u.nom.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-foreground truncate">{u.prenom} {u.nom}</p>
                    {u.is_super_admin && <ShieldCheck size={13} weight="fill" className="text-red-600 shrink-0" />}
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">{u.email}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {(u.memberships ?? []).slice(0, 2).map((m) => (
                  <Badge key={m.workspace_id} variant="outline" className="text-[11px] max-w-[150px] truncate">
                    {m.workspace_nom} · {m.role}
                  </Badge>
                ))}
                {u.memberships && u.memberships.length > 2 && (
                  <Badge variant="secondary" className="text-[11px]">+{u.memberships.length - 2}</Badge>
                )}
              </div>
              <div className="text-center text-sm text-foreground tabular-nums">{u.memberships?.length ?? 0}</div>
              <div className="text-xs">
                {u.last_login_at ? (
                  <span className={isInactive ? 'text-muted-foreground/60' : 'text-muted-foreground'}>
                    {formatDate(u.last_login_at)}
                    {isInactive && <Badge variant="secondary" className="text-[11px] ml-1.5">{daysSinceLogin}j</Badge>}
                  </span>
                ) : (
                  <Badge variant="secondary" className="text-[11px]">Jamais</Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground">{formatDate(u.created_at)}</div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function SortHeader({ k, label, align, sortKey, sortDir, onClick }: {
  k: SortKey
  label: string
  align?: 'center' | 'left'
  sortKey: SortKey
  sortDir: SortDir
  onClick: (k: SortKey) => void
}) {
  const isActive = sortKey === k
  return (
    <button
      type="button"
      onClick={() => onClick(k)}
      className={`flex items-center gap-1 hover:text-foreground transition-colors ${
        align === 'center' ? 'justify-center' : ''
      } ${isActive ? 'text-foreground' : ''}`}
    >
      <span>{label}</span>
      <span className={`inline-flex flex-col -space-y-1 ${isActive ? '' : 'opacity-30'}`}>
        <CaretUp className={`h-2.5 w-2.5 ${isActive && sortDir === 'asc' ? 'text-primary' : ''}`} weight={isActive && sortDir === 'asc' ? 'bold' : 'regular'} />
        <CaretDown className={`h-2.5 w-2.5 ${isActive && sortDir === 'desc' ? 'text-primary' : ''}`} weight={isActive && sortDir === 'desc' ? 'bold' : 'regular'} />
      </span>
    </button>
  )
}
