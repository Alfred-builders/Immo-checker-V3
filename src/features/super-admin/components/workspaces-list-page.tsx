import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { MagnifyingGlass, Plus, CaretUp, CaretDown, X } from '@phosphor-icons/react'
import { useSuperAdminWorkspaces } from '../api'
import { Input } from '../../../components/ui/input'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { Skeleton } from '../../../components/ui/skeleton'
import { CreateWorkspaceModal } from './create-workspace-modal'
import { formatDate } from '../../../lib/formatters'
import type { WorkspaceStatut, SuperAdminWorkspaceRow } from '../types'

const typeLabels: Record<string, string> = {
  societe_edl: 'Société EDL',
  bailleur: 'Bailleur',
  agence: 'Agence',
}

const statutColors: Record<WorkspaceStatut, string> = {
  actif: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  suspendu: 'bg-red-50 text-red-700 border-red-200',
  trial: 'bg-amber-50 text-amber-700 border-amber-200',
}

type SortKey = 'nom' | 'type_workspace' | 'members_count' | 'batiments_count' | 'missions_count' | 'statut' | 'created_at'
type SortDir = 'asc' | 'desc'

export function SuperAdminWorkspacesListPage() {
  const [search, setSearch] = useState('')
  const [type, setType] = useState<string>('all')
  const [statut, setStatut] = useState<string>('all')
  const [showCreate, setShowCreate] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const { data, isLoading } = useSuperAdminWorkspaces({
    search: search || undefined,
    type: type !== 'all' ? type : undefined,
    statut: statut !== 'all' ? statut : undefined,
  })

  const workspaces = useMemo(() => {
    const list = data?.data ?? []
    return [...list].sort((a, b) => {
      const av = (a as any)[sortKey]
      const bv = (b as any)[sortKey]
      let cmp = 0
      if (av == null && bv == null) cmp = 0
      else if (av == null) cmp = 1
      else if (bv == null) cmp = -1
      else if (typeof av === 'number' && typeof bv === 'number') cmp = av - bv
      else cmp = String(av).localeCompare(String(bv))
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [data, sortKey, sortDir])

  function toggleSort(k: SortKey) {
    if (sortKey === k) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(k); setSortDir('asc') }
  }

  function clearFilters() {
    setSearch(''); setType('all'); setStatut('all')
  }
  const hasFilters = !!search || type !== 'all' || statut !== 'all'

  return (
    <div className="px-6 lg:px-8 py-6 max-w-[1400px] mx-auto">
      <CreateWorkspaceModal open={showCreate} onOpenChange={setShowCreate} />

      <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Workspaces</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {workspaces.length} workspace{workspaces.length > 1 ? 's' : ''}{hasFilters ? ' (filtré)' : ''}
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus size={16} /> Nouveau workspace
        </Button>
      </div>

      {/* Filters bar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[240px] max-w-sm">
          <MagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nom, SIRET, email..."
            className="pl-10 h-10"
          />
        </div>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="h-10 w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous types</SelectItem>
            <SelectItem value="societe_edl">Société EDL</SelectItem>
            <SelectItem value="bailleur">Bailleur</SelectItem>
            <SelectItem value="agence">Agence</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statut} onValueChange={setStatut}>
          <SelectTrigger className="h-10 w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous statuts</SelectItem>
            <SelectItem value="actif">Actif</SelectItem>
            <SelectItem value="suspendu">Suspendu</SelectItem>
            <SelectItem value="trial">Trial</SelectItem>
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-muted-foreground">
            <X size={12} /> Effacer
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border/40 shadow-elevation-raised overflow-hidden">
        <div className="grid grid-cols-[1.5fr_120px_90px_90px_90px_110px_120px] gap-4 px-5 py-3 border-b border-border/30 text-xs font-medium text-muted-foreground bg-muted/20 select-none">
          <SortHeader k="nom" label="Nom" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
          <SortHeader k="type_workspace" label="Type" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
          <SortHeader k="members_count" label="Membres" align="center" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
          <SortHeader k="batiments_count" label="Bâtiments" align="center" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
          <SortHeader k="missions_count" label="Missions" align="center" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
          <SortHeader k="statut" label="Statut" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
          <SortHeader k="created_at" label="Créé le" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
        </div>

        {isLoading && (
          <div className="divide-y divide-border/20">
            {[1,2,3,4].map(i => (
              <div key={i} className="px-5 py-3"><Skeleton className="h-6" /></div>
            ))}
          </div>
        )}

        {!isLoading && workspaces.length === 0 && (
          <div className="px-5 py-16 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              {hasFilters ? 'Aucun workspace ne correspond à ces filtres' : 'Aucun workspace'}
            </p>
            {hasFilters ? (
              <Button variant="outline" size="sm" onClick={clearFilters}>Effacer les filtres</Button>
            ) : (
              <Button size="sm" onClick={() => setShowCreate(true)}>
                <Plus size={14} /> Créer le premier workspace
              </Button>
            )}
          </div>
        )}

        {!isLoading && workspaces.map((w: SuperAdminWorkspaceRow) => (
          <Link
            key={w.id}
            to={`/super-admin/workspaces/${w.id}`}
            className="grid grid-cols-[1.5fr_120px_90px_90px_90px_110px_120px] gap-4 px-5 py-3 border-b border-border/15 last:border-0 hover:bg-accent/40 transition-colors items-center"
          >
            <div className="min-w-0 flex items-center gap-3">
              {w.logo_url ? (
                <img src={w.logo_url} alt={w.nom} className="h-8 w-8 rounded-lg object-cover border border-border/40 shrink-0" />
              ) : (
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                  {w.nom.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{w.nom}</p>
                {w.siret && <p className="text-[11px] text-muted-foreground font-mono">{w.siret}</p>}
              </div>
            </div>
            <div><Badge variant="outline" className="capitalize text-[11px]">{typeLabels[w.type_workspace] ?? w.type_workspace}</Badge></div>
            <div className="text-center text-sm text-foreground tabular-nums">{w.members_count}</div>
            <div className="text-center text-sm text-foreground tabular-nums">{w.batiments_count}</div>
            <div className="text-center text-sm text-foreground tabular-nums">{w.missions_count}</div>
            <div><Badge className={`${statutColors[w.statut] ?? ''} capitalize text-[11px]`}>{w.statut}</Badge></div>
            <div className="text-xs text-muted-foreground">{formatDate(w.created_at)}</div>
          </Link>
        ))}
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
