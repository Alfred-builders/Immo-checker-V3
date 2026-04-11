import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CaretLeft, CaretRight, Clock, WarningCircle, User, Plus,
} from '@phosphor-icons/react'
import { Button } from 'src/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select'
import { formatTime } from 'src/lib/formatters'
import { useMissions, useWorkspaceTechnicians } from '../api'
import type { Mission, MissionStatut } from '../types'
import {
  missionStatutLabels,
  sensLabels, sensColors,
  getStatutDerive, getPendingActions,
} from '../types'

/* ── Constants ── */

const DAY_NAMES_SHORT = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const MONTH_NAMES = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

type CalendarMode = 'week' | 'month'

const statutCardColors: Record<string, string> = {
  planifiee: 'bg-sky-50 border-sky-200/60 dark:bg-sky-950/30 dark:border-sky-800',
  actions_en_attente: 'bg-orange-50 border-orange-200/60 dark:bg-orange-950/30 dark:border-orange-800',
  confirmee: 'bg-green-50 border-green-200/60 dark:bg-green-950/30 dark:border-green-800',
  terminee: 'bg-muted/30 border-border/30',
  annulee: 'bg-red-50/40 border-red-200/30 opacity-60',
}

const statutDotColors: Record<string, string> = {
  planifiee: 'bg-sky-500',
  actions_en_attente: 'bg-orange-500',
  confirmee: 'bg-green-500',
  terminee: 'bg-muted-foreground/30',
  annulee: 'bg-red-400',
}

