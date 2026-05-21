import { z } from 'zod'
import { publicProcedure } from '~/server/orpc'
import { Configurazione } from '~/config'
import { getRuoloEsteso, normalizeCampioncinoUrl } from '~/utils/helper'
import { Giocatori, Trasferimenti, Voti } from '~/server/db/entities'
import { IsNull } from 'typeorm'

export const showStatisticaORPCProcedure = publicProcedure
  .route({ method: 'GET', path: '/giocatori/getStatistica', summary: 'Statistica completa di un giocatore' })
  .input(z.object({ idGiocatore: z.number() }))
  .handler(async ({ input }) => {
    const idGiocatore = +input.idGiocatore
    try {
      const giocatore = await Giocatori.findOne({
        select: { ruolo: true, nome: true, nomeFantaGazzetta: true },
        where: { idGiocatore: idGiocatore },
      })

      const trasferimento = await Trasferimenti.findOne({
        select: {
          idTrasferimento: true,
          costo: true,
          dataAcquisto: true,
          SquadraSerieA: { nome: true, maglia: true },
          Utente: { nomeSquadra: true },
        },
        relations: { SquadraSerieA: true, Utente: true },
        where: { idGiocatore: idGiocatore, dataCessione: IsNull() },
        order: { idTrasferimento: 'desc' },
      })

      if (giocatore) {
        const raw = await Voti.createQueryBuilder('voto')
          .select('AVG(voto.voto)', 'avgVoto')
          .addSelect('SUM(voto.ammonizione)', 'sumAmmonizione')
          .addSelect('SUM(voto.espulsione)', 'sumEspulsione')
          .addSelect('SUM(voto.gol)', 'sumGol')
          .addSelect('SUM(voto.assist)', 'sumAssist')
          .addSelect('COUNT(voto.id_calendario)', 'countCalendario')
          .leftJoin(
            'calendario',
            'calendario',
            'voto.id_calendario = calendario.id_calendario',
          )
          .where('voto.id_giocatore = :idGiocatore', { idGiocatore })
          .andWhere('voto.voto > 0')
          .andWhere(
            '(calendario.has_sovrapposta = false OR (calendario.has_sovrapposta = true AND calendario.id_torneo = :idTorneo))',
            { idTorneo: 1 },
          )
          .getRawOne()

        const result = {
          _avg: { voto: raw?.avgVoto != null ? Number(raw.avgVoto) : null },
          _sum: {
            ammonizione: Number(raw?.sumAmmonizione ?? 0),
            espulsione: Number(raw?.sumEspulsione ?? 0),
            gol: Number(raw?.sumGol ?? 0),
            assist: Number(raw?.sumAssist ?? 0),
          },
          _count: { idCalendario: Number(raw?.countCalendario ?? 0) },
        }

        return {
          ruolo: giocatore.ruolo,
          nome: giocatore.nome,
          nomeFantagazzetta: giocatore.nomeFantaGazzetta,
          media: result._avg.voto?.toFixed(2),
          gol:
            giocatore.ruolo === 'P'
              ? Number(result._sum.gol) * Configurazione.bonusGolSubito
              : Number(result._sum.gol) / Configurazione.bonusGol,
          assist: Number(result._sum.assist) / Configurazione.bonusAssist,
          ammonizioni: Math.abs(
            Number(result._sum.ammonizione) / Configurazione.bonusAmmonizione,
          ),
          espulsioni: Math.abs(
            Number(result._sum.espulsione) / Configurazione.bonusEspulsione,
          ),
          giocate: Number(result._count.idCalendario),
          costo: trasferimento?.costo,
          dataAcquisto: trasferimento?.dataAcquisto,
          squadraSerieA: trasferimento?.SquadraSerieA?.nome,
          magliaSerieA: trasferimento?.SquadraSerieA?.maglia,
          squadra: trasferimento?.Utente?.nomeSquadra,
          ruoloEsteso: getRuoloEsteso(giocatore.ruolo),
          isVenduto: false,
          urlCampioncino: normalizeCampioncinoUrl(
            Configurazione.urlCampioncino,
            giocatore.nome,
            giocatore.nomeFantaGazzetta,
          ),
          urlCampioncinoSmall: normalizeCampioncinoUrl(
            Configurazione.urlCampioncinoSmall,
            giocatore.nome,
            giocatore.nomeFantaGazzetta,
          ),
        }
      }
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
