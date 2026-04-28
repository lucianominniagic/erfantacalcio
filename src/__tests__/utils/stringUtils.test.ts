import { describe, it, expect } from 'vitest'
import {
  countOccurrences,
  getFileExtension,
  base64ToBuffer,
} from '~/utils/stringUtils'

describe('countOccurrences', () => {
  it('returns 0 when the character is not present', () => {
    expect(countOccurrences('hello world', 'z')).toBe(0)
  })

  it('returns 1 for a single occurrence', () => {
    expect(countOccurrences('hello world', 'o')).toBe(2)
  })

  it('returns the correct count for multiple occurrences', () => {
    expect(countOccurrences('DE VRIJ J.', ' ')).toBe(2)
  })

  it('counts occurrences of a dot', () => {
    expect(countOccurrences('TOTTI F.', '.')).toBe(1)
  })

  it('returns 0 on an empty string', () => {
    expect(countOccurrences('', 'a')).toBe(0)
  })
})

describe('getFileExtension', () => {
  it('returns the extension including the dot', () => {
    expect(getFileExtension('image.png')).toBe('.png')
  })

  it('returns extension for a .ts file', () => {
    expect(getFileExtension('component.test.ts')).toBe('.ts')
  })

  it('returns empty string when no extension is present', () => {
    expect(getFileExtension('Makefile')).toBe('')
  })

  it('returns empty string for undefined', () => {
    expect(getFileExtension(undefined)).toBe('')
  })

  it('returns the last extension for a file with multiple dots', () => {
    expect(getFileExtension('archive.tar.gz')).toBe('.gz')
  })
})

describe('base64ToBuffer', () => {
  it('converts a base64 string to a Buffer', () => {
    const original = 'Hello, World!'
    const base64 = Buffer.from(original).toString('base64')
    const result = base64ToBuffer(base64)
    expect(result).toBeInstanceOf(Buffer)
    expect(result.toString('utf-8')).toBe(original)
  })

  it('returns an empty Buffer for an empty base64 string', () => {
    const result = base64ToBuffer('')
    expect(result).toBeInstanceOf(Buffer)
    expect(result.length).toBe(0)
  })
})
