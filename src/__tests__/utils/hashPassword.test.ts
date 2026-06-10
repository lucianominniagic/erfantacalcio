import { describe, it, expect } from 'vitest'
import { computeMD5Hash, hashMD5, hashPassword, verifyPassword } from '~/utils/hashPassword'

describe('computeMD5Hash / hashMD5', () => {
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

  it('hashMD5 is an alias for computeMD5Hash', () => {
    expect(hashMD5('password')).toBe(computeMD5Hash('password'))
  })
})

describe('hashPassword', () => {
  it('produces a bcrypt hash starting with $2b$', async () => {
    const hash = await hashPassword('test')
    expect(hash).toMatch(/^\$2b\$/)
  })

  it('produces a 60-character hash', async () => {
    const hash = await hashPassword('test')
    expect(hash.length).toBe(60)
  })

  it('is non-deterministic — same input produces different hashes', async () => {
    const h1 = await hashPassword('test')
    const h2 = await hashPassword('test')
    expect(h1).not.toBe(h2)
  })
})

describe('verifyPassword', () => {
  it('verifies a bcrypt hash correctly', async () => {
    const hash = await hashPassword('mypassword')
    expect(await verifyPassword('mypassword', hash)).toBe(true)
    expect(await verifyPassword('wrongpassword', hash)).toBe(false)
  })

  it('verifies an MD5 hash correctly (legacy)', async () => {
    const md5Hash = computeMD5Hash('legacypassword')
    expect(await verifyPassword('legacypassword', md5Hash)).toBe(true)
    expect(await verifyPassword('wrongpassword', md5Hash)).toBe(false)
  })

  it('returns false for an unrecognised hash format', async () => {
    expect(await verifyPassword('password', 'notahash')).toBe(false)
  })

  it('returns false for an empty hash', async () => {
    expect(await verifyPassword('password', '')).toBe(false)
  })
})
