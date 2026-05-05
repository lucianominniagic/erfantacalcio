export type GiocatoreType = {
  idGiocatore: number
  nome: string
  nomeFantagazzetta: string | null
  ruolo: string
}

export interface iGiocatoreStats {
  media: Number | null
  mediabonus: Number | null
  golfatti: Number | null
  golsubiti: Number | null
  assist: Number | null
  ammonizioni: Number | null
  espulsioni: Number | null
  giocate: number | null
  ruolo: string | null
  nome: string
  nomefantagazzetta: string | null
  idgiocatore: number
  maglia: string
  squadraSerieA: string
  squadra: string | null
  idSquadra: number | null
}
