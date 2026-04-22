import { describe, it, expect } from 'vitest'
import yaml from 'js-yaml'
import { readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const specPath = path.resolve(__dirname, '..', 'openapi.yaml')
const spec = yaml.load(readFileSync(specPath, 'utf8')) as any

// Routes réellement exposées sous /api/v1 (cf server/index.ts)
const exposedV1 = {
  '/missions': ['get', 'post'],
  '/missions/{id}': ['get', 'patch', 'delete'],
  '/missions/{id}/edl-inventaires': ['get'],
  '/edl-inventaires': ['get'],
  '/edl-inventaires/{id}': ['get'],
  '/edl-inventaires/{id}/pdf': ['get'],
  '/lots': ['get'],
  '/lots/{id}': ['get'],
  '/lots/{id}/edl-inventaires': ['get'],
  '/batiments': ['get'],
  '/batiments/{id}': ['get'],
} as const

describe('openapi.yaml', () => {
  it('is a valid OpenAPI 3.0.x document', () => {
    expect(spec.openapi).toMatch(/^3\.0\./)
    expect(spec.info?.title).toBe('ImmoChecker API')
    expect(spec.info?.version).toBeDefined()
    expect(spec.paths).toBeTypeOf('object')
    expect(spec.components?.schemas).toBeTypeOf('object')
  })

  it('declares BearerAuth security scheme and applies it globally', () => {
    expect(spec.components.securitySchemes.BearerAuth).toBeDefined()
    expect(spec.components.securitySchemes.BearerAuth.type).toBe('http')
    expect(spec.components.securitySchemes.BearerAuth.scheme).toBe('bearer')
    expect(spec.security).toContainEqual({ BearerAuth: [] })
  })

  it('servers points at /api/v1', () => {
    expect(spec.servers).toBeInstanceOf(Array)
    expect(spec.servers.length).toBeGreaterThan(0)
    for (const s of spec.servers) {
      expect(s.url).toMatch(/\/api\/v1$/)
    }
  })

  it('documents every route actually exposed by the server (no orphan docs)', () => {
    const documented = Object.keys(spec.paths)
    for (const p of documented) {
      expect(exposedV1, `path "${p}" is documented but not exposed at /api/v1`).toHaveProperty(p)
    }
  })

  it('documents every HTTP verb that the server exposes', () => {
    for (const [p, verbs] of Object.entries(exposedV1)) {
      expect(spec.paths[p], `path "${p}" missing from openapi.yaml`).toBeDefined()
      for (const v of verbs) {
        expect(spec.paths[p][v], `${v.toUpperCase()} ${p} not documented`).toBeDefined()
      }
    }
  })

  it('every path has a tags field (groups nav sidebar correctly)', () => {
    for (const [p, operations] of Object.entries<any>(spec.paths)) {
      for (const [verb, op] of Object.entries<any>(operations)) {
        if (!['get', 'post', 'patch', 'put', 'delete'].includes(verb)) continue
        expect(op.tags, `${verb.toUpperCase()} ${p} has no tag`).toBeInstanceOf(Array)
        expect(op.tags.length, `${verb.toUpperCase()} ${p} has empty tags`).toBeGreaterThan(0)
      }
    }
  })

  it('write operations document a 401 Unauthorized response', () => {
    const writeOps: Array<[string, string]> = []
    for (const [p, ops] of Object.entries<any>(spec.paths)) {
      for (const v of ['post', 'patch', 'put', 'delete']) {
        if (ops[v]) writeOps.push([v, p])
      }
    }
    expect(writeOps.length).toBeGreaterThan(0)
    for (const [v, p] of writeOps) {
      expect(spec.paths[p][v].responses['401'], `${v.toUpperCase()} ${p} missing 401`).toBeDefined()
    }
  })

  it('every $ref points to an existing component', () => {
    const refs: string[] = []
    const walk = (node: any) => {
      if (!node || typeof node !== 'object') return
      if (typeof node.$ref === 'string') refs.push(node.$ref)
      for (const v of Object.values(node)) walk(v)
    }
    walk(spec)
    for (const ref of refs) {
      expect(ref.startsWith('#/'), `non-local ref: ${ref}`).toBe(true)
      const parts = ref.slice(2).split('/')
      let cur: any = spec
      for (const part of parts) {
        cur = cur?.[part]
        expect(cur, `broken ref ${ref} at segment "${part}"`).toBeDefined()
      }
    }
  })

  it('CreateMissionInput mirrors the required fields of POST /missions', () => {
    const input = spec.components.schemas.CreateMissionInput
    expect(input.required).toEqual(expect.arrayContaining(['lot_id', 'sens', 'date_planifiee']))
    expect(input.properties.sens.enum).toEqual(['entree', 'sortie', 'entree_sortie'])
    expect(input.properties.type_bail.enum).toEqual(['individuel', 'collectif'])
  })

  it('enum values for mission.statut match the backend domain', () => {
    const statutEnum = spec.components.schemas.Mission.properties.statut.enum
    expect(statutEnum).toEqual(['planifiee', 'terminee', 'annulee'])
  })
})
