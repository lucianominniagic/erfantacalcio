import { publicProcedure } from '~/server/orpc'
import { Utenti } from '~/server/db/entities'

export const listSquadreORPCProcedure = publicProcedure
  .route({ method: 'GET', path: '/squadre/list', summary: 'Lista squadre fantasy' })
  .handler(async ({ context }) => {
    try {
      let utenti = await Utenti.find({
        select: {
          idUtente: true,
          adminLevel: true,
          lockLevel: true,
          presidente: true,
          mail: true,
          nomeSquadra: true,
          foto: true,
          importoBase: true,
          importoMulte: true,
          importoMercato: true,
          fantaMilioni: true,
        },
        order: { nomeSquadra: 'asc' },
      })

      const idSquadraUtenteConnesso = context.session?.user?.idSquadra

      if (idSquadraUtenteConnesso) {
        const userSquadraIndex = utenti.findIndex(
          (squadra) => squadra.idUtente === idSquadraUtenteConnesso,
        )
        if (userSquadraIndex !== -1) {
          const userSquadra = utenti.splice(userSquadraIndex, 1)[0]
          if (userSquadra) utenti = [userSquadra, ...utenti]
        }
      }

      return utenti.map((squadra) => ({
        id: squadra.idUtente,
        isAdmin: squadra.adminLevel,
        isLockLevel: squadra.lockLevel,
        presidente: squadra.presidente,
        email: squadra.mail,
        squadra: squadra.nomeSquadra,
        foto: squadra.foto,
        importoAnnuale: squadra.importoBase,
        importoMulte: squadra.importoMulte,
        importoMercato: squadra.importoMercato,
        fantamilioni: squadra.fantaMilioni,
      }))
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
