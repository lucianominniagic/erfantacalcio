/**
 * Utility per la gestione delle formazioni: moduli, ruoli, posizioni campo.
 *
 * Nessuna dipendenza da DB, tRPC o sessione.
 * Usate sia lato server (validazione) sia lato client (UI).
 */

import { type Moduli, type Ruoli } from '~/types/common'

export function getRuoloEsteso(ruolo: string, pluralize?: boolean) {
  switch (ruolo) {
    case 'P':
      return pluralize ? 'Portieri' : 'Portiere'
    case 'D':
      return pluralize ? 'Difensori' : 'Difensore'
    case 'C':
      return pluralize ? 'Centrocampisti' : 'Centrocampista'
    case 'A':
      return pluralize ? 'Attaccanti' : 'Attaccante'
    default:
      return 'Ruolo non valido'
  }
}

export function convertiStringaInRuolo(str: string): Ruoli | null {
  const ruoloUpperCase = str.toUpperCase()
  if (ruoliList.includes(ruoloUpperCase as Ruoli)) {
    return ruoloUpperCase as Ruoli
  } else {
    return null
  }
}

export const ruoliList: Ruoli[] = ['P', 'D', 'C', 'A']
export const moduliList: Moduli[] = [
  '3-4-3',
  '4-3-3',
  '4-4-2',
  '3-5-2',
  '5-3-2',
  '5-4-1',
  '4-5-1',
]
export const moduloDefault = '3-4-3'

