import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { z } from 'zod'
import type { giornataSchema } from '~/schemas/calendario'
import { formatDateFromIso } from '~/utils/dateUtils'
import CalendarioCard from './CalendarioCard'

const giornata: z.infer<typeof giornataSchema> = {
  idCalendario: 9,
  idTorneo: 1,
  giornata: 9,
  giornataSerieA: 10,
  isGiocata: true,
  isSovrapposta: false,
  isRecupero: false,
  data: '2026-11-01T18:00:00',
  girone: 1,
  Torneo: 'Campionato',
  Title: 'Campionato 9a giornata',
  SubTitle: '10a giornata serie A',
  Descrizione: 'Campionato',
  partite: [
    {
      idPartita: 42,
      idHome: 1,
      idAway: 2,
      squadraHome: 'Real Mandrake',
      squadraAway: 'Atletico Minni',
      fotoHome: '/images/fotoprofili/foto_alex.jpg',
      fotoAway: '/images/fotoprofili/foto_lucks.jpg',
      multaHome: true,
      multaAway: false,
      golHome: 0,
      golAway: 2,
      isFattoreHome: true,
    },
  ],
}

describe('CalendarioCard', () => {
  it('renders real photos, a zero score and the existing results link', () => {
    const html = renderToStaticMarkup(
      createElement(CalendarioCard, { giornata, tipo: 'risultati' }),
    )
    expect(html).toContain('src="/images/fotoprofili/foto_alex.jpg"')
    expect(html).toContain('src="/images/fotoprofili/foto_lucks.jpg"')
    expect(html).toContain('0 : 2')
    expect(html).toContain('/tabellini?idPartita=42&amp;idCalendario=9')
    expect(html.match(/data-testid="GavelIcon"/g)).toHaveLength(1)
  })

  it('shows the shared date only once and keeps future lineup links', () => {
    const html = renderToStaticMarkup(
      createElement(CalendarioCard, {
        giornata: {
          ...giornata,
          isGiocata: false,
          partite: [
            giornata.partite[0],
            { ...giornata.partite[0], idPartita: 43 },
          ],
        },
        tipo: 'prossima',
      }),
    )
    expect(html).toContain('Prossime partite')
    expect(
      html.split(formatDateFromIso(giornata.data, 'DD/MM HH:mm')),
    ).toHaveLength(2)
    expect(html).toContain('/formazioni?idPartita=42&amp;idCalendario=9')
    expect(html).toContain('/formazioni?idPartita=43&amp;idCalendario=9')
    expect(html).not.toContain('0 : 2')
  })

  it('renders the empty matchday message', () => {
    const html = renderToStaticMarkup(
      createElement(CalendarioCard, {
        giornata: { ...giornata, partite: [] },
        tipo: 'prossima',
      }),
    )
    expect(html).toContain('Nessuna partita in programma')
  })
})
