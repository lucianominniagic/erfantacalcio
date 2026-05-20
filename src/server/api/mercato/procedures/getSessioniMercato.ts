import { protectedProcedure } from '~/server/api/trpc'
import { SessioneMercato } from '~/server/db/entities'

type StatoSessione = 'futura' | 'attiva' | 'chiusa'

function calcolaStato(sessione: SessioneMercato, now: Date): StatoSessione {
  if (sessione.dataApertura > now) return 'futura'
  if (sessione.dataChiusura < now) return 'chiusa'
  return 'attiva'
}

interface GetSessioniMercatoCtx {
  session: {
    user: {
      id: string
      ruolo?: string
      idSquadra: number
    }
  }
}

export async function getSessioniMercato({
  ctx: _ctx,
}: {
  ctx: GetSessioniMercatoCtx
  input: Record<string, never>
}) {
  const sessioni = await SessioneMercato.find({
    relations: { ProposteMercato: { Giocatore: true, Utente: true } },
    order: { id: 'DESC', ProposteMercato: { Giocatore: { nome: 'ASC' } } },
  })

  const now = new Date()

  return sessioni.map((s) => {
    const stato = calcolaStato(s, now)

    if (stato === 'chiusa') {
      // Sessione chiusa: includi le proposte ma non le date (no banner)
      const proposte = (s.ProposteMercato ?? [])
        .filter((p) => p.deletedAt === null)
        .map((p) => ({
          idGiocatore: p.idGiocatore,
          prezzoOfferto: p.prezzoOfferto,
          idSquadra: p.idSquadra,
          Giocatore: p.Giocatore.nome,
          Presidente: p.Utente.presidente,
        }))

      return {
        id: s.id,
        tipoValuta: s.tipoValuta,
        stato,
        proposte,
      }
    }

    // Sessione attiva o futura: includi le date (banner) ma non le proposte
    return {
      id: s.id,
      dataApertura: s.dataApertura,
      dataChiusura: s.dataChiusura,
      tipoValuta: s.tipoValuta,
      stato,
    }
  })
}

export const getSessioniMercatoProcedure = protectedProcedure.query(({ ctx }) =>
  getSessioniMercato({ ctx, input: {} }),
)
