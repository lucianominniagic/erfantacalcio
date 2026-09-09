import { z } from 'zod'
import { adminProcedure } from '~/server/orpc'
import { Configurazione } from '~/config'
import { Voti } from '~/server/db/entities'

export const getVotoORPCProcedure = adminProcedure
  .route({ method: 'GET', path: '/voti/get', summary: 'Recupera un voto per id' })
  .input(z.object({ idVoto: z.number() }))
  .handler(async ({ input }) => {
    const result = await Voti.findOne({
      where: { idVoto: input.idVoto },
      select: {
        idVoto: true,
        voto: true,
        ammonizione: true,
        espulsione: true,
        gol: true,
        assist: true,
        autogol: true,
        altriBonus: true,
        titolare: true,
        riserva: true,
        Giocatore: { nome: true, ruolo: true },
        Calendario: {
          giornataSerieA: true,
          Torneo: { nome: true, gruppoFase: true },
        },
      },
      relations: { Giocatore: true, Calendario: { Torneo: true } },
    })

    if (!result) return null

    return {
      idVoto: result.idVoto,
      nome: result.Giocatore.nome,
      ruolo: result.Giocatore.ruolo,
      voto: result.voto ?? null,
      ammonizione: result.ammonizione ?? null,
      espulsione: result.espulsione ?? null,
      gol:
        result.Giocatore.ruolo === 'P'
          ? (result.gol ?? 0 / Configurazione.bonusGolSubito)
          : (result.gol ?? 0 / Configurazione.bonusGol),
      assist: result.assist ?? 0 / Configurazione.bonusAssist,
      autogol: result.autogol ?? 0 / Configurazione.bonusAutogol,
      altriBonus: result.altriBonus ?? null,
      torneo: result.Calendario.Torneo.nome,
      gruppoFase: result.Calendario.Torneo.gruppoFase,
    }
  })
