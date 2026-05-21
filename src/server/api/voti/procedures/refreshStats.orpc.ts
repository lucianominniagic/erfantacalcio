import { z } from 'zod'
import { adminProcedure } from '~/server/orpc'
import { Configurazione } from '~/config'
import { AppDataSource } from '~/data-source'

async function refreshStats(ruolo: string) {
  try {
    console.info(
      `Function sp_RefreshStats${ruolo} for stagione ${Configurazione.stagione} executing`,
    )
    const queryRunner = AppDataSource.createQueryRunner()
    await queryRunner.connect()
    try {
      await queryRunner.query(
        `
        DO $$
        BEGIN
          PERFORM public.sp_RefreshStats_${ruolo}('${ruolo}', '${Configurazione.stagione}');
        END $$;
        `,
      )
    } catch (error) {
      console.error(
        `Error executing function sp_RefreshStats${ruolo} for stagione ${Configurazione.stagione}`,
        error,
      )
      throw error
    } finally {
      await queryRunner.release()
    }
    console.info(
      `Function sp_RefreshStats${ruolo} for stagione ${Configurazione.stagione} executed successfully`,
    )
  } catch (error) {
    console.error('Si è verificato un errore', error)
  }
}

export const refreshStatsORPCProcedure = adminProcedure
  .route({ method: 'POST', path: '/voti/refreshStats', summary: 'Aggiorna le statistiche dei giocatori per ruolo (admin)' })
  .input(
    z.object({
      ruolo: z.string(),
    }),
  )
  .handler(async ({ input }) => {
    await refreshStats(input.ruolo)
  })
