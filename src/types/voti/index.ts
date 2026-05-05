export type votoType = {
  idVoto: number
  nome: string
  voto: number | null
  ruolo: string
  ammonizione: number
  espulsione: number
  gol: number | null
  assist: number | null
  autogol: number | null
  altriBonus: number | null
}

export type votoListType = {
  id: number
  nome: string
  ruolo: string
  voto: number | null
  ammonizione: number
  espulsione: number
  gol: number | null
  assist: number | null
  autogol: number | null
  altriBonus: number | null
  torneo: string
  gruppoFase: string | null
}

export interface iVotoGiocatore {
  id_pf: number | null
  Nome: string
  Ammonizione: number
  Assist: number
  Autogol: number
  Espulsione: number
  GolSegnati: number
  GolSubiti: number
  RigoriErrati: number
  RigoriParati: number
  Ruolo: string
  Squadra: string
  Voto: number | null
}
