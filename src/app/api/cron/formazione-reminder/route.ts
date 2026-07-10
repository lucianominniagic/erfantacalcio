/**
 * Endpoint cron — GET /api/cron/formazione-reminder
 *
 * Chiamato quotidianamente da Vercel Cron (vercel.json). Protetto da secret:
 * richiede header `Authorization: Bearer <CRON_SECRET>`.
 *
 * Non passa dal layer oRPC (nessuna sessione utente): inizializza la
 * connessione DB direttamente e delega la logica al service dedicato.
 */
import { NextResponse } from 'next/server'
import { env } from '~/env.mjs'
import { initializeDBConnection } from '~/data-source'
import { inviaPromemoriaFormazioniMancanti } from '~/server/api/formazione/services/formazioneReminderService'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('[cron/formazione-reminder] Inizio invio promemoria formazioni mancanti')
    await initializeDBConnection()
    const result = await inviaPromemoriaFormazioniMancanti()
    console.log('[cron/formazione-reminder] Fine invio promemoria formazioni mancanti')
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    console.error('[cron/formazione-reminder]', error)
    return NextResponse.json({ ok: false, error: 'Errore interno' }, { status: 500 })
  }
}
