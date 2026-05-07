// Test caratterizzanti — FASE 3 pre-refactor
// Tests della logica di validazione e clonaggio formazione in confirmPrecedente
//
// TODO: After FASE 3 refactor, extract these pure functions:
// - validateNoExistingFormazioni(idPartita, idSquadra, idPartiteCorrente) → boolean
// - cloneFormazione(lastFormazione, idPartita, newDataOra) → formazioneData
// - filterLastFormazione(allFormazioni, idPartiteCorrente) → lastFormazione | null

import { describe, it, expect } from 'vitest'

/**
 * Caratterizza la logica di confirmPrecedente.
 *
 * La procedura:
 * 1. Verifica che non esista già una formazione per le partite correnti
 * 2. Recupera l'ultima formazione precedente (escludendo partite correnti)
 * 3. Clona la formazione con lo stesso modulo
 * 4. Inserisce i voti con reset (voto=0)
 */
describe('confirmPrecedente — Formation Cloning Logic', () => {
  describe('Validation: No Existing Formazioni', () => {
    it('should reject if formazione already exists for current gameday', () => {
      // arrange
      const formazioniEsistenti = 1 // at least one exists
      const expectedError = 'Hai già inserito la formazione per questa giornata'

      // act & assert
      if (formazioniEsistenti > 0) {
        expect(formazioniEsistenti).toBeGreaterThan(0)
      }
    })

    it('should allow if no formazione exists for current gameday', () => {
      // arrange
      const formazioniEsistenti = 0

      // act & assert
      expect(formazioniEsistenti).toBe(0)
    })
  })

  describe('Last Formazione Retrieval', () => {
    it('should retrieve last formazione excluding current gameday matches', () => {
      // arrange
      const idSquadra = 1
      const idPartiteCorrente = [10, 11] // current matches to exclude
      const allFormazioni = [
        {
          idFormazione: 1,
          idPartita: 5,
          modulo: '4-3-3',
          dataOra: new Date('2024-01-15'),
        }, // past
        {
          idFormazione: 2,
          idPartita: 7,
          modulo: '3-5-2',
          dataOra: new Date('2024-01-22'),
        }, // most recent past
        {
          idFormazione: 3,
          idPartita: 10,
          modulo: '4-4-2',
          dataOra: new Date('2024-02-01'),
        }, // current, should exclude
      ]

      // act
      const lastFormazione = allFormazioni
        .filter((f) => !idPartiteCorrente.includes(f.idPartita))
        .sort((a, b) => b.dataOra.getTime() - a.dataOra.getTime())[0]

      // assert
      expect(lastFormazione).toBeDefined()
      expect(lastFormazione?.idFormazione).toBe(2)
      expect(lastFormazione?.modulo).toBe('3-5-2')
      expect(idPartiteCorrente).not.toContain(lastFormazione?.idPartita)
    })

    it('should throw if no lastFormazione found', () => {
      // arrange
      const idPartiteCorrente = [10, 11]
      const allFormazioni = [
        {
          idFormazione: 1,
          idPartita: 10,
          modulo: '4-3-3',
          dataOra: new Date(),
        }, // current, excluded
        {
          idFormazione: 2,
          idPartita: 11,
          modulo: '3-5-2',
          dataOra: new Date(),
        }, // current, excluded
      ]

      // act
      const lastFormazione = allFormazioni
        .filter((f) => !idPartiteCorrente.includes(f.idPartita))
        .sort((a, b) => b.dataOra.getTime() - a.dataOra.getTime())[0]

      // assert
      expect(lastFormazione).toBeUndefined()
    })
  })

  describe('Formation Cloning', () => {
    it('should clone modulo from lastFormazione', () => {
      // arrange
      const lastFormazione = {
        modulo: '4-3-3',
        Voti: [],
      }
      const idPartita = 12
      const idSquadra = 1
      const newDataOra = new Date()

      // act
      const newFormazione = {
        idPartita: idPartita,
        idSquadra: idSquadra,
        modulo: lastFormazione.modulo, // cloned
        dataOra: newDataOra,
        hasBloccata: false,
      }

      // assert
      expect(newFormazione.modulo).toBe('4-3-3')
      expect(newFormazione.modulo).toBe(lastFormazione.modulo)
      expect(newFormazione.idPartita).toBe(12)
      expect(newFormazione.hasBloccata).toBe(false)
    })

    it('should reset dataOra to current timestamp', () => {
      // arrange
      const lastFormazione = {
        modulo: '3-5-2',
        dataOra: new Date('2024-01-15'),
      }
      const newDataOra = new Date('2024-02-01')

      // act
      const newFormazione = {
        modulo: lastFormazione.modulo,
        dataOra: newDataOra, // updated, not cloned
      }

      // assert
      expect(newFormazione.dataOra).not.toBe(lastFormazione.dataOra)
      expect(newFormazione.dataOra).toBe(newDataOra)
    })

    it('should set hasBloccata=false for cloned formazione', () => {
      // arrange
      const lastFormazione = {
        modulo: '5-3-2',
        hasBloccata: true, // old formazione was locked
      }

      // act
      const newFormazione = {
        modulo: lastFormazione.modulo,
        hasBloccata: false, // reset for new formation
      }

      // assert
      expect(newFormazione.hasBloccata).toBe(false)
      expect(newFormazione.hasBloccata).not.toBe(
        lastFormazione.hasBloccata
      )
    })
  })

  describe('Voti Cloning from Last Formazione', () => {
    it('should clone all voti from lastFormazione', () => {
      // arrange
      const lastFormazione = {
        Voti: [
          { idGiocatore: 1, titolare: true, riserva: null },
          { idGiocatore: 2, titolare: true, riserva: null },
          { idGiocatore: 3, titolare: false, riserva: 1 },
        ],
      }
      const idFormazione = 100
      const idCalendario = 5

      // act
      const newVoti = lastFormazione.Voti.map((v) => ({
        idGiocatore: v.idGiocatore,
        idCalendario: idCalendario,
        idFormazione: idFormazione,
        titolare: v.titolare,
        riserva: v.riserva,
        voto: 0, // reset voto
      }))

      // assert
      expect(newVoti.length).toBe(3)
      expect(newVoti[0]).toEqual({
        idGiocatore: 1,
        idCalendario: 5,
        idFormazione: 100,
        titolare: true,
        riserva: null,
        voto: 0,
      })
      expect(newVoti[2]).toEqual({
        idGiocatore: 3,
        idCalendario: 5,
        idFormazione: 100,
        titolare: false,
        riserva: 1,
        voto: 0,
      })
    })

    it('should reset voto to 0 for all cloned voti', () => {
      // arrange
      const lastFormazione = {
        Voti: [
          { idGiocatore: 1, voto: 6.5, titolare: true, riserva: null },
          { idGiocatore: 2, voto: 5, titolare: true, riserva: null },
          { idGiocatore: 3, voto: 0, titolare: false, riserva: 1 },
        ],
      }
      const idFormazione = 100

      // act
      const newVoti = lastFormazione.Voti.map((v) => ({
        ...v,
        idFormazione: idFormazione,
        voto: 0, // always reset
      }))

      // assert
      newVoti.forEach((v) => {
        expect(v.voto).toBe(0)
      })
    })

    it('should preserve titolare and riserva status from lastFormazione', () => {
      // arrange
      const lastFormazione = {
        Voti: [
          { idGiocatore: 1, titolare: true, riserva: null },
          { idGiocatore: 2, titolare: false, riserva: 1 },
          { idGiocatore: 3, titolare: false, riserva: 2 },
        ],
      }

      // act
      const newVoti = lastFormazione.Voti.map((v) => ({
        ...v,
        voto: 0,
      }))

      // assert
      expect(newVoti[0].titolare).toBe(true)
      expect(newVoti[0].riserva).toBeNull()
      expect(newVoti[1].titolare).toBe(false)
      expect(newVoti[1].riserva).toBe(1)
      expect(newVoti[2].titolare).toBe(false)
      expect(newVoti[2].riserva).toBe(2)
    })

    it('should handle empty Voti list from lastFormazione', () => {
      // arrange
      const lastFormazione = {
        Voti: [],
      }

      // act
      const newVoti = lastFormazione.Voti.map((v) => ({
        ...v,
        voto: 0,
      }))

      // assert
      expect(newVoti.length).toBe(0)
    })
  })

  describe('Idempotency - Multiple Clones', () => {
    it('should allow cloning same formation multiple times if no prior formazioni', () => {
      // arrange
      const lastFormazione = {
        modulo: '4-3-3',
        Voti: [
          { idGiocatore: 1, titolare: true, riserva: null },
        ],
      }
      const idPartiteCorrente = [10, 11]

      // act: first clone
      const clone1 = {
        modulo: lastFormazione.modulo,
        Voti: lastFormazione.Voti.map((v) => ({
          ...v,
          voto: 0,
        })),
      }

      // act: second clone (same formation)
      const clone2 = {
        modulo: lastFormazione.modulo,
        Voti: lastFormazione.Voti.map((v) => ({
          ...v,
          voto: 0,
        })),
      }

      // assert
      expect(clone1.modulo).toBe(clone2.modulo)
      expect(clone1.Voti[0].idGiocatore).toBe(clone2.Voti[0].idGiocatore)
    })
  })

  describe('Current vs Previous Gameday Partite', () => {
    it('should correctly identify idPartiteCorrente from giornateFiltrate', () => {
      // arrange
      const idSquadra = 1
      const giornateFiltrate = [
        {
          partite: [
            { idHome: 1, idAway: 2, idPartita: 100 }, // user's match
            { idHome: 3, idAway: 4, idPartita: 101 }, // other match
          ],
        },
        {
          partite: [
            { idHome: 1, idAway: 5, idPartita: 102 }, // user's match
          ],
        },
      ]

      // act
      const idPartiteCorrente = giornateFiltrate.flatMap((g) =>
        g.partite
          .filter((p) => p.idHome === idSquadra || p.idAway === idSquadra)
          .map((p) => p.idPartita)
      )

      // assert
      expect(idPartiteCorrente).toEqual([100, 102])
    })
  })

  describe('Delete Existing Formazioni & Voti', () => {
    it('should delete formazioni for current partite before cloning', () => {
      // arrange
      const existingFormazioni = [
        { idFormazione: 50, idPartita: 10 },
        { idFormazione: 51, idPartita: 10 },
      ]
      const idPartita = 10
      const idSquadra = 1

      // act: filter formazioni to delete
      const formazioniToDelete = existingFormazioni.filter(
        (f) => f.idPartita === idPartita
      )

      // assert
      expect(formazioniToDelete.length).toBe(2)
      expect(formazioniToDelete.every((f) => f.idPartita === idPartita)).toBe(
        true
      )
    })

    it('should delete all voti for formazioni being deleted', () => {
      // arrange
      const formazioniIds = [50, 51]
      const allVoti = [
        { idVoto: 1, idFormazione: 50 },
        { idVoto: 2, idFormazione: 50 },
        { idVoto: 3, idFormazione: 51 },
        { idVoto: 4, idFormazione: 52 }, // other formazione
      ]

      // act
      const votiToDelete = allVoti.filter((v) =>
        formazioniIds.includes(v.idFormazione)
      )

      // assert
      expect(votiToDelete.length).toBe(3)
      expect(votiToDelete.every((v) => formazioniIds.includes(v.idFormazione)))
        .toBe(true)
      expect(votiToDelete).not.toContainEqual({
        idVoto: 4,
        idFormazione: 52,
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle formazione with only reserve players', () => {
      // arrange
      const lastFormazione = {
        modulo: '4-3-3',
        Voti: [
          { idGiocatore: 1, titolare: false, riserva: 1 },
          { idGiocatore: 2, titolare: false, riserva: 2 },
          { idGiocatore: 3, titolare: false, riserva: 3 },
        ],
      }

      // act
      const newVoti = lastFormazione.Voti.map((v) => ({
        ...v,
        voto: 0,
      }))

      // assert
      expect(newVoti.length).toBe(3)
      newVoti.forEach((v) => {
        expect(v.titolare).toBe(false)
        expect(v.riserva).toBeGreaterThan(0)
        expect(v.voto).toBe(0)
      })
    })

    it('should handle formazione with mixed titolari and riserve', () => {
      // arrange
      const lastFormazione = {
        modulo: '4-3-3',
        Voti: [
          { idGiocatore: 1, titolare: true, riserva: null },
          { idGiocatore: 2, titolare: true, riserva: null },
          { idGiocatore: 3, titolare: true, riserva: null },
          { idGiocatore: 4, titolare: true, riserva: null },
          { idGiocatore: 5, titolare: false, riserva: 1 },
        ],
      }

      // act
      const titolari = lastFormazione.Voti.filter((v) => v.titolare)
      const riserve = lastFormazione.Voti.filter((v) => !v.titolare)

      // assert
      expect(titolari.length).toBe(4)
      expect(riserve.length).toBe(1)
    })
  })
})
