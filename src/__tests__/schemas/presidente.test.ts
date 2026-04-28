import { describe, it, expect } from 'vitest'
import { utenteSchema, loginFormSchema } from '~/schemas/presidente'

// ---------------------------------------------------------------------------
// utenteSchema
// ---------------------------------------------------------------------------
describe('utenteSchema', () => {
  const valid = {
    id: 1,
    isAdmin: false,
    isLockLevel: false,
    presidente: 'Mario Rossi',
    email: 'mario@example.com',
    squadra: 'Juventus FC',
    foto: 'foto.jpg',
    importoAnnuale: 120,
    importoMulte: 0,
    importoMercato: 500,
    fantamilioni: 250,
  }

  it('parses a valid utente', () => {
    expect(() => utenteSchema.parse(valid)).not.toThrow()
  })

  it('rejects presidente shorter than 4 characters', () => {
    expect(() => utenteSchema.parse({ ...valid, presidente: 'AB' })).toThrow()
  })

  it('rejects squadra shorter than 4 characters', () => {
    expect(() => utenteSchema.parse({ ...valid, squadra: 'ASD' })).toThrow()
  })

  it('rejects an invalid email', () => {
    expect(() => utenteSchema.parse({ ...valid, email: 'not-an-email' })).toThrow()
  })

  it('rejects a non-boolean isAdmin', () => {
    expect(() => utenteSchema.parse({ ...valid, isAdmin: 'yes' })).toThrow()
  })

  it('rejects missing id', () => {
    const { id, ...rest } = valid
    expect(() => utenteSchema.parse(rest)).toThrow()
  })
})

// ---------------------------------------------------------------------------
// loginFormSchema
// ---------------------------------------------------------------------------
describe('loginFormSchema', () => {
  it('parses valid credentials', () => {
    const result = loginFormSchema.parse({ username: 'mario123', password: 'secret99' })
    expect(result.username).toBe('mario123')
  })

  it('rejects username shorter than 3 characters', () => {
    expect(() => loginFormSchema.parse({ username: 'ab', password: 'secret99' })).toThrow()
  })

  it('rejects username longer than 20 characters', () => {
    expect(() =>
      loginFormSchema.parse({ username: 'a'.repeat(21), password: 'secret99' }),
    ).toThrow()
  })

  it('rejects password shorter than 6 characters', () => {
    expect(() => loginFormSchema.parse({ username: 'mario123', password: '123' })).toThrow()
  })

  it('rejects missing password', () => {
    expect(() => loginFormSchema.parse({ username: 'mario123' })).toThrow()
  })
})
