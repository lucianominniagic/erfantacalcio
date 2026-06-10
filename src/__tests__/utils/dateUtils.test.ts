import { describe, it, expect } from 'vitest'
import {
  toUtcDate,
  formatDateTime,
  convertFromIsoToDatetimeMUI,
  formatDateFromIso,
} from '~/utils/dateUtils'

describe('toUtcDate', () => {
  it('preserves year/month/day/hours/minutes/seconds in UTC', () => {
    const local = new Date(2024, 0, 15, 10, 30, 45) // Jan 15 2024, 10:30:45 local
    const utc = toUtcDate(local)
    expect(utc.getUTCFullYear()).toBe(2024)
    expect(utc.getUTCMonth()).toBe(0)
    expect(utc.getUTCDate()).toBe(15)
    expect(utc.getUTCHours()).toBe(10)
    expect(utc.getUTCMinutes()).toBe(30)
    expect(utc.getUTCSeconds()).toBe(45)
    expect(utc.getUTCMilliseconds()).toBe(0)
  })
})

describe('formatDateTime', () => {
  it('returns empty string for null', () => {
    expect(formatDateTime(null)).toBe('')
  })

  it('returns empty string for undefined', () => {
    expect(formatDateTime(undefined)).toBe('')
  })

  it('formats a Date object in YYYY-MM-DD HH:mm format', () => {
    const d = new Date('2024-06-01T12:00:00.000Z')
    const result = formatDateTime(d)
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/)
  })

  it('accepts an ISO string', () => {
    const result = formatDateTime('2024-06-01T12:00:00.000Z')
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/)
  })
})

describe('convertFromIsoToDatetimeMUI', () => {
  it('returns empty string for null', () => {
    expect(convertFromIsoToDatetimeMUI(null)).toBe('')
  })

  it('returns empty string for undefined', () => {
    expect(convertFromIsoToDatetimeMUI(undefined)).toBe('')
  })

  it('returns a datetime-local formatted string for a valid ISO date', () => {
    const result = convertFromIsoToDatetimeMUI('2024-08-20T10:30:00.000Z')
    // Format should be YYYY-MM-DDTHH:mm
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
  })
})

describe('formatDateFromIso', () => {
  it('returns empty string for null', () => {
    expect(formatDateFromIso(null, 'DD/MM/YYYY')).toBe('')
  })

  it('returns empty string for undefined', () => {
    expect(formatDateFromIso(undefined, 'DD/MM/YYYY')).toBe('')
  })

  it('formats a valid ISO date with the given format', () => {
    const result = formatDateFromIso('2024-01-15', 'DD/MM/YYYY')
    expect(result).toBe('15/01/2024')
  })

  it('supports different format strings', () => {
    const result = formatDateFromIso('2024-01-15', 'YYYY')
    expect(result).toBe('2024')
  })
})
