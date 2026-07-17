import { adminProcedure } from '~/server/orpc'
import { inviaPromemoriaFormazioniMancanti } from '~/server/api/formazione/services/formazioneReminderService'

export const runFormazioneReminderORPCProcedure = adminProcedure
  .route({
    method: 'POST',
    path: '/jobs/formazione-reminder',
    summary: 'Esegue il job di promemoria delle formazioni',
  })
  .handler(async () => inviaPromemoriaFormazioniMancanti())
