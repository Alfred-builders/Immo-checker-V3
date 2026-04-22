import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CaretLeft, CaretRight, Clock, WarningCircle, User, Plus, ArrowsClockwise, PencilSimple, Trash, MapPin,
} from '@phosphor-icons/react'
import { Button } from 'src/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from 'src/components/ui/popover'
import { ConfirmDialog } from 'src/components/shared/confirm-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select'
import { formatTime, formatDate } from 'src/lib/formatters'
import { TechPicker } from 'src/components/shared/tech-picker'
import { UnavailabilityModal } from './unavailability-modal'
import { useMissions, useWorkspaceTechnicians, useIndisponibilites, useDeleteIndisponibilite, useUpdateIndisponibilite } from '../api'
import type { Mission, IndisponibiliteTechnicien, MissionStatut } from '../types'
import {
  sensLabels, sensColors,
  getPendingActions,
} from '../types'

/* ── Constants ── */

const DAY_NAMES_SHORT = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const MONTH_NAMES = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

type CalendarMode = 'week' | 'month'

// Couleurs de fond pastel par statut mission brut (3 valeurs).
const statutCardColors: Record<MissionStatut, string> = {
  planifiee: 'bg-sky-50 border-sky-200/60 dark:bg-sky-950/30 dark:border-sky-800',
  terminee: 'bg-muted/30 border-border/30',
  annulee: 'bg-red-50/40 border-red-200/30 opacity-60',
}

const statutDotColors: Record<MissionStatut, string> = {
  planifiee: 'bg-sky-500',
  terminee: 'bg-muted-foreground/30',
  annulee: 'bg-red-400',
}

const legendItems = [
  { label: 'Planifiée', color: 'bg-sky-500' },
  { label: 'Terminée', color: 'bg-muted-foreground/30' },
  { label: 'Annulée', color: 'bg-red-400' },
]

/* ── Helpers ── */

function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - day + (day === 0 ? -6 : 1))
  d.setHours(0, 0, 0, 0)
  return d
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function getMonthDays(year: number, month: number): Date[] {
  const first = new Date(year, month, 1)
  const startDay = (first.getDay() + 6) % 7 // 0=Mon
  const days: Date[] = []
  // Pad with previous month
  for (let i = startDay - 1; i >= 0; i--) {
    const d = new Date(year, month, -i)
    days.push(d)
  }
  // Current month
  const last = new Date(year, month + 1, 0)
  for (let i = 1; i <= last.getDate(); i++) {
    days.push(new Date(year, month, i))
  }
  // Pad to 42 (6 weeks)
  while (days.length < 42) {
    days.push(new Date(year, month + 1, days.length - last.getDate() - startDay + 1))
  }
  return days
}

/* ── Main Component ── */

interface Props {
  missions?: Mission[]
  onMissionClick?: (id: string) => void
  onEmptyDayClick?: (date: string) => void
  mode?: CalendarMode
  hideModeSwitcher?: boolean
}

