/**
 * Utility per la presentazione dei giocatori reali.
 *
 * Nessuna dipendenza da DB, tRPC o sessione.
 * Usate sia lato server (caricamento voti, API) sia lato client (componenti UI).
 */

import { countOccurrences } from '~/utils/stringUtils'

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
