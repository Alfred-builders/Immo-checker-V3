import { useEffect, useMemo, useRef, useState } from 'react'
import { Clock } from '@phosphor-icons/react'
import { Popover, PopoverAnchor, PopoverContent } from 'src/components/ui/popover'
import { cn } from 'src/lib/cn'

interface Props {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
  className?: string
  /** Quand le picker est utilisé dans un Sheet/Dialog Radix. La popover passe au-dessus
   * (z-50) et son content bypass le pointer-events:none du dialog. */
  modal?: boolean
}

const HHMM_RE = /^([01]?\d|2[0-3]):([0-5]\d)$/

/** Normalise une valeur entrante en "HH:MM" — retire les secondes de PostgreSQL TIME ("15:00:00"). */
function normalize(v: string | null | undefined): string {
  if (!v) return ''
  const trimmed = String(v).trim()
  // "HH:MM:SS" ou "HH:MM:SS.mmm" → "HH:MM"
  const parts = trimmed.split(':')
  if (parts.length >= 2) return `${parts[0].padStart(2, '0')}:${parts[1].slice(0, 2)}`
  return trimmed
}

function isValid(v: string): boolean {
  return HHMM_RE.test(v)
}

function parse(v: string): { h: number; m: number } | null {
  const match = HHMM_RE.exec(v)
  if (!match) return null
  return { h: parseInt(match[1], 10), m: parseInt(match[2], 10) }
}