export function MissionCalendar(props: Props) {
  const navigate = useNavigate()
  const externalMode = props.mode
  const hideModeSwitcher = props.hideModeSwitcher
  const [modeState, setModeState] = useState<CalendarMode>(externalMode || 'week')
  const mode = externalMode || modeState
  const setMode = setModeState

  function handleMissionClick(id: string, ref?: string) {
    if (props.onMissionClick) props.onMissionClick(id)
    else navigate(`/app/missions/${id}`, { state: { breadcrumbs: [{ label: 'Missions', href: '/app/missions' }, { label: ref || 'Mission' }] } })
  }
  const [weekOffset, setWeekOffset] = useState(0)
  const [monthOffset, setMonthOffset] = useState(0)
  const [techFilter, setTechFilter] = useState<string>('all')
  const [statutMissionFilter, setStatutMissionFilter] = useState<'all' | 'planifiee' | 'terminee' | 'annulee'>('all')
  const [statutRdvFilter, setStatutRdvFilter] = useState<'all' | 'a_confirmer' | 'confirme' | 'reporte'>('all')
  const [editingIndispoId, setEditingIndispoId] = useState<string | null>(null)
  const today = new Date()

  const { data: techData } = useWorkspaceTechnicians()
  const technicians = techData ?? []

  // Week mode dates
  const monday = useMemo(() => {
    const m = getMonday(new Date())
    m.setDate(m.getDate() + weekOffset * 7)
    return m
  }, [weekOffset])

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  }), [monday])

  // Month mode dates
  const monthDate = useMemo(() => {
    const d = new Date()
    d.setMonth(d.getMonth() + monthOffset)
    return d
  }, [monthOffset])

  const monthDays = useMemo(() => getMonthDays(monthDate.getFullYear(), monthDate.getMonth()), [monthDate])

  // Compute date range for API fetch
  const dateFrom = mode === 'week' ? toDateStr(weekDays[0]) : toDateStr(monthDays[0])
  const dateTo = mode === 'week' ? toDateStr(weekDays[6]) : toDateStr(monthDays[monthDays.length - 1])

  // Fetch the full visible range — status is derived client-side so we cannot
  // pre-filter server-side without losing the "Actions en attente" and "Confirmée"
  // computed buckets (US-838).
  const { data: weekMissionsData, isLoading } = useMissions({
    date_from: dateFrom,
    date_to: dateTo,
    technicien_id: techFilter !== 'all' ? techFilter : undefined,
  })
  const allMissions = weekMissionsData?.data ?? []

  const visibleMissions = useMemo(() => {
    return allMissions.filter(m => {
      if (statutMissionFilter !== 'all' && m.statut !== statutMissionFilter) return false
      if (statutRdvFilter !== 'all' && m.statut_rdv !== statutRdvFilter) return false
      return true
    })
  }, [allMissions, statutMissionFilter, statutRdvFilter])

  // Group missions by day
  const missionsByDay = useMemo(() => {
    const map: Record<string, Mission[]> = {}
    for (const m of visibleMissions) {
      if (!m.date_planifiee) continue
      const key = m.date_planifiee.split('T')[0]
      if (!map[key]) map[key] = []
      map[key].push(m)
    }
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => (a.heure_debut || '').localeCompare(b.heure_debut || ''))
    }
    return map
  }, [visibleMissions])

  // Fetch indisponibilites (week view only, non-blocking on error)
  const indispoQuery = useIndisponibilites(mode === 'week' ? { date_from: dateFrom, date_to: dateTo } : undefined)
  const indisposRaw = indispoQuery.data
  const indisposByDay = useMemo(() => {
    const map: Record<string, IndisponibiliteTechnicien[]> = {}
    if (!Array.isArray(indisposRaw) || mode !== 'week') return map
    for (const ind of indisposRaw) {
      try {
        const startStr = ind.date_debut?.split('T')[0]
        const endStr = ind.date_fin?.split('T')[0]
        if (!startStr || !endStr) continue
        for (const day of weekDays) {
          const dayStr = toDateStr(day)
          if (dayStr >= startStr && dayStr <= endStr) {
            if (!map[dayStr]) map[dayStr] = []
            map[dayStr].push(ind)
          }
        }
      } catch { /* skip malformed */ }
    }
    return map
  }, [indisposRaw, weekDays, mode])

  // Mission count for the visible range
  const totalVisible = visibleMissions.length

  // Navigation
  function goBack() { mode === 'week' ? setWeekOffset(w => w - 1) : setMonthOffset(m => m - 1) }
  function goForward() { mode === 'week' ? setWeekOffset(w => w + 1) : setMonthOffset(m => m + 1) }
  function goToday() { setWeekOffset(0); setMonthOffset(0) }

  const headerLabel = mode === 'week'
    ? (() => {
        const s = weekDays[0], e = weekDays[6]
        return s.getMonth() === e.getMonth()
          ? `${s.getDate()} - ${e.getDate()} ${MONTH_NAMES[e.getMonth()]} ${e.getFullYear()}`
          : `${s.getDate()} ${MONTH_NAMES[s.getMonth()].slice(0, 3)} - ${e.getDate()} ${MONTH_NAMES[e.getMonth()].slice(0, 3)} ${e.getFullYear()}`
      })()
    : `${MONTH_NAMES[monthDate.getMonth()]} ${monthDate.getFullYear()}`

  const isOffsetZero = mode === 'week' ? weekOffset === 0 : monthOffset === 0

  return (
    <div>
      {/* ── Single card: toolbar + calendar ── */}
      <div className="bg-card rounded-2xl border border-border/40 shadow-elevation-raised overflow-hidden">
      {/* Toolbar */}
      <div className="px-5 py-3 flex items-center gap-3 flex-wrap border-b border-border/20">
        {/* Nav */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" className="h-8 w-8 rounded-lg text-foreground hover:bg-muted/60" onClick={goBack}><CaretLeft className="h-4 w-4" weight="bold" /></Button>
          <Button variant="ghost" size="icon-sm" className="h-8 w-8 rounded-lg text-foreground hover:bg-muted/60" onClick={goForward}><CaretRight className="h-4 w-4" weight="bold" /></Button>
          {!isOffsetZero && (
            <Button variant="ghost" size="sm" onClick={goToday} className="text-xs text-primary font-semibold">Aujourd'hui</Button>
          )}
        </div>

        <span className="text-sm font-bold text-foreground capitalize">{headerLabel}</span>
        <span className="text-xs text-muted-foreground/60 font-medium">{totalVisible} mission{totalVisible > 1 ? 's' : ''}</span>

        <div className="flex-1" />

        {/* Filters */}
        <TechPicker
          technicians={technicians}
          value={techFilter === 'all' ? undefined : techFilter}
          onSelect={(id) => setTechFilter(id === techFilter ? 'all' : id)}
          placeholder="Tous les techs"
          size="sm"
          className="w-[170px]"
        />

        <Select value={statutMissionFilter} onValueChange={(v) => setStatutMissionFilter(v as typeof statutMissionFilter)}>
          <SelectTrigger className="h-8 w-[150px] text-xs"><SelectValue placeholder="Statut mission" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous statuts</SelectItem>
            <SelectItem value="planifiee">Planifiée</SelectItem>
            <SelectItem value="terminee">Terminée</SelectItem>
            <SelectItem value="annulee">Annulée</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statutRdvFilter} onValueChange={(v) => setStatutRdvFilter(v as typeof statutRdvFilter)}>
          <SelectTrigger className="h-8 w-[150px] text-xs"><SelectValue placeholder="Statut RDV" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous RDV</SelectItem>
            <SelectItem value="a_confirmer">À confirmer</SelectItem>
            <SelectItem value="confirme">Confirmé</SelectItem>
            <SelectItem value="reporte">Reporté</SelectItem>
          </SelectContent>
        </Select>

        {/* Mode toggle */}
        {!hideModeSwitcher && <div className="flex items-center bg-muted/60 rounded-full p-0.5">
          <button onClick={() => setMode('week')} className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${mode === 'week' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Semaine</button>
          <button onClick={() => setMode('month')} className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${mode === 'month' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Mois</button>
        </div>}

        {/* Legend */}
        <div className="flex items-center gap-3 basis-full">
          {legendItems.map(l => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${l.color}`} />
              <span className="text-[10px] text-muted-foreground/50 font-medium">{l.label}</span>
            </div>
          ))}
          {mode === 'week' && (
            <div className="flex items-center gap-1.5">
              <div
                className="w-4 h-2.5 rounded-sm border border-border/60"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(135deg, transparent 0px, transparent 2px, rgba(0,0,0,0.14) 2px, rgba(0,0,0,0.14) 3px)',
                }}
              />
              <span className="text-[10px] text-muted-foreground/50 font-medium">Indisponible</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Week View ── */}
      {mode === 'week' && (
        <div>
          {/* Day headers */}
          <div className="grid grid-cols-7">
            {weekDays.map((day, i) => {
              const isToday = isSameDay(day, today)
              const dayIdx = (day.getDay() + 6) % 7
              const isWeekend = dayIdx >= 5
              return (
                <div key={toDateStr(day)} className={`text-center py-3 ${i < 6 ? 'border-r border-border/20' : ''} border-b border-border/30 ${isToday ? 'bg-primary/[0.04]' : isWeekend ? 'bg-muted/10' : ''}`}>
                  <div className={`text-[10px] font-semibold uppercase tracking-widest ${isToday ? 'text-primary' : 'text-muted-foreground/40'}`}>{DAY_NAMES_SHORT[dayIdx]}</div>
                  <div className="mt-0.5">
                    {isToday ? (
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-base font-bold">{day.getDate()}</span>
                    ) : (
                      <span className={`text-lg font-bold ${isWeekend ? 'text-muted-foreground/30' : 'text-foreground'}`}>{day.getDate()}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Day columns */}
          <div className="grid grid-cols-7 min-h-[520px]">
            {weekDays.map((day, i) => {
              const key = toDateStr(day)
              const dayMissions = missionsByDay[key] || []
              const dayIndispos = indisposByDay[key] || []
              const isToday = isSameDay(day, today)
              const dayIdx = (day.getDay() + 6) % 7
              const isWeekend = dayIdx >= 5
              const isEmpty = dayMissions.length === 0 && dayIndispos.length === 0

              return (
                <div
                  key={key}
                  className={`p-1.5 space-y-1.5 ${isToday ? 'bg-primary/[0.02]' : isWeekend ? 'bg-muted/10' : ''} ${i < 6 ? 'border-r border-border/20' : ''} ${props.onEmptyDayClick && !isLoading ? 'cursor-pointer hover:bg-primary/[0.03] transition-colors' : ''}`}
                  onClick={(e) => {
                    const t = e.target as HTMLElement
                    if (t.closest('[data-mission-card]')) return
                    if (t.closest('[data-radix-popper-content-wrapper], [role="dialog"], [role="alertdialog"]')) return
                    if (props.onEmptyDayClick) props.onEmptyDayClick(key)
                  }}
                >
                  {isLoading && <div className="space-y-1.5"><div className="h-16 rounded-xl bg-muted/20 animate-pulse" /><div className="h-12 rounded-xl bg-muted/15 animate-pulse" /></div>}

                  {/* Indisponibilites */}
                  {!isLoading && dayIndispos.map(ind => (
                    <IndispoBlock
                      key={ind.id}
                      indispo={ind}
                      onEdit={(id) => setEditingIndispoId(id)}
                    />
                  ))}

                  {!isLoading && dayMissions.map(mission => (
                    <WeekCard mission={mission} onClick={() => handleMissionClick(mission.id, mission.reference)} key={mission.id} />
                  ))}

                  {/* Empty day indicator */}
                  {!isLoading && isEmpty && (
                    <div className="h-full min-h-[80px] flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Plus className="h-5 w-5 text-muted-foreground/20" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Month View ── */}
      {mode === 'month' && (
        <div>
          {/* Day headers */}
          <div className="grid grid-cols-7">
            {DAY_NAMES_SHORT.map((d, i) => (
              <div key={d} className={`text-center py-2.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40 ${i < 6 ? 'border-r border-border/20' : ''} border-b border-border/30`}>{d}</div>
            ))}
          </div>

          {/* Weeks */}
          <div className="grid grid-cols-7 grid-rows-6">
            {monthDays.map((day, i) => {
              const key = toDateStr(day)
              const dayMissions = missionsByDay[key] || []
              const isToday = isSameDay(day, today)
              const isCurrentMonth = day.getMonth() === monthDate.getMonth()
              const isLastCol = (i + 1) % 7 !== 0
              const isNotLastRow = i < 35

              return (
                <div
                  key={`${key}-${i}`}
                  className={`min-h-[100px] p-1 ${isLastCol ? 'border-r border-border/15' : ''} ${isNotLastRow ? 'border-b border-border/15' : ''} ${!isCurrentMonth ? 'opacity-30' : ''} ${isToday ? 'bg-primary/[0.03]' : ''}`}
                >
                  <div className={`text-[11px] font-bold mb-1 px-1 ${isToday ? 'text-primary' : 'text-muted-foreground/50'}`}>
                    {isToday ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px]">{day.getDate()}</span>
                    ) : day.getDate()}
                  </div>

                  <div className="space-y-0.5">
                    {dayMissions.slice(0, 3).map(mission => (
                      <MonthCard key={mission.id} mission={mission} onClick={() => handleMissionClick(mission.id, mission.reference)} />
                    ))}
                    {dayMissions.length > 3 && (
                      <div className="text-[9px] font-semibold text-muted-foreground/50 px-1">+{dayMissions.length - 3} autres</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
      </div>{/* close outer card */}

      {/* Edit indisponibilité (US-838) — single modal at calendar root */}
      <UnavailabilityModal
        open={editingIndispoId !== null}
        onOpenChange={(v) => { if (!v) setEditingIndispoId(null) }}
        editId={editingIndispoId ?? undefined}
      />
    </div>
  )
}

/* ── Week Card (detailed) ── */
function WeekCard({ mission, onClick }: { mission: Mission; onClick: () => void }) {
  const compact = false
  const cardColor = statutCardColors[mission.statut]
  const dotColor = statutDotColors[mission.statut]
  const pendingActions = getPendingActions(mission)
  const hasPending = pendingActions.length > 0
  const techInitials = mission.technicien ? `${mission.technicien.prenom[0]}${mission.technicien.nom[0]}`.toUpperCase() : null

  return (
    <div data-mission-card onClick={onClick} className={`group px-2 py-1.5 rounded-lg border cursor-pointer transition-all duration-150 hover:shadow-elevation-raised-hover overflow-hidden ${cardColor}`}>
      {compact ? (
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
          <span className="text-[9px] font-bold text-foreground/80 truncate">{mission.lot_designation}</span>
          {mission.heure_debut && <span className="text-[8px] text-muted-foreground/40 ml-auto shrink-0">{formatTime(mission.heure_debut)}</span>}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-1 min-w-0">
              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
              <span className="font-mono text-[9px] font-bold text-foreground/70 group-hover:text-primary transition-colors truncate">{mission.reference}</span>
            </div>
            {techInitials && (
              <div className="h-4 w-4 rounded bg-primary/10 flex items-center justify-center text-[7px] font-bold text-primary shrink-0 ml-1">{techInitials}</div>
            )}
          </div>
          <p className="text-[10px] font-semibold text-foreground/90 truncate leading-tight">{mission.lot_designation}</p>
          {mission.adresse && (
            <div className="flex items-center gap-0.5 mt-0.5 text-[10px] text-muted-foreground/80 truncate">
              <MapPin className="h-2.5 w-2.5 shrink-0" />
              <span className="truncate">{mission.adresse}</span>
            </div>
          )}
          {mission.heure_debut && (
            <div className="flex items-center gap-0.5 mt-0.5 text-[10px] font-medium text-muted-foreground/75">
              <Clock className="h-2.5 w-2.5" />
              {formatTime(mission.heure_debut)}{mission.heure_fin ? `-${formatTime(mission.heure_fin)}` : ''}
            </div>
          )}
        </>
      )}

      {!compact && (
        <div className="flex flex-wrap gap-0.5 mt-1">
          {mission.edl_types.map(type => (
            <span key={type} className={`px-1 py-0 rounded text-[7px] font-semibold ${type === 'entree' || type === 'sortie' ? sensColors[type as 'entree' | 'sortie'] : 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300'}`}>
              {type === 'entree' || type === 'sortie' ? sensLabels[type as 'entree' | 'sortie'] : 'Inv.'}
            </span>
          ))}
          {hasPending && (
            <span className="flex items-center gap-0.5 px-1 py-0 rounded text-[7px] font-semibold bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300">
              <WarningCircle className="h-2 w-2" weight="fill" />{pendingActions.length}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Month Card (compact) ── */
function MonthCard({ mission, onClick }: { mission: Mission; onClick: () => void }) {
  const dotColor = statutDotColors[mission.statut]

  return (
    <div data-mission-card onClick={onClick} className="group flex items-center gap-1 px-1 py-0.5 rounded cursor-pointer hover:bg-muted/30 transition-colors">
      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
      <span className="text-[9px] font-semibold text-foreground/80 truncate group-hover:text-primary transition-colors">{mission.lot_designation}</span>
      {mission.heure_debut && <span className="text-[8px] text-muted-foreground/40 shrink-0 ml-auto">{formatTime(mission.heure_debut)}</span>}
    </div>
  )
}

/* ── Indisponibilite Block (with popup) ── */
function IndispoBlock({ indispo: ind, onEdit }: { indispo: IndisponibiliteTechnicien; onEdit?: (parentId: string) => void }) {
  const deleteMutation = useDeleteIndisponibilite()
  const updateMutation = useUpdateIndisponibilite()
  const [showRecurringConfirm, setShowRecurringConfirm] = useState(false)
  const [showSimpleConfirm, setShowSimpleConfirm] = useState(false)
  const techName = `${ind.user_prenom || ''} ${ind.user_nom || 'Technicien'}`.trim()

  // Virtual occurrence: id = "parentId__YYYY-MM-DD"
  const isVirtual = ind.id.includes('__')
  const parentId = isVirtual ? ind.id.split('__')[0] : ind.id
  const occurrenceDate = isVirtual ? ind.id.split('__')[1] : ind.date_debut.slice(0, 10)

  function handleDeleteClick() {
    if (ind.est_recurrent) {
      setShowRecurringConfirm(true)
    } else {
      setShowSimpleConfirm(true)
    }
  }

  function confirmSimpleDelete() {
    deleteMutation.mutate(parentId, {
      onSuccess: () => setShowSimpleConfirm(false),
    })
  }

  async function deleteOccurrenceOnly() {
    const config = { ...(ind.recurrence_config || { freq: 'weekly' as const }) } as any
    const exdates = [...(config.exdates || []), occurrenceDate]
    await updateMutation.mutateAsync({ id: parentId, recurrence_config: { ...config, exdates } })
    setShowRecurringConfirm(false)
  }

  async function deleteFromHere() {
    const prevDay = new Date(occurrenceDate)
    prevDay.setDate(prevDay.getDate() - 1)
    const until = prevDay.toISOString().slice(0, 10)
    const config = { ...(ind.recurrence_config || { freq: 'weekly' as const }) } as any
    await updateMutation.mutateAsync({ id: parentId, recurrence_config: { ...config, until } })
    setShowRecurringConfirm(false)
  }

  async function deleteAll() {
    await deleteMutation.mutateAsync(parentId)
    setShowRecurringConfirm(false)
  }

  const initials = `${(ind.user_prenom?.[0] || '').toUpperCase()}${(ind.user_nom?.[0] || '').toUpperCase()}` || '—'
  const title = ind.motif || 'Indisponible'
  const timeLabel = ind.est_journee_entiere
    ? 'Journée entière'
    : `${new Date(ind.date_debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}–${new Date(ind.date_fin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div
          data-mission-card
          className="px-2 py-2 rounded-lg border border-border/40 cursor-pointer hover:brightness-95 transition-all min-h-[64px] flex flex-col justify-between gap-1.5"
          style={{
            backgroundColor: 'rgba(150, 150, 150, 0.05)',
            backgroundImage:
              'repeating-linear-gradient(135deg, transparent 0px, transparent 5px, rgba(0,0,0,0.06) 5px, rgba(0,0,0,0.06) 6px)',
          }}
          title={techName}
        >
          <div className="flex items-start justify-between gap-1">
            <div className="flex items-start gap-1.5 text-[10px] font-semibold text-foreground/75 leading-tight min-w-0">
              <span className="text-[12px] leading-none shrink-0 mt-0.5" aria-hidden>⛔</span>
              <span className="line-clamp-2 break-words">{title}</span>
            </div>
            <div className="flex items-center gap-0.5 shrink-0">
              {ind.est_recurrent && <ArrowsClockwise size={10} weight="bold" className="text-muted-foreground/50" />}
              <div className="h-4 w-4 rounded bg-primary/10 flex items-center justify-center text-[7px] font-bold text-primary">{initials}</div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground/75">
            <Clock size={9} className="shrink-0" />
            <span className="truncate">{timeLabel}</span>
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" side="right" onClick={(e) => e.stopPropagation()}>
        {showRecurringConfirm ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-foreground">Supprimer l'indisponibilité</p>
            <p className="text-[11px] text-muted-foreground">Cette indisponibilité est récurrente. Que souhaitez-vous supprimer ?</p>
            <div className="space-y-1.5 pt-1">
              <Button variant="outline" size="xs" className="w-full justify-start text-[11px] h-7" onClick={deleteOccurrenceOnly} disabled={updateMutation.isPending}>
                Cette occurrence uniquement
              </Button>
              <Button variant="outline" size="xs" className="w-full justify-start text-[11px] h-7" onClick={deleteFromHere} disabled={updateMutation.isPending}>
                Cette occurrence et les suivantes
              </Button>
              <Button variant="outline" size="xs" className="w-full justify-start text-[11px] h-7 text-destructive hover:text-destructive" onClick={deleteAll} disabled={deleteMutation.isPending}>
                Toutes les occurrences
              </Button>
            </div>
            <Button variant="ghost" size="xs" className="w-full text-[11px] h-7 mt-1" onClick={() => setShowRecurringConfirm(false)}>
              Annuler
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-foreground">{techName}</p>
            <div className="text-[11px] text-muted-foreground space-y-0.5">
              <p>{formatDate(ind.date_debut)}{ind.date_debut !== ind.date_fin ? ` → ${formatDate(ind.date_fin)}` : ''}</p>
              {!ind.est_journee_entiere && <p>{new Date(ind.date_debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - {new Date(ind.date_fin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>}
              {ind.est_journee_entiere && <p>Journée entière</p>}
              {ind.motif && <p className="italic">{ind.motif}</p>}
              {ind.est_recurrent && <p className="flex items-center gap-1"><ArrowsClockwise className="h-3 w-3" /> Récurrent</p>}
            </div>
            <div className="flex gap-2 pt-1">
              {onEdit && (
                <Button variant="ghost" size="xs" onClick={() => onEdit(parentId)}>
                  <PencilSimple className="h-3 w-3" /> Modifier
                </Button>
              )}
              <Button variant="ghost" size="xs" className="text-destructive hover:text-destructive" onClick={handleDeleteClick} disabled={deleteMutation.isPending || updateMutation.isPending}>
                <Trash className="h-3 w-3" /> Supprimer
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
      <ConfirmDialog
        open={showSimpleConfirm}
        onOpenChange={setShowSimpleConfirm}
        title="Supprimer l'indisponibilité ?"
        description={`${title} — ${techName} · ${timeLabel}. Cette action est irréversible.`}
        confirmLabel={deleteMutation.isPending ? 'Suppression…' : 'Supprimer'}
        cancelLabel="Annuler"
        variant="destructive"
        onConfirm={confirmSimpleDelete}
      />
    </Popover>
  )
}
