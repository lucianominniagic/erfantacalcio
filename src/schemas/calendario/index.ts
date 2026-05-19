import { z } from 'zod'

export const calendarioSchema = z.object({
  id: z.number().default(0),
  idTorneo: z.number().default(1),
  nome: z.string().default(''),
  gruppoFase: z.string().nullable().default(null),
  giornata: z.number().default(0),
  giornataSerieA: z.number().default(0),
  isGiocata: z.boolean().default(false),
  isSovrapposta: z.boolean().default(false),
  isRecupero: z.boolean().default(false),
  data: z.string().optional().default(''),
  dataFine: z.string().optional().default(''),
  girone: z.number().nullable().default(null),
  isSelected: z.boolean().default(false),
})

export const tabellinoSchema = z.object({
  idPartita: z.number(),
  escludi: z.boolean(),
  calcoloGolSegnatiHome: z.number().min(0).max(10),
  calcoloGolSegnatiAway: z.number().min(0).max(10),
  fantapuntiHome: z.number().min(0).max(120),
  fantapuntiAway: z.number().min(0).max(120),
  multaHome: z.boolean(),
  multaAway: z.boolean(),
})

export const serieASchema = z.object({
  giornata: z.number(),
  squadraHome: z.string(),
  squadraAway: z.string(),
})

export const giornataSchema = z.object({
  idCalendario: z.number(),
  idTorneo: z.number(),
  giornata: z.number(),
  giornataSerieA: z.number(),
  isGiocata: z.boolean(),
  isSovrapposta: z.boolean(),
  isRecupero: z.boolean(),
  data: z.string().optional(),
  dataFine: z.string().optional(),
  girone: z.union([z.string(), z.number(), z.null()]),
  partite: z
    .object({
      idPartita: z.number(),
      idHome: z.number().nullable(),
      squadraHome: z.string().nullable().optional(),
      fotoHome: z.string().nullable().optional(),
      magliaHome: z.string().nullable().optional(),
      multaHome: z.boolean(),
      golHome: z.number().nullable(),
      idAway: z.number().nullable(),
      squadraAway: z.string().nullable().optional(),
      fotoAway: z.string().nullable().optional(),
      magliaAway: z.string().nullable().optional(),
      multaAway: z.boolean(),
      golAway: z.number().nullable(),
      isFattoreHome: z.boolean(),
    })
    .array(),
  Torneo: z.string(),
  Descrizione: z.string(),
  Title: z.string(),
  SubTitle: z.string(),
  SerieA: z.array(serieASchema).optional(),
})

export const calendarioByGiornataSchema = z.object({
  idTorneo: z.number(),
  giornata: z.number(),
})

export type CalendarioByGiornataType = z.infer<typeof calendarioByGiornataSchema>
