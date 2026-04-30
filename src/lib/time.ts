const HHMM_RE = /^([01]?\d|2[0-3]):([0-5]\d)$/

export function parseHHMM(value: string): { h: number; m: number } | null {
  const match = HHMM_RE.exec(value)
  if (!match) return null
  return { h: parseInt(match[1], 10), m: parseInt(match[2], 10) }
}

export function timeToMinutes(value: string): number | null {
  const p = parseHHMM(value)
  return p ? p.h * 60 + p.m : null
}

export function minutesToTime(total: number): string {
  const wrapped = ((total % 1440) + 1440) % 1440
  const h = Math.floor(wrapped / 60)
  const m = wrapped % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function addMinutesToTime(value: string, minutes: number): string | null {
  const base = timeToMinutes(value)
  if (base === null) return null
  return minutesToTime(base + minutes)
}

export function diffMinutes(from: string, to: string): number | null {
  const a = timeToMinutes(from)
  const b = timeToMinutes(to)
  if (a === null || b === null) return null
  return b - a
}

export function formatDurationLabel(minutes: number): string {
  if (minutes <= 0) return '—'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} min`
  if (m === 0) return `${h} h`
  return `${h} h ${String(m).padStart(2, '0')}`
}
