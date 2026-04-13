import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardText, CalendarBlank, MapPin, WarningCircle, User } from '@phosphor-icons/react'
import { formatDate, formatTime } from 'src/lib/formatters'
import type { Mission, MissionStatut } from '../types'
import {
  missionStatutLabels,
  sensLabels, sensColors,
  getStatutDerive, getPendingActions,
} from '../types'

interface Props {
  missions: Mission[]
  filters: {
    period: string
    techFilter: string
    statutFilter: string
    pendingFilter: boolean
  }
}

const COLUMNS: MissionStatut[] = ['planifiee', 'assignee', 'terminee', 'annulee']

const columnStyles: Record<MissionStatut, { dot: string; headerBg: string; headerText: string }> = {
  planifiee: { dot: 'bg-sky-500', headerBg: 'bg-sky-50 dark:bg-sky-950/40', headerText: 'text-sky-700 dark:text-sky-300' },
  assignee: { dot: 'bg-amber-500', headerBg: 'bg-amber-50 dark:bg-amber-950/40', headerText: 'text-amber-700 dark:text-amber-300' },
  terminee: { dot: 'bg-green-500', headerBg: 'bg-green-50 dark:bg-green-950/40', headerText: 'text-green-700 dark:text-green-300' },
  annulee: { dot: 'bg-red-400', headerBg: 'bg-red-50 dark:bg-red-950/40', headerText: 'text-red-700 dark:text-red-300' },
}

const cardAccent: Record<MissionStatut, string> = {
  planifiee: 'hover:border-sky-200 dark:hover:border-sky-800',
  assignee: 'hover:border-amber-200 dark:hover:border-amber-800',
  terminee: 'hover:border-green-200 dark:hover:border-green-800',
  annulee: 'hover:border-red-200 dark:hover:border-red-800',
}

export function MissionKanban({ missions }: Props) {
  const navigate = useNavigate()

  const grouped = useMemo(() => {
    const groups: Record<MissionStatut, Mission[]> = { planifiee: [], assignee: [], terminee: [], annulee: [] }
    for (const m of missions) groups[m.statut].push(m)
    for (const key of COLUMNS) groups[key].sort((a, b) => new Date(a.date_planifiee).getTime() - new Date(b.date_planifiee).getTime())
    return groups
  }, [missions])

  if (missions.length === 0) {
    return (
      <div className="py-20 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-muted/60 mb-4">
          <ClipboardText className="h-6 w-6 text-muted-foreground/50" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">Aucune mission à afficher</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Modifiez vos filtres ou créez une nouvelle mission</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-4 gap-3 min-h-[500px]">
      {COLUMNS.map((statut) => (
        <KanbanColumn
          key={statut}
          statut={statut}
          missions={grouped[statut]}
          onCardClick={(id, ref) => navigate(`/app/missions/${id}`, { state: { breadcrumbs: [{ label: 'Missions', href: '/app/missions' }, { label: ref || 'Mission' }] } })}
        />
      ))}
    </div>
  )
}

function KanbanColumn({ statut, missions, onCardClick }: {
  statut: MissionStatut; missions: Mission[]; onCardClick: (id: string, ref?: string) => void
}) {
  const style = columnStyles[statut]

  return (
    <div className="flex flex-col">
      {/* Column header */}
      <div className={`flex items-center justify-between px-3 py-2 rounded-xl mb-2 ${style.headerBg}`}>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${style.dot}`} />
          <span className={`text-[12px] font-bold ${style.headerText}`}>{missionStatutLabels[statut]}</span>
        </div>
        <span className={`text-[11px] font-bold ${style.headerText} opacity-60`}>{missions.length}</span>
      </div>

      {/* Cards */}
      <div className="flex-1 space-y-2 overflow-y-auto max-h-[calc(100vh-320px)] pr-0.5 pb-2">
        {missions.length === 0 && (
          <div className="py-16 text-center rounded-xl border border-dashed border-border/40">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-muted/40 mb-2">
              <ClipboardText className="h-4 w-4 text-muted-foreground/30" />
            </div>
            <p className="text-[11px] text-muted-foreground/30">Aucune mission</p>
          </div>
        )}

        {missions.map((mission) => (
          <KanbanCard key={mission.id} mission={mission} statut={statut} onClick={() => onCardClick(mission.id, mission.reference)} />
        ))}
      </div>
    </div>
  )
}

function KanbanCard({ mission, statut, onClick }: { mission: Mission; statut: MissionStatut; onClick: () => void }) {
  const pendingActions = getPendingActions(mission)
  const hasPending = pendingActions.length > 0
  const techName = mission.technicien ? `${mission.technicien.prenom} ${mission.technicien.nom}` : null
  const techInitials = mission.technicien ? `${mission.technicien.prenom[0]}${mission.technicien.nom[0]}`.toUpperCase() : null
  const accent = cardAccent[statut]

  return (
    <div
      onClick={onClick}
      className={`group bg-card rounded-xl border border-border/40 p-3.5 cursor-pointer transition-all duration-200 hover:shadow-elevation-raised-hover ${accent}`}
    >
      {/* Top: ref + avatar */}
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[11px] font-bold text-muted-foreground group-hover:text-primary transition-colors">{mission.reference}</span>
        {techInitials ? (
          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-bold text-primary shrink-0">{techInitials}</div>
        ) : (
          <div className="h-6 w-6 rounded-full bg-muted/40 flex items-center justify-center shrink-0"><User className="h-3 w-3 text-muted-foreground/30" /></div>
        )}
      </div>

      {/* Lot */}
      <p className="text-[13px] font-semibold text-foreground truncate leading-tight">{mission.lot_designation}</p>
      <p className="text-[11px] text-muted-foreground/50 truncate mt-0.5 flex items-center gap-1">
        <MapPin className="h-3 w-3 shrink-0" weight="duotone" />
        {mission.adresse || mission.batiment_designation}
      </p>

      {/* Date */}
      <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-muted-foreground">
        <CalendarBlank className="h-3 w-3 text-muted-foreground/40" weight="duotone" />
        {formatDate(mission.date_planifiee)}
        {mission.heure_debut && <span className="text-muted-foreground/40">{formatTime(mission.heure_debut)}</span>}
      </div>

      {/* Tech name */}
      {techName && (
        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-muted-foreground/60">
          <User className="h-3 w-3 text-muted-foreground/30" weight="duotone" />
          {techName}
        </div>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mt-2.5">
        {mission.edl_types.map((type) => (
          <span
            key={type}
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${
              type === 'entree' || type === 'sortie'
                ? sensColors[type as 'entree' | 'sortie']
                : 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300'
            }`}
          >
            {type === 'entree' || type === 'sortie' ? sensLabels[type as 'entree' | 'sortie'] : 'Inventaire'}
          </span>
        ))}

        {hasPending && (
          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300">
            <WarningCircle className="h-2.5 w-2.5" weight="fill" />
            {pendingActions.length} action{pendingActions.length > 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  )
}
