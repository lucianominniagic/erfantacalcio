import { describe, expect, it } from 'vitest'
import { createSessioneSchema } from './index'

const sessioneBase = {
  dataApertura: new Date('2026-11-07T10:00:00Z'),
  dataChiusura: new Date('2026-11-07T11:00:00Z'),
  maxProposte: 3,
  acquistiEffettivi: 2,
}

describe('createSessioneSchema — ruoli abilitati', () => {
  it('defaults to all roles when none are selected', () => {
    const result = createSessioneSchema.parse(sessioneBase)

    expect(result.ruoliAbilitati).toEqual([])
  })

  it('accepts distinct valid roles for blind auctions', () => {
    const result = createSessioneSchema.parse({
      ...sessioneBase,
      ruoliAbilitati: ['P', 'A'],
    })

    expect(result.ruoliAbilitati).toEqual(['P', 'A'])
  })

  it('rejects duplicate or invalid roles and roles on a clear auction', () => {
    expect(
      createSessioneSchema.safeParse({
        ...sessioneBase,
        ruoliAbilitati: ['D', 'D'],
      }).success,
    ).toBe(false)
    expect(
      createSessioneSchema.safeParse({
        ...sessioneBase,
        ruoliAbilitati: ['X'],
      }).success,
    ).toBe(false)
    expect(
      createSessioneSchema.safeParse({
        ...sessioneBase,
        astaInChiaro: true,
        tipoValuta: 'euro',
        ruoliAbilitati: ['C'],
      }).success,
    ).toBe(false)
  })
})
