// Cursor utilities for stable keyset pagination.
//
// Why composite cursors: a cursor that only carries `id` is unstable when the
// ORDER BY is anything other than `id` — rows can be skipped or duplicated as
// data shifts. We encode the ordering key (created_at, designation, …) plus
// the row id so the next page resumes deterministically.
//
// Format: base64url("<orderKey>|<id>"). The order key is whatever the SQL
// ORDER BY uses (ISO timestamp string for created_at, raw text for
// designation). The row id breaks ties on equal order keys.

export interface CompositeCursor {
  orderKey: string
  id: string
}

export function encodeCursor(orderKey: string | Date | null | undefined, id: string): string {
  const key = orderKey instanceof Date ? orderKey.toISOString() : (orderKey ?? '')
  const raw = `${key}|${id}`
  return Buffer.from(raw, 'utf8').toString('base64url')
}

export function decodeCursor(cursor: string): CompositeCursor | null {
  try {
    const raw = Buffer.from(cursor, 'base64url').toString('utf8')
    const sep = raw.lastIndexOf('|')
    if (sep < 0) return null
    return { orderKey: raw.slice(0, sep), id: raw.slice(sep + 1) }
  } catch {
    return null
  }
}
