export interface SquadraType {
  id: number
  isAdmin: boolean
  isLockLevel: boolean
  presidente: string
  email: string
  squadra: string
  importoAnnuale: number
  importoMulte: number
  importoMercato: number
  fantamilioni: number
}

export interface GiocatoreType {
  idGiocatore: number
  nome: string
  nomeFantagazzetta: string | null
  ruolo: string
  ruoloEsteso: string
  costo: number
  isVenduto: boolean
  urlCampioncino: string
  urlCampioncinoSmall: string
  nomeSquadraSerieA: string | undefined
  magliaSquadraSerieA: string | undefined
}

export type GiocatoreFormazioneType = GiocatoreType & {
  titolare: boolean
  riserva: number | null
}
