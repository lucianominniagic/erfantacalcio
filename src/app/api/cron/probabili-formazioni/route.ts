/**
 * Endpoint cron — GET /api/cron/probabili-formazioni
 *
 * Chiamato ogni ora da una schedule Upstash QStash (`0 * * * *`).
 * QStash inoltra `Authorization: Bearer <CRON_SECRET>` tramite l'header
 * `Upstash-Forward-Authorization` configurato nella console.
 *
 * Si esegue solo nella finestra temporale [dataInizio - 48h, dataInizio)
 * Europe/Rome. Fuori finestra risponde con { ok: true, status: "skipped" }.
 *
 * Non passa dal layer oRPC: inizializza la connessione DB direttamente.
 */
import { NextResponse } from 'next/server'
import { env } from '~/env.mjs'
import { initializeDBConnection } from '~/data-source'
import { importaProbabiliFormazioni } from '~/server/api/formazione/services/probabiliFormazioniService'

export async function GET(request: Request) {
  console.info('[cron/probabili-formazioni] Richiesta ricevuta', {
    timestamp: new Date().toISOString(),
    qstashMessageId: request.headers.get('upstash-message-id'),
    userAgent: request.headers.get('user-agent'),
  })

  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    console.warn('[cron/probabili-formazioni] Richiesta non autorizzata')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log(
      '[cron/probabili-formazioni] Inizio import probabili formazioni',
    )
    await initializeDBConnection()
    const result = await importaProbabiliFormazioni()
    console.log(`[cron/probabili-formazioni] Fine: status=${result.status}`)
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    console.error('[cron/probabili-formazioni]', error)
    return NextResponse.json(
      { ok: false, error: 'Errore interno' },
      { status: 500 },
    )
  }
}