export const ModuloPositions = {
  '3-4-3': {
    P: [{ bottom: '1%', left: '36%', transform: 'translate(0%, 0)' }],
    D: [
      { bottom: '18%', left: '0%', transform: 'translate(0%, 0)' },
      { bottom: '15%', left: '36%', transform: 'translate(0%, 0)' },
      { bottom: '18%', left: '74%', transform: 'translate(0%, 0)' },
    ],
    C: [
      { bottom: '50%', left: '0%', transform: 'translate(0%, 0)' },
      { bottom: '40%', left: '36%', transform: 'translate(0%, 0)' },
      { bottom: '55%', left: '36%', transform: 'translate(0%, 0)' },
      { bottom: '50%', left: '74%', transform: 'translate(0%, 0)' },
    ],
    A: [
      { bottom: '75%', left: '3%', transform: 'translate(0%, 0)' },
      { bottom: '80%', left: '36%', transform: 'translate(0%, 0)' },
      { bottom: '75%', left: '70%', transform: 'translate(0%, 0)' },
    ],
  },
  '4-3-3': {
    P: [{ bottom: '1%', left: '36%', transform: 'translate(0%, 0)' }],
    D: [
      { bottom: '20%', left: '0%', transform: 'translate(0%, 0)' },
      { bottom: '15%', left: '26%', transform: 'translate(0%, 0)' },
      { bottom: '15%', left: '46%', transform: 'translate(0%, 0)' },
      { bottom: '20%', left: '74%', transform: 'translate(0%, 0)' },
    ],
    C: [
      { bottom: '50%', left: '0%', transform: 'translate(0%, 0)' },
      { bottom: '45%', left: '36%', transform: 'translate(0%, 0)' },
      { bottom: '50%', left: '74%', transform: 'translate(0%, 0)' },
    ],
    A: [
      { bottom: '75%', left: '3%', transform: 'translate(0%, 0)' },
      { bottom: '80%', left: '36%', transform: 'translate(0%, 0)' },
      { bottom: '75%', left: '70%', transform: 'translate(0%, 0)' },
    ],
  },
  '4-4-2': {
    P: [{ bottom: '1%', left: '36%', transform: 'translate(0%, 0)' }],
    D: [
      { bottom: '20%', left: '0%', transform: 'translate(0%, 0)' },
      { bottom: '15%', left: '26%', transform: 'translate(0%, 0)' },
      { bottom: '15%', left: '46%', transform: 'translate(0%, 0)' },
      { bottom: '20%', left: '74%', transform: 'translate(0%, 0)' },
    ],
    C: [
      { bottom: '50%', left: '0%', transform: 'translate(0%, 0)' },
      { bottom: '40%', left: '36%', transform: 'translate(0%, 0)' },
      { bottom: '55%', left: '36%', transform: 'translate(0%, 0)' },
      { bottom: '50%', left: '74%', transform: 'translate(0%, 0)' },
    ],
    A: [
      { bottom: '78%', left: '24%', transform: 'translate(0%, 0)' },
      { bottom: '80%', left: '48%', transform: 'translate(0%, 0)' },
    ],
  },
  '3-5-2': {
    P: [{ bottom: '1%', left: '36%', transform: 'translate(0%, 0)' }],
    D: [
      { bottom: '18%', left: '0%', transform: 'translate(0%, 0)' },
      { bottom: '15%', left: '36%', transform: 'translate(0%, 0)' },
      { bottom: '18%', left: '74%', transform: 'translate(0%, 0)' },
    ],
    C: [
      { bottom: '50%', left: '0%', transform: 'translate(0%, 0)' },
      { bottom: '40%', left: '24%', transform: 'translate(0%, 0)' },
      { bottom: '40%', left: '48%', transform: 'translate(0%, 0)' },
      { bottom: '55%', left: '36%', transform: 'translate(0%, 0)' },
      { bottom: '50%', left: '74%', transform: 'translate(0%, 0)' },
    ],
    A: [
      { bottom: '78%', left: '24%', transform: 'translate(0%, 0)' },
      { bottom: '80%', left: '48%', transform: 'translate(0%, 0)' },
    ],
  },
  '5-3-2': {
    P: [{ bottom: '1%', left: '36%', transform: 'translate(0%, 0)' }],
    D: [
      { bottom: '20%', left: '0%', transform: 'translate(0%, 0)' },
      { bottom: '15%', left: '16%', transform: 'translate(0%, 0)' },
      { bottom: '15%', left: '36%', transform: 'translate(0%, 0)' },
      { bottom: '15%', left: '56%', transform: 'translate(0%, 0)' },
      { bottom: '20%', left: '74%', transform: 'translate(0%, 0)' },
    ],
    C: [
      { bottom: '50%', left: '0%', transform: 'translate(0%, 0)' },
      { bottom: '45%', left: '36%', transform: 'translate(0%, 0)' },
      { bottom: '50%', left: '74%', transform: 'translate(0%, 0)' },
    ],
    A: [
      { bottom: '78%', left: '24%', transform: 'translate(0%, 0)' },
      { bottom: '80%', left: '48%', transform: 'translate(0%, 0)' },
    ],
  },
  '5-4-1': {
    P: [{ bottom: '1%', left: '36%', transform: 'translate(0%, 0)' }],
    D: [
      { bottom: '20%', left: '0%', transform: 'translate(0%, 0)' },
      { bottom: '15%', left: '16%', transform: 'translate(0%, 0)' },
      { bottom: '15%', left: '36%', transform: 'translate(0%, 0)' },
      { bottom: '15%', left: '56%', transform: 'translate(0%, 0)' },
      { bottom: '20%', left: '74%', transform: 'translate(0%, 0)' },
    ],
    C: [
      { bottom: '50%', left: '0%', transform: 'translate(0%, 0)' },
      { bottom: '40%', left: '36%', transform: 'translate(0%, 0)' },
      { bottom: '55%', left: '36%', transform: 'translate(0%, 0)' },
      { bottom: '50%', left: '74%', transform: 'translate(0%, 0)' },
    ],
    A: [{ bottom: '80%', left: '36%', transform: 'translate(0%, 0)' }],
  },
  '4-5-1': {
    P: [{ bottom: '1%', left: '36%', transform: 'translate(0%, 0)' }],
    D: [
      { bottom: '20%', left: '0%', transform: 'translate(0%, 0)' },
      { bottom: '15%', left: '26%', transform: 'translate(0%, 0)' },
      { bottom: '15%', left: '46%', transform: 'translate(0%, 0)' },
      { bottom: '20%', left: '74%', transform: 'translate(0%, 0)' },
    ],
    C: [
      { bottom: '50%', left: '0%', transform: 'translate(0%, 0)' },
      { bottom: '40%', left: '24%', transform: 'translate(0%, 0)' },
      { bottom: '40%', left: '48%', transform: 'translate(0%, 0)' },
      { bottom: '55%', left: '36%', transform: 'translate(0%, 0)' },
      { bottom: '50%', left: '74%', transform: 'translate(0%, 0)' },
    ],
    A: [{ bottom: '80%', left: '36%', transform: 'translate(0%, 0)' }],
  },
}
