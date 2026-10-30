export interface GiocatoreStats {
  id: number
  nome: string
  squadra?: string | null
  squadraSerieA?: string | null
  maglia?: string | null
  media?: number | string | null
  golsubiti?: number | string | null
  golfatti?: number | string | null
  assist?: number | string | null
  giocate?: number | string | null
}

export type OrdinamentoGiocatori = 'media' | 'presenze' | 'gol'

export function filtraOrdinaGiocatori<T extends GiocatoreStats>(
  giocatori: readonly T[],
  ricerca: string,
  ordinamento: OrdinamentoGiocatori,
  ruolo: 'P' | 'D' | 'C' | 'A',
): T[] {
  const query = ricerca.trim().toLocaleLowerCase('it-IT')
  const campo =
    ordinamento === 'media'
      ? 'media'
      : ordinamento === 'presenze'
        ? 'giocate'
        : ruolo === 'P'
          ? 'golsubiti'
          : 'golfatti'
  const crescente = ordinamento === 'gol' && ruolo === 'P'
  return giocatori
    .filter((g) =>
      [g.nome, g.squadraSerieA ?? '', g.squadra ?? 'Svincolato'].some((value) =>
        value.toLocaleLowerCase('it-IT').includes(query),
      ),
    )
    .sort((a, b) => {
      const primo = a[campo]
      const secondo = b[campo]
      if (primo == null) return secondo == null ? 0 : 1
      if (secondo == null) return -1
      return crescente
        ? Number(primo) - Number(secondo)
        : Number(secondo) - Number(primo)
    })
}
