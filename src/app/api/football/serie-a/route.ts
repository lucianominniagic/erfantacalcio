/**
 * GET /api/football/serie-a
 *
 * Restituisce l'overview Serie A: classifica, ultimi risultati,
 * prossime partite, marcatori e metadata di stagione.
 *
 * La risposta è cachata da Next.js (revalidate 3600 s) sia a livello
 * di segmento (export revalidate) sia tramite unstable_cache nel service.
 *
 * Gestione errori:
 * - Configurazione mancante (API key) → 502 con messaggio pubblico generico.
 * - Errori non riprovabili football-data.org (4xx) → 502.
 * - Errori di rete / 5xx → 502.
 * - Errori di parsing/validazione interni → 500.
 * Il token API non è mai esposto nella risposta.
 */
import { NextResponse } from 'next/server'
import { getSerieAOverview } from '~/server/football/football.service'

// Revalidate a livello di segmento Next.js (complementare a unstable_cache)
export const revalidate = 3600
// Evita chiamate live in prerender build — la cache reale è unstable_cache 1h
export const dynamic = 'force-dynamic'

export async function GET(): Promise<NextResponse> {
  try {
    const overview = await getSerieAOverview()
    return NextResponse.json(overview)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)

    // Errori di configurazione o risposte non-OK da football-data.org
    const isUpstreamError =
      message.includes('FOOTBALL_DATA_API_KEY') ||
      message.includes('football-data.org HTTP') ||
      message.includes('non riprovabile')

    if (isUpstreamError) {
      return NextResponse.json(
        { error: 'Servizio dati calcistici temporaneamente non disponibile' },
        { status: 502 },
      )
    }

    // Errori di parsing Zod o di logica interna
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 },
    )
  }
}
