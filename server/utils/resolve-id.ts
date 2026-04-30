import { query } from '../db/index.js'
import { NotFoundError } from './errors.js'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isUuid(value: string): boolean {
  return UUID_RE.test(value)
}

/**
 * Resolve a path-param `:id` to a UUID. Accepts either:
 *   - a UUID v4 (returned as-is, no DB lookup)
 *   - a value matching `alternateColumn` (e.g. mission.reference, lot.reference_interne)
 *
 * Always scoped by `workspace_id` for tenant isolation. Throws NotFoundError if
 * no row matches.
 */
export async function resolveId(opts: {
  table: string
  alternateColumn: string
  identifier: string
  workspaceId: string
  entityName: string
}): Promise<string> {
  const { table, alternateColumn, identifier, workspaceId, entityName } = opts
  if (isUuid(identifier)) return identifier

  // Whitelist table & column to prevent SQL injection — both come from route code, not user input,
  // but we double-guard anyway.
  if (!/^[a-z_]+$/.test(table) || !/^[a-z_]+$/.test(alternateColumn)) {
    throw new Error(`Invalid resolver target: ${table}.${alternateColumn}`)
  }

  const result = await query(
    `SELECT id FROM ${table} WHERE ${alternateColumn} = $1 AND workspace_id = $2 LIMIT 1`,
    [identifier, workspaceId]
  )
  if (result.rows.length === 0) {
    throw new NotFoundError(entityName)
  }
  return result.rows[0].id
}