const legendItems = [
  { label: 'Planifiée', color: 'bg-sky-500' },
  { label: 'En attente', color: 'bg-orange-500' },
  { label: 'Confirmée', color: 'bg-green-500' },
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
  const [statutFilter, setStatutFilter] = useState<string>('all')
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

  const { data: weekMissionsData, isLoading } = useMissions({
    date_from: dateFrom,
    date_to: dateTo,
    statut: statutFilter !== 'all' ? statutFilter as MissionStatut : undefined,
    technicien_id: techFilter !== 'all' ? techFilter : undefined,
  })
  const allMissions = weekMissionsData?.data ?? []

  // Group missions by day
  const missionsByDay = useMemo(() => {
    const map: Record<string, Mission[]> = {}
    for (const m of allMissions) {
      if (!m.date_planifiee) continue
      const key = m.date_planifiee.split('T')[0]
      if (!map[key]) map[key] = []
      map[key].push(m)
    }
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => (a.heure_debut || '').localeCompare(b.heure_debut || ''))
    }
    return map
  }, [allMissions])

  // Indisponibilites placeholder (rendered if data passed via props in future)
  const indisposByDay: Record<string, any[]> = {}

  // Mission count for the visible range
  const totalVisible = allMissions.length

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
    <div className="space-y-4">
      {/* ── Toolbar ── */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Nav */}
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="icon-sm" onClick={goBack}><CaretLeft className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon-sm" onClick={goForward}><CaretRight className="h-4 w-4" /></Button>
          {!isOffsetZero && (
            <Button variant="ghost" size="sm" onClick={goToday} className="text-xs text-primary font-semibold">Aujourd'hui</Button>
          )}
        </div>

        <span className="text-sm font-bold text-foreground capitalize">{headerLabel}</span>
        <span className="text-xs text-muted-foreground/60 font-medium">{totalVisible} mission{totalVisible > 1 ? 's' : ''}</span>

        <div className="flex-1" />

        {/* Filters */}
        <Select value={techFilter} onValueChange={setTechFilter}>
          <SelectTrigger className="h-8 w-[160px] text-xs"><SelectValue placeholder="Technicien" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les techs</SelectItem>
            {technicians.map(t => <SelectItem key={t.id} value={t.id}>{t.prenom} {t.nom}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={statutFilter} onValueChange={setStatutFilter}>
          <SelectTrigger className="h-8 w-[140px] text-xs"><SelectValue placeholder="Statut" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="planifiee">Planifiée</SelectItem>
            <SelectItem value="assignee">Assignée</SelectItem>
            <SelectItem value="terminee">Terminée</SelectItem>
            <SelectItem value="annulee">Annulée</SelectItem>
          </SelectContent>
        </Select>

        {/* Mode toggle */}
        {!hideModeSwitcher && <div className="flex items-center bg-muted/60 rounded-full p-0.5">
          <button onClick={() => setMode('week')} className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${mode === 'week' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Semaine</button>
          <button onClick={() => setMode('month')} className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${mode === 'month' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Mois</button>
        </div>}
      </div>

      {/* ── Legend ── */}
      <div className="flex items-center gap-4">
        {legendItems.map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${l.color}`} />
            <span className="text-[10px] text-muted-foreground/60 font-medium">{l.label}</span>
          </div>
        ))}
      </div>

      {/* ── Week View ── */}
      {mode === 'week' && (
        <div className="bg-card rounded-2xl border border-border/40 overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-border/30">
            {weekDays.map(day => {
              const isToday = isSameDay(day, today)
              const dayIdx = (day.getDay() + 6) % 7
              return (
                <div key={toDateStr(day)} className={`text-center py-3 ${isToday ? 'bg-primary/5' : ''} ${dayIdx < 6 ? 'border-r border-border/20' : ''}`}>
                  <div className={`text-[10px] font-bold uppercase tracking-wider ${isToday ? 'text-primary' : 'text-muted-foreground/40'}`}>{DAY_NAMES_SHORT[dayIdx]}</div>
                  <div className={`text-lg font-bold mt-0.5 ${isToday ? 'text-primary' : 'text-foreground'}`}>
                    {isToday ? (
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground">{day.getDate()}</span>
                    ) : day.getDate()}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Day columns */}
          <div className="grid grid-cols-7 min-h-[480px]">
            {weekDays.map((day, i) => {
              const key = toDateStr(day)
              const dayMissions = missionsByDay[key] || []
              const isToday = isSameDay(day, today)

              return (
                <div
                  key={key}
                  className={`p-1.5 space-y-1 ${isToday ? 'bg-primary/[0.02]' : ''} ${i < 6 ? 'border-r border-border/15' : ''}`}
                  onClick={(e) => {
                    if (e.target === e.currentTarget && props.onEmptyDayClick) props.onEmptyDayClick(key)
                  }}
                >
                  {isLoading && <div className="space-y-1"><div className="h-14 rounded-lg bg-muted/20 animate-pulse" /><div className="h-10 rounded-lg bg-muted/15 animate-pulse" /></div>}

                  {!isLoading && dayMissions.map(mission => (
                    <WeekCard key={mission.id} mission={mission} onClick={() => handleMissionClick(mission.id, mission.reference)} />
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Month View ── */}
      {mode === 'month' && (
        <div className="bg-card rounded-2xl border border-border/40 overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7">
            {DAY_NAMES_SHORT.map((d, i) => (
              <div key={d} className={`text-center py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40 ${i < 6 ? 'border-r border-border/15' : ''} border-b border-border/30`}>{d}</div>
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
    </div>
  )
}

/* ── Week Card (detailed) ── */
function WeekCard({ mission, onClick }: { mission: Mission; onClick: () => void }) {
  const statutDerive = getStatutDerive(mission)
  const cardColor = statutCardColors[statutDerive] || statutCardColors.planifiee
  const dotColor = statutDotColors[statutDerive] || statutDotColors.planifiee
  const pendingActions = getPendingActions(mission)
  const hasPending = pendingActions.length > 0
  const techInitials = mission.technicien ? `${mission.technicien.prenom[0]}${mission.technicien.nom[0]}`.toUpperCase() : null

  return (
    <div onClick={onClick} className={`group px-2 py-1.5 rounded-lg border cursor-pointer transition-all duration-150 hover:shadow-sm ${cardColor}`}>
      <div className="flex items-center justify-between mb-0.5">
        <div className="flex items-center gap-1 min-w-0">
          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
          <span className="font-mono text-[9px] font-bold text-foreground/70 group-hover:text-primary transition-colors truncate">{mission.reference}</span>
        </div>
        {techInitials && (
          <div className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center text-[7px] font-bold text-primary shrink-0 ml-1">{techInitials}</div>
        )}
      </div>

      <p className="text-[10px] font-semibold text-foreground/90 truncate leading-tight">{mission.lot_designation}</p>

      {mission.heure_debut && (
        <div className="flex items-center gap-1 mt-1 text-[9px] text-muted-foreground/50">
          <Clock className="h-2.5 w-2.5" weight="duotone" />
          {formatTime(mission.heure_debut)}{mission.heure_fin ? ` - ${formatTime(mission.heure_fin)}` : ''}
        </div>
      )}

      <div className="flex flex-wrap gap-0.5 mt-1">
        {mission.edl_types.map(type => (
          <span key={type} className={`px-1 py-0 rounded-full text-[7px] font-semibold ${type === 'entree' || type === 'sortie' ? sensColors[type as 'entree' | 'sortie'] : 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300'}`}>
            {type === 'entree' || type === 'sortie' ? sensLabels[type as 'entree' | 'sortie'] : 'Inv.'}
          </span>
        ))}
        {hasPending && (
          <span className="flex items-center gap-0.5 px-1 py-0 rounded-full text-[7px] font-semibold bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300">
            <WarningCircle className="h-2 w-2" weight="fill" />{pendingActions.length}
          </span>
        )}
      </div>
    </div>
  )
}

/* ── Month Card (compact) ── */
function MonthCard({ mission, onClick }: { mission: Mission; onClick: () => void }) {
  const statutDerive = getStatutDerive(mission)
  const dotColor = statutDotColors[statutDerive] || statutDotColors.planifiee

  return (
    <div onClick={onClick} className="group flex items-center gap-1 px-1 py-0.5 rounded cursor-pointer hover:bg-muted/30 transition-colors">
      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
      <span className="text-[9px] font-semibold text-foreground/80 truncate group-hover:text-primary transition-colors">{mission.lot_designation}</span>
      {mission.heure_debut && <span className="text-[8px] text-muted-foreground/40 shrink-0 ml-auto">{formatTime(mission.heure_debut)}</span>}
    </div>
  )
}
