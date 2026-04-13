// Shared validation utilities for forms

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const phoneRegexFR = /^(?:\+33|0)\s?[1-9](?:[\s.-]?\d{2}){4}$/
export const siretRegex = /^\d{14}$/
export const sirenRegex = /^\d{9}$/

export function isValidEmail(email: string): boolean {
  return emailRegex.test(email.trim())
}

export function isValidPhone(phone: string): boolean {
  if (!phone.trim()) return true // optional
  return phoneRegexFR.test(phone.replace(/\s/g, ''))
}

export function isValidSiret(siret: string): boolean {
  if (!siret.trim()) return true // optional
  return siretRegex.test(siret.trim())
}

export function isValidSiren(siren: string): boolean {
  if (!siren.trim()) return true // optional
  return sirenRegex.test(siren.trim())
}

export function isValidYear(year: number | string): boolean {
  const n = typeof year === 'string' ? parseInt(year) : year
  if (isNaN(n)) return false
  return n >= 1800 && n <= new Date().getFullYear() + 5
}

export function isPositiveInt(val: number | string): boolean {
  const n = typeof val === 'string' ? parseInt(val) : val
  if (isNaN(n)) return false
  return n >= 0
}

export function isDateNotPast(date: string): boolean {
  if (!date) return true
  const today = new Date().toISOString().split('T')[0]
  return date >= today
}

export function isTimeAfter(start: string, end: string): boolean {
  if (!start || !end) return true
  return end > start
}
