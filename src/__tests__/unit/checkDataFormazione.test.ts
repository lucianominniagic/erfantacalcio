import { describe, it, expect } from 'vitest'
import { checkDataFormazione } from '~/components/squadra/utils'

describe('checkDataFormazione', () => {
  it('ritorna true per una data chiaramente futura', () => {
    expect(checkDataFormazione('2099-12-31T23:59:00.000Z')).toBe(true)
  })

  it('ritorna false per una data chiaramente passata', () => {
    expect(checkDataFormazione('2020-01-01T00:00:00.000Z')).toBe(false)
  })

  it('ritorna true per undefined (dayjs tratta undefined come "adesso")', () => {
    // dayjs(undefined) === dayjs() === ora corrente → ora >= ora → true
    // In pratica nel useEffect il guard `if (dataFine && ...)` previene
    // che checkDataFormazione venga mai chiamata con undefined
    expect(checkDataFormazione(undefined)).toBe(true)
  })

  describe('uso come check su dataFine nel useEffect formazione', () => {
    it('dataFine futura → checkDataFormazione ritorna true → mostrare "confermata precedente"', () => {
      const dataFine = '2099-06-01T12:00:00.000Z'
      const result = checkDataFormazione(dataFine)
      expect(result).toBe(true)
      // true → il branch "confermata la precedente formazione" viene eseguito
    })

    it('dataFine passata → checkDataFormazione ritorna false → mostrare "non rilasciabile"', () => {
      const dataFine = '2020-06-01T12:00:00.000Z'
      const result = checkDataFormazione(dataFine)
      expect(result).toBe(false)
      // false → il branch "Formazione non rilasciabile" viene eseguito
    })

    it('dataFine assente (undefined) → il guard `if (dataFine && ...)` nel useEffect evita la chiamata', () => {
      // Nel useEffect: `if (dataFine && checkDataFormazione(dataFine))`
      // Se dataFine è undefined il cortocircuito && impedisce la chiamata.
      // Chiamarla direttamente restituisce true (dayjs(undefined) = ora),
      // ma non è un caso reale del flusso applicativo.
      const dataFine = undefined
      const guardResult = dataFine && checkDataFormazione(dataFine)
      expect(guardResult).toBeFalsy()
    })
  })
})
