import { z } from 'zod'
import { uploadVotoGiocatoreSchema } from '~/schemas/giocatore'

export interface votoType {
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

export interface votoListType {
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

/**
 * Derivato dallo schema Zod `uploadVotoGiocatoreSchema`.
 * Usare `uploadVotoGiocatoreSchema.parse(...)` per validare prima dell'uso.
 */
export type iVotoGiocatore = z.infer<typeof uploadVotoGiocatoreSchema>
