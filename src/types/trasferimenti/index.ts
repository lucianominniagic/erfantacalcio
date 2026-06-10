export interface trasferimentoType {
  idTrasferimento: number
  idGiocatore: number
  idSquadraSerieA: number | null
  idSquadra: number | null
  costo: number
  dataAcquisto: Date
  dataCessione: Date | null
}

export interface trasferimentoListType {
  idTrasferimento: number
  nome: string
  ruolo: string
  squadra: string | null
  squadraSerieA: string | null
  maglia: string
  costo: number
  media: number
  gol: number | null
  assist: number | null
  giocate: number | null
  dataAcquisto: Date
  dataCessione: Date | null
  stagione: string
}
