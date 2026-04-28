import { describe, it, expect } from 'vitest'
import { computeMD5Hash } from '~/utils/hashPassword'

describe('computeMD5Hash', () => {
  it('returns an uppercase MD5 hash', () => {
    const hash = computeMD5Hash('password')
    expect(hash).toBe(hash.toUpperCase())
  })

  it('produces the correct MD5 hash for a known input', () => {
    // MD5('password') = 5F4DCC3B5AA765D61D8327DEB882CF99
    expect(computeMD5Hash('password')).toBe('5F4DCC3B5AA765D61D8327DEB882CF99')
  })

  it('produces the correct MD5 hash for another known input', () => {
    // MD5('admin') = 21232F297A57A5A743894A0E4A801FC3
    expect(computeMD5Hash('admin')).toBe('21232F297A57A5A743894A0E4A801FC3')
  })

  it('is deterministic — same input always produces same hash', () => {
    const input = 'erfantacalcio2024!'
    expect(computeMD5Hash(input)).toBe(computeMD5Hash(input))
  })

  it('handles an empty string without throwing', () => {
    const hash = computeMD5Hash('')
    expect(typeof hash).toBe('string')
    expect(hash.length).toBeGreaterThan(0)
  })

  it('produces different hashes for different inputs', () => {
    expect(computeMD5Hash('abc')).not.toBe(computeMD5Hash('ABC'))
  })
})
