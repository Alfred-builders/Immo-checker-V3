import { describe, it, expect } from 'vitest'
import { isUuid } from '../utils/resolve-id.js'

describe('isUuid', () => {
  it('accepts canonical UUID v4', () => {
    expect(isUuid('c3d4e5f6-a1b2-4c5d-8e9f-0a1b2c3d4e5f')).toBe(true)
    expect(isUuid('f47ac10b-58cc-4372-a567-0e02b2c3d479')).toBe(true)
  })

  it('accepts uppercase UUID', () => {
    expect(isUuid('F47AC10B-58CC-4372-A567-0E02B2C3D479')).toBe(true)
  })

  it('rejects business references', () => {
    expect(isUuid('M-2026-0042')).toBe(false)
    expect(isUuid('BAIL-2025-0302')).toBe(false)
    expect(isUuid('BAT-VH-001')).toBe(false)
  })

  it('rejects malformed strings', () => {
    expect(isUuid('')).toBe(false)
    expect(isUuid('not-a-uuid')).toBe(false)
    expect(isUuid('12345')).toBe(false)
    expect(isUuid('c3d4e5f6-a1b2-4c5d-8e9f')).toBe(false) // truncated
    expect(isUuid('c3d4e5f6_a1b2_4c5d_8e9f_0a1b2c3d4e5f')).toBe(false) // wrong separator
    expect(isUuid('  c3d4e5f6-a1b2-4c5d-8e9f-0a1b2c3d4e5f  ')).toBe(false) // surrounding whitespace
  })

  it('rejects UUIDs with extra characters', () => {
    expect(isUuid('c3d4e5f6-a1b2-4c5d-8e9f-0a1b2c3d4e5f extra')).toBe(false)
    expect(isUuid('xc3d4e5f6-a1b2-4c5d-8e9f-0a1b2c3d4e5f')).toBe(false)
  })
})
