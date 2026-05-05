export interface GiocatoreType {
  idGiocatore: number
  nome: string
  nomeFantagazzetta: string | null
  ruolo: string
}

export interface iGiocatoreStats {
  media: number | null
  mediabonus: number | null
  golfatti: number | null
  golsubiti: number | null
  assist: number | null
  ammonizioni: number | null
  espulsioni: number | null
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
