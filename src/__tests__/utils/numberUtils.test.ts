import { describe, it, expect } from 'vitest'
import {
  generateUniqueRandomNumbers,
  formatToDecimalValue,
  formatCurrency,
} from '~/utils/numberUtils'

describe('generateUniqueRandomNumbers', () => {
  it('returns the correct count of numbers', () => {
    const result = generateUniqueRandomNumbers(1, 10, 5)
    expect(result).toHaveLength(5)
  })

  it('returns all unique numbers', () => {
    const result = generateUniqueRandomNumbers(1, 100, 50)
    const unique = new Set(result)
    expect(unique.size).toBe(50)
  })

  it('returns numbers within the specified range', () => {
    const result = generateUniqueRandomNumbers(5, 15, 5)
    result.forEach((n) => {
      expect(n).toBeGreaterThanOrEqual(5)
      expect(n).toBeLessThanOrEqual(15)
    })
  })

  it('works when count equals range size', () => {
    const result = generateUniqueRandomNumbers(1, 5, 5)
    expect(result).toHaveLength(5)
    expect(new Set(result).size).toBe(5)
  })

  it('throws when count exceeds available numbers', () => {
    expect(() => generateUniqueRandomNumbers(1, 3, 5)).toThrow(
      'Impossibile generare numeri unici, controlla i parametri.',
    )
  })
})

describe('formatToDecimalValue', () => {
  it('converts comma-separated decimal to dot-separated', () => {
    expect(formatToDecimalValue('7,5')).toBe(7.5)
  })

  it('handles a plain decimal with dot', () => {
    expect(formatToDecimalValue('6.5')).toBe(6.5)
  })

  it('strips &nbsp; from the string', () => {
    expect(formatToDecimalValue('6&nbsp;')).toBe(6)
  })

  it('strips "sv" token', () => {
    expect(formatToDecimalValue('sv')).toBeNaN()
  })

  it('strips "s,v," token', () => {
    expect(formatToDecimalValue('s,v,')).toBeNaN()
  })

  it('handles surrounding whitespace', () => {
    expect(formatToDecimalValue('  8,0  ')).toBe(8)
  })

  it('returns a number for a clean integer string', () => {
    expect(formatToDecimalValue('10')).toBe(10)
  })
})

describe('formatCurrency', () => {
  it('formats an integer value as Italian currency', () => {
    const result = formatCurrency(100)
    expect(result).toContain('100')
    expect(result).toContain('€')
  })

  it('formats zero correctly', () => {
    const result = formatCurrency(0)
    expect(result).toContain('0')
    expect(result).toContain('€')
  })

  it('formats a decimal value', () => {
    const result = formatCurrency(1234.56)
    expect(result).toContain('€')
  })

  it('formats a negative value', () => {
    const result = formatCurrency(-50)
    expect(result).toContain('€')
    expect(result).toContain('50')
  })
})
