import { z } from 'zod'
import { calendarioSchema } from '~/schemas/calendario'
import { type Moduli, type Ruoli } from '~/types/common'
import { countOccurrences } from '~/utils/stringUtils'

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

export function getDescrizioneGiornata(
  giornataSerieA: number,
  nomeTorneo: string,
  giornata: number,
  gruppoFase: string | null,
) {
  return `Serie A ${giornataSerieA} - ${nomeTorneo} ${giornata === 0 ? '' : giornata} ${gruppoFase ? (gruppoFase.length === 1 ? `girone ${gruppoFase}` : gruppoFase) : ''}`
}

export function getNomeTorneo(nome: string, gruppo: string | null) {
  return `${nome} ${gruppo ? `girone ${gruppo}` : ''}`.trim()
}

export function normalizeCampioncinoUrl(
  link: string,
  nome: string,
  nomeFantagazzetta?: string | null,
): string {
  // se `nomeFantagazzetta` è un URL assoluto, lo ritorniamo direttamente
  // se `link` indica la versione small, sostituiamo '/card/' con '/small/' nell'URL
  if (nomeFantagazzetta) {
    try {
      // `new URL()` lancia se non è un URL valido/assoluto
      new URL(nomeFantagazzetta)
      if (link && link.toLowerCase().includes('small')) {
        return nomeFantagazzetta.replace('/card/', '/small/')
      }
      return nomeFantagazzetta
    } catch {
      // non è un URL: prosegui con la logica normale
    }
  }

  let url = ''

  if (!nomeFantagazzetta) {
    if (countOccurrences(nome, ' ') === 0) {
      // esempio: TOTTI --> TOTTI
      url = link.replace('{giocatore}', nome.replace('.', ''))
    } else if (
      countOccurrences(nome, ' ') === 1 &&
      countOccurrences(nome, '.') > 0
    ) {
      // esempio: TOTTI F. --> TOTTI
      url = link.replace(
        '{giocatore}',
        nome.substring(0, nome.lastIndexOf(' ')),
      )
    } else if (
      countOccurrences(nome, ' ') > 1 &&
      countOccurrences(nome, '.') > 0
    ) {
      // esempio: DE VRIJ J. --> DE-VRIJ
      url = link.replace(
        '{giocatore}',
        nome.substring(0, nome.lastIndexOf(' ')).replace(' ', '-'),
      )
    } else if (
      countOccurrences(nome, ' ') === 1 &&
      countOccurrences(nome, '.') === 0
    ) {
      // esempio: ALEX SANDRO --> ALEX-SANDRO
      url = link.replace('{giocatore}', nome.replace(' ', '-'))
    }
  } else {
    url = link.replace('{giocatore}', nomeFantagazzetta)
  }

  return url
}

export function normalizeNomeGiocatore(nome: string): string {
  return nome
    .toUpperCase()
    .trim()
    .replace('À', "A'")
    .replace('Á', "A'")
    .replace('È', "E'")
    .replace('É', "E'")
    .replace('Ì', "I'")
    .replace('Í', "I'")
    .replace('Ò', "O'")
    .replace('Ó', "O'")
    .replace('Ú', "O'")
    .replace('Ù', "O'")
}

export function getIdNextGiornata(
  calendarioList: z.infer<typeof calendarioSchema>[],
) {
  return calendarioList?.find((item) => item.isSelected)?.id ?? undefined
}

export const moduliList: Moduli[] = [
  '3-4-3',
  '4-3-3',
  '4-4-2',
  '3-5-2',
  '5-3-2',
  '5-4-1',
  '4-5-1',
]
export const ruoliList: Ruoli[] = ['P', 'D', 'C', 'A']
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

export function convertiStringaInRuolo(str: string): Ruoli | null {
  const ruoloUpperCase = str.toUpperCase()

  if (ruoliList.includes(ruoloUpperCase as Ruoli)) {
    return ruoloUpperCase as Ruoli
  } else {
    return null
  }
}

export function getShortName(s: string, maxLength?: number) {
  if (!s || s.trim().length === 0) {
    return s
  }

  let longestWord = ''
  const words = s.split(' ')

  words.forEach((word) => {
    if (word.length > 2 && !word.includes('.')) {
      if (word.length > longestWord.length) {
        longestWord = word
      }
    }
  })

  return maxLength
    ? longestWord.length > maxLength
      ? longestWord.substring(0, maxLength)
      : longestWord
    : longestWord
}
