import { useState } from 'react'
import { CaretLeft, CaretRight } from '@phosphor-icons/react'
import { Card, CardContent, CardHeader, CardTitle } from 'src/components/ui/card'
import { useMonthSummary } from '../api'
import { cn } from 'src/lib/cn'

interface MiniCalendarProps {
  onDayClick: (date: string, count: number) => void
  onMissionClick: (id: string) => void
}

const DAY_LABELS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di']

const MONTH_LABELS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

function toISODate(year: number, month: number, day: number): string {
  const mm = String(month + 1).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  return `${year}-${mm}-${dd}`
}

function getCalendarGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()

  // getDay() returns 0=Sun..6=Sat; convert to Mon=0..Sun=6
  let startWeekday = firstDay.getDay() - 1
  if (startWeekday < 0) startWeekday = 6

  // Previous month trailing days
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  const leadingDays: Array<{ day: number; month: number; year: number; isCurrentMonth: boolean }> = []
  for (let i = startWeekday - 1; i >= 0; i--) {
    const d = prevMonthLastDay - i
    const m = month === 0 ? 11 : month - 1
    const y = month === 0 ? year - 1 : year
    leadingDays.push({ day: d, month: m, year: y, isCurrentMonth: false })
  }

  // Current month days
  const currentDays: Array<{ day: number; month: number; year: number; isCurrentMonth: boolean }> = []
  for (let d = 1; d <= daysInMonth; d++) {
    currentDays.push({ day: d, month, year, isCurrentMonth: true })
  }

  // Next month trailing days to fill the grid
  const totalCells = leadingDays.length + currentDays.length
  const trailingCount = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7)
  const trailingDays: Array<{ day: number; month: number; year: number; isCurrentMonth: boolean }> = []
  for (let d = 1; d <= trailingCount; d++) {
    const m = month === 11 ? 0 : month + 1
    const y = month === 11 ? year + 1 : year
    trailingDays.push({ day: d, month: m, year: y, isCurrentMonth: false })
  }

  return [...leadingDays, ...currentDays, ...trailingDays]
}

function getWeekIndex(cellIndex: number): number {
  return Math.floor(cellIndex / 7)
}

function getCurrentWeekIndex(grid: Array<{ day: number; month: number; year: number; isCurrentMonth: boolean }>, today: Date): number {
  const todayIdx = grid.findIndex(
    (cell) => cell.isCurrentMonth && cell.day === today.getDate() && cell.month === today.getMonth() && cell.year === today.getFullYear()
  )
  if (todayIdx === -1) return -1
  return getWeekIndex(todayIdx)
}

export function MiniCalendar({ onDayClick, onMissionClick: _onMissionClick }: MiniCalendarProps) {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const { data: summary } = useMonthSummary(viewYear, viewMonth + 1)

  const grid = getCalendarGrid(viewYear, viewMonth)
  const currentWeek = getCurrentWeekIndex(grid, today)

  const isToday = (cell: { day: number; month: number; year: number; isCurrentMonth: boolean }) =>
    cell.isCurrentMonth &&
    cell.day === today.getDate() &&
    cell.month === today.getMonth() &&
    cell.year === today.getFullYear()

  function navigateMonth(delta: number) {
    const d = new Date(viewYear, viewMonth + delta, 1)
    setViewYear(d.getFullYear())
    setViewMonth(d.getMonth())
  }

  function handleDayClick(cell: { day: number; month: number; year: number; isCurrentMonth: boolean }) {
    if (!cell.isCurrentMonth) return
    const dateStr = toISODate(cell.year, cell.month, cell.day)
    const count = summary?.[dateStr] ?? 0
    onDayClick(dateStr, count)
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">
            {MONTH_LABELS[viewMonth]} {viewYear}
          </CardTitle>
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-1 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Mois précédent"
            >
              <CaretLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigateMonth(1)}
              className="p-1 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Mois suivant"
            >
              <CaretRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAY_LABELS.map((label) => (
            <div
              key={label}
              className="text-center text-[10px] font-medium text-muted-foreground py-1"
            >
              {label}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {grid.map((cell, idx) => {
            const dateStr = cell.isCurrentMonth
              ? toISODate(cell.year, cell.month, cell.day)
              : null
            const missionCount = dateStr && summary ? (summary[dateStr] ?? 0) : 0
            const weekIdx = getWeekIndex(idx)
            const isCurrentWeekRow = weekIdx === currentWeek

            return (
              <button
                key={idx}
                onClick={() => handleDayClick(cell)}
                disabled={!cell.isCurrentMonth}
                className={cn(
                  'relative flex flex-col items-center justify-center py-1.5 text-xs transition-colors rounded-md',
                  // Current week row highlight
                  isCurrentWeekRow && 'bg-accent/40',
                  // Current month vs other months
                  cell.isCurrentMonth
                    ? 'text-foreground hover:bg-accent cursor-pointer'
                    : 'text-muted-foreground/30 cursor-default',
                  // Today highlight
                  isToday(cell) && 'bg-primary text-primary-foreground font-semibold hover:bg-primary/90',
                )}
              >
                <span className="leading-none">{cell.day}</span>
                {/* Mission dot */}
                {missionCount > 0 && (
                  <span
                    className={cn(
                      'absolute bottom-0.5 h-1 w-1 rounded-full',
                      isToday(cell)
                        ? 'bg-primary-foreground'
                        : 'bg-primary',
                    )}
                  />
                )}
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
