import { describe, it, expect } from 'vitest'
import {
  giocatoreSchema,
  trasferimentoSchema,
  votoSchema,
  uploadVotoGiocatoreSchema,
} from '~/schemas/giocatore'

// ---------------------------------------------------------------------------
// giocatoreSchema
// ---------------------------------------------------------------------------
describe('giocatoreSchema', () => {
  const valid = { idGiocatore: 1, nome: 'Totti', ruolo: 'A' }

  it('parses a valid giocatore', () => {
    expect(() => giocatoreSchema.parse(valid)).not.toThrow()
  })

  it('rejects nome shorter than 3 characters', () => {
    expect(() => giocatoreSchema.parse({ ...valid, nome: 'AB' })).toThrow()
  })

  it('accepts nomeFantagazzetta as null', () => {
    const result = giocatoreSchema.parse({ ...valid, nomeFantagazzetta: null })
    expect(result.nomeFantagazzetta).toBeNull()
  })

  it('rejects missing idGiocatore', () => {
    const { idGiocatore, ...rest } = valid
    expect(() => giocatoreSchema.parse(rest)).toThrow()
  })

  it('rejects a non-numeric idGiocatore', () => {
    expect(() => giocatoreSchema.parse({ ...valid, idGiocatore: 'abc' })).toThrow()
  })
})

// ---------------------------------------------------------------------------
// trasferimentoSchema
// ---------------------------------------------------------------------------
describe('trasferimentoSchema', () => {
  const valid = {
    idTrasferimento: 1,
    idGiocatore: 5,
    costo: 150,
  }

  it('parses a valid trasferimento', () => {
    expect(() => trasferimentoSchema.parse(valid)).not.toThrow()
  })

  it('allows optional fields to be missing', () => {
    const result = trasferimentoSchema.parse(valid)
    expect(result.idSquadraSerieA).toBeUndefined()
    expect(result.idSquadra).toBeUndefined()
    expect(result.dataAcquisto).toBeUndefined()
    expect(result.dataCessione).toBeUndefined()
  })

  it('accepts idSquadra as null', () => {
    const result = trasferimentoSchema.parse({ ...valid, idSquadra: null })
    expect(result.idSquadra).toBeNull()
  })

  it('rejects missing costo', () => {
    const { costo, ...rest } = valid
    expect(() => trasferimentoSchema.parse(rest)).toThrow()
  })
})

// ---------------------------------------------------------------------------
// votoSchema
// ---------------------------------------------------------------------------
describe('votoSchema', () => {
  const valid = {
    idVoto: 1,
    ruolo: 'A',
    voto: 6.5,
    ammonizione: 0,
    espulsione: 0,
    gol: 1,
    assist: 0,
    autogol: 0,
    altriBonus: 0,
  }

  it('parses a valid voto', () => {
    expect(() => votoSchema.parse(valid)).not.toThrow()
  })

  it('rejects missing ruolo', () => {
    const { ruolo, ...rest } = valid
    expect(() => votoSchema.parse(rest)).toThrow()
  })

  it('rejects non-numeric voto', () => {
    expect(() => votoSchema.parse({ ...valid, voto: 'sei' })).toThrow()
  })
})

// ---------------------------------------------------------------------------
// uploadVotoGiocatoreSchema
// ---------------------------------------------------------------------------
describe('uploadVotoGiocatoreSchema', () => {
  const valid = {
    id_pf: 42,
    Nome: 'TOTTI',
    Ammonizione: 0,
    Assist: 1,
    Autogol: 0,
    Espulsione: 0,
    GolSegnati: 1,
    GolSubiti: 0,
    RigoriErrati: 0,
    RigoriParati: 0,
    Ruolo: 'A',
    Squadra: 'Roma',
    Voto: 7.5,
  }

  it('parses a valid upload row', () => {
    expect(() => uploadVotoGiocatoreSchema.parse(valid)).not.toThrow()
  })

  it('allows Voto to be null', () => {
    const result = uploadVotoGiocatoreSchema.parse({ ...valid, Voto: null })
    expect(result.Voto).toBeNull()
  })

  it('allows id_pf to be null', () => {
    const result = uploadVotoGiocatoreSchema.parse({ ...valid, id_pf: null })
    expect(result.id_pf).toBeNull()
  })

  it('rejects a non-string Nome', () => {
    expect(() => uploadVotoGiocatoreSchema.parse({ ...valid, Nome: 123 })).toThrow()
  })
})