function format(h: number, m: number): string {
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** Auto-format au fil de la saisie : "1430" → "14:30", "14" → "14", "143" → "14:3". */
function autoFormat(raw: string): string {
  const cleaned = raw.replace(/[^\d:]/g, '')
  if (cleaned.includes(':')) {
    const [hh = '', mm = ''] = cleaned.split(':')
    return `${hh.slice(0, 2)}${mm !== undefined ? ':' + mm.slice(0, 2) : ''}`
  }
  if (cleaned.length <= 2) return cleaned
  return `${cleaned.slice(0, 2)}:${cleaned.slice(2, 4)}`
}

export function TimePicker({
  value, onChange, disabled, placeholder = '--:--', className, modal,
}: Props) {
  const normalizedValue = normalize(value)
  const [open, setOpen] = useState(false)
  const [text, setText] = useState(normalizedValue)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync externe → local quand la valeur parent change (en strippant les secondes éventuelles).
  useEffect(() => { setText(normalize(value)) }, [value])

  function commitText(v: string) {
    if (v === '') { onChange(''); return }
    if (isValid(v)) onChange(v)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = autoFormat(e.target.value)
    setText(formatted)
    commitText(formatted)
  }

  function handleBlur() {
    if (text !== '' && !isValid(text)) setText(normalizedValue)
  }

  function openPopover() {
    if (!disabled) setOpen(true)
  }

  const parsed = useMemo(() => parse(normalizedValue) ?? { h: 0, m: 0 }, [normalizedValue])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div
          onClick={openPopover}
          className={cn('relative cursor-text', disabled && 'cursor-not-allowed', className)}
        >
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]{2}:[0-9]{2}"
            placeholder={placeholder}
            value={text}
            onChange={handleInputChange}
            onFocus={openPopover}
            onBlur={handleBlur}
            disabled={disabled}
            className={cn(
              'flex h-9 w-full rounded-xl border border-border/60 bg-card px-3.5 py-1 pr-9 text-sm shadow-xs transition-[color,box-shadow,border-color] outline-none',
              'placeholder:text-muted-foreground/70 hover:border-border/90',
              'focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/10',
              'disabled:cursor-not-allowed disabled:opacity-50',
            )}
          />
          <span
            aria-hidden
            className={cn(
              'pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex items-center justify-center h-6 w-6 rounded-md text-muted-foreground/50',
              disabled && 'opacity-50',
            )}
          >
            <Clock className="h-4 w-4" />
          </span>
        </div>
      </PopoverAnchor>
      <PopoverContent
        align="start"
        sideOffset={4}
        className={cn(
          // Largeur = trigger (input) ; min pour que le cadran tienne dedans.
          'w-[var(--radix-popover-trigger-width)] min-w-[200px] p-2',
          modal ? 'z-50 pointer-events-auto' : '',
        )}
        onOpenAutoFocus={(e) => {
          // On ne veut pas que la popover vole le focus de l'input — l'utilisateur
          // doit pouvoir continuer à taper pendant que le cadran est visible.
          e.preventDefault()
        }}
        onCloseAutoFocus={(e) => e.preventDefault()}
        // Click outside (sur d'autres champs du form parent) → ferme.
        onInteractOutside={(e) => {
          // Permet de cliquer dans l'input lui-même sans fermer la popover.
          const target = e.target as Node
          if (inputRef.current && inputRef.current.contains(target)) {
            e.preventDefault()
          }
        }}
      >
        <ClockDial
          hour={parsed.h}
          minute={parsed.m}
          onCommit={(h, m) => {
            const v = format(h, m)
            setText(v)
            onChange(v)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

/* ── Clock dial (cadran circulaire 12 positions) ── */

type Mode = 'hours' | 'minutes'

interface DialProps {
  hour: number
  minute: number
  onCommit: (h: number, m: number) => void
}

function ClockDial({ hour, minute, onCommit }: DialProps) {
  const [mode, setMode] = useState<Mode>('hours')
  const [pm, setPm] = useState(hour >= 12)
  const [h, setH] = useState(hour)
  const [m, setM] = useState(minute)

  useEffect(() => { setH(hour); setM(minute); setPm(hour >= 12) }, [hour, minute])

  const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h

  function selectHour(displayed: number) {
    const base = displayed === 12 ? 0 : displayed
    const final = pm ? base + 12 : base
    setH(final)
    onCommit(final, m)
    setMode('minutes')
  }

  function selectMinute(value: number) {
    setM(value)
    onCommit(h, value)
  }

  function togglePm() {
    const next = !pm
    setPm(next)
    const newH = next ? (h % 12) + 12 : h % 12
    setH(newH)
    onCommit(newH, m)
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Display HH : MM (clic pour switcher mode) */}
      <div className="flex items-center gap-1 text-lg font-semibold tabular-nums">
        <button
          type="button"
          onClick={() => setMode('hours')}
          className={cn(
            'px-1.5 py-0 rounded-md transition-colors',
            mode === 'hours' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {String(h).padStart(2, '0')}
        </button>
        <span className="text-muted-foreground/60">:</span>
        <button
          type="button"
          onClick={() => setMode('minutes')}
          className={cn(
            'px-1.5 py-0 rounded-md transition-colors',
            mode === 'minutes' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {String(m).padStart(2, '0')}
        </button>
      </div>

      <Dial
        mode={mode}
        selected={mode === 'hours' ? displayH : Math.round(m / 5) * 5}
        onSelect={(v) => mode === 'hours' ? selectHour(v) : selectMinute(v === 60 ? 0 : v)}
      />

      {/* Toggle AM / PM (AM = 0–11, PM = 12–23) */}
      <div className="flex items-center gap-1 text-[11px] font-semibold">
        <button
          type="button"
          onClick={() => { if (pm) togglePm() }}
          className={cn(
            'px-2.5 py-0.5 rounded-md transition-colors',
            !pm ? 'bg-primary text-primary-foreground' : 'bg-muted/40 text-muted-foreground hover:bg-muted/60',
          )}
        >
          AM
        </button>
        <button
          type="button"
          onClick={() => { if (!pm) togglePm() }}
          className={cn(
            'px-2.5 py-0.5 rounded-md transition-colors',
            pm ? 'bg-primary text-primary-foreground' : 'bg-muted/40 text-muted-foreground hover:bg-muted/60',
          )}
        >
          PM
        </button>
      </div>
    </div>
  )
}

/* ── Le cadran lui-même : 12 numéros placés en cercle ── */

interface DialPaintProps {
  mode: Mode
  selected: number
  onSelect: (value: number) => void
}

function Dial({ mode, selected, onSelect }: DialPaintProps) {
  const size = 160
  const radius = 62
  const center = size / 2

  const numbers = mode === 'hours'
    ? [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    : [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]

  function pos(i: number) {
    const angle = (i * 30 - 90) * Math.PI / 180
    return {
      x: center + Math.cos(angle) * radius,
      y: center + Math.sin(angle) * radius,
    }
  }

  const selectedIdx = numbers.indexOf(selected)
  const handleAngle = selectedIdx >= 0 ? selectedIdx * 30 : 0

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-full bg-muted/30 border border-border/40" />

      {selectedIdx >= 0 && (
        <div
          className="absolute origin-bottom bg-primary"
          style={{
            left: center - 1,
            top: 18,
            width: 2,
            height: center - 18,
            transform: `rotate(${handleAngle}deg)`,
            transformOrigin: 'bottom center',
          }}
        />
      )}
      <div
        className="absolute h-1.5 w-1.5 rounded-full bg-primary"
        style={{ left: center - 3, top: center - 3 }}
      />

      {numbers.map((n, i) => {
        const { x, y } = pos(i)
        const isSelected = n === selected
        return (
          <button
            key={`${mode}-${n}`}
            type="button"
            onClick={() => onSelect(n)}
            className={cn(
              'absolute h-7 w-7 rounded-full text-[11px] font-semibold tabular-nums transition-colors flex items-center justify-center -translate-x-1/2 -translate-y-1/2',
              isSelected
                ? 'bg-primary text-primary-foreground shadow-elevation-raised'
                : 'text-foreground hover:bg-primary/10',
            )}
            style={{ left: x, top: y }}
          >
            {String(n).padStart(2, '0')}
          </button>
        )
      })}
    </div>
  )
}
