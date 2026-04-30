// Display fallbacks for buildings/lots whose designation is now optional
// (Flat Checker · avr. 2026). Designation and num_batiment can both be null —
// these helpers compose a stable label so callers don't repeat the logic.

interface BatimentLike {
  designation?: string | null
  num_batiment?: string | null
}

interface LotLike {
  designation?: string | null
  type_bien?: string | null
  type_bien_precision?: string | null
  etage?: string | null
  emplacement_palier?: string | null
}

const TYPE_BIEN_LABELS: Record<string, string> = {
  appartement: 'Appartement',
  maison: 'Maison',
  studio: 'Studio',
  local_commercial: 'Local commercial',
  parking: 'Parking',
  cave: 'Cave',
  autre: 'Lot',
}

export function formatBatimentLabel(b: BatimentLike | null | undefined): string {
  if (!b) return '—'
  const num = b.num_batiment?.trim()
  const desig = b.designation?.trim()
  if (num && desig) return `Bât. ${num} · ${desig}`
  if (num) return `Bât. ${num}`
  if (desig) return desig
  return 'Bâtiment unique'
}

// Compact variant for tight spots (badges, breadcrumbs).
export function formatBatimentShort(b: BatimentLike | null | undefined): string {
  if (!b) return '—'
  const num = b.num_batiment?.trim()
  const desig = b.designation?.trim()
  if (num) return `Bât. ${num}`
  if (desig) return desig
  return 'Bâtiment'
}

interface AddressLike {
  rue?: string | null
  code_postal?: string | null
  ville?: string | null
}

/**
 * Compact address rendering for tight UI spots (picker cards, chips, lists).
 * Returns "{rue}, {ville}" by default — the postal code is dropped because it
 * adds 6 chars without aiding recognition. If the result still exceeds
 * `maxLen` (default 50), truncate the street with an ellipsis instead of the
 * city, since the city is more useful for disambiguation.
 */
export function formatAddressShort(
  addr: AddressLike | null | undefined,
  maxLen = 50,
): string | null {
  if (!addr) return null
  const rue = addr.rue?.trim()
  const ville = addr.ville?.trim()
  if (!rue && !ville) return null
  const full = [rue, ville].filter(Boolean).join(', ')
  if (full.length <= maxLen) return full
  if (rue && ville) {
    // Reserve room for ", {ville}" + ellipsis
    const villePart = `, ${ville}`
    const budget = maxLen - villePart.length - 1
    const trimmedRue = budget > 0 ? `${rue.slice(0, budget).trimEnd()}…` : '…'
    return `${trimmedRue}${villePart}`
  }
  return `${full.slice(0, maxLen - 1).trimEnd()}…`
}

export function formatLotLabel(l: LotLike | null | undefined): string {
  if (!l) return '—'
  const desig = l.designation?.trim()
  if (desig) return desig
  const typeKey = l.type_bien ?? 'autre'
  const typeLabel = typeKey === 'autre' && l.type_bien_precision?.trim()
    ? l.type_bien_precision.trim()
    : (TYPE_BIEN_LABELS[typeKey] ?? 'Lot')
  const parts: string[] = [typeLabel]
  if (l.etage?.trim()) parts.push(`étage ${l.etage.trim()}`)
  if (l.emplacement_palier?.trim()) parts.push(l.emplacement_palier.trim())
  return parts.join(' · ')
}
