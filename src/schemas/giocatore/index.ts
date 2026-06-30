import { z } from 'zod'

export const giocatoreSchema = z.object({
  idGiocatore: z.number(),
  nome: z.string().min(3),
  nomeFantagazzetta: z.string().nullable().optional(),
  ruolo: z.string(),
  id_pf: z.number().int().positive().nullable().optional(),
})

export const trasferimentoSchema = z.object({
  idTrasferimento: z.number(),
  idGiocatore: z.number(),
  idSquadraSerieA: z.number().optional().nullable(),
  idSquadra: z.number().optional().nullable(),
  costo: z.number(),
  dataAcquisto: z.date().optional(),
  dataCessione: z.date().optional().nullable(),
})

export const votoSchema = z.object({
  idVoto: z.number(),
  ruolo: z.string(),
  voto: z.number(),
  ammonizione: z.number(),
  espulsione: z.number(),
  gol: z.number(),
  assist: z.number(),
  autogol: z.number(),
  altriBonus: z.number(),
})

export const uploadVotoGiocatoreSchema = z.object({
  id_pf: z.number().nullable(),
  Nome: z.string(),
  Ammonizione: z.number(),
  Assist: z.number(),
  Autogol: z.number(),
  Espulsione: z.number(),
  GolSegnati: z.number(),
  GolSubiti: z.number(),
  RigoriErrati: z.number(),
  RigoriParati: z.number(),
  Ruolo: z.string(),
  Squadra: z.string(),
  Voto: z.number().nullable(),
})
