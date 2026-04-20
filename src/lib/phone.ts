import { parsePhoneNumberFromString, AsYouType, type CountryCode } from 'libphonenumber-js'

const DEFAULT_COUNTRY: CountryCode = 'FR'

export function formatAsYouType(value: string, country: CountryCode = DEFAULT_COUNTRY): string {
  return new AsYouType(country).input(value)
}

export function isValidPhone(value: string, country: CountryCode = DEFAULT_COUNTRY): boolean {
  if (!value) return false
  const parsed = parsePhoneNumberFromString(value, country)
  return !!parsed && parsed.isValid()
}

export function normalizePhone(value: string, country: CountryCode = DEFAULT_COUNTRY): string | null {
  const parsed = parsePhoneNumberFromString(value, country)
  if (!parsed || !parsed.isValid()) return null
  return parsed.number
}
